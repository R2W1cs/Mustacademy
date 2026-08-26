import { buildLesson } from "./helper.mjs";

const PART = "Part 7: Hypothesis Testing";

export const topics = [
  buildLesson({
    title: "Null and Alternative Hypotheses",
    partLabel: PART,
    principles: [
      "H₀ is the skeptical default you entertain until data force a rethink",
      "H₁ is the claim that needs convincing evidence against that default",
      "A test asks: 'If H₀ were true, how surprising would this sample be?'",
      "One-sided vs two-sided alternatives change which tails count as surprising",
      "Failing to reject H₀ is not the same as proving H₀ true",
    ],
    objectives: [
      "Write clear H₀ and H₁ for a mean or a proportion in context",
      "Choose a one-sided or two-sided alternative and justify it before seeing data",
      "Explain the 'assume H₀, then look for contradiction' logic out loud",
      "Use careful language: reject / fail to reject — never 'accept H₀ as proven'",
    ],
    why: "Every A/B test, drug trial, and quality-control check is a decision under uncertainty. Hypotheses turn a vague hope ('this might work') into a falsifiable claim you can stress-test with data.",
    story:
      "Imagine a coin a street magician hands you. You suspect it is unfair, but the polite default is 'fair until proven otherwise.' You flip it 100 times and get 80 heads. Under a fair coin that result is wildly unusual — so you reject the fair-coin story. You have not *proven* the exact bias; you have shown the fair story is an awful fit for what you saw.",
    idea: "Treat **H₀** as the 'nothing interesting / status quo / skeptical default,' usually written with an **equality**. Treat **H₁** as the direction you care about (greater, less, or not equal). Assume H₀ temporarily, measure how weird the data look under that assumption, and reject H₀ only if the weirdness crosses a pre-chosen threshold.",
    steps: [
      {
        title: "Name the parameter in plain words",
        body: "Is the target a population mean μ, a proportion p, a difference of means, …? Write one sentence: 'We care about the true average wait time' or 'We care about the true click-through rate.'",
      },
      {
        title: "Write H₀ with equality",
        body: "Put the skeptical value in H₀: H₀: μ = μ₀ or H₀: p = p₀. Equality belongs here because that is the single sharp world you will compute probabilities under.",
      },
      {
        title: "Write H₁ to match the scientific question",
        body: "Use > if you only care about an increase, < for a decrease, ≠ if either direction would matter. Choose the side **before** looking at the sample so you are not fishing for significance.",
      },
      {
        title: "Picture the sampling world under H₀",
        body: "Under H₀ the statistic (x̄ or p̂) has a sampling distribution centered at the null value. Extremely far outcomes live in the tails — those are the rejection region.",
      },
      {
        title: "Decide what 'surprising' will mean",
        body: "Later lessons set α and compute p-values. For now, lock the logic: evidence against H₀ is 'this sample would be rare if H₀ were true.'",
      },
    ],
    mathSimple:
      "Symbols are just shorthand for the story above.\n\n- **H₀: θ = θ₀** means 'the unknown truth θ equals this specific default value θ₀.'\n- **H₁: θ > θ₀** (or <, or ≠) means 'the truth sits on this side of the default.'\n- A **test statistic** converts the sample into one number that is easy to place on a known null curve (standard normal, t, χ², …).\n- A **p-value** answers: under H₀, how often would we see a statistic at least this extreme?\n\nNothing mystical: equality in H₀ is the sharp assumption that makes the null curve computable.",
    walkthrough:
      "Claim: a coin is unfair. Parameter θ = p = P(heads).\n\n1. H₀: p = 0.5 (fair). H₁: p ≠ 0.5 (two-sided — either bias direction matters).\n2. Data: 80 heads in 100 flips → p̂ = 0.80.\n3. Under H₀, p̂ should hover near 0.5 with SE ≈ √(0.5·0.5/100) = 0.05.\n4. Observed p̂ sits (0.80 − 0.5)/0.05 = 6 SE above the null — absurdly far for a fair coin.\n5. Conclusion language: reject H₀; the fair-coin model is incompatible with this sample. (We still do not claim we know the exact p.)",
    example:
      "**Proportion, two-sided.** A site claims 50% of visitors click a banner (p = 0.5). You suspect otherwise. Write H₀: p = 0.5 vs H₁: p ≠ 0.5. In a sample of 100 you see 80 clicks. That sample proportion is so far from 0.5 under a fair-null model that you reject H₀ at ordinary significance levels. Report: 'Data are inconsistent with p = 0.5,' not 'we proved p = 0.8.'",
    example2:
      "**Mean, one-sided.** A battery maker claims mean life μ = 500 hours. Customers complain batteries die early, so you only care about a decrease. Write H₀: μ = 500 vs H₁: μ < 500. A sample mean of 470 hours may or may not be surprising — that depends on the SE — but the **form** of the hypotheses already encodes the one-sided scientific question. Do not switch to two-sided after seeing 470 just because it 'looked low.'",
    labCue:
      "Open the **hypothesis** lab. Set a null mean, draw a sample mean, and watch where it lands under the null curve. Move the alternative direction (left / right / two-sided) and notice how the shaded rejection region changes even when the data stay fixed.",
    check: [
      "Why does H₀ almost always contain an equality, even when H₁ is one-sided?",
      "What careful sentence replaces 'we accept H₀' after a non-significant result?",
      "Give one research question that needs a one-sided H₁ and one that needs two-sided.",
    ],
    practice: [
      {
        q: "A coach claims players average μ = 10 hours of practice per week. You wonder if they practice more. Write H₀ and H₁.",
        a: "H₀: μ = 10. H₁: μ > 10. (One-sided; equality stays in H₀ even though the scientific interest is only 'more.')",
      },
      {
        q: "After a non-significant test someone says 'we proved the drug does nothing.' Fix the sentence.",
        a: "Better: 'We failed to reject H₀; these data do not provide statistically significant evidence of an effect at the chosen α. That is not proof of no effect — especially if power was low.'",
      },
    ],
    formal:
      "A hypothesis test for a parameter θ partitions the sample space into a rejection region R and its complement. Under a simple null H₀: θ = θ₀, the test controls Type I error via P_θ₀(data ∈ R) ≤ α. The alternative H₁ specifies the set of θ values for which we want power. Classical testing is a formalization of proof by contradiction: assume H₀, derive a sampling distribution, reject if the observed sample is too extreme under that law.",
    formulas:
      "- H₀: θ = θ₀\n- H₁: θ > θ₀  or  θ < θ₀  or  θ ≠ θ₀\n- Reject H₀ when the test statistic falls in the α-level critical region (or when p-value ≤ α)",
    derivation:
      "Why equality in H₀ even for one-sided alternatives? The hardest null to reject when H₁ is 'θ > θ₀' is usually the boundary θ = θ₀: that is where the sampling distribution sits closest to the alternative. Controlling the Type I error at θ = θ₀ automatically controls it for θ < θ₀ in many one-sided mean problems. So we compute under the boundary equality and reject for large positive evidence.",
    pitfalls: [
      "Reversing H₀ and H₁ because you 'want' significance",
      "Choosing one-sided vs two-sided after peeking at the data",
      "Saying 'H₀ is true' after failing to reject",
      "Testing a hypothesis suggested by the same dataset without a pre-registered plan (data snooping)",
    ],
    interview:
      "Frame it as decision under a default: 'H₀ is the status quo we keep unless the sample is rare under that status quo. Failing to reject means insufficient evidence to overturn it — not a certificate that the null is correct.'",
    bridge:
      "Next we price the two ways a decision can go wrong: rejecting a true H₀ (Type I) versus missing a false H₀ (Type II), and how α and power trade off.",
  }),

  buildLesson({
    title: "Type I and Type II Errors",
    partLabel: PART,
    principles: [
      "Type I error: reject H₀ when H₀ is actually true (false positive / false alarm)",
      "Type II error: fail to reject H₀ when H₀ is false (false negative / miss)",
      "Significance level α is the planned Type I error rate under H₀",
      "Power = 1 − β = probability of correctly rejecting when a specific alternative is true",
      "You cannot drive both error rates to zero with fixed n — design is a trade-off",
    ],
    objectives: [
      "Define Type I, Type II, α, β, and power in one clear sentence each",
      "Explain the α–power trade-off for fixed sample size",
      "Describe how larger n or larger effect size increases power",
      "Choose α deliberately (0.05 is convention, not a law of nature)",
    ],
    why: "Shipping a feature that is not actually better (Type I) wastes engineering time. Missing a real improvement (Type II) leaves money on the table. Good experiment design names which mistake hurts more, then sets α and n accordingly.",
    story:
      "A smoke alarm has two failure modes: it screams when there is no fire (Type I), or it stays quiet during a real fire (Type II). Making it hypersensitive cuts misses but raises false alarms. Making it stubborn does the opposite. Sample size is like buying a better sensor: with more data you can keep false alarms low and still catch real fires more often.",
    idea: "**α** is how often you allow false alarms when H₀ is true. **β** is how often you miss a real effect under a chosen alternative. **Power** is 1 − β — the chance you correctly sound the alarm when that alternative is true. Bigger samples and bigger true effects raise power; stricter α lowers false alarms but can also lower power if n stays fixed.",
    steps: [
      {
        title: "Name both mistakes in context",
        body: "Write: 'Type I here means …' and 'Type II here means …' using the product or science story, not only Greek letters.",
      },
      {
        title: "Fix α before looking at data",
        body: "Common choices: 0.05, 0.01, 0.10. Stricter α (smaller) means a higher bar to reject H₀.",
      },
      {
        title: "Pick a concrete alternative for power talk",
        body: "Power is not a single number for a composite H₁. Say 'power against a +2% lift' or 'against μ = μ₀ + 5.'",
      },
      {
        title: "Sketch the two sampling curves",
        body: "Under H₀ the statistic centers at the null. Under the alternative it shifts. α is the rejection-tail area under H₀; power is the rejection-tail area under the alternative.",
      },
      {
        title: "Improve the design if power is too low",
        body: "Increase n, target a larger effect (sometimes via better treatment), reduce noise, or — carefully — relax α if false alarms are cheap relative to misses.",
      },
    ],
    mathSimple:
      "Let R be the rejection region.\n\n- **α = P(reject H₀ | H₀ true)** — long-run false-alarm rate under the null.\n- For a specific alternative θ₁ in H₁: **β(θ₁) = P(fail to reject | θ = θ₁)**.\n- **Power(θ₁) = 1 − β(θ₁) = P(reject | θ = θ₁)**.\n\nPlain language: α is 'how often we cry wolf when the world is null.' Power is 'how often we correctly cry wolf when the world has shifted to θ₁.'",
    walkthrough:
      "A/B test: H₀: lift = 0 vs H₁: lift > 0. You set α = 0.05.\n\n- If the true lift is 0, about 5% of identical experiments will still reject (Type I).\n- If the true lift is +1% with tiny n, the alternative curve barely separates from the null — β is large, power is poor; you often miss a real win.\n- Quadrupling n roughly halves the SE (for means/proportions), pulls the curves apart relative to noise, and raises power against that same +1% lift.\n- Switching to α = 0.01 moves the critical value farther into the tail: fewer false discoveries, but also lower power at the same n.",
    example:
      "Medical screening analogy: calling a healthy patient 'diseased' is Type I; missing a sick patient is Type II. Hospitals often tolerate more Type I follow-up tests when missing disease is catastrophic — that is an explicit cost trade-off, not a statistics superstition.",
    example2:
      "Product experiment: α = 0.01 to avoid shipping noise. With n too small, power against a realistic +0.5% conversion lift might be only 20%. Result: many true wins look 'not significant.' Fix: compute required n for 80% power at that lift before launching the test.",
    labCue:
      "In the **hypothesis** lab, shade the Type I region under the null curve. Then shift the mean to an alternative and watch the power region grow or shrink as you change n, effect size, and α.",
    check: [
      "If you decrease α with n fixed, what typically happens to power?",
      "Why must you specify an effect size when someone asks 'what's the power of this test?'",
      "Give a domain where Type II is more costly than Type I.",
    ],
    practice: [
      {
        q: "True or false: α = 0.05 means there is a 5% chance H₀ is true. Explain.",
        a: "False. α is the error rate of the procedure when H₀ is true: P(reject | H₀). It is not P(H₀ | data).",
      },
      {
        q: "Two designs have the same α. Design A has power 0.5 and Design B has power 0.9 against the same alternative. Which is better at catching real effects, and what did B likely change?",
        a: "B is better at catching that alternative (higher power). Likely larger n, less noise, or a larger targeted effect — not a smaller α.",
      },
    ],
    formal:
      "For a test with rejection region R, the Type I error rate at a simple null θ₀ is α = P_θ₀(X ∈ R). The Type II error function on the alternative is β(θ) = P_θ(X ∉ R) for θ ∈ H₁, and power is π(θ) = 1 − β(θ). Neyman–Pearson theory studies optimal trade-offs between α and power for simple-vs-simple problems; in practice we fix α and design n to achieve target power at a scientifically meaningful effect size.",
    formulas:
      "- α = P(Type I) = P(reject H₀ | H₀ true)\n- β = P(Type II) = P(retain H₀ | H₁ true)  (at a specified alternative)\n- Power = 1 − β",
    derivation:
      "For a one-sided z-test of H₀: μ = μ₀ vs H₁: μ > μ₀ with known σ, reject when (x̄ − μ₀)/(σ/√n) > z_α. Under an alternative μ = μ₀ + δ, the statistic is normal with mean δ/(σ/√n). Power equals 1 − Φ(z_α − δ√n/σ). Reading the formula: larger δ, larger n, or larger α (smaller z_α) all increase power — the gentle-math version of the smoke-alarm trade-off.",
    pitfalls: [
      "Ignoring power and celebrating 'no significant difference' from an underpowered study",
      "Treating p ≈ 0.049 and p ≈ 0.051 as metaphysically different worlds",
      "p-hacking or optional stopping to 'achieve significance' (inflates true Type I rate)",
      "Confusing α with the posterior probability that H₀ is true",
    ],
    interview:
      "Say: 'I'd set α based on the cost of false positives, then choose n for adequate power at the smallest effect we care about. A non-significant result from a low-power test is inconclusive, not evidence of no effect.'",
    bridge:
      "With error rates in mind, we build the everyday workhorses: z-tests and t-tests that turn a sample mean into a p-value.",
  }),

  buildLesson({
    title: "Z-Tests and T-Tests",
    partLabel: PART,
    principles: [
      "A z-test uses a known σ (or a large-n normal approximation); a t-test replaces σ with s",
      "The test statistic is 'how many standard errors is the estimate from the null value?'",
      "The p-value is the tail probability of that statistic under H₀",
      "One-sample and two-sample versions share the same logic with different SEs",
      "Assumptions matter: independence, and approximate normality of the sampling distribution",
    ],
    objectives: [
      "Compute one-sample z and t statistics and interpret them",
      "Obtain a p-value or compare to a critical value at level α",
      "Run a two-sample comparison of means with the appropriate SE",
      "State when t is preferred over z and list key assumptions",
    ],
    why: "Comparing a mean to a target — or comparing two groups — is the default toolkit in science and industry. If you only memorize buttons in software, you will mis-click assumptions; if you understand SE-scaled distance, every variant looks like the same story.",
    story:
      "You claim your commute averages 30 minutes. For 25 weekdays you record a mean of 34 minutes with sample SD 8. Is 34 'basically 30,' or is that a real shift? Divide the gap (4 minutes) by the SE of the mean. If the gap is only a fraction of an SE, noise explains it. If it is several SEs, the 'still 30' story looks shaky.",
    idea: "Under H₀ the sample mean should sit near μ₀. The statistic **z** or **t** asks how many standard errors away you landed. Large |statistic| → small p-value → reject H₀ at ordinary α. Use **z** when σ is known (rare) or n is large enough for a normal approximation; use **t** when you estimate σ with s and rely on a t curve with n − 1 degrees of freedom.",
    steps: [
      {
        title: "State hypotheses and α",
        body: "e.g. H₀: μ = μ₀ vs H₁: μ ≠ μ₀, α = 0.05. Or two-sample: H₀: μ₁ − μ₂ = 0.",
      },
      {
        title: "Check design and assumptions",
        body: "Random sample / randomized groups, independence, and roughly normal data (or large n so CLT helps).",
      },
      {
        title: "Compute the standard error",
        body: "One-sample: σ/√n or s/√n. Two-sample: √(s₁²/n₁ + s₂²/n₂) (unpooled) or a pooled variant when variances look similar.",
      },
      {
        title: "Form the test statistic",
        body: "z or t = (estimate − null value) / SE. Same skeleton every time.",
      },
      {
        title: "Get the p-value and conclude in context",
        body: "Two-sided: probability farther from 0 than |statistic| under the null curve. Reject if p ≤ α; always end with a plain-language sentence about the mean(s).",
      },
    ],
    mathSimple:
      "One-sample mean:\n\n- **z = (x̄ − μ₀) / (σ/√n)** when σ is known.\n- **t = (x̄ − μ₀) / (s/√n)** when σ is unknown; under normality and H₀, t ~ t_{n−1}.\n\nTwo-sample means (idea):\n\n- Statistic = (x̄₁ − x̄₂ − 0) / SE_diff.\n\n**p-value (two-sided):** under H₀, P(|T| ≥ |t_obs|).\n\nGentle reading: numerator = 'gap from null'; denominator = 'typical sampling noise of that gap.'",
    walkthrough:
      "H₀: μ = 100, H₁: μ ≠ 100, α = 0.05. Sample: n = 25, x̄ = 104, s = 8.\n\n1. SE = s/√n = 8/5 = 1.6.\n2. t = (104 − 100)/1.6 = 2.5, df = 24.\n3. Two-sided p-value from t_24 is about 0.02.\n4. Since 0.02 < 0.05, reject H₀. In words: the sample mean is high enough, relative to noise, that μ = 100 is a poor explanation.\n5. If σ had been known as 8, you would use z = 2.5 and a standard-normal tail instead — similar conclusion here, but the t curve is a bit heavier-tailed (more honest about estimating σ).",
    example:
      "**One-sample t.** A machine should fill bags to 500 g. With n = 16, x̄ = 496, s = 6: t = (496 − 500)/(6/4) = −4/1.5 ≈ −2.67. For df = 15, two-sided p is small enough to reject at 5% — evidence of underfilling, assuming the sample is representative.",
    example2:
      "**Two-sample sketch.** Group A: n₁ = 40, x̄₁ = 72. Group B: n₂ = 40, x̄₂ = 68, with comparable SDs near 10. SE_diff ≈ √(100/40 + 100/40) ≈ 2.24. t ≈ (72 − 68)/2.24 ≈ 1.79. Two-sided p is around 0.08 — not significant at α = 0.05. Same gap with larger n (smaller SE) could become significant; effect size and sample size both matter.",
    labCue:
      "Use the **hypothesis** lab with z/t mode: set μ₀, watch the observed statistic, and read the shaded p-value. Toggle known σ vs estimated s to feel how the reference curve changes.",
    check: [
      "When do you prefer a t-test over a z-test for a mean?",
      "What does a t of 0 mean in words?",
      "Why does doubling every observation's deviation from μ₀ roughly double |t| if s stays similar?",
    ],
    practice: [
      {
        q: "n = 9, x̄ = 12, s = 3, H₀: μ = 10 vs H₁: μ > 10. Compute t and df.",
        a: "SE = 3/3 = 1. t = (12 − 10)/1 = 2. df = 8. (You would then find the right-tail p from t_8.)",
      },
      {
        q: "Someone uses a z critical value 1.96 with n = 8 and unknown σ. What is the issue?",
        a: "With small n and estimated σ, the t distribution is more appropriate; using z understates uncertainty and inflates Type I error relative to the nominal α.",
      },
    ],
    formal:
      "For i.i.d. N(μ, σ²) observations with σ known, under H₀: μ = μ₀ the statistic Z = √n (x̄ − μ₀)/σ ~ N(0,1). With σ unknown, T = √n (x̄ − μ₀)/s ~ t_{n−1}. Two-sample normal models yield analogous pivots with SEs for the difference of means; Welch's t approximates the null distribution when variances differ. Large-sample z-tests follow from CLT even without exact normality.",
    formulas:
      "- z = (x̄ − μ₀) / (σ/√n)\n- t = (x̄ − μ₀) / (s/√n),  df = n − 1\n- two-sample: t = (x̄₁ − x̄₂) / SE_diff\n- reject H₀ at level α when p ≤ α (or |statistic| ≥ critical value)",
    derivation:
      "Start from x̄ ~ N(μ, σ²/n) under normality. Standardize: √n (x̄ − μ)/σ ~ N(0,1). Under H₀ replace μ with μ₀ to get z. When σ is unknown, replace σ with s. The price is a heavier-tailed reference law: (x̄ − μ)/(s/√n) ~ t_{n−1}, because s itself is random and independent of x̄ in the normal model. As n grows, t_{n−1} → N(0,1), so z and t agree for large samples.",
    pitfalls: [
      "Using z with tiny n and unknown σ",
      "Treating dependent observations as independent (pseudo-replication)",
      "Running many unplanned tests and only reporting the significant ones",
      "Ignoring unequal variances in two-sample problems when they clearly differ",
    ],
    interview:
      "Walk through: hypotheses → assumptions → SE → statistic → p-value → decision in business language. Mention you'd check normality/outliers and whether a paired design is more appropriate than two independent samples.",
    bridge:
      "When the same person or unit contributes two measurements, independence fails — next we use paired t-tests on differences.",
  }),

  buildLesson({
    title: "Paired T-Tests",
    partLabel: PART,
    principles: [
      "Paired data: two measurements on the same unit (before/after, twin, matched)",
      "Analyze the differences D_i = X_i − Y_i as a one-sample problem",
      "Pairing removes shared unit-level noise and often raises power",
      "Normality/independence assumptions apply to the differences, not to raw unpaired lists",
      "Never 'unpair' matched data into an independent two-sample t out of habit",
    ],
    objectives: [
      "Recognize designs that are paired vs independent",
      "Form differences and run a one-sample t-test on them",
      "Interpret a significant mean difference in context (including sign)",
      "Explain why pairing can beat an unpaired analysis of the same numbers",
    ],
    why: "Pre/post training scores, two algorithms on the same inputs, left vs right eye — the interesting question is usually the within-unit change. Pairing is free power when matching is natural.",
    story:
      "Ten students take a coding speed test, train for a week, then retest. Student A is always fast; student B is always slow. An unpaired comparison mixes 'who is naturally fast' with 'did training help.' Differencing each student (after − before) cancels that personal baseline and focuses on change.",
    idea: "Collapse each pair to one number **D_i**. Then H₀: μ_D = 0 is exactly 'no mean change.' Use the ordinary one-sample t-statistic based on d̄ and s_D. If d̄ is many SEs from 0, reject 'no average change.'",
    steps: [
      {
        title: "Confirm the pairing",
        body: "Same subject twice, matched twins, same query on two systems, etc. If units are unrelated, this lesson does not apply.",
      },
      {
        title: "Form D_i = after − before (or A − B)",
        body: "Keep a consistent sign so positive means a clear direction in the story.",
      },
      {
        title: "Summarize the differences",
        body: "Compute d̄ and s_D. Glance at a histogram of D_i for wild skew or outliers.",
      },
      {
        title: "One-sample t on the differences",
        body: "t = d̄ / (s_D/√n) with df = n − 1, where n is the number of pairs.",
      },
      {
        title: "Conclude about mean change",
        body: "Reject H₀: μ_D = 0 only with enough evidence; report the estimated mean difference and preferably a CI for μ_D.",
      },
    ],
    mathSimple:
      "For pairs (X_i, Y_i), set D_i = X_i − Y_i.\n\n- H₀: μ_D = 0 vs H₁: μ_D ≠ 0 (or one-sided).\n- **t = d̄ / (s_D/√n)**, df = n − 1.\n\nWhy this helps: Var(X − Y) = Var(X) + Var(Y) − 2 Cov(X,Y). Positive correlation within pairs shrinks Var(D), shrinks SE, and makes real effects easier to detect.",
    walkthrough:
      "n = 10 students, differences (after − before) in problems solved per hour: suppose d̄ = 4.2 and s_D = 3.0.\n\n1. SE = 3.0/√10 ≈ 0.95.\n2. t = 4.2/0.95 ≈ 4.42, df = 9.\n3. Two-sided p is tiny → reject μ_D = 0.\n4. Interpretation: average improvement is about 4.2 problems/hour; unlikely to be pure noise under the paired model.\n5. If you had ignored pairing and treated before and after as two independent groups, the SE of the difference of means would typically be larger — you might fail to reject even with the same raw scores.",
    example:
      "Blood pressure measured before and after a drug for 12 patients. Analyze the 12 changes. A mean drop of 8 mmHg with small s_D can be significant even if between-patient levels vary widely — that between-patient variation is exactly what pairing removes.",
    example2:
      "Two ranking algorithms scored on the same 30 search queries. Pair by query. H₀: mean score difference is 0. This is usually far more sensitive than assigning 15 queries to each algorithm with no overlap.",
    labCue:
      "In the **hypothesis** lab, enable paired mode. Increase before/after correlation and watch the SE of differences fall — power rises even when the mean change stays fixed.",
    check: [
      "What is the degrees of freedom for a paired t with 15 pairs?",
      "Why can pairing reduce the SE?",
      "When would an independent two-sample t be the correct design instead?",
    ],
    practice: [
      {
        q: "Pairs yield differences: 2, 1, 3, 2, 0. Compute d̄. If s_D = 1.1, what is t for H₀: μ_D = 0?",
        a: "d̄ = 8/5 = 1.6. SE = 1.1/√5 ≈ 0.49. t ≈ 1.6/0.49 ≈ 3.3 (df = 4).",
      },
      {
        q: "A study measures each person once under treatment A and a different group once under B. Paired t — yes or no?",
        a: "No. Different people ⇒ independent (or at least unpaired) two-sample comparison, not paired differences.",
      },
    ],
    formal:
      "Let D_i = X_i − Y_i be i.i.d. with mean μ_D. Under normality, the one-sample t pivot for μ_D is exact. The paired test is equivalent to a one-sample test on differences; it is not the same as a two-sample test that ignores the pairing structure. Efficiency gains appear when Corr(X,Y) > 0.",
    formulas:
      "- D_i = X_i − Y_i\n- t = d̄ / (s_D/√n),  df = n − 1\n- CI for μ_D: d̄ ± t_{n−1, α/2} · s_D/√n",
    derivation:
      "The unpaired difference of means uses SE √(s_X²/n + s_Y²/n) when groups are independent. With pairing, the natural parameter is E[D]. Expanding Var(D) = Var(X) + Var(Y) − 2 Cov(X,Y) shows the covariance term. Matching induces positive covariance, reducing Var(D) relative to independent sampling — hence the usual power win for paired designs.",
    pitfalls: [
      "Applying a two-sample t to paired data (throws away matching)",
      "Pairing units that were never matched in the design",
      "Forgetting that df = number of pairs − 1",
      "Looking only at significance and ignoring the size of d̄",
    ],
    interview:
      "I'd ask: 'Are observations matched?' If yes, difference scores and a paired t (or Wilcoxon signed-rank if normality of D is hopeless). I'd report the mean difference with a CI, not only a p-value.",
    bridge:
      "Means are not the only target — next, chi-square goodness of fit checks whether categorical counts match a claimed set of probabilities.",
  }),

  buildLesson({
    title: "Chi-Square Goodness of Fit",
    partLabel: PART,
    principles: [
      "Goodness of fit compares observed category counts to expected counts under a model",
      "Pearson's statistic Σ (O − E)² / E is large when mismatches are large",
      "Under H₀ the statistic is approximately χ² with df = k − 1 − (# estimated parameters)",
      "Expected counts should not be tiny or the χ² approximation suffers",
      "The test says whether the claimed probabilities are plausible — not which category is 'wrong' alone",
    ],
    objectives: [
      "Compute expected counts E_i = n p_i under a fully specified null",
      "Calculate the χ² statistic and choose df correctly",
      "Interpret a large χ² as evidence against the claimed distribution",
      "Apply the method to classic problems (fair die, claimed traffic mix, etc.)",
    ],
    why: "Is the die fair? Do customers split across plans as marketing claimed? Categorical models need a count-based stress test, not a t-test on labels.",
    story:
      "A bakery claims weekday sales are equally split across five bread types. You tally 100 loaves and see 40 of one type and only 5 of another. Under a true equal split you'd expect 20 each. The chi-square score adds up 'how embarrassing' each gap is, scaled by how big the expectation was — missing by 15 when you expected 20 hurts; missing by 15 when you expected 200 is less shocking.",
    idea: "Under H₀ each category has probability p_i, so expected count E_i = n p_i. Compare to observed O_i with **χ² = Σ (O_i − E_i)² / E_i**. Big total → data disagree with the claimed p_i's. The reference curve is a chi-square distribution whose df reflects how many free categories remain after constraints.",
    steps: [
      {
        title: "State the claimed probabilities",
        body: "H₀: the true category probabilities are p_1,…,p_k (sum to 1). H₁: not that distribution.",
      },
      {
        title: "Collect observed counts O_i",
        body: "One mutually exclusive category per observation; n = Σ O_i.",
      },
      {
        title: "Compute expected counts E_i = n p_i",
        body: "Check a rule of thumb: preferably all E_i ≥ 5 (or nearly so).",
      },
      {
        title: "Sum the Pearson contributions",
        body: "χ² = Σ (O_i − E_i)² / E_i. Categories with large |O−E| relative to √E dominate.",
      },
      {
        title: "Compare to χ²_df",
        body: "If probabilities are fully specified, df = k − 1. Get a p-value from the upper tail; large χ² rejects H₀.",
      },
    ],
    mathSimple:
      "For category i:\n\n- **E_i = n p_i** (expected count if H₀ is true).\n- Contribution = **(O_i − E_i)² / E_i** — squared error relative to expectation.\n- **χ² = Σ contributions**.\n- Approx law under H₀: **χ²_{k−1}** when p_i are completely specified.\n\nPlain language: divide by E_i so a miss of 10 when you expected 10 is huge, but a miss of 10 when you expected 1000 is mild.",
    walkthrough:
      "Fair six-sided die, n = 60 rolls. H₀: p_i = 1/6 each. Then E_i = 10 for every face.\n\nSuppose counts: 13, 8, 12, 7, 11, 9.\n\n1. Contributions: (13−10)²/10 = 0.9; (8−10)²/10 = 0.4; (12−10)²/10 = 0.4; (7−10)²/10 = 0.9; (11−10)²/10 = 0.1; (9−10)²/10 = 0.1.\n2. χ² = 0.9+0.4+0.4+0.9+0.1+0.1 = 2.8.\n3. df = 6 − 1 = 5. A χ²_5 value of 2.8 is not large (p is high).\n4. Conclusion: these counts are compatible with a fair die — we fail to reject H₀.",
    example:
      "A transit agency claims boarding shares 50%, 30%, 20% across three stations. In n = 200 riders you see 120, 50, 30. Expected: 100, 60, 40. χ² = (20)²/100 + (−10)²/60 + (−10)²/40 = 4 + 1.67 + 2.5 ≈ 8.17, df = 2. That is large enough to reject at 5% — the claimed mix does not fit.",
    example2:
      "If you estimate parameters from the same data (e.g. fitting a distribution family), subtract one df per estimated parameter. Example: testing normality with estimated mean and variance uses a smaller df than a fully specified normal. Forgetting that adjustment makes p-values too small.",
    labCue:
      "Use the **hypothesis** lab categorical mode: edit observed counts, watch expected bars, and see each category's contribution to χ² light up.",
    check: [
      "What is df for a fully specified 4-category null?",
      "Why divide by E_i rather than only summing (O−E)²?",
      "What goes wrong if many E_i are below 1?",
    ],
    practice: [
      {
        q: "n = 40, H₀ equal across 4 categories. Observed: 14, 10, 9, 7. Compute the four E_i and χ².",
        a: "E_i = 10 each. χ² = (16+0+1+9)/10 = 2.6. df = 3.",
      },
      {
        q: "True or false: a significant goodness-of-fit test tells you exactly which category caused the rejection.",
        a: "False. It says the overall vector of probabilities is incompatible. Cell contributions and residuals help you explore which categories stand out, but the global test alone is not a pinpoint diagnosis.",
      },
    ],
    formal:
      "For multinomial counts with probabilities p = (p_1,…,p_k), Pearson's X² = Σ (O_i − n p_i)²/(n p_i) converges in distribution to χ²_{k−1} under H₀ as n → ∞ (p_i fixed and positive). If p depends on a q-dimensional parameter estimated efficiently from the same sample, the limiting df becomes k − 1 − q under regularity conditions.",
    formulas:
      "- E_i = n p_i\n- χ² = Σ_i (O_i − E_i)² / E_i\n- df = k − 1 (− q if q parameters estimated)",
    derivation:
      "Multinomial counts are roughly multivariate normal for large n. The quadratic form that standardizes (O − E) using the multinomial covariance matrix simplifies algebraically to Σ (O_i − E_i)²/E_i. The covariance matrix has rank k − 1 because counts sum to n — hence k − 1 degrees of freedom when p is known.",
    pitfalls: [
      "Applying χ² with tiny expected counts without care",
      "Using the wrong df when parameters were estimated",
      "Treating multiple categories' data as if they were independent binomials without the multinomial constraint",
      "Cherry-picking which categories to include after seeing the data",
    ],
    interview:
      "I'd compute expected counts under the claimed distribution, check that expectations aren't tiny, report Pearson's χ² with correct df, and if significant, inspect standardized residuals to see which cells drive the misfit.",
    bridge:
      "Goodness of fit checks one categorical variable against a model. Independence tests ask whether two categorical variables move together in a table.",
  }),

  buildLesson({
    title: "Chi-Square Test for Independence",
    partLabel: PART,
    principles: [
      "A two-way table summarizes counts for two categorical variables",
      "Under independence, expected cell counts factor through row and column totals",
      "The same Pearson χ² form measures association",
      "df = (r − 1)(c − 1) for an r×c table",
      "Association is not causation — design still matters",
    ],
    objectives: [
      "Build the expected table under independence from the margins",
      "Compute χ² and df for an independence test",
      "Interpret a significant result as evidence of association",
      "Use residuals to see which cells drive the signal",
    ],
    why: "Does major associate with internship status? Device type with conversion? Independence testing is the categorical cousin of correlation — a first check that two factors are related in the sample beyond chance.",
    story:
      "You survey students: major (CS / Business / Other) vs internship (yes/no). If major and internship were independent, the 'yes' rate would be the same in every major — so expected yes-count in CS would be (CS total)×(overall yes rate). If CS students show far more internships than that product predicts, the independence story cracks.",
    idea: "H₀: the two variables are independent. Then **E_{ij} = (row i total)×(column j total) / n**. Compare to observed O_{ij} with χ² = Σ (O − E)²/E. Large χ² → reject independence. Degrees of freedom: once margins are fixed, only (r−1)(c−1) cells are free.",
    steps: [
      {
        title: "Form the r×c contingency table",
        body: "Rows = levels of A, columns = levels of B, entries = joint counts.",
      },
      {
        title: "Compute all margins",
        body: "Row totals R_i, column totals C_j, and grand total n.",
      },
      {
        title: "Fill expected counts",
        body: "E_{ij} = R_i C_j / n. Check that expectations are not mostly tiny.",
      },
      {
        title: "Compute χ² and df",
        body: "χ² = Σ_{i,j} (O_{ij} − E_{ij})² / E_{ij}, df = (r−1)(c−1).",
      },
      {
        title: "Conclude carefully",
        body: "Significant ⇒ association in the population (under random sampling). Then inspect which cells have large residuals. Do not leap to 'A causes B.'",
      },
    ],
    mathSimple:
      "Independence of categorical A and B means P(A=i, B=j) = P(A=i)P(B=j).\n\nEstimated under H₀ with margins:\n\n- **E_{ij} = R_i C_j / n**\n- **χ² = Σ (O_{ij} − E_{ij})² / E_{ij}**\n- **df = (r − 1)(c − 1)**\n\nA 2×2 table has df = 1 — only one cell is free once all margins are known.",
    walkthrough:
      "2×2 table (simplified):\n\n|  | Disease | No disease |\n| Smoke | 40 | 60 |\n| No smoke | 20 | 80 |\n\n1. Row totals 100, 100; column totals 60, 140; n = 200.\n2. E(smoke, disease) = 100·60/200 = 30; E(smoke, no) = 70; E(no, disease) = 30; E(no, no) = 70.\n3. χ² = (40−30)²/30 + (60−70)²/70 + (20−30)²/30 + (80−70)²/70 ≈ 3.33+1.43+3.33+1.43 ≈ 9.52.\n4. df = 1. p-value is small → reject independence: smoking status and disease status are associated in this sample.\n5. Still not automatic proof of causation without a stronger design.",
    example:
      "UX: device (mobile/desktop) vs converted (yes/no). Significant χ² means conversion rates differ by device beyond what independence predicts. Product next step: dig into rates and possible confounders (intent, page type), not only celebrate p < 0.05.",
    example2:
      "A 3×4 table has df = 2×3 = 6. If χ² is barely above the 5% critical value, association is mild relative to noise; look at effect sizes (e.g. rate differences) before making big decisions.",
    labCue:
      "Open a contingency heat view in the **hypothesis** / joint lab. Compare observed vs expected cells and watch χ² contributions concentrate in a few mismatched cells.",
    check: [
      "What is df for a 3×5 table?",
      "How do you get E_{ij} from the margins?",
      "Why doesn't significance alone prove causation?",
    ],
    practice: [
      {
        q: "Row totals 50 and 50; column totals 40 and 60; n = 100. What is E for the top-left cell?",
        a: "E = 50·40/100 = 20.",
      },
      {
        q: "A 2×2 test is significant. A manager says 'row causes column.' Your reply?",
        a: "The test shows association, not causation. Confounding, reverse causality, or selection could explain the table. Causal claims need design or stronger assumptions.",
      },
    ],
    formal:
      "Under independent multinomial (or product-multinomial) sampling and H₀ of independence, Pearson's statistic converges to χ²_{(r−1)(c−1)}. Expected counts use maximum likelihood estimates of the marginal probabilities under H₀. Standardized residuals (O−E)/√E help localize departures; for 2×2 tables an equivalent normal test on difference of proportions exists.",
    formulas:
      "- E_{ij} = R_i C_j / n\n- χ² = Σ_{i,j} (O_{ij} − E_{ij})² / E_{ij}\n- df = (r − 1)(c − 1)",
    derivation:
      "Under independence the joint probabilities factor. Estimating row and column probabilities from margins uses (r−1)+(c−1) free parameters (because each margin sums to 1), while an unrestricted table has rc − 1 free probabilities. The difference in free parameters is (rc − 1) − [(r−1)+(c−1)] = (r−1)(c−1), which becomes the χ² degrees of freedom.",
    pitfalls: [
      "Sparse cells / low expected counts (consider exact tests or collapsing levels)",
      "Overinterpreting association as causation",
      "Multiple tables tested without multiplicity control",
      "Forgetting that margins are fixed by design in some experiments (still OK, but interpret sampling scheme correctly)",
    ],
    interview:
      "I'd state H₀ independence, compute expected counts from margins, report χ² with (r−1)(c−1) df, then discuss practical rate differences and confounders — not stop at 'p small.'",
    bridge:
      "When the response is quantitative and there are three or more groups, comparing means shifts from χ² tables to one-way ANOVA.",
  }),

  buildLesson({
    title: "One-Way ANOVA",
    partLabel: PART,
    principles: [
      "One-way ANOVA compares means across k ≥ 3 groups in a single test",
      "It partitions total variability into between-group and within-group pieces",
      "F = MS_between / MS_within is large when group means separate more than noise justifies",
      "Classical assumptions: independent errors, roughly normal, similar variances",
      "A significant F says 'not all means equal' — not which pairs differ (post-hoc comes next)",
    ],
    objectives: [
      "State ANOVA hypotheses for k group means",
      "Explain between vs within sum of squares in words",
      "Interpret an F statistic and its p-value",
      "Explain why unchecked pairwise t-tests are a poor substitute",
    ],
    why: "Three teaching methods, four server configurations, five fertilizer levels — the question is often 'are any of these means different?' ANOVA answers that without naively running every pairwise t-test at α = 0.05.",
    story:
      "Three sections take the same exam. Section means are 70, 75, and 85. If every section is wildly spread from 40 to 100, those mean gaps might be noise. If each section is tightly clustered around its mean, the gaps look real. ANOVA is literally comparing 'spread of the group means' to 'spread inside groups.'",
    idea: "**Between-group** variation asks how far group means sit from the grand mean. **Within-group** variation asks how noisy students are inside a section. The **F ratio** is their mean-square versions. Large F → means differ more than within-noise suggests → reject H₀: all μ_i equal.",
    steps: [
      {
        title: "State hypotheses",
        body: "H₀: μ_1 = μ_2 = … = μ_k vs H₁: not all means equal.",
      },
      {
        title: "Compute group means and the grand mean",
        body: "ȳ_i for each group; ȳ for everyone pooled.",
      },
      {
        title: "Form SS_between and SS_within",
        body: "Between: weight squared gaps of group means from the grand mean. Within: sum squared gaps of individuals from their own group mean.",
      },
      {
        title: "Convert to mean squares and F",
        body: "MS_B = SS_B/(k−1), MS_W = SS_W/(n−k), F = MS_B/MS_W.",
      },
      {
        title: "Get the p-value from F_{k−1, n−k}",
        body: "If significant, plan pairwise follow-ups with multiplicity control (Tukey, etc.). If not, do not hunt pairs as if ANOVA never happened.",
      },
    ],
    mathSimple:
      "Think in averages of squared deviations:\n\n- **MS_between** ≈ how much group means disagree (per between df).\n- **MS_within** ≈ average within-group variance.\n- **F = MS_between / MS_within**.\n\nIf H₀ is true and assumptions hold, F should hover near 1 (up to sampling noise). Much larger than 1 suggests real mean separation.\n\nDegrees of freedom: **df_B = k − 1**, **df_W = n − k**.",
    walkthrough:
      "Three groups, n_i = 10 each (n = 30). Suppose means 70, 75, 85 and within each group s ≈ 5 (roughly).\n\n1. Grand mean ≈ 76.7.\n2. Between gaps are noticeable relative to within SD 5.\n3. F will be substantially above 1; p small → reject equal means.\n4. Next question for the instructor: is 85 different from 70 and 75, or are all three pairwise different? That needs a post-hoc procedure — ANOVA alone does not label the pairs.",
    example:
      "Exam means 70, 75, 85 with tiny within-section variance → significant F. Same means with huge within variance → non-significant F. The means did not change; the noise story did.",
    example2:
      "If you run three uncorrected pairwise t-tests at α = 0.05 each, the chance of at least one false positive under a global null is larger than 5%. ANOVA's single F-test keeps a single Type I error for the global claim 'any difference exists.'",
    labCue:
      "In the **hypothesis** lab, place three group clouds. Drag them apart and watch F rise; inflate within-group scatter and watch F fall.",
    check: [
      "What does MS stand for, in words?",
      "If F ≈ 1, what does that suggest?",
      "Why follow a significant ANOVA with careful pairwise comparisons?",
    ],
    practice: [
      {
        q: "k = 4 groups, n = 40 total. What are df_B and df_W for one-way ANOVA?",
        a: "df_B = 3, df_W = 36.",
      },
      {
        q: "ANOVA p = 0.40. A teammate still reports 'group 2 beats group 4, p = 0.04' from an unplanned pairwise t. What's wrong?",
        a: "The global test found no evidence of any mean difference; selectively reporting one uncorrected pairwise peek inflates false-positive risk and contradicts the pre-registered ANOVA logic.",
      },
    ],
    formal:
      "In the classical normal one-way model Y_{ij} = μ_i + ε_{ij} with i.i.d. N(0,σ²) errors, under H₀: μ_1=⋯=μ_k the ratio F = MS_B/MS_W follows F_{k−1,n−k}. The identity SST = SSB + SSW is the Pythagorean partition of total sum of squares into between and within components. Welch ANOVA relaxes equal-variance assumptions.",
    formulas:
      "- F = MS_B / MS_W\n- MS_B = SS_B / (k − 1),  MS_W = SS_W / (n − k)\n- Under H₀ (classical assumptions): F ~ F_{k−1, n−k}",
    derivation:
      "Project the data vector onto the space of group-mean fits versus the residual space. Under normality, the scaled lengths of those projections are independent chi-squares when means are equal; their ratio becomes F. Intuitively, SSB measures fit improvement from allowing separate means; SSW is leftover noise. Comparing them on a per-df basis yields the F test.",
    pitfalls: [
      "Ignoring clearly unequal variances across groups",
      "Declaring which means differ from F alone",
      "Running many pairwise t-tests without multiplicity control",
      "Using ANOVA on highly skewed data with small n without checking robustness",
    ],
    interview:
      "I'd say ANOVA tests a global equality of means by comparing between-group to within-group mean squares. Significant F triggers multiplicity-aware pairwise follow-ups; non-significant F means I don't go fishing for pairs.",
    bridge:
      "Part 7 decided claims about means and categories. Part 8 asks how two quantitative variables move together — correlation and regression.",
  }),
];
