import pool from '../config/db.js';

async function seedAI() {
    try {
        console.log("--- Seeding Artificial Intelligence (CS 481) Curriculum ---");

        // 1. Find the Course
        const courseRes = await pool.query("SELECT id FROM courses WHERE name ILIKE '%CS 481%' OR name ILIKE '%Artificial intelligence%' LIMIT 1");
        
        if (courseRes.rows.length === 0) {
            console.error("Course CS 481 not found. Please run seed_curriculum.js first.");
            process.exit(1);
        }

        const courseId = courseRes.rows[0].id;

        const topics = [
            {
                title: "1. Theoretical Foundations of Artificial Intelligence (CLO 1)",
                importance: "Critical",
                content_easy: `# Introduction to AI
Artificial Intelligence (AI) is the field of computer science focusing on creating systems capable of performing tasks that normally require human intelligence.`,
                content_deep: `### 1.1 What is Artificial Intelligence?
AI aims to build systems that can:
- **Think like humans**
- **Act like humans**
- **Think rationally**
- **Act rationally**

### 1.2 History of AI
- **Early Foundations (1940s–1950s):** Logic, math, and neuroscience. 
- **1956 Dartmouth Conference:** The official birth of AI (McCarthy, Minsky, Newell, Simon).
- **First AI Boom (1956–1974):** Early systems like Logic Theorist and General Problem Solver.
- **AI Winter (1974–1980):** High expectations led to funding drops when results didn't meet them.
- **Expert Systems (1980s):** Knowledge-based systems using IF-THEN rules (e.g., medical diagnosis).
- **Machine Learning Era (1990s–2010):** Shift from rules to learning from data. 1997: Deep Blue defeats Kasparov.
- **Modern AI / Deep Learning (2010–Present):** Fueled by Big Data, GPUs, and internet-scale datasets.

### 1.3 Key Paradigms
1. **Symbolic AI (GOFAI):** Logic and symbolic reasoning (Expert Systems).
2. **Machine Learning AI:** Learning patterns from data.
3. **Statistical AI:** Bayesian and Hidden Markov Models.
4. **Connectionist AI:** Neural networks and Deep Learning.`
            },
            {
                title: "2. Knowledge Representation in AI (CLO 2)",
                importance: "High",
                content_easy: `# Storing Knowledge
Knowledge Representation (KR) focuses on how machines store and use information to reason about the world.`,
                content_deep: `### 2.1 Types of Knowledge
- **Declarative:** Facts (Paris is the capital of France).
- **Procedural:** How to do things (Solving a math problem).
- **Meta Knowledge:** Knowledge about knowledge (Choosing an algorithm).
- **Heuristic:** Rules of thumb (Controlling the center in chess).

### 2.2 Representation Techniques
1. **Logical Representation:** Using Propositional or First Order Logic (FOL).
2. **Semantic Networks:** Knowledge as graphs (Nodes = Objects, Edges = Relationships).
3. **Frames:** Structured objects with attributes (Car: color, engine, speed).
4. **Production Rules:** IF-THEN structures used in expert systems.`
            },
            {
                title: "3. Search and Optimization in AI (CLO 3)",
                importance: "Critical",
                content_easy: `# The Search for Solutions
AI problems are often formulated as a search through a "state space" to find a goal configuration.`,
                content_deep: `### 3.1 Problem Formulation
A problem consists of: Initial state, Actions, Transition model, Goal test, and Path cost.

### 3.2 Search Algorithms
- **Uninformed (Blind) Search:** No knowledge of the goal.
    - **BFS:** Complete, memory-heavy.
    - **DFS:** Memory-efficient, can get stuck.
    - **Uniform Cost Search:** Finds lowest path cost.
- **Informed (Heuristic) Search:** Uses a "guess" function to guide the search.
    - **A* Algorithm:** Evaluation function **f(n) = g(n) + h(n)**.

### 3.3 Optimization
Finding the *best* solution when many exist. Techniques include: **Hill Climbing, Simulated Annealing, and Genetic Algorithms**.`
            },
            {
                title: "4. Machine Learning Algorithms (CLO 4)",
                importance: "Critical",
                content_easy: `# Learning from Data
Machine learning allows computers to discover patterns without being explicitly programmed.`,
                content_deep: `### 4.1 Types of ML
1. **Supervised Learning:** Labeled data (Classification, Regression). Algorithms: Linear/Logistic Regression, SVMs, Decision Trees.
2. **Unsupervised Learning:** Unlabeled data (Clustering). Algorithms: K-Means, PCA.
3. **Reinforcement Learning:** Learning via rewards (Agent/Environment). Milestone: AlphaGo.

### 4.2 Deep Learning
A subset of ML using deep neural networks:
- **CNNs:** Image processing.
- **RNNs:** Sequential data.
- **Transformers:** Modern language models.

### 4.3 Evaluation Metrics
- **Classification:** Accuracy, Precision, Recall, F1-score.
- **Regression:** MSE, MAE, R-squared.`
            },
            {
                title: "5. Generative AI vs Discriminative AI (CLO 5)",
                importance: "Critical",
                content_easy: `# The Era of Creation
Understanding the difference between AI that predicts (Discriminative) and AI that creates (Generative).`,
                content_deep: `### 5.1 Discriminative vs Generative
- **Discriminative AI:** Predicts labels (Spam vs. Not Spam). Learns decision boundaries.
- **Generative AI:** Generates new content. Learns the underlying data distribution.

### 5.2 Types of Generative AI
1. **GANs (Generative Adversarial Networks):** A Generator vs. a Discriminator.
2. **VAEs (Variational Autoencoders):** Latent space encoding/decoding.
3. **Transformers:** The backbone of modern LLMs (Text generation, summarization, coding).

### 5.3 Applications
Content creation, drug discovery, synthetic data, and robotic automation.`
            },
            {
                title: "6. Ethical Implications of AI (CLO 6)",
                importance: "High",
                content_easy: `# AI and Society
Exploring the risks, biases, and responsibilities involved in deploying intelligent systems.`,
                content_deep: `### 6.1 Key Ethical Challenges
- **Bias:** AI inheriting human prejudices from training data (e.g., in facial recognition).
- **Privacy:** Massive collection of personal data.
- **Job Displacement:** Automation replacing human drivers or analysts.
- **Safety:** Ensuring AI behaves as intended without harmful system failures.

### 6.2 Responsible AI Principles
1. **Transparency**
2. **Fairness**
3. **Accountability**
4. **Privacy & Safety**`
            }
        ];

        for (const t of topics) {
            // Check if topic exists
            const check = await pool.query("SELECT id FROM topics WHERE title = $1 AND course_id = $2", [t.title, courseId]);
            if (check.rows.length > 0) {
                console.log(`Updating topic: ${t.title}`);
                await pool.query(
                    "UPDATE topics SET content_easy_markdown = $1, content_deep_markdown = $2, importance_level = $3 WHERE id = $4",
                    [t.content_easy, t.content_deep, t.importance, check.rows[0].id]
                );
            } else {
                console.log(`Inserting new topic: ${t.title}`);
                await pool.query(
                    "INSERT INTO topics (title, content_easy_markdown, content_deep_markdown, importance_level, course_id) VALUES ($1, $2, $3, $4, $5)",
                    [t.title, t.content_easy, t.content_deep, t.importance, courseId]
                );
            }
        }

        console.log("Seeding Success!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seedAI();
