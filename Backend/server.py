from io import BytesIO
import json
import os
from fastapi.responses import JSONResponse
from fastapi import BackgroundTasks, FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
from prisma import Prisma
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import numpy as np


from pyannote.audio import Pipeline
import torch
from huggingface_hub import login
from speechbox import ASRDiarizationPipeline


import sys
import logging
from datetime import datetime, date

login(os.environ["HF_TOKEN"])


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


"""
Create our diarization pipeline
"""
diarization_pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1", use_auth_token=True
)
if torch.cuda.is_available():
    diarization_pipeline = diarization_pipeline.to(torch.device("cuda:0"))

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
    device=device,
)


"""
Create our final pipeline with both ASR and Diarization
"""
pipeline = ASRDiarizationPipeline(
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


def processAudio(data, sampleRate):
    """
    Start transcribing
    """
    logger.info("Processing audio...")
    npData = np.array(data)
    outputs = pipeline(npData)
    transcription = format_as_transcription(outputs)
    logger.info("transcription", transcription)


@app.on_event("startup")
async def startup():
    await prisma.connect()


@app.post(f"{baseURL}/uploadAudio")
async def upload(file: UploadFile = None):
    format = file.content_type

    if format not in [
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus",
        "audio/webm",
        "audio/x-m4a",
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
    data = sound.get_array_of_samples()
    sampleRate = sound.frame_rate

    """
    Save this in our database as processing
    """
    newData = await prisma.meetingsummary.create(
        data={"processing": True, "userEmail": "sid@lytix.co"}
    )
    tasks = BackgroundTasks()
    tasks.add_task(processAudio, data, sampleRate)

    """
    Return the user the Id of this meeting
    """
    response = {"id": newData.id}
    responseFormatted = json.dumps(response, default=json_serial)
    finalResponse = JSONResponse(status_code=200, content=responseFormatted)
    finalResponse.background = tasks
    return finalResponse


@app.get(baseURL + "/getAllNotes")
async def getAllNotes():
    allNotesRaw = await prisma.meetingsummary.find_many(
        where={"userEmail": "sid@lytix.co"}
    )
    allNotes = []
    for note in allNotesRaw:
        allNotes.append(
            {
                "id": note.id,
                "name": note.title if note.title else "Processing...",
                "date": note.createdAt,
            }
        )
    response = {"allNotes": allNotes}
    responseFormatted = json.dumps(response, default=json_serial)
    return JSONResponse(status_code=200, content=responseFormatted)


@app.get(baseURL + "/getSummary/{slug}")
async def getAudio(slug: str):
    # Try to pull this from the database
    existingData = await prisma.meetingsummary.find_first(where={"id": slug})

    if existingData is None or existingData.processing is True:
        response = {"processing": True}
        responseFormatted = json.dumps(response, default=json_serial)
        return JSONResponse(status_code=200, content=responseFormatted)

    response = {
        "name": "Some Recording",
        "date": datetime.now(),
        "duration": 5000,
        "summary": """# Meeting Summary

## Action Items
1. **Follow-Up Meeting**: SPEAKER_00 and SPEAKER_02 agreed to meet in Boston in the future to discuss further developments and ideas.
2. **Idea Sharing**: Both parties agreed to share new ideas with each other as they arise.

## Introduction and Background
- **SPEAKER_00** and **SPEAKER_01** exchanged greetings and apologies for any delays.
- **SPEAKER_00** asked if **SPEAKER_01** was a member of a program, to which **SPEAKER_01** responded that they were usually a civil clerk at Williamsburg.
- **SPEAKER_00** and **SPEAKER_02** discussed their experiences in Boston, with **SPEAKER_02** mentioning they were born and raised there and went to school in Boston.

## Discussion on Software and Program
- **SPEAKER_00** expressed appreciation for the kindness of others and mentioned their support for the school and helping students learn about software.
- **SPEAKER_02** agreed and appreciated the responsiveness, indicating a shared interest in educational opportunities.

## Investment and Fund Management
- **SPEAKER_00** discussed the challenges and strategies involved in managing funds and investments, mentioning the importance of being hands-on in building productivity functions.
- **SPEAKER_02** elaborated on the complexities of fund management, including dealing with various strategic events and the importance of honesty in their operations.

## Company and Product Development
- **SPEAKER_02** provided a detailed history of their company's development, starting with a consumer-facing donation app and transitioning to analytics and AI observability.
- They discussed the challenges and learnings from their initial project and the shift towards a technical problem-solving approach.
- **SPEAKER_02** mentioned their focus on product-based analytics for chat-based apps and the importance of understanding user interactions beyond traditional click-through rates.

## Model Management and Technical Challenges
- **SPEAKER_02** talked about the difficulties in managing multiple models and the need for a simple framework to consolidate them.
- They discussed the potential of open-sourcing internal tools and the importance of cost management and model analytics.
- **SPEAKER_00** and **SPEAKER_02** explored the idea of a serverless GPU architecture to manage model hosting more efficiently.

## Customer Research and Validation
- **SPEAKER_02** emphasized the importance of customer research and validation to ensure they are working on the right problems.
- They shared insights from their interactions with customers and the need to balance abstraction and control in their tools.

## Future Plans and Collaboration
- **SPEAKER_00** and **SPEAKER_02** discussed their plans to potentially return for demo day in the YC Summer Batch and start fundraising.
- They agreed to keep each other updated on their progress and share learnings and experiences.

## Conclusion
- **SPEAKER_00** and **SPEAKER_02** expressed mutual appreciation for the conversation and looked forward to future interactions and collaborations.

This summary captures the key points and discussions from the meeting, highlighting the main topics and action items for follow-up.""",
    }

    responseFormatted = json.dumps(response, default=json_serial)
    return JSONResponse(status_code=200, content=responseFormatted)


@app.get("/health")
async def health():
    return {"success": True}


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))
