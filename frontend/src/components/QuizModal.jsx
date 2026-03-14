import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { X, Check, AlertCircle, Award, Brain, Zap, ChevronRight } from "lucide-react";
import { runConfetti } from "../utils/confetti";

const QuizModal = ({ isOpen, onClose, topic, topicId }) => {
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

    // Fetch Quiz on Mount
    useEffect(() => {
        if (isOpen && !quiz) {
            setLoading(true);
            api.post("/ai/quiz/generate", { topic })
                .then(res => {
                    setQuiz(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Quiz gen failed", err);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    const handleOptionSelect = (qId, optionIdx) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        let correctCount = 0;
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctIndex) correctCount++;
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        setSubmitted(true); // Reveal answers immediately

        // Send to backend for Streak/Pet logic
        try {
            // 1. Streak/Pet logic
            const res = await api.post("/ai/quiz/submit", {
                score,
                total: quiz.questions.length,
                topic: quiz.title
            });

            // 2. Progress/Unlocking logic
            if (topicId) {
                await api.post("/progress/quiz", {
                    topicId: parseInt(topicId),
                    score
                });
            }

            setResult({ ...res.data, score });

            if (score >= 60) {
                runConfetti();
            }
        } catch (err) {
            console.error("Submission error", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card rounded-[2.5rem] w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-[var(--academic-border)] relative overflow-hidden"
            >
                {/* Background FX */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="p-8 border-b border-[var(--academic-border)] flex justify-between items-center bg-foreground/[0.02] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <Brain />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tightest">
                                {loading ? "Neural Synthesis..." : (quiz?.title || "Quiz Protocol")}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                                {topic ? `Topic: ${topic}` : "General Assessment"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-foreground/5 rounded-xl transition-colors text-foreground/40 hover:text-foreground">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                                    <Zap size={24} className="animate-pulse" />
                                </div>
                            </div>
                            <p className="text-indigo-300 font-black uppercase tracking-[0.3em] animate-pulse">Generating Questions...</p>
                        </div>
                    ) : !Array.isArray(quiz?.questions) || quiz.questions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-foreground mb-2">Protocol Generation Failed</h3>
                            <p className="text-foreground/40">The Neural Proctor could not synthesize a valid assessment.</p>
                            <button onClick={onClose} className="mt-8 px-8 py-3 bg-foreground/10 hover:bg-foreground/20 rounded-xl text-foreground font-bold transition-all">
                                Return to Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-12">
                            {quiz.questions.map((q, idx) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group"
                                >
                                    <div className="flex items-baseline gap-4 mb-6">
                                        <span className="text-4xl font-black text-foreground/10">{String(idx + 1).padStart(2, '0')}</span>
                                        <h3 className="text-xl font-bold text-foreground/80 leading-relaxed">{q.text}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12">
                                        {Array.isArray(q.options) && q.options.map((opt, optIdx) => {
                                            const isSelected = answers[q.id] === optIdx;
                                            const isCorrect = q.correctIndex === optIdx;
                                            const showStatus = submitted;

                                            let statusClass = "border-[var(--academic-border)] bg-foreground/5 hover:bg-foreground/[0.08] hover:border-indigo-500/50";
                                            if (showStatus) {
                                                if (isCorrect) statusClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
                                                else if (isSelected && !isCorrect) statusClass = "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-300 opacity-50";
                                                else statusClass = "border-[var(--academic-border)] bg-foreground/[0.02] opacity-30";
                                            } else if (isSelected) {
                                                statusClass = "border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
                                            }

                                            return (
                                                <button
                                                    key={optIdx}
                                                    onClick={() => handleOptionSelect(q.id, optIdx)}
                                                    disabled={submitted}
                                                    className={`p-5 rounded-2xl border text-left font-medium transition-all duration-300 flex items-center justify-between group/opt ${statusClass}`}
                                                >
                                                    <span className="text-sm">{opt}</span>
                                                    {showStatus && isCorrect && <Check size={18} className="text-emerald-400" />}
                                                    {showStatus && isSelected && !isCorrect && <X size={18} className="text-rose-400" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {submitted && (
                                        <div className="mt-4 pl-12">
                                            <p className="text-xs text-foreground/50 bg-foreground/2 p-4 rounded-xl border border-[var(--academic-border)]">
                                                <span className="text-indigo-500 font-bold uppercase mr-2">Explanation:</span>
                                                {q.explanation}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!loading && (
                    <div className="p-8 border-t border-[var(--academic-border)] bg-foreground/[0.02] backdrop-blur-xl flex justify-between items-center">
                        <div className="text-foreground/40 text-xs font-bold uppercase tracking-widest">
                            {Object.keys(answers).length} / {quiz?.questions.length} Answered
                        </div>

                        {!submitted ? (
                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length < quiz?.questions.length}
                                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                <Zap size={18} />
                                Finalize Protocol
                            </button>
                        ) : (
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Performance</p>
                                    <p className={`text-2xl font-black ${result?.score >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {result?.score}%
                                    </p>
                                </div>
                                {result?.score >= 60 && (
                                    <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                                        <Award className="text-emerald-500" size={24} />
                                        <div>
                                            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">Streak</p>
                                            <p className="text-foreground font-bold text-sm">Active</p>
                                        </div>
                                    </div>
                                )}
                                <button onClick={onClose} className="px-8 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-xl font-bold transition-all">
                                    Close Console
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default QuizModal;
