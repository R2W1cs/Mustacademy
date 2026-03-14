import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../api/axios';

const PlanContext = createContext(null);

export function PlanProvider({ children }) {
    const [plan, setPlan] = useState(null);
    const [showPlanBuilder, setShowPlanBuilder] = useState(false);

    // Execution State
    const [activeBlockIndex, setActiveBlockIndex] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    const refreshPlan = useCallback(async () => {
        try {
            const res = await api.get('/ai/daily-plan/today');
            if (res.data?.schedule) {
                setPlan(res.data);
                const firstInbox = res.data.schedule.findIndex(b => !b.completed_at);
                if (firstInbox !== -1) {
                    setActiveBlockIndex(firstInbox);
                    // Only reset timer if it's not already running or we just loaded a fresh plan
                    if (!isRunning) {
                        setTimeLeft(res.data.schedule[firstInbox].duration * 60);
                    }
                } else {
                    setActiveBlockIndex(null);
                    setTimeLeft(0);
                }
            } else {
                setPlan(null);
                setActiveBlockIndex(null);
                setTimeLeft(0);
            }
        } catch {
            setPlan(null);
        }
    }, [isRunning]);

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            // Auto complete or stop? Let's leave it to the component to handle the specific "Complete" call if they want auto-stop
            setIsRunning(false);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, timeLeft]);

    const toggleTimer = () => setIsRunning(!isRunning);

    const completeBlock = async () => {
        if (!plan || activeBlockIndex === null) return;
        setIsRunning(false);
        try {
            const res = await api.post('/ai/daily-plan/session-complete', {
                blockIndex: activeBlockIndex
            });
            if (res.data.success) {
                setPlan({ ...plan, schedule: res.data.schedule });
                const nextIndex = res.data.schedule.findIndex((b, i) => i > activeBlockIndex && !b.completed_at);
                if (nextIndex !== -1) {
                    setActiveBlockIndex(nextIndex);
                    setTimeLeft(res.data.schedule[nextIndex].duration * 60);
                } else {
                    setActiveBlockIndex(null);
                    setTimeLeft(0);
                }
            }
        } catch (err) {
            console.error("Failed to sync completion:", err);
        }
    };

    const openBuilder = () => setShowPlanBuilder(true);
    const closeBuilder = () => setShowPlanBuilder(false);
    const onPlanGenerated = (data) => {
        if (data) {
            setPlan(data);
            const firstInbox = data.schedule.findIndex(b => !b.completed_at);
            if (firstInbox !== -1) {
                setActiveBlockIndex(firstInbox);
                setTimeLeft(data.schedule[firstInbox].duration * 60);
            }
        }
        setShowPlanBuilder(false);
    };

    return (
        <PlanContext.Provider value={{
            plan, refreshPlan, showPlanBuilder, openBuilder, closeBuilder, onPlanGenerated,
            activeBlockIndex, timeLeft, isRunning, toggleTimer, completeBlock, setActiveBlockIndex, setTimeLeft
        }}>
            {children}
        </PlanContext.Provider>
    );
}

export const usePlan = () => useContext(PlanContext);
