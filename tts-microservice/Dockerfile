FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for audio processing (soundfile requires libsndfile)
RUN apt-get update && apt-get install -y libsndfile1 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download Kokoro models (if needed) to bake into the image
RUN pip install kokoro

COPY . .

# Run FastAPI server
# Render and HuggingFace Spaces use PORT environment variable, fallback to 8000
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:=8000}"]
