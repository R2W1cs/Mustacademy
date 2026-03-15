import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../api/profile";
import { getMyContributions } from "../api/contributions";
import { getMyBadges } from "../api/badge";
import { getCareerRoadmap, generateTrajectory } from "../api/career";
import Badge from "../components/Badge";
import { useTheme } from "../auth/ThemeContext";

// --- COMPONENTS ---

const BentoCard = ({ children, className = "", delay = 0 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`backdrop-blur-xl border rounded-[1.5rem] p-6 shadow-xl overflow-hidden relative group transition-all duration-700 ${isDark ? 'bg-[#0f1729]/60 border-white/10 hover:border-[#FFD700]/30' : 'bg-white border-slate-200 hover:border-[#FFD700]'} ${className}`}
    >
      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
      {children}
    </motion.div>
  );
};

// Professional SVG Icon Wrapper
const StatIcon = ({ path }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className={`p-3.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/80 group-hover:text-[#FFD700] group-hover:border-[#FFD700]/20' : 'bg-slate-50 border-slate-200 text-slate-700 group-hover:text-[#FFD700] group-hover:border-[#FFD700]/20'}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={path} />
      </svg>
    </div>
  );
};

const StatValue = ({ label, value, subtext, iconPath }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="flex items-start gap-5">
      <StatIcon path={iconPath} />
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{label}</p>
        <h3 className={`text-3xl font-black tracking-tight leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
        {subtext && <p className={`text-xs font-medium font-mono ${isDark ? 'text-white/50' : 'text-slate-500/70'}`}>{subtext}</p>}
      </div>
    </div>
  );
};

