
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Clock, Save, Send, AlertCircle, ShieldAlert,
    ChevronLeft, ChevronRight, CheckCircle, Search
} from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";

export default function ExamSession() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId, courseName, mode, topics } = location.state || {};

    const [exam, setExam] = useState(null);
    const [timeLeft, setTimeLeft] = useState(7200); // 120 minutes in seconds
    const [isGenerating, setIsGenerating] = useState(true);
    const [activeSection, setActiveSection] = useState("MCQ"); // MCQ | SHORT | CASE
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);

    // Integrity Protocol State
    const [tabSwitches, setTabSwitches] = useState(0);
    const [isFlagged, setIsFlagged] = useState(false);

    // Answers State
    const [answers, setAnswers] = useState({
        mcqs: {},
        short_answers: {},
        case_study: ""
    });

    useEffect(() => {
        if (!courseId) {
            navigate("/exams");
            return;
        }

        const fetchExam = async () => {
            try {
                const res = await api.post("/exams/generate", { courseId, mode, selectedTopics: topics });

                let examData = res.data;

                // Fallback: If backend returned a stringified JSON in 'reply', try to parse it
                if (examData && examData.reply && typeof examData.reply === 'string') {
                    try {
                        const parsedReply = JSON.parse(examData.reply);
                        if (parsedReply.mcqs) {
                            examData = parsedReply;
                        }
                    } catch (e) {
                        console.warn("Frontend failed to rescue JSON from reply:", e);
                    }
                }

                // Validate exam structure
                if (!examData || (!examData.mcqs && !examData.reply)) {
                    throw new Error("Invalid exam data received from faculty.");
                }

                setExam(examData);
            } catch (err) {
                console.error("Exam generation failed", err);
                setExam({
                    error: true,
                    message: err.response?.data?.message || err.message || "Failed to establish simulation uplink."
                });
            } finally {
                setIsGenerating(false);
            }
        };
        fetchExam();

        // Anti-Plagiarism: Monitor Visibility
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => prev + 1);
            }
        };

        const handlePaste = (e) => {
            e.preventDefault();
            setIsFlagged(true);
            alert("INTEGRITY ALERT: Manual input is mandatory. Copy-paste protocol detected and logged.");
        };

        const handleContextMenu = (e) => e.preventDefault();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("paste", handlePaste);
        document.addEventListener("contextmenu", handleContextMenu);

        // Timer
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("paste", handlePaste);
            document.removeEventListener("contextmenu", handleContextMenu);
            clearInterval(timer);
        };
    }, [courseId]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleMcqSelect = (qid, index) => {
        setAnswers({
            ...answers,
            mcqs: { ...answers.mcqs, [qid]: index }
        });
    };

    const handleShortAnswerChange = (qid, text) => {
        setAnswers({
            ...answers,
            short_answers: { ...answers.short_answers, [qid]: text }
        });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await api.post("/exams/submit", {
                responses: answers,
                examTitle: exam.title,
                examContext: exam, // Send full context for AI grader
                integrityFlags: { tabSwitches, manualPaste: isFlagged }
            });
            setSubmissionResult(res.data);
            setIsCompleted(true);
        } catch (err) {
            console.error("Submission failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... isGenerating block ...

    if (isCompleted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
                <div className={`max-w-4xl w-full p-10 border rounded-3xl text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
                    {submissionResult?.success === false ? (
                        <>
                            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/10">
                                <ShieldAlert size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-red-500 mb-4 uppercase italic">Simulation Terminated</h2>
                            <p className="text-red-400 font-bold mb-6 italic">{submissionResult.message}</p>
                            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl text-left mb-8">
                                <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-3 flex items-center">
                                    <Search size={14} className="mr-2" /> Auditor Analysis
                                </p>
                                <p className="text-sm text-gray-400 leading-relaxed italic">{submissionResult.audit.reasoning}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-offset-4 ring-offset-black ${submissionResult?.grade?.verdict === 'FAIL' ? 'bg-red-500 text-white ring-red-500' : 'bg-green-500 text-white ring-green-500'}`}>
                                <span className="text-5xl font-black italic">{submissionResult?.grade?.letter_grade || "-"}</span>
                            </div>

                            <h2 className={`text-4xl font-black mb-2 uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {submissionResult?.grade?.verdict === 'FAIL' ? 'FAIL' : 'PASS'}
                            </h2>
                            <p className="text-gray-500 font-bold mb-8 uppercase text-sm tracking-widest">
                                Score: {submissionResult?.grade?.total_score || 0}/100
                            </p>

                            <div className="bg-gray-800/50 p-6 rounded-2xl text-left mb-8 border border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-purple-400 font-black uppercase text-xs tracking-widest">Faculty Verdict</h3>
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${submissionResult?.audit?.integrity_score < 70 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        Integrity: {submissionResult?.audit?.integrity_score || 0}%
                                    </span>
                                </div>
                                <p className="text-gray-300 italic text-sm leading-relaxed">
                                    "{submissionResult?.grade?.summary_feedback || "No feedback provided."}"
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-800">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">MCQ</p>
                                    <p className="text-xl font-black text-white">{submissionResult?.grade?.section_scores?.mcq?.score || 0}/{submissionResult?.grade?.section_scores?.mcq?.total || 0}</p>
                                </div>
                                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-800">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Short Answer</p>
                                    <p className="text-xl font-black text-white">{submissionResult?.grade?.section_scores?.short_answer?.score || 0}/{submissionResult?.grade?.section_scores?.short_answer?.total || 0}</p>
                                </div>
                                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-800">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Case Study</p>
                                    <p className="text-xl font-black text-white">{submissionResult?.grade?.section_scores?.case_study?.score || 0}/{submissionResult?.grade?.section_scores?.case_study?.total || 0}</p>
                                </div>
                            </div>
                        </>
                    )}
                    <button
                        onClick={() => navigate("/exams")}
                        className="w-full py-4 gradient-purple rounded-xl font-bold text-white shadow-xl shadow-purple-500/30"
                    >
                        RETURN TO EXAMINATION DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    if (isGenerating || !exam) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black">
                <div className="flex flex-col items-center animate-pulse">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Generating Protocol</h2>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                        Neural Uplink Established... Compiling Simulation
                    </p>
                </div>
            </div>
        );
    }

    const cardClass = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200 shadow-sm";
    const textMain = isDark ? "text-white" : "text-slate-900";
    const textMuted = isDark ? "text-gray-400" : "text-slate-500";

    return (
        <div className="min-h-screen flex flex-col bg-black overflow-hidden select-none">
            {/* Simulation Header */}
            <header className="h-[70px] bg-gray-950 border-b border-gray-800 px-6 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4">
                    <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded animate-pulse tracking-widest shadow-lg">LIVE SESSION</div>
                    <div>
                        <h1 className="text-white font-black uppercase italic text-sm tracking-tighter leading-none">{exam.title}</h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">First Principles Protocol</p>
                    </div>
                </div>

                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Simulation Time Remaining</span>
                            <span className={`text-xl font-black tabular-nums transition-colors ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        <div className={`p-2 rounded-lg ${timeLeft < 300 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                            <Clock size={20} />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black uppercase italic text-xs tracking-widest rounded-lg flex items-center space-x-2 shadow-lg shadow-green-500/20 transition-all active:scale-95"
                    >
                        {isSubmitting ? "TRANSMITTING..." : "TERMINATE & SUBMIT"}
                        <Send size={14} fill="white" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Section Navigation */}
                <nav className="w-64 bg-gray-950 border-r border-gray-900 p-4 space-y-2">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 px-2">Simulation Segments</p>
                    {["MCQ", "SHORT", "CASE"].map(s => (
                        <button
                            key={s}
                            onClick={() => setActiveSection(s)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeSection === s
                                ? "bg-purple-600 text-white font-black shadow-lg shadow-purple-500/10"
                                : "text-gray-500 hover:bg-gray-900 border border-transparent hover:border-gray-800"
                                }`}
                        >
                            <span className="text-xs uppercase italic tracking-tighter">
                                {s === 'MCQ' ? 'Section A: Neural Pulse' :
                                    s === 'SHORT' ? 'Section B: Logic Flux' :
                                        'Section C: The Crucible'}
                            </span>
                            {activeSection === s ? <ChevronRight size={14} /> : null}
                        </button>
                    ))}

                    <div className="mt-auto p-4 bg-gray-900/40 rounded-2xl border border-gray-800/50">
                        <div className="flex items-center space-x-2 mb-3">
                            <ShieldAlert size={14} className="text-yellow-600" />
                            <span className="text-[10px] text-yellow-600 font-black uppercase tracking-tighter">Security Monitor</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Visibility Lost</span>
                                <span className={`text-[10px] font-black ${tabSwitches > 0 ? 'text-red-500 font-black' : 'text-green-500'}`}>{tabSwitches} Events</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Manual Check</span>
                                <span className={`text-[10px] font-black ${isFlagged ? 'text-red-500' : 'text-green-500'}`}>{isFlagged ? 'FLAGGED' : 'NOMINAL'}</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="flex-1 p-12 bg-[#050505]">
                    {exam?.error || exam?.reply ? (
                        <div className="max-w-xl mx-auto mt-20 p-8 border border-red-900/30 bg-red-900/5 rounded-3xl text-center">
                            <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
                            <h2 className="text-xl font-black text-red-500 uppercase italic mb-4">Simulation Link Failure</h2>
                            <p className="text-gray-400 text-sm italic leading-relaxed mb-8">
                                {exam?.reply || exam?.message || "The AI Faculty is currently unreachable or returned an invalid protocol."}
                            </p>
                            <button
                                onClick={() => navigate("/exams")}
                                className="w-full py-3 bg-red-600/20 hover:bg-red-600/40 text-red-500 font-bold rounded-xl transition-all"
                            >
                                ABORT & RETURN TO DASHBOARD
                            </button>
                        </div>
                    ) : activeSection === "MCQ" && (
                        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-10 flex items-center">
                                <span className="text-purple-500 mr-3">//</span> Section A: Neural Pulse
                            </h2>
                            <div className="space-y-12">
                                {exam.mcqs?.map((item, idx) => (
                                    <div key={item.id} className="group">
                                        <div className="flex items-start mb-6">
                                            <span className="text-xs font-black text-purple-600 mr-4 mt-1 opacity-50 group-hover:opacity-100 transition-opacity">Q{idx + 1}.</span>
                                            <p className="text-gray-200 font-bold text-lg leading-relaxed">{item.question}</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-8">
                                            {item.options?.map((opt, oIdx) => (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => handleMcqSelect(item.id, oIdx)}
                                                    className={`p-4 rounded-xl text-left text-sm font-medium transition-all flex items-center border ${answers.mcqs[item.id] === oIdx
                                                        ? "bg-purple-600/10 border-purple-500 text-purple-400 ring-1 ring-purple-500/30"
                                                        : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700"
                                                        }`}
                                                >
                                                    <span className="w-6 h-6 rounded-md bg-gray-800 border border-gray-700 flex items-center justify-center mr-3 text-[10px] font-black uppercase text-gray-500">
                                                        {String.fromCharCode(65 + oIdx)}
                                                    </span>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === "SHORT" && (
                        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4 flex items-center">
                                <span className="text-purple-500 mr-3">//</span> Section B: Logic Flux
                            </h2>
                            <p className="text-gray-500 text-xs font-bold uppercase mb-12 italic border-b border-gray-900 pb-4 tracking-widest">Requires rigorous technical demonstration. AI detector fully active for this module.</p>
                            <div className="space-y-16">
                                {exam.short_answers?.map((item, idx) => (
                                    <div key={item.id} className="flex flex-col">
                                        <div className="flex items-start mb-6">
                                            <span className="text-xs font-black text-purple-600 mr-4 mt-1">B{idx + 1}.</span>
                                            <p className="text-gray-200 font-bold text-lg leading-relaxed">{item.question}</p>
                                        </div>
                                        <textarea
                                            value={answers.short_answers[item.id] || ""}
                                            onChange={(e) => handleShortAnswerChange(item.id, e.target.value)}
                                            placeholder="Forge your synthesis here..."
                                            className="ml-8 p-6 bg-gray-950 border border-gray-800 rounded-2xl text-gray-300 min-h-[150px] focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all resize-none font-mono text-sm leading-relaxed"
                                        />
                                        <div className="ml-8 mt-2 flex justify-between">
                                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter italic">First Principles Logic Protocol</span>
                                            <span className="text-[10px] text-gray-600 font-bold">{(answers.short_answers[item.id] || "").length} Characters</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === "CASE" && (
                        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4 flex items-center">
                                <span className="text-purple-500 mr-3">//</span> Section C: The Crucible
                            </h2>
                            <p className="text-gray-500 text-xs font-bold uppercase mb-12 italic border-b border-gray-900 pb-4 tracking-widest">Individual industrial crisis simulation. Your architecture will be audited for Staff-Engineer level signal.</p>

                            <div className="flex flex-col lg:flex-row gap-8 flex-1">
                                <div className="lg:w-1/2 p-8 bg-gray-900/30 border border-gray-800/50 rounded-3xl">
                                    <h3 className="text-purple-400 font-black uppercase text-xs tracking-widest mb-6">Industrial Scenario</h3>
                                    <div className="prose prose-invert prose-sm">
                                        <p className="text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{exam.case_study?.scenario}</p>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-gray-800">
                                        <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4">Core Deliverables</h4>
                                        <ul className="space-y-2">
                                            {exam.case_study?.requirements?.map((req, ridx) => (
                                                <li key={ridx} className="flex items-start space-x-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                                                    <span className="text-xs text-gray-400 font-bold">
                                                        {typeof req === 'object'
                                                            ? (req.content || req.text || Object.values(req)[0] || JSON.stringify(req))
                                                            : req}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="lg:w-1/2 flex flex-col h-full">
                                    <h3 className="text-purple-400 font-black uppercase text-xs tracking-widest mb-4">Architectural Submission</h3>
                                    <textarea
                                        value={answers.case_study}
                                        onChange={(e) => setAnswers({ ...answers, case_study: e.target.value })}
                                        placeholder="Draft your staff-level architectural response here..."
                                        className="flex-1 p-6 bg-gray-950 border border-gray-800 rounded-2xl text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all resize-none font-mono text-sm leading-relaxed"
                                    />
                                    <div className="mt-2 flex justify-between">
                                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter italic">Full-Stack Synthesis Protocol</span>
                                        <span className="text-[10px] text-gray-600 font-bold">{(answers.case_study || "").length} Characters</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

