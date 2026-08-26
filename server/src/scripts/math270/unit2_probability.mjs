import { buildLesson } from "./helper.mjs";

const PART = "Part 2: Probability Theory";

export const topics = [
  buildLesson({
    title: "Basic Probability Concepts",
    partLabel: PART,
    principles: [
      "An experiment produces outcomes under uncertainty",
      "Sample space Ω lists all possible outcomes",
      "An event is a subset of Ω we care about",
      "Probability assigns weight to events — later axiomatized",
      "Clear outcomes prevent double-counting and missing cases",
    ],
    objectives: [
      "Define experiment, outcome, sample space, and event",
      "List Ω for simple chance setups",
      "Express events with set notation (∪, ∩, complement)",
      "Connect relative frequency to probability intuition",
      "Distinguish an outcome from a compound event",
    ],
    why: "Every probability sentence is about an **experiment** and an **event**. Get the vocabulary right and formulas stop feeling like magic spells. Vague words like \"it works\" hide whether you mean one outcome or a whole set of outcomes — and that confusion breaks every calculation that follows.",
    story: "You are load-testing a flaky login service. Each request might return success, timeout, or auth-error. A teammate says \"probability it fails\" without defining fail. Does timeout count? Does auth-error? You write the experiment (\"one login request\"), list Ω = {success, timeout, auth-error}, and define event F = {timeout, auth-error}. Now \"P(fail)\" is unambiguous, and your dashboards finally match the math you write in the design doc.",
    idea: "An **experiment** is a procedure with an uncertain result (flip a coin, send a request). An **outcome** is one atomic result. The **sample space** \(\\Omega\) is the set of all outcomes. An **event** is any subset of \(\\Omega\) you care about — \"at least one head,\" \"status is 5xx,\" \"even face.\" Probability will later assign a weight between 0 and 1 to each event. Until \(\\Omega\) and the event are clear, you are arguing about English, not math.",
    steps: [
      {
        title: "Name the experiment in one sentence",
        body: "What do you do once, and what uncertain result do you observe? \"Roll one fair die\" or \"shuffle a deck and draw one card\" or \"run the test suite once.\" If you cannot name the repeatable action, pause.",
      },
      {
        title: "List the sample space Ω",
        body: "Write every atomic outcome, mutually exclusive and exhaustive. Prefer a grain fine enough that every question you care about is a subset. Too coarse and you cannot express your event; too fine and you drown in detail.",
      },
      {
        title: "Define the event as a subset",
        body: "Translate the English question into a set of outcomes. \"Even die roll\" → {2,4,6}. Use unions for \"or,\" intersections for \"and,\" complements for \"not.\"",
      },
      {
        title: "Connect to long-run frequency",
        body: "Intuitively, P(A) is the fraction of many independent repetitions where A happens. That story will be made precise by axioms next — but it already tells you probability is a weight, not a prophecy about a single trial.",
      },
      {
        title: "Check edge language carefully",
        body: "\"It rains tomorrow\" is an event (many weather micro-outcomes collapsed into a yes/no set), not a single atomic outcome unless you defined Ω that way. Be explicit about the granularity you chose.",
      },
    ],
    mathSimple: "- Experiment → uncertain procedure.\n- Outcome \(\\omega \\in \\Omega\).\n- Event \(A \\subseteq \\Omega\).\n- Complement: \(A^c = \\Omega \\setminus A\) (\"not A\").\n- Union \(A \\cup B\): outcomes in A or B or both.\n- Intersection \(A \\cap B\): outcomes in both.\n\nProbability will be a function \(P\) sending events to numbers in \([0,1]\). For now, master the set picture: probability questions are always \"how much weight sits inside this subset?\"",
    walkthrough: "Experiment: roll a fair six-sided die once.\n\nΩ = {1,2,3,4,5,6}.\n\nEvent E = \"even\" = {2,4,6}.\nEvent H = \"at least 5\" = {5,6}.\nEvent E ∩ H = {6}.\nEvent E ∪ H = {2,4,5,6}.\nEvent Eᶜ = {1,3,5}.\n\nIf each face is equally likely, relative-frequency intuition says P(E)=3/6=1/2, P(H)=2/6=1/3, P(E∩H)=1/6. The axioms lesson will justify the arithmetic; the set lesson makes sure you counted the right faces.",
    example: "Roll a fair die. Ω = {1,2,3,4,5,6}. Event \"even\" = {2,4,6}. Event \"at least 5\" = {5,6}. Event \"even and at least 5\" = {6}. Naming sets prevents double-counting when you later add probabilities.",
    example2: "Send one HTTP request. Ω = {2xx, 3xx, 4xx, 5xx} (coarse). Event \"client problem\" = {4xx}. Event \"not success\" = {3xx,4xx,5xx} if you treat only 2xx as success. If you instead need to distinguish 401 from 404, refine Ω to include those codes — the event language scales with your chosen grain.",
    labCue: "Use the **sampleSpace** lab: flip coins / roll dice and highlight events as the outcome set lights up. Practice saying \"event = this subset\" out loud before reading any probability number.",
    check: [
      "Is 'it rains tomorrow' an outcome or an event? When could it be either?",
      "Can two events share outcomes?",
      "Why must outcomes in Ω be exhaustive?",
    ],
    practice: [
      {
        q: "Two fair coins are flipped. Write Ω as ordered pairs, then write the event A = 'exactly one head.'",
        a: "Ω = {(H,H),(H,T),(T,H),(T,T)}. A = {(H,T),(T,H)}.",
      },
      {
        q: "In words, what is Aᶜ for A = 'exactly one head' on two coins?",
        a: "Not exactly one head: both heads or both tails — {(H,H),(T,T)}.",
      },
    ],
    formal: "A sample space \(\\Omega\) is a set; events live in a σ-algebra \(\\mathcal{F}\) of subsets (for finite Ω, you can take all subsets). Outcomes are elementary events \(\\{\\omega\\}\). Probability is introduced next as a normalized measure on \(\\mathcal{F}\).",
    formulas: "- Event \(A \\subseteq \\Omega\)\n- Complement \(A^c = \\Omega \\setminus A\)\n- Union / intersection: \(A \\cup B\), \(A \\cap B\)\n- Disjoint (mutually exclusive): \(A \\cap B = \\emptyset\)",
    derivation: "Set notation is not decoration — it is the derivation of clarity. Every later identity (inclusion-exclusion, conditioning, Bayes) manipulates subsets. If the subset is wrong, the algebra is theater.",
    pitfalls: [
      "Forgetting outcomes (non-exhaustive Ω)",
      "Treating overlapping compound descriptions as single atoms",
      "Changing the experiment mid-argument (one coin vs two coins)",
    ],
    interview: "Start any probability answer with: 'Experiment is ___, Ω is ___, event is ___.' Interviewers relax when the set picture is explicit.",
    bridge: "Next we turn 'weights on events' into precise rules: the axioms of probability, from which complements and unions follow.",
  }),

  buildLesson({
    title: "Axioms of Probability",
    partLabel: PART,
    principles: [
      "Probability maps events to numbers in [0,1]",
      "P(Ω) = 1; the empty event has probability 0",
      "Countable additivity for disjoint unions",
      "All common rules (complements, inclusion) follow from axioms",
      "Axioms keep calculations consistent across models",
    ],
    objectives: [
      "State Kolmogorov's three axioms in plain language",
      "Derive P(Aᶜ) = 1 − P(A)",
      "Use inclusion-exclusion for two events",
      "Apply additivity on a partition",
      "Detect illegal probability assignments",
    ],
    why: "Axioms are the constitution. Every later theorem — Bayes, expectation, distributions — must respect them. They keep calculations consistent when intuition about \"likely\" gets slippery. If a proposed model assigns negative probability or makes disjoint pieces sum past 1, the axioms reject it before you ship nonsense.",
    story: "A product manager claims: P(user clicks) = 0.7, P(user purchases) = 0.6, and P(click and purchase) = 0.1, then adds 0.7+0.6 to get \"1.3 probability of click or purchase.\" You gently apply inclusion-exclusion: P(click ∪ purchase) = 0.7+0.6−0.1 = 1.2 — still impossible. The axioms force a remodel of the inputs; something in the estimated probabilities is inconsistent.",
    idea: "Kolmogorov's axioms: (1) **Non-negativity** — \(P(A)\\ge 0\). (2) **Normalization** — \(P(\\Omega)=1\). (3) **Additivity** — if events are pairwise disjoint, the probability of their union is the sum of probabilities. From these you derive \(P(A^c)=1-P(A)\), \(P(\\emptyset)=0\), monotonicity, and \(P(A\\cup B)=P(A)+P(B)-P(A\\cap B)\). Probability is not \"vibes\"; it is a normalized measure on events.",
    steps: [
      {
        title: "Check non-negativity",
        body: "No event gets a negative probability. If your formula spat out −0.02, you made an algebra or modeling error — the axioms forbid shipping it.",
      },
      {
        title: "Normalize the whole space",
        body: "Something in Ω must happen: P(Ω)=1. If you assigned probabilities to outcomes, they must sum to 1. This is the most common silent bug in hand-built discrete models.",
      },
      {
        title: "Add only disjoint pieces — or subtract overlap",
        body: "For mutually exclusive events, P(A∪B)=P(A)+P(B). If they can both happen, subtract P(A∩B) so the intersection is not double-counted.",
      },
      {
        title: "Use the complement trick",
        body: "Sometimes \"none\" or \"at least one\" is easier via complements: P(at least one) = 1 − P(none). This is axiom-powered, not a special case.",
      },
      {
        title: "Stress-test proposed numbers",
        body: "Ask whether any axiom is violated. P(A)>1, P(A∪B)>P(A)+P(B) for disjoint A,B, or P(A∩B)>min(P(A),P(B)) are red flags.",
      },
    ],
    mathSimple: "Axioms:\n1. \(P(A)\\ge 0\) for every event \(A\).\n2. \(P(\\Omega)=1\).\n3. If \(A_1,A_2,\\ldots\) pairwise disjoint, then \(P(\\bigcup_i A_i)=\\sum_i P(A_i)\).\n\nImmediate consequences:\n- \(P(\\emptyset)=0\).\n- \(P(A^c)=1-P(A)\).\n- If \(A\\subseteq B\) then \(P(A)\\le P(B)\).\n- \(P(A\\cup B)=P(A)+P(B)-P(A\\cap B)\).\n\nIn words: mass is never negative, total mass is 1, and mass adds on non-overlapping pieces.",
    walkthrough: "Given P(A)=0.4, P(B)=0.5, P(A∩B)=0.2.\n\nP(A∪B)=0.4+0.5−0.2=0.7.\nP(Aᶜ)=1−0.4=0.6.\nP(A∩B) ≤ P(A) and ≤ P(B): 0.2 ≤ 0.4 and 0.2 ≤ 0.5 — OK.\n\nIf someone claimed P(A∩B)=0.45, that would exceed P(B)=0.5? Wait, 0.45≤0.5, but check vs P(A): 0.45>0.4 — illegal. Axioms catch it.",
    example: "P(rain)=0.3 ⇒ P(no rain)=0.7 by complements. If P(A)=0.4, P(B)=0.5, P(A∩B)=0.2 then P(A∪B)=0.7. If A and B are disjoint, the intersection term is 0 and the union is a plain sum.",
    example2: "Partition a day into morning / afternoon / night traffic regimes with probabilities 0.2, 0.5, 0.3. They are disjoint and cover Ω, so they sum to 1. P(morning or afternoon)=0.2+0.5=0.7. You may not assign 0.4, 0.5, 0.3 — that sums to 1.2 and violates normalization.",
    labCue: "In **sampleSpace**, assign weights to outcomes; watch event probabilities update from the axioms. Try to break normalization and see the lab refuse a total other than 1.",
    check: [
      "Can P(A) > 1 under the axioms?",
      "If A and B are disjoint, simplify P(A∪B).",
      "Why is P(A∩B) ≤ P(A) always?",
    ],
    practice: [
      {
        q: "P(A)=0.6. Find P(Aᶜ). If also P(B)=0.3 and A,B disjoint, find P(A∪B).",
        a: "P(Aᶜ)=0.4. P(A∪B)=0.6+0.3=0.9.",
      },
      {
        q: "P(A∪B)=0.8, P(A)=0.5, P(B)=0.6. Find P(A∩B).",
        a: "0.8 = 0.5+0.6−P(A∩B) ⇒ P(A∩B)=0.3.",
      },
    ],
    formal: "A probability space is a triple \((\\Omega,\\mathcal{F},P)\) with \(P:\\mathcal{F}\\to[0,1]\) satisfying Kolmogorov's axioms. Finite additivity is weaker than countable additivity; the full axiom uses countable disjoint unions to handle infinite Ω cleanly.",
    formulas: "- \(P(A^c)=1-P(A)\)\n- \(P(A\\cup B)=P(A)+P(B)-P(A\\cap B)\)\n- If \(A\\subseteq B\) then \(P(A)\\le P(B)\)\n- For a partition \(B_i\): \(P(A)=\\sum_i P(A\\cap B_i)\)",
    derivation: "Complement rule: \(A\) and \(A^c\) are disjoint and union to \(\\Omega\), so \(P(A)+P(A^c)=P(\\Omega)=1\). Inclusion-exclusion: \(P(A)+P(B)\) counts \(A\\cap B\) twice, so subtract once. These are not new assumptions — only axiom algebra.",
    pitfalls: [
      "Adding probabilities of overlapping events without subtracting the intersection",
      "Assigning outcome weights that do not sum to 1",
      "Confusing \"disjoint\" with \"independent\" (different ideas)",
    ],
    interview: "If given inconsistent probabilities, say which axiom breaks and propose the minimal fix — that shows modeling maturity, not just formula memory.",
    bridge: "Often you learn that something already happened. Conditioning rebuilds the weights on a smaller world — next lesson.",
  }),

  buildLesson({
    title: "Conditional Probability",
    partLabel: PART,
    principles: [
      "Conditioning updates the sample space to a known event",
      "P(A|B) = P(A∩B)/P(B) when P(B)>0",
      "Definition rearranges to the multiplication rule",
      "Almost every real inference is conditional",
      "Two-way tables make conditioning concrete",
    ],
    objectives: [
      "Compute P(A|B) from counts or probabilities",
      "Read two-way tables conditionally (rows vs columns)",
      "Apply the multiplication rule P(A∩B)=P(A|B)P(B)",
      "Explain conditioning as \"rebuild weights given B\"",
      "Avoid confusing P(A|B) with P(B|A)",
    ],
    why: "Raw P(A) answers \"how likely is A with no extra information?\" Real life always has extra information: the test was positive, the user is on mobile, the packet came from region EU. Conditional probability is the math of updated beliefs after you learn an event occurred.",
    story: "Among 1000 emails, 50 are spam. Among spam, 40 contain the word \"winner\"; among non-spam, 10 do. You see \"winner\" and ask: probability it is spam? That is P(spam | winner), not P(winner | spam). Students who swap those two numbers build terrible filters. Conditioning keeps the given information in the denominator — here, among messages with \"winner,\" what fraction are spam?",
    idea: "**Conditional probability** \(P(A\\mid B)\) is the probability of A if we treat B as the new universe. Only outcomes inside B still exist; we renormalize their weights so B has total probability 1. Formula: \(P(A\\mid B)=P(A\\cap B)/P(B)\) when \(P(B)>0\). Rearranged: \(P(A\\cap B)=P(A\\mid B)\\,P(B)\) — the **multiplication rule**. Reading a table \"given row B, what fraction is also in column A?\" is the same idea with counts.",
    steps: [
      {
        title: "Identify the given event B",
        body: "Underline the information you already know happened. That event becomes the denominator world. If you cannot name B, you are not ready to condition.",
      },
      {
        title: "Find the intersection A ∩ B",
        body: "Which outcomes (or table cells) satisfy both A and B? That mass is the numerator. In a count table, it is the cell in both categories.",
      },
      {
        title: "Divide by P(B) or by the count of B",
        body: "P(A|B)=P(A∩B)/P(B). With counts, (# in A and B)/(# in B). You are asking: among B's, what fraction are also A's?",
      },
      {
        title: "Say the answer in a sentence with 'given'",
        body: "\"Given that the message contains 'winner,' the probability it is spam is …\" The word given keeps P(A|B) from flipping into P(B|A).",
      },
      {
        title: "Use multiplication to build joints when needed",
        body: "If you know P(B) and P(A|B), multiply to get P(A∩B). Chain rules for three events extend the same idea step by step.",
      },
    ],
    mathSimple: "- \(P(A\\mid B) = \\dfrac{P(A\\cap B)}{P(B)}\) for \(P(B)>0\).\n- Multiplication: \(P(A\\cap B)=P(A\\mid B)P(B)=P(B\\mid A)P(A)\).\n- In a finite equally likely Ω: \(P(A\\mid B)=|A\\cap B|/|B|\).\n\nIn words: \"Restrict to B, then measure how much of that restricted world still sits in A.\" The vertical bar means given — never \"divide A by B\" as numbers without sets.",
    walkthrough: "Emails: 1000 total. Spam: 50. Non-spam: 950.\n\"Winner\" ∩ spam: 40. \"Winner\" ∩ non-spam: 10. So \"winner\" total = 50.\n\nP(spam | winner) = 40/50 = 0.8.\nP(winner | spam) = 40/50 = 0.8 numerically here by coincidence of the spam row — wait: among spam, 40/50=0.8. Among winner, also 40/50=0.8. Same number, different meaning!\n\nChange non-spam winners to 90: then winner total=130, P(spam|winner)=40/130≈0.31, while P(winner|spam) stays 0.8. The swap danger appears.",
    example: "Two-way table: 40 spam-with-winner, 10 ham-with-winner. Given winner (50 messages), P(spam|winner)=40/50=0.8. Given spam (50 messages), P(winner|spam)=40/50=0.8 in this particular table — but the questions differ, and other tables separate them.",
    example2: "Die roll. Given the face is even (B={2,4,6}), probability it is a 6: P({6}|B)=1/3. Unconditionally P(6)=1/6. Learning \"even\" doubled the chance of 6 because half of the odd world was discarded.",
    labCue: "In the **conditional** / **sampleSpace** lab, lock an event B as given and watch the remaining outcomes renormalize. Confirm the highlighted subset matches A∩B.",
    check: [
      "Why do we require P(B)>0 in the definition?",
      "In a table, how do you read P(column|row) vs P(row|column)?",
      "State the multiplication rule from memory.",
    ],
    practice: [
      {
        q: "P(A∩B)=0.1 and P(B)=0.4. Find P(A|B).",
        a: "P(A|B)=0.1/0.4=0.25.",
      },
      {
        q: "A bag has 3 red and 2 blue tokens. Draw two without replacement. Find P(second red | first red).",
        a: "After one red removed: 2 red and 2 blue left. P=2/4=1/2.",
      },
    ],
    formal: "For fixed B with \(P(B)>0\), \(Q(A):=P(A\\mid B)\) is itself a probability measure on events. The definition extends to conditional distributions of random variables later. Care with \(P(B)=0\) requires more advanced conditioning on null sets.",
    formulas: "- \(P(A\\mid B)=P(A\\cap B)/P(B)\)\n- \(P(A\\cap B)=P(A\\mid B)P(B)\)\n- Chain rule: \(P(A\\cap B\\cap C)=P(A)P(B\\mid A)P(C\\mid A\\cap B)\)",
    derivation: "Start from \"restrict to B.\" The mass of outcomes that are in A and B is P(A∩B). After restricting, total mass should be 1, so divide by P(B). That single normalization step is the whole definition.",
    pitfalls: [
      "Swapping P(A|B) with P(B|A)",
      "Dividing by P(A) when the given information was B",
      "Applying conditioning when B has probability zero without a limiting story",
    ],
    interview: "Clarify given information in one sentence before computing. If discussing classifiers, explicitly distinguish false positive rate P(+|no disease) from PPV P(disease|+).",
    bridge: "Bayes' theorem flips conditionals — exactly the move from P(data|hypothesis) to P(hypothesis|data).",
  }),

  buildLesson({
    title: "Bayes Theorem",
    partLabel: PART,
    principles: [
      "Bayes flips P(data|hypothesis) into P(hypothesis|data)",
      "Prior × likelihood, normalized by total probability of the data",
      "Base rates matter — rare events stay rare without strong evidence",
      "The law of total probability expands the denominator",
      "Posterior becomes the next prior when data arrive sequentially",
    ],
    objectives: [
      "State and apply Bayes' theorem for two and multiple hypotheses",
      "Use a tree or table to avoid algebraic slips",
      "Explain base-rate neglect with a numeric example",
      "Compute posteriors from priors and likelihoods",
      "Write the denominator via total probability",
    ],
    why: "Medical tests, spam filters, and A/B anomaly alarms all give P(signal | state). Decision-makers need P(state | signal). Bayes is the disciplined flip. Ignoring base rates — how rare the state was before the signal — produces famous false confidence.",
    story: "A rare bug affects 1% of sessions. Your detector flags the bug with 90% sensitivity and has a 5% false-alarm rate on healthy sessions. It fires on a session. Panic? Compute P(bug | flag). Most flagged sessions are still false alarms because healthy sessions dominate. Bayes turns the scary 90% into a calmer posterior — and teaches your team not to equate \"test accuracy\" with \"probability we are broken.\"",
    idea: "**Bayes' theorem**: \(P(H\\mid D)=\\dfrac{P(D\\mid H)P(H)}{P(D)}\). Here \(P(H)\) is the **prior**, \(P(D\\mid H)\) the **likelihood**, and \(P(D)\) the probability of the data (expand with total probability over hypotheses). The left side is the **posterior**. In words: reweight each hypothesis by how well it predicts the data, then renormalize so posteriors sum to 1.",
    steps: [
      {
        title: "Name hypotheses and data",
        body: "H = states of the world (bug / no bug). D = observation (flag / no flag). Write priors P(H) from base rates before seeing D.",
      },
      {
        title: "Write likelihoods P(D|H)",
        body: "From the test design: true positive rate, false positive rate, etc. Keep them attached to the correct hypothesis.",
      },
      {
        title: "Expand P(D) with total probability",
        body: "P(D)=Σ P(D|H_i)P(H_i) over a partition of hypotheses. A tree with branch weights makes this mechanical.",
      },
      {
        title: "Apply Bayes and interpret the posterior",
        body: "Multiply prior by likelihood for the hypothesis of interest; divide by P(D). Say the answer as \"given the data, probability of H is…\"",
      },
      {
        title: "Sanity-check against the base rate",
        body: "If H is very rare and the test is imperfect, the posterior often stays moderate. If your posterior ignored the prior entirely, you likely computed a likelihood by mistake.",
      },
    ],
    mathSimple: "- Bayes: \(P(H\\mid D)=\\dfrac{P(D\\mid H)P(H)}{P(D)}\).\n- Total probability (two cases): \(P(D)=P(D\\mid H)P(H)+P(D\\mid H^c)P(H^c)\).\n- Odds form: \(\\dfrac{P(H\\mid D)}{P(H^c\\mid D)}=\\dfrac{P(D\\mid H)}{P(D\\mid H^c)}\\cdot\\dfrac{P(H)}{P(H^c)}\) (likelihood ratio updates prior odds).\n\nIn words: posterior odds = likelihood ratio × prior odds — then convert odds back to probability if needed.",
    walkthrough: "P(bug)=0.01, P(no bug)=0.99.\nP(flag|bug)=0.90, P(flag|no bug)=0.05.\n\nP(flag)=0.90·0.01 + 0.05·0.99 = 0.009 + 0.0495 = 0.0585.\n\nP(bug|flag)= (0.90·0.01)/0.0585 = 0.009/0.0585 ≈ 0.154.\n\nOnly about 15.4% of flags are real bugs. The 90% sensitivity did not mean \"90% chance we have the bug.\"",
    example: "Same bug-detector numbers as the walkthrough: posterior ≈ 15.4%. A manager who heard \"90% accurate\" and concluded the system is probably broken committed base-rate neglect.",
    example2: "Spam prior P(S)=0.2. P(word|S)=0.4, P(word|Sᶜ)=0.05. Then P(word)=0.4·0.2+0.05·0.8=0.12. P(S|word)=(0.08)/0.12≈0.67. One informative word lifts 20% prior spam probability to about 67% posterior.",
    labCue: "Use a Bayes lab or tree diagram: slide the prior base rate and watch the posterior swing even when likelihoods stay fixed. Predict the direction before moving the slider.",
    check: [
      "What is the difference between likelihood and posterior?",
      "Why does a rare disease stay unlikely after one imperfect positive test?",
      "Write P(D) using the law of total probability for H and Hᶜ.",
    ],
    practice: [
      {
        q: "Prior P(H)=0.3, P(D|H)=0.8, P(D|Hᶜ)=0.1. Find P(H|D).",
        a: "P(D)=0.8·0.3+0.1·0.7=0.24+0.07=0.31. P(H|D)=0.24/0.31≈0.774.",
      },
      {
        q: "In one sentence, correct someone who equates \"90% true positive rate\" with \"90% chance of disease given positive.\"",
        a: "True positive rate is P(+|disease); the clinically needed number is P(disease|+) which also depends on prevalence and false positives via Bayes.",
      },
    ],
    formal: "For a countable partition \(\\{H_i\\}\), \(P(H_j\\mid D)=\\frac{P(D\\mid H_j)P(H_j)}{\\sum_i P(D\\mid H_i)P(H_i)}\). Continuously parameterized hypotheses replace the sum by an integral (Bayes with densities).",
    formulas: "- \(P(H\\mid D)=P(D\\mid H)P(H)/P(D)\)\n- \(P(D)=\\sum_i P(D\\mid H_i)P(H_i)\)\n- Odds update: posterior odds = LR × prior odds",
    derivation: "Start from the definition of conditional probability twice: P(H∩D)=P(H|D)P(D)=P(D|H)P(H). Solve for P(H|D). Expand P(D) by partitioning the world into hypotheses. Bayes is literally conditional probability plus total probability — not a new axiom.",
    pitfalls: [
      "Base-rate neglect (ignoring P(H))",
      "Mixing up sensitivity P(D|H) with PPV P(H|D)",
      "Forgetting to normalize by P(D) (reporting raw prior×likelihood)",
    ],
    interview: "Walk a medical-test or fraud-detection example with a 2×2 count table. Show the posterior as a fraction of the \"positive\" column — tables beat formula theater.",
    bridge: "Sometimes learning B tells you nothing new about A — that special case is independence, next.",
  }),

  buildLesson({
    title: "Independence of Events",
    partLabel: PART,
    principles: [
      "Independence means P(A∩B)=P(A)P(B)",
      "Equivalent: P(A|B)=P(A) when P(B)>0 (A ignores B)",
      "Disjoint events with positive probability are dependent",
      "Mutual independence for many events is stronger than pairwise",
      "Independence is a modeling assumption — verify or justify",
    ],
    objectives: [
      "Test independence using products of probabilities",
      "Contrast independence with mutually exclusive",
      "Use independence to factor joint probabilities",
      "Spot false independence assumptions in sequential trials",
      "Explain conditional independence at a high level",
    ],
    why: "Independence is the modeling gift that lets joint probabilities factor into simpler pieces. Coin flips, hash bits, and i.i.d. samples all rely on it. Assuming independence when feedback loops exist (without-replacement draws, social contagion, shared servers) silently breaks binomial models and confidence intervals later.",
    story: "You model two consecutive API calls as independent successes with p=0.9, so P(both work)=0.81. In production they share one auth token cache: when the cache dies, both fail together. Empirically P(both work) is far below 0.81. The events are positively dependent. Your SLO math was fiction until you modeled the shared failure mode.",
    idea: "Events A and B are **independent** if knowing that B happened does not change the probability of A: \(P(A\\mid B)=P(A)\) (when \(P(B)>0\)). Equivalently, \(P(A\\cap B)=P(A)P(B)\). **Mutually exclusive** (disjoint) is a different idea: they cannot happen together. Two disjoint events with positive probability cannot be independent — learning one happened forces the other not to. Independence is about information; disjointness is about empty intersection.",
    steps: [
      {
        title: "Write the candidate events clearly",
        body: "Name A and B as subsets. Independence is a relationship between events (or σ-algebras), not a vibe about \"unrelated sounding words.\"",
      },
      {
        title: "Check the product rule",
        body: "Compute P(A∩B) and compare to P(A)P(B). Equal (within modeling tolerance) → independent. Alternatively compare P(A|B) to P(A).",
      },
      {
        title: "Do not confuse with disjointness",
        body: "If A∩B=∅ and P(A)>0, P(B)>0, then P(A∩B)=0 ≠ P(A)P(B). Disjoint ⇒ dependent in this common case.",
      },
      {
        title: "Factor joints only after assuming or verifying independence",
        body: "Under independence, P(A∩B∩C)=P(A)P(B)P(C) for mutually independent triples — but pairwise independence does not imply the triple product identity. Know which assumption you need.",
      },
      {
        title: "Ask whether the physical process shares a cause",
        body: "Shared RNG seeds, without-replacement sampling, and common network links create dependence. If a common cause can drive both events, treat independence as suspicious until justified.",
      },
    ],
    mathSimple: "- Independent: \(P(A\\cap B)=P(A)P(B)\).\n- If \(P(B)>0\): equivalent to \(P(A\\mid B)=P(A)\).\n- For many events, **mutual independence** requires factorization for every finite subcollection.\n- Conditional independence given C: \(P(A\\cap B\\mid C)=P(A\\mid C)P(B\\mid C)\) — A and B may be dependent marginally but independent once C is known (or vice versa).\n\nIn words: \"Independence means the joint factors; information about one event does not move the other's probability.\"",
    walkthrough: "Fair coin twice, Ω={(H,H),(H,T),(T,H),(T,T)} each 1/4.\nA = first coin H = {(H,H),(H,T)}, P(A)=1/2.\nB = second coin H = {(H,H),(T,H)}, P(B)=1/2.\nA∩B={(H,H)}, P=1/4 = (1/2)(1/2) → independent. Good.\n\nC = \"exactly one H\" = {(H,T),(T,H)}, P(C)=1/2.\nA∩C={(H,T)}, P=1/4 ≠ (1/2)(1/2)=1/4? Equal here… try D=\"at least one H\": P(D)=3/4, A∩D=A, P=1/2, while P(A)P(D)=(1/2)(3/4)=3/8 ≠ 1/2 → dependent. Learning \"at least one H\" changes beliefs about the first coin being H.",
    example: "Two fair dice. A = first die is 6, B = second die is 6. Independent: P(A∩B)=1/36=P(A)P(B). Knowing the first die tells you nothing about the second if rolls are separate.",
    example2: "Draw two cards without replacement. A = first is ace, B = second is ace. P(A)=4/52. P(B|A)=3/51 ≠ 4/52 = P(B). Dependent because the deck composition changed. With replacement (or a huge deck approximation), near-independence can be a useful model.",
    labCue: "In the sample-space lab, compare P(A∩B) to P(A)P(B) for paired coin events vs \"shares a constraint\" events. Color dependence when the product test fails.",
    check: [
      "Can mutually exclusive events with positive probability be independent?",
      "State two equivalent definitions of independence for a pair of events.",
      "Why does sampling without replacement break i.i.d. assumptions?",
    ],
    practice: [
      {
        q: "P(A)=0.5, P(B)=0.4, P(A∩B)=0.2. Are A and B independent?",
        a: "P(A)P(B)=0.20 = P(A∩B), so yes — independent under these numbers.",
      },
      {
        q: "P(A)=0.3, P(B)=0.3, A∩B=∅. Independent?",
        a: "No. P(A∩B)=0 ≠ 0.09. Disjoint with positive probabilities ⇒ dependent.",
      },
    ],
    formal: "A and B are independent if \(P(A\\cap B)=P(A)P(B)\). A family is mutually independent if for every finite subcollection the joint probability factors into the product of individuals. Independence of σ-algebras generalizes the definition for random variables later.",
    formulas: "- \(P(A\\cap B)=P(A)P(B)\) (independence)\n- \(P(A\\mid B)=P(A)\) when \(P(B)>0\)\n- Mutual: \(P(\\bigcap_{j=1}^k A_{i_j})=\\prod_{j=1}^k P(A_{i_j})\) for all finite subcollections",
    derivation: "From P(A|B)=P(A∩B)/P(B), setting P(A|B)=P(A) immediately yields the product rule. Conversely, the product rule implies the conditional equals the marginal. So \"no information\" and \"joint factors\" are the same statement.",
    pitfalls: [
      "Confusing independent with mutually exclusive",
      "Assuming pairwise independence implies mutual independence",
      "Factoring joints for without-replacement experiments",
    ],
    interview: "Give a one-liner: 'Independent means the joint factors; mutually exclusive means empty intersection — and those two clash when both events can happen with positive probability.'",
    bridge: "When outcomes are equally likely, counting the size of sets replaces summing weights — counting principles are next.",
  }),

  buildLesson({
    title: "Counting Principles",
    partLabel: PART,
    principles: [
      "Product rule: sequential choices multiply",
      "Sum rule: disjoint cases add",
      "Permutations order matters; combinations order does not",
      "Equal-likelihood models turn counts into probabilities",
      "Overcounting is the usual failure mode — divide by symmetries",
    ],
    objectives: [
      "Apply product and sum rules to structured counting",
      "Compute P(n,k) and C(n,k) and know when each applies",
      "Convert counts to probabilities under uniformity",
      "Avoid overcounting by identifying when order is fake",
      "Set up binomial coefficients for later binomial distributions",
    ],
    why: "Classical probability often reduces to \"favorable over total\" when outcomes are equally likely. That fraction is only as good as your counting. Permutations, combinations, and the product rule are the combinatorics toolkit behind passwords, hash collisions intuitions, and the binomial coefficient in Binomial(n,p).",
    story: "Your club runs a CTF with 10 problems; a team solves exactly 3 for partial credit. How many possible solve-sets exist? Someone answers 10×9×8, thinking order of solving matters for the set. But the scoreboard only stores which three were solved — order is fake. The right count is C(10,3)=120. That same binomial coefficient will reappear as the number of ways to place 3 successes among 10 Bernoulli trials.",
    idea: "**Product rule**: if a process has stages with \(n_1,n_2,\\ldots\) options, total sequences = \(n_1 n_2\\cdots\). **Sum rule**: if cases partition the possibilities, add the counts. **Permutations** \(P(n,k)=n!/(n-k)!\) count ordered k-selections from n. **Combinations** \(C(n,k)=n!/(k!(n-k)!)\) count unordered k-subsets. Under equally likely outcomes, \(P(A)=|A|/|\\Omega|\). The art is choosing whether order matters in \(|\\Omega|\) and \(|A|\) consistently.",
    steps: [
      {
        title: "Decide whether order matters",
        body: "If rearranging the same items creates a genuinely different outcome (passwords, podium places), use permutations / product rule on sequences. If only the set matters (lottery numbers, which servers failed), use combinations.",
      },
      {
        title: "Break the problem into stages or cases",
        body: "Sequential construction → multiply stage counts (product rule). Mutually exclusive scenarios → count each and add (sum rule). Draw a tree for small cases to verify.",
      },
      {
        title: "Write P(n,k) or C(n,k) deliberately",
        body: "Ordered k-lists from n distinct items: P(n,k). Unordered k-subsets: C(n,k). Remember C(n,k)=P(n,k)/k! — we divide by the k! fake orders of each subset.",
      },
      {
        title: "Form the probability under uniformity",
        body: "Identify |Ω| and |A| with the same counting convention. Then P(A)=|A|/|Ω|. Inconsistent conventions (ordered numerator, unordered denominator) are classic traps.",
      },
      {
        title: "Spot symmetries and overcounts",
        body: "If you counted each real outcome m times, divide by m. Circular arrangements often divide by n; identical objects reduce factorials.",
      },
    ],
    mathSimple: "- Product rule: \(n_1 n_2 \\cdots n_m\) sequential choices.\n- \(P(n,k)=\\dfrac{n!}{(n-k)!}\) (injective sequences of length k).\n- \(C(n,k)=\\binom{n}{k}=\\dfrac{n!}{k!(n-k)!}\) (k-subsets).\n- Uniform probability: \(P(A)=|A|/|\\Omega|\).\n\nIn words: permutations remember order; combinations forget order by dividing out the internal shuffles.",
    walkthrough: "Password: 2 lowercase letters then 2 digits, with replacement, order matters.\nLetters: 26×26. Digits: 10×10. Total |Ω|=26×26×10×10=67,600 by product rule.\n\nEvent A: both letters are 'a' or 'b' only (each letter ∈{a,b}) and digits free: 2×2×10×10=400.\nP(A)=400/67600≈0.0059.\n\nContrast: choose 2 distinct servers out of 10 to reboot (order irrelevant): C(10,2)=45, not 10×9=90.",
    example: "How many ways to award gold/silver/bronze to 10 students? P(10,3)=10×9×8=720 (order matters). How many ways to pick a committee of 3 from 10? C(10,3)=120 (order does not).",
    example2: "Fair coin flipped 5 times, equally likely 2⁵=32 sequences. Number of sequences with exactly 2 heads: C(5,2)=10. P(exactly 2 heads)=10/32=5/16. This is the counting heart of the binomial PMF with p=1/2.",
    labCue: "When a lab asks for \"number of outcomes,\" force yourself to say \"ordered or unordered?\" before typing a factorial. Cross-check a tiny n by listing.",
    check: [
      "Why is C(n,k)=P(n,k)/k!?",
      "When does the sum rule apply instead of the product rule?",
      "What goes wrong if numerator and denominator use different order conventions?",
    ],
    practice: [
      {
        q: "From 8 books, how many ways to pick 3 to take on a trip (order irrelevant)? How many ways to assign 3 distinct books to morning/afternoon/evening slots?",
        a: "Combinations C(8,3)=56. Permutations P(8,3)=8×7×6=336.",
      },
      {
        q: "A fair die is rolled twice. Using counting, find P(sum is 7).",
        a: "|Ω|=36. Favorable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) → 6. P=6/36=1/6.",
      },
    ],
    formal: "The product rule counts functions / tuples on a Cartesian product. \(\\binom{n}{k}\) counts k-subsets of an n-set and appears as coefficients in \((x+y)^n\). Under the classical uniform probability on a finite Ω, measure reduces to normalized counting measure.",
    formulas: "- \(P(n,k)=n!/(n-k)!\)\n- \(\\binom{n}{k}=n!/(k!(n-k)!)\)\n- Uniform: \(P(A)=|A|/|\\Omega|\)\n- Binomial link: \(\\binom{n}{k} p^k(1-p)^{n-k}\)",
    derivation: "P(n,k) builds an ordered list: n choices for the first position, n−1 for the second, …. Each unordered k-set corresponds to k! ordered lists, so divide by k! to get C(n,k). That division-by-symmetry idea recurs whenever identical structure is overcounted.",
    pitfalls: [
      "Using permutations when the problem only cares about sets",
      "Inconsistent order conventions in favorable vs total counts",
      "Forgetting replacement vs without-replacement in sequential draws",
    ],
    interview: "Narrate: 'First I decide if order matters; then I count |Ω| and |A| with the same rule; then I divide.' That script prevents most combinatorics bugs.",
    bridge: "Part 3 attaches numbers to outcomes via random variables — PMFs turn counting weights into distributions on the line.",
  }),
];
