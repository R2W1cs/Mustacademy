import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import soundfile as sf
import io
import torch
from kokoro import KPipeline

app = FastAPI(title="Kokoro TTS Microservice")

# Initialize Kokoro Pipeline
# Make sure you have models installed or it will download them
try:
    print("Loading Kokoro Pipeline...")
    pipeline = KPipeline(lang_code='a') # 'a' for American English
    print("Kokoro Pipeline Loaded Successfully.")
except Exception as e:
    print(f"Failed to load Kokoro Pipeline: {e}")
    pipeline = None

# Custom paths for cloned voice embeddings
VOICE_PATH_ARIA = os.path.join(os.path.dirname(__file__), 'voices', 'aria_cloned.pt')
VOICE_PATH_NOVA = os.path.join(os.path.dirname(__file__), 'voices', 'nova_cloned.pt')

class TTSRequest(BaseModel):
    text: str
    speaker: str = "host" # "host" or "expert"

@app.post("/generate")
async def generate_audio(req: TTSRequest):
    if not pipeline:
        raise HTTPException(status_code=500, detail="Kokoro pipeline not initialized")

    # Determine voice profile
    # If the custom cloned voice exists, load its tensor, otherwise fallback to high quality defaults
    voice_tensor_path = None
    voice_name = 'af_bella' # fallback female

    if req.speaker == "host":
        if os.path.exists(VOICE_PATH_ARIA):
            voice_tensor = torch.load(VOICE_PATH_ARIA, weights_only=True)
            voice_name = voice_tensor
        else:
            voice_name = 'af_aoede'
    else:
        if os.path.exists(VOICE_PATH_NOVA):
            voice_tensor = torch.load(VOICE_PATH_NOVA, weights_only=True)
            voice_name = voice_tensor
        else:
            voice_name = 'am_adam'

    try:
        # Generate Audio
        generator = pipeline(
            req.text,
            voice=voice_name,
            speed=1.0,
            split_pattern=r'\n+'
        )
        
        audio_chunks = []
        sample_rate = 24000
        
        for i, (gs, ps, audio) in enumerate(generator):
            if audio is not None:
                audio_chunks.append(audio)
        
        if not audio_chunks:
            raise HTTPException(status_code=500, detail="Synthesis produced no audio")
            
        import numpy as np
        final_audio = np.concatenate(audio_chunks)
        
        # Write to memory buffer
        buffer = io.BytesIO()
        sf.write(buffer, final_audio, sample_rate, format='WAV')
        buffer.seek(0)
        
        return Response(content=buffer.read(), media_type="audio/wav")

    except Exception as e:
        print(f"Synthesis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
