import { useState, useRef, useCallback, useEffect } from "react";
import api from "../api/axios";

export function useNovaVoice() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef(new Audio());
    const onEndedCallback = useRef(null);
    const [audioContextReady, setAudioContextReady] = useState(false);

    const killAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
        setIsSpeaking(false);
    }, []);

    // Prime audio on interaction so it works in browsers (prevent Autoplay policy blocking)
    useEffect(() => {
        const prime = async () => {
            if (audioContextReady) return;
            // Short silent WAV base64
            const silent = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
            audioRef.current.src = silent;
            try {
                await audioRef.current.play();
                setAudioContextReady(true);
                window.removeEventListener('click', prime);
                window.removeEventListener('keydown', prime);
            } catch (err) {
                // user hasn't interacted with page yet...
            }
        };
        window.addEventListener('click', prime);
        window.addEventListener('keydown', prime);
        return () => {
            window.removeEventListener('click', prime);
            window.removeEventListener('keydown', prime);
            killAudio();
        };
    }, [audioContextReady, killAudio]);

    const speak = useCallback(async (text, onEnded = null) => {
        killAudio();
        onEndedCallback.current = onEnded;

        if (!text) {
            if (onEnded) onEnded();
            return;
        }

        // Clean text formatting so she speaks naturally
        const clean = text
            .replace(/```[\s\S]*?```/g, " code block ")
            .replace(/\*\*/g, "")
            .replace(/###?\s/g, "")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\n+/g, " ")
            .trim();

        try {
            setIsSpeaking(true);
            const res = await api.post('/tts', { text: clean, voice: 'en-US-AvaNeural' }, { responseType: 'blob' });
            
            if (!res.data || res.data.size < 500) {
                throw new Error('Invalid or short audio received');
            }

            const url = URL.createObjectURL(res.data);
            const audio = new Audio(url);
            audioRef.current = audio;
            
            audio.onended = () => {
                killAudio();
                URL.revokeObjectURL(url);
                if (onEndedCallback.current) {
                    onEndedCallback.current();
                }
            };
            audio.onerror = () => {
                killAudio();
                URL.revokeObjectURL(url);
                if (onEndedCallback.current) {
                    onEndedCallback.current();
                }
            };
            
            // Try to play. If browser blocks, it fails.
            await audio.play().catch((e) => {
                console.warn('Playback blocked by browser:', e);
                killAudio();
                if (onEndedCallback.current) {
                    // Fallback to instantly calling onEnded so the flow doesn't hang
                    onEndedCallback.current();
                }
            });
        } catch (err) {
            console.error('Nova TTS failed:', err);
            killAudio();
            if (onEndedCallback.current) {
                // Instant falback
                onEndedCallback.current();
            }
        }
    }, [killAudio]);

    return { speak, killAudio, isSpeaking };
}
