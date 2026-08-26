import { buildLesson } from "./helper.mjs";

const PART = "Part 1: Descriptive Statistics";

export const topics = [
  buildLesson({
    title: "Types of Data",
    partLabel: PART,
    principles: [
      "Data type decides which graphs and summaries are valid",
      "Qualitative labels names; quantitative measures amounts",
      "Discrete counts jump; continuous measures live on a continuum",
      "Wrong type → wrong analysis (e.g. mean of zip codes)",
      "Ordinal categories have order but not equal spacing",
    ],
    objectives: [
      "Classify variables as qualitative vs quantitative",
      "Distinguish discrete vs continuous quantitative data",
      "Choose an appropriate display for each type",
      "Spot misuses (averaging categories, treating IDs as numbers)",
      "Explain nominal vs ordinal vs interval/ratio scales in plain words",
    ],
    why: "Before any formula, ask: what kind of data is this? That single choice controls which charts make sense, which summaries are honest, and which probability models you will be allowed to use later. Many analysis disasters start with treating labels as if they were measurements. Getting the type right is the cheapest mistake to prevent.",
    story: "You are building a dashboard for your CS club's project submissions. You log each repo's language (Python, Java, C++), the number of commits this week, the author's year (Freshman…Senior), and the build time in seconds. A teammate averages the language codes after mapping Python=1, Java=2, C++=3 and reports a \"mean language\" of 1.7. That number feels scientific — and it is meaningless. Language is a label, commits are counts, year has order but unequal meaning, and build time is a continuous measurement. Until you sort those types, every chart and every average is on shaky ground.",
    idea: "**Qualitative (categorical)** answers \"which group?\" — colors, majors, pass/fail. **Quantitative** answers \"how much / how many?\" — height, exam score, packet count. Within quantitative: **discrete** values jump in countable steps (0, 1, 2, … commits), while **continuous** values can (in theory) sit anywhere in an interval (build time 12.37 s). A further refinement is **scale**: nominal (names only), ordinal (ordered labels), interval/ratio (true numeric arithmetic). If adding or averaging the values does not have a clear meaning, you are usually looking at a category — not a measurement.",
    steps: [
      {
        title: "Name the observational unit and the variable",
        body: "Write one clear sentence: \"For each ___, we record ___.\" The blank after \"each\" is the unit (student, commit, request). The second blank is the variable. If you cannot finish that sentence, you are not ready to classify anything yet.",
      },
      {
        title: "Ask: category or number?",
        body: "If the recorded value is a label or name — even if it looks like a digit string — treat it as qualitative. Zip codes, student IDs, and HTTP status groups are classic traps. If arithmetic on the values answers a real question (\"what is typical?\", \"how much larger?\"), you are in quantitative territory.",
      },
      {
        title: "If quantitative: discrete or continuous?",
        body: "Ask whether the value comes from counting or from measuring on a continuum. Number of failed tests is discrete. Latency in milliseconds is continuous, even if your logger rounds to integers. Rounding does not turn a continuous process into a discrete one conceptually — it only coarsens the recorded values.",
      },
      {
        title: "Check for order without equal gaps",
        body: "Letter grades A > B > C have order, but the \"distance\" A-to-B is not guaranteed equal to B-to-C. Those are ordinal categories. You may report medians or modes carefully; a naive mean of A=4, B=3, C=2 assumes equal spacing you may not believe.",
      },
      {
        title: "Pick a display and a summary that match the type",
        body: "Categories → bar chart or pie (with care), counts/proportions, mode. Discrete or continuous numbers → histogram, box plot, mean/median/SD as appropriate. If your planned summary would still make sense after shuffling category labels randomly, you probably chose the wrong summary.",
      },
    ],
    mathSimple: "Think in words first, then attach symbols.\n\n- A **variable** \(X\) assigns a value to each observational unit.\n- If \(X\) takes values in a set of labels \(\\{c_1,c_2,\\ldots\\}\), it is **categorical**.\n- If \(X\) takes numeric values and sums/averages are meaningful, it is **quantitative**.\n- **Discrete**: support is countable, e.g. \(X \\in \\{0,1,2,\\ldots\\}\).\n- **Continuous**: support is an interval, e.g. \(X \\in [0,\\infty)\).\n\nLater we will write probabilities like \(P(X=k)\) for discrete counts and areas under curves for continuous measurements. The type of \(X\) decides which of those languages you are allowed to speak.",
    walkthrough: "Classify four fields from a web-app log with 200 requests:\n\n1. `status_code` values like 200, 404, 500 — digits, but they are **labels** for response classes. Qualitative (often treated as nominal, or ordinal if you group success vs client-error vs server-error).\n2. `bytes_sent` = 0, 512, 1048576, … — amounts of data. Quantitative; practically continuous (or discrete at the byte level, but analyzed as continuous).\n3. `retry_count` = 0, 1, 2, 3 — clear **discrete** quantitative counts.\n4. `region` = \"us-east\", \"eu-west\" — qualitative nominal.\n\nValid moves: proportion of 5xx errors; mean and SD of `bytes_sent`; histogram of `retry_count`. Invalid move: mean of status codes = (200+404+500)/3.",
    example: "Survey of 40 CS students:\n\n- *major* (CS, Math, Other) → qualitative nominal → bar chart of counts.\n- *credits this term* (12, 15, 18, …) → discrete quantitative → histogram or stem plot.\n- *height in cm* → continuous quantitative → histogram / box plot; mean height is fine.\n- *favorite editor ranked 1st/2nd/3rd* → ordinal qualitative → medians of ranks only with care; do not invent a \"mean editor.\"\n\nMean height is meaningful. \"Mean major\" after coding CS=1, Math=2 is not.",
    example2: "A/B test log for a new onboarding screen:\n\n- `variant` ∈ {A, B} → categorical.\n- `completed_signup` ∈ {0, 1} → binary categorical (or Bernoulli later), summarized with a **proportion**, not a poetic \"average personality.\"\n- `time_to_complete_seconds` → continuous quantitative.\n- `num_help_clicks` → discrete quantitative.\n\nYou may compare the proportion who completed signup between A and B. You may compare mean time-to-complete. You should not average `variant` codes.",
    labCue: "Use the **dataTypes** lab: classify each card as qualitative/quantitative and discrete/continuous. Wrong classifications flash red — keep going until the set is clean and you can defend each choice in one sentence.",
    check: [
      "Why is GPA quantitative while letter grade A/B/C is often treated as ordinal qualitative?",
      "Is 'number of emails today' discrete or continuous? Why?",
      "Why is averaging zip codes a misuse even though zip codes look numeric?",
    ],
    practice: [
      {
        q: "A dataset has columns: browser (Chrome/Firefox/Safari), tabs_open (integer), and session_length_ms. Classify each and name one valid summary for each.",
        a: "browser → qualitative nominal → mode or proportions. tabs_open → discrete quantitative → mean/median or histogram. session_length_ms → continuous quantitative → mean/median, SD, histogram/box plot.",
      },
      {
        q: "Someone encodes Likert answers Strongly Disagree…Strongly Agree as 1–5 and reports a mean of 3.8. What assumption are they making, and what safer summary exists?",
        a: "They assume equal spacing between adjacent labels (interval scale). Safer: report the median, the full response distribution, or percentages in each category — unless you explicitly justify the equal-spacing assumption.",
      },
    ],
    formal: "A **variable** maps each observational unit to a value in a sample space of categories or numbers. Classical scales of measurement: **nominal** (equality only), **ordinal** (order, not equal gaps), **interval** (differences meaningful), **ratio** (true zero, ratios meaningful). Ordinal data still forbids naive means unless equal spacing is justified. Discrete quantitative variables have countable support; continuous ones are modeled on intervals of \(\\mathbb{R}\).",
    formulas: "- Nominal: compare with \(=\), summarize with counts / proportions / mode\n- Ordinal: order \(<\\), use ranks, medians, percentile-style summaries with care\n- Interval/ratio: differences (and for ratio, products/quotients) are meaningful\n- Discrete support example: \(X \\in \\{0,1,2,\\ldots\\}\)\n- Continuous support example: \(X \\in [0,\\infty)\)",
    derivation: "Classification is not a theorem — it is a modeling contract. We derive later formulas (means, variances, PMFs, PDFs) under the assumption that the recorded symbols behave like the scale we claimed. If the contract is wrong (IDs treated as magnitudes), every derived number inherits the lie. So \"type\" is the first axiom of an honest analysis.",
    pitfalls: [
      "Treating ID numbers, zip codes, or enum integers as continuous quantities",
      "Computing a mean of Likert labels without justifying equal spacing",
      "Calling continuous data 'discrete' just because the logger rounded to integers",
      "Using a pie chart for dozens of unordered categories (unreadable)",
    ],
    interview: "Say: 'I'd treat this as categorical and use proportions or a chi-square-style comparison, not a t-test on coded numbers — unless we justify an interval scale.' Then name the display you would actually ship in a dashboard.",
    bridge: "Once types are clear, the next lesson compresses raw numeric lists into frequency tables and histograms — the first picture of shape for quantitative data.",
  }),

  buildLesson({
    title: "Frequency Distributions and Histograms",
    partLabel: PART,
    principles: [
      "A frequency table compresses raw lists into counts",
      "Histograms show shape: center, spread, skew, gaps, modes",
      "Bin width changes the story — too few hides detail, too many is noise",
      "Relative frequency is the empirical cousin of probability",
      "For unequal widths, area — not bar height — must encode frequency",
    ],
    objectives: [
      "Build a frequency and relative-frequency table",
      "Draw and interpret a histogram",
      "Explain how bin width affects appearance",
      "Read modality (uni/bi) and skew from a plot",
      "Connect relative frequencies to later probability language",
    ],
    why: "Raw lists hide patterns. Twenty exam scores in a spreadsheet do not show you a cluster, a gap, or a long tail — a frequency table and histogram do. These pictures are also the bridge to probability: relative frequency in a bin is the empirical stand-in for \"probability mass in a region,\" which becomes density later.",
    story: "Your algorithms midterm scores just landed for a section of 32 students. Scrolling the grade column feels like noise: 61, 88, 74, 95, 70, …. Someone asks, \"Was the test fair?\" You cannot answer from a sorted list alone. You bin scores by tens, tally frequencies, and draw a histogram. Suddenly you see a pile between 70 and 80, a thin left tail of struggles, and a small high-score bump. The shape — not any single number — is what you bring to the course staff meeting.",
    idea: "Group values into **bins** (intervals), count how many fall in each bin (**frequency**), and divide by \(n\) for **relative frequency**. A **histogram** draws bars so that area (or height, when widths are equal) represents those counts. You read **center** (where mass sits), **spread** (how wide), **skew** (which tail is longer), **modality** (one peak or two), and **outliers** (lonely bars far away). Change the bin width and the same data can look smooth or spiky — so always ask whether the story is robust to reasonable bin choices.",
    steps: [
      {
        title: "Scan the data for min, max, and oddities",
        body: "Find the range you must cover. Note impossible values, duplicates that might be data-entry errors, and natural boundaries (scores cannot exceed 100). These constraints guide sensible bin edges.",
      },
      {
        title: "Choose bins with equal width when you can",
        body: "Equal-width intervals covering min to max keep height proportional to frequency, which is easiest to read. A common starting heuristic is roughly \(\\sqrt{n}\) bins, then adjust. Prefer round edges (10s, 5s) humans can talk about.",
      },
      {
        title: "Tally frequencies and relative frequencies",
        body: "Count observations in each bin. Relative frequency = count / \(n\). Check that relative frequencies sum to 1 (up to rounding). That sanity check catches double-counted or dropped points.",
      },
      {
        title: "Plot with touching bars for continuous grouping",
        body: "Unlike a categorical bar chart, histogram bars usually touch to signal a continuous axis chopped into intervals. Label the horizontal variable with units and the vertical axis as frequency or density.",
      },
      {
        title: "Interpret shape before summarizing with one number",
        body: "Ask: Where is the bulk? One peak or two? Long left or right tail? Gaps? Isolated bars? Only after the picture should you reach for mean, median, or SD — those numbers answer questions the shape already framed.",
      },
    ],
    mathSimple: "For a dataset of size \(n\):\n\n- Frequency of bin \(i\): \(f_i = \) number of observations in bin \(i\).\n- Relative frequency: \(f_i / n\) (dimensionless; sums to 1).\n- If every bin has width \(h\), a **density** height \(f_i / (n h)\) makes the **total area** of the histogram equal to 1.\n\nWhy density? Because later a continuous PDF also has total area 1. The histogram becomes an empirical density estimate. In words: \"What fraction of the data lives in this slice of the axis?\"",
    walkthrough: "Scores: 55, 62, 68, 71, 73, 74, 75, 77, 78, 80, 81, 84, 88, 92, 98. Here \(n=15\), min 55, max 98.\n\nUse bins of width 10: [50,60), [60,70), [70,80), [80,90), [90,100].\n\nTallies: [50,60): 1; [60,70): 2; [70,80): 6; [80,90): 4; [90,100]: 2.\n\nRelative frequencies: \(1/15, 2/15, 6/15, 4/15, 2/15\). Sum = 1.\n\nThe tallest bar is 70–80. The right side still has mass up to 98, so there is a high-score tail. Center of mass sits a bit above the middle of the tallest bin — a mild right lean visually.",
    example: "Exam scores from 55 to 98 with bins of width 10 produce bars [50,60), …, [90,100]. If the tallest bar is 70–80 and a thinner bar stretches toward 100, you describe: left-peaked with a high-score right tail (right skew). That description already warns you that the mean may sit to the right of the median.",
    example2: "API latency sample (ms): many values near 40–60, almost none near 200, and a handful near 800 from cold starts. With wide bins you might see one big mound and miss the cold-start spike. With very narrow bins the cold starts appear as tiny lonely bars — easy to dismiss as noise. A moderate width plus a note \"check max latency separately\" is the honest engineering move: the histogram guides you, then you inspect extremes with domain knowledge.",
    labCue: "Open the **histogram** lab: drag the bin-width slider and watch shape change. Same data, different story. Predict whether narrowing bins will create multi-modality before you move the slider.",
    check: [
      "What happens if every observation is in its own bin?",
      "Why do histogram bars usually touch, unlike categorical bar charts?",
      "If bin widths are unequal, should bar height or bar area encode frequency?",
    ],
    practice: [
      {
        q: "For the frequencies 2, 5, 8, 5 on four equal-width bins and n=20, write the relative frequencies and say what the shape suggests.",
        a: "Relative frequencies: 0.10, 0.25, 0.40, 0.25. Unimodal, fairly symmetric mound peaking in the third bin — a rough bell-ish empirical shape.",
      },
      {
        q: "You switch from 5 bins to 40 bins on the same n=30 dataset. What visual problem do you expect?",
        a: "Bars become spiky and noisy; many bins may be empty. You overfit accidental gaps. Shape becomes hard to read — better to use fewer, wider bins or a density smooth for small n.",
      },
    ],
    formal: "For equal-width bins of width \(h\), density height \(f_i/(n h)\) yields total area 1 and is a simple histogram density estimator. With unequal widths, set bar area proportional to \(f_i/n\) so height = \((f_i/n)/\\text{width}_i\). Relative frequencies converge (in frequentist intuition) to probabilities of falling in those intervals as \(n\\to\\infty\) under i.i.d. sampling.",
    formulas: "- Relative frequency of bin \(i\): \(f_i / n\)\n- Density height (equal width \(h\)): \(f_i / (n h)\)\n- Total area with density heights: \(\\sum_i (f_i/(n h))\\cdot h = 1\)",
    derivation: "Start from counts. Divide by \(n\) to get fractions of the sample. To compare bins of different widths fairly, divide those fractions by width — that is density. The \"area = probability mass\" slogan is exactly why continuous PDFs integrate to 1: they are the smooth limit of this thinking.",
    pitfalls: [
      "Unequal bin widths with height = count (area, not height, should encode frequency)",
      "Cherry-picking bin edges to force a desired shape",
      "Reading a spiky narrow-bin histogram as true multi-modality in small samples",
    ],
    interview: "Explain that a histogram is a density estimate: 'I care about area in a region, and I always sanity-check sensitivity to bin width before I trust a story about skew or modes.'",
    bridge: "Shape suggests where the 'typical' value lives — next we pin that down with mean, median, and mode, and learn when they disagree.",
  }),

  buildLesson({
    title: "Measures of Central Tendency",
    partLabel: PART,
    principles: [
      "Mean balances the data; median resists outliers; mode is most common",
      "Skewed data: median often tells a fairer 'typical' story",
      "Always report center with units, sample size, and context",
      "One number never replaces a plot",
      "The sample mean is the empirical twin of later expectation E[X]",
    ],
    objectives: [
      "Compute mean, median, and mode by hand on small sets",
      "Choose an appropriate center for skewed vs symmetric data",
      "Explain the effect of outliers on the mean",
      "Connect center to later expectation E[X]",
      "State when the mode is the most useful of the three",
    ],
    why: "People ask \"what is typical?\" Mean, median, and mode answer that question differently. Picking the wrong one misleads — in salary debates, server load averages, and exam curves alike. Center is also how you will later understand expectation: the mean is the balancing point of a distribution's mass.",
    story: "Your internship team tracks daily active minutes in a study app. Most students use it 20–40 minutes. One power user leaves it open for 480 minutes. The mean jumps into the 60s and suddenly \"average engagement\" looks amazing in a slide deck. You sort the list, find the median still near 30, and insist on reporting both. Product decides to celebrate median engagement and investigate the outlier session separately — maybe it was a forgotten laptop, not a delighted user.",
    idea: "The **mean** is the arithmetic average — the balance point on a number line. The **median** is the middle value after sorting (or the average of the two middle values when \(n\) is even) — half the data lie on each side. The **mode** is the most frequent value (or the tallest bin). On a symmetric unimodal mound, all three roughly agree. With a long right tail, the mean is usually pulled above the median. Outliers yank the mean hard; the median shrugs.",
    steps: [
      {
        title: "Compute the mean",
        body: "Add every value and divide by \(n\). Keep units. Mentally note whether a few huge or tiny values are dominating the sum — that is your first warning that the mean may not feel \"typical.\"",
      },
      {
        title: "Sort and find the median",
        body: "Order the data. If \(n\) is odd, take the middle entry. If \(n\) is even, average the two central entries. The median cares about order, not about how far the extremes sit.",
      },
      {
        title: "Identify the mode (or modes)",
        body: "Find the most common value. Continuous data may have no repeated number; then speak of a modal bin from a histogram instead. Bimodal data can have two competing modes — that is a feature, not a bug.",
      },
      {
        title: "Compare mean and median against the plot",
        body: "If mean \(\\gg\) median, suspect right skew or high outliers. If mean \(\\ll\) median, suspect left skew. If they nearly match and the histogram is one mound, a single center summary is safer.",
      },
      {
        title: "Choose what to report for the audience",
        body: "For heavily skewed money or latency data, lead with the median (and maybe quartiles). For roughly symmetric measurement error, the mean is natural and connects cleanly to later theory. Always pair a center with a spread measure when you can.",
      },
    ],
    mathSimple: "- Sample mean: \(\\bar{x} = \\dfrac{1}{n}\\sum_{i=1}^n x_i\). In words: total of the values, shared equally among \(n\) observations.\n- Population mean (when the whole finite population is known): \(\\mu = \\dfrac{1}{N}\\sum_{i=1}^N x_i\).\n- Median \(m\): the middle order statistic (average of two middles if \(n\) even).\n- Mode: \(\\arg\\max\) of frequency (discrete) or of density (continuous idealization).\n\nLater, for a random variable \(X\), \(\\mathbb{E}[X]\) plays the role of \(\\mu\) — the long-run average of \(X\) if you could repeat the experiment forever.",
    walkthrough: "Incomes (thousands): 30, 32, 35, 40, 200. Here \(n=5\).\n\nMean: \((30+32+35+40+200)/5 = 337/5 = 67.4\). So \"average income\" ≈ 67.4k.\n\nSorted already; median = middle value = 35k.\n\nMode: all unique — no useful mode.\n\nInterpretation: the 200k outlier pulled the mean more than double the median. For \"typical worker,\" report 35k (median). For \"total payroll ÷ headcount,\" the mean is the right tool — but label it honestly as a balance point, not a typical person.",
    example: "Incomes 30k, 32k, 35k, 40k, 200k. Mean ≈ 67.4k (pulled up); median = 35k (typical worker). Use the median for \"typical income,\" and mention the outlier if stakeholders care about total wealth.",
    example2: "Quiz scores out of 10: 6, 7, 7, 8, 8, 8, 9. Mean = \(53/7 \\approx 7.57\). Median = 8. Mode = 8. Fairly tight and slightly left of a high cluster — mean and median agree enough that either is fine; the mode highlights that 8 was the most common score.",
    labCue: "In the **centralTendency** lab, drag points on the number line. Watch the mean chase outliers while the median stays calmer. Predict the new mean before you release the point.",
    check: [
      "When is the mode more useful than the mean?",
      "What does mean ≈ median suggest about shape?",
      "Why can 'average load time' be a bad headline metric for a website?",
    ],
    practice: [
      {
        q: "Data: 2, 3, 3, 4, 100. Compute mean and median. Which would you report as typical and why?",
        a: "Mean = 112/5 = 22.4; median = 3. Report median as typical — the 100 dominates the mean. Mention the outlier separately.",
      },
      {
        q: "A histogram is symmetric and unimodal. What do you expect for mean vs median vs mode?",
        a: "They should be nearly the same, all sitting near the center of the mound.",
      },
    ],
    formal: "Sample mean \(\\bar{x}=(1/n)\\sum x_i\). Population mean \(\\mu=(1/N)\\sum x_i\). For a continuous distribution, a median \(m\) satisfies \(P(X\\le m)\\ge 1/2\) and \(P(X\\ge m)\\ge 1/2\). The mean minimizes squared error \(\\sum(x_i-c)^2\) over choices of \(c\); the median minimizes absolute error \(\\sum|x_i-c|\) — that optimization view explains robustness differences.",
    formulas: "- \(\\bar{x} = (\\sum x_i)/n\)\n- Median: middle order statistic (average of two middles if \(n\) even)\n- Mode: argmax of frequency or density\n- Relationship under right skew (typical): mean > median > mode (rule of thumb, not a theorem)",
    derivation: "Why does the mean balance? The sum of signed deviations from \(\\bar{x}\) is zero: \(\\sum(x_i-\\bar{x})=0\). That is algebraic, not mystical — it follows from the definition. The median's \"half on each side\" property follows from ordering rather than from summing.",
    pitfalls: [
      "Reporting mean without noting skew or outliers",
      "Averaging rates or ratios incorrectly (need weighted or harmonic means in special cases)",
      "Saying 'the average student' when the mean is distorted by a heavy tail",
    ],
    interview: "For skewed product metrics (income, latency), say you would lead with median and percentiles, and use the mean when the question is about totals or when the distribution is roughly symmetric.",
    bridge: "A center without a spread is incomplete — next we measure how much the data disagree using range, variance, and standard deviation.",
  }),

  buildLesson({
    title: "Measures of Dispersion",
    partLabel: PART,
    principles: [
      "Center without spread is incomplete",
      "Variance averages squared deviations; SD returns to original units",
      "Range is simple but fragile to outliers",
      "Sample variance uses n−1 (Bessel) to unbiasedly estimate population σ²",
      "Later: Var(X) is the probabilistic twin of sample variance",
    ],
    objectives: [
      "Compute range, variance, and standard deviation by hand",
      "Interpret SD in the units of the data",
      "Contrast sample vs population variance formulas",
      "Relate spread to reliability of the mean",
      "Explain why we square deviations instead of only averaging absolute deviations",
    ],
    why: "Two classes can share the same mean exam score — one tight, one chaotic. Dispersion measures how much values disagree. In systems work, a service with mean latency 50 ms and SD 5 ms feels different from mean 50 ms and SD 80 ms. Spread is also the doorway to variance of random variables and to confidence intervals later.",
    story: "You and a classmate both average 72% on practice contests. Your scores: 70, 72, 74. Theirs: 40, 72, 100. Same mean, wildly different risk if a recruiter draws one random contest as a signal. You compute standard deviations: yours is tiny; theirs is huge. Suddenly \"we both average 72\" is not a fair comparison — consistency is part of the story.",
    idea: "**Range** = max − min: fast, fragile. **Variance** ≈ average of squared distances from the mean: large deviations count extra because of squaring. **Standard deviation (SD)** = square root of variance — back in the original units, so you can say \"typically about \(s\) units from the mean.\" Population formulas divide by \(N\); sample formulas usually divide by \(n-1\) so that \(s^2\) is an unbiased estimator of \(\\sigma^2\).",
    steps: [
      {
        title: "Find the mean as the reference point",
        body: "Dispersion is measured relative to a center. For variance and SD, that center is the mean. Write \(\\bar{x}\) clearly before computing deviations.",
      },
      {
        title: "Compute deviations from the mean",
        body: "For each point form \(x_i-\\bar{x}\). Some will be negative, some positive. Their sum should be (nearly) zero — a useful arithmetic check.",
      },
      {
        title: "Square, sum, and divide",
        body: "Square each deviation so that signs do not cancel and large misses weigh more. Sum the squares. Divide by \(N\) for a population, or by \(n-1\) for a sample variance \(s^2\).",
      },
      {
        title: "Take the square root for SD",
        body: "\(s=\\sqrt{s^2}\) restores the original units. Now you can compare \"about 8 points of SD\" to the scale of the exam.",
      },
      {
        title: "Interpret beside the mean and the plot",
        body: "Mean ± SD is a rough middle band for mound-shaped data, not a law of nature. Always glance at the histogram: a huge SD may mean a long tail, not a wide symmetric bell.",
      },
    ],
    mathSimple: "- Range \(= x_{(n)} - x_{(1)}\).\n- Population variance: \(\\sigma^2 = \\dfrac{1}{N}\\sum (x_i-\\mu)^2\).\n- Sample variance: \(s^2 = \\dfrac{1}{n-1}\\sum (x_i-\\bar{x})^2\).\n- SD: \(\\sigma=\\sqrt{\\sigma^2}\\), \(s=\\sqrt{s^2}\).\n\nIn words: variance is the average squared miss from the mean; SD is that idea translated back into \"how many units on the axis.\" Squared units for variance (ms², dollars²) are correct but awkward to say aloud — prefer SD for interpretation.",
    walkthrough: "Sample scores: 70, 72, 74. Mean \(\\bar{x}=72\).\n\nDeviations: −2, 0, +2. Squares: 4, 0, 4. Sum = 8.\n\nSample variance \(s^2 = 8/(3-1) = 4\). Sample SD \(s=2\).\n\nContrast set: 40, 72, 100. Mean still 72. Deviations: −32, 0, +28. Squares: 1024, 0, 784. Sum = 1808. \(s^2=1808/2=904\), \(s\\approx 30.1\).\n\nSame center, completely different dispersion — the second set is far less predictable.",
    example: "Scores 70, 72, 74 vs 40, 70, 100. Same mean 72; second set has much larger SD. \"Average 72\" hides very different reliability. In a report, write mean and SD together.",
    example2: "Build times (s): 12, 13, 13, 14, 50. Mean = 20.4. Range = 38. Sample SD is large because of 50. Removing the 50 (if it was a cold cache) drops mean and SD dramatically. Dispersion metrics force you to confront whether extremes are part of the process or accidents.",
    labCue: "Use the **dispersion** lab: stretch points away from the mean and watch \(\\sigma\) grow. The deviation bars make \"squared distance from the mean\" visible before you trust the formula.",
    check: [
      "Why divide by n−1 for sample variance?",
      "Can variance be negative? Why or why not?",
      "Why is SD often preferred over variance when talking to humans?",
    ],
    practice: [
      {
        q: "For data 4, 6, 8 (treat as a sample), compute s² and s.",
        a: "Mean = 6. Deviations −2, 0, 2. Squared sum = 8. s² = 8/2 = 4. s = 2.",
      },
      {
        q: "Two servers have mean latency 100 ms. Server A has s = 5 ms; server B has s = 40 ms. What operational difference do you expect?",
        a: "A is consistent near 100 ms. B often wanders far from 100 — user experience will feel janky even though the averages match.",
      },
    ],
    formal: "Population: \(\\sigma^2=(1/N)\\sum(x_i-\\mu)^2\). Sample: \(s^2=(1/(n-1))\\sum(x_i-\\bar{x})^2\) (Bessel's correction). Under i.i.d. sampling with finite variance, \(\\mathbb{E}[s^2]=\\sigma^2\). The computational formula \(s^2=\\frac{1}{n-1}\\big(\\sum x_i^2 - n\\bar{x}^2\\big)\) is algebraically equivalent and handy for hand work.",
    formulas: "- Range = max − min\n- \(s^2 = \\sum(x_i-\\bar{x})^2 / (n-1)\)\n- \(s = \\sqrt{s^2}\)\n- Population twin: \(\\sigma^2 = \\sum(x_i-\\mu)^2 / N\)",
    derivation: "Why square? Absolute deviations give mean absolute deviation, which is robust and interpretable — but squared deviations connect smoothly to algebra (expanding squares), Pythagoras-style geometry in \(\\mathbb{R}^n\), and the variance operator \(\\mathrm{Var}(X)=\\mathbb{E}[(X-\\mu)^2]\) used throughout probability. The \(n-1\) correction compensates for using \(\\bar{x}\) (which itself fits the data) instead of the true \(\\mu\).",
    pitfalls: [
      "Comparing SDs across differently scaled variables without standardization",
      "Forgetting units (variance is squared units)",
      "Using population /N when the problem asked for sample s²",
    ],
    interview: "Define SD in one sentence: 'typical distance from the mean, in the data's units, based on averaged squared deviations.' Then mention you always pair it with a check for skew/outliers.",
    bridge: "SD uses every point and squares extremes. Percentiles and box plots offer a complementary, outlier-resistant picture of spread — that is next.",
  }),

  buildLesson({
    title: "Percentiles Quartiles and Box Plots",
    partLabel: PART,
    principles: [
      "Percentiles locate relative standing along an ordered list",
      "Quartiles split data into fourths; IQR measures middle spread",
      "Box plots summarize five numbers at a glance",
      "Great for comparing groups side by side",
      "The 1.5×IQR rule is a flag for outliers, not automatic deletion",
    ],
    objectives: [
      "Find quartiles and the IQR on a sorted sample",
      "Build a five-number summary",
      "Read and sketch a box plot",
      "Flag outliers via the 1.5×IQR rule",
      "Compare two groups using parallel box plots",
    ],
    why: "Medians and quartiles describe skewed data better than mean±SD alone. Box plots compare sections, app versions, or A/B groups in one glance: center, middle 50%, whiskers, and outlier dots. In interviews and dashboards, \"p95 latency\" is just a percentile — this lesson is that language.",
    story: "Your team ships two recommendation UIs. Mean click latency looks similar, so leadership shrugs. You draw side-by-side box plots of latency. Version A has a tight box; Version B's box is similar but a long upper whisker and a spray of outlier dots show painful delays for some users. The p95 tells the same story in one number. Product prioritizes B's tail, not the mean — percentiles made the pain visible.",
    idea: "The **p-th percentile** is a value below which roughly \(p\\%\) of the data fall. **Q1, Q2 (median), Q3** are the 25th, 50th, and 75th percentiles — the quartiles. **IQR = Q3 − Q1** measures the spread of the middle half. A **box plot** draws a box from Q1 to Q3 with a median line, whiskers to the farthest non-outlier points, and outlier dots beyond fences \(Q1-1.5\\cdot\\mathrm{IQR}\) and \(Q3+1.5\\cdot\\mathrm{IQR}\).",
    steps: [
      {
        title: "Sort the data",
        body: "Order statistics come first. Every percentile method starts from a sorted list. Write the ordered sample clearly for small n.",
      },
      {
        title: "Locate the median and quartiles",
        body: "Find Q2 (median). Then find the median of the lower half (Q1) and of the upper half (Q3). Textbook conventions differ slightly on whether the overall median is included in the halves — pick one rule and stay consistent on an exam.",
      },
      {
        title: "Compute IQR and outlier fences",
        body: "IQR = Q3 − Q1. Lower fence = Q1 − 1.5·IQR; upper fence = Q3 + 1.5·IQR. Points outside the fences are flagged as potential outliers for investigation.",
      },
      {
        title: "Assemble the five-number summary",
        body: "Min, Q1, median, Q3, max (or whisker ends if you exclude outliers from the max whisker). This is the skeleton of the box plot.",
      },
      {
        title: "Draw and compare",
        body: "Box from Q1–Q3, line at median, whiskers, outlier dots. For two groups, draw parallel boxes on the same scale. Ask which median is higher and which middle-half is wider.",
      },
    ],
    mathSimple: "- Empirical p-th percentile: a value \(\\hat{q}_p\) such that roughly fraction \(p/100\) of the sample is \(\\le \\hat{q}_p\).\n- Quartiles: \(Q1=\\hat{q}_{25}\\), \(Q2=\\hat{q}_{50}\\), \(Q3=\\hat{q}_{75}\).\n- \(\\mathrm{IQR}=Q3-Q1\).\n- Outlier fences: \(Q1-1.5\\cdot\\mathrm{IQR}\) and \(Q3+1.5\\cdot\\mathrm{IQR}\).\n\nIn words: percentiles answer \"how high do I need to go to have passed fraction \(p\) of the data?\" IQR answers \"how wide is the middle half?\"",
    walkthrough: "Homework times (min), already sorted: 20, 25, 30, 35, 40, 45, 90. Here \(n=7\).\n\nMedian Q2 = 35 (4th value).\nLower half: 20, 25, 30 → Q1 = 25. Upper half: 40, 45, 90 → Q3 = 45.\nIQR = 45 − 25 = 20.\nUpper fence = 45 + 1.5·20 = 75. Lower fence = 25 − 30 = −5 (irrelevant for times).\n90 > 75 → flag 90 as an outlier.\nFive-number summary emphasizing whiskers: 20, 25, 35, 45, with outlier 90 plotted separately (whisker ends at 45).",
    example: "Sorted homework times: 20, 25, 30, 35, 40, 45, 90. Median 35; Q1≈25; Q3≈45; IQR≈20; 90 lies beyond Q3+1.5·IQR → outlier on the box plot. The box shows most students finished between 25 and 45 minutes.",
    example2: "API latencies for service A vs B (ms), five-number summaries: A: 40, 48, 55, 62, 70; B: 42, 50, 56, 80, 200 with several points above the upper fence. Medians similar, but B's IQR and outlier spray show a worse tail. Choosing \"faster on average\" by mean alone would miss B's reliability problem.",
    labCue: "The **histogram** lab can overlay a box summary — link the bin shape to the five-number story. Watch how a long right tail stretches the upper whisker and grows outlier dots.",
    check: [
      "What does a long upper whisker (or many high outlier dots) suggest?",
      "Is the mean always inside the box? Why or why not?",
      "What fraction of the data is roughly between Q1 and Q3?",
    ],
    practice: [
      {
        q: "For sorted data 1,2,3,4,5,6,7,8, find Q1, median, Q3, and IQR (use medians of halves, excluding the overall median).",
        a: "Median = 4.5 (average of 4 and 5). Lower half 1–4 → Q1 = 2.5. Upper half 5–8 → Q3 = 6.5. IQR = 4.",
      },
      {
        q: "Q1=10, Q3=22. What are the 1.5×IQR fences?",
        a: "IQR=12. Lower fence=10−18=−8. Upper fence=22+18=40. Points below −8 or above 40 are flagged.",
      },
    ],
    formal: "Empirical quantile functions vary by software (Hyndman–Fan types, inclusive/exclusive median methods). On exams, state the rule you use. The 1.5×IQR rule is a conventional exploratory flag tied to the Gaussian-ish fourths, not a probability theorem guaranteeing false-positive rates.",
    formulas: "- \(\\mathrm{IQR}=Q3-Q1\)\n- Outlier fences: \(Q1-1.5\\cdot\\mathrm{IQR}\), \(Q3+1.5\\cdot\\mathrm{IQR}\)\n- Five-number: min, Q1, median, Q3, max (or whisker ends)",
    derivation: "Quartiles come from cutting the empirical cumulative distribution at 0.25, 0.5, 0.75. The box plot is simply a drawing of those cuts plus a resistant rule for \"far\" points. Its power is comparative geometry: two boxes on one scale make shift and spread differences obvious without assuming normality.",
    pitfalls: [
      "Mixing percentile definitions across tools without noticing",
      "Calling every point outside whiskers 'error' without domain check",
      "Comparing box plots drawn on different axis scales",
    ],
    interview: "Translate product language: 'p95 latency is the 95th percentile — 95% of requests were faster than that.' Offer a box plot when stakeholders need the whole middle-half story, not one tail number.",
    bridge: "Box plots already hint at asymmetry via whisker length. Next we name that asymmetry and tail weight explicitly with skewness and kurtosis.",
  }),

  buildLesson({
    title: "Skewness and Kurtosis",
    partLabel: PART,
    principles: [
      "Skewness describes asymmetry of the tails",
      "Kurtosis describes tail weight relative to a normal benchmark",
      "Visual checks beat blind trust in a single coefficient",
      "Skew guides whether mean or median is more honest",
      "Small samples make sample skew/kurtosis noisy",
    ],
    objectives: [
      "Identify left vs right skew from plots and mean–median order",
      "Relate skew to choice of center",
      "Interpret high kurtosis as heavier tails / more extremes",
      "Know limits of sample skew/kurtosis in small n",
      "Decide when to transform or use robust summaries",
    ],
    why: "Many real datasets are not bell-shaped. Income, file sizes, and request latencies lean right; some grading curves lean left. Skew and kurtosis warn you before you slap on a normal model or a lazy mean±2σ rule. They are descriptive flags — not proof of a named distribution — but they stop you from trusting the wrong intuition.",
    story: "You plot disk-usage for student VMs. Most images sit near 4–6 GB; a few bloated environments hit 40+ GB. The histogram leans right, mean usage exceeds median, and a kurtosis check flags heavier tails than a normal with the same variance would allow. Capacity planning that used \"mean + 2 SD\" under a normal fantasy underestimates how often you will hit painful extremes. You switch to percentiles and a right-skew-aware mental model.",
    idea: "**Right skew** (positive): long right tail; mean usually pulled to the right of the median. **Left skew** (negative): long left tail; mean left of median. **Kurtosis** speaks to how much probability sits in the extremes relative to a normal curve with the same variance. **Excess kurtosis > 0** (leptokurtic) means heavier tails / sharper center tradeoff — more surprises than a Gaussian expects. Always plot first; coefficients without a picture lie easily in small samples.",
    steps: [
      {
        title: "Plot the histogram or box plot first",
        body: "Eyes before coefficients. Look for which tail stretches farther and whether extremes are rare spikes or a fat shoulder. Note sample size — n=15 can fake drama.",
      },
      {
        title: "Compare mean and median",
        body: "Mean > median often accompanies right skew; mean < median often accompanies left skew. Agreement suggests rough symmetry (not full normality!).",
      },
      {
        title: "Inspect tails against a normal mental reference",
        body: "Ask whether extremes are rarer or more common than a bell curve with the same SD would allow. That is the kurtosis question in plain language.",
      },
      {
        title: "Compute sample skew/kurtosis only as secondary evidence",
        body: "Software will happily print γ̂₁ and excess kurtosis. Treat them as numeric summaries of what you already saw, not as oracles — especially for small n.",
      },
      {
        title: "Choose modeling and reporting consequences",
        body: "Right-skewed positives often use medians, percentiles, log transforms, or heavy-tailed models. Do not force mean±2σ stories onto clearly skewed data.",
      },
    ],
    mathSimple: "Central moments about the mean \(\\mu\):\n\n- Second: \(\\mu_2 = \\sigma^2 = \\mathbb{E}[(X-\\mu)^2]\) (spread).\n- Third: \(\\mu_3 = \\mathbb{E}[(X-\\mu)^3]\) — odd power keeps a **sign** (direction of the long tail).\n- Fourth: \(\\mu_4 = \\mathbb{E}[(X-\\mu)^4]\) — always positive; large when extremes are large.\n\nSkewness: \(\\gamma_1 = \\mu_3 / \\sigma^3\) (dimensionless).\nExcess kurtosis: \(\\gamma_2 = \\mu_4/\\sigma^4 - 3\) (normal baseline subtracted so a perfect normal has excess 0).\n\nIn words: skewness is \"signed, scaled lopsidedness\"; excess kurtosis is \"extra extreme-mass compared with a normal.\"",
    walkthrough: "Toy values: 1, 2, 2, 3, 8. Mean \(\\bar{x}=3.2\). Median = 2. Mean > median → suspect right skew.\n\nDeviations from 3.2: −2.2, −1.2, −1.2, −0.2, +4.8.\nCubing emphasizes +4.8: the positive cube dominates → positive third moment → positive sample skew.\n\nThe single 8 creates a long right tail. A normal with the same variance would not \"expect\" that lone leap as calmly as this tiny sample forces — visually, kurtosis feels elevated, but with n=5 you would not oversell a kurtosis number; you would say \"right skew with a high outlier.\"",
    example: "City wealth: many moderate incomes, few ultra-rich → right skew, high upper outliers. Mean wealth overstates the typical resident; median + top 1% share tells a fairer dual story.",
    example2: "An easy quiz where most score 9–10 and a few score near 0 produces **left skew**: long left tail of low scores, mean < median. Reporting only the mean makes the class look weaker than the typical student; the median (or percent full-marks) matches intuition better.",
    labCue: "Skew the **histogram** lab's data and watch the mean–median gap open. Add a far outlier and discuss whether you are seeing skew, kurtosis, or both.",
    check: [
      "If mean < median, which skew direction is likely?",
      "Does high kurtosis always mean a taller center? What else can it mean?",
      "Why is sample kurtosis unreliable for n = 12?",
    ],
    practice: [
      {
        q: "A latency histogram piles near 50 ms with a long tail to 2000 ms. Mean is 180 ms, median 55 ms. Describe skew and a better reporting pair than mean alone.",
        a: "Strong right skew (mean ≫ median). Report median and p95 (or a box plot), optionally mean for total-resource questions — but do not call 180 ms \"typical.\"",
      },
      {
        q: "Excess kurtosis is near 0 and the histogram looks symmetric. Does that prove normality?",
        a: "No. Many non-normal shapes can be roughly symmetric with moderate tails. Normality needs more evidence (or a modeling assumption), not just zero skew/kurtosis.",
      },
    ],
    formal: "Sample skewness \(g_1\) is a scaled third central moment; excess kurtosis uses the fourth central moment minus 3 (Mesokurtic normal baseline). Alternative kurtosis conventions exist (some software reports non-excess kurtosis). Asymptotic sampling variances shrink slowly — interpret cautiously for small n.",
    formulas: "- \(\\mu_3 = \\mathbb{E}[(X-\\mu)^3]\)\n- Skewness \(\\gamma_1 = \\mu_3 / \\sigma^3\)\n- Excess kurtosis \(\\gamma_2 = \\mu_4/\\sigma^4 - 3\)\n- Rule of thumb: right skew ↔ \(\\gamma_1>0\) ↔ mean often > median",
    derivation: "Odd moments keep signs, so the third moment detects asymmetric tails. Even moments ignore signs, so the fourth moment grows when |deviations| are large. Dividing by powers of \(\\sigma\) removes units, letting you compare shapes across scales. Subtracting 3 centers the kurtosis scale on the normal distribution — a convenient, if conventional, benchmark.",
    pitfalls: [
      "Computing skew on n < 30 and over-interpreting the third decimal",
      "Assuming zero skew implies normality (it does not)",
      "Deleting outliers only to \"fix\" skew without a domain reason",
    ],
    interview: "Say: 'I check skew with a plot and mean–median gap before I use normal-based intervals. For right-skewed latency I quote percentiles, not mean±2σ.'",
    bridge: "Descriptive pictures prepare you for uncertainty modeled formally — Part 2 begins with experiments, sample spaces, and the language of probability.",
  }),
];
