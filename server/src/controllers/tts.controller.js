import { Communicate } from 'edge-tts-universal';

/**
 * Controller for Standalone Neural TTS
 * Converts text to high-quality speech using Microsoft Edge Neural voices.
 */
export const generateTTS = async (req, res) => {
    const { text, voice = 'en-US-AvaNeural' } = req.method === 'GET' ? req.query : req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required for synthesis.' });
    }

    console.log(`[TTS-Module] Synthesizing speech for: "${text.substring(0, 30)}..." using ${voice}`);

    try {
        const communicate = new Communicate(text, { voice });
        
        // Set headers for MP3 streaming
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Stream audio chunks directly to the response
        for await (const chunk of communicate.stream()) {
            if (chunk.type === 'audio' && chunk.data) {
                res.write(chunk.data);
            }
        }

        res.end();
    } catch (error) {
        console.error('[TTS-Module] Synthesis Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate speech. Service might be temporarily unavailable.' });
        } else {
            res.end();
        }
    }
};
