import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TopicSongPlayer = ({ songUrl, topicTitle, songLyrics, onVolumeChange }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [showControls, setShowControls] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // CC State
    const [currentTime, setCurrentTime] = useState(0);
    const [showCC, setShowCC] = useState(true);
    const [activeLyric, setActiveLyric] = useState('');

    const formatAudioUrl = (url) => {
        if (!url) return '';
        const sunoMatch = url.match(/suno\.com\/(?:s|song)\/([a-zA-Z0-9_-]+)/);
        if (sunoMatch && sunoMatch[1]) {
            return `https://cdn1.suno.ai/${sunoMatch[1]}.mp3`;
        }
        return url;
    };

    const formattedUrl = formatAudioUrl(songUrl);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (audioRef.current && formattedUrl) {
            console.log("TopicSongPlayer: Loading audio from", formattedUrl);
            audioRef.current.load();
        }
    }, [formattedUrl]);

    // Update active lyric based on time
    useEffect(() => {
        if (!songLyrics || !Array.isArray(songLyrics)) return;

        const currentLyric = [...songLyrics]
            .reverse()
            .find(lyric => currentTime >= lyric.time);

        setActiveLyric(currentLyric ? currentLyric.text : '');
    }, [currentTime, songLyrics]);

    const togglePlay = async () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            try {
                await audioRef.current.play();
            } catch (err) {
                console.error("Playback failed for:", formattedUrl, err);
            }
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    if (!songUrl) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col gap-3"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Lyrics / CC Overlay */}
            <AnimatePresence>
                {showCC && activeLyric && isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md rounded-xl p-3 text-center mb-1"
                    >
                        <p className="text-[13px] font-bold text-indigo-100 tracking-wide">
                            {activeLyric}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <audio
                key={formattedUrl}
                ref={audioRef}
                src={formattedUrl}
                preload="auto"
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                onError={(e) => {
                    console.error("Audio Playback Error:", e);
                    setLoadError(true);
                    setIsPlaying(false);
                }}
            />

            <div className="glass-morphism border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-indigo-500/30 group">
                {/* Visualizer / Icon */}
                <div className="relative w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {isPlaying ? (
                            <motion.div
                                key="playing"
                                className="flex items-end gap-[2px] h-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {[1, 2, 3, 4].map(i => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-indigo-400 rounded-full"
                                        animate={{ height: [4, 12, 6, 16, 4] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="paused"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Music className="text-indigo-400/40" size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Text Info */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Sparkles size={10} className={`${loadError ? 'text-rose-500' : 'text-amber-400'} animate-pulse`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${loadError ? 'text-rose-400' : 'text-indigo-400'}`}>
                            {loadError ? 'Link Interrupted' : 'Mastery Anthem'}
                        </span>
                    </div>
                    <span className="text-[12px] font-bold text-foreground/80 truncate max-w-[150px]">
                        {loadError ? 'Audio file not found' : `${topicTitle} Concept Recap`}
                    </span>
                </div>

                {/* Controls */}
                <div className="ml-auto flex items-center gap-2">
                    {/* CC Toggle */}
                    {songLyrics && songLyrics.length > 0 && (
                        <button
                            onClick={() => setShowCC(!showCC)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showCC ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/30' : 'bg-white/5 text-foreground/20'}`}
                            title="Toggle Captions"
                        >
                            <span className="text-[11px] font-black">CC</span>
                        </button>
                    )}

                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="translate-x-0.5" fill="currentColor" />}
                    </button>

                    <button
                        onClick={toggleMute}
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 text-foreground/40 hover:text-foreground/80 rounded-xl flex items-center justify-center transition-all"
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                </div>
            </div>

            {/* Ambient Pulse */}
            {isPlaying && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: [0, 0.2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-x-0 bottom-0 top-auto h-20 bg-indigo-500/20 blur-3xl -z-10 rounded-full"
                />
            )}
        </motion.div>
    );
};

export default TopicSongPlayer;
