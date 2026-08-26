import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useTheme } from "../auth/ThemeContext";
import { RefreshCw, Play, Dices } from "lucide-react";

const ACCENT = "#c01636";
const CYAN = "#00f2ff";

function Shell({ title, caption, children, isDark, onReset }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/10 bg-[#0a0e14]" : "border-neutral-200 bg-white"}`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? "border-white/5 bg-black/20" : "border-neutral-100 bg-neutral-50"}`}>
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-cyan-400/80" : "text-[#c01636]"}`}>Interactive lab</div>
          <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-neutral-900"}`}>{title}</div>
        </div>
        {onReset && (
          <button type="button" onClick={onReset} className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 ${isDark ? "hover:bg-white/5 text-slate-400" : "hover:bg-neutral-100 text-neutral-500"}`}>
            <RefreshCw size={14} /> Reset
          </button>
        )}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {caption && <p className={`px-4 pb-4 text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-neutral-500"}`}>{caption}</p>}
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, onChange, isDark }) {
  return (
    <label className="block text-xs space-y-1">
      <span className={`flex justify-between ${isDark ? "text-slate-400" : "text-neutral-600"}`}>
        <span>{label}</span>
        <span className="font-mono font-semibold">{typeof value === "number" ? (Number.isInteger(step) ? value : value.toFixed(2)) : value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#c01636]" />
    </label>
  );
}

function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
function variance(arr, sample = true) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const s = arr.reduce((a, x) => a + (x - m) ** 2, 0);
  return s / (sample ? arr.length - 1 : arr.length);
}
function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function normalPdf(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ── Modes ─────────────────────────────────────────────────────────────── */

function DataTypesLab({ isDark }) {
  const items = useMemo(() => [
    { id: 1, label: "Student major", answer: "qual" },
    { id: 2, label: "Height (cm)", answer: "cont" },
    { id: 3, label: "Emails sent today", answer: "disc" },
    { id: 4, label: "Favorite color", answer: "qual" },
    { id: 5, label: "Exam score (0–100)", answer: "cont" },
    { id: 6, label: "Number of siblings", answer: "disc" },
  ], []);
  const [guess, setGuess] = useState({});
  const opts = [
    { k: "qual", t: "Qualitative" },
    { k: "disc", t: "Discrete quant." },
    { k: "cont", t: "Continuous quant." },
  ];
  const correct = items.filter((i) => guess[i.id] === i.answer).length;
  return (
    <div className="space-y-3">
      {items.map((it) => {
        const g = guess[it.id];
        const ok = g && g === it.answer;
        const bad = g && g !== it.answer;
        return (
          <div key={it.id} className={`rounded-xl border p-3 ${bad ? "border-red-400/50" : ok ? "border-emerald-400/40" : isDark ? "border-white/10" : "border-neutral-200"}`}>
            <div className="text-sm font-medium mb-2">{it.label}</div>
            <div className="flex flex-wrap gap-2">
              {opts.map((o) => (
                <button key={o.k} type="button" onClick={() => setGuess((p) => ({ ...p, [it.id]: o.k }))}
                  className={`text-xs px-3 py-1.5 rounded-lg border ${g === o.k ? (isDark ? "bg-[#c01636]/30 border-[#c01636]/50" : "bg-rose-50 border-[#c01636]/40") : isDark ? "border-white/10 hover:bg-white/5" : "border-neutral-200 hover:bg-neutral-50"}`}>
                  {o.t}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>{correct}/{items.length} classified correctly</p>
    </div>
  );
}

function HistogramLab({ isDark, showBox = false }) {
  const base = useMemo(() => Array.from({ length: 80 }, () => Math.round(50 + randn() * 12 + (Math.random() < 0.15 ? 25 : 0))), []);
  const [bins, setBins] = useState(8);
  const hist = useMemo(() => {
    const min = Math.min(...base), max = Math.max(...base);
    const w = (max - min) / bins || 1;
    const counts = Array(bins).fill(0);
    base.forEach((v) => {
      let i = Math.min(bins - 1, Math.floor((v - min) / w));
      counts[i]++;
    });
    const mx = Math.max(...counts, 1);
    return { counts, min, max, w, mx };
  }, [base, bins]);
  const sorted = useMemo(() => [...base].sort((a, b) => a - b), [base]);
  const q = (p) => {
    const i = (sorted.length - 1) * p;
    const lo = Math.floor(i), hi = Math.ceil(i);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
  };
  const q1 = q(0.25), med = q(0.5), q3 = q(0.75);
  const W = 420, H = 160, pad = 24;
  return (
    <div className="space-y-4">
      <Slider label="Number of bins" value={bins} min={4} max={20} onChange={setBins} isDark={isDark} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {hist.counts.map((c, i) => {
          const bw = (W - 2 * pad) / bins;
          const h = (c / hist.mx) * (H - 40);
          return <rect key={i} x={pad + i * bw + 1} y={H - 20 - h} width={bw - 2} height={h} fill={isDark ? CYAN : ACCENT} opacity={0.75} rx={2} />;
        })}
        {showBox && (
          <g>
            <line x1={pad + ((q1 - hist.min) / (hist.max - hist.min || 1)) * (W - 2 * pad)} y1={12} x2={pad + ((q3 - hist.min) / (hist.max - hist.min || 1)) * (W - 2 * pad)} y2={12} stroke={isDark ? "#fbbf24" : "#b45309"} strokeWidth={6} strokeLinecap="round" />
            <circle cx={pad + ((med - hist.min) / (hist.max - hist.min || 1)) * (W - 2 * pad)} cy={12} r={4} fill={isDark ? "#fff" : "#000"} />
          </g>
        )}
      </svg>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>n={base.length} · mean={mean(base).toFixed(1)} · median={median(base).toFixed(1)}{showBox ? ` · IQR=${(q3 - q1).toFixed(1)}` : ""}</p>
    </div>
  );
}

function CentralTendencyLab({ isDark }) {
  const [pts, setPts] = useState([2, 4, 5, 7, 12]);
  const m = mean(pts), med = median(pts);
  const modeMap = pts.reduce((a, x) => ({ ...a, [x]: (a[x] || 0) + 1 }), {});
  const mode = Object.entries(modeMap).sort((a, b) => b[1] - a[1])[0]?.[0];
  const W = 420, H = 100;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={20} y1={60} x2={W - 20} y2={60} stroke={isDark ? "#334155" : "#e5e7eb"} strokeWidth={2} />
        {pts.map((p, i) => {
          const x = 20 + ((p - 0) / 15) * (W - 40);
          return (
            <circle key={i} cx={x} cy={60} r={10} fill={isDark ? CYAN : ACCENT} opacity={0.85}
              onPointerDown={(e) => {
                const svg = e.currentTarget.ownerSVGElement;
                const move = (ev) => {
                  const rect = svg.getBoundingClientRect();
                  const nx = Math.min(15, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 15));
                  setPts((prev) => prev.map((v, j) => (j === i ? Math.round(nx * 2) / 2 : v)));
                };
                const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
                window.addEventListener("pointermove", move);
                window.addEventListener("pointerup", up);
              }}
              style={{ cursor: "ew-resize" }}
            />
          );
        })}
        <line x1={20 + (m / 15) * (W - 40)} y1={20} x2={20 + (m / 15) * (W - 40)} y2={85} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />
        <line x1={20 + (med / 15) * (W - 40)} y1={20} x2={20 + (med / 15) * (W - 40)} y2={85} stroke="#10b981" strokeWidth={2} />
      </svg>
      <div className={`flex flex-wrap gap-3 text-xs font-mono ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
        <span className="text-amber-500">mean {m.toFixed(2)}</span>
        <span className="text-emerald-500">median {med.toFixed(2)}</span>
        <span>mode {mode}</span>
      </div>
      <p className={`text-xs ${isDark ? "text-slate-500" : "text-neutral-500"}`}>Drag points horizontally. Watch the mean chase outliers.</p>
    </div>
  );
}

function DispersionLab({ isDark }) {
  const [spread, setSpread] = useState(2);
  const pts = useMemo(() => [5 - 2 * spread, 5 - spread, 5, 5 + spread, 5 + 2 * spread], [spread]);
  const m = mean(pts), sd = Math.sqrt(variance(pts));
  const W = 420, H = 110;
  return (
    <div className="space-y-3">
      <Slider label="Spread" value={spread} min={0.5} max={4} step={0.5} onChange={setSpread} isDark={isDark} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={20} y1={70} x2={W - 20} y2={70} stroke={isDark ? "#334155" : "#e5e7eb"} strokeWidth={2} />
        {pts.map((p, i) => {
          const x = 20 + (p / 15) * (W - 40);
          const mx = 20 + (m / 15) * (W - 40);
          return (
            <g key={i}>
              <line x1={mx} y1={70} x2={x} y2={40} stroke={isDark ? "#64748b" : "#94a3b8"} strokeWidth={1.5} />
              <circle cx={x} cy={40} r={8} fill={isDark ? CYAN : ACCENT} />
            </g>
          );
        })}
        <circle cx={20 + (m / 15) * (W - 40)} cy={70} r={5} fill="#f59e0b" />
      </svg>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>mean={m.toFixed(2)} · s≈{sd.toFixed(2)} (sample SD)</p>
    </div>
  );
}

function SampleSpaceLab({ isDark }) {
  const [faces, setFaces] = useState([]);
  const roll = () => setFaces((f) => [...f.slice(-39), 1 + Math.floor(Math.random() * 6)]);
  const even = faces.filter((x) => x % 2 === 0).length;
  const W = 420, H = 100;
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={roll} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#c01636]">
          <Dices size={14} /> Roll die
        </button>
        <button type="button" onClick={() => { for (let i = 0; i < 20; i++) roll(); }} className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark ? "border-white/10" : "border-neutral-200"}`}>×20</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {[1, 2, 3, 4, 5, 6].map((f) => {
          const c = faces.filter((x) => x === f).length;
          const h = faces.length ? (c / faces.length) * 70 : 0;
          const evenFace = f % 2 === 0;
          return <rect key={f} x={30 + (f - 1) * 60} y={90 - h} width={44} height={h} fill={evenFace ? (isDark ? CYAN : ACCENT) : (isDark ? "#475569" : "#cbd5e1")} rx={4} />;
        })}
      </svg>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
        Ω={{`{1..6}`}} · event even highlighted · empirical P(even)={faces.length ? (even / faces.length).toFixed(2) : "—"} (theory 0.50)
      </p>
    </div>
  );
}

function ConditionalLab({ isDark }) {
  // 2x2: rows CS yes/no, cols Math yes/no
  const [table, setTable] = useState({ yy: 25, yn: 15, ny: 20, nn: 40 });
  const n = table.yy + table.yn + table.ny + table.nn;
  const pMathGivenCS = (table.yy) / (table.yy + table.yn || 1);
  const pCSGivenMath = (table.yy) / (table.yy + table.ny || 1);
  const cell = (key, label) => (
    <button type="button" onClick={() => setTable((t) => ({ ...t, [key]: t[key] + 1 }))}
      className={`p-4 rounded-xl border text-center ${isDark ? "border-white/10 hover:bg-white/5" : "border-neutral-200 hover:bg-neutral-50"}`}>
      <div className={`text-[10px] uppercase tracking-wide ${isDark ? "text-slate-500" : "text-neutral-400"}`}>{label}</div>
      <div className="text-xl font-bold font-mono">{table[key]}</div>
    </button>
  );
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {cell("yy", "CS ∩ Math")}
        {cell("yn", "CS ∩ ¬Math")}
        {cell("ny", "¬CS ∩ Math")}
        {cell("nn", "¬CS ∩ ¬Math")}
      </div>
      <p className={`text-xs ${isDark ? "text-slate-500" : "text-neutral-500"}`}>Tap a cell to add a student (n={n}).</p>
      <div className={`text-sm font-mono space-y-1 ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
        <div>P(Math | CS) = {pMathGivenCS.toFixed(3)}</div>
        <div>P(CS | Math) = {pCSGivenMath.toFixed(3)}</div>
        <div className={isDark ? "text-amber-400" : "text-amber-700"}>Not equal in general — conditioning direction matters.</div>
      </div>
    </div>
  );
}

function BayesLab({ isDark }) {
  const [prior, setPrior] = useState(0.01);
  const [tpr, setTpr] = useState(0.99);
  const [fpr, setFpr] = useState(0.05);
  const pData = tpr * prior + fpr * (1 - prior);
  const post = (tpr * prior) / (pData || 1);
  const bar = (label, v, color) => (
    <div className="space-y-1">
      <div className={`flex justify-between text-xs ${isDark ? "text-slate-400" : "text-neutral-500"}`}><span>{label}</span><span className="font-mono">{(v * 100).toFixed(1)}%</span></div>
      <div className={`h-3 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-neutral-100"}`}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, v * 100)}%`, background: color }} />
      </div>
    </div>
  );
  return (
    <div className="space-y-4">
      <Slider label="Prior P(Disease)" value={prior} min={0.001} max={0.2} step={0.001} onChange={setPrior} isDark={isDark} />
      <Slider label="True positive rate" value={tpr} min={0.5} max={1} step={0.01} onChange={setTpr} isDark={isDark} />
      <Slider label="False positive rate" value={fpr} min={0} max={0.3} step={0.01} onChange={setFpr} isDark={isDark} />
      {bar("Prior", prior, "#64748b")}
      {bar("Posterior after + test", post, isDark ? CYAN : ACCENT)}
      <p className={`text-xs ${isDark ? "text-slate-500" : "text-neutral-500"}`}>Even a great test leaves low posterior when the disease is rare — base rates matter.</p>
    </div>
  );
}

function IndependenceLab({ isDark }) {
  const [pa, setPa] = useState(0.4);
  const [pb, setPb] = useState(0.5);
  const [overlap, setOverlap] = useState(0.2);
  const product = pa * pb;
  const indep = Math.abs(overlap - product) < 0.01;
  return (
    <div className="space-y-3">
      <Slider label="P(A)" value={pa} min={0.05} max={0.9} step={0.05} onChange={setPa} isDark={isDark} />
      <Slider label="P(B)" value={pb} min={0.05} max={0.9} step={0.05} onChange={setPb} isDark={isDark} />
      <Slider label="P(A∩B)" value={overlap} min={0} max={Math.min(pa, pb)} step={0.01} onChange={setOverlap} isDark={isDark} />
      <div className={`rounded-xl border p-4 font-mono text-sm space-y-1 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
        <div>P(A)P(B) = {product.toFixed(3)}</div>
        <div>P(A∩B) = {overlap.toFixed(3)}</div>
        <div className={indep ? "text-emerald-500" : "text-amber-500"}>{indep ? "Independent (product matches joint)" : "Dependent (joint ≠ product)"}</div>
      </div>
    </div>
  );
}

function CountingLab({ isDark }) {
  const [n, setN] = useState(10);
  const [k, setK] = useState(3);
  const fact = (x) => { let r = 1; for (let i = 2; i <= x; i++) r *= i; return r; };
  const P = k <= n ? fact(n) / fact(n - k) : 0;
  const C = k <= n ? P / fact(k) : 0;
  return (
    <div className="space-y-3">
      <Slider label="n" value={n} min={1} max={12} onChange={(v) => { setN(v); if (k > v) setK(v); }} isDark={isDark} />
      <Slider label="k" value={k} min={0} max={n} onChange={setK} isDark={isDark} />
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl border p-4 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
          <div className={`text-[10px] uppercase tracking-wide mb-1 ${isDark ? "text-slate-500" : "text-neutral-400"}`}>Permutations P(n,k)</div>
          <div className="text-2xl font-mono font-bold">{P.toLocaleString()}</div>
          <div className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-neutral-500"}`}>Order matters</div>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
          <div className={`text-[10px] uppercase tracking-wide mb-1 ${isDark ? "text-slate-500" : "text-neutral-400"}`}>Combinations C(n,k)</div>
          <div className="text-2xl font-mono font-bold">{C.toLocaleString()}</div>
          <div className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-neutral-500"}`}>Order ignored</div>
        </div>
      </div>
    </div>
  );
}

function PmfLab({ isDark, dist = "binomial" }) {
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  const [lambda, setLambda] = useState(3);
  const values = useMemo(() => {
    if (dist === "poisson") {
      const arr = [];
      for (let k = 0; k <= 18; k++) {
        let pm = Math.exp(-lambda);
        for (let i = 1; i <= k; i++) pm *= lambda / i;
        arr.push({ k, p: pm });
      }
      return arr;
    }
    if (dist === "geometric") {
      const arr = [];
      for (let k = 1; k <= 16; k++) arr.push({ k, p: (1 - p) ** (k - 1) * p });
      return arr;
    }
    // binomial
    const comb = (nn, kk) => {
      if (kk < 0 || kk > nn) return 0;
      let r = 1;
      for (let i = 1; i <= kk; i++) r = (r * (nn - kk + i)) / i;
      return r;
    };
    return Array.from({ length: n + 1 }, (_, k) => ({
      k,
      p: comb(n, k) * p ** k * (1 - p) ** (n - k),
    }));
  }, [dist, n, p, lambda]);
  const mx = Math.max(...values.map((v) => v.p), 1e-9);
  const W = 440, H = 150;
  return (
    <div className="space-y-3">
      {dist === "poisson" ? (
        <Slider label="λ" value={lambda} min={0.5} max={10} step={0.5} onChange={setLambda} isDark={isDark} />
      ) : (
        <>
          {dist === "binomial" && <Slider label="n" value={n} min={2} max={20} onChange={setN} isDark={isDark} />}
          <Slider label="p" value={p} min={0.05} max={0.95} step={0.05} onChange={setP} isDark={isDark} />
        </>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {values.map(({ k, p: pk }) => {
          const x = 20 + k * ((W - 40) / Math.max(values.length - 1, 1));
          const h = (pk / mx) * 110;
          return (
            <g key={k}>
              <line x1={x} y1={H - 20} x2={x} y2={H - 20 - h} stroke={isDark ? CYAN : ACCENT} strokeWidth={3} />
              <circle cx={x} cy={H - 20 - h} r={3.5} fill={isDark ? CYAN : ACCENT} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PdfLab({ isDark, family = "normal" }) {
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [a, setA] = useState(-1);
  const [b, setB] = useState(1);
  const [alpha, setAlpha] = useState(2);
  const [beta, setBeta] = useState(2);
  const [lambda, setLambda] = useState(1);

  const xs = useMemo(() => {
    const out = [];
    if (family === "uniform") {
      for (let i = 0; i <= 100; i++) out.push(-0.5 + i * 0.02);
    } else if (family === "beta") {
      for (let i = 1; i < 100; i++) out.push(i / 100);
    } else if (family === "exponential") {
      for (let i = 0; i <= 100; i++) out.push(i * 0.08);
    } else if (family === "chi2") {
      for (let i = 0; i <= 100; i++) out.push(i * 0.2);
    } else {
      for (let i = 0; i <= 100; i++) out.push(mu - 4 * sigma + (i / 100) * 8 * sigma);
    }
    return out;
  }, [family, mu, sigma]);

  const pdf = useCallback((x) => {
    if (family === "uniform") return x >= 0 && x <= 1 ? 1 : 0;
    if (family === "exponential") return x >= 0 ? lambda * Math.exp(-lambda * x) : 0;
    if (family === "beta") {
      if (x <= 0 || x >= 1) return 0;
      // unnormalized visually scaled
      return Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1) * 4;
    }
    if (family === "chi2") {
      const k = Math.max(1, Math.round(sigma * 4));
      if (x <= 0) return 0;
      return Math.exp(-x / 2) * Math.pow(x, k / 2 - 1) / 8;
    }
    return normalPdf(x, mu, sigma);
  }, [family, mu, sigma, alpha, beta, lambda]);

  const ys = xs.map(pdf);
  const ymax = Math.max(...ys, 0.01);
  const W = 440, H = 160, pad = 20;
  const X = (x) => pad + ((x - xs[0]) / (xs[xs.length - 1] - xs[0] || 1)) * (W - 2 * pad);
  const Y = (y) => H - 20 - (y / ymax) * (H - 40);
  const path = xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Y(ys[i])}`).join(" ");
  const areaPts = xs.filter((x) => x >= a && x <= b);
  let areaPath = "";
  if (areaPts.length) {
    areaPath = `M${X(areaPts[0])},${Y(0)} ` + areaPts.map((x) => `L${X(x)},${Y(pdf(x))}`).join(" ") + ` L${X(areaPts[areaPts.length - 1])},${Y(0)} Z`;
  }
  // crude area estimate
  let area = 0;
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] >= a && xs[i] <= b) area += 0.5 * (ys[i] + ys[i - 1]) * (xs[i] - xs[i - 1]);
  }

  return (
    <div className="space-y-3">
      {family === "normal" && (
        <>
          <Slider label="μ" value={mu} min={-3} max={3} step={0.1} onChange={setMu} isDark={isDark} />
          <Slider label="σ" value={sigma} min={0.4} max={2.5} step={0.1} onChange={setSigma} isDark={isDark} />
        </>
      )}
      {family === "exponential" && <Slider label="λ" value={lambda} min={0.3} max={3} step={0.1} onChange={setLambda} isDark={isDark} />}
      {family === "beta" && (
        <>
          <Slider label="α" value={alpha} min={0.5} max={8} step={0.5} onChange={setAlpha} isDark={isDark} />
          <Slider label="β" value={beta} min={0.5} max={8} step={0.5} onChange={setBeta} isDark={isDark} />
        </>
      )}
      {family !== "beta" && family !== "chi2" && (
        <>
          <Slider label="Shade from a" value={a} min={xs[0]} max={xs[xs.length - 1]} step={0.1} onChange={setA} isDark={isDark} />
          <Slider label="Shade to b" value={b} min={xs[0]} max={xs[xs.length - 1]} step={0.1} onChange={setB} isDark={isDark} />
        </>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {areaPath && <path d={areaPath} fill={isDark ? "rgba(0,242,255,0.25)" : "rgba(192,22,54,0.2)"} />}
        <path d={path} fill="none" stroke={isDark ? CYAN : ACCENT} strokeWidth={2.5} />
      </svg>
      {family !== "beta" && family !== "chi2" && (
        <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>Approx shaded area P(a&lt;X&lt;b) ≈ {Math.max(0, area).toFixed(3)} — probability is area, not height.</p>
      )}
    </div>
  );
}

function CdfLab({ isDark }) {
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const xs = useMemo(() => Array.from({ length: 80 }, (_, i) => mu - 4 * sigma + (i / 79) * 8 * sigma), [mu, sigma]);
  // Approx CDF via erf
  const erf = (z) => {
    const sign = z < 0 ? -1 : 1;
    const x = Math.abs(z);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
  };
  const cdf = (x) => 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
  const W = 440, H = 150, pad = 20;
  const X = (x) => pad + ((x - xs[0]) / (xs[xs.length - 1] - xs[0])) * (W - 2 * pad);
  const Yp = (y) => H - 20 - y * (H - 40);
  const Yf = (y) => H - 20 - (y / (normalPdf(mu, mu, sigma) || 1)) * (H - 40) * 0.85;
  const cdfPath = xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Yp(cdf(x))}`).join(" ");
  const pdfPath = xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Yf(normalPdf(x, mu, sigma))}`).join(" ");
  return (
    <div className="space-y-3">
      <Slider label="μ" value={mu} min={-2} max={2} step={0.1} onChange={setMu} isDark={isDark} />
      <Slider label="σ" value={sigma} min={0.5} max={2} step={0.1} onChange={setSigma} isDark={isDark} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <path d={pdfPath} fill="none" stroke={isDark ? "#64748b" : "#94a3b8"} strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={cdfPath} fill="none" stroke={isDark ? CYAN : ACCENT} strokeWidth={2.5} />
      </svg>
      <p className={`text-xs ${isDark ? "text-slate-500" : "text-neutral-500"}`}>Solid = CDF F(x)=P(X≤x). Dashed = PDF (rescaled). CDF rises where PDF has mass.</p>
    </div>
  );
}

function ExpectationLab({ isDark }) {
  const [masses, setMasses] = useState([1, 2, 3, 2, 1]);
  const support = [1, 2, 3, 4, 5];
  const total = masses.reduce((a, b) => a + b, 0) || 1;
  const probs = masses.map((m) => m / total);
  const ex = support.reduce((a, x, i) => a + x * probs[i], 0);
  const ex2 = support.reduce((a, x, i) => a + x * x * probs[i], 0);
  const vr = ex2 - ex * ex;
  const W = 420, H = 120;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {masses.map((m, i) => (
          <Slider key={i} label={`p~${support[i]}`} value={m} min={0} max={6} onChange={(v) => setMasses((arr) => arr.map((x, j) => (j === i ? v : x)))} isDark={isDark} />
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={20} y1={90} x2={W - 20} y2={90} stroke={isDark ? "#334155" : "#e5e7eb"} strokeWidth={3} />
        {support.map((x, i) => {
          const px = 40 + i * 70;
          const h = probs[i] * 70;
          return (
            <g key={x}>
              <rect x={px - 14} y={90 - h} width={28} height={h} fill={isDark ? CYAN : ACCENT} opacity={0.8} rx={3} />
              <text x={px} y={108} textAnchor="middle" fontSize="10" fill={isDark ? "#94a3b8" : "#64748b"}>{x}</text>
            </g>
          );
        })}
        <line x1={40 + (ex - 1) * 70} y1={15} x2={40 + (ex - 1) * 70} y2={95} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" />
      </svg>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>E[X]={ex.toFixed(3)} · Var(X)={vr.toFixed(3)} — fulcrum at the mean</p>
    </div>
  );
}

function JointLab({ isDark }) {
  const [grid, setGrid] = useState([
    [0.1, 0.1, 0.05],
    [0.1, 0.2, 0.1],
    [0.05, 0.1, 0.2],
  ]);
  const scale = grid.flat().reduce((a, b) => a + b, 0) || 1;
  const mx = Math.max(...grid.flat()) / scale;
  const margX = [0, 1, 2].map((j) => grid.reduce((a, row) => a + row[j], 0) / scale);
  const margY = grid.map((row) => row.reduce((a, b) => a + b, 0) / scale);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5 max-w-xs">
        {grid.map((row, i) => row.map((v, j) => (
          <button key={`${i}-${j}`} type="button" onClick={() => setGrid((g) => g.map((r, ii) => r.map((c, jj) => (ii === i && jj === j ? c + 0.05 : c))))}
            className="aspect-square rounded-lg text-[10px] font-mono font-bold text-white"
            style={{ background: `rgba(${isDark ? "0,242,255" : "192,22,54"}, ${(v / scale) / mx})` }}>
            {(v / scale).toFixed(2)}
          </button>
        )))}
      </div>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
        Marginal X: [{margX.map((x) => x.toFixed(2)).join(", ")}] · Y: [{margY.map((y) => y.toFixed(2)).join(", ")}] — tap cells to add mass
      </p>
    </div>
  );
}

function LlnLab({ isDark }) {
  const [running, setRunning] = useState([]);
  const [mu] = useState(3.5);
  const add = (n = 1) => {
    setRunning((prev) => {
      const next = [...prev];
      for (let i = 0; i < n; i++) {
        const roll = 1 + Math.floor(Math.random() * 6);
        const sum = (next.length ? next[next.length - 1].sum : 0) + roll;
        const count = next.length + 1;
        next.push({ n: count, mean: sum / count, sum });
      }
      return next.slice(-200);
    });
  };
  const W = 440, H = 140, pad = 20;
  const pts = running;
  const path = pts.map((p, i) => {
    const x = pad + (i / Math.max(pts.length - 1, 1)) * (W - 2 * pad);
    const y = H - 20 - ((p.mean - 1) / 5) * (H - 40);
    return `${i ? "L" : "M"}${x},${y}`;
  }).join(" ");
  const muY = H - 20 - ((mu - 1) / 5) * (H - 40);
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => add(1)} className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#c01636] inline-flex items-center gap-1"><Play size={12} /> +1 roll</button>
        <button type="button" onClick={() => add(20)} className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark ? "border-white/10" : "border-neutral-200"}`}>+20</button>
        <button type="button" onClick={() => setRunning([])} className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark ? "border-white/10" : "border-neutral-200"}`}>Clear</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={pad} y1={muY} x2={W - pad} y2={muY} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5} />
        {path && <path d={path} fill="none" stroke={isDark ? CYAN : ACCENT} strokeWidth={2} />}
      </svg>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
        n={pts.length || 0} · running mean={pts.length ? pts[pts.length - 1].mean.toFixed(3) : "—"} → μ=3.5
      </p>
    </div>
  );
}

function CltLab({ isDark }) {
  const [n, setN] = useState(5);
  const [means, setMeans] = useState([]);
  const resample = () => {
    const batch = [];
    for (let t = 0; t < 200; t++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += Math.random(); // Uniform(0,1) population
      batch.push(s / n);
    }
    setMeans(batch);
  };
  useEffect(() => { resample(); }, [n]);
  const bins = 16;
  const hist = useMemo(() => {
    const counts = Array(bins).fill(0);
    means.forEach((m) => {
      const i = Math.min(bins - 1, Math.floor(m * bins));
      counts[i]++;
    });
    return counts;
  }, [means, bins]);
  const mx = Math.max(...hist, 1);
  const W = 440, H = 140, pad = 20;
  return (
    <div className="space-y-3">
      <Slider label="Sample size n per mean" value={n} min={1} max={40} onChange={setN} isDark={isDark} />
      <button type="button" onClick={resample} className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#c01636]">Resample 200 means</button>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {hist.map((c, i) => {
          const bw = (W - 2 * pad) / bins;
          const h = (c / mx) * (H - 40);
          return <rect key={i} x={pad + i * bw + 1} y={H - 20 - h} width={bw - 2} height={h} fill={isDark ? CYAN : ACCENT} opacity={0.8} rx={2} />;
        })}
      </svg>
      <p className={`text-xs ${isDark ? "text-slate-500" : "text-neutral-500"}`}>Population = Uniform(0,1) (flat). Means become bell-shaped as n grows — that's the CLT.</p>
    </div>
  );
}

function SamplingLab({ isDark }) {
  const population = useMemo(() => Array.from({ length: 200 }, (_, i) => 40 + (i % 50) + randn() * 3), []);
  const popMean = mean(population);
  const [n, setN] = useState(20);
  const [sample, setSample] = useState([]);
  const draw = () => {
    const idx = new Set();
    while (idx.size < Math.min(n, population.length)) idx.add(Math.floor(Math.random() * population.length));
    setSample([...idx].map((i) => population[i]));
  };
  useEffect(() => { draw(); }, [n]);
  return (
    <div className="space-y-3">
      <Slider label="Sample size n" value={n} min={5} max={60} onChange={setN} isDark={isDark} />
      <button type="button" onClick={draw} className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#c01636]">Draw sample</button>
      <div className={`text-sm font-mono space-y-1 ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
        <div>Population μ ≈ {popMean.toFixed(2)} (N={population.length})</div>
        <div>Sample x̄ = {sample.length ? mean(sample).toFixed(2) : "—"} (n={sample.length})</div>
        <div className={isDark ? "text-slate-500" : "text-neutral-500"}>Error |x̄−μ| = {sample.length ? Math.abs(mean(sample) - popMean).toFixed(2) : "—"}</div>
      </div>
    </div>
  );
}

function EstimationLab({ isDark }) {
  const [p, setP] = useState(0.6);
  const [n, setN] = useState(30);
  const [tick, setTick] = useState(0);
  const sample = useMemo(() => Array.from({ length: n }, () => (Math.random() < p ? 1 : 0)), [p, n, tick]);
  const phat = mean(sample);
  // Bernoulli log-likelihood curve
  const curve = useMemo(() => {
    const pts = [];
    for (let i = 1; i < 40; i++) {
      const theta = i / 40;
      let ll = 0;
      sample.forEach((x) => { ll += x ? Math.log(theta) : Math.log(1 - theta); });
      pts.push({ theta, ll });
    }
    return pts;
  }, [sample]);
  const maxLL = Math.max(...curve.map((c) => c.ll));
  const minLL = Math.min(...curve.map((c) => c.ll));
  const W = 440, H = 130, pad = 20;
  const path = curve.map((c, i) => {
    const x = pad + c.theta * (W - 2 * pad);
    const y = H - 20 - ((c.ll - minLL) / (maxLL - minLL || 1)) * (H - 40);
    return `${i ? "L" : "M"}${x},${y}`;
  }).join(" ");
  return (
    <div className="space-y-3">
      <Slider label="True p" value={p} min={0.1} max={0.9} step={0.05} onChange={setP} isDark={isDark} />
      <Slider label="n" value={n} min={10} max={100} step={5} onChange={setN} isDark={isDark} />
      <button type="button" onClick={() => setTick((t) => t + 1)} className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#c01636]">New sample</button>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <path d={path} fill="none" stroke={isDark ? CYAN : ACCENT} strokeWidth={2} />
        <line x1={pad + phat * (W - 2 * pad)} y1={10} x2={pad + phat * (W - 2 * pad)} y2={H - 15} stroke="#f59e0b" strokeWidth={2} />
      </svg>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>Log-likelihood for Bernoulli p · MLE p̂={phat.toFixed(3)} (amber) · true p={p.toFixed(2)}</p>
    </div>
  );
}

function ConfidenceLab({ isDark }) {
  const [n, setN] = useState(20);
  const mu = 50, sigma = 10;
  const [intervals, setIntervals] = useState([]);
  const z = 1.96;
  const run = () => {
    const list = [];
    for (let i = 0; i < 40; i++) {
      let s = 0;
      for (let j = 0; j < n; j++) s += mu + sigma * randn();
      const xbar = s / n;
      const se = sigma / Math.sqrt(n);
      const lo = xbar - z * se, hi = xbar + z * se;
      list.push({ lo, hi, cover: lo <= mu && mu <= hi });
    }
    setIntervals(list);
  };
  useEffect(() => { run(); }, [n]);
  const rate = intervals.length ? intervals.filter((x) => x.cover).length / intervals.length : 0;
  return (
    <div className="space-y-3">
      <Slider label="n" value={n} min={5} max={80} onChange={setN} isDark={isDark} />
      <button type="button" onClick={run} className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#c01636]">Simulate 40 intervals</button>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {intervals.map((iv, i) => (
          <div key={i} className="h-1.5 rounded-full relative mx-2" style={{ background: isDark ? "#1e293b" : "#e5e7eb" }}>
            <div className="absolute top-0 h-full rounded-full" style={{
              left: `${((iv.lo - 30) / 40) * 100}%`,
              width: `${((iv.hi - iv.lo) / 40) * 100}%`,
              background: iv.cover ? (isDark ? CYAN : ACCENT) : "#ef4444",
            }} />
          </div>
        ))}
      </div>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>95% z-CIs for μ=50 · capture rate this run: {(rate * 100).toFixed(0)}% (long-run → 95%)</p>
    </div>
  );
}

function HypothesisLab({ isDark }) {
  const [xbar, setXbar] = useState(52);
  const [alpha, setAlpha] = useState(0.05);
  const mu0 = 50, se = 2;
  const z = (xbar - mu0) / se;
  const erf = (z0) => {
    const sign = z0 < 0 ? -1 : 1;
    const x = Math.abs(z0);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
  };
  const Phi = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
  const pTwo = 2 * (1 - Phi(Math.abs(z)));
  const zcrit = 1.96; // approx for 0.05
  const reject = pTwo < alpha;
  const W = 440, H = 140, pad = 20;
  const xs = Array.from({ length: 80 }, (_, i) => -4 + i * 0.1);
  const path = xs.map((x, i) => {
    const px = pad + ((x + 4) / 8) * (W - 2 * pad);
    const py = H - 20 - normalPdf(x, 0, 1) * 120;
    return `${i ? "L" : "M"}${px},${py}`;
  }).join(" ");
  const zx = pad + ((z + 4) / 8) * (W - 2 * pad);
  return (
    <div className="space-y-3">
      <Slider label="Observed x̄" value={xbar} min={44} max={56} step={0.5} onChange={setXbar} isDark={isDark} />
      <Slider label="α" value={alpha} min={0.01} max={0.1} step={0.01} onChange={setAlpha} isDark={isDark} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <path d={path} fill="none" stroke={isDark ? "#64748b" : "#94a3b8"} strokeWidth={2} />
        <line x1={zx} y1={10} x2={zx} y2={H - 15} stroke={reject ? "#ef4444" : (isDark ? CYAN : ACCENT)} strokeWidth={2} />
        <text x={zx + 4} y={18} fontSize="10" fill={isDark ? "#e2e8f0" : "#334155"}>z={z.toFixed(2)}</text>
      </svg>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
        H₀: μ={mu0}, SE={se} · two-sided p≈{pTwo.toFixed(3)} · {reject ? `Reject H₀ at α=${alpha}` : `Fail to reject H₀ at α=${alpha}`}
        {alpha === 0.05 ? ` · |z| crit≈${zcrit}` : ""}
      </p>
    </div>
  );
}

function RegressionLab({ isDark }) {
  const [pts, setPts] = useState(() => Array.from({ length: 12 }, () => ({ x: Math.random() * 10, y: 2 + 1.2 * Math.random() * 10 + randn() })));
  const fit = useMemo(() => {
    const n = pts.length;
    const mx = mean(pts.map((p) => p.x));
    const my = mean(pts.map((p) => p.y));
    let sxx = 0, sxy = 0, syy = 0;
    pts.forEach((p) => {
      sxx += (p.x - mx) ** 2;
      sxy += (p.x - mx) * (p.y - my);
      syy += (p.y - my) ** 2;
    });
    const b1 = sxx ? sxy / sxx : 0;
    const b0 = my - b1 * mx;
    const r = Math.sqrt(sxx * syy) ? sxy / Math.sqrt(sxx * syy) : 0;
    const sse = pts.reduce((a, p) => a + (p.y - (b0 + b1 * p.x)) ** 2, 0);
    const sst = syy;
    const r2 = sst ? 1 - sse / sst : 0;
    return { b0, b1, r, r2 };
  }, [pts]);
  const W = 440, H = 200, pad = 24;
  const X = (x) => pad + (x / 10) * (W - 2 * pad);
  const Y = (y) => H - pad - ((y - 0) / 16) * (H - 2 * pad);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 10;
          const y = (1 - (e.clientY - rect.top) / rect.height) * 16;
          setPts((p) => [...p, { x, y }]);
        }}>
        <line x1={X(0)} y1={Y(fit.b0)} x2={X(10)} y2={Y(fit.b0 + fit.b1 * 10)} stroke={isDark ? CYAN : ACCENT} strokeWidth={2} />
        {pts.map((p, i) => (
          <g key={i}>
            <line x1={X(p.x)} y1={Y(p.y)} x2={X(p.x)} y2={Y(fit.b0 + fit.b1 * p.x)} stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth={1} />
            <circle cx={X(p.x)} cy={Y(p.y)} r={5} fill={isDark ? "#f8fafc" : ACCENT}
              onPointerDown={(e) => {
                e.stopPropagation();
                const svg = e.currentTarget.ownerSVGElement;
                const move = (ev) => {
                  const rect = svg.getBoundingClientRect();
                  const nx = ((ev.clientX - rect.left) / rect.width) * 10;
                  const ny = (1 - (ev.clientY - rect.top) / rect.height) * 16;
                  setPts((prev) => prev.map((q, j) => (j === i ? { x: Math.min(10, Math.max(0, nx)), y: Math.min(16, Math.max(0, ny)) } : q)));
                };
                const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
                window.addEventListener("pointermove", move);
                window.addEventListener("pointerup", up);
              }}
              style={{ cursor: "grab" }}
            />
          </g>
        ))}
      </svg>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
        ŷ = {fit.b0.toFixed(2)} + {fit.b1.toFixed(2)} x · r={fit.r.toFixed(3)} · R²={fit.r2.toFixed(3)} — drag points or click to add
      </p>
    </div>
  );
}

function BootstrapLab({ isDark }) {
  const sample = useMemo(() => Array.from({ length: 30 }, () => 50 + randn() * 12), []);
  const [boots, setBoots] = useState([]);
  const run = () => {
    const reps = [];
    for (let b = 0; b < 200; b++) {
      let s = 0;
      for (let i = 0; i < sample.length; i++) s += sample[Math.floor(Math.random() * sample.length)];
      reps.push(s / sample.length);
    }
    setBoots(reps);
  };
  useEffect(() => { run(); }, []);
  const sorted = [...boots].sort((a, b) => a - b);
  const lo = sorted[Math.floor(0.025 * sorted.length)] || 0;
  const hi = sorted[Math.floor(0.975 * sorted.length)] || 0;
  const bins = 14;
  const hist = useMemo(() => {
    if (!boots.length) return Array(bins).fill(0);
    const min = Math.min(...boots), max = Math.max(...boots);
    const w = (max - min) / bins || 1;
    const c = Array(bins).fill(0);
    boots.forEach((v) => { c[Math.min(bins - 1, Math.floor((v - min) / w))]++; });
    return c;
  }, [boots]);
  const mx = Math.max(...hist, 1);
  const W = 440, H = 120, pad = 20;
  return (
    <div className="space-y-3">
      <button type="button" onClick={run} className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#c01636]">Resample 200 bootstraps</button>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {hist.map((c, i) => {
          const bw = (W - 2 * pad) / bins;
          const h = (c / mx) * (H - 35);
          return <rect key={i} x={pad + i * bw + 1} y={H - 20 - h} width={bw - 2} height={h} fill={isDark ? CYAN : ACCENT} opacity={0.8} rx={2} />;
        })}
      </svg>
      <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
        Sample mean={mean(sample).toFixed(2)} · 95% percentile CI ≈ [{lo.toFixed(2)}, {hi.toFixed(2)}]
      </p>
    </div>
  );
}

const META = {
  dataTypes: { title: "Classify data types", caption: "Pick the right type for each variable — analysis depends on it." },
  histogram: { title: "Histograms & bin width", caption: "Same data, different bins — shape stories change." },
  histogramBox: { title: "Histogram + box summary", caption: "Link the five-number summary to the density shape." },
  centralTendency: { title: "Mean vs median", caption: "Drag points; mean chases outliers, median resists." },
  dispersion: { title: "Deviation & spread", caption: "Bars show distance from the mean — variance averages their squares." },
  sampleSpace: { title: "Sample space & events", caption: "Roll the die; even faces are the highlighted event." },
  conditional: { title: "Conditional probability", caption: "Build a two-way table; compare P(A|B) vs P(B|A)." },
  bayes: { title: "Bayes update", caption: "Prior × likelihood → posterior. Rare events stay rare after one noisy test." },
  independence: { title: "Independence check", caption: "Independent iff P(A∩B)=P(A)P(B)." },
  counting: { title: "Permutations & combinations", caption: "Order matters for P(n,k); not for C(n,k)." },
  pmf: { title: "Probability mass function", caption: "Stems are point probabilities — they must sum to 1." },
  pmfBinomial: { title: "Binomial PMF", caption: "Slide n and p; mass shifts and spreads." },
  pmfPoisson: { title: "Poisson PMF", caption: "Single parameter λ = mean = variance." },
  pmfGeometric: { title: "Geometric waiting time", caption: "Trials until first success." },
  pdf: { title: "Probability density", caption: "Shade an interval — probability is area under the curve." },
  pdfNormal: { title: "Normal density", caption: "μ centers, σ widens. Shade regions to read probability." },
  pdfUniform: { title: "Uniform density", caption: "Flat on [0,1] — length ratios are probabilities." },
  pdfExponential: { title: "Exponential waiting times", caption: "Memoryless continuous waits." },
  pdfBeta: { title: "Beta on (0,1)", caption: "Shape parameters move mass toward 0 or 1." },
  pdfChi2: { title: "Chi-square shape", caption: "Right-skewed; becomes more symmetric as df grows." },
  cdf: { title: "CDF ↔ PDF", caption: "CDF accumulates probability from the left." },
  expectation: { title: "Expectation as balance", caption: "The mean is the fulcrum of the probability masses." },
  joint: { title: "Joint distribution", caption: "Heatmap of joint mass; margins are sums of rows/columns." },
  lln: { title: "Law of Large Numbers", caption: "Running mean of die rolls drifts toward 3.5." },
  clt: { title: "Central Limit Theorem", caption: "Averages of uniforms become approximately normal." },
  sampling: { title: "Population vs sample", caption: "Each draw gives a new x̄ near μ — that's sampling variation." },
  estimation: { title: "Likelihood & MLE", caption: "Peak of the log-likelihood is the MLE for p." },
  confidence: { title: "Confidence interval capture", caption: "In the long run, 95% of these random intervals cover μ." },
  hypothesis: { title: "Test statistic & p-value", caption: "How surprising is x̄ under H₀?" },
  regression: { title: "Least squares line", caption: "Drag points; residuals are the vertical gaps." },
  bootstrap: { title: "Bootstrap distribution", caption: "Resample the sample to approximate sampling variability." },
};

export default function ProbabilityVisualizer({ type = "histogram", config = {} }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const meta = META[type] || META.histogram;
  const [seed, setSeed] = useState(0);

  let body = null;
  switch (type) {
    case "dataTypes": body = <DataTypesLab isDark={isDark} />; break;
    case "histogram": body = <HistogramLab isDark={isDark} showBox={!!config.box} />; break;
    case "histogramBox": body = <HistogramLab isDark={isDark} showBox />; break;
    case "centralTendency": body = <CentralTendencyLab isDark={isDark} />; break;
    case "dispersion": body = <DispersionLab isDark={isDark} />; break;
    case "sampleSpace": body = <SampleSpaceLab key={seed} isDark={isDark} />; break;
    case "conditional": body = <ConditionalLab isDark={isDark} />; break;
    case "bayes": body = <BayesLab isDark={isDark} />; break;
    case "independence": body = <IndependenceLab isDark={isDark} />; break;
    case "counting": body = <CountingLab isDark={isDark} />; break;
    case "pmf":
    case "pmfBinomial": body = <PmfLab isDark={isDark} dist="binomial" />; break;
    case "pmfPoisson": body = <PmfLab isDark={isDark} dist="poisson" />; break;
    case "pmfGeometric": body = <PmfLab isDark={isDark} dist="geometric" />; break;
    case "pdf":
    case "pdfNormal": body = <PdfLab isDark={isDark} family="normal" />; break;
    case "pdfUniform": body = <PdfLab isDark={isDark} family="uniform" />; break;
    case "pdfExponential": body = <PdfLab isDark={isDark} family="exponential" />; break;
    case "pdfBeta": body = <PdfLab isDark={isDark} family="beta" />; break;
    case "pdfChi2": body = <PdfLab isDark={isDark} family="chi2" />; break;
    case "cdf": body = <CdfLab isDark={isDark} />; break;
    case "expectation": body = <ExpectationLab isDark={isDark} />; break;
    case "joint": body = <JointLab isDark={isDark} />; break;
    case "lln": body = <LlnLab isDark={isDark} />; break;
    case "clt": body = <CltLab isDark={isDark} />; break;
    case "sampling": body = <SamplingLab isDark={isDark} />; break;
    case "estimation": body = <EstimationLab isDark={isDark} />; break;
    case "confidence": body = <ConfidenceLab isDark={isDark} />; break;
    case "hypothesis": body = <HypothesisLab isDark={isDark} />; break;
    case "regression": body = <RegressionLab isDark={isDark} />; break;
    case "bootstrap": body = <BootstrapLab isDark={isDark} />; break;
    default: body = <HistogramLab isDark={isDark} />;
  }

  return (
    <Shell title={meta.title} caption={meta.caption} isDark={isDark} onReset={() => setSeed((s) => s + 1)}>
      {body}
    </Shell>
  );
}
