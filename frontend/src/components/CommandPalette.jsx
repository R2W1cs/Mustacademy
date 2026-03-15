import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, LayoutGrid, Network, BookOpen, Briefcase, Rocket, User, LogOut, Settings, Hash, Zap } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../auth/ThemeContext';

const CommandPalette = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const inputRef = useRef(null);

    const actions = [
        { id: 'dash', title: 'Dashboard', icon: LayoutGrid, shortcut: 'D', action: () => navigate('/dashboard'), category: 'Navigation' },
        { id: 'km', title: 'Knowledge Map', icon: Network, shortcut: 'K', action: () => navigate('/knowledge-map'), category: 'Navigation' },
        { id: 'lib', title: 'Library', icon: BookOpen, shortcut: 'L', action: () => navigate('/library'), category: 'Navigation' },
        { id: 'board', title: 'The Boardroom', icon: Briefcase, shortcut: 'B', action: () => navigate('/interview-boardroom'), category: 'Navigation' },
        { id: 'corner', title: 'Creator Corner', icon: Rocket, shortcut: 'C', action: () => navigate('/creator-corner'), category: 'Navigation' },
        { id: 'prof', title: 'Career Profile', icon: User, shortcut: 'P', action: () => navigate('/profile'), category: 'Settings' },
        { id: 'set', title: 'System Settings', icon: Settings, shortcut: 'S', action: () => navigate('/profile'), category: 'Settings' },
        { id: 'exit', title: 'Terminate Session', icon: LogOut, shortcut: 'ESC', action: () => logout(), category: 'System' }
    ];

    const filteredActions = query === ''
        ? actions
        : actions.filter(action => action.title.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        const handleOpenEvent = () => setIsOpen(true);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-command-palette', handleOpenEvent);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-command-palette', handleOpenEvent);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleAction = (action) => {
        action.action();
        setIsOpen(false);
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredActions[selectedIndex]) {
                handleAction(filteredActions[selectedIndex]);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl glass-morphism-strong rounded-3xl shadow-2xl overflow-hidden border border-white/10"
                    >
                        {/* Search Bar */}
                        <div className="flex items-center px-6 py-4 border-b border-white/5 space-x-4 bg-white/5">
                            <Search className="text-slate-400" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search protocols, modules, or settings..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onKeyDown}
                                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-slate-500 font-medium h-10"
                            />
                            <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
                                <Command size={10} className="text-slate-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase">K</span>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[400px] overflow-y-auto p-4 space-y-4 cyber-scrollbar">
                            {filteredActions.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredActions.map((action, index) => (
                                        <div
                                            key={action.id}
                                            onClick={() => handleAction(action)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`
                                                flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200
                                                ${index === selectedIndex ? 'bg-indigo-500/20 ring-1 ring-inset ring-indigo-500/30' : 'hover:bg-white/5'}
                                            `}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`
                                                    p-2.5 rounded-xl flex items-center justify-center transition-colors
                                                    ${index === selectedIndex ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 text-slate-400'}
                                                `}>
                                                    <action.icon size={18} />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold uppercase tracking-wider ${index === selectedIndex ? 'text-white' : 'text-slate-300'}`}>{action.title}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium tracking-tight">{action.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-[10px] font-black uppercase transition-opacity duration-200 ${index === selectedIndex ? 'opacity-100' : 'opacity-0'} ${isDark ? 'text-indigo-400' : 'text-red-600'} tracking-[0.2em]`}>Execute</span>
                                                <div className="w-6 h-6 rounded-md border border-white/10 flex items-center justify-center bg-white/5">
                                                    <span className="text-[9px] font-black text-slate-400">{action.shortcut}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                        <Hash size={24} className="text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No protocol matches found</p>
                                    <p className="text-slate-600 text-[10px] mt-1">Try searching for 'Boardroom' or 'Settings'</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/5">↑↓</span>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Navigate</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Enter</span>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Select</span>
                                </div>
                            </div>
                            <div className={`flex items-center space-x-1 ${isDark ? 'text-indigo-400/50' : 'text-red-600/50'}`}>
                                <Zap size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Astra Engine v2.0</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;

