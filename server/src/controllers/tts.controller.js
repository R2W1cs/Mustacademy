import { groqTTS } from '../utils/aiClient.js';

/**
 * Controller for Standalone Neural TTS (Groq Edition)
 * Converts text to high-quality speech using Groq's Orpheus-v1 model.
 */
export const generateTTS = async (req, res) => {
    let { text, voice } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required for synthesis.' });
    }

    // Voice mapping for backward compatibility
    // aria -> hannah, anything else -> tray (for Nova)
    const groqVoice = (voice && voice.toLowerCase().includes('aria')) ? 'hannah' : 'tray';

    console.log(`[TTS-Module-Groq] Synthesizing speech using Orpheus-v1 (${groqVoice})...`);

    try {
        const buffer = await groqTTS(text, groqVoice);

        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': buffer.length,
            'X-TTS-Engine': 'Groq-Orpheus-Standard',
            'X-Neural-Voice': groqVoice
        });

        return res.send(buffer);
    } catch (error) {
        console.error('[TTS-Module-Groq] Critical error:', error);
        res.status(503).json({ error: 'Groq Orpheus synthesis failed.' });
    }
};
