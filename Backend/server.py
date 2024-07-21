import uuid
from torch.multiprocessing import Pool, Process
from torch.multiprocessing import set_start_method

try:
    set_start_method("spawn")
except Exception as e:
    print("Error setting start method", e)

import asyncio
from io import BytesIO
import json
import os
from fastapi.responses import JSONResponse
from fastapi import BackgroundTasks, FastAPI, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
from prisma import Prisma
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import numpy as np
from optimodel import queryModel
from optimodel_server_types import ModelMessage, ModelTypes
from multiprocessing import Process
import uvloop
from transformers import AutoModel, AutoTokenizer
from sentence_transformers import SentenceTransformer
import nltk

from pyannote.audio import Pipeline
import torch
from huggingface_hub import login
from speechbox import ASRDiarizationPipeline
import uvicorn
import firebase_admin
from firebase_admin import credentials, auth
from pinecone import Pinecone, ServerlessSpec


import sys
import logging
from datetime import datetime, date, timedelta

login(os.environ["HF_TOKEN"])
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")

pcClient = Pinecone(api_key=PINECONE_API_KEY)
# We have 2 index, one for transcripts one for meeting summaries
if "nh-summaries" not in pcClient.list_indexes().names():
    pcClient.create_index(
        name="nh-summaries",
        dimension=2,
        metric="cosine",
        spec=ServerlessSpec(
            cloud='aws', 
            region='us-east-1'
        ) 
    ) 
if "nh-transcripts" not in pcClient.list_indexes().names():
    pcClient.create_index(
        name="nh-transcripts",
        dimension=2,
        metric="cosine",
        spec=ServerlessSpec(
            cloud='aws', 
            region='us-east-1'
        ) 
    ) 
transcriptIndex = pcClient.Index("nh-transcripts")
summaryIndex = pcClient.Index("nh-summaries")

"""
Create our embedding objects
"""
model = SentenceTransformer('Alibaba-NLP/gte-large-en-v1.5', trust_remote_code=True)


certificateConfigJSON = json.loads(os.environ["FIREBASE_CONFIG"])
# @see https://github.com/firebase/firebase-admin-python/issues/188
certificateConfigJSON["private_key"] = certificateConfigJSON["private_key"].replace(
    "\\n", "\n"
)
initFirebase = firebase_admin.initialize_app(
    credential=credentials.Certificate(certificateConfigJSON),
    options={
        "projectId": os.environ["FIREBASE_PROJECT_ID"],
    },
)




logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger(__name__)


prisma = Prisma()

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

baseURL = "/api/v1"

class _BackgroundTaskQueue:
    """
    This will spawn tasks on different threads in the background and limit the number of concurrent tasks
    """

    def __init__(self):
        self.currentActiveTasks = 0

    async def startTask(self, functionToStart, args):
        # First check if we have more then 1 tasks holding the mutex
        while self.currentActiveTasks > 1:
            logger.info("Too many tasks, waiting 10 seconds...")
            await asyncio.sleep(10)

        # Increment the current active tasks
        self.currentActiveTasks += 1

        # Start the function in a new process
        logger.info(f"Starting sub-process...")
        backgroundProcess = Process(
            target=self._run_async_function, args=(functionToStart, args), daemon=True
        )
        backgroundProcess.start()
        while backgroundProcess.is_alive():
            logger.info(f"Waiting for sub-process to finish...")
            await asyncio.sleep(10)
        logger.info(f"Sub-process finished 🚀")

        # Decrement the current active tasks
        self.currentActiveTasks -= 1

    @staticmethod
    def _run_async_function(functionToStart, args):
        # nest_asyncio.apply()
        uvloop.run(functionToStart(*args))


BackgroundTaskQueue = _BackgroundTaskQueue()


