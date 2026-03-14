import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { Mail, Lock, Check, AlertCircle, ArrowRight } from "lucide-react";

// Floating Particles Component
const FloatingParticles = () => {
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
          className="absolute rounded-full bg-white/20"
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
const AnimatedInput = ({ type = "text", placeholder, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    setHasValue(value?.length > 0);
  }, [value]);

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-transparent focus:border-gold focus:bg-white/15 transition-all duration-300 outline-none backdrop-blur-xl"
        placeholder={placeholder}
      />

      <motion.label
        className="absolute left-6 text-white/60 pointer-events-none font-medium"
        animate={{
          top: isFocused || hasValue ? "0.5rem" : "50%",
          translateY: isFocused || hasValue ? "0" : "-50%",
          fontSize: isFocused || hasValue ? "0.75rem" : "1rem",
          color: isFocused ? "#FFD700" : "rgba(255, 255, 255, 0.6)",
        }}
        transition={{ duration: 0.2 }}
      >
        {placeholder}
      </motion.label>

      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40"
        animate={{
          scale: isFocused ? [1, 1.5, 1] : 1,
          backgroundColor: isFocused ? "#FFD700" : "rgba(255, 255, 255, 0.4)",
        }}
        transition={{ duration: 0.3 }}
      />
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0f1729]">
      {/* Animated Background */}
      <FloatingParticles />

      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFD700]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />

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
              className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/20 shadow-2xl"
              whileHover={{ boxShadow: "0 0 60px rgba(255, 215, 0, 0.2)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-black text-white mb-2 tracking-tight"
                >
                  Join the Academy
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 font-medium"
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
                />

                <AnimatedInput
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <AnimatedInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-rose-500/20 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm font-medium"
                    >
                      ✓ Account Created Successfully
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-5 h-5 border-3 border-black border-t-transparent rounded-full"
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
                  <p className="text-white/60 text-sm font-medium">
                    Already enrolled?{" "}
                    <Link
                      to="/login"
                      className="text-[#FFD700] font-bold hover:text-[#FDB931] transition-colors"
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
            className="hidden lg:block text-white space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-7xl font-black tracking-tighter mb-4 bg-gradient-to-r from-purple-200 via-indigo-200 to-white bg-clip-text text-transparent">
                Must Academy
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-[#FFD700] to-transparent rounded-full" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/70 leading-relaxed max-w-md font-medium"
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
                  className="flex items-start gap-4 bg-white/5 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10"
                >
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FDB931] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-lg">{item.label}</h3>
                    <p className="text-white/60 text-sm">{item.desc}</p>
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
