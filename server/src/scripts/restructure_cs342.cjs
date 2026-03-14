const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const topics = [
  {
    title: "Complexity Fundamentals",
    description: "Concepts: Time/Space complexity, asympototic analysis, best/average/worst case analysis.",
    week: 1,
    importance: "FUNDAMENTAL",
    content: `## 🎯 Learning Objectives: Why Complexity Matters
Most students think complexity is just a "math rule." In reality, it is the **Staff Engineer's most powerful tool** for predicting system failure. If an algorithm is $O(n^2)$ and you feed it 1 million users, your server **will** melt.

### 1️⃣ Time vs Space Complexity: The Trade-off
- **Time Complexity**: Not the literal seconds (which change based on your CPU), but the *number of operations* relative to input size $n$.
- **Space Complexity**: The amount of working memory required.
> **Deep Dive**: Frequently, we can trade space for time (e.g., Caching/Memoization). A "Deep Dive" engineer knows when to sacrifice RAM to save hours of processing time.

### 2️⃣ The Spectrum of Analysis
- **Worst Case ($O$):** The maximum resources needed. This is the **standard** because it provides an absolute guarantee.
- **Average Case ($\Theta$):** The expected behavior over all typical inputs. Crucial for commercial systems.
- **Best Case ($\Omega$):** The minimum resources. Rare, but useful for optimization (e.g., finding the "early exit" in a search).

### 🧠 The Core Philosophy: The Infinite Horizon
We study $n \\to \\infty$ because software that works for 100 items but fails at 100,000 is **broken by design**. Asymptotic analysis stripped away the "noise" (hardware speed, OS interrupts) to reveal the pure mathematical soul of the algorithm.

### 📝 Practice Lab: Asymptotic Rigor
**Exercise 1: Asymptotic Growth Order**
Organize the following functions in increasing order of asymptotic growth:
$n \\log n, \\quad n^4, \\quad n^n, \\quad n^3 \\log n, \\quad 100n^3 + \\log n, \\quad \\log n, \\quad n^3 \\log n$

**Exercise 2: Big-O, Omega, Theta Analysis**
Consider the functions:
$f(n) = 3^n + n^{100}$
$g(n) = 3^n$

Label each statement as **True** or **False**:
A. $f(n) = O(g(n))$
B. $f(n) = \\Omega(g(n))$
C. $f(n) = \\Theta(g(n))$`
  },
  {
    title: "Asymptotic Framework (Theory)",
    description: "Big Oh, Big theta and Omega definitions with upper/lower bound demonstrations.",
    week: 2,
    importance: "CORE",
    content: `## Asymptotic Notation: The Formal Guardrails
In complexity, we don't care about constants; we care about **trends**. These three notations provide the mathematical "bounds" that allow us to compare algorithms across different hardware.

### 1️⃣ Big-O Notation ($O$): The Upper Bound
**Formal Definition**: $f(n) = O(g(n))$ if there exist positive constants $c$ and $n_0$ such that:
$$0 \le f(n) \le c \cdot g(n) \\text{ for all } n \ge n_0$$

- **The Analogy**: Think of Big-O as the **"Less Than or Equal To" ($\\le$)** of function growth.
- **The Staff Engineer's View**: We use Big-O to provide a **guaranteed upper limit** on resources. If an algorithm is $O(n \\log n)$, it will *never* perform worse than that as $n$ grows. It is the "safety net" of analysis.

### 2️⃣ Big-Omega Notation ($\\Omega$): The Lower Bound
**Formal Definition**: $f(n) = \\Omega(g(n))$ if there exist positive constants $c$ and $n_0$ such that:
$$0 \le c \\cdot g(n) \\le f(n) \\text{ for all } n \ge n_0$$

- **The Analogy**: Think of Big-Omega as the **"Greater Than or Equal To" ($\\ge$)** of function growth.
- **The Staff Engineer's View**: We use Big-Omega to find the **best-case possible** or to prove that a problem *requires* at least a certain amount of work. (e.g., Any comparison-based sort is $\\Omega(n \\log n)$—it is mathematically impossible to do better).

### 3️⃣ Big-Theta Notation ($\\Theta$): The Tight Bound
**Formal Definition**: $f(n) = \\Theta(g(n))$ if there exist positive constants $c_1, c_2,$ and $n_0$ such that:
$$0 \le c_1 \\cdot g(n) \\le f(n) \\le c_2 \\cdot g(n) \\text{ for all } n \ge n_0$$

- **The Analogy**: Think of Big-Theta as the **"Equal To" ($=$)** of function growth.
- **The Staff Engineer's View**: This is the most precise notation. If $f(n) = \\Theta(g(n))$, it means $f$ grows at the **exact same rate** as $g$. They belong to the same complexity class.

---

### 📝 Practice Lab: Bounding Functions
**Exercise 3: Growth Comparison**
Repeat Exercise 2 with:
$f(n) = n \\log n$
$g(n) = 2^n$
*Rigorously justify your answer using limits.*

**Exercise 4: Factorial vs. Exponential**
Repeat Exercise 2 with:
$f(n) = (2n)!$
$g(n) = 5^n \\cdot n^{10}$
*Rigorously justify your answer.*`
  },
  {
    title: "Growth Comparison & Limits",
    description: "Comparing function growth using the limit n → ∞ method.",
    week: 3,
    importance: "CORE",
    content: `## 1️⃣ The Mathematical Truth: The Limit Test
When words fail, Calculus prevails. We compare two functions $f(n)$ and $g(n)$ by seeing what happens to their ratio as the input explode.

$$\\lim_{n \\to \\infty} \\frac{f(n)}{g(n)}$$

### 2️⃣ Understanding the 3 Outcomes
- **Outcome 0 (Limit = 0):** This means the denominator $g(n)$ is "vortexing" the numerator. $f$ is mathematically "too small" compared to $g$. 
  - *Logical Result:* $f(n) = o(g(n))$.

- **Outcome Constant (0 < c < ∞):** This means they are racing at the exact same pace. The "physics" of both algorithms are identical.
  - *Logical Result:* $f(n) = \\Theta(g(n))$.

- **Outcome Infinity (Limit = ∞):** $f(n)$ has escaped the gravity of $g(n)$. It is growing exponentially or polynomially faster.
  - *Logical Result:* $f(n) = \\omega(g(n))$.

### 📝 Practice Lab: The Limit Master
**Exercise 5: Bounding a Function**
Given:
$f(n) = 3n^2 + 5n + 100n^2 \\log n$

Provide examples of functions $g(n)$ such that:
A. $f(n) = O(g(n))$
B. $f(n) = \\Omega(g(n))$
C. $f(n) = \\Theta(g(n))$`
  },
  {
    title: "Recurrence: Forward Substitution",
    description: "Methodology: Write -> Expand Level 1 -> Expand Level 2 -> Pattern -> Stop -> Solve.",
    week: 4,
    importance: "CORE",
    content: `## Forward Substitution Protocol
1. **Write recurrence**: $T(n) = 2T(n/2) + n$.
2. **Expand level 1**: $T(n) = 2(2T(n/4) + n/2) + n = 4T(n/4) + 2n$.
3. **Expand level 2**: $T(n) = 8T(n/8) + 3n$.
4. **Pattern Recognition**: $T(n) = 2^k T(n/2^k) + kn$.
5. **Stop Condition**: $n/2^k = 1 \\Rightarrow k = \\log_2 n$.
6. **Final Result**: $T(n) = nT(1) + n\\log n = \\Theta(n \\log n).$`
  },
  {
    title: "Recurrence: Backward Substitution",
    description: "Deep dive into Backward Substitution for linear recurrences.",
    week: 5,
    importance: "CORE",
    content: `## Backward Substitution
Starting from the base case and working upwards to find the closed-form expression. 
Essential for algorithms that reduce size by a constant amount (e.g., $n-1$).`
  },
  {
    title: "Algorithmic Domains",
    description: "Intro to Search, Sort, Graph Algorithms, and Text Processing.",
    week: 6,
    importance: "FUNDAMENTAL",
    content: `## 🔍 The Algorithmic Toolbox: Search & Sort
Algorithms are the "physics" of software. Before we build complex systems, we must master how we find and organize data at scale.

### 1️⃣ Searching: The Cost of Information

#### 📍 Linear Search ($O(n)$)
- **Concept**: A simple, exhaustive scan of the dataset.
- **When to Use**: When data is **unsorted**, small, or when you only expect to search once.
- **The Pattern**:
  - Start at the first element.
  - Compare the target value with the current element.
  - If they match, return the index.
  - If not, move to the next element.
  - If the end is reached without a match, the target is not present.

#### 📍 Binary Search ($O(\log n)$)
- **Concept**: A "Divide & Conquer" search that repeatedly halves the search space.
- **When to Use**: Only on **sorted data**. Essential for high-performance systems.
- **The Pattern**:
  - Pick the middle element of the current range.
  - If it's the target, stop.
  - If the target is smaller, repeat on the left half.
  - If the target is larger, repeat on the right half.
  - Fast: You can find 1 item in 1 billion in just 30 steps.

### 2️⃣ Sorting: Ordering Entropy

#### 🫧 Bubble Sort ($O(n^2)$)
- **Concept**: Repeatedly swapping adjacent elements if they are in the wrong order.
- **When to Use**: Almost never in production. Best for **teaching** the concept of stable sorting and iterative logic.
- **The Pattern**:
  - Compare adjacent pairs.
  - Swap them if the left is greater than the right.
  - After one pass, the largest element "bubbles" to the correct position.
  - Repeat for the remaining elements.

#### 🧩 Merge Sort ($O(n \log n)$)
- **Concept**: A stable, recursive sort that splits the array into single elements and merges them back in order.
- **When to Use**: When **stability** is required (preserving the order of equal elements) or when dealing with linked lists.
- **The Pattern**:
  - **Divide**: Split the array into two halves.
  - **Conquer**: Recursively sort both halves.
  - **Combine**: Merge the two sorted halves into one sorted array by comparing the smallest elements of each.

#### ⚡ Quick Sort ($O(n \log n)$)
- **Concept**: A fast, in-place sort that partitions the array around a "pivot" element.
- **When to Use**: The **standard** for most general-purpose sorting. Fast and memory-efficient.
- **The Pattern**:
  - **Pick**: Choose a pivot element.
  - **Partition**: Rearrange the array so elements smaller than the pivot are on the left, and larger ones are on the right.
  - **Recurse**: Repeat the process for the left and right partitions.

### 📝 Practice Lab: Domain Mastery
**Exercise 6: Searching Efficiency**
If a database has $2^{30}$ records (approx. 1 billion):
1. How many comparisons for Linear Search?
2. How many for Binary Search?

**Exercise 7: Sorting Trade-offs**
You are limited by RAM (Memory Constraint). Which sort do you choose for 10GB of data: Merge Sort or Quick Sort? Why?

**Exercise 8: Manual Array Trace**
Given the following array:
\`[45, 12, 89, 33, 27, 56]\`
1. Arrange it in increasing order using **Bubble Sort**. Show the state of the array after the first full pass.
2. If you use **Quick Sort** with the last element (\`56\`) as the pivot, which elements will be in the left partition after the first swap logic?`
  },
  {
    title: "Breadth-First Search (BFS)",
    description: "Traversal using queues and layer-by-layer exploration.",
    week: 7,
    importance: "CORE",
    content: `## 🌊 BFS: The Layer-by-Layer Protocol
Breadth-First Search is like a ripple in a pond. It explores all nodes at distance 1, then distance 2, and so on.

### 1️⃣ Strategy & Use Case
- **When to Use**: When you need to find the **Shortest Path** in an unweighted graph or explore neighbors in a uniform "wave."
- **Where to Use**: GPS navigation (fewest turns), Social network "mutual friends," Peer-to-peer (P2P) network discovery.
- **Time Complexity**: $O(V + E)$ where $V$ is vertices and $E$ is edges.
- **Space Complexity**: $O(V)$ (to store the queue and visited set).

### 2️⃣ The Pattern (How to Use)
- **Initialize**: Create an empty Queue and a Visited set.
- **Start**: Enqueue the root node and mark it as Visited.
- **Loop**: While the queue is not empty:
  - Dequeue the front node (Current).
  - For each unvisited Neighbor of Current:
    - Mark as Visited.
    - Enqueue the Neighbor.
- **Result**: Nodes are processed in order of their proximity to the source.

---

### 📝 Practice Lab: BFS Rigor
**Exercise 8: Layer Analysis**
Draw a graph with 6 nodes. Perform BFS starting from Node A. List the nodes in the order they enter the **Visited** set.
**Exercise 9: Memory Footprint**
If a graph is a perfectly balanced binary tree of height $h$, what is the maximum number of nodes in the BFS queue at any time?`
  },
  {
    title: "Depth-First Search (DFS)",
    description: "Deep traversal using recursion or stacks. Connectivity and Cycles.",
    week: 8,
    importance: "CORE",
    content: `## 🌲 DFS: Deep Neural Exploration
Depth-First Search doesn't like layers; it likes **depth**. It follows one path until it hits a dead end and then backtracks.

### 1️⃣ Strategy & Use Case
- **When to Use**: When you need to explore every possible path, detect **Cycles**, or perform a **Topological Sort**.
- **Where to Use**: Solving puzzles/mazes, Game AI (pathfinding options), Compiler dependency analysis.
- **Time Complexity**: $O(V + E)$.
- **Space Complexity**: $O(V)$ (Recursion stack or explicit stack).

### 2️⃣ The Pattern (How to Use)
- **Initialize**: Create a Stack (or use Recursion) and a Visited set.
- **Start**: Push the root node onto the stack.
- **Loop**: While stack is not empty:
  - Pop the top node (Current).
  - If Current is not Visited:
    - Mark as Visited.
    - Push all Neighbors of Current onto the stack.
- **Backtrack**: The LIFO nature ensures you exhaust one branch before moving to the next.

---

### 📝 Practice Lab: DFS Logic
**Exercise 10: Connectivity**
Explain how DFS can be used to determine if a graph is "Connected".
**Exercise 11: Tree vs Graph**
What happens if you run DFS on a graph with cycles without a "Visited" set?`
  },
  {
    title: "Minimum Spanning Trees (MST)",
    description: "Concepts of spanning trees and the Cut Property.",
    week: 9,
    importance: "CORE",
    content: `## 🌳 MST: Connecting with Minimum Cost
A Spanning Tree connects all nodes with no cycles. The Minimum Spanning Tree (MST) minimizes the total edge weight.

### 1️⃣ The Cut Property
If you divide the graph into two sets, the shortest edge crossing that "cut" **must** be part of the MST. This "greedy" truth is the soul of both Prim's and Kruskal's.

### 2️⃣ Operational Use Cases
- **Infrastructure**: Power grids, water pipelines, telecommunication networks.
- **Clustering**: Hierarchical clustering in ML.
- **Approximation**: Used to solve TSP (Traveling Salesperson Problem) approximately.

### 📝 Practice Lab: MST Theory
**Exercise 12: Unique MST?**
If all edge weights are unique, is the MST unique?
**Exercise 13: Spanning vs Minimum**
Draw a graph where the BFS tree is DIFFERENT from the MST.`
  },
  {
    title: "Shortest Paths: Dijkstra's",
    description: "Single-source shortest path algorithm for weighted graphs.",
    week: 10,
    importance: "ADVANCED",
    content: `## 📍 Dijkstra's: The Path of Least Resistance
Dijkstra's is the "Gold Standard" for single-source shortest paths in weighted graphs.

### 1️⃣ Strategy & Use Case
- **When to Use**: When edges have **Weights** (costs) and you need the cheapest path.
- **Where to Use**: Google Maps (fastest route), Network routing protocols (OSPF), Financial arbitrage.
- **Time Complexity**: $O((V+E) \log V)$ with a Priority Queue.
- **Space Complexity**: $O(V)$.

### 2️⃣ The Pattern (How to Use)
- **Initialize**: Set distance to Source = 0, others = $\infty$. Mark all as Unvisited.
- **Priority**: Use a Min-Priority Queue to store \`(distance, node)\`.
- **Loop**: While PQ is not empty:
  - Extract node $u$ with the minimum distance.
  - For each Neighbor $v$ of $u$:
    - **Relax**: NewDist = $dist[u] + weight(u, v)$.
    - If NewDist < $dist[v]$:
      - Update $dist[v] = NewDist$.
      - Enqueue $(NewDist, v)$.
- **Constraint**: Edge weights MUST be non-negative.

---

### 📝 Practice Lab: Dijkstra's Rigor
**Exercise 14: Trace the Path**
Perform Dijkstra's on a graph with 5 nodes. Show the \`dist[]\` array at every step.`
  },
  {
    title: "Greedy: Prim & Kruskal",
    description: "Comparing two greedy approaches to finding MST.",
    week: 11,
    importance: "ADVANCED",
    content: `## ⚔️ The MST Giants: Prim vs Kruskal
Both algorithms use "Greedy Choice" but build the tree from different perspectives.

### 1️⃣ Prim's (Node-Centric)
- **When to Use**: Best for **Dense Graphs** (many edges).
- **The Pattern**:
  - Start with a root node.
  - Maintain a set of nodes in the MST.
  - At each step, pick the cheapest edge connecting a node *inside* the MST to one *outside*.
  - Add that edge and node to the MST.
- **Complexity**: $O(E \log V)$.

### 2️⃣ Kruskal's (Edge-Centric)
- **When to Use**: Best for **Sparse Graphs** (fewer edges).
- **The Pattern**:
  - Sort all edges by weight.
  - Iterate through edges in increasing order.
  - Add edge to MST **ONLY IF** it doesn't create a cycle.
  - Use **Union-Find** to check for cycles efficiently.
- **Complexity**: $O(E \log E)$ or $O(E \log V)$.

---

### 📝 Practice Lab: Greedy Comparison
**Exercise 16: Union-Find**
Explain why Kruskal's needs "Union-Find" to be efficient.
**Exercise 17: Implementation Choice**
IoT sensors in a desert (Sparse Graph): Prim or Kruskal? Justify.`
  },
  {
    title: "Intro to Dynamic Programming",
    description: "DP concepts: Overlapping subproblems, Optimal Substructure, Knapsack 0-1.",
    week: 12,
    importance: "ADVANCED",
    content: `## 🧩 DP: The Art of Storing Results
Dynamic Programming is simply "Recursion with a Memory." It turns exponential problems into linear or polynomial ones by never solving the same subproblem twice.

### 1️⃣ The Two Pillars of DP
- **Optimal Substructure**: The solution to a large problem contains the solutions to smaller ones.
- **Overlapping Subproblems**: The same small problems appear many times throughout the calculation. (e.g., Fibonacci).

### 2️⃣ Memoization vs Tabulation
- **Memoization (Top-Down)**: Start big, solve recursively, and store results in a hash map.
- **Tabulation (Bottom-Up)**: Start small, fill out a table (matrix), and build up to the final answer.

### 📝 Practice Lab: DP Logic
**Exercise 18: Fibonacci Efficiency**
Compare the number of calls for $Fib(10)$ using pure recursion vs. DP Memoization.
**Exercise 19: The Matrix Strategy**
Draw the 0-1 Knapsack table for items with weights {1, 2, 3} and values {10, 15, 40} for a capacity of 5.`
  },
  {
    title: "Dynamic Programming: Coin Change",
    description: "Applying DP to the Coin Change and Minimum Coins problem.",
    week: 13,
    importance: "ADVANCED",
    content: `## 💰 The Coin Change Problem
How do you make "change" for a target value $V$ using the minimum number of coins? 

### 1️⃣ The Greedy Failure
A greedy approach (pick the largest coin first) works for US dollars but fails for arbitrary coin sets like {1, 3, 4} for a target of 6. (Greedy gives 4+1+1=3 coins; DP gives 3+3=2 coins).

### 2️⃣ The Recurrence
For each value $i$:
$$dp[i] = \min_{c \\in coins} (1 + dp[i - c])$$

### 📝 Practice Lab: Coin Mastery
**Exercise 20: Trace the Change**
Trace the DP table for coins {1, 3, 4} and target 6.
**Exercise 21: Infinite Supply**
What happens to the logic if you have a LIMITED supply of each coin? Is it still the same DP? (Hint: See 0-1 vs Unbounded Knapsack).`
  },
  {
    title: "Complexity Classes: P vs NP",
    description: "Tractable vs Intractable problems, reducibility, and the biggest mystery in CS.",
    week: 14,
    importance: "MASTER",
    content: `## 🎭 The Infinite Frontier: P vs NP
This is the "Holy Grail" of Computer Science. It asks: "If a solution is easy to check, is it also easy to find?"

### 1️⃣ The Taxonomy
- **P (Polynomial)**: Problems we can solve quickly (e.g., Sorting, Shortest Path).
- **NP (Nondeterministic Polynomial)**: Problems whose solutions are easy to **check** in polynomial time (e.g., Sudoku, Knapsack).
- **NP-Complete**: The hardest problems in NP. If you solve ONE of these in P time, you solve ALL of NP.
- **NP-Hard**: At least as hard as NP-complete, but not necessarily in NP (some might not even be checkable).

### 2️⃣ Why it Matters to Engineers
If you realize a feature request is **NP-Complete**, you don't waste months trying to find a perfect $O(n^2)$ solution. You use **Heuristics**, **Approximations**, or **Backtracking**.

### 📝 Practice Lab: Master's Thesis
**Exercise 22: Reducibility**
Explain the concept of "Reduction." How does proving that Problem A reduces to Problem B help us categorize Problem A?
**Exercise 23: The $1 Million Question**
What are the consequences for encryption (RSA) if someone proves $P = NP$?`
  }
];

