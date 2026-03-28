import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Rocket, Lightbulb, Users, Plus, Check, X,
    MessageCircle, Code, Clock, Shield, Search,
    Briefcase, FileText, Send, Github, ExternalLink as LinkIcon, Lock, Settings,
    Sparkles, Loader2, Brain, ChevronRight, Zap,
    Kanban, ListTodo, PlayCircle, CheckCircle2, Trash2,
    Pencil, GitBranch, Target, TestTube, Ship, ToggleLeft, ToggleRight,
    ChevronLeft, ClipboardList
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../auth/ThemeContext";
import { useSocket } from "../hooks/useSocket";

export default function CreatorCorner() {
    const { theme } = useTheme();
    const [userProfile, setUserProfile] = useState(null);
    const isDark = theme === 'dark';
    const [projects, setProjects] = useState([]);
    const [projectsPage, setProjectsPage] = useState(1);
    const [projectsTotalPages, setProjectsTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
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
    const [isCreating, setIsCreating] = useState(false);
    const [projectPhase, setProjectPhase] = useState('planning');
    const [editingMemberRole, setEditingMemberRole] = useState(null); // memberId
    const [memberRoleInput, setMemberRoleInput] = useState('');

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

    // Squad Chat state
    const socket = useSocket();
    const [chatOpen, setChatOpen] = useState(false);
    const [chatProject, setChatProject] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatScrollRef = useRef(null);
    const currentChatProjectId = useRef(null);

    // AI Advisor state
    const [advisorOpen, setAdvisorOpen] = useState(false);
    const [advisorProject, setAdvisorProject] = useState(null);
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [advisorResult, setAdvisorResult] = useState(null);

    // Team Workspace state
    const [workspaceOpen, setWorkspaceOpen] = useState(false);
    const [workspaceProject, setWorkspaceProject] = useState(null);
    const [workspaceTasks, setWorkspaceTasks] = useState([]);
    const [workspaceLoading, setWorkspaceLoading] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');

    // Weekly Reports state
    const [workspaceTab, setWorkspaceTab]             = useState('tasks');
    const [reportRoster, setReportRoster]             = useState([]);
    const [reportWeekStart, setReportWeekStart]       = useState('');
    const [reportsLoading, setReportsLoading]         = useState(false);
    const [reportForm, setReportForm]                 = useState({ what_done: '', what_next: '', blockers: '' });
    const [reportSubmitting, setReportSubmitting]     = useState(false);
    const [editingMyReport, setEditingMyReport]       = useState(false);
    const [reportWeekOffset, setReportWeekOffset]     = useState(0);
    const [memberReportStatus, setMemberReportStatus] = useState({});

    // Socket: Squad Chat events
    useEffect(() => {
        if (!socket) return;
        const handleMessage = (msg) => {
            setChatMessages(prev => [...prev, msg]);
        };
        socket.on('squad_message', handleMessage);
        return () => socket.off('squad_message', handleMessage);
    }, [socket]);

    // Auto-scroll chat
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const openSquadChat = async (project) => {
        // Leave old room if switching
        if (currentChatProjectId.current && currentChatProjectId.current !== project.id) {
            socket?.emit('leave_squad_room', { projectId: currentChatProjectId.current });
        }
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName') || 'Scholar';
        socket?.emit('join_squad_room', { projectId: project.id, userId, userName });
        currentChatProjectId.current = project.id;
        setChatProject(project);
        setChatMessages([]);
        setChatOpen(true);
        try {
            const res = await api.get(`/projects/${project.id}/chat`);
            setChatMessages(res.data.map(m => ({
                userId: m.user_id,
                userName: m.user_name,
                text: m.text,
                ts: new Date(m.created_at).getTime()
            })));
        } catch (_) {
            // History unavailable — chat still works live
        }
    };

    const sendChatMessage = () => {
        if (!chatInput.trim() || !chatProject) return;
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName') || 'Scholar';
        socket?.emit('squad_message', {
            projectId: chatProject.id,
            userId,
            userName,
            text: chatInput.trim()
        });
        setChatInput('');
    };

    const runAdvisor = async (project) => {
        setAdvisorProject(project);
        setAdvisorResult(null);
        setAdvisorOpen(true);
        setAdvisorLoading(true);
        try {
            const res = await api.post('/ai/projects/analyze', {
                title: project.title,
                description: project.description,
                skills: project.skills_required || [],
                memberCount: (activeMembers?.length || 0) + 1
            });
            setAdvisorResult(res.data);
        } catch {
            setAdvisorResult({ verdict: 'Analysis failed. Check your connection.', score: 0, stack: [], roles: [], sprints: [], risks: [] });
        } finally {
            setAdvisorLoading(false);
        }
    };

    const openWorkspace = async (project) => {
        setWorkspaceProject(project);
        setWorkspaceOpen(true);
        setWorkspaceTab('tasks');
        setReportWeekOffset(0);
        setWorkspaceLoading(true);
        try {
            const res = await api.get(`/projects/${project.id}/tasks`);
            setWorkspaceTasks(res.data);
        } catch {
            setWorkspaceTasks([]);
        } finally {
            setWorkspaceLoading(false);
        }
    };

    const fetchReports = async (projectId, offsetWeeks = 0) => {
        setReportsLoading(true);
        try {
            const target = new Date();
            const day = target.getDay() || 7;
            target.setDate(target.getDate() - (day - 1) + offsetWeeks * 7);
            const weekParam = target.toISOString().slice(0, 10);
            const res = await api.get(`/projects/${projectId}/reports?week=${weekParam}`);
            setReportRoster(res.data.roster || []);
            setReportWeekStart(res.data.week_start || weekParam);
            const myId = parseInt(localStorage.getItem('userId'));
            const myEntry = (res.data.roster || []).find(r => r.user_id === myId);
            if (myEntry?.submitted && myEntry.report) {
                setReportForm({
                    what_done: myEntry.report.what_done || '',
                    what_next: myEntry.report.what_next || '',
                    blockers:  myEntry.report.blockers  || '',
                });
                setEditingMyReport(false);
            } else {
                setReportForm({ what_done: '', what_next: '', blockers: '' });
                setEditingMyReport(true);
            }
        } catch {
            setReportRoster([]);
        } finally {
            setReportsLoading(false);
        }
    };

    const handleWorkspaceTabChange = (tab) => {
        setWorkspaceTab(tab);
        if (tab === 'reports' && workspaceProject) {
            fetchReports(workspaceProject.id, reportWeekOffset);
        }
    };

    const navigateReportWeek = (direction) => {
        const newOffset = reportWeekOffset + direction;
        if (newOffset > 0) return;
        setReportWeekOffset(newOffset);
        fetchReports(workspaceProject.id, newOffset);
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        if (!workspaceProject || reportSubmitting) return;
        setReportSubmitting(true);
        try {
            await api.post(`/projects/${workspaceProject.id}/reports`, reportForm);
            toast.success('Weekly report submitted!');
            setEditingMyReport(false);
            fetchReports(workspaceProject.id, reportWeekOffset);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setReportSubmitting(false);
        }
    };

    const addTask = async () => {
        if (!newTaskTitle.trim() || !workspaceProject) return;
        try {
            const res = await api.post(`/projects/${workspaceProject.id}/tasks`, {
                title: newTaskTitle.trim(),
                assignee_name: newTaskAssignee.trim() || null
            });
            setWorkspaceTasks(prev => [...prev, res.data]);
            setNewTaskTitle('');
            setNewTaskAssignee('');
        } catch {
            toast.error('Failed to add task');
        }
    };

    const moveTask = async (taskId, newStatus) => {
        try {
            const res = await api.patch(`/projects/${workspaceProject.id}/tasks/${taskId}`, { status: newStatus });
            setWorkspaceTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
        } catch {
            toast.error('Failed to update task');
        }
    };

    const removeTask = async (taskId) => {
        try {
            await api.delete(`/projects/${workspaceProject.id}/tasks/${taskId}`);
            setWorkspaceTasks(prev => prev.filter(t => t.id !== taskId));
        } catch {
            toast.error('Failed to delete task');
        }
    };

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
                const res = await api.get("/projects?page=1&limit=12");
                setProjects(res.data.projects || res.data);
                setProjectsPage(1);
                setProjectsTotalPages(res.data.totalPages || 1);
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
        if (isCreating) return;
        setIsCreating(true);
        try {
            await api.post("/projects", {
                ...newProject,
                skills_required: newProject.skills.split(',').map(s => s.trim())
            });
            setIsCreateModalOpen(false);
            setNewProject({ title: "", description: "", skills: "", github_repo: "" });
            fetchData();
        } catch (err) {
            toast.error("Failed to create project");
        } finally {
            setIsCreating(false);
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
            toast.success("Application sent successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send request");
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
            toast.success("Project updated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update project");
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("CRITICAL: Are you sure you want to terminate this project? This action cannot be undone.")) return; // eslint-disable-line no-restricted-globals
        try {
            await api.delete(`/projects/${projectId}`);
            setIsAdminDashboardOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Failed to delete project");
        }
    };

    const handleKickMember = async (projectId, userId) => {
        if (!window.confirm("Are you sure you want to remove this member from the squad?")) return; // eslint-disable-line no-restricted-globals
        try {
            await api.delete(`/projects/${projectId}/members/${userId}`);
            fetchMembers(projectId);
            toast.success("Member removed from squad");
        } catch (err) {
            toast.error("Failed to remove member");
        }
    };

    const fetchMembers = async (projectId) => {
        try {
            const [membersRes, reportsRes] = await Promise.all([
                api.get(`/projects/${projectId}/members`),
                api.get(`/projects/${projectId}/reports`),
            ]);
            setActiveMembers(membersRes.data);
            const statusMap = {};
            (reportsRes.data.roster || []).forEach(r => { statusMap[r.user_id] = r.submitted; });
            setMemberReportStatus(statusMap);
        } catch (err) {
            console.error("Failed to fetch members", err);
        }
    };

    const handleUpdatePhase = async (phase) => {
        if (!selectedProject) return;
        try {
            await api.patch(`/projects/${selectedProject.id}/phase`, { phase });
            setProjectPhase(phase);
            toast.success(`Phase updated to ${phase}`);
        } catch {
            toast.error('Failed to update phase');
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedProject) return;
        const newStatus = selectedProject.status === 'open' ? 'closed' : 'open';
        try {
            await api.patch(`/projects/${selectedProject.id}/status`, { status: newStatus });
            setSelectedProject(prev => ({ ...prev, status: newStatus }));
            toast.success(`Project is now ${newStatus}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleSaveMemberRole = async (memberId) => {
        if (!selectedProject) return;
        try {
            await api.patch(`/projects/${selectedProject.id}/members/${memberId}/role`, { role: memberRoleInput });
            setActiveMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: memberRoleInput } : m));
            setEditingMemberRole(null);
            setMemberRoleInput('');
        } catch {
            toast.error('Failed to update role');
        }
    };

    const handleRequestAction = async (requestId, status) => {
        try {
            await api.patch(`/projects/requests/${requestId}`, { status });
            fetchData();
        } catch (err) {
            toast.error("Failed to update request");
        }
    };

    const loadMoreProjects = async () => {
        if (loadingMore || projectsPage >= projectsTotalPages) return;
        setLoadingMore(true);
        try {
            const nextPage = projectsPage + 1;
            const res = await api.get(`/projects?page=${nextPage}&limit=12`);
            setProjects(prev => [...prev, ...(res.data.projects || [])]);
            setProjectsPage(nextPage);
            setProjectsTotalPages(res.data.totalPages || projectsTotalPages);
        } catch (err) {
            console.error("Failed to load more projects", err);
        } finally {
            setLoadingMore(false);
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
        <div className={`min-h-screen pt-16 pb-32 px-6 lg:px-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                            : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                            }`}
                    >
                        My Projects
                    </button>
                    <button
                        onClick={() => setActiveView(activeView === 'manage' ? 'browse' : 'manage')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all border ${activeView === 'manage'
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                            : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
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
                    <>
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

                                <div className={`flex items-center justify-between pt-6 border-t mt-auto ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                            {project.owner_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold leading-none">{project.owner_name}</p>
                                            <p className="text-[10px] text-gray-500">Creator</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => runAdvisor(project)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <Brain size={12} /> AI
                                        </button>
                                        {project.owner_id === userProfile?.id ? (
                                            <button
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setProjectPhase(project.phase || 'planning');
                                                    fetchMembers(project.id);
                                                    setIsAdminDashboardOpen(true);
                                                }}
                                                className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                                            >
                                                <Settings size={14} /> Manage
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
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                    {projectsPage < projectsTotalPages && (
                        <div className="flex justify-center mt-10">
                            <button
                                onClick={loadMoreProjects}
                                disabled={loadingMore}
                                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all font-black uppercase text-[11px] tracking-widest disabled:opacity-50"
                            >
                                {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                    </>
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
                                                        <h4 className={`text-lg font-black italic uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.requester_name}</h4>
                                                        <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest">Applying for {req.project_title}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                    <div className={`p-4 rounded-3xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2 flex items-center gap-2"><Code size={12} /> Stack & Skills</p>
                                                        <p className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{req.skills || "Not specified"}</p>
                                                    </div>
                                                    <div className={`p-4 rounded-3xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2 flex items-center gap-2"><Briefcase size={12} /> Role Contribution</p>
                                                        <p className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{req.contribution || "Not specified"}</p>
                                                    </div>
                                                </div>

                                                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 italic">
                                                    <p className="text-[10px] font-black uppercase text-indigo-400 mb-2 flex items-center gap-2"><FileText size={12} /> Motivation Letter</p>
                                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-indigo-100/60' : 'text-indigo-800/70'}`}>"{req.motivation || req.message}"</p>
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
                                                            className={`w-full px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-2 border ${isDark ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-400'}`}
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
                                                    <h3 className={`text-2xl font-black italic uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{squad.title}</h3>
                                                    <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.3em]">Operational Phase</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <span className={`text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full border ${isDark ? 'text-white/40 bg-white/5 border-white/5' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
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

                                        <p className={`text-sm leading-relaxed mb-10 font-medium italic ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
                                            "{squad.description}"
                                        </p>

                                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                                            <a
                                                href={squad.github_repo || "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between p-5 rounded-[1.5rem] bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all group/btn"
                                            >
                                                Repository
                                                <LinkIcon size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                            </a>
                                            <button
                                                onClick={() => openWorkspace(squad)}
                                                className="flex items-center justify-between p-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                            >
                                                Workspace
                                                <Kanban size={16} />
                                            </button>
                                            <button
                                                onClick={() => openSquadChat(squad)}
                                                className="flex items-center justify-between p-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
                                            >
                                                Squad Chat
                                                <MessageCircle size={16} />
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
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className={`relative w-full max-w-3xl rounded-[3rem] p-12 border shadow-lg ${isDark ? 'bg-[#0a0c10] border-white/10' : 'bg-white border-slate-200'
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
                                            className={`w-full p-5 rounded-2xl border outline-none focus:border-purple-500/50 transition-all font-medium ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
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
                                            className={`w-full p-5 rounded-2xl border outline-none focus:border-purple-500/50 transition-all font-medium ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
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
                                        className={`w-full p-6 rounded-3xl border outline-none focus:border-purple-500/50 transition-all font-medium leading-relaxed ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsJoinModalOpen(false)}
                                        className={`flex-1 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest border hover:bg-white/5 transition-all ${isDark ? 'border-white/5 text-white/40' : 'border-slate-200 text-slate-400'}`}
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
                                        className={`flex-1 py-4 rounded-xl font-bold border hover:bg-white/5 transition-all ${isDark ? 'border-white/10' : 'border-slate-200'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isCreating ? "Creating…" : "Launch Project"}
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
                                        className={`flex-1 py-4 rounded-xl font-bold border hover:bg-white/5 transition-all ${isDark ? 'border-white/10' : 'border-slate-200'}`}
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
            {/* ── Boss Dashboard ── */}
            <AnimatePresence>
                {isAdminDashboardOpen && selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ left: currentSidebarWidth, width: `calc(100% - ${currentSidebarWidth}px)`, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}
                        className={`fixed top-0 right-0 bottom-0 z-[40] overflow-y-auto no-scrollbar ${isDark ? 'bg-[#060810]' : 'bg-slate-50'}`}
                    >
                        {/* Ambient gradient */}
                        <div className="pointer-events-none fixed inset-0 overflow-hidden">
                            <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-600/8 blur-[120px] rounded-full" />
                            <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-600/6 blur-[100px] rounded-full" />
                        </div>

                        {/* ── Header ── */}
                        <div className={`sticky top-0 z-20 flex items-center justify-between px-8 py-5 border-b backdrop-blur-xl ${isDark ? 'bg-[#060810]/80 border-white/5' : 'bg-slate-50/80 border-slate-200'}`}>
                            <div className="flex items-center gap-4 min-w-0">
                                <button
                                    onClick={() => setIsAdminDashboardOpen(false)}
                                    className={`p-2 rounded-xl border shrink-0 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    <X size={18} />
                                </button>
                                <div className="min-w-0">
                                    <h2 className={`text-lg font-black uppercase tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedProject.title}</h2>
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500">Project Command Center</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={() => { runAdvisor(selectedProject); }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    <Brain size={14} /> AI Analysis
                                </button>
                                <button
                                    onClick={() => openSquadChat(selectedProject)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    <MessageCircle size={14} /> Squad Chat
                                </button>
                                <button
                                    onClick={() => handleDeleteProject(selectedProject.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    Terminate
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-10 space-y-8">

                            {/* ── Stats Strip ── */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Squad Size', value: activeMembers.length + 1, suffix: ' members', color: 'indigo' },
                                    { label: 'Days Active', value: Math.floor((new Date() - new Date(selectedProject.created_at)) / 86400000), suffix: 'd', color: 'purple' },
                                    { label: 'Tech Stack', value: selectedProject.skills_required?.length || 0, suffix: ' skills', color: 'emerald' },
                                    { label: 'Status', value: selectedProject.status === 'open' ? 'Open' : 'Closed', suffix: '', color: selectedProject.status === 'open' ? 'emerald' : 'amber' },
                                ].map((stat) => (
                                    <div key={stat.label} className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200'}`}>
                                        <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                                        <p className={`text-2xl font-black tabular-nums ${stat.color === 'indigo' ? 'text-indigo-400' : stat.color === 'purple' ? 'text-purple-400' : stat.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {stat.value}<span className="text-sm font-bold opacity-60">{stat.suffix}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* ── Project Phase Tracker ── */}
                            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <p className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Project Phase</p>
                                    <button
                                        onClick={handleToggleStatus}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedProject.status === 'open' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'}`}
                                    >
                                        {selectedProject.status === 'open' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                        {selectedProject.status === 'open' ? 'Open' : 'Closed'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {[
                                        { key: 'planning', label: 'Planning', icon: Target },
                                        { key: 'building', label: 'Building', icon: GitBranch },
                                        { key: 'testing',  label: 'Testing',  icon: TestTube },
                                        { key: 'shipped',  label: 'Shipped',  icon: Ship },
                                    ].map(ph => {
                                        const Icon = ph.icon;
                                        const isActive = projectPhase === ph.key;
                                        return (
                                            <button
                                                key={ph.key}
                                                onClick={() => handleUpdatePhase(ph.key)}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' : isDark ? 'bg-white/[0.02] border-white/5 text-slate-600 hover:text-slate-400 hover:border-white/10' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                            >
                                                <Icon size={16} className={isActive ? 'text-indigo-400' : ''} />
                                                {ph.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Skills Tags ── */}
                            {selectedProject.skills_required?.length > 0 && (
                                <div className={`p-5 rounded-2xl border flex flex-wrap gap-2 items-center ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200'}`}>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.4em] mr-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Stack</span>
                                    {selectedProject.skills_required.map((skill, i) => (
                                        <span key={i} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>{skill}</span>
                                    ))}
                                </div>
                            )}

                            {/* ── Main 2-col ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Team — 2 cols */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Team Members</p>
                                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{activeMembers.length + 1} total</span>
                                    </div>

                                    {/* Creator row */}
                                    <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                                                {userProfile?.name?.charAt(0) || 'Y'}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{userProfile?.name || 'You'}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Project Creator</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {memberReportStatus[selectedProject?.owner_id] !== undefined && (
                                                <div
                                                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${memberReportStatus[selectedProject.owner_id] ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                                    title={memberReportStatus[selectedProject.owner_id] ? 'Report submitted' : 'Report pending'}
                                                />
                                            )}
                                            <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">Admin</span>
                                        </div>
                                    </div>

                                    {/* Members */}
                                    {activeMembers.length === 0 ? (
                                        <div className={`p-12 rounded-2xl border border-dashed text-center opacity-30 ${isDark ? 'border-white/10' : 'border-slate-300'}`}>
                                            <Users className="mx-auto mb-3" size={32} />
                                            <p className="text-xs font-black uppercase tracking-widest">No members yet. Accept applications to grow your squad.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {activeMembers.map((member) => (
                                                <div key={member.id} className={`group p-4 rounded-2xl border transition-all hover:border-indigo-500/20 ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-black text-white shrink-0">
                                                                {member.name.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{member.name}</p>
                                                                <p className={`text-[9px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{member.contribution || 'Contributor'} · Joined {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {memberReportStatus[member.id] !== undefined && (
                                                                <div
                                                                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${memberReportStatus[member.id] ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                                                    title={memberReportStatus[member.id] ? 'Report submitted' : 'Report pending'}
                                                                />
                                                            )}
                                                            {member.role && editingMemberRole !== member.id && (
                                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-600'}`}>{member.role}</span>
                                                            )}
                                                            <button
                                                                onClick={() => { setEditingMemberRole(member.id); setMemberRoleInput(member.role || ''); }}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-white/10 text-slate-500 hover:text-indigo-400"
                                                                title="Assign role"
                                                            >
                                                                <Pencil size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleKickMember(selectedProject.id, member.id)}
                                                                className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide border border-transparent transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-slate-500"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {editingMemberRole === member.id && (
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                value={memberRoleInput}
                                                                onChange={e => setMemberRoleInput(e.target.value)}
                                                                onKeyDown={e => { if (e.key === 'Enter') handleSaveMemberRole(member.id); if (e.key === 'Escape') setEditingMemberRole(null); }}
                                                                placeholder="e.g. Frontend Dev, UI/UX..."
                                                                className={`flex-1 text-xs rounded-xl border px-3 py-2 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`}
                                                            />
                                                            <button onClick={() => handleSaveMemberRole(member.id)} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">Save</button>
                                                            <button onClick={() => setEditingMemberRole(null)} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${isDark ? 'border-white/10 text-slate-500 hover:bg-white/5' : 'border-slate-200 text-slate-400'}`}>Cancel</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Controls — 1 col */}
                                <div className="space-y-4">
                                    <p className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Project Settings</p>

                                    <form onSubmit={handleUpdateProject} className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200'}`}>
                                        <div>
                                            <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={newProject.title}
                                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                                className={`w-full border p-3 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-semibold ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>GitHub</label>
                                            <div className="relative">
                                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                                <input
                                                    type="url"
                                                    required
                                                    value={newProject.github_repo}
                                                    onChange={(e) => setNewProject({ ...newProject, github_repo: e.target.value })}
                                                    className={`w-full border p-3 pl-9 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-semibold ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                                    placeholder="https://github.com/..."
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Description</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={newProject.description}
                                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                                className={`w-full border p-3 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium leading-relaxed ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all"
                                        >
                                            Save Changes
                                        </button>
                                    </form>

                                    {/* Danger Zone */}
                                    <div className={`p-4 rounded-2xl border border-red-500/10 ${isDark ? 'bg-red-500/[0.03]' : 'bg-red-50'}`}>
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500/70 mb-3">Danger Zone</p>
                                        <button
                                            onClick={() => handleDeleteProject(selectedProject.id)}
                                            className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            Permanently Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Squad Chat Panel ── */}
            <AnimatePresence>
                {chatOpen && chatProject && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setChatOpen(false)}
                            className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`fixed top-0 right-0 bottom-0 z-[130] w-full max-w-md flex flex-col shadow-2xl ${isDark ? 'bg-[#08090f] border-l border-white/5' : 'bg-white border-l border-slate-200'}`}
                        >
                            {/* Header */}
                            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{chatProject.title}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500">Squad Comms · Live</p>
                                    </div>
                                </div>
                                <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                                {chatMessages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-3">
                                        <MessageCircle size={32} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No messages yet. Say something.</p>
                                    </div>
                                )}
                                {chatMessages.map((msg, i) => {
                                    const myId = localStorage.getItem('userId');
                                    const isMe = String(msg.userId) === String(myId);
                                    return (
                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                                {!isMe && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 pl-1">{msg.userName}</span>
                                                )}
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                    : isDark ? 'bg-white/5 border border-white/5 text-white/80 rounded-tl-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                                                }`}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[8px] text-slate-600 px-1">
                                                    {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input */}
                            <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                                <div className={`flex gap-2 items-center rounded-2xl border p-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                                        placeholder="Message your squad..."
                                        className="flex-1 bg-transparent outline-none text-sm px-2 placeholder:text-slate-500"
                                    />
                                    <button
                                        onClick={sendChatMessage}
                                        disabled={!chatInput.trim()}
                                        className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Team Workspace Modal ── */}
            <AnimatePresence>
                {workspaceOpen && workspaceProject && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setWorkspaceOpen(false)}
                            className="absolute inset-0 bg-black/75 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.93, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.93, opacity: 0, y: 20 }}
                            className={`relative w-full max-w-5xl max-h-[88vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${isDark ? 'bg-[#08090f] border-white/10' : 'bg-white border-slate-200'}`}
                        >
                            {/* Header */}
                            <div className={`flex items-center justify-between px-8 py-5 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Kanban size={20} />
                                    </div>
                                    <div>
                                        <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Team Workspace</h2>
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500">{workspaceProject.title}</p>
                                    </div>
                                </div>
                                <button onClick={() => setWorkspaceOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tab bar */}
                            <div className={`flex items-center gap-1 px-6 py-3 border-b ${isDark ? 'border-white/5 bg-white/[0.01]' : 'border-slate-200 bg-slate-50/50'}`}>
                                {[
                                    { key: 'tasks',   label: 'Tasks',   icon: Kanban },
                                    { key: 'reports', label: 'Reports', icon: ClipboardList },
                                ].map(tab => {
                                    const TabIcon = tab.icon;
                                    const isActive = workspaceTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleWorkspaceTabChange(tab.key)}
                                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                isActive
                                                    ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                                                    : isDark ? 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/5' : 'text-slate-400 hover:text-slate-600 border border-transparent'
                                            }`}
                                        >
                                            <TabIcon size={13} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {workspaceTab === 'tasks' ? (
                                <>
                                    {/* Add Task bar */}
                                    <div className={`px-8 py-4 border-b flex gap-3 items-center ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                                        <input
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={e => setNewTaskTitle(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addTask()}
                                            placeholder="Add a task..."
                                            className={`flex-1 text-sm rounded-xl border px-4 py-2.5 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50' : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'}`}
                                        />
                                        <input
                                            type="text"
                                            value={newTaskAssignee}
                                            onChange={e => setNewTaskAssignee(e.target.value)}
                                            placeholder="Assign to..."
                                            className={`w-36 text-sm rounded-xl border px-4 py-2.5 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-900'}`}
                                        />
                                        <button
                                            onClick={addTask}
                                            disabled={!newTaskTitle.trim()}
                                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>

                                    {/* Kanban Board */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        {workspaceLoading ? (
                                            <div className="flex justify-center py-20">
                                                <Loader2 className="animate-spin text-emerald-500" size={28} />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                {[
                                                    { key: 'todo',        label: 'To Do',       icon: ListTodo,     color: 'blue'    },
                                                    { key: 'in_progress', label: 'In Progress', icon: PlayCircle,   color: 'amber'   },
                                                    { key: 'done',        label: 'Done',        icon: CheckCircle2, color: 'emerald' },
                                                ].map(col => {
                                                    const tasks = workspaceTasks.filter(t => t.status === col.key);
                                                    const ColIcon = col.icon;
                                                    const colColors = {
                                                        blue:    { header: 'text-blue-400',    border: 'border-blue-500/20',    bg: 'bg-blue-500/5'    },
                                                        amber:   { header: 'text-amber-400',   border: 'border-amber-500/20',   bg: 'bg-amber-500/5'   },
                                                        emerald: { header: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
                                                    };
                                                    const c = colColors[col.color];
                                                    return (
                                                        <div key={col.key} className={`rounded-2xl border p-4 ${isDark ? `${c.bg} ${c.border}` : 'bg-slate-50 border-slate-200'}`}>
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <ColIcon size={14} className={c.header} />
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${c.header}`}>{col.label}</span>
                                                                <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5 text-white/30' : 'bg-white text-slate-400 border border-slate-200'}`}>{tasks.length}</span>
                                                            </div>
                                                            <div className="space-y-2 min-h-[80px]">
                                                                {tasks.length === 0 && (
                                                                    <p className="text-center text-[10px] text-white/10 py-6 border border-dashed border-white/5 rounded-xl">Empty</p>
                                                                )}
                                                                {tasks.map(task => (
                                                                    <div key={task.id} className={`group p-3 rounded-xl border transition-all ${isDark ? 'bg-white/[0.04] border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                                                                        <p className={`text-sm font-semibold leading-snug mb-2 ${isDark ? 'text-white/80' : 'text-slate-800'}`}>{task.title}</p>
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-1">
                                                                                {task.assignee_name && (
                                                                                    <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                                                                                        {task.assignee_name}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                {col.key !== 'todo' && (
                                                                                    <button onClick={() => moveTask(task.id, col.key === 'in_progress' ? 'todo' : 'in_progress')} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all" title="Move left">
                                                                                        <ChevronRight size={12} className="rotate-180" />
                                                                                    </button>
                                                                                )}
                                                                                {col.key !== 'done' && (
                                                                                    <button onClick={() => moveTask(task.id, col.key === 'todo' ? 'in_progress' : 'done')} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all" title="Move right">
                                                                                        <ChevronRight size={12} />
                                                                                    </button>
                                                                                )}
                                                                                <button onClick={() => removeTask(task.id)} className="p-1 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
                                                                                    <Trash2 size={11} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* ── Reports Tab ── */
                                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                    {/* Week navigation */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => navigateReportWeek(-1)}
                                            className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <div className="text-center">
                                            <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Week of</p>
                                            <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {reportWeekStart
                                                    ? new Date(reportWeekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                    : '—'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigateReportWeek(+1)}
                                            disabled={reportWeekOffset >= 0}
                                            className={`p-2 rounded-xl border transition-all ${reportWeekOffset >= 0 ? 'opacity-30 cursor-not-allowed' : ''} ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    {reportsLoading ? (
                                        <div className="flex justify-center py-16">
                                            <Loader2 className="animate-spin text-emerald-500" size={24} />
                                        </div>
                                    ) : (() => {
                                        const myId = parseInt(localStorage.getItem('userId'));
                                        const myEntry = reportRoster.find(r => r.user_id === myId);
                                        const hasSubmitted = myEntry?.submitted;
                                        const teamRoster = reportRoster.filter(r => r.user_id !== myId);
                                        return (
                                            <>
                                                {/* Your report card */}
                                                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Your Weekly Report</p>
                                                        {hasSubmitted && !editingMyReport && (
                                                            <button
                                                                onClick={() => setEditingMyReport(true)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                                            >
                                                                <Pencil size={11} /> Edit
                                                            </button>
                                                        )}
                                                    </div>

                                                    {hasSubmitted && !editingMyReport ? (
                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>What I accomplished</p>
                                                                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{myEntry.report.what_done}</p>
                                                            </div>
                                                            <div>
                                                                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Plan for next week</p>
                                                                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{myEntry.report.what_next}</p>
                                                            </div>
                                                            {myEntry.report.blockers && (
                                                                <div>
                                                                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-amber-500">Blockers</p>
                                                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-amber-200/70' : 'text-amber-700'}`}>{myEntry.report.blockers}</p>
                                                                </div>
                                                            )}
                                                            <p className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                                                Last updated {new Date(myEntry.report.updated_at + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <form onSubmit={handleSubmitReport} className="space-y-4">
                                                            <div>
                                                                <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>What I accomplished this week *</label>
                                                                <textarea
                                                                    required
                                                                    rows={3}
                                                                    value={reportForm.what_done}
                                                                    onChange={e => setReportForm(p => ({ ...p, what_done: e.target.value }))}
                                                                    placeholder="Completed the auth module, reviewed PRs, fixed the layout bug..."
                                                                    className={`w-full text-sm rounded-2xl border px-4 py-3 outline-none transition-all leading-relaxed resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50' : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-400'}`}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Plan for next week *</label>
                                                                <textarea
                                                                    required
                                                                    rows={3}
                                                                    value={reportForm.what_next}
                                                                    onChange={e => setReportForm(p => ({ ...p, what_next: e.target.value }))}
                                                                    placeholder="Start the dashboard, integrate the API, write tests..."
                                                                    className={`w-full text-sm rounded-2xl border px-4 py-3 outline-none transition-all leading-relaxed resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50' : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-400'}`}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Blockers (optional)</label>
                                                                <textarea
                                                                    rows={2}
                                                                    value={reportForm.blockers}
                                                                    onChange={e => setReportForm(p => ({ ...p, blockers: e.target.value }))}
                                                                    placeholder="Waiting on API access, blocked by design review..."
                                                                    className={`w-full text-sm rounded-2xl border px-4 py-3 outline-none transition-all leading-relaxed resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-amber-500/30' : 'bg-white border-slate-200 text-slate-900 focus:border-amber-400'}`}
                                                                />
                                                            </div>
                                                            <div className="flex gap-3 pt-1">
                                                                {hasSubmitted && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingMyReport(false)}
                                                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isDark ? 'border-white/10 text-slate-500 hover:bg-white/5' : 'border-slate-200 text-slate-400'}`}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="submit"
                                                                    disabled={reportSubmitting}
                                                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    {reportSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                                    {reportSubmitting ? 'Submitting...' : hasSubmitted ? 'Update Report' : 'Submit Report'}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}
                                                </div>

                                                {/* Team updates */}
                                                {teamRoster.length > 0 && (
                                                    <div className="space-y-3">
                                                        <p className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            Team Updates — {reportRoster.filter(r => r.submitted).length}/{reportRoster.length} submitted
                                                        </p>
                                                        {teamRoster.map(entry => (
                                                            <div
                                                                key={entry.user_id}
                                                                className={`p-5 rounded-2xl border transition-all ${
                                                                    entry.submitted
                                                                        ? isDark ? 'bg-white/[0.03] border-white/8' : 'bg-white border-slate-200'
                                                                        : isDark ? 'bg-white/[0.01] border-white/5 opacity-50' : 'bg-slate-50 border-slate-200 opacity-60'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 ${entry.submitted ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : isDark ? 'bg-white/10' : 'bg-slate-300'}`}>
                                                                        {entry.user_name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{entry.user_name}</p>
                                                                        {entry.submitted
                                                                            ? <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Submitted</p>
                                                                            : <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Not submitted yet</p>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                {entry.submitted && entry.report && (
                                                                    <div className="space-y-3 pl-12">
                                                                        <div>
                                                                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Accomplished</p>
                                                                            <p className={`text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{entry.report.what_done}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Next week</p>
                                                                            <p className={`text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{entry.report.what_next}</p>
                                                                        </div>
                                                                        {entry.report.blockers && (
                                                                            <div>
                                                                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-amber-500">Blockers</p>
                                                                                <p className={`text-sm leading-relaxed ${isDark ? 'text-amber-200/60' : 'text-amber-700'}`}>{entry.report.blockers}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── AI Project Advisor Modal ── */}
            <AnimatePresence>
                {advisorOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAdvisorOpen(false)}
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] border shadow-2xl ${isDark ? 'bg-[#08090f] border-white/10' : 'bg-white border-slate-200'}`}
                        >
                            {/* Modal Header */}
                            <div className={`sticky top-0 z-10 flex items-center justify-between p-8 pb-6 border-b backdrop-blur-md ${isDark ? 'bg-[#08090f]/80 border-white/5' : 'bg-white/90 border-slate-200'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                        <Brain size={24} />
                                    </div>
                                    <div>
                                        <h2 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Project Advisor</h2>
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-500 truncate max-w-[240px]">{advisorProject?.title}</p>
                                    </div>
                                </div>
                                <button onClick={() => setAdvisorOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {advisorLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="animate-spin text-purple-500" size={36} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Analyzing project...</p>
                                    </div>
                                ) : advisorResult ? (
                                    <>
                                        {/* Score + Verdict */}
                                        <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/15 flex items-start gap-5">
                                            <div className="shrink-0 text-center">
                                                <p className={`text-4xl font-black tabular-nums ${advisorResult.score >= 75 ? 'text-emerald-400' : advisorResult.score >= 55 ? 'text-amber-400' : 'text-red-400'}`}>{advisorResult.score}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">/ 100</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1.5 flex items-center gap-2"><Zap size={10} /> Verdict</p>
                                                <p className={`text-sm font-bold italic leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{advisorResult.verdict}</p>
                                            </div>
                                        </div>

                                        {/* Suggested Stack */}
                                        {advisorResult.stack?.length > 0 && (
                                            <div>
                                                <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Recommended Stack</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {advisorResult.stack.map((tech, i) => (
                                                        <span key={i} className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide border ${isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>{tech}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sprint Plan */}
                                        {advisorResult.sprints?.length > 0 && (
                                            <div>
                                                <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sprint Roadmap</p>
                                                <div className="space-y-2">
                                                    {advisorResult.sprints.map((s, i) => (
                                                        <div key={i} className={`flex gap-4 items-start p-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 shrink-0 pt-0.5">{s.week}</span>
                                                            <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{s.goal}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Roles Needed */}
                                        {advisorResult.roles?.length > 0 && (
                                            <div>
                                                <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Key Roles to Fill</p>
                                                <div className="space-y-2">
                                                    {advisorResult.roles.map((r, i) => (
                                                        <div key={i} className="flex items-start gap-3">
                                                            <ChevronRight size={14} className="text-purple-400 shrink-0 mt-0.5" />
                                                            <div>
                                                                <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.title}</span>
                                                                <span className={`text-xs ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>— {r.reason}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Risks */}
                                        {advisorResult.risks?.length > 0 && (
                                            <div>
                                                <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Risk Flags</p>
                                                <div className="space-y-1.5">
                                                    {advisorResult.risks.map((risk, i) => (
                                                        <div key={i} className="flex items-center gap-2.5 text-xs text-amber-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                                            {risk}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

