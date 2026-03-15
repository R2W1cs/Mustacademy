import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";
import { ChevronLeft, AlertTriangle } from "lucide-react";

const CourseDetails = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const loadData = async () => {
    try {
      const [courseRes, topicsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/topics/progress`)
      ]);

      console.log(`[CourseDetails] Data loaded for id=${id}`, { course: courseRes.data, topics: topicsRes.data });
      setCourse(courseRes.data);
      setTopics(topicsRes.data);
    } catch (err) {
      console.error(`[CourseDetails] Error loading data for id=${id}:`, err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load course repository");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== "undefined") {
      loadData();
    }
  }, [id]);

  const toggleTopic = async (topicId) => {
    try {
      await api.post("/courses/topics/toggle", { topicId });
      loadData();
    } catch (err) {
      console.error("Topic toggle failed", err);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen transition-colors duration-700 ${isDark ? '' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-6">
          <div className={`w-16 h-16 border-4 rounded-full animate-spin ${isDark ? 'border-indigo-500/20 border-t-indigo-500' : 'border-slate-200 border-t-indigo-500'}`} />
          <p className={`text-[10px] font-black uppercase tracking-widest animate-pulse ${isDark ? 'text-indigo-400' : 'text-slate-500'}`}>Synchronizing Neural Links</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10">
        <div className={`studio-card p-20 text-center max-w-2xl w-full border border-red-500/20 bg-red-500/5 text-red-500 font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <AlertTriangle size={48} className="mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-black uppercase mb-4 tracking-tighter">System Error: 404</h2>
          <p className="text-sm opacity-80 mb-8">{error || "Course Repository Offline"}</p>
          <Link to="/library" className="px-8 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors">
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = topics.filter(t => t.completed).length;
  const progressPercent = topics.length === 0 ? 0 : Math.round((completedCount / topics.length) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-700 pb-32 relative overflow-hidden selection:bg-indigo-500/30 ${isDark ? '' : 'bg-slate-50'}`}>
      <div className="max-w-[1800px] mx-auto space-y-16 animate-fade-in relative z-10">
        <Link
          to="/library"
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-10 transition-colors ${isDark ? 'text-indigo-400 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}
        >
          <ChevronLeft size={16} />
          Archive Registry
        </Link>
        {/* COMMAND CENTER HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-20 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-0.5 bg-indigo-500" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mastery Protocol Active</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-6xl md:text-7xl font-black tracking-tightest leading-tight ${isDark ? 'text-white outline-glow' : 'text-slate-900'}`}
            >
              {course.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-xl font-medium tracking-tight mt-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              {course.description}
            </motion.p>
          </div>

          <div className="flex flex-col items-end gap-6">
            <div className={`flex items-center gap-4 px-8 py-4 rounded-[1.5rem] border ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white border-slate-200 shadow-md'}`}>
              <span className="text-xl">🎓</span>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Scholarly Access Active</span>
            </div>

            <div className={`studio-card p-8 min-w-[300px] border ${isDark ? 'border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="flex justify-between items-end mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Synaptic Mastery</span>
                <span className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{progressPercent}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden p-0.5 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-indigo-500 rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ROADMAP */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 via-indigo-500/10 to-transparent lg:-translate-x-1/2" />

          <div className="space-y-12 relative z-10">
            {topics.length === 0 ? (
              <div className="studio-card p-12 text-center text-slate-500 font-bold italic tracking-widest uppercase text-[10px]">
                Module contents pending authorization...
              </div>
            ) : (
              topics.map((topic, idx) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col lg:flex-row items-center gap-12 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Topic Content Card */}
                  <div className={`flex-1 w-full lg:max-w-md ${idx % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className={`studio-card p-8 group transition-all border ${isDark ? 'border-white/10 hover:border-indigo-500/30' : 'bg-white border-slate-200 hover:border-indigo-500/50 shadow-lg'}`}>
                      <div className={`flex items-center gap-4 mb-4 ${idx % 2 === 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Ref. 0{idx + 1}</span>
                        <div className={`h-px flex-1 transition-all ${isDark ? 'bg-white/5 group-hover:bg-indigo-500/20' : 'bg-slate-100 group-hover:bg-indigo-500/20'}`} />
                      </div>
                      <h3 className={`text-2xl font-black tracking-tight mb-4 transition-colors ${isDark ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                        {topic.title}
                      </h3>

                      <div className={`flex flex-wrap gap-2 mb-6 ${idx % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                        <span className="text-[8px] font-black px-2 py-1 rounded bg-white/5 text-slate-400 uppercase tracking-widest">
                          Tier: {topic.importance_level}
                        </span>
                        {topic.completed ? (
                          <span className="text-[8px] font-black px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/20 shadow-lg">
                            Synthesized
                          </span>
                        ) : (
                          <span className="text-[8px] font-black px-2 py-1 rounded bg-orange-500/10 text-orange-400 uppercase tracking-widest border border-orange-500/20">
                            Pending Research
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center gap-4 ${idx % 2 === 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                        <Link
                          to={`/topics/${topic.id}`}
                          className={`text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl border transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/5' : 'bg-amber-400 text-amber-950 hover:bg-amber-500 border-amber-400 shadow-lg shadow-amber-200'}`}
                        >
                          Deep Dive Protocol
                        </Link>
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${topic.completed ? 'bg-emerald-500 text-white shadow-lg' : (isDark ? 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200')}`}
                        >
                          {topic.completed ? '✓' : '○'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-2xl relative z-10 border-2 transition-all duration-500 ${topic.completed ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse' : (isDark ? 'bg-slate-900 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-500')}`}
                    >
                      {idx + 1}
                    </motion.div>
                    {topic.completed && (
                      <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 scale-150 animate-pulse pointer-events-none" />
                    )}
                  </div>

                  {/* Empty Space for balancing the roadmap */}
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;

