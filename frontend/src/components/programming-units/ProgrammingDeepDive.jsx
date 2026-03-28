import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, Box, Globe, Code2 } from 'lucide-react';
import CMemoryMatrix from './CMemoryMatrix';
import JavaJVMBrief from './JavaJVMBrief';
import PythonRuntime from './PythonRuntime';
import WebProtocolScale from './WebProtocolScale';

const ProgrammingDeepDive = ({ type }) => {
    if (!type) return null;

    const renderUnit = () => {
        switch (type) {
            case 'c': return <CMemoryMatrix />;
            case 'java': return <JavaJVMBrief />;
            case 'python': return <PythonRuntime />;
            case 'web': return <WebProtocolScale />;
            default: return null;
        }
    };

    const getUnitInfo = () => {
        switch (type) {
            case 'c': return { icon: <Cpu />, label: 'Systems Architecture', desc: 'Low-level memory & pointer matrix' };
            case 'java': return { icon: <Box />, label: 'Enterprise Runtime', desc: 'JVM blueprint & heap lifecycle' };
            case 'python': return { icon: <Terminal />, label: 'Dynamic Interpretation', desc: 'Python GIL & Bytecode telemetry' };
            case 'web': return { icon: <Globe />, label: 'Full Stack Protocol', desc: 'Request-to-pixel pipeline' };
            default: return { icon: <Code2 />, label: 'Deep Dive', desc: 'High-fidelity technical visualization' };
        }
    };

    const info = getUnitInfo();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-12"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg">
                    {info.icon}
                </div>
                <div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">{info.label}</h4>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-0.5">{info.desc}</p>
                </div>
            </div>
            
            <div className="relative">
                {/* Visualizer Unit */}
                {renderUnit()}
                
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
            </div>
        </motion.div>
    );
};

export default ProgrammingDeepDive;
