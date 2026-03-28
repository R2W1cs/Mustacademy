import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { Mail, Lock, Check, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../auth/ThemeContext";

// Floating Particles Component
const FloatingParticles = ({ isDark }) => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${isDark ? 'bg-white/20' : 'bg-black/10'}`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Animated Input Component
const AnimatedInput = ({ type = "text", placeholder, value, onChange, isDark }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setHasValue(value?.length > 0);
  }, [value]);

  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className="relative group">
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full px-6 py-4 border-2 rounded-2xl transition-all duration-300 outline-none backdrop-blur-xl pr-14 ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-transparent focus:border-gold focus:bg-white/15' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-transparent focus:border-purple-500 focus:bg-white shadow-sm'}`}
        placeholder={placeholder}
      />

      <motion.label
        className={`absolute left-6 pointer-events-none font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}
        animate={{
          top: isFocused || hasValue ? "0.5rem" : "50%",
          translateY: isFocused || hasValue ? "0" : "-50%",
          fontSize: isFocused || hasValue ? "0.75rem" : "1rem",
          color: isFocused ? (isDark ? "#FFD700" : "#a855f7") : (isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(107, 114, 128, 0.8)"),
        }}
        transition={{ duration: 0.2 }}
      >
        {placeholder}
      </motion.label>

      {isPasswordField ? (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 transition-colors block ${isDark ? 'text-white/40 hover:text-[#FFD700]' : 'text-gray-400 hover:text-purple-500'}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={showPassword ? "eye-off" : "eye-on"}
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={{ duration: 0.2 }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>
      ) : (
        <motion.div
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isDark ? 'bg-white/40' : 'bg-black/20'}`}
          animate={{
            scale: isFocused ? [1, 1.5, 1] : 1,
            backgroundColor: isFocused ? (isDark ? "#FFD700" : "#a855f7") : (isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.2)"),
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate Must Education email domain
    if (!email.endsWith("@musteducation.tn")) {
      setError("Registration is restricted to Must Education students. Please use your @musteducation.tn email address.");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", { name, email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0f1729]' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      {/* Animated Background */}
      <FloatingParticles isDark={isDark} />

      {/* Gradient Orbs */}
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] animate-pulse ${isDark ? 'bg-purple-500/30' : 'bg-purple-400/20'}`} />
      <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[120px] animate-pulse ${isDark ? 'bg-indigo-500/30' : 'bg-indigo-400/20'}`} style={{ animationDelay: "1s" }} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] animate-pulse ${isDark ? 'bg-[#FFD700]/20' : 'bg-yellow-400/20'}`} style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Side - Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className={`backdrop-blur-2xl rounded-[2.5rem] p-10 border shadow-2xl ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-white/50'}`}
              whileHover={{ boxShadow: isDark ? "0 0 60px rgba(255, 215, 0, 0.2)" : "0 0 60px rgba(168, 85, 247, 0.15)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-4xl font-black mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  Join the Academy
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}
                >
                  Begin your journey to mastery
                </motion.p>
              </div>

              <form onSubmit={submit} className="space-y-6">
                <AnimatedInput
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  isDark={isDark}
                />

                <AnimatedInput
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isDark={isDark}
                />

                <AnimatedInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isDark={isDark}
                />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`border px-4 py-3 rounded-xl text-sm font-medium ${isDark ? 'bg-rose-500/20 border-rose-500/50 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-600'}`}
                    >
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`border px-4 py-3 rounded-xl text-sm font-medium ${isDark ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
                    >
                      ✓ Account Created Successfully
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isLoading || success}
                  className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black hover:shadow-lg' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-xl'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className={`w-5 h-5 border-3 border-t-transparent rounded-full ${isDark ? 'border-black' : 'border-white'}`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Creating Account...
                    </span>
                  ) : success ? (
                    "Account Created!"
                  ) : (
                    "Create Account"
                  )}
                </motion.button>

                <div className="text-center pt-4">
                  <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                    Already enrolled?{" "}
                    <Link
                      to="/login"
                      className={`font-bold transition-colors ${isDark ? 'text-[#FFD700] hover:text-[#FDB931]' : 'text-purple-600 hover:text-purple-700'}`}
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </motion.div>

          {/* Right Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`hidden lg:block space-y-8 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className={`text-7xl font-black tracking-tighter mb-4 bg-gradient-to-r ${isDark ? 'from-purple-200 via-indigo-200 to-white' : 'from-purple-900 via-indigo-800 to-gray-900'} bg-clip-text text-transparent`}>
                Must Academy
              </h1>
              <div className={`h-1 w-32 bg-gradient-to-r ${isDark ? 'from-[#FFD700]' : 'from-purple-500'} to-transparent rounded-full`} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-xl leading-relaxed max-w-md font-medium ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              Exclusive platform for Must Education students. Master computer science through AI-powered mentorship and intelligent curriculum design.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4 pt-4"
            >
              {[
                { label: "Personalized Learning Paths", desc: "Tailored to your goals" },
                { label: "AI Mentorship", desc: "24/7 intelligent guidance" },
                { label: "Progress Tracking", desc: "Visualize your growth" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className={`flex items-start gap-4 backdrop-blur-xl px-6 py-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-100 shadow-sm'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${isDark ? 'from-[#FFD700] to-[#FDB931]' : 'from-purple-500 to-indigo-500'} mt-1 flex-shrink-0`} />
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.label}</h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
