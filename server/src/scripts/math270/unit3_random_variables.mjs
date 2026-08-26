import { buildLesson } from "./helper.mjs";

const PART = "Part 3: Random Variables and Distributions";

export const topics = [
  buildLesson({
    title: "Discrete Random Variables and PMFs",
    partLabel: PART,
    principles: [
      "A random variable maps outcomes to numbers",
      "Discrete RVs take countable values",
      "The PMF p(x)=P(X=x) fully describes a discrete law",
      "PMFs are non-negative and sum to 1",
      "Event probabilities are sums of PMF values over sets",
    ],
    objectives: [
      "Define a discrete random variable from an experiment",
      "Write and validate a PMF (nonnegative, sums to 1)",
      "Compute event probabilities by summing PMF values",
      "Graph a PMF as a stem / spike plot",
      "Distinguish the RV from the underlying outcomes",
    ],
    why: "Events become numeric: X = number of bugs, packet losses, or correct quiz answers. Once the world is numeric, we can talk about means, variances, and distribution families. The **PMF** is the discrete distribution — the complete list of probabilities on each possible value.",
    story: "Your autograder runs a 5-question MC quiz. Each student produces a pattern of right/wrong answers — that is the outcome in Ω. You only need the score X ∈ {0,1,2,3,4,5}. Different answer patterns can share the same X. The PMF tells you how much probability sits on each score. When you ask P(X≥4), you sum p(4)+p(5) — no need to expand every bitstring if you already trust the PMF.",
    idea: "A **random variable** is a function \(X:\\Omega\\to\\mathbb{R}\) — it labels each outcome with a number. If the set of possible values is countable (finite or listable like 0,1,2,…), X is **discrete**. The **probability mass function (PMF)** is \(p(x)=P(X=x)\). Requirements: \(p(x)\\ge 0\) and \(\\sum_x p(x)=1\). For any set A of numbers, \(P(X\\in A)=\\sum_{x\\in A} p(x)\). Think of spikes on the number line whose heights are probabilities.",
    steps: [
      {
        title: "Define X in words tied to the experiment",
        body: "Write: \"X is the number of …\" or \"X is 1 if … else 0.\" If you cannot say what number is extracted from each outcome, you do not yet have a random variable — only a vague wish.",
      },
      {
        title: "List the support (possible values)",
        body: "Which numbers can X actually take? That set is the support. Leave p(x)=0 off-support rather than inventing impossible values.",
      },
      {
        title: "Assign probabilities p(x)",
        body: "Use equally likely counting, independence assumptions, or given data. Check every p(x)≥0 and the sum over the support equals 1 — this validation catches most homework errors.",
      },
      {
        title: "Answer event questions by summing",
        body: "P(X≤k), P(a≤X≤b), P(X is even) all become sums of the relevant spikes. Draw the stem plot and shade the stems you include.",
      },
      {
        title: "Connect back to Ω when confused",
        body: "If two different outcome stories seem to disagree, return to {ω : X(ω)∈A} and compute that event's probability. The PMF is only a compression of that picture.",
      },
    ],
    mathSimple: "- \(X:\\Omega\\to\\mathbb{R}\).\n- PMF: \(p_X(x)=P(X=x)=P(\\{\\omega: X(\\omega)=x\\})\).\n- Validity: \(p_X(x)\\ge 0\\), \(\\sum_x p_X(x)=1\).\n- Events: \(P(X\\in A)=\\sum_{x\\in A} p_X(x)\).\n- CDF preview: \(F(x)=P(X\\le x)=\\sum_{t\\le x} p_X(t)\).\n\nIn words: the PMF is a menu of point weights on the number line; probabilities of regions are sums of those weights.",
    walkthrough: "Fair six-sided die, X = face value. Support {1,2,3,4,5,6}.\n\np(x)=1/6 for each face. Sum=1 ✓.\n\nP(X≥5)=p(5)+p(6)=1/6+1/6=1/3.\nP(X even)=p(2)+p(4)+p(6)=1/2.\nP(X=7)=0 (not in support).\n\nStem plot: six equal spikes of height 1/6. Shading 5 and 6 visually matches the 1/3 calculation.",
    example: "Fair die: X=face, p(x)=1/6 for x=1..6. P(X≥5)=1/3. The PMF is flat — a discrete uniform distribution on six points.",
    example2: "Let Y = number of heads in two fair coin flips. Support {0,1,2}. Outcomes: HH,HT,TH,TT each 1/4.\nP(Y=0)=1/4, P(Y=1)=1/2, P(Y=2)=1/4. Check sum=1. P(Y≥1)=3/4. Note Y=1 aggregates two outcomes — the RV compresses Ω.",
    labCue: "Use the **pmf** lab: adjust a discrete distribution and watch stems resize while the sum stays 1. Force a violation (sum ≠ 1) and see why the tool rejects it.",
    check: [
      "Can a PMF value be greater than 1 at a point?",
      "How do you get P(X≤k) from a PMF?",
      "Why can many outcomes share the same X value?",
    ],
    practice: [
      {
        q: "A RV takes values 0,1,2 with probabilities 0.2, 0.5, c. Find c and P(X≥1).",
        a: "c=1−0.2−0.5=0.3. P(X≥1)=0.5+0.3=0.8.",
      },
      {
        q: "True or false: if X is discrete, P(X=x) can be positive. Contrast with continuous RVs (preview).",
        a: "True for discrete — point masses are allowed. For continuous RVs with a PDF, P(X=x)=0 for each single x; probability lives in intervals.",
      },
    ],
    formal: "A discrete random variable has countable support \(S\\). Its law is determined by the PMF \(p_X\) on \(S\). The induced probability measure on \(\\mathbb{R}\) places mass \(p_X(x)\) at each \(x\\in S\). The CDF is a right-continuous step function with jumps of size \(p_X(x)\).",
    formulas: "- \(\\sum_x p(x)=1\)\n- \(P(a\\le X\\le b)=\\sum_{x=a}^b p(x)\) on integer support\n- \(F(x)=\\sum_{t\\le x} p(t)\)",
    derivation: "Start from an event {X=x}⊆Ω. Apply P. Collecting these values as a function of x yields the PMF. Summing over x recovers P(Ω)=1 because the events {X=x} partition Ω (for X real-valued on all outcomes). Event probabilities for {X∈A} follow by countable additivity over those x in A.",
    pitfalls: [
      "Forgetting to check Σ p = 1",
      "Treating continuous densities as point masses",
      "Writing a formula for p(x) that is negative for some x",
    ],
    interview: "Define a RV as a numeric function of outcomes, then say 'the PMF lists P(X=x); I sum it over the event of interest.' Clear and exam-proof.",
    bridge: "When values smear over intervals instead of spikes, probability becomes area under a curve — continuous RVs and PDFs next.",
  }),

  buildLesson({
    title: "Continuous Random Variables and PDFs",
    partLabel: PART,
    principles: [
      "Continuous RVs have P(X=x)=0 for each single x",
      "Probability lives in areas under the PDF",
      "PDF f satisfies f≥0 and ∫ f = 1",
      "P(a<X<b)=∫_a^b f(x) dx",
      "f(x) is relative likelihood, not a probability",
    ],
    objectives: [
      "Contrast PDF with PMF",
      "Compute probabilities as integrals / areas",
      "Interpret f(x) as density, not P(X=x)",
      "Connect histograms to density estimates",
      "Normalize a nonnegative function into a PDF",
    ],
    why: "Time, measurement noise, and many physical quantities are continuous. You cannot list every possible latency. Densities replace point masses: probability becomes area. Confusing density height with probability is the #1 continuous-RV mistake in interviews and exams.",
    story: "You model request latency (seconds) as continuous. A teammate asks for P(X=0.250000) exactly and wants a nonzero answer from the PDF height f(0.25)=2. You explain: that height is not a probability — the probability of any exact millisecond-infinite-precision point is 0. What they want is P(0.24<X<0.26), the area of a thin strip under the curve. The PDF only makes sense through areas.",
    idea: "A **continuous random variable** is described by a **probability density function (PDF)** \(f(x)\\ge 0\) with \(\\int_{-\\infty}^{\\infty} f(x)\\,dx=1\). Then \(P(a<X<b)=\\int_a^b f\). The value \(f(x)\) can exceed 1; it has units of \"probability per unit of x.\" Histograms with density heights were already approximating this idea in Part 1.",
    steps: [
      {
        title: "Identify the support where f > 0",
        body: "Where can X live? Uniform on [0,1] has support (0,1). Exponential on [0,∞). Outside support, f=0 and intervals there contribute no probability.",
      },
      {
        title: "Normalize if given a shape kernel",
        body: "If someone hands you g(x)≥0 that is not yet a PDF, compute C=∫g and set f=g/C. Without total area 1, areas are not probabilities.",
      },
      {
        title: "Translate the question into an interval",
        body: "P(X>2), P(|X−μ|<1), P(X between 3 and 5) all become integrals on explicit bounds. Draw the curve and shade.",
      },
      {
        title: "Integrate (or use geometry) to get area",
        body: "Rectangles, triangles, and known antiderivatives cover most homework. Endpoints usually do not matter: P(a≤X≤b)=P(a<X<b) for continuous laws.",
      },
      {
        title: "Interpret density heights carefully",
        body: "Compare f(x1) and f(x2) as relative likelihoods of tiny neighborhoods, not as probabilities of exact points. Say \"higher density near x\" instead of \"more probable to equal x.\"",
      },
    ],
    mathSimple: "- PDF: \(f(x)\\ge 0\\), \(\\int_{-\\infty}^{\\infty} f(x)\\,dx=1\).\n- Interval probability: \(P(a<X<b)=\\int_a^b f(x)\\,dx\).\n- Point probability: \(P(X=x)=0\) for each fixed x.\n- Tiny interval: \(P(x\\in[x_0,x_0+dx])\\approx f(x_0)\\,dx\).\n\nIn words: the PDF is a weather map of crowding on the line; rain amount (probability) equals area, not the ink darkness at a dot.",
    walkthrough: "Let f(x)=2x for 0<x<1, and 0 elsewhere.\n\nCheck ∫₀¹ 2x dx = [x²]₀¹ = 1 ✓. Valid PDF.\n\nP(0.2<X<0.5)=∫₀.₂⁰.⁵ 2x dx = [x²]₀.₂⁰.⁵ = 0.25−0.04=0.21.\n\nP(X=0.3)=0.\n\nf(0.9)=1.8>1 — allowed! Height >1 is fine because height is not probability.",
    example: "Uniform(0,1): f(x)=1 on (0,1). P(0.2<X<0.5)=0.3. P(X=0.3)=0. Geometry: probability equals length of the subinterval inside [0,1].",
    example2: "Triangular density on [0,2]: f(x)=x/2 for 0≤x≤2? Check ∫₀² (x/2)dx=[x²/4]₀²=1 ✓. P(X>1)=∫₁² (x/2)dx=[x²/4]₁²=1−0.25=0.75. Most mass sits on the right half — density rises linearly.",
    labCue: "Open the **pdf** lab: shade an interval under the curve; read the area as probability. Crank a peak taller than 1 and confirm probabilities still stay ≤1.",
    check: [
      "Why is P(X=x)=0 for continuous X with a PDF?",
      "Can f(x)>1? Does that break axioms?",
      "How does a histogram density estimate relate to f?",
    ],
    practice: [
      {
        q: "f(x)=c on [0,5], 0 else. Find c and P(X≥3).",
        a: "∫₀⁵ c dx=5c=1 ⇒ c=1/5. P(X≥3)=2/5=0.4.",
      },
      {
        q: "Explain in one sentence why PDF height is not P(X=x).",
        a: "Probability of a single point is the integral over a zero-width set, hence 0; f(x) is probability per unit length near x, so only f(x)Δx approximates a small-interval probability.",
      },
    ],
    formal: "If F is absolutely continuous, then \(F(x)=\\int_{-\\infty}^x f\) and \(f=F'\) almost everywhere. Not every continuous CDF has a PDF in the elementary sense (singular distributions exist), but MATH 270 focuses on the absolutely continuous case.",
    formulas: "- \(\\int_{-\\infty}^{\\infty} f(x)\\,dx=1\)\n- \(P(a<X<b)=\\int_a^b f(x)\\,dx\)\n- \(P(X=x)=0\)\n- \(F(x)=\\int_{-\\infty}^x f\)",
    derivation: "Take a histogram density estimator with bin width h and let h→0 while n→∞ under smooth assumptions — bar heights approach f(x), and bar areas approach probabilities. The integral formula is the continuum limit of summing relative frequencies in fine bins.",
    pitfalls: [
      "Reading f(x) as a probability",
      "Forgetting units of density (1/unit of x)",
      "Leaving a kernel unnormalized and treating areas as probabilities",
    ],
    interview: "Say: 'Density is not probability; probability is area under the density.' Then compute a quick Uniform(0,1) interval to show you mean it.",
    bridge: "Both PMFs and PDFs are packaged by one function — the CDF — which works for discrete and continuous alike.",
  }),

  buildLesson({
    title: "Cumulative Distribution Functions",
    partLabel: PART,
    principles: [
      "The CDF F(x)=P(X≤x) works for discrete and continuous",
      "F is nondecreasing, right-continuous, with limits 0 and 1",
      "PDF is the derivative of CDF; PMF is the jump sizes of CDF",
      "Interval probabilities use F(b)−F(a) (with care at atoms)",
      "Tail probabilities use 1−F(x)=P(X>x)",
    ],
    objectives: [
      "Define and sketch a CDF from a PMF or PDF",
      "Recover PMF jumps or PDF slopes from F",
      "Compute interval probabilities via F",
      "Use complements for upper-tail events",
      "Explain right-continuity in plain language",
    ],
    why: "One object — the CDF — unifies discrete spikes and continuous curves. Software quantile functions, survival curves (1−F), and many proofs speak CDF first. If you can move fluently between F, p, and f, distribution problems stop feeling like three different subjects.",
    story: "You instrument job runtimes and want P(T≤2 s) for an SLA. Whether you modeled T as discrete tenths of a second or as a continuous exponential, the question is always F(2). Your dashboard's \"CDF plot\" rises from 0 to 1; reading its height at 2 seconds answers the SLA directly. When someone asks p95, they want the smallest x with F(x)≥0.95 — the inverse CDF idea.",
    idea: "The **cumulative distribution function** is \(F(x)=P(X\\le x)\). It always exists for any real-valued RV. Properties: starts near 0 as \(x\\to-\\infty\), ends near 1 as \(x\\to\\infty\), never decreases, and is right-continuous. For discrete X, F is a staircase with jump \(p(x)\) at each atom. For continuous X with PDF f, F is smooth (absolutely continuous) and \(F'(x)=f(x)\). Intervals: roughly \(P(a<X\\le b)=F(b)-F(a)\).",
    steps: [
      {
        title: "Write F(x)=P(X≤x) from the model you have",
        body: "Discrete: sum all p(t) for t≤x. Continuous: integrate f from −∞ to x. Both answers are the CDF.",
      },
      {
        title: "Sketch using the known shape cues",
        body: "Steps for discrete; smooth S-curves or ramps for continuous. Mark the support where F actually rises.",
      },
      {
        title: "Recover p or f from F",
        body: "Jump size at x equals P(X=x). Where F is differentiable, f=F′. If you only have a plotted F, read rises and slopes carefully.",
      },
      {
        title: "Compute intervals and tails",
        body: "P(X≤b)=F(b). P(X>b)=1−F(b). P(a<X≤b)=F(b)−F(a). For continuous laws, < vs ≤ rarely matters; for discrete, endpoint inclusion matters.",
      },
      {
        title: "Connect to quantiles",
        body: "A p-quantile is essentially an x with F(x)≈p. That links back to percentiles from Part 1 — now defined for theoretical distributions, not only samples.",
      },
    ],
    mathSimple: "- \(F(x)=P(X\\le x)\).\n- Limits: \(\\lim_{x\\to-\\infty}F(x)=0\\), \(\\lim_{x\\to\\infty}F(x)=1\).\n- Discrete: \(F(x)=\\sum_{t\\le x} p(t)\\); jump at x is \(p(x)\).\n- Continuous: \(F(x)=\\int_{-\\infty}^x f\\); \(f(x)=F'(x)\\).\n- \(P(a<X\\le b)=F(b)-F(a)\\).\n\nIn words: F(x) is \"how much probability has accumulated by the time we reach x on the number line.\"",
    walkthrough: "Discrete Y with p(0)=0.25, p(1)=0.50, p(2)=0.25.\n\nF(x)=0 for x<0.\nF(x)=0.25 for 0≤x<1.\nF(x)=0.75 for 1≤x<2.\nF(x)=1 for x≥2.\n\nJumps: 0.25 at 0, 0.50 at 1, 0.25 at 2 — recovers the PMF.\nP(Y≤1)=F(1)=0.75. P(Y>1)=1−0.75=0.25.\n\nContinuous Uniform(0,1): F(x)=0 for x<0, F(x)=x for 0≤x≤1, F(x)=1 for x>1. Derivative on (0,1) is f=1.",
    example: "From the two-coin heads count Y above, F jumps at 0,1,2. Reading F(1)=0.75 means P(Y≤1)=0.75 — at most one head.",
    example2: "Exponential-style CDF F(x)=1−e^{−λx} for x≥0 (preview). Then P(X>x)=e^{−λx}. SLA question P(X≤2)=1−e^{−2λ}. The survival function 1−F is often easier for \"longer than\" questions.",
    labCue: "In PMF/PDF labs, toggle a CDF overlay. Watch steps match stems, and watch the continuous CDF's slope match the density height.",
    check: [
      "What does a jump in F tell you?",
      "How do you get an upper-tail probability from F?",
      "Why is F nondecreasing?",
    ],
    practice: [
      {
        q: "F(2)=0.8 and F(5)=0.9 for a continuous RV. Find P(2<X≤5) and P(X>5).",
        a: "P(2<X≤5)=0.9−0.8=0.1. P(X>5)=1−0.9=0.1.",
      },
      {
        q: "A CDF is flat on (3,7) then jumps at 7. What does the flat region say about P(3<X<7)?",
        a: "No probability mass in (3,7); P(3<X<7)=0. There is an atom at 7 equal to the jump size.",
      },
    ],
    formal: "Any CDF is nondecreasing and right-continuous with the standard limits at ±∞. Conversely, any such function is the CDF of some real random variable. Discrete laws correspond to pure jump CDFs; absolutely continuous laws to integrals of PDFs; mixtures exist.",
    formulas: "- \(F(x)=P(X\\le x)\)\n- \(P(a<X\\le b)=F(b)-F(a)\)\n- \(P(X>x)=1-F(x)\)\n- Discrete: jumps = PMF; continuous: \(f=F'\)",
    derivation: "Monotonicity: if x<y then {X≤x}⊆{X≤y}, so F(x)≤F(y) by axioms. Interval identity follows from writing {a<X≤b}={X≤b}\\{X≤a} and using complements inside {X≤b}. Differentiating under continuity assumptions recovers f.",
    pitfalls: [
      "Using F(b)−F(a) with wrong endpoint care on discrete supports",
      "Assuming every continuous-looking F has a simple elementary PDF",
      "Reading F(x) as P(X=x)",
    ],
    interview: "Explain one bridge sentence: 'CDF accumulates probability from the left; PMF/PDF describe how that accumulation rises — by jumps or by slope.'",
    bridge: "With a distribution in hand, the two headline summaries are expected value and variance — the probabilistic twins of mean and SD.",
  }),

  buildLesson({
    title: "Expected Value and Variance",
    partLabel: PART,
    principles: [
      "E[X] is the probability-weighted average of values",
      "Var(X)=E[(X−μ)²] measures squared spread about the mean",
      "Discrete: sums; continuous: integrals",
      "SD = √Var restores original units",
      "Expectation exists only when the defining sum/integral converges absolutely",
    ],
    objectives: [
      "Compute E[X] from a PMF or PDF",
      "Compute Var(X) via E[X²]−(E[X])²",
      "Interpret mean and variance in context with units",
      "Relate sample mean/variance to E/Var as twins",
      "Avoid treating E[X] as 'the value X will take'",
    ],
    why: "Once X is numeric, people ask for a typical size and a typical spread. Expectation and variance answer with the distribution's own weights — not a single sample. They are the theoretical partners of \(\\bar{x}\) and \(s^2\), and they unlock pricing risk, load averages, and the statements of limit theorems later.",
    story: "A game API awards coins: 0 with probability 0.5, 10 with probability 0.4, 100 with probability 0.1. Players complain the \"average reward is 10\" because that is a common outcome — but E[X]=0·0.5+10·0.4+100·0.1=14. The mean is a long-run average per play, not the mode. Variance is huge because of the rare 100. Balancing the economy requires both numbers, not just the modal prize.",
    idea: "**Expected value** \(\\mathbb{E}[X]\) is the center of mass of the distribution: discrete \(\\sum x\\,p(x)\\), continuous \(\\int x f(x)\\,dx\). **Variance** \(\\mathrm{Var}(X)=\\mathbb{E}[(X-\\mu)^2]\) with \(\\mu=\\mathbb{E}[X]\) — average squared deviation from that center. Computationally, \(\\mathrm{Var}(X)=\\mathbb{E}[X^2]-(\\mathbb{E}[X])^2\) often saves work. **Standard deviation** \(\\sigma=\\sqrt{\\mathrm{Var}(X)}\) returns to X's units.",
    steps: [
      {
        title: "Compute μ = E[X]",
        body: "Weight each value (or integrate x f(x)). This is not \"the value that must occur\"; it may even be impossible (E[die]=3.5). It is the balance point of the distribution.",
      },
      {
        title: "Compute E[X²] (or integrate x² f(x))",
        body: "Square each support point, weight by p(x), sum. For continuous, integrate x² f. This intermediate is the engine of the variance shortcut.",
      },
      {
        title: "Form Var(X)=E[X²]−μ²",
        body: "Subtract the square of the mean. Check that the result is ≥0 (up to rounding). If negative, an arithmetic error occurred.",
      },
      {
        title: "Take SD if you need interpretable units",
        body: "σ=√Var. Speak in the units of X: \"about σ away from μ is a typical deviation scale,\" with the usual caveats when skew is strong.",
      },
      {
        title: "Interpret beside the shape",
        body: "High variance with a rare jackpot differs from high variance with a wide symmetric mound. Quote μ and σ with a one-line shape comment when stakes are real.",
      },
    ],
    mathSimple: "- Discrete: \(\\mathbb{E}[X]=\\sum_x x\\,p(x)\\), \(\\mathbb{E}[g(X)]=\\sum_x g(x)p(x)\\).\n- Continuous: \(\\mathbb{E}[X]=\\int x f(x)\\,dx\\), \(\\mathbb{E}[g(X)]=\\int g(x)f(x)\\,dx\\).\n- \(\\mathrm{Var}(X)=\\mathbb{E}[(X-\\mu)^2]=\\mathbb{E}[X^2]-\\mu^2\\).\n- \(\\sigma=\\sqrt{\\mathrm{Var}(X)}\\).\n\nIn words: expectation replaces \"sum of data / n\" with \"sum of value × probability.\" Variance is the distribution's own squared-spread measure.",
    walkthrough: "X ∈ {0,10,100} with p=0.5, 0.4, 0.1.\n\nE[X]=0(0.5)+10(0.4)+100(0.1)=14.\nE[X²]=0+100(0.4)+10000(0.1)=40+1000=1040.\nVar(X)=1040−14²=1040−196=844.\nSD=√844≈29.1.\n\nInterpretation: mean reward 14, but swings are large — a single 100 pulls hard. Mode is 0; do not confuse mode with expectation.",
    example: "Fair die: E[X]=(1+2+3+4+5+6)/6=3.5. E[X²]=(1+4+9+16+25+36)/6=91/6. Var=91/6−(3.5)²≈2.92, SD≈1.71. Classic numeric anchors.",
    example2: "Continuous Uniform(0,1): E[X]=∫₀¹ x dx=1/2. E[X²]=∫₀¹ x² dx=1/3. Var=1/3−1/4=1/12, SD=1/√12=1/(2√3). Matches the earlier descriptive formula for U(a,b) with a=0,b=1.",
    labCue: "In the PMF/PDF labs, display running E[X] and Var as you reshape the distribution. Predict whether spreading mass to the tails raises variance before you move controls.",
    check: [
      "Can E[X] be a value X never takes?",
      "Why is Var(X)≥0 always (when it exists)?",
      "State the computational formula for variance.",
    ],
    practice: [
      {
        q: "X takes −1 and +1 each with probability 1/2. Find E[X] and Var(X).",
        a: "E[X]=0. E[X²]=1. Var=1−0=1. SD=1.",
      },
      {
        q: "If every probability sits at a single point c, what are E[X] and Var(X)?",
        a: "E[X]=c, Var(X)=0 — no spread.",
      },
    ],
    formal: "For nonnegative X, \(\\mathbb{E}[X]\) may be defined via tail integrals even when densities are awkward. In general one requires \(\\mathbb{E}[|X|]<\\infty\) for a finite mean, and \(\\mathbb{E}[X^2]<\\infty\) for finite variance. \(\\mathrm{Var}(X)=\\mathbb{E}[X^2]-(\\mathbb{E}[X])^2\) follows by expanding \(\\mathbb{E}[(X-\\mu)^2]\).",
    formulas: "- \(\\mathbb{E}[X]=\\sum x p(x)\) or \(\\int x f(x)\\,dx\)\n- \(\\mathrm{Var}(X)=\\mathbb{E}[X^2]-(\\mathbb{E}[X])^2\)\n- \(\\sigma=\\sqrt{\\mathrm{Var}(X)}\)\n- \(\\mathbb{E}[c]=c\\), \(\\mathrm{Var}(c)=0\)",
    derivation: "Expand \(\\mathbb{E}[(X-\\mu)^2]=\\mathbb{E}[X^2-2\\mu X+\\mu^2]=\\mathbb{E}[X^2]-2\\mu\\mathbb{E}[X]+\\mu^2=\\mathbb{E}[X^2]-2\\mu^2+\\mu^2=\\mathbb{E}[X^2]-\\mu^2\). The shortcut is pure algebra once linearity of expectation (next lesson) is granted for these combinations.",
    pitfalls: [
      "Calling E[X] the 'most likely value' (that is the mode)",
      "Forgetting to subtract μ² in the computational variance formula",
      "Applying discrete sum formulas to continuous densities without integrating",
    ],
    interview: "Give the coin-reward example: mean ≠ mode, variance captures jackpot risk. Then write Var=E[X²]−μ² from memory.",
    bridge: "Next we collect algebraic properties — linearity, shifts, and scaling — that make expectation and variance tools rather than one-off computations.",
  }),

  buildLesson({
    title: "Properties of Expectation and Variance",
    partLabel: PART,
    principles: [
      "Linearity: E[aX+b]=aE[X]+b always (no independence needed)",
      "Var(aX+b)=a²Var(X); shifts do not change variance",
      "For independent X,Y: E[XY]=E[X]E[Y] and Var(X+Y)=Var(X)+Var(Y)",
      "Without independence, covariance appears in Var(X+Y)",
      "Linearity holds even when variables are dependent",
    ],
    objectives: [
      "Apply linearity of expectation on sums and affine transforms",
      "Scale and shift variances correctly",
      "Add variances under independence",
      "Explain why linearity does not need independence",
      "Use indicator variables for counting expectations (preview skill)",
    ],
    why: "Computing E[X+Y] from the joint PMF every time is painful. Linearity gives E[X+Y]=E[X]+E[Y] even when X and Y are entangled. Scaling laws explain what happens to risk when you multiply a position by 10. These properties are the daily algebra of probability — more useful than memorizing dozens of named distributions' means one by one.",
    story: "You estimate expected number of failing tests in a suite of 20 by defining indicators I_j=1 if test j fails. The I_j are dependent (shared flaky infra), so you cannot multiply probabilities carelessly — but E[∑ I_j]=∑ E[I_j]=∑ P(test j fails) still holds. Linearity quietly saves the design review. Variance of the total, however, needs covariances or an independence assumption you may not have.",
    idea: "**Linearity of expectation**: \(\\mathbb{E}[aX+bY]=a\\mathbb{E}[X]+b\\mathbb{E}[Y]\) with no independence required. **Affine variance rule**: \(\\mathrm{Var}(aX+b)=a^2\\mathrm{Var}(X)\) — adding b shifts location only; multiplying by a scales spread by |a| (variance by a²). For **independent** summands, variances add: \(\\mathrm{Var}(X+Y)=\\mathrm{Var}(X)+\\mathrm{Var}(Y)\). If dependence exists, \(\\mathrm{Var}(X+Y)=\\mathrm{Var}(X)+\\mathrm{Var}(Y)+2\\mathrm{Cov}(X,Y)\).",
    steps: [
      {
        title: "Push constants and coefficients through E[·]",
        body: "E[aX+b]=aE[X]+b. Pulling constants out is always legal for expectation (when expectations exist). This is the most used property in the course.",
      },
      {
        title: "Add expectations term by term",
        body: "E[X+Y]=E[X]+E[Y] even if X and Y are dependent. For a sum of many pieces, E[∑X_i]=∑E[X_i]. Indicator tricks rely on this.",
      },
      {
        title: "Scale variances with a²; ignore additive shifts",
        body: "Var(aX+b)=a²Var(X). Units check: if a converts meters to centimeters (×100), variance scales by 100². The +b disappears — spread does not care where zero is.",
      },
      {
        title: "Add variances only when independence (or zero covariance) holds",
        body: "Independent ⇒ Cov=0 ⇒ Var(X+Y)=Var(X)+Var(Y). If unsure about dependence, do not silently add variances; say what assumption you need.",
      },
      {
        title: "Use properties to avoid expanding full distributions",
        body: "Often you can find E and Var of a transformed RV without rebuilding its PMF/PDF from scratch — apply the algebra first, invent the whole law only if required.",
      },
    ],
    mathSimple: "- \(\\mathbb{E}[aX+b]=a\\mathbb{E}[X]+b\\).\n- \(\\mathbb{E}[X+Y]=\\mathbb{E}[X]+\\mathbb{E}[Y]\\) (always).\n- \(\\mathrm{Var}(aX+b)=a^2\\mathrm{Var}(X)\\).\n- Independent: \(\\mathbb{E}[XY]=\\mathbb{E}[X]\\mathbb{E}[Y]\\), \(\\mathrm{Var}(X+Y)=\\mathrm{Var}(X)+\\mathrm{Var}(Y)\\).\n- General: \(\\mathrm{Var}(X+Y)=\\mathrm{Var}(X)+\\mathrm{Var}(Y)+2\\mathrm{Cov}(X,Y)\\).\n\nIn words: expectation cooperates with addition unconditionally; variance needs an independence (or covariance) story before it adds cleanly.",
    walkthrough: "Let X be a die roll, E[X]=3.5, Var(X)≈2.9167.\n\nY=2X+1 (shift and scale). E[Y]=2·3.5+1=8. Var(Y)=4·Var(X)≈11.67.\n\nLet X1,X2 be independent die rolls. S=X1+X2. E[S]=7. Var(S)=Var(X1)+Var(X2)≈5.83 because of independence.\n\nIf instead X2=X1 always (perfect dependence), S=2X1, E[S]=7 still (linearity!), but Var(S)=4Var(X1)≈11.67 ≠ 5.83. Same means, different variance — dependence mattered for Var, not for E.",
    example: "Indicators: n users each click with probability p_i (possibly dependent). Expected click count = ∑ p_i regardless of dependence. That one-liner is why linearity is famous.",
    example2: "Temperatures in °C have variance 9. Convert to °F via F=1.8C+32. New variance = 1.8² × 9 = 29.16. The +32 does nothing to variance; the 1.8 scales SD by 1.8 and variance by 1.8².",
    labCue: "If the lab lets you transform a distribution by ax+b, predict the new mean and SD before revealing the stats panel. Check that a vertical shift leaves spread unchanged.",
    check: [
      "Does E[X+Y]=E[X]+E[Y] require independence?",
      "How does Var(cX) relate to Var(X)?",
      "Why can dependent indicators still give an easy expected count?",
    ],
    practice: [
      {
        q: "E[X]=2, Var(X)=3. Find E[5X−4] and Var(5X−4).",
        a: "E=10−4=6. Var=25·3=75.",
      },
      {
        q: "X,Y independent with Var 4 and 9. Find Var(X+Y) and Var(X−Y).",
        a: "Var(X+Y)=13. Var(X−Y)=Var(X)+Var(−Y)=4+9=13 (since (−1)²=1).",
      },
    ],
    formal: "Linearity follows from interchanging sums/integrals in the definitions of expectation (justified by absolute convergence). \(\\mathrm{Cov}(X,Y)=\\mathbb{E}[(X-\\mu_X)(Y-\\mu_Y)]=\\mathbb{E}[XY]-\\mu_X\\mu_Y\\). Independence implies \(\\mathbb{E}[XY]=\\mathbb{E}[X]\\mathbb{E}[Y]\\) hence zero covariance, but zero covariance is weaker than independence.",
    formulas: "- \(\\mathbb{E}[aX+bY]=a\\mathbb{E}[X]+b\\mathbb{E}[Y]\)\n- \(\\mathrm{Var}(aX+b)=a^2\\mathrm{Var}(X)\)\n- Independent: \(\\mathrm{Var}(X+Y)=\\mathrm{Var}(X)+\\mathrm{Var}(Y)\)\n- \(\\mathrm{Var}(X+Y)=\\mathrm{Var}(X)+\\mathrm{Var}(Y)+2\\mathrm{Cov}(X,Y)\)",
    derivation: "Var(aX+b)=E[(aX+b−aμ−b)²]=E[a²(X−μ)²]=a²Var(X). For Var(X+Y), expand E[((X−μx)+(Y−μy))²] to get the two variances plus 2E[(X−μx)(Y−μy)] — the covariance term. Independence kills that cross term.",
    pitfalls: [
      "Assuming Var(X+Y)=Var(X)+Var(Y) without independence / zero covariance",
      "Scaling variance by |a| instead of a²",
      "Thinking linearity of expectation requires independent variables",
    ],
    interview: "Boast-level one-liner: 'Linearity of expectation always holds; additivity of variance needs independence (or zero covariance).' Then mention indicators for counting.",
    bridge: "With expectation and variance algebra in hand, you are ready for named families — Bernoulli, Binomial, Normal, and friends — where these properties become instant formulas.",
  }),
];