const ActivityItem = ({ action, points, date }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className={`flex items-center gap-4 py-3 border-b last:border-0 px-3 rounded-lg transition-colors -mx-3 group ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
      <div className={`w-1.5 h-1.5 rounded-full group-hover:bg-[#FFD700] transition-colors ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
      <div className="flex-1">
        <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{action.replace(/_/g, ' ')}</p>
        <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
          {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="text-right">
        <span className={`text-[10px] font-bold group-hover:text-[#FFD700] transition-colors font-mono ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
          +{points} PTS
        </span>
      </div>
    </div>
  );
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [contrib, setContrib] = useState(null);
  const [badges, setBadges] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forging, setForging] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await getMyProfile();
        setProfile(profileRes.data);

        // Fetch secondary data resiliently
        const [contribRes, badgesRes, roadmapRes] = await Promise.all([
          getMyContributions().catch(e => { console.warn("Contrib fetch failed", e); return { data: { stats: {}, recentActivity: [] } }; }),
          getMyBadges().catch(e => { console.warn("Badges fetch failed", e); return { data: [] }; }),
          getCareerRoadmap().catch(() => ({ data: null }))
        ]);

        setContrib(contribRes.data);
        setBadges(badgesRes.data);
        setRoadmap(roadmapRes.data);
      } catch (error) {
        console.error("Critical Profile Failure:", error);
        setError("Unable to establish connection with Academic mainframe. Please verify your network authentication.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const recentHistory = useMemo(() => contrib?.recentActivity || [], [contrib]);

  const handleForgeTrajectory = async () => {
    setForging(true);
    try {
      const res = await generateTrajectory();
      setRoadmap(res.data);
    } catch (err) {
      console.error("Failed to forge trajectory", err);
    } finally {
      setForging(false);
    }
  };

  // Safe default for percentile
  const percentile = contrib?.stats?.cohort_percentile || 0;
  const isTopTier = percentile >= 90;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0e1a]' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-6">
          <div className={`w-12 h-12 border-2 rounded-full animate-spin ${isDark ? 'border-white/10 border-t-[#FFD700]' : 'border-slate-200 border-t-[#FFD700]'}`} />
          <p className={`font-mono text-[10px] uppercase tracking-widest animate-pulse ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Authenticating Biometrics...
          </p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-[#0a0e1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`max-w-md text-center space-y-6 p-12 rounded-3xl border transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className={`text-xl font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Synaptic Pulse Malfunction</h2>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-8 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-colors ${isDark ? 'bg-white text-black hover:bg-[#FFD700]' : 'bg-slate-900 text-white hover:bg-[#FFD700] hover:text-black'}`}
          >
            Re-Initialize
          </button>
        </div>
      </div>
    );
  }

  if (!profile || !contrib) return null;

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans selection:bg-[#FFD700]/30 selection:text-white relative ${isDark ? 'bg-[#0a0e1a] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      {/* Refined Background - No Childish Blobs, Just Technical Grids/Noise */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-[#0a0e1a]' : 'bg-slate-50'}`} />
        <div className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] ${!isDark && 'opacity-20'}`} />
        <div className={`absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] opacity-50 ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-500/10'}`} />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto space-y-10">

        {/* Header Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full ${profile.status === 'online' ? 'bg-emerald-500 shadow-lg' : 'bg-gray-500'}`} />
              <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-white/40' : 'text-slate-500'}`}>ID: {String(profile.id).substring(0, 8)}</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
              SCHOLAR<span className="text-[#FFD700]">.DASHBOARD</span>
            </h1>
          </div>
          <button
            onClick={() => navigate('/profile/setup')}
            className={`px-6 py-2.5 bg-transparent rounded-lg transition-all text-[10px] font-bold uppercase tracking-[0.2em] border ${isDark ? 'hover:bg-white/5 border-white/10 hover:border-white/20 text-white/60 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-md'}`}
          >
            Configure Profile
          </button>
        </motion.div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

          {/* 1. IDENTITY MATRIX (Large, Top Left) */}
          <BentoCard className="md:col-span-6 lg:col-span-8 row-span-2 relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 h-full">
              <div className="relative shrink-0">
                <div className={`w-48 h-48 rounded-[2rem] overflow-hidden border-2 relative z-10 group ${isDark ? 'border-white/5 bg-[#0f1729]' : 'border-slate-100 bg-slate-50'}`}>
                  <img src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.name}&background=0f1729&color=fff`} className={`w-full h-full object-cover transition-all duration-700 ${isDark ? 'grayscale group-hover:grayscale-0' : ''}`} />
                  {/* Technical Overlay */}
                  <div className={`absolute inset-0 border-[1px] pointer-events-none rounded-[2rem] ${isDark ? 'border-white/10' : 'border-slate-200/50'}`} />
                </div>
                <div className={`absolute -bottom-4 -right-4 border px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-xl z-20 font-mono ${isDark ? 'bg-[#0a0e1a] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}>
                  LVL.{contrib.stats?.level || 1}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left pt-2">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">{profile.name}</h2>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                  <div className={`px-4 py-1.5 rounded border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Year</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>0{profile.year}</span>
                  </div>
                  <div className={`px-4 py-1.5 rounded border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Sem</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>0{profile.semester}</span>
                  </div>
                  {profile.passion && (
                    <div className="px-4 py-1.5 rounded bg-[#FFD700]/5 border border-[#FFD700]/20">
                      <span className="text-[10px] font-bold text-[#FFD700]/60 uppercase tracking-widest block">Specialty</span>
                      <span className="text-sm font-bold text-[#FFD700]">{profile.passion}</span>
                    </div>
                  )}
                  {profile.dream_job && (
                    <div className={`px-4 py-1.5 rounded border ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-widest block ${isDark ? 'text-indigo-400/60' : 'text-indigo-500'}`}>Target Vocation</span>
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.dream_job}</span>
                    </div>
                  )}
                </div>

                <p className={`text-base font-medium leading-relaxed max-w-2xl font-mono text-justify ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
                  __BIO_DATA: "{profile.bio || "Subject has not provided biographical data."}"
                </p>
              </div>
            </div>
          </BentoCard>

          {/* 2. COHORT VELOCITY (New - Percentile) */}
          <BentoCard className="md:col-span-3 lg:col-span-4" delay={0.1}>
            <StatValue
              label="Cohort Velocity"
              value={`${percentile}%`}
              subtext={isTopTier ? "ELITE [AVG. EXCEEDED]" : `Outperforming ${percentile}% of Y${profile.year} Peers`}
              iconPath="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
            <div className="mt-6">
              <div className={`flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                <span>Year {profile.year} Avg</span>
                <span>You</span>
              </div>
              <div className={`h-2 w-full rounded-full overflow-hidden flex items-center relative ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <div className={`h-full w-[60%] ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} /> {/* Cohort Avg Fake Line */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentile}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-[#FFD700] absolute top-0 left-0 opacity-80"
                />
              </div>
            </div>
          </BentoCard>

          {/* 3. CONTRIBUTION INDEX */}
          <BentoCard className="md:col-span-3 lg:col-span-4" delay={0.2}>
            <StatValue
              label="Contribution Index"
              value={contrib.stats?.contribution_score || 0}
              subtext="Total Synaptic Output"
              iconPath="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
            <div className="mt-6 flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-sm ${i < ((contrib.stats?.level || 1) % 5) ? 'bg-[#FFD700]' : (isDark ? 'bg-white/10' : 'bg-slate-200')}`} />
              ))}
            </div>
            <p className={`text-[9px] font-mono mt-2 text-right uppercase ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Level Progression</p>
          </BentoCard>

          {/* 6. CAREER ARCHITECTURE [THE PROFESSOR'S TRAJECTORY] */}
          <BentoCard className="md:col-span-12 lg:col-span-8 overflow-hidden group">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-3 ${isDark ? 'text-white/60' : 'text-slate-900'}`}>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  Professor's Trajectory
                </h3>
                <p className={`text-[10px] font-mono mt-1 uppercase ${isDark ? 'text-white/30' : 'text-indigo-600 font-bold'}`}>AI-Forged Professional Architecture</p>
              </div>
              {!roadmap ? (
                <button
                  disabled={forging}
                  onClick={handleForgeTrajectory}
                  className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${forging ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 active:scale-95'}`}
                >
                  {forging ? "CALCULATING ARCHITECTURE..." : "Initialize Forging Node"}
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    disabled={forging}
                    onClick={handleForgeTrajectory}
                    className="px-6 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-[10px] font-bold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    {forging ? "FORGING..." : "Regenerate Trajectory"}
                  </button>
                  <button
                    onClick={() => navigate(`/career/roadmap`)}
                    className={`px-6 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}
                  >
                    View Full Roadmap
                  </button>
                </div>
              )}
            </div>

            {roadmap ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h4 className={`text-2xl font-black tracking-tight mb-2 uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{roadmap.architecture_json?.title}</h4>
                    <p className={`text-xs leading-relaxed font-mono italic ${isDark ? 'text-white/50' : 'text-slate-500'}`}>"{roadmap.architecture_json?.summary}"</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20' : 'text-slate-400'}">Core Technical Pillars</p>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.architecture_json?.technical_pillars?.map((pillar, i) => (
                        <div key={i} className={`px-4 py-2 border rounded-xl text-[10px] font-bold group-hover:border-indigo-500/30 transition-colors ${isDark ? 'bg-white/5 border-white/10 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                          {typeof pillar === 'string' ? pillar : (pillar.name || pillar.title || JSON.stringify(pillar))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className={`absolute left-6 top-0 bottom-0 w-px ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                  <div className="space-y-6">
                    {/* Preview first 2 phases */}
                    {roadmap.roadmap_steps_json?.slice(0, 2).map((step, i) => (
                      <div key={i} className="relative z-10 flex gap-6">
                        <div className={`w-12 h-12 shrink-0 border rounded-full flex items-center justify-center text-[#FFD700] text-xs font-black shadow-lg ${isDark ? 'bg-[#0f1729] border-indigo-500/30' : 'bg-white border-indigo-100'}`}>
                          0{i + 1}
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{String(step.phase || '')}</p>
                          <h5 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{String(step.title || '')}</h5>
                          <p className={`text-[10px] leading-relaxed font-medium line-clamp-2 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{String(step.description || '')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl group-hover:border-indigo-500/20 transition-colors">
                <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-4">Trajectory Not Established</p>
                <p className="text-[10px] text-white/10 font-mono text-center max-w-sm">The Professor requires a career initialization protocol to calculate your professional trajectory.</p>
              </div>
            )}
          </BentoCard>

          {/* 4. RECENT TRANSMISSIONS (Data Feed) */}
          <BentoCard className="md:col-span-3 lg:col-span-4 row-span-2 overflow-y-auto custom-scrollbar" delay={0.3}>
            <div className="sticky top-0 bg-[#0f1729]/95 backdrop-blur-md z-10 pb-4 mb-2 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">Transmission Log</h3>
              <span className="text-[10px] font-mono text-white/30">{recentHistory.length} ENTRIES</span>
            </div>
            <div className="space-y-1">
              {recentHistory.length > 0 ? (
                recentHistory.map((item, i) => (
                  <ActivityItem key={i} action={item.action_type} points={item.points} date={item.created_at} />
                ))
              ) : (
                <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">NO DATA DETECTED</p>
                </div>
              )}
            </div>
          </BentoCard>

          {/* 5. ACADEMIC HONORS (Badges) */}
          <BentoCard className="md:col-span-6 lg:col-span-8" delay={0.4}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 ${isDark ? 'text-white/60' : 'text-slate-900'}`}>
                <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
                Academic Honors
              </h3>
              <span className={`text-[10px] font-bold block border px-3 py-1 rounded font-mono ${isDark ? 'text-white/40 border-white/10' : 'text-slate-600 border-slate-200 bg-slate-50'}`}>
                {badges.length} AWARDED
              </span>
            </div>

            {badges.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {badges.map((badge) => (
                  <div key={badge.key} className="min-w-[200px]">
                    <Badge badge={badge} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-center">
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">Status: Unrecognized</p>
                  <p className={`text-[10px] ${isDark ? 'text-white/20' : 'text-slate-400'} font-mono`}>Initiate synaptic exchanges to earn distinction.</p>
                </div>
              </div>
            )}
          </BentoCard>

        </div>
      </div>
    </div>
  );
};

export default Profile;

