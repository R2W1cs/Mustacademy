import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });
import pool from "../config/db.js";

const methodologies = [
    {
        title: "Waterfall Model — Step by Step",
        importance: "Critical",
        principles: [
            "What is Waterfall? Think of building a house: you MUST finish the foundation before walls, walls before roof. You CANNOT go back. That's Waterfall.",
            "Step 1 — Requirements: Sit with the client, write down EVERYTHING the system must do. Freeze it. No changes allowed after this.",
            "Step 2 — System Design: Architects draw the blueprint. Database schema, system architecture, interface design. All on paper first.",
            "Step 3 — Implementation: Developers write code based EXACTLY on the design documents. No improvisation.",
            "Step 4 — Testing: After ALL code is written, testers check everything against the requirements. Bugs found here are expensive to fix.",
            "Step 5 — Deployment: The finished product is delivered to the client. First time they see working software!",
            "Step 6 — Maintenance: Fix bugs, add small updates. But major changes? Start over.",
            "Key Rule: Each phase must be 100% complete before moving to the next. No going back.",
            "When to Use: Requirements are crystal clear and won't change. Examples: government contracts, medical device software, banking regulations.",
            "Biggest Problem: Client sees the product ONLY at the end. If requirements were wrong, you wasted months."
        ],
        blueprint: `graph TD
    A["📋 Step 1: Requirements"] --> B["🏗️ Step 2: System Design"]
    B --> C["💻 Step 3: Implementation"]
    C --> D["🧪 Step 4: Testing"]
    D --> E["🚀 Step 5: Deployment"]
    E --> F["🔧 Step 6: Maintenance"]

    A -.->|"❌ NO going back"| F

    G["📝 Documents flow DOWN"] --> A
    
    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style D fill:#16213e,stroke:#ff4444,stroke-width:2px
    style E fill:#16213e,stroke:#00ff88,stroke-width:2px`,
        forge: `### Waterfall in Real Life — Building a Student Portal

Imagine your university asks you to build a Student Portal. Here's how Waterfall works:

\\\`\\\`\\\`
📋 PHASE 1: REQUIREMENTS (Week 1-2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client says: "I want students to:
  ✅ View grades
  ✅ Register for courses  
  ✅ Pay tuition online"
  
→ You write a 50-page document. Client signs it.
→ LOCKED. No changes allowed.

🏗️ PHASE 2: DESIGN (Week 3-4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Database: students, courses, grades, payments tables
→ Architecture: 3-tier (Frontend → API → Database)
→ UI Mockups: Login page, Dashboard, Course list

💻 PHASE 3: IMPLEMENTATION (Week 5-10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Frontend team builds UI
→ Backend team builds API
→ Database team creates schema
→ NO testing yet, just coding!

🧪 PHASE 4: TESTING (Week 11-12)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Testers find 47 bugs 😱
→ "The payment page doesn't work on mobile"
→ "Client now wants a chat feature" → DENIED (requirements frozen!)

🚀 PHASE 5: DEPLOYMENT (Week 13)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ System goes live
→ Client sees it for the FIRST TIME
→ "Wait... this isn't what I wanted!" 😰

⚠️ THE WATERFALL PROBLEM:
The client waited 13 weeks to see anything.
By then, it's too expensive to change.
\\\`\\\`\\\`

**Advantages:** Simple, well-documented, easy to manage milestones
**Disadvantages:** No flexibility, late testing, client sees product too late
`
    },
    {
        title: "V-Model — Step by Step",
        importance: "Critical",
        principles: [
            "What is V-Model? It's Waterfall BUT with a twist: every development phase has a MATCHING test phase planned from the start.",
            "The 'V' Shape: Left side goes DOWN (development), right side goes UP (testing). The bottom is coding.",
            "Left Side Step 1 — Requirements Analysis: Define what the system must do → Right Side Match: Acceptance Testing",
            "Left Side Step 2 — System Design: Architecture decisions → Right Side Match: System Testing",
            "Left Side Step 3 — Module Design: Detailed component design → Right Side Match: Integration Testing",
            "Left Side Step 4 — Coding: Write the actual code → Right Side Match: Unit Testing",
            "Key Insight: You write test plans DURING design, not after coding. When you define a requirement, you immediately write how to TEST that requirement.",
            "Verification (left side): 'Are we building the product RIGHT?' — checking documents and designs",
            "Validation (right side): 'Are we building the RIGHT product?' — testing the actual software",
            "When to Use: Safety-critical systems where testing must be rigorous — medical devices, aviation, automotive software"
        ],
        blueprint: `graph TD
    A["📋 Requirements Analysis"] --> B["🏗️ System Design"]
    B --> C["📦 Module Design"]
    C --> D["💻 Coding"]
    D --> E["🔬 Unit Testing"]
    E --> F["🔗 Integration Testing"]
    F --> G["🖥️ System Testing"]
    G --> H["✅ Acceptance Testing"]

    A -.->|"Test Plan Created"| H
    B -.->|"Test Plan Created"| G
    C -.->|"Test Plan Created"| F
    D -.->|"Test Plan Created"| E

    subgraph "Verification (Are we building it RIGHT?)"
        A
        B
        C
    end

    subgraph "Validation (Are we building the RIGHT product?)"
        F
        G
        H
    end

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:2px
    style H fill:#1a1a2e,stroke:#00ff88,stroke-width:2px
    style D fill:#16213e,stroke:#ff6600,stroke-width:3px`,
        forge: `### V-Model in Real Life — Medical Records System

\\\`\\\`\\\`
THE V-SHAPE EXPLAINED:

Requirements ─────────────────────── Acceptance Test
    \\                                    /
     System Design ──────────── System Test
         \\                          /
          Module Design ──── Integration Test
              \\                  /
               \\── Coding ──/
                    (Bottom of V)

REAL EXAMPLE: Hospital System

📋 Requirements: "Doctors must access patient records within 3 seconds"
   → Acceptance Test Plan: "Load test with 500 doctors accessing records simultaneously"

🏗️ System Design: "Microservices: Auth Service + Records Service + Search Service"
   → System Test Plan: "Test all services working together end-to-end"

📦 Module Design: "Search Service uses Elasticsearch for fast queries"
   → Integration Test Plan: "Test Search Service talks to Database correctly"

💻 Coding: "Write the SearchService.findPatient() function"
   → Unit Test Plan: "Test findPatient() with valid/invalid patient IDs"

WHY THIS IS BETTER THAN WATERFALL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Tests are planned BEFORE code is written
✅ Each design decision has a matching test
✅ Defects caught earlier = cheaper to fix
❌ Still no flexibility — requirements locked early
❌ Still sequential — no working software until late
\\\`\\\`\\\`

**Best for:** Life-critical systems (planes, hospitals, cars)
**Avoid when:** Requirements are unclear or likely to change
`
    },
    {
        title: "Incremental Model — Step by Step",
        importance: "Critical",
        principles: [
            "What is Incremental? Instead of building the ENTIRE system at once, you build it in PIECES (increments). Each piece is a working mini-version.",
            "Think of it like building a car: Increment 1 = Engine + Wheels (it drives!). Increment 2 = Add AC. Increment 3 = Add GPS. Each increment = usable product.",
            "Step 1: Take the full requirements and split them into groups (increments). Prioritize by importance.",
            "Step 2: Build Increment 1 — the most critical features first. Design → Code → Test → Deliver.",
            "Step 3: Get client feedback on Increment 1. Fix issues. Then build Increment 2 on top of it.",
            "Step 4: Repeat until all increments are delivered. Each delivery = working, tested software.",
            "Key Difference from Waterfall: Client sees working software after EACH increment, not only at the end.",
            "Key Difference from Agile: Increments are PLANNED upfront with fixed scope. Agile allows changing scope each sprint.",
            "Risk Management: If the project is cancelled halfway, you still have working software from completed increments.",
            "When to Use: Large projects where core features are clear, but you want early delivery of key functionality."
        ],
        blueprint: `graph TD
    A["📋 Full Requirements"] --> B["✂️ Split into Increments"]
    
    B --> C["Increment 1: Core Features"]
    B --> D["Increment 2: Secondary Features"]
    B --> E["Increment 3: Nice-to-have"]

    C --> C1["Design"] --> C2["Code"] --> C3["Test"] --> C4["✅ Deliver v1.0"]
    D --> D1["Design"] --> D2["Code"] --> D3["Test"] --> D4["✅ Deliver v2.0"]
    E --> E1["Design"] --> E2["Code"] --> E3["Test"] --> E4["✅ Deliver v3.0"]

    C4 -.->|"Client Feedback"| D
    D4 -.->|"Client Feedback"| E

    style C fill:#1a1a2e,stroke:#ffd700,stroke-width:2px
    style C4 fill:#0d3320,stroke:#00ff88,stroke-width:2px
    style D4 fill:#0d3320,stroke:#00ff88,stroke-width:2px
    style E4 fill:#0d3320,stroke:#00ff88,stroke-width:2px`,
        forge: `### Incremental Model — E-Commerce Platform Example

\\\`\\\`\\\`
FULL REQUIREMENTS: Build an online store
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Instead of building everything for 6 months...
We split into 3 increments:

═══════════════════════════════════════════
INCREMENT 1 (Month 1-2): Core Shopping
═══════════════════════════════════════════
Features: Product catalog + Shopping cart + Checkout
→ Design → Code → Test → DELIVER ✅
→ Client can START SELLING immediately!

═══════════════════════════════════════════
INCREMENT 2 (Month 3-4): User Experience
═══════════════════════════════════════════
Features: User accounts + Order history + Reviews
→ Built ON TOP of Increment 1
→ Design → Code → Test → DELIVER ✅
→ Client feedback: "Add wishlist!" → Noted for Inc. 3

═══════════════════════════════════════════
INCREMENT 3 (Month 5-6): Advanced Features
═══════════════════════════════════════════
Features: Wishlist + Recommendations + Analytics
→ Built ON TOP of Increment 2
→ Design → Code → Test → DELIVER ✅
→ Final complete product!

COMPARISON:
━━━━━━━━━━
Waterfall:  Client waits 6 months → sees everything → "Not what I wanted!"
Incremental: Client sees results every 2 months → gives feedback → course correct!

⚠️ If project cancelled at Month 4:
  Waterfall = NOTHING delivered
  Incremental = Working store with accounts! ✅
\\\`\\\`\\\`
`
    },
    {
        title: "Spiral Model — Step by Step",
        importance: "Critical",
        principles: [
            "What is Spiral? It's a RISK-DRIVEN model. Before doing anything, you ask: 'What could go wrong?' Then you build prototypes to REDUCE risk.",
            "Imagine a spiral — you go around and around. Each loop has 4 steps. Each loop = one cycle of the project.",
            "Quadrant 1 — Planning: Define objectives, alternatives, and constraints for this cycle.",
            "Quadrant 2 — Risk Analysis: Identify the BIGGEST risks. Build prototypes to test risky assumptions. This is the key differentiator!",
            "Quadrant 3 — Engineering: Develop and test the product (or prototype) for this cycle.",
            "Quadrant 4 — Evaluation: Show to the client. Get feedback. Plan the next spiral loop.",
            "Each loop gets bigger (more effort, more detailed). Loop 1 might be a paper prototype. Loop 4 might be the real system.",
            "Cost increases with each loop — if risks are too high, you can STOP early and save money.",
            "When to Use: Large, expensive, high-risk projects where failure is very costly. Examples: space shuttle software, military systems.",
            "Weakness: Requires expert risk analysts. Expensive process. Overkill for small projects."
        ],
        blueprint: `graph TD
    A["🔄 SPIRAL LOOP 1"] --> A1["📋 1. Planning: Define objectives"]
    A1 --> A2["⚠️ 2. Risk Analysis: What could fail?"]
    A2 --> A3["🔨 3. Engineering: Build prototype"]
    A3 --> A4["👀 4. Evaluation: Client review"]
    A4 --> B

    B["🔄 SPIRAL LOOP 2 (Bigger)"] --> B1["📋 1. Refined objectives"]
    B1 --> B2["⚠️ 2. New risks identified"]
    B2 --> B3["🔨 3. Build working demo"]
    B3 --> B4["👀 4. Client feedback"]
    B4 --> C

    C["🔄 SPIRAL LOOP 3 (Even Bigger)"] --> C1["📋 1. Final requirements"]
    C1 --> C2["⚠️ 2. Remaining risks solved"]
    C2 --> C3["🔨 3. Build final system"]
    C3 --> C4["✅ 4. Deliver!"]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:2px
    style A2 fill:#2d1117,stroke:#ff4444,stroke-width:2px
    style B2 fill:#2d1117,stroke:#ff4444,stroke-width:2px
    style C4 fill:#0d3320,stroke:#00ff88,stroke-width:2px`,
        forge: `### Spiral Model — Self-Driving Car Software

\\\`\\\`\\\`
PROJECT: Self-Driving Car Navigation System
(Very risky! Lives at stake! Perfect for Spiral Model)

🔄 LOOP 1: Concept (2 months)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Plan: "Can a car detect obstacles?"
⚠️ Risk: "What if sensors fail in rain?"
🔨 Build: Paper prototype + sensor simulation
👀 Review: "Sensors work in clear weather, fail in heavy rain"
→ Decision: CONTINUE (risk manageable)

🔄 LOOP 2: Prototype (4 months)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Plan: "Add lane detection + rain handling"
⚠️ Risk: "What if AI misidentifies a pedestrian?"
🔨 Build: Working prototype on test track
👀 Review: "95% accuracy, 5% false positives"
→ Decision: CONTINUE (need to improve accuracy)

🔄 LOOP 3: Beta (6 months)
━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Plan: "Real-world city driving"
⚠️ Risk: "Legal liability for accidents?"
🔨 Build: Full system with safety driver
👀 Review: "99.9% accuracy, legal team approves"
→ Decision: SHIP IT ✅

WHY SPIRAL HERE?
━━━━━━━━━━━━━━━
✅ Each loop REDUCES risk before spending more money
✅ If Loop 1 showed sensors can't work → STOP early, save millions
✅ Client sees progress every loop
❌ Very expensive process (risk analysts, prototypes)
❌ Overkill for a simple website
\\\`\\\`\\\`
`
    },
    {
        title: "Agile & Scrum Framework — Step by Step",
        importance: "Critical",
        principles: [
            "What is Agile? A PHILOSOPHY, not a method. Core idea: 'Stop planning for 6 months. Build something small, show it to the client, adapt.'",
            "The 4 Agile Values: (1) People > Processes, (2) Working software > Documentation, (3) Customer collaboration > Contract negotiation, (4) Responding to change > Following a plan",
            "Scrum = The most popular Agile FRAMEWORK. It implements Agile using Sprints (2-4 week cycles).",
            "Scrum Role 1 — Product Owner (PO): The client's voice. Decides WHAT to build. Manages the Product Backlog (prioritized feature list).",
            "Scrum Role 2 — Scrum Master (SM): The team's coach. Removes obstacles. NOT a manager — a servant-leader.",
            "Scrum Role 3 — Development Team: 3-9 people who actually build the software. Self-organizing — they decide HOW to work.",
            "Sprint Cycle: Sprint Planning → Daily Scrum (15 min standup) → Sprint Review (demo) → Sprint Retrospective (improve process)",
            "Product Backlog: ALL features the product will ever need, ranked by priority. PO owns this list.",
            "Sprint Backlog: Features selected for THIS sprint. Team commits to completing them in 2-4 weeks.",
            "Definition of Done: A checklist (coded + tested + reviewed + documented) that says when a feature is TRULY finished."
        ],
        blueprint: `graph TD
    A["📋 Product Backlog"] -->|"PO picks top items"| B["🎯 Sprint Planning"]
    B -->|"Team commits"| C["📝 Sprint Backlog"]
    C --> D["🔄 Sprint (2-4 weeks)"]
    
    D --> D1["Day 1: Daily Scrum 15min"]
    D1 --> D2["Day 2: Daily Scrum 15min"]
    D2 --> D3["... Day N: Daily Scrum 15min"]
    D3 --> E["📦 Working Software"]
    
    E --> F["👀 Sprint Review (Demo to client)"]
    F --> G["🔍 Sprint Retrospective"]
    G -->|"Improve process"| H["Next Sprint"]
    H --> B

    F -.->|"Feedback"| A

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style D fill:#16213e,stroke:#00d4ff,stroke-width:2px
    style E fill:#0d3320,stroke:#00ff88,stroke-width:2px`,
        forge: `### Scrum in Real Life — Building a Food Delivery App

\\\`\\\`\\\`
PRODUCT BACKLOG (All features, prioritized by PO):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 User can browse restaurants        (HIGH)
2. 🔴 User can add items to cart          (HIGH)
3. 🔴 User can place an order             (HIGH)
4. 🟡 User can track delivery in real-time (MEDIUM)
5. 🟡 User can rate restaurants            (MEDIUM)
6. 🟢 User can save favorite restaurants   (LOW)
7. 🟢 Restaurant can view analytics        (LOW)

═══════════════════════════════════════
SPRINT 1 (2 weeks): Core Ordering
═══════════════════════════════════════

📅 Sprint Planning (Monday morning):
    PO: "Let's do items 1, 2, 3 this sprint"
    Team: "We can commit to 1 and 2, item 3 is too big"
    PO: "OK, 1 and 2 it is"

📅 Daily Scrum (Every day, 15 minutes, standing up):
    Dev 1: "Yesterday: built restaurant list API"
           "Today: building the UI for restaurant cards"
           "Blockers: None"
    Dev 2: "Yesterday: designed cart database schema"
           "Today: building add-to-cart function"
           "Blockers: Need design for cart page"

📅 Sprint Review (Day 14):
    Team demos to PO: "Here's the working app —
    you can browse restaurants and add to cart!"
    PO: "Love it! But can you make the cards bigger?"
    → Feedback goes to Product Backlog

📅 Sprint Retrospective (Day 14, after review):
    What went well? "Good teamwork on API"
    What didn't? "We underestimated the UI work"
    Action: "Add UI estimation buffer next sprint"

→ Move to Sprint 2: Place orders + PO's UI feedback
\\\`\\\`\\\`
`
    },
    {
        title: "Kanban Method — Step by Step",
        importance: "Critical",
        principles: [
            "What is Kanban? A VISUAL system for managing work. Instead of sprints, work flows CONTINUOUSLY through stages on a board.",
            "The Kanban Board: Columns represent stages. Cards move LEFT to RIGHT. Simplest: To Do → In Progress → Done.",
            "WIP Limits (Work In Progress): The KEY rule! Limit how many items can be 'In Progress' at once. Example: max 3 items in 'In Progress'.",
            "Why WIP Limits? If a developer works on 10 things at once, NOTHING gets finished. Limiting WIP forces FINISHING before starting new work.",
            "Pull System: Developers PULL work when they're ready, not pushed by managers. Finish current task → pull next from 'To Do'.",
            "No Sprints: Unlike Scrum, there are no fixed time boxes. Work flows continuously. Deliver as soon as items reach 'Done'.",
            "Metrics: Lead Time (how long from request to done), Cycle Time (how long from start to done), Throughput (items done per week).",
            "When to Use: Support teams, bug fixing, operations, any work with unpredictable incoming requests.",
            "Kanban vs. Scrum: Scrum = fixed sprints + roles + ceremonies. Kanban = continuous flow + only WIP limits. Kanban is simpler.",
            "Continuous Improvement: Regularly review the board, identify bottlenecks (columns where cards pile up), and fix the process."
        ],
        blueprint: `graph LR
    subgraph "📋 TO DO"
        A1["Feature X"]
        A2["Bug Fix Y"]
        A3["Feature Z"]
    end

    subgraph "🔨 IN PROGRESS (WIP: 2)"
        B1["Feature A"]
        B2["Feature B"]
    end

    subgraph "👀 REVIEW (WIP: 2)"
        C1["Feature C"]
    end

    subgraph "✅ DONE"
        D1["Feature D"]
        D2["Feature E"]
    end

    A1 -.->|"Pull when ready"| B1
    B1 -.->|"Code complete"| C1
    C1 -.->|"Approved"| D1

    style B1 fill:#16213e,stroke:#00d4ff,stroke-width:2px
    style B2 fill:#16213e,stroke:#00d4ff,stroke-width:2px
    style D1 fill:#0d3320,stroke:#00ff88,stroke-width:2px
    style D2 fill:#0d3320,stroke:#00ff88,stroke-width:2px`,
        forge: `### Kanban in Real Life — IT Support Team

\\\`\\\`\\\`
SCENARIO: 5-person IT support team at a company.
Tickets come in randomly — can't plan sprints!

THE KANBAN BOARD:
━━━━━━━━━━━━━━━━
┌──────────┬──────────────┬───────────┬──────────┐
│ BACKLOG  │ IN PROGRESS  │  REVIEW   │  DONE    │
│          │  (WIP: 3)    │ (WIP: 2)  │          │
├──────────┼──────────────┼───────────┼──────────┤
│ Email    │ ■ Printer    │ ■ VPN     │ ✅ WiFi  │
│ server   │   issue      │   setup   │   fixed  │
│ down     │              │           │          │
│          │ ■ New laptop │           │ ✅ Pass- │
│ Install  │   setup      │           │   word   │
│ software │              │           │   reset  │
│          │ ■ Network    │           │          │
│ Monitor  │   cable      │           │          │
│ replace  │              │           │          │
└──────────┴──────────────┴───────────┴──────────┘

RULES:
1. ⛔ IN PROGRESS has WIP limit = 3
   → Alex finishes "Network cable"
   → He PULLS "Email server down" from Backlog
   → He does NOT start a 4th task!

2. 🚨 BOTTLENECK DETECTION:
   If "REVIEW" column always has 2 items stuck...
   → The reviewer is the bottleneck
   → Solution: Add another reviewer!

WHY KANBAN FOR THIS TEAM?
━━━━━━━━━━━━━━━━━━━━━━━━
✅ No sprint planning needed (tickets arrive randomly)
✅ Visual — everyone sees what's happening
✅ WIP limits prevent overload
✅ Finish one thing before starting another
❌ No fixed deadlines (hard to promise delivery dates)
\\\`\\\`\\\`
`
    },
    {
        title: "Extreme Programming (XP) — Step by Step",
        importance: "Critical",
        principles: [
            "What is XP? An Agile methodology that takes engineering practices to the EXTREME. Heavy focus on code quality and developer discipline.",
            "XP Practice 1 — Pair Programming: TWO developers, ONE computer. One types (driver), one reviews (navigator). Switch every 30 minutes.",
            "XP Practice 2 — Test-Driven Development (TDD): Write the TEST first (it fails), then write code to make it pass, then refactor. Red → Green → Refactor.",
            "XP Practice 3 — Continuous Integration: Merge code into main branch MULTIPLE times per day. Automated tests run on every merge.",
            "XP Practice 4 — Simple Design: Build the SIMPLEST thing that works. Don't add features 'just in case'. YAGNI = You Aren't Gonna Need It.",
            "XP Practice 5 — Refactoring: Continuously improve code structure WITHOUT changing behavior. Clean up after each feature.",
            "XP Practice 6 — Collective Ownership: ANY developer can modify ANY part of the code. No 'my code' — it's 'our code'.",
            "XP Practice 7 — Planning Game: Client writes User Stories on index cards. Team estimates effort. Client prioritizes. Short iterations (1-2 weeks).",
            "XP Practice 8 — On-site Customer: A real client sits WITH the team to answer questions immediately. No waiting for email replies.",
            "When to Use: Small teams (2-12), rapidly changing requirements, projects where code quality is critical."
        ],
        blueprint: `graph TD
    A["📝 User Stories (Client writes)"] --> B["🎯 Planning Game"]
    B --> C["🔄 Iteration (1-2 weeks)"]
    
    C --> D["👥 Pair Programming"]
    D --> E["🔴 Write Failing Test (TDD)"]
    E --> F["🟢 Write Code to Pass"]
    F --> G["🔵 Refactor"]
    G --> H["🔄 Continuous Integration"]
    H --> I["✅ Working Feature"]
    
    I --> J["👀 Client Review"]
    J -->|"Next iteration"| B

    subgraph "XP Core Practices"
        D
        E
        F
        G
        H
    end

    style E fill:#2d1117,stroke:#ff4444,stroke-width:2px
    style F fill:#0d3320,stroke:#00ff88,stroke-width:2px
    style G fill:#1a1a3e,stroke:#4488ff,stroke-width:2px`,
        forge: `### TDD: Red-Green-Refactor Example

\\\`\\\`\\\`python
# XP's Test-Driven Development in Action
# Building a simple Calculator

# ═══════════════════════════════
# STEP 1: 🔴 RED — Write a failing test
# ═══════════════════════════════
def test_add():
    calc = Calculator()
    assert calc.add(2, 3) == 5  # This FAILS — Calculator doesn't exist yet!

# Run test → ❌ FAIL (NameError: Calculator not defined)

# ═══════════════════════════════
# STEP 2: 🟢 GREEN — Write MINIMUM code to pass
# ═══════════════════════════════
class Calculator:
    def add(self, a, b):
        return a + b

# Run test → ✅ PASS!

# ═══════════════════════════════
# STEP 3: 🔴 RED — New test for edge case
# ═══════════════════════════════
def test_add_negative():
    calc = Calculator()
    assert calc.add(-1, -1) == -2  # Does it handle negatives?

# Run test → ✅ PASS (already works!)

# ═══════════════════════════════
# STEP 4: 🔵 REFACTOR — Clean up
# ═══════════════════════════════
class Calculator:
    """A battle-tested calculator."""
    
    def add(self, *numbers):  # Refactored to handle any number of arguments
        return sum(numbers)

# Run ALL tests → ✅ ALL PASS!

# THE CYCLE: 🔴 Red → 🟢 Green → 🔵 Refactor → 🔴 Red → ...
\\\`\\\`\\\`

**Pair Programming Visual:**
\\\`\\\`\\\`
┌─────────────────────────────────┐
│    🖥️ ONE Computer, TWO Devs    │
├────────────────┬────────────────┤
│   👨‍💻 DRIVER    │  👩‍💻 NAVIGATOR  │
│   Types code   │  Reviews code  │
│   Thinks about │  Thinks about  │
│   the current  │  the big       │
│   line         │  picture       │
├────────────────┴────────────────┤
│   ⏱️ Switch roles every 30 min  │
└─────────────────────────────────┘
\\\`\\\`\\\`
`
    },
    {
        title: "Choosing the Right Methodology — Comparison Guide",
        importance: "Critical",
        principles: [
            "There is NO best methodology. The right choice depends on YOUR project's specific context.",
            "Factor 1 — Requirements Clarity: Clear & stable → Waterfall/V-Model. Unclear & changing → Scrum/XP. Unknown risks → Spiral.",
            "Factor 2 — Team Size: Small (2-9) → Scrum/XP/Kanban. Medium (10-50) → Incremental/SAFe. Large (50+) → Waterfall/SAFe.",
            "Factor 3 — Customer Availability: Always available → XP (on-site customer). Sometimes → Scrum (sprint reviews). Rarely → Waterfall.",
            "Factor 4 — Project Risk: Low risk → Waterfall is fine. High risk → Spiral (risk analysis each loop). Medium → Incremental.",
            "Factor 5 — Domain: Safety-critical (medical, aviation) → V-Model. Startup/web → Scrum/Kanban. Research/new tech → Spiral.",
            "Factor 6 — Time to Market: Need fast first release → Scrum/Kanban/Incremental. Can wait → Waterfall.",
            "Hybrid Approaches: Real-world projects often MIX methodologies. Example: Waterfall for planning + Scrum for development.",
            "Common Mistake: Choosing a methodology because it's 'popular' rather than because it fits the project.",
            "Ethical Dimension: Choosing a methodology you KNOW will fail (to please a client) is professionally irresponsible."
        ],
        blueprint: `graph TD
    A["🤔 Which Methodology?"] --> B{Requirements Clear?}
    
    B -->|"Yes, stable"| C{Safety Critical?}
    B -->|"No, changing"| D{Team Size?}
    B -->|"Unknown risks"| E["🌀 Spiral"]

    C -->|"Yes"| F["✔️ V-Model"]
    C -->|"No"| G{Need early delivery?}
    
    G -->|"Yes"| H["📦 Incremental"]
    G -->|"No"| I["💧 Waterfall"]

    D -->|"Small < 10"| J{Customer available?}
    D -->|"Large > 10"| K["📊 SAFe / Hybrid"]

    J -->|"Always"| L["⚡ XP"]
    J -->|"Sometimes"| M["🏃 Scrum"]
    J -->|"Unpredictable work"| N["📌 Kanban"]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style B fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Quick Comparison Table

\\\`\\\`\\\`
┌─────────────┬────────────┬──────────┬────────────┬───────────────┐
│ Methodology │ Flexibility│ Testing  │ Client Sees│ Best For      │
├─────────────┼────────────┼──────────┼────────────┼───────────────┤
│ Waterfall   │ ❌ None    │ End only │ End only   │ Fixed scope   │
│ V-Model     │ ❌ None    │ Planned  │ End only   │ Safety-crit.  │
│ Incremental │ 🟡 Some   │ Per incr.│ Per incr.  │ Large, clear  │
│ Spiral      │ 🟡 Some   │ Per loop │ Per loop   │ High-risk     │
│ Scrum       │ ✅ High   │ Per sprint│ Every 2wk │ Most projects │
│ Kanban      │ ✅ High   │ Contin.  │ Contin.    │ Support/ops   │
│ XP          │ ✅ High   │ TDD!     │ Every 1-2wk│ Quality-first │
└─────────────┴────────────┴──────────┴────────────┴───────────────┘

DECISION SCENARIOS:
━━━━━━━━━━━━━━━━━━
🏥 Hospital System: V-Model
   → Lives at stake, need rigorous testing plan

🚀 Startup App: Scrum
   → Requirements will change, need fast feedback

🆘 IT Support: Kanban
   → Tickets come randomly, can't plan sprints

🛰️ NASA Software: Spiral
   → Extremely high risk, need prototypes first

🏦 Banking Migration: Waterfall
   → Requirements are 100% defined by regulation

👨‍💻 Small Dev Team: XP
   → 4 developers, quality is everything
\\\`\\\`\\\`
`,
        dilemma: {
            scenario: "Your client demands a fixed-price Waterfall contract for a complex app with vague requirements. They insist because 'it has clear milestones.' You know this will likely fail. What do you do?",
            options: [
                {
                    label: "Accept Waterfall (Client knows best)",
                    alignment: "Client Deference",
                    feedback: "You chose **Client Deference**. While respecting client wishes matters, as a professional you have an ethical obligation to advise against approaches likely to fail. Accepting a doomed process doesn't serve the client's true interests."
                },
                {
                    label: "Propose Scrum with milestone checkpoints",
                    alignment: "Professional Advisory",
                    feedback: "You chose **Professional Advisory**. By proposing Scrum with sprint reviews as milestones, you balance the client's need for predictability with the reality of evolving requirements. This is ethical professional responsibility."
                },
                {
                    label: "Refuse the project",
                    alignment: "Risk Aversion",
                    feedback: "You chose **Risk Aversion**. Walking away protects your integrity. However, you could first explore hybrid approaches that address both concerns before refusing outright."
                }
            ]
        }
    }
];