async function restructure() {
  const client = await pool.connect();
  try {
    const courseRes = await client.query("SELECT id FROM courses WHERE name LIKE '%Algorithms & Complexity%' OR name LIKE '%CS 342%'");
    if (courseRes.rows.length === 0) {
      console.log("Course not found!");
      process.exit(1);
    }
    const courseId = courseRes.rows[0].id;

    console.log(`Starting restructure for CS 342 (ID: ${courseId})...`);

    // 1. Delete existing topics for this course
    await client.query("DELETE FROM topics WHERE course_id = $1", [courseId]);
    console.log("Deleted old topics.");

    // 2. Insert new topics
    for (const t of topics) {
      await client.query(
        `INSERT INTO topics 
         (course_id, title, structural_breakdown, importance_level, 
          estimated_time, learning_objectives, breadcrumb_path, 
          content_markdown, content_deep_markdown) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          courseId,
          t.title,
          t.description,
          t.importance,
          "120 Minutes",
          JSON.stringify(["Analyze algorithms in order to determine their asymptotic complexity (CLO2)", "Design and implement algorithms to solve computational problems (CLO4)"]),
          `CS 342 > Week ${t.week}`,
          t.content,
          t.content
        ]
      );
      console.log(`Inserted: ${t.title}`);
    }

    console.log("Restructure complete!");
  } catch (err) {
    console.error("Error during restructure:", err);
  } finally {
    client.release();
    process.exit();
  }
}

restructure();