async def processAudio(data, sampleRate, id, userEmail):
    """
    Start transcribing
    """
    logger.info("Processing audio...")

    try:
        """ 
        First connect to prisma
        """
        logger.info("Connecting to prisma...")
        await prisma.connect()

        """
        Create our diarization pipeline
        """
        diarization_pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1", use_auth_token=True
        )
        if torch.cuda.is_available():
            diarization_pipeline = diarization_pipeline.to(torch.device('cuda:0'))

        """
        Create our ASR pipeline (e.g. transcribing)
        """
        model_id = "openai/whisper-large-v2"

        """
        See if we can use cuda
        """
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

        model = AutoModelForSpeechSeq2Seq.from_pretrained(
            model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
        )
        model.generation_config.language = "en" 
        model.to(device)

        processor = AutoProcessor.from_pretrained(model_id)

        asr_pipeline = pipeline(
            "automatic-speech-recognition",
            model=model,
            tokenizer=processor.tokenizer,
            feature_extractor=processor.feature_extractor,
            max_new_tokens=128,
            chunk_length_s=30,
            batch_size=16,
            return_timestamps=True,
            torch_dtype=torch_dtype,
            device=device
        )

        """
        Create our final pipeline with both ASR and Diarization
        """
        finalPipeline = ASRDiarizationPipeline(
            asr_pipeline=asr_pipeline, diarization_pipeline=diarization_pipeline
        )


        def tuple_to_string(start_end_tuple, ndigits=1):
            return str((round(start_end_tuple[0], ndigits), round(start_end_tuple[1], ndigits)))


        def format_as_transcription(raw_segments):
            return "\n\n".join(
                [
                    chunk["speaker"] + " " + tuple_to_string(chunk["timestamp"]) + chunk["text"]
                    for chunk in raw_segments
                ]
            )


        logger.info("Starting transcription")
        outputs = finalPipeline(data)
        logger.info(f"OUTPUTS: {outputs}")
        transcription = format_as_transcription(outputs)
        logger.info("Finished getting transcription, generating summary and title")
        logger.info(f"transcription: {transcription}")
        formattedOutput = format_as_transcription(outputs)
        prompt = f"""Given the following conversation transcript: `{formattedOutput}`.
Please summarize the conversation. Follow all the instructions under [INSTRUCTIONS]

[INSTRUCTIONS]
Ignore gibberish or language that is not coherent
Use and reference direct quotes from the speakers in the summarization. When using quotes, also summarize the quote along with referencing it. 
Group related topics under a single header whenever possible
Be detailed in the response, and specifically reference who was talking
Attempt to find action items such as follow ups or next steps. If they exist make sure to note them at the top of the summary. If there are none also note there are none."""

        meetingSummary = await queryModel(
            model=ModelTypes.gpt_4o,
            messages=[
                ModelMessage(
                    role="system",
                    content="You are a helpful assistant whose job is summarize meetings given a transcript. Always use markdown syntax in your response.",
                ),
                ModelMessage(role="user", content=prompt),
            ],
            speedPriority="high",
            # validator=validator,
            # fallbackModels=[ModelTypes.llama_3_70b_instruct],
            maxGenLen=128000,
        )

        # Generate a title based on the summary
        promptTitle = f"""Given the following summary of a meeting: {meetingSummary}.
Generate a title that is 50 characters or less.
Only respond with the title and nothing else"""

        meetingTitle: str = await queryModel(
            model=ModelTypes.gpt_4o,
            messages=[
                ModelMessage(
                    role="system",
                    content="You are a helpful assistant whos job is come up with titles. Only respond with a title and nothing else",
                ),
                ModelMessage(role="user", content=promptTitle),
            ],
            speedPriority="high",
            # validator=validator,
            # fallbackModels=[ModelTypes.llama_3_70b_instruct],
            maxGenLen=128000,
        )

        # Remove leading or trailing '"' from the title
        meetingTitle = meetingTitle.strip().strip('"')

        # Update our database now, make sure it hasn't been deleted first
        existingData = await prisma.meetingsummary.find_first(where={"id": id})
        if existingData is None:
            logger.info(f"Meeting summary with id {id} not found, skipping update")
            return
        await prisma.meetingsummary.update(
            data={
                "updatedAt": datetime.now(),
                "title": meetingTitle,
                "summary": meetingSummary,
                "processing": False,
            },
            where={"id": id},
        )


        # Also save the transcript to the database
        logger.info("Saving transcript to database")
        await prisma.meetingtranscript.create(
            data={
                "transcript": outputs,
                "meetingSummaryId": id
            }
        )

        logger.info("Saving data to pinecone")
        """
        Create our embedding objects
        """
        model = SentenceTransformer('Alibaba-NLP/gte-large-en-v1.5', trust_remote_code=True)
   

        """
        Now we want to embed and save things to pinecone
        """
        # Starting with the transcript,loop though each chunk, split up based on sentences, and save
        finalTranscriptVectors = []
        for index, chunk in enumerate(outputs):
            speaker = chunk['speaker']
            text = chunk['text']
            sentences = nltk.sent_tokenize(text)
            sentenceEmbeddings = model.encode(sentences)
            for index, sentence in enumerate(sentences):
                finalTranscriptVectors.append({
                    "id": uuid.uuid4(), 
                    "meetingId": id,
                    "values": sentenceEmbeddings[index], 
                    "metadata": {"speaker": speaker, "text": text}
                })
                
        # Save this to pinecone now
        transcriptIndex.upsert(
            vectors=finalTranscriptVectors,
            namespace=f"nh-{userEmail}"
        )

        # Now lets split up the summary into chunks
        summaryChunks = nltk.sent_tokenize(meetingSummary)
        finalSummaryVectors = []
        for chunk in summaryChunks:
            embedding = model.encode(chunk)
            finalSummaryVectors.append({
                "id": uuid.uuid4(), 
                "values": embedding, 
                "metadata": {"meetingId": id, "text": chunk}
            })
        
        # Save this to pinecone now
        summaryIndex.upsert(
            vectors=finalSummaryVectors,
            namespace=f"nh-{userEmail}"
        )
        logger.info("Done saving data to pinecone!")

    except Exception as e:
        logger.error("Error processing audio", e)


