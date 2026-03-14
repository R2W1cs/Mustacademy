
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck, AlertTriangle, Play, CheckCircle,
    ChevronRight, BookOpen, BrainCircuit, History
} from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";

export default function ExamPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [examMode, setExamMode] = useState("Midterm"); // Midterm | Final
    const [allTopics, setAllTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);

    const [readinessVerdict, setReadinessVerdict] = useState(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch all courses relevant to the user's current academic stage
                const res = await api.get("/courses/recommended");
                setCourses(res.data.courses || []);
            } catch (err) {
                console.error("Failed to fetch curriculum courses", err);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            const fetchTopics = async () => {
                setIsLoadingTopics(true);
                try {
                    const res = await api.get(`/courses/${selectedCourse.id}/topics`);
                    setAllTopics(res.data);
                    setSelectedTopics(res.data.map(t => t.title)); // Default all selected
                } catch (err) {
                    console.error("Failed to fetch topics", err);
                } finally {
                    setIsLoadingTopics(false);
                }
            };
            fetchTopics();
            setReadinessVerdict(null); // Reset audit when course changes
        }
    }, [selectedCourse]);

    const handleTopicToggle = (title) => {
        if (selectedTopics.includes(title)) {
            setSelectedTopics(selectedTopics.filter(t => t !== title));
        } else {
            setSelectedTopics([...selectedTopics, title]);
        }
        setReadinessVerdict(null);
    };

    const runReadinessAudit = async () => {
        if (!selectedCourse) return;
        setIsAuditing(true);
        try {
            const res = await api.get(`/exams/readiness/${selectedCourse.id}`);
            setReadinessVerdict(res.data);
        } catch (err) {
            console.error("Audit failed", err);
        } finally {
            setIsAuditing(false);
        }
    };

    const startExam = () => {
        navigate("/exams/session", {
            state: {
                courseId: selectedCourse.id,
                courseName: selectedCourse.name,
                mode: examMode,
                topics: examMode === 'Final' ? allTopics.map(t => t.title) : selectedTopics
            }
        });
    };

    const cardClass = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200 shadow-sm";
    const textMain = isDark ? "text-white" : "text-slate-900";
    const textMuted = isDark ? "text-gray-400" : "text-slate-500";

    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto pb-24">
            <header className="mb-12 border-b border-white/5 pb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 group">
                            <ShieldCheck size={28} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] block mb-1">Academic Enforcement</span>
                            <h1 className={`text-4xl font-black ${textMain} tracking-tight uppercase`}>Proficiency Examination</h1>
                        </div>
                    </div>
                </div>
                <p className={`${textMuted} max-w-2xl text-sm leading-relaxed`}>
                    Execute high-fidelity diagnostic simulations. AI-monitored environment with biometric validation enabled.
                    <span className="text-purple-400/60 ml-2 font-mono">Status: Secure Layer Active.</span>
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selection Section */}
                <div className="lg:col-span-2 space-y-6">
                    <section className={`p-6 border rounded-2xl ${cardClass}`}>
                        <h2 className={`text-lg font-bold mb-4 flex items-center ${textMain}`}>
                            <BookOpen className="mr-2 text-purple-500" size={20} />
                            Select Academic Course
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {courses.length > 0 ? (
                                courses.map(course => (
                                    <button
                                        key={course.id}
                                        onClick={() => setSelectedCourse(course)}
                                        className={`p-4 text-left border rounded-xl transition-all ${selectedCourse?.id === course.id
                                            ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500"
                                            : `${isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-slate-100 hover:bg-slate-50'}`
                                            }`}
                                    >
                                        <p className={`font-bold ${textMain}`}>{course.name}</p>
                                        <p className="text-xs text-purple-400 mt-1 uppercase font-black">Semester {course.semester_number}</p>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-800 rounded-xl">
                                    <AlertTriangle className="mx-auto text-yellow-600 mb-2" size={24} />
                                    <p className={`text-sm ${textMuted}`}>No enrolled courses detected.</p>
                                    <button
                                        onClick={() => navigate('/courses')}
                                        className="mt-4 text-xs font-black text-purple-400 uppercase tracking-widest hover:text-purple-300"
                                    >
                                        Go to Curriculum Map →
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {selectedCourse && (
                        <section className={`p-6 border rounded-2xl ${cardClass} animate-in fade-in slide-in-from-bottom-4`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-lg font-bold flex items-center ${textMain}`}>
                                    <BrainCircuit className="mr-2 text-purple-500" size={20} />
                                    Examination Parameters
                                </h2>
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                    {["Midterm", "Final"].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setExamMode(m)}
                                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${examMode === m
                                                ? "bg-purple-600 text-white shadow-lg"
                                                : "text-gray-500 hover:text-gray-300"
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {examMode === "Midterm" ? (
                                <div>
                                    <p className={`text-sm mb-4 ${textMuted}`}>Select topics to include in this diagnostic simulation:</p>
                                    {isLoadingTopics ? (
                                        <div className="h-20 animate-pulse bg-gray-800 rounded-lg"></div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {allTopics.map(topic => (
                                                <div
                                                    key={topic.id}
                                                    onClick={() => handleTopicToggle(topic.title)}
                                                    className={`p-3 border rounded-lg cursor-pointer flex items-center space-x-3 transition-all ${selectedTopics.includes(topic.title)
                                                        ? "border-purple-500 bg-purple-500/5"
                                                        : "border-gray-800 opacity-60 hover:opacity-100"
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedTopics.includes(topic.title)
                                                        ? "bg-purple-600 border-purple-600 text-white"
                                                        : "border-gray-600"
                                                        }`}>
                                                        {selectedTopics.includes(topic.title) && <CheckCircle size={12} />}
                                                    </div>
                                                    <span className={`text-sm ${textMain}`}>{topic.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl flex items-start space-x-3">
                                    <History className="text-purple-400 mt-1" size={20} />
                                    <div>
                                        <p className={`font-bold ${textMain}`}>Comprehensive Final Protocol</p>
                                        <p className={`text-xs ${textMuted}`}>This exam covers the entire curriculum architecture. All topics are mandatory.</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </div>

                {/* Audit Sidebar */}
                <div className="space-y-6">
                    <section className={`p-6 border rounded-2xl ${cardClass} flex flex-col h-full min-h-[400px]`}>
                        <h2 className={`text-lg font-bold mb-6 ${textMain}`}>Readiness Audit</h2>

                        {!readinessVerdict ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-700 rounded-xl">
                                <ShieldCheck size={48} className="text-gray-700 mb-4" />
                                <p className={`text-sm ${textMuted} mb-6`}>
                                    The Professor must audit your intellectual status before exam clearance is granted.
                                </p>
                                <button
                                    onClick={runReadinessAudit}
                                    disabled={!selectedCourse || isAuditing}
                                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${selectedCourse && !isAuditing
                                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-500/20"
                                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {isAuditing ? (
                                        <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div> AUDITING...</span>
                                    ) : "RUN READINESS AUDIT"}
                                </button>
                            </div>
                        ) : (
                            <div className="flex-grow animate-in zoom-in-95 duration-300">
                                <div className={`p-4 rounded-xl mb-4 border-l-4 ${readinessVerdict.verdict === 'READY' ? 'bg-green-500/10 border-green-500' :
                                    readinessVerdict.verdict === 'WARNED' ? 'bg-yellow-500/10 border-yellow-500' :
                                        'bg-red-500/10 border-red-500'
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-black uppercase tracking-widest ${readinessVerdict.verdict === 'READY' ? 'text-green-500' :
                                            readinessVerdict.verdict === 'WARNED' ? 'text-yellow-500' :
                                                'text-red-500'
                                            }`}>
                                            Verdict: {readinessVerdict.verdict}
                                        </span>
                                        {readinessVerdict.verdict === 'READY' ? <CheckCircle className="text-green-400" size={16} /> : <AlertTriangle className="text-red-400" size={16} />}
                                    </div>
                                    <p className={`text-sm italic leading-relaxed ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>"{readinessVerdict.professor_quote}"</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <p className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>Professor's Notes</p>
                                    <p className={`text-sm leading-relaxed ${textMuted}`}>{readinessVerdict.reasoning}</p>
                                    {readinessVerdict.gaps?.length > 0 && (
                                        <div>
                                            <p className="text-[10px] text-red-400 font-black mb-2 uppercase tracking-tighter">Intellectual Gaps Detected</p>
                                            <div className="flex flex-wrap gap-2">
                                                {readinessVerdict.gaps.map(gap => (
                                                    <span key={gap} className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] rounded font-bold">{gap}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={startExam}
                                    className="w-full py-4 gradient-purple rounded-xl font-bold text-white shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>INITIALIZE SIMULATION</span>
                                    <Play size={18} fill="white" />
                                </button>
                                <p className="text-[10px] text-center text-gray-500 mt-4 uppercase font-bold tracking-widest">Foundational Enforcement: ON</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
