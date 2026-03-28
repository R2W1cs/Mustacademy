import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { getMyProfile } from "../api/profile";
import { getMyContributions } from "../api/contributions";
import { useTheme } from "../auth/ThemeContext";
import { Sun, Moon, Bell, MessageSquare, ThumbsUp, Search, Menu } from "lucide-react";
import api from "../api/axios";

const Navbar = () => {
    const [profile, setProfile] = useState(null);
    const [contrib, setContrib] = useState(null);
    const [open, setOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const menuRef = useRef(null);
    const navigate = useNavigate();

    const fetchUserData = async () => {
        try {
            const [profileRes, contribRes, notifRes] = await Promise.all([
                getMyProfile(),
                getMyContributions(),
                api.get("/notifications")
            ]);
            setProfile(profileRes.data);
            setContrib(contribRes.data);
            setNotifications(notifRes.data);
            if (profileRes.data?.plan) {
                localStorage.setItem('userPlan', profileRes.data.plan);
            }
        } catch (err) {
            console.error("Navbar fetch error:", err);
        }
    };

    useEffect(() => {
        fetchUserData();

        // Socket.io initialization
        const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:3001");

        socket.on("connect", () => {
            console.log("[SOCKET] Real-time link established.");
            setIsSocketConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("[SOCKET] Neural link lost.");
            setIsSocketConnected(false);
        });

        // Re-authenticate when profile is loaded
        if (profile?.id) {
            socket.emit("authenticate", profile.id);
        }

        socket.on("notification_received", (newNotif) => {
            console.log("[SOCKET] New transmission detected:", newNotif);
            setNotifications(prev => [newNotif, ...prev]);

            // Optional: Play a subtle notification sound or show a toast
        });

        return () => {
            socket.disconnect();
        };
    }, [profile?.id]);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            {/* Glassmorphic Background */}
            <div className={`absolute inset-0 backdrop-blur-xl border-b transition-colors duration-300 shadow-lg ${isDark ? 'bg-[#0a0e1a]/80 border-white/10' : 'bg-white/80 border-gray-100'}`}></div>

            <div className="relative max-w-7xl mx-auto px-6 h-24 grid grid-cols-3 items-center">
                {/* LEFT — LOGO + mobile hamburger */}
                <div className="justify-self-start flex items-center gap-4">
                    <button
                        className={`md:hidden p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                        onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-nav'))}
                        aria-label="Open navigation"
                    >
                        <Menu size={20} />
                    </button>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/")}
                        className="cursor-pointer group relative"
                    >
                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-nebula rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500"></div>
                        <h1 className={`relative text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900 tracking-[-0.05em]'}`}>
                            MUST <span className="text-nebula italic">ACADEMY</span>
                        </h1>
                    </motion.div>
                </div>

                {/* CENTER — NAV LINKS */}
                <nav className={`flex gap-2 justify-center p-1.5 rounded-full border backdrop-blur-md transition-colors ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-100 shadow-sm'}`}>
                    {[
                        { tag: "Home", path: "/dashboard" },
                        { tag: "Library", path: "/library" },
                        { tag: "Arena", path: "/arena" },
                        { tag: "Career", path: "/career" },
                        { tag: "Boardroom", path: "/interview-boardroom" },
                        { tag: "Market", path: "/market" },
                    ].map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${isActive
                                    ? "text-white"
                                    : isDark ? "text-white/60 hover:text-white" : "text-slate-500 hover:text-slate-900"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className="relative z-10">{link.tag}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="navPill"
                                            className="absolute inset-0 bg-nebula rounded-full shadow-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* RIGHT — PROFILE */}
                <div className="justify-self-end flex items-center gap-4">
                    {/* Search */}
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                        className={`p-2.5 rounded-full border transition-all duration-300 flex items-center gap-2 ${isDark ? 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'}`}
                        title="Search (Ctrl+K)"
                    >
                        <Search size={16} />
                        <span className={`hidden lg:flex items-center gap-1 text-[9px] font-black border rounded px-1 py-0.5 ${isDark ? 'border-white/10 text-white/20' : 'border-slate-300 text-slate-300'}`}>
                            <span>⌘</span><span>K</span>
                        </span>
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2.5 rounded-full border transition-all duration-300 relative ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'}`}
                        >
                            <Bell size={18} />
                            {isSocketConnected && (
                                <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg" title="Network Sync Active" />
                            )}
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={`absolute right-0 mt-4 w-80 backdrop-blur-2xl rounded-2xl shadow-2xl border overflow-hidden z-[70] ${isDark ? 'bg-[#0f1729]/95 border-white/10' : 'bg-white border-slate-200'}`}
                                >
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                        <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Transmissions</h3>
                                        {notifications.some(n => !n.read) && (
                                            <button
                                                onClick={async () => {
                                                    await api.put("/notifications/read-all");
                                                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                                }}
                                                className="text-[9px] font-bold text-cyan-400 uppercase hover:underline"
                                            >
                                                Acknowledge All
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 border-b border-white/5 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : 'bg-indigo-500/5'} hover:bg-white/5`}
                                                    onClick={async () => {
                                                        if (!notif.read) {
                                                            await api.put(`/notifications/${notif.id}/read`);
                                                            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                                        }
                                                    }}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${notif.type === 'VIDEO_LIKE' ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                                                            {notif.type === 'VIDEO_LIKE' ? <ThumbsUp size={14} /> : <MessageSquare size={14} />}
                                                        </div>
                                                        <div>
                                                            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>{notif.message}</p>
                                                            <p className={`text-[9px] mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                                                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No Transmissions Detected</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-full border transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 text-[#FFD700] hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-red-600 hover:bg-gray-200'}`}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <div className="relative" ref={menuRef}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                fetchUserData();
                                setOpen(!open);
                            }}
                            className={`
                                group flex items-center gap-4 pl-5 pr-1.5 py-1.5 rounded-full
                                border transition-all duration-300
                                ${open
                                    ? isDark ? "bg-white/10 border-cyan-500/50 shadow-lg" : "bg-white border-cyan-500 shadow-lg"
                                    : isDark ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"}
                            `}
                        >
                            <div className="text-right hidden md:block">
                                {profile && (
                                    <div className="flex flex-col items-end">
                                        <span className={`text-sm font-bold transition-colors ${isDark ? 'text-white group-hover:text-cyan-400' : 'text-slate-900'}`}>
                                            {profile.name}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isDark ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' : 'text-red-600 bg-red-50 border-red-100'}`}>
                                            Lv. {contrib?.stats.level || "New Member"} (ID: {profile.id})
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <div className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-colors relative z-10 ${isDark ? 'border-white/10 group-hover:border-cyan-400' : 'border-slate-200 group-hover:border-nebula'}`}>
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {profile?.name?.charAt(0) || "M"}
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 z-20 shadow-lg ${isDark ? 'border-[#0a0e1a]' : 'border-indigo-50'}`}></div>
                            </div>
                        </motion.button>

                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute right-0 mt-4 w-80 backdrop-blur-2xl rounded-[2rem] shadow-lg border overflow-hidden z-[60] ${isDark ? 'bg-[#0f1729]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}
                                >
                                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />

                                    {profile && (
                                        <div className={`relative p-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                            <div className="flex items-center gap-4 mb-5">
                                                <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 p-1 flex-shrink-0">
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} className="w-full h-full rounded-xl object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                                                            {profile?.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.name}</h3>
                                                    <p className={`text-xs font-medium mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Year {profile.year} • Sem {profile.semester}</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Online</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {contrib && (
                                                <div className={`rounded-2xl p-4 border backdrop-blur-sm relative overflow-hidden group ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="flex justify-between items-end mb-2 relative z-10">
                                                        <div>
                                                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Total XP</p>
                                                            <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{contrib.stats.contribution_score}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isDark ? 'text-cyan-400 border border-cyan-400/20 bg-cyan-400/5' : 'text-red-600 border border-red-200 bg-red-50'}`}>
                                                                Level {contrib.stats.level}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`h-2 rounded-full overflow-hidden relative z-10 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: "60%" }}
                                                            className={`${isDark ? 'bg-nebula' : 'bg-nebula'} h-full rounded-full shadow-lg`}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-3 space-y-1">
                                        {[
                                            { label: "Overview", path: "/profile", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>) },
                                            { label: "Milestones", path: "/accomplishments", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>) },
                                            { label: "Preferences", path: "/profile/setup", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>) }
                                        ].map(item => (
                                            <motion.button
                                                key={item.path}
                                                whileHover={{ x: 5, backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" }}
                                                onClick={() => { navigate(item.path); setOpen(false); }}
                                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${isDark ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                                            >
                                                <div className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-white/5 text-white/50 group-hover:text-cyan-400 group-hover:bg-cyan-400/10' : 'bg-gray-100 text-gray-400 group-hover:text-red-600 group-hover:bg-red-50'}`}>
                                                    {item.icon}
                                                </div>
                                                <span className="font-bold text-sm tracking-wide">{item.label}</span>
                                                <svg className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                            </motion.button>
                                        ))}
                                    </div>

                                    <div className={`p-3 mt-1 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                        <motion.button
                                            whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                                            onClick={() => {
                                                localStorage.removeItem("token");
                                                navigate("/login");
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-400 font-bold hover:text-rose-300 transition-all group"
                                        >
                                            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                            </div>
                                            <span className="text-sm tracking-wide">Log Out</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
