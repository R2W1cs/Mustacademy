import React, { useState, useEffect, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import AtmosphericAura from "../components/AtmosphericAura";
import { usePlan } from "../auth/PlanContext";

const GlobalAIPilot = lazy(() => import("../components/GlobalAIPilot"));
const DailyPlanModal = lazy(() => import("../components/DailyPlanModal"));
const CommandPalette = lazy(() => import("../components/CommandPalette"));

import { useTheme } from "../auth/ThemeContext";

const MainLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { showPlanBuilder, closeBuilder, onPlanGenerated } = usePlan();
  const isDark = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Lock body scroll for app shell
    document.documentElement.classList.add('app-shell-lock');

    // Load sidebar state
    const savedSidebar = localStorage.getItem('sidebarCollapsed');
    if (savedSidebar === 'true') {
      setIsCollapsed(true);
    }

    return () => {
      document.documentElement.classList.remove('app-shell-lock');
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isCollapsed: newState } }));
  };

  const isImmersiveRoute = location.pathname.startsWith('/dashboard') || location.pathname.includes('/roadmap') || location.pathname.startsWith('/topics') || location.pathname.startsWith('/podcast-studio');
  const isCelestialRoute = location.pathname.startsWith('/library') || location.pathname.startsWith('/courses') || location.pathname.startsWith('/topics');

  return (
    <div className={`flex h-screen overflow-hidden relative transition-colors duration-500 ${isDark ? 'bg-[#050810] text-slate-100' : 'bg-[#FAFAFF] text-slate-900'}`}>
      {/* Global Cute Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      <Sidebar isDark={isDark} toggleTheme={toggleTheme} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 min-w-0 max-w-full relative z-10 overflow-x-hidden overscroll-y-none ${isImmersiveRoute ? 'overflow-y-auto' : 'overflow-y-auto px-4 md:px-6 lg:px-10 py-10'} transition-all duration-300 ${isDark ? (isCelestialRoute ? 'mesh-bg' : 'bg-[#050810]') : 'bg-white'}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global AI Pilot — persistent across all routes */}
      <Suspense fallback={null}>
        <GlobalAIPilot />
      </Suspense>

      {/* Global Command Palette */}
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>

      {/* Global Plan Builder Modal */}
      <AnimatePresence>
        {showPlanBuilder && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <Suspense fallback={null}>
              <DailyPlanModal
                onClose={closeBuilder}
                onPlanGenerated={onPlanGenerated}
              />
            </Suspense>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
