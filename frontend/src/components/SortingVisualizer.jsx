import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Search, Zap, Play, RotateCcw, Brain, TrendingUp } from 'lucide-react';

const SortingVisualizer = () => {
    const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
    const [algorithm, setAlgorithm] = useState('Bubble Sort');
    const [activeIdx, setActiveIdx] = useState([]);
    const [sortedIdx, setSortedIdx] = useState([]);
    const [isSorting, setIsSorting] = useState(false);
    const [step, setStep] = useState(0);
    const [explanation, setExplanation] = useState('Select an algorithm and initialize the protocol.');

    const reset = () => {
        setArray([64, 34, 25, 12, 22, 11, 90]);
        setActiveIdx([]);
        setSortedIdx([]);
        setIsSorting(false);
        setStep(0);
        setExplanation('System Reset. Data arrays normalized.');
    };

    const bubbleSortStep = async () => {
        setIsSorting(true);
        let arr = [...array];
        let n = arr.length;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                setActiveIdx([j, j + 1]);
                setExplanation(`Comparing index ${j} (${arr[j]}) and ${j + 1} (${arr[j + 1]}).`);
                await new Promise(r => setTimeout(r, 600));

                if (arr[j] > arr[j + 1]) {
                    setExplanation(`Swap required: ${arr[j]} > ${arr[j + 1]}. Entropy reduction in progress.`);
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    setArray([...arr]);
                    await new Promise(r => setTimeout(r, 600));
                }
                setStep(s => s + 1);
            }
            setSortedIdx(prev => [...prev, n - i - 1]);
        }
        setIsSorting(false);
        setExplanation('Bubble Sort Complete: Array is now in a state of minimum entropy.');
    };

    const linearSearchTrace = async () => {
        setIsSorting(true);
        setActiveIdx([]);
        setSortedIdx([]);
        setStep(0);
        const target = 22; // Example target
        setExplanation(`Linear Search Protocol: Scanning array for target ${target} sequentially.`);
        await new Promise(r => setTimeout(r, 1000));

        for (let i = 0; i < array.length; i++) {
            setActiveIdx([i]);
            setExplanation(`Checking index ${i}: Value ${array[i]}. Does it match ${target}?`);
            await new Promise(r => setTimeout(r, 800));

            if (array[i] === target) {
                setExplanation(`Target ${target} located at index ${i}. Search complexity: O(n).`);
                setSortedIdx([i]);
                break;
            }
            setStep(s => s + 1);
        }
        setIsSorting(false);
    };

    const binarySearchTrace = async () => {
        setIsSorting(true);
        setActiveIdx([]);
        setSortedIdx([]);
        setStep(0);
        const sortedArr = [11, 12, 22, 25, 34, 64, 90]; // Binary search requires a sorted array
        setArray(sortedArr);
        const target = 25; // Example target
        let left = 0;
        let right = sortedArr.length - 1;

        setExplanation(`Binary Search Protocol: Searching for target ${target} in sorted array.`);
        await new Promise(r => setTimeout(r, 1000));

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            setActiveIdx([left, mid, right]);
            setExplanation(`Left: ${left}, Mid: ${mid}, Right: ${right}. Mid value is ${sortedArr[mid]}.`);
            await new Promise(r => setTimeout(r, 1500));

            if (sortedArr[mid] === target) {
                setExplanation(`Target ${target} located at index ${mid}. Efficiency: O(log n).`);
                setSortedIdx([mid]);
                break;
            }
            if (sortedArr[mid] < target) {
                setExplanation(`${sortedArr[mid]} < ${target}. Discarding left half.`);
                left = mid + 1;
            } else {
                setExplanation(`${sortedArr[mid]} > ${target}. Discarding right half.`);
                right = mid - 1;
            }
            setStep(s => s + 1);
        }
        setIsSorting(false);
    };

    const quickSortTrace = async () => {
        setIsSorting(true);
        setActiveIdx([]);
        setSortedIdx([]);
        setStep(0);
        let arr = [...array];
        setExplanation("Quick Sort Protocol: Recursive partitioning using pivots.");

        const partition = async (low, high) => {
            let pivot = arr[high];
            setActiveIdx([high]);
            setExplanation(`Pivot selected: ${pivot} at index ${high}. Partitioning subarray.`);
            await new Promise(r => setTimeout(r, 1000));

            let i = low - 1;
            for (let j = low; j < high; j++) {
                setActiveIdx([j, high]);
                if (arr[j] < pivot) {
                    i++;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    setArray([...arr]);
                    await new Promise(r => setTimeout(r, 600));
                }
            }
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            setArray([...arr]);
            setSortedIdx(prev => [...prev, i + 1]);
            return i + 1;
        };

        const sort = async (low, high) => {
            if (low < high) {
                let pi = await partition(low, high);
                await sort(low, pi - 1);
                await sort(pi + 1, high);
            } else if (low === high) {
                setSortedIdx(prev => [...prev, low]);
            }
        };

        await sort(0, arr.length - 1);
        setIsSorting(false);
        setExplanation("Quick Sort Complete: Partitioning tree resolved.");
    };

    const mergeSortTrace = async () => {
        setIsSorting(true);
        setActiveIdx([]);
        setSortedIdx([]);
        setStep(0);
        let arr = [...array];
        setExplanation("Merge Sort Protocol: Divide & Conquer (Recursive splitting and merging).");

        const merge = async (l, m, r) => {
            let n1 = m - l + 1;
            let n2 = r - m;
            let L = arr.slice(l, m + 1);
            let R = arr.slice(m + 1, r + 1);

            let i = 0, j = 0, k = l;
            while (i < n1 && j < n2) {
                setActiveIdx([l + i, m + 1 + j]);
                setExplanation(`Merging: Comparing ${L[i]} and ${R[j]}.`);
                await new Promise(r => setTimeout(r, 800));

                if (L[i] <= R[j]) {
                    arr[k] = L[i];
                    i++;
                } else {
                    arr[k] = R[j];
                    j++;
                }
                setArray([...arr]);
                k++;
            }

            while (i < n1) {
                arr[k] = L[i];
                i++;
                k++;
                setArray([...arr]);
                await new Promise(r => setTimeout(r, 400));
            }
            while (j < n2) {
                arr[k] = R[j];
                j++;
                k++;
                setArray([...arr]);
                await new Promise(r => setTimeout(r, 400));
            }
            for (let idx = l; idx <= r; idx++) {
                setSortedIdx(prev => [...new Set([...prev, idx])]);
            }
        };

        const sort = async (l, r) => {
            if (l >= r) return;
            let m = l + Math.floor((r - l) / 2);
            await sort(l, m);
            await sort(m + 1, r);
            await merge(l, m, r);
        };

        await sort(0, arr.length - 1);
        setIsSorting(false);
        setExplanation("Merge Sort Complete: Array stabilized at O(n log n).");
    };

    const runSimulation = () => {
        switch (algorithm) {
            case 'Bubble Sort': bubbleSortStep(); break;
            case 'Linear Search': linearSearchTrace(); break;
            case 'Binary Search': binarySearchTrace(); break;
            case 'Quick Sort': quickSortTrace(); break;
            case 'Merge Sort': mergeSortTrace(); break;
            default: break;
        }
    };

    return (
        <div className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-[3rem] overflow-hidden flex flex-col h-[700px] hover:border-indigo-500/20 transition-all duration-500">
            {/* Header */}
            <div className="p-8 border-b border-foreground/10 flex justify-between items-center bg-indigo-500/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                        <BarChart size={20} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Mastery Lab</h4>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Search & Sort Protocol</h2>
                    </div>
                </div>
                <div className="flex gap-4">
                    <select
                        onChange={(e) => { setAlgorithm(e.target.value); reset(); }}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-foreground/60 outline-none"
                    >
                        <option>Bubble Sort</option>
                        <option>Merge Sort</option>
                        <option>Quick Sort</option>
                        <option disabled>─ Search ─</option>
                        <option>Linear Search</option>
                        <option>Binary Search</option>
                    </select>
                    <button onClick={reset} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/5 text-foreground/40 transition-all">Reset</button>
                    <button
                        disabled={isSorting}
                        onClick={runSimulation}
                        className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        Start Simulation
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Visualizer Area */}
                <div className="flex-1 p-12 flex items-center justify-center gap-4 border-r border-foreground/10 bg-black/20">
                    <div className="flex items-end h-64 gap-2 lg:gap-4">
                        {array.map((val, idx) => {
                            const isActive = activeIdx.includes(idx);
                            const isSorted = sortedIdx.includes(idx);

                            return (
                                <div key={idx} className="flex flex-col items-center gap-4">
                                    <span className={`text-[10px] font-black ${isActive ? 'text-indigo-400' : 'text-foreground/20'}`}>{val}</span>
                                    <motion.div
                                        layout
                                        animate={{
                                            height: val * 2,
                                            backgroundColor: isActive ? '#6366f1' : isSorted ? '#10b981' : 'rgba(255,255,255,0.05)',
                                            boxShadow: isActive ? '0 0 30px rgba(99,102,241,0.5)' : 'none'
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="w-8 lg:w-12 rounded-t-xl border border-white/5"
                                    />
                                    <span className="text-[8px] font-bold text-foreground/10 uppercase">idx {idx}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-white/5 p-12 flex flex-col gap-12 bg-white/[0.01] backdrop-blur-3xl">
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="text-indigo-400" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Live Analysis</span>
                        </div>
                        <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/10 min-h-[120px]">
                            <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">
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
                                <span className="text-lg font-black text-foreground">
                                    {algorithm.includes('Bubble') ? 'O(n²)' :
                                        algorithm.includes('Merge') || algorithm.includes('Quick') ? 'O(n log n)' :
                                            algorithm.includes('Binary') ? 'O(log n)' : 'O(n)'}
                                </span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[9px] font-black text-foreground/30 uppercase block mb-1">Space</span>
                                <span className="text-lg font-black text-foreground">
                                    {algorithm.includes('Merge') ? 'O(n)' :
                                        algorithm.includes('Quick') ? 'O(log n)' : 'O(1)'}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="mt-auto p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="text-indigo-400" size={14} />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mastery Protocol</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h5 className="text-[9px] font-black uppercase text-indigo-300 mb-1">Concept & Use Case</h5>
                                <p className="text-[10px] text-foreground/50 leading-relaxed">
                                    {algorithm === 'Bubble Sort' ? "Iterative adjacent swapping. Use for educational purposes or extremely small, near-sorted datasets." :
                                        algorithm === 'Merge Sort' ? "Stable sorting via recursive splitting. Use when stability is critical or for massive datasets that don't fit in RAM." :
                                            algorithm === 'Quick Sort' ? "Divide & Conquer using a pivot. The industry standard for high-speed, in-memory sorting." :
                                                algorithm === 'Linear Search' ? "Sequential scan. Use for unsorted data or small arrays where sorting overhead isn't justified." :
                                                    "Logarithmic search via halving. Mandatory for high-speed retrieval in sorted datasets."}
                                </p>
                            </div>
                            <div>
                                <h5 className="text-[9px] font-black uppercase text-indigo-300 mb-1">The Pattern</h5>
                                <ul className="text-[9px] text-foreground/40 space-y-1 list-disc list-inside leading-tight italic">
                                    {algorithm === 'Bubble Sort' && (
                                        <>
                                            <li>Compare adjacent pairs</li>
                                            <li>Swap if left &gt; right</li>
                                            <li>Largest element "bubbles" up</li>
                                            <li>Repeat for n-1 elements</li>
                                        </>
                                    )}
                                    {algorithm === 'Merge Sort' && (
                                        <>
                                            <li>Split array in half recursively</li>
                                            <li>Solve sub-arrays of size 1</li>
                                            <li>Merge sorted halves</li>
                                            <li>Stabilize relative order</li>
                                        </>
                                    )}
                                    {algorithm === 'Quick Sort' && (
                                        <>
                                            <li>Select a pivot element</li>
                                            <li>Partition: {`< pivot | pivot | > pivot`}</li>
                                            <li>Recurse on partitions</li>
                                            <li>In-place memory efficient</li>
                                        </>
                                    )}
                                    {algorithm === 'Linear Search' && (
                                        <>
                                            <li>Start at index 0</li>
                                            <li>Check if element matches target</li>
                                            <li>Increment index lineally</li>
                                            <li>Return index or null</li>
                                        </>
                                    )}
                                    {algorithm === 'Binary Search' && (
                                        <>
                                            <li>Define Low and High bounds</li>
                                            <li>Calculate Midpoint index</li>
                                            <li>Discard half of search space</li>
                                            <li>Repeat on remaining half</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SortingVisualizer;
