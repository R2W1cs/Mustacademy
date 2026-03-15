import React from 'react';
import { motion } from 'framer-motion';

const AtmosphericAura = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-100">
            {/* Aura 1 Pulse */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--aura-1)] blur-[120px] rounded-full"
            />
            {/* Aura 2 Pulse */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--aura-2)] blur-[140px] rounded-full"
            />
            {/* Aura 3 Drift */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 45, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-[var(--aura-3)] blur-[100px] rounded-full"
            />
        </div>
    );
};

export default AtmosphericAura;
