import { buildLesson } from "./helper.mjs";

const PART = "Part 4: Special Probability Distributions";

export const topics = [
  buildLesson({
    title: "Bernoulli and Binomial Distributions",
    partLabel: PART,
    principles: [
      "A Bernoulli trial has exactly two outcomes: success (1) or failure (0)",
      "A Binomial random variable counts successes in n independent Bernoulli trials with the same p",
      "The parameters n and p completely determine Binomial(n, p)",
      "Mean is np and variance is np(1−p) — spread is largest when p is near 1/2",
    ],
    objectives: [
      "Recognize Bernoulli vs Binomial settings in word problems",
      "Write and compute the binomial PMF for small n",
      "Use mean and variance formulas without deriving them each time",
      "Explain why independence and constant p are required",
    ],
    why: "So many real processes are yes/no trials: a bit flips correctly or not, a user clicks or not, a quiz item is right or wrong. Once you can model one trial, you naturally ask how many successes appear in a fixed number of repeats. The Bernoulli and Binomial pair is the workhorse for counts of binary outcomes in probability, A/B testing, and exam scoring.",
    story: "Imagine a flaky unit test that passes with probability p = 0.8 on each independent run. One run is a Bernoulli trial: pass = 1, fail = 0. If CI runs the suite 10 times overnight, the number of passes is Binomial(10, 0.8). That single count tells you how often the pipeline looked healthy — and the binomial PMF tells you how surprising an unusually low pass count would be.",
    idea: "A **Bernoulli(p)** random variable X is one coin-flip-style trial: P(X=1)=p and P(X=0)=1−p. A **Binomial(n,p)** random variable Y is the **count of successes** in n independent Bernoulli(p) trials. Its PMF is P(Y=k)=C(n,k) p^k (1−p)^{n−k}: choose which k of the n trials succeed, then multiply the success and failure probabilities.",
    steps: [
      {
        title: "Confirm the setting",
        body: "Ask three questions: Is each trial clearly success/failure? Is the number of trials n fixed in advance? Are trials independent with the same success probability p? If any answer is no (especially dependence or sampling without replacement from a small population), binomial may be the wrong model.",
      },
      {
        title: "Define success carefully",
        body: "Write in one sentence what counts as success. Keep that definition fixed — flipping the label from 'pass' to 'fail' swaps p with 1−p and changes which k you care about. Ambiguous success definitions are a common source of off-by-one logic errors.",
      },
      {
        title: "Write the PMF for the target k",
        body: "For Y ~ Bin(n,p), compute C(n,k) = n!/(k!(n−k)!), then multiply by p^k (1−p)^{n−k}. For a range like 'at least 8,' sum the PMF from k=8 to n (or use a complementary count when that is shorter).",
      },
      {
        title: "Sanity-check with mean and variance",
        body: "E[Y]=np and Var(Y)=np(1−p). If your probability question is about a value many standard deviations from np, expect a small probability. If someone claims a mean that is not np, the parameters are inconsistent.",
      },
      {
        title: "Check independence again",
        body: "Shared causes (same buggy build, same crowded server) can make trials dependent. Dependence does not always ruin a rough approximation, but it does invalidate exact binomial probabilities — say so explicitly when you use the model as an approximation.",
      },
    ],
    mathSimple: "Think of n independent coin flips with P(heads)=p. The chance of any **specific** pattern with k heads and n−k tails is p^k (1−p)^{n−k}. There are C(n,k) such patterns, so multiply. The mean np is 'n times the chance of success on one trial' by linearity — you do not need independence for the mean, but you do need it for the classic variance formula np(1−p).",
    walkthrough: "Let n=5, p=0.4, and find P(Y=2). First C(5,2)=10. Then p^2=(0.4)^2=0.16 and (1−p)^3=(0.6)^3=0.216. So P(Y=2)=10×0.16×0.216=0.3456. Mean np=2; variance np(1−p)=5×0.4×0.6=1.2, so SD≈1.1. Getting exactly 2 successes is near the center — a probability around one-third is plausible.",
    example: "Fair coin, 10 flips, Y = number of heads. P(Y=6)=C(10,6)/2^{10}=210/1024≈0.205. Mean = 5, variance = 2.5. Getting 6 heads is mildly above average, not rare.",
    example2: "A multiple-choice quiz has 8 independent items, each with P(correct)=0.25 if guessing. Let Y be the number correct. P(Y≥3)=1−P(0)−P(1)−P(2). P(0)=(0.75)^8≈0.100, P(1)=C(8,1)(0.25)(0.75)^7≈0.267, P(2)=C(8,2)(0.25)^2(0.75)^6≈0.311. So P(Y≥3)≈1−0.678=0.322. Roughly one-third of pure guessers score 3 or more.",
    labCue: "Open the **pmf** lab in binomial mode. Slide n and p: watch the mass move toward np and flatten or sharpen as np(1−p) changes. Compare a tall spike near the mean when p is extreme with a wider hump when p≈0.5.",
    check: [
      "Is Binomial(1,p) the same as Bernoulli(p)? (Yes.)",
      "If trials share a common shock so they are dependent, does E[Y] still equal np when each trial has success probability p? (Yes for the mean; the variance formula generally fails.)",
      "Why does variance peak at p=1/2 for fixed n?",
    ],
    practice: [
      {
        q: "A server request succeeds with probability 0.9 independently. In 20 requests, what is the expected number of successes, and what is P(all 20 succeed)?",
        a: "E[Y]=20×0.9=18. P(Y=20)=(0.9)^{20}≈0.1216 (about 12%).",
      },
      {
        q: "For Y~Bin(4,0.5), compute P(Y is even).",
        a: "P(0)+P(2)+P(4)=1/16+C(4,2)/16+1/16=(1+6+1)/16=8/16=1/2.",
      },
    ],
    formal: "X~Bernoulli(p) on {0,1} with P(X=1)=p. Independent X_1,…,X_n ~ Bernoulli(p) ⇒ Y=Σ X_i ~ Binomial(n,p) with PMF P(Y=k)=C(n,k)p^k(1−p)^{n−k} for k=0,…,n. Moment generating function (1−p+p e^t)^n recovers E[Y]=np and Var(Y)=np(1−p).",
    formulas: "- Bernoulli: P(X=1)=p, E[X]=p, Var(X)=p(1−p)\n- Binomial: P(Y=k)=C(n,k)p^k(1−p)^{n−k}\n- E[Y]=np, Var(Y)=np(1−p)\n- Bin(n,p) + Bin(m,p) independent ⇒ Bin(n+m,p)",
    derivation: "Linearity gives E[Y]=Σ E[X_i]=np without independence. For variance under independence: Var(Y)=Σ Var(X_i)=n p(1−p). The PMF follows from counting: each specific success pattern of size k has probability p^k(1−p)^{n−k}, and there are C(n,k) patterns.",
    pitfalls: [
      "Using binomial when sampling without replacement from a small population (use Hypergeometric, or binomial only as an approximation when the population is huge)",
      "Treating 'at least k' as a single PMF term instead of a sum",
      "Mixing up p with 1−p after redefining success",
      "Assuming identical p when different trials have different success chances (that is Poisson-binomial, not binomial)",
    ],
    interview: "Say: 'I'd model each independent binary outcome as Bernoulli(p) and the total count as Binomial(n,p), then check independence and constant p before quoting exact probabilities. For means I rely on linearity; for variances I need independence or an explicit covariance structure.'",
    bridge: "Waiting for the first success is a different question from counting successes in a fixed number of trials — that waiting-time story leads to the geometric and negative binomial distributions next.",
  }),

  buildLesson({
    title: "Geometric and Negative Binomial Distributions",
    partLabel: PART,
    principles: [
      "Geometric waiting time: number of trials until the first success",
      "Negative binomial: number of trials until r successes (geometric is the r=1 case)",
      "The discrete geometric is memoryless: the past wait does not change the future wait law",
      "Textbooks disagree on support starting at 0 vs 1 — fix a convention before computing",
    ],
    objectives: [
      "Write the geometric PMF under the 'trials until first success' convention",
      "Compute expected waiting time 1/p",
      "Extend to negative binomial for r successes",
      "State memorylessness in words and know when it applies",
    ],
    why: "Often n is not fixed — you keep trying until something works. How many compiles until the build is green? How many packets until the first successful ACK? Those are waiting-time problems. Geometric and negative binomial distributions answer them under independent Bernoulli trials.",
    story: "You keep submitting a flaky test with pass probability p=0.2 each independent run. You do not care about 'exactly 3 passes in 10 runs' — you care about how long until the first pass. That waiting time is geometric. If QA requires r=3 green runs in a row of independent attempts before shipping, the trial count until the third pass is negative binomial.",
    idea: "With success probability p each independent trial, let T be the trial number of the first success. Then P(T=k)=(1−p)^{k−1}p for k=1,2,3,… — you fail k−1 times, then succeed. The expected wait is E[T]=1/p. The **negative binomial** generalizes this: wait until the r-th success.",
    steps: [
      {
        title: "Lock the definition",
        body: "Decide: are you counting trials until first success (support 1,2,…), or failures before first success (support 0,1,…)? Both are called 'geometric' in different books. In this course we use trials until first success unless stated otherwise. Write the support explicitly on your paper.",
      },
      {
        title: "Build the PMF from a story",
        body: "For T=k you need k−1 failures and then one success: (1−p)^{k−1}p. Check that the probabilities sum to 1 by recognizing a geometric series.",
      },
      {
        title: "Compute the mean wait",
        body: "E[T]=1/p. Intuition: if success happens 20% of the time, you expect about 5 trials per success. Variance is (1−p)/p² — small p means both long waits and highly variable waits.",
      },
      {
        title: "Extend to r successes",
        body: "For negative binomial with r successes, one common form is P(T=k)=C(k−1,r−1) p^r (1−p)^{k−r} for k=r,r+1,… (the r-th success lands on trial k). Mean is r/p.",
      },
      {
        title: "Use memorylessness carefully",
        body: "If you have already failed 10 times, the remaining wait until first success still has the same geometric law. That is special to geometric (and continuous exponential). Do not apply it to binomial counts or to wear-out lifetimes.",
      },
    ],
    mathSimple: "Geometric series: sum_{k=1}^∞ (1−p)^{k−1}p = p / (1−(1−p)) = 1. The mean 1/p can be derived by conditioning on the first trial: with probability p you stop at 1; with probability 1−p you have used one trial and then restart, so E[T]=p·1+(1−p)(1+E[T]), which solves to 1/p.",
    walkthrough: "Let p=0.25. Then P(T=1)=0.25, P(T=2)=0.75×0.25=0.1875, P(T=3)=(0.75)^2×0.25≈0.1406. Expected wait E[T]=1/0.25=4. Variance=(0.75)/(0.25)^2=12, so SD≈3.5 — waiting times bounce around a lot when success is uncommon.",
    example: "A flaky test passes with p=0.2 each run. Expected runs until first pass: 1/0.2=5. P(first pass occurs on run 3)=(0.8)^2(0.2)=0.128.",
    example2: "Need r=2 independent successful deploys, each with p=0.5. Expected trials until second success: 2/0.5=4. P(second success on trial 3)=C(2,1)(0.5)^2(0.5)^1=2×0.125=0.25 (exactly one success in the first two trials, then success on the third).",
    labCue: "In the **pmf** lab, switch to geometric mode. Increase p and watch the mass slam toward small k. Decrease p and watch a long right tail — rare successes mean long, unpredictable waits.",
    check: [
      "State memorylessness in one sentence for geometric T.",
      "How does geometric differ from binomial in what is fixed vs random?",
      "If p=1/3, what is E[T] under the trials-until-first-success convention?",
    ],
    practice: [
      {
        q: "With p=0.1, find P(T≤2) for geometric T (trials until first success).",
        a: "P(1)+P(2)=0.1+0.9×0.1=0.19.",
      },
      {
        q: "True or false: after 20 failures, the expected remaining wait is still 1/p for a geometric success process.",
        a: "True — that is memorylessness. The past failures do not change the future waiting-time law.",
      },
    ],
    formal: "Under the trials-until-first-success convention, T~Geometric(p) on {1,2,…} with P(T=k)=(1−p)^{k−1}p, E[T]=1/p, Var(T)=(1−p)/p². Memoryless: P(T>s+t | T>s)=P(T>t). Negative binomial NB(r,p) (trials until r successes) has mean r/p and is the sum of r i.i.d. geometrics.",
    formulas: "- P(T=k)=(1−p)^{k−1}p, k=1,2,…\n- E[T]=1/p, Var(T)=(1−p)/p²\n- NB (r successes): E=r/p\n- Memoryless: P(T>s+t|T>s)=P(T>t)",
    derivation: "Condition on the first trial to get E[T]=1/p as above. Memorylessness: P(T>s+t | T>s)=P(T>s+t)/P(T>s)=(1−p)^{s+t}/(1−p)^s=(1−p)^t=P(T>t). Negative binomial as a sum of r i.i.d. geometric waits follows because after each success the process restarts independently.",
    pitfalls: [
      "Mixing the 'failures before first success' PMF with the 'trial of first success' PMF",
      "Applying memorylessness to binomial counts or aging devices",
      "Using E[T]=p instead of 1/p",
      "Forgetting that negative binomial support starts at k=r, not k=0",
    ],
    interview: "Clarify the geometric convention first, then say: 'Waiting until first success is geometric with mean 1/p; until r successes is negative binomial with mean r/p. Geometric is memoryless — remaining wait forgets the past.'",
    bridge: "When events are rare across a continuum of time or space rather than a fixed number of trials, the natural count model becomes Poisson — the next lesson.",
  }),

  buildLesson({
    title: "Poisson Distribution",
    partLabel: PART,
    principles: [
      "Poisson counts rare events in a window of opportunity (time, length, area)",
      "A single parameter λ is both the mean and the variance",
      "Binomial(n,p) with n large, p small, and np→λ approaches Poisson(λ)",
      "Classic uses: arrivals, defects, clicks, mutations per interval",
    ],
    objectives: [
      "Compute Poisson probabilities with P(X=k)=e^{−λ} λ^k / k!",
      "Interpret λ as expected count in the chosen unit window",
      "Decide when a Poisson approximation to binomial is reasonable",
      "Check the mean≈variance fingerprint in data",
    ],
    why: "Call centers, packet arrivals, bug reports per day, and site visits per hour are counts of events sprinkled across time. When events are uncommon in tiny slices of time and roughly independent across slices, the Poisson distribution is the default model. It also bridges discrete trials (binomial) to continuous-time processes.",
    story: "A small API averages λ=3 error spikes per hour. You do not track 3600 separate Bernoulli seconds by hand — you model the hourly count as Poisson(3). Then P(no errors in an hour)=e^{−3}≈0.05, so a completely quiet hour is unusual but not shocking. If next month the average rises to 8, the whole PMF slides right.",
    idea: "X~Poisson(λ) takes values 0,1,2,… with P(X=k)=e^{−λ} λ^k / k!. The number λ is the **average count** in your interval. Unusually, Var(X)=λ as well — if data show variance much larger than the mean, consider overdispersion (e.g. negative binomial counts) instead.",
    steps: [
      {
        title: "Choose the window and estimate λ",
        body: "Pick a clear unit: per minute, per hour, per 1000 lines of code. λ must match that unit. Estimate λ by the average count per window from historical data, or from a rate × time product (rate 2/hour over 3 hours ⇒ λ=6).",
      },
      {
        title: "Write the probability question in counts",
        body: "Translate English into P(X=k), P(X≤k), or P(X≥k). For tails, sum the PMF or use complementary counting when fewer terms are needed.",
      },
      {
        title: "Compute with the PMF",
        body: "Use e^{−λ} λ^k / k!. For successive k, a useful recurrence is P(k+1)=P(k)·λ/(k+1), which avoids recomputing factorials from scratch.",
      },
      {
        title: "Validate assumptions",
        body: "Rough checklist: events are rare in tiny subintervals, counts in disjoint intervals are nearly independent, and rate is stable. Bursty traffic or clustering violates the simple Poisson story.",
      },
      {
        title: "Compare to binomial when relevant",
        body: "If you started from n independent rare trials with success probability p and np=λ is moderate while n is large and p is small, Poisson(λ) approximates Bin(n,p).",
      },
    ],
    mathSimple: "The e^{−λ} factor is the continuous analogue of '(1−λ/n)^n → e^{−λ}' from the binomial limit. Dividing by k! accounts for the many orders in which k indistinguishable events could be arranged in the window. Mean = variance = λ is a hallmark: one dial sets both center and spread.",
    walkthrough: "λ=4. P(X=0)=e^{−4}≈0.0183. P(X=1)=4e^{−4}≈0.0733. P(X=2)=16e^{−4}/2≈0.1465. Using the recurrence, P(3)=P(2)·4/3≈0.1954. Mean and variance are both 4, so SD=2. Counts of 0 are more than 2 SD below the mean — rare.",
    example: "Average 3 emails per hour, X~Poisson(3). P(X=0)=e^{−3}≈0.0498. So about a 5% chance of a silent hour if the Poisson model holds.",
    example2: "Binomial with n=100, p=0.03 has mean 3. Poisson(3) approximates P(X=2): e^{−3}9/2≈0.224, while exact binomial C(100,2)(0.03)^2(0.97)^{98}≈0.225 — already very close.",
    labCue: "In the **pmf** lab, set Poisson λ and watch the PMF. Then compare to a binomial with large n and p=λ/n. As n grows, the shapes should nearly match.",
    check: [
      "Why is λ both mean and variance?",
      "If events are per minute with rate 0.5, what is λ for a 10-minute window?",
      "When is Poisson a poor model even if the mean count is clear?",
    ],
    practice: [
      {
        q: "X~Poisson(2). Find P(X≥1).",
        a: "1−P(0)=1−e^{−2}≈1−0.1353=0.8647.",
      },
      {
        q: "Calls arrive at 6 per hour. In 20 minutes, what Poisson λ should you use for the count?",
        a: "20 minutes is 1/3 hour, so λ=6×(1/3)=2.",
      },
    ],
    formal: "X~Poisson(λ) for λ>0: P(X=k)=e^{−λ}λ^k/k!, k=0,1,2,…. E[X]=Var(X)=λ. If N(t) is a rate-λ Poisson process, N(t)~Poisson(λt). Limit theorem: if X_n~Bin(n,λ/n), then X_n → Poisson(λ) in distribution as n→∞.",
    formulas: "- P(X=k)=e^{−λ}λ^k/k!\n- E[X]=Var(X)=λ\n- P(k+1)=P(k)·λ/(k+1)\n- Independent Poisson counts add: Pois(λ)+Pois(μ)~Pois(λ+μ)",
    derivation: "Start from Bin(n,p) with p=λ/n: P(X=k)=C(n,k)(λ/n)^k (1−λ/n)^{n−k}. As n→∞, C(n,k)/n^k → 1/k!, (1−λ/n)^n → e^{−λ}, and (1−λ/n)^{−k}→1, yielding e^{−λ}λ^k/k!.",
    pitfalls: [
      "Using a λ that does not match the time/space window in the question",
      "Ignoring overdispersion when variance ≫ mean",
      "Using Poisson for proportions bounded in [0,1] without a count interpretation",
      "Assuming independent increments when arrivals clearly cluster",
    ],
    interview: "Frame Poisson as 'the rare-event count limit of binomial' and mention mean=variance as a quick diagnostic. Tie it to Poisson processes if the conversation turns to waiting times.",
    bridge: "Counts are discrete. When every value in an interval is equally plausible — random arrival time within a cycle, random number generators — the continuous uniform distribution is the natural flat model.",
  }),

  buildLesson({
    title: "Uniform Distribution",
    partLabel: PART,
    principles: [
      "Uniform means 'no preference' across a set of possibilities",
      "Discrete uniform: equal probability on a finite list of points",
      "Continuous Uniform(a,b): constant density 1/(b−a) on [a,b]",
      "Uniforms are the engine of simulation via inverse-transform sampling",
    ],
    objectives: [
      "Write discrete and continuous uniform laws",
      "Compute means and interval probabilities from lengths or counts",
      "Use Var(U(a,b))=(b−a)²/12",
      "Explain why U(0,1) is central in Monte Carlo methods",
    ],
    why: "Sometimes you genuinely have no reason to prefer one value over another inside a range: a random spinner, a bus wait if you arrive at a random time, or a PRNG drawing in [0,1). The uniform distribution formalizes that flat ignorance — and it is the starting point for generating almost every other distribution on a computer.",
    story: "Buses arrive every 10 minutes and you show up at a random time. Your waiting time is Uniform(0,10): every wait between 0 and 10 is equally likely in the continuous sense. Expected wait is 5 minutes. The probability you wait more than 7 minutes is the length of (7,10] divided by 10, which is 0.3 — a length ratio, not a density height.",
    idea: "Continuous X~Uniform(a,b) has PDF f(x)=1/(b−a) on [a,b] and 0 elsewhere. Probability of an interval is the length of that interval inside [a,b], divided by (b−a). Discrete uniform on {1,…,n} puts mass 1/n on each point.",
    steps: [
      {
        title: "Identify the support",
        body: "Write the interval [a,b] or the finite set of points. Outside the support, probability is zero. Endpoint inclusion rarely matters for continuous uniforms because single points have probability zero.",
      },
      {
        title: "Set the constant height or mass",
        body: "Continuous: height = 1/(b−a) so total area is 1. Discrete: each point gets 1/n. If someone gives you a 'flat' density that does not integrate to 1, renormalize.",
      },
      {
        title: "Compute probabilities by measure",
        body: "Continuous: P(X∈I)=length(I∩[a,b])/(b−a). Discrete: count favorable points over n. Avoid treating the density height as a probability.",
      },
      {
        title: "Summarize with mean and variance",
        body: "For U(a,b), E[X]=(a+b)/2 (the midpoint) and Var(X)=(b−a)²/12. Wider intervals are more spread out — variance grows with the square of the length.",
      },
      {
        title: "Connect to simulation",
        body: "If U~U(0,1) and F is a CDF you can invert, X=F^{−1}(U) has CDF F. That is why uniforms sit underneath so much Monte Carlo work.",
      },
    ],
    mathSimple: "A constant density is the continuous version of 'each equally sized slice gets equal probability.' Area = base × height, and we choose height so the total area over [a,b] equals 1. Means sit at the balance point — for a flat bar, that is the midpoint.",
    walkthrough: "X~U(2,8). Density height=1/6. P(3<X<5)=2/6=1/3. E[X]=(2+8)/2=5. Var=(6)²/12=3, SD=√3≈1.73. P(X>7)=1/6≈0.167 — only the last sixth of the interval.",
    example: "Bus every 10 minutes, random arrival: wait W~U(0,10), E[W]=5. P(W>7)=0.3. P(W<1)=0.1.",
    example2: "Discrete uniform on {1,2,3,4,5,6} (fair die): E[X]=3.5, Var=35/12≈2.917. P(X≥5)=2/6=1/3. This is not the continuous U(1,6) — do not use (b−a)²/12 on a die.",
    labCue: "Open the **pdf** lab on a uniform density. Shade an interval and verify the probability equals the length ratio. Stretch a and b and watch the height fall so the area stays 1.",
    check: [
      "What is E[U(0,1)] and Var(U(0,1))?",
      "Why can a uniform density height exceed 1 (e.g. U(0,0.5))?",
      "How do you get P(X∈I) without integrating from scratch?",
    ],
    practice: [
      {
        q: "X~U(0,4). Find P(1≤X≤3) and Var(X).",
        a: "P=2/4=0.5. Var=16/12=4/3.",
      },
      {
        q: "A spinner is discrete uniform on 8 equal sectors labeled 1–8. What is P(even)?",
        a: "Four even labels out of eight ⇒ 1/2.",
      },
    ],
    formal: "Continuous X~U(a,b) has f(x)=1/(b−a) for x∈[a,b], F(x)=0 for x<a, (x−a)/(b−a) for x∈[a,b], and 1 for x>b. E[X]=(a+b)/2, Var(X)=(b−a)²/12. Discrete uniform on a finite set A puts mass 1/|A| on each element.",
    formulas: "- f(x)=1/(b−a) on [a,b]\n- P(c≤X≤d)=(d−c)/(b−a) for [c,d]⊆[a,b]\n- E=(a+b)/2, Var=(b−a)²/12\n- Discrete U{1..n}: p=1/n, E=(n+1)/2",
    derivation: "E[X]=∫_a^b x/(b−a) dx=(a+b)/2. E[X²]=∫_a^b x²/(b−a) dx=(b²+ab+a²)/3, then Var=E[X²]−(E[X])²=(b−a)²/12 after algebra.",
    pitfalls: [
      "Applying continuous variance formulas to discrete uniform supports",
      "Reading density height as a probability",
      "Forgetting to intersect the event interval with [a,b]",
      "Using U(a,b) when the true distribution is truncated or peaked near a boundary",
    ],
    interview: "Describe uniform as the maximum-entropy choice on a bounded interval with no further information, and mention inverse-transform sampling from U(0,1) as the simulation bridge.",
    bridge: "Flat densities are special. The most famous non-flat continuous model — the bell curve — is the normal distribution, which appears whenever many small noisy effects add up.",
  }),

  buildLesson({
    title: "Normal Distribution",
    partLabel: PART,
    principles: [
      "The normal curve is bell-shaped and symmetric about its mean μ",
      "Two parameters μ and σ² fully specify N(μ,σ²)",
      "The Central Limit Theorem makes normals ubiquitous for aggregates",
      "The 68–95–99.7 rule approximates mass inside 1, 2, and 3 standard deviations",
    ],
    objectives: [
      "Recognize and sketch a normal density given μ and σ",
      "Apply the empirical 68–95–99.7 rule",
      "Explain why normals appear as models for measurement error and averages",
      "Prepare for standardization to Z in the next lesson",
    ],
    why: "Heights, measurement noise, aggregate test scores, and many sensor readings look roughly bell-shaped. Even when a single observation is not normal, sample means often become approximately normal for large n. That double life — exact model and approximate limit — makes the normal the default continuous distribution in statistics.",
    story: "A factory fills bottles labeled 500 ml. The true fill amount varies: X~N(500, 4²) if the mean is on target and the SD is 4 ml. About 68% of bottles fall between 496 and 504 ml, and about 95% between 492 and 508 ml. If a bottle reads 485 ml, that is nearly 4σ low — a strong signal something went wrong.",
    idea: "X~N(μ,σ²) has a symmetric bell centered at μ. The parameter σ stretches the bell: larger σ means more spread and a lower peak (area stays 1). There is no simple elementary antiderivative for the PDF, so we use tables, software, or empirical rules for probabilities.",
    steps: [
      {
        title: "Locate the center μ",
        body: "The peak and the mean/median/mode all sit at μ for a normal. Shifting μ slides the whole curve without changing shape.",
      },
      {
        title: "Set the scale σ",
        body: "Roughly, inflection points sit near μ±σ. Doubling σ doubles spreads and quarters the peak height in a way that preserves total area 1.",
      },
      {
        title: "Apply the empirical rule for quick estimates",
        body: "About 68% of probability lies in μ±σ, 95% in μ±2σ, and 99.7% in μ±3σ. Use this for sanity checks before finer computation.",
      },
      {
        title: "Shade the event region",
        body: "Translate the English event into an interval on the x-axis. Symmetry helps: P(X>μ+a)=P(X<μ−a).",
      },
      {
        title: "Plan standardization",
        body: "Exact probabilities usually go through Z=(X−μ)/σ and the standard normal CDF Φ — the next lesson's main skill.",
      },
    ],
    mathSimple: "The famous formula f(x)=(1/(σ√(2π))) exp(−(x−μ)²/(2σ²)) looks scary, but read it as: 'height decays like a Gaussian bump as you move away from μ, scaled so total area is 1.' The squared term (x−μ)² makes left and right deviations equally costly — that is symmetry.",
    walkthrough: "X~N(100,15²) (classic IQ scaling). μ±σ = [85,115] holds ~68% of people. μ±2σ=[70,130] holds ~95%. A score of 130 is about 2σ above the mean — uncommon but expected in a large population. A score of 145 is 3σ up — roughly 1 in 700 on each upper tail under a perfect normal model.",
    example: "IQ ~ N(100,15²): roughly 68% of scores fall between 85 and 115. The probability of any exact single IQ value is still zero because this is continuous.",
    example2: "Fill amounts X~N(500,4²). P(492≤X≤508)≈0.95 by the empirical rule (that is μ±2σ). If specs require 490≤X≤510, that is μ±2.5σ, which holds a bit more than 95% — most bottles pass if the process is truly normal and centered.",
    labCue: "In the **pdf** lab, choose a normal curve. Move μ to slide the bell; increase σ to flatten and widen it. Shade μ±σ and μ±2σ bands and compare the areas to 68% and 95%.",
    check: [
      "Does N(μ,σ²) assign positive probability to a single point x=μ?",
      "What happens to the density peak if σ doubles?",
      "Name one reason normals appear so often in practice.",
    ],
    practice: [
      {
        q: "X~N(50,5²). About what percent of outcomes lie between 40 and 60?",
        a: "40 and 60 are μ±2σ, so about 95%.",
      },
      {
        q: "If X~N(0,1) and Y=3X+7, what is the distribution of Y?",
        a: "Y~N(7,9) because affine transforms preserve normality: mean 7, variance 3²×1=9.",
      },
    ],
    formal: "X has density f(x)=(1/(σ√(2π))) exp(−(x−μ)²/(2σ²)), σ>0. The family is closed under affine transforms: aX+b ~ N(aμ+b, a²σ²). Independent normals are jointly normal when stacked, and sums of independent normals are normal.",
    formulas: "- X~N(μ,σ²)\n- E[X]=μ, Var(X)=σ²\n- 68% / 95% / 99.7% within 1 / 2 / 3 σ\n- aX+b ~ N(aμ+b, a²σ²)",
    derivation: "The constant 1/(σ√(2π)) is exactly the factor that makes ∫ exp(−(x−μ)²/(2σ²)) dx = 1 (use the Gaussian integral ∫ e^{−u²/2} du = √(2π) after substitution u=(x−μ)/σ). Completing the square in the exponent of a joint bivariate Gaussian yields the familiar elliptical contours of jointly normal pairs.",
    pitfalls: [
      "Assuming normality without looking at skew or heavy tails",
      "Using ±2σ rules on clearly skewed data",
      "Confusing σ with σ² in verbal descriptions",
      "Treating histogram roughness as evidence against an underlying smooth normal model without enough n",
    ],
    interview: "Mention the CLT as the 'why normals appear' story, state the two-parameter family, and quote the empirical rule for quick communication with non-statisticians.",
    bridge: "Computing exact normal probabilities is standardized through Z-scores and the single reference curve N(0,1) — that is the next lesson.",
  }),

  buildLesson({
    title: "Standard Normal and Z-Scores",
    partLabel: PART,
    principles: [
      "Z=(X−μ)/σ converts any normal X into a standard normal N(0,1)",
      "A z-score is the signed number of standard deviations from the mean",
      "Tables and software give Φ(z)=P(Z≤z) for Z~N(0,1)",
      "Z-scores enable fair comparisons across different scales",
    ],
    objectives: [
      "Standardize normal probability problems end-to-end",
      "Read or approximate values of Φ(z)",
      "Interpret z as relative standing within a population",
      "Invert Φ to find quantiles and critical values",
    ],
    why: "Every normal has a different center and spread, but they are all the same shape after rescaling. Standardization lets one table — or one software function Φ — serve every normal problem. Z-scores also answer 'how unusual is this value?' in a unit-free way across exams, sensors, and features.",
    story: "Exam A has mean 70 and SD 10; Exam B has mean 50 and SD 5. A score of 85 on A and 60 on B look different in raw points, but both are z=1.5 — the same relative standing. If cutoffs are stated in z units (e.g. 'top 5% ≈ z>1.645'), every normal exam shares the same language.",
    idea: "If X~N(μ,σ²), then Z=(X−μ)/σ ~ N(0,1). Therefore P(X≤x)=Φ((x−μ)/σ). Going the other way, the value at percentile p is x=μ+σ Φ^{−1}(p).",
    steps: [
      {
        title: "Write the probability in the original variable",
        body: "Example: P(X>90), P(80<X<95), or P(X≤x). Draw a rough bell and shade the region — this prevents tail-direction mistakes.",
      },
      {
        title: "Subtract μ and divide by σ",
        body: "Replace each boundary x with z=(x−μ)/σ. Use σ, not σ², in the denominator. If X>90 becomes Z>(90−μ)/σ.",
      },
      {
        title: "Convert to Φ",
        body: "P(Z≤z)=Φ(z). Use complements: P(Z>z)=1−Φ(z). For intervals, Φ(z_right)−Φ(z_left). Symmetry: Φ(−z)=1−Φ(z).",
      },
      {
        title: "Invert for quantiles when needed",
        body: "To find x such that P(X≤x)=p, compute z_p=Φ^{−1}(p), then x=μ+σ z_p. Common values: z_{0.975}≈1.96, z_{0.95}≈1.645.",
      },
      {
        title: "Interpret the z-score",
        body: "z=2 means 'two SDs above the mean.' Negative z means below the mean. Beyond |z|≈3 is rare under a normal model (~0.3% outside μ±3σ total).",
      },
    ],
    mathSimple: "Standardization is a change of units: measure distance from the mean in 'number of SDs' instead of raw units. Because every normal is a shifted-and-scaled copy of N(0,1), probabilities depend only on those unit-free distances.",
    walkthrough: "X~N(70,10²). Find P(X<85). z=(85−70)/10=1.5. Φ(1.5)≈0.9332. So about 93.3% of outcomes lie below 85. For P(X>85)=1−0.9332=0.0668. For the 90th percentile, z≈1.2816, so x≈70+10×1.28=82.8.",
    example: "X~N(70,10²). P(X<85)=Φ(1.5)≈0.933. P(60<X<80)=Φ(1)−Φ(−1)≈0.8413−0.1587=0.6826 — matching the 68% rule.",
    example2: "Two applicants: Alice scores 720 on a test with mean 500, SD 100 (z=2.2). Bob scores 30 on a test with mean 20, SD 4 (z=2.5). Bob is slightly more unusual relative to his reference population, even though the raw scores are incomparable.",
    labCue: "In the **pdf** lab, toggle a z-score / standardize view if available. Confirm that shading X≤μ+1.5σ matches shading Z≤1.5 on N(0,1) with the same area.",
    check: [
      "What is Φ(0)?",
      "What does z=−2 mean in words?",
      "Why must you divide by σ rather than σ²?",
    ],
    practice: [
      {
        q: "X~N(100,15²). Find P(X>130) using a standard normal value Φ(2)≈0.9772.",
        a: "z=(130−100)/15=2. P(X>130)=1−Φ(2)≈0.0228.",
      },
      {
        q: "For X~N(50,4²), find the 97.5th percentile using z≈1.96.",
        a: "x=50+4×1.96=57.84.",
      },
    ],
    formal: "If X~N(μ,σ²), then Z=(X−μ)/σ ~ N(0,1) with CDF Φ. Φ(−z)=1−Φ(z). Quantile function: x_p=μ+σ z_p with z_p=Φ^{−1}(p). For sample means later, often Z=(X̄−μ)/(σ/√n).",
    formulas: "- Z=(X−μ)/σ\n- x=μ+zσ\n- P(a<X<b)=Φ((b−μ)/σ)−Φ((a−μ)/σ)\n- Φ(−z)=1−Φ(z)",
    derivation: "Let Z=(X−μ)/σ. Then P(Z≤z)=P(X≤μ+σz). Differentiating the CDF of X after the linear change of variables produces the N(0,1) density — the σ in the Jacobian cancels the 1/σ in front of the original normal PDF.",
    pitfalls: [
      "Dividing by σ² instead of σ",
      "Using the wrong tail (Φ(z) vs 1−Φ(z))",
      "Standardizing non-normal data and treating Φ as exact rather than approximate",
      "Forgetting continuity corrections when approximating discrete distributions by normals (when that topic appears)",
    ],
    interview: "Walk through one numeric standardization out loud: boundary → z → Φ → English interpretation. Mention 1.96 as the two-sided 95% normal critical value — it reappears in confidence intervals.",
    bridge: "Normals model symmetric continuous noise. Waiting times with a constant hazard rate use a different continuous family: the exponential distribution.",
  }),

  buildLesson({
    title: "Exponential Distribution",
    partLabel: PART,
    principles: [
      "Exponential models waiting times with a constant hazard (failure) rate",
      "It is the unique continuous memoryless distribution",
      "It is tightly linked to Poisson processes: waits between events are exponential",
      "Mean is 1/λ when the PDF is λe^{−λx}; watch parameterization conventions",
    ],
    objectives: [
      "Use exponential PDF and CDF to compute waiting-time probabilities",
      "Relate λ to the mean wait 1/λ",
      "State continuous memorylessness in words",
      "Connect exponential waits to Poisson counts",
    ],
    why: "Time until the next request, time until a radioactive decay, or time until a crash under a constant risk rate all suggest exponential waiting times. Memorylessness is both a powerful modeling assumption and a warning: if aging or wear-out matters, exponential is the wrong tool.",
    story: "A helpdesk receives tickets as a Poisson process averaging λ=0.5 per minute (mean wait 2 minutes between tickets). The time until the next ticket is Exp(0.5). You have already waited 5 quiet minutes — under the exponential model, the expected additional wait is still 2 minutes. That surprising 'reset' is memorylessness.",
    idea: "X~Exp(λ) for x≥0 has f(x)=λe^{−λx}, F(x)=1−e^{−λx}, and P(X>t)=e^{−λt}. The mean wait is 1/λ. Memoryless means P(X>s+t | X>s)=P(X>t): surviving so far does not improve or worsen future chances under a constant hazard.",
    steps: [
      {
        title: "Fit λ from a mean or a rate",
        body: "If the average wait is 4 minutes, λ=1/4 per minute. If events occur at rate λ in a Poisson process, interarrival times are Exp(λ) with that same λ.",
      },
      {
        title: "Use the CDF or survival function",
        body: "P(X≤t)=1−e^{−λt} and P(X>t)=e^{−λt}. Long waits live in the exponential tail — they decay geometrically in t.",
      },
      {
        title: "Check whether memorylessness is plausible",
        body: "Constant hazard fits 'random arrivals' and some electronic failures. It fails for mechanical wear, human lifetimes, and deadlines with aging risk. Say so when the story mismatches.",
      },
      {
        title: "Connect to Poisson counts",
        body: "If N(t)~Poisson(λt) counts events up to time t, then the wait for the first event is Exp(λ). More generally, the wait for the k-th event is Gamma(k,λ) (Erlang).",
      },
      {
        title: "Compute mean and variance",
        body: "E[X]=1/λ, Var(X)=1/λ². SD equals the mean — exponential waits are highly variable relative to their average.",
      },
    ],
    mathSimple: "The survival function e^{−λt} says 'probability of lasting past t shrinks by the same percentage every additional time unit.' That constant proportional decay is exactly constant hazard, and it forces memorylessness.",
    walkthrough: "Mean interarrival 2 minutes ⇒ λ=0.5. P(X>4)=e^{−0.5·4}=e^{−2}≈0.1353. P(X≤1)=1−e^{−0.5}≈0.3935. E[X]=2, Var=4, SD=2. So a wait of 6 minutes is (6−2)/2=2 SD above the mean — unusual but in the long right tail exponentials always have.",
    example: "Mean interarrival 2 min ⇒ λ=0.5. P(wait > 4)=e^{−2}≈0.135. P(wait ≤ 1)≈0.393.",
    example2: "Device failures ~ Exp(λ=0.01 per hour). P(survives 100 hours)=e^{−1}≈0.367. Given survival to 100 hours, P(survives to 200)=P(X>100) again ≈0.367 by memorylessness — not more reliable after surviving, under this model.",
    labCue: "In the **pdf** lab, plot an exponential. Shade long waits and watch tail probabilities. Mentally check memorylessness: the shape of the remaining-life distribution should match the original.",
    check: [
      "Is the exponential distribution memoryless?",
      "How does Exp(λ) relate to a Poisson process of rate λ?",
      "If the mean wait is 10, what is λ in the rate parameterization?",
    ],
    practice: [
      {
        q: "X~Exp(λ=2). Find P(0.5<X<1).",
        a: "F(1)−F(0.5)=(1−e^{−2})−(1−e^{−1})=e^{−1}−e^{−2}≈0.3679−0.1353=0.2326.",
      },
      {
        q: "Explain in one sentence why wear-out failures are often not exponential.",
        a: "Hazard increases with age under wear-out, but exponential requires a constant hazard (memorylessness).",
      },
    ],
    formal: "X~Exp(λ) has f(x)=λe^{−λx} 1_{x≥0}, F(x)=1−e^{−λx}, hazard h(x)=λ. Memoryless: P(X>s+t|X>s)=P(X>t). If N(t)~Poisson(λt), waiting time to first event ~ Exp(λ). Sum of k i.i.d. Exp(λ) ~ Gamma(k,λ) (Erlang).",
    formulas: "- f(x)=λe^{−λx}, x≥0\n- F(x)=1−e^{−λx}, P(X>t)=e^{−λt}\n- E[X]=1/λ, Var(X)=1/λ²\n- Memoryless: P(X>s+t|X>s)=P(X>t)",
    derivation: "Memorylessness with a continuous survival function S(t)=P(X>t) forces S(s+t)=S(s)S(t), whose continuous solutions are S(t)=e^{−λt}. Differentiating gives the exponential PDF. The Poisson-process link follows because P(no events in [0,t])=e^{−λt}=P(wait>t).",
    pitfalls: [
      "Using exponential for wear-out or infant-mortality shaped hazards",
      "Confusing rate λ with mean 1/λ (or with the scale parameterization θ=1/λ in some libraries)",
      "Applying discrete geometric intuition without adjusting for continuous time",
      "Forgetting support starts at 0 (negative waits are impossible)",
    ],
    interview: "Lead with memorylessness and the Poisson-process connection. Mention that SD=mean is a quick fingerprint of exponential waits.",
    bridge: "Sums of exponential waits produce gamma (Erlang) laws; squared standard normals produce chi-square — both are gamma-family cousins used constantly in inference.",
  }),

  buildLesson({
    title: "Gamma and Chi-Square Distributions",
    partLabel: PART,
    principles: [
      "Gamma distributions generalize exponential sums (Erlang when shape is an integer)",
      "Chi-square is a special gamma and the law of sums of squared standard normals",
      "Chi-square is central in variance estimators and many goodness-of-fit tests",
      "Shape (or df) controls skew: small df is right-skewed; large df looks more symmetric",
    ],
    objectives: [
      "Describe Gamma shape/rate qualitatively and relate to exponential sums",
      "Recognize χ²_k as Σ_{i=1}^k Z_i² for i.i.d. standard normals",
      "Use E[χ²_k]=k and Var(χ²_k)=2k",
      "Preview why (n−1)s²/σ² ~ χ²_{n−1} for normal samples",
    ],
    why: "Inference about variances, many likelihood-ratio statistics, and waiting time until the k-th Poisson event all land in the gamma/chi-square family. You do not need every integral identity on day one — you do need to recognize the shapes, means, and the 'sum of squared normals' story.",
    story: "You standardize n normal observations and look at how spread out they are. The sample variance s², suitably scaled, follows a chi-square law with n−1 degrees of freedom when data are i.i.d. normal. That is why confidence intervals for σ² and many tests quote χ² critical values — they inherit from squared normals.",
    idea: "A **Gamma** waiting time can be thought of as 'time until α exponential hits accumulate' (integer shape). A **chi-square** random variable with k degrees of freedom is Γ(shape=k/2, rate=1/2) under a common convention, and equals Z_1²+…+Z_k² for i.i.d. N(0,1) variables. Support is [0,∞); the density is right-skewed for small k.",
    steps: [
      {
        title: "Start from exponentials or squared normals",
        body: "Pick the story that fits: sum of k Exp(λ) waits (Erlang/gamma), or sum of k squared standard normals (chi-square). Both live on the positive line.",
      },
      {
        title: "Identify the degrees of freedom k",
        body: "For χ²_k, k is the number of independent squared normals. In sample variance for n i.i.d. normals, df = n−1 because one degree is lost estimating the mean.",
      },
      {
        title: "Use mean and variance checkpoints",
        body: "E[χ²_k]=k, Var=2k. If someone claims a χ²_10 random variable has mean 5, something is wrong. Skew = √(8/k) shrinks as k grows.",
      },
      {
        title: "Read probabilities from software/tables",
        body: "Like the normal, chi-square CDFs are not elementary. Use tables or software for critical values that will appear in CI and testing units.",
      },
      {
        title: "Watch parameterization of gamma",
        body: "Libraries disagree on rate vs scale. Always check whether the density uses β as rate (λe^{…} style) or as scale. Write the PDF you mean.",
      },
    ],
    mathSimple: "Squaring a standard normal folds negative and positive deviations into a positive 'energy' measure. Adding k independent copies gives χ²_k — total squared length of a k-dimensional standard normal vector. That geometric picture explains why df feel like dimensions.",
    walkthrough: "Z_1,Z_2 i.i.d. N(0,1) ⇒ W=Z_1²+Z_2² ~ χ²_2. E[W]=2, Var(W)=4. χ²_2 has PDF (1/2)e^{−w/2} on w>0 — which is exactly Exp(rate=1/2). So a chi-square with 2 df is exponential with mean 2. Increasing to χ²_10, mean 10, variance 20, much less skew.",
    example: "Z_1,Z_2 i.i.d. N(0,1) ⇒ Z_1²+Z_2² ~ χ²_2 with mean 2. P(W>small values) is still substantial because of right skew.",
    example2: "For n=10 i.i.d. N(μ,σ²) observations, (n−1)s²/σ² ~ χ²_9. If s² is unusually large relative to a hypothesized σ², the chi-square statistic lands far in the right tail — evidence against that σ² (formalized later in hypothesis testing).",
    labCue: "In the **pdf** lab, plot chi-square densities. Start at df=2 (very skewed), then raise df to 10, 30, and watch the hump move right and become more symmetric — a visual preview of CLT-ish behavior for sums.",
    check: [
      "How is χ²_1 related to N(0,1)?",
      "What is the support of a chi-square random variable?",
      "Why does sample variance use n−1 degrees of freedom?",
    ],
    practice: [
      {
        q: "If W~χ²_8, what are E[W] and Var(W)?",
        a: "E[W]=8, Var(W)=16.",
      },
      {
        q: "True or false: a sum of two independent χ²_3 random variables is χ²_6.",
        a: "True — degrees of freedom add for independent chi-squares (sum of all six underlying squared normals).",
      },
    ],
    formal: "If Z_i i.i.d. N(0,1), then Σ_{i=1}^k Z_i² ~ χ²_k. Equivalently χ²_k = Gamma(k/2, rate=1/2) under that parameterization. For i.i.d. N(μ,σ²) samples, (n−1)s²/σ² ~ χ²_{n−1}. Independent chi-squares add their dfs.",
    formulas: "- E[χ²_k]=k, Var(χ²_k)=2k\n- χ²_k = Σ_{i=1}^k Z_i², Z_i~N(0,1) i.i.d.\n- (n−1)s²/σ² ~ χ²_{n−1} (normal data)\n- Exp(λ) = Gamma(1, rate λ)",
    derivation: "The PDF of Z² for Z~N(0,1) follows from a transformation: for w>0, two roots ±√w contribute, yielding the χ²_1 density. Inductive convolution or MGFs (1−2t)^{−k/2} multiply and produce χ²_k. The sample-variance result uses the fact that the vector of residuals after projecting orthogonal to the all-ones vector is (n−1)-dimensional isotropic Gaussian.",
    pitfalls: [
      "Wrong degrees of freedom (especially n vs n−1)",
      "Mixing rate and scale parameterizations of gamma",
      "Treating chi-square as symmetric for small df",
      "Applying (n−1)s²/σ² ~ χ²_{n−1} when data are far from normal",
    ],
    interview: "Say chi-square is 'sum of squared standard normals' and mention its role in variance inference. If asked about gamma, describe it as the continuous family containing exponential and chi-square.",
    bridge: "When the unknown quantity is itself a proportion on (0,1) — a click rate, a bias, a fraction defective — the beta family is the flexible distribution supported on the unit interval.",
  }),

  buildLesson({
    title: "Beta Distribution",
    partLabel: PART,
    principles: [
      "Beta distributions live on (0,1) — ideal for random proportions and probabilities",
      "Shape parameters α and β flex the density from flat to U-shaped to spiked",
      "Beta is the conjugate prior for Bernoulli/Binomial likelihoods in Bayesian updating",
      "Uniform(0,1) is exactly Beta(1,1)",
    ],
    objectives: [
      "Recognize Beta support on (0,1) and interpret α, β qualitatively",
      "Compute the mean α/(α+β)",
      "Sketch common shapes (uniform, unimodal, U-shaped)",
      "Preview Bayesian conjugacy: pseudo-counts of successes and failures",
    ],
    why: "Whenever the unknown is a probability or a fraction — click-through rate, fraction of defective chips, a coin's bias — you need a distribution on (0,1). The beta family is the standard flexible choice, and it updates beautifully with binary data.",
    story: "Before launching a feature, you encode a mild prior belief about click rate θ as Beta(2,2) — peaked near 0.5 but uncertain. After seeing 8 clicks and 2 non-clicks in a small test, the posterior is Beta(10,4) with mean 10/14≈0.71. The beta parameters behaved like pseudo-counts that absorbed the new successes and failures.",
    idea: "X~Beta(α,β) has density proportional to x^{α−1}(1−x)^{β−1} on (0,1). Larger α pulls mass toward 1; larger β pulls toward 0. Beta(1,1) is flat. Mean is α/(α+β).",
    steps: [
      {
        title: "Confirm the quantity is in (0,1)",
        body: "Beta is for proportions/probabilities. If your variable is a count or an unbounded positive quantity, use Poisson/gamma instead. If data can be 0 or 1 exactly as observations of θ, think Bayesian with Bernoulli likelihood.",
      },
      {
        title: "Start from Uniform = Beta(1,1)",
        body: "A flat prior says 'any rate equally plausible a priori.' Visualize this as the neutral starting point.",
      },
      {
        title: "Interpret α and β as shape / pseudo-counts",
        body: "Roughly, α−1 and β−1 behave like prior successes and failures in the conjugate story. Increasing α piles mass nearer to 1; increasing β nearer to 0. Both large ⇒ tight peak near the mean.",
      },
      {
        title: "Read the mean and spread",
        body: "E[X]=α/(α+β). Variance αβ/[(α+β)²(α+β+1)] shrinks as α+β grows — more total pseudo-count means more certainty.",
      },
      {
        title: "Update with binary data (Bayesian preview)",
        body: "Prior Beta(α,β) plus s successes and f failures ⇒ posterior Beta(α+s, β+f). That tidy update is why beta appears everywhere in Bayesian A/B testing primers.",
      },
    ],
    mathSimple: "The factors x^{α−1} and (1−x)^{β−1} reward values of x near 1 or near 0 depending on the exponents. The normalizing constant involves the beta function B(α,β)=Γ(α)Γ(β)/Γ(α+β), but you can often work with means and conjugacy without expanding Γ.",
    walkthrough: "Prior Beta(2,2): mean 2/4=0.5, fairly diffuse. After 8 successes and 2 failures: Beta(10,4), mean 10/14≈0.714. Variance = 10·4/[(14)²·15]=40/(196·15)≈0.0136, SD≈0.117. The posterior is concentrated nearer high click rates than the prior.",
    example: "Prior Beta(2,2) for a coin bias; after 8 heads and 2 tails → Beta(10,4) with mean ≈0.71. A flat prior Beta(1,1) would have become Beta(9,3) with mean 0.75 — slightly more aggressive toward 1 because the prior was weaker.",
    example2: "Beta(0.5,0.5) is U-shaped: most mass near 0 and 1, little near 1/2 — a prior that expects extreme rates. Beta(5,1) piles near 1 (mean 5/6≈0.83). Beta(1,5) piles near 0. Matching shape to belief matters before any data arrive.",
    labCue: "In the **pdf** lab, open a beta density. Start at α=β=1 (flat). Raise α to slide mass right; raise β to slide left. Try α=β=0.5 for the U-shape and α=β=8 for a tight central peak.",
    check: [
      "What is the support of a Beta random variable?",
      "What is E[X] for X~Beta(α,β)?",
      "Which beta equals Uniform(0,1)?",
    ],
    practice: [
      {
        q: "X~Beta(3,1). Find E[X] and say whether the density leans toward 0 or 1.",
        a: "E[X]=3/4=0.75. Density leans toward 1 (α>β).",
      },
      {
        q: "Prior Beta(1,1), data: 4 successes and 6 failures. What is the posterior mean?",
        a: "Posterior Beta(5,7), mean 5/12≈0.417.",
      },
    ],
    formal: "For α>0, β>0, f(x)=[1/B(α,β)] x^{α−1}(1−x)^{β−1} on (0,1). E[X]=α/(α+β), Var(X)=αβ/[(α+β)²(α+β+1)]. Conjugacy: if θ~Beta(α,β) and X|θ~Bin(n,θ), then θ|X=x ~ Beta(α+x, β+n−x).",
    formulas: "- f(x)∝ x^{α−1}(1−x)^{β−1} on (0,1)\n- E[X]=α/(α+β)\n- Var=αβ/[(α+β)²(α+β+1)]\n- Beta(1,1)=U(0,1); posterior α'=α+#successes, β'=β+#failures",
    derivation: "The beta function normalizes the monomial product x^{α−1}(1−x)^{β−1}. Conjugacy follows because the binomial likelihood θ^x (1−θ)^{n−x} multiplies the prior kernel θ^{α−1}(1−θ)^{β−1} and yields another beta kernel with updated exponents.",
    pitfalls: [
      "Using beta for data outside [0,1] without transforming",
      "Forgetting to update both α and β in conjugacy",
      "Confusing the random variable X~Beta (a random proportion) with a binomial count",
      "Choosing α,β < 1 without noticing the U-shape may be unintended",
    ],
    interview: "Describe beta as 'the flexible distribution on (0,1)' and mention conjugate updating with binary data as the practical reason it dominates Bayesian proportion models.",
    bridge: "Part 4 catalogued named single-variable families. Part 5 moves to two variables at once: joint distributions, dependence, and the limit theorems that justify normals for averages.",
  }),
];
