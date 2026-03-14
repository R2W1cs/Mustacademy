import { memo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Binary, Fingerprint, Network, ShieldCheck, Atom, Sparkles } from "lucide-react";
import { useTheme } from "../auth/ThemeContext";

const CourseCard = ({ course, index }) => {
  // Magnetic Card Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getAbstractIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('hci') || n.includes('interaction')) return <Fingerprint className="w-10 h-10" />;
    if (n.includes('web')) return <Network className="w-10 h-10" />;
    if (n.includes('ai') || n.includes('intel')) return <Atom className="w-10 h-10" />;
    if (n.includes('testing')) return <ShieldCheck className="w-10 h-10" />;
    return <Binary className="w-10 h-10" />;
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative cursor-pointer perspective-1000 will-change-transform"
    >
      {/* Red Outer Glow for Light Mode */}
      <div className={`absolute -inset-1 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse ${isDark ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-magenta-500/20' : 'bg-red-500/10'}`} />

      {/* Main Glass Card */}
      <div className={`relative h-full glass-morphism rounded-[2.5rem] p-10 overflow-hidden transition-all duration-700 ${isDark ? 'border-white/5 hover:border-cyan-400/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]' : 'group-hover:border-red-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.05)]'}`}>

        {/* Iridescent Border Overlay */}
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none glass-border rounded-[2.5rem]" />

        {/* Ambient Nebula Blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000 ${isDark ? 'bg-cyan-500/10' : 'bg-red-500/5'}`} />
          <div className={`absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000 ${isDark ? 'bg-violet-600/10' : 'bg-gray-200/20'}`} />
        </div>

        {/* Floating Particle Scan Line */}
        <div className={`absolute inset-x-0 top-0 h-[200%] w-full -translate-y-full group-hover:translate-y-full transition-transform duration-[3000ms] ease-linear z-10 pointer-events-none ${isDark ? 'bg-gradient-to-b from-cyan-500/0 via-cyan-500/10 to-transparent' : 'bg-gradient-to-b from-red-500/0 via-red-500/5 to-transparent'}`} />

        {/* Content Container (Lifted for 3D effect) */}
        <div className="relative z-20" style={{ transform: "translateZ(80px)" }}>

          {/* Header Area */}
          <div className="flex justify-between items-start mb-12">
            <div className="relative">
              <div className={`w-20 h-20 rounded-[1.5rem] border flex items-center justify-center transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10 text-cyan-400 shadow-[0_0_30px_rgba(0,242,255,0.1)] group-hover:shadow-[0_0_50px_rgba(0,242,255,0.4)] group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30' : 'bg-white border-gray-100 text-red-600 shadow-sm group-hover:shadow-red-200 group-hover:bg-red-50/50 group-hover:border-red-200'}`}>
                {getAbstractIcon(course.name)}
              </div>
              {/* Pulsing Aura */}
              <div className={`absolute inset-0 rounded-[1.5rem] animate-ping opacity-0 group-hover:opacity-40 transition-opacity duration-700 ${isDark ? 'bg-cyan-400/20' : 'bg-red-400/20'}`} />
            </div>

            <div className="text-right">
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Section Registry</span>
              <div className="flex items-center gap-2 justify-end">
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-400 shadow-[0_0_8px_#00f2ff]' : 'bg-red-500 shadow-[0_0_8px_rgba(192,22,54,0.4)]'}`} />
                <span className={`text-xl font-black transition-colors ${isDark ? 'text-white/40 group-hover:text-cyan-300' : 'text-slate-400 group-hover:text-red-600'}`}>SEC-{course.id.toString().slice(-2)}</span>
              </div>
            </div>
          </div>

          {/* Title Area */}
          <div className="mb-8 relative">
            <p className={`text-[11px] font-black uppercase tracking-[0.8em] mb-4 transition-colors ${isDark ? 'text-cyan-500/50 group-hover:text-cyan-400' : 'text-slate-400 group-hover:text-red-600'}`}>Current Module</p>
            <h3 className={`text-5xl font-black leading-[0.85] tracking-tightest uppercase group-hover:scale-[1.05] origin-left transition-transform duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {course.name.split(':').pop().trim().replace(/ /g, '\n')}
            </h3>
          </div>

          {/* Description */}
          <div className="relative mb-12">
            <div className={`h-0.5 w-12 mb-6 ${isDark ? 'bg-gradient-to-r from-cyan-400 to-transparent' : 'bg-red-600'}`} />
            <p className={`text-sm font-medium leading-relaxed transition-opacity duration-700 line-clamp-3 ${isDark ? 'text-slate-300 opacity-60 group-hover:opacity-100' : 'text-slate-600 opacity-80 group-hover:opacity-100'}`}>
              {course.description || "Deploying hyper-refined systemic logic and architectural benchmarks for the specified academic sector."}
            </p>
          </div>

          {/* Interaction Area */}
          <div className="flex gap-5">
            <Link
              to={`/courses/${course.id}/roadmap`}
              className={`flex-[2] overflow-hidden relative group/btn1 h-16 border rounded-2xl flex items-center justify-center transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/10' : 'bg-white border-gray-100 hover:border-slate-800 hover:bg-slate-900 shadow-sm'}`}
            >
              <div className={`absolute inset-0 bg-slate-900 translate-y-full group-hover/btn1:translate-y-0 transition-transform duration-500 ${isDark ? 'hidden' : ''}`} />
              <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 translate-y-full group-hover/btn1:translate-y-0 transition-transform duration-500 ${isDark ? '' : 'hidden'}`} />
              <div className={`relative z-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] transition-colors ${isDark ? 'text-white group-hover/btn1:text-black' : 'text-red-700 group-hover/btn1:text-white'}`}>
                <Compass size={16} className={`transition-colors ${isDark ? '' : 'group-hover:text-red-500'}`} />
                Map Path
              </div>
            </Link>

            <Link
              to={`/courses/${course.id}`}
              className={`flex-1 h-16 border rounded-2xl flex items-center justify-center transition-all duration-500 group/btn2 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-magenta-500/20 hover:border-magenta-500/50' : 'bg-white border-gray-100 text-gray-400 hover:bg-slate-900 hover:border-slate-800 hover:text-white shadow-sm'}`}
            >
              <ArrowRight size={24} className={`transition-transform duration-500 ${isDark ? 'text-magenta-400 group-hover:translate-x-2' : 'text-red-600 group-hover:translate-x-2'}`} />
            </Link>
          </div>
        </div>

        {/* Corner Accent Tech Pieces */}
        <div className={`absolute top-6 left-6 w-4 h-px ${isDark ? 'bg-cyan-400/30' : 'bg-red-400/30'}`} />
        <div className={`absolute top-6 left-6 h-4 w-px ${isDark ? 'bg-cyan-400/30' : 'bg-red-400/30'}`} />
        <div className={`absolute bottom-6 right-6 w-4 h-px ${isDark ? 'bg-magenta-400/30' : 'bg-red-400/30'}`} />
        <div className={`absolute bottom-6 right-6 h-4 w-px ${isDark ? 'bg-magenta-400/30' : 'bg-red-400/30'}`} />
      </div>
    </motion.div>
  );
};

export default memo(CourseCard);
