import { pipeline } from '@huggingface/transformers';
import wavefile from 'wavefile';
const { WaveFile } = wavefile;
import fs from 'fs';

async function main() {
    console.log("Loading Kokoro TTS via WebAssembly...");
    
    // Attempting to load Kokoro Pipeline
    try {
        const tts = await pipeline('text-to-speech', 'onnx-community/Kokoro-82M-v1.0-ONNX', {
            dtype: 'fp32', // Use fp32 for standard inference
            device: 'cpu'
        });
        
        console.log("Model loaded. Synthesizing voice...");
        
        const audio = await tts('Welcome to the Boardroom. I am Marcus Sterling.', {
            voice: 'am_michael' // American Male
        });
        
        const wav = new WaveFile();
        wav.fromScratch(1, audio.sampling_rate, '32f', audio.audio);
        fs.writeFileSync('kokoro-output.wav', wav.toBuffer());
        
        console.log("Synthesis successful! Saved to kokoro-output.wav");
    } catch (e) {
        console.error("Kokoro Synthesis Error:", e);
    }
}

main();
