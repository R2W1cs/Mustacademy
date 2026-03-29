import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });
import pool from "../config/db.js";

const topics = [
  // ── Unit 1: Foundations ──────────────────────────────────────────────────
  {
    title: "Sets and Set Notation",
    importance_level: "Essential",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "MATH 111 > Unit 1: Foundations",
    first_principles: [
      "A set is an unordered collection of distinct objects — no element appears twice",
      "Two sets are equal if and only if they contain exactly the same elements",
      "The empty set ∅ is a valid set and is a subset of every set"
    ],
    learning_objectives: [
      "Write sets using roster notation and set-builder notation",
      "Identify and apply set operations: union ∪, intersection ∩, difference \\, complement",
      "Determine if two sets are equal, disjoint, or one is a subset of the other",
      "Use Venn diagrams to visualize set relationships"
    ],
    prerequisites: [],
    content_markdown: `## Sets and Set Notation

A **set** is a well-defined collection of distinct objects called **elements** or **members**. Sets are one of the most fundamental structures in all of mathematics — they appear in calculus, logic, programming, databases, and AI.

### Ways to Define a Set

**Roster (Listing) Notation** — list all elements inside curly braces:
\`\`\`
A = {1, 2, 3, 4, 5}
B = {a, e, i, o, u}
\`\`\`

**Set-Builder Notation** — describe the rule elements must satisfy:
\`\`\`
C = {x | x is an even integer and 0 ≤ x ≤ 10}
  = {0, 2, 4, 6, 8, 10}
\`\`\`

### Key Set Operations

| Operation | Symbol | Meaning |
|-----------|--------|---------|
| Union | A ∪ B | all elements in A or B (or both) |
| Intersection | A ∩ B | only elements in both A and B |
| Difference | A \\ B | elements in A but not in B |
| Complement | Aᶜ | elements NOT in A (relative to universal set U) |

### Important Sets in CS and Math

- **ℕ** = {0, 1, 2, 3, …} — natural numbers
- **ℤ** = {…, -2, -1, 0, 1, 2, …} — integers
- **ℚ** = all fractions p/q where q ≠ 0 — rationals
- **ℝ** = all real numbers (rationals + irrationals like √2, π)

### Subset and Equality

- A ⊆ B means every element of A is also in B
- A = B means A ⊆ B and B ⊆ A (they contain exactly the same elements)
- |A| denotes the **cardinality** (size) of set A

### Why This Matters in CS

Every programming language has set-like data structures. Python's \`set\` type directly implements mathematical sets. Database queries use intersection (JOIN), union (UNION), and difference (EXCEPT). Understanding sets makes you a better programmer.`,
    content_easy_markdown: `## Sets and Set Notation — Simple Version

A **set** is just a group of things with no repeats. You write sets with curly braces: \`{1, 2, 3}\`.

**Key operations:**
- **Union (∪)**: combine two sets → {1,2} ∪ {2,3} = {1,2,3}
- **Intersection (∩)**: what's in both → {1,2} ∩ {2,3} = {2}
- **Difference (\\)**: what's in the first but not the second → {1,2} \\ {2,3} = {1}

The symbol ⊆ means "is a subset of" — like {1,2} ⊆ {1,2,3}. Sets are everywhere in CS: Python sets, database queries, and search algorithms all use this idea.`,
    forge_snippet: `# Python sets — direct application of set theory
A = {1, 2, 3, 4, 5}
B = {3, 4, 5, 6, 7}

print(A | B)   # Union:        {1, 2, 3, 4, 5, 6, 7}
print(A & B)   # Intersection: {3, 4, 5}
print(A - B)   # Difference:   {1, 2}
print(A ^ B)   # Symmetric Δ:  {1, 2, 6, 7}

# Set-builder notation equivalent
evens = {x for x in range(11) if x % 2 == 0}
print(evens)   # {0, 2, 4, 6, 8, 10}

# Subset check
print({1, 2}.issubset({1, 2, 3}))  # True`
  },
  {
    title: "Functions and Relations",
    importance_level: "Essential",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "MATH 111 > Unit 1: Foundations",
    first_principles: [
      "A relation maps elements from one set (domain) to elements of another (codomain)",
      "A function is a relation where each input maps to exactly one output — no ambiguity",
      "Functions are the mathematical model for computation — every algorithm is a function"
    ],
    learning_objectives: [
      "Distinguish between a relation and a function",
      "Identify domain, codomain, and range of a function",
      "Determine if a function is injective (one-to-one), surjective (onto), or bijective",
      "Compose two functions and compute f(g(x))"
    ],
    prerequisites: ["Sets and Set Notation"],
    content_markdown: `## Functions and Relations

### What is a Relation?

A **relation** from set A to set B is any set of ordered pairs (a, b) where a ∈ A and b ∈ B. Think of it as a rule that *may* connect elements.

### What Makes Something a Function?

A **function** f: A → B is a relation where every element of A is paired with **exactly one** element of B.

- ✅ Valid function: {(1,a), (2,b), (3,c)} — each input has one output
- ❌ Not a function: {(1,a), (1,b), (2,c)} — input 1 has two outputs

### Key Terminology

| Term | Meaning |
|------|---------|
| **Domain** | The set of all valid inputs (A) |
| **Codomain** | The set outputs *could* come from (B) |
| **Range** | The set of outputs actually *produced* |
| **f(x)** | The output of function f for input x |

### Types of Functions

**Injective (one-to-one):** Different inputs → different outputs
\`\`\`
f(x) = 2x   is injective: f(1)=2, f(2)=4, f(3)=6 — no repeats
\`\`\`

**Surjective (onto):** Every element in the codomain is reached

**Bijective:** Both injective AND surjective — a perfect one-to-one correspondence (enables inverse functions)

### Function Composition

(f ∘ g)(x) = f(g(x)) — apply g first, then f.

If g(x) = x + 1 and f(x) = x², then:
f(g(x)) = f(x+1) = (x+1)²

### Why This Matters in CS

Every function in your code is a mathematical function. Hash maps implement injective functions. Encryption algorithms require bijective functions. Composition is what method chaining does.`,
    content_easy_markdown: `## Functions and Relations — Simple Version

A **function** is a rule that takes each input and gives exactly one output. Like a machine: you put in 3, you get out 9 (if f(x) = x²).

**Three things to know:**
- **Domain**: the allowed inputs
- **Range**: the actual outputs produced
- **f(x)**: notation meaning "function f applied to x"

**Three types:**
- **One-to-one**: different inputs always give different outputs
- **Onto**: every possible output is actually produced
- **Bijective**: both at the same time (perfect pairing)

Functions are the mathematical foundation of programming — every method you write is a function.`,
    forge_snippet: `# Functions as first-class objects in Python
def square(x):
    return x ** 2

def add_one(x):
    return x + 1

# Function composition: f(g(x))
def compose(f, g):
    return lambda x: f(g(x))

square_of_next = compose(square, add_one)
print(square_of_next(3))  # (3+1)² = 16

# Check if a function (dict mapping) is injective
def is_injective(mapping: dict) -> bool:
    return len(mapping.values()) == len(set(mapping.values()))

f = {1: 'a', 2: 'b', 3: 'c'}
g = {1: 'a', 2: 'a', 3: 'c'}  # not injective
print(is_injective(f))  # True
print(is_injective(g))  # False`
  },
  {
    title: "Domain, Range, and Mappings",
    importance_level: "Essential",
    estimated_time: "45 mins",
    estimated_time_minutes: 45,
    breadcrumb_path: "MATH 111 > Unit 1: Foundations",
    first_principles: [
      "The domain defines what inputs are legally allowed — undefined inputs cause functions to break",
      "The range is what actually gets produced — it may be smaller than the codomain",
      "Understanding mappings prevents division-by-zero and null pointer errors in real code"
    ],
    learning_objectives: [
      "Find the natural domain of algebraic, radical, and rational functions",
      "Determine the range from a graph or formula",
      "Represent mappings visually with arrow diagrams",
      "Identify restrictions that make a function valid"
    ],
    prerequisites: ["Functions and Relations"],
    content_markdown: `## Domain, Range, and Mappings

### Domain: What Inputs Are Allowed?

The **natural domain** is the largest set of inputs for which a function is defined:

| Function | Restriction | Domain |
|----------|-------------|--------|
| f(x) = 1/x | x ≠ 0 (no division by zero) | ℝ \\ {0} |
| f(x) = √x | x ≥ 0 (no negative under root) | [0, ∞) |
| f(x) = ln(x) | x > 0 | (0, ∞) |
| f(x) = x² | None | ℝ |

### Range: What Outputs Are Produced?

The **range** (or image) is the set of all actual outputs:
- f(x) = x² has range [0, ∞) — squares are never negative
- f(x) = sin(x) has range [-1, 1]
- f(x) = 2x + 1 has range ℝ — any real number is possible

### Finding Range Strategies

1. **Algebraic**: solve y = f(x) for x, see what values of y work
2. **Graphical**: look at the vertical extent of the graph
3. **Known rules**: memorize common function ranges

### Arrow Diagrams

Mappings can be drawn as arrows from domain elements to range elements:
\`\`\`
Domain      Range
   1  ──→  "one"
   2  ──→  "two"
   3  ──→  "three"
\`\`\`

### CS Connection

In programming, every function has an implicit domain (valid inputs) and range (possible return values). Type systems enforce domain restrictions at compile time. Runtime errors (null pointer, index out of bounds) happen when you violate domain constraints.`,
    content_easy_markdown: `## Domain, Range, and Mappings — Simple Version

**Domain**: what you're allowed to put into a function. For f(x) = 1/x, you can't use x=0 because you can't divide by zero. So the domain is "all numbers except 0."

**Range**: what actually comes out. For f(x) = x², you always get non-negative numbers, so the range is [0, ∞).

**Tip**: Always ask "what inputs would break this?" to find domain restrictions. This habit prevents bugs in your programs too.`,
    forge_snippet: `import math

def safe_sqrt(x):
    """Domain: x >= 0. Raises ValueError otherwise."""
    if x < 0:
        raise ValueError(f"Domain error: sqrt({x}) undefined for negative numbers")
    return math.sqrt(x)

def safe_divide(a, b):
    """Domain: b != 0."""
    if b == 0:
        raise ZeroDivisionError("Domain error: division by zero")
    return a / b

# Find range of a function numerically
def estimate_range(f, domain_sample):
    return {round(f(x), 4) for x in domain_sample}

sample = [x / 10 for x in range(-50, 51)]
print(estimate_range(lambda x: x**2, sample))  # All non-negative values`
  },
  {
    title: "Number Systems (ℕ, ℤ, ℚ, ℝ, ℂ)",
    importance_level: "Essential",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "MATH 111 > Unit 1: Foundations",
    first_principles: [
      "Number systems are nested: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ — each extends the previous",
      "Each system was invented to solve problems the previous one couldn't handle",
      "The choice of number system determines what operations are valid and what answers look like"
    ],
    learning_objectives: [
      "Classify any number as natural, integer, rational, irrational, or real",
      "Prove that √2 is irrational using proof by contradiction",
      "Identify when a mathematical operation requires a larger number system",
      "Understand why computers use floating-point approximations for ℝ"
    ],
    prerequisites: ["Sets and Set Notation"],
    content_markdown: `## Number Systems

Mathematics has built increasingly powerful number systems, each solving limitations of the previous.

### The Hierarchy

**Natural Numbers ℕ = {0, 1, 2, 3, …}**
- Good for counting
- Problem: can't solve x + 5 = 3 (need negative numbers)

**Integers ℤ = {…, -2, -1, 0, 1, 2, …}**
- Adds negatives
- Problem: can't solve 2x = 3 (need fractions)

**Rational Numbers ℚ = {p/q | p,q ∈ ℤ, q ≠ 0}**
- All fractions; terminate or repeat as decimals: 1/3 = 0.333…
- Problem: √2 can't be expressed as p/q (proven by contradiction)

**Irrational Numbers** — cannot be written as p/q
- Examples: √2, π, e, √3
- They have infinite non-repeating decimals

**Real Numbers ℝ = ℚ ∪ irrationals**
- Every point on the number line
- Problem: can't solve x² = -1 (need imaginary numbers)

**Complex Numbers ℂ = {a + bi | a,b ∈ ℝ, i² = -1}**
- Used in signal processing, quantum mechanics, electrical engineering

### Proof That √2 is Irrational (Classic)

Assume √2 = p/q in lowest terms. Then 2 = p²/q², so p² = 2q². This means p² is even, so p is even. Write p = 2k. Then (2k)² = 2q², so 4k² = 2q², so q² = 2k², meaning q is also even. But then p and q share factor 2 — contradiction with "lowest terms." Therefore √2 ∉ ℚ.

### CS Implication

Computers store numbers as integers (int) or floating-point (float). Floats approximate real numbers — they cannot represent most irrational numbers exactly. This is why \`0.1 + 0.2 != 0.3\` in Python.`,
    content_easy_markdown: `## Number Systems — Simple Version

Numbers come in families, from simple to complex:
- **ℕ** (Natural): 0, 1, 2, 3… (counting numbers)
- **ℤ** (Integers): …-2, -1, 0, 1, 2… (adds negatives)
- **ℚ** (Rational): fractions like 1/2, 3/4
- **ℝ** (Real): all numbers on a number line, including π and √2
- **ℂ** (Complex): includes imaginary numbers like √-1

**Key fact for CS**: Computers can't store irrational numbers exactly. That's why floating-point arithmetic sometimes surprises you.`,
    forge_snippet: `# Number system quirks in Python
import math
from fractions import Fraction

# Float imprecision (ℝ approximated by finite binary)
print(0.1 + 0.2)           # 0.30000000000000004 (not 0.3!)
print(0.1 + 0.2 == 0.3)    # False!

# Rational arithmetic (exact)
a = Fraction(1, 10)
b = Fraction(2, 10)
print(a + b)                # 3/10 — exact!
print(a + b == Fraction(3, 10))  # True

# Irrational: approximated
print(math.sqrt(2))         # 1.4142135623730951 (approximation)
print(math.sqrt(2)**2)      # 2.0000000000000004 (not exactly 2)

# Complex numbers (built-in)
z = 3 + 4j
print(abs(z))               # 5.0 (distance from origin)`
  },
  {
    title: "Mathematical Logic and Proof Techniques",
    importance_level: "Essential",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "MATH 111 > Unit 1: Foundations",
    first_principles: [
      "A proposition is a statement that is either true or false — no ambiguity",
      "Logical connectives (AND, OR, NOT, IMPLIES) combine propositions into compound statements",
      "A valid proof is a sequence of logically justified steps from known truths to a conclusion"
    ],
    learning_objectives: [
      "Evaluate truth tables for AND, OR, NOT, and implication (→)",
      "Identify the converse, contrapositive, and inverse of an implication",
      "Write a direct proof and a proof by contradiction",
      "Recognize when an argument is logically valid vs. invalid"
    ],
    prerequisites: ["Sets and Set Notation"],
    content_markdown: `## Mathematical Logic and Proof Techniques

### Propositions and Connectives

A **proposition** is a statement with a definite truth value (T or F).

| Symbol | Name | Meaning |
|--------|------|---------|
| ¬P | NOT P | negation |
| P ∧ Q | P AND Q | both must be true |
| P ∨ Q | P OR Q | at least one true |
| P → Q | P implies Q | if P then Q |
| P ↔ Q | P iff Q | both directions |

### Critical: What P → Q Really Means

"If P then Q" is FALSE only when P is true but Q is false. The implication holds vacuously when P is false.

| P | Q | P → Q |
|---|---|-------|
| T | T | T |
| T | F | **F** |
| F | T | T |
| F | F | T |

### Related Statements

Given "If P then Q":
- **Converse**: If Q then P (not equivalent!)
- **Contrapositive**: If ¬Q then ¬P (equivalent to original)
- **Inverse**: If ¬P then ¬Q (not equivalent!)

### Proof Techniques

**Direct Proof**: Assume P, derive Q through logical steps.
> Claim: If n is even, then n² is even.
> Proof: Let n = 2k. Then n² = 4k² = 2(2k²), which is even. ∎

**Proof by Contradiction**: Assume ¬Q, show it leads to contradiction.
> Claim: √2 is irrational.
> Proof: Assume √2 = p/q (lowest terms)… (see Number Systems topic).

**Proof by Contrapositive**: Prove ¬Q → ¬P instead.

### CS Connection

Boolean logic is the foundation of ALL computer hardware. Every if-statement, AND gate, OR gate, and search algorithm is built on this logic. Understanding implications helps you write correct conditional code.`,
    content_easy_markdown: `## Logic and Proof — Simple Version

**Logic** is about combining true/false statements.

The most important connective for CS: **P → Q** (if P then Q). This is FALSE only when P is true but Q is false. If P is false, the implication is vacuously true.

**Two key proof methods:**
1. **Direct**: Start from what you know, step by step to what you want to show
2. **Contradiction**: Assume the opposite is true, show it leads to nonsense

Boolean logic (AND, OR, NOT) is literally how computer chips work. Every if-statement you write is formal logic.`,
    forge_snippet: `# Boolean logic in Python mirrors mathematical logic
P = True
Q = False

# Connectives
print(P and Q)   # P ∧ Q = False
print(P or Q)    # P ∨ Q = True
print(not P)     # ¬P    = False

# Implication: P → Q is False only when P=T and Q=F
def implies(p, q):
    return (not p) or q

print(implies(True, False))   # False (the only false case)
print(implies(False, False))  # True (vacuously true)
print(implies(True, True))    # True

# Truth table generator
print("P  | Q  | P→Q")
for p in [True, False]:
    for q in [True, False]:
        print(f"{p!s:5} | {q!s:5} | {implies(p,q)!s:5}")`
  },
  {
    title: "Mathematical Induction",
    importance_level: "Essential",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "MATH 111 > Unit 1: Foundations",
    first_principles: [
      "Induction proves a statement for ALL natural numbers by using two steps: base and recursive",
      "If you can show (1) it works for n=1, and (2) whenever it works for n it works for n+1, it works for ALL n",
      "Induction is the mathematical analog of recursive algorithms"
    ],
    learning_objectives: [
      "Write a complete proof by mathematical induction for summation formulas",
      "Identify the base case and inductive step in a proof",
      "Explain the connection between induction and recursive programs",
      "Apply strong induction where needed"
    ],
    prerequisites: ["Mathematical Logic and Proof Techniques"],
    content_markdown: `## Mathematical Induction

Mathematical induction is one of the most powerful proof techniques in CS mathematics. It proves a statement P(n) holds for all natural numbers n ≥ 1.

### The Two Steps

**Step 1 — Base Case**: Prove P(1) is true.

**Step 2 — Inductive Step**: Assume P(k) is true (inductive hypothesis), then prove P(k+1) is also true.

### Classic Example: Sum Formula

**Claim**: 1 + 2 + 3 + … + n = n(n+1)/2

**Base case** (n=1): Left side = 1. Right side = 1·2/2 = 1. ✓

**Inductive step**: Assume 1+2+…+k = k(k+1)/2. Show the formula holds for k+1:
\`\`\`
1 + 2 + … + k + (k+1)
= k(k+1)/2 + (k+1)         [by inductive hypothesis]
= (k+1)[k/2 + 1]
= (k+1)(k+2)/2              [which is the formula for n = k+1] ✓
\`\`\`

### Why This Works

Think of dominoes in a line. Knocking down domino 1 (base case) + knowing each domino knocks over the next (inductive step) means ALL dominoes fall.

### Strong Induction

Sometimes you need to assume P holds for ALL values up to k (not just k) to prove P(k+1). This is **strong induction** — same validity, just a stronger hypothesis.

### Connection to Recursion

A recursive function IS induction:
- Base case in recursion = base case in induction
- Recursive call = inductive step

Every recursive algorithm has an implicit inductive proof of correctness.`,
    content_easy_markdown: `## Mathematical Induction — Simple Version

Induction proves something is true for ALL numbers using just two steps:
1. Show it's true for n=1 (the starting domino falls)
2. Show that if it's true for n=k, it must also be true for n=k+1 (each domino knocks over the next)

**Example**: To prove 1+2+…+n = n(n+1)/2:
- Check n=1: 1 = 1·2/2 ✓
- Assume it works for k, add (k+1) to both sides, and simplify to show it works for k+1 ✓

**Key insight for CS**: Recursion is basically running an inductive proof backwards.`,
    forge_snippet: `# Induction in action: verifying the sum formula
def sum_direct(n):
    """Compute sum 1..n directly."""
    return sum(range(1, n + 1))

def sum_formula(n):
    """Compute sum 1..n using the inductive formula."""
    return n * (n + 1) // 2

# Verify for first 1000 values (like checking every inductive step)
for n in range(1, 1001):
    assert sum_direct(n) == sum_formula(n), f"Failed at n={n}"
print("Sum formula verified for n=1 to 1000 ✓")

# Recursive sum — the function IS the inductive proof
def recursive_sum(n):
    if n == 1:          # Base case: P(1)
        return 1
    return n + recursive_sum(n - 1)  # Inductive step: assume P(n-1)

print(recursive_sum(100))   # 5050`
  },

  // ── Unit 2: Calculus ──────────────────────────────────────────────────────
  {
    title: "Limits and Continuity",
    importance_level: "Essential",
    estimated_time: "70 mins",
    estimated_time_minutes: 70,
    breadcrumb_path: "MATH 111 > Unit 2: Calculus",
    first_principles: [
      "A limit describes the behavior of a function as input approaches a value — not the value AT that point",
      "Continuity means there are no jumps, holes, or breaks in the function's graph",
      "All of calculus (derivatives and integrals) is built on the concept of limits"
    ],
    learning_objectives: [
      "Evaluate limits algebraically using limit laws and factoring",
      "Apply L'Hôpital's Rule for 0/0 and ∞/∞ indeterminate forms",
      "Determine continuity at a point using the three-part definition",
      "Find one-sided limits and identify removable vs. non-removable discontinuities"
    ],
    prerequisites: ["Functions and Relations", "Domain, Range, and Mappings"],
    content_markdown: `## Limits and Continuity

### What is a Limit?

lim[x→a] f(x) = L means: as x gets arbitrarily close to a (but not equal), f(x) gets arbitrarily close to L.

### Computing Limits

**Direct substitution**: Try plugging in a. If defined, you're done.
\`\`\`
lim[x→3] (x² + 1) = 9 + 1 = 10
\`\`\`

**Factoring for 0/0 forms**:
\`\`\`
lim[x→2] (x²-4)/(x-2) = lim (x+2)(x-2)/(x-2) = lim (x+2) = 4
\`\`\`

**L'Hôpital's Rule**: If limit is 0/0 or ∞/∞, differentiate numerator and denominator separately.

### Limit Laws

If lim f(x) = L and lim g(x) = M, then:
- lim [f(x) + g(x)] = L + M
- lim [f(x)·g(x)] = L·M
- lim [f(x)/g(x)] = L/M (if M ≠ 0)

### Continuity

f is **continuous at a** if ALL THREE hold:
1. f(a) is defined
2. lim[x→a] f(x) exists
3. lim[x→a] f(x) = f(a)

### Types of Discontinuity

- **Removable**: a hole (limit exists but doesn't equal f(a))
- **Jump**: left and right limits differ
- **Infinite**: function goes to ±∞

### Why Limits Matter in Algorithms

Big-O notation (algorithm complexity) is really about limits — how does runtime "approach" as input grows to infinity? lim[n→∞] f(n)/g(n) determines which grows faster.`,
    content_easy_markdown: `## Limits — Simple Version

A **limit** asks: what value does f(x) get close to as x approaches some number?

Example: lim[x→2] x² = 4, because as x gets close to 2, x² gets close to 4.

**Continuity** means the graph has no jumps or holes. A function is continuous if you can draw it without lifting your pen.

Limits are the foundation of all calculus — derivatives and integrals are both defined using limits.`,
    forge_snippet: `import numpy as np

# Numerically verify a limit
def numerical_limit(f, a, h=1e-8):
    """Estimate lim[x→a] f(x) by evaluating close to a."""
    return (f(a + h) + f(a - h)) / 2

# Example: lim[x→2] (x²-4)/(x-2) should be 4
f = lambda x: (x**2 - 4) / (x - 2)
print(numerical_limit(f, 2))   # ≈ 4.0

# Squeeze theorem illustration
import matplotlib.pyplot as plt
x = np.linspace(-0.5, 0.5, 1000)
x = x[x != 0]   # exclude 0
y = x * np.sin(1/x)   # oscillates between -x and x

# lim[x→0] x*sin(1/x) = 0 (squeezed between -|x| and |x|)
print(numerical_limit(lambda x: x * np.sin(1/x), 0.0001))  # ≈ 0`
  },
  {
    title: "Rules of Differentiation",
    importance_level: "Essential",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "MATH 111 > Unit 2: Calculus",
    first_principles: [
      "The derivative measures instantaneous rate of change — slope at a single point",
      "Differentiation rules are shortcuts derived from the limit definition f'(x) = lim[h→0] (f(x+h)-f(x))/h",
      "Derivatives are linear operators: d/dx[af + bg] = af' + bg'"
    ],
    learning_objectives: [
      "Apply the power, product, quotient, and chain rules correctly",
      "Differentiate polynomial, exponential, logarithmic, and trigonometric functions",
      "Find second and higher-order derivatives",
      "Interpret the derivative as slope and rate of change in context"
    ],
    prerequisites: ["Limits and Continuity"],
    content_markdown: `## Rules of Differentiation

The derivative f'(x) measures how fast f changes at x.

### Core Rules

| Rule | Formula |
|------|---------|
| Power Rule | d/dx[xⁿ] = nxⁿ⁻¹ |
| Constant | d/dx[c] = 0 |
| Sum | d/dx[f+g] = f'+g' |
| Product | d/dx[fg] = f'g + fg' |
| Quotient | d/dx[f/g] = (f'g - fg')/g² |
| Chain | d/dx[f(g(x))] = f'(g(x))·g'(x) |

### Common Derivatives

| f(x) | f'(x) |
|------|-------|
| xⁿ | nxⁿ⁻¹ |
| eˣ | eˣ |
| ln(x) | 1/x |
| sin(x) | cos(x) |
| cos(x) | -sin(x) |
| tan(x) | sec²(x) |

### Examples

**Power Rule**: d/dx[x³] = 3x²

**Product Rule**: d/dx[x²·sin(x)] = 2x·sin(x) + x²·cos(x)

**Chain Rule**: d/dx[sin(x²)] = cos(x²)·2x

### CS Applications

- **Gradient descent** (machine learning) uses derivatives to minimize loss functions
- **Numerical solvers** use Newton's method: xₙ₊₁ = xₙ - f(xₙ)/f'(xₙ)
- **Physics engines** use derivatives of position (velocity) and velocity (acceleration)`,
    content_easy_markdown: `## Derivatives — Simple Version

A **derivative** tells you the slope of a curve at any point — how fast it's changing.

**Power rule**: d/dx[xⁿ] = nxⁿ⁻¹

Examples:
- d/dx[x³] = 3x²
- d/dx[x⁵] = 5x⁴
- d/dx[7] = 0 (constants have zero slope)

**Why CS cares**: Machine learning trains neural networks using gradients (derivatives). Every time you train an AI model, derivatives are being computed millions of times.`,
    forge_snippet: `# Symbolic differentiation with sympy
from sympy import symbols, diff, sin, cos, exp, ln, simplify

x = symbols('x')

# Power rule
print(diff(x**3, x))           # 3*x**2

# Product rule: d/dx[x² · sin(x)]
print(diff(x**2 * sin(x), x))  # 2*x*sin(x) + x**2*cos(x)

# Chain rule: d/dx[sin(x²)]
print(diff(sin(x**2), x))      # 2*x*cos(x**2)

# Gradient descent step (numerical)
def gradient_descent(f_prime, x0, lr=0.01, steps=100):
    x = x0
    for _ in range(steps):
        x -= lr * f_prime(x)
    return x

# Minimize f(x) = x² → f'(x) = 2x → minimum at x=0
minimum = gradient_descent(lambda x: 2*x, x0=10.0)
print(f"Minimum found at x = {minimum:.6f}")  # ≈ 0`
  },
  {
    title: "Chain Rule and Implicit Differentiation",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "MATH 111 > Unit 2: Calculus",
    first_principles: [
      "The chain rule handles composed functions: the rate of change of the outer function times the rate of change of the inner",
      "Implicit differentiation works when y can't be isolated — differentiate both sides treating y as a function of x",
      "Both are direct consequences of the chain rule"
    ],
    learning_objectives: [
      "Apply the chain rule to multi-layered compositions",
      "Perform implicit differentiation to find dy/dx",
      "Find the slope of a curve defined implicitly (e.g., circle, ellipse)",
      "Connect chain rule to backpropagation in neural networks"
    ],
    prerequisites: ["Rules of Differentiation"],
    content_markdown: `## Chain Rule and Implicit Differentiation

### Chain Rule

For composed functions h(x) = f(g(x)):
\`\`\`
h'(x) = f'(g(x)) · g'(x)
\`\`\`
"Derivative of outer (leaving inner unchanged) times derivative of inner."

**Example**: d/dx[sin(x³)] = cos(x³) · 3x²

**Multi-layer**: d/dx[e^(sin(x²))] = e^(sin(x²)) · cos(x²) · 2x

### Implicit Differentiation

When y is defined implicitly by an equation (like a circle x² + y² = r²), you can't isolate y. Instead, differentiate both sides with respect to x, treating y as a function of x.

**Example**: Find dy/dx for x² + y² = 25.
\`\`\`
d/dx[x²] + d/dx[y²] = d/dx[25]
2x + 2y·(dy/dx) = 0
dy/dx = -x/y
\`\`\`

This gives the slope of the circle at any point (x, y).

### Why Chain Rule Dominates ML

Backpropagation (how neural networks learn) is literally the chain rule applied layer by layer. Given loss L = f(g(h(x))):
\`\`\`
dL/dx = (dL/df) · (df/dg) · (dg/dh) · (dh/dx)
\`\`\`
Each layer multiplies by its local derivative.`,
    content_easy_markdown: `## Chain Rule — Simple Version

The **chain rule** handles functions inside functions:

If h(x) = f(g(x)), then h'(x) = f'(g(x)) · g'(x)

Think of it as: "derivative of outside × derivative of inside"

**Example**: d/dx[sin(x²)] = cos(x²) · 2x

**Implicit differentiation** lets you find slopes for curves where you can't isolate y — like circles. Differentiate both sides and solve for dy/dx.

This is one of the most important topics in ML — backpropagation is just the chain rule applied to a neural network.`,
    forge_snippet: `from sympy import symbols, diff, sin, exp, sqrt, Eq, Function, solve

x, y = symbols('x y')

# Chain rule examples
print(diff(sin(x**3), x))           # 3*x**2*cos(x**3)
print(diff(exp(sin(x**2)), x))       # 2*x*cos(x**2)*exp(sin(x**2))

# Implicit differentiation: x² + y² = 25
# Treat y as function of x: y(x)
y_func = Function('y')
equation = x**2 + y_func(x)**2 - 25
deriv = diff(equation, x)
print(deriv)          # 2*x + 2*y(x)*Derivative(y(x), x)

# Backprop analogy: chain rule through 3 layers
def forward(x):
    h1 = x ** 2        # layer 1
    h2 = sin(h1)       # layer 2 (sympy)
    loss = h2 ** 2     # layer 3
    return loss

loss = forward(x)
print(diff(loss, x))  # full chain rule computed symbolically`
  },
  {
    title: "Applications of Derivatives",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "MATH 111 > Unit 2: Calculus",
    first_principles: [
      "A derivative of zero at a point indicates a critical point — a candidate for max or min",
      "The second derivative tests concavity: positive means concave up (cup shape), negative means concave down",
      "Increasing/decreasing behavior is determined entirely by the sign of the first derivative"
    ],
    learning_objectives: [
      "Find and classify critical points using the first and second derivative tests",
      "Determine intervals of increase/decrease and concavity",
      "Sketch the graph of a function using derivative information",
      "Apply the Mean Value Theorem"
    ],
    prerequisites: ["Rules of Differentiation", "Chain Rule and Implicit Differentiation"],
    content_markdown: `## Applications of Derivatives

### Increasing and Decreasing

- f'(x) > 0 on an interval → f is **increasing** there
- f'(x) < 0 on an interval → f is **decreasing** there
- f'(x) = 0 → **critical point** (possible local max/min)

### First Derivative Test

At a critical point c:
- If f' changes + to −: **local maximum**
- If f' changes − to +: **local minimum**

### Second Derivative Test

At a critical point c where f'(c) = 0:
- f''(c) > 0: **local minimum** (concave up)
- f''(c) < 0: **local maximum** (concave down)
- f''(c) = 0: inconclusive

### Concavity and Inflection Points

- f''(x) > 0: concave **up** (∪ shape)
- f''(x) < 0: concave **down** (∩ shape)
- Where f'' changes sign: **inflection point**

### Mean Value Theorem

If f is continuous on [a,b] and differentiable on (a,b), then there exists c in (a,b) such that:
\`\`\`
f'(c) = (f(b) - f(a)) / (b - a)
\`\`\`
"At some point, the instantaneous rate of change equals the average rate of change."

### Optimization Preview

Finding maxima/minima by setting f'(x) = 0 is the core of optimization — used in machine learning loss minimization, economics, and engineering.`,
    content_easy_markdown: `## Applications of Derivatives — Simple Version

Derivatives tell you about the shape of a function:
- **f'(x) > 0**: function is going UP
- **f'(x) < 0**: function is going DOWN
- **f'(x) = 0**: a flat point (possible peak or valley)

To find peaks and valleys, solve f'(x) = 0, then use f''(x) to check:
- f''(x) > 0: you're at a minimum (valley)
- f''(x) < 0: you're at a maximum (peak)

This is the math behind machine learning — every AI model trains by finding where the loss function is minimized.`,
    forge_snippet: `import numpy as np
import matplotlib.pyplot as plt

# f(x) = x³ - 3x + 2
def f(x): return x**3 - 3*x + 2
def f_prime(x): return 3*x**2 - 3
def f_double_prime(x): return 6*x

# Find critical points: f'(x) = 0 → 3x²-3=0 → x=±1
critical_x = [-1, 1]
for c in critical_x:
    fpp = f_double_prime(c)
    if fpp > 0:
        print(f"x={c}: LOCAL MINIMUM, f({c})={f(c)}")
    else:
        print(f"x={c}: LOCAL MAXIMUM, f({c})={f(c)}")

# Gradient descent to find minimum numerically
x = 5.0
lr = 0.01
for _ in range(500):
    x -= lr * f_prime(x)
print(f"Gradient descent found minimum near x = {x:.4f}")  # ≈ 1.0`
  },
  {
    title: "Optimization Problems",
    importance_level: "Advanced",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "MATH 111 > Unit 2: Calculus",
    first_principles: [
      "Optimization means finding the input that produces the maximum or minimum output",
      "Every optimization problem reduces to: set derivative equal to zero, solve, verify",
      "Real-world constraints shrink the feasible domain — always check boundary points too"
    ],
    learning_objectives: [
      "Set up and solve applied optimization problems (area, volume, distance, cost)",
      "Apply the constraint equation to reduce a function to one variable",
      "Verify solutions are global (not just local) extrema on a closed interval",
      "Recognize optimization as the core of machine learning training"
    ],
    prerequisites: ["Applications of Derivatives"],
    content_markdown: `## Optimization Problems

### The Framework

Every optimization problem follows the same recipe:
1. **Identify** what to maximize/minimize (the **objective function**)
2. **Identify** constraints (equations that restrict variables)
3. **Express** the objective in terms of one variable using the constraint
4. **Differentiate**, set equal to zero, solve
5. **Verify** with second derivative test or comparison

### Classic Example

**Problem**: Maximize the area of a rectangle with perimeter 40.

**Setup**:
- Objective: A = xy (maximize area)
- Constraint: 2x + 2y = 40 → y = 20 - x

**Substitute**: A(x) = x(20-x) = 20x - x²

**Differentiate**: A'(x) = 20 - 2x = 0 → x = 10

**Solution**: x = y = 10 (a square), A = 100

**Verify**: A''(x) = -2 < 0 → this is a maximum ✓

### Closed Interval Method

On [a,b]: find critical points + evaluate endpoints. The largest value is the absolute max, smallest is absolute min.

### Why This Is Everywhere in CS

- **ML training**: minimize loss function over millions of parameters
- **Compression**: maximize compression ratio subject to quality constraints
- **Network routing**: minimize latency subject to bandwidth constraints
- **Game AI**: maximize score subject to legal move constraints

Every optimization algorithm (Adam, SGD, L-BFGS) is solving a calculus optimization problem.`,
    content_easy_markdown: `## Optimization — Simple Version

**Optimization** means finding the best value — either the max or the min.

**Steps:**
1. Write an equation for what you want to optimize
2. Use any constraints to reduce to one variable
3. Take the derivative, set it to 0, solve
4. Check it's actually a max/min using f''

**Classic example**: Maximize a rectangle's area with fixed perimeter → turns out a square is always optimal.

Machine learning literally does this — it finds the model parameters that minimize the error (loss) on training data.`,
    forge_snippet: `from scipy.optimize import minimize_scalar, minimize
import numpy as np

# Classic: maximize area of rectangle with perimeter = 40
# A(x) = x(20-x) — maximize means minimize negative
result = minimize_scalar(lambda x: -(x * (20 - x)), bounds=(0, 20), method='bounded')
print(f"Optimal x = {result.x:.2f}, max area = {-result.fun:.2f}")  # x=10, area=100

# Multi-variable: minimize f(x,y) = x² + y² + 2x - 4y
def objective(params):
    x, y = params
    return x**2 + y**2 + 2*x - 4*y

result2 = minimize(objective, x0=[0, 0], method='BFGS')
print(f"Minimum at ({result2.x[0]:.2f}, {result2.x[1]:.2f})")  # (-1, 2)

# Neural network style: gradient descent on a simple loss
loss = lambda w: (w - 3)**2 + 1   # minimum at w=3
w = 10.0
for _ in range(1000):
    grad = 2 * (w - 3)
    w -= 0.01 * grad
print(f"Converged to w = {w:.6f}")  # ≈ 3.0`
  },
  {
    title: "Antiderivatives and Indefinite Integrals",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "MATH 111 > Unit 2: Calculus",
    first_principles: [
      "An antiderivative F(x) of f(x) satisfies F'(x) = f(x) — integration reverses differentiation",
      "Because any constant disappears when differentiated, antiderivatives have +C",
      "Integration asks: what function, when differentiated, gives me this?"
    ],
    learning_objectives: [
      "Compute antiderivatives of polynomials, exponentials, and trigonometric functions",
      "Apply the power rule for integration, substitution (u-sub), and integration by parts",
      "Understand why +C is necessary in indefinite integrals",
      "Verify antiderivatives by differentiating"
    ],
    prerequisites: ["Rules of Differentiation"],
    content_markdown: `## Antiderivatives and Indefinite Integrals

### Definition

F(x) is an **antiderivative** of f(x) if F'(x) = f(x).

The **indefinite integral** collects all antiderivatives: ∫f(x)dx = F(x) + C

### Basic Integration Rules

| f(x) | ∫f(x)dx |
|------|---------|
| xⁿ (n≠-1) | xⁿ⁺¹/(n+1) + C |
| 1/x | ln|x| + C |
| eˣ | eˣ + C |
| sin(x) | -cos(x) + C |
| cos(x) | sin(x) + C |
| k (constant) | kx + C |

### U-Substitution

Used for composite integrands. Let u = inner function:
\`\`\`
∫ 2x · cos(x²) dx
Let u = x², du = 2x dx
= ∫ cos(u) du = sin(u) + C = sin(x²) + C
\`\`\`

### Integration by Parts

For products: ∫u dv = uv - ∫v du

Choose u = something that simplifies when differentiated.

### Verification

Always verify by differentiating your answer back to the integrand.

### CS Connection

Numerical integration (computing definite integrals approximately) is essential in:
- Probability and statistics (computing areas under PDFs)
- Signal processing (convolution)
- Physics simulations`,
    content_easy_markdown: `## Antiderivatives — Simple Version

An **antiderivative** is the reverse of a derivative. If f'(x) = 2x, then f(x) = x² (+ C).

**Power rule for integration**: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C

The **+C** is always there because constants disappear when you differentiate, so you can't recover them.

**Trick**: Always check your answer by differentiating — you should get back what you started with.`,
    forge_snippet: `from sympy import symbols, integrate, sin, cos, exp, ln

x = symbols('x')

# Basic rules
print(integrate(x**3, x))          # x**4/4
print(integrate(exp(x), x))        # exp(x)
print(integrate(1/x, x))           # log(x) [sympy uses log for ln]
print(integrate(cos(x), x))        # sin(x)

# U-substitution: ∫ 2x·cos(x²) dx
print(integrate(2*x * cos(x**2), x))   # sin(x**2)

# Verify by differentiating
from sympy import diff
result = integrate(x**4 - 3*x**2 + x, x)
print(result)                      # x**5/5 - x**3 + x**2/2
print(diff(result, x))             # x**4 - 3*x**2 + x ✓`
  },
  {
    title: "Definite Integrals and the Fundamental Theorem of Calculus",
    importance_level: "Advanced",
    estimated_time: "70 mins",
    estimated_time_minutes: 70,
    breadcrumb_path: "MATH 111 > Unit 2: Calculus",
    first_principles: [
      "A definite integral computes the net signed area between a function and the x-axis over [a,b]",
      "The Fundamental Theorem connects differentiation and integration — they are inverse operations",
      "FTC Part 2 gives the computation shortcut: ∫[a,b] f(x)dx = F(b) - F(a)"
    ],
    learning_objectives: [
      "Evaluate definite integrals using the Fundamental Theorem of Calculus Part 2",
      "Interpret definite integrals as areas, net change, and accumulation",
      "Apply properties of definite integrals (linearity, interval reversal)",
      "Compute numerical integrals using the trapezoidal rule"
    ],
    prerequisites: ["Antiderivatives and Indefinite Integrals", "Limits and Continuity"],
    content_markdown: `## Definite Integrals and the Fundamental Theorem

### What is a Definite Integral?

∫[a,b] f(x) dx = signed area between f and x-axis from a to b.

- Areas above x-axis count **positive**
- Areas below count **negative**

### FTC Part 1

If F(x) = ∫[a,x] f(t)dt, then F'(x) = f(x).
"Differentiation undoes integration."

### FTC Part 2 (The Computation Tool)

∫[a,b] f(x)dx = F(b) - F(a), where F is ANY antiderivative of f.

**Example**: ∫[0,3] x² dx = [x³/3]₀³ = 27/3 - 0 = 9

### Properties

- ∫[a,a] f = 0
- ∫[a,b] f = -∫[b,a] f
- ∫[a,b] (f+g) = ∫f + ∫g
- ∫[a,b] f = ∫[a,c] f + ∫[c,b] f

### Interpretation: Net Change

∫[a,b] v(t) dt = net displacement (where v(t) is velocity)
∫[a,b] |v(t)| dt = total distance traveled

### Numerical Integration

For functions without closed-form antiderivatives, use:
- **Trapezoidal Rule**: approximate area with trapezoids
- **Simpson's Rule**: use parabolic arcs
- **Monte Carlo integration**: random sampling (used in graphics)`,
    content_easy_markdown: `## Fundamental Theorem of Calculus — Simple Version

The **Fundamental Theorem** is the most important result in calculus: differentiation and integration are opposites.

**To compute ∫[a,b] f(x) dx:**
1. Find antiderivative F(x)
2. Compute F(b) - F(a)

**Example**: Area under x² from 0 to 3 = [x³/3]₀³ = 9

This is what makes integration practical — you don't have to add up infinite tiny rectangles by hand.`,
    forge_snippet: `from sympy import symbols, integrate, Rational
import numpy as np

x = symbols('x')

# FTC Part 2: ∫[0,3] x² dx = [x³/3]₀³ = 9
result = integrate(x**2, (x, 0, 3))
print(result)    # 9

# Numerical: trapezoidal rule
def trapezoid(f, a, b, n=1000):
    """Approximate ∫[a,b] f(x) dx using n trapezoids."""
    xs = np.linspace(a, b, n+1)
    ys = f(xs)
    h = (b - a) / n
    return h * (ys[0]/2 + np.sum(ys[1:-1]) + ys[-1]/2)

import math
# ∫[0,1] e^(-x²) dx (no closed form)
print(trapezoid(lambda x: np.exp(-x**2), 0, 1))  # ≈ 0.7468

# Net change: distance from velocity
v = lambda t: 3*t**2 - 6*t + 2  # velocity
net_displacement = trapezoid(v, 0, 3)
print(f"Net displacement: {net_displacement:.4f}")  # ≈ 3.0`
  },
  {
    title: "Applications of Integration",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "MATH 111 > Unit 2: Calculus",
    first_principles: [
      "Integration accumulates infinitely many infinitely thin slices — this makes it powerful for area, volume, and probability",
      "The area between two curves is the integral of their difference",
      "Any accumulation problem (distance from speed, revenue from rate) is an integral"
    ],
    learning_objectives: [
      "Compute the area between two curves",
      "Find volumes of revolution using the disk/washer method",
      "Solve simple differential equations by integration",
      "Apply integration to probability density functions"
    ],
    prerequisites: ["Definite Integrals and the Fundamental Theorem of Calculus"],
    content_markdown: `## Applications of Integration

### Area Between Curves

Area between f(x) and g(x) on [a,b], where f ≥ g:
\`\`\`
A = ∫[a,b] [f(x) - g(x)] dx
\`\`\`

Find intersection points first to set correct limits.

### Volumes of Revolution

**Disk Method** (rotate around x-axis):
V = π ∫[a,b] [f(x)]² dx

**Washer Method** (hole in the middle):
V = π ∫[a,b] ([f(x)]² - [g(x)]²) dx

### Probability Applications

If f(x) is a probability density function (PDF):
- P(a ≤ X ≤ b) = ∫[a,b] f(x) dx
- The total area under any PDF = 1: ∫[-∞,∞] f(x) dx = 1

This is how statistics works — computing probabilities from distributions.

### Differential Equations

Many physics and CS problems give dy/dx = f(x). Integrate both sides:
y = ∫f(x)dx + C

Use initial conditions to find C.

### CS: Monte Carlo Integration

For high-dimensional integrals (machine learning, physics simulation):
Sample random points, check how many fall under the curve, estimate the area.`,
    content_easy_markdown: `## Applications of Integration — Simple Version

Integration is used to compute:
- **Area between curves**: ∫(top - bottom)dx
- **Probabilities**: ∫PDF = probability of a range
- **Accumulated quantities**: distance from speed, total revenue from rate

**Key insight**: Any time you're adding up tiny pieces over a range, that's integration.

In CS, this shows up in statistics (normal distribution areas), graphics (volumetric rendering), and simulations.`,
    forge_snippet: `import numpy as np
from scipy import integrate as sci_integrate

# Area between curves: y = x² and y = x on [0,1]
# f(x) = x - x² (x is on top)
area, _ = sci_integrate.quad(lambda x: x - x**2, 0, 1)
print(f"Area between curves: {area:.4f}")  # 1/6 ≈ 0.1667

# Probability: P(0 ≤ X ≤ 1) for standard normal
from scipy.stats import norm
prob, _ = sci_integrate.quad(norm.pdf, 0, 1)
print(f"P(0 ≤ Z ≤ 1) = {prob:.4f}")  # ≈ 0.3413

# Monte Carlo integration (estimate π)
n = 1_000_000
x = np.random.uniform(-1, 1, n)
y = np.random.uniform(-1, 1, n)
inside = (x**2 + y**2) <= 1
pi_estimate = 4 * np.sum(inside) / n
print(f"π ≈ {pi_estimate:.4f}")`
  },
  {
    title: "Sequences and Series",
    importance_level: "Advanced",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "MATH 111 > Unit 2: Calculus",
    first_principles: [
      "A sequence is an ordered list of numbers defined by a formula — each term depends on its index",
      "A series sums the terms of a sequence — it converges only if partial sums approach a finite limit",
      "Geometric series are the most important in CS: they model compound growth and algorithm complexity"
    ],
    learning_objectives: [
      "Determine if a sequence converges or diverges",
      "Compute the sum of geometric and telescoping series",
      "Apply convergence tests (ratio test, integral test)",
      "Write Taylor series for eˣ, sin(x), cos(x)"
    ],
    prerequisites: ["Limits and Continuity"],
    content_markdown: `## Sequences and Series

### Sequences

A **sequence** {aₙ} is an ordered list: a₁, a₂, a₃, …

A sequence **converges** to L if lim[n→∞] aₙ = L.

### Series

A **series** is the sum of a sequence: Σ aₙ = a₁ + a₂ + a₃ + …

The series converges if partial sums Sₙ = a₁ + … + aₙ approach a finite limit.

### Geometric Series (Critical for CS)

Σ arⁿ = a/(1-r) for |r| < 1

**Example**: 1 + 1/2 + 1/4 + 1/8 + … = 1/(1-½) = 2

This formula is used to analyze algorithms that halve their work each step (binary search, merge sort).

### Taylor Series

A function can be represented as an infinite polynomial:
\`\`\`
eˣ  = 1 + x + x²/2! + x³/3! + …
sin(x) = x - x³/3! + x⁵/5! - …
cos(x) = 1 - x²/2! + x⁴/4! - …
\`\`\`

### CS Applications

- **Time complexity analysis**: geometric series appear in recurrences (T(n) = T(n/2) + n)
- **Machine learning**: Taylor series underpins most approximations (Adam optimizer uses 2nd moment)
- **Compression**: Fourier series (sum of sines/cosines) is the foundation of JPEG compression`,
    content_easy_markdown: `## Sequences and Series — Simple Version

A **sequence** is a list: 1, 2, 4, 8, 16…

A **series** sums the list: 1 + 2 + 4 + 8 + …

The key formula for CS: **geometric series**
If each term multiplies by r (where |r|<1), the total sum is a/(1-r).

Example: 1 + 1/2 + 1/4 + … = 2

**Taylor series** lets you write any smooth function as an infinite polynomial — computers use this to compute sin, cos, and eˣ.`,
    forge_snippet: `import math

# Geometric series sum: a/(1-r) for |r| < 1
def geo_series_sum(a, r, n_terms=1000):
    """Sum first n_terms of geometric series."""
    return sum(a * r**n for n in range(n_terms))

print(geo_series_sum(1, 0.5))  # ≈ 2.0 (= 1/(1-0.5))
print(geo_series_sum(1, 0.1))  # ≈ 1.111... (= 1/(1-0.1))

# Taylor series approximation of eˣ
def exp_taylor(x, terms=20):
    return sum(x**n / math.factorial(n) for n in range(terms))

print(exp_taylor(1))        # ≈ 2.71828 (e)
print(abs(exp_taylor(1) - math.e))   # very small error

# Algorithm complexity: merge sort recurrence
# T(n) = 2T(n/2) + n → O(n log n)
# The recurrence tree has log(n) levels, each summing to n
# Total work = n * log₂(n) — geometric series analysis
def merge_sort_ops(n):
    if n <= 1: return 0
    return 2 * merge_sort_ops(n // 2) + n

print(merge_sort_ops(1024))  # ≈ 1024 * 10 = 10240 ops`
  },

  // ── Unit 3: Linear Algebra & Discrete ────────────────────────────────────
  {
    title: "Vectors and Vector Operations",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "MATH 111 > Unit 3: Linear Algebra & Discrete",
    first_principles: [
      "A vector has both magnitude and direction — it represents displacement, force, or any directional quantity",
      "The dot product captures the cosine of the angle between two vectors",
      "Vectors are the fundamental data structure of machine learning — every training example is a vector"
    ],
    learning_objectives: [
      "Perform vector addition, scalar multiplication, and compute magnitude",
      "Compute dot products and use them to find angles between vectors",
      "Understand unit vectors and normalization",
      "Apply vectors to represent data points in ML feature spaces"
    ],
    prerequisites: ["Number Systems (ℕ, ℤ, ℚ, ℝ, ℂ)"],
    content_markdown: `## Vectors and Vector Operations

### What is a Vector?

A **vector** v = (v₁, v₂, …, vₙ) is an ordered n-tuple of numbers. It represents a point or direction in n-dimensional space.

### Operations

**Addition**: u + v = (u₁+v₁, u₂+v₂, …)
**Scalar multiplication**: cv = (cv₁, cv₂, …)
**Magnitude**: |v| = √(v₁² + v₂² + … + vₙ²)
**Unit vector**: v̂ = v/|v| (magnitude = 1, same direction)

### Dot Product

u · v = u₁v₁ + u₂v₂ + … = |u||v|cos(θ)

where θ is the angle between u and v.

Key facts:
- u · v = 0 → u and v are **perpendicular** (orthogonal)
- u · v = |u||v| → parallel (θ=0°)

### Cross Product (3D only)

u × v produces a vector perpendicular to both. Magnitude = |u||v|sin(θ).

### CS and ML Connection

In machine learning, every data point is a **feature vector**: [age, income, score, …]. Similarity between data points uses the dot product:
\`\`\`
cosine_similarity = (a · b) / (|a| · |b|)
\`\`\`
This is how recommendation systems find "similar" users or documents.`,
    content_easy_markdown: `## Vectors — Simple Version

A **vector** is just a list of numbers representing a direction and distance: (3, 4).

**Magnitude** (length): √(3²+4²) = 5

**Dot product** (a · b): multiply matching parts and add them up.
If the dot product is 0, the vectors are perpendicular.

**Why it matters in CS**: Every data record in machine learning is a vector. Similarity between items (recommendations, search) uses the dot product.`,
    forge_snippet: `import numpy as np

# Vectors
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print("Addition:", a + b)           # [5, 7, 9]
print("Scalar mult:", 2 * a)        # [2, 4, 6]
print("Magnitude:", np.linalg.norm(a))  # √14 ≈ 3.742
print("Unit vector:", a / np.linalg.norm(a))

# Dot product
dot = np.dot(a, b)
print("Dot product:", dot)          # 32

# Angle between vectors
cos_theta = dot / (np.linalg.norm(a) * np.linalg.norm(b))
theta = np.degrees(np.arccos(cos_theta))
print(f"Angle: {theta:.2f}°")      # ≈ 12.93°

# Cosine similarity (used in NLP/recommender systems)
def cosine_similarity(u, v):
    return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))

user1 = np.array([5, 3, 0, 1])   # ratings: action=5, comedy=3
user2 = np.array([4, 2, 0, 1])
print(f"User similarity: {cosine_similarity(user1, user2):.4f}")  # ≈ 0.9997`
  },
  {
    title: "Matrices and Matrix Operations",
    importance_level: "Advanced",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "MATH 111 > Unit 3: Linear Algebra & Discrete",
    first_principles: [
      "A matrix is a rectangular array of numbers representing a linear transformation",
      "Matrix multiplication represents function composition — applying one transformation after another",
      "The determinant captures how a matrix scales areas/volumes and whether it has an inverse"
    ],
    learning_objectives: [
      "Perform matrix addition, scalar multiplication, and matrix multiplication",
      "Compute the transpose and determinant of a matrix",
      "Find the inverse of a 2×2 matrix",
      "Understand matrices as representing linear transformations"
    ],
    prerequisites: ["Vectors and Vector Operations"],
    content_markdown: `## Matrices and Matrix Operations

### What is a Matrix?

An m×n **matrix** A has m rows and n columns. Entry aᵢⱼ is in row i, column j.

### Operations

**Addition/Subtraction**: element-wise (same dimensions required)
**Scalar multiplication**: multiply every element by the scalar

### Matrix Multiplication

(AB)ᵢⱼ = row i of A · column j of B (dot product)

Requirements: A is m×k, B is k×n → result is m×n

Note: AB ≠ BA in general!

### Special Matrices

- **Identity I**: diagonal of 1s, AI = IA = A
- **Zero matrix**: all zeros
- **Transpose Aᵀ**: rows become columns
- **Symmetric**: A = Aᵀ

### Determinant

For 2×2: det([a,b; c,d]) = ad - bc

If det(A) = 0, A has no inverse (singular matrix — transforms collapse dimensions).

### Inverse

A⁻¹ exists when det(A) ≠ 0.
A · A⁻¹ = I

For 2×2: [a,b; c,d]⁻¹ = (1/(ad-bc)) · [d,-b; -c,a]

### CS Applications

- **Computer graphics**: rotation, scaling, translation matrices (4×4 homogeneous)
- **Neural networks**: a layer is just a matrix multiplication + bias + activation
- **PageRank**: Google's algorithm is a huge matrix operation
- **PCA**: finding principal components uses eigendecomposition`,
    content_easy_markdown: `## Matrices — Simple Version

A **matrix** is a grid of numbers. You can add them element-wise, or multiply them (which is more complex — rows times columns).

**Key operations:**
- **Multiply**: (AB)ᵢⱼ = (row i of A) · (column j of B)
- **Transpose**: flip rows and columns (Aᵀ)
- **Inverse**: A⁻¹ "undoes" A — like dividing by a number

**Why it matters in CS**: Neural network layers are matrix multiplications. Computer graphics transformations (rotate, scale, translate) are all matrix operations.`,
    forge_snippet: `import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

print("Addition:", A + B)
print("Matrix multiply:", A @ B)   # [[19,22],[43,50]]
print("Transpose:", A.T)
print("Determinant:", np.linalg.det(A))   # -2.0

# Inverse
A_inv = np.linalg.inv(A)
print("A × A⁻¹ ≈ I:", np.round(A @ A_inv))  # [[1,0],[0,1]]

# Neural network layer simulation
def layer(X, W, b):
    """One neural network layer: output = X @ W + b"""
    return X @ W + b

X = np.array([[1, 2, 3]])  # input (1 sample, 3 features)
W = np.random.randn(3, 4)  # weights (3 inputs, 4 neurons)
b = np.zeros((1, 4))       # bias
output = layer(X, W, b)
print("Layer output shape:", output.shape)  # (1, 4)`
  },
  {
    title: "Systems of Linear Equations",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "MATH 111 > Unit 3: Linear Algebra & Discrete",
    first_principles: [
      "A system of linear equations finds the intersection of hyperplanes in n-dimensional space",
      "Gaussian elimination systematically reduces a system to row echelon form",
      "A system has one solution (unique), no solutions (inconsistent), or infinitely many solutions (dependent)"
    ],
    learning_objectives: [
      "Solve 2×2 and 3×3 systems using Gaussian elimination and back-substitution",
      "Identify consistent, inconsistent, and dependent systems from the augmented matrix",
      "Interpret the solution geometrically as intersections of lines/planes",
      "Apply linear systems to solving network flow and circuit problems"
    ],
    prerequisites: ["Matrices and Matrix Operations"],
    content_markdown: `## Systems of Linear Equations

### The Problem

Find x, y, z satisfying:
\`\`\`
2x +  y - z = 8
-3x - y + 2z = -11
-2x + y + 2z = -3
\`\`\`

### Gaussian Elimination

**Step 1**: Write as augmented matrix [A|b]:
\`\`\`
[ 2  1 -1 |  8]
[-3 -1  2 |-11]
[-2  1  2 | -3]
\`\`\`

**Step 2**: Use row operations to get row echelon form:
- Multiply a row by nonzero constant
- Add multiple of one row to another
- Swap rows

**Step 3**: Back-substitute from bottom up.

**Solution**: x=2, y=3, z=-1

### Three Cases

| Case | Matrix Form | Meaning |
|------|-------------|---------|
| Unique solution | rank = n variables | Lines meet at one point |
| No solution | 0 = 1 row | Lines are parallel |
| Infinite solutions | rank < n | Lines are the same |

### Matrix Form

Ax = b

If A is invertible: x = A⁻¹b

### CS Applications

- **Computer graphics**: solving for intersection of rays
- **Circuit analysis**: Kirchhoff's laws → linear system
- **Network routing**: flow conservation → linear constraints
- **Least squares regression**: minimize ||Ax - b||²`,
    content_easy_markdown: `## Systems of Linear Equations — Simple Version

A **system of equations** finds where multiple lines (or planes) intersect.

**Gaussian elimination** solves it by converting the equations to a matrix and simplifying step by step.

**Three possible outcomes:**
1. One solution (lines cross at one point)
2. No solution (lines are parallel)
3. Infinite solutions (lines are the same)

In CS, this is used for circuit analysis, computer graphics, and machine learning regression (fitting a line to data).`,
    forge_snippet: `import numpy as np

# Solve: 2x + y - z = 8, -3x - y + 2z = -11, -2x + y + 2z = -3
A = np.array([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], dtype=float)
b = np.array([8, -11, -3], dtype=float)

# Direct solve
x = np.linalg.solve(A, b)
print(f"Solution: x={x[0]:.1f}, y={x[1]:.1f}, z={x[2]:.1f}")  # 2, 3, -1

# Verify
print("Ax =", A @ x)   # should equal b

# Least squares (for overdetermined systems — regression!)
# Find best-fit line y = mx + c through points
points_x = np.array([1, 2, 3, 4, 5])
points_y = np.array([2.1, 3.9, 6.2, 7.8, 10.1])

# Design matrix: [x, 1]
A_ols = np.column_stack([points_x, np.ones(len(points_x))])
# Least squares: minimize ||Ax - y||²
coeffs, _, _, _ = np.linalg.lstsq(A_ols, points_y, rcond=None)
m, c = coeffs
print(f"Best fit line: y = {m:.2f}x + {c:.2f}")  # ≈ y = 2x + 0`
  },
  {
    title: "Combinatorics and Permutations",
    importance_level: "Expert",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "MATH 111 > Unit 3: Linear Algebra & Discrete",
    first_principles: [
      "Counting is the foundation of algorithm analysis — knowing how many operations exist determines complexity",
      "Permutations count ordered arrangements; combinations count unordered selections",
      "The multiplication principle: if A has m ways and B has n ways, A then B has m·n ways"
    ],
    learning_objectives: [
      "Apply the multiplication and addition principles",
      "Compute permutations P(n,r) and combinations C(n,r)",
      "Use the binomial theorem and Pascal's triangle",
      "Count arrangements with repetition and restricted positions"
    ],
    prerequisites: ["Mathematical Induction"],
    content_markdown: `## Combinatorics and Permutations

### Fundamental Counting Principles

**Multiplication Principle**: If task 1 has m ways and task 2 has n ways, there are m·n total ways.

**Addition Principle**: If A and B are mutually exclusive choices, total options = |A| + |B|.

### Permutations

An ordered arrangement of r items from n:
\`\`\`
P(n, r) = n! / (n-r)!
\`\`\`

Example: Passwords of 3 letters from {A,B,C,D,E}: P(5,3) = 5!/2! = 60

### Combinations

An unordered selection of r items from n:
\`\`\`
C(n, r) = n! / (r! · (n-r)!)
\`\`\`

Example: Choose 3 from 5: C(5,3) = 10

### Binomial Theorem

(a+b)ⁿ = Σ C(n,k) · aⁿ⁻ᵏ · bᵏ

The coefficients C(n,k) are Pascal's triangle entries.

### CS Applications

- **Password strength**: how many possible passwords (counting + multiplication principle)
- **Algorithm analysis**: C(n,2) = n(n-1)/2 comparisons for bubble sort
- **Probability**: # favorable outcomes / # total outcomes
- **Hash collisions**: birthday paradox — how likely are two keys to collide
- **Genetic algorithms**: number of possible binary strings of length n is 2ⁿ`,
    content_easy_markdown: `## Combinatorics — Simple Version

**Permutations**: Ordered arrangements. 3 letters from {A,B,C,D,E} → P(5,3) = 60 ways.

**Combinations**: Unordered selections. Choose 3 from 5 → C(5,3) = 10 ways.

**Key formulas:**
- P(n,r) = n! / (n-r)!
- C(n,r) = n! / (r! × (n-r)!)

**Why it matters in CS**: Counting combinations is how you analyze algorithms (how many pairs does bubble sort compare?), measure password strength, and calculate probability.`,
    forge_snippet: `import math
from itertools import permutations, combinations

# Permutations: P(5,3)
n, r = 5, 3
p = math.perm(n, r)
print(f"P({n},{r}) = {p}")   # 60

# Combinations: C(5,3)
c = math.comb(n, r)
print(f"C({n},{r}) = {c}")   # 10

# Verify by enumeration
items = ['A', 'B', 'C', 'D', 'E']
perms = list(permutations(items, 3))
combos = list(combinations(items, 3))
print(len(perms), len(combos))  # 60, 10

# Password strength
def password_count(length, charset_size):
    return charset_size ** length  # multiplication principle

# 8-char lowercase password
print(f"8-char lowercase passwords: {password_count(8, 26):,}")   # 208,827,064,576

# Birthday paradox: prob of collision in a hash table
def birthday_collision_prob(n, d):
    """P(at least one collision) with n items in d buckets."""
    no_collision = math.prod((d - i) / d for i in range(n))
    return 1 - no_collision

print(f"P(collision) with 23 people in 365 days: {birthday_collision_prob(23, 365):.3f}")  # ≈ 0.507`
  },
  {
    title: "Probability Fundamentals",
    importance_level: "Expert",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "MATH 111 > Unit 3: Linear Algebra & Discrete",
    first_principles: [
      "Probability is a measure assigning numbers 0-1 to events, representing long-run frequency",
      "Independent events do not influence each other; conditional probability captures dependency",
      "Bayes' theorem updates probability given new evidence — the mathematical foundation of all Bayesian AI"
    ],
    learning_objectives: [
      "Compute classical probability from sample spaces",
      "Apply addition and multiplication rules for probability",
      "Calculate conditional probability P(A|B) and check independence",
      "Apply Bayes' theorem to real-world inference problems"
    ],
    prerequisites: ["Combinatorics and Permutations", "Mathematical Logic and Proof Techniques"],
    content_markdown: `## Probability Fundamentals

### Sample Space and Events

**Sample space Ω**: all possible outcomes.
**Event A**: a subset of Ω.
**Probability P(A)** = |A| / |Ω| (classical, equally likely outcomes)

### Rules

**Addition Rule**: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
**Complement**: P(Aᶜ) = 1 - P(A)
**Multiplication Rule**: P(A ∩ B) = P(A) · P(B|A)

### Conditional Probability

P(A|B) = P(A ∩ B) / P(B) — probability of A given B has occurred.

### Independence

A and B are **independent** if P(A|B) = P(A), or equivalently P(A ∩ B) = P(A)·P(B).

### Bayes' Theorem (Critical for AI/ML)

P(A|B) = P(B|A) · P(A) / P(B)

**Spam filter example**:
- P(spam) = 0.3 (prior)
- P("FREE"|spam) = 0.9, P("FREE"|not spam) = 0.1
- P(spam|"FREE") = 0.9·0.3 / (0.9·0.3 + 0.1·0.7) ≈ 0.79

### Random Variables

A **random variable** X assigns numbers to outcomes.
- **Expected value**: E[X] = Σ x·P(X=x)
- **Variance**: Var(X) = E[X²] - (E[X])²

### CS Applications

- **Naive Bayes classifiers**: spam detection, sentiment analysis
- **A/B testing**: hypothesis testing using probability
- **Randomized algorithms**: QuickSort expected O(n log n)
- **Monte Carlo methods**: simulation and integration`,
    content_easy_markdown: `## Probability — Simple Version

**Probability** measures how likely something is, from 0 (impossible) to 1 (certain).

**Key rules:**
- P(A or B) = P(A) + P(B) - P(both)
- P(A and B) = P(A) × P(B) [if independent]
- P(not A) = 1 - P(A)

**Bayes' theorem** updates a belief given new evidence:
P(cause | effect) = P(effect | cause) × P(cause) / P(effect)

This is how spam filters, medical diagnosis AI, and recommendation engines work.`,
    forge_snippet: `# Bayes' theorem: spam filter
def bayes(p_prior, p_evidence_given_true, p_evidence_given_false):
    """
    P(A|B) = P(B|A) * P(A) / P(B)
    P(B) = P(B|A)*P(A) + P(B|¬A)*P(¬A)
    """
    p_not_prior = 1 - p_prior
    p_evidence = (p_evidence_given_true * p_prior +
                  p_evidence_given_false * p_not_prior)
    return p_evidence_given_true * p_prior / p_evidence

# P(spam | "FREE" in email)
p_spam_given_free = bayes(
    p_prior=0.3,              # 30% emails are spam
    p_evidence_given_true=0.9, # 90% spam emails say FREE
    p_evidence_given_false=0.1  # 10% legit emails say FREE
)
print(f"P(spam | 'FREE') = {p_spam_given_free:.3f}")  # ≈ 0.794

# Monte Carlo probability estimation
import random
def estimate_pi_prob(n=1_000_000):
    """Estimate π: P(point in unit circle) = π/4"""
    hits = sum(1 for _ in range(n)
               if random.random()**2 + random.random()**2 <= 1)
    return 4 * hits / n

print(f"π ≈ {estimate_pi_prob():.4f}")`
  }
];

