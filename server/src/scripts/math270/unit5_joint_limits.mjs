import { buildLesson } from "./helper.mjs";

const PART = "Part 5: Joint Distributions and Limit Theorems";

export const topics = [
  buildLesson({
    title: "Joint Probability Distributions",
    partLabel: PART,
    principles: [
      "A joint distribution describes two or more random variables together",
      "Discrete pairs use a joint PMF p(x,y); continuous pairs use a joint PDF f(x,y)",
      "Probabilities are double sums or double integrals over regions in the plane",
      "Independence is a special case where the joint factors into a product of marginals",
    ],
    objectives: [
      "Read and build a joint PMF table for small discrete examples",
      "Compute P((X,Y)∈A) by summing or integrating over a region",
      "Contrast joint information with separate one-variable information",
      "Interpret continuous joint density as surface height whose volume is probability",
    ],
    why: "Real systems rarely give you one number in isolation. Latency and packet loss move together; midterm and final scores share student effects; height and weight are associated. A joint distribution is the full probabilistic description of the pair — everything else (marginals, conditionals, correlation) is derived from it.",
    story: "A game draws two fair coins. Let X be 1 if the first is heads, Y be 1 if the second is heads. The joint distribution on {0,1}×{0,1} puts mass 1/4 on each of the four pairs. From that one table you can answer any question about the pair: P(X=Y), P(X+Y=1), and later whether X and Y are independent (they are). If the coins were glued together to always match, the joint would change even if each coin still looked fair marginally.",
    idea: "The **joint PMF** p(x,y)=P(X=x,Y=y) assigns non-negative weights to pairs that sum to 1. The **joint PDF** f(x,y) is a surface; probability is volume under the surface over a region. Marginals alone do not determine the joint — many dependence structures can share the same one-variable laws.",
    steps: [
      {
        title: "Name the variables and their supports",
        body: "Write what X and Y measure and which values (or regions) are possible. For discrete problems, list every plausible pair (x,y). Impossible pairs get joint probability 0.",
      },
      {
        title: "Assign joint weights or a joint density formula",
        body: "Fill a table of p(x,y) or write f(x,y) on its support. Check normalization: ΣΣ p=1 or ∫∫ f=1. If a word problem gives a constant density on a geometric region, the constant is 1 over the area of that region.",
      },
      {
        title: "Translate the event into a region",
        body: "P(X>Y), P(X²+Y²≤1), P(X=0,Y=1) each correspond to a set of pairs. Sketch the set — sketches prevent summing the wrong cells.",
      },
      {
        title: "Sum or integrate over the region",
        body: "Discrete: add joint masses on the favorable cells. Continuous: integrate f over the region. For rectangles with a product structure, the double integral may factor — but only use factoring when it is justified.",
      },
      {
        title: "Sanity-check against marginal intuition",
        body: "After computing, ask whether the answer is compatible with rough marginal probabilities. Huge disagreements often mean the region or normalization is wrong.",
      },
    ],
    mathSimple: "One variable puts mass on a line (or curve). Two variables put mass on a plane. 'Add the relevant probabilities' becomes 'add the relevant cells' or 'integrate over the blob you care about.' The only new discipline is keeping track of two coordinates at once.",
    walkthrough: "Joint PMF of (X,Y): p(0,0)=0.1, p(0,1)=0.2, p(1,0)=0.3, p(1,1)=0.4. Check sum=1. P(X=Y)=p(0,0)+p(1,1)=0.5. P(X+Y≥1)=1−p(0,0)=0.9. P(X=1)=p(1,0)+p(1,1)=0.7 — that is a marginal, obtained by collapsing the joint.",
    example: "Two fair independent coin indicators (X,Y) on {0,1}² with each joint mass 1/4. P(X=Y)=P(00)+P(11)=1/2. P(X+Y=1)=1/2.",
    example2: "Continuous: (X,Y) uniform on the unit square [0,1]×[0,1], so f=1. P(Y<X)= area of the triangle below the diagonal = 1/2. P(X²+Y²≤1) is the area of the quarter disk = π/4 ≈ 0.785.",
    labCue: "Open the **joint** lab. Inspect the heatmap of joint mass or density. Hover or select cells to read p(x,y), and shade a region to see the summed probability update live.",
    check: [
      "Must a joint PMF sum to 1 over all pairs?",
      "Can two different joints share the same marginals?",
      "For a continuous joint PDF, what is P(X=x,Y=y) for a single point?",
    ],
    practice: [
      {
        q: "Using p(0,0)=0.2, p(0,1)=0.3, p(1,0)=0.1, p(1,1)=0.4, find P(X≤Y).",
        a: "Favorable: (0,0),(0,1),(1,1). Sum=0.2+0.3+0.4=0.9. (Exclude (1,0).)",
      },
      {
        q: "If (X,Y) is uniform on the triangle x≥0,y≥0,x+y≤1, what is the joint density height?",
        a: "Area of the triangle is 1/2, so f(x,y)=2 on that triangle (and 0 elsewhere).",
      },
    ],
    formal: "The joint CDF is F_{X,Y}(x,y)=P(X≤x,Y≤y). For discrete pairs, p(x,y)=P(X=x,Y=y). For absolutely continuous pairs, F(x,y)=∫_{−∞}^x ∫_{−∞}^y f(u,v) dv du. The joint determines all probabilities of product-space events.",
    formulas: "- Σ_x Σ_y p(x,y)=1\n- ∫∫ f(x,y) dx dy=1\n- P((X,Y)∈A)=ΣΣ_{(x,y)∈A} p(x,y) or ∫∫_A f\n- F_{X,Y}(x,y)=P(X≤x,Y≤y)",
    derivation: "For a finite discrete support, non-negative weights that sum to 1 are exactly the set of probability measures on that support — the joint PMF is just that measure written as a table. Continuous densities arise as limits of probabilities on small rectangles divided by area: P((X,Y)∈dx dy)/ (dx dy) → f(x,y).",
    pitfalls: [
      "Assuming marginals determine the joint (they do not)",
      "Treating a joint density height as a probability",
      "Forgetting to normalize a constant density on a geometric region",
      "Summing only one variable when the event depends on both",
    ],
    interview: "Emphasize that the joint is the full story for the pair, and that dependence lives in the joint structure beyond the marginals. Offer a 2×2 table example if asked to be concrete.",
    bridge: "Once you have a joint, you often need one-variable summaries (marginals) or 'given Y=y, what about X?' (conditionals) — the next lesson.",
  }),

  buildLesson({
    title: "Marginal and Conditional Distributions",
    partLabel: PART,
    principles: [
      "Marginals collapse a joint by summing or integrating out the other variable",
      "Conditionals renormalize a slice of the joint given a fixed value",
      "p(x|y)=p(x,y)/p_Y(y) and f(x|y)=f(x,y)/f_Y(y)",
      "The factorization joint = conditional × marginal rebuilds the full pair law",
    ],
    objectives: [
      "Compute discrete and continuous marginal distributions from a joint",
      "Form conditional PMFs/PDFs and interpret them as renormalized slices",
      "Reconstruct a joint from a conditional and a marginal",
      "Explain why identical marginals can still hide strong dependence",
    ],
    why: "You frequently observe one variable and need the law of the other: given the network is congested (Y=1), what is the distribution of latency X? Marginals answer 'ignore the other variable'; conditionals answer 'update after seeing it.' Together with the joint, they are the core language of dependence.",
    story: "A 2×2 joint for (spam indicator X, flagged-by-filter Y) shows that most flagged emails are spam, but not all spam is flagged. The marginal P(X=1) is the overall spam rate. The conditional P(X=1|Y=1) is the precision of the filter — usually much larger than the marginal. Same numbers, different questions.",
    idea: "To get the **marginal** of X, erase Y by summing/integrating the joint over y. To get the **conditional** of X given Y=y, take the joint slice at that y and divide by P(Y=y) so the slice sums (or integrates) to 1.",
    steps: [
      {
        title: "Start from a clean joint",
        body: "Have p(x,y) or f(x,y) normalized. Conditionals are undefined or unstable when the conditioning event has probability 0 — avoid dividing by a zero marginal.",
      },
      {
        title: "Marginalize",
        body: "p_X(x)=Σ_y p(x,y) and f_X(x)=∫ f(x,y) dy (and similarly for Y). In a table, add across the row or down the column.",
      },
      {
        title: "Fix the observed value",
        body: "Suppose Y=y₀ is given. Extract the slice p(x,y₀) for all x (or f(x,y₀)).",
      },
      {
        title: "Renormalize to get the conditional",
        body: "Divide by p_Y(y₀). Check that the conditional sums/integrates to 1 over x. Interpret: 'among units with Y=y₀, how is X distributed?'",
      },
      {
        title: "Rebuild when given pieces",
        body: "If you know p(x|y) and p_Y(y), then p(x,y)=p(x|y)p_Y(y). This is how hierarchical models specify joints.",
      },
    ],
    mathSimple: "Marginalizing is 'I don't know Y, so I average over its possibilities using the joint weights.' Conditioning is 'I learned Y=y, so I discard other rows/columns and rescale what remains to 100%.'",
    walkthrough: "Joint: p(0,0)=0.1, p(0,1)=0.2, p(1,0)=0.3, p(1,1)=0.4. Marginal P(Y=0)=0.1+0.3=0.4, P(Y=1)=0.6. Conditional P(X=1|Y=0)=0.3/0.4=0.75. P(X=1|Y=1)=0.4/0.6≈0.667. Marginal P(X=1)=0.7 — different from both conditionals, as expected under dependence.",
    example: "From a 2×2 joint, P(X=1|Y=0)=p(1,0)/P(Y=0). If p(1,0)=0.1 and P(Y=0)=0.4, the conditional is 0.25.",
    example2: "Continuous: f(x,y)=2 for x>0,y>0,x+y<1 (unit triangle). Marginal f_X(x)=∫_0^{1−x} 2 dy=2(1−x) for 0<x<1. Conditional f(y|x)=2 / (2(1−x))=1/(1−x) for 0<y<1−x — uniform on the remaining vertical segment.",
    labCue: "In the **joint** lab, display marginal bar charts beside the heatmap. Click a fixed row or column to highlight the conditional distribution after renormalization.",
    check: [
      "Can two pairs share identical marginals but different conditionals?",
      "Write the formula for p(x|y).",
      "What goes wrong if you forget to renormalize a joint slice?",
    ],
    practice: [
      {
        q: "Given p(0,0)=0.25, p(0,1)=0.25, p(1,0)=0.25, p(1,1)=0.25, find P(X=1|Y=1).",
        a: "P(Y=1)=0.5, p(1,1)=0.25, so P(X=1|Y=1)=0.5. (Here X⊥Y actually.)",
      },
      {
        q: "If p(x|y) = 0.8 for x=1 when y=1, and P(Y=1)=0.3, what is p(1,1)?",
        a: "p(1,1)=p(1|1)P(Y=1)=0.8×0.3=0.24.",
      },
    ],
    formal: "p_X(x)=Σ_y p(x,y), f_X(x)=∫ f(x,y) dy. Conditional p(x|y)=p(x,y)/p_Y(y) when p_Y(y)>0; f(x|y)=f(x,y)/f_Y(y) when f_Y(y)>0. Bayes: p(y|x)=p(x|y)p_Y(y)/p_X(x).",
    formulas: "- p_X(x)=Σ_y p(x,y)\n- p(x|y)=p(x,y)/p_Y(y)\n- p(x,y)=p(x|y)p_Y(y)\n- Analogous formulas with integrals for continuous densities",
    derivation: "The definition P(X∈A|Y=y)=P(X∈A,Y=y)/P(Y=y) applied to singleton sets (discrete) yields p(x|y). Continuous conditionals are defined so that integrals against f(x|y) reproduce the same conditional probabilities for nice sets; the ratio of densities is the natural Radon–Nikodym version of that idea.",
    pitfalls: [
      "Forgetting to renormalize when forming conditionals",
      "Confusing p(x|y) with p(y|x)",
      "Dividing by a marginal estimate of 0",
      "Thinking 'same marginals' implies 'same relationship'",
    ],
    interview: "Define marginal as 'averaging out' and conditional as 'renormalizing a slice,' then write p(x,y)=p(x|y)p(y). That factorization is often what interviewers want to hear.",
    bridge: "To summarize dependence with a single number, we use covariance and correlation — useful, but incomplete for nonlinear relationships.",
  }),

  buildLesson({
    title: "Covariance and Correlation",
    partLabel: PART,
    principles: [
      "Covariance measures how X and Y move together around their means",
      "Correlation rescales covariance to the unitless range [−1,1]",
      "Uncorrelated (ρ=0) is weaker than independent",
      "Correlation captures linear association, not causation and not all dependence",
    ],
    objectives: [
      "Compute Cov(X,Y)=E[(X−μ_X)(Y−μ_Y)] and the computational form E[XY]−μ_X μ_Y",
      "Convert covariance to correlation ρ=Cov/(σ_X σ_Y)",
      "Interpret the sign and magnitude of ρ",
      "Give examples where dependence exists but correlation is zero",
    ],
    why: "After seeing a joint, people ask 'do they move together?' Covariance and correlation give a first numeric answer. They appear in portfolio risk, regression, PCA, and the variance of sums. They are also dangerously easy to over-interpret — so this lesson builds both the computation and the skepticism.",
    story: "Hours studied X and exam score Y tend to rise together: positive covariance. Outside temperature and heater energy use tend to move oppositely: negative covariance. Now take X~N(0,1) and Y=X². They are strongly dependent — knowing X pins down Y — but Cov(X,Y)=0 by symmetry. Correlation missed the story because the relationship is curved, not linear.",
    idea: "Cov(X,Y)=E[(X−μ_X)(Y−μ_Y)]. Positive when X and Y tend to be on the same side of their means together. **Correlation** ρ=Cov(X,Y)/(σ_X σ_Y) removes units and bounds the value by 1 in absolute value for finite variances.",
    steps: [
      {
        title: "Find the means",
        body: "Compute μ_X and μ_Y from the joint or from marginals. Centered products are the heart of covariance.",
      },
      {
        title: "Compute E[XY] or average the centered products",
        body: "Discrete: ΣΣ xy p(x,y). Then Cov=E[XY]−μ_X μ_Y. Alternatively average (x−μ_X)(y−μ_Y) with joint weights — same result.",
      },
      {
        title: "Get standard deviations",
        body: "σ_X=√Var(X), σ_Y=√Var(Y). Correlation needs both. If either SD is 0, correlation is undefined.",
      },
      {
        title: "Form ρ and interpret",
        body: "ρ near 1: strong positive linear association. Near −1: strong negative. Near 0: little linear association — not necessarily independence.",
      },
      {
        title: "Use the variance-sum identity",
        body: "Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y). This is why covariance matters operationally, not only descriptively.",
      },
    ],
    mathSimple: "When both variables are above average at the same time, the product of deviations is positive and covariance rises. Correlation divides by the product of SDs so a change of units (°C vs °F, dollars vs cents) cannot inflate the association measure.",
    walkthrough: "Two fair independent coin indicators: E[X]=E[Y]=1/2, E[XY]=P(X=Y=1)=1/4, Cov=1/4−1/4=0, ρ=0 — as independence requires. Now change the joint to p(0,0)=p(1,1)=1/2: then E[XY]=1/2, means still 1/2, Cov=1/2−1/4=1/4, σ_X=σ_Y=1/2, ρ=(1/4)/(1/4)=1 — perfect positive linear association (Y=X always).",
    example: "If Cov(X,Y)=6, σ_X=3, σ_Y=4, then ρ=6/(3·4)=0.5 — a moderate positive linear association.",
    example2: "X uniform on {−2,−1,1,2} each with probability 1/4, Y=X². Then E[X]=0, E[XY]=E[X³]=0, so Cov=0, but Y is a deterministic function of X. Dependence without correlation.",
    labCue: "In the **joint** lab, compare a tightly diagonal cloud (ρ near ±1) with a circular cloud (ρ near 0) and with a curved horseshoe (dependence with small ρ). Watch Cov and ρ readouts if the lab provides them.",
    check: [
      "What is Cov(X,X)?",
      "If ρ=0, are X and Y always independent?",
      "How does Cov(aX,bY) scale?",
    ],
    practice: [
      {
        q: "Var(X)=4, Var(Y)=9, Cov(X,Y)=3. Find ρ and Var(X+Y).",
        a: "ρ=3/(2·3)=0.5. Var(X+Y)=4+9+2·3=19.",
      },
      {
        q: "Show Cov(X,Y)=E[XY]−μ_X μ_Y starting from E[(X−μ_X)(Y−μ_Y)].",
        a: "Expand: E[XY−μ_X Y−μ_Y X+μ_X μ_Y]=E[XY]−μ_X μ_Y−μ_Y μ_X+μ_X μ_Y=E[XY]−μ_X μ_Y.",
      },
    ],
    formal: "Cov(X,Y)=E[(X−E[X])(Y−E[Y])]=E[XY]−E[X]E[Y] when expectations exist. Corr(X,Y)=Cov(X,Y)/(√Var(X)√Var(Y)). |ρ|≤1 by Cauchy–Schwarz. Independence ⇒ Cov=0 when second moments exist; converse false in general. Joint normality is a notable case where uncorrelated implies independent.",
    formulas: "- Cov(X,Y)=E[XY]−μ_X μ_Y\n- ρ=Cov/(σ_X σ_Y)\n- Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)\n- Cov(aX+b,cY+d)=ac Cov(X,Y)",
    derivation: "The computational formula expands from the definition as in the practice answer. The bound |ρ|≤1 follows from Cauchy–Schwarz on the centered variables: |E[UV]|≤√E[U²]√E[V²] with U=X−μ_X, V=Y−μ_Y.",
    pitfalls: [
      "Interpreting ρ=0 as independence",
      "Claiming correlation implies causation",
      "Forgetting to center before averaging products",
      "Comparing covariances across different units (use correlation instead)",
    ],
    interview: "Define Cov and ρ, state |ρ|≤1, and give the X and X² counterexample for 'uncorrelated ⇏ independent.' Mention that for jointly normal variables, uncorrelated does imply independent.",
    bridge: "Independence is the strongest 'no relationship' statement — stronger than ρ=0 — and it unlocks product probabilities and additive variances.",
  }),

  buildLesson({
    title: "Independence of Random Variables",
    partLabel: PART,
    principles: [
      "Independence means the joint factors: p(x,y)=p_X(x)p_Y(y) (or f(x,y)=f_X(x)f_Y(y))",
      "Independence ⇒ uncorrelated (when variances exist), but not conversely",
      "Under independence, P(X∈A,Y∈B)=P(X∈A)P(Y∈B)",
      "Many formulas (Var of sums, likelihoods) become simple only under independence",
    ],
    objectives: [
      "Test independence from a joint table or density",
      "Use product rules for probabilities of rectangle events",
      "Distinguish independence from zero correlation",
      "Explain why i.i.d. assumptions appear throughout sampling theory",
    ],
    why: "Independence is the modeling assumption that lets us multiply probabilities, add variances, and treat samples as separate information. It is rarely perfectly true, but it is often a useful approximation — and you must know what breaks when it fails.",
    story: "Two servers in different regions fail independently with probability 0.01 each. The probability both fail is 0.0001 — product rule. Two servers on the same rack sharing a power unit are not independent: P(both fail) can be much larger than the product of marginals because a shared shock hits both.",
    idea: "X and Y are **independent** if knowing Y tells you nothing new about X: p(x|y)=p_X(x) for all y (with positive marginal), equivalently the joint equals the product of marginals everywhere.",
    steps: [
      {
        title: "Compute or obtain the marginals",
        body: "From the joint, find p_X and p_Y (or f_X and f_Y).",
      },
      {
        title: "Form the product table/surface",
        body: "Compute p_X(x)p_Y(y) for every pair (or f_X f_Y).",
      },
      {
        title: "Compare to the joint",
        body: "Independence holds iff joint equals product everywhere on the support. A single mismatched cell kills independence.",
      },
      {
        title: "Use consequences carefully",
        body: "If independent: E[XY]=E[X]E[Y], Cov=0, Var(X+Y)=Var(X)+Var(Y), and rectangle probabilities factor. Do not use these as tests in the wrong direction without checking.",
      },
      {
        title: "Extend to collections",
        body: "Mutual independence of many variables requires the joint of every finite subcollection to factor. Pairwise independence is weaker than full mutual independence.",
      },
    ],
    mathSimple: "Independence means 'no information flow either way.' In equations, that becomes multiplication: the weight of a pair is the product of the individual weights. If any pair is over- or under-represented relative to that product, there is dependence.",
    walkthrough: "Joint masses: 0.1,0.2 on row X=0 and 0.3,0.4 on row X=1 for Y=0,1. Marginals: P(X=0)=0.3, P(X=1)=0.7, P(Y=0)=0.4, P(Y=1)=0.6. Product for (0,0) would be 0.3×0.4=0.12 ≠ 0.1 — not independent. Cov may still be computed separately; here dependence is already settled.",
    example: "Fair independent coins: each joint mass 1/4 equals (1/2)×(1/2). Dependent glued coins with P(X=Y=1)=P(X=Y=0)=1/2 fail the product test.",
    example2: "Continuous: f(x,y)=1 on the unit square factors as 1·1=f_X(x)f_Y(y) with Uniform(0,1) margins — independent. Uniform on the triangle x+y≤1 does not factor — large x forces y to be small.",
    labCue: "In the **joint** lab, toggle or compare an independent product heatmap versus a dependent one with the same marginal bars. Notice that matching marginals do not force matching joints.",
    check: [
      "If X⊥Y, what is P(X∈A,Y∈B)?",
      "Does Cov=0 prove independence?",
      "What is pairwise vs mutual independence in one sentence?",
    ],
    practice: [
      {
        q: "Fill in the missing joint mass to make a 2×2 table independent if margins are P(X=0)=P(X=1)=1/2 and P(Y=0)=1/3, P(Y=1)=2/3, and p(0,0)=1/6.",
        a: "Under independence p(0,0)=(1/2)(1/3)=1/6 (already ok). Then p(0,1)=(1/2)(2/3)=1/3, p(1,0)=1/6, p(1,1)=1/3.",
      },
      {
        q: "X⊥Y with Var(X)=2, Var(Y)=5. What is Var(X−Y)?",
        a: "Var(X)+Var(Y)=7 because Cov(X,Y)=0 under independence (and Var(−Y)=Var(Y)).",
      },
    ],
    formal: "X⊥Y iff F_{X,Y}(x,y)=F_X(x)F_Y(y) for all x,y (equivalently PMFs/PDFs factor when they exist). Independence ⇒ E[g(X)h(Y)]=E[g(X)]E[h(Y)] for suitable g,h. For multivariate normals, pairwise uncorrelation implies full independence.",
    formulas: "- p(x,y)=p_X(x)p_Y(y) under independence\n- P(X∈A,Y∈B)=P(X∈A)P(Y∈B)\n- E[XY]=E[X]E[Y], Cov=0\n- Var(Σ X_i)=Σ Var(X_i) for independent summands",
    derivation: "From p(x|y)=p_X(x) for all y, multiply by p_Y(y) to get p(x,y)=p_X(x)p_Y(y). Conversely, if the joint factors and p_Y(y)>0, dividing recovers p(x|y)=p_X(x). The expectation factorization follows by writing E[g(X)h(Y)] as a double sum/integral of g(x)h(y)p_X(x)p_Y(y).",
    pitfalls: [
      "Checking only Cov=0 and declaring independence",
      "Confusing pairwise independence with mutual independence",
      "Assuming sampling without replacement yields independent indicators",
      "Using product rules on events that are not a product set without justification",
    ],
    interview: "Give the product factorization definition, note that independence ⇒ ρ=0 but not conversely, and mention i.i.d. samples as the standard assumption behind SE formulas.",
    bridge: "With independence (or known covariances), you can analyze linear combinations aX+bY — means, variances, and sometimes exact distributions.",
  }),

  buildLesson({
    title: "Linear Combinations of Random Variables",
    partLabel: PART,
    principles: [
      "Expectation is linear: E[aX+bY]=aE[X]+bE[Y] always",
      "Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab Cov(X,Y)",
      "Independent (or uncorrelated) summands drop the covariance term",
      "Linear combinations of independent normals are normal",
    ],
    objectives: [
      "Compute means of linear combinations without distributional assumptions",
      "Compute variances with the correct covariance term",
      "Specialize to independent sums and differences",
      "Apply the normal closure property for independent Gaussian noise",
    ],
    why: "Totals, averages, contrasts, and portfolio returns are linear combinations. Almost every standard error later in the course is a special case of these variance formulas. Mastering them once pays off permanently.",
    story: "You compare two load times: D=X−Y for pages A and B. Even if you only know means and variances (and Cov if dependent), you can find E[D] and Var(D). If X and Y are independent normals, D is normal too — so probabilities about 'A is slower by more than 200ms' become Φ calculations.",
    idea: "Means pass through linear combinations freely. Variances need squares on the coefficients and a cross term for dependence. Independence is the gift that sets Cov=0 and lets variances simply add after scaling.",
    steps: [
      {
        title: "Write the combination clearly",
        body: "Express the quantity of interest as aX+bY+c (or a sum of many terms). Identify each coefficient.",
      },
      {
        title: "Take expectations by linearity",
        body: "E[aX+bY+c]=aμ_X+bμ_Y+c. No independence required. This step is almost always safe.",
      },
      {
        title: "Expand the variance",
        body: "Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab Cov(X,Y). If independent/uncorrelated, drop the cross term. Remember Var(c)=0 and shifts do not affect variance.",
      },
      {
        title: "Specialize to sums and averages",
        body: "For i.i.d. sum S_n=X_1+…+X_n: E[S_n]=nμ, Var(S_n)=nσ². For the average X̄=S_n/n: E[X̄]=μ, Var(X̄)=σ²/n. That 1/n is the mathematical reason larger samples stabilize averages.",
      },
      {
        title: "Invoke normality when applicable",
        body: "Independent X~N(μ_X,σ_X²), Y~N(μ_Y,σ_Y²) ⇒ aX+bY ~ N(aμ_X+bμ_Y, a²σ_X²+b²σ_Y²). Without normality, you still have mean and variance, but not necessarily a normal shape.",
      },
    ],
    mathSimple: "Linearity of expectation is 'averages add' even when variables are entangled. Variance is pickier because squared deviations expand with a cross-product term — that term is covariance. Independence deletes the entanglement penalty.",
    walkthrough: "X and Y independent with E[X]=2, E[Y]=5, Var(X)=4, Var(Y)=9. For W=3X−2Y: E[W]=6−10=−4. Var(W)=9·4+4·9=36+36=72 (no cov term). SD(W)=√72≈8.49. If instead Cov(X,Y)=2, Var(W)=72+2·3·(−2)·2=72−24=48.",
    example: "i.i.d. with Var=4. Var(3X−2)=9·4=36. For independent X,Y each with Var=4: Var(X+Y)=8, Var(X−Y)=8.",
    example2: "X̄ from n=25 i.i.d. observations with σ=10: Var(X̄)=100/25=4, SE=2. Compare to one observation's SD of 10 — the average is much steadier.",
    labCue: "In the **expectation** or **sampling** lab, form averages of more variables and watch the variance of the average shrink roughly like 1/n when draws are independent.",
    check: [
      "Does E[X+Y]=E[X]+E[Y] require independence?",
      "What is Var(X+X) if Var(X)=σ²?",
      "Why does Var(X̄)=σ²/n rather than σ²/n² wait — confirm the algebra.",
    ],
    practice: [
      {
        q: "Var(X)=3, Var(Y)=5, Cov(X,Y)=−1. Find Var(2X+3Y).",
        a: "4·3+9·5+2·2·3·(−1)=12+45−12=45.",
      },
      {
        q: "i.i.d. X_i with mean 6 and variance 9. For n=16, find E[X̄] and SD(X̄).",
        a: "E[X̄]=6, Var(X̄)=9/16, SD=3/4=0.75.",
      },
    ],
    formal: "For square-integrable RVs, Var(Σ a_i X_i)=Σ_i Σ_j a_i a_j Cov(X_i,X_j). If the X_i are independent, this diagonalizes to Σ a_i² Var(X_i). Affine images of multivariate normals remain multivariate normal; hence univariate linear combinations are univariate normal.",
    formulas: "- E[aX+bY+c]=aE[X]+bE[Y]+c\n- Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab Cov(X,Y)\n- Independent ⇒ Var(Σ X_i)=Σ Var(X_i)\n- i.i.d.: Var(X̄)=σ²/n",
    derivation: "Var(aX+bY)=E[((aX+bY)−(aμ_X+bμ_Y))²]=E[(a(X−μ_X)+b(Y−μ_Y))²]. Expand the square and take expectations to obtain a²Var(X)+b²Var(Y)+2ab Cov(X,Y). For X̄=Σ X_i/n with i.i.d. summands, Var(X̄)=(1/n²)·nσ²=σ²/n.",
    pitfalls: [
      "Adding standard deviations instead of variances",
      "Dropping the covariance term when dependence is present",
      "Using Var(X̄)=σ²/n² by incorrectly distributing the square",
      "Assuming a linear combination is normal without Gaussian or CLT justification",
    ],
    interview: "State linearity of expectation unconditionally, then write the two-variable variance expansion. Mention Var(X̄)=σ²/n as the key sampling consequence.",
    bridge: "When you average more and more i.i.d. variables, two limit theorems take over: the Law of Large Numbers (averages settle at μ) and the Central Limit Theorem (fluctuations look normal).",
  }),

  buildLesson({
    title: "Law of Large Numbers",
    partLabel: PART,
    principles: [
      "Sample averages of i.i.d. variables converge to the expected value as n grows",
      "LLN justifies using long-run frequencies as probabilities",
      "Convergence is of the average — individual outcomes remain random",
      "Finite expectation is the key hypothesis for the standard LLN statements",
    ],
    objectives: [
      "State the LLN in words and in symbols for i.i.d. samples",
      "Distinguish LLN (centers settle) from CLT (fluctuations' shape)",
      "Explain why larger n improves estimation of μ",
      "Recognize gambler's-fallacy misunderstandings of 'due for a correction'",
    ],
    why: "Probability's link to the real world is long-run frequency. The Law of Large Numbers is the theorem that makes 'probability ≈ proportion in many trials' precise. It underwrites polls, quality control, and the honesty of Monte Carlo simulation.",
    story: "A biased coin with P(heads)=0.6 will not give exactly 60% heads in 10 flips — anything can happen in small samples. In 100,000 flips, the proportion of heads almost always sits very close to 0.6. The LLN does not say the next flip knows about the past; it says the average of many flips settles.",
    idea: "If X_1,X_2,… are i.i.d. with E[X_i]=μ (finite), then the sample mean X̄_n=(X_1+…+X_n)/n converges to μ as n→∞ (in probability / almost surely, depending on the theorem version). Short version: **averages settle at the mean.**",
    steps: [
      {
        title: "Identify the i.i.d. sequence and its mean",
        body: "Name what is being averaged and what μ represents (a probability, a measurement mean, an expected reward).",
      },
      {
        title: "Form the sample average",
        body: "X̄_n=S_n/n. LLN is about X̄_n, not about S_n (which typically grows like nμ and still fluctuates on the √n scale).",
      },
      {
        title: "Increase n and watch concentration",
        body: "Variance of X̄_n is σ²/n when Var(X_i)=σ² exists — Chebyshev then shows P(|X̄_n−μ|≥ε)≤σ²/(nε²)→0. That is an elementary LLN proof sketch.",
      },
      {
        title: "Interpret correctly",
        body: "After many trials, the average is close to μ with high probability. This does not force the next single trial to 'balance' anything — memoryless or independent trials do not owe you a debt.",
      },
      {
        title: "Separate from the CLT",
        body: "LLN: X̄_n → μ. CLT: √n (X̄_n−μ) looks normal. One is about settling; the other is about the shape of remaining error.",
      },
    ],
    mathSimple: "Each new observation is noisy, but noise partly cancels in an average. Dividing a sum of n independent noises by n shrinks typical error like 1/√n — eventually the average sits near μ.",
    walkthrough: "Fair die, μ=3.5, σ²=35/12≈2.92. For n=100, Var(X̄)≈0.0292, SD≈0.17. Chebyshev: P(|X̄−3.5|≥0.5)≤0.0292/0.25≈0.117 — a loose bound, but already shows concentration. In practice the probability is much smaller; the point is that large n makes big deviations unlikely.",
    example: "i.i.d. Bernoulli(p): X̄_n is the observed proportion p̂_n → p. That is why empirical frequencies estimate probabilities.",
    example2: "Monte Carlo: to estimate π/4 = P(U²+V²≤1) for U,V i.i.d. Uniform(0,1), the proportion of random points falling in the quarter disk converges to π/4 by LLN. More points ⇒ stabler estimate.",
    labCue: "Use the **sampling** or LLN-style lab: accumulate running averages of i.i.d. draws and watch the path cling closer to μ as n grows. Overlay several runs — each path is random, but all settle.",
    check: [
      "Does the LLN say S_n converges to μ?",
      "What happens to Var(X̄_n) as n increases (finite variance case)?",
      "Why is 'we are due for heads' not implied by the LLN?",
    ],
    practice: [
      {
        q: "i.i.d. with mean 10 and variance 4. Use Chebyshev to bound P(|X̄_n−10|≥1) for n=100.",
        a: "Var(X̄)=4/100=0.04, so P≤0.04/1²=0.04.",
      },
      {
        q: "In one sentence, contrast LLN with CLT.",
        a: "LLN says averages converge to μ; CLT says the scaled fluctuation √n(X̄−μ) becomes approximately normal.",
      },
    ],
    formal: "Weak LLN: X̄_n → μ in probability if X_i i.i.d. with E|X_i|<∞ (or with finite variance via Chebyshev). Strong LLN: convergence almost surely under i.i.d. integrable conditions (Kolmogorov). Finite variance is sufficient but not necessary for weak LLN.",
    formulas: "- X̄_n = (X_1+…+X_n)/n → μ\n- Var(X̄_n)=σ²/n when Var(X_i)=σ²\n- Chebyshev: P(|X̄_n−μ|≥ε)≤σ²/(nε²)",
    derivation: "With finite variance: E[X̄_n]=μ and Var(X̄_n)=σ²/n, so Chebyshev yields the weak LLN immediately. Stronger theorems use truncation, Kolmogorov's criterion, or characteristic functions — beyond this course's computational focus but good to know exist.",
    pitfalls: [
      "Thinking the next outcome must compensate past averages (gambler's fallacy)",
      "Applying LLN to dependent heavily-correlated series without care",
      "Confusing convergence of averages with convergence of partial sums",
      "Expecting exact equality X̄_n=μ at finite n",
    ],
    interview: "State X̄_n→μ for i.i.d. integrable X_i, mention σ²/n as the intuition pump, and clearly separate LLN from CLT.",
    bridge: "Knowing averages settle is not enough for confidence intervals — we need the shape of the error. That is the Central Limit Theorem.",
  }),

  buildLesson({
    title: "Central Limit Theorem",
    partLabel: PART,
    principles: [
      "Sums and averages of i.i.d. variables become approximately normal for large n",
      "The CLT standardizes fluctuations on the √n scale",
      "Approximate X̄ ≈ N(μ, σ²/n) when n is large enough for the setting",
      "CLT is why normal-based confidence intervals and tests are so widespread",
    ],
    objectives: [
      "State the classical CLT for i.i.d. sums/averages",
      "Standardize X̄ to a Z and approximate probabilities with Φ",
      "Explain the roles of n, σ, and skewness in approximation quality",
      "Connect CLT to upcoming sampling distributions and CIs",
    ],
    why: "Even when individual data are skewed or discrete, averages often look bell-shaped once n is large. The Central Limit Theorem is the reason normal tables show up in inference for means and proportions. It turns hard sampling distributions into workable Φ calculations.",
    story: "Individual insurance claims may be right-skewed with a long expensive tail. The average claim from 500 independent policies, however, is often roughly normal around the mean claim size with SD σ/√500. Actuaries lean on that approximation to set reserves — not because one claim is normal, but because the average is.",
    idea: "For i.i.d. X_i with mean μ and variance σ²∈(0,∞), the standardized average Z_n=√n (X̄_n−μ)/σ converges in distribution to N(0,1). Practically: treat X̄_n as approximately N(μ, σ²/n) for large n.",
    steps: [
      {
        title: "Check i.i.d. and finite variance",
        body: "CLT needs independent (or weakly dependent) identically distributed draws with finite σ². Heavy tails with infinite variance can break the classical statement.",
      },
      {
        title: "Write the mean and SE of X̄",
        body: "E[X̄]=μ, SE=σ/√n. This normal approximation is centered correctly with the right spread even before you invoke Φ.",
      },
      {
        title: "Standardize the event",
        body: "P(X̄ ≤ a) ≈ Φ( √n (a−μ)/σ ). Same pattern for intervals and upper tails. For sums, S_n ≈ N(nμ, nσ²).",
      },
      {
        title: "Judge whether n is large enough",
        body: "Symmetric light-tailed data: modest n may work. Skewed data (income, exponential waits): need larger n. Rules of thumb (n≥30) are starting points, not theorems.",
      },
      {
        title: "Apply to proportions as a special case",
        body: "Bernoulli variance p(1−p) yields p̂ ≈ N(p, p(1−p)/n) for large n — the engine of proportion CIs later.",
      },
    ],
    mathSimple: "LLN says the average goes to μ. CLT zooms in on the remaining error with a √n magnifying glass and finds a bell curve. The σ/√n scale is exactly the standard deviation of X̄, so after dividing by it you compare to N(0,1).",
    walkthrough: "X_i i.i.d. with μ=50, σ=12, n=36. Then X̄ ≈ N(50, 12²/36)=N(50,4), SE=2. P(X̄>53)≈1−Φ((53−50)/2)=1−Φ(1.5)≈0.0668. Without CLT you would need the exact distribution of the average — often unavailable.",
    example: "Fair die averages with n=49: μ=3.5, σ≈1.71, SE≈0.244. P(X̄>3.8)≈1−Φ((3.8−3.5)/0.244)≈1−Φ(1.23)≈0.11.",
    example2: "Proportion: n=100, true p=0.4. Then SE=√(0.4·0.6/100)=√0.0024≈0.049. P(p̂<0.35)≈Φ((0.35−0.4)/0.049)≈Φ(−1.02)≈0.15. (A continuity correction can refine discrete cases later.)",
    labCue: "In the **sampling** lab, draw many samples of size n from a skewed population histogram. As n increases, the histogram of sample means should morph toward a bell even though the population is not bell-shaped.",
    check: [
      "What is the approximate distribution of X̄ for large n?",
      "How does SE change when n quadruples?",
      "Does CLT require the population itself to be normal?",
    ],
    practice: [
      {
        q: "i.i.d. with μ=0, σ=1, n=64. Approximate P(|X̄|>0.25).",
        a: "SE=1/8=0.125. P(|Z|>0.25/0.125)=P(|Z|>2)≈0.0456.",
      },
      {
        q: "Why might n=30 be too small for exponential(1) averages to look normal?",
        a: "Exponential is strongly right-skewed; the sampling distribution of X̄ inherits skew for moderate n. Need larger n or a transformation/bootstrap.",
      },
    ],
    formal: "Classical CLT: if X_i i.i.d. with E[X_i]=μ and Var(X_i)=σ²∈(0,∞), then √n (X̄_n−μ)/σ ⇒ N(0,1) in distribution. Lindeberg–Lévy is the i.i.d. case; Lindeberg–Feller extends to independent non-identical summands under a negligibility condition.",
    formulas: "- √n (X̄−μ)/σ ≈ N(0,1)\n- X̄ ≈ N(μ, σ²/n)\n- S_n ≈ N(nμ, nσ²)\n- p̂ ≈ N(p, p(1−p)/n)",
    derivation: "One standard proof uses characteristic functions: the ch.f. of the standardized average converges pointwise to e^{−t²/2}, the ch.f. of N(0,1), and Lévy's continuity theorem upgrades that to convergence in distribution. Heuristically, convolving densities repeatedly smooths toward a Gaussian shape.",
    pitfalls: [
      "Applying CLT to tiny n with highly skewed data",
      "Using σ/√n but forgetting to standardize when computing Φ",
      "Thinking CLT makes individual X_i normal",
      "Ignoring dependence (CLT needs independence or a mixing substitute)",
    ],
    interview: "State the standardized form √n(X̄−μ)/σ⇒N(0,1), emphasize finite variance and i.i.d., and give one numeric approximation with Φ. Mention proportions as Bernoulli averages.",
    bridge: "Part 6 turns these limit ideas into statistical practice: populations vs samples, sampling distributions, estimators, and confidence intervals.",
  }),
];
