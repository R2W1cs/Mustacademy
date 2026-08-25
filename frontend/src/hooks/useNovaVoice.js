import { useState, useRef, useCallback, useEffect } from "react";
import {
    playStreamingTtsQueued,
    cleanSpeechText,
    browserSpeechFallback,
} from "../utils/streamingTts";

export function useNovaVoice() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef(null);
    const stopRef = useRef(null);
    const onEndedCallback = useRef(null);
    const [audioContextReady, setAudioContextReady] = useState(false);

    const killAudio = useCallback(() => {
        stopRef.current?.();
        stopRef.current = null;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
        }
        setIsSpeaking(false);
    }, []);

    // Prime audio on interaction so it works in browsers (prevent Autoplay policy blocking)
    useEffect(() => {
        const prime = async () => {
            if (audioContextReady) return;
            const silent = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
            const a = new Audio(silent);
            try {
                await a.play();
                setAudioContextReady(true);
                window.removeEventListener('click', prime);
                window.removeEventListener('keydown', prime);
            } catch {
                // user hasn't interacted with page yet
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
            onEnded?.();
            return;
        }

        const clean = cleanSpeechText(text);
        setIsSpeaking(true);

        const { stop } = playStreamingTtsQueued(clean, 'en-US-AvaNeural', {
            audioRef,
            onEnded: () => {
                killAudio();
                onEndedCallback.current?.();
            },
            onError: () => {
                browserSpeechFallback(clean, () => {
                    killAudio();
                    onEndedCallback.current?.();
                });
            },
        });
        stopRef.current = stop;
    }, [killAudio]);

    return { speak, killAudio, isSpeaking };
}
