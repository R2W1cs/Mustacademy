import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Send, Trash2, EyeOff, Loader2, Star } from "lucide-react";
import api from "../api/axios";

const ScholarlyFeedbackModal = ({ videoData, isOwner, onUpdate, onClose }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [feedbackText, setFeedbackText] = useState(isOwner ? (videoData.uploader_note || "") : "");
    const [rating, setRating] = useState(5);
    const [isPublic, setIsPublic] = useState(videoData.is_public !== false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await api.get(`/videos/${videoData.id}/feedback`);
                setFeedbacks(res.data);
            } catch (err) {
                console.error("Failed to load feedback", err);
            } finally {
                setLoading(false);
            }
        };
        if (videoData?.id) {
            fetchFeedback();
        }
    }, [videoData?.id]);

    const handleToggleVisibility = async () => {
        setSubmitLoading(true);
        try {
            const res = await api.put(`/videos/${videoData.id}/visibility`);
            setIsPublic(res.data.is_public);
            onUpdate({ ...videoData, is_public: res.data.is_public });
        } catch (err) {
            setError("Failed to update visibility.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedbackText.trim()) return;

        setSubmitLoading(true);
        setError(null);
        try {
            const res = await api.post(`/videos/${videoData.id}/feedback`, {
                feedback: feedbackText,
                rating: isOwner ? null : rating
            });

            if (isOwner) {
                // It was an uploader note update
                onUpdate({ ...videoData, uploader_note: feedbackText, is_public: isPublic });
                onClose();
            } else {
                // It's a new feedback, refetch
                setFeedbackText("");
                const refreshRes = await api.get(`/videos/${videoData.id}/feedback`);
                setFeedbacks(refreshRes.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Transmission failed.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this transmission?")) return;
        setSubmitLoading(true);
        try {
            await api.delete(`/videos/${videoData.id}`);
            // Provide a way to tell parent to remove from list
            // We can hack this by calling onUpdate with an empty object or a deleted flag
            onUpdate({ id: videoData.id, _deleted: true });
            onClose();
        } catch (err) {
            setError("Failed to delete transmission.");
            setSubmitLoading(false);
        }
    };

    if (!videoData) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[200]">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-[#0f1729] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/5">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-white mb-1">{isOwner ? 'Manage Transmission' : 'Scholarly Feedback'}</h3>
                            {isOwner && (
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isPublic ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    {isPublic ? 'Public' : 'Hidden'}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-white/40 font-mono line-clamp-1">{videoData.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Feedback Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2 px-1">
                                {isOwner ? 'Attach Uploader Note' : 'Provide Constructive Feedback'}
                            </label>

                            {!isOwner && (
                                <div className="flex gap-2 mb-3 px-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`transition-colors ${star <= rating ? 'text-[#FFD700]' : 'text-white/20'}`}
                                        >
                                            <Star size={18} fill={star <= rating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <textarea
                                required={!isOwner}
                                value={feedbackText}
                                onChange={e => setFeedbackText(e.target.value)}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all resize-none placeholder:text-white/20"
                                placeholder={isOwner ? "Add an explanatory note to your transmission (optional)..." : "Share your academic perspective..."}
                            />
                        </div>

                        {error && <p className="text-red-400 text-xs font-bold">{error}</p>}

                        <div className="flex gap-3 mt-6">
                            {isOwner && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleToggleVisibility}
                                        disabled={submitLoading}
                                        className="flex-1 p-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl transition-colors font-bold text-sm flex items-center justify-center gap-2"
                                        title={isPublic ? "Hide from peers" : "Make public"}
                                    >
                                        <EyeOff size={16} className={isPublic ? "opacity-50" : "text-amber-400"} />
                                        {isPublic ? 'Hide Transmission' : 'Make Public'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={submitLoading}
                                        className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-bold flex items-center justify-center"
                                        title="Delete Transmission"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}
                            <button
                                type="submit"
                                disabled={submitLoading || (!feedbackText.trim() && !isOwner)}
                                className={`${isOwner ? 'flex-[1.5]' : 'w-full'} bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 group text-sm shadow-lg hover:shadow-lg`}
                            >
                                {submitLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                    <>
                                        {isOwner ? 'Save Note' : 'Submit Feedback'}
                                        <Send size={16} className="group-hover:translate-x-1 group-active:scale-95 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Previous Feedbacks */}
                    <div className="pt-4 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 px-1">Peer Reviews ({feedbacks.length})</h4>

                        {loading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-white/20" /></div>
                        ) : feedbacks.length === 0 ? (
                            <p className="text-white/20 text-xs italic text-center p-4 border border-white/5 rounded-xl border-dashed">No evaluations submitted yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {feedbacks.map(fb => (
                                    <div key={fb.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <img src={fb.avatar_url || `https://ui-avatars.com/api/?name=${fb.reviewer_name}&background=random`} alt="" className="w-5 h-5 rounded-full" />
                                                <span className="text-xs font-bold text-white/70">{fb.reviewer_name}</span>
                                            </div>
                                            {fb.rating && (
                                                <div className="flex gap-0.5 text-[#FFD700]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} fill={i < fb.rating ? "currentColor" : "none"} className={i >= fb.rating ? "text-white/20" : ""} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed break-words">{fb.feedback_text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ScholarlyFeedbackModal;

