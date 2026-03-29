import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });
import pool from "../config/db.js";

const topics = [
  // ── Unit 1: Number Systems ────────────────────────────────────────────────
  {
    title: "Number Systems: Binary, Octal, Hexadecimal",
    importance_level: "Essential",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "CSE 123 > Unit 1: Number Systems",
    first_principles: [
      "A number system is a positional notation where each digit's value is weighted by a power of the base",
      "Binary (base-2), octal (base-8), and hexadecimal (base-16) are direct groupings of binary digits",
      "Computers represent all data — numbers, text, images — as sequences of binary digits (bits)"
    ],
    learning_objectives: [
      "Explain positional notation and how base determines the weight of each digit position",
      "Read and write numbers in binary, octal, and hexadecimal",
      "Identify the relationship between binary, octal (3-bit groups), and hexadecimal (4-bit groups)",
      "Convert simple values mentally between hex and binary"
    ],
    prerequisites: [],
    content_markdown: `## Number Systems: Binary, Octal, Hexadecimal

Computers are built from transistors that have two stable states — ON and OFF. Every piece of data a computer processes is ultimately stored as a sequence of **bits** (binary digits), each either 0 or 1.

### Positional Notation

In any positional number system with base **b**, the value of a number is computed as:

\`\`\`
d_n × b^n + d_(n-1) × b^(n-1) + ... + d_1 × b^1 + d_0 × b^0
\`\`\`

Each digit's contribution is its face value multiplied by the base raised to its position.

### Binary (Base 2)

Only digits 0 and 1. Each position is a power of 2.

\`\`\`
1011₂ = 1×2³ + 0×2² + 1×2¹ + 1×2⁰
      = 8 + 0 + 2 + 1 = 11₁₀
\`\`\`

### Octal (Base 8)

Digits 0–7. Each octal digit represents exactly **3 binary bits**, making it a compact binary shorthand.

\`\`\`
Octal:  7  5  3
Binary: 111 101 011  →  111101011₂
\`\`\`

### Hexadecimal (Base 16)

Digits 0–9 and A–F (where A=10, B=11, C=12, D=13, E=14, F=15). Each hex digit represents exactly **4 binary bits** (a nibble).

\`\`\`
Hex:   A   F   3
Binary: 1010 1111 0011  →  101011110011₂
\`\`\`

### Why Hex is Everywhere

Memory addresses, color codes (#FF5733), machine code dumps, and network packets are all displayed in hexadecimal because it is compact yet directly maps to binary without computation.

| Base | Name | Digits | Bits per digit |
|------|------|--------|----------------|
| 2 | Binary | 0-1 | 1 |
| 8 | Octal | 0-7 | 3 |
| 10 | Decimal | 0-9 | — |
| 16 | Hexadecimal | 0-9, A-F | 4 |

### CS Applications

- **Binary**: all hardware logic and data storage
- **Octal**: Unix/Linux file permissions (chmod 755)
- **Hex**: memory addresses, color values, SHA hashes, debugging machine code`,
    content_easy_markdown: `## Number Systems — Simple Version

Computers only understand 0s and 1s (**binary**). But long strings of binary are hard to read, so programmers use shorthand:

- **Octal** (base 8): groups 3 bits together → 3 binary digits = 1 octal digit
- **Hexadecimal** (base 16): groups 4 bits together → 4 binary digits = 1 hex digit (0-9, A-F)

Think of it like abbreviations: instead of writing 1111 in binary you just write F in hex.

You use hex every day: HTML color \`#FF0000\` is red, Unix permissions \`0755\` is octal, memory addresses like \`0x7FFF\` are hexadecimal.`,
    forge_snippet: `# Python built-ins for number system exploration
n = 255

print(bin(n))   # '0b11111111'  — binary
print(oct(n))   # '0o377'       — octal
print(hex(n))   # '0xff'        — hexadecimal

# Convert FROM any base TO decimal with int(string, base)
print(int('11111111', 2))   # 255 from binary
print(int('377', 8))        # 255 from octal
print(int('ff', 16))        # 255 from hex

# 4-bit grouping: each hex digit = 4 bits
for nibble in range(16):
    print(f"{nibble:X} = {nibble:04b}")  # 0=0000 ... F=1111

# Unix permission example (octal)
perm = 0o755  # rwxr-xr-x
print(f"Permissions: {perm:o} = {perm:09b}")`
  },
  {
    title: "Number Base Conversions",
    importance_level: "Essential",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "CSE 123 > Unit 1: Number Systems",
    first_principles: [
      "Any integer can be uniquely expressed in any base by repeated division and tracking remainders",
      "Converting to decimal is a sum of digit × base^position products",
      "Conversions between bases that are powers of 2 (binary↔octal, binary↔hex) are done by grouping bits"
    ],
    learning_objectives: [
      "Convert decimal integers to binary, octal, and hexadecimal using repeated division",
      "Convert binary, octal, and hex numbers to decimal using positional expansion",
      "Convert directly between binary and hex (and binary and octal) by grouping bits",
      "Convert fractional numbers between bases using repeated multiplication"
    ],
    prerequisites: ["Number Systems: Binary, Octal, Hexadecimal"],
    content_markdown: `## Number Base Conversions

Converting between number bases is a fundamental skill for anyone working with digital systems or low-level programming.

### Decimal → Binary (Repeated Division by 2)

Divide the number by 2 repeatedly, recording remainders. The binary representation is the remainders read **bottom to top**.

\`\`\`
Convert 45 to binary:
45 ÷ 2 = 22 remainder 1  ← LSB
22 ÷ 2 = 11 remainder 0
11 ÷ 2 =  5 remainder 1
 5 ÷ 2 =  2 remainder 1
 2 ÷ 2 =  1 remainder 0
 1 ÷ 2 =  0 remainder 1  ← MSB

Result (read upward): 101101₂
\`\`\`

Verify: 32 + 8 + 4 + 1 = 45 ✓

### Decimal → Hexadecimal (Repeated Division by 16)

Same algorithm but divide by 16. Map remainders 10-15 to A-F.

\`\`\`
Convert 1000 to hex:
1000 ÷ 16 = 62 remainder 8
  62 ÷ 16 =  3 remainder 14 → E
   3 ÷ 16 =  0 remainder 3

Result: 3E8₁₆  →  0x3E8
\`\`\`

### Binary → Hexadecimal (Group by 4 Bits)

Pad the binary number to a multiple of 4 bits, then convert each group of 4:

\`\`\`
10110111001₂
→ pad: 0101 1011 1001
→ hex:    5    B    9
→ 0x5B9
\`\`\`

### Binary → Octal (Group by 3 Bits)

\`\`\`
10110111001₂
→ pad: 010 110 111 001
→ oct:   2   6   7   1
→ 2671₈
\`\`\`

### Fractional Conversions

Multiply the fractional part by the new base and take the integer part at each step:

\`\`\`
Convert 0.625 to binary:
0.625 × 2 = 1.25  → digit: 1
0.25  × 2 = 0.5   → digit: 0
0.5   × 2 = 1.0   → digit: 1
Result: 0.101₂
\`\`\`

### Quick Reference

| Hex | Binary | Decimal |
|-----|--------|---------|
| 0 | 0000 | 0 |
| 4 | 0100 | 4 |
| 8 | 1000 | 8 |
| A | 1010 | 10 |
| F | 1111 | 15 |`,
    content_easy_markdown: `## Number Base Conversions — Simple Version

**Decimal → Binary**: keep dividing by 2, collect remainders from bottom to top.

**Binary → Hex**: split binary into groups of 4 bits from the right, convert each group (0000=0 … 1111=F).

**Binary → Octal**: split into groups of 3 bits from the right, convert each group (000=0 … 111=7).

**Any base → Decimal**: multiply each digit by the base raised to its position, then add everything up.

Memorize the 16 hex digits (0-F and their 4-bit binary patterns) and you can convert large binary numbers to hex instantly.`,
    forge_snippet: `# Manual base conversion algorithms in Python

def decimal_to_binary(n):
    """Repeated division by 2."""
    if n == 0:
        return "0"
    bits = []
    while n > 0:
        bits.append(str(n % 2))
        n //= 2
    return ''.join(reversed(bits))

def decimal_to_hex(n):
    """Repeated division by 16."""
    hex_digits = "0123456789ABCDEF"
    if n == 0:
        return "0"
    result = []
    while n > 0:
        result.append(hex_digits[n % 16])
        n //= 16
    return ''.join(reversed(result))

def binary_to_hex(b):
    """Group 4 bits at a time."""
    padded = b.zfill(((len(b) - 1) // 4 + 1) * 4)
    return ''.join(
        format(int(padded[i:i+4], 2), 'X')
        for i in range(0, len(padded), 4)
    )

print(decimal_to_binary(45))    # 101101
print(decimal_to_hex(1000))     # 3E8
print(binary_to_hex('10110111001'))  # 5B9

# Verify with Python built-ins
print(int('3E8', 16))   # 1000
print(int('101101', 2)) # 45`
  },
  {
    title: "Binary Arithmetic (Addition, Subtraction, Multiplication)",
    importance_level: "Essential",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "CSE 123 > Unit 1: Number Systems",
    first_principles: [
      "Binary arithmetic follows the same rules as decimal arithmetic but with only two symbols",
      "A carry propagates left when the sum of two bits exceeds 1 (just as a carry in decimal exceeds 9)",
      "Subtraction in hardware is implemented as addition of the two's complement negative"
    ],
    learning_objectives: [
      "Perform binary addition with carry propagation",
      "Perform binary subtraction using borrow or two's complement addition",
      "Perform binary multiplication using the shift-and-add method",
      "Detect overflow in binary addition"
    ],
    prerequisites: ["Number Systems: Binary, Octal, Hexadecimal", "Number Base Conversions"],
    content_markdown: `## Binary Arithmetic

Digital computers perform all calculations in binary. Understanding binary arithmetic demystifies how the ALU (Arithmetic Logic Unit) in a CPU works.

### Binary Addition

Addition rules for single bits:

| A | B | Sum | Carry |
|---|---|-----|-------|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

**Example**: Add 1011₂ + 0110₂

\`\`\`
  1011   (11 in decimal)
+ 0110   ( 6 in decimal)
------
  Carry: 0110
  Sum:   10001  (17 in decimal) ✓
\`\`\`

### Carry Propagation

A carry from position i moves into position i+1. If the carry propagates all the way out of the most significant bit, that is called an **overflow** in fixed-width arithmetic.

### Binary Subtraction (Borrow Method)

\`\`\`
  1010   (10)
- 0011   ( 3)
------
  0111   ( 7) ✓
\`\`\`

When a bit must borrow from the next column, borrow 1 from the higher bit (which is worth 2 in the current position).

### Binary Multiplication (Shift-and-Add)

Multiply each bit of the multiplier by the multiplicand and shift left by the bit's position, then add partial products.

\`\`\`
    1011  (11)
  × 0101  ( 5)
  ------
    1011   × 1 (shift 0)
   0000    × 0 (shift 1)
  1011     × 1 (shift 2)
 0000      × 0 (shift 3)
---------
  0110111  (55) ✓
\`\`\`

### Overflow Detection

For n-bit unsigned numbers: overflow occurs if the carry out of the MSB is 1.
For signed numbers: overflow occurs if the carry into the MSB ≠ carry out of the MSB.

### Why This Matters

Every add, subtract, and multiply in your program ultimately executes as binary arithmetic in silicon. The half-adder and full-adder circuits you build in digital design directly implement these rules.`,
    content_easy_markdown: `## Binary Arithmetic — Simple Version

Binary arithmetic works exactly like decimal but with only 0s and 1s.

**Addition**: 0+0=0, 0+1=1, 1+1=10 (write 0, carry 1). Carry propagates left just like in decimal.

**Subtraction**: borrow from the next column when needed (borrowing gives you 2 in binary instead of 10 in decimal).

**Multiplication**: same as long multiplication — multiply by each bit and shift left, then add all the partial products.

Watch out for **overflow**: if your result needs more bits than you have, the high bits are silently dropped.`,
    forge_snippet: `# Binary arithmetic simulation in Python

def bin_add(a, b):
    """Add two binary strings, return binary string result."""
    return bin(int(a, 2) + int(b, 2))[2:]

def bin_sub(a, b):
    return bin(int(a, 2) - int(b, 2))[2:]

def bin_mul(a, b):
    return bin(int(a, 2) * int(b, 2))[2:]

print(bin_add('1011', '0110'))   # 10001  (11+6=17)
print(bin_sub('1010', '0011'))   # 111    (10-3=7)
print(bin_mul('1011', '0101'))   # 110111 (11×5=55)

# Manual shift-and-add multiplication
def shift_add_multiply(a_str, b_str):
    a = int(a_str, 2)
    b = int(b_str, 2)
    product = 0
    shift = 0
    while b > 0:
        if b & 1:                   # if current LSB of b is 1
            product += a << shift   # add shifted a
        b >>= 1
        shift += 1
    return bin(product)[2:]

print(shift_add_multiply('1011', '0101'))  # 110111`
  },
  {
    title: "Signed Numbers and Two's Complement",
    importance_level: "Essential",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "CSE 123 > Unit 1: Number Systems",
    first_principles: [
      "Negative numbers must be encoded within a fixed number of bits using a convention",
      "Two's complement is the universal standard: negate a number by inverting all bits and adding 1",
      "Two's complement makes subtraction identical to addition — no special hardware needed"
    ],
    learning_objectives: [
      "Represent positive and negative integers using two's complement notation",
      "Convert a two's complement binary number to its decimal value",
      "Compute the two's complement negation of a number",
      "Perform signed addition and detect signed overflow",
      "Explain sign extension for widening a signed value"
    ],
    prerequisites: ["Binary Arithmetic (Addition, Subtraction, Multiplication)"],
    content_markdown: `## Signed Numbers and Two's Complement

How do computers represent negative numbers? They can't write a minus sign in hardware. The answer is **two's complement** — the universal convention used by virtually every modern processor.

### Sign-Magnitude (Not Used in Practice)

The simplest idea: use the MSB as a sign bit (0 = positive, 1 = negative).

Problem: two representations of zero (+0 and -0) and complex addition logic.

### One's Complement (Intermediate Idea)

Negate by inverting all bits: -5 in 8-bit one's complement = 11111010.

Problem: still two zeros, and addition requires an end-around carry.

### Two's Complement (The Standard)

**To negate**: invert all bits, then add 1.

\`\`\`
+5 in 8-bit: 00000101
Invert:      11111010
Add 1:       11111011  ← this is -5 in two's complement
\`\`\`

**Range** for n-bit two's complement: −2^(n-1) to +2^(n-1) − 1

For 8-bit: -128 to +127.

### Reading a Negative Two's Complement Number

If the MSB is 1, the number is negative. To find its magnitude: invert all bits and add 1.

\`\`\`
11110110 → invert → 00001001 → add 1 → 00001010 = 10
So 11110110 = -10
\`\`\`

Alternatively, use the weighted MSB:
\`\`\`
11110110 = -128 + 64 + 32 + 16 + 4 + 2 = -10
\`\`\`

### Why Two's Complement is Brilliant

Addition of positive and negative numbers uses the **exact same hardware** as unsigned addition:

\`\`\`
5 + (-3) in 8-bit:
  00000101  (+5)
+ 11111101  (-3)
----------
 100000010  → discard carry → 00000010 = +2 ✓
\`\`\`

### Sign Extension

To extend a signed value to more bits, replicate the sign bit:
\`\`\`
-3 in 4-bit:  1101
-3 in 8-bit:  11111101
\`\`\``,
    content_easy_markdown: `## Signed Numbers and Two's Complement — Simple Version

Computers represent negative numbers using **two's complement**: flip every bit, then add 1.

Example: -5 in 8-bit → start with +5 = 00000101 → flip → 11111010 → add 1 → 11111011.

The clever part: adding a positive and a negative in two's complement uses the exact same addition hardware. No special "subtract" circuit needed — subtract is just add-negative.

The MSB tells you the sign: 0 = positive, 1 = negative. The range for n bits is −2^(n-1) to 2^(n-1)−1.`,
    forge_snippet: `# Two's complement in Python

def twos_complement(value, bits=8):
    """Return two's complement representation of value in 'bits' bits."""
    if value >= 0:
        return format(value, f'0{bits}b')
    # Negative: add 2^bits then format
    return format((1 << bits) + value, f'0{bits}b')

def from_twos_complement(binary_str):
    """Decode a two's complement binary string to signed integer."""
    bits = len(binary_str)
    val = int(binary_str, 2)
    if binary_str[0] == '1':   # negative number
        val -= (1 << bits)
    return val

# Demonstrate
for n in [5, -5, -3, -128, 127]:
    tc = twos_complement(n, 8)
    back = from_twos_complement(tc)
    print(f"{n:4d} → {tc} → {back}")

# Subtraction via two's complement addition
a, b = 10, 3
neg_b = twos_complement(-b, 8)
result = from_twos_complement(
    format((int(twos_complement(a, 8), 2) + int(neg_b, 2)) & 0xFF, '08b')
)
print(f"10 - 3 = {result}")  # 7`
  },
  {
    title: "IEEE 754 Floating Point Representation",
    importance_level: "Essential",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "CSE 123 > Unit 1: Number Systems",
    first_principles: [
      "Real numbers are stored in scientific notation: ±1.mantissa × 2^exponent",
      "The exponent is biased (stored as exponent + 127 for 32-bit) to allow unsigned comparison",
      "Floating point has finite precision — not all real numbers can be represented exactly"
    ],
    learning_objectives: [
      "Describe the IEEE 754 single-precision (32-bit) format: sign, exponent, mantissa fields",
      "Convert a decimal fraction to IEEE 754 binary representation",
      "Explain the concept of biased exponent and why it is used",
      "Identify special values: zero, infinity, NaN",
      "Explain why floating point arithmetic is not always exact"
    ],
    prerequisites: ["Signed Numbers and Two's Complement"],
    content_markdown: `## IEEE 754 Floating Point Representation

Integers can't represent fractions or very large/small numbers. The **IEEE 754** standard defines how computers store real numbers in binary — used by every modern CPU and GPU.

### Single-Precision (32-bit) Format

\`\`\`
Bit 31    Bits 30-23    Bits 22-0
  S       EEEEEEEE      MMMMMMMMMMMMMMMMMMMMMMM
 Sign    Exponent(8)    Mantissa/Fraction(23)
\`\`\`

**Sign (1 bit)**: 0 = positive, 1 = negative

**Exponent (8 bits)**: stored with a **bias of 127**. Actual exponent = stored value − 127.

**Mantissa (23 bits)**: stores the fractional bits after the implicit leading 1: value = 1.mantissa × 2^(exponent)

### Encoding Example: Convert -6.75 to IEEE 754

1. Sign = 1 (negative)
2. |6.75| in binary: 6 = 110, 0.75 = 0.11 → 110.11
3. Normalize: 1.1011 × 2² → exponent = 2
4. Biased exponent: 2 + 127 = 129 = 10000001
5. Mantissa: 1011 followed by 19 zeros → 10110000000000000000000

Final: **1 10000001 10110000000000000000000**

### Special Values

| Exponent | Mantissa | Meaning |
|----------|----------|---------|
| 00000000 | 0 | ±Zero |
| 00000000 | ≠ 0 | Denormalized (very small) |
| 11111111 | 0 | ±Infinity |
| 11111111 | ≠ 0 | NaN (Not a Number) |

### Precision and Rounding

A 32-bit float has ~7 decimal digits of precision. This means:

\`\`\`python
>>> 0.1 + 0.2
0.30000000000000004   # NOT exactly 0.3!
\`\`\`

0.1 cannot be represented exactly in binary (like 1/3 in decimal). This causes rounding errors in financial calculations — use integers (cents) instead of floats for money.

### Double Precision (64-bit)

- Exponent: 11 bits, bias 1023
- Mantissa: 52 bits
- Precision: ~15-16 decimal digits`,
    content_easy_markdown: `## IEEE 754 Floating Point — Simple Version

Floating point stores numbers like scientific notation in binary: ±1.something × 2^power.

A 32-bit float has three parts: 1 sign bit, 8 exponent bits (stored with +127 added), and 23 mantissa bits.

The key issue: **most decimal fractions cannot be represented exactly in binary**. 0.1 + 0.2 ≠ 0.3 exactly in floating point. This is normal and expected — it's not a bug, it's the nature of finite-precision binary representation.

Never compare floats with == in code. Use abs(a - b) < epsilon instead.`,
    forge_snippet: `import struct

def float_to_ieee754(f):
    """Show the IEEE 754 bit representation of a Python float."""
    # Pack as 32-bit float, unpack as unsigned int
    bits = struct.unpack('I', struct.pack('f', f))[0]
    binary = format(bits, '032b')
    sign = binary[0]
    exp  = binary[1:9]
    mant = binary[9:]
    bias = int(exp, 2) - 127
    print(f"Value    : {f}")
    print(f"Sign     : {sign}  ({'negative' if sign == '1' else 'positive'})")
    print(f"Exponent : {exp}  (stored={int(exp,2)}, actual={bias})")
    print(f"Mantissa : {mant}")
    print(f"Full bits: {binary}")

float_to_ieee754(-6.75)
print()
float_to_ieee754(0.1)

# Demonstrate imprecision
print(0.1 + 0.2)             # 0.30000000000000004
print(0.1 + 0.2 == 0.3)      # False!
print(abs(0.1 + 0.2 - 0.3) < 1e-9)  # True — correct comparison`
  },

  // ── Unit 2: Boolean Algebra ───────────────────────────────────────────────
  {
    title: "Boolean Algebra: Laws and Theorems",
    importance_level: "Essential",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "CSE 123 > Unit 2: Boolean Algebra",
    first_principles: [
      "Boolean algebra operates on variables that take only two values: 0 and 1",
      "Every Boolean law can be proved by exhaustive truth table (only 2^n combinations for n variables)",
      "DeMorgan's theorems are the bridge between AND-based and OR-based logic"
    ],
    learning_objectives: [
      "State and apply the fundamental Boolean laws: identity, null, idempotent, complement, commutative, associative, distributive",
      "Apply DeMorgan's theorems to convert between NAND/NOR forms",
      "Prove Boolean identities using truth tables",
      "Use absorption and consensus theorems to simplify expressions"
    ],
    prerequisites: ["Number Systems: Binary, Octal, Hexadecimal"],
    content_markdown: `## Boolean Algebra: Laws and Theorems

Boolean algebra is the mathematical foundation of digital logic. Developed by George Boole in 1854 and applied to switching circuits by Claude Shannon in 1937, it provides the rules for manipulating logical expressions.

### Fundamental Laws

**Identity Laws**
\`\`\`
A + 0 = A      A · 1 = A
\`\`\`

**Null (Domination) Laws**
\`\`\`
A + 1 = 1      A · 0 = 0
\`\`\`

**Idempotent Laws**
\`\`\`
A + A = A      A · A = A
\`\`\`

**Complement Laws**
\`\`\`
A + A' = 1     A · A' = 0
\`\`\`

**Double Negation**
\`\`\`
(A')' = A
\`\`\`

**Commutative Laws**
\`\`\`
A + B = B + A     A · B = B · A
\`\`\`

**Associative Laws**
\`\`\`
(A+B)+C = A+(B+C)     (A·B)·C = A·(B·C)
\`\`\`

**Distributive Laws**
\`\`\`
A·(B+C) = A·B + A·C       (A+B)·(A+C) = A + B·C
\`\`\`

### DeMorgan's Theorems

These are the most important theorems for circuit simplification:

\`\`\`
(A · B)' = A' + B'     "NAND = OR with inverted inputs"
(A + B)' = A' · B'     "NOR  = AND with inverted inputs"
\`\`\`

**Generalization**: complement of any expression — invert every literal and swap every AND↔OR.

### Absorption Laws

\`\`\`
A + A·B = A          A·(A+B) = A
\`\`\`

### Consensus Theorem

\`\`\`
A·B + A'·C + B·C = A·B + A'·C
\`\`\`
The term B·C is redundant — it can always be derived from the other two.

### Duality Principle

Every Boolean identity has a **dual**: swap all + ↔ · and 0 ↔ 1. If one identity is true, its dual is also true.`,
    content_easy_markdown: `## Boolean Algebra Laws — Simple Version

Boolean algebra has 0 and 1 as its only values. The key laws to memorize:

- **DeMorgan's**: NOT(A AND B) = (NOT A) OR (NOT B). Swap AND↔OR and flip all inputs.
- **Absorption**: A + A·B = A (the longer term gets absorbed into the shorter one).
- **Complement**: A AND NOT-A = 0, A OR NOT-A = 1.
- **Idempotent**: A + A = A, A · A = A.

These laws let you simplify logic circuits — fewer gates means cheaper, faster hardware.`,
    forge_snippet: `# Boolean algebra law verification in Python

def verify_demorgan_and(A, B):
    lhs = not (A and B)
    rhs = (not A) or (not B)
    return lhs == rhs

def verify_demorgan_or(A, B):
    lhs = not (A or B)
    rhs = (not A) and (not B)
    return lhs == rhs

def verify_absorption(A, B):
    lhs = A or (A and B)
    rhs = A
    return lhs == rhs

# Test all combinations
print("DeMorgan AND | DeMorgan OR | Absorption")
for A in [False, True]:
    for B in [False, True]:
        dm_and = verify_demorgan_and(A, B)
        dm_or  = verify_demorgan_or(A, B)
        absorb = verify_absorption(A, B)
        print(f"A={int(A)} B={int(B)}: {dm_and}       {dm_or}        {absorb}")

# All should print True
print("All DeMorgan AND valid:", all(verify_demorgan_and(a,b)
    for a in [0,1] for b in [0,1]))`
  },
  {
    title: "Basic Logic Gates (AND, OR, NOT)",
    importance_level: "Essential",
    estimated_time: "45 mins",
    estimated_time_minutes: 45,
    breadcrumb_path: "CSE 123 > Unit 2: Boolean Algebra",
    first_principles: [
      "A logic gate is a physical implementation of a Boolean function using transistors",
      "AND outputs 1 only when ALL inputs are 1; OR outputs 1 when ANY input is 1",
      "NOT inverts its input — it is the only single-input gate"
    ],
    learning_objectives: [
      "Draw and recognize the standard IEEE symbols for AND, OR, and NOT gates",
      "Write the truth table for each gate",
      "Express the AND, OR, NOT functions in Boolean algebra notation",
      "Combine gates to build simple expressions"
    ],
    prerequisites: ["Boolean Algebra: Laws and Theorems"],
    content_markdown: `## Basic Logic Gates: AND, OR, NOT

Logic gates are the physical building blocks of all digital circuits. Every processor, memory chip, and controller is ultimately constructed from billions of these gates.

### AND Gate

**Symbol**: D-shape with flat input side
**Boolean**: Y = A · B  (also written A AND B or AB)
**Behaviour**: output is HIGH only when ALL inputs are HIGH

| A | B | Y = A·B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

**Physical analogy**: two switches in series — both must be closed for current to flow.

### OR Gate

**Symbol**: curved shape with pointed output
**Boolean**: Y = A + B  (also written A OR B)
**Behaviour**: output is HIGH when ANY input is HIGH

| A | B | Y = A+B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

**Physical analogy**: two switches in parallel — either can close the circuit.

### NOT Gate (Inverter)

**Symbol**: triangle with a bubble at the output
**Boolean**: Y = A'  (also written ¬A or ~A)
**Behaviour**: output is the complement of the input

| A | Y = A' |
|---|--------|
| 0 | 1 |
| 1 | 0 |

### Universality

AND, OR, NOT form a **functionally complete** set — any Boolean function can be built from these three gates alone. In practice, NAND and NOR are also individually functionally complete.

### Gate Implementations

Gates are built from CMOS transistors:
- **NMOS** transistor: switch closes when input = 1
- **PMOS** transistor: switch closes when input = 0
- A CMOS NOT gate uses one PMOS + one NMOS transistor`,
    content_easy_markdown: `## Basic Logic Gates — Simple Version

Three gates are the foundation of everything:

- **AND**: output is 1 only when BOTH inputs are 1 (like switches in series)
- **OR**: output is 1 when AT LEAST ONE input is 1 (like switches in parallel)
- **NOT**: flips the input — 0 becomes 1, 1 becomes 0

These three can build ANY digital circuit — every processor, every memory chip, every sensor controller is made of combinations of these fundamental operations.`,
    forge_snippet: `# Logic gate simulation in Python

def AND(a, b):  return int(bool(a) and bool(b))
def OR(a, b):   return int(bool(a) or bool(b))
def NOT(a):     return int(not bool(a))

def truth_table_2input(gate_fn, name):
    print(f"\n{name} gate truth table:")
    print("A | B | Y")
    print("-" * 9)
    for a in [0, 1]:
        for b in [0, 1]:
            print(f"{a} | {b} | {gate_fn(a, b)}")

def truth_table_1input(gate_fn, name):
    print(f"\n{name} gate truth table:")
    print("A | Y")
    print("-" * 5)
    for a in [0, 1]:
        print(f"{a} | {gate_fn(a)}")

truth_table_2input(AND, "AND")
truth_table_2input(OR, "OR")
truth_table_1input(NOT, "NOT")

# Combining gates: Y = A·B + C
def combined(a, b, c):
    return OR(AND(a, b), c)

print("\nY = A·B + C:")
for a in [0,1]:
    for b in [0,1]:
        for c in [0,1]:
            print(f"A={a} B={b} C={c} → Y={combined(a,b,c)}")`
  },
  {
    title: "Derived Logic Gates (NAND, NOR, XOR, XNOR)",
    importance_level: "Essential",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "CSE 123 > Unit 2: Boolean Algebra",
    first_principles: [
      "NAND and NOR are individually functionally complete — any Boolean function can be built from NAND alone (or NOR alone)",
      "XOR (exclusive OR) outputs 1 when inputs differ — it is the hardware addition bit without carry",
      "XNOR outputs 1 when inputs are equal — it is used for equality comparison"
    ],
    learning_objectives: [
      "Write truth tables for NAND, NOR, XOR, and XNOR gates",
      "Express derived gates in terms of AND, OR, NOT",
      "Implement NOT, AND, and OR using only NAND gates",
      "Use XOR in the context of binary addition (sum bit of a half adder)"
    ],
    prerequisites: ["Basic Logic Gates (AND, OR, NOT)"],
    content_markdown: `## Derived Logic Gates: NAND, NOR, XOR, XNOR

Beyond the three basic gates lie four widely-used derived gates that appear constantly in real circuits.

### NAND Gate

**Boolean**: Y = (A · B)' = A' + B'  (by DeMorgan's)
**Behaviour**: NOT AND — output is 0 only when ALL inputs are 1

| A | B | Y = (AB)' |
|---|---|-----------|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

**NAND is universal**: build NOT, AND, OR with only NAND gates:
\`\`\`
NOT A = A NAND A
A AND B = (A NAND B) NAND (A NAND B)
A OR B  = (A NAND A) NAND (B NAND B)
\`\`\`

### NOR Gate

**Boolean**: Y = (A + B)' = A' · B'
**Behaviour**: NOT OR — output is 1 only when ALL inputs are 0

NOR is also **universal** — the complete set of logic can be built from NOR alone.

### XOR Gate (Exclusive OR)

**Boolean**: Y = A ⊕ B = A'B + AB'
**Behaviour**: output is 1 when inputs are **different**

| A | B | Y = A⊕B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

**Key use**: XOR produces the **sum bit** in binary addition. A half-adder is: Sum = A⊕B, Carry = A·B.

XOR is also used in parity checking, cryptography (one-time pad), and error detection codes (CRC).

### XNOR Gate (Exclusive NOR)

**Boolean**: Y = (A ⊕ B)' = A'B' + AB
**Behaviour**: output is 1 when inputs are **equal**

Used for magnitude comparators and equality checkers.

### Practical Note

In CMOS technology, NAND and NOR gates require fewer transistors than AND and OR (which need an inverter after), making NAND and NOR the preferred building blocks in real chip design.`,
    content_easy_markdown: `## Derived Gates — Simple Version

- **NAND**: NOT AND — the only output that is 0 is when all inputs are 1. Can build any circuit from NAND alone.
- **NOR**: NOT OR — the only output that is 1 is when all inputs are 0. Also universal.
- **XOR**: outputs 1 when inputs are DIFFERENT. Critical for addition (sum bit of half adder).
- **XNOR**: outputs 1 when inputs are THE SAME. Used for equality checking.

XOR is probably the most important of these — it appears in adders, cryptography, error detection, and parity circuits.`,
    forge_snippet: `# Derived gate simulation

def NAND(a, b):  return int(not (a and b))
def NOR(a, b):   return int(not (a or b))
def XOR(a, b):   return int(a != b)
def XNOR(a, b):  return int(a == b)

# Build NOT, AND, OR from NAND only
def NOT_from_NAND(a):        return NAND(a, a)
def AND_from_NAND(a, b):     return NAND(NAND(a,b), NAND(a,b))
def OR_from_NAND(a, b):      return NAND(NAND(a,a), NAND(b,b))

print("XOR truth table (sum bit of half adder):")
for a in [0,1]:
    for b in [0,1]:
        s = XOR(a,b)    # sum bit
        c = a and b     # carry bit
        print(f"  {a}+{b}: Sum={s} Carry={int(c)}")

print("\nNAND universality check (vs direct AND):")
for a in [0,1]:
    for b in [0,1]:
        direct = int(a and b)
        via_nand = AND_from_NAND(a, b)
        match = "✓" if direct == via_nand else "✗"
        print(f"  A={a} B={b}: direct={direct} via_NAND={via_nand} {match}")`
  },
  {
    title: "Truth Tables",
    importance_level: "Essential",
    estimated_time: "45 mins",
    estimated_time_minutes: 45,
    breadcrumb_path: "CSE 123 > Unit 2: Boolean Algebra",
    first_principles: [
      "A truth table is an exhaustive enumeration of all possible input combinations and their corresponding outputs",
      "For n input variables there are exactly 2^n rows in the truth table",
      "Any Boolean function can be uniquely defined by its truth table (the canonical form)"
    ],
    learning_objectives: [
      "Construct truth tables for Boolean expressions with 2–4 variables",
      "Derive a Boolean expression (sum of minterms) from a truth table",
      "Determine whether two Boolean expressions are equivalent by comparing truth tables",
      "Identify minterms and maxterms from a truth table"
    ],
    prerequisites: ["Basic Logic Gates (AND, OR, NOT)", "Derived Logic Gates (NAND, NOR, XOR, XNOR)"],
    content_markdown: `## Truth Tables

A truth table completely and unambiguously defines a Boolean function by listing every possible combination of inputs alongside the resulting output.

### Structure

For n variables: 2^n rows, listed in binary counting order (00…0 to 11…1).

**Example**: Truth table for Y = A·B + C'

| Row | A | B | C | C' | A·B | Y = A·B + C' |
|-----|---|---|---|----|-----|--------------|
| 0 | 0 | 0 | 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| 2 | 0 | 1 | 0 | 1 | 0 | 1 |
| 3 | 0 | 1 | 1 | 0 | 0 | 0 |
| 4 | 1 | 0 | 0 | 1 | 0 | 1 |
| 5 | 1 | 0 | 1 | 0 | 0 | 0 |
| 6 | 1 | 1 | 0 | 1 | 1 | 1 |
| 7 | 1 | 1 | 1 | 0 | 1 | 1 |

### Minterms and Maxterms

A **minterm** m_i is the product (AND) of all variables (complemented or not) that equals 1 only for row i.

A **maxterm** M_i is the sum (OR) of all variables that equals 0 only for row i.

The **Sum of Minterms (SOM)** canonical form: list minterms of rows where output = 1.

For the table above: Y = Σm(0,2,4,6,7)
\`\`\`
= A'B'C' + A'BC' + AB'C' + ABC' + ABC
\`\`\`

The **Product of Maxterms (POM)**: list maxterms of rows where output = 0.

Y = ΠM(1,3,5)

### Equivalence Testing

Two expressions are logically equivalent if and only if their truth tables are identical. This is the definitive test — no simplification needed.

### Don't Care Conditions

Some input combinations may never occur in practice. Mark these as 'X' (don't care). You can assign them 0 or 1 to simplify the circuit.`,
    content_easy_markdown: `## Truth Tables — Simple Version

A truth table lists every possible 0/1 combination for the inputs and shows the output for each. For n variables you have 2^n rows.

Key terms:
- **Minterm**: the AND combination that is 1 for exactly one row
- **Sum of minterms**: write your function as OR of all minterms where output = 1
- **Don't care (X)**: input combinations that can never happen — treat as 0 or 1 for your convenience

Truth tables are how you prove two Boolean expressions are equivalent — if their output columns match, they are the same function.`,
    forge_snippet: `from itertools import product

def truth_table(func, var_names):
    """Generate and print a truth table for a Boolean function."""
    n = len(var_names)
    print(" | ".join(var_names) + " | Y")
    print("-" * (3 * n + 4))
    minterms = []
    for i, combo in enumerate(product([0,1], repeat=n)):
        args = {v: c for v, c in zip(var_names, combo)}
        y = int(func(**args))
        row = " | ".join(str(c) for c in combo)
        print(f"{row} | {y}")
        if y:
            minterms.append(i)
    print(f"\nSum of minterms: Σm{tuple(minterms)}")
    return minterms

# Example: Y = A·B + C'
def my_func(A, B, C):
    return (A and B) or (not C)

truth_table(my_func, ['A','B','C'])

# Equivalence check: A⊕B vs A'B + AB'
def xor_direct(A, B):   return A != B
def xor_expanded(A, B): return (not A and B) or (A and not B)

equiv = all(xor_direct(a,b) == xor_expanded(a,b)
            for a,b in product([0,1], repeat=2))
print(f"\nXOR ≡ A'B+AB': {equiv}")  # True`
  },
  {
    title: "Boolean Expression Simplification",
    importance_level: "Essential",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "CSE 123 > Unit 2: Boolean Algebra",
    first_principles: [
      "Fewer gate inputs and fewer gate levels mean faster, cheaper circuits",
      "Algebraic simplification uses Boolean laws to reduce literal count",
      "The canonical SOP and POS forms are starting points, not optimal solutions"
    ],
    learning_objectives: [
      "Simplify Boolean expressions using algebraic manipulation and Boolean laws",
      "Convert between Sum of Products (SOP) and Product of Sums (POS) forms",
      "Apply consensus theorem and absorption to eliminate redundant terms",
      "Verify simplification by constructing truth tables"
    ],
    prerequisites: ["Boolean Algebra: Laws and Theorems", "Truth Tables"],
    content_markdown: `## Boolean Expression Simplification

Simplifying Boolean expressions reduces the number of logic gates required to implement a function, leading to faster and cheaper circuits.

### Sum of Products (SOP) Form

An expression is in SOP form when it is a sum (OR) of product (AND) terms:
\`\`\`
Y = A'B + AB' + AB   ← SOP (3 product terms)
\`\`\`

### Product of Sums (POS) Form

An expression is in POS form when it is a product (AND) of sum (OR) terms:
\`\`\`
Y = (A+B)(A'+B)     ← POS (2 sum terms)
\`\`\`

### Algebraic Simplification — Step by Step

**Example**: Simplify F = A'BC + A'BC' + AB

\`\`\`
F = A'BC + A'BC' + AB
  = A'B(C + C') + AB      ← factor out A'B
  = A'B · 1 + AB           ← complement law: C + C' = 1
  = A'B + AB               ← identity law
  = B(A' + A)              ← factor out B
  = B · 1                  ← complement law
  = B
\`\`\`

**Example**: Simplify G = AB + A'C + BC

Apply consensus theorem: BC is redundant (it is the consensus term of AB and A'C):
\`\`\`
G = AB + A'C
\`\`\`

### DeMorgan's for NOR/NAND Implementation

To implement SOP using NAND gates:
1. Simplify to SOP
2. Apply double negation: F = ((F')')
3. Use DeMorgan's: the double-inverted SOP maps directly to NAND-NAND

### Canonical to Minimal

Start from the minterm SOP, then simplify:
\`\`\`
F = Σm(0,1,3) for A,B
  = A'B' + A'B + AB
  = A'(B'+B) + AB
  = A' + AB
  = A' + B   ← absorption: A' + AB = A' + B
\`\`\``,
    content_easy_markdown: `## Boolean Simplification — Simple Version

The goal is to reduce a Boolean expression to the fewest literals and terms, so you need fewer gates.

**Key techniques:**
1. **Factor**: pull out common variables (like algebra)
2. **Absorption**: A + AB = A (drop the longer term)
3. **Consensus**: in AB + A'C + BC, the BC term is always redundant
4. **DeMorgan's**: flip AND↔OR and invert all variables

Start from the truth table → write the sum of minterms → simplify algebraically (or use a K-map for the systematic approach).`,
    forge_snippet: `# Boolean simplification using sympy

from sympy import symbols, simplify_logic, And, Or, Not

A, B, C = symbols('A B C')

# Example 1: F = A'BC + A'BC' + AB  → should simplify to B
F1 = Or(And(Not(A), B, C), And(Not(A), B, Not(C)), And(A, B))
simplified1 = simplify_logic(F1, form='dnf')
print(f"F1 simplified: {simplified1}")   # B

# Example 2: G = AB + A'C + BC  → should simplify to AB + A'C
G = Or(And(A,B), And(Not(A),C), And(B,C))
simplified_g = simplify_logic(G, form='dnf')
print(f"G simplified: {simplified_g}")   # A & B | ~A & C

# Manual absorption: A' + AB = A' + B
F2 = Or(Not(A), And(A, B))
simplified2 = simplify_logic(F2)
print(f"A' + AB = {simplified2}")        # B | ~A

# Verify equivalence via truth table
from itertools import product as iproduct
def equivalent(f1, f2, variables):
    for vals in iproduct([0,1], repeat=len(variables)):
        sub = dict(zip(variables, vals))
        if bool(f1.subs(sub)) != bool(f2.subs(sub)):
            return False
    return True

print("Equivalent?", equivalent(F1, B, [A, B, C]))  # True`
  },
  {
    title: "Karnaugh Maps (K-Maps)",
    importance_level: "Essential",
    estimated_time: "70 mins",
    estimated_time_minutes: 70,
    breadcrumb_path: "CSE 123 > Unit 2: Boolean Algebra",
    first_principles: [
      "Adjacent cells in a K-map differ by exactly one variable — grouping them eliminates that variable",
      "K-maps use Gray code ordering so that adjacency is preserved at the edges (the map wraps around)",
      "The largest valid group sizes are powers of 2; larger groups yield simpler expressions"
    ],
    learning_objectives: [
      "Fill a 2, 3, or 4-variable K-map from a truth table or minterm list",
      "Identify and group prime implicants — the largest possible groups of 1s",
      "Select essential prime implicants to cover all minterms minimally",
      "Use K-maps with don't-care conditions to achieve further simplification"
    ],
    prerequisites: ["Truth Tables", "Boolean Expression Simplification"],
    content_markdown: `## Karnaugh Maps (K-Maps)

A Karnaugh map (K-map) is a visual method for simplifying Boolean functions of up to 4–5 variables. It exploits the human eye's ability to detect patterns in a 2D grid.

### Structure

Variables are arranged so that **adjacent cells differ by exactly one bit** (Gray code order):

**2-Variable K-Map**:
\`\`\`
      B=0  B=1
A=0 |  0 |  1 |
A=1 |  2 |  3 |
\`\`\`

**3-Variable K-Map** (columns in Gray code: 00, 01, 11, 10):
\`\`\`
       BC=00  BC=01  BC=11  BC=10
A=0  |  m0  |  m1  |  m3  |  m2  |
A=1  |  m4  |  m5  |  m7  |  m6  |
\`\`\`

**4-Variable K-Map**:
\`\`\`
       CD=00  CD=01  CD=11  CD=10
AB=00 |  0  |  1  |  3  |  2  |
AB=01 |  4  |  5  |  7  |  6  |
AB=11 | 12  | 13  | 15  | 14  |
AB=10 |  8  |  9  | 11  | 10  |
\`\`\`

### Grouping Rules

- Groups must be **rectangles** of size 1, 2, 4, 8, or 16
- The map **wraps** — top/bottom and left/right edges are adjacent
- Groups may overlap — use the largest possible groups
- Each group of 2^k cells eliminates k variables

### Example: Simplify F = Σm(0,1,3,7,5)

Place 1s at positions 0,1,3,7,5 and find groups:
- Group {0,1}: A'B'  (size 2)
- Group {1,3,5,7}: B  (size 4)

Cover: F = A'B' + B = A' + B (after further reduction)

### Prime Implicants and Essential Prime Implicants

A **prime implicant** is a maximal group (cannot be made larger).
An **essential prime implicant** covers a minterm that no other prime implicant covers.

**Algorithm**: find all prime implicants → identify essential ones → cover remaining minterms with smallest additional prime implicants.

### Don't Cares

Mark don't-care cells as X. You may treat them as 0 or 1 — always use them as 1 if it lets you form a larger group.`,
    content_easy_markdown: `## Karnaugh Maps — Simple Version

A K-map is a grid where you place 1s from your truth table and then circle the largest possible groups of 1s (groups must be sizes 1, 2, 4, 8 — powers of 2).

**Rules:**
- Adjacent cells differ by 1 bit (Gray code: 00, 01, 11, 10)
- The map wraps — corners and edges connect
- Each group of 2^k cells cancels k variables
- Always make groups as large as possible

After circling, write one AND term per group containing only variables that are constant in that group. OR all the groups together for the final simplified expression.`,
    forge_snippet: `# K-map simplification via prime implicants (2-variable demonstration)
# For larger maps use the Quine-McCluskey method or sympy

def get_minterms(func, n_vars):
    """Return list of minterms where func outputs 1."""
    from itertools import product
    minterms = []
    for i, combo in enumerate(product([0,1], repeat=n_vars)):
        if func(*combo):
            minterms.append(i)
    return minterms

# Example function: F(A,B,C) = A'B' + BC
def F(A, B, C):
    return (not A and not B) or (B and C)

minterms = get_minterms(F, 3)
print("Minterms:", minterms)

# Use sympy to find minimal SOP
from sympy import symbols
from sympy.logic.boolalg import SOPform

A, B, C = symbols('A B C')
minimal = SOPform([A, B, C], minterms)
print("Minimal SOP:", minimal)

# Show the K-map values
print("\n3-variable K-map (rows=A, cols=BC in Gray order):")
print("     BC=00 BC=01 BC=11 BC=10")
gray = [(0,0),(0,1),(1,1),(1,0)]
for a in [0, 1]:
    row = f"A={a}: "
    for b,c in gray:
        row += f"  {int(F(a,b,c))}    "
    print(row)`
  },

  // ── Unit 3: Combinational Circuits ────────────────────────────────────────
  {
    title: "Multiplexers and Demultiplexers",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "CSE 123 > Unit 3: Combinational Circuits",
    first_principles: [
      "A multiplexer is a data selector: n select lines choose 1 of 2^n data inputs to route to the output",
      "A demultiplexer is the inverse: it routes 1 input to 1 of 2^n outputs based on select lines",
      "Multiplexers can implement any Boolean function — they are universal combinational building blocks"
    ],
    learning_objectives: [
      "Draw and explain the operation of a 2-to-1 and 4-to-1 multiplexer",
      "Implement any n-variable Boolean function using a 2^n-to-1 MUX",
      "Draw and explain a 1-to-4 demultiplexer",
      "Describe real-world uses of MUX and DEMUX in buses and communication systems"
    ],
    prerequisites: ["Basic Logic Gates (AND, OR, NOT)", "Truth Tables"],
    content_markdown: `## Multiplexers and Demultiplexers

Multiplexers (MUX) and demultiplexers (DEMUX) are fundamental building blocks for routing data in digital systems — from CPU buses to communication networks.

### Multiplexer (MUX)

A **2^n-to-1 multiplexer** has:
- 2^n **data inputs**: D₀, D₁, …, D_(2^n-1)
- n **select inputs**: S₀, S₁, …, S_(n-1)
- 1 **output**: Y

The select lines form a binary address that chooses which data input reaches the output.

**2-to-1 MUX** (1 select line):
\`\`\`
Y = S'·D₀ + S·D₁
\`\`\`
If S=0 → Y = D₀; if S=1 → Y = D₁

**4-to-1 MUX** (2 select lines):
\`\`\`
Y = S₁'S₀'·D₀ + S₁'S₀·D₁ + S₁S₀'·D₂ + S₁S₀·D₃
\`\`\`

### Implementing Boolean Functions with MUX

A 2^n-to-1 MUX can implement ANY n-variable function: connect each minterm's value (0 or 1) directly to the corresponding data input.

**Example**: Implement F(A,B) = AB using a 4-to-1 MUX:
\`\`\`
D₀ = 0  (A=0, B=0 → F=0)
D₁ = 0  (A=0, B=1 → F=0)
D₂ = 0  (A=1, B=0 → F=0)
D₃ = 1  (A=1, B=1 → F=1)
\`\`\`
Connect A→S₁, B→S₀, D₃=1, rest=0.

You can also implement an n-variable function with a 2^(n-1)-to-1 MUX by using one variable as a data input (Shannon expansion).

### Demultiplexer (DEMUX)

A **1-to-2^n demultiplexer** routes one input to one of 2^n outputs based on n select lines.

\`\`\`
Y₀ = D · S₁' · S₀'
Y₁ = D · S₁' · S₀
Y₂ = D · S₁  · S₀'
Y₃ = D · S₁  · S₀
\`\`\`

### Real-World Use

- **CPU data bus**: MUX selects which register drives the bus
- **Time-division multiplexing**: multiple signals share one communication line
- **RAM addressing**: DEMUX routes data to the correct memory cell`,
    content_easy_markdown: `## Multiplexers and Demultiplexers — Simple Version

A **MUX** (multiplexer) is a data selector — think of a railroad switch. You have many input tracks, and the select lines choose which one connects to the output.

A **DEMUX** (demultiplexer) is the reverse — one input track splits to many outputs, and the select lines choose which output receives the signal.

The n select lines can address 2^n inputs/outputs.

Practical use: on a CPU, the select lines are the register address, and the MUX routes the right register value to the ALU.`,
    forge_snippet: `# MUX and DEMUX simulation in Python

def mux_2to1(D0, D1, S):
    """2-to-1 multiplexer."""
    return D1 if S else D0

def mux_4to1(D, S):
    """4-to-1 MUX. D is list of 4 data inputs, S is 2-bit select (0-3)."""
    return D[S]

def demux_1to4(data, S):
    """1-to-4 DEMUX. Returns list of 4 outputs."""
    outputs = [0, 0, 0, 0]
    outputs[S] = data
    return outputs

# Implement F(A,B) = A AND B using 4-to-1 MUX
# Truth table: 00→0, 01→0, 10→0, 11→1
def AND_via_mux(A, B):
    data_inputs = [0, 0, 0, 1]   # minterm values
    select = (A << 1) | B        # A=MSB, B=LSB
    return mux_4to1(data_inputs, select)

print("AND via 4-to-1 MUX:")
for A in [0,1]:
    for B in [0,1]:
        print(f"  A={A} B={B} → {AND_via_mux(A,B)}")

# DEMUX routing
print("\nDEMUX 1-to-4, data=1, select=2:")
print(demux_1to4(1, 2))   # [0, 0, 1, 0]`
  },
  {
    title: "Encoders and Decoders",
    importance_level: "Advanced",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "CSE 123 > Unit 3: Combinational Circuits",
    first_principles: [
      "An encoder converts 2^n input lines (one active at a time) to an n-bit binary code",
      "A decoder converts an n-bit binary code to 1 of 2^n output lines (exactly one active)",
      "Decoders generate all minterms of their inputs and can implement any Boolean function"
    ],
    learning_objectives: [
      "Draw the logic diagram and truth table for a 4-to-2 priority encoder",
      "Draw the logic diagram and truth table for a 2-to-4 decoder with enable",
      "Implement Boolean functions using a decoder plus OR gates",
      "Explain BCD-to-7-segment decoder operation"
    ],
    prerequisites: ["Multiplexers and Demultiplexers"],
    content_markdown: `## Encoders and Decoders

Encoders and decoders translate between different binary representations — essential for keyboard input, display drivers, memory addressing, and instruction decoding in CPUs.

### Decoder

An **n-to-2^n decoder** converts an n-bit binary input to exactly one of 2^n output lines (the output at the address given by the input goes HIGH, all others LOW).

**2-to-4 Decoder** (inputs: A₁A₀, outputs: Y₀–Y₃):
\`\`\`
Y₀ = A₁'·A₀'   (address 00)
Y₁ = A₁'·A₀    (address 01)
Y₂ = A₁ ·A₀'   (address 10)
Y₃ = A₁ ·A₀    (address 11)
\`\`\`

With an **enable** input E: AND each output with E. When E=0, all outputs are 0.

**Implementing functions with a decoder**: each output Yᵢ is minterm mᵢ. Connect all minterms where F=1 to an OR gate.

**Example**: F(A,B) = Σm(0,3) → F = Y₀ + Y₃

### Encoder

An **encoder** has 2^n inputs (one HIGH at a time) and produces the n-bit binary code of the active input.

**4-to-2 Encoder** (inputs: I₀–I₃, outputs: A₁A₀):
\`\`\`
A₁ = I₂ + I₃
A₀ = I₁ + I₃
\`\`\`

Problem: if no input or multiple inputs are active, the output is undefined.

### Priority Encoder

A **priority encoder** handles multiple active inputs: the highest-priority (highest-numbered) active input determines the output. An extra **valid output** V indicates if any input is active.

**4-input priority encoder (I₃ highest priority)**:
\`\`\`
A₁ = I₃ + I₂
A₀ = I₃ + I₁·I₂'
V  = I₀ + I₁ + I₂ + I₃
\`\`\`

### BCD-to-7-Segment Decoder

Converts a 4-bit BCD digit (0-9) to seven segment signals (a-g) that drive an LED display. This is a classic combinational design problem used in calculators and clocks.`,
    content_easy_markdown: `## Encoders and Decoders — Simple Version

A **decoder** takes a binary number and activates the corresponding output line. It's like a mailbox system — address 5 rings bell 5.

An **encoder** is the reverse — exactly one input is active, and it outputs the binary code for that input.

A **priority encoder** handles the messy case where multiple inputs are active at once — it picks the most important one.

The most famous decoder is the **BCD-to-7-segment** decoder that drives the LED digits on calculators and digital clocks.`,
    forge_snippet: `# Encoder and decoder simulation

def decoder_2to4(A1, A0, enable=1):
    """2-to-4 decoder with active-high enable."""
    if not enable:
        return [0, 0, 0, 0]
    outputs = [0] * 4
    outputs[(A1 << 1) | A0] = 1
    return outputs

def encoder_4to2(inputs):
    """Basic 4-to-2 encoder (assumes exactly one input is HIGH)."""
    try:
        idx = inputs.index(1)
        return (idx >> 1) & 1, idx & 1   # A1, A0
    except ValueError:
        return None  # no input active

def priority_encoder_4to2(inputs):
    """Priority encoder: highest-index input wins."""
    for i in range(len(inputs)-1, -1, -1):
        if inputs[i]:
            valid = 1
            return (i >> 1) & 1, i & 1, valid
    return 0, 0, 0  # no input active

# Decoder test
print("2-to-4 Decoder outputs:")
for a1 in [0,1]:
    for a0 in [0,1]:
        print(f"  {a1}{a0} → {decoder_2to4(a1,a0)}")

# Implement F = m0 + m3 using decoder
def F_via_decoder(A1, A0):
    y = decoder_2to4(A1, A0)
    return y[0] | y[3]   # OR of minterms 0 and 3

print("\nF = Σm(0,3):")
for a1 in [0,1]:
    for a0 in [0,1]:
        print(f"  A={a1}{a0} → F={F_via_decoder(a1,a0)}")

# Priority encoder test
print("\nPriority encoder [0,1,1,0]:", priority_encoder_4to2([0,1,1,0]))`
  },
  {
    title: "Binary Adders and Subtractors",
    importance_level: "Advanced",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "CSE 123 > Unit 3: Combinational Circuits",
    first_principles: [
      "A half adder computes the sum and carry for two 1-bit inputs with no carry-in",
      "A full adder extends the half adder to accept a carry-in — enabling multi-bit addition by chaining",
      "Subtraction is implemented as addition of the two's complement, sharing the same adder hardware"
    ],
    learning_objectives: [
      "Design a half adder using XOR and AND gates",
      "Design a full adder from two half adders and an OR gate",
      "Build an n-bit ripple carry adder from full adders",
      "Design an adder/subtractor circuit using XOR-controlled inversion and a carry-in of 1",
      "Explain the trade-off between ripple carry and carry-lookahead adders"
    ],
    prerequisites: ["Derived Logic Gates (NAND, NOR, XOR, XNOR)", "Signed Numbers and Two's Complement"],
    content_markdown: `## Binary Adders and Subtractors

The adder is the most critical arithmetic circuit in a processor. Every multiplication, division, address computation, and ALU operation is built from adders.

### Half Adder

Adds two 1-bit numbers A and B, producing a Sum S and Carry C:

\`\`\`
S = A ⊕ B     (XOR)
C = A · B     (AND)
\`\`\`

Truth table:

| A | B | S | C |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

### Full Adder

Adds three 1-bit values: A, B, and carry-in Cᵢₙ:

\`\`\`
S    = A ⊕ B ⊕ Cᵢₙ
Cₒᵤₜ = A·B + Cᵢₙ·(A ⊕ B)
\`\`\`

Built from two half adders: HA₁ adds A+B, HA₂ adds the partial sum + Cᵢₙ, and the carry-out is OR of the two carries.

### Ripple Carry Adder (RCA)

Chain n full adders, routing Cₒᵤₜ of each stage to Cᵢₙ of the next. For an n-bit RCA:
- The carry **ripples** through all n stages
- Delay: O(n) gate delays
- Simple but slow for large n

### Adder/Subtractor

Use XOR gates to conditionally invert the B input:

\`\`\`
When Sub=0: Bᵢ ⊕ 0 = Bᵢ   → add
When Sub=1: Bᵢ ⊕ 1 = Bᵢ'  → invert (one's complement)
            plus Cᵢₙ=1      → two's complement
\`\`\`

Connect Sub to all B-side XOR gates AND to the carry-in of the LSB adder.

### Carry Lookahead Adder (CLA)

Computes carry signals **in parallel** rather than waiting for ripple:
- **Generate**: Gᵢ = Aᵢ·Bᵢ (carry generated regardless of Cᵢₙ)
- **Propagate**: Pᵢ = Aᵢ⊕Bᵢ (carry propagated if Cᵢₙ=1)
- Cᵢ₊₁ = Gᵢ + Pᵢ·Cᵢ

CLA delay: O(log n), much faster than RCA for large n.`,
    content_easy_markdown: `## Binary Adders and Subtractors — Simple Version

**Half adder**: adds two bits → Sum = XOR, Carry = AND.

**Full adder**: adds three bits (two data + one carry-in) → made from two half adders.

**Ripple carry adder**: chain full adders together — carry "ripples" from right to left. Simple but slow.

**Adder/subtractor**: add XOR gates on the B input. When subtract=1, XOR flips B to its complement, and a carry-in of 1 finishes the two's complement — same hardware does both operations.`,
    forge_snippet: `# Binary adder simulation in Python

def half_adder(a, b):
    s = a ^ b       # XOR
    c = a & b       # AND
    return s, c

def full_adder(a, b, cin):
    s1, c1 = half_adder(a, b)
    s2, c2 = half_adder(s1, cin)
    cout = c1 | c2
    return s2, cout

def ripple_carry_add(A_bits, B_bits, subtract=False):
    """Add two equal-length bit lists (LSB first). If subtract=True, do A-B."""
    if subtract:
        B_bits = [1 - b for b in B_bits]  # one's complement
    cin = 1 if subtract else 0
    result = []
    for a, b in zip(A_bits, B_bits):
        s, cin = full_adder(a, b, cin)
        result.append(s)
    return result, cin  # result bits (LSB first), final carry-out

# Test: 1011 + 0110 = 10001 (11 + 6 = 17)
A = [1,1,0,1]  # 1011 LSB first
B = [0,1,1,0]  # 0110 LSB first
result, carry = ripple_carry_add(A, B)
print("Addition:", result[::-1], "carry:", carry)
decimal = int(''.join(str(b) for b in result[::-1]), 2) + (carry << 4)
print("Decimal result:", decimal)  # 17

# Test subtraction: 1010 - 0011 = 0111 (10 - 3 = 7)
A2 = [0,1,0,1]  # 1010 LSB first
B2 = [1,1,0,0]  # 0011 LSB first
res2, _ = ripple_carry_add(A2, B2, subtract=True)
print("Subtraction:", res2[::-1])   # 0111 → 7`
  },
  {
    title: "Comparators",
    importance_level: "Advanced",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "CSE 123 > Unit 3: Combinational Circuits",
    first_principles: [
      "Equality comparison uses XNOR: two bits are equal if and only if their XNOR is 1",
      "Magnitude comparison proceeds from the most significant bit downward — the first differing bit determines the result",
      "Iterative comparators chain 1-bit comparator stages, passing comparison state from MSB to LSB"
    ],
    learning_objectives: [
      "Design a 1-bit equality comparator using XNOR",
      "Design a 1-bit magnitude comparator that outputs A>B, A=B, A<B",
      "Extend to an n-bit comparator by cascading or using a subtractor",
      "Explain the 74LS85 4-bit magnitude comparator and its cascading inputs"
    ],
    prerequisites: ["Derived Logic Gates (NAND, NOR, XOR, XNOR)", "Binary Adders and Subtractors"],
    content_markdown: `## Comparators

A comparator circuit determines the relative magnitude of two binary numbers, producing outputs for A>B, A=B, and A<B. Comparators are used in branch instructions, sorting hardware, and control systems.

### 1-Bit Equality Comparator

Two bits are equal when they are both 0 or both 1:
\`\`\`
EQ = A ⊙ B = A'B' + AB = XNOR(A, B)
\`\`\`

### 1-Bit Magnitude Comparator

\`\`\`
A_gt_B = A · B'     (A=1, B=0)
A_eq_B = A ⊙ B     (XNOR)
A_lt_B = A'· B     (A=0, B=1)
\`\`\`

Verify: exactly one of {A>B, A=B, A<B} is true for any inputs.

### 2-Bit Magnitude Comparator

Compare A₁A₀ with B₁B₀ (A₁, B₁ are MSBs):

Let E₁ = A₁⊙B₁ (bit 1 equal), E₀ = A₀⊙B₀ (bit 0 equal)

\`\`\`
A_gt_B = A₁·B₁' + E₁·A₀·B₀'
A_eq_B = E₁ · E₀
A_lt_B = A₁'·B₁ + E₁·A₀'·B₀
\`\`\`

### Iterative n-Bit Comparator

The general approach: compare from MSB to LSB. Pass three cascade inputs (G, E, L — greater/equal/less from higher bits) into each 1-bit stage.

For bit position i (processing from MSB):
\`\`\`
Gᵢ₊₁ = Aᵢ·Bᵢ' + Eᵢ·Aᵢ·Bᵢ' ... (simplified with E_in)
\`\`\`

The standard **74LS85** chip compares two 4-bit values and accepts cascade inputs for chaining multiple chips.

### Using a Subtractor for Comparison

Compute A − B using a subtractor:
- If carry-out = 1 (no borrow): A ≥ B
- If result = 0: A = B
- If carry-out = 0 (borrow): A < B

### Applications

- **CPU branch instructions**: CMP instruction stores comparison result in flags
- **Priority circuits**: comparators determine which request has the highest value
- **Network routers**: comparing IP address prefixes`,
    content_easy_markdown: `## Comparators — Simple Version

A comparator tells you if A > B, A = B, or A < B in binary.

**Equality**: use XNOR — if both bits are the same, XNOR outputs 1. AND all the bit-equality results together.

**Magnitude**: start from the most significant bit. If A's MSB > B's MSB, then A > B. If they're equal, look at the next bit, and so on.

In hardware, comparators often use a subtractor internally — if A−B has no borrow, A ≥ B.`,
    forge_snippet: `# Comparator simulation in Python

def compare_1bit(a, b):
    """Returns (gt, eq, lt) for single-bit comparison."""
    return (a and not b, a == b, not a and b)

def compare_nbit(A, B):
    """
    Compare two unsigned integers represented as equal-length bit lists (MSB first).
    Returns 'GT', 'EQ', or 'LT'.
    """
    for a, b in zip(A, B):
        if a > b: return 'GT'
        if a < b: return 'LT'
    return 'EQ'

def compare_integers(x, y, bits=8):
    """Wrap compare_nbit for plain integers."""
    A = [(x >> (bits-1-i)) & 1 for i in range(bits)]
    B = [(y >> (bits-1-i)) & 1 for i in range(bits)]
    return compare_nbit(A, B)

# Test cases
pairs = [(5, 3), (7, 7), (2, 9), (255, 128)]
for x, y in pairs:
    result = compare_integers(x, y)
    print(f"{x:3d} vs {y:3d} → {result}")

# XNOR-based equality (all bits must match)
def equal_nbit(x, y, bits=8):
    for i in range(bits):
        if ((x >> i) & 1) != ((y >> i) & 1):
            return False
    return True

print("\nEquality check:")
print(equal_nbit(42, 42))   # True
print(equal_nbit(42, 43))   # False`
  },

  // ── Unit 4: Sequential Circuits ───────────────────────────────────────────
  {
    title: "Latches and Flip-Flops (SR, D, JK, T)",
    importance_level: "Advanced",
    estimated_time: "70 mins",
    estimated_time_minutes: 70,
    breadcrumb_path: "CSE 123 > Unit 4: Sequential Circuits",
    first_principles: [
      "A sequential circuit's output depends on both current inputs AND stored state — it has memory",
      "Latches are level-sensitive (transparent when enable is active); flip-flops are edge-triggered (capture on clock edge)",
      "All flip-flops can be derived from the SR latch by adding steering logic"
    ],
    learning_objectives: [
      "Explain the operation and timing of an SR latch, including the forbidden state",
      "Draw the circuit and timing diagram for a D flip-flop",
      "Derive the characteristic equation for JK and T flip-flops",
      "Explain the difference between level-sensitive and edge-triggered behavior",
      "Convert between flip-flop types using excitation tables"
    ],
    prerequisites: ["Basic Logic Gates (AND, OR, NOT)", "Derived Logic Gates (NAND, NOR, XOR, XNOR)"],
    content_markdown: `## Latches and Flip-Flops

Sequential circuits add **memory** to digital logic. Unlike combinational circuits whose outputs depend only on current inputs, sequential circuits remember their history. The basic memory element is the **latch**, and its clocked, edge-triggered version is the **flip-flop**.

### SR Latch (Set-Reset)

Built from two cross-coupled NAND (or NOR) gates:

**NOR SR Latch** (active-HIGH inputs):

| S | R | Q | Q' | State |
|---|---|---|----|-------|
| 0 | 0 | Q | Q' | Hold (no change) |
| 1 | 0 | 1 | 0 | Set |
| 0 | 1 | 0 | 1 | Reset |
| 1 | 1 | ? | ? | **Forbidden** |

The forbidden state (S=R=1) causes both outputs to become 1 simultaneously, violating Q'=NOT(Q).

### D Latch (Data/Delay Latch)

Eliminates the forbidden state by enforcing R = S':

\`\`\`
When Enable=1: Q follows D (transparent)
When Enable=0: Q holds last value
\`\`\`

Characteristic equation: Q_next = D (when enabled)

### D Flip-Flop (Edge-Triggered)

Captures the D input at the rising (or falling) clock edge. Between clock edges, Q is stable regardless of D changes.

This is the most widely used flip-flop — registers in CPUs are built from D flip-flops.

### JK Flip-Flop

Extends the SR flip-flop by defining the J=K=1 (previously forbidden) case as **toggle**:

| J | K | Q_next |
|---|---|--------|
| 0 | 0 | Q (hold) |
| 0 | 1 | 0 (reset) |
| 1 | 0 | 1 (set) |
| 1 | 1 | Q' (toggle) |

Characteristic equation: Q_next = J·Q' + K'·Q

### T Flip-Flop (Toggle)

Simplified JK with J=K=T:

\`\`\`
T=0: Q_next = Q   (hold)
T=1: Q_next = Q'  (toggle)
\`\`\`

Characteristic equation: Q_next = T ⊕ Q

T flip-flops are the building blocks of **binary counters** — each stage divides the clock frequency by 2.

### Setup and Hold Time

- **Setup time**: D must be stable BEFORE the clock edge
- **Hold time**: D must remain stable AFTER the clock edge
- Violating these causes **metastability** — unpredictable behavior`,
    content_easy_markdown: `## Latches and Flip-Flops — Simple Version

A **latch** stores one bit. It is the simplest memory element — built from two NAND or NOR gates feeding back into each other.

A **flip-flop** is a clocked latch — it only updates on the clock edge (rising or falling), not whenever inputs change. This synchronization is critical in real circuits.

Types:
- **D flip-flop**: stores whatever D is at the clock edge — used in registers
- **JK flip-flop**: set, reset, or toggle — more flexible
- **T flip-flop**: toggles on T=1 — used in counters`,
    forge_snippet: `# Flip-flop behavior simulation in Python

class DFlipFlop:
    def __init__(self):
        self.Q = 0

    def clock_edge(self, D):
        """Rising edge: capture D."""
        self.Q = D
        return self.Q

class JKFlipFlop:
    def __init__(self):
        self.Q = 0

    def clock_edge(self, J, K):
        if J == 0 and K == 0:
            pass           # Hold
        elif J == 0 and K == 1:
            self.Q = 0     # Reset
        elif J == 1 and K == 0:
            self.Q = 1     # Set
        else:              # J=K=1
            self.Q ^= 1    # Toggle
        return self.Q

class TFlipFlop:
    def __init__(self):
        self.Q = 0

    def clock_edge(self, T):
        if T:
            self.Q ^= 1    # Toggle
        return self.Q

# Demonstrate D flip-flop
print("D Flip-Flop sequence:")
dff = DFlipFlop()
for d in [1, 1, 0, 1, 0, 0]:
    q = dff.clock_edge(d)
    print(f"  D={d} → Q={q}")

# Demonstrate T flip-flop (toggle counter)
print("\nT Flip-Flop (T=1 every clock — counts):")
tff = TFlipFlop()
for _ in range(8):
    print(tff.clock_edge(1), end=" ")
print()  # 1 0 1 0 1 0 1 0`
  },
  {
    title: "Registers",
    importance_level: "Advanced",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "CSE 123 > Unit 4: Sequential Circuits",
    first_principles: [
      "A register is a group of flip-flops sharing a common clock that stores a multi-bit value",
      "A shift register moves its stored bits left or right by one position on each clock edge",
      "Serial-to-parallel and parallel-to-serial conversion are the primary uses of shift registers"
    ],
    learning_objectives: [
      "Describe the structure of an n-bit parallel load register",
      "Explain the four modes of a universal shift register (hold, shift-left, shift-right, parallel load)",
      "Design a 4-bit shift register from D flip-flops",
      "Calculate the number of clock cycles required for serial data transfer"
    ],
    prerequisites: ["Latches and Flip-Flops (SR, D, JK, T)"],
    content_markdown: `## Registers

A **register** is a group of flip-flops that stores a multi-bit binary value. Registers are the fastest, most expensive storage in a computer — they live directly inside the CPU and hold the data currently being operated on.

### Parallel Register

An n-bit parallel register contains n D flip-flops with a common clock (CLK) and common load enable (LD):

\`\`\`
When LD=1 on rising CLK: all n bits load simultaneously from inputs D[n-1:0]
When LD=0: all flip-flops hold their current values
\`\`\`

This is what CPU registers (RAX, RBX, etc.) fundamentally are.

### Shift Register

A **shift register** connects the output of each flip-flop to the input of the next:

\`\`\`
Serial_In → [D FF₀] → [D FF₁] → [D FF₂] → [D FF₃] → Serial_Out
\`\`\`

On each clock edge, data shifts right by one position. After n clocks, the serial input has been loaded into all n positions.

### Serial-In, Parallel-Out (SIPO)

Load data serially one bit per clock, then read all n bits simultaneously.
Used in: SPI communication, USB, UART — converting serial data streams to parallel bus values.

### Parallel-In, Serial-Out (PISO)

Load all n bits simultaneously, then shift them out one bit per clock.
Used in: transmitting parallel data over a single wire (e.g., sending a byte over SPI).

### Universal Shift Register

A 4-bit universal shift register has four operation modes controlled by two mode-select lines S₁S₀:

| S₁ | S₀ | Mode |
|----|----|------|
| 0 | 0 | Hold (no change) |
| 0 | 1 | Shift right |
| 1 | 0 | Shift left |
| 1 | 1 | Parallel load |

### Ring Counter and Johnson Counter

**Ring counter**: the output of the last FF feeds back to the input of the first — a circulating "1" creates a one-hot pattern.

**Johnson counter** (twisted ring): the COMPLEMENT of the last FF feeds back — creates 2n unique states from n flip-flops.`,
    content_easy_markdown: `## Registers — Simple Version

A **register** is just n flip-flops sharing one clock — it stores n bits simultaneously.

A **shift register** passes data from one flip-flop to the next on each clock edge. It converts between serial and parallel data:

- **SIPO**: receive bits one at a time (serial), read all at once (parallel) — like receiving a byte over SPI
- **PISO**: load all bits at once (parallel), send one at a time (serial) — like transmitting a byte

Shift registers are everywhere: USB, SPI, UART, HDMI — any serial communication protocol uses this principle.`,
    forge_snippet: `# Register and shift register simulation in Python

class ParallelRegister:
    def __init__(self, width=4):
        self.width = width
        self.Q = [0] * width

    def clock_edge(self, D=None, load=True):
        """Rising edge: load D if load=True, else hold."""
        if load and D is not None:
            self.Q = list(D[:self.width])
        return self.Q[:]

class ShiftRegister:
    def __init__(self, width=4):
        self.width = width
        self.bits = [0] * width  # MSB first

    def shift_right(self, serial_in=0):
        """Shift all bits right, insert serial_in at MSB."""
        self.bits = [serial_in] + self.bits[:-1]
        return self.bits[:]

    def shift_left(self, serial_in=0):
        """Shift all bits left, insert serial_in at LSB."""
        self.bits = self.bits[1:] + [serial_in]
        return self.bits[:]

# Load byte 0b1011 in parallel
reg = ParallelRegister(4)
print("Parallel load:", reg.clock_edge([1,0,1,1]))  # [1, 0, 1, 1]

# Serial-in parallel-out: receive 1,0,1,1 bit by bit
sr = ShiftRegister(4)
serial_stream = [1, 0, 1, 1]
print("\nSIPO shift register:")
for bit in serial_stream:
    state = sr.shift_right(bit)
    print(f"  Input={bit} → Register={state}")
# After 4 clocks: [1, 0, 1, 1]

# PISO: parallel load then shift out
sr2 = ShiftRegister(4)
sr2.bits = [1, 0, 1, 1]
print("\nPISO shift out:")
for _ in range(4):
    serial_out = sr2.bits[0]
    sr2.shift_left(0)
    print(f"  Serial out: {serial_out}")`
  },
  {
    title: "Counters (Synchronous and Asynchronous)",
    importance_level: "Advanced",
    estimated_time: "65 mins",
    estimated_time_minutes: 65,
    breadcrumb_path: "CSE 123 > Unit 4: Sequential Circuits",
    first_principles: [
      "A binary counter sequences through 2^n states, incrementing (or decrementing) on each clock edge",
      "In a ripple (asynchronous) counter, each flip-flop is clocked by the previous flip-flop's output — causing propagation delay",
      "In a synchronous counter, all flip-flops share the same clock — all bits update simultaneously"
    ],
    learning_objectives: [
      "Design a 4-bit asynchronous ripple counter using T flip-flops",
      "Explain the glitch/ripple problem in asynchronous counters",
      "Design a 4-bit synchronous binary counter with parallel carry",
      "Design a modulo-N counter (e.g., decade counter, mod-6 counter)",
      "Use a counter with an enable and synchronous clear"
    ],
    prerequisites: ["Latches and Flip-Flops (SR, D, JK, T)", "Registers"],
    content_markdown: `## Counters: Synchronous and Asynchronous

Counters are sequential circuits that cycle through a predetermined sequence of states. They are the heartbeat of digital systems — found in CPUs (program counters), timers, frequency dividers, and event counters.

### Asynchronous (Ripple) Counter

In a ripple counter, each flip-flop is triggered by the output of the previous one:

\`\`\`
CLK → [T FF₀ (LSB)] → Q₀ clocks [T FF₁] → Q₁ clocks [T FF₂] → Q₂ clocks [T FF₃ (MSB)]
\`\`\`

Each T flip-flop with T=1 **toggles** on every rising edge, dividing frequency by 2.

**Sequence** (4-bit): 0000 → 0001 → 0010 → 0011 → … → 1111 → 0000

**Problem**: carries ripple through flip-flops sequentially. During the transition from 0111→1000, intermediate invalid states (0110, 0100, 0000…) appear briefly — causing **glitches**.

**Advantage**: very simple circuit — just chain T flip-flops.

### Synchronous Counter

All flip-flops share the same clock — all bits update simultaneously, eliminating glitches.

**4-bit synchronous binary up-counter using T flip-flops**:

\`\`\`
T₀ = 1                (always toggles)
T₁ = Q₀               (toggles when Q₀=1)
T₂ = Q₀ · Q₁          (toggles when Q₀=Q₁=1)
T₃ = Q₀ · Q₁ · Q₂     (toggles when Q₀=Q₁=Q₂=1)
\`\`\`

### Modulo-N Counter

A counter that counts through N states then resets:

**Mod-10 (Decade) counter**: counts 0–9, resets to 0 on reaching 10.
Detect state 1010 (10) → asynchronously clear all flip-flops.

**Mod-6 counter**: detect 0110 → clear.

### Down Counter

For a synchronous down counter: flip the enable conditions (use Q' where up-counter used Q).

### Counter with Enable and Synchronous Clear

Real counters have:
- **EN (enable)**: counter only increments when EN=1
- **CLR (synchronous clear)**: on the next clock edge, reset to 0
- **LOAD**: parallel load an initial value

These features allow the counter to be stopped, reset, and started from any value.`,
    content_easy_markdown: `## Counters — Simple Version

A **counter** is a sequential circuit that counts up (or down) in binary.

**Ripple counter**: each flip-flop clocks the next — simple but creates timing glitches between bits.

**Synchronous counter**: all flip-flops share one clock — all bits update at the same instant, no glitches.

**Mod-N counter**: counts 0 to N-1 then resets. A decade counter (mod-10) counts 0 to 9 — used in digital clocks.

T flip-flops are natural counter stages because they toggle (divide frequency by 2) with each clock edge.`,
    forge_snippet: `# Counter simulation in Python

class RippleCounter:
    """4-bit asynchronous ripple counter simulation."""
    def __init__(self):
        self.bits = [0, 0, 0, 0]  # Q0(LSB) to Q3(MSB)

    def clock(self):
        """Simulate one rising clock edge on Q0, ripple effect."""
        carry = 1
        for i in range(4):
            new_val = self.bits[i] ^ carry
            carry = self.bits[i] & carry
            self.bits[i] = new_val
        return self.value()

    def value(self):
        return sum(b << i for i, b in enumerate(self.bits))

class SynchronousCounter:
    """4-bit synchronous binary up counter."""
    def __init__(self, modulo=16):
        self.count = 0
        self.modulo = modulo

    def clock(self, enable=True, clear=False):
        if clear:
            self.count = 0
        elif enable:
            self.count = (self.count + 1) % self.modulo
        return self.count

# Ripple counter: show 0-15
print("Ripple counter (0-7):")
rc = RippleCounter()
for _ in range(8):
    v = rc.clock()
    print(f"  {v:2d} = {v:04b}")

# Decade counter (mod-10)
print("\nDecade counter (mod-10):")
dc = SynchronousCounter(modulo=10)
for _ in range(12):
    v = dc.clock()
    print(f"  {v}", end=" ")
print()  # 1 2 3 4 5 6 7 8 9 0 1 2`
  },
  {
    title: "Finite State Machines (Moore and Mealy)",
    importance_level: "Expert",
    estimated_time: "80 mins",
    estimated_time_minutes: 80,
    breadcrumb_path: "CSE 123 > Unit 4: Sequential Circuits",
    first_principles: [
      "A finite state machine (FSM) is a mathematical model of a system with a finite number of states, transitions, and outputs",
      "In a Moore machine, outputs depend only on the current state; in a Mealy machine, outputs depend on both state and input",
      "Every sequential digital circuit can be described as an FSM — CPUs, protocols, and parsers are all FSMs"
    ],
    learning_objectives: [
      "Draw a state diagram for a given sequential problem (Moore and Mealy)",
      "Construct the state table from a state diagram",
      "Perform state assignment and derive flip-flop input equations",
      "Implement an FSM circuit from the flip-flop equations using D or JK flip-flops",
      "Compare Moore and Mealy machines: output timing differences and trade-offs"
    ],
    prerequisites: ["Latches and Flip-Flops (SR, D, JK, T)", "Counters (Synchronous and Asynchronous)", "Karnaugh Maps (K-Maps)"],
    content_markdown: `## Finite State Machines: Moore and Mealy

Finite State Machines (FSMs) are the mathematical model underlying all sequential digital circuits — from traffic light controllers to CPU instruction pipelines. Mastering FSM design is the capstone of digital systems.

### FSM Components

1. **States**: a finite set S of possible system configurations
2. **Inputs**: signals that trigger transitions
3. **Outputs**: signals produced by the machine
4. **Transition function** δ: (state, input) → next_state
5. **Output function** λ: state (Moore) or (state, input) (Mealy) → output
6. **Initial state**: s₀

### Moore Machine

**Outputs are associated with states** — output depends only on current state, not on inputs.

**State diagram**: circles = states (output written inside), arrows = transitions labeled with input.

**Example**: 1-bit sequence detector (detects "11"):

States: A (no 1 seen), B (one 1 seen), C (two 1s seen)
\`\`\`
State A: output=0, on input 1 → B, on input 0 → A
State B: output=0, on input 1 → C, on input 0 → A
State C: output=1, on input 1 → C, on input 0 → A
\`\`\`

### Mealy Machine

**Outputs are associated with transitions** — output depends on both current state and current input.

Generally requires **fewer states** than an equivalent Moore machine.

**Timing difference**: Mealy output changes as soon as input changes (before the clock); Moore output changes one clock cycle later.

### FSM Design Procedure

1. **State diagram** from problem description
2. **State table** (next-state table + output table)
3. **State assignment**: assign binary codes to states
4. **Next-state logic**: K-map minimization for each flip-flop's input
5. **Output logic**: K-map minimization for each output
6. **Circuit implementation**

### Example: Traffic Light Controller

States: GREEN (30s), YELLOW (5s), RED (30s)
Timer input T=1 when time is up.

\`\`\`
GREEN → (T=1) → YELLOW → (T=1) → RED → (T=1) → GREEN
\`\`\`

Outputs: {G, Y, R} encoded per state (Moore machine).

### State Minimization

Two states are **equivalent** if:
1. They have the same output, AND
2. For every input, they transition to equivalent states

Merging equivalent states reduces circuit complexity.

### Practical FSMs in CS

- **TCP protocol**: CLOSED, LISTEN, SYN_SENT, ESTABLISHED, FIN_WAIT… states
- **Lexer/parser**: states for reading identifiers, numbers, strings
- **Vending machine**: states for idle, coin received, item dispensed`,
    content_easy_markdown: `## Finite State Machines — Simple Version

An FSM is a system that can be in one of a finite number of **states**. Events (inputs) cause it to move between states. The output depends on which state you're in (Moore) or on both state and input (Mealy).

**Moore machine**: output only depends on state — outputs change after a clock edge.
**Mealy machine**: output depends on state AND input — outputs can change immediately when input changes.

**How to design one:**
1. Draw a state diagram (circles = states, arrows = transitions)
2. Build a state table
3. Assign binary codes to states
4. Use K-maps to find the flip-flop equations
5. Build the circuit

FSMs model everything: traffic lights, vending machines, communication protocols, CPU control units.`,
    forge_snippet: `# Finite State Machine simulation in Python

class MooreFSM:
    """
    Moore FSM: sequence detector for '11' in a bit stream.
    States: A=no_1, B=one_1, C=got_11 (output=1 in state C)
    """
    def __init__(self):
        self.state = 'A'
        self.transitions = {
            'A': {0: 'A', 1: 'B'},
            'B': {0: 'A', 1: 'C'},
            'C': {0: 'A', 1: 'C'},
        }
        self.outputs = {'A': 0, 'B': 0, 'C': 1}

    def step(self, inp):
        output = self.outputs[self.state]
        self.state = self.transitions[self.state][inp]
        return output, self.state

class MealyFSM:
    """
    Mealy FSM: same '11' detector but output on transition.
    States: A=no_1, B=one_1
    """
    def __init__(self):
        self.state = 'A'
        # (next_state, output)
        self.transitions = {
            'A': {0: ('A', 0), 1: ('B', 0)},
            'B': {0: ('A', 0), 1: ('B', 1)},  # output 1 on second consecutive 1
        }

    def step(self, inp):
        next_state, output = self.transitions[self.state][inp]
        self.state = next_state
        return output, self.state

# Test on sequence: 0 1 0 1 1 0 1 1 1
sequence = [0, 1, 0, 1, 1, 0, 1, 1, 1]

print("Moore FSM (output lags by one clock):")
moore = MooreFSM()
for bit in sequence:
    out, state = moore.step(bit)
    print(f"  input={bit} → output={out} state={state}")

print("\nMealy FSM (output immediate on transition):")
mealy = MealyFSM()
for bit in sequence:
    out, state = mealy.step(bit)
    print(f"  input={bit} → output={out} state={state}")`
  }
];

async function seed() {
  try {
    console.log("💾 Seeding CSE 123: Introduction to Digital Systems topics...");
    const courseRes = await pool.query(
      "SELECT id FROM courses WHERE name ILIKE '%CSE 123%' LIMIT 1"
    );
    if (courseRes.rows.length === 0) {
      throw new Error("CSE 123 not found. Run seed_curriculum.js first.");
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
    console.log(`\n✅ CSE 123 done — ${topics.length} topics seeded.\n`);
  } catch (err) {
    console.error("❌ CSE 123 seeding failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed();
