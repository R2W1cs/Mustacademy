import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { Mail, Lock, Check, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

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
        className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-transparent focus:border-gold focus:bg-white/15 transition-all duration-300 outline-none backdrop-blur-xl pr-14"
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

      {isPasswordField ? (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-gold transition-colors block"
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
          className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40"
          animate={{
            scale: isFocused ? [1, 1.5, 1] : 1,
            backgroundColor: isFocused ? "#FFD700" : "rgba(255, 255, 255, 0.4)",
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.id) {
        localStorage.setItem("userId", res.data.user.id);
        localStorage.setItem("userName", res.data.user.name || "Scholar");
      }
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Incorrect email or password. Please check your credentials and try again.");
      } else if (err.response?.status === 500) {
        setError("Server is starting up. Please wait 30 seconds and try again.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setError("");

    // Validate Must Education email domain
    if (!forgotEmail.endsWith("@musteducation.tn")) {
      setError("Please use your @musteducation.tn email address.");
      setForgotLoading(false);
      return;
    }

    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotSuccess(false);
        setForgotEmail("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send recovery email. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0f1729]">
      {/* Animated Background */}
      <FloatingParticles />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFD700]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:block text-white space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-7xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
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
              A precision-engineered platform for dedicated scholars. Master computer science through intelligent curriculum design and AI-powered mentorship.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-6 pt-4"
            >
              {[
                { label: "Smart Learning" },
                { label: "AI Mentors" },
                { label: "Track Progress" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FDB931]" />
                  <span className="text-sm font-bold text-white/80">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
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
                  Welcome Back
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 font-medium"
                >
                  Sign in to continue your scholarly journey
                </motion.p>
              </div>

              <form onSubmit={submit} className="space-y-6">
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

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#FFD700] hover:text-[#FDB931] font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

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
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Authenticating...
                    </span>
                  ) : (
                    "Access Academy"
                  )}
                </motion.button>

                <div className="text-center pt-4">
                  <p className="text-white/60 text-sm font-medium">
                    New to the Academy?{" "}
                    <Link
                      to="/register"
                      className="text-[#FFD700] font-bold hover:text-[#FDB931] transition-colors"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !forgotLoading && setShowForgotPassword(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/20 shadow-2xl max-w-md w-full"
            >
              <h3 className="text-2xl font-black text-white mb-2">Reset Password</h3>
              <p className="text-white/60 text-sm mb-6">
                Enter your Must Education email address and we'll send you a password reset link.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <AnimatedInput
                  type="email"
                  placeholder="Email Address (@musteducation.tn)"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />

                {forgotSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm font-medium"
                  >
                    ✓ Password reset mail sent
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={forgotLoading}
                    className="flex-1 py-3 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotSuccess}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;

