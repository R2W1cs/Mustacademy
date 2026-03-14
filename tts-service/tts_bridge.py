import os
import io
import wave
import json
import logging
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import Response

logging.basicConfig(level=logging.INFO, format='[TTS] %(message)s')
logger = logging.getLogger(__name__)

import threading

chatterbox_available = False
tts = None
chatterbox_loading = False

def load_chatterbox():
    global chatterbox_available, tts, chatterbox_loading
    chatterbox_loading = True
    try:
        from chatterbox import ChatterboxTTS
        import torch
        chatterbox_device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Chatterbox TTS async loading models on {chatterbox_device} (this may take a while)...")
        tts = ChatterboxTTS.from_pretrained(chatterbox_device)
        chatterbox_available = True
        logger.info("Chatterbox TTS loaded successfully for voice cloning.")
    except Exception as e:
        logger.warning(f"Chatterbox TTS failed to load: {e}")
    finally:
        chatterbox_loading = False

# Start loading Chatterbox in the background immediately
threading.Thread(target=load_chatterbox, daemon=True).start()

# Try loading edge-tts
try:
    import edge_tts
    edge_available = True
    logger.info("Edge-TTS loaded successfully.")
except Exception as e:
    logger.warning(f"Edge-TTS failed to load: {e}")
    edge_available = False

app = FastAPI(title="Hybrid TTS Service")

VOICE_DIR = os.path.join(os.path.dirname(__file__), "voices")
os.makedirs(VOICE_DIR, exist_ok=True)

VOICE_MAP = {
    "host":     "en-US-AriaNeural",   # Preferred by user
    "expert":   "en-US-NovaNeural",   # Consistent with Prof. Nova
    "interview": "en-US-AndrewNeural",# Authoritative & fluent for Boardroom
    "narrator": "en-US-GuyNeural",
    "scientist": "en-GB-LibbyNeural",
    "engineer": "en-US-DavisNeural",
    "historian": "en-GB-RyanNeural",
    "default":  "en-US-AriaNeural"
}

@app.post("/tts")
async def process_tts(request: Request):
    body = await request.json()
    text = body.get("text", "").strip()
    voice_key = body.get("voice", "default").lower()
    
    # Advanced prosody controls (optional from client)
    rate = body.get("rate", "+0%")
    pitch = body.get("pitch", "+0Hz")

    if not text:
        return Response(content="Missing text", status_code=400)

    # Check for local voice clone
    voice_path = os.path.join(VOICE_DIR, f"{voice_key}.wav")
    
    # 1. Voice Cloning via Chatterbox
    if os.path.exists(voice_path) and chatterbox_available:
        try:
            logger.info(f"Cloning voice from '{voice_key}.wav' using Chatterbox...")
            audio_tensor = tts.generate(text, audio_prompt_path=voice_path)
            audio_array = audio_tensor.squeeze().cpu().numpy()
            
            import soundfile as sf
            buf = io.BytesIO()
            sf.write(buf, audio_array, 24000, format='WAV', subtype='PCM_16')
            logger.info("Chatterbox synthesis complete.")
            return Response(content=buf.getvalue(), media_type="audio/wav")
        except Exception as e:
            logger.error(f"Chatterbox cloning failed: {e}. Falling back to edge-tts.")

    # 2. High-Quality Built-in Edge-TTS with SSML for Realism
    if edge_available:
        try:
            edge_voice = VOICE_MAP.get(voice_key, VOICE_MAP["default"])
            logger.info(f"Using Edge-TTS: {edge_voice} (Rate: {rate}, Pitch: {pitch})")
            
            # Wrap in SSML for better realism (allows rate/pitch control)
            # Prosody helps break the "robotic" feel
            ssml = f"""
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                <voice name="{edge_voice}">
                    <prosody rate="{rate}" pitch="{pitch}">
                        {text}
                    </prosody>
                </voice>
            </speak>
            """
            
            communicate = edge_tts.Communicate(text, edge_voice, rate=rate, pitch=pitch)
            audio_bytes = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_bytes += chunk["data"]
            return Response(content=audio_bytes, media_type="audio/mpeg")
        except Exception as e:
            logger.error(f"Edge-TTS failed: {e}")
            return Response(content=f"Edge-TTS failed: {e}", status_code=500)
            
    return Response(content="No TTS engine available.", status_code=503)

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "engines": {"chatterbox": chatterbox_available, "edge": edge_available},
        "neural_voices": list(VOICE_MAP.keys()),
        "cloned_voices": [f.replace('.wav', '') for f in os.listdir(VOICE_DIR) if f.endswith('.wav')] if os.path.exists(VOICE_DIR) else []
    }

if __name__ == "__main__":
    import uvicorn
    # Important: host must be 0.0.0.0 so node backend can proxy local traffic
    uvicorn.run(app, host="0.0.0.0", port=8000)
