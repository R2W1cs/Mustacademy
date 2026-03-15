import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

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

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            await api.post("/auth/reset-password", { token, newPassword: password });
            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. Token may be expired.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0f1729]">
            <FloatingParticles />

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/20 shadow-2xl max-w-md w-full"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-white mb-2">Set New Password</h2>
                        <p className="text-white/60">Enter your new secure password below.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-white/15 transition-all outline-none"
                                required
                                minLength={6}
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-white/15 transition-all outline-none"
                                required
                                minLength={6}
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-rose-500/20 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm font-medium"
                                >
                                    Success! Redirecting to login...
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className="w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        >
                            {isLoading ? "Updating..." : "Reset Password"}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-white/60 text-sm hover:text-white transition-colors">
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;