async function seed() {
    try {
        console.log("🚀 Seeding CS 321: Software Methodologies...");
        const courseRes = await pool.query("SELECT id FROM courses WHERE name LIKE '%CS 321%' LIMIT 1");
        let courseId;
        if (courseRes.rows.length === 0) {
            const titleRes = await pool.query("SELECT id FROM courses WHERE name ILIKE '%software engineering%' LIMIT 1");
            if (titleRes.rows.length === 0) throw new Error("Course CS 321 not found. Run seed_curriculum.js first.");
            courseId = titleRes.rows[0].id;
        } else {
            courseId = courseRes.rows[0].id;
        }
        console.log(`Found Course ID: ${courseId}`);

        // Delete ONLY methodology-related topics (not all topics)
        for (const topic of methodologies) {
            await pool.query("DELETE FROM topics WHERE course_id = $1 AND title = $2", [courseId, topic.title]);
        }
        // Also delete the old combined methodology topics
        await pool.query("DELETE FROM topics WHERE course_id = $1 AND title LIKE '%Methodologies%'", [courseId]);
        await pool.query("DELETE FROM topics WHERE course_id = $1 AND title LIKE '%Evaluating & Selecting%'", [courseId]);
        console.log("Cleared old methodology topics.");

        for (const topic of methodologies) {
            const first_principles = JSON.stringify(topic.principles);
            const dilemma = topic.dilemma ? JSON.stringify(topic.dilemma) : null;
            await pool.query(
                "INSERT INTO topics (title, course_id, importance_level, first_principles, architectural_logic, forge_protocol, ethical_dilemma) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [topic.title, courseId, topic.importance, first_principles, topic.blueprint, topic.forge, dilemma]
            );
            console.log(`✅ Synced: ${topic.title}`);
        }
        console.log(`\n🎓 Methodologies Seeding Complete — ${methodologies.length} topics inserted.`);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
    } finally {
        await pool.end();
    }
}
seed();
