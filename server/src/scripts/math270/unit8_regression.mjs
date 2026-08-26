import { buildLesson } from "./helper.mjs";

const PART = "Part 8: Regression and Correlation";

export const topics = [
  buildLesson({
    title: "Scatter Plots and Correlation",
    partLabel: PART,
    principles: [
      "Always plot bivariate quantitative data before trusting a single summary number",
      "Scatter plots show form, direction, strength, clusters, and outliers",
      "Pearson r measures linear association only, on a scale from −1 to 1",
      "|r| near 1 means a tight linear cloud; r near 0 means little linear trend",
      "Correlation is not causation — and r can be near 0 even when a clear curve exists",
    ],
    objectives: [
      "Read a scatter plot for form, direction, strength, and odd points",
      "Interpret the sign and magnitude of Pearson r in context",
      "Recognize nonlinear patterns where r is misleading",
      "Explain how a single influential point can move r",
    ],
    why: "Hours studied vs score, ad spend vs revenue, latency vs load — the first honest look at two quantitative variables is a scatter plot. Correlation then compresses the linear part of that picture into one comparable number.",
    story:
      "Two tutors look at the same student data. One quotes r = 0.08 and says 'study time barely matters.' The other plots the points and sees a clear U-shape: very low and very high study times both associate with lower scores (burnout / cramming), while moderate times do better. The number r ≈ 0 was not 'wrong' — it answered a different question (linear trend) than the plot revealed.",
    idea: "**r > 0** means the cloud trends upward (larger x with larger y, on average). **r < 0** trends downward. **|r| close to 1** means points hug a straight line; **|r| near 0** means little straight-line association. Always ask: is the relationship roughly linear? If not, r is the wrong headline.",
    steps: [
      {
        title: "Draw y versus x",
        body: "Each observational unit is one point. Label axes with names and units.",
      },
      {
        title: "Describe form in words",
        body: "Roughly linear? curved? fan-shaped? two clusters? Any glaring outliers?",
      },
      {
        title: "Describe direction and strength visually",
        body: "Up / down / flat; tight / moderate / scattered — before computing r.",
      },
      {
        title: "Compute Pearson r if the form is roughly linear",
        body: "Use r as a summary, not a substitute for the plot.",
      },
      {
        title: "Stress-test with outliers",
        body: "Mentally remove one extreme point: would r change dramatically? If yes, report that sensitivity.",
      },
    ],
    mathSimple:
      "Pearson correlation (sample):\n\n- **r = Σ (x_i − x̄)(y_i − ȳ) / √[Σ(x_i − x̄)² Σ(y_i − ȳ)²]**\n- Equivalently **r = ŝ_{xy} / (s_x s_y)** — standardized covariance.\n\nGentle reading: when x is above its mean, does y tend to be above its mean too? Those co-movements make the numerator positive. Dividing by the scales of x and y makes r unitless and bounded by [−1, 1].",
    walkthrough:
      "Hours studied x vs exam score y for 6 students (toy numbers):\n(1,50), (2,55), (3,65), (4,70), (5,80), (6,85).\n\n1. Plot: clear upward linear cloud.\n2. Both variables rise together → expect r > 0 and fairly large.\n3. Computing r (or using software) gives something around 0.99 for this almost-perfect line.\n4. Interpretation: strong positive linear association between hours and score in this sample.\n5. Caveat sentence: we still have not proven that forcing more hours causes higher scores — only that they move together here.",
    example:
      "Marketing: weekly spend vs weekly signups with r = 0.7. Moderately strong positive linear association. Still plot — a few campaign weeks might be outliers from viral spikes that inflate or deflate r.",
    example2:
      "Anscombe-style warning: four datasets can share the same r ≈ 0.82 yet look linear, curved, outlier-driven, or vertical-clustered. Identical r, totally different stories — hence 'plot first.'",
    labCue:
      "Open the **regression** lab. Drag points and watch r update live. Create a curved pattern with r near 0, then add one outlier and watch r jump.",
    check: [
      "Can two variables be strongly related with r ≈ 0? Give an example shape.",
      "What does r = −1 look like on a scatter plot?",
      "Why is r unitless?",
    ],
    practice: [
      {
        q: "A plot shows a tight downward line. Which is plausible: r = 0.9, r = −0.9, or r = 0?",
        a: "r = −0.9 (strong negative linear association).",
      },
      {
        q: "True or false: r = 0.5 means x causes 50% of y.",
        a: "False. r measures linear association strength/direction, not causal share. (R² will be discussed later as variance explained — still not automatic causation.)",
      },
    ],
    formal:
      "For paired observations (X_i, Y_i), the sample Pearson correlation is the cosine of the angle between the centered vectors (x − x̄1) and (y − ȳ1). Population correlation ρ = Cov(X,Y)/(σ_X σ_Y) exists when second moments are finite. |ρ| = 1 iff Y is an affine function of X almost surely. Uncorrelated (ρ = 0) does not imply independent except in special families (notably bivariate normal).",
    formulas:
      "- r ∈ [−1, 1]\n- r = S_{xy} / √(S_{xx} S_{yy})\n- r = Cov̂(X,Y) / (s_x s_y)",
    derivation:
      "Start from covariance as average product of centered deviations. Large positive products mean x and y move together. Dividing by s_x s_y removes units and scales the measure so Cauchy–Schwarz forces |r| ≤ 1, with equality when the centered vectors are proportional — i.e. a perfect linear relationship.",
    pitfalls: [
      "Reporting r without a plot",
      "Claiming causation from correlation alone",
      "Using r to summarize a clearly curved relationship",
      "Ignoring influential outliers",
    ],
    interview:
      "I'd plot first, describe form/direction/strength, then quote r only if linearity is reasonable. I'd explicitly separate association from causation and mention outlier sensitivity.",
    bridge:
      "Correlation summarizes linear association. Simple linear regression goes further: it fits an explicit line for prediction and for interpreting a rate of change.",
  }),

  buildLesson({
    title: "Simple Linear Regression",
    partLabel: PART,
    principles: [
      "The SLR model says Y ≈ β₀ + β₁X + random error",
      "Ordinary least squares (OLS) chooses the line that minimizes the sum of squared vertical residuals",
      "Closed forms exist for slope and intercept in terms of means and sums of squares",
      "The fitted line is a useful prediction machine — not guaranteed truth outside the data's support",
      "Residuals e_i = y_i − ŷ_i are the vertical mistakes the line still makes",
    ],
    objectives: [
      "Write the simple linear regression model in words and symbols",
      "Compute β̂₁ and β̂₀ from S_{xy} and S_{xx}",
      "Predict ŷ for a new x inside the observed range",
      "Explain what least squares minimizes",
    ],
    why: "SLR is the gateway to almost every linear model in statistics and machine learning. If you understand 'fit a line by minimizing squared vertical errors,' you already understand the core of many fancier methods.",
    story:
      "You want a rule: given hours studied, guess exam score. Many lines could cut through the cloud. Least squares picks the one that makes the total squared up/down misses as small as possible — a compromise that pulls toward all points but does not obsess over absolute-error corners the way some other criteria do.",
    idea: "Assume a straight-line average relationship **E[Y|X=x] = β₀ + β₁x**. Estimate β₀, β₁ by least squares. Then for a new x, predict **ŷ = β̂₀ + β̂₁x**. The slope tells the average change in y per unit x; residuals tell what the line still misses.",
    steps: [
      {
        title: "Confirm a roughly linear scatter",
        body: "If the plot is curved, a straight SLR is the wrong tool (or you need a transform).",
      },
      {
        title: "Compute means and corrected sums",
        body: "x̄, ȳ, S_{xx} = Σ(x_i−x̄)², S_{xy} = Σ(x_i−x̄)(y_i−ȳ).",
      },
      {
        title: "Estimate the slope",
        body: "β̂₁ = S_{xy} / S_{xx}.",
      },
      {
        title: "Estimate the intercept",
        body: "β̂₀ = ȳ − β̂₁ x̄. (The fitted line always passes through (x̄, ȳ).)",
      },
      {
        title: "Predict and inspect residuals",
        body: "ŷ = β̂₀ + β̂₁x. Look at e_i = y_i − ŷ_i for patterns — foreshadowing residual analysis.",
      },
    ],
    mathSimple:
      "Model: **y_i = β₀ + β₁ x_i + ε_i**.\n\nLeast squares:\n\n- **β̂₁ = S_{xy} / S_{xx}**\n- **β̂₀ = ȳ − β̂₁ x̄**\n- **ŷ_i = β̂₀ + β̂₁ x_i**\n- **e_i = y_i − ŷ_i**\n\nPlain language: slope = 'how co-movement of x and y compares to how much x itself varies.' Intercept is chosen so the line sits at the average point (x̄, ȳ).",
    walkthrough:
      "Toy data: x = 1,2,3,4 and y = 2,3,5,6.\n\n1. x̄ = 2.5, ȳ = 4.\n2. S_{xx} = (1.5)²+(0.5)²+(0.5)²+(1.5)² = 5.\n3. S_{xy} = (−1.5)(−2)+(−0.5)(−1)+(0.5)(1)+(1.5)(2) = 3+0.5+0.5+3 = 7.\n4. β̂₁ = 7/5 = 1.4; β̂₀ = 4 − 1.4·2.5 = 0.5.\n5. Line: ŷ = 0.5 + 1.4x. At x = 3, ŷ = 4.7 (observed y was 5; residual −0.3).",
    example:
      "Score ≈ 40 + 3.5·hours. Studying 4 hours predicts ŷ = 40 + 14 = 54 points. That is a prediction from the fitted line, not a guarantee for every student.",
    example2:
      "If all x values sit between 2 and 6 hours, predicting at x = 40 hours is extrapolation — the linear pattern may not continue. Least squares does not know your domain physics.",
    labCue:
      "In the **regression** lab, move points and watch the least-squares line re-fit. Notice it always threads the cloud's center of mass (x̄, ȳ).",
    check: [
      "What quantity does OLS minimize?",
      "Does the fitted line pass through (x̄, ȳ)?",
      "What is a residual?",
    ],
    practice: [
      {
        q: "If β̂₁ = 2, β̂₀ = 10, what is ŷ when x = 7?",
        a: "ŷ = 10 + 2·7 = 24.",
      },
      {
        q: "S_{xy} = 30, S_{xx} = 10, x̄ = 5, ȳ = 20. Find β̂₁ and β̂₀.",
        a: "β̂₁ = 3; β̂₀ = 20 − 3·5 = 5. Line: ŷ = 5 + 3x.",
      },
    ],
    formal:
      "Given fixed predictors x_i (or conditioning on X), the OLS estimator minimizes Σ_i (y_i − β₀ − β₁ x_i)². The normal equations yield the closed forms above when S_{xx} > 0. Under the classical model with i.i.d. N(0,σ²) errors, OLS coincides with MLE for (β₀, β₁). Fitted values are the projection of y onto the column space spanned by {1, x}.",
    formulas:
      "- β̂₁ = S_{xy}/S_{xx}\n- β̂₀ = ȳ − β̂₁ x̄\n- ŷ = β̂₀ + β̂₁ x\n- e_i = y_i − ŷ_i",
    derivation:
      "Let SSE(β₀,β₁) = Σ(y_i − β₀ − β₁ x_i)². Differentiate wrt β₀ and β₁, set gradients to 0. The β₀ equation forces the residuals to sum to 0, which implies the line passes through (x̄,ȳ) and yields β₀ = ȳ − β₁ x̄. Substituting into the β₁ equation produces β₁ = S_{xy}/S_{xx}. Second-derivative / convexity checks confirm a minimum.",
    pitfalls: [
      "Fitting a line to a clearly nonlinear scatter",
      "Extrapolating far beyond the observed x-range",
      "Calling residuals 'errors in x' — OLS uses vertical (y) mistakes",
      "Forgetting that a great in-sample fit can still be a bad causal story",
    ],
    interview:
      "I'd say we model the conditional mean of Y as linear in X, estimate by least squares, predict with ŷ = β̂₀ + β̂₁x, and always check the scatter and residuals before trusting the line.",
    bridge:
      "Numbers β̂₀ and β̂₁ need careful English — next we practice interpreting coefficients without overclaiming.",
  }),

  buildLesson({
    title: "Interpreting Regression Coefficients",
    partLabel: PART,
    principles: [
      "β₁ is the expected change in Y associated with a one-unit increase in X (under the model)",
      "β₀ is the expected Y when X = 0 — meaningful only if X = 0 is in range and makes sense",
      "Units on both variables belong in every interpretation sentence",
      "Association language is the default; causal language needs design or strong assumptions",
      "Rescaling X (hours → minutes) rescales β₁ in the obvious reciprocal way",
    ],
    objectives: [
      "Write a correct slope interpretation with units",
      "Judge when the intercept is substantive vs fictitious",
      "Avoid causal wording from observational fits",
      "Predict how changing the scale of X changes β̂₁",
    ],
    why: "Stakeholders hear coefficients, not matrices. A sloppy sentence ('each hour causes +2 points') can drive wrong policy. Clear association language keeps trust.",
    story:
      "A dashboard says Score = 50 + 2.0·Hours. A manager hears 'make everyone study one more hour and scores jump two points.' That might be true in a randomized study. In observational data it might mean 'students who choose to study more also score higher,' partly because of motivation, prior knowledge, or course selection — not a guaranteed lever.",
    idea: "Read **β₁** as a rate: '+1 unit of X associates with β₁ units of Y on average, according to this linear model.' Read **β₀** as the model's baseline at X = 0 — sometimes real (temperature scales), sometimes nonsense (0 hours of age, 0 Kelvin mis-scaled).",
    steps: [
      {
        title: "Name X and Y with units",
        body: "e.g. X = hours studied; Y = exam points out of 100.",
      },
      {
        title: "Write the slope sentence",
        body: "'On average, a 1-hour increase in study time associates with a β₁-point higher score in this fitted model.'",
      },
      {
        title: "Check whether X = 0 is plausible",
        body: "If yes and nearby data exist, interpret β₀. If not, say 'intercept is a mathematical baseline, not a meaningful prediction.'",
      },
      {
        title: "State the study design caveat",
        body: "Randomized experiment → cautious causal wording may be OK. Observational → stick to association.",
      },
      {
        title: "Mind the scale",
        body: "If X is measured in minutes instead of hours, β₁ shrinks by about 60× — same science, different units.",
      },
    ],
    mathSimple:
      "Model mean: **E[Y|X=x] = β₀ + β₁ x**.\n\n- Increase x by 1 → mean Y changes by **β₁**.\n- At x = 0 → mean Y equals **β₀**.\n\nNothing in the algebra forces 'β₁ is a causal effect.' Causation is an extra story about how the data were generated.",
    walkthrough:
      "Fitted line: Score = 50 + 2.0·Hours, hours ranging from 1 to 8.\n\n1. Slope: each additional hour associates with +2 exam points on average.\n2. Intercept 50: the model's score at 0 hours. If nobody in the sample studied 0 hours, treat 50 cautiously — it is an extrapolation of the line.\n3. Prediction at 5 hours: 60 points — interpolation, more trustworthy than at 0 or 40 hours.\n4. Causal claim? Only if study time was randomly assigned (or you have another credible identification strategy).",
    example:
      "Salary (\\$k) = 40 + 3.5·YearsExperience. Interpretation: +1 year of experience associates with +$3.5k salary on average in this sample/model. Intercept $40k is starting salary at 0 years — often meaningful in this context.",
    example2:
      "If experience is recorded in months, the slope becomes about 3.5/12 ≈ 0.29 $k per month. The story unchanged; only the unit of 'one step in X' changed.",
    labCue:
      "In the **regression** lab, change the slope visually and rewrite the interpretation sentence each time. Then shift all x-values' scale mentally and predict how β̂₁ should change.",
    check: [
      "When is β₀ not worth interpreting substantively?",
      "What phrase replaces 'causes' in observational regression?",
      "If you multiply all x by 10, what happens to β̂₁?",
    ],
    practice: [
      {
        q: "ŷ = 5 − 0.4 x with x = commute hours. Interpret the slope.",
        a: "Each additional hour of commute associates with a 0.4-unit decrease in the response, on average, under the fitted linear model.",
      },
      {
        q: "X = temperature in Celsius including 0°C in-range. Is β₀ always meaningful?",
        a: "More often yes than for '0 hours age,' but still check: β₀ is mean Y at 0°C under linearity. If the science is nonlinear near 0, don't lean on it.",
      },
    ],
    formal:
      "In the linear conditional-mean model E[Y|X=x]=β₀+β₁x, β₁ = ∂/∂x E[Y|X=x]. Under causal graphical or potential-outcomes assumptions (e.g. randomized X), β₁ can equal an average treatment effect of a unit change in X. Without those assumptions it remains a projection coefficient: the best linear predictor's slope in an L² sense.",
    formulas:
      "- E[Y|X=x] = β₀ + β₁ x\n- β₁: change in mean Y per +1 X\n- β₀: mean Y at X = 0 (model)",
    derivation:
      "From E[Y|X=x]=β₀+β₁x, the difference E[Y|X=x+1]−E[Y|X=x]=β₁ follows immediately. The intercept identity E[Y|X=0]=β₀ is the same equation at x=0. Rescaling X* = cX replaces β₁ with β₁/c so that β₁ x = (β₁/c) x* remains invariant.",
    pitfalls: [
      "Dropping units from the sentence",
      "Causal language from observational data",
      "Interpreting β₀ when X = 0 is absurd or far from the data",
      "Comparing slopes across studies that used different X scales without converting",
    ],
    interview:
      "I'd give a units-aware association sentence for the slope, flag whether the intercept is in-range, and only use causal verbs if the design supports them.",
    bridge:
      "How much of Y's variation does the line capture? That is R² — the coefficient of determination.",
  }),

  buildLesson({
    title: "Coefficient of Determination",
    partLabel: PART,
    principles: [
      "R² measures the fraction of sample variance in Y explained by the regression",
      "R² = 1 − SS_res/SS_tot = SS_reg/SS_tot",
      "R² near 1 means tight fit around the line; near 0 means the line helps little",
      "High R² is not proof of causation, correctness of form, or out-of-sample skill",
      "Adding predictors can only raise (unadjusted) R² — hence adjusted R² later in MLR",
    ],
    objectives: [
      "Define R² using residual and total sums of squares",
      "Interpret R² as 'percent of variance explained' carefully",
      "Relate R² to the correlation r in simple linear regression",
      "List what R² does not guarantee",
    ],
    why: "People ask 'how good is the model?' R² is a popular answer — useful if you know its limits. It is an in-sample variance split, not a moral certificate.",
    story:
      "Two lines both look 'OK' by eye. One leaves huge vertical misses; the other threads the cloud. R² is a formal way to say how much of the up-and-down scatter in Y got pulled into the fitted line versus left in the residuals — like asking what fraction of the noise budget the model spent usefully.",
    idea: "Start from total variation in y around ȳ (**SS_tot**). After fitting, leftover variation sits in residuals (**SS_res**). **R² = 1 − SS_res/SS_tot** is the fraction removed by the model. In SLR with an intercept, **R² = r²** — the squared correlation.",
    steps: [
      {
        title: "Compute fitted values and residuals",
        body: "ŷ_i from the least-squares line; e_i = y_i − ŷ_i.",
      },
      {
        title: "Form SS_tot and SS_res",
        body: "SS_tot = Σ(y_i − ȳ)²; SS_res = Σ e_i².",
      },
      {
        title: "Compute R²",
        body: "R² = 1 − SS_res/SS_tot (equivalently SS_reg/SS_tot).",
      },
      {
        title: "Interpret in context",
        body: "'About 100 R²% of the variance in Y is explained by the linear relationship with X in this sample.'",
      },
      {
        title: "Add caveats",
        body: "Check residuals and the plot; remember out-of-sample performance can be worse; causation still separate.",
      },
    ],
    mathSimple:
      "- **SS_tot** = Σ(y_i − ȳ)² — total variation in Y.\n- **SS_res** = Σ(y_i − ŷ_i)² — leftover after the line.\n- **SS_reg** = Σ(ŷ_i − ȳ)² — variation captured by fitted values.\n- **R² = 1 − SS_res/SS_tot = SS_reg/SS_tot**.\n- In SLR: **R² = r²**.\n\nGentle picture: R² is the fraction of the 'y-scatter budget' the line accounts for.",
    walkthrough:
      "Suppose SS_tot = 100 and after fitting SS_res = 36.\n\n1. R² = 1 − 36/100 = 0.64.\n2. Interpretation: the linear model explains 64% of the sample variance in Y.\n3. If this is SLR, |r| = √0.64 = 0.8 (sign matches the slope).\n4. If SS_res were 100, R² = 0 — the line is no better than predicting ȳ for everyone.\n5. If SS_res = 0, R² = 1 — perfect in-sample linear fit (rare with real noisy data).",
    example:
      "Hours vs score with r = 0.7 ⇒ R² = 0.49. About half the variance in scores is linearly associated with hours in-sample; the other half remains in residuals (ability, sleep, luck, nonlinear effects, …).",
    example2:
      "A model with R² = 0.95 can still be terrible for decisions if it is overfit, extrapolated, or confounded. A model with R² = 0.15 can still be useful if that lift is real and actionable in a huge market.",
    labCue:
      "In the **regression** lab, tighten the cloud around the line and watch R² rise; add vertical noise and watch R² fall even if the true slope stays similar.",
    check: [
      "In SLR, how are R² and r related?",
      "If SS_res = SS_tot, what is R²?",
      "Name two things high R² does not prove.",
    ],
    practice: [
      {
        q: "SS_tot = 200, SS_reg = 50. What is R²?",
        a: "R² = 50/200 = 0.25 (and SS_res = 150).",
      },
      {
        q: "r = −0.6 in SLR. What is R²?",
        a: "R² = 0.36. (Sign lives in r/slope, not in R².)",
      },
    ],
    formal:
      "For OLS with an intercept, the decomposition SS_tot = SS_reg + SS_res holds, and R² = SS_reg/SS_tot ∈ [0,1]. Equivalently R² is the squared correlation between y and ŷ. In population terms, the analogous quantity is 1 − Var(ε)/Var(Y) under a correctly specified homoscedastic linear model, but sample R² is an optimistic in-sample measure.",
    formulas:
      "- R² = 1 − SS_res/SS_tot\n- R² = SS_reg/SS_tot\n- SLR: R² = r²",
    derivation:
      "Because OLS residuals are orthogonal to fitted values when an intercept is present, Pythagoras in the observation space gives ‖y−ȳ1‖² = ‖ŷ−ȳ1‖² + ‖y−ŷ‖². Dividing the regression piece by the total piece yields R². For SLR, ŷ is an affine function of x, so Corr(y,ŷ)=|Corr(y,x)| and R²=r².",
    pitfalls: [
      "Treating R² as a probability or causal share",
      "Comparing R² across different y-scales / transforms carelessly",
      "Assuming higher R² always means a better scientific model",
      "Ignoring adjusted R² / out-of-sample metrics when adding predictors",
    ],
    interview:
      "I'd define R² as in-sample variance explained by the regression, note R²=r² in SLR, and immediately list caveats: not causation, not automatic out-of-sample performance, still need residual checks.",
    bridge:
      "R² describes fit. Inference in regression asks whether the slope could plausibly be zero in the population — tests and intervals for β₁.",
  }),

  buildLesson({
    title: "Inference in Regression",
    partLabel: PART,
    principles: [
      "Under classical assumptions, β̂₁ is approximately normal about β₁ with an estimable SE",
      "A t-test of H₀: β₁ = 0 asks whether there is a linear association in the population",
      "A confidence interval for β₁ communicates slope uncertainty",
      "You can also give intervals for the mean response and (wider) prediction intervals for a new Y",
      "Inference inherits SLR assumptions: linearity, independence, constant variance, normality (esp. small n)",
    ],
    objectives: [
      "Test H₀: β₁ = 0 with a t-statistic",
      "Interpret a CI for the slope in context",
      "Distinguish confidence intervals for the mean response from prediction intervals",
      "State the assumptions that justify the t reference distribution",
    ],
    why: "A fitted slope of 2.1 might be noise. Inference answers: is the linear association distinguishable from zero, and how precisely do we know the rate?",
    story:
      "You fit score = 50 + 2·hours on a small class and get β̂₁ = 2. A skeptic says 'with this few students, maybe the true slope is 0 and you got lucky.' The SE of the slope and a t-test are how you answer that skeptic quantitatively.",
    idea: "Treat β̂₁ as an estimate with standard error SE(β̂₁). Then **t = β̂₁ / SE(β̂₁)** (for H₀: β₁=0) is referred to a t distribution with n−2 degrees of freedom. Large |t| → evidence of a nonzero slope. A CI is β̂₁ ± t* SE(β̂₁).",
    steps: [
      {
        title: "Fit the line and obtain SE(β̂₁)",
        body: "Software reports it; conceptually it grows with residual noise and shrinks when x-values are more spread out.",
      },
      {
        title: "Test the slope if that is the question",
        body: "H₀: β₁ = 0 vs H₁: β₁ ≠ 0 (or one-sided). t = β̂₁/SE, df = n−2.",
      },
      {
        title: "Build a CI for β₁",
        body: "β̂₁ ± t_{n−2, α/2} SE(β̂₁). Interpret units carefully.",
      },
      {
        title: "If predicting, choose mean vs new-observation interval",
        body: "CI for E[Y|X=x] is narrower; prediction interval for a new Y at x includes residual noise and is wider.",
      },
      {
        title: "Check assumptions roughly",
        body: "Residual plots for nonlinearity / fan shapes; independence of observations; normality more important for small n.",
      },
    ],
    mathSimple:
      "- **SE(β̂₁) ≈ s / √S_{xx}** where s is the residual standard error.\n- **t = (β̂₁ − β₁,0) / SE(β̂₁)**; usually β₁,0 = 0.\n- **df = n − 2** (two estimated coefficients).\n- **CI:** β̂₁ ± t* SE(β̂₁).\n\nPlain language: spread-out x's (large S_{xx}) make the slope easier to pin down; noisy residuals make it harder.",
    walkthrough:
      "n = 20, β̂₁ = 2.0, SE(β̂₁) = 0.8.\n\n1. t = 2.0/0.8 = 2.5, df = 18.\n2. Two-sided p ≈ 0.02 → reject β₁ = 0 at α = 0.05.\n3. 95% CI roughly 2.0 ± 2.1·0.8 ≈ (0.32, 3.68).\n4. Conclusion: data support a positive linear association; the rate is uncertain between about 0.3 and 3.7 y-units per x-unit.\n5. A prediction interval for one new student at a given x would be wider than the CI for the mean score at that x.",
    example:
      "If a CI for β₁ is (−0.4, 0.5) and contains 0, you typically fail to reject no linear association — even if R² is mildly positive by chance.",
    example2:
      "At x near x̄, the mean-response CI is tightest. Far into the tails of x, both mean CIs and prediction intervals widen — another warning against casual extrapolation.",
    labCue:
      "Use the **regression** lab inference view if available: display slope CI and simulate new samples to see β̂₁ vary. Compare mean-confidence bands vs prediction bands.",
    check: [
      "Why is df = n − 2 in SLR?",
      "What makes SE(β̂₁) smaller?",
      "Which is wider: prediction interval or mean-response CI at the same x?",
    ],
    practice: [
      {
        q: "β̂₁ = −1.2, SE = 0.4, n = 27. Compute t for H₀: β₁ = 0 and give df.",
        a: "t = −3, df = 25.",
      },
      {
        q: "A 95% CI for β₁ is (1.1, 1.4). Is H₀: β₁ = 0 rejected at α = 0.05 (two-sided)?",
        a: "Yes — 0 is not in the interval, equivalent to a two-sided test at 5%.",
      },
    ],
    formal:
      "Under the classical normal linear model, (β̂₁ − β₁)/SE(β̂₁) ~ t_{n−2} where SE uses the unbiased residual variance estimator. The same pivot yields CIs. Intervals for m(x)=β₀+β₁x and for a new observation Y_new(x)=m(x)+ε_new differ by whether Var(ε_new) is included. Robust / sandwich SEs relax homoscedasticity for slope tests in large samples.",
    formulas:
      "- t = β̂₁ / SE(β̂₁),  df = n − 2\n- CI: β̂₁ ± t_{n−2,α/2} SE(β̂₁)\n- SE(β̂₁) = s / √S_{xx}",
    derivation:
      "β̂₁ is a linear combination of the y_i's. Under i.i.d. normal errors, β̂₁ is normal with variance σ²/S_{xx}. Replacing σ with residual s introduces a χ² factor independent of β̂₁, producing a t_{n−2} pivot. Prediction intervals add an independent ε_new draw, increasing variance by σ² relative to the mean-response interval.",
    pitfalls: [
      "Reporting β̂₁ without SE/CI/p-value when claiming significance",
      "Using inference after heavy data dredging without adjustment",
      "Ignoring dependence (time series) that invalidates default SEs",
      "Confusing a significant slope with a large or important slope",
    ],
    interview:
      "I'd test or interval-estimate the slope with df=n−2, interpret in units, distinguish mean vs prediction intervals, and mention residual checks for the classical assumptions.",
    bridge:
      "Inference assumes the linear model is roughly right. Residual analysis is how we audit that assumption.",
  }),

  buildLesson({
    title: "Residual Analysis",
    partLabel: PART,
    principles: [
      "Residuals e_i = y_i − ŷ_i estimate the unknown errors",
      "A good linear fit shows residuals as patternless scatter vs fitted values or vs x",
      "Curvature in residual plots signals nonlinearity",
      "Fan shapes signal non-constant variance (heteroscedasticity)",
      "Large residuals and high-leverage points can unduly influence the fit",
    ],
    objectives: [
      "Build and read a residual-vs-fitted plot",
      "Recognize nonlinearity and heteroscedasticity visually",
      "Explain leverage vs residual magnitude",
      "Propose simple remedies (transform, nonlinear term, weighted methods)",
    ],
    why: "A regression can look fine in a table and still be structurally wrong. Residuals are the model's confession file — read them before shipping predictions.",
    story:
      "You fit a straight line to growth data. R² looks decent. Residual plot shows a clear U-shape: negative residuals in the middle, positive at both ends. The line was a compromise through a curve — predictions systematically high in the middle and low at the ends. The residual plot caught what R² alone hid.",
    idea: "After fitting, plot **residuals vs fitted values** (or vs x). Ideal: horizontal blur with no trend, roughly constant vertical spread. Curves ⇒ wrong form. Wedges ⇒ variance changes with level. Isolated huge residuals ⇒ check data errors or special cases. Points with unusual x (leverage) can tilt the whole line.",
    steps: [
      {
        title: "Fit the model and compute e_i",
        body: "e_i = y_i − ŷ_i for each observation.",
      },
      {
        title: "Plot e vs ŷ (and vs x)",
        body: "Primary diagnostic canvas for SLR.",
      },
      {
        title: "Look for structure",
        body: "Trend/curve? Changing spread? Clusters? A few extreme points?",
      },
      {
        title: "Check normal QQ of residuals if using small-sample t inference",
        body: "Heavy tails or skew may matter for exact p-values; large n is more forgiving for slope inference.",
      },
      {
        title: "Remediate thoughtfully",
        body: "Transform y or x, add x², use GLM/WLS, or separate populations — don't just delete inconvenient points without cause.",
      },
    ],
    mathSimple:
      "- **Residual:** e_i = y_i − ŷ_i.\n- **Residual standard error:** s ≈ √(Σ e_i² / (n−2)) in SLR.\n- **Standardized residual:** e_i / (s √(1−h_i)) roughly, where h_i is leverage.\n\nGentle rule: if residuals still contain a visible story about x, the model has not finished its job.",
    walkthrough:
      "Suppose residuals vs x show a U-shape.\n\n1. Diagnosis: linear mean function is inadequate.\n2. Try adding a quadratic term or transforming x.\n3. Refit; residual plot should look more like noise.\n4. If instead residuals fan out as ŷ grows, consider log y or weighted least squares.\n5. If one point has extreme x and large residual, report fits with and without it — influence analysis.",
    example:
      "Residuals randomly scattered around 0 with even spread → linear model is plausible (not proven, but supported). No free lunch: always possible to miss a subtle pattern.",
    example2:
      "Count data with many zeros may show curved residual structure under a naive linear model — a signal to consider a different mean function (e.g. Poisson/log), not to 'try harder' with the same line.",
    labCue:
      "In the **regression** lab, display residual plots while you bend the true cloud into a curve or add heteroscedastic noise. Practice naming the pattern before fixing it.",
    check: [
      "What does a U-shaped residual plot suggest?",
      "What does a fan-shaped residual plot suggest?",
      "Why can a high-leverage point be dangerous even with a moderate residual?",
    ],
    practice: [
      {
        q: "Residual plot shows a clear upward trend vs x. What does that mean for SLR?",
        a: "The linear model is misspecified — systematic structure remains. Consider a different form or missing variable that correlates with x.",
      },
      {
        q: "One point has x far from the others. Why check it carefully?",
        a: "High leverage: it can tilt β̂₁ strongly. Verify the value, and report sensitivity of the fit to that point.",
      },
    ],
    formal:
      "In the projection view, residuals are y minus its projection onto the column space of the design matrix; they are orthogonal to fitted values when an intercept is included. Diagnostic plots estimate patterns in E[ε|X] and Var(ε|X). Cook's distance and DFBETAS quantify influence. Formal tests (Breusch–Pagan, RESET) exist but visuals remain essential.",
    formulas:
      "- e_i = y_i − ŷ_i\n- s² = Σ e_i² / (n − 2)  (SLR)\n- Plot e_i vs ŷ_i to audit assumptions",
    derivation:
      "If the true mean is m(x) and you fit a line ℓ(x), then e ≈ m(x)−ℓ(x)+noise. Any systematic m−ℓ appears as a pattern in residual plots. If Var(ε|x) grows with x, residual spread grows with x — the fan shape. Leverage h_i = ∂ŷ_i/∂y_i is large when x_i is extreme; such points pull the fit because OLS minimizes squared errors globally.",
    pitfalls: [
      "Trusting R²/p-values without residual plots",
      "Deleting outliers solely to beautify R²",
      "Ignoring heteroscedasticity when using default SEs",
      "Assuming residual normality is the most important assumption for large-n slope estimates (often linearity/independence/variance matter more)",
    ],
    interview:
      "I'd always show residual-vs-fitted plots, call out curvature or fans, discuss leverage/influence, and only then trust slope inference or predictions.",
    bridge:
      "Part 8 stayed with one predictor. Part 9 opens optional extensions: rank tests, multiple regression, Bayesian updating, and the bootstrap.",
  }),
];
