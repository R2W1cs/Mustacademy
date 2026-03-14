import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRecommendedCourses } from "../api/courses";
import CourseCard from "../components/CourseCard";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Sparkles, BookOpen, Search, Shield, Cpu, Globe, Binary } from "lucide-react";
import { useTheme } from "../auth/ThemeContext";

const Courses = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const loadData = async () => {
        try {
            const res = await getRecommendedCourses();
            setData(res.data);
        } catch (err) {
            console.error("Failed to load courses data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen overflow-hidden transition-colors duration-700 ${isDark ? 'bg-[#0B0F19]' : 'bg-slate-50'}`}>
                <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)] opacity-40' : 'bg-[radial-gradient(circle_at_center,_#fff_0%,_#f8fafc_100%)]'}`} />
                <div className="relative flex flex-col items-center gap-12">
                    {/* Hyper-Advanced Loading UI */}
                    <div className="relative w-40 h-40">
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 border-t-2 border-b-2 border-amber-500/30 rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-6 border-r-2 border-slate-500/30 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center translate-z-10">
                            <BookOpen className={`animate-pulse w-10 h-10 ${isDark ? 'text-amber-500' : 'text-red-600'}`} />
                        </div>
                    </div>
                    <div className="text-center z-10">
                        <p className={`text-[12px] font-black uppercase tracking-[1.2em] mb-4 animate-pulse ${isDark ? 'text-white' : 'text-slate-900'}`}>Initializing Hyperspace Link</p>
                        <div className="flex gap-3 justify-center">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                    className={`w-2 h-2 rounded-full ${isDark ? 'bg-amber-500' : 'bg-red-600'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.courses.length === 0) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-700 ${isDark ? '' : 'bg-slate-50'}`}>
                {/* Iridescent Background Blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] animate-nebula-float" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`relative studio-card p-24 text-center max-w-4xl w-full border glass-morphism overflow-hidden transition-all duration-700 ${isDark ? 'border-white/10' : 'border-indigo-500/5 shadow-[0_20px_50px_rgba(0,0,0,0.05)]'}`}
                >
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-magenta-500/5 blur-[100px]" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-28 h-28 rounded-3xl border flex items-center justify-center mb-10 transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10 text-cyan-400 shadow-[0_0_40px_rgba(0,242,255,0.2)]' : 'bg-white/50 border-white text-red-600 shadow-lg shadow-red-100 glass-morphism'}`}>
                            <Shield size={56} className="animate-pulse" />
                        </div>
                        <h1 className={`text-7xl font-black tracking-tightest mb-8 uppercase leading-[0.85] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Protocol <br /> <span className="text-nebula">Unauthorized</span>
                        </h1>
                        <p className={`text-lg font-medium max-w-xl mx-auto leading-relaxed mb-12 uppercase tracking-wide opacity-80 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Vocal & DNA signatures not detected in the <span className={isDark ? 'text-white' : 'text-slate-900'}>Celestial Archive</span>. <br />
                            Synthesize your academic identity to proceed.
                        </p>
                        <button
                            onClick={() => navigate('/profile/setup')}
                            className={`group relative px-14 py-6 overflow-hidden font-black text-[12px] uppercase tracking-[0.4em] rounded-[1.5rem] transition-all hover:scale-[1.05] active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}
                        >
                            <div className={`absolute inset-0 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ${isDark ? 'bg-gradient-to-r from-cyan-400 via-violet-500 to-magenta-500' : 'bg-gradient-to-r from-red-600 via-red-700 to-slate-900'}`} />
                            <span className={`relative z-10 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>Generate Identity Protocol</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pb-48 relative overflow-hidden transition-colors duration-700 ${isDark ? 'selection:bg-cyan-500/30' : 'bg-slate-50 selection:bg-red-500/30'}`}>

            {/* AMBIENT CELESTIAL ELEMENTS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-slate-800/5 blur-[120px] rounded-full opacity-20" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-500/5 blur-[120px] rounded-full opacity-20" />
            </div>

            {/* JAW-DROPPING HERO SECTION */}
            <div className="max-w-[1800px] mx-auto mb-48 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-24">
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            className="flex items-center gap-8 mb-16"
                        >
                            <div className={`h-px w-24 bg-gradient-to-r to-transparent ${isDark ? 'from-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'from-red-600'}`} />
                            <span className={`text-[13px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-amber-500 opacity-80' : 'text-red-700 opacity-90'}`}>Curriculum Registry</span>
                        </motion.div>

                        <div className="relative">
                            <motion.h1
                                initial={{ opacity: 0, y: 60 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                                className={`text-[6rem] lg:text-[8rem] font-serif font-medium leading-[0.9] tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-900'}`}
                            >
                                Personal <br />
                                <span className={`italic font-serif ${isDark ? 'text-amber-500' : 'text-red-600'}`}>Library</span>
                            </motion.h1>

                            {/* Ghost Floating Icon */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 0.05, scale: 1.5 }}
                                transition={{ duration: 2, delay: 0.5 }}
                                className="absolute -top-20 -right-40 pointer-events-none"
                            >
                                <BookOpen size={400} className={isDark ? "text-white" : "text-slate-300"} strokeWidth={0.5} />
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center gap-16 mt-20"
                        >
                            <div className="flex -space-x-5">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 1 + (i * 0.1) }}
                                        className={`w-14 h-14 rounded-full border-4 overflow-hidden relative group ${isDark ? 'border-[#0a0e1a] bg-slate-900' : 'border-white bg-slate-100'}`}
                                    >
                                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i + 987}`} alt="Scholar" className="transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center text-[10px] font-black ${isDark ? 'border-[#0a0e1a] bg-slate-800 text-slate-400' : 'border-white bg-slate-200 text-slate-600'}`}>
                                    +12
                                </div>
                            </div>
                            <div>
                                <p className={`font-black text-2xl tracking-tighter leading-none mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Join the Library</p>
                                <p className={`text-[10px] uppercase font-black tracking-[0.4em] ${isDark ? 'text-amber-500/60' : 'text-red-700/60'}`}>System Is Waiting For You</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Futuristic Stats Panel */}
                    <div className="grid grid-cols-2 gap-8 w-full lg:w-[500px]">
                        <motion.div
                            whileHover={{ y: -5, scale: 1.02 }}
                            className={`glass-morphism p-8 flex flex-col justify-between h-56 group transition-all duration-500 ${isDark ? '' : 'border-indigo-500/5 shadow-sm'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-amber-500/20 transition-all border ${isDark ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/5 text-red-600 border-red-500/10'}`}>
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Academic Year</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>0{data.year || 2}</span>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-amber-500' : 'bg-red-600'}`} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5, scale: 1.02 }}
                            className={`glass-morphism p-8 flex flex-col justify-between h-56 group transition-all duration-500 ${isDark ? '' : 'border-indigo-500/5 shadow-sm'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500/20' : 'bg-red-500/5 text-red-600 border-red-500/10 group-hover:bg-red-500/10'}`}>
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Active Modules</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.courses.length}</span>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-indigo-500' : 'bg-red-600'}`} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className={`col-span-2 glass-morphism p-8 overflow-hidden relative group transition-all duration-700 ${isDark ? '' : 'border-indigo-500/5 shadow-sm'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />

                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <h4 className={`font-black uppercase text-xs tracking-[0.3em] mb-3 flex items-center gap-4 ${isDark ? 'text-amber-500' : 'text-red-700'}`}>
                                        <div className="flex gap-1">
                                            <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-amber-500' : 'bg-red-600'}`} />
                                            <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-amber-500/30' : 'bg-red-600/30'}`} />
                                            <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-amber-500/30' : 'bg-red-600/30'}`} />
                                        </div>
                                        Mission Status
                                    </h4>
                                    <p className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Optimal Learning Curve Detected
                                    </p>
                                </div>

                                <div className="flex gap-3 items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                scale: [1, 1.4, 1],
                                                opacity: [0.3, 1, 0.3],
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                            className={`w-1 h-1 rounded-full ${isDark ? 'bg-amber-500' : 'bg-red-600'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* CURATED ASYMMETRIC GRID */}
            <div className="max-w-[1800px] mx-auto py-20 border-t relative z-10 transition-colors duration-700 border-white/5">
                <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-12">
                    <div className="flex items-center gap-10">
                        <h2 className={`text-4xl font-black uppercase tracking-[0.6em] whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>Courses</h2>
                        <div className={`h-px w-64 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    </div>
                </div>

                {/* ASYMMETRIC GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16">
                    {data.courses.map((course, idx) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: idx * 0.15 }}
                            className={idx % 2 === 1 ? 'md:translate-y-16' : ''}
                        >
                            <CourseCard course={course} index={idx} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* FOOTER: TERMINAL PROTOCOL */}
            <footer className={`max-w-full mx-auto mt-72 text-center relative border-t pt-24 pb-24 transition-colors duration-700 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <motion.div
                    whileInView={{ opacity: [0, 1] }}
                    className="relative z-10"
                >
                    <div className={`mt-12 flex justify-between items-center px-12 text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span>Celestial Navigation Protocol</span>
                        <span className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-cyan-500/20' : 'bg-red-500/20'}`} />
                            Standard Encryption Active
                        </span>
                        <span>© {new Date().getFullYear()} CS Platform</span>
                    </div>
                </motion.div>
            </footer>
        </div>
    );
};

export default Courses;
