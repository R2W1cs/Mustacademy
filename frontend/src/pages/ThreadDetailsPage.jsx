import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ArrowUp, MessageSquare, Send, Share2,
    MoreHorizontal, GraduationCap, Clock, AtSign, CornerDownRight
} from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";

export default function ThreadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        fetchThread();
    }, [id]);

    const fetchThread = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/forum/threads/${id}`);
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch thread details:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        try {
            await api.post("/forum/comments", {
                threadId: id,
                content: commentText,
                parentCommentId: replyingTo?.id
            });
            setCommentText("");
            setReplyingTo(null);
            fetchThread();
        } catch (err) {
            console.error("Failed to post comment:", err);
        }
    };

    const handleUpvote = async (threadId, commentId = null) => {
        try {
            await api.post("/forum/upvote", { threadId, commentId });
            fetchThread();
        } catch (err) {
            console.error("Upvote failed:", err);
        }
    };

    if (loading) return (
        <div className={`min-h-screen p-12 flex items-center justify-center ${isDark ? 'bg-[#050810]' : 'bg-slate-50'}`}>
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
    );

    if (!data) return <div>Transmission Lost.</div>;

    const { thread, comments } = data;

    // Helper to build comment tree
    const buildTree = (list) => {
        const map = {};
        const roots = [];
        list.forEach(item => {
            map[item.id] = { ...item, replies: [] };
        });
        list.forEach(item => {
            if (item.parent_comment_id) {
                map[item.parent_comment_id]?.replies.push(map[item.id]);
            } else {
                roots.push(map[item.id]);
            }
        });
        return roots;
    };

    const commentTree = buildTree(comments);

    return (
        <div className={`min-h-screen p-8 md:p-12 space-y-12 animate-fade-in transition-colors duration-700 ${isDark ? 'bg-[#050810]' : 'bg-slate-50'}`}>
            {/* Thread Header */}
            <div className="max-w-5xl mx-auto space-y-10">
                <button
                    onClick={() => navigate(-1)}
                    className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                    <ArrowLeft size={16} /> Backward to Grid
                </button>

                <div className={`border rounded-[3rem] p-12 relative overflow-hidden ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                    <div className="flex gap-10 items-start relative z-10">
                        {/* Vote Column */}
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={() => handleUpvote(thread.id)}
                                className={`p-4 rounded-2xl transition-all ${thread.user_has_upvoted ? 'bg-cyan-500 text-black shadow-lg' : (isDark ? 'bg-white/5 text-white/20 hover:text-cyan-400' : 'bg-slate-50 text-slate-300')}`}
                            >
                                <ArrowUp size={24} />
                            </button>
                            <span className="text-xl font-black font-mono">{thread.upvote_count}</span>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-black">
                                    {thread.username?.[0] || "?"}
                                </div>
                                <div>
                                    <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{thread.username}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-30`}>{new Date(thread.created_at).toLocaleString()}</p>
                                </div>
                                <span className="ml-auto px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-500 text-[10px] font-black uppercase tracking-widest">
                                    {thread.topic_title || "General Sync"}
                                </span>
                            </div>

                            <h1 className="text-5xl font-black tracking-tighter uppercase leading-[1.1]">{thread.title}</h1>

                            <div className={`text-lg leading-relaxed space-y-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {thread.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                            </div>

                            <div className="flex items-center gap-8 pt-10 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={18} className="text-cyan-500" />
                                    <span className="text-xs font-black uppercase tracking-widest opacity-50">{comments.length} Synaptic Nodes</span>
                                </div>
                                <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-all">
                                    <Share2 size={18} /> Share Transmission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comment Section */}
                <div className="space-y-12">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Synaptic Activity</h2>

                    {/* Add Comment */}
                    <form onSubmit={handleSubmitComment} className="relative">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className={`w-full h-32 rounded-[2rem] p-8 pr-32 outline-none border transition-all text-sm leading-relaxed ${isDark ? 'bg-black/40 border-white/5 focus:border-cyan-500/30' : 'bg-white border-slate-200 focus:border-cyan-500'}`}
                            placeholder={replyingTo ? `Replying to @${replyingTo.username}...` : "Construct your response..."}
                        />
                        <button
                            type="submit"
                            className="absolute right-6 bottom-6 p-4 rounded-xl bg-cyan-500 text-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
                        >
                            <Send size={20} />
                        </button>
                    </form>

                    {/* Comment List */}
                    <div className="space-y-8">
                        {commentTree.map(comment => (
                            <CommentNode
                                key={comment.id}
                                comment={comment}
                                onReply={setReplyingTo}
                                onUpvote={handleUpvote}
                                isDark={isDark}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CommentNode({ comment, onReply, onUpvote, isDark, depth = 0 }) {
    return (
        <div className={`space-y-6 ${depth > 0 ? 'ml-12 border-l border-white/5 pl-8' : ''}`}>
            <div className={`p-8 rounded-[2rem] border transition-all ${isDark ? 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02]' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex gap-6 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black shrink-0">
                        {comment.username?.[0] || "?"}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest">{comment.username}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-20">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{comment.content}</p>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => onUpvote(null, comment.id)}
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${comment.user_has_upvoted ? 'text-cyan-500' : 'opacity-30 hover:opacity-100'}`}
                            >
                                <ArrowUp size={14} /> {comment.upvote_count || 0}
                            </button>
                            <button
                                onClick={() => onReply(comment)}
                                className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 flex items-center gap-2"
                            >
                                <CornerDownRight size={14} /> Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {comment.replies && comment.replies.map(reply => (
                <CommentNode
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    onUpvote={onUpvote}
                    isDark={isDark}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
}

