import pool from '../config/db.js';

const courseCode = 'CS 342';

const deepDiveContent = {
    "Foundations & Asymptotic Analysis": `
# Asymptotic Analysis: The Science of Growth

In algorithm analysis, we don't care about microseconds. We care about **scalability**.

## The "Why": Why Asymptotic?
As $n$ (input size) grows to infinity, constant factors and lower-order terms become insignificant. $10n^2$ and $n^2$ both grow at the same rate compared to $n^3$.

### The Big-O Definition
$f(n) = O(g(n))$ if there exist constants $c > 0$ and $n_0 \\geq 1$ such that $f(n) \\leq c \\cdot g(n)$ for all $n \\geq n_0$. 
This provides an **upper bound** on growth.

## Math Review: Summations
- **Arithmetic Series**: $\\sum_{i=1}^n i = \\frac{n(n+1)}{2} = \\Theta(n^2)$
- **Geometric Series**: $\\sum_{i=0}^n a^i = \\frac{a^{n+1}-1}{a-1} = \\Theta(a^n)$
`,
    "Algorithm Analysis (Non-Recursive & Recursive)": `
# Solving Recurrences: The Neural Substitution Method

To analyze recursive algorithms, we must solve a **Recurrence Relation**.

## The Problem: $T(n) = 2T(n/2) + n$
Why does this happen? This recurrence represents a problem that halves itself and does $n$ work to merge results (like MergeSort).

### Step-by-Step Substitution
1. **$T(n) = 2T(n/2) + n$**
2. Substitute $T(n/2)$: $T(n) = 2[2T(n/4) + n/2] + n = 4T(n/4) + 2n$
3. Substitute $T(n/4)$: $T(n) = 4[2T(n/8) + n/4] + 2n = 8T(n/8) + 3n$

**Pattern**: $T(n) = 2^k T(n/2^k) + kn$
**Stop**: When $n/2^k = 1 \\Rightarrow k = \\log_2 n$.
**Result**: $T(n) = n \\cdot T(1) + n \\log_2 n = \\Theta(n \\log n)$.

## The Master Theorem
If $T(n) = aT(n/b) + f(n)$:
1. If $f(n) < n^{\\log_b a} \\Rightarrow T(n) = \\Theta(n^{\\log_b a})$
2. If $f(n) = n^{\\log_b a} \\Rightarrow T(n) = \\Theta(n^{\\log_b a} \\log n)$
3. If $f(n) > n^{\\log_b a} \\Rightarrow T(n) = \\Theta(f(n))$
`,
    "Elementary Graph Algorithms - Graph Search": `
# Graph Traversal: BFS vs DFS

Graphs represent neural links. Searching them requires a systematic protocol to avoid infinite loops.

## BFS (Breadth-First Search)
- **Data Structure**: Queue (FIFO)
- **Logic**: Visit all immediate neighbors (Level 1), then all their neighbors (Level 2).
- **Property**: Finds the **shortest path** in unweighted graphs.

## DFS (Depth-First Search)
- **Data Structure**: Stack (LIFO) or Recursion.
- **Logic**: Dive as deep as possible along a branch before backtracking.
- **Property**: Useful for cycle detection and topological sorting.
`,
    "Dynamic Programming": `
# Dynamic Programming: Optimization by Memory

DP is essentially "Recursion + Memoization". We solve small subproblems and store their results to avoid redundant work.

## The 0-1 Knapsack Problem
**The Goal**: Maximize value without exceeding capacity $W$.

### The Recurrence Relation
Let $V[i, w]$ be the max value using items $1..i$ with capacity $w$.
$$V[i, w] = \\max(V[i-1, w], v_i + V[i-1, w-w_i])$$

- **Exclude Item $i$**: We carry over the best value from the previous $i-1$ items.
- **Include Item $i$**: We add its value $v_i$ and look up the remaining capacity $(w - w_i)$ in the previous results.
`
};

async function fillContent() {
    try {
        const courseRes = await pool.query("SELECT id FROM courses WHERE name LIKE $1", [`%${courseCode}%`]);
        if (courseRes.rows.length === 0) {
            console.error("Course not found");
            process.exit(1);
        }
        const courseId = courseRes.rows[0].id;

        for (const [title, content] of Object.entries(deepDiveContent)) {
            await pool.query(
                "UPDATE topics SET content = $1 WHERE course_id = $2 AND title = $3",
                [content, courseId, title]
            );
            console.log(`Deep Dive injected: ${title}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fillContent();
