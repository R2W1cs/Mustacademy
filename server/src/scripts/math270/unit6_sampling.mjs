import { buildLesson } from "./helper.mjs";

const PART = "Part 6: Sampling and Estimation";

export const topics = [
  buildLesson({
    title: "Populations and Samples",
    partLabel: PART,
    principles: [
      "A population is the full set of units you care about; a sample is the observed subset",
      "Parameters describe populations; statistics describe samples",
      "Random sampling is what justifies probability models for statistics",
      "Bias often begins with how you sample, not only with which formula you use later",
    ],
    objectives: [
      "Define population, sample, parameter, and statistic with clear examples",
      "Spot biased sampling designs (convenience, volunteer, survivorship)",
      "Explain why randomness in sampling matters for inference",
      "State the inference goal: learn parameters from statistics",
    ],
    why: "You almost never see every student, every packet, or every customer. Statistics exists because samples are cheaper than censuses — but only careful sampling lets you generalize. Confusing the population with the sample, or a parameter with a statistic, is the root of many wrong conclusions.",
    story: "You want the mean GPA of all CS majors at your university (population). Surveying every major is hard, so you draw 80 students (sample). The unknown true mean GPA μ is a parameter. The average of the 80 surveyed GPAs, x̄, is a statistic — random before you look, fixed afterward. If you only survey students in the library at midnight, x̄ may systematically miss the truth even with a huge n.",
    idea: "**Parameters** (μ, σ, p, …) are fixed unknown numbers about the population. **Statistics** (x̄, s, p̂, …) are computed from the sample and inherit randomness from sampling. Inference uses the sampling distribution of a statistic to say something about a parameter.",
    steps: [
      {
        title: "Name the population precisely",
        body: "Who or what is in scope, and when? 'Users' is vague; 'active accounts in March 2026 on platform X' is actionable. A wrong population definition makes even a perfect sample answer the wrong question.",
      },
      {
        title: "Describe the sampling plan",
        body: "Simple random sample? Stratified? Cluster? Convenience? Voluntary response? Write how units enter the sample. Random designs support probability statements; convenience samples mostly support cautionary tales.",
      },
      {
        title: "Separate parameters from statistics",
        body: "Ask: is this quantity knowable only from the whole population (parameter) or computed from the observed data (statistic)? Label them with different symbols: μ vs x̄, p vs p̂.",
      },
      {
        title: "Hunt for bias sources",
        body: "Undercoverage, nonresponse, volunteer enthusiasm, survivorship (only looking at successes), and time-of-day effects all shift statistics away from parameters systematically.",
      },
      {
        title: "State the inferential hope",
        body: "Under a random model, the statistic is a random variable aimed at the parameter. Later lessons quantify that aim with bias, variance, and confidence intervals.",
      },
    ],
    mathSimple: "Think of the population as a giant urn of numbers. A random sample pulls n slips. A parameter is a property of the whole urn (like the average of every slip). A statistic is a property of the slips you actually drew. Draw again, and the statistic changes — that variability is the sampling distribution.",
    walkthrough: "Population: N=5000 students, true mean study hours μ=12 (unknown in real life). Sample n=50 under SRS. One sample might give x̄=11.4; another 12.7. Both are statistics. The parameter μ=12 never changes just because you resampled. If you only sample students leaving the gym, you might repeatedly get x̄≈14 — biased sampling, not unlucky chance.",
    example: "All MUST CS students = population; 80 surveyed GPAs = sample; mean GPA μ is a parameter; sample mean x̄ is a statistic. The sample proportion of women among the 80 estimates the population proportion p.",
    example2: "A website A/B test: population = future users who could see either variant; sample = users during the experiment window. The true lift in click rate is a parameter; the observed difference in click rates is a statistic. Users who opt into a beta program may not represent the population — selection bias.",
    labCue: "Open the **sampling** lab. Draw random subsets from a finite population urn and compare each sample mean to the known μ. Then simulate a biased draw rule and watch the sample means miss μ systematically.",
    check: [
      "Is x̄ a parameter or a statistic?",
      "Why can a large convenience sample still be misleading?",
      "What does SRS stand for, in words?",
    ],
    practice: [
      {
        q: "Classify each as parameter or statistic: (i) true unemployment rate in a country this month; (ii) unemployment rate in a poll of 2000 adults.",
        a: "(i) parameter (ii) statistic (an estimate of the parameter).",
      },
      {
        q: "A survey texts only people who posted in a Discord channel. Name one bias risk.",
        a: "Coverage/volunteer bias: Discord-active members may differ systematically from the target population (more engaged, younger, etc.).",
      },
    ],
    formal: "A finite population is a set of N units with values {x_1,…,x_N}; a parameter is a function of that set (e.g. μ=(1/N)Σ x_i). A sample of size n can be modeled as random variables X_1,…,X_n (with or without replacement). A statistic is a measurable function T(X_1,…,X_n).",
    formulas: "- Parameter θ: property of the population\n- Estimator θ̂=T(sample): a statistic used to guess θ\n- Estimate: the numerical value of θ̂ after data are seen",
    derivation: "Once a probability measure is placed on samples (e.g. each subset of size n equally likely under SRS without replacement), every statistic becomes a random variable and notions like E[θ̂] and Var(θ̂) are well-defined. That measure is what 'random sampling' buys you.",
    pitfalls: [
      "Volunteer and convenience samples treated as if SRS",
      "Survivorship bias (analyzing only successes)",
      "Confusing a census with a sample — or vice versa",
      "Using n large as a cure for selection bias (it is not)",
    ],
    interview: "Define population vs sample and parameter vs statistic in one breath, then say inference requires a sampling model — usually random sampling — or else uncertainty statements are theater.",
    bridge: "If a statistic is random across samples, it has a distribution — the sampling distribution — which is the next lesson's focus.",
  }),

  buildLesson({
    title: "Sampling Distributions",
    partLabel: PART,
    principles: [
      "A statistic has its own distribution across repeated samples — its sampling distribution",
      "For i.i.d. draws, X̄ centers at μ with standard error σ/√n",
      "A sample proportion p̂ has mean p and variance p(1−p)/n",
      "The CLT approximates many sampling distributions for large n",
    ],
    objectives: [
      "Define sampling distribution in operational language (repeat the sample)",
      "State means and SEs for X̄ and p̂ under i.i.d. sampling",
      "Relate SE to precision and to sample size",
      "Simulate the idea of many samples mentally and in the lab",
    ],
    why: "A single sample mean is just one number. Inference uncertainty comes from imagining the cloud of means you would get if you could repeat the study. That cloud is the sampling distribution — the bridge from data to confidence intervals and tests.",
    story: "Every Friday you survey 40 random users and compute average satisfaction. Plotting a year of those averages builds an empirical sampling distribution. It should sit near the population mean with spread about σ/√40. One unlucky Friday does not redefine the product — the SE tells you how much Friday-to-Friday bounce to expect.",
    idea: "Fix a population and a sample size n. Draw a sample, compute a statistic T, put T back, repeat forever. The histogram of T values is the **sampling distribution** of T. For T=X̄ with i.i.d. draws: mean μ, SD (standard error) σ/√n.",
    steps: [
      {
        title: "Fix population, statistic, and n",
        body: "Be explicit: what is drawn, how, and what T you compute (mean, proportion, median, …). Different statistics have different sampling distributions.",
      },
      {
        title: "Find the center E[T]",
        body: "For X̄ under i.i.d. sampling, E[X̄]=μ. For p̂, E[p̂]=p. If E[T]=θ, we call T unbiased for θ (next lessons).",
      },
      {
        title: "Find the spread (SE)",
        body: "SE(X̄)=σ/√n, SE(p̂)=√(p(1−p)/n). Quadrupling n halves the SE. That is the precision–cost tradeoff in study design.",
      },
      {
        title: "Approximate the shape",
        body: "Exact shapes can be messy. For large n, CLT says X̄ and p̂ are approximately normal with the mean and SE above. For normal populations, X̄ is exactly normal for any n.",
      },
      {
        title: "Use the sampling distribution to judge unusual values",
        body: "An observed x̄ far from μ in SE units is surprising under that μ — the seed of testing and of CI logic.",
      },
    ],
    mathSimple: "One data point wanders with SD σ. An average of n independent points wanders with SD σ/√n because independent noises partially cancel. The sampling distribution is simply 'how that average wanders across imaginary repeats.'",
    walkthrough: "Population σ=10, n=25 ⇒ SE(X̄)=10/5=2. If μ=80, then X̄ is often between 76 and 84 (roughly μ±2 SE under normality). For a proportion with p=0.5 and n=100, SE=√(0.25/100)=0.05, so p̂ commonly falls in about 0.40 to 0.60.",
    example: "σ=10, n=25 ⇒ SE(X̄)=2. Larger n tightens the sampling distribution of the mean: n=100 ⇒ SE=1.",
    example2: "Binary satisfaction (like/dislike) with true p=0.7, n=200. SE(p̂)=√(0.7·0.3/200)=√0.00105≈0.032. Seeing p̂=0.60 is about (0.60−0.70)/0.032≈−3.1 SE — unusual if p really is 0.7.",
    labCue: "In the **sampling** lab, animate many samples of fixed n and histogram the means. Increase n and watch the histogram of means squeeze toward μ. Compare to the histogram of single observations, which does not squeeze.",
    check: [
      "How does SE of X̄ differ from the SD of one observation?",
      "What happens to SE when n is multiplied by 4?",
      "Why is the sampling distribution not something you see in a single dataset without resampling ideas?",
    ],
    practice: [
      {
        q: "i.i.d. with σ=8, n=64. Find SE(X̄). If μ=50, approximate P(X̄>52) via CLT.",
        a: "SE=8/8=1. P(X̄>52)≈1−Φ(2)≈0.0228.",
      },
      {
        q: "For p̂ with n=400 and p=0.25, find SE(p̂).",
        a: "SE=√(0.25·0.75/400)=√(0.1875/400)=√0.00046875≈0.0217.",
      },
    ],
    formal: "The sampling distribution of T_n=T(X_1,…,X_n) is the pushforward law of the sample measure under T. For i.i.d. square-integrable X_i: E[X̄]=μ, Var(X̄)=σ²/n. For i.i.d. Bernoulli(p): E[p̂]=p, Var(p̂)=p(1−p)/n. CLT: √n(X̄−μ)/σ ⇒ N(0,1).",
    formulas: "- SE(X̄)=σ/√n\n- SE(p̂)=√(p(1−p)/n)\n- E[X̄]=μ, E[p̂]=p\n- X̄ ≈ N(μ, σ²/n) for large n",
    derivation: "Var(X̄)=Var(Σ X_i / n)=(1/n²)Σ Var(X_i)=σ²/n under i.i.d. finite variance. For p̂=X̄ with Bernoulli X_i, plug in σ²=p(1−p). Normal approximations are CLT; exact normality of X̄ holds when each X_i is normal.",
    pitfalls: [
      "Using σ instead of σ/√n when discussing uncertainty of the mean",
      "Ignoring dependence (clustered samples have larger true SEs)",
      "Treating the histogram of the sample itself as the sampling distribution of X̄",
      "Using √(p̂(1−p̂)/n) as if it were the true SE without noting p is unknown (estimation comes next)",
    ],
    interview: "Define sampling distribution as the distribution of a statistic across repeated samples, quote SE(X̄)=σ/√n, and connect to CLT for the approximate shape.",
    bridge: "A good statistic used as a guess for a parameter is a point estimator — we now judge estimators by bias, variance, and MSE.",
  }),

  buildLesson({
    title: "Point Estimation",
    partLabel: PART,
    principles: [
      "A point estimator gives a single-number guess θ̂ of an unknown parameter θ",
      "Unbiasedness means E[θ̂]=θ for every θ",
      "Consistency means θ̂ converges to θ as n→∞",
      "Efficiency compares variances among competing unbiased estimators; MSE trades bias and variance",
    ],
    objectives: [
      "Define bias, variance, and MSE of an estimator",
      "Verify unbiasedness for X̄ and p̂ in standard models",
      "Explain consistency via the LLN",
      "Discuss bias–variance tradeoffs qualitatively",
    ],
    why: "Every dashboard metric is a point estimate of something. Knowing whether that something is unbiased, noisy, or inconsistent separates trustworthy metrics from comforting fiction. Point estimation vocabulary (bias, MSE, efficiency) is how statisticians grade estimators before building intervals.",
    story: "Two engineers estimate average latency. Alice uses the sample mean x̄. Bob drops the largest 10% of times 'as outliers' and averages the rest. Bob's number is often lower — possibly biased downward if spikes are real. Alice's estimator is noisier on small n but unbiased under i.i.d. sampling. MSE asks which error — bias or variance — hurts more for the decision at hand.",
    idea: "An **estimator** is a rule (a statistic) that produces a guess. **Bias**=E[θ̂]−θ. **MSE**=E[(θ̂−θ)²]=Var(θ̂)+bias². Unbiased + vanishing variance ⇒ consistency (roughly). X̄ and p̂ are classic unbiased estimators of μ and p under i.i.d. sampling.",
    steps: [
      {
        title: "Specify θ and the estimator θ̂",
        body: "Write clearly what is unknown and what formula you use on the sample. 'The mean' is ambiguous — population mean vs sample mean.",
      },
      {
        title: "Compute or argue E[θ̂]",
        body: "If E[θ̂]=θ for all θ, the estimator is unbiased. Linearity often makes this easy for means and proportions.",
      },
      {
        title: "Assess variance / SE",
        body: "Among unbiased estimators, smaller variance is better (more efficient). Report SE when possible.",
      },
      {
        title: "Form MSE if bias is present",
        body: "MSE=Var+bias². A slightly biased estimator with much smaller variance can beat an unbiased one for finite n — common in regularization and smoothing.",
      },
      {
        title: "Check consistency as n grows",
        body: "Does θ̂ settle at θ? LLN gives consistency of X̄ and p̂ under standard assumptions.",
      },
    ],
    mathSimple: "Unbiasedness says 'correct on average across repeated samples.' Low variance says 'does not bounce too much.' MSE says 'average squared distance from the truth,' combining both. Consistency says 'with enough data, you get arbitrarily close.'",
    walkthrough: "X_i i.i.d. with mean μ and variance σ². θ̂=X̄: E[X̄]=μ (unbiased), Var=σ²/n, MSE=σ²/n. For Bernoulli, p̂ has MSE=p(1−p)/n. Compare to a silly estimator θ̂=X_1 (first observation only): still unbiased for μ, but Var=σ² — n times worse MSE than X̄.",
    example: "For i.i.d. data with finite μ, X̄ is unbiased for μ and consistent by LLN. For Bernoulli trials, p̂=X̄ is unbiased for p.",
    example2: "Estimator of σ²: the sample variance with divisor n−1 is unbiased for σ² in the i.i.d. finite-variance setting (with the usual caveats). Using divisor n is slightly biased downward but sometimes has smaller MSE — a classic bias–variance vignette.",
    labCue: "In the **sampling** lab, compare the average of many sample means to μ (checking unbiasedness empirically) and watch the scatter of those means shrink with n (variance / consistency).",
    check: [
      "If bias=0, is MSE equal to variance?",
      "Can a biased estimator be consistent?",
      "Why is X_1 usually a worse estimator of μ than X̄?",
    ],
    practice: [
      {
        q: "An estimator has bias 2 and variance 5. What is its MSE?",
        a: "MSE=5+2²=9.",
      },
      {
        q: "True or false: unbiasedness of X̄ requires normality of the data.",
        a: "False — linearity of expectation gives E[X̄]=μ under i.i.d. sampling with finite mean, without normality.",
      },
    ],
    formal: "Bias(θ̂)=E_θ[θ̂]−θ. MSE(θ̂)=E_θ[(θ̂−θ)²]=Var_θ(θ̂)+[Bias(θ̂)]². Consistency: θ̂_n →_P θ for each θ. Efficiency comparisons often use asymptotic variance among regular estimators (Cramér–Rao / asymptotic normality).",
    formulas: "- Bias=E[θ̂]−θ\n- MSE=Var(θ̂)+bias²\n- For X̄: Bias=0, MSE=σ²/n\n- For p̂: Bias=0, MSE=p(1−p)/n",
    derivation: "MSE expansion: E[(θ̂−θ)²]=E[((θ̂−Eθ̂)+(Eθ̂−θ))²]=Var(θ̂)+bias² after the cross term vanishes. Unbiasedness of X̄: E[Σ X_i / n]=(1/n)Σ μ=μ. Consistency follows from Var→0 plus Chebyshev, or from LLN directly.",
    pitfalls: [
      "Calling a single estimate 'unbiased' — unbiasedness is about the procedure's expectation",
      "Ignoring bias from cleaning rules, winsorizing, or nonresponse",
      "Assuming unbiasedness implies small error in one sample",
      "Comparing estimators on different scales without MSE or clear loss",
    ],
    interview: "Define bias and MSE, show X̄ is unbiased via linearity, and mention consistency via LLN. If asked about tradeoffs, give a regularized/shrunk estimator vignette.",
    bridge: "Two constructive recipes for building estimators come next: matching theoretical moments to sample moments, and maximizing the likelihood of the observed data.",
  }),

  buildLesson({
    title: "Method of Moments",
    partLabel: PART,
    principles: [
      "Method of moments equates population moments to sample moments and solves for parameters",
      "The first moment match often recovers the mean parameter; higher moments capture spread/shape",
      "MoM estimators are often easy to compute and usually consistent",
      "They need not be maximum-likelihood or fully efficient, but they are a strong baseline",
    ],
    objectives: [
      "Write population moments E[X^k] in terms of parameters",
      "Form sample moments m_k=(1/n)Σ X_i^k",
      "Solve the moment equations for one- and two-parameter families",
      "Compare MoM results to intuition from means and variances",
    ],
    why: "Before likelihood machinery, you need a systematic way to invent estimators. Method of moments is that systematic way: 'make the theoretical averages match the empirical averages.' It works for many named distributions and builds intuition for what data features identify which parameters.",
    story: "You model request sizes as Uniform(0,θ) with unknown θ. The mean is θ/2, so matching E[X]=X̄ suggests θ̂=2X̄. If the largest observation is already bigger than 2X̄, something is odd — MoM can produce awkward estimates in small samples, which is part of why people also learn MLE (next). Still, MoM gave a quick, consistent starting point.",
    idea: "If a model has parameters θ, express the first few population moments as functions of θ. Set them equal to the corresponding sample moments and solve. One parameter ⇒ usually match the mean; two parameters ⇒ match mean and second moment (or variance).",
    steps: [
      {
        title: "Write the model and its moments",
        body: "Example: Poisson(λ) has E[X]=λ. Exp(λ) has E[X]=1/λ. N(μ,σ²) has E[X]=μ and E[X²]=σ²+μ². Know as many as you need for the number of unknowns.",
      },
      {
        title: "Compute sample moments from data",
        body: "m_1=X̄, m_2=(1/n)Σ X_i², etc. Sometimes it is easier to match variance with s² (almost MoM; divisor n vs n−1 is a minor variant).",
      },
      {
        title: "Set equations moment_pop = moment_sample",
        body: "Solve the system for the parameters. Prefer algebraically stable rearrangements.",
      },
      {
        title: "Check reasonableness",
        body: "Estimates should land in the parameter space (σ̂²≥0, p̂∈[0,1], θ̂ above the data support when required). If not, inspect model fit or small-sample quirks.",
      },
      {
        title: "Note efficiency caveats",
        body: "MoM is not always optimal. For some models MLE is better for large n; for others they coincide (e.g. normal mean, Poisson λ, Bernoulli p).",
      },
    ],
    mathSimple: "Population moments are 'averages according to the true distribution.' Sample moments are 'averages according to the data.' Method of moments forces them to agree, then reads off the parameters that made agreement possible.",
    walkthrough: "Data: 2,3,5,6 modeled as N(μ,σ²). m_1=X̄=4. m_2=(4+9+25+36)/4=18.5. Set μ̂=4. Set σ̂²+μ̂²=18.5 ⇒ σ̂²=18.5−16=2.5. (With divisor n−1, sample variance would be (Σ(x_i−4)²)/3=(4+1+1+4)/3=10/3≈3.33 — different finite-sample choice.)",
    example: "Exp(λ) with mean wait data X̄=5. MoM: 1/λ̂=5 ⇒ λ̂=0.2. Same as the MLE for exponential rate in the usual parameterization.",
    example2: "Uniform(0,θ): E[X]=θ/2 ⇒ θ̂_MoM=2X̄. For data 1.2, 2.0, 2.5, X̄=1.9 ⇒ θ̂=3.8, which exceeds max=2.5 — feasible here. If you ever saw θ̂_MoM < max X_i, the estimate would be incompatible with the support — a known MoM weakness vs MLE θ̂=max X_i.",
    labCue: "Use a distribution lab or sampling tool: estimate λ for Poisson draws via X̄ (MoM) and compare to the true λ across repeated samples — watch consistency as n grows.",
    check: [
      "How many moment equations do you need for a two-parameter model?",
      "For Poisson(λ), what is the MoM estimator?",
      "Name one reason MoM might disagree with MLE.",
    ],
    practice: [
      {
        q: "i.i.d. Geometric(p) with E[T]=1/p (trials until first success). If X̄=8, what is p̂_MoM?",
        a: "1/p̂=8 ⇒ p̂=1/8=0.125.",
      },
      {
        q: "For i.i.d. Bernoulli, show MoM for p matches p̂.",
        a: "E[X]=p equals X̄, so p̂_MoM=X̄=p̂.",
      },
    ],
    formal: "Let μ_k(θ)=E_θ[X^k] and m_k=n^{-1}Σ X_i^k. A method-of-moments estimator solves μ_k(θ̂)=m_k for k=1,…,d when θ∈ℝ^d (under invertibility). Under standard regularity and LLN for sample moments, θ̂ is consistent and asymptotically normal with variance from the delta method.",
    formulas: "- m_k=(1/n)Σ X_i^k\n- Solve E[X^k]=m_k for parameters\n- Poisson: λ̂=X̄\n- Uniform(0,θ): θ̂=2X̄ (MoM)",
    derivation: "Sample moments converge to population moments by LLN (when those moments exist). If the map from θ to the vector of moments is continuously invertible near the true θ, the continuous mapping theorem yields consistency of the inverted estimator. Asymptotic variance follows from the delta method applied to √n(m−μ(θ)).",
    pitfalls: [
      "Matching more moments than parameters (overdetermined) without a clear projection rule",
      "Using MoM when moments do not exist (very heavy tails)",
      "Ignoring support constraints (Uniform example)",
      "Forgetting that divisor n vs n−1 changes finite-sample variance estimates",
    ],
    interview: "Explain MoM as equating theoretical and sample moments, give Poisson λ̂=X̄, and mention that MLE may differ and sometimes dominate asymptotically.",
    bridge: "Maximum likelihood estimation uses the full distribution shape — not just moments — and is the default modern recipe when a parametric model is trusted.",
  }),

  buildLesson({
    title: "Maximum Likelihood Estimation",
    partLabel: PART,
    principles: [
      "The likelihood is the joint probability (or density) of the observed data viewed as a function of the parameter",
      "The MLE chooses the parameter value that makes the observed data most probable",
      "Working with the log-likelihood turns products into sums and simplifies derivatives",
      "Under regularity, MLEs are consistent and asymptotically efficient",
    ],
    objectives: [
      "Write the likelihood and log-likelihood for i.i.d. samples",
      "Maximize analytically for Bernoulli, Poisson, and normal mean examples",
      "Explain why we maximize L(θ; data) after the data are fixed",
      "State high-level asymptotic virtues of MLE",
    ],
    why: "Maximum likelihood is the central estimation engine in parametric statistics and machine learning. Once you can write a likelihood, you have a recipe for estimators, and later for likelihood-ratio tests and Fisher information standard errors.",
    story: "You observe 7 successes in 10 independent Bernoulli trials. Which p makes that data most plausible? The likelihood L(p)=C(10,7) p^7 (1−p)^3 is maximized at p̂=0.7 — exactly the observed proportion. For a normal sample with unknown mean, maximizing the likelihood recovers the sample mean. Same comfortable answers, new unifying principle.",
    idea: "After data x are seen, treat f(x|θ) or P_θ(data) as a function L(θ|x) of θ. The **maximum likelihood estimator** is θ̂=arg max L(θ|x). Equivalently maximize ℓ=log L, which is usually easier.",
    steps: [
      {
        title: "Write the probability model",
        body: "Specify the PMF/PDF and independence assumptions. For i.i.d. continuous data, the joint density is the product ∏ f(x_i|θ).",
      },
      {
        title: "Form the likelihood",
        body: "Drop factors that do not depend on θ if you only care about the maximizer (optional but helpful). Keep the full L if you need likelihood ratios later.",
      },
      {
        title: "Take the log-likelihood",
        body: "ℓ(θ)=Σ log f(x_i|θ) for i.i.d. data. Products become sums; derivatives become friendly.",
      },
      {
        title: "Differentiate and solve the score equation",
        body: "Set ℓ'(θ)=0 and solve. Check it is a maximum (second derivative test or endpoints). Some MLEs live on the boundary (e.g. Uniform(0,θ) has θ̂=max x_i).",
      },
      {
        title: "Interpret and compare",
        body: "Relate θ̂ to MoM when they differ. Remember: MLE depends on the model — wrong model, cleverly maximized, is still wrong.",
      },
    ],
    mathSimple: "Likelihood asks: 'if the parameter were θ, how unsurprising would this exact dataset be?' Pick the θ that makes the data least surprising. Logging is only a monotone trick — it does not change the location of the maximum.",
    walkthrough: "Bernoulli n=10 with s=7 successes. L(p)∝ p^7 (1−p)^3. ℓ=7 log p + 3 log(1−p) + c. ℓ'=7/p − 3/(1−p)=0 ⇒ 7(1−p)=3p ⇒ 7=10p ⇒ p̂=0.7. Second derivative negative on (0,1) ⇒ maximum. Matches MoM.",
    example: "i.i.d. N(μ,σ²) with σ known: MLE μ̂=X̄. With both unknown, μ̂=X̄ and σ̂²=(1/n)Σ(X_i−X̄)² (note divisor n, not n−1).",
    example2: "i.i.d. Uniform(0,θ): likelihood is θ^{−n} for θ≥max x_i (and 0 otherwise). Maximizing pushes θ down to the boundary θ̂_MLE=max x_i — different from MoM's 2X̄, and more respectful of the support.",
    labCue: "If available, use a likelihood lab or plot L(p) for binomial data while sliding p. Watch the peak sit at the MLE and sharpen as n increases — visual consistency.",
    check: [
      "Why maximize log-likelihood instead of likelihood?",
      "Is the MLE always unbiased in finite samples?",
      "For Uniform(0,θ), why is θ̂=max X_i intuitive?",
    ],
    practice: [
      {
        q: "Poisson i.i.d. observations with sum 30 for n=10. Find λ̂_MLE.",
        a: "L(λ)∝ e^{−nλ} λ^{Σ x_i} ⇒ λ̂=X̄=3.",
      },
      {
        q: "True or false: maximizing likelihood always requires taking a derivative.",
        a: "False — sometimes the max is at a boundary or found by direct inspection (Uniform example).",
      },
    ],
    formal: "For discrete models L(θ;x)=P_θ(X=x); for continuous i.i.d. samples L(θ;x)=∏ f(x_i|θ). The MLE is any maximizer of L (or ℓ). Under regularity, √n(θ̂−θ) ⇒ N(0, I(θ)^{−1}) where I is Fisher information — asymptotic efficiency among regular estimators.",
    formulas: "- L(θ)=∏ f(x_i|θ) (i.i.d.)\n- ℓ(θ)=Σ log f(x_i|θ)\n- Bernoulli/Poisson: p̂=X̄, λ̂=X̄\n- Normal: μ̂=X̄, σ̂²_MLE=(1/n)Σ(X_i−X̄)²",
    derivation: "For Bernoulli, differentiate the log-likelihood as in the walkthrough. For Poisson, ℓ=−nλ+(Σ x_i) log λ − Σ log(x_i!), score −n+(Σ x_i)/λ=0 ⇒ λ̂=X̄. Fisher information arises as Var(ℓ')=−E[ℓ''], and the asymptotic variance 1/(nI) is the Cramér–Rao benchmark in regular models.",
    pitfalls: [
      "Treating the likelihood as a probability distribution over θ (without a prior it is not)",
      "Forgetting support constraints that create boundary MLEs",
      "Assuming finite-sample unbiasedness of MLE (often false; σ̂²_MLE is biased)",
      "Maximizing numerically without checking multiple modes in hard models",
    ],
    interview: "Define likelihood as data probability viewed as a function of θ, maximize log-likelihood for a Bernoulli or Poisson example, and mention asymptotic normality / efficiency at a high level.",
    bridge: "A point estimate alone hides uncertainty. Confidence intervals turn sampling distributions into ranges of plausible parameter values.",
  }),

  buildLesson({
    title: "Confidence Intervals for Means",
    partLabel: PART,
    principles: [
      "A confidence interval is a random range that traps the true parameter with a chosen long-run frequency",
      "For means with known σ: X̄ ± z_{α/2} σ/√n",
      "When σ is unknown and data are roughly normal: use t critical values with s/√n",
      "Confidence level is about the procedure, not the probability that a fixed computed interval 'contains μ' in the Bayesian sense",
    ],
    objectives: [
      "Construct a z-interval for a mean with known σ",
      "Construct a t-interval when σ is unknown",
      "Interpret confidence level via repeated sampling",
      "Relate width to n, σ (or s), and confidence level",
    ],
    why: "Point estimates pretend certainty. Decision-makers need ranges: 'average latency is about 120ms, plausibly 112–128ms at 95% confidence.' Mean confidence intervals are the everyday tool that connects SE, normal/t tails, and honest uncertainty reporting.",
    story: "A lab measures n=36 reaction times, gets x̄=250 ms, and believes σ≈30 ms from past calibrations. A 95% z-interval is 250 ± 1.96·30/6 = 250 ± 9.8 ≈ (240.2, 259.8). If they repeated the entire experiment many times, about 95% of such intervals would cover the true mean — that is the confidence guarantee.",
    idea: "Start from X̄ ≈ N(μ, σ²/n). Then Z=√n(X̄−μ)/σ ≈ N(0,1), so P(−z_{α/2} ≤ Z ≤ z_{α/2})≈1−α. Rearranging the inequality produces the random interval X̄ ± z_{α/2} σ/√n that covers μ with approximate probability 1−α.",
    steps: [
      {
        title: "Choose the confidence level 1−α",
        body: "Commonly 90%, 95%, or 99%. Higher confidence ⇒ wider intervals. Pick based on how costly misses are, not vanity.",
      },
      {
        title: "Compute the point estimate and SE",
        body: "Use x̄ and SE=σ/√n if σ known, or SE=s/√n if using sample SD. Confirm n and sampling assumptions (i.i.d./SRS, not too skewed for small n).",
      },
      {
        title: "Select the critical value",
        body: "Known σ or large n: z_{α/2} (1.645, 1.96, 2.576 for 90/95/99%). Unknown σ, normal-ish data: t_{n−1, α/2}, which is larger than z for small n.",
      },
      {
        title: "Form the interval",
        body: "x̄ ± (critical value)×SE. Report endpoints with sensible precision and units.",
      },
      {
        title: "Interpret carefully",
        body: "Say: 'We are 95% confident that the procedure yields an interval containing μ,' or 'a 95% CI for μ is (a,b).' Avoid 'there is 95% probability μ is in this fixed interval' unless you are in a Bayesian framework.",
      },
    ],
    mathSimple: "The margin of error is roughly 'how many SEs you stretch to catch typical sampling error at your confidence level.' 1.96 SEs each way catches about 95% of normal sampling error for the mean when σ is known.",
    walkthrough: "n=36, x̄=250, σ=30, 95% confidence. SE=30/6=5. Margin=1.96×5=9.8. Interval (240.2, 259.8). If instead σ unknown and s=30 with normal data, use t_{35, 0.025}≈2.03, margin≈10.15, slightly wider interval (239.85, 260.15).",
    example: "x̄=100, σ=15, n=25, 95% CI: 100 ± 1.96·15/5 = 100 ± 5.88 ⇒ (94.12, 105.88).",
    example2: "Width control: want margin of error E=2 with σ=10 at 95%. Need 1.96·10/√n ≤ 2 ⇒ √n ≥ 9.8 ⇒ n≥97. So plan at least 97 observations.",
    labCue: "In the **sampling** / CI lab, generate many samples and draw their mean intervals. Watch about 95% of 95% intervals cover the true μ, while any single interval either covers or not — no mystery probability after it is computed from data.",
    check: [
      "What happens to CI width when n quadruples?",
      "When do you prefer t over z for a mean?",
      "Does 95% confidence mean μ is random?",
    ],
    practice: [
      {
        q: "x̄=12, σ=4, n=64. Give a 90% CI for μ (z_{0.05}=1.645).",
        a: "SE=0.5, margin=1.645×0.5=0.8225, interval ≈ (11.18, 12.82).",
      },
      {
        q: "Why is a 99% CI wider than a 95% CI for the same data?",
        a: "The critical value z_{α/2} (or t) is larger for smaller α, so you stretch more SEs to achieve higher long-run coverage.",
      },
    ],
    formal: "If X_i i.i.d. N(μ,σ²) with σ known, P(μ ∈ X̄ ± z_{α/2} σ/√n)=1−α exactly. With σ unknown, (X̄−μ)/(s/√n)~t_{n−1}, yielding exact t intervals under normality. For non-normal data, intervals are approximate via CLT for large n.",
    formulas: "- z-interval: X̄ ± z_{α/2} σ/√n\n- t-interval: X̄ ± t_{n−1,α/2} s/√n\n- Margin of error ≈ z_{α/2} σ/√n\n- z_{0.025}≈1.96 for 95%",
    derivation: "From P(|√n(X̄−μ)/σ| ≤ z_{α/2})=1−α, multiply by σ/√n and rearrange to isolate μ between X̄−… and X̄+…. Replacing σ with s and z with t yields the Student interval because the pivotal quantity then follows t_{n−1} under normal i.i.d. sampling.",
    pitfalls: [
      "Misinterpreting confidence as the posterior probability μ lies in the fixed interval",
      "Using z with tiny n and unknown σ on skewed data",
      "Forgetting to divide σ by √n",
      "Cherry-picking confidence levels after seeing the interval",
    ],
    interview: "Derive X̄±1.96 σ/√n from the normal pivot in 30 seconds, interpret coverage via repeated experiments, and mention t when σ is unknown.",
    bridge: "Binary outcomes use the same CI logic on p̂ instead of X̄ — confidence intervals for proportions.",
  }),

  buildLesson({
    title: "Confidence Intervals for Proportions",
    partLabel: PART,
    principles: [
      "A sample proportion p̂ estimates an unknown success probability p",
      "The large-sample Wald interval is p̂ ± z_{α/2} √(p̂(1−p̂)/n)",
      "Coverage can be poor for small n or p near 0 or 1 — alternatives like Wilson help",
      "Sample size planning uses a guessed p or the conservative p=0.5 bound",
    ],
    objectives: [
      "Construct a large-sample CI for a proportion",
      "Check np̂ and n(1−p̂) rules of thumb for the normal approximation",
      "Plan n for a target margin of error",
      "Interpret proportion intervals in product/A/B language",
    ],
    why: "Click rates, defect rates, election preferences, and accuracy metrics are proportions. Interval estimates answer 'how sure are we about this rate?' and drive sample-size choices for surveys and experiments.",
    story: "In a usability test, 42 of 50 users completed a task: p̂=0.84. A quick 95% Wald interval uses SE=√(0.84·0.16/50)≈0.0518, margin≈0.102, interval ≈ (0.74, 0.94). That range — not the single 84% — is what you should take to a launch review when n is only 50.",
    idea: "By CLT, p̂ ≈ N(p, p(1−p)/n) for large n. Plug in p̂ for the unknown p inside the SE to get the Wald interval p̂ ± z √(p̂(1−p̂)/n). It is the proportion analogue of the z-interval for means.",
    steps: [
      {
        title: "Compute p̂ = x/n",
        body: "x successes in n independent Bernoulli trials (or SRS of binary outcomes). Keep x and n — some improved intervals use them more carefully than Wald.",
      },
      {
        title: "Check approximation conditions",
        body: "Rules of thumb: np̂≥10 and n(1−p̂)≥10 (thresholds vary). If p̂ is 0.02 with n=40, do not trust a crude Wald interval — use Wilson/Agresti–Coull or exact methods.",
      },
      {
        title: "Form the Wald SE and interval",
        body: "SE=√(p̂(1−p̂)/n), then p̂ ± z_{α/2} SE. Clip to [0,1] only for reporting aesthetics; better intervals rarely need crude clipping.",
      },
      {
        title: "Plan sample size when needed",
        body: "For margin E at confidence 1−α: n≈ z² p*(1−p*)/E². If p* unknown, use 0.5 to maximize p(1−p) — the conservative sample size.",
      },
      {
        title: "Interpret in context",
        body: "Same repeated-sampling interpretation as mean CIs. In A/B tests, compare intervals carefully or — better — use an explicit test/CI for the difference of proportions.",
      },
    ],
    mathSimple: "A proportion is just a mean of 0/1 data. Its SE peaks when p=0.5 (most variability) and shrinks when outcomes are almost always 0 or almost always 1. Estimating that SE with p̂ is convenient but shaky when few successes or failures appear.",
    walkthrough: "x=42, n=50, p̂=0.84, 95% CI. SE=√(0.84·0.16/50)=√0.002688≈0.0518. z SE≈0.1016. Interval (0.738, 0.942). Check: np̂=42, n(1−p̂)=8 — on the edge for the rule of thumb; consider a Wilson interval for a report that must be tighter about coverage.",
    example: "Poll: 520 of 1000 support a measure ⇒ p̂=0.52. 95% CI: 0.52 ± 1.96√(0.52·0.48/1000) ≈ 0.52 ± 0.031 ⇒ (0.489, 0.551).",
    example2: "Want E=0.03 at 95% with no guess for p: use p*=0.5. n≈(1.96)²(0.25)/(0.03)²≈1067. If you believe p≈0.1, n≈(1.96)²(0.09)/(0.03)²≈384 — much smaller.",
    labCue: "In the **sampling** lab with binary urns, compute p̂ intervals for many resamples. Compare coverage when p=0.5 versus p=0.05 — Wald intervals often undercover in the rare-event case.",
    check: [
      "Why is p=0.5 the conservative choice for sample-size planning?",
      "What goes wrong with Wald intervals when x=0?",
      "How does SE(p̂) scale with n?",
    ],
    practice: [
      {
        q: "15 successes in 60 trials. Build an approximate 95% Wald CI.",
        a: "p̂=0.25, SE=√(0.25·0.75/60)=√0.003125≈0.0559, margin≈0.110, interval ≈ (0.140, 0.360).",
      },
      {
        q: "For E=0.02, 95%, p*=0.5, what n do you need (approx)?",
        a: "n≈(1.96)²(0.25)/(0.02)²≈2401.",
      },
    ],
    formal: "Wald interval: p̂ ± z_{α/2} √(p̂(1−p̂)/n). Wilson score interval solves |p̂−p| = z √(p(1−p)/n) for p and has better finite-sample coverage. As n→∞ with p fixed in (0,1), Wald coverage → 1−α by CLT and Slutsky (p̂→p in the SE).",
    formulas: "- p̂=x/n\n- Wald: p̂ ± z_{α/2} √(p̂(1−p̂)/n)\n- Sample size: n≈ z² p*(1−p*)/E²\n- Conservative: p*=1/2 ⇒ n≈ z²/(4E²)",
    derivation: "Start from √n(p̂−p)/√(p(1−p)) ≈ N(0,1). The pivot still depends on unknown p; Wald replaces p with p̂ (Slutsky). Wilson keeps p inside the SE and solves a quadratic inequality — algebraically heavier, often better behaved.",
    pitfalls: [
      "Using Wald intervals with tiny counts (especially x=0 or x=n)",
      "Treating overlapping CIs for two proportions as a formal test of equality",
      "Planning n with an unrealistically extreme p* when 0.5 is safer",
      "Forgetting that clustered/users-within-sessions dependence inflates true SE",
    ],
    interview: "Write the Wald formula, state the CLT justification, mention Wilson when n is small or p is extreme, and show the n≈z²/(4E²) conservative sample-size rule.",
    bridge: "With estimation and intervals in hand, the natural next question is testing claims about parameters — hypothesis testing in Part 7.",
  }),
];
