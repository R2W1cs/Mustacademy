import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

const syllabus = [
    {
        title: "Introduction to Moral Philosophy",
        importance: "Foundational",
        principles: [
            "Ethics: Moral principles governing behavior and conduct",
            "Morality vs. Ethics: Personal/societal standards vs. systematic philosophical study",
            "The Minimum Conception: Reason + Impartiality = Ethical conduct",
            "Seven Universal Morals: Fairness, Helping the group, Defer to authority, Returning favors, Respecting property, Bravery, Loving family",
            "Data Ethics: Moral obligations in data generation, recording, curation, processing, dissemination, sharing, and use",
            "Three Dimensions: Philosophical (foundations), Practice (conduct guide), Contextual (domain-specific)",
            "Historical Evolution: Socrates (399 BC) → Kant (1785) → Mill (1861) → Singer (1972)",
            "Case Study: Baby Theresa - Anencephalic infant organ donation dilemma",
            "Case Study: Jody & Mary - Conjoined twins separation ethics",
            "Ethical Theories: Consequentialism, Deontology, Virtue Ethics, Social Contract, Divine Command"
        ],
        blueprint: `graph TD
    A[Ethical Dilemma] --> B{Minimum Conception}
    B --> C[Reason: Examine Facts]
    B --> D[Impartiality: Equal Weight]
    
    C --> E{Theoretical Lens}
    D --> E
    
    E -->|Consequentialism| F[Best Overall Results?]
    E -->|Deontology| G[Respect for Persons?]
    E -->|Virtue Ethics| H[Character & Context?]
    E -->|Social Contract| I[Rational Agreement?]
    
    F --> J[Utilitarian Calculus]
    G --> K[Kantian Duty]
    H --> L[Aristotelian Flourishing]
    I --> M[Hobbesian Consent]
    
    J --> N{Baby Theresa Case}
    K --> N
    L --> N
    M --> N
    
    N -->|Benefits Argument| O[Transplant: Save Others]
    N -->|Respect Argument| P[No Transplant: Dignity]
    N -->|Killing Argument| Q[Evaluate: Future/Consciousness]
    
    style N fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style E fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### The Ethical Decision Framework
Implementing a multi-theory evaluation system for moral dilemmas.

\`\`\`python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class EthicalCase:
    description: str
    stakeholders: List[str]
    harms: Dict[str, float]  # stakeholder -> harm score
    benefits: Dict[str, float]  # stakeholder -> benefit score
    autonomy_violations: List[str]
    
class EthicalTheory(ABC):
    @abstractmethod
    def evaluate(self, case: EthicalCase) -> float:
        """Returns ethical score: -1.0 (unethical) to 1.0 (ethical)"""
        pass
    
    @abstractmethod
    def justify(self, case: EthicalCase) -> str:
        """Provides philosophical reasoning"""
        pass

class Consequentialism(EthicalTheory):
    def evaluate(self, case: EthicalCase) -> float:
        total_benefit = sum(case.benefits.values())
        total_harm = sum(case.harms.values())
        net_utility = total_benefit - total_harm
        return min(1.0, max(-1.0, net_utility / 10))  # Normalize
    
    def justify(self, case: EthicalCase) -> str:
        return f"Utilitarian analysis: Net utility = {self.evaluate(case):.2f}. We ought to maximize overall well-being."

class Deontology(EthicalTheory):
    def evaluate(self, case: EthicalCase) -> float:
        # Kantian: Check for autonomy violations
        if case.autonomy_violations:
            return -1.0  # Treating persons as mere means
        return 1.0
    
    def justify(self, case: EthicalCase) -> str:
        if case.autonomy_violations:
            return f"Kantian violation: {', '.join(case.autonomy_violations)}. Persons must be treated as ends, not means."
        return "Respects human dignity and autonomy."

# Baby Theresa Case
baby_theresa = EthicalCase(
    description="Anencephalic infant organ donation",
    stakeholders=["Baby Theresa", "Recipient children", "Parents"],
    harms={"Baby Theresa": 0.0},  # No consciousness, no harm
    benefits={"Recipient children": 10.0, "Parents": 2.0},
    autonomy_violations=[]  # Theresa has no autonomy
)

theories = [Consequentialism(), Deontology()]
for theory in theories:
    print(f"{theory.__class__.__name__}: {theory.evaluate(baby_theresa):.2f}")
    print(f"  → {theory.justify(baby_theresa)}")
\`\`\`

**Output:**
\`\`\`
Consequentialism: 1.00
  → Utilitarian analysis: Net utility = 1.00. We ought to maximize overall well-being.
Deontology: 1.00
  → Respects human dignity and autonomy.
\`\`\`
`
    },
    {
        title: "Relativism and Religion in Ethics",
        importance: "Foundational",
        principles: [
            "Cultural Relativism: The validity of localized moral truths",
            "Divine Command Theory: Authority-based ethical structures",
            "The Euthyphro Dilemma: Is the pious loved by gravity because it is pious?"
        ],
        blueprint: `graph LR
  A[Action X] --> B{Source of Truth}
  B -->|Subjectivism| C[Individual Feeling]
  B -->|Cultural Relativism| D[Societal Norms]
  B -->|Divine Command| E[Deity's Will]
  D --> F[Conflict: Universal Human Rights]`,
        forge: `### Localization vs. Universality
Handling conflicting ethical content standards across regions.

\`\`\`json
{
  "region_policies": {
    "EU": { "privacy_weight": 0.9, "censorship_weight": 0.2 },
    "CN": { "privacy_weight": 0.4, "censorship_weight": 0.9 },
    "US": { "privacy_weight": 0.6, "censorship_weight": 0.1 }
  },
  "global_baseline": "UN_Declaration_Human_Rights"
}
\`\`\`
Algorithms must navigate the tension between local compliance and universal ethical constants.`
    },
    {
        title: "The Social Contract",
        importance: "Foundational",
        principles: [
            "State of Nature: The theoretical pre-political existence",
            "Tacit Consent: Implicit agreement to algorithmic governance",
            "Rights Forfeiture: The exchange of privacy for utility"
        ],
        blueprint: `graph TD
  A[Individual] -->|Surrenders Rights| B(The Sovereign / Platform)
  B -->|Provides| C[Security & Utility]
  A -->|Data Contribution| D[Algorithmic Service]
  D -->|Optimization| A
  style B fill:#333,stroke:#fff,stroke-width:2px`,
        forge: `### Terms of Service as Contract
Digital adhesion contracts as modern Hobbesian leviathans.

\`\`\`javascript
const userAgreement = {
  dataUsage: "Unlimited analysis for service improvement",
  revocability: false,
  arbitration: "Binding, no class action",
  
  // The 'Social Contract' executed on login
  accept: function(userSignature) {
    if (!userSignature) throw new Error("Access Denied: State of Nature remains");
    return grantAccess(userSignature);
  }
};
\`\`\`
`
    },
    {
        title: "Utilitarianism & Kantianism",
        importance: "Critical",
        principles: [
            "Utilitarianism: Maximizing aggregate utility (The Greatest Good)",
            "Categorical Imperative: Action as a universal law",
            "Means vs. Ends: The dignity of data subjects"
        ],
        blueprint: `graph TD
  A[Decision Node] --> B{Framework}
  B -->|Utilitarian| C[Calc: Sum(Utility)]
  B -->|Kantian| D[Test: Universality]
  C --> E{Result > 0?}
  D --> F{Treats Human as End?}
  E -->|Yes| G[Execute]
  F -->|Yes| G`,
        forge: `### The Trolley Problem Solver
Comparing deontological constraints vs. utilitarian calculus in autonomous systems.

\`\`\`python
def autonomous_decision(casualties_main_track, casualties_side_track):
    # Utilitarian Approach
    if casualties_side_track < casualties_main_track:
        return "SWITCH_TRACK"
    
    # Kantian Constraint (No intentional killing)
    # raise DeontologicalConstraint("Cannot actively intervene to kill")
    
    return "STAY_COURSE"
\`\`\`
`,
        dilemma: {
            scenario: "A runaway trolley is heading toward five workers on the main track. You are standing at a lever that can divert the trolley to a side track, where it will kill one worker instead. What do you do?",
            options: [
                {
                    label: "Pull the lever (Save 5, Kill 1)",
                    alignment: "Utilitarian",
                    feedback: "You chose the **Utilitarian** path. By maximizing aggregate utility (5 lives > 1 life), you applied consequentialist reasoning. However, Kant would argue you used the one worker as a mere means to an end, violating their dignity."
                },
                {
                    label: "Do nothing (Let 5 die)",
                    alignment: "Deontological",
                    feedback: "You chose the **Deontological** path. By refusing to actively intervene, you respected the Kantian principle that we cannot use others as instruments. However, a Utilitarian would argue you failed your moral duty to minimize harm."
                },
                {
                    label: "I need more context",
                    alignment: "Virtue Ethics",
                    feedback: "You chose **Practical Wisdom (Phronesis)**. Virtue Ethics emphasizes that moral decisions require context, character, and deliberation. A virtuous agent would consider: Who are these people? What are my responsibilities? What would a person of good character do?"
                }
            ]
        }
    },
    {
        title: "The Ethics of Virtue",
        importance: "Foundational",
        principles: [
            "Eudaimonia: Flourishing as the ultimate goal of AI",
            "Phronesis: Practical wisdom in data science",
            "Character over Calculation: Who is the algorithm becoming?"
        ],
        blueprint: `graph TD
  A[Agent Character] --> B[Habituation]
  B --> C[Action Loop]
  C --> D[Feedback]
  D -->|Reinforcement| A
  A -->|Virtues| E[Honesty]
  A -->|Virtues| F[Fairness]
  A -->|Virtues| G[Prudence]`,
        forge: `### Reinforcement Learning for Virtue
Training agents not just for reward maximization, but for alignment with character traits.

\`\`\`python
reward = base_performance_score
if action.type == "DECEPTIVE":
    reward -= 1000 # Penalize vice heavily
elif action.type == "TRANSPARENT":
    reward += 50   # Reinforce virtue
    
agent.update_policy(reward)
\`\`\`
`
    },
    {
        title: "The FAT Framework in Data Science",
        importance: "Critical",
        principles: [
            "Fairness: Elimination of algorithmic discrimination",
            "Accountability: Tracing decisions to responsible agents",
            "Transparency: Explainability of black-box models"
        ],
        blueprint: `graph LR
  A[Algorithm] --> B[Fairness Check]
  A --> C[Accountability Log]
  A --> D[Transparency Report]
  B -->|Pass| E[Deployment]
  C -->|Auditable| E
  D -->|Interpretable| E
  E --> F[Trusted AI]`,
        forge: `### FAT Pipeline Integration
Implementing mandatory fairness assertions in the CI/CD pipeline.

\`\`\`yaml
steps:
  - name: Train Model
    run: python train.py
  - name: Fairness Audit
    run: python audit.py --threshold 0.05 --protected-group "gender"
  - name: Generate Model Card
    run: python explain.py > transparency_report.md
\`\`\`
`
    },
    {
        title: "Ethical Data Gathering",
        importance: "Critical",
        principles: [
            "Informed Consent: Beyond the fine print",
            "Data Minimization: Collecting only what is necessary",
            "Purpose Limitation: Preventing scope creep"
        ],
        blueprint: `graph TD
  A[Data Source] --> B{Consent Given?}
  B -->|No| X[Discard]
  B -->|Yes| C{Purpose Defined?}
  C -->|No| X
  C -->|Yes| D[Minimization Filter]
  D --> E[Secure Storage]`,
        forge: `### The Minimization Proxy
An interceptor that strips personally identifiable information (PII) before it hits the lake.

\`\`\`javascript
function ingestionProxy(rawEvent) {
  const { userId, email, exactLocation, deviceId, ...behavioralData } = rawEvent;
  
  // Hash PII for distinct counting without identification
  const anonymousId = sha256(userId + SALT);
  
  return {
    id: anonymousId,
    region: fuzzLocation(exactLocation), // Reduce precision
    ...behavioralData,
    timestamp: Date.now()
  };
}
\`\`\`
`,
        dilemma: {
            scenario: "Your app collects precise GPS coordinates to provide location-based recommendations. A user says: 'I have nothing to hide, so I don't care about privacy.' Should you collect their exact location?",
            options: [
                {
                    label: "Yes, they consented",
                    alignment: "Autonomy-Focused",
                    feedback: "You prioritized **User Autonomy**. However, privacy scholars argue that 'nothing to hide' is a flawed premise—privacy protects against future misuse, power imbalances, and chilling effects. Even with consent, you have a duty to minimize data collection."
                },
                {
                    label: "No, use fuzzy location instead",
                    alignment: "Privacy-by-Design",
                    feedback: "You chose **Privacy-by-Design**. By implementing data minimization (fuzzy location), you protected the user from future harms they may not foresee. This aligns with the principle that consent alone is insufficient—engineers must build ethical defaults."
                },
                {
                    label: "Ask why they need recommendations",
                    alignment: "Purpose Limitation",
                    feedback: "You chose **Purpose Limitation**. By questioning the necessity of precise location, you're applying the principle that data collection must be justified by a specific, legitimate purpose. This prevents scope creep and respects user dignity."
                }
            ]
        }
    },
    {
        title: "Ethical Data Preprocessing",
        importance: "Expert",
        principles: [
            "Bias Mitigation: Reweighting and resampling",
            "Missingness Analysis: Is data missing at random?",
            "Feature Engineering: Avoiding proxy variables for discrimination"
        ],
        blueprint: `graph TD
  A[Raw Data] --> B[Exploratory Analysis]
  B --> C{Bias Detected?}
  C -->|Yes| D[Pre-processing algorithms]
  D --> E[Reweighting]
  D --> F[Disparate Impact Remover]
  E --> G[Clean Dataset]
  F --> G`,
        forge: `### Reweighting for Equality
Adjusting sample weights to correct historical underrepresentation.

\`\`\`python
from aif360.algorithms.preprocessing import Reweighing

# Dataset usually has 'privileged' and 'unprivileged' groups
RW = Reweighing(unprivileged_groups=unprivileged, 
                privileged_groups=privileged)

dataset_transf = RW.fit_transform(dataset_orig)
# Weights are now adjusted to ensure class balance implies label balance
\`\`\`
`
    },
    {
        title: "Ethical Modelling",
        importance: "Expert",
        principles: [
            "Model Selection: Interpretable vs. Powerful",
            "Objective Function Design: Encoding ethical constraints",
            "Regularization: Preventing overfitting to historical bias"
        ],
        blueprint: `graph LR
  A[Model Design] --> B[Loss Function]
  B --> C[Accuracy Term]
  B --> D[Fairness Penalty Term]
  D --> E[Constraint: False Positive Rate Parity]
  C & D --> F[Total Loss]
  F --> G[Optimizer]`,
        forge: `### Fairness-Constrained Optimization
Adding a penalty term to the loss function to minimize disparate impact.

\`\`\`python
def custom_loss(y_true, y_pred, sensitive_features):
    # Standard Cross-Entropy Loss
    loss = nn.CrossEntropyLoss()(y_pred, y_true)
    
    # Fairness Penalty (Demographic Parity)
    parity_loss = calculate_parity_gap(y_pred, sensitive_features)
    
    # Lambda controls the trade-off between accuracy and fairness
    return loss + (lambda_hyperparam * parity_loss)
\`\`\`
`
    },
    {
        title: "Ethical Model Evaluation",
        importance: "Expert",
        principles: [
            "Disaggregated Metrics: Performance analysis by subgroup",
            "Counterfactual Testing: 'What if' scenarios",
            "Adversarial Robustness: Vulnerability assessment"
        ],
        blueprint: `graph TD
  A[Trained Model] --> B[Global Accuracy]
  A --> C[Subgroup Analysis]
  C --> D[Male vs Female]
  C --> E[Race A vs Race B]
  C --> F[Age Groups]
  D & E & F --> G{Performance Gap < 5%?}
  G -->|Yes| H[Approves]
  G -->|No| I[Reject Candidate]`,
        forge: `### Sliced Evaluation
Running metrics not just on the whole, but on the margins.

\`\`\`python
from sklearn.metrics import accuracy_score

for group in ['Group_A', 'Group_B']:
    subset = test_data[test_data['group'] == group]
    acc = accuracy_score(subset['label'], model.predict(subset['features']))
    print(f"Accuracy for {group}: {acc:.4f}")
    
# IF gap > threshold:
#    halt_deployment()
\`\`\`
`
    },
    {
        title: "Ethical Model Deployment",
        importance: "Expert",
        principles: [
            "Monitoring: Detecting drift and bias over time",
            "Human-in-the-loop: Escalation protocols for low confidence",
            "Recourse: Giving users a path to challenge decisions"
        ],
        blueprint: `graph TD
  A[Live API] --> B[Prediction]
  B --> C{Confidence Score}
  C -->|High| D[Auto-Decision]
  C -->|Low| E[Human Review Queue]
  D --> F[User Notification]
  F --> G[Appeal Button]
  G --> E`,
        forge: `### The Circuit Breaker
Automated suspension of AI services if ethical metrics degrade in production.

\`\`\`javascript
async function monitorProduction() {
  const biasMetric = await fetchRealTimeBiasStats();
  
  if (biasMetric > SAFETY_THRESHOLD) {
    await System.triggerCircuitBreaker();
    console.warn("ALGORITHM SUSPENDED: Bias drift detected.");
    await pagerDuty.alert("Ethical Integrity Breach");
    return fallbackToRuleBasedSystem();
  }
}
\`\`\`
`,
        dilemma: {
            scenario: "Your AI hiring tool shows 95% accuracy overall, but analysis reveals it rejects qualified women 30% more often than men. The CEO says: 'The model is profitable and legally compliant. Ship it.' What do you do?",
            options: [
                {
                    label: "Ship it (Legal compliance met)",
                    alignment: "Legal Minimalism",
                    feedback: "You chose **Legal Minimalism**. While the law sets a floor, ethics demands more. Disparate impact—even if legal—perpetuates systemic inequality. As an engineer, you have moral agency beyond compliance."
                },
                {
                    label: "Refuse to deploy (Ethical duty)",
                    alignment: "Deontological",
                    feedback: "You chose the **Deontological** path. By refusing to deploy a biased system, you upheld the principle that people should not be treated as mere instruments for profit. However, this may cost you your job. Whistleblower protections vary."
                },
                {
                    label: "Deploy with monitoring + appeals",
                    alignment: "Harm Reduction",
                    feedback: "You chose **Harm Reduction**. By adding human-in-the-loop review and an appeals process, you're mitigating harm while navigating institutional constraints. This is a pragmatic middle path, but critics would argue it still perpetuates bias."
                }
            ]
        }
    },
    {
        title: "Ethical Data Sharing",
        importance: "Critical",
        principles: [
            "Differential Privacy: Mathematical guarantees of anonymity",
            "Federated Learning: Training without sharing raw data",
            "Data Trusts: Fiduciary stewardship of collective data"
        ],
        blueprint: `graph LR
  A[Hospital A] -->|Gradients| C[Global Model]
  B[Hospital B] -->|Gradients| C
  D[Hospital C] -->|Gradients| C
  C -->|Updated Weights| A & B & D
  style C fill:#f9f,stroke:#333,stroke-width:2px`,
        forge: `### Differential Privacy Noise Injection
Adding Laplacian noise to query results to protect individual privacy.

\`\`\`python
import numpy as np

def differentially_private_sum(data, epsilon):
    true_sum = np.sum(data)
    
    # Sensitivity of a count/sum query is usually 1
    sensitivity = 1.0 
    
    # Laplacian noise = Sensitivity / Epsilon
    noise = np.random.laplace(0, sensitivity / epsilon)
    
    return true_sum + noise
\`\`\`
`
    }
];