async def startProcessAudio(data, sampleRate, id, userEmail):
    """
    Start processing audio in a new process, awaits till process finish
    so fast api knows about it (and doesn't stop the server mid-process)
    """
    logger.info(
        f"Starting process audio for id: {id}. Sending to background task queue"
    )
    await BackgroundTaskQueue.startTask(processAudio, (data, sampleRate, id, userEmail))


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    # Dont block the call to get the session cookie in the first place
    if request.url.path == "/api/v1/auth/google" or request.url.path == "/health":
        return await call_next(request)

    sessionCookie = request.cookies.get("session")
    if not sessionCookie:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    try:
        validatedResults = auth.verify_session_cookie(sessionCookie)

        # Get the users email
        userEmail = validatedResults["email"]

        # Set the email on the http context
        request.state.userEmail = userEmail
    except Exception as e:
        logger.error("Error verifying session cookie", e)
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})

    # Validate session cookie
    response = await call_next(request)
    return response


@app.on_event("startup")
async def startup():
    await prisma.connect()


@app.post(f"{baseURL}/uploadAudio")
async def upload(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = None,
):
    format = file.content_type
    userEmail = request.state.userEmail

    if format not in [
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus",
        "audio/webm",
        "audio/x-m4a",
        "audio/mp4",
    ]:
        logger.error("Invalid file format", format)
        return JSONResponse(status_code=400, content={"message": "Invalid file format"})

    """
    Parse the file
    """
    opus_data = BytesIO(file.file.read())

    codec = (
        "opus"
        if format in ["audio/webm;codecs=opus", "audio/ogg;codecs=opus"]
        else "m4a"
    )
    if codec == "opus":
        sound = AudioSegment.from_file(opus_data, codec=codec)
    else:
        sound = AudioSegment.from_file(opus_data)

    # Convert to 16kHz
    sound = sound.set_frame_rate(16000)

    rawData = sound.get_array_of_samples()
    data = np.array(rawData)
    sampleRate = sound.frame_rate
    duration = len(data) / sampleRate

 

    """
    Save this in our database as processing
    """
    newData = await prisma.meetingsummary.create(
        data={"processing": True, "userEmail": userEmail, "duration": duration}
    )

    """
    Save this raw audio file to the database
    """
    await prisma.mediasummaryraw.create(
        data={
            "audioBytes": rawData,
            "sampleRate": sampleRate,
            "meetingSummaryId": newData.id
        }
    )

    background_tasks.add_task(startProcessAudio, data=data, sampleRate=sampleRate, id=newData.id, userEmail=userEmail)

    """
    Return the user the Id of this meeting
    """
    response = {"id": newData.id}
    responseFormatted = json.dumps(response, default=json_serial)
    finalResponse = JSONResponse(status_code=200, content=responseFormatted)
    return finalResponse

@app.get(baseURL + "/getAllNotes")
async def getAllNotes(request: Request):
    allNotesRaw = await prisma.meetingsummary.find_many(
        where={"userEmail": request.state.userEmail},
        order={"createdAt": "desc"}
    )
    allNotes = []
    for note in allNotesRaw:
        allNotes.append(
            {
                "id": note.id,
                "name": note.title if note.title else "Processing",
                "date": note.createdAt,
                "processing": note.processing
            }
        )
    response = {"allNotes": allNotes}
    responseFormatted = json.dumps(response, default=json_serial)
    return JSONResponse(status_code=200, content=responseFormatted)


