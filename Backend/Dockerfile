FROM  pytorch/pytorch:2.2.1-cuda12.1-cudnn8-devel

# Copy over our req.txt file
COPY req.txt req.txt

RUN pip3 install  -r req.txt

RUN apt update && apt install -y ffmpeg git
RUN pip3 install transformers huggingface-hub pyannote.audio torch optimodel-py accelerate firebase_admin pinecone nltk sentence_transformers
RUN pip3 install git+https://github.com/sidpremkumar/speechbox
# @see: https://huggingface.co/Alibaba-NLP/new-impl#recommendation-enable-unpadding-and-acceleration-with-xformers
# RUN pip3 install -U xformers --index-url https://download.pytorch.org/whl/cu121

# First copy over Prisma file
COPY schema.prisma schema.prisma

# Generate prisma
ARG DATABASE_URL
ARG PRISMA_CLIENT="prisma-client-py"
RUN prisma generate

# Then copy over everything else
COPY . .

# Sleep infinity as an entrypoint
CMD ["sleep", "infinity"]