FROM python:3.10-slim

WORKDIR /app

# Install system audio dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the Whisper small model during build time for instant startup!
RUN python -c "import whisper; whisper.load_model('small')"

# Copy application files
COPY whisper_voice_recognizer.py .
COPY app.py .

# Standard Hugging Face Spaces / Cloud port
ENV PORT=7860
EXPOSE 7860

CMD ["python", "app.py"]