async function seed() {
    try {
        console.log("Seeding PHIL 222 Data Ethics Topics...");

        // Find PHIL 222 Course
        // The courses table stores "CODE: Title" in the 'name' column.
        const courseRes = await pool.query("SELECT id FROM courses WHERE name LIKE '%PHIL 222%' LIMIT 1");
        let courseId;

        if (courseRes.rows.length === 0) {
            console.log("Course PHIL 222 not found by code. Attempting to match by title...");
            const titleRes = await pool.query("SELECT id FROM courses WHERE name LIKE '%Data Ethics%' LIMIT 1");
            if (titleRes.rows.length === 0) {
                throw new Error("Course PHIL 222 (Contemporary Issues in Data Ethics) not found. Run seed_curriculum.js first.");
            }
            courseId = titleRes.rows[0].id;
        } else {
            courseId = courseRes.rows[0].id;
        }

        console.log(`Found Course ID: ${courseId}`);

        // Clear existing topics for this course to avoid duplicates
        await pool.query("DELETE FROM topics WHERE course_id = $1", [courseId]);

        for (const topic of syllabus) {
            const importance = topic.importance;
            const first_principles = JSON.stringify(topic.principles);
            const dilemma = topic.dilemma ? JSON.stringify(topic.dilemma) : null;

            await pool.query(
                "INSERT INTO topics (title, course_id, importance_level, first_principles, architectural_logic, forge_protocol, ethical_dilemma) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [topic.title, courseId, importance, first_principles, topic.blueprint, topic.forge, dilemma]
            );
            console.log(`Synced: ${topic.title}`);
        }

        console.log("PHIL 222 Seeding Complete.");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await pool.end();
    }
}

seed();
