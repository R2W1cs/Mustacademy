/**
 * CS 342 — Algorithms & Complexity lesson content.
 * Source of truth for enrich_cs342_algorithms.mjs
 */
import { lesson } from "./helper.mjs";

const BC = "CS 342 > Week";

export const topics = [
  lesson({
    title: "Complexity Fundamentals",
    titleMatch: "Complexity Fundamentals%",
    importance_level: "FUNDAMENTAL",
    breadcrumb_path: `${BC} 1`,
    first_principles: [
      "Time complexity counts operations as input size n grows — not literal seconds",
      "Space complexity measures extra memory beyond the input",
      "Worst-case analysis gives guarantees; average and best case add nuance",
      "Asymptotic analysis studies behavior as n → ∞ to compare algorithms fairly",
      "An algorithm that works at n=100 but fails at n=100,000 is broken by design",
    ],
    learning_objectives: [
      "Define time and space complexity in terms of input size n",
      "Contrast worst, average, and best-case analysis",
      "Explain why we study asymptotic behavior as n → ∞",
      "Order common growth rates from slowest to fastest",
      "Apply complexity thinking to predict scalability bottlenecks",
    ],
    content_easy_markdown: `# Complexity Fundamentals

## Hook: Why your app melts at scale
Imagine a search that checks every user one-by-one. With 100 users it feels instant. With 1,000,000 users it can take minutes. **Complexity** is how we predict that cliff *before* shipping.

## The simple idea
- **Time complexity**: how the *number of steps* grows when input size is $n$ (not wall-clock seconds — those depend on CPU, language, and luck).
- **Space complexity**: how much *extra memory* the algorithm needs beyond storing the input.

We care about **asymptotic** behavior: what happens as $n \\to \\infty$. Constants and small inputs lie; growth rates tell the truth.

## Three lenses on the same algorithm
| Lens | Question | Typical use |
|------|----------|-------------|
| **Worst case** $O(\\cdot)$ | How bad can it get? | Guarantees for production SLAs |
| **Average case** $\\Theta(\\cdot)$ | What do typical inputs cost? | Expected load planning |
| **Best case** $\\Omega(\\cdot)$ | How good can it get? | Early-exit optimizations |

## Real analogy
Sorting mail in a building:
- **Linear** $O(n)$: walk every mailbox once.
- **Quadratic** $O(n^2)$: compare every pair of letters — fine for 10 letters, disaster for 10,000.

## Worked example
A loop that scans an array once:
\`\`\`python
def find_max(arr):
    m = arr[0]
    for x in arr:      # n iterations
        if x > m:
            m = x
    return m
\`\`\`
- Time: $\\Theta(n)$ — each element visited once.
- Space: $O(1)$ — only variable \`m\`.

Nested loops over the same array:
\`\`\`python
def count_pairs(arr):
    c = 0
    for i in arr:
        for j in arr:  # n × n
            c += 1
    return c
\`\`\`
- Time: $\\Theta(n^2)$.

## Check yourself
1. Why don't we measure "seconds" directly?
   - Answer: Hardware and implementation change; operation count vs $n$ is portable.
2. If an algorithm is $O(n^2)$, is it always slow?
   - Answer: Not for tiny $n$; asymptotics describe large-$n$ trends.
3. Order these by growth (slowest → fastest): $\\log n$, $n$, $n \\log n$, $n^2$.
   - Answer: $\\log n < n < n \\log n < n^2$.`,
    content_deep_markdown: `# Complexity Fundamentals (Deep)

## Staff-engineer framing
Complexity is a **failure predictor**. $O(n^2)$ on a million-row table is not "maybe slow" — it is a scheduled outage.

## Time vs space trade-offs
Memoization trades $O(n)$ space for exponential-time → polynomial-time wins (see DP lessons). Caching is the same idea at system scale.

## Formal spectrum
- **Worst case** $O(g(n))$: upper bound that holds for all inputs of size $n$.
- **Average case** $\\Theta(g(n))$: expected over input distribution.
- **Best case** $\\Omega(g(n))$: lower bound on any input.

## Practice Lab
**Exercise 1 — Growth order**
Arrange in increasing asymptotic growth:
$n \\log n,\\; n^4,\\; n^n,\\; n^3 \\log n,\\; 100n^3 + \\log n,\\; \\log n$

**Exercise 2 — Big-O, Omega, Theta**
Let $f(n)=3^n+n^{100}$, $g(n)=3^n$. True or false?
- A. $f(n)=O(g(n))$
- B. $f(n)=\\Omega(g(n))$
- C. $f(n)=\\Theta(g(n))$

*Answers: A True, B True, C True — exponential dominates polynomial.*`,
  }),

  lesson({
    title: "Asymptotic Framework (Theory)",
    titleMatch: "Asymptotic Framework%",
    importance_level: "CORE",
    breadcrumb_path: `${BC} 2`,
    first_principles: [
      "Big-O is an upper bound: f grows no faster than c·g for large n",
      "Big-Omega is a lower bound: f grows at least as fast as c·g",
      "Big-Theta is a tight bound: f sandwiched between c1·g and c2·g",
      "Constants and lower-order terms are dropped in asymptotic notation",
      "Notation compares growth rates, not exact operation counts",
    ],
    learning_objectives: [
      "State formal definitions of O, Ω, and Θ",
      "Prove simple functions belong to a complexity class using constants",
      "Map each notation to ≤, ≥, and = intuition for growth",
      "Identify common mistakes (confusing O with Θ)",
      "Use bounds to compare algorithms rigorously",
    ],
    content_easy_markdown: `# Asymptotic Framework (Theory)

## Hook: Three guardrails on growth
When two engineers argue "my sort is faster," asymptotic notation is the referee. It ignores whether you use Python or Rust and asks: **as $n$ grows, who wins?**

## Big-O — the ceiling ($\\le$ growth)
$f(n) = O(g(n))$ means: for large enough $n$, $f$ never outruns a scaled copy of $g$.

**Formal:** $\\exists\\, c>0, n_0$ such that $0 \\le f(n) \\le c\\cdot g(n)$ for all $n \\ge n_0$.

**Example:** $3n^2 + 100n = O(n^2)$ because for $n \\ge 100$, $3n^2+100n \\le 4n^2$.

## Big-Omega — the floor ($\\ge$ growth)
$f(n) = \\Omega(g(n))$ means $f$ is **at least** as heavy as $g$ eventually.

**Formal:** $\\exists\\, c>0, n_0$ such that $0 \\le c\\cdot g(n) \\le f(n)$ for all $n \\ge n_0$.

**Example:** Any comparison sort is $\\Omega(n \\log n)$ — you cannot beat that comparison barrier in the worst case.

## Big-Theta — the tight fit ($=$ growth)
$f(n) = \\Theta(g(n))$ means $f$ and $g$ grow at the **same rate**.

**Formal:** $\\exists\\, c_1, c_2 > 0, n_0$ such that $c_1 g(n) \\le f(n) \\le c_2 g(n)$ for all $n \\ge n_0$.

Equivalently: $f = O(g)$ **and** $f = \\Omega(g)$.

## Analogy
Think of a race:
- **O** = "They finish no later than the pace car."
- **Ω** = "They finish no earlier than the pace car."
- **Θ** = "They stay glued to the pace car."

## Worked example
Is $f(n)=7n+20$ equal to $\\Theta(n)$?
- Upper: $7n+20 \\le 8n$ for $n \\ge 20$ → $O(n)$.
- Lower: $7n+20 \\ge 7n$ → $\\Omega(n)$.
- Therefore $\\Theta(n)$. ✓

## Check yourself
1. If $f=\\Theta(n)$, must $f=O(n^2)$?
   - Answer: Yes — tighter bound implies looser upper bound.
2. Does $O(n^2)$ mean the algorithm is always $\\Theta(n^2)$?
   - Answer: No — O is only an upper bound; actual growth may be lower.
3. Why drop constants like the 7 in $7n$?
   - Answer: As $n \\to \\infty$, constant factors become negligible compared to growth shape.`,
    content_deep_markdown: `# Asymptotic Framework (Deep)

## Formal definitions (reference)
**Big-O:** $f(n)=O(g(n)) \\iff \\exists c,n_0>0: 0\\le f(n)\\le c\\cdot g(n)\\;\\forall n\\ge n_0$

**Big-Omega:** $f(n)=\\Omega(g(n)) \\iff \\exists c,n_0>0: 0\\le c\\cdot g(n)\\le f(n)\\;\\forall n\\ge n_0$

**Big-Theta:** $f(n)=\\Theta(g(n)) \\iff \\exists c_1,c_2,n_0>0: c_1 g(n)\\le f(n)\\le c_2 g(n)\\;\\forall n\\ge n_0$

## Little-o and little-ω (strict)
$f=o(g)$ if $\\lim_{n\\to\\infty} f/g = 0$. Strictly slower.

## Practice Lab
**Exercise 3:** $f=n\\log n$, $g=2^n$. Classify $f$ vs $g$ using limits.

**Exercise 4:** $f=(2n)!$, $g=5^n n^{10}$. Which dominates? (Factorial beats exponential.)

**Exercise 5:** Prove $n^2+n=\\Theta(n^2)$ by exhibiting $c_1,c_2,n_0$.`,
  }),

  lesson({
    title: "Growth Comparison & Limits",
    titleMatch: "Growth Comparison%",
    importance_level: "CORE",
    breadcrumb_path: `${BC} 3`,
    first_principles: [
      "The limit test compares f(n)/g(n) as n → ∞",
      "Limit 0 means f grows strictly slower than g",
      "Limit c (finite, positive) means f and g have the same growth rate",
      "Limit ∞ means f grows strictly faster than g",
      "L'Hôpital's rule helps when both numerator and denominator blow up",
    ],
    learning_objectives: [
      "Apply the limit ratio test to compare two functions",
      "Interpret limit outcomes as o, Θ, or ω relationships",
      "Choose valid O, Ω, and Θ witnesses after comparison",
      "Rank mixed polynomial-log and exponential expressions",
      "Avoid common limit algebra errors",
    ],
    content_easy_markdown: `# Growth Comparison & Limits

## Hook: When intuition argues, use calculus
Is $n^{100}$ bigger than $2^n$? Early values fool you — $n^{100}$ wins for small $n$, but $2^n$ eventually explodes. The **limit test** settles it.

## The limit test
Compare $f(n)$ and $g(n)$ via:

$$L = \\lim_{n \\to \\infty} \\frac{f(n)}{g(n)}$$

| Result | Meaning | Notation |
|--------|---------|----------|
| $L = 0$ | $f$ grows **slower** | $f = o(g)$ |
| $0 < L < \\infty$ | **Same rate** | $f = \\Theta(g)$ |
| $L = \\infty$ | $f$ grows **faster** | $f = \\omega(g)$ |

## Worked example 1
$f(n)=3n^2+5n$, compare to $g(n)=n^2$:

$$\\lim_{n\\to\\infty}\\frac{3n^2+5n}{n^2}=\\lim_{n\\to\\infty}\\left(3+\\frac{5}{n}\\right)=3$$

Finite positive limit → **$f=\\Theta(n^2)$**.

## Worked example 2
$f(n)=n\\log n$, $g(n)=n^2$:

$$\\lim_{n\\to\\infty}\\frac{n\\log n}{n^2}=\\lim_{n\\to\\infty}\\frac{\\log n}{n}=0$$

So $n\\log n$ grows slower → $f=o(n^2)$, hence $f=O(n^2)$ but not $\\Theta(n^2)$.

## Hierarchy cheat sheet (slow → fast)
$$\\log n \\;\\ll\\; n \\;\\ll\\; n\\log n \\;\\ll\\; n^2 \\;\\ll\\; n^3 \\;\\ll\\; 2^n \\;\\ll\\; n!$$

## Check yourself
1. $\\lim (\\log n)/n$ as $n\\to\\infty$?
   - Answer: 0 — logarithms lose to any positive power of $n$.
2. If the limit is 5, can $f=O(g)$ and $f=\\Omega(g)$?
   - Answer: Yes — both hold, so $f=\\Theta(g)$.
3. Why is comparing $f$ and $g$ at $n=100$ unreliable?
   - Answer: Constants dominate at small $n$; limits reveal long-run behavior.`,
    content_deep_markdown: `# Growth Comparison & Limits (Deep)

## Limit test rigor
When $\\lim f/g = c \\in (0,\\infty)$, pick witnesses:
- $f=O(g)$ with $c' = 2c$
- $f=\\Omega(g)$ with $c' = c/2$

## L'Hôpital cases
For $\\lim \\frac{\\log n}{n^\\epsilon}$ (any $\\epsilon>0$) → 0.
For $\\lim \\frac{n^k}{a^n}$ ($a>1$) → 0 — exponentials beat polynomials.

## Practice Lab
**Exercise 5 — Bounding**
Given $f(n)=3n^2+5n+100n^2\\log n$, give examples of $g$ such that:
- A. $f=O(g)$
- B. $f=\\Omega(g)$
- C. $f=\\Theta(g)$

*Hint: Dominant term is $n^2\\log n$.*

**Exercise 6 — Rank**
Sort: $n!$, $2^n$, $n^3\\log n$, $1000n^2$, $\\log^2 n$.`,
  }),

  lesson({
    title: "Recurrence: Forward Substitution",
    titleMatch: "Recurrence: Forward Substitution%",
    importance_level: "CORE",
    breadcrumb_path: `${BC} 4`,
    first_principles: [
      "A recurrence defines T(n) in terms of smaller subproblem sizes",
      "Forward substitution expands T(n) level by level from the top down",
      "Pattern recognition after 2–3 expansions reveals the closed form",
      "The base case T(1) or T(0) stops the expansion",
      "Divide-and-conquer recurrences often yield log factors",
    ],
    learning_objectives: [
      "Expand a recurrence through multiple substitution levels",
      "Identify arithmetic or geometric patterns in expanded terms",
      "Solve T(n)=2T(n/2)+n to Θ(n log n)",
      "Determine the stopping level k when n/2^k = 1",
      "Connect recurrence solutions to algorithm analysis",
    ],
    content_easy_markdown: `# Recurrence: Forward Substitution

## Hook: Merge sort's hidden formula
Merge sort splits the array in half, sorts each half, then merges. Its runtime satisfies a **recurrence** — a recursive equation for cost. Forward substitution turns that equation into a closed form like $\\Theta(n\\log n)$.

## The protocol (6 steps)
1. **Write** the recurrence (e.g. $T(n)=2T(n/2)+n$).
2. **Expand level 1** — substitute the definition once.
3. **Expand level 2** — substitute again.
4. **Spot the pattern** in coefficients and subproblem sizes.
5. **Stop** when the subproblem hits the base case ($n/2^k=1$).
6. **Solve** for $T(n)$.

## Worked example: $T(n)=2T(n/2)+n$, $T(1)=1$

**Level 0:** $T(n)=2T(n/2)+n$

**Level 1:** $T(n)=2[2T(n/4)+n/2]+n=4T(n/4)+2n$

**Level 2:** $T(n)=8T(n/8)+3n$

**Pattern:** After $k$ levels: $T(n)=2^k T(n/2^k)+kn$

**Stop:** $n/2^k=1 \\Rightarrow k=\\log_2 n$

**Finish:** $T(n)=nT(1)+n\\log_2 n = n + n\\log n = \\Theta(n\\log n)$

## Real connection
This is exactly **Merge Sort** and **Quick Sort** (average case) behavior — divide in half, linear merge work per level, $\\log n$ levels.

## Check yourself
1. Why does the "+n" term become "+kn" after k expansions?
   - Answer: Each of k levels adds $n$ work at that recursion depth.
2. What is $k$ when $n=16$ and we halve each time?
   - Answer: $\\log_2 16 = 4$ levels.
3. If $T(n)=T(n-1)+1$, is forward substitution from halving the same?
   - Answer: No — that's a linear-size decrease; use backward substitution instead.`,
    content_deep_markdown: `# Forward Substitution (Deep)

## Template for $T(n)=aT(n/b)+f(n)$
After $k$ expansions: $T(n)=a^k T(n/b^k)+\\sum_{i=0}^{k-1} a^i f(n/b^i)$.

For $a=b=2$, $f(n)=n$: sum of $n$ over $\\log n$ levels → $n\\log n$.

## Master Theorem preview
When $f(n)$ matches $n^{\\log_b a}$ up to polylog factors, MT gives $\\Theta(n^{\\log_b a}\\log n)$.

## Practice
Solve by forward substitution:
- $T(n)=3T(n/3)+n$
- $T(n)=2T(n/2)+1$
- $T(n)=4T(n/2)+n$

Compare your closed forms to Merge Sort variants.`,
  }),

  lesson({
    title: "Recurrence: Backward Substitution",
    titleMatch: "Recurrence: Backward Substitution%",
    importance_level: "CORE",
    breadcrumb_path: `${BC} 5`,
    first_principles: [
      "Backward substitution builds up from the base case T(0) or T(1)",
      "Linear recurrences T(n)=T(n-1)+c often yield Θ(n)",
      "Subtract consecutive equations to expose telescoping sums",
      "Choosing the right base case simplifies the algebra",
      "Not all recurrences divide evenly — match method to structure",
    ],
    learning_objectives: [
      "Solve T(n)=T(n-1)+n using backward substitution",
      "Solve T(n)=T(n-1)+1 to Θ(n)",
      "Recognize when backward vs forward substitution applies",
      "Unroll recurrences to closed forms with summations",
      "Relate solutions to iterative algorithm loop counts",
    ],
    content_easy_markdown: `# Recurrence: Backward Substitution

## Hook: The insertion-sort equation
Some algorithms shave **one element** off the problem each step (not half). Their recurrences look like $T(n)=T(n-1)+\\text{work}$. **Backward substitution** starts at the base case and climbs up.

## When to use it
| Recurrence shape | Typical algorithm |
|------------------|-------------------|
| $T(n)=T(n/2)+\\cdots$ | Divide & conquer → **forward** |
| $T(n)=T(n-1)+\\cdots$ | Linear reduction → **backward** |

## Worked example: $T(n)=T(n-1)+1$, $T(0)=0$

Substitute backward:
$T(n)=T(n-1)+1=[T(n-2)+1]+1=T(n-2)+2=\\cdots=T(0)+n=n$

So **$T(n)=\\Theta(n)$** — one step per element (e.g. linear scan).

## Worked example: $T(n)=T(n-1)+n$, $T(0)=0$

$T(n)=T(n-1)+n=T(n-2)+(n-1)+n=\\cdots=\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}=\\Theta(n^2)$

This matches **Insertion Sort**'s worst-case comparisons.

## Telescoping trick
Write $T(n)-T(n-1)=n$, sum from $i=1$ to $n$ — left side collapses to $T(n)-T(0)$.

## Check yourself
1. $T(n)=2T(n-1)$, $T(1)=1$. First backward step?
   - Answer: $T(n)=2T(n-1)+0$ → doubles each step → $2^{n-1}$.
2. Why is Insertion Sort $\\Theta(n^2)$ worst case?
   - Answer: $1+2+\\cdots+(n-1)=\\Theta(n^2)$ shifts.
3. Forward substitution on $T(n)=T(n-1)+1$ — does it fail?
   - Answer: It works but backward is cleaner for -1 decrements.`,
    content_deep_markdown: `# Backward Substitution (Deep)

## General linear recurrence
$T(n)=T(n-1)+f(n)$, $T(0)=c$ → $T(n)=c+\\sum_{i=1}^{n} f(i)$.

Examples:
- $f(n)=c_0$ → $\\Theta(n)$
- $f(n)=n$ → $\\Theta(n^2)$
- $f(n)=\\log n$ → $\\Theta(n\\log n)$

## Non-constant coefficients
$T(n)=nT(n-1)$ → $n!$ growth (permutation enumeration).

## Practice
1. $T(n)=T(n-2)+n$, $T(0)=T(1)=1$
2. $T(n)=T(n-1)+2^n$
3. Prove $T(n)=T(n-1)+n$ implies $\\Theta(n^2)$ by induction`,
  }),

  lesson({
    title: "Algorithmic Domains",
    titleMatch: "Algorithmic Domains%",
    importance_level: "FUNDAMENTAL",
    breadcrumb_path: `${BC} 6`,
    first_principles: [
      "Search finds data; sort orders data for faster search",
      "Binary search requires sorted input and halves the search space",
      "Comparison sorts have Ω(n log n) lower bound in the worst case",
      "Merge sort guarantees O(n log n); quicksort is fast in practice",
      "Algorithm choice depends on constraints: memory, stability, nearly-sorted data",
    ],
    learning_objectives: [
      "Compare linear and binary search time and preconditions",
      "Describe bubble, merge, and quick sort patterns and complexities",
      "Choose a sort given memory and stability constraints",
      "Estimate comparisons for 2^30 records under linear vs binary search",
      "Trace one pass of bubble sort and one partition of quicksort",
    ],
    content_easy_markdown: `# Algorithmic Domains — Search & Sort

## Hook: Find one name in a billion
Facebook-scale directories need **logarithmic** search, not linear scans. Sorting once unlocks repeated fast lookups.

## Searching
### Linear search — $O(n)$
Walk every element. Works on **unsorted** data.

### Binary search — $O(\\log n)$
Halve a **sorted** range each step. One billion items ≈ 30 comparisons.

\`\`\`python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
\`\`\`

## Sorting toolbox
| Algorithm | Time (typical) | Stable? | Notes |
|-----------|----------------|---------|-------|
| Bubble | $O(n^2)$ | Yes | Teaching only |
| Merge | $O(n\\log n)$ | Yes | Needs $O(n)$ extra space |
| Quick | $O(n\\log n)$ avg | No* | In-place, cache-friendly |

*Quick sort can be made stable with extra space.

## Worked example
Array \`[45, 12, 89, 33, 27, 56]\`:
- **Bubble pass 1:** compare pairs left→right; largest (89) bubbles right → \`[45, 12, 33, 27, 56, 89]\`
- **Quick pivot 56:** partition so left ≤ 56, right ≥ 56

## Check yourself
1. $2^{30}$ records — max binary search steps?
   - Answer: 30 (halving).
2. 10 GB RAM-limited sort — Merge or Quick?
   - Answer: Quick (in-place); Merge needs extra $O(n)$ memory.
3. Must preserve equal-key order?
   - Answer: Use stable Merge (or stable variant).`,
    content_deep_markdown: `# Algorithmic Domains (Deep)

## Comparison sort lower bound
Decision tree has $n!$ leaves → height $\\Omega(\\log n!) = \\Omega(n\\log n)$.

## Non-comparison sorts
Counting/Radix: $O(n+k)$ when key range is bounded — bypass comparison limit.

## Practice Lab
**Exercise 6:** $2^{30}$ records — linear vs binary comparisons.

**Exercise 7:** External sort — why Merge suits tape/disk passes.

**Exercise 8:** Trace bubble first pass and quick partition on \`[45,12,89,33,27,56]\`.`,
  }),

  lesson({
    title: "Breadth-First Search (BFS)",
    titleMatch: "Breadth-First Search%",
    importance_level: "CORE",
    breadcrumb_path: `${BC} 7`,
    first_principles: [
      "BFS explores graph nodes in order of increasing distance from the source",
      "A queue (FIFO) drives layer-by-layer expansion",
      "BFS finds shortest paths in unweighted graphs",
      "Time O(V+E), space O(V) for adjacency list representation",
      "Mark nodes visited when enqueued to avoid duplicate work",
    ],
    learning_objectives: [
      "Implement BFS with a queue and visited set",
      "Explain why BFS yields shortest paths in unweighted graphs",
      "State time and space complexity in terms of V and E",
      "Apply BFS to social networks and routing intuition",
      "Trace BFS visit order on a small graph",
    ],
    content_easy_markdown: `# Breadth-First Search (BFS)

## Hook: Ripples in a pond
Drop a stone — the first ripple hits nearby points, then the next ring, and so on. **BFS** explores a graph the same way: all distance-1 neighbors, then distance-2, etc.

## When BFS wins
- **Shortest path** in unweighted graphs (fewest edges)
- Social **degrees of separation**
- Broadcasting / flood fill on grids

## The pattern
1. Enqueue start; mark visited.
2. While queue not empty:
   - Dequeue front → current.
   - For each unvisited neighbor: mark visited, enqueue.

\`\`\`python
from collections import deque

def bfs(graph, start):
    q = deque([start])
    seen = {start}
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in graph[u]:
            if v not in seen:
                seen.add(v)
                q.append(v)
    return order
\`\`\`

## Complexity
- **Time:** $O(V+E)$ — each vertex and edge touched once.
- **Space:** $O(V)$ — queue + visited.

## Worked example
Triangle graph A—B—C—A, start at A:
- Queue: [A] → visit A, enqueue B,C
- Visit B, enqueue (nothing new)
- Visit C → order: A, B, C (B and C both distance 1)

## Check yourself
1. BFS data structure?
   - Answer: Queue (FIFO).
2. Weighted graph shortest path — still plain BFS?
   - Answer: No — use Dijkstra (non-negative weights).
3. Why mark visited at **enqueue** time?
   - Answer: Prevents pushing the same node twice before dequeue.`,
    content_deep_markdown: `# BFS (Deep)

## Shortest-path proof sketch
BFS layers correspond to distance $d$ from source; first time we dequeue $v$ is at minimum $d$.

## BFS on grids
4-connected grid: each cell is a vertex; edges to neighbors. Layer count = Manhattan distance.

## Practice
**Exercise 8:** 6-node graph — list visit order from A.

**Exercise 9:** Perfect binary tree height $h$ — max queue size $\\approx 2^h$ leaves level.

**Exercise 10:** Bidirectional BFS for faster shortest path in large graphs.`,
  }),

  lesson({
    title: "Depth-First Search (DFS)",
    titleMatch: "Depth-First Search%",
    importance_level: "CORE",
    breadcrumb_path: `${BC} 8`,
    first_principles: [
      "DFS explores as deep as possible before backtracking",
      "Stack (explicit or recursion) implements LIFO depth-first order",
      "DFS detects cycles and tests connectivity",
      "Same O(V+E) time as BFS on adjacency lists",
      "Without a visited set, cycles cause infinite loops",
    ],
    learning_objectives: [
      "Implement DFS recursively and iteratively with a stack",
      "Use DFS for connectivity and cycle detection",
      "Contrast DFS visit order with BFS on the same graph",
      "Apply DFS to topological sort and maze solving",
      "Explain recursion stack space costs",
    ],
    content_easy_markdown: `# Depth-First Search (DFS)

## Hook: Explore the maze — always turn left until dead end
**DFS** goes **deep** first: follow one path to the end, backtrack, try the next branch. Like solving a maze with chalk — mark visited corridors.

## When DFS wins
- **Cycle detection**
- **Topological sort** (task dependencies)
- **Connected components**
- Exhaustive path exploration (with pruning)

## Recursive pattern
\`\`\`python
def dfs(graph, u, seen):
    seen.add(u)
    for v in graph[u]:
        if v not in seen:
            dfs(graph, v, seen)
\`\`\`

## BFS vs DFS (same graph, start A)
| | Order feels like | Finds shortest path? |
|---|------------------|---------------------|
| BFS | Ripple outward | Yes (unweighted) |
| DFS | Tunnel deep | Not guaranteed |

## Cycle detection
Undirected: if edge $(u,v)$ exists and $v$ is visited but **not** $u$'s parent → cycle.
Directed: need **three-color** marking (white/gray/black) or recursion stack set.

## Check yourself
1. DFS core structure?
   - Answer: Stack / recursion (LIFO).
2. DFS without visited set on cyclic graph?
   - Answer: Infinite loop / stack overflow.
3. Time complexity on adjacency list?
   - Answer: $O(V+E)$.`,
    content_deep_markdown: `# DFS (Deep)

## Iterative DFS
Push start; pop; push unvisited neighbors — mirrors recursion stack.

## Applications
- **Topological sort:** DFS finish times, reverse order.
- **Articulation points / bridges:** DFS with discovery times.
- **Strongly connected components:** Kosaraju / Tarjan.

## Practice
**Exercise 10:** Connectivity test — one DFS from any vertex visits all iff connected.

**Exercise 11:** Run DFS on cyclic graph without visited — describe failure mode.`,
  }),

  lesson({
    title: "Minimum Spanning Trees (MST)",
    titleMatch: "Minimum Spanning Trees%",
    importance_level: "CORE",
    breadcrumb_path: `${BC} 9`,
    first_principles: [
      "A spanning tree connects all vertices with V−1 edges and no cycles",
      "An MST minimizes total edge weight among spanning trees",
      "The cut property: minimum edge crossing any cut belongs to some MST",
      "Greedy algorithms (Prim, Kruskal) exploit the cut and cycle properties",
      "MST differs from BFS/DFS trees — optimizes weight, not hop count",
    ],
    learning_objectives: [
      "Define spanning trees and MSTs on weighted graphs",
      "State the cut property and its role in greedy MST algorithms",
      "Contrast MST with shortest-path trees",
      "Identify real-world MST applications",
      "Determine whether an MST is unique when edge weights are distinct",
    ],
    content_easy_markdown: `# Minimum Spanning Trees (MST)

## Hook: Wire a campus cheaply
You must connect every building with cable. Running cable costs money per meter. You need **every** building reachable, **no loops** (loops waste cable), and **minimum total cost**. That's an **MST**.

## Vocabulary
- **Spanning tree:** connects all $V$ vertices using exactly $V-1$ edges, acyclic.
- **MST:** spanning tree with **minimum sum of edge weights**.

## The cut property (greedy intuition)
Split vertices into two groups (a **cut**). The **lightest edge crossing** that cut can safely join the MST.

## MST ≠ shortest-path tree
BFS tree minimizes **hops**, not **wire cost**. A cheap long edge might beat many expensive short hops.

## Real uses
- Power / water / fiber networks
- Clustering (cut heaviest MST edges)
- Approximation for TSP

## Worked example
Graph: A—1—B, B—2—C, A—4—C.
- Spanning trees: AB+BC (cost 3) or AB+AC (cost 5) or BC+AC (cost 6).
- **MST cost = 3** (edges AB, BC).

## Check yourself
1. How many edges in a spanning tree of $V$ vertices?
   - Answer: $V-1$.
2. Unique weights — unique MST?
   - Answer: Yes — each greedy choice is forced.
3. Does BFS tree always equal MST?
   - Answer: No — different optimization goals.`,
    content_deep_markdown: `# MST (Deep)

## Cycle property
Maximum-weight edge on any cycle is **not** in the MST (unless ties).

## Prim vs Kruskal preview
- **Prim:** grow tree from a seed vertex — good for dense graphs.
- **Kruskal:** sort edges globally — good for sparse graphs.

## Practice
**Exercise 12:** Unique MST with distinct weights? Prove via cut property.

**Exercise 13:** Draw graph where BFS tree ≠ MST.

**Exercise 14:** $V=1000$, complete graph — Prim with heap: $O(E\\log V)$.`,
  }),

  lesson({
    title: "Shortest Paths: Dijkstra's",
    titleMatch: "Shortest Paths%",
    importance_level: "ADVANCED",
    breadcrumb_path: `${BC} 10`,
    first_principles: [
      "Dijkstra finds shortest paths from a single source in non-negative weighted graphs",
      "Greedy choice: always settle the unsettled vertex with minimum distance",
      "Relaxation updates dist[v] when a shorter path through u is found",
      "Priority queue implementation yields O((V+E) log V)",
      "Negative edge weights break Dijkstra — use Bellman-Ford instead",
    ],
    learning_objectives: [
      "Execute Dijkstra's algorithm step by step on a small graph",
      "Explain relaxation and the greedy invariant",
      "State time complexity with a binary heap",
      "Identify when Dijkstra fails (negative weights)",
      "Relate Dijkstra to GPS routing and network OSPF intuition",
    ],
    content_easy_markdown: `# Shortest Paths — Dijkstra's Algorithm

## Hook: GPS with toll roads
Roads have **costs** (time, distance, tolls). BFS assumes every edge costs 1. **Dijkstra** handles **different non-negative costs** and still finds cheapest routes.

## Core idea (greedy)
Always finalize the **closest unsettled** vertex next — that decision is safe when weights $\\ge 0$.

## Steps
1. $dist[source]=0$, all others $=\\infty$.
2. Priority queue of (distance, vertex).
3. Pop minimum $u$; for each neighbor $v$:
   - **Relax:** if $dist[u]+w(u,v) < dist[v]$, update $dist[v]$.

\`\`\`python
import heapq

def dijkstra(adj, src):  # adj[u] = [(v, weight), ...]
    dist = {src: 0}
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float('inf')):
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist
\`\`\`

## Complexity
With min-heap: **$O((V+E)\\log V)$**.

## Critical constraint
**No negative edge weights.** Counterexample: A→B weight 1, A→C weight 100, C→B weight -200 — greedy picks A→C first and breaks.

## Check yourself
1. Data structure for extracting min distance?
   - Answer: Min-priority queue (heap).
2. Non-negative weights — why required?
   - Answer: Settled vertices must never need revision.
3. Unweighted graph — Dijkstra vs BFS?
   - Answer: Both OK; BFS is simpler ($O(V+E)$).`,
    content_deep_markdown: `# Dijkstra (Deep)

## Invariant
When $u$ is extracted, $dist[u]$ is final (non-negative weights).

## Trace exercise
5-node graph — show $dist[]$ after each extraction.

## Variants
- A* adds heuristic for faster goal-directed search.
- Dial's algorithm for integer weights in small range.

## Practice
**Exercise 14:** Full trace with parent pointers for path reconstruction.

**Exercise 15:** Why Bellman-Ford handles negative edges (with no negative cycles).`,
  }),

  lesson({
    title: "Greedy: Prim & Kruskal",
    titleMatch: "Greedy: Prim%",
    importance_level: "ADVANCED",
    breadcrumb_path: `${BC} 11`,
    first_principles: [
      "Prim grows an MST from a starting vertex using cheapest crossing edges",
      "Kruskal sorts all edges and adds them if they do not form a cycle",
      "Union-Find (Disjoint Set) makes Kruskal's cycle checks nearly O(1)",
      "Both algorithms are greedy and optimal for MST by the cut/cycle properties",
      "Choose Prim for dense graphs, Kruskal for sparse graphs",
    ],
    learning_objectives: [
      "Describe Prim's node-centric and Kruskal's edge-centric strategies",
      "Implement Kruskal with Union-Find for cycle detection",
      "Compare complexities on dense vs sparse graphs",
      "Justify greedy choices using the cut property",
      "Select Prim or Kruskal for a given scenario",
    ],
    content_easy_markdown: `# Greedy MST — Prim & Kruskal

## Hook: Two engineers, one problem
Both build an MST greedily — one grows from a **seed city** (Prim), one sorts **all cables** globally (Kruskal). Same optimal total cost.

## Prim's algorithm (node-centric)
1. Start at any vertex; mark in MST set.
2. Repeat: pick **minimum-weight edge** from MST set to a vertex **outside**.
3. Add that edge and vertex.

**Good for:** dense graphs (many edges) — $O(E\\log V)$ with heap.

## Kruskal's algorithm (edge-centric)
1. Sort edges by weight ascending.
2. For each edge $(u,v)$: add if $u$ and $v$ are in **different components** (no cycle).
3. Use **Union-Find** to track components.

**Good for:** sparse graphs — $O(E\\log E)$.

## Union-Find in one minute
- \`find(x)\` — which component owns $x$?
- \`union(a,b)\` — merge components if different.
- Path compression + rank → nearly $O(1)$ amortized.

## Scenario pick
| Setting | Pick |
|---------|------|
| Desert IoT sensors, few links | **Kruskal** |
| Complete metropolitan mesh | **Prim** |

## Check yourself
1. Why does Kruskal need Union-Find?
   - Answer: Fast cycle check — are endpoints already connected?
2. Both algorithms greedy — why optimal?
   - Answer: Cut property guarantees safe minimum crossing edges.
3. Same MST output if weights unique?
   - Answer: Yes — unique MST.`,
    content_deep_markdown: `# Prim & Kruskal (Deep)

## Complexity comparison
| | Dense $E\\approx V^2$ | Sparse $E\\approx V$ |
|---|---------------------|---------------------|
| Prim | $O(V^2)$ with array | $O(E\\log V)$ |
| Kruskal | $O(E\\log E)$ | $O(E\\log E)$ |

## Practice
**Exercise 16:** Explain Union-Find path compression.

**Exercise 17:** IoT sparse desert — justify Kruskal.

**Exercise 18:** Implement Kruskal on 6-node example; list edges added in order.`,
  }),

  lesson({
    title: "Intro to Dynamic Programming",
    titleMatch: "Intro to Dynamic Programming%",
    importance_level: "ADVANCED",
    breadcrumb_path: `${BC} 12`,
    first_principles: [
      "DP applies when optimal substructure and overlapping subproblems exist",
      "Memoization (top-down) caches recursive results",
      "Tabulation (bottom-up) fills a table iteratively",
      "Pure recursion without caching can be exponential (e.g. naive Fibonacci)",
      "State definition is the hardest and most important DP design step",
    ],
    learning_objectives: [
      "Identify optimal substructure and overlapping subproblems",
      "Contrast memoization and tabulation approaches",
      "Solve 0-1 knapsack with a 2D DP table",
      "Compare Fibonacci call counts: naive vs memoized",
      "Define DP state, transition, and base cases",
    ],
    content_easy_markdown: `# Intro to Dynamic Programming

## Hook: Stop recomputing the same homework
Naive Fibonacci recalculates $Fib(3)$ millions of times. **Dynamic Programming (DP)** writes answers down once and reuses them — recursion with a **memory**.

## Two requirements
1. **Optimal substructure** — optimal solution built from optimal subsolutions.
2. **Overlapping subproblems** — same subproblem appears many times.

## Two implementations
| Style | Direction | Storage |
|-------|-----------|---------|
| **Memoization** | Top-down (recursion + cache) | Hash map / array |
| **Tabulation** | Bottom-up (loops) | Table |

## Fibonacci example
\`\`\`python
def fib_memo(n, memo={}):
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]
\`\`\`
Calls drop from $O(2^n)$ to $O(n)$.

## 0-1 Knapsack intuition
Items have weight & value; capacity $W$. For each item: **take or skip**.
$dp[i][w]$ = best value using first $i$ items at capacity $w$.

## Check yourself
1. What makes DP different from divide-and-conquer?
   - Answer: **Overlapping** subproblems — DC subproblems are disjoint.
2. Fib(10) naive recursive calls vs memo?
   - Answer: Naive ~177 calls; memo ~19.
3. Hardest part of a new DP problem?
   - Answer: Defining the **state** and recurrence.`,
    content_deep_markdown: `# Dynamic Programming (Deep)

## 0-1 Knapsack recurrence
$dp[i][w] = \\max(dp[i-1][w],\\; val_i + dp[i-1][w-wt_i])$ if $wt_i \\le w$.

## Space optimization
Rolling 1D array when transition only needs previous row.

## Practice
**Exercise 18:** Count Fib(10) calls naive vs memo.

**Exercise 19:** Fill knapsack table weights {1,2,3}, values {10,15,40}, capacity 5.

**Exercise 20:** Longest Increasing Subsequence — define $dp[i]$.`,
  }),

  lesson({
    title: "Dynamic Programming: Coin Change",
    titleMatch: "Dynamic Programming: Coin Change%",
    importance_level: "ADVANCED",
    breadcrumb_path: `${BC} 13`,
    first_principles: [
      "Coin change minimizes coins needed to make amount V (unbounded supply)",
      "Greedy fails on arbitrary denominations (e.g. coins 1,3,4 for amount 6)",
      "DP recurrence: dp[i] = min over coins c of (1 + dp[i-c])",
      "Unbounded knapsack structure — each coin reusable",
      "Limited coin supply changes the problem to 0-1 or bounded knapsack",
    ],
    learning_objectives: [
      "Construct a DP table for minimum coin change",
      "Explain when greedy coin change fails",
      "Write the unbounded coin change recurrence",
      "Trace DP for coins {1,3,4} and amount 6",
      "Contrast unbounded vs limited coin variants",
    ],
    content_easy_markdown: `# Dynamic Programming — Coin Change

## Hook: Making change at a weird vending machine
US coins {25,10,5,1} work with greedy "largest first." But coins **{1,3,4}** for amount **6** fool greedy:
- Greedy: $4+1+1$ → **3 coins**
- Optimal: $3+3$ → **2 coins**

## DP formulation
$dp[0]=0$. For amount $i>0$:

$$dp[i] = \\min_{c \\in coins,\\; c \\le i} \\big(1 + dp[i-c]\\big)$$

\`\`\`python
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i and dp[i - c] + 1 < dp[i]:
                dp[i] = dp[i - c] + 1
    return dp[amount] if dp[amount] != float('inf') else -1
\`\`\`

## Trace {1,3,4}, amount 6
| i | dp[i] | chosen |
|---|-------|--------|
| 0 | 0 | — |
| 1 | 1 | 1 |
| 2 | 2 | 1+1 |
| 3 | 1 | 3 |
| 4 | 1 | 4 |
| 5 | 2 | 4+1 |
| 6 | 2 | 3+3 |

## Check yourself
1. Why doesn't greedy always work?
   - Answer: No canonical coin system guarantee for arbitrary denominations.
2. Time complexity?
   - Answer: $O(amount \\times |coins|)$.
3. Limited supply of each coin?
   - Answer: Becomes 0-1 knapsack — different DP table.`,
    content_deep_markdown: `# Coin Change (Deep)

## Reconstructing solution
Track \`parent[i]\` = coin used to reach $i$; backtrack from \`amount\`.

## Count ways vs min coins
Count: $dp[i] += dp[i-c]$ (order matters? adjust loops).

## Practice
**Exercise 20:** Full table trace {1,3,4}, target 6.

**Exercise 21:** Limited supply — modify state to include remaining counts per coin.

**Exercise 22:** Prove DP optimal by induction on amount.`,
  }),

  lesson({
    title: "Complexity Classes: P vs NP",
    titleMatch: "Complexity Classes%",
    importance_level: "MASTER",
    breadcrumb_path: `${BC} 14`,
    first_principles: [
      "P: problems solvable in polynomial time",
      "NP: problems whose YES certificates are verifiable in polynomial time",
      "NP-Complete: hardest problems in NP; solving one in P would collapse NP to P",
      "NP-Hard: at least as hard as NP-complete; may not be in NP",
      "Recognizing NP-complete problems steers engineers toward heuristics and approximations",
    ],
    learning_objectives: [
      "Define P, NP, NP-Complete, and NP-Hard informally and formally",
      "Explain verification vs solving for NP problems",
      "Describe polynomial-time reduction between problems",
      "Identify practical responses when a problem is NP-hard",
      "Discuss implications of P=NP for cryptography (RSA)",
    ],
    content_easy_markdown: `# Complexity Classes — P vs NP

## Hook: Sudoku vs checking Sudoku
Filling a hard Sudoku can take hours. **Checking** a filled grid? Seconds. That gap — hard to **find**, easy to **verify** — is the heart of **NP**.

## The cast
| Class | Plain English | Example |
|-------|---------------|---------|
| **P** | Fast to **solve** | Sorting, shortest path (Dijkstra) |
| **NP** | Fast to **check** a proposed solution | Sudoku, graph coloring, knapsack decision |
| **NP-Complete** | Hardest in NP | SAT, Traveling Salesperson (decision), CLIQUE |
| **NP-Hard** | At least as hard; may not be in NP | Halting problem, optimization TSP |

## The $1M question
Does **P = NP**? If yes, every NP problem has a fast solver — revolution for science (and breaks much of modern encryption). Most experts bet **P ≠ NP**; nobody has proved either way.

## Engineer playbook
If your feature is NP-complete:
- Don't hunt a perfect polynomial algorithm forever.
- Use **heuristics**, **approximations**, **ILP solvers**, or **limits** on input size.

## Reduction in one sentence
Problem A **reduces** to B if a fast solver for B would solve A — used to prove hardness.

## Check yourself
1. Is "verify a Sudoku" in P?
   - Answer: Yes — linear scan of constraints.
2. If you prove SAT is in P, what happens to NP-complete problems?
   - Answer: All NP problems collapse to P (assuming polynomial reductions).
3. Practical response to NP-hard routing at scale?
   - Answer: Approximation algorithms, heuristics, or constraint limits.`,
    content_deep_markdown: `# P vs NP (Deep)

## Formal definitions
- **P:** $\\exists$ TM deciding in $O(n^k)$ for some $k$.
- **NP:** $\\exists$ poly-time verifier $V$ s.t. $x \\in L \\iff \\exists$ cert $c$, $|c|\\le poly(|x|)$, $V(x,c)$ accepts.

## NP-Completeness recipe
1. Show $L \\in NP$.
2. Reduce known NP-complete $L'$ to $L$ in polynomial time.

## Cryptography
RSA security assumes factoring / discrete log are hard (not known NP-complete, but believed not in P).

## Practice
**Exercise 22:** Explain reduction — if A reduces to B and B is easy, then A is easy.

**Exercise 23:** Consequences of P=NP for RSA and password hashing.

**Exercise 24:** Classify: sorting, SAT, halting problem, MST.`,
  }),
];
