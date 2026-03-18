import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calculator, Brain, TrendingUp, Info } from 'lucide-react';

const KnapsackVisualizer = () => {
    const items = [
        { name: 'Synaptic Core', weight: 1, value: 15 },
        { name: 'Data Shard', weight: 2, value: 10 },
        { name: 'Crystal Link', weight: 3, value: 9 },
        { name: 'Neural Hub', weight: 4, value: 5 },
    ];
    const capacity = 5;

    const [currentRow, setCurrentRow] = useState(0);
    const [currentCol, setCurrentCol] = useState(0);
    const [dpTable, setDpTable] = useState(
        Array(items.length + 1).fill(0).map(() => Array(capacity + 1).fill(0))
    );
    const [explanation, setExplanation] = useState("Initialize the DP Matrix. Rows represent items, columns represent capacity.");

    const step = () => {
        let nextCol = currentCol + 1;
        let nextRow = currentRow;

        if (nextCol > capacity) {
            nextCol = 0;
            nextRow = currentRow + 1;
        }

        if (nextRow > items.length) {
            setExplanation("Optimization Complete: The bottom-right cell contains the maximum value.");
            return;
        }

        const itemIdx = nextRow - 1;
        let newVal = 0;

        if (nextRow === 0 || nextCol === 0) {
            newVal = 0;
        } else {
            const item = items[itemIdx];
            if (item.weight <= nextCol) {
                // Recurrence: max(exclude, include)
                const exclude = dpTable[nextRow - 1][nextCol];
                const include = item.value + dpTable[nextRow - 1][nextCol - item.weight];
                newVal = Math.max(exclude, include);
                setExplanation(
                    `Item: ${item.name} (w:${item.weight}, v:${item.value}). 
          Since weight $\\leq$ capacity ${nextCol}: 
          Compare Exclude (${exclude}) vs Include (${item.value} + ${dpTable[nextRow - 1][nextCol - item.weight]}). 
          Result: ${newVal}`
                );
            } else {
                newVal = dpTable[nextRow - 1][nextCol];
                setExplanation(`Item ${item.name} is too heavy ($w > ${nextCol}$). Carrying over previous value: ${newVal}`);
            }
        }

        const newTable = [...dpTable];
        newTable[nextRow][nextCol] = newVal;
        setDpTable(newTable);
        setCurrentRow(nextRow);
        setCurrentCol(nextCol);
    };

    const reset = () => {
        setCurrentRow(0);
        setCurrentCol(0);
        setDpTable(Array(items.length + 1).fill(0).map(() => Array(capacity + 1).fill(0)));
        setExplanation("Matrix reset. Ready for re-computation.");
    };

    return (
        <div className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-[3rem] overflow-hidden flex flex-col hover:border-indigo-500/20 transition-all duration-500">
            {/* Header */}
            <div className="p-8 border-b border-foreground/10 flex justify-between items-center bg-indigo-500/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                        <Package size={20} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Mastery Lab</h4>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight">0-1 Knapsack DP Visualizer</h2>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={reset} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/5 text-foreground/40 transition-all">Reset</button>
                    <button onClick={step} className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95">Next Computation</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Matrix View */}
                <div className="flex-1 p-8 border-r border-foreground/10">
                    <div className="min-w-[500px]">
                        <table className="w-full border-separate border-spacing-2">
                            <thead>
                                <tr>
                                    <th className="p-4 text-[10px] uppercase font-black text-foreground/20">Cap →</th>
                                    {Array(capacity + 1).fill(0).map((_, i) => (
                                        <th key={i} className="p-4 bg-foreground/[0.03] rounded-xl text-xs font-black text-foreground/40">{i}w</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dpTable.map((row, rIdx) => (
                                    <tr key={rIdx}>
                                        <td className="p-4 bg-foreground/[0.03] rounded-xl">
                                            {rIdx === 0 ? (
                                                <span className="text-[9px] font-black text-foreground/20 uppercase">Base Case</span>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase leading-none">{items[rIdx - 1].name}</span>
                                                    <span className="text-[8px] font-bold text-foreground/30 uppercase mt-1">w:{items[rIdx - 1].weight} v:{items[rIdx - 1].value}</span>
                                                </div>
                                            )}
                                        </td>
                                        {row.map((cell, cIdx) => {
                                            const isActive = currentRow === rIdx && currentCol === cIdx;
                                            return (
                                                <td
                                                    key={cIdx}
                                                    className={`p-6 text-center rounded-2xl border transition-all duration-300 ${isActive
                                                            ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-2xl z-10'
                                                            : cell > 0 ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-foreground/[0.02] border-foreground/5 text-foreground/20'
                                                        }`}
                                                >
                                                    <span className="text-xl font-black">{cell}</span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Explanation Side panel */}
                <div className="w-full md:w-[350px] bg-background/40 backdrop-blur-xl p-8 flex flex-col gap-8">
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="text-indigo-400" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Recurrence Logic</span>
                        </div>
                        <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <code className="text-[10px] text-indigo-300 leading-relaxed block mb-4">
                                if w[i] &lt; j:<br />
                                &nbsp;&nbsp;V[i,j] = max(V[i-1,j], v[i] + V[i-1, j-w[i]])<br />
                                else:<br />
                                &nbsp;&nbsp;V[i,j] = V[i-1,j]
                            </code>
                            <p className="text-[11px] text-foreground/60 leading-relaxed italic">
                                "{explanation}"
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-emerald-400" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Complexity Matrix</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[9px] font-black text-foreground/30 uppercase block mb-1">Time</span>
                                <span className="text-lg font-black text-foreground">O(nW)</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[9px] font-black text-foreground/30 uppercase block mb-1">Space</span>
                                <span className="text-lg font-black text-foreground">O(nW)</span>
                            </div>
                        </div>
                    </section>

                    <section className="mt-auto">
                        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="text-amber-500" size={14} />
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Crucial Insight</span>
                            </div>
                            <p className="text-[10px] text-foreground/50 leading-relaxed">
                                Notice how we use the results of smaller subproblems (the previous row) to solve the current one. This "Overlapping Subproblems" property is why DP outperforms naive recursion!
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default KnapsackVisualizer;
