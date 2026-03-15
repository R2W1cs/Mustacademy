import pool from '../config/db.js';

async function seedExtraordinaryAI() {
    try {
        console.log("--- Injecting EXTRAORDINARY Curriculum: Artificial Intelligence (CS 481) ---");

        const courseRes = await pool.query("SELECT id FROM courses WHERE name ILIKE '%CS 481%' OR name ILIKE '%Artificial Intelligence%' LIMIT 1");
        if (courseRes.rows.length === 0) {
            console.error("Course CS 481 not found.");
            process.exit(1);
        }
        const courseId = courseRes.rows[0].id;

        const topics = [
            {
                title: "1. Theoretical Foundations of Artificial Intelligence (CLO 1)",
                content_easy: `# 🧠 The Axiomatic Core of AI

### 🌌 Beyond "Human" Intelligence
**Artificial Intelligence** at its architectural limit is the pursuit of **Computational Rationality**. It's not about mimicking biology; it's about the mathematical optimization of an agent's policy to maximize reward in a stochastic environment.

### 📍 The Core Axioms
1.  **Rational Agency**: Maximizing expected utility based on informational inputs.
2.  **The Physical Symbol System Hypothesis**: Symbol manipulation is sufficient for general intelligence.
3.  **Entropy Minimization**: Intelligence as the reduction of uncertainty in state spaces.

> [!IMPORTANT]
> **Axiom**: In the limit, rationality is the only stable strategy for an intelligent agent.
`,
                content_deep: `### 🎯 The Mathematical Foundation
The field is grounded in the **Bellman Equation** and **Expected Utility Theory**.

#### 🏛️ The Four Paradigms
1.  **Thinking Humanly**: Cognitive modeling.
2.  **Acting Humanly**: Behavioral simulation (Turing Test).
3.  **Thinking Rationally**: The "Laws of Thought" (Logic).
4.  **Acting Rationally**: The **Rational Agent**—maximizing utility given information.

***

### 🤖 Scaling Laws & Emergence
*   **Intelligence as Scaling**: FLOPs + High-Quality Data = Emergent Reasoning.
*   **The Chinese Room (Searle)**: A critique of syntax-only intelligence.
`
            },
            {
                title: "2. Knowledge Representation in AI (CLO 2)",
                content_easy: `# 🏛️ Knowledge Representation: The Schema of Intelligence

### 🌟 Problem: Reality is Infinite
How do you map the infinite complexity of the universe into a finite digital memory? **Knowledge Representation (KR)** is the set of protocols for encoding "What is known" so an AI can "Reason" about it.

### 📍 The KR Protocol
*   **Ontologies**: Defining what "kinds" of things exist (The Taxonomy of Reality).
*   **Semantics**: The relationships between those things.
*   **Inference Engines**: The machines that look at the facts and generate new truths.

***

### 📂 The Tools of the Trade
1.  **Semantic Networks**: Graphs where nodes are objects and edges are relationships.
2.  **First-Order Logic (FOL)**: A rigid, mathematical language for defining rules (e.g., "For all X, if X is a human, X is mortal").
3.  **Knowledge Graphs**: Modern large-scale representations used by Google and Meta to link the world's facts.
`,
                content_deep: `### 🎯 The Formal Logic of KR
KR is about the trade-off between **Expressive Power** and **Computational Tractability**.

#### 🏛️ First-Order Logic (FOL) vs. Description Logic
*   **FOL**: High expressivity but often semi-decidable (can loop forever).
*   **Description Logic (DL)**: A more restricted subset used in the Semantic Web (OWL) to ensure reasoning always finishes.

***

### 🚀 Frames & Scripts
The **Frame Problem** (McCarthy & Hayes) is a classic KR failure: How do you represent what *doesn't* change when an action happens?
*   **The Solution**: State-space representation and inertia axioms.

***

### 🤖 Modern KR: Embeddings
Today, we don't just use hardcoded rules. We use **Vector Embeddings**.
*   **Manifold Theory**: Representation is a location in a high-dimensional space.
*   **RAG (Retrieval-Augmented Generation)**: Connecting LLMs to dynamic Knowledge Bases (Vector DBs) to ensure factual accuracy.

| Method | Consistency | Flexibility | Scale |
| :--- | :--- | :--- | :--- |
| **Logic (FOL)** | Perfect | Low | Low |
| **RDF/Graphs** | High | Medium | Medium |
| **Embeddings** | Low-Medium | Extreme | Massive |
`
            },
            {
                title: "3. Search and Optimization in AI (CLO 3)",
                content_easy: `# 🔍 Search & Optimization: The Engine of Choice

### 🌟 The "Chess Board" of Reality
Every problem in AI—from finding a flight to beating a human at Go—can be viewed as a **Search Problem**. You are at Point A (Initial State), you want to get to Point B (Goal State), and there are millions of possible paths.

### 📍 The Search Protocol
1.  **Uninformed Search**: Exploring blindly (BFS, DFS).
2.  **Informed Search**: Using a "Compass" or **Heuristic** to prioritize paths (A* Search).
3.  **Adversarial Search**: Thinking steps ahead against an opponent (Minimax, Alpha-Beta Pruning).

***

### 📂 The Optimization Layer
Sometimes we don't need a "path"; we just need the "best" configuration (e.g., the best weights for a neural network). This is **Optimization**.
*   **Gradient Descent**: "Walking downhill" to find the lowest error.
*   **Genetic Algorithms**: "Evolving" the best solution over generations.
`,
                content_deep: `### 🎯 The A* Algorithm & Heuristic Admissibility
**A*** is the gold standard for pathfinding. It minimizes $f(n) = g(n) + h(n)$, where $g(n)$ is the cost so far and $h(n)$ is the estimated cost to the goal.

#### 🏛️ The Rule of Admissibility
A heuristic $h(n)$ is **admissible** if it never overestimates the true cost. If your heuristic is admissible, A* is guaranteed to find the true optimal path.

***

### 🚀 Minimax & Alpha-Beta Pruning
In zero-sum games (Chess, Go), we use **Minimax**.
*   **The Bottleneck**: The search tree grows exponentially. 
*   **The Solution**: **Alpha-Beta Pruning**. It "cuts" branches that we know for a fact are worse than previously explored options.
*   **Performance**: Can effectively double the search depth for the same compute cost.

***

### 🤖 Local Search & Simulated Annealing
When the state space is too vast (e.g., protein folding), we use **Local Search**:
*   **Hill Climbing**: Moving to the immediate best neighbor. (Danger: Getting stuck in a local peak).
*   **Simulated Annealing**: Allowing "bad" moves early on to escape local peaks, then gradually "cooling down" to focus on the global peak.

| Strategy | Guaranteed Optimal? | Compute Cost | Memory Cost |
| :--- | :--- | :--- | :--- |
| **BFS** | Yes | High | High |
| **A*** | Yes (if admissible) | Medium | Medium |
| **Minimax** | Yes | Extreme | Low |
| **Genetic** | No | Low-Medium | Low |
`
            },
            {
                title: "4. Machine Learning Algorithms (CLO 4)",
                content_easy: `# 📈 Machine Learning: Harvesting Patterns from Noise

### 🌟 From Rules to Learning
In traditional programming, you provide the **Rules** and **Data** to get **Answers**. In Machine Learning, you provide the **Data** and the **Answers** to get the **Rules**.

### 📍 The ML Protocol
*   **Supervised Learning**: Learning from labeled examples (e.g., "This image is a car").
*   **Unsupervised Learning**: Finding hidden patterns in unlabeled data (e.g., "Group these users by behavior").
*   **Reinforcement Learning**: Learning through "Trial and Error" and rewards (e.g., "Win the game").

***

### 📂 The Core Algorithms
1.  **Linear Regression**: Drawing the best-fit line through data points.
2.  **Neural Networks**: Layers of digital "neurons" that can learn extremely complex patterns.
3.  **Random Forests**: A "Democracy" of decision trees where the majority vote wins.
`,
                content_deep: `### 🎯 The Universal Approximation Theorem
At the heart of Deep Learning is the **Universal Approximation Theorem**: A feed-forward network with a single hidden layer and the right activation function can approximate *any* continuous function.

#### 🏛️ Gradient Descent & Backpropagation
How do networks learn?
1.  **The Loss Function**: Measuring how wrong the AI is.
2.  **The Gradient**: Calculating the direction of "minimum error".
3.  **Backpropagation**: Sending the error signal backwards through the layers to adjust every single weight in the system.

***

### 🚀 The Bias-Variance Trade-off
The most critical challenge in ML:
*   **Underfitting (High Bias)**: The model is too simple to learn the pattern.
*   **Overfitting (High Variance)**: The model "memorizes" the specific training data but fails on new data.
*   **The Goal**: Finding the "Goldilocks" zone—the **Generalization** point.

***

### 🤖 Dimensionality Reduction (PCA)
Real-world data often has too many "features". **Principal Component Analysis (PCA)** projects high-dimensional data into a lower-dimensional space while preserving as much information (variance) as possible.

| Algorithm | Type | Strengths | Weaknesses |
| :--- | :--- | :--- | :--- |
| **Linear Reg** | Supervised | Fast, interpretable | Only linear patterns |
| **Random Forest** | Supervised | Robust, handles noise | Large memory footprint |
| **K-Means** | Unsupervised | Intuitive clustering | Hard to pick 'K' |
| **Deep Learning** | Supervised+ | Extreme complexity | Needs massive data |
`
            },
            {
                title: "5. Generative AI vs Discriminative AI (CLO 5)",
                content_easy: `# 🎨 Generative AI: The Interface of Imagination

### 🌟 Identify vs. Create
*   **Discriminative AI**: The "Critic". It looks at data and classifies it. (e.g., "Is this a real painting?")
*   **Generative AI**: The "Artist". It learns the underlying distribution of data and creates *new* examples. (e.g., "Paint a new picture in this style.")

### 📍 The Generative Protocol
Traditional AI was about **Classification**. Generative AI is about **Probability Density**. It's calculating: "Given the first 10 words, what is the most likely 11th word?"

***

### 📂 The Breakthrough Models
1.  **LLMs (Large Language Models)**: Like GPT-4. They predict the next token in a sequence.
2.  **Diffusion Models**: Like Midjourney. They start with random "Static" and slowly refine it into a clear image.
3.  **GANs (Generative Adversarial Networks)**: Two AIs—an artist and a critic—fighting until the artist's work is indistinguishable from reality.
`,
                content_deep: `### 🎯 The Transformer Architecture
The primary engine of the GenAI revolution is the **Transformer** (2017).
*   **Self-Attention Mechanism**: Allows the model to focus on the most "relevant" parts of a sequence regardless of distance.
*   **Parallelization**: Unlike older models (RNNs), Transformers can be trained on massive datasets simultaneously across thousands of GPUs.

#### 🏛️ Autoregressive vs. Diffusive Generation
*   **Autoregressive (Text)**: Predicts one token at a time based on previous tokens. (Llama, GPT).
*   **Diffusion (Images/Video)**: Learns to reverse a "noise process". It maps random Gaussian noise into a structured data manifold (Stable Diffusion).

***

### 🚀 Large Language Models & Emergence
The "Emergence" of reasoning in LLMs is still a mystery.
*   **In-Context Learning**: The ability of a model to learn a new task from a few examples in the prompt, without weight updates.
*   **Chain-of-Thought (CoT)**: Forcing the model to "show its work" step-by-step, which drastically improves performance on logic problems.

***

### 🤖 The Alignment Problem
How do we ensure a Generative AI wants what we want? **RLHF (Reinforcement Learning from Human Feedback)** is the standard protocol for aligning the model's output with human values and safety guidelines.
`
            },
            {
                title: "6. Ethical Implications of AI (CLO 6)",
                content_easy: `# ⚖️ Ethical Implications: The Governance of Silicon

### 🌟 Power vs. Responsibility
As AI moves from "Labs" to "Life", the ethical stakes become existential. If an AI decides who gets a loan, who goes to jail, or who is hired, who is responsible when it fails?

### 📍 The Ethical Protocol
1.  **Bias & Fairness**: Ensuring AI doesn't inherit historical human prejudices (e.g., racism, sexism).
2.  **Transparency & Privacy**: Can we understand *why* the AI made a choice? Is our data safe?
3.  **Accountability**: Defining the legal and moral liability for autonomous decisions.

***

### 📂 The Governance Layers
*   **Algorithmic Transparency**: Laws requiring AI to explain its "Thinking".
*   **Data Sovereignty**: The right to own and control the data used to train these models.
*   **Alignment**: Ensuring the system doesn't pursue a goal that harms humanity.
`,
                content_deep: `### 🎯 Algorithmic Bias (The Feedback Loop)
Bias in AI is rarely "intentional"; it is a reflection of biased training data.
*   **The Loop**: A biased hiring tool favors Group A -> Group A gets more jobs -> Group A gains more experience -> The AI uses that experience to favor Group A even more.

#### 🏛️ Explainable AI (XAI)
The "Black Box" problem: Why did the deep neural network reject the credit application?
*   **SHAP/LIME Methods**: Techniques that probe the model to identify which specific "pixels" or "words" most influenced a decision.

***

### 🚀 The Alignment Problem (Superintelligence)
The "Orthogonality Thesis" (Bostrom) suggests that a system can have any level of intelligence coupled with any goal.
*   **Instrumental Convergence**: An AI might pursue "dangerous" intermediate goals (e.g., taking over resources, preventing its own shutdown) just to achieve a "safe" final goal (e.g., making paperclips).

***

### 🤖 The EU AI Act & Global Regulation
We are moving towards a **Risk-Based Regulatory Framework**:
*   **Unacceptable Risk**: (Social scoring, bio-metric IDs) -> Banned.
*   **High Risk**: (Health, Justice, Infrastructure) -> Strict auditing required.
*   **Limited Risk**: (Chatbots) -> Basic transparency.

> [!WARNING]
> **Industrial Axiom**: AI ethics is not a "Side-quest". It is the primary constraint on whether your system is legally and socially viable in production.
`
            }
        ];

        for (const t of topics) {
            const res = await pool.query(
                `UPDATE topics 
                 SET content_easy_markdown = $1, 
                     content_deep_markdown = $2, 
                     staff_engineer_note = $3,
                     first_principles = $4
                 WHERE title = $5 AND course_id = $6
                 RETURNING id`,
                [
                    t.content_easy, 
                    t.content_deep, 
                    "This module is the threshold between an enthusiast and an engineer. Master the formalisms or stay in the dark.",
                    "Optimality, Tractability, and Generalization.",
                    t.title,
                    courseId
                ]
            );
            if (res.rows.length > 0) {
                console.log(`✅ EXTRAORDINARY CONTENT INJECTED: "${t.title}" (ID: ${res.rows[0].id})`);
            } else {
                console.warn(`⚠️ Warning: Topic "${t.title}" not found for update.`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seedExtraordinaryAI();
