import { buildLesson } from "./helper.mjs";

const PART = "Part 9: Additional Topics";

export const topics = [
  buildLesson({
    title: "Non-Parametric Tests",
    partLabel: PART,
    importance: "Recommended",
    principles: [
      "Non-parametric tests lean less on normal-population assumptions than classical t-tests",
      "Rank-based methods replace raw values with order information — more resistant to outliers",
      "Mann–Whitney (Wilcoxon rank-sum) compares two independent samples",
      "Wilcoxon signed-rank is the paired cousin of the paired t-test",
      "Robustness usually costs some power when normality was actually true",
    ],
    objectives: [
      "Recognize when skewed data, ordinal scores, or outliers make t-tests shaky",
      "Describe Mann–Whitney vs a two-sample t-test in plain language",
      "Describe Wilcoxon signed-rank vs a paired t-test",
      "State the robustness–power trade-off honestly",
    ],
    why: "Likert satisfaction scores, income with huge outliers, heavily skewed latency — the textbook normal curve is often a fantasy. Rank tests still let you ask 'does one group tend to score higher?' without pretending the data are Gaussian.",
    story:
      "Two apps collect 1–5 star ratings. Means of 4.1 vs 3.8 look tidy, but the scale is ordinal and the distribution is piled at 5s with a long left tail. A two-sample t-test quietly assumes interval scale and roughly normal sampling distributions. A Mann–Whitney test instead asks whether randomly picking one rating from App A tends to beat one from App B — a question that matches ordinal data better.",
    idea: "Sort the data and replace values with **ranks**. Then test whether one sample's ranks are systematically larger. You lose the exact 'difference of means in original units' interpretation, but you gain a procedure that does not need bell-shaped populations. Use Mann–Whitney for independent groups; use Wilcoxon signed-rank for paired differences.",
    steps: [
      {
        title: "Diagnose why a t-test is uncomfortable",
        body: "Skew, ordinal scale, small n with outliers, clear non-normal residuals — plot first.",
      },
      {
        title: "Identify the design",
        body: "Independent groups → Mann–Whitney / rank-sum. Paired / before-after → Wilcoxon signed-rank on differences.",
      },
      {
        title: "Rank the relevant numbers",
        body: "Independent: pool both samples and rank all values. Paired: rank the absolute differences, then attach signs.",
      },
      {
        title: "Compute the rank statistic and p-value",
        body: "Usually via software; the idea is 'are ranks surprisingly lopsided under the null of no systematic difference?'",
      },
      {
        title: "Interpret carefully",
        body: "Talk about stochastic dominance / tendency to score higher — not automatically a mean difference in original units.",
      },
    ],
    mathSimple:
      "**Mann–Whitney idea:** pool n₁+n₂ observations, assign ranks 1…N, sum ranks in group 1. Extremely large or small rank sums reject 'same distribution.'\n\n**Wilcoxon signed-rank idea:** form paired differences D_i, drop zeros, rank |D_i|, sum ranks of positive differences. Extreme sums reject 'symmetric around 0' / no systematic shift.\n\nPlain language: both procedures ask whether one side tends to outrank the other after throwing away fragile mean/variance assumptions.",
    walkthrough:
      "Independent samples (tiny toy): Group A scores 3, 5, 8; Group B scores 1, 2, 4.\n\n1. Pooled ordered values: 1,2,3,4,5,8 with ranks 1–6.\n2. Group A ranks: 3,5,8 → ranks 3,5,6; sum = 14.\n3. Group B ranks sum = 1+2+4 = 7.\n4. A looks systematically higher on ranks. With real n, software turns this imbalance into a p-value.\n5. Contrast: a single typo turning an 8 into 800 would wreck a mean-based t-test more than a rank test (the 800 still just gets the top rank).",
    example:
      "Customer satisfaction Likert scores between two checkout flows — Mann–Whitney is often more appropriate than a t-test on the numeric labels, especially with small samples and pile-ups at extremes.",
    example2:
      "Ten athletes: sprint time before vs after a new warm-up. Differences are skewed by one injury. Wilcoxon signed-rank on the differences is a safer default than a paired t unless you have a solid normal story for D_i.",
    labCue:
      "In the **hypothesis** lab, compare a t-test and a rank-based decision on the same skewed draws. Watch the t-result twitch when you spike one outlier, while the rank result moves less.",
    check: [
      "Name one situation where you'd prefer Mann–Whitney over a two-sample t.",
      "Which non-parametric test pairs with paired designs?",
      "Do non-parametric tests assume 'zero assumptions'? What do they still need?",
    ],
    practice: [
      {
        q: "You have two independent skewed salary samples with outliers. Which test family is a natural candidate?",
        a: "Mann–Whitney / Wilcoxon rank-sum (or a carefully interpreted median-based approach). A classical two-sample t on raw salaries is fragile here.",
      },
      {
        q: "True or false: non-parametric tests never require independent observations.",
        a: "False. Independence (or the stated design) still matters. 'Non-parametric' mainly relaxes distributional shape assumptions, not the need for a coherent sampling design.",
      },
    ],
    formal:
      "The Wilcoxon rank-sum / Mann–Whitney U tests H₀ that P(X>Y)=P(X<Y) (or identical continuous distributions) against stochastic dominance alternatives. The Wilcoxon signed-rank test targets symmetry about zero for paired differences under i.i.d. continuous assumptions. Exact null distributions come from combinatorial rank assignments; large-sample normal approximations with continuity corrections are standard. They are not assumption-free: independence, pairing structure, and (for signed-rank) symmetry under the null still matter.",
    formulas:
      "- Pool & rank for Mann–Whitney; U derived from rank sums\n- Signed-rank statistic = sum of ranks of positive differences\n- Software: wilcox.test / mannwhitneyu style APIs",
    derivation:
      "Under a continuous null of identical distributions, every ranking of the pooled sample is equally likely. Extreme concentration of high ranks in one group is therefore improbable — that combinatorial fact yields the null distribution of the rank-sum statistic without needing Gaussian densities. For signed ranks, under symmetry about zero each difference's sign is an independent fair coin attached to a fixed set of absolute ranks.",
    pitfalls: [
      "Thinking 'non-parametric' means 'no assumptions at all'",
      "Interpreting a significant rank test as a mean difference in original units without care",
      "Using rank tests with heavy discrete ties without tie corrections",
      "Tiny n → very discrete p-values (only a few possible significance levels)",
    ],
    interview:
      "I'd plot the data, and if normality/interval assumptions look bad, switch to Mann–Whitney or Wilcoxon signed-rank matching the design. I'd explain the hypothesis in 'tends to be larger' language and mention the power trade-off if data were truly normal.",
    bridge:
      "Rank tests stay in a one-or-two-sample world. Multiple linear regression extends the single-predictor line to many X's at once.",
  }),

  buildLesson({
    title: "Multiple Linear Regression Intro",
    partLabel: PART,
    importance: "Recommended",
    principles: [
      "MLR models E[Y|X] ≈ β₀ + β₁X₁ + … + β_p X_p",
      "Each slope is the association with Y after adjusting for the other predictors in the model",
      "Collinearity (predictors moving together) inflates slope SEs and muddies interpretation",
      "Residual diagnostics from SLR still apply — now in higher dimensions",
      "More predictors can raise R² while harming out-of-sample performance; watch adjusted R² / validation",
    ],
    objectives: [
      "Write a multiple linear regression model and interpret an adjusted slope",
      "Explain 'holding other variables fixed' as a model statement",
      "Recognize multicollinearity symptoms qualitatively",
      "Preview overfitting and why adjusted R² / test data matter",
    ],
    why: "Real outcomes have many drivers — salary from experience and education, latency from load and region, grades from hours and prior GPA. MLR is the first tool that adjusts one association for others.",
    story:
      "Ice cream sales and drowning both rise in summer. A naive regression of drownings on ice cream looks strong. Add temperature as a second predictor and the ice-cream slope often collapses — temperature was the confounder. Multiple regression is how 'holding temperature fixed' gets a concrete (model-based) meaning.",
    idea: "Fit a hyperplane instead of a line. The coefficient **β_j** answers: 'If X_j goes up by one unit while the other predictors stay the same (in the model), how does mean Y change?' That 'holding fixed' is mathematical adjustment — powerful, but only as honest as the model and the data support.",
    steps: [
      {
        title: "List scientifically motivated predictors",
        body: "Start from domain knowledge, not a kitchen-sink dump of every column.",
      },
      {
        title: "Fit least squares in software",
        body: "Minimize Σ(y − β₀ − Σ β_j x_j)². Inspect coefficients, SEs, and R² / adjusted R².",
      },
      {
        title: "Interpret each slope with the holding-fixed phrase",
        body: "Include units and avoid automatic causation language.",
      },
      {
        title: "Check residuals and collinearity",
        body: "Residual-vs-fitted still rules. If two X's are near-duplicates, SEs explode and signs can flip.",
      },
      {
        title: "Validate",
        body: "Prefer a holdout set or cross-validation over celebrating in-sample R² alone.",
      },
    ],
    mathSimple:
      "Model: **Y = β₀ + β₁X₁ + … + β_p X_p + ε**.\n\n- **β_j**: change in mean Y per +1 X_j, holding other X's fixed in the model.\n- Matrix slogan (optional): **β̂ = (XᵀX)⁻¹ Xᵀ y** when X has full column rank.\n- **Adjusted R²** penalizes adding predictors that do not help enough.\n\nGentle warning: 'holding fixed' is not always a real-world dial you can turn — some variables cannot move independently (collinearity / structural links).",
    walkthrough:
      "Salary ~ β₀ + β₁ Experience + β₂ EducationYears.\n\n1. Suppose β̂₁ = 2.5 ($k per year experience), β̂₂ = 4.0 ($k per education year).\n2. Interpretation of β̂₁: among people with the same education years in this model, +1 year experience associates with +$2.5k salary.\n3. If Experience and Education are highly correlated, SE(β̂₁) may be large — we cannot cleanly separate their roles.\n4. Residual plot still must look patternless; a curve in residuals means the linear form is wrong even with two predictors.\n5. Adding 20 weak predictors might raise R² slightly but adjusted R² / test error can worsen.",
    example:
      "Marketing: Revenue ~ Spend + SeasonalityIndex + CompetitorPrice. The Spend coefficient is 'association with revenue adjusting for season and competitor price' — closer to an apples-to-apples read than a simple regression on Spend alone.",
    example2:
      "If X₁ = height in inches and X₂ = height in cm, XᵀX is nearly singular. Software may drop a column or produce huge unstable coefficients — classic collinearity pathology.",
    labCue:
      "Use the **regression** lab's multi-predictor notes / residual checks. Mentally add a second predictor correlated with the first and predict that both SEs grow.",
    check: [
      "What does 'holding other predictors fixed' mean in MLR?",
      "Name one symptom of multicollinearity.",
      "Why can R² increase even when a new predictor is useless?",
    ],
    practice: [
      {
        q: "In Y ~ X₁ + X₂, β̂₁ = −3. Someone says 'X₁ causes Y to fall by 3.' Fix the sentence.",
        a: "Better: 'Holding X₂ fixed in this fitted model, a one-unit higher X₁ associates with a 3-unit lower Y on average.' Causal language needs stronger assumptions/design.",
      },
      {
        q: "Why might adjusted R² fall after adding a predictor even if R² rose?",
        a: "Adjusted R² applies a penalty for extra parameters; if the new predictor explains too little, the penalty wins and adjusted R² decreases.",
      },
    ],
    formal:
      "In the linear model y = Xβ + ε with E[ε|X]=0, the OLS estimator minimizes ‖y−Xβ‖². When X has full rank, β̂=(XᵀX)⁻¹Xᵀy is unique. Coefficient β_j equals the coefficient from regressing y on the residualized X_j after projecting out the other columns (Frisch–Waugh–Lovell). Multicollinearity corresponds to near-linear dependence among columns, inflating diagonal entries of (XᵀX)⁻¹.",
    formulas:
      "- ŷ = β̂₀ + Σ_j β̂_j x_j\n- β̂ = (XᵀX)⁻¹ Xᵀ y  (full rank)\n- Adjusted R² = 1 − (1−R²)(n−1)/(n−p−1)",
    derivation:
      "The normal equations XᵀX β = Xᵀy arise from setting the gradient of ‖y−Xβ‖² to zero. Geometrically, residuals are orthogonal to each column of X. Frisch–Waugh–Lovell shows each β_j is a simple regression slope of y on X_j after removing the linear effects of the other predictors — the algebraic heart of 'holding fixed.'",
    pitfalls: [
      "Kitchen-sink predictor lists and invisible overfitting",
      "Causal claims from observational MLR without a design story",
      "Ignoring collinearity when interpreting signs/magnitudes",
      "Skipping residual plots because 'multiple regression is advanced'",
    ],
    interview:
      "I'd motivate predictors, interpret slopes as adjusted associations, check residuals and VIF/collinearity, and evaluate predictive claims with holdout error — not only R².",
    bridge:
      "Frequentist regression gives point estimates and CIs. Bayesian statistics gives a full posterior distribution for parameters after combining prior beliefs with the likelihood.",
  }),

  buildLesson({
    title: "Bayesian Statistics Intro",
    partLabel: PART,
    importance: "Recommended",
    principles: [
      "Bayesian inference treats unknown parameters as having distributions — updated by data",
      "Posterior ∝ likelihood × prior (then normalize)",
      "Beta–Binomial is the friendliest conjugate example for a coin / conversion rate",
      "A credible interval summarizes posterior probability content — philosophically distinct from a frequentist CI",
      "Priors should be declared; strong hidden priors can dominate small samples",
    ],
    objectives: [
      "Update a Beta prior with Bernoulli/Binomial data to a Beta posterior",
      "Distinguish prior, likelihood, posterior, and posterior predictive ideas",
      "State Bayes' theorem for parameters in words",
      "Read a credible interval without mixing frequentist CI language",
    ],
    why: "Modern A/B tooling, recommendation systems, and scientific modeling increasingly speak Bayesian. Even if you stay frequentist day-to-day, you need to read posterior summaries fluently.",
    story:
      "You think a new onboarding flow converts somewhere around 10%, but you are unsure. That belief is a prior distribution over p. After 100 users with 18 conversions, you reweight every possible p by how well it explains 18/100, then renormalize. The new bump — the posterior — is your updated belief. Tomorrow's traffic forecast uses that posterior, not the original hunch alone.",
    idea: "Start with a **prior** π(θ). Multiply by the **likelihood** f(data|θ) — how well each θ explains what you saw. Renormalize to get the **posterior** π(θ|data). Conjugate pairs (like Beta prior with Binomial data) make the posterior stay in the same family with simple algebra.",
    steps: [
      {
        title: "Name the parameter and choose a prior",
        body: "For a proportion p, a Beta(α,β) prior is a flexible choice on (0,1).",
      },
      {
        title: "Write the likelihood for the observed data",
        body: "Binomial/Bernoulli: data enter as successes and failures.",
      },
      {
        title: "Multiply and recognize the posterior",
        body: "Beta(α,β) + s successes and f failures → Beta(α+s, β+f).",
      },
      {
        title: "Summarize the posterior",
        body: "Posterior mean, mode (MAP), and a credible interval (e.g. central 95%).",
      },
      {
        title: "Use it carefully",
        body: "Report the prior. With tiny data, prior choice matters a lot; with lots of data, likelihood dominates for well-behaved models.",
      },
    ],
    mathSimple:
      "Bayes for parameters:\n\n**π(θ|x) = f(x|θ) π(θ) / m(x)** where m(x) = ∫ f(x|θ)π(θ)dθ.\n\nBeta–Binomial update:\n\n- Prior **p ~ Beta(α, β)**\n- Data: s successes, f failures\n- Posterior **p|data ~ Beta(α+s, β+f)**\n- Posterior mean **(α+s)/(α+β+s+f)**\n\nPlain language: α and β act like prior pseudo-counts of success and failure.",
    walkthrough:
      "Prior Beta(1,1) — uniform on p (one vague 'success' and one 'failure' of prior weight).\n\n1. Observe 7 successes and 3 failures.\n2. Posterior = Beta(1+7, 1+3) = Beta(8,4).\n3. Posterior mean = 8/(8+4) = 2/3 ≈ 0.67.\n4. MLE was 7/10 = 0.70; the posterior mean shrinks slightly toward the prior mean 0.5.\n5. A 95% credible interval is a central posterior interval for p — '95% posterior probability that p lies here' under this model/prior — not identical in meaning to a 95% confidence interval.",
    example:
      "A/B test with a skeptical prior centered near 'no lift.' After data, the posterior on lift may still put substantial mass near 0 even if the MLE looks positive — a feature when false launches are costly.",
    example2:
      "Strong prior Beta(50,50) vs weak Beta(1,1) with only 10 observations: the strong prior barely moves; the weak prior chases the data. Always ask how much information the prior smuggles in.",
    labCue:
      "Open the **bayes** lab: animate a Beta prior updating to a posterior as coin flips arrive. Compare weak vs strong priors on the same sequence.",
    check: [
      "What does 'conjugate prior' mean in one sentence?",
      "How does Beta(α,β) update after s successes and f failures?",
      "Name one philosophical difference between credible and confidence intervals.",
    ],
    practice: [
      {
        q: "Prior Beta(2,2); data 3 successes, 1 failure. What is the posterior?",
        a: "Beta(5,3). Posterior mean 5/8 = 0.625.",
      },
      {
        q: "True or false: the posterior mean always equals the MLE.",
        a: "False. With informative priors or small n they differ; as n→∞ the likelihood usually dominates and they get close under regularity.",
      },
    ],
    formal:
      "Given prior π(θ) and sampling model f(x|θ), the posterior is π(θ|x)=f(x|θ)π(θ)/m(x). A 100(1−α)% credible set C(x) satisfies P(θ∈C(x)|x)≥1−α. MAP estimation maximizes π(θ|x); the posterior mean minimizes posterior squared error. Conjugacy means the posterior stays in the same family as the prior for a given likelihood.",
    formulas:
      "- π(θ|x) ∝ f(x|θ) π(θ)\n- Beta–Binomial: Beta(α+s, β+f)\n- MAP = mode of the posterior",
    derivation:
      "Bayes' theorem is the definition of conditional probability applied to (θ, data). For Beta(α,β) prior, π(p)∝p^{α−1}(1−p)^{β−1}. Multiplying by a Binomial likelihood ∝ p^s (1−p)^f yields ∝ p^{α+s−1}(1−p)^{β+f−1}, which is exactly Beta(α+s,β+f) after normalization — the conjugate miracle that keeps updates algebraic.",
    pitfalls: [
      "Hiding strong priors that drive the conclusion",
      "Mixing credible-interval language with frequentist CI coverage claims",
      "Using an absurd prior support (e.g. forbidding realistic θ values)",
      "Forgetting computational realities — conjugate toys are easy; general posteriors need MCMC/VI",
    ],
    interview:
      "I'd state prior and likelihood, show the Beta–Binomial update if relevant, summarize with posterior mean/credible interval, and explicitly separate Bayesian probability-from-belief language from frequentist long-run coverage language.",
    bridge:
      "When formulas for SEs are painful, bootstrapping resamples the sample itself to approximate sampling uncertainty — a computational cousin to classical inference.",
  }),

  buildLesson({
    title: "Bootstrapping and Resampling",
    partLabel: PART,
    importance: "Recommended",
    principles: [
      "The bootstrap resamples the observed sample with replacement to mimic new samples from the population",
      "The spread of a statistic across bootstrap replicates approximates its sampling SE",
      "Percentile bootstrap CIs are available for awkward statistics (median, ratios, …)",
      "Bootstrap still assumes the original sample represents the data-generating process",
      "Dependent data (time series, clusters) need specialized resampling — not naive i.i.d. draws",
    ],
    objectives: [
      "Describe the nonparametric bootstrap algorithm step by step",
      "Build a percentile bootstrap confidence interval",
      "Know when bootstrap shines vs when it struggles (tiny n, dependence)",
      "Contrast bootstrap uncertainty with parametric SE formulas",
    ],
    why: "Need a CI for a median, a fancy engagement ratio, or a trimmed mean? Classical formulas may not exist or may be ugly. Bootstrapping lets the computer approximate the sampling distribution from the sample you already have.",
    story:
      "You have 40 salaries and care about the median — resistant to CEO outliers. There is no simple t-interval for the median in your notes. So you pretend the 40 salaries are a mini-population: draw 40 with replacement, recompute the median, and repeat 2000 times. The middle 95% of those bootstrap medians is a percentile CI — a data-driven uncertainty band.",
    idea: "Treat the empirical distribution of the sample as a stand-in for the true population distribution. **Resample with replacement**, recompute θ̂*, and use the cloud of θ̂* values as an approximate sampling distribution of θ̂. The SD of that cloud estimates SE; percentiles estimate a CI.",
    steps: [
      {
        title: "Start from your real sample of size n",
        body: "This is the only data — protect it; don't 'bootstrap' after peeking until a desired interval appears.",
      },
      {
        title: "Draw a bootstrap sample",
        body: "Sample n observations **with replacement** from the original n.",
      },
      {
        title: "Compute the statistic θ̂* on that resample",
        body: "Mean, median, slope, ratio — whatever you care about.",
      },
      {
        title: "Repeat B times (often 1000–10000)",
        body: "Store θ̂*_1,…,θ̂*_B. Larger B smooths Monte Carlo noise in the CI endpoints.",
      },
      {
        title: "Form SE* or a percentile CI",
        body: "SE* ≈ SD of the θ̂* values. 95% percentile CI ≈ 2.5th and 97.5th percentiles of θ̂*.",
      },
    ],
    mathSimple:
      "Algorithm:\n\n1. For b = 1…B: draw (X*_1,…,X*_n) with replacement from the sample; compute θ̂*(b).\n2. **SE\\*** ≈ standard deviation of {θ̂*(b)}.\n3. **Percentile CI:** [quantile_{α/2}, quantile_{1−α/2}] of {θ̂*(b)}.\n\nPlain language: if redrawing from our sample makes the statistic dance a lot, we should report wide uncertainty.",
    walkthrough:
      "Sample of 5 values (tiny for teaching): 2, 3, 3, 4, 10. Statistic = median.\n\n1. One bootstrap draw might be 3,10,3,2,3 → median 3.\n2. Another might be 10,10,4,10,3 → median 10.\n3. After many draws, the histogram of bootstrap medians shows uncertainty driven partly by whether the 10 is over/under-sampled.\n4. With n=5 the bootstrap is unstable — a warning that B cannot fix a tiny sample.\n5. With n=40 salaries the same recipe becomes much more trustworthy for a median CI.",
    example:
      "Bootstrap the mean of 100 i.i.d. observations: the bootstrap SE should nearly match s/√n — a sanity check that your resampling code works before you trust it on a fancier metric.",
    example2:
      "Time-series returns are dependent. Naive i.i.d. bootstrap breaks autocorrelation and understates uncertainty. Use a block bootstrap or another dependence-aware method instead.",
    labCue:
      "Open the **bootstrap** lab: animate resamples and watch the bootstrap distribution of the mean or median form. Toggle B and see CI endpoints settle.",
    check: [
      "With or without replacement for the usual nonparametric bootstrap?",
      "What does B control?",
      "Why can bootstrapping a sample of size 5 be misleading even with B = 100000?",
    ],
    practice: [
      {
        q: "Describe one bootstrap replicate for n = 4 observations when estimating the mean.",
        a: "Draw 4 indices with replacement from {1,2,3,4}, average those sampled values — that average is one θ̂*.",
      },
      {
        q: "You need a 90% percentile CI from bootstrap replicates. Which percentiles?",
        a: "The 5th and 95th percentiles of the θ̂* list (central 90%).",
      },
    ],
    formal:
      "The nonparametric bootstrap approximates the sampling distribution of T(F̂_n) under the empirical distribution F̂_n by Monte Carlo resampling. Consistency holds for many smooth statistics under i.i.d. sampling as n→∞, but fails for some non-smooth functionals and in dependent settings without modification. Percentile intervals are simple; bias-corrected and accelerated (BCa) intervals improve coverage in many problems.",
    formulas:
      "- SE* ≈ SD{θ̂*(b) : b=1..B}\n- Percentile CI: [θ̂*_{α/2}, θ̂*_{1−α/2}]\n- Draw size-n resamples **with replacement**",
    derivation:
      "If the true sampling distribution of θ̂ = T(F_n) is close to the distribution of T(F*_n) when F*_n is drawn from F̂_n, then resampling plug-in approximates the unknown law of θ̂. This 'bootstrap principle' replaces an integral over the unknown F with an average over draws from the empirical F̂_n — justified asymptotically for many T by empirical-process arguments.",
    pitfalls: [
      "Bootstrapping tiny samples and trusting precise CI endpoints",
      "Naive bootstrap on clustered or time-dependent data",
      "B too small → noisy percentile estimates",
      "Treating bootstrap CIs as magic immunity from bias in the original sampling design",
    ],
    interview:
      "I'd explain resample-with-replacement, recomputing the statistic B times, then percentile CI or bootstrap SE. I'd mention i.i.d. limitations and when I'd switch to block bootstrap or parametric SEs.",
    bridge:
      "You now have the Part 9 toolkit: rank-based robustness, multi-predictor adjustment, Bayesian updating, and computational resampling — extensions that sit on top of the core MATH 270 inference habits.",
  }),
];