async function seed() {
  try {
    console.log("🔢 Seeding MATH 111: Math I topics...");
    const courseRes = await pool.query(
      "SELECT id FROM courses WHERE name ILIKE '%MATH 111%' LIMIT 1"
    );
    if (courseRes.rows.length === 0) {
      throw new Error("MATH 111 not found. Run seed_curriculum.js first.");
    }
    const courseId = courseRes.rows[0].id;
    await pool.query("DELETE FROM topics WHERE course_id = $1", [courseId]);

    for (const t of topics) {
      await pool.query(
        `INSERT INTO topics (
          title, course_id, importance_level, estimated_time, estimated_time_minutes,
          breadcrumb_path, first_principles, learning_objectives, prerequisites,
          content_markdown, content_easy_markdown, forge_snippet
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          t.title, courseId, t.importance_level, t.estimated_time,
          t.estimated_time_minutes, t.breadcrumb_path,
          JSON.stringify(t.first_principles), JSON.stringify(t.learning_objectives),
          JSON.stringify(t.prerequisites), t.content_markdown,
          t.content_easy_markdown, t.forge_snippet
        ]
      );
      console.log(`  ✓ ${t.title}`);
    }
    console.log(`\n✅ MATH 111 done — ${topics.length} topics seeded.\n`);
  } catch (err) {
    console.error("❌ MATH 111 seeding failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed();
