import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";
import ScholarlyFeedbackModal from "./ScholarlyFeedbackModal";
import toast from "react-hot-toast";

const apiMediaBase = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace("/api", "")
  .replace(/\/$/, "");
const resolveVideoSrc = (url) => (url?.startsWith("http") ? url : `${apiMediaBase}${url}`);

const titleFromFilename = (name) => {
  if (!name) return "Peer transmission";
  const base = name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
  return base || "Peer transmission";
};

const VideoCard = ({ video, onLike, onFeedback, isDark }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`${isDark ? "bg-[#0f1729] border-white/10" : "bg-white border-indigo-50 shadow-xl shadow-indigo-500/5"} border rounded-xl overflow-hidden group hover:border-nebula transition-all`}
  >
    <div className={`aspect-video relative ${isDark ? "bg-black" : "bg-slate-100"}`}>
      <video
        key={video.id}
        controls
        className="w-full h-full object-cover"
        poster={`https://ui-avatars.com/api/?name=${encodeURIComponent(video.title)}&background=random&size=320`}
        src={resolveVideoSrc(video.video_url)}
        onError={(e) => {
          console.error("Video playback error:", e);
          e.target.poster = "https://via.placeholder.com/320x180?text=Encryption+Error";
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
    <div className="p-4">
      <h4 className={`${isDark ? "text-white" : "text-slate-900"} font-bold text-sm line-clamp-1 mb-1`} title={video.title}>
        {video.title}
      </h4>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-5 h-5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
          <img
            alt=""
            src={video.avatar_url || `https://ui-avatars.com/api/?name=${video.author_name}&background=random`}
          />
        </div>
        <span className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-500"}`}>{video.author_name}</span>
      </div>
      <div
        className={`flex justify-between items-center text-[10px] font-mono border-t pt-2 ${isDark ? "text-white/30 border-white/5" : "text-slate-400 border-slate-100"}`}
      >
        <button
          onClick={() => !video.user_liked && onLike(video.id)}
          className={`flex items-center gap-1 transition-colors ${video.user_liked ? "text-red-500 cursor-default" : "hover:text-cyan-500"}`}
          disabled={video.user_liked}
        >
          {video.user_liked ? "❤️" : "🤍"} {video.likes || 18}
        </button>
        <button
          onClick={() => onFeedback(video)}
          className={`flex items-center gap-1 transition-colors ${video.isUploader ? "text-amber-400 hover:text-amber-300" : "hover:text-cyan-500"}`}
        >
          {video.is_uploader ? "📝 Add Note" : "💬 Feedback"}
        </button>
      </div>
      {video.uploader_note && (
        <div
          className={`mt-2 p-2 rounded-lg text-[9px] italic border-l-2 whitespace-pre-wrap break-words ${isDark ? "bg-white/5 border-amber-500 text-white/60" : "bg-amber-50 border-amber-500 text-amber-700"}`}
        >
          &quot; {video.uploader_note} &quot;
        </div>
      )}
    </div>
  </motion.div>
);

/**
 * Peer video vault for a course. Mount on CourseDetails (every course page).
 */
const KnowledgeExchange = ({ courseId, className = "" }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const loadVideos = async () => {
    if (!courseId || courseId === "undefined") return;
    try {
      const res = await api.get(`/videos/${courseId}`);
      setVideos(res.data || []);
    } catch (err) {
      console.error("[KnowledgeExchange] Failed to load videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadVideos();
  }, [courseId]);

  const openFilePicker = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type?.startsWith("video/")) {
      toast.error("Please select a video file.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading transmission...");

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("title", titleFromFilename(file.name));
    formData.append("videoFile", file);
    formData.append("description", "Uploaded from Scholar's Device");

    try {
      await api.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadVideos();
      toast.success("Transmission uploaded. +10 ASC awarded.", { id: toastId });
    } catch (err) {
      console.error("Upload Error Details:", err);
      const errorMsg = err.response?.data?.message || "Transmission failed.";
      toast.error(`DATA UPLINK FAILED: ${errorMsg}`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpdate = (updatedVideoData) => {
    if (updatedVideoData._deleted) {
      setVideos((prev) => prev.filter((v) => v.id !== updatedVideoData.id));
      if (selectedVideo?.id === updatedVideoData.id) {
        setSelectedVideo(null);
        setShowFeedback(false);
      }
      return;
    }

    setVideos((prev) =>
      prev.map((v) => (v.id === updatedVideoData.id ? { ...v, ...updatedVideoData } : v))
    );

    if (selectedVideo?.id === updatedVideoData.id) {
      setSelectedVideo((prev) => ({ ...prev, ...updatedVideoData }));
    }
  };

  if (!courseId) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className={`relative ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div
        className={`flex flex-col md:flex-row justify-between items-end mb-6 border-b pb-4 ${isDark ? "border-white/5" : "border-indigo-100"}`}
      >
        <div>
          <h2 className={`text-3xl font-black tracking-tighter mb-1 ${isDark ? "text-white" : "text-slate-950"}`}>
            Knowledge Exchange
          </h2>
          <p className={`${isDark ? "text-white/40" : "text-indigo-900/40"} text-xs font-bold uppercase tracking-widest`}>
            Peer-verified explanations. Earn +10 ASC.
          </p>
        </div>
        <button
          onClick={openFilePicker}
          disabled={uploading}
          className="px-6 py-2 bg-nebula text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg hover:scale-105 transition-all mt-4 md:mt-0 disabled:opacity-50 disabled:hover:scale-100"
        >
          {uploading ? "Uploading..." : "+ Upload Transmission"}
        </button>
      </div>

      {loading ? (
        <div className={`text-center py-12 text-xs font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>
          Synchronizing transmissions...
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isDark={isDark}
              onLike={async (videoId) => {
                try {
                  await api.post(`/videos/${videoId}/like`);
                  setVideos((prev) =>
                    prev.map((v) =>
                      v.id === videoId
                        ? { ...v, likes: (v.likes || 0) + 1, user_liked: true }
                        : v
                    )
                  );
                } catch (err) {
                  console.error("Failed to like video:", err);
                }
              }}
              onFeedback={(v) => {
                setSelectedVideo(v);
                setShowFeedback(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className={`${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200"} border border-dashed rounded-3xl p-12 text-center opacity-70`}
        >
          <div className="text-4xl mb-4 text-indigo-400">📡</div>
          <h3 className={`font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>No Transmissions Detected</h3>
          <p className={`${isDark ? "text-white/40" : "text-slate-500"} text-sm mb-6 max-w-sm mx-auto`}>
            Be the first to establish a knowledge uplink for this sector.
          </p>
          <button
            onClick={openFilePicker}
            disabled={uploading}
            className="text-cyan-400 border-b border-cyan-400 text-xs font-bold uppercase tracking-widest pb-1 hover:text-white hover:border-white transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Initialize First Upload"}
          </button>
        </div>
      )}

      {showFeedback && selectedVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <ScholarlyFeedbackModal
            videoData={selectedVideo}
            isOwner={selectedVideo.is_uploader}
            onUpdate={handleVideoUpdate}
            onClose={() => {
              setShowFeedback(false);
              setSelectedVideo(null);
            }}
          />
        </div>
      )}
    </motion.section>
  );
};

export default KnowledgeExchange;
