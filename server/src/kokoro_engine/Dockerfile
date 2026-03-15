FROM python:3.11-slim

# Install system dependencies required for phonemizer and Kokoro
RUN apt-get update && apt-get install -y \
    espeak-ng \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces requirement: run as non-root user
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Install Python dependencies
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server code
COPY --chown=user server.py .

# Pre-download the model and voices (this happens on build so container boots instantly)
RUN python -c "from kokoro import KPipeline; KPipeline(lang_code='a').load_voice('am_michael'); KPipeline(lang_code='a').load_voice('am_fenrir'); KPipeline(lang_code='a').load_voice('am_adam')"

# Hugging Face Spaces requires port 7860
EXPOSE 7860

# Run the Flask app with Gunicorn for production
CMD ["gunicorn", "-b", "0.0.0.0:7860", "-w", "1", "--timeout", "120", "server:app"]
