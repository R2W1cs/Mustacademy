FROM python:3.11-slim

# Install system dependencies required for phonemizer and Kokoro
RUN apt-get update && apt-get install -y \
    espeak-ng \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
# Kokoro needs specific pytorch, but we can rely on standard cpu pip for spaces
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server code
COPY server.py .

# Pre-download the model and voices (this happens on build so container boots instantly)
RUN python -c "from kokoro import KPipeline; KPipeline(lang_code='a').load_voice('am_michael'); KPipeline(lang_code='a').load_voice('am_fenrir'); KPipeline(lang_code='a').load_voice('am_adam')"

EXPOSE 5001

# Run the Flask app with Gunicorn for production
CMD ["gunicorn", "-b", "0.0.0.0:5001", "-w", "1", "--timeout", "120", "server:app"]
