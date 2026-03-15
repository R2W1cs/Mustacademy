import { Communicate } from 'edge-tts-universal';
import axios from 'axios';

/**
 * Controller for Standalone Neural TTS
 * Primary: Uses Custom Local Kokoro TTS Engine (Port 5001) for the blended 'Marcus Sterling' persona.
 * Fallback: Microsoft Edge Neural voices if Kokoro is unreachable (e.g., in unconfigured production).
 */
export const generateTTS = async (req, res) => {
    const { text, voice = 'en-US-AriaNeural' } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required for synthesis.' });
    }

    const KOKORO_URL = process.env.KOKORO_API_URL || 'http://127.0.0.1:5001';

    try {
        console.log(`[TTS-Module] Attempting synthesis via Kokoro Engine: "${text.substring(0, 30)}..."`);
        
        // Try Kokoro Engine first
        const response = await axios.post(`${KOKORO_URL}/tts`, { text }, {
            responseType: 'stream',
            timeout: 10000 // 10s wait before falling back
        });

        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Transfer-Encoding', 'chunked');
        response.data.pipe(res);
        
        console.log('[TTS-Module] Kokoro stream active.');
        return;

    } catch (error) {
        console.warn(`[TTS-Module] Kokoro Engine unreachable (${error.message}). Falling back to Edge TTS.`);
        
        // Fallback to Edge TTS
        try {
            console.log(`[TTS-Module] Falling back to Edge TTS voice: ${voice}`);
            const communicate = new Communicate(text, { voice });
            
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Transfer-Encoding', 'chunked');

            for await (const chunk of communicate.stream()) {
                if (chunk.type === 'audio' && chunk.data) {
                    res.write(chunk.data);
                }
            }
            res.end();
            console.log('[TTS-Module] Edge TTS stream complete.');

        } catch (edgeError) {
            console.error('[TTS-Module] Fallback Synthesis Error:', edgeError);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to generate speech. Both engines offline.' });
            } else {
                res.end();
            }
        }
    }
};
