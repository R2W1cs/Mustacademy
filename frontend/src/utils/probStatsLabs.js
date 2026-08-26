/**
 * Exact lesson title → ProbabilityVisualizer lab(s) for MATH 270.
 * Returns [{ type, config? }] — consumed by resolveLessonVisualizers.
 */

const p = (type, config) => ({ type, config: config || {} });

/** Exact titles from math270 unit modules */
export const PROB_STATS_LABS = {
  "Types of Data": [p("dataTypes")],
  "Frequency Distributions and Histograms": [p("histogram")],
  "Measures of Central Tendency": [p("centralTendency")],
  "Measures of Dispersion": [p("dispersion")],
  "Percentiles Quartiles and Box Plots": [p("histogramBox")],
  "Skewness and Kurtosis": [p("histogram")],

  "Basic Probability Concepts": [p("sampleSpace")],
  "Axioms of Probability": [p("sampleSpace")],
  "Conditional Probability": [p("conditional")],
  "Bayes Theorem": [p("bayes")],
  "Independence of Events": [p("independence")],
  "Counting Principles": [p("counting")],

  "Discrete Random Variables and PMFs": [p("pmf")],
  "Continuous Random Variables and PDFs": [p("pdf")],
  "Cumulative Distribution Functions": [p("cdf")],
  "Expected Value and Variance": [p("expectation")],
  "Properties of Expectation and Variance": [p("expectation")],

  "Bernoulli and Binomial Distributions": [p("pmfBinomial")],
  "Geometric and Negative Binomial Distributions": [p("pmfGeometric")],
  "Poisson Distribution": [p("pmfPoisson")],
  "Uniform Distribution": [p("pdfUniform")],
  "Normal Distribution": [p("pdfNormal")],
  "Standard Normal and Z-Scores": [p("pdfNormal")],
  "Exponential Distribution": [p("pdfExponential")],
  "Gamma and Chi-Square Distributions": [p("pdfChi2")],
  "Beta Distribution": [p("pdfBeta")],

  "Joint Probability Distributions": [p("joint")],
  "Marginal and Conditional Distributions": [p("joint")],
  "Covariance and Correlation": [p("regression")],
  "Independence of Random Variables": [p("joint")],
  "Linear Combinations of Random Variables": [p("lln")],
  "Law of Large Numbers": [p("lln")],
  "Central Limit Theorem": [p("clt")],

  "Populations and Samples": [p("sampling")],
  "Sampling Distributions": [p("sampling")],
  "Point Estimation": [p("estimation")],
  "Method of Moments": [p("estimation")],
  "Maximum Likelihood Estimation": [p("estimation")],
  "Confidence Intervals for Means": [p("confidence")],
  "Confidence Intervals for Proportions": [p("confidence")],

  "Null and Alternative Hypotheses": [p("hypothesis")],
  "Type I and Type II Errors": [p("hypothesis")],
  "Z-Tests and T-Tests": [p("hypothesis")],
  "Paired T-Tests": [p("hypothesis")],
  "Chi-Square Goodness of Fit": [p("hypothesis")],
  "Chi-Square Test for Independence": [p("joint")],
  "One-Way ANOVA": [p("hypothesis")],

  "Scatter Plots and Correlation": [p("regression")],
  "Simple Linear Regression": [p("regression")],
  "Interpreting Regression Coefficients": [p("regression")],
  "Coefficient of Determination": [p("regression")],
  "Inference in Regression": [p("regression")],
  "Residual Analysis": [p("regression")],

  "Non-Parametric Tests": [p("hypothesis")],
  "Multiple Linear Regression Intro": [p("regression")],
  "Bayesian Statistics Intro": [p("bayes")],
  "Bootstrapping and Resampling": [p("bootstrap")],
};

/**
 * @param {string} title
 * @returns {Array<{ type: string, config?: object }>}
 */
export function resolveProbStatsLabs(title) {
  if (!title) return [];
  if (PROB_STATS_LABS[title]) return PROB_STATS_LABS[title];

  // Soft match: exact key as substring (titles stay locked, but tolerate small edits)
  const hit = Object.keys(PROB_STATS_LABS).find(
    (k) => title === k || title.includes(k) || k.includes(title)
  );
  return hit ? PROB_STATS_LABS[hit] : [];
}
