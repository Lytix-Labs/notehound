FROM  pytorch/pytorch:2.2.1-cuda12.1-cudnn8-devel

# Copy over our req.txt file
COPY req.txt req.txt

RUN pip3 install  -r req.txt

RUN apt update && apt install -y ffmpeg git
RUN pip3 install git+https://github.com/sidpremkumar/speechbox
RUN pip3 install transformers huggingface-hub pyannote.audio torch optimodel-py accelerate

COPY . .

# Sleep infinity as an entrypoint
CMD ["sleep", "infinity"]