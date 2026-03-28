import { useState, useEffect, memo } from "react";
import Markdown from "markdown-to-jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown, BookOpen, Lightbulb, Loader2,
    CheckCircle2, XCircle, Target, Zap,
    Code2, Terminal, Info, Play, Copy, Check
} from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ProgrammingDeepDive from "./programming-units/ProgrammingDeepDive";

// ─── CODE EXECUTION BLOCK ──────────────────────────────────────────────────
const CodeBlock = ({ children, language }) => {
    const [output, setOutput] = useState([]);
    const [hasRun, setHasRun] = useState(false);
    const [copied, setCopied] = useState(false);
    const code = Array.isArray(children) ? children.join('') : String(children || '');
    const lang = (language || '').replace('language-', '').replace('lang-', '').toLowerCase();
    const isRunnable = !lang || lang === 'js' || lang === 'javascript';

    const runCode = () => {
        const logs = [];
        const capture = (type) => (...args) =>
            logs.push({ type, text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
        const [oLog, oErr, oWarn] = [console.log, console.error, console.warn];
        console.log = capture('log'); console.error = capture('error'); console.warn = capture('warn');
        try { new Function(code)(); } // eslint-disable-line no-new-func
        catch (e) { logs.push({ type: 'error', text: `${e.name}: ${e.message}` }); }
        finally { console.log = oLog; console.error = oErr; console.warn = oWarn; }
        setOutput(logs); setHasRun(true);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="my-8 rounded-2xl overflow-hidden border border-white/10 font-mono shadow-2xl shadow-black/30" style={{ background: '#0d1117' }}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5" style={{ background: '#161b22' }}>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/60" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                        <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest ml-1">{lang || 'code'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={copyCode} className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                        {copied ? <><Check size={11} className="text-emerald-400" /> <span className="text-emerald-400">Copied</span></> : <><Copy size={11} /> Copy</>}
                    </button>
                    {isRunnable && (
                        <button onClick={runCode} className="flex items-center gap-1.5 text-[11px] bg-emerald-900/60 hover:bg-emerald-800/70 text-emerald-400 border border-emerald-700/40 px-3 py-1.5 rounded-lg transition-all">
                            <Play size={10} /> Run
                        </button>
                    )}
                </div>
            </div>

            {/* Code body */}
            <div className="overflow-x-auto p-5">
                <pre className="text-[13px] text-slate-300 leading-[1.8] m-0 whitespace-pre">
                    {code.split('\n').map((line, i) => (
                        <div key={i} className="flex group">
                            <span className="select-none text-slate-700 w-10 text-right mr-5 shrink-0 text-[11px] leading-[1.8] group-hover:text-slate-500 transition-colors">{i + 1}</span>
                            <span className="flex-1">{line || '\u00a0'}</span>
                        </div>
                    ))}
                </pre>
            </div>

            {/* Output */}
            {hasRun && (
                <div className="border-t border-white/5" style={{ background: '#090c10' }}>
                    <div className="flex items-center gap-2 px-5 py-2 border-b border-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Output</span>
                    </div>
                    <div className="p-5 space-y-1 min-h-[40px]">
                        {output.length === 0
                            ? <span className="text-slate-600 text-[12px] italic">No output produced</span>
                            : output.map((o, i) => (
                                <div key={i} className={`text-[13px] font-mono flex items-start gap-2 ${o.type === 'error' ? 'text-red-400' : o.type === 'warn' ? 'text-amber-300' : 'text-emerald-300'}`}>
                                    <span className="opacity-40 shrink-0">{o.type === 'error' ? '✗' : o.type === 'warn' ? '⚠' : '▸'}</span>
                                    <span>{o.text}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── ASCII DIAGRAM ─────────────────────────────────────────────────────────
const AsciiDiagram = ({ children }) => {
    const raw = Array.isArray(children) ? children.join('') : String(children || '');
    const lines = raw.split('\n');
    const firstLine = lines[0]?.trim() || '';
    const isDirective = /^(graph|flowchart|sequenceDiagram|classDiagram|erDiagram|stateDiagram)/i.test(firstLine);
    const title = isDirective ? firstLine.replace(/^(graph\s+TD|graph\s+LR|flowchart\s+\w+|)\s*/i, '') || 'DIAGRAM' : 'DIAGRAM';
    const content = isDirective ? lines.slice(1).join('\n') : raw;

    return (
        <div className="my-8 rounded-2xl overflow-hidden border border-cyan-500/20 shadow-xl" style={{ background: '#050d14' }}>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-cyan-500/15" style={{ background: '#080f1a' }}>
                <div className="flex gap-1.5">
                    {['bg-red-500/50','bg-yellow-500/50','bg-green-500/50'].map((c,i) => <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/60 ml-1">◈ {title}</span>
            </div>
            <div className="px-6 py-5 overflow-x-auto">
                <pre className="text-[13px] leading-[1.7] text-cyan-300/80 whitespace-pre m-0" style={{ fontFamily: "'Cascadia Code','Fira Code','Courier New',monospace" }}>
                    {content}
                </pre>
            </div>
        </div>
    );
};

// ─── MATH ──────────────────────────────────────────────────────────────────
const MathComponent = ({ math, block }) => block ? <BlockMath math={math} /> : <InlineMath math={math} />;

// ─── EXERCISES ENGINE ──────────────────────────────────────────────────────
const TopicExercises = ({ topicId, topicTitle }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [exercises, setExercises] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mcqCount, setMcqCount] = useState(10);
    const [shortCount, setShortCount] = useState(5);
    const [answers, setAnswers] = useState({});
    const [checked, setChecked] = useState({});
    const [scores, setScores] = useState({});
    const [scoring, setScoring] = useState({});
    const acc = isDark ? 'indigo' : 'red';
    const accCls = isDark ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' : 'text-red-600 border-red-200 bg-red-50';

    const fetchExercises = async () => {
        setLoading(true); setError(null);
        try {
            const res = await api.post("/ai/topics/exercises", { topicId, topicTitle, mcqCount, shortAnswerCount: shortCount });
            if (res.data?.exercises) setExercises(res.data.exercises);
            else throw new Error("Empty response");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to generate exercises");
        } finally { setLoading(false); }
    };

    const scoreShortAnswer = async (idx, question, userAnswer, modelAnswer) => {
        const key = `short_${idx}`;
        setScoring(s => ({ ...s, [key]: true }));
        try {
            const prompt =
                `You are a strict but fair CS exam grader. ` +
                `Question: "${question}" ` +
                `Student answer: "${userAnswer}" ` +
                `Model answer: "${modelAnswer}" ` +
                `Reply ONLY with a JSON object (no markdown, no extra text): ` +
                `{"score": <integer 0-10>, "feedback": "<1-2 sentences on what was right/wrong>", "exam_tip": "<how to write this perfectly in an exam>"}`;
            const res = await api.post("/ai/chat", { message: prompt, topicId });
            let raw = (res.data.reply || '{}').replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(raw);
            setScores(s => ({ ...s, [key]: parsed }));
        } catch {
            setScores(s => ({ ...s, [key]: { score: null, feedback: "Could not evaluate. Compare with the model answer below.", exam_tip: null } }));
        } finally {
            setScoring(s => ({ ...s, [key]: false }));
            setChecked(c => ({ ...c, [key]: true }));
        }
    };

    if (error) return (
        <div className="mt-16 p-10 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-center">
            <XCircle className="mx-auto mb-4 text-rose-500" size={28} />
            <p className={`font-bold mb-4 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{error}</p>
            <button onClick={fetchExercises} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">Retry</button>
        </div>
    );

    if (!exercises && !loading) return (
        <div className="mt-16 flex justify-center">
            <div className={`w-full max-w-xl p-14 rounded-[3rem] border relative overflow-hidden ${isDark ? 'bg-zinc-950/60 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-indigo-500/5' : 'from-red-500/3'} to-transparent`} />
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${accCls}`}><Zap size={28} className={isDark ? 'text-indigo-400' : 'text-red-500'} /></div>
                    <h3 className={`text-xl font-black uppercase tracking-widest mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Mastery Crucible</h3>
                    <p className={`mb-10 max-w-md mx-auto text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Configure your training intensity and generate AI-powered exercises.</p>

                    <div className={`grid grid-cols-2 gap-6 w-full mb-10 p-8 rounded-2xl border ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                        {[{ label: 'MCQ Count', val: mcqCount, set: setMcqCount, min: 5, max: 30, color: acc },
                          { label: 'Short Answer', val: shortCount, set: setShortCount, min: 3, max: 15, color: 'purple' }].map((s, i) => (
                            <div key={i} className="space-y-3 text-left">
                                <div className={`flex justify-between text-[10px] font-black uppercase tracking-widest ${isDark ? `text-${s.color}-400` : `text-${s.color}-600`}`}>
                                    <span>{s.label}</span><span>{s.val}</span>
                                </div>
                                <input type="range" min={s.min} max={s.max} value={s.val}
                                    onChange={e => s.set(parseInt(e.target.value))}
                                    className={`w-full h-1.5 rounded-full cursor-pointer accent-${s.color}-500 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                            </div>
                        ))}
                    </div>

                    <button onClick={fetchExercises} className={`group px-10 py-4 font-black uppercase tracking-widest text-xs rounded-2xl text-white transition-all hover:scale-105 active:scale-95 shadow-lg ${isDark ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-red-600 shadow-red-500/20'}`}>
                        Initialize Exercise Matrix
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="mt-16 p-20 rounded-[3rem] bg-indigo-500/[0.02] border border-indigo-500/10 flex flex-col items-center gap-6">
            <Loader2 size={40} className="text-indigo-500 animate-spin" />
            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400 animate-pulse">Forging {mcqCount} Questions…</p>
        </div>
    );

    return (
        <div className="mt-16 space-y-14 pb-16">
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-current opacity-10" />
                <h3 className={`text-lg font-black uppercase tracking-widest flex items-center gap-3 ${isDark ? 'text-indigo-400' : 'text-red-600'}`}>
                    <Target size={18} /> Mastery Crucible
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-current opacity-10" />
            </div>

            {exercises?.mcq?.length > 0 && (
                <div className="space-y-6">
                    <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-red-600'}`}>
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center border ${accCls} text-xs`}>01</div>
                        Multiple Choice
                    </div>
                    {exercises.mcq.map((q, idx) => (
                        <div key={idx} className={`p-8 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex gap-5 mb-8">
                                <span className={`text-[10px] font-black shrink-0 mt-1 ${isDark ? 'text-indigo-500/40' : 'text-red-400'}`}>{String(idx+1).padStart(2,'0')}</span>
                                <p className={`text-base font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.q}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q?.options?.map((opt, oIdx) => {
                                    const letter = opt[0];
                                    const isSelected = answers[`mcq_${idx}`] === letter;
                                    const isCorrect = q.answer === letter;
                                    const isChecked = checked[`mcq_${idx}`];
                                    return (
                                        <button key={oIdx} onClick={() => !isChecked && setAnswers({...answers, [`mcq_${idx}`]: letter})}
                                            className={`flex items-center gap-4 p-4 rounded-xl border text-left text-sm font-medium transition-all ${
                                                isChecked ? isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                    : isSelected ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'opacity-25 border-transparent'
                                                : isSelected ? `${isDark ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300' : 'bg-red-50 border-red-300 text-red-700'}`
                                                : `${isDark ? 'border-white/5 hover:border-white/20 hover:bg-white/[0.03]' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}`
                                            }`}>
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? (isDark ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white') : isDark ? 'bg-white/5 text-white/30' : 'bg-slate-200 text-slate-500'}`}>{letter}</div>
                                            <span className="flex-1">{opt.substring(3)}</span>
                                            {isChecked && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                                            {isChecked && isSelected && !isCorrect && <XCircle size={16} className="text-rose-400 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={() => setChecked({...checked, [`mcq_${idx}`]: true})}
                                disabled={!answers[`mcq_${idx}`] || checked[`mcq_${idx}`]}
                                className={`mt-6 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/50' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                                Verify Answer
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {exercises?.short_answer?.length > 0 && (
                <div className="pt-10 space-y-8 border-t border-white/5">
                    <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center border border-purple-500/20 bg-purple-500/10 text-xs">02</div>
                        Short Answer
                    </div>
                    {exercises.short_answer.map((q, idx) => {
                        const key = `short_${idx}`;
                        const isChecked = checked[key];
                        const isScoring = scoring[key];
                        const result = scores[key];
                        const scoreColor = result?.score >= 8 ? 'emerald' : result?.score >= 5 ? 'amber' : 'rose';
                        return (
                            <div key={idx} className={`p-8 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <div className="flex gap-5 mb-5">
                                    <span className={`text-[10px] font-black shrink-0 mt-1 ${isDark ? 'text-purple-500/40' : 'text-purple-400'}`}>{String(idx+1).padStart(2,'0')}</span>
                                    <p className={`text-base font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.q}</p>
                                </div>
                                <div className="relative">
                                    <textarea rows={4} placeholder="Write your answer here…"
                                        className={`w-full p-5 pr-28 rounded-2xl border text-sm font-medium outline-none resize-none transition-all ${isDark ? 'bg-zinc-950/80 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-purple-500/40' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-400'}`}
                                        value={answers[key] || ''}
                                        onChange={e => setAnswers({...answers, [key]: e.target.value})}
                                        disabled={isChecked} />
                                    {!isChecked && (
                                        <button
                                            onClick={() => scoreShortAnswer(idx, q.q, answers[key], q.model_answer)}
                                            disabled={!answers[key] || isScoring}
                                            className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center gap-1.5">
                                            {isScoring ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown className="-rotate-90" size={12} />}
                                            {isScoring ? 'Grading…' : 'Submit'}
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {isChecked && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                                            <div className="mt-4 space-y-4">
                                                {result?.score != null && (
                                                    <div className={`flex items-center gap-4 p-4 rounded-2xl border bg-${scoreColor}-500/10 border-${scoreColor}-500/20`}>
                                                        <div className={`text-3xl font-black text-${scoreColor}-400 shrink-0`}>{result.score}<span className="text-base opacity-50">/10</span></div>
                                                        <div>
                                                            <p className={`text-[10px] font-black uppercase tracking-widest text-${scoreColor}-400 mb-1`}>Score</p>
                                                            <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{result.feedback}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {result?.exam_tip && (
                                                    <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-2"><Zap size={11} /> Exam Technique</p>
                                                        <p className={`text-sm leading-relaxed ${isDark ? 'text-amber-100/70' : 'text-amber-900/80'}`}>{result.exam_tip}</p>
                                                    </div>
                                                )}
                                                <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-purple-400"><Info size={12} /> Model Answer</div>
                                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{q.model_answer}</p>
                                                    {q.hint && <p className={`mt-2 text-[11px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hint: {q.hint}</p>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}

            {exercises?.challenge && (
                <div className="pt-10 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-8 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-xs">03</div>
                        Case Study Challenge
                    </div>
                    <div className={`p-10 rounded-3xl border relative overflow-hidden ${isDark ? 'border-white/5 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/5' : 'border-slate-200 bg-gradient-to-br from-red-50 to-emerald-50/30'}`}>
                        <h4 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{exercises.challenge.title}</h4>
                        <p className={`text-sm leading-relaxed mb-6 italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{exercises.challenge.scenario}</p>
                        <div className={`p-6 rounded-2xl mb-8 border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 block mb-3">Your Task</span>
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{exercises.challenge.task}</p>
                        </div>
                        <button onClick={() => setChecked({...checked, challenge: true})} className="flex items-center gap-3 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95">
                            <Terminal size={15} /> View Solution
                        </button>
                        <AnimatePresence>
                            {checked.challenge && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-3">Architectural Rubric</span>
                                    <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-emerald-100/80' : 'text-emerald-900/80'}`}>{exercises.challenge.solution_guide}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── MARKDOWN OVERRIDES FACTORY ────────────────────────────────────────────
const buildOverrides = (isDark, mode) => {
    const isDeep = mode === 'deep';
    const accent = isDark ? 'indigo' : 'red';
    const accentHex = isDark ? '#6366f1' : '#c01636';

    return {
        // ── Headings ──
        h1: {
            component: ({ children }) => (
                <h1 className={`text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-10 mt-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{children}</h1>
            )
        },
        h2: {
            component: ({ children }) => (
                <div className={`mt-16 mb-8 flex items-start gap-5 pb-5 border-b ${isDark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
                    <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: `linear-gradient(to bottom, ${accentHex}, transparent)` }} />
                    <h2 className={`text-xl lg:text-2xl font-black tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{children}</h2>
                </div>
            )
        },
        h3: {
            component: ({ children }) => (
                <h3 className={`text-base lg:text-lg font-black uppercase tracking-wider mt-10 mb-4 flex items-center gap-3 ${isDark ? `text-${accent}-400` : `text-${accent}-600`}`}>
                    <span className={`w-4 h-px ${isDark ? `bg-${accent}-500` : `bg-${accent}-500`}`} />
                    {children}
                </h3>
            )
        },
        h4: {
            component: ({ children }) => (
                <h4 className={`text-sm font-black uppercase tracking-widest mt-8 mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{children}</h4>
            )
        },

        // ── Body ──
        p: {
            component: ({ children }) => (
                <p className={`text-[15px] leading-[1.9] mb-6 ${isDeep ? 'font-mono text-[13px] leading-relaxed' : 'font-medium'} ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{children}</p>
            )
        },

        // ── Lists ──
        ul: {
            component: ({ children }) => (
                <ul className="space-y-3 mb-8 ml-1">{children}</ul>
            )
        },
        ol: {
            component: ({ children }) => (
                <ol className="space-y-3 mb-8 ml-1 list-none counter-reset-item">{children}</ol>
            )
        },
        li: {
            component: ({ children }) => (
                <li className={`flex gap-4 text-[14px] leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: accentHex }} />
                    <span className="flex-1">{children}</span>
                </li>
            )
        },

        // ── Code ──
        pre: { component: ({ children }) => <>{children}</> },
        code: {
            component: ({ children, className }) => {
                const lang = (className || '').replace('lang-', '').replace('language-', '');
                if (className) {
                    if (lang === 'mermaid') return <AsciiDiagram>{children}</AsciiDiagram>;
                    return <CodeBlock language={lang}>{children}</CodeBlock>;
                }
                return <code className={`px-1.5 py-0.5 rounded-md text-[12px] font-mono ${isDark ? 'bg-white/10 text-cyan-300' : 'bg-slate-100 text-red-600'}`}>{children}</code>;
            }
        },

        // ── Blockquote / Callout ──
        blockquote: {
            component: ({ children }) => (
                <div className={`my-8 flex gap-5 p-6 rounded-2xl border-l-4 ${isDark ? 'bg-indigo-500/[0.05] border-indigo-500 text-indigo-200' : 'bg-red-50 border-red-400 text-red-900'}`}>
                    <Lightbulb size={18} className={isDark ? 'text-indigo-400 shrink-0 mt-0.5' : 'text-red-500 shrink-0 mt-0.5'} />
                    <div className={`text-[14px] leading-relaxed font-medium italic ${isDark ? 'text-indigo-200/80' : 'text-red-800/80'}`}>{children}</div>
                </div>
            )
        },

        // ── Tables ──
        table: {
            component: ({ children }) => (
                <div className={`my-10 overflow-x-auto rounded-2xl border shadow-lg ${isDark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
                    <table className="w-full border-collapse">{children}</table>
                </div>
            )
        },
        thead: {
            component: ({ children }) => (
                <thead className={isDark ? 'bg-white/[0.04]' : 'bg-slate-50'}>{children}</thead>
            )
        },
        th: {
            props: { className: `p-4 text-left text-[10px] font-black uppercase tracking-widest border-b ${isDark ? 'text-indigo-400 border-white/[0.07]' : 'text-red-600 border-slate-200'}` }
        },
        td: {
            props: { className: `p-4 text-sm font-medium border-b ${isDark ? 'text-slate-300 border-white/[0.04]' : 'text-slate-700 border-slate-100'}` }
        },
        tr: {
            component: ({ children }) => (
                <tr className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/80'}`}>{children}</tr>
            )
        },

        // ── Dividers ──
        hr: {
            component: () => (
                <div className="my-14 flex items-center gap-4">
                    <div className={`flex-1 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                    <div className={`flex-1 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                </div>
            )
        },

        // ── Inline ──
        strong: { props: { className: `font-black ${isDark ? 'text-white' : 'text-slate-900'}` } },
        em: { props: { className: `italic ${isDark ? 'text-slate-300' : 'text-slate-600'}` } },
        a: { props: { className: `underline underline-offset-4 font-semibold ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-red-600 hover:text-red-700'}`, target: '_blank', rel: 'noopener' } },

        // ── Math ──
        Math: { component: MathComponent },
    };
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const TopicContent = ({ topic, mode = 'easy' }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    if (!topic) return null;

    const activeContent = mode === 'deep'
        ? (topic.content_deep_markdown || topic.content_markdown)
        : (topic.content_easy_markdown || topic.content_markdown);

    const isShowingFallback = (mode === 'deep' && !topic.content_deep_markdown) || (mode === 'easy' && !topic.content_easy_markdown);

    const programmingDomain = (() => {
        const t = (topic.title || '').toLowerCase();
        if (t.includes('c programming') || t.includes('pointer') || t.includes('memory')) return 'c';
        if (t.includes('java') || t.includes('jvm') || t.includes('object oriented')) return 'java';
        if (t.includes('python') || t.includes('scripting')) return 'python';
        if (t.includes('web development') || t.includes('frontend') || t.includes('http')) return 'web';
        return null;
    })();

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [topic.id, mode]);

    const accent = isDark ? 'indigo' : 'red';
    const accentCls = isDark ? 'text-indigo-400' : 'text-red-600';
    const borderCls = isDark ? 'border-white/[0.07]' : 'border-slate-200';

    // ── No content yet ──
    if (!activeContent) return (
        <div className="max-w-3xl mx-auto py-20 text-center">
            <div className={`p-14 rounded-3xl border ${isDark ? 'bg-indigo-500/[0.03] border-indigo-500/10' : 'bg-red-50 border-red-200'}`}>
                <Loader2 size={36} className={`mx-auto mb-6 animate-spin ${accentCls}`} />
                <h3 className={`text-xl font-black uppercase tracking-widest mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Synthesizing Content</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>The AI is generating a high-fidelity explanation for this topic.</p>
            </div>
        </div>
    );

    // ── Pre-process content: $$ math, $ math ──
    const processedContent = (() => {
        let c = activeContent;
        c = c.replace(/\$\$(.*?)\$\$/gs, (_, p1) => `<Math block math="${p1.replace(/"/g, '&quot;')}" />`);
        c = c.replace(/\$(.*?)\$/g, (_, p1) => `<Math math="${p1.replace(/"/g, '&quot;')}" />`);
        return c;
    })();

    return (
        <div className={`max-w-6xl mx-auto ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>

            {/* ── MODE BADGE ── */}
            <div className="flex items-center gap-4 mb-12">
                <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${isDark ? `bg-${accent}-500/10 border-${accent}-500/20 ${accentCls}` : `bg-${accent}-50 border-${accent}-200 ${accentCls}`}`}>
                    {mode === 'deep' ? <Terminal size={13} /> : <BookOpen size={13} />}
                    {mode === 'deep' ? 'Deep Architecture' : 'Essential Protocol'}
                </div>
                {isShowingFallback && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-xl border border-amber-500/20 animate-pulse">
                        Legacy content · Re-forge recommended
                    </span>
                )}
            </div>

            {/* ── DEEP MODE EXTRAS ── */}
            {mode === 'deep' && (topic.first_principles || topic.structural_breakdown || topic.failure_analysis) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
                    {topic.first_principles && (
                        <IntelCard title="First Principles" icon={<Zap size={14} />} color={accent} isDark={isDark}>
                            <p className={`text-sm leading-relaxed font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{topic.first_principles}</p>
                        </IntelCard>
                    )}
                    {topic.structural_breakdown && (
                        <IntelCard title="Structural Architecture" icon={<Code2 size={14} />} color={accent} isDark={isDark}>
                            <pre className={`text-xs leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{topic.structural_breakdown}</pre>
                        </IntelCard>
                    )}
                    {topic.failure_analysis && (
                        <div className={`md:col-span-2 p-6 rounded-2xl border border-rose-500/20 ${isDark ? 'bg-rose-500/[0.04]' : 'bg-rose-50'}`}>
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-rose-400">
                                <XCircle size={13} /> Critical Failure Modes
                            </div>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-rose-800/70'}`}>{topic.failure_analysis}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── PROGRAMMING DEEP DIVE ── */}
            {programmingDomain && <ProgrammingDeepDive type={programmingDomain} />}

            {/* ── MAIN CONTENT ── */}
            <article className="relative">
                {/* Left timeline accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-px hidden xl:block ${isDark ? 'bg-gradient-to-b from-indigo-500/30 via-indigo-500/10 to-transparent' : 'bg-gradient-to-b from-red-400/20 via-red-400/5 to-transparent'}`}
                    style={{ left: '-3rem' }} />

                <Markdown options={{ overrides: buildOverrides(isDark, mode) }}>
                    {processedContent}
                </Markdown>
            </article>

            {/* ── STAFF NOTE ── */}
            {topic.staff_engineer_note && (
                <div className={`my-14 p-8 rounded-3xl border relative overflow-hidden ${isDark ? 'bg-indigo-500/[0.04] border-indigo-500/15' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${isDark ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' : 'bg-amber-100 border-amber-200 text-amber-600'}`}>
                            <Lightbulb size={16} />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-indigo-400' : 'text-amber-600'}`}>Staff Architect Insight</p>
                            <p className={`text-base font-serif italic leading-relaxed ${isDark ? 'text-slate-300' : 'text-amber-900/80'}`}>{topic.staff_engineer_note}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── EXERCISES ── */}
            <div id="crucible" className={`border-t pt-12 mt-12 ${borderCls}`}>
                <TopicExercises topicId={topic.id} topicTitle={topic.title} />
            </div>

            <div className="h-24" />
        </div>
    );
};

// ─── INTEL CARD (small info card for deep mode) ────────────────────────────
const IntelCard = ({ title, icon, color, isDark, children }) => (
    <div className={`p-6 rounded-2xl border ${isDark ? `bg-${color}-500/[0.04] border-${color}-500/15` : `bg-${color}-50 border-${color}-200`}`}>
        <div className={`flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest ${isDark ? `text-${color}-400` : `text-${color}-600`}`}>
            {icon} {title}
        </div>
        {children}
    </div>
);

export default memo(TopicContent);
