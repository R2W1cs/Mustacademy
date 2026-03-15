import os
import io
import traceback
from flask import Flask, request, send_file
import soundfile as sf
import torch

try:
    from kokoro import KPipeline
except ImportError:
    print("Could not import kokoro. Make sure it's installed via pip install kokoro")
    import sys
    sys.exit(1)

app = Flask(__name__)

pipeline = None
marcus_voice = None

def load_engine():
    global pipeline, marcus_voice
    try:
        print("Loading Kokoro TTS model (American English)...")
        pipeline = KPipeline(lang_code='a') 

        print("Loading voices for Marcus Sterling blending...")
        # A mix of Michael (warm/rich) and Fenrir (deep/authoritative)
        voice1 = pipeline.load_voice('am_michael')
        voice2 = pipeline.load_voice('am_fenrir')
        voice3 = pipeline.load_voice('am_adam')
        
        # Blending the tensor embeddings
        # 40% Michael, 30% Fenrir, 30% Adam -> Creating a unique Marcus persona
        marcus_voice = torch.add(torch.add(voice1 * 0.4, voice2 * 0.3), voice3 * 0.3)
        print("Loaded and blended 'Marcus Sterling' voice successfully.")
    except Exception as e:
        print("Error during engine initialization:")
        traceback.print_exc()

@app.route('/health', methods=['GET'])
def health():
    return {"status": "ok", "engine": "kokoro-82m", "persona": "marcus_sterling"}

@app.route('/tts', methods=['POST'])
def tts():
    data = request.json
    text = data.get('text', '')
    if not text:
        return {"error": "Text is required"}, 400
        
    try:
        print(f"Synthesizing: '{text}'")
        generator = pipeline(text, voice=marcus_voice, speed=1.0)
        
        all_audio = []
        for i, (gs, ps, audio) in enumerate(generator):
            all_audio.append(audio)
            
        if not all_audio:
            return {"error": "Failed to generate audio"}, 500
            
        final_audio = torch.cat(all_audio) if len(all_audio) > 1 else all_audio[0]
        
        # Save to memory buffer
        buffer = io.BytesIO()
        sf.write(buffer, final_audio.numpy(), 24000, format='WAV')
        buffer.seek(0)
        
        return send_file(buffer, mimetype='audio/wav')
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}, 500

if __name__ == '__main__':
    load_engine()
    print("Kokoro Neural Engine active on port 5001")
    app.run(host='127.0.0.1', port=5001)
