import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { getCareerRoadmap, generateTrajectory } from "../api/career";
import { getMyProfile } from "../api/profile";
import { useTheme } from "../auth/ThemeContext";
import ScholarlyFeedbackModal from "../components/ScholarlyFeedbackModal";

const VideoCard = ({ video, onLike, onFeedback }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${isDark ? 'bg-[#0f1729] border-white/10' : 'bg-white border-indigo-50 shadow-xl shadow-indigo-500/5'} border rounded-xl overflow-hidden group hover:border-nebula transition-all`}
        >
            <div className={`aspect-video relative ${isDark ? 'bg-black' : 'bg-slate-100'}`}>
                {/* Native HTML5 Video Player */}
                <video
                    key={video.id}
                    controls
                    className="w-full h-full object-cover"
                    poster={`https://ui-avatars.com/api/?name=${encodeURIComponent(video.title)}&background=random&size=320`}
                    src={`${(import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '').replace(/\/$/, '')}${video.video_url}`}
                    onError={(e) => {
                        console.error("Video playback error:", e);
                        // Fallback poster if video fails
                        e.target.poster = "https://via.placeholder.com/320x180?text=Encryption+Error";
                    }}
                >
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="p-4">
                <h4 className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold text-sm line-clamp-1 mb-1`} title={video.title}>{video.title}</h4>
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-5 h-5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                        <img src={video.avatar_url || `https://ui-avatars.com/api/?name=${video.author_name}&background=random`} />
                    </div>
                    <span className={`text-[10px] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{video.author_name}</span>
                </div>
                <div className={`flex justify-between items-center text-[10px] font-mono border-t pt-2 ${isDark ? 'text-white/30 border-white/5' : 'text-slate-400 border-slate-100'}`}>
                    <button
                        onClick={() => !video.user_liked && onLike(video.id)}
                        className={`flex items-center gap-1 transition-colors ${video.user_liked ? 'text-red-500 cursor-default' : 'hover:text-cyan-500'}`}
                        disabled={video.user_liked}
                    >
                        {video.user_liked ? '❤️' : '🤍'} {video.likes || 18}
                    </button>
                    <button
                        onClick={() => onFeedback(video)}
                        className={`flex items-center gap-1 transition-colors ${video.isUploader ? 'text-amber-400 hover:text-amber-300' : 'hover:text-cyan-500'}`}
                    >
                        {video.is_uploader ? '📝 Add Note' : '💬 Feedback'}
                    </button>
                </div>
                {video.uploader_note && (
                    <div className={`mt-2 p-2 rounded-lg text-[9px] italic border-l-2 whitespace-pre-wrap break-words ${isDark ? 'bg-white/5 border-amber-500 text-white/60' : 'bg-amber-50 border-amber-500 text-amber-700'}`}>
                        " {video.uploader_note} "
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const UploadModal = ({ isOpen, onClose, courseId, onUploadSuccess }) => {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a video file.");
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append("courseId", courseId);
        formData.append("title", title);
        formData.append("videoFile", file);
        formData.append("description", "Uploaded from Scholar's Device");

        try {
            const res = await api.post('/videos/upload', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            onUploadSuccess();
            onClose();
            setTitle("");
            setFile(null);
        } catch (err) {
            console.error("Upload Error Details:", err);
            const errorMsg = err.response?.data?.message || "Transmission failed.";
            alert(`DATA UPLINK FAILED: ${errorMsg}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0f1729] border border-white/10 rounded-2xl p-8 max-w-md w-full relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white">
                    ✕
                </button>
                <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Upload Transmission</h3>
                <p className="text-xs text-white/40 mb-6 font-bold uppercase tracking-widest">Share knowledge. Earn +10 ASC. MP4/MOV Supported.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2 px-1">Designation Title</label>
                        <input
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#FFD700] outline-none transition-colors font-black"
                            placeholder="e.g., Recursion Explained Simply"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2 px-1">Static Asset File</label>
                        <div
                            onClick={() => document.getElementById('video-input').click()}
                            className="w-full bg-white/5 border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all group"
                        >
                            <input
                                id="video-input"
                                type="file"
                                accept="video/*"
                                required
                                className="hidden"
                                onChange={e => setFile(e.target.files[0])}
                            />
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white">
                                📤
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">
                                {file ? file.name : "Select Video Transmission"}
                            </p>
                        </div>
                    </div>
                    <button
                        disabled={uploading}
                        type="submit"
                        className="w-full bg-[#FFD700] hover:bg-[#FDB931] text-black font-black py-4 rounded-xl transition-transform active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-[10px] shadow-xl"
                    >
                        {uploading ? "Transmitting Data..." : "Upload & Earn ASC"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const RoadmapView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isCareerMode = location.pathname.includes('/career');
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [roadmapData, setRoadmapData] = useState(null);
    const [forging, setForging] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const loadData = async () => {
        try {
            // Get current user profile for ID comparison
            let userId = currentUserId;
            if (!userId) {
                const profileRes = await getMyProfile();
                userId = profileRes.data.id;
                setCurrentUserId(userId);
            }

            if (isCareerMode) {
                const res = await getCareerRoadmap();
                setRoadmapData(res.data);
                setCourse({ name: res.data.target_job });
            } else {
                const [courseRes, videoRes, topicsRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get(`/videos/${id}`),
                    api.get(`/courses/${id}/topics/progress`)
                ]);
                setCourse(courseRes.data);

                // Backend calculates is_uploader now
                setVideos(videoRes.data || []);
                setRoadmapData({ steps: topicsRes.data });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoUpdate = (updatedVideoData) => {
        if (updatedVideoData._deleted) {
            setVideos(prev => prev.filter(v => v.id !== updatedVideoData.id));
            if (selectedVideo?.id === updatedVideoData.id) {
                setSelectedVideo(null);
                setShowFeedback(false);
            }
            return;
        }

        setVideos(prev => prev.map(v =>
            v.id === updatedVideoData.id
                ? { ...v, ...updatedVideoData }
                : v
        ));

        // Also update selected video if it's the one open to keep modal in sync
        if (selectedVideo?.id === updatedVideoData.id) {
            setSelectedVideo(prev => ({ ...prev, ...updatedVideoData }));
        }
    };

    const handleRegenerate = async () => {
        setForging(true);
        try {
            const res = await generateTrajectory();
            setRoadmapData(res.data);
            setCourse({ name: res.data.target_job });
        } catch (err) {
            console.error("Failed to forge trajectory", err);
        } finally {
            setForging(false);
        }
    };

    useEffect(() => {
        loadData();

        // Auto-refresh every 1 minute
        const refreshInterval = setInterval(() => {
            console.log("[Roadmap] Synchronizing trajectory data...");
            loadData();
        }, 60000);

        return () => clearInterval(refreshInterval);
    }, [id, isCareerMode]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
                <div className="text-[#FFD700] font-mono text-xs animate-pulse">CALCULATING TRAJECTORY...</div>
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className={`min-h-screen p-0 font-sans relative overflow-hidden transition-colors duration-700 ${isDark ? 'bg-[#0a0e1a] text-slate-200' : 'bg-gradient-to-br from-white via-indigo-50/30 to-white text-slate-900'}`}>
            <AnimatePresence>
                {showFeedback && selectedVideo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <ScholarlyFeedbackModal
                            onClose={() => {
                                setShowFeedback(false);
                                setSelectedVideo(null);
                            }}
                            videoData={selectedVideo}
                        />
                    </div>
                )}
            </AnimatePresence>
            <UploadModal
                isOpen={showUpload}
                onClose={() => setShowUpload(false)}
                courseId={id}
                onUploadSuccess={loadData}
            />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full pt-8 px-8 md:px-12">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 text-center"
                >
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-center mb-6">
                        <button onClick={() => navigate('/courses')} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                            ← Return to Library
                        </button>
                        {isCareerMode && (
                            <button
                                disabled={forging}
                                onClick={handleRegenerate}
                                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors flex items-center gap-2 border border-indigo-500/20 px-4 py-1.5 rounded-lg bg-indigo-500/5 disabled:opacity-50"
                            >
                                {forging ? "🔄 FORGING..." : "🔄 Recalculate Synaptic Path"}
                            </button>
                        )}
                    </div>
                    <h1 className={`text-6xl md:text-7xl font-black tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isCareerMode ? "CAREER " : "THE "}
                        <span className="text-nebula italic">
                            {isCareerMode ? "TRAJECTORY" : "PATH"}
                        </span>
                    </h1>
                    <p className={`text-xl font-bold max-w-2xl mx-auto ${isDark ? 'text-white/60' : 'text-indigo-900/50'}`}>
                        {isCareerMode ? (
                            <span>The Professor's forged trajectory for <span className={`${isDark ? 'text-white' : 'text-indigo-600'} font-black`}>{course.name}</span></span>
                        ) : (
                            <span>Your trajectory to mastering <span className={`${isDark ? 'text-white' : 'text-indigo-600'} font-black`}>{course.name}</span></span>
                        )}
                    </p>
                </motion.div>

                {/* ARCHITECTURE SUMMARY (Career Mode Only) */}
                {isCareerMode && roadmapData?.architecture_json && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mb-6 p-6 md:p-8 rounded-[2rem] border relative overflow-hidden group transition-all duration-700 ${isDark ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-white/5' : 'bg-white border-indigo-100 shadow-xl shadow-indigo-500/5'}`}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Strategic Architecture</h3>
                            <p className="text-2xl font-medium text-white/80 leading-relaxed italic mb-8">
                                "{roadmapData.architecture_json.summary}"
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {roadmapData.architecture_json.technical_pillars?.map((pillar, i) => (
                                    <div key={i} className="px-5 py-2.5 bg-[#0a0e1a] border border-indigo-500/30 rounded-2xl text-sm font-bold text-white group-hover:border-indigo-500 transition-colors">
                                        <span className="text-indigo-400 mr-2">#</span>
                                        {typeof pillar === 'string' ? pillar : (pillar.name || pillar.title || JSON.stringify(pillar))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 1. WHY IT MATTERS (The "Hook") */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                    <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-indigo-100 shadow-lg shadow-indigo-500/5'} backdrop-blur-xl border p-8 rounded-[2rem] relative group overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">Strategic Necessity</h3>
                        <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Finding the "Why" is the first step to true mastery. Every concept in this sector has a concrete reason for its existence in the engineering stack.
                        </p>
                    </div>

                    <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-indigo-100 shadow-lg shadow-indigo-500/5'} backdrop-blur-xl border p-8 rounded-[2rem] relative group overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">Real World Deployment</h3>
                        <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Mastery isn't theoretical. Here we see how this architecture translates directly into industry standards and production-level deployments.
                        </p>
                    </div>
                </motion.div>

                {/* 2. THE JOURNEY (Timeline) */}
                <div className="relative mb-6">
                    {/* Center Line */}
                    <div className={`absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block ${isDark ? 'bg-white/10' : 'bg-indigo-100'}`} />

                    <div className="space-y-8">
                        {(isCareerMode ? (roadmapData?.roadmap_steps_json || []) : (roadmapData?.steps || [])).map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                            >
                                {/* Content Card */}
                                <div className="flex-1 w-full">
                                    <div className={`${isDark ? 'bg-[#0f1729] border-white/10' : 'bg-white border-indigo-50 shadow-xl shadow-indigo-500/5'} border p-6 rounded-[2rem] hover:border-indigo-500/50 transition-all group cursor-pointer relative`}>
                                        <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{isCareerMode ? step.phase : `TOPIC 0${i + 1}`}</span>
                                            {(isCareerMode || step.completed) && (
                                                <div className={`px-3 py-1 rounded-full text-[8px] font-bold border uppercase tracking-widest ${step.completed ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : isDark ? 'bg-white/5 text-white/30 border-white/5' : 'bg-indigo-50 text-indigo-400 border-indigo-100'}`}>
                                                    {step.completed ? 'Mastered' : 'Verified Node'}
                                                </div>
                                            )}
                                        </div>

                                        <h4 className={`text-xl font-black mb-2 tracking-tight group-hover:text-indigo-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {isCareerMode ? String(step.title || '') : step.title}
                                        </h4>
                                        <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-white/50' : 'text-slate-500 font-medium'}`}>
                                            {isCareerMode ? String(step.description || '') : `A critical pillar of ${course.name}. Mastery requires exact technical precision and conceptual clarity.`}
                                        </p>

                                        {isCareerMode && (
                                            <div className={`space-y-6 border-t pt-6 mt-6 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                                {/* Study List */}
                                                {step.study_list?.length > 0 && (
                                                    <div>
                                                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-indigo-400" />
                                                            Tactical Study List
                                                        </p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {step.study_list.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                                                                    <span className="text-indigo-500/50">›</span> {item}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Preparation Task */}
                                                <div>
                                                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                                        Preparation Sequence
                                                    </p>
                                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-white/50 leading-relaxed font-mono">
                                                        {step.preparation_task}
                                                    </div>
                                                </div>

                                                {/* Battlefield Scenario */}
                                                <div>
                                                    <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <span className="w-1 h-1 rounded-full bg-rose-400" />
                                                        Battlefield Scenario
                                                    </p>
                                                    <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-[10px] text-white/50 leading-relaxed font-mono italic">
                                                        "{step.battlefield_scenario}"
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[8px] font-black text-[#FFD700] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-[#FFD700]" />
                                                            Conceptual Proof
                                                        </p>
                                                        <p className="text-[10px] text-white/40 font-mono italic leading-relaxed">
                                                            "{String(step.conceptual_proof || '')}"
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-white/30" />
                                                            Standard
                                                        </p>
                                                        <p className="text-[10px] text-white/40 font-mono italic leading-relaxed">
                                                            "{String(step.industry_standard || '')}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Center Node */}
                                <div className={`relative z-10 hidden md:flex items-center justify-center w-16 h-16 border-2 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.3)] group ${isDark ? 'bg-[#0a0e1a] border-indigo-500' : 'bg-white border-indigo-500'}`}>
                                    <span className="text-white font-black text-lg">{i + 1}</span>
                                    {/* Pulse Effect */}
                                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
                                </div>

                                {/* Spacer */}
                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 3. PEER VIDEO VAULT (Only for Course Mode) */}
                {!isCareerMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className={`flex flex-col md:flex-row justify-between items-end mb-6 border-b pb-4 ${isDark ? 'border-white/5' : 'border-indigo-100'}`}>
                            <div>
                                <h2 className={`text-3xl font-black tracking-tighter mb-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>Knowledge Exchange</h2>
                                <p className={`${isDark ? 'text-white/40' : 'text-indigo-900/40'} text-xs font-bold uppercase tracking-widest`}>Peer-verified explanations. Earn +10 ASC.</p>
                            </div>
                            <button
                                onClick={() => setShowUpload(true)}
                                className="px-6 py-2 bg-nebula text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg hover:scale-105 transition-all"
                            >
                                + Upload Transmission
                            </button>
                        </div>

                        {videos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {videos.map(video => (
                                    <VideoCard
                                        key={video.id}
                                        video={video}
                                        onLike={async (videoId) => {
                                            try {
                                                await api.post(`/videos/${videoId}/like`);
                                                // Optimistically update UI
                                                setVideos(prev => prev.map(v =>
                                                    v.id === videoId
                                                        ? { ...v, likes: (v.likes || 0) + 1, userLiked: true }
                                                        : v
                                                ));
                                            } catch (err) {
                                                console.error("Failed to like video:", err);
                                            }
                                        }}
                                        onFeedback={(video) => {
                                            setSelectedVideo(video);
                                            setShowFeedback(true);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={`${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'} border border-dashed rounded-3xl p-12 text-center opacity-70`}>
                                <div className="text-4xl mb-4 text-indigo-400">
                                    📡
                                </div>
                                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Transmissions Detected</h3>
                                <p className={`${isDark ? 'text-white/40' : 'text-slate-500'} text-sm mb-6 max-w-sm mx-auto`}>Be the first to establish a knowledge uplink for this sector.</p>
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="text-cyan-400 border-b border-cyan-400 text-xs font-bold uppercase tracking-widest pb-1 hover:text-white hover:border-white transition-colors"
                                >
                                    Initialize First Upload
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {showFeedback && selectedVideo && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <ScholarlyFeedbackModal
                            videoData={selectedVideo}
                            isOwner={selectedVideo.is_uploader}
                            onUpdate={handleVideoUpdate}
                            onClose={() => {
                                setShowFeedback(false);
                            }}
                        />
                    </div>
                )}

                <UploadModal
                    isOpen={showUpload}
                    onClose={() => setShowUpload(false)}
                    courseId={id}
                    onUploadSuccess={loadData}
                />

            </div>
        </div>
    );
};

const COURSE_CONTEXT = {
    default: {
        why: 'Finding the "Why" is the first step to true mastery. Every concept in this sector has a concrete reason for its existence in the engineering stack.',
        app: 'Mastery isn\'t theoretical. Here we see how this architecture translates directly into industry protocols and production-level deployments.'
    }
};

export default RoadmapView;
