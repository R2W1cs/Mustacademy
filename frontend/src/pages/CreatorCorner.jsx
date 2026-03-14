import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Rocket, Lightbulb, Users, Plus, Check, X,
    MessageCircle, Code, Clock, Shield, Search, Filter,
    Briefcase, FileText, Send, Github, ExternalLink as LinkIcon, Lock, Settings
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";

export default function CreatorCorner() {
    const { theme } = useTheme();
    const [userProfile, setUserProfile] = useState(null);
    const isDark = theme === 'dark';
    const [projects, setProjects] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState('browse'); // 'browse', 'manage', or 'teams'
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [activeRoom, setActiveRoom] = useState(null);
    const [myTeams, setMyTeams] = useState([]);
    const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
    const [activeMembers, setActiveMembers] = useState([]);

    // Form state
    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        skills: "",
        github_repo: ""
    });

    const [joinForm, setJoinForm] = useState({
        skills: "",
        motivation: "",
        contribution: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/profile/me");
                setUserProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
        fetchData();
    }, [activeView]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeView === 'browse') {
                const res = await api.get("/projects");
                setProjects(res.data);
            } else if (activeView === 'manage') {
                const res = await api.get("/projects/requests");
                setMyRequests(res.data);
            } else {
                const res = await api.get("/projects/my-projects");
                setMyTeams(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch Creator Corner data", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post("/projects", {
                ...newProject,
                skills_required: newProject.skills.split(',').map(s => s.trim())
            });
            setIsCreateModalOpen(false);
            setNewProject({ title: "", description: "", skills: "", github_repo: "" });
            fetchData();
        } catch (err) {
            alert("Failed to create project");
        }
    };

    const handleJoinRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/projects/join", {
                project_id: selectedProject.id,
                ...joinForm,
                message: joinForm.motivation // Mapping for legacy support if needed
            });
            setIsJoinModalOpen(false);
            setJoinForm({ skills: "", motivation: "", contribution: "" });
            alert("Application sent successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send request");
        }
    };

    const [currentSidebarWidth, setCurrentSidebarWidth] = useState(() => {
        const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        return collapsed ? 80 : 256;
    });

    useEffect(() => {
        const handleToggle = (e) => {
            setCurrentSidebarWidth(e.detail.isCollapsed ? 80 : 256);
        };
        window.addEventListener('sidebarToggle', handleToggle);
        return () => window.removeEventListener('sidebarToggle', handleToggle);
    }, []);

    // Body scroll locking for Boss Dashboard
    useEffect(() => {
        if (isAdminDashboardOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        };
    }, [isAdminDashboardOpen]);

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/projects/${selectedProject.id}`, {
                ...newProject,
                skills_required: newProject.skills.split(',').map(s => s.trim())
            });
            setIsEditModalOpen(false);
            setNewProject({ title: "", description: "", skills: "", github_repo: "" });
            fetchData();
            alert("Project updated successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update project");
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("CRITICAL: Are you sure you want to terminate this project? This action cannot be undone.")) return;
        try {
            await api.delete(`/projects/${projectId}`);
            setIsAdminDashboardOpen(false);
            fetchData();
        } catch (err) {
            alert("Failed to delete project");
        }
    };

    const handleKickMember = async (projectId, userId) => {
        if (!window.confirm("Are you sure you want to remove this member from the squad?")) return;
        try {
            await api.delete(`/projects/${projectId}/members/${userId}`);
            fetchMembers(projectId);
            alert("Member removed successfully");
        } catch (err) {
            alert("Failed to remove member");
        }
    };

    const fetchMembers = async (projectId) => {
        try {
            const res = await api.get(`/projects/${projectId}/members`);
            setActiveMembers(res.data);
        } catch (err) {
            console.error("Failed to fetch members", err);
        }
    };

    const handleRequestAction = async (requestId, status) => {
        try {
            await api.patch(`/projects/requests/${requestId}`, { status });
            fetchData();
        } catch (err) {
            alert("Failed to update request");
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className={`min-h-screen p-6 lg:p-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <Rocket className="w-10 h-10 text-purple-500" />
                        Creator Corner
                    </h1>
                    <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} text-lg`}>
                        {activeView === 'browse'
                            ? "Collaborate on groundbreaking student initiatives."
                            : "Manage incoming collaboration requests for your projects."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveView(activeView === 'teams' ? 'browse' : 'teams')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all border ${activeView === 'teams'
                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        My Projects
                    </button>
                    <button
                        onClick={() => setActiveView(activeView === 'manage' ? 'browse' : 'manage')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all border ${activeView === 'manage'
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        Manage Requests
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Start an Idea
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            {activeView === 'browse' && (
                <div className={`mb-8 p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search projects, skills, or ideas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border appearance-none outline-none transition-all ${isDark ? 'bg-black/20 border-white/10 focus:border-purple-500/50' : 'bg-white border-slate-200 focus:border-indigo-500'
                                }`}
                        />
                    </div>
                </div>
            )}

            {/* Content Area */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                activeView === 'browse' ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                variants={itemVariants}
                                className={`group p-6 rounded-3xl border transition-all hover:shadow-2xl hover:shadow-purple-500/5 ${isDark ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]' : 'bg-white border-slate-200 shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${project.status === 'open' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{project.title}</h3>
                                <p className={`text-sm mb-6 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                    {project.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.skills_required?.map((skill, idx) => (
                                        <span key={idx} className={`px-2 py-1 rounded-md text-[10px] font-bold border ${isDark ? 'bg-black/20 border-white/5 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                                            }`}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                            {project.owner_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold leading-none">{project.owner_name}</p>
                                            <p className="text-[10px] text-gray-500">Creator</p>
                                        </div>
                                    </div>
                                    {project.owner_id === userProfile?.id ? (
                                        <button
                                            onClick={() => {
                                                setSelectedProject(project);
                                                fetchMembers(project.id);
                                                setIsAdminDashboardOpen(true);
                                            }}
                                            className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                                        >
                                            <Settings size={14} /> Manage Project
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setSelectedProject(project);
                                                setIsJoinModalOpen(true);
                                            }}
                                            className="text-xs font-black uppercase tracking-widest text-purple-500 hover:text-purple-400 transition-colors"
                                        >
                                            Apply to Join
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : activeView === 'manage' ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8 p-6 rounded-3xl bg-purple-500/5 border border-purple-500/20">
                            <h2 className="text-xl font-black italic uppercase text-purple-400 mb-2">Review Desk</h2>
                            <p className="text-xs text-gray-500 font-medium">Verify credentials and onboard new talent to your stacks.</p>
                        </div>
                        {myRequests.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <Users className="w-16 h-16 mx-auto mb-4" />
                                <p className="text-xl font-bold italic uppercase">Zero incoming pings.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {myRequests.map((req) => (
                                    <div key={req.id} className={`p-8 rounded-[2.5rem] border flex flex-col gap-6 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'}`}>
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-lg font-black text-white">
                                                        {req.requester_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-white italic uppercase tracking-tight">{req.requester_name}</h4>
                                                        <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest">Applying for {req.project_title}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2 flex items-center gap-2"><Code size={12} /> Stack & Skills</p>
                                                        <p className="text-xs text-white/70">{req.skills || "Not specified"}</p>
                                                    </div>
                                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2 flex items-center gap-2"><Briefcase size={12} /> Role Contribution</p>
                                                        <p className="text-xs text-white/70">{req.contribution || "Not specified"}</p>
                                                    </div>
                                                </div>

                                                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 italic">
                                                    <p className="text-[10px] font-black uppercase text-indigo-400 mb-2 flex items-center gap-2"><FileText size={12} /> Motivation Letter</p>
                                                    <p className="text-sm text-indigo-100/60 leading-relaxed">"{req.motivation || req.message}"</p>
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col items-center justify-center gap-3 shrink-0">
                                                {req.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleRequestAction(req.id, 'accepted')}
                                                            className="w-full px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
                                                        >
                                                            <Check size={16} /> Deploy
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestAction(req.id, 'declined')}
                                                            className="w-full px-8 py-4 rounded-2xl border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <X size={16} /> Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border ${req.status === 'accepted' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                        {req.status}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-12 p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase text-indigo-400 mb-2">My Squads</h2>
                                <p className="text-sm text-gray-500 font-medium">Restricted access rooms for approved team members.</p>
                            </div>
                            <Lock className="text-indigo-500/40" size={40} />
                        </div>

                        {myTeams.length === 0 ? (
                            <div className="text-center py-32 opacity-20">
                                <Rocket className="w-20 h-20 mx-auto mb-6" />
                                <p className="text-2xl font-black italic uppercase">Access Denied. Join a Squad First.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {myTeams.map((squad) => (
                                    <div key={squad.id} className={`p-10 rounded-[3.5rem] border relative overflow-hidden group transition-all hover:scale-[1.02] ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white shadow-xl border-slate-200'}`}>
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px] -z-10 group-hover:bg-indigo-500/20 transition-all" />

                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                                                    <Github className="text-white" size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{squad.title}</h3>
                                                    <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.3em]">Operational Phase</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <span className="text-[9px] font-black uppercase text-white/40 tracking-widest bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                                                    {squad.owner_id === userProfile?.id ? "Project Admin" : "Member"}
                                                </span>
                                                {squad.owner_id === userProfile?.id && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProject(squad);
                                                            setNewProject({
                                                                title: squad.title,
                                                                description: squad.description,
                                                                skills: squad.skills_required?.join(', ') || "",
                                                                github_repo: squad.github_repo || ""
                                                            });
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        <Settings size={14} /> Edit Settings
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-white/50 leading-relaxed mb-10 font-medium italic">
                                            "{squad.description}"
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-white/10">
                                            <a
                                                href={squad.github_repo || "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between p-6 rounded-[2rem] bg-indigo-500 text-white font-black uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all group/btn"
                                            >
                                                Central Repository
                                                <LinkIcon size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                            </a>
                                            <button className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/10 text-white/70 font-black uppercase text-[11px] tracking-widest hover:bg-white/10 transition-all">
                                                Squad Comms
                                                <MessageCircle size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            )}

            {/* Join Project Modal */}
            <AnimatePresence>
                {isJoinModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsJoinModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className={`relative w-full max-w-3xl rounded-[3rem] p-12 border shadow-[0_0_100px_rgba(168,85,247,0.1)] ${isDark ? 'bg-[#0a0c10] border-white/10' : 'bg-white border-slate-200'
                                }`}
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <Rocket size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Collaboration Request</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">Project: {selectedProject?.title}</p>
                                </div>
                            </div>

                            <form onSubmit={handleJoinRequestSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Your Tech Stack</label>
                                        <input
                                            type="text"
                                            required
                                            value={joinForm.skills}
                                            onChange={(e) => setJoinForm({ ...joinForm, skills: e.target.value })}
                                            placeholder="React, Node, PyTorch..."
                                            className={`w-full p-5 rounded-2xl border bg-white/5 border-white/10 text-white outline-none focus:border-purple-500/50 transition-all font-medium`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Proposed Value-Add</label>
                                        <input
                                            type="text"
                                            required
                                            value={joinForm.contribution}
                                            onChange={(e) => setJoinForm({ ...joinForm, contribution: e.target.value })}
                                            placeholder="Frontend dev, UI Designer..."
                                            className={`w-full p-5 rounded-2xl border bg-white/5 border-white/10 text-white outline-none focus:border-purple-500/50 transition-all font-medium`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Motivation Letter</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={joinForm.motivation}
                                        onChange={(e) => setJoinForm({ ...joinForm, motivation: e.target.value })}
                                        placeholder="Why do you want to join this project? What drives you?"
                                        className={`w-full p-6 rounded-3xl border bg-white/5 border-white/10 text-white outline-none focus:border-purple-500/50 transition-all font-medium leading-relaxed`}
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsJoinModalOpen(false)}
                                        className="flex-1 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest border border-white/5 hover:bg-white/5 transition-all text-white/40"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase text-[11px] tracking-widest hover:shadow-2xl hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-3"
                                    >
                                        Submit Application <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Project Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`relative w-full max-w-2xl rounded-3xl p-8 border shadow-2xl ${isDark ? 'bg-[#0b0d14] border-white/10' : 'bg-white border-slate-200'
                                }`}
                        >
                            <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                <Plus className="text-purple-500" />
                                Launch an Idea
                            </h2>
                            <form onSubmit={handleCreateProject} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Project Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                        placeholder="e.g. Synaptic OS Visualization"
                                        className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-purple-500/20 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Manifesto / Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        placeholder="What are we building and why?"
                                        className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-purple-500/20 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Required Skills (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={newProject.skills}
                                        onChange={(e) => setNewProject({ ...newProject, skills: e.target.value })}
                                        placeholder="React, Python, OpenCV, UI/UX"
                                        className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-purple-500/20 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">GitHub Repository URL</label>
                                    <input
                                        type="url"
                                        value={newProject.github_repo}
                                        onChange={(e) => setNewProject({ ...newProject, github_repo: e.target.value })}
                                        placeholder="https://github.com/user/repo"
                                        className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-purple-500/20 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                            }`}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/40 transition-all"
                                    >
                                        Launch Project
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Edit Project Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`relative w-full max-w-2xl rounded-3xl p-8 border shadow-2xl ${isDark ? 'bg-[#0b0d14] border-white/10' : 'bg-white border-slate-200'
                                }`}
                        >
                            <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                <Settings className="text-indigo-500" />
                                Project Settings
                            </h2>
                            <form onSubmit={handleUpdateProject} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Project Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                        className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">GitHub Repository URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={newProject.github_repo}
                                        onChange={(e) => setNewProject({ ...newProject, github_repo: e.target.value })}
                                        placeholder="https://github.com/..."
                                        className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Manifesto / Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                            }`}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/40 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Boss Dashboard - Elite Admin Command Center */}
            <AnimatePresence>
                {isAdminDashboardOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ left: currentSidebarWidth, width: `calc(100% - ${currentSidebarWidth}px)`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        className="fixed top-0 right-0 bottom-0 z-[40] flex flex-col bg-black overflow-y-auto no-scrollbar"
                    >
                        {/* Background Aesthetics */}
                        <div className="fixed inset-0 pointer-events-none opacity-20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent)] blur-[120px]" />
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                        </div>

                        {/* Top Navigation */}
                        <div className="relative z-10 flex items-center justify-between p-8 border-b border-white/5 backdrop-blur-md bg-black/40 sticky top-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Boss Dashboard</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Authorized Personnel Only</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleDeleteProject(selectedProject.id)}
                                    className="px-6 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                >
                                    Terminate Project
                                </button>
                                <button
                                    onClick={() => setIsAdminDashboardOpen(false)}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Main Layout */}
                        <div className="relative z-10 max-w-7xl mx-auto w-full p-8 md:p-12 lg:p-20 grid grid-cols-1 lg:grid-cols-12 gap-16">

                            {/* Left Side: Stats & Members */}
                            <div className="lg:col-span-7 space-y-16">
                                {/* Project Intel Section */}
                                <section>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500">Workforce Status</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
                                            <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Total Squad</p>
                                            <p className="text-3xl font-black italic">{activeMembers.length + 1}</p>
                                        </div>
                                        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
                                            <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Project Age</p>
                                            <p className="text-3xl font-black italic">{Math.floor((new Date() - new Date(selectedProject?.created_at)) / (1000 * 60 * 60 * 24))}d</p>
                                        </div>
                                        <div className="p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20">
                                            <p className="text-[10px] font-black uppercase text-indigo-500 mb-2">Productivity</p>
                                            <p className="text-3xl font-black italic text-indigo-400">High</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Detailed Members List */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-8 bg-purple-500 rounded-full" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500">The Employers</h3>
                                        </div>
                                        <span className="text-[10px] font-black uppercase bg-white/5 px-4 py-2 rounded-full border border-white/5 text-gray-400">
                                            Manage Permissions
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {activeMembers.length === 0 ? (
                                            <div className="p-20 rounded-[4rem] border border-dashed border-white/5 text-center grayscale opacity-30">
                                                <Users className="mx-auto mb-6 opacity-20" size={48} />
                                                <p className="font-black uppercase tracking-widest text-[10px]">No active employers onboarded.</p>
                                            </div>
                                        ) : (
                                            activeMembers.map((member) => (
                                                <div key={member.id} className="group p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-2xl shadow-indigo-500/20">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-black italic uppercase tracking-tight mb-1">{member.name}</h4>
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest">ACCEPTED</span>
                                                                <span className="text-[10px] text-gray-600 font-medium">Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-8">
                                                        <div className="text-right hidden md:block">
                                                            <p className="text-[9px] font-black uppercase text-white/40 mb-1">Key Focus</p>
                                                            <p className="text-xs font-bold text-white italic">{member.contribution}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleKickMember(selectedProject.id, member.id)}
                                                            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                                                        >
                                                            Revoke Access
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Right Side: Integrated Project Controls */}
                            <div className="lg:col-span-5 space-y-12">
                                <section className="p-12 rounded-[4rem] bg-indigo-500/5 border border-indigo-500/10 sticky top-32">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                            <Settings size={20} />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-indigo-500">Core Controls</h3>
                                    </div>

                                    <form onSubmit={handleUpdateProject} className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Project Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={newProject.title}
                                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">GitHub Official Link</label>
                                            <div className="relative">
                                                <Github className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input
                                                    type="url"
                                                    required
                                                    value={newProject.github_repo}
                                                    onChange={(e) => setNewProject({ ...newProject, github_repo: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 p-5 pl-14 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                                                    placeholder="https://github.com/..."
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Project Manifesto</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={newProject.description}
                                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none focus:border-indigo-500 transition-all font-medium text-sm leading-relaxed"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-6 rounded-3xl bg-indigo-600 text-white font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
                                        >
                                            Update Architecture
                                        </button>
                                    </form>

                                    <div className="mt-12 pt-12 border-t border-white/5">
                                        <div className="flex items-center gap-4 text-gray-600 mb-4">
                                            <Lock size={14} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption Enabled</p>
                                        </div>
                                        <p className="text-[10px] leading-relaxed text-gray-700 font-medium italic">
                                            As the project creator, you have absolute authority over the metadata and squad composition. Changes reflect globally across all member rooms.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
