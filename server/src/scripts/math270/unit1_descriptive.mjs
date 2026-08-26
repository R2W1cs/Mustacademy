import { buildLesson } from "./helper.mjs";

const PART = "Part 1: Descriptive Statistics";

export const topics = [
  buildLesson({
    title: "Types of Data",
    partLabel: PART,
    principles: [
      "Data type decides which graphs and summaries are valid",
      "Qualitative labels names; quantitative measures amounts",
      "Discrete counts; continuous measures on a continuum",
      "Wrong type → wrong analysis (e.g. mean of zip codes)",
    ],
    objectives: [
      "Classify variables as qualitative vs quantitative",
      "Distinguish discrete vs continuous quantitative data",
      "Choose an appropriate display for each type",
      "Spot misuses (averaging categories, etc.)",
    ],
    why: "Before any formula, ask: *what kind of data is this?* That choice controls charts, summaries, and which probability models fit later.",
    idea: "**Qualitative (categorical)** answers 'which group?' — colors, majors, yes/no. **Quantitative** answers 'how much / how many?' — height, exam score, packet count. Within quantitative: **discrete** (countable jumps) vs **continuous** (any value in a range).",
    steps: [
      { title: "Name the variable", body: "Write one clear question the variable answers." },
      { title: "Ask: category or number?", body: "If the value is a label → qualitative. If arithmetic on values makes sense → quantitative." },
      { title: "If quantitative: discrete or continuous?", body: "Counts of students = discrete. Time in seconds = continuous (in practice)." },
      { title: "Pick a display", body: "Bar chart / pie for categories; histogram / box plot for numbers." },
    ],
    example: "Survey of 40 students: *major* (qualitative), *credits this term* (discrete quantitative), *height in cm* (continuous). Mean height is fine; 'mean major' is nonsense.",
    labCue: "Use the **dataTypes** lab: classify each card. Wrong classifications flash red — keep going until the set is clean.",
    check: [
      "Can you explain why GPA is quantitative but 'letter grade A/B/C' is often treated as ordinal qualitative?",
      "Is 'number of emails today' discrete or continuous?",
    ],
    formal: "A **variable** maps each observational unit to a value in a sample space of categories or numbers. Scales of measurement: nominal, ordinal, interval, ratio — ordinal still forbids naive means.",
    formulas: "- Nominal: equality only\n- Ordinal: order, not equal gaps\n- Interval/ratio: differences (ratio has true zero)",
    pitfalls: [
      "Treating ID numbers or zip codes as continuous quantities",
      "Computing a mean of Likert labels without justifying equal spacing",
      "Calling continuous data 'discrete' just because it was rounded",
    ],
    interview: "Say: 'I'd treat this as categorical and use proportions / chi-square, not a t-test on coded numbers — unless we justify an interval scale.'",
  }),

  buildLesson({
    title: "Frequency Distributions and Histograms",
    partLabel: PART,
    principles: [
      "A frequency table compresses raw lists into counts",
      "Histograms show shape: center, spread, skew, gaps",
      "Bin width changes the story — too few hides detail, too many is noise",
      "Relative frequency ≈ empirical probability later",
    ],
    objectives: [
      "Build a frequency and relative-frequency table",
      "Draw and interpret a histogram",
      "Explain how bin width affects appearance",
      "Read modality (uni/bi) and skew from a plot",
    ],
    why: "Raw lists hide patterns. Frequency tables and histograms are the first picture of a dataset — and the bridge to probability density later.",
    idea: "Group values into **bins**, count how many fall in each bin (**frequency**). Divide by n for **relative frequency**. A **histogram** draws bars whose areas (or heights, if equal width) show those counts.",
    steps: [
      { title: "Sort or scan the data", body: "Find min and max." },
      { title: "Choose bins", body: "Equal-width intervals covering the range." },
      { title: "Tally frequencies", body: "Count observations per bin." },
      { title: "Plot", body: "Bars touch (continuous grouping). Label axes." },
      { title: "Interpret", body: "Center? Spread? Skew? Outliers? Modes?" },
    ],
    example: "Exam scores 55–98, bins of width 10: [50,60), … Count students in each. If the tallest bar is 70–80 and the right tail is long, scores are left-peaked with a high-score tail (right skew).",
    labCue: "Open the **histogram** lab: drag the bin-width slider and watch shape change. Same data, different story.",
    check: [
      "What happens if every observation is in its own bin?",
      "Why do histogram bars usually touch, unlike bar charts?",
    ],
    formal: "For equal-width bins of width h, density height = frequency/(n·h) makes total area 1 — the empirical density estimate.",
    formulas: "- Relative frequency of bin i: f_i / n\n- Density height: f_i / (n h)",
    pitfalls: [
      "Unequal bin widths with height = count (area, not height, should encode frequency)",
      "Cherry-picking bin edges to force a desired shape",
    ],
  }),

  buildLesson({
    title: "Measures of Central Tendency",
    partLabel: PART,
    principles: [
      "Mean balances the data; median resists outliers; mode is most common",
      "Skewed data: median often tells a fairer 'typical' story",
      "Always report center with context (units, sample size)",
      "One number never replaces a plot",
    ],
    objectives: [
      "Compute mean, median, and mode",
      "Choose an appropriate center for skewed vs symmetric data",
      "Explain effect of outliers on the mean",
      "Connect center to later expectation E[X]",
    ],
    why: "People ask 'what's typical?' Mean, median, and mode answer that differently — picking the wrong one misleads (salary debates, load averages, exam curves).",
    idea: "**Mean** = arithmetic average. **Median** = middle value when sorted. **Mode** = most frequent value (or tallest bin). Symmetric unimodal ≈ all three agree; right skew often mean > median.",
    steps: [
      { title: "Mean", body: "Sum all values, divide by n." },
      { title: "Median", body: "Sort; pick middle (or average of two middles if n even)." },
      { title: "Mode", body: "Find the most common value (may be multimodal)." },
      { title: "Compare", body: "If mean ≫ median, suspect right skew or high outliers." },
    ],
    example: "Incomes: 30k, 32k, 35k, 40k, 200k. Mean ≈ 67.4k (pulled up); median = 35k (typical worker). Use median for 'typical income.'",
    labCue: "In the **centralTendency** lab, drag points on the number line. Watch mean chase outliers while median stays calmer.",
    check: [
      "When is the mode more useful than the mean?",
      "What does mean = median suggest about shape?",
    ],
    formal: "Sample mean x̄ = (1/n) Σ x_i. Population mean μ = (1/N) Σ X_i. Median m satisfies P(X ≤ m) ≥ 1/2 and P(X ≥ m) ≥ 1/2 for continuous distributions.",
    formulas: "- x̄ = (Σ x_i)/n\n- Median: middle order statistic\n- Mode: argmax of frequency or density",
    pitfalls: [
      "Reporting mean without noting skew or outliers",
      "Averaging rates incorrectly (use harmonic/weighted means when needed)",
    ],
  }),

  buildLesson({
    title: "Measures of Dispersion",
    partLabel: PART,
    principles: [
      "Center without spread is incomplete",
      "Variance averages squared deviations; SD is in original units",
      "Range is simple but fragile to outliers",
      "Later: Var(X) is the probabilistic twin of sample variance",
    ],
    objectives: [
      "Compute range, variance, and standard deviation",
      "Interpret SD in the units of the data",
      "Contrast sample vs population variance formulas",
      "Relate spread to reliability of the mean",
    ],
    why: "Two classes can share the same mean exam score — one tight, one chaotic. Dispersion measures how much values disagree.",
    idea: "**Range** = max − min. **Variance** ≈ average of squared distances from the mean. **Standard deviation (SD)** = √variance — same units as the data, easier to interpret.",
    steps: [
      { title: "Find the mean", body: "Needed as the reference point." },
      { title: "Deviations", body: "Compute x_i − mean for each point." },
      { title: "Square & average", body: "Square deviations; divide by n (population) or n−1 (sample)." },
      { title: "SD", body: "Take square root." },
    ],
    example: "Scores 70, 72, 74 vs 40, 70, 100. Same mean 72; second set has much larger SD. 'Average 72' hides very different risk.",
    labCue: "Use the **dispersion** lab: stretch points away from the mean and watch σ grow; the deviation bars make the definition visible.",
    check: [
      "Why divide by n−1 for sample variance?",
      "Can variance be negative?",
    ],
    formal: "Population: σ² = (1/N) Σ (x_i − μ)². Sample: s² = (1/(n−1)) Σ (x_i − x̄)² (unbiased for σ² under i.i.d. normality assumptions / Bessel's correction).",
    formulas: "- Range = max − min\n- s² = Σ(x_i − x̄)² / (n−1)\n- s = √s²",
    pitfalls: [
      "Comparing SDs across differently scaled variables without standardization",
      "Forgetting units (variance is squared units)",
    ],
  }),

  buildLesson({
    title: "Percentiles Quartiles and Box Plots",
    partLabel: PART,
    principles: [
      "Percentiles locate relative standing",
      "Quartiles split data into fourths; IQR measures middle spread",
      "Box plots summarize five numbers at a glance",
      "Great for comparing groups side by side",
    ],
    objectives: [
      "Find quartiles and the IQR",
      "Build a five-number summary",
      "Read and sketch a box plot",
      "Flag outliers via the 1.5×IQR rule",
    ],
    why: "Medians and quartiles describe skewed data better than mean±SD alone. Box plots compare sections, versions, or A/B groups fast.",
    idea: "**p-th percentile**: value below which p% of data fall. **Q1, Q2 (median), Q3** are 25th, 50th, 75th. **IQR = Q3 − Q1**. **Box plot**: whiskers + box from Q1 to Q3 with median line.",
    steps: [
      { title: "Sort the data", body: "Order statistics first." },
      { title: "Median & quartiles", body: "Split lower/upper halves carefully (convention matters)." },
      { title: "IQR & fences", body: "Lower fence Q1 − 1.5·IQR; upper Q3 + 1.5·IQR." },
      { title: "Draw", body: "Box, median, whiskers to last non-outlier, plot outliers as dots." },
    ],
    example: "Sorted homework times (min): 20, 25, 30, 35, 40, 45, 90. Median 35; Q1≈25; Q3≈45; IQR≈20; 90 is beyond Q3+1.5·IQR → outlier on the box plot.",
    labCue: "The **histogram** lab can overlay a box summary — link bin shape to the five-number story.",
    check: [
      "What does a long upper whisker suggest?",
      "Is the mean always inside the box?",
    ],
    formal: "Empirical quantile functions vary by software (inclusive/exclusive median methods). State the rule you use on exams.",
    formulas: "- IQR = Q3 − Q1\n- Outlier fences: Q1 − 1.5·IQR, Q3 + 1.5·IQR\n- Five-number: min, Q1, median, Q3, max (or whisker ends)",
    pitfalls: [
      "Mixing percentile definitions across tools",
      "Calling every point outside whiskers 'error' without domain check",
    ],
  }),

  buildLesson({
    title: "Skewness and Kurtosis",
    partLabel: PART,
    principles: [
      "Skewness describes asymmetry of the tail",
      "Kurtosis describes tail weight / peakedness relative to normal",
      "Visual checks beat blind trust in a single coefficient",
      "Skew guides whether mean or median is more honest",
    ],
    objectives: [
      "Identify left vs right skew from plots",
      "Relate skew to mean–median ordering",
      "Interpret high kurtosis as heavier tails",
      "Know limits of sample skew/kurtosis in small n",
    ],
    why: "Many real datasets are not bell-shaped. Skew and kurtosis warn you before you slap on a normal model or a mean±2σ rule.",
    idea: "**Right skew**: long right tail; mean pulled right of median. **Left skew**: opposite. **Kurtosis**: heavier tails / sharper peak than normal (excess kurtosis > 0) means more extreme outliers than a Gaussian expects.",
    steps: [
      { title: "Plot first", body: "Histogram or density — eyes before coefficients." },
      { title: "Compare mean & median", body: "Mean > median often right skew." },
      { title: "Check tails", body: "Are extremes rarer or more common than a normal would allow?" },
      { title: "Decide modeling", body: "Transform, robust stats, or heavy-tailed model." },
    ],
    example: "City wealth: many moderate incomes, few ultra-rich → right skew, high upper outliers. Mean wealth overstates the typical resident.",
    labCue: "Skew the histogram lab's data and watch the mean–median gap open.",
    check: [
      "If mean < median, which skew direction is likely?",
      "Does high kurtosis always mean a taller center?",
    ],
    formal: "Sample skewness g1 involves third central moment; excess kurtosis uses fourth moment minus 3 (normal baseline).",
    formulas: "- Third central moment μ₃ = E[(X−μ)³]\n- Skewness γ₁ = μ₃ / σ³\n- Excess kurtosis γ₂ = μ₄/σ⁴ − 3",
    pitfalls: [
      "Computing skew on n < 30 and over-interpreting",
      "Assuming zero skew implies normality (it doesn't)",
    ],
  }),
];