@app.get(baseURL + "/getSummary/{slug}")
async def getAudio(slug: str):
    # Try to pull this from the database
    existingData = await prisma.meetingsummary.find_first(where={"id": slug})

    response = {
        "name": existingData.title,
        "date": existingData.createdAt,
        "duration": existingData.duration,
        "summary": existingData.summary,
    }

    if existingData is None or existingData.processing is True:
        response["processing"] = True
        responseFormatted = json.dumps(response, default=json_serial)
        return JSONResponse(status_code=200, content=responseFormatted)

    responseFormatted = json.dumps(response, default=json_serial)
    return JSONResponse(status_code=200, content=responseFormatted)

@app.post(baseURL + "/updateSummary")
async def updateSummary(request: Request):
    jsonData = await request.json()
    await prisma.meetingsummary.update(
        data={"title": jsonData["title"]},
        where={"id": jsonData["id"]}
    )
    return JSONResponse(status_code=200, content={"success": True})

@app.get(baseURL + "/search/{query}")
async def search(query: str):
    queryEmbeddings = model.encode([query])
    print(queryEmbeddings)
    queryEmbedding = queryEmbeddings[0]
    """
    Search both pinecone indexs
    """
    matchingTranscripts = transcriptIndex.query(
        top_k=5,
        vector=queryEmbedding,
        include_metadata=True
    )
    matchingSummaries = summaryIndex.query(
        top_k=5,
        vector=queryEmbedding,
        include_metadata=True
    )
    summariesToReturn = [{"meetingId": x['metadata']["meetingId"], "text": x['metadata']["text"]} for x in matchingSummaries.matches]
    transcriptsToReturn = [{"meetingId": x['metadata']["meetingId"], "text": x['metadata']["text"]} for x in matchingTranscripts.matches]

    response = {
        "summaries": summariesToReturn,
        "transcripts": transcriptsToReturn
    }
    responseFormatted = json.dumps(response, default=json_serial)
    return JSONResponse(status_code=200, content=responseFormatted)


@app.post(baseURL + "/deleteSummary/{slug}")
async def deleteSummary(slug: str):
    await prisma.meetingsummary.delete(where={"id": slug})
    return JSONResponse(status_code=200, content={"success": True})


@app.post(baseURL + "/auth/google")
async def session_login(request: Request):
    # Get the ID token sent by the client
    id_token = (await request.json())["idToken"]
    # Set session expiration to 5 days.
    expires_in = timedelta(days=5)
    timeExpires = datetime.now() + expires_in
    try:
        # Create the session cookie. This will also verify the ID token in the process.
        # The session cookie will have the same claims as the ID token.
        session_cookie = auth.create_session_cookie(
            id_token, expires_in=60 * 60 * 24 * 5
        )
        response = JSONResponse(status_code=200, content={"status": "success"})
        # Set cookie policy for session cookie.
        response.set_cookie(
            "session",
            session_cookie,
            httponly=True,
            secure=True,
            max_age=60 * 60 * 24 * 5,
        )
        return response
    except Exception as e:
        logger.error("Error creating session cookie", e)
        return JSONResponse(
            status_code=500, content={"message": "Failed to create a session cookie"}
        )

@app.get(baseURL + "/getMeetingData")
async def getUserMeetingHabits(request: Request):
    """
    Get the following data
    -> Number of meetings
    """

    meetingsOver7Days = await prisma.query_raw(f"""SELECT 
    DATE_BIN('120 minutes', "createdAt" , TIMESTAMP '2001-01-01') AS interval_start,
    COUNT(*)
  FROM public."MeetingSummary"
  where "userEmail"='{
    request.state.userEmail
  }' AND "createdAt" BETWEEN '{(datetime.utcnow() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')}' AND '{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}'
  group by
    interval_start
  order by
    interval_start
            """)
    
    meetingsOver7DaysFormatted = []
    for meeting in meetingsOver7Days:
        meetingsOver7DaysFormatted.append({
            "date": meeting["interval_start"],
            "Number of meetings": meeting["count"]
        })
    
    response = {
        "meetingsOver7Days": meetingsOver7DaysFormatted
    }
    responseFormatted = json.dumps(response, default=json_serial)
    return JSONResponse(status_code=200, content=responseFormatted)

@app.get(baseURL + "/getUserIsLoggedIn")
async def getUserIsLoggedIn(request: Request):
    return JSONResponse(status_code=200, content={"success": True})


@app.get("/health")
async def health():
    return {"success": True}


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))


if __name__ == "__main__":
    uvicorn.run(app, loop="asyncio", port=4040, host="0.0.0.0", log_level="debug")
