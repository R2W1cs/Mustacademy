import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FilePlus, Save, Trash2, FileText, Loader2 } from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function AdminKBPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null); // { name, content }
    const [editName, setEditName] = useState('');
    const [editContent, setEditContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (localStorage.getItem('role') !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/kb');
            setFiles(res.data);
        } catch {
            toast.error('Failed to load knowledge base');
        } finally {
            setLoading(false);
        }
    };

    const openFile = async (name) => {
        try {
            const res = await api.get(`/admin/kb/${encodeURIComponent(name)}`);
            setSelectedFile(res.data);
            setEditName(res.data.name);
            setEditContent(res.data.content);
        } catch {
            toast.error('Failed to load file');
        }
    };

    const handleNew = () => {
        setSelectedFile({ name: '', content: '' });
        setEditName('New Topic');
        setEditContent('# New Topic\n\nWrite your content here...\n');
    };

    const handleSave = async () => {
        if (!editName.trim()) return toast.error('Filename is required');
        setSaving(true);
        try {
            await api.put(`/admin/kb/${encodeURIComponent(editName.trim())}`, { content: editContent });
            toast.success('Saved successfully');
            setSelectedFile({ name: editName.trim(), content: editContent });
            await fetchFiles();
        } catch {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedFile?.name && !editName) return;
        if (!window.confirm(`Delete "${editName}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await api.delete(`/admin/kb/${encodeURIComponent(editName.trim())}`);
            toast.success('File deleted');
            setSelectedFile(null);
            setEditName('');
            setEditContent('');
            await fetchFiles();
        } catch {
            toast.error('Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    const card = isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200 shadow-sm';

    return (
        <div className={`min-h-screen px-4 md:px-8 py-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-400 block mb-1">Admin Panel</span>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Knowledge Base</h1>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                    <FilePlus size={14} /> New File
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
                {/* File List */}
                <div className={`rounded-[2rem] border p-4 overflow-y-auto ${card}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-4 px-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Files ({files.length})
                    </p>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={20} className="animate-spin text-indigo-400" />
                        </div>
                    ) : files.length === 0 ? (
                        <p className="text-center text-xs opacity-30 py-12 uppercase tracking-widest">No files yet</p>
                    ) : (
                        <div className="space-y-1">
                            {files.map(f => (
                                <button
                                    key={f.name}
                                    onClick={() => openFile(f.name)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${selectedFile?.name === f.name || editName === f.name
                                        ? 'bg-indigo-500/15 border border-indigo-500/20 text-indigo-400'
                                        : isDark ? 'hover:bg-white/[0.04] text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    <FileText size={13} className="shrink-0 opacity-50" />
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold truncate">{f.name}</p>
                                        <p className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {(f.size / 1024).toFixed(1)} KB · {new Date(f.modified).toLocaleDateString()}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Editor */}
                <div className={`lg:col-span-2 rounded-[2rem] border flex flex-col overflow-hidden ${card}`}>
                    {selectedFile === null ? (
                        <div className="flex-1 flex items-center justify-center opacity-20">
                            <div className="text-center">
                                <FileText size={48} className="mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Select a file or create a new one</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Editor toolbar */}
                            <div className={`flex items-center gap-3 p-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    placeholder="Filename (without .md)"
                                    className={`flex-1 text-sm font-bold outline-none rounded-xl px-4 py-2 border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400'}`}
                                />
                                <span className={`text-[10px] font-black uppercase opacity-40 shrink-0`}>.md</span>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                    Save
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting || !editName.trim()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-30"
                                >
                                    {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                    Delete
                                </button>
                            </div>

                            {/* Textarea */}
                            <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                className={`flex-1 resize-none p-6 font-mono text-sm outline-none leading-relaxed ${isDark ? 'bg-transparent text-slate-200 placeholder:text-slate-700' : 'bg-transparent text-slate-800 placeholder:text-slate-400'}`}
                                placeholder="Write markdown content here..."
                                spellCheck={false}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
