import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });
import pool from "../config/db.js";

const topics = [
  // ── Unit 1: Core Syntax ───────────────────────────────────────────────────
  {
    title: "What is Programming?",
    importance_level: "Essential",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "CS 121 > Unit 1: Core Syntax",
    first_principles: [
      "A program is a precise sequence of instructions that a computer can execute",
      "Programming languages are formal languages with unambiguous syntax and semantics",
      "Computers follow instructions exactly — precision and correctness are non-negotiable"
    ],
    learning_objectives: [
      "Explain what a program is and what a programming language does",
      "Describe the compilation vs. interpretation execution models",
      "Write and run a first Python program",
      "Understand the role of the Python interpreter"
    ],
    prerequisites: [],
    content_markdown: `## What is Programming?

Programming is the art of communicating with computers. A **program** is a precise, ordered sequence of instructions that a computer follows to accomplish a task.

### Why Computers Need Formal Languages

Computers understand only binary (0s and 1s). Programming languages provide a human-readable way to express instructions. The language is then **translated** into machine code the CPU can execute.

### Types of Execution

**Compiled languages** (C, C++, Go):
- Source code → Compiler → Machine code → Execute
- Compilation happens once; the result runs fast

**Interpreted languages** (Python, JavaScript):
- Source code → Interpreter → Executes line by line
- No separate compilation step; easier to write interactively

**Python** is interpreted (with some compilation to bytecode behind the scenes).

### Your First Python Program

\`\`\`python
print("Hello, World!")
\`\`\`

\`print()\` is a **function** — a named action. The text in quotes is a **string** — textual data.

### The Programming Mindset

- **Decomposition**: break big problems into small steps
- **Abstraction**: hide details, work at the right level
- **Pattern recognition**: identify similar structures and reuse solutions
- **Algorithms**: step-by-step procedures for solving problems

### Brief History

1940s: Machine code (just 0s and 1s)
1950s: Assembly language (symbolic mnemonics)
1957: FORTRAN — first high-level language
1990s: Python created by Guido van Rossum
Today: Python is #1 in data science, AI, and education`,
    content_easy_markdown: `## What is Programming? — Simple Version

Programming means writing instructions for a computer to follow. Computers are very precise — they do exactly what you tell them, nothing more.

Python is one of the easiest languages to learn. It's what we use in this course.

To run Python:
1. Open a terminal
2. Type \`python\` to start the interpreter
3. Type \`print("Hello!")\` and press Enter

That's your first program! The rest of CS 121 builds from here.`,
    forge_snippet: `# Your first Python programs

# 1. Hello World
print("Hello, World!")

# 2. Basic arithmetic
print(2 + 3)        # 5
print(10 / 3)       # 3.333...
print(10 // 3)      # 3 (integer division)
print(10 % 3)       # 1 (remainder)
print(2 ** 8)       # 256 (power)

# 3. User interaction
name = input("What is your name? ")
print(f"Hello, {name}!")

# Run this file: python hello.py
# or interactively: python3`
  },
  {
    title: "Variables and Data Types",
    importance_level: "Essential",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "CS 121 > Unit 1: Core Syntax",
    first_principles: [
      "A variable is a named location in memory that stores a value",
      "Every value has a type that determines what operations are valid on it",
      "Python is dynamically typed — the type is inferred from the value, not declared"
    ],
    learning_objectives: [
      "Declare variables and assign values of different types",
      "Identify and use int, float, str, bool, and NoneType",
      "Understand type conversion (casting) between types",
      "Use type() and isinstance() to inspect types at runtime"
    ],
    prerequisites: ["What is Programming?"],
    content_markdown: `## Variables and Data Types

### Variables

A **variable** is a named reference to a value stored in memory.

\`\`\`python
age = 19           # int
gpa = 3.8          # float
name = "Alice"     # str
enrolled = True    # bool
score = None       # NoneType
\`\`\`

### Python's Core Types

| Type | Example | Used For |
|------|---------|---------|
| \`int\` | 42, -7, 0 | Whole numbers |
| \`float\` | 3.14, -2.5 | Decimal numbers |
| \`str\` | "hello", 'world' | Text |
| \`bool\` | True, False | Logic/conditions |
| \`NoneType\` | None | Absence of value |

### Dynamic Typing

Python infers type from the value — no need to declare:
\`\`\`python
x = 10       # x is int
x = "hello"  # x is now str (allowed in Python!)
\`\`\`

### Type Conversion (Casting)

\`\`\`python
int("42")     → 42
float("3.14") → 3.14
str(100)      → "100"
bool(0)       → False
bool(1)       → True
bool("")      → False
\`\`\`

### Naming Conventions

- Use \`snake_case\` for variables: \`student_name\`, \`total_score\`
- Be descriptive: \`n\` is bad; \`num_students\` is good
- Don't use reserved words: \`if\`, \`for\`, \`class\`, etc.

### Multiple Assignment

\`\`\`python
a, b, c = 1, 2, 3   # tuple unpacking
x = y = z = 0        # all three point to 0
\`\`\``,
    content_easy_markdown: `## Variables — Simple Version

A **variable** is like a labelled box that holds a value:
\`\`\`python
age = 20
name = "Sara"
gpa = 3.9
\`\`\`

Python's main types:
- **int**: whole numbers (1, 42, -5)
- **float**: decimals (3.14, -0.5)
- **str**: text ("hello")
- **bool**: True or False

Python figures out the type automatically — you don't need to declare it.`,
    forge_snippet: `# Variables and types in Python
name = "Alice"
age = 20
gpa = 3.75
is_student = True
grade = None

print(type(name))       # <class 'str'>
print(type(age))        # <class 'int'>
print(type(gpa))        # <class 'float'>
print(type(is_student)) # <class 'bool'>

# Type conversion
score_str = "95"
score_int = int(score_str)    # "95" → 95
print(score_int + 5)          # 100

# Check type
print(isinstance(age, int))   # True
print(isinstance(name, int))  # False

# f-strings (formatted strings)
print(f"Name: {name}, Age: {age}, GPA: {gpa:.1f}")
# → "Name: Alice, Age: 20, GPA: 3.8"`
  },
  {
    title: "Operators and Expressions",
    importance_level: "Essential",
    estimated_time: "45 mins",
    estimated_time_minutes: 45,
    breadcrumb_path: "CS 121 > Unit 1: Core Syntax",
    first_principles: [
      "An expression is any piece of code that evaluates to a value",
      "Operators are symbols that combine values — arithmetic, comparison, logical, and assignment",
      "Operator precedence determines evaluation order — use parentheses when in doubt"
    ],
    learning_objectives: [
      "Use arithmetic, comparison, logical, and assignment operators correctly",
      "Understand Python's operator precedence",
      "Evaluate complex expressions step by step",
      "Use augmented assignment operators (+=, -=, etc.)"
    ],
    prerequisites: ["Variables and Data Types"],
    content_markdown: `## Operators and Expressions

### Arithmetic Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| \`+\` | addition | 5 + 3 = 8 |
| \`-\` | subtraction | 10 - 4 = 6 |
| \`*\` | multiplication | 3 * 4 = 12 |
| \`/\` | division (float) | 7 / 2 = 3.5 |
| \`//\` | floor division | 7 // 2 = 3 |
| \`%\` | modulo (remainder) | 7 % 2 = 1 |
| \`**\` | exponentiation | 2 ** 10 = 1024 |

### Comparison Operators (return bool)

\`==\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`

\`\`\`python
10 > 5   # True
3 == 3   # True
2 != 2   # False
\`\`\`

### Logical Operators

\`and\`, \`or\`, \`not\`

\`\`\`python
True and False   # False
True or False    # True
not True         # False
\`\`\`

### Augmented Assignment

\`\`\`python
x = 10
x += 3   # x = x + 3 → 13
x *= 2   # x = x * 2 → 26
x //= 5  # x = x // 5 → 5
\`\`\`

### Precedence (PEMDAS-like)

\`\`\`
** > (unary -, +) > *, /, //, % > +, - > comparisons > not > and > or
\`\`\`

### Short-Circuit Evaluation

\`\`\`python
# Python stops early if result is determined
False and expensive_call()   # expensive_call never runs
True or expensive_call()     # expensive_call never runs
\`\`\``,
    content_easy_markdown: `## Operators — Simple Version

Operators do things to values:
- **Arithmetic**: +, -, *, /, // (integer div), % (remainder), ** (power)
- **Comparison**: ==, !=, <, >, <=, >= (returns True/False)
- **Logical**: and, or, not

**Important tricks:**
- \`7 % 3 = 1\` (modulo gives remainder — great for checking even/odd: \`n % 2 == 0\`)
- \`x += 1\` is shorthand for \`x = x + 1\`
- Use parentheses when unsure about order!`,
    forge_snippet: `# Arithmetic
print(17 // 5)   # 3 (integer division)
print(17 % 5)    # 2 (remainder)
print(2 ** 10)   # 1024

# Check even/odd
for n in range(10):
    if n % 2 == 0:
        print(f"{n} is even")

# Comparison and logical
x = 15
print(x > 10 and x < 20)   # True (x is between 10 and 20)
print(x < 0 or x > 10)     # True

# Augmented assignment
score = 100
score -= 10   # lost 10 points
score *= 1.1  # 10% bonus
print(f"Final score: {score:.1f}")  # 99.0

# Walrus operator := (Python 3.8+)
import random
while (n := random.randint(1, 10)) != 7:
    print(f"Got {n}, trying again...")
print(f"Got 7!")`
  },
  {
    title: "Input and Output (I/O)",
    importance_level: "Essential",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "CS 121 > Unit 1: Core Syntax",
    first_principles: [
      "Programs communicate with the outside world through input (reading) and output (writing)",
      "All input() returns strings — you must convert to the appropriate type",
      "Formatting output clearly is a professional skill — use f-strings"
    ],
    learning_objectives: [
      "Use print() with various formatting options",
      "Use input() to receive user data and convert types",
      "Format output with f-strings and format specifiers",
      "Read and write basic files"
    ],
    prerequisites: ["Variables and Data Types"],
    content_markdown: `## Input and Output

### Output with print()

\`\`\`python
print("Hello")                    # Hello
print("a", "b", "c")             # a b c
print("a", "b", sep="-")         # a-b
print("line1", end="")           # no newline
print("line2")                   # line1line2
\`\`\`

### F-strings (Recommended Formatting)

\`\`\`python
name = "Alice"
score = 95.678

print(f"Name: {name}")
print(f"Score: {score:.2f}")       # 2 decimal places → 95.68
print(f"Score: {score:8.2f}")      # width 8, 2 decimals →    95.68
print(f"{score:.0%}")              # percentage → 9568%
\`\`\`

### Input from User

\`\`\`python
name = input("Enter your name: ")  # always returns str
age = int(input("Enter your age: "))
gpa = float(input("Enter your GPA: "))
\`\`\`

**Common mistake**: Forgetting to convert — \`input()\` ALWAYS returns a string.

### File I/O (Preview)

\`\`\`python
# Write to file
with open("output.txt", "w") as f:
    f.write("Hello, file!\\n")

# Read from file
with open("output.txt", "r") as f:
    content = f.read()
    print(content)
\`\`\`

### print() for Debugging

Using \`print()\` to inspect variables is your first debugging tool:
\`\`\`python
x = some_complex_calculation()
print(f"DEBUG x = {x}")  # check intermediate results
\`\`\``,
    content_easy_markdown: `## Input and Output — Simple Version

**Output**: Use \`print()\` to display values.
Use f-strings for clean formatting: \`print(f"Score: {score:.2f}")\`

**Input**: Use \`input()\` to get user data. It ALWAYS returns a string, so convert if needed:
\`\`\`python
age = int(input("Age: "))
\`\`\`

**Tip**: Put \`print()\` statements around your code when debugging — seeing variables mid-execution is invaluable.`,
    forge_snippet: `# I/O examples

# Basic output
name = "Alice"
score = 87.5
print(f"Student: {name:<10} | Score: {score:6.1f} | Grade: {'A' if score >= 90 else 'B'}")

# Formatted table
students = [("Alice", 92.5), ("Bob", 78.0), ("Carol", 95.3)]
print(f"{'Name':<10} {'Score':>8} {'Letter':>7}")
print("-" * 27)
for name, score in students:
    letter = 'A' if score >= 90 else 'B' if score >= 80 else 'C'
    print(f"{name:<10} {score:>8.1f} {letter:>7}")

# Safe input with validation
def get_int(prompt, min_val=None, max_val=None):
    while True:
        try:
            val = int(input(prompt))
            if (min_val is None or val >= min_val) and (max_val is None or val <= max_val):
                return val
            print(f"Please enter a number between {min_val} and {max_val}")
        except ValueError:
            print("Invalid input — please enter a whole number")`
  },
  {
    title: "Conditional Statements (if / elif / else)",
    importance_level: "Essential",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "CS 121 > Unit 1: Core Syntax",
    first_principles: [
      "Conditionals give programs the power to make decisions based on data",
      "Python uses indentation (not braces) to define code blocks — indentation IS the structure",
      "Every conditional evaluates a boolean expression — truthy/falsy values extend beyond True/False"
    ],
    learning_objectives: [
      "Write if, if-else, and if-elif-else chains correctly",
      "Understand Python's truthiness rules for non-boolean values",
      "Write nested conditionals and recognize when to refactor them",
      "Use the ternary (one-line) conditional expression"
    ],
    prerequisites: ["Operators and Expressions"],
    content_markdown: `## Conditional Statements

### Basic if-else

\`\`\`python
if condition:
    # runs when condition is True
    do_something()
else:
    # runs when condition is False
    do_other()
\`\`\`

### if-elif-else Chain

\`\`\`python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Grade: {grade}")   # B
\`\`\`

### Python Indentation Rule

**4 spaces** (or 1 tab) define a code block. This is NOT optional — wrong indentation is a syntax error.

### Truthiness

Python treats many non-boolean values as true or false:

**Falsy**: \`0\`, \`0.0\`, \`""\`, \`[]\`, \`{}\`, \`None\`, \`False\`
**Truthy**: everything else

\`\`\`python
if []:          # empty list is falsy
    print("has items")   # never runs
\`\`\`

### Ternary Expression

\`\`\`python
result = "pass" if score >= 50 else "fail"
\`\`\`

### Nested Conditionals

\`\`\`python
if age >= 18:
    if has_id:
        print("Welcome")
    else:
        print("Need ID")
else:
    print("Too young")
\`\`\`

Prefer chained elif over deeply nested ifs.`,
    content_easy_markdown: `## Conditionals — Simple Version

Conditionals let your program choose different paths:

\`\`\`python
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("Below B")
\`\`\`

**Python rule**: Indentation defines code blocks. All code in the same if-block must be indented the same amount.

**Truthy/Falsy**: 0, empty string "", empty list [], and None are all False in Python.`,
    forge_snippet: `# Grade calculator
def letter_grade(score):
    if score >= 90:   return "A"
    elif score >= 80: return "B"
    elif score >= 70: return "C"
    elif score >= 60: return "D"
    else:             return "F"

# Test it
for s in [95, 83, 72, 61, 45]:
    print(f"{s} → {letter_grade(s)}")

# FizzBuzz (classic interview problem)
for i in range(1, 101):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)

# Ternary + truthiness
items = [1, 2, 3]
print("List has items" if items else "List is empty")`
  },
  {
    title: "Loops (for and while)",
    importance_level: "Essential",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "CS 121 > Unit 1: Core Syntax",
    first_principles: [
      "Loops execute a block of code repeatedly — they are what makes computers useful for large-scale tasks",
      "A for loop iterates over a sequence; a while loop runs until a condition becomes False",
      "Every loop needs a termination condition — infinite loops are almost always bugs"
    ],
    learning_objectives: [
      "Write for loops over ranges, lists, and strings",
      "Write while loops with correct termination conditions",
      "Use break, continue, and else with loops",
      "Apply loops to compute sums, find elements, and process data"
    ],
    prerequisites: ["Conditional Statements (if / elif / else)"],
    content_markdown: `## Loops

### for Loops

Iterate over any **iterable** (range, list, string, …):

\`\`\`python
# Range: 0 to 9
for i in range(10):
    print(i)

# Range: start, stop, step
for i in range(0, 20, 2):   # 0, 2, 4, ..., 18
    print(i)

# List
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# String characters
for char in "hello":
    print(char)
\`\`\`

### while Loops

Run until a condition is False:

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1  # DON'T forget this — or infinite loop!
\`\`\`

### break and continue

\`\`\`python
# break: exit the loop early
for i in range(100):
    if i == 5:
        break        # stop at 5
    print(i)

# continue: skip the rest of this iteration
for i in range(10):
    if i % 2 == 0:
        continue     # skip even numbers
    print(i)         # prints only odd numbers
\`\`\`

### Loop Patterns

\`\`\`python
# Accumulator
total = 0
for x in [1, 2, 3, 4, 5]:
    total += x
print(total)   # 15

# Find first match
numbers = [3, 7, 2, 9, 1]
for n in numbers:
    if n > 5:
        print(f"First > 5: {n}")
        break
\`\`\`

### enumerate() and zip()

\`\`\`python
for i, fruit in enumerate(["a", "b", "c"]):
    print(i, fruit)   # 0 a, 1 b, 2 c

for x, y in zip([1,2,3], [4,5,6]):
    print(x, y)       # 1 4, 2 5, 3 6
\`\`\``,
    content_easy_markdown: `## Loops — Simple Version

Loops repeat code automatically.

**for loop**: use when you know how many times or what to iterate over:
\`\`\`python
for i in range(5):    # runs 5 times: i = 0,1,2,3,4
    print(i)
\`\`\`

**while loop**: use when you don't know how many times:
\`\`\`python
while answer != "quit":
    answer = input("Command? ")
\`\`\`

**Warning**: Always make sure a while loop can stop! If the condition never becomes False, you'll have an infinite loop.`,
    forge_snippet: `# Sum of first n integers
def sum_to_n(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
print(sum_to_n(100))   # 5050

# Find prime numbers up to n (Sieve idea)
def primes_up_to(n):
    primes = []
    for num in range(2, n + 1):
        is_prime = True
        for divisor in range(2, int(num**0.5) + 1):
            if num % divisor == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(num)
    return primes

print(primes_up_to(50))

# Collatz conjecture (while loop)
def collatz(n):
    steps = 0
    while n != 1:
        n = n // 2 if n % 2 == 0 else 3 * n + 1
        steps += 1
    return steps

print(collatz(27))   # 111 steps`
  },
  {
    title: "Functions",
    importance_level: "Essential",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "CS 121 > Unit 1: Core Syntax",
    first_principles: [
      "A function is a named, reusable block of code — the most important abstraction in programming",
      "Functions take inputs (parameters) and produce outputs (return values)",
      "Good functions do one thing well — the Single Responsibility Principle"
    ],
    learning_objectives: [
      "Define and call functions with positional and keyword arguments",
      "Use default parameter values and *args/**kwargs",
      "Understand the difference between return values and print statements",
      "Write pure functions with no side effects"
    ],
    prerequisites: ["Loops (for and while)"],
    content_markdown: `## Functions

### Defining and Calling

\`\`\`python
def greet(name):        # def keyword, function name, parameters
    """Greet a user.""" # docstring (optional but good practice)
    return f"Hello, {name}!"

message = greet("Alice")  # call the function
print(message)             # Hello, Alice!
\`\`\`

### Parameters and Arguments

**Parameters** are the names in the definition.
**Arguments** are the values passed when calling.

\`\`\`python
def add(a, b):     # a, b are parameters
    return a + b

result = add(3, 4) # 3, 4 are arguments → result = 7
\`\`\`

### Default Values

\`\`\`python
def power(base, exponent=2):  # exponent defaults to 2
    return base ** exponent

print(power(3))      # 9 (uses default)
print(power(3, 3))   # 27
\`\`\`

### Keyword Arguments

\`\`\`python
def describe(name, age, city="Unknown"):
    print(f"{name}, {age}, from {city}")

describe(age=20, name="Bob", city="Tunis")
\`\`\`

### Return vs. Print

\`\`\`python
def bad_add(a, b):
    print(a + b)       # ❌ can't use the result elsewhere

def good_add(a, b):
    return a + b       # ✅ caller receives the value

result = good_add(3, 4)
print(result * 2)   # 14
\`\`\`

### Multiple Return Values

\`\`\`python
def min_max(numbers):
    return min(numbers), max(numbers)

lo, hi = min_max([3, 1, 4, 1, 5])
print(lo, hi)  # 1 5
\`\`\``,
    content_easy_markdown: `## Functions — Simple Version

A **function** is a named reusable block:
\`\`\`python
def square(x):
    return x * x

print(square(5))   # 25
print(square(9))   # 81
\`\`\`

**Rule**: Use \`return\` to send back a value — NOT \`print\`.

**Default values**: \`def greet(name, greeting="Hello"):\` lets you call it as \`greet("Alice")\` or \`greet("Alice", "Hi")\`.

Good functions do exactly one thing and do it well.`,
    forge_snippet: `# Functions in practice

def celsius_to_fahrenheit(c):
    """Convert Celsius to Fahrenheit."""
    return c * 9/5 + 32

def is_palindrome(s):
    """Check if a string reads the same forwards and backwards."""
    s = s.lower().replace(" ", "")
    return s == s[::-1]

def factorial(n):
    """Compute n! using a loop."""
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

# Higher-order functions
def apply_twice(f, x):
    """Apply function f twice to x."""
    return f(f(x))

print(apply_twice(lambda x: x * 2, 3))   # 12

# Testing our functions
print(celsius_to_fahrenheit(100))   # 212.0
print(is_palindrome("racecar"))     # True
print(is_palindrome("hello"))       # False
print(factorial(10))                # 3628800`
  },
  {
    title: "Scope and Namespaces",
    importance_level: "Essential",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "CS 121 > Unit 1: Core Syntax",
    first_principles: [
      "Scope determines where a variable is visible — local variables live inside functions",
      "Python looks up names using the LEGB rule: Local → Enclosing → Global → Built-in",
      "Avoiding global variables makes functions predictable and testable"
    ],
    learning_objectives: [
      "Distinguish between local and global variables",
      "Apply the LEGB name lookup rule",
      "Use the global and nonlocal keywords when necessary",
      "Explain why avoiding global state leads to better code"
    ],
    prerequisites: ["Functions"],
    content_markdown: `## Scope and Namespaces

### What is Scope?

**Scope** defines where in your program a variable is accessible.

**Local scope**: variables defined inside a function — only visible there.
**Global scope**: variables defined at the top level of a module.

### LEGB Rule

Python searches for names in this order:
1. **L**ocal: inside the current function
2. **E**nclosing: inside any enclosing functions (closures)
3. **G**lobal: at the module level
4. **B**uilt-in: Python built-ins like \`print\`, \`len\`, \`range\`

\`\`\`python
x = "global"   # global

def outer():
    x = "enclosing"   # enclosing

    def inner():
        x = "local"   # local
        print(x)      # "local" (L wins)

    inner()

outer()
print(x)   # "global" (unchanged)
\`\`\`

### The global Keyword

\`\`\`python
counter = 0

def increment():
    global counter      # ← tells Python to use the global variable
    counter += 1

increment()
increment()
print(counter)  # 2
\`\`\`

### Best Practice: Avoid global

Global variables make code hard to test and debug. Prefer passing arguments and returning values.

\`\`\`python
# BAD:  uses global state
count = 0
def add_one(): global count; count += 1

# GOOD: pure function, no side effects
def add_one(count): return count + 1
\`\`\``,
    content_easy_markdown: `## Scope — Simple Version

Variables defined inside a function only exist inside that function (local scope).

\`\`\`python
def my_func():
    x = 10   # local — only exists here
    print(x)

my_func()
print(x)    # ERROR — x doesn't exist out here!
\`\`\`

**LEGB rule**: Python looks for a variable in: Local → Enclosing function → Global → Built-in.

**Tip**: Avoid using \`global\`. Instead, pass data as arguments and return results — your code will be much cleaner.`,
    forge_snippet: `# Scope demonstration
x = "global"

def show_scope():
    x = "local"
    print(f"Inside: {x}")    # local

show_scope()
print(f"Outside: {x}")       # global

# Closure: function that remembers its enclosing scope
def make_counter(start=0):
    count = start
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter = make_counter()
print(counter())   # 1
print(counter())   # 2
print(counter())   # 3

# Pure function (no side effects) — best practice
def add_item(items, new_item):
    """Returns new list — doesn't modify original."""
    return items + [new_item]

original = [1, 2, 3]
updated = add_item(original, 4)
print(original)   # [1, 2, 3] — unchanged
print(updated)    # [1, 2, 3, 4]`
  },

  // ── Unit 2: Data Structures ───────────────────────────────────────────────
  {
    title: "Lists and Arrays",
    importance_level: "Essential",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "CS 121 > Unit 2: Data Structures",
    first_principles: [
      "A list is a mutable, ordered sequence — elements can be added, removed, or changed",
      "Indexing starts at 0 in Python (and most languages) — off-by-one is one of the most common bugs",
      "Lists are the fundamental building block for all higher-order data structures"
    ],
    learning_objectives: [
      "Create, index, slice, and modify Python lists",
      "Apply essential list methods: append, insert, remove, pop, sort, reverse",
      "Write list comprehensions for concise transformations",
      "Understand the difference between list mutation and reassignment"
    ],
    prerequisites: ["Loops (for and while)"],
    content_markdown: `## Lists and Arrays

### Creating Lists

\`\`\`python
empty = []
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]
nested = [[1, 2], [3, 4], [5, 6]]
\`\`\`

### Indexing and Slicing

\`\`\`python
fruits = ["apple", "banana", "cherry", "date"]

# Indexing: starts at 0
print(fruits[0])    # "apple"
print(fruits[-1])   # "date" (last element)
print(fruits[-2])   # "cherry"

# Slicing: [start:stop:step]
print(fruits[1:3])  # ["banana", "cherry"]
print(fruits[:2])   # ["apple", "banana"]
print(fruits[::2])  # every 2nd: ["apple", "cherry"]
print(fruits[::-1]) # reversed: ["date", "cherry", "banana", "apple"]
\`\`\`

### Modifying Lists

\`\`\`python
lst = [1, 2, 3]
lst.append(4)         # [1, 2, 3, 4]
lst.insert(1, 10)     # [1, 10, 2, 3, 4]
lst.remove(10)        # removes first occurrence of 10
lst.pop()             # removes and returns last item
lst.sort()            # sorts in place
lst.sort(reverse=True)
sorted_copy = sorted(lst)  # returns new sorted list
\`\`\`

### List Comprehensions

\`\`\`python
# Without comprehension
squares = []
for x in range(10):
    squares.append(x ** 2)

# With comprehension (Pythonic!)
squares = [x ** 2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
\`\`\`

### Common Operations

\`\`\`python
len([1, 2, 3])       # 3
sum([1, 2, 3])       # 6
min([3, 1, 4])       # 1
max([3, 1, 4])       # 4
3 in [1, 2, 3]       # True
[1] + [2, 3]         # [1, 2, 3]
[0] * 5              # [0, 0, 0, 0, 0]
\`\`\``,
    content_easy_markdown: `## Lists — Simple Version

A **list** stores multiple values in order:
\`\`\`python
grades = [85, 92, 78, 95]
print(grades[0])     # 85 (first item)
print(grades[-1])    # 95 (last item)
grades.append(88)    # add to end
\`\`\`

**Slicing**: \`grades[1:3]\` gets items at index 1 and 2.

**List comprehension** (shortcut): \`[x*2 for x in grades]\` doubles every grade.`,
    forge_snippet: `# Lists in action
numbers = [64, 34, 25, 12, 22, 11, 90]

# Sorting
numbers.sort()
print(numbers)   # [11, 12, 22, 25, 34, 64, 90]

# Slicing
print(numbers[:3])   # bottom 3: [11, 12, 22]
print(numbers[-3:])  # top 3: [34, 64, 90]

# List comprehension — filter and transform
even_squares = [x**2 for x in range(20) if x % 2 == 0]
print(even_squares)

# Matrix (list of lists) — 3x3 grid
matrix = [[1,2,3],[4,5,6],[7,8,9]]
for row in matrix:
    print(row)

# Transpose using comprehension
transposed = [[matrix[r][c] for r in range(3)] for c in range(3)]

# Flatten nested list
flat = [val for row in matrix for val in row]
print(flat)   # [1, 2, 3, 4, 5, 6, 7, 8, 9]`
  },
  {
    title: "Strings and String Manipulation",
    importance_level: "Essential",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "CS 121 > Unit 2: Data Structures",
    first_principles: [
      "Strings are immutable sequences of characters — you cannot change them, only create new ones",
      "Strings support all sequence operations: indexing, slicing, iteration",
      "String manipulation is one of the most frequent programming tasks in real-world applications"
    ],
    learning_objectives: [
      "Use string indexing, slicing, and common methods",
      "Format strings using f-strings and .format()",
      "Apply split(), join(), strip(), replace(), and find()",
      "Write string processing programs (palindrome, count words, etc.)"
    ],
    prerequisites: ["Lists and Arrays"],
    content_markdown: `## Strings and String Manipulation

### String Basics

\`\`\`python
s = "Hello, World!"
print(len(s))       # 13
print(s[0])         # 'H'
print(s[-1])        # '!'
print(s[7:12])      # 'World'
print(s.upper())    # 'HELLO, WORLD!'
print(s.lower())    # 'hello, world!'
\`\`\`

Strings are **immutable**: \`s[0] = 'J'\` raises TypeError.

### Essential String Methods

\`\`\`python
text = "  Hello, Python!  "

text.strip()           # "Hello, Python!" (remove whitespace)
text.split(", ")       # ["  Hello", "Python!  "]
"_".join(["a","b","c"]) # "a_b_c"
text.replace("Python", "World")
text.find("Python")    # index where found (-1 if not)
text.startswith("  He")  # True
text.count("l")        # count occurrences
\`\`\`

### String Checking Methods

\`\`\`python
"abc".isalpha()   # True (all letters)
"123".isdigit()   # True (all digits)
"abc123".isalnum() # True (letters and/or digits)
"  ".isspace()    # True
\`\`\`

### Multi-line Strings

\`\`\`python
poem = """
Roses are red,
Violets are blue,
Python is great,
And so are you.
"""
\`\`\`

### String Iteration

\`\`\`python
for char in "hello":
    print(char)

# Count vowels
vowels = sum(1 for c in text if c.lower() in "aeiou")
\`\`\``,
    content_easy_markdown: `## Strings — Simple Version

Strings are text. Use quotes (single or double):
\`\`\`python
name = "Alice"
print(name[0])      # 'A'
print(name[1:4])    # 'lic'
print(name.upper()) # 'ALICE'
\`\`\`

**Key methods**: \`.split()\`, \`.strip()\`, \`.replace()\`, \`.find()\`, \`.upper()\`, \`.lower()\`

**Important**: Strings are immutable — methods return NEW strings, they don't change the original.`,
    forge_snippet: `# String manipulation

# Word count and frequency
def word_frequency(text):
    words = text.lower().split()
    freq = {}
    for word in words:
        word = word.strip(".,!?;:")  # remove punctuation
        freq[word] = freq.get(word, 0) + 1
    return sorted(freq.items(), key=lambda x: -x[1])

text = "to be or not to be that is the question"
print(word_frequency(text)[:5])

# Caesar cipher
def caesar_encrypt(text, shift):
    result = []
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            result.append(chr((ord(char) - base + shift) % 26 + base))
        else:
            result.append(char)
    return ''.join(result)

print(caesar_encrypt("Hello World", 3))   # "Khoor Zruog"

# Palindrome check
def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

print(is_palindrome("A man a plan a canal Panama"))  # True`
  },
  {
    title: "Tuples and Immutability",
    importance_level: "Advanced",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "CS 121 > Unit 2: Data Structures",
    first_principles: [
      "A tuple is an immutable ordered sequence — once created, it cannot be modified",
      "Immutability enables safety: tuples can be used as dictionary keys; lists cannot",
      "Tuples represent fixed records; lists represent collections that may grow or shrink"
    ],
    learning_objectives: [
      "Create and use tuples for multi-value returns and fixed records",
      "Unpack tuples into variables",
      "Distinguish when to use tuples vs. lists",
      "Use named tuples for readable records"
    ],
    prerequisites: ["Lists and Arrays"],
    content_markdown: `## Tuples and Immutability

### What is a Tuple?

\`\`\`python
point = (3, 4)
rgb = (255, 128, 0)
person = ("Alice", 20, "CS")
single = (42,)    # note trailing comma — required for single-element tuple
empty = ()
\`\`\`

### Immutability

\`\`\`python
t = (1, 2, 3)
t[0] = 10   # TypeError: 'tuple' object does not support item assignment
\`\`\`

### Tuple Unpacking

\`\`\`python
x, y = (3, 4)
name, age, major = ("Alice", 20, "CS")

# Swap variables elegantly (Python idiom)
a, b = 1, 2
a, b = b, a   # swap — no temp variable needed!

# Ignore values with _
first, _, last = ("Alice", "Middle", "Smith")
\`\`\`

### When to Use Tuples

- **Return multiple values** from a function
- **Dictionary keys** (tuples are hashable, lists are not)
- **Fixed records** (a coordinate, an RGB color, a database row)

\`\`\`python
# Dictionary with tuple keys
distance = {}
distance[(0,0), (3,4)] = 5.0  # coordinate pairs as keys
\`\`\`

### Named Tuples

\`\`\`python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)  # more readable than p[0], p[1]
print(p)          # Point(x=3, y=4)
\`\`\``,
    content_easy_markdown: `## Tuples — Simple Version

A **tuple** is like a list but you can't change it after creation:
\`\`\`python
coordinates = (10, 20)
print(coordinates[0])  # 10
\`\`\`

**Tuple unpacking** is very useful:
\`\`\`python
x, y = (10, 20)   # x=10, y=20
\`\`\`

Use tuples when data shouldn't change: coordinates, RGB colors, database records. Use lists when you need to add/remove items.`,
    forge_snippet: `from collections import namedtuple

# Named tuple for student records
Student = namedtuple("Student", ["name", "id", "gpa"])

students = [
    Student("Alice", 1001, 3.9),
    Student("Bob", 1002, 3.5),
    Student("Carol", 1003, 3.7),
]

# Sort by GPA
top_student = max(students, key=lambda s: s.gpa)
print(f"Top student: {top_student.name} ({top_student.gpa})")

# Enumerate with tuple unpacking
for rank, student in enumerate(sorted(students, key=lambda s: -s.gpa), 1):
    print(f"{rank}. {student.name}: {student.gpa}")

# Tuple as dict key (e.g., 2D grid)
grid = {}
grid[(0, 0)] = "start"
grid[(3, 4)] = "end"
print(grid[(0, 0)])  # "start"`
  },
  {
    title: "Dictionaries (Hash Maps)",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "CS 121 > Unit 2: Data Structures",
    first_principles: [
      "A dictionary maps keys to values — the most versatile data structure in Python",
      "Dictionary lookup is O(1) — constant time, regardless of size, due to hashing",
      "Keys must be immutable (hashable); values can be anything"
    ],
    learning_objectives: [
      "Create, access, update, and delete dictionary entries",
      "Iterate over keys, values, and items",
      "Use dict.get(), setdefault(), and defaultdict for safe access",
      "Build a frequency counter and implement a simple in-memory database"
    ],
    prerequisites: ["Tuples and Immutability"],
    content_markdown: `## Dictionaries

### Creating Dictionaries

\`\`\`python
# Literal syntax
student = {"name": "Alice", "age": 20, "gpa": 3.9}

# From pairs
d = dict([("a", 1), ("b", 2)])

# Dict comprehension
squares = {x: x**2 for x in range(10)}
\`\`\`

### Accessing and Modifying

\`\`\`python
student["name"]         # "Alice"
student["email"]        # KeyError — key doesn't exist!
student.get("email")    # None (safe, no error)
student.get("email", "N/A")  # "N/A" (default value)

student["email"] = "alice@example.com"  # add new key
student["age"] = 21                     # update existing
del student["gpa"]                      # delete
\`\`\`

### Iterating

\`\`\`python
for key in student:              # iterate keys
    print(key)

for value in student.values():   # iterate values
    print(value)

for key, value in student.items():  # iterate both
    print(f"{key}: {value}")
\`\`\`

### Frequency Counter (Classic Pattern)

\`\`\`python
text = "abracadabra"
freq = {}
for char in text:
    freq[char] = freq.get(char, 0) + 1
# {'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1}

# Or use Counter from collections:
from collections import Counter
print(Counter(text))
\`\`\`

### Nested Dictionaries

\`\`\`python
database = {
    "alice": {"age": 20, "courses": ["CS 121", "MATH 111"]},
    "bob":   {"age": 22, "courses": ["CS 161"]}
}
print(database["alice"]["courses"][0])  # "CS 121"
\`\`\``,
    content_easy_markdown: `## Dictionaries — Simple Version

A **dictionary** maps keys to values (like a real dictionary maps words to definitions):
\`\`\`python
person = {"name": "Ali", "age": 21}
print(person["name"])   # "Ali"
person["gpa"] = 3.8     # add new entry
\`\`\`

**Safe access**: \`person.get("email", "unknown")\` returns "unknown" instead of crashing if key doesn't exist.

Dictionaries are O(1) lookup — super fast. Great for: phone books, counting things, JSON-like data.`,
    forge_snippet: `from collections import Counter, defaultdict

# Frequency counter
text = "the quick brown fox jumps over the lazy dog"
word_count = Counter(text.split())
print(word_count.most_common(5))

# defaultdict — no KeyError for missing keys
graph = defaultdict(list)
graph["A"].append("B")
graph["A"].append("C")
graph["B"].append("D")
print(dict(graph))  # {'A': ['B', 'C'], 'B': ['D']}

# Simple grade book
grade_book = {}

def add_grade(student, subject, score):
    if student not in grade_book:
        grade_book[student] = {}
    grade_book[student][subject] = score

def get_average(student):
    grades = grade_book.get(student, {})
    return sum(grades.values()) / len(grades) if grades else 0

add_grade("Alice", "Math", 95)
add_grade("Alice", "CS", 88)
print(f"Alice's average: {get_average('Alice'):.1f}")`
  },
  {
    title: "Sets",
    importance_level: "Advanced",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "CS 121 > Unit 2: Data Structures",
    first_principles: [
      "A Python set is a mutable, unordered collection of unique elements — no duplicates allowed",
      "Set operations (union, intersection, difference) run in O(n) and mirror mathematical set theory",
      "Sets are perfect for membership testing — O(1) lookup vs O(n) for lists"
    ],
    learning_objectives: [
      "Create sets and perform set operations in Python",
      "Use sets for deduplication and fast membership testing",
      "Compare frozenset vs set",
      "Apply set operations to real problems like common friends, unique visitors"
    ],
    prerequisites: ["Dictionaries (Hash Maps)"],
    content_markdown: `## Sets

### Creating and Using Sets

\`\`\`python
evens = {2, 4, 6, 8, 10}
primes = {2, 3, 5, 7, 11}

# Sets eliminate duplicates automatically
data = [1, 2, 2, 3, 3, 3, 4]
unique = set(data)   # {1, 2, 3, 4}

# From comprehension
vowels = {c for c in "hello world" if c in "aeiou"}
\`\`\`

### Set Operations

\`\`\`python
A = {1, 2, 3, 4}
B = {3, 4, 5, 6}

A | B   # Union:        {1,2,3,4,5,6}
A & B   # Intersection: {3,4}
A - B   # Difference:   {1,2}
A ^ B   # Symmetric Δ:  {1,2,5,6}

A.issubset(B)      # False
A.issuperset({1,2}) # True
A.isdisjoint({7,8}) # True (no common elements)
\`\`\`

### Membership Testing (O(1) vs O(n))

\`\`\`python
# List: O(n) — checks every element
big_list = list(range(1_000_000))
99999 in big_list   # slow (up to 1M comparisons)

# Set: O(1) — hash lookup
big_set = set(range(1_000_000))
99999 in big_set    # instant!
\`\`\`

### frozenset

Immutable version of set — can be used as dict keys:

\`\`\`python
fs = frozenset({1, 2, 3})
# fs.add(4)   # AttributeError — immutable
\`\`\`

### Real-world Pattern: Common Friends

\`\`\`python
alice_friends = {"Bob", "Carol", "Dave", "Eve"}
bob_friends   = {"Alice", "Carol", "Frank", "Eve"}

common = alice_friends & bob_friends
print(f"Common friends: {common}")  # {'Carol', 'Eve'}
\`\`\``,
    content_easy_markdown: `## Sets — Simple Version

A **set** stores unique items — no duplicates, no order:
\`\`\`python
nums = {1, 2, 3, 3, 2}
print(nums)   # {1, 2, 3}
\`\`\`

**Useful for:**
- Removing duplicates from a list: \`unique = list(set(my_list))\`
- Fast "is X in this collection?" checks
- Finding what two collections have in common: \`A & B\`

Sets are much faster than lists for membership testing.`,
    forge_snippet: `# Sets for real tasks
import time

# Deduplication
emails_with_dups = ["a@b.com", "c@d.com", "a@b.com", "e@f.com", "c@d.com"]
unique_emails = list(set(emails_with_dups))
print(f"Unique: {len(unique_emails)} emails")

# Performance comparison
data = list(range(1_000_000))
data_list, data_set = data, set(data)

start = time.time()
999_999 in data_list
print(f"List: {time.time()-start:.4f}s")

start = time.time()
999_999 in data_set
print(f"Set:  {time.time()-start:.6f}s")   # much faster!

# Set operations application
required_skills = {"Python", "SQL", "Git", "Linux"}
candidate1 = {"Python", "JavaScript", "Git", "Docker"}
candidate2 = {"Python", "SQL", "Git", "Linux", "Docker"}

match1 = required_skills & candidate1
match2 = required_skills & candidate2
missing1 = required_skills - candidate1

print(f"Candidate 1 match: {len(match1)}/{len(required_skills)}")
print(f"Candidate 2 match: {len(match2)}/{len(required_skills)}")
print(f"Candidate 1 missing: {missing1}")`
  },

  // ── Unit 3: OOP ───────────────────────────────────────────────────────────
  {
    title: "Introduction to Object-Oriented Programming",
    importance_level: "Advanced",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "CS 121 > Unit 3: Object-Oriented Programming",
    first_principles: [
      "OOP models the world as objects that have state (attributes) and behavior (methods)",
      "Encapsulation bundles data and the operations that work on it into a single unit",
      "The four pillars of OOP are: Encapsulation, Abstraction, Inheritance, Polymorphism"
    ],
    learning_objectives: [
      "Explain the four pillars of OOP and why they matter",
      "Distinguish between procedural and object-oriented thinking",
      "Identify objects, classes, attributes, and methods in a real-world scenario",
      "Understand why OOP improves code organization in large programs"
    ],
    prerequisites: ["Functions", "Dictionaries (Hash Maps)"],
    content_markdown: `## Introduction to Object-Oriented Programming

### What is OOP?

**Object-Oriented Programming** organizes code around **objects** — entities that combine data and behavior.

Everything in Python is an object: integers, strings, lists, functions, even modules.

### The Four Pillars

| Pillar | Meaning | Benefit |
|--------|---------|---------|
| **Encapsulation** | Bundle data + methods together | Data protection, clean interface |
| **Abstraction** | Hide implementation details | Simplicity, reduced complexity |
| **Inheritance** | Child classes extend parent classes | Code reuse |
| **Polymorphism** | Different classes respond to same message | Flexibility |

### Procedural vs. OOP

**Procedural** (what you've been doing):
\`\`\`python
student_name = "Alice"
student_gpa = 3.9
def print_student(name, gpa): ...
def update_gpa(gpa, new): ...
\`\`\`

**OOP** (bundled together):
\`\`\`python
class Student:
    def __init__(self, name, gpa):
        self.name = name
        self.gpa = gpa
    def print_info(self): ...
    def update_gpa(self, new): ...
\`\`\`

### Real World Analogy

Think of a **class** as a blueprint (e.g., "Car blueprint") and an **object** as an instance (e.g., "Alice's red 2022 Toyota").

- Class: defines the structure
- Object: a specific instance with concrete values

### Why OOP?

- **Larger programs**: 1000 functions are hard to manage; 50 well-designed classes are not
- **Modularity**: each class is a self-contained unit
- **Teamwork**: different team members own different classes
- **Reuse**: inheritance lets you extend existing classes`,
    content_easy_markdown: `## OOP — Simple Version

**OOP** organizes code around "things" (objects) instead of just functions.

A **class** is a blueprint. An **object** is one specific instance of that blueprint.

Example: "Dog" is a class. Your dog "Rex" is an object.

Rex has:
- **Attributes** (data): name="Rex", breed="Labrador", age=3
- **Methods** (behavior): bark(), fetch(), eat()

OOP makes large programs organized and manageable.`,
    forge_snippet: `# OOP concept demonstration

# WITHOUT OOP (hard to manage at scale)
student1_name = "Alice"
student1_gpa = 3.9
student2_name = "Bob"
student2_gpa = 3.5

# WITH OOP (clean and scalable)
class Student:
    school = "MUST University"   # class attribute (shared)

    def __init__(self, name, gpa):
        self.name = name          # instance attribute
        self.gpa = gpa

    def summary(self):
        return f"{self.name} at {self.school} | GPA: {self.gpa:.2f}"

    def is_honors(self):
        return self.gpa >= 3.7

s1 = Student("Alice", 3.9)
s2 = Student("Bob", 3.5)

print(s1.summary())
print(s2.summary())
print(f"Alice honors: {s1.is_honors()}")

# All objects share the class attribute
print(Student.school)   # "MUST University"`
  },
  {
    title: "Classes and Objects",
    importance_level: "Advanced",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "CS 121 > Unit 3: Object-Oriented Programming",
    first_principles: [
      "__init__ is the constructor — it initializes the object's state when it is created",
      "self refers to the specific instance being operated on — it's the object itself",
      "Dunder (double underscore) methods like __str__, __len__ make classes work with Python built-ins"
    ],
    learning_objectives: [
      "Write a complete class with __init__, instance methods, and __str__",
      "Create multiple objects from the same class",
      "Use class attributes vs. instance attributes correctly",
      "Implement __str__, __repr__, __eq__, and __lt__ for custom behavior"
    ],
    prerequisites: ["Introduction to Object-Oriented Programming"],
    content_markdown: `## Classes and Objects

### Full Class Example

\`\`\`python
class BankAccount:
    interest_rate = 0.03   # class attribute

    def __init__(self, owner, balance=0):
        self.owner = owner       # instance attributes
        self.balance = balance
        self.transactions = []

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.balance += amount
        self.transactions.append(("deposit", amount))

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        self.transactions.append(("withdraw", amount))

    def apply_interest(self):
        interest = self.balance * BankAccount.interest_rate
        self.deposit(interest)

    def __str__(self):   # called by print()
        return f"Account({self.owner}, ${self.balance:.2f})"

    def __repr__(self):  # called in interactive mode
        return f"BankAccount('{self.owner}', {self.balance})"

acc = BankAccount("Alice", 1000)
acc.deposit(500)
acc.withdraw(200)
acc.apply_interest()
print(acc)   # Account(Alice, $1389.00)
\`\`\`

### Class vs. Instance Attributes

- **Class attribute**: shared by all instances (\`interest_rate\`)
- **Instance attribute**: unique to each object (\`self.owner\`, \`self.balance\`)

### Dunder (Magic) Methods

| Method | Triggered by |
|--------|-------------|
| \`__init__\` | Object creation |
| \`__str__\` | \`print(obj)\`, \`str(obj)\` |
| \`__len__\` | \`len(obj)\` |
| \`__eq__\` | \`obj1 == obj2\` |
| \`__lt__\` | \`obj1 < obj2\` |
| \`__add__\` | \`obj1 + obj2\` |

Implementing these makes your class feel "native" to Python.`,
    content_easy_markdown: `## Classes — Simple Version

A **class** bundles data and functions together:
\`\`\`python
class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def bark(self):
        print(f"{self.name} says: Woof!")

rex = Dog("Rex", "Labrador")
rex.bark()   # "Rex says: Woof!"
\`\`\`

- \`__init__\`: runs when you create an object
- \`self\`: refers to the specific object being used
- Define methods like regular functions, but always add \`self\` as first parameter`,
    forge_snippet: `class Vector2D:
    """2D vector with full operator support."""

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __repr__(self):
        return f"Vector2D({self.x}, {self.y})"

    def __add__(self, other):
        return Vector2D(self.x + other.x, self.y + other.y)

    def __mul__(self, scalar):
        return Vector2D(self.x * scalar, self.y * scalar)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def magnitude(self):
        return (self.x**2 + self.y**2) ** 0.5

    def dot(self, other):
        return self.x * other.x + self.y * other.y

v1 = Vector2D(3, 4)
v2 = Vector2D(1, 2)
print(v1 + v2)          # (4, 6)
print(v1 * 2)           # (6, 8)
print(v1.magnitude())   # 5.0
print(v1.dot(v2))       # 11`
  },
  {
    title: "Inheritance and Polymorphism",
    importance_level: "Advanced",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "CS 121 > Unit 3: Object-Oriented Programming",
    first_principles: [
      "Inheritance models the 'is-a' relationship — a Dog IS-A Animal",
      "Polymorphism means different classes respond to the same method call in their own way",
      "super() calls the parent class implementation — prevents code duplication in overridden methods"
    ],
    learning_objectives: [
      "Create a class hierarchy using inheritance",
      "Override parent methods and use super()",
      "Demonstrate polymorphism with a list of different subclass objects",
      "Apply the Liskov Substitution Principle"
    ],
    prerequisites: ["Classes and Objects"],
    content_markdown: `## Inheritance and Polymorphism

### Inheritance

A **child class** inherits all attributes and methods of its **parent class** and can add or override them.

\`\`\`python
class Animal:
    def __init__(self, name, sound):
        self.name = name
        self.sound = sound

    def speak(self):
        return f"{self.name} says {self.sound}"

    def __str__(self):
        return f"Animal: {self.name}"


class Dog(Animal):             # Dog inherits from Animal
    def __init__(self, name):
        super().__init__(name, "Woof")  # call parent __init__
        self.tricks = []

    def learn_trick(self, trick):
        self.tricks.append(trick)

    def speak(self):           # override parent method
        base = super().speak()
        return base + "!"


class Cat(Animal):
    def __init__(self, name):
        super().__init__(name, "Meow")

    def purr(self):
        return f"{self.name} purrs..."
\`\`\`

### Polymorphism

\`\`\`python
animals = [Dog("Rex"), Cat("Whiskers"), Dog("Buddy")]

for animal in animals:
    print(animal.speak())   # each responds differently
# Rex says Woof!!
# Whiskers says Meow
# Buddy says Woof!!
\`\`\`

The same \`speak()\` call produces different results depending on the actual type.

### isinstance() and issubclass()

\`\`\`python
rex = Dog("Rex")
isinstance(rex, Dog)     # True
isinstance(rex, Animal)  # True — Dog IS-A Animal
isinstance(rex, Cat)     # False
\`\`\`

### Liskov Substitution Principle

Any code that works with Animal objects should work with Dog or Cat objects too. Good design — child classes extend, don't break, their parents.`,
    content_easy_markdown: `## Inheritance — Simple Version

**Inheritance**: a child class gets everything from its parent, plus can add its own stuff.
\`\`\`python
class Animal:
    def speak(self): return "..."

class Dog(Animal):
    def speak(self): return "Woof!"  # override
\`\`\`

**Polymorphism**: different objects respond to the same method call in their own way.
\`\`\`python
for animal in [Dog(), Cat(), Bird()]:
    print(animal.speak())  # each animal responds differently
\`\`\`

Use \`super()\` to call the parent's version of a method.`,
    forge_snippet: `class Shape:
    def area(self): raise NotImplementedError
    def perimeter(self): raise NotImplementedError
    def describe(self):
        return f"{type(self).__name__}: area={self.area():.2f}, perimeter={self.perimeter():.2f}"

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self): return 3.14159 * self.radius**2
    def perimeter(self): return 2 * 3.14159 * self.radius

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    def area(self): return self.width * self.height
    def perimeter(self): return 2 * (self.width + self.height)

class Square(Rectangle):
    def __init__(self, side):
        super().__init__(side, side)  # square is a rectangle

shapes = [Circle(5), Rectangle(4, 6), Square(3)]
for s in shapes:
    print(s.describe())

# Total area — polymorphism makes this clean
total = sum(s.area() for s in shapes)
print(f"Total area: {total:.2f}")`
  },
  {
    title: "Encapsulation and Abstraction",
    importance_level: "Advanced",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "CS 121 > Unit 3: Object-Oriented Programming",
    first_principles: [
      "Encapsulation protects internal state — external code should go through the defined interface",
      "Abstraction hides 'how it works' and exposes only 'what it does' — reducing cognitive load",
      "Properties (@property) let you add validation to attribute access without changing the interface"
    ],
    learning_objectives: [
      "Implement private attributes using Python's naming convention (_ and __)",
      "Write getter and setter methods using @property",
      "Explain the interface vs. implementation distinction",
      "Design a class with a clear, minimal public interface"
    ],
    prerequisites: ["Classes and Objects"],
    content_markdown: `## Encapsulation and Abstraction

### Encapsulation: Protecting State

Python uses naming conventions (not strict access control):

\`\`\`python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius  # _ = "private by convention"

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Below absolute zero!")
        self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9/5 + 32


t = Temperature(100)
print(t.celsius)        # 100 (getter)
print(t.fahrenheit)     # 212.0
t.celsius = 0           # setter validates input
print(t.celsius)        # 0
t.celsius = -500        # ValueError!
\`\`\`

### Abstraction: The Public Interface

Users of your class should not need to know implementation details:

\`\`\`python
class Stack:
    def __init__(self):
        self.__data = []   # __ = name mangling, even more private

    def push(self, item): self.__data.append(item)
    def pop(self): return self.__data.pop()
    def peek(self): return self.__data[-1]
    def is_empty(self): return len(self.__data) == 0
    def __len__(self): return len(self.__data)
\`\`\`

Users call \`stack.push()\`, \`stack.pop()\`. They don't care that internally it uses a list.

### Why This Matters

Encapsulation lets you:
1. Change the internal implementation without breaking user code
2. Add validation to prevent invalid states
3. Keep the complexity manageable`,
    content_easy_markdown: `## Encapsulation — Simple Version

**Encapsulation** means hiding the internals — users interact through a clean interface.

In Python, prefix with \`_\` to signal "this is private":
\`\`\`python
class BankAccount:
    def __init__(self):
        self._balance = 0   # don't touch directly!

    def deposit(self, amount):
        if amount > 0:
            self._balance += amount
\`\`\`

**@property** lets you add validation without changing how the attribute is accessed.`,
    forge_snippet: `class Temperature:
    def __init__(self, celsius=0):
        self._celsius = None
        self.celsius = celsius   # uses the setter

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError(f"{value}°C is below absolute zero")
        self._celsius = float(value)

    @property
    def fahrenheit(self):
        return self._celsius * 9/5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        self.celsius = (value - 32) * 5/9

    def __str__(self):
        return f"{self._celsius:.2f}°C / {self.fahrenheit:.2f}°F"

# Usage
boiling = Temperature(100)
print(boiling)           # 100.00°C / 212.00°F

boiling.fahrenheit = 32  # set via Fahrenheit
print(boiling.celsius)   # 0.0°C`
  },

  // ── Unit 4: Algorithms ────────────────────────────────────────────────────
  {
    title: "Recursion",
    importance_level: "Advanced",
    estimated_time: "70 mins",
    estimated_time_minutes: 70,
    breadcrumb_path: "CS 121 > Unit 4: Algorithms",
    first_principles: [
      "Recursion solves a problem by reducing it to a smaller version of the same problem",
      "Every recursive function needs a base case (to stop) and a recursive case (to reduce)",
      "Recursion and mathematical induction are two sides of the same coin"
    ],
    learning_objectives: [
      "Identify recursive structure in a problem",
      "Write recursive functions with correct base and recursive cases",
      "Trace through a recursion tree to understand execution",
      "Compare recursive vs. iterative solutions for time and space"
    ],
    prerequisites: ["Functions", "Mathematical Induction"],
    content_markdown: `## Recursion

### What is Recursion?

A function that calls itself. Each call must work toward the **base case** to avoid infinite recursion.

\`\`\`python
def countdown(n):
    if n <= 0:          # base case: stop here
        print("Done!")
        return
    print(n)
    countdown(n - 1)    # recursive case: smaller problem

countdown(5)  # 5, 4, 3, 2, 1, Done!
\`\`\`

### The Two Rules

1. **Base case**: When is the answer trivially known? (No recursion needed)
2. **Recursive case**: How do you reduce the problem to a smaller version?

### Classic Examples

**Factorial**:
\`\`\`python
def factorial(n):
    if n == 0: return 1           # base: 0! = 1
    return n * factorial(n - 1)   # recursive: n! = n * (n-1)!
\`\`\`

**Fibonacci**:
\`\`\`python
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)
\`\`\`

**Tower of Hanoi**:
\`\`\`python
def hanoi(n, source, target, helper):
    if n == 1:
        print(f"Move disk 1 from {source} to {target}")
        return
    hanoi(n-1, source, helper, target)
    print(f"Move disk {n} from {source} to {target}")
    hanoi(n-1, helper, target, source)
\`\`\`

### Call Stack

Each function call adds a frame to the call stack. Too many calls → **RecursionError** (stack overflow).

\`\`\`python
import sys
sys.setrecursionlimit(10000)   # Python's default is 1000
\`\`\`

### When to Use Recursion

✅ Tree/graph traversal
✅ Divide-and-conquer algorithms (merge sort, quick sort)
✅ Mathematical definitions (factorial, Fibonacci)
✅ Backtracking problems (maze solving, Sudoku)

⚠️ Avoid for simple loops — iteration is clearer and faster`,
    content_easy_markdown: `## Recursion — Simple Version

A **recursive** function calls itself. It needs two things:
1. **Base case**: stop condition (e.g., n==0)
2. **Recursive case**: call itself with a smaller input

\`\`\`python
def factorial(n):
    if n == 0: return 1        # base case
    return n * factorial(n-1)  # recursive case

print(factorial(5))  # 120
\`\`\`

Think of it as: solving a big problem by solving a slightly smaller problem first. Eventually you reach the base case and work back up.`,
    forge_snippet: `import sys
sys.setrecursionlimit(5000)

# Factorial (iterative vs recursive)
def factorial_iter(n):
    result = 1
    for i in range(2, n+1): result *= i
    return result

def factorial_rec(n):
    return 1 if n <= 1 else n * factorial_rec(n-1)

# Merge sort — classic recursive divide-and-conquer
def merge_sort(arr):
    if len(arr) <= 1: return arr   # base case
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])    # sort left half
    right = merge_sort(arr[mid:])   # sort right half
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]

data = [64, 34, 25, 12, 22, 11, 90]
print(merge_sort(data))  # [11, 12, 22, 25, 34, 64, 90]

# Binary search (recursive)
def binary_search(arr, target, lo=0, hi=None):
    if hi is None: hi = len(arr) - 1
    if lo > hi: return -1
    mid = (lo + hi) // 2
    if arr[mid] == target: return mid
    if arr[mid] < target: return binary_search(arr, target, mid+1, hi)
    return binary_search(arr, target, lo, mid-1)`
  },
  {
    title: "Searching Algorithms",
    importance_level: "Advanced",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "CS 121 > Unit 4: Algorithms",
    first_principles: [
      "Linear search tries every element — O(n) worst case — no assumptions about order",
      "Binary search requires sorted data but is O(log n) — halves the search space each step",
      "The trade-off between linear and binary search is preprocessing cost vs. query speed"
    ],
    learning_objectives: [
      "Implement linear search and analyze its O(n) complexity",
      "Implement binary search iteratively and recursively with O(log n) complexity",
      "Explain why binary search requires sorted data",
      "Use Python's bisect module for efficient sorted list operations"
    ],
    prerequisites: ["Loops (for and while)", "Recursion"],
    content_markdown: `## Searching Algorithms

### Linear Search

Check every element until found. No assumptions about order.

\`\`\`python
def linear_search(arr, target):
    for i, item in enumerate(arr):
        if item == target:
            return i
    return -1    # not found
\`\`\`

**Complexity**: O(n) — must check all n elements in worst case.

### Binary Search

Requires a **sorted** array. Works by halving the search space:

\`\`\`python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1    # target is in right half
        else:
            hi = mid - 1    # target is in left half
    return -1
\`\`\`

**Complexity**: O(log n) — each step eliminates HALF the remaining elements.

### Why log n is so Fast

| n | Binary search steps |
|---|---------------------|
| 1,000 | ≤ 10 |
| 1,000,000 | ≤ 20 |
| 1,000,000,000 | ≤ 30 |

Binary search can find an element among 1 billion in ≤ 30 comparisons!

### Python Built-ins

\`\`\`python
# Linear
3 in [1, 2, 3, 4]          # True
[1,2,3].index(3)            # 2

# Binary (bisect module)
import bisect
arr = [1, 3, 5, 7, 9]
bisect.bisect_left(arr, 5)  # 2 (index where 5 is)
\`\`\``,
    content_easy_markdown: `## Searching — Simple Version

**Linear search**: Go through every item one by one → O(n). Simple, works on anything.

**Binary search**: Must be sorted. Check the middle, eliminate half → O(log n). Very fast!

Example: Binary searching a phone book with 1 million entries takes at most 20 comparisons. Linear search could take 1 million!

**Rule**: If your data is sorted, always use binary search.`,
    forge_snippet: `import bisect
import time

# Linear vs Binary search performance
def linear_search(arr, target):
    for i, x in enumerate(arr):
        if x == target: return i
    return -1

def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

n = 1_000_000
data = sorted(range(n))
target = 999_999

t0 = time.time()
linear_search(data, target)
t1 = time.time()
binary_search(data, target)
t2 = time.time()

print(f"Linear: {(t1-t0)*1000:.2f}ms")
print(f"Binary: {(t2-t1)*1000:.4f}ms")

# Find insert position (bisect)
sorted_scores = [72, 78, 85, 89, 95]
new_score = 82
pos = bisect.bisect_left(sorted_scores, new_score)
sorted_scores.insert(pos, new_score)
print(sorted_scores)  # [72, 78, 82, 85, 89, 95]`
  },
  {
    title: "Sorting Algorithms",
    importance_level: "Advanced",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "CS 121 > Unit 4: Algorithms",
    first_principles: [
      "Sorting organizes data to enable faster search and many other operations",
      "Simple algorithms (bubble, selection, insertion) are O(n²) — slow for large data",
      "Efficient algorithms (merge sort, quick sort) are O(n log n) — the theoretical optimum for comparison sorts"
    ],
    learning_objectives: [
      "Implement and trace bubble sort, selection sort, and insertion sort",
      "Analyze and compare O(n²) sorting algorithms",
      "Understand how merge sort achieves O(n log n) through divide-and-conquer",
      "Use Python's built-in sort() and sorted() with custom key functions"
    ],
    prerequisites: ["Searching Algorithms"],
    content_markdown: `## Sorting Algorithms

### Bubble Sort

Repeatedly swap adjacent elements if out of order.

\`\`\`python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):   # shrinks each pass
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
\`\`\`

**Complexity**: O(n²) time, O(1) space.

### Selection Sort

Find minimum, swap to front. Repeat.

\`\`\`python
def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = min(range(i, len(arr)), key=arr.__getitem__)
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
\`\`\`

### Insertion Sort

Build sorted section by inserting elements one at a time.

\`\`\`python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr
\`\`\`

**Best for**: nearly-sorted data → O(n). Python's Timsort is based on this.

### Complexity Comparison

| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) |
| Selection | O(n²) | O(n²) | O(n²) | O(1) |
| Insertion | O(n) | O(n²) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Python sort() | O(n) | O(n log n) | O(n log n) | O(n) |

### Python Built-in

\`\`\`python
students = [("Alice",92),("Bob",78),("Carol",95)]
students.sort(key=lambda s: s[1], reverse=True)  # sort by grade desc
\`\`\``,
    content_easy_markdown: `## Sorting — Simple Version

Common sorting algorithms from slowest to fastest:

- **Bubble sort** O(n²): compare neighbors, swap if wrong order. Simple but slow.
- **Selection sort** O(n²): find minimum, move to front. Simple.
- **Insertion sort** O(n²): insert each element in the right place. Fast on nearly-sorted data.
- **Merge sort** O(n log n): split in half, sort each, merge. Much faster for large lists.

In real code, just use Python's built-in \`list.sort()\` — it's Timsort (O(n log n), very optimized).`,
    forge_snippet: `import time, random

def bubble_sort(arr):
    arr = arr.copy()
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
        if not swapped: break  # optimization: already sorted
    return arr

def insertion_sort(arr):
    arr = arr.copy()
    for i in range(1, len(arr)):
        key, j = arr[i], i-1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]; j -= 1
        arr[j+1] = key
    return arr

# Performance test
n = 5000
data = [random.randint(0, 10000) for _ in range(n)]

t0 = time.time(); bubble_sort(data); print(f"Bubble: {time.time()-t0:.3f}s")
t0 = time.time(); insertion_sort(data); print(f"Insertion: {time.time()-t0:.3f}s")
t0 = time.time(); sorted(data); print(f"Python built-in: {time.time()-t0:.3f}s")

# Custom sort key
students = [("Alice",92,"CS"),("Bob",78,"Math"),("Carol",95,"CS")]
by_grade = sorted(students, key=lambda s: s[1], reverse=True)
cs_students = [s for s in sorted(students, key=lambda s: (s[2], -s[1]))]
print(by_grade)
print(cs_students)`
  },
  {
    title: "File I/O and Exception Handling",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "CS 121 > Unit 4: Algorithms",
    first_principles: [
      "Files persist data beyond the program's runtime — they are the simplest form of storage",
      "Exceptions represent errors that disrupt normal flow — handling them prevents crashes",
      "The with statement (context manager) guarantees files are closed even if an error occurs"
    ],
    learning_objectives: [
      "Read and write text files using open() and the with statement",
      "Handle common exceptions with try/except/finally",
      "Raise custom exceptions with informative messages",
      "Process CSV data using Python's csv module"
    ],
    prerequisites: ["Functions", "Lists and Arrays"],
    content_markdown: `## File I/O and Exception Handling

### Reading Files

\`\`\`python
# Read entire file
with open("data.txt", "r") as f:
    content = f.read()

# Read line by line (memory-efficient for large files)
with open("data.txt", "r") as f:
    for line in f:
        print(line.strip())

# Read all lines into a list
with open("data.txt") as f:
    lines = f.readlines()
\`\`\`

### Writing Files

\`\`\`python
with open("output.txt", "w") as f:   # "w" overwrites
    f.write("Hello\\n")

with open("log.txt", "a") as f:       # "a" appends
    f.write("New entry\\n")
\`\`\`

### Exception Handling

\`\`\`python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
except ValueError:
    print("Wrong type!")
else:
    print("No errors!")   # runs if no exception
finally:
    print("Always runs")  # cleanup code
\`\`\`

### Common Exception Types

| Exception | When |
|-----------|------|
| ValueError | Wrong value type/range |
| TypeError | Wrong type |
| IndexError | List index out of range |
| KeyError | Dict key not found |
| FileNotFoundError | File doesn't exist |
| ZeroDivisionError | Division by zero |

### Custom Exceptions

\`\`\`python
class InsufficientFundsError(Exception):
    def __init__(self, amount, balance):
        self.amount = amount
        self.balance = balance
        super().__init__(f"Cannot withdraw ${amount}. Balance: ${balance}")

raise InsufficientFundsError(100, 50)
\`\`\``,
    content_easy_markdown: `## Files and Exceptions — Simple Version

**Read a file:**
\`\`\`python
with open("data.txt") as f:
    content = f.read()
\`\`\`

**Write a file:**
\`\`\`python
with open("output.txt", "w") as f:
    f.write("Hello!")
\`\`\`

**Handle errors:**
\`\`\`python
try:
    number = int(input("Enter a number: "))
except ValueError:
    print("That's not a number!")
\`\`\`

Always use \`with\` for files — it automatically closes the file even if an error happens.`,
    forge_snippet: `import csv, json

# CSV reading (very common in data work)
def read_csv(filename):
    rows = []
    with open(filename, newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

# Writing CSV
def write_csv(filename, data, fieldnames):
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

# JSON (very common in web/APIs)
config = {"host": "localhost", "port": 5432, "db": "myapp"}
with open("config.json", "w") as f:
    json.dump(config, f, indent=2)

with open("config.json") as f:
    loaded = json.load(f)
print(loaded["host"])  # localhost

# Robust file reading with exceptions
def safe_read(filename):
    try:
        with open(filename) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File '{filename}' not found")
        return None
    except PermissionError:
        print(f"No permission to read '{filename}'")
        return None`
  },
  {
    title: "Debugging Techniques",
    importance_level: "Expert",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "CS 121 > Unit 4: Algorithms",
    first_principles: [
      "Debugging is the systematic process of finding and fixing incorrect behavior — not guessing",
      "Every bug exists because of a specific difference between what the programmer assumed and what actually happened",
      "Print statements and breakpoints let you observe program state — they are the developer's microscope"
    ],
    learning_objectives: [
      "Apply a systematic debugging process: reproduce → locate → understand → fix → verify",
      "Use print statements and pdb (Python debugger) effectively",
      "Write assertions to catch bugs early",
      "Understand and interpret common Python error messages"
    ],
    prerequisites: ["Functions", "Exception Handling"],
    content_markdown: `## Debugging Techniques

### The Debugging Process

1. **Reproduce** — find the exact input that causes the bug
2. **Locate** — narrow down where in the code it happens
3. **Understand** — know WHY it happens (wrong assumption about data or logic)
4. **Fix** — change the code to match correct behavior
5. **Verify** — test with the original case + edge cases

### Reading Error Messages

Python errors tell you exactly what went wrong:

\`\`\`
Traceback (most recent call last):
  File "script.py", line 12, in calculate
    result = total / count
ZeroDivisionError: division by zero
\`\`\`

Read from BOTTOM UP: the actual error is at the bottom, the call stack above it shows HOW you got there.

### print() Debugging

\`\`\`python
def mystery(data):
    print(f"DEBUG: data = {data}")   # what did we receive?
    result = sorted(data)
    print(f"DEBUG: result = {result}") # what are we returning?
    return result[0]
\`\`\`

### Python Debugger (pdb)

\`\`\`python
import pdb; pdb.set_trace()   # execution pauses here
# Commands: n (next), s (step into), c (continue), p var (print)
\`\`\`

Or use \`breakpoint()\` (Python 3.7+) — no import needed.

### Assertions

\`\`\`python
def average(numbers):
    assert len(numbers) > 0, "Cannot average empty list"
    return sum(numbers) / len(numbers)
\`\`\`

Assertions fail fast with clear messages — great for catching bugs early.

### Common Bug Patterns

- Off-by-one errors in loop ranges
- Wrong operator (\`=\` vs \`==\`)
- Mutating a list while iterating over it
- Integer division where float was expected (\`//\` vs \`/\`)
- Forgetting to \`return\` a value from a function`,
    content_easy_markdown: `## Debugging — Simple Version

**Debugging** is finding and fixing bugs. Don't panic — be systematic.

1. Read the error message (bottom of traceback first!)
2. Add \`print()\` statements to see what's happening
3. Check your assumptions: "I thought x was 5, but maybe it's not?"

**Quick tools:**
- \`print(f"DEBUG: {variable}")\` — most used debugging technique
- \`assert condition, "message"\` — crash loudly if assumption is wrong
- \`breakpoint()\` — pause and inspect in the debugger`,
    forge_snippet: `# Debugging demonstration

# Bug: off-by-one error
def find_max_buggy(numbers):
    """BUGGY: misses the last element."""
    max_val = numbers[0]
    for i in range(len(numbers) - 1):   # BUG: should be range(len(numbers))
        if numbers[i] > max_val:
            max_val = numbers[i]
    return max_val

def find_max_fixed(numbers):
    assert len(numbers) > 0, "Empty list has no maximum"
    max_val = numbers[0]
    for i in range(len(numbers)):       # FIXED
        if numbers[i] > max_val:
            max_val = numbers[i]
    return max_val

test = [3, 1, 4, 1, 5, 9, 2, 6]
print(find_max_buggy(test))   # 6 — WRONG (misses 9 if it's last)
print(find_max_fixed(test))   # 9 — CORRECT

# or just
print(max(test))   # 9

# Using assertions to catch bugs early
def divide(a, b):
    assert b != 0, f"Cannot divide {a} by zero!"
    return a / b

try:
    divide(10, 0)
except AssertionError as e:
    print(f"Caught: {e}")`
  }
];

async function seed() {
  try {
    console.log("💻 Seeding CS 121: Programming I topics...");
    const courseRes = await pool.query(
      "SELECT id FROM courses WHERE name ILIKE '%CS 121%' LIMIT 1"
    );
    if (courseRes.rows.length === 0) {
      throw new Error("CS 121 not found. Run seed_curriculum.js first.");
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
    console.log(`\n✅ CS 121 done — ${topics.length} topics seeded.\n`);
  } catch (err) {
    console.error("❌ CS 121 seeding failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed();
