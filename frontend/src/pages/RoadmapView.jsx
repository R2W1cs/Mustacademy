import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { getCareerRoadmap, generateTrajectory } from "../api/career";
import { useTheme } from "../auth/ThemeContext";

/** Client-side fallback when API career_usefulness is missing. */
const COURSE_CONTEXT = {
    default: {
        useful_for: 'This course builds durable technical foundations that transfer into engineering roles across the industry.',
        necessity: 'Focus here to close a core competency gap—the concepts recur in interviews, internships, and production work.',
        careers: ['Software Engineer'],
    },
};

const resolveCareerUsefulness = (course) => {
    const fromApi = course?.career_usefulness;
    if (fromApi?.useful_for && fromApi?.necessity) {
        return {
            useful_for: fromApi.useful_for,
            necessity: fromApi.necessity,
            careers: fromApi.careers?.length
                ? fromApi.careers
                : (course?.careers || []).map((c) => c.name || c).filter(Boolean),
        };
    }
    const linked = (course?.careers || []).map((c) => c.name || c).filter(Boolean);
    return {
        ...COURSE_CONTEXT.default,
        useful_for: course?.description && !/^Credits:\s*\d+/i.test(course.description)
            ? course.description
            : COURSE_CONTEXT.default.useful_for,
        careers: linked.length ? linked : COURSE_CONTEXT.default.careers,
    };
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
    const [roadmapData, setRoadmapData] = useState(null);
    const [forging, setForging] = useState(false);

    const loadData = async () => {
        try {
            if (isCareerMode) {
                const res = await getCareerRoadmap();
                setRoadmapData(res.data);
                setCourse({ name: res.data.target_job });
            } else {
                const [courseRes, topicsRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get(`/courses/${id}/topics/progress`)
                ]);
                setCourse(courseRes.data);
                setRoadmapData({ steps: topicsRes.data });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    const careerUsefulness = !isCareerMode ? resolveCareerUsefulness(course) : null;

    return (
        <div className={`min-h-screen p-0 font-sans relative overflow-hidden transition-colors duration-700 ${isDark ? 'bg-[#0a0e1a] text-slate-200' : 'bg-gradient-to-br from-white via-indigo-50/30 to-white text-slate-900'}`}>
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full pt-8 px-8 md:px-12 pb-16">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 text-center"
                >
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-center mb-6">
                        <button
                            onClick={() => navigate(isCareerMode ? '/courses' : `/courses/${id}`)}
                            className={`text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                        >
                            ← {isCareerMode ? 'Return to Library' : 'Back to course'}
                        </button>
                        {isCareerMode && (
                            <button
                                disabled={forging}
                                onClick={handleRegenerate}
                                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors flex items-center gap-2 border border-indigo-500/20 px-4 py-1.5 rounded-lg bg-indigo-500/5 disabled:opacity-50"
                            >
                                {forging ? "🔄 Updating…" : "🔄 Recalculate path"}
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

                {/* 1. CAREER USEFULNESS (Course Mode) */}
                {!isCareerMode && careerUsefulness && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    >
                        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-indigo-100 shadow-lg shadow-indigo-500/5'} backdrop-blur-xl border p-8 rounded-[2rem] relative group overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">Career Usefulness</h3>
                            <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {careerUsefulness.useful_for}
                            </p>
                        </div>

                        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-indigo-100 shadow-lg shadow-indigo-500/5'} backdrop-blur-xl border p-8 rounded-[2rem] relative group overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">Why It Matters</h3>
                            <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {careerUsefulness.necessity}
                            </p>
                        </div>

                        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-indigo-100 shadow-lg shadow-indigo-500/5'} backdrop-blur-xl border p-8 rounded-[2rem] relative group overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">Careers That Benefit</h3>
                            <div className="flex flex-wrap gap-2 relative z-10">
                                {(careerUsefulness.careers || []).map((name) => (
                                    <span
                                        key={name}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-[#0a0e1a] border-indigo-500/30 text-white' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}
                                    >
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Career-mode hook cards (unchanged generic framing) */}
                {isCareerMode && (
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
                )}

                {/* 2. THE JOURNEY (Timeline) */}
                <div className="relative mb-6">
                    <div className={`absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block ${isDark ? 'bg-white/10' : 'bg-indigo-100'}`} />

                    <div className="space-y-8">
                        {(isCareerMode ? (roadmapData?.roadmap_steps_json || []) : (roadmapData?.steps || [])).map((step, i) => (
                            <motion.div
                                key={step.id || i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                            >
                                <div className="flex-1 w-full">
                                    <div
                                        role={!isCareerMode && step.id ? 'button' : undefined}
                                        tabIndex={!isCareerMode && step.id ? 0 : undefined}
                                        onClick={() => {
                                            if (!isCareerMode && step.id) navigate(`/topics/${step.id}`);
                                        }}
                                        onKeyDown={(e) => {
                                            if (!isCareerMode && step.id && (e.key === 'Enter' || e.key === ' ')) {
                                                e.preventDefault();
                                                navigate(`/topics/${step.id}`);
                                            }
                                        }}
                                        className={`${isDark ? 'bg-[#0f1729] border-white/10' : 'bg-white border-indigo-50 shadow-xl shadow-indigo-500/5'} border p-6 rounded-[2rem] hover:border-indigo-500/50 transition-all group relative ${!isCareerMode && step.id ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

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
                                            {isCareerMode
                                                ? String(step.description || '')
                                                : `A critical pillar of ${course.name}. Mastery requires exact technical precision and conceptual clarity.`}
                                        </p>
                                        {!isCareerMode && step.id && (
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Open lesson →
                                            </p>
                                        )}

                                        {isCareerMode && (
                                            <div className={`space-y-6 border-t pt-6 mt-6 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
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

                                                <div>
                                                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                                        Preparation Sequence
                                                    </p>
                                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-white/50 leading-relaxed font-mono">
                                                        {step.preparation_task}
                                                    </div>
                                                </div>

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

                                <div className={`relative z-10 hidden md:flex items-center justify-center w-16 h-16 border-2 rounded-full shadow-lg group ${isDark ? 'bg-[#0a0e1a] border-indigo-500' : 'bg-white border-indigo-500'}`}>
                                    <span className="text-white font-black text-lg">{i + 1}</span>
                                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
                                </div>

                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RoadmapView;
