import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap, LayoutGrid, Network, BookOpen, Users, User,
    Sun, Moon, ChevronLeft, PanelLeftClose, PanelLeftOpen, Activity, Rocket,
    Briefcase, FileText, Swords, Film, X
} from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import mustLogo from "../assets/must_logo.png";
import { LogOut, Settings } from "lucide-react";

// Star particles for Sidebar
const StarParticles = () => {
    const stars = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        width: star.size,
                        height: star.size,
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                    }}
                    animate={{
                        opacity: [0.1, 0.8, 0.1],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};


export default function Sidebar({ isCollapsed, toggleSidebar, mobileOpen = false, onMobileClose }) {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const location = useLocation();
    const [stats, setStats] = useState(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await api.get("/dashboard/stats");
                setStats(res.data);
            } catch (err) {
                console.warn("Sidebar stats failed", err);
                setStats({ user: { name: "Scholar" } });
            }
        };
        loadStats();
    }, []);

    const userName = stats?.user?.name || "Scholar";
    const userInitial = userName.charAt(0);

    const navItems = [
        { name: "Dashboard", icon: LayoutGrid, path: "/dashboard", id: "dashboard" },
        { name: "Knowledge Map", icon: Network, path: "/knowledge-map", id: "knowledge-map", badge: "Active" },
        { name: "Library", icon: BookOpen, path: "/library", id: "library" },
        { name: "CS Documentary", icon: Film, path: "/podcast-studio", id: "podcast-studio", badge: "AI" },
        { name: "Boardroom", icon: Briefcase, path: "/interview-boardroom", id: "interview", badge: "AI" },
        { name: "Creator Corner", icon: Rocket, path: "/creator-corner", id: "creator-corner", badge: "Elite" },
        { name: "Market Pulse", icon: Activity, path: "/market", id: "market", badge: "LIVE" },
        { name: "Neural Clash", icon: Swords, path: "/neural-clash", id: "neural-clash", badge: "ARENA" },
        { name: "Career Profile", icon: User, path: "/profile", id: "profile" },
    ];

    const sidebarClass = isDark ? "glass-morphism border-r border-white/5 shadow-lg" : "bg-white border-r border-gray-200/50 shadow-lg";
    const headingColor = isDark ? "text-white" : "text-gray-900";
    const textMuted = isDark ? "text-gray-400" : "text-gray-500";

    const sidebarTransition = { type: "spring", stiffness: 300, damping: 30 };

    return (
        <aside
            style={{
                width: isCollapsed ? 80 : 256,
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(25px) saturate(160%)',
                // Mobile: fixed overlay, hidden by default, shown when mobileOpen
                position: undefined,
            }}
            className={`h-screen sticky top-0 z-40 ${sidebarClass} flex flex-col
                md:static md:translate-x-0
                max-md:fixed max-md:top-0 max-md:left-0 max-md:z-50
                ${mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}
        >
            {isDark && <StarParticles />}
            {/* Mobile close button */}
            {mobileOpen && (
                <button
                    onClick={onMobileClose}
                    className={`md:hidden absolute top-4 right-4 z-[70] w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                    <X size={16} />
                </button>
            )}
            {/* Collapse Toggle Button (desktop only) */}
            <button
                onClick={toggleSidebar}
                className={`max-md:hidden absolute -right-3 top-20 w-6 h-6 rounded-full border ${isDark ? 'bg-gray-900 border-gray-700 text-purple-400' : 'bg-white border-gray-200 text-red-600'} flex items-center justify-center transition-all hover:scale-110 z-[60] shadow-md`}
            >
                {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>

            {/* Logo */}
            <div className={`p-6 border-b cursor-pointer ${isDark ? 'border-gray-800' : 'border-gray-100'} h-[89px] flex items-center overflow-hidden relative z-10`} onClick={() => navigate('/dashboard')}>
                <div className="flex items-center space-x-3 shrink-0">
                    <img
                        src={mustLogo}
                        alt="MUST Logo"
                        className="w-14 h-14 object-contain"
                    />
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="whitespace-nowrap"
                            >
                                <h1 className={`text-xl font-bold ${headingColor}`}>MUST</h1>
                                <p className="text-xs text-gray-400">Academy</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-1 flex-grow relative z-10">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <div
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            title={isCollapsed ? item.name : ""}
                            className={`nav-item flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 rounded-lg transition-all cursor-pointer overflow-hidden ${isActive
                                ? (isDark ? 'text-white active' : 'text-red-600 bg-gray-50 shadow-sm ring-1 ring-red-500/10 active')
                                : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                                }`}
                        >
                            <item.icon size={20} className={`shrink-0 ${isActive ? (item.id === 'market' ? "text-cyan-500" : (isDark ? "text-purple-400" : "text-red-600")) : ""}`} />
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-1 items-center overflow-hidden"
                                    >
                                        <span className={`whitespace-nowrap ${isActive ? "font-medium" : ""}`}>{item.name}</span>
                                        {item.badge && (
                                            <span className={`
                                                ml-auto px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0
                                                ${item.id === 'market'
                                                    ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 shadow-lg'
                                                    : isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-red-50 text-red-600 border border-red-100'
                                                }
                                            `}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

            </nav>

            {/* Integrated Profile & Bottom Section */}
            <div className={`mt-auto p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'} relative z-30`}>
                <div className="flex items-center justify-between">
                    <div className="relative group">
                        <div
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className={`flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'space-x-3 p-2 w-[160px]'} cursor-pointer rounded-xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                        >
                            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-semibold text-white shadow-md overflow-hidden relative">
                                <span className="relative z-10">{userInitial}</span>
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 truncate overflow-hidden">
                                    <p className={`text-[11px] font-black uppercase tracking-widest leading-none ${headingColor} truncate mb-1`}>{userName}</p>
                                    <div className="flex items-center space-x-1.5 translate-y-[1px]">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-lg" />
                                        <span className="text-[9px] text-green-500 font-black uppercase tracking-tighter">New Member</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Context Menu */}
                        <AnimatePresence>
                            {isProfileMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={`absolute bottom-full left-0 mb-4 w-44 p-2 rounded-2xl border shadow-2xl z-50 overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}
                                    >
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                navigate('/profile');
                                            }}
                                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-950 hover:bg-black/5'}`}
                                        >
                                            <Settings size={14} />
                                            <span>Edit Profile</span>
                                        </button>
                                        <div className={`h-[1px] my-1 ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`} />
                                        <button
                                            onClick={() => {
                                                logout();
                                                navigate('/');
                                            }}
                                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-red-500 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
                                        >
                                            <LogOut size={14} />
                                            <span>Logout System</span>
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Integrated Theme Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className={`p-2 rounded-xl border transition-all shrink-0 ${isDark ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10' : 'bg-white border-gray-200 text-red-600 hover:border-red-200 hover:bg-red-50 shadow-sm'}`}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </motion.button>
                </div>
            </div>
        </aside>
    );
}

