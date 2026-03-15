import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });
import pool from "../config/db.js";

const diagrams = [
    {
        title: "Use Case Diagrams — Step by Step with Examples",
        importance: "Advanced",
        principles: [
            "What is a Use Case Diagram? A PICTURE showing WHO uses the system and WHAT they can do with it. That's it. No code, no database — just 'who does what'.",
            "Element 1 — Actor (stick figure): Someone or something OUTSIDE the system that interacts with it. Can be a person (Student, Admin) or another system (Payment Gateway).",
            "Element 2 — Use Case (oval): ONE thing the system does for the actor. Always starts with a VERB. Examples: 'Register for Course', 'View Grades', 'Pay Tuition'.",
            "Element 3 — System Boundary (rectangle): A box around ALL your use cases. Everything INSIDE the box = your system. Actors are OUTSIDE.",
            "Element 4 — Association (line): A simple line connecting an Actor to a Use Case means 'this actor uses this feature'.",
            "Relationship — <<include>>: Use Case A ALWAYS needs Use Case B. Example: 'Place Order' ALWAYS includes 'Verify Payment'. Draw with dashed arrow + <<include>>.",
            "Relationship — <<extend>>: Use Case B SOMETIMES adds to Use Case A. Example: 'Search Product' is OPTIONALLY extended by 'Apply Filters'. Draw with dashed arrow + <<extend>>.",
            "Relationship — Generalization (inheritance arrow): A specialized actor inherits all use cases from a general actor. Example: 'Admin' inherits from 'User' (admin can do everything user can + more).",
            "Common Mistake #1: Writing implementation details in use cases. WRONG: 'Query SQL database'. RIGHT: 'View Student Records'.",
            "How to Build Step by Step: (1) List all actors (2) List what each actor does (3) Draw system boundary (4) Connect actors to use cases (5) Add include/extend if needed."
        ],
        blueprint: `graph TD
    subgraph "🖥️ University Registration System"
        UC1["📌 Register for Course"]
        UC2["📌 View Schedule"]
        UC3["📌 Pay Tuition"]
        UC4["📌 Verify Payment"]
        UC5["📌 Generate Receipt"]
        UC6["📌 Manage Courses"]
        UC7["📌 View Reports"]
    end

    S["🧑‍🎓 Student"] --> UC1
    S --> UC2
    S --> UC3

    UC3 -->|"<<include>>"| UC4
    UC3 -.->|"<<extend>>"| UC5

    A["👨‍💼 Admin"] --> UC6
    A --> UC7
    A --> UC1

    PG["💳 Payment Gateway"] --> UC4

    style UC1 fill:#1a1a2e,stroke:#ffd700,stroke-width:2px
    style UC3 fill:#1a1a2e,stroke:#ffd700,stroke-width:2px
    style UC4 fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Building a Use Case Diagram — Step by Step

\\\`\\\`\\\`
SCENARIO: You're building a Library Management System.

═══════════════════════════════════════════════════
STEP 1: Identify the ACTORS (who uses the system?)
═══════════════════════════════════════════════════
Ask: "Who will interact with this system?"

  🧑‍🎓 Member      → borrows and returns books
  👨‍💼 Librarian    → manages books and members
  💻 Catalog System → external system for book data

═══════════════════════════════════════════════════
STEP 2: List the USE CASES (what can they do?)
═══════════════════════════════════════════════════
Ask for EACH actor: "What do they DO with the system?"

  Member:      Search Book, Borrow Book, Return Book, Pay Fine
  Librarian:   Add Book, Remove Book, Register Member, View Reports
  Catalog:     Sync Book Data

═══════════════════════════════════════════════════
STEP 3: Draw the SYSTEM BOUNDARY
═══════════════════════════════════════════════════
  ┌─────────────────────────────────────────┐
  │        Library Management System        │
  │                                         │
  │  (Search Book)  (Borrow Book)           │
  │                                         │
  │  (Return Book)  (Pay Fine)              │
  │                                         │
  │  (Add Book)  (Remove Book)              │
  │                                         │
  │  (Register Member)  (View Reports)      │
  │                                         │
  │  (Sync Book Data)                       │
  └─────────────────────────────────────────┘

═══════════════════════════════════════════════════
STEP 4: Connect ACTORS to USE CASES with lines
═══════════════════════════════════════════════════
  🧑‍🎓 Member ─── Search Book
  🧑‍🎓 Member ─── Borrow Book
  🧑‍🎓 Member ─── Return Book
  🧑‍🎓 Member ─── Pay Fine
  
  👨‍💼 Librarian ─── Add Book
  👨‍💼 Librarian ─── Register Member
  👨‍💼 Librarian ─── View Reports

  💻 Catalog ─── Sync Book Data

═══════════════════════════════════════════════════
STEP 5: Add <<include>> and <<extend>>
═══════════════════════════════════════════════════
  Borrow Book ──<<include>>──→ Check Availability
  (You ALWAYS check if book is available before borrowing)

  Return Book ──<<extend>>──→ Pay Fine
  (You ONLY pay fine IF the book is late)

  📌 include = ALWAYS happens
  📌 extend  = SOMETIMES happens (has a condition)

═══════════════════════════════════════════════════
COMMON MISTAKES TO AVOID:
═══════════════════════════════════════════════════
  ❌ "Click login button"  → Too detailed (UI level)
  ✅ "Authenticate User"   → Right level of abstraction

  ❌ Making the database an actor → Database is INSIDE the system
  ✅ External payment API as actor → It's OUTSIDE the system

  ❌ "User" as a use case → Use cases are ACTIONS (verbs!)
  ✅ "Register User" → Correct (verb + noun)
\\\`\\\`\\\`
`
    },
    {
        title: "System Sequence Diagrams — Step by Step with Examples",
        importance: "Advanced",
        principles: [
            "What is a Sequence Diagram? A diagram showing the CONVERSATION between an Actor and the System over TIME. Think of it like a WhatsApp chat — messages go back and forth.",
            "Reading Direction: Time flows from TOP to BOTTOM. The first message is at the top, the last at the bottom.",
            "Element 1 — Lifeline: A vertical dashed line under each participant (Actor or System). Represents their existence over time.",
            "Element 2 — Message (solid arrow →): A request FROM the actor TO the system. Example: 'enterCredentials(email, password)'",
            "Element 3 — Return (dashed arrow ←): The system's RESPONSE back. Example: 'loginSuccess(dashboardData)'",
            "Element 4 — Activation Bar: The thin rectangle on the lifeline showing WHEN that participant is active/processing.",
            "How to Build from a Use Case: Take EACH STEP in the use case main flow and turn it into a message → response pair.",
            "Parameters in Messages: Write what data is SENT. Example: 'searchBook(title, author)' not just 'search'.",
            "Alt Fragment (optional path): Shows IF-ELSE logic. 'alt [password correct]' → success, 'else' → error message.",
            "Loop Fragment: Shows repetition. 'loop [for each item in cart]' → processItem()."
        ],
        blueprint: `sequenceDiagram
    actor S as 🧑‍🎓 Student
    participant SYS as 🖥️ System

    S->>SYS: enterCredentials(email, password)
    activate SYS
    SYS->>SYS: validateCredentials()
    
    alt Credentials Valid
        SYS-->>S: displayDashboard(courses, grades)
    else Credentials Invalid
        SYS-->>S: showError("Invalid email or password")
    end
    deactivate SYS

    S->>SYS: selectCourse(courseId)
    activate SYS
    SYS-->>S: displayCourseDetails(name, schedule, seats)
    deactivate SYS

    S->>SYS: registerForCourse(courseId)
    activate SYS
    SYS->>SYS: checkPrerequisites()
    SYS->>SYS: checkSeatAvailability()
    SYS-->>S: confirmRegistration(sectionNo, schedule)
    deactivate SYS`,
        forge: `### Building a Sequence Diagram — Step by Step

\\\`\\\`\\\`
SCENARIO: "Borrow Book" Use Case → Sequence Diagram

═══════════════════════════════════════════════════
STEP 1: Identify the PARTICIPANTS
═══════════════════════════════════════════════════
From the use case, who is involved?
  → Actor: Member (🧑‍🎓)
  → System: Library System (🖥️)

═══════════════════════════════════════════════════
STEP 2: Take the USE CASE main flow
═══════════════════════════════════════════════════
Use Case "Borrow Book" Main Flow:
  1. Member searches for a book by title
  2. System displays matching books
  3. Member selects a book
  4. System checks if book is available
  5. System records the loan
  6. System confirms the borrowing with due date

═══════════════════════════════════════════════════
STEP 3: Convert EACH step to a message
═══════════════════════════════════════════════════

  🧑‍🎓 Member                    🖥️ System
     │                              │
     │  searchBook(title)           │
     │─────────────────────────────→│
     │                              │ 
     │  displayResults(bookList)    │
     │←─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
     │                              │
     │  selectBook(bookId)          │
     │─────────────────────────────→│
     │                              │
     │         ┌──────────────┐     │
     │         │ checkAvail() │     │
     │         └──────────────┘     │
     │                              │
     │  confirmBorrow(dueDate)      │
     │←─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
     │                              │

═══════════════════════════════════════════════════
STEP 4: Add ALTERNATIVE flow (what if book is out?)
═══════════════════════════════════════════════════

     │  selectBook(bookId)          │
     │─────────────────────────────→│
     │                              │
     ├──── alt [book available] ────┤
     │                              │
     │  confirmBorrow(dueDate)      │
     │←─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
     │                              │
     ├──── else [not available] ────┤
     │                              │
     │  showError("Book checked out │
     │   until March 15")           │
     │←─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
     │                              │
     ├──────────── end ─────────────┤

KEY RULES:
━━━━━━━━━━
→ Solid arrow (───→) = Request (actor asks system)
← Dashed arrow (← ─ ─) = Response (system answers)
█ Activation bar = System is processing
alt/else = IF-THEN-ELSE branching
loop = Repeating actions
\\\`\\\`\\\`
`
    },
    {
        title: "Activity Diagrams — Step by Step with Examples",
        importance: "Advanced",
        principles: [
            "What is an Activity Diagram? A FLOWCHART on steroids. It shows the FLOW of activities (steps) in a process, including decisions, parallel work, and loops.",
            "When to Use: To model business processes, workflows, or complex use case flows — especially when the order of steps matters.",
            "Element — Initial Node (filled circle ●): Where the process STARTS. Every diagram has exactly ONE start.",
            "Element — Activity (rounded rectangle): ONE step in the process. Use a verb. Examples: 'Verify Payment', 'Send Email', 'Calculate Grade'.",
            "Element — Decision Diamond (◇): A YES/NO or IF-ELSE branch. ONE incoming arrow, TWO+ outgoing arrows with conditions. Example: [payment valid?] → Yes/No paths.",
            "Element — Fork Bar (thick horizontal bar): SPLITS flow into PARALLEL activities. Things happening AT THE SAME TIME. Example: After order confirmed → Send Email AND Update Stock simultaneously.",
            "Element — Join Bar: MERGES parallel flows back together. Both parallel activities must COMPLETE before continuing.",
            "Element — Final Node (bullseye ◎): Where the process ENDS. Can have more than one end point.",
            "Swimlanes: Divide the diagram into columns, each representing a different ACTOR or DEPARTMENT. Shows WHO does WHAT. Example: Student lane | System lane | Registrar lane.",
            "How to Build: (1) Identify start/end (2) List all steps (3) Add decisions (4) Add parallel flows (5) Optionally add swimlanes."
        ],
        blueprint: `graph TD
    START(("●")) --> A["Student submits registration"]
    A --> B{"Prereqs met?"}
    B -->|"Yes"| C["Check seat availability"]
    B -->|"No"| D["Show prereq error"]
    D --> END1(("◎"))
    C --> E{"Seats available?"}
    E -->|"No"| F["Add to waitlist"]
    F --> END2(("◎"))
    E -->|"Yes"| G["Register student"]
    G --> H["Fork: Parallel activities"]
    H --> I["Send confirmation email"]
    H --> J["Update seat count"]
    H --> K["Add to student schedule"]
    I --> L["Join: All complete"]
    J --> L
    K --> L
    L --> M["Display success message"]
    M --> END3(("◎"))

    style START fill:#ffd700,stroke:#ffd700
    style END1 fill:#ff4444,stroke:#ff4444
    style END2 fill:#ff8800,stroke:#ff8800
    style END3 fill:#00ff88,stroke:#00ff88
    style B fill:#16213e,stroke:#00d4ff,stroke-width:2px
    style E fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Building an Activity Diagram — Step by Step

\\\`\\\`\\\`
SCENARIO: Online Shopping Checkout Process

═══════════════════════════════════════════════════
STEP 1: Identify START and END
═══════════════════════════════════════════════════
  START: Customer clicks "Checkout"
  END:   Order confirmed OR Payment failed

═══════════════════════════════════════════════════
STEP 2: List ALL steps in order
═══════════════════════════════════════════════════
  1. Display cart summary
  2. Customer enters shipping address
  3. Customer selects payment method
  4. System validates payment
  5. System creates order
  6. Send confirmation email
  7. Update inventory

═══════════════════════════════════════════════════
STEP 3: Add DECISION points (diamonds)
═══════════════════════════════════════════════════

  ● Start
  │
  ▼
  ┌────────────────────┐
  │ Display Cart       │
  └────────────────────┘
  │
  ▼
  ┌────────────────────┐
  │ Enter Address      │
  └────────────────────┘
  │
  ▼
  ┌────────────────────┐
  │ Select Payment     │
  └────────────────────┘
  │
  ▼
  ◇ Payment Valid?
  │         │
  Yes       No
  │         │
  ▼         ▼
  Create   Show Error
  Order     Message
            │
            ◎ End (Failure)

═══════════════════════════════════════════════════
STEP 4: Add PARALLEL flows (fork/join)
═══════════════════════════════════════════════════
After "Create Order", TWO things happen AT THE SAME TIME:

         Create Order
              │
        ═══════════════  ← FORK BAR (parallel split)
        │             │
        ▼             ▼
  Send Email    Update Inventory
        │             │
        ═══════════════  ← JOIN BAR (wait for both)
              │
              ▼
      Display Confirmation
              │
              ◎ End (Success)

═══════════════════════════════════════════════════
STEP 5 (Optional): Add SWIMLANES
═══════════════════════════════════════════════════

  │    Customer    │     System      │   Warehouse   │
  │───────────────│────────────────│──────────────│
  │ Enter Address │                │              │
  │───────────────│                │              │
  │ Select Payment│                │              │
  │───────────────│────────────────│              │ 
  │               │ Validate Pmt   │              │
  │               │────────────────│              │
  │               │ Create Order   │              │
  │               │────────────────│──────────────│
  │               │ Send Email     │ Pack Order   │
  │               │────────────────│──────────────│
  │ View Confirm  │                │ Ship Order   │

Swimlanes show WHO is responsible for each step!
\\\`\\\`\\\`
`
    },
    {
        title: "Domain Class Diagrams — Step by Step with Examples",
        importance: "Advanced",
        principles: [
            "What is a Class Diagram? A blueprint showing the THINGS (classes) in your system, their PROPERTIES (attributes), their ACTIONS (methods), and how they RELATE to each other.",
            "Think of Classes Like Nouns: Student, Course, Professor, Grade — these are the KEY CONCEPTS in your problem domain.",
            "Element — Class Box: A rectangle with 3 sections. Top: Class Name. Middle: Attributes (data). Bottom: Methods (behavior).",
            "Attributes: The DATA each class holds. Format: visibility name: type. Example: - name: String, - gpa: Float. (-) = private, (+) = public.",
            "Methods: The ACTIONS each class can perform. Example: + enroll(course): void, + calculateGPA(): Float.",
            "Relationship — Association (solid line): Two classes are CONNECTED. Example: Student ─── Course (student enrolls in course). Add multiplicity: 1 Student ─── 0..* Course.",
            "Relationship — Aggregation (empty diamond ◇): 'Has-a' but can exist independently. Example: Department ◇─── Professor (professor exists without department).",
            "Relationship — Composition (filled diamond ◆): 'Has-a' but CANNOT exist alone. Example: Order ◆─── OrderItem (no order item without an order).",
            "Relationship — Generalization (hollow arrow △): 'Is-a' (inheritance). Example: Student △─── GradStudent (grad student IS A student with extra attributes).",
            "Multiplicity: Numbers showing HOW MANY. 1 = exactly one. 0..1 = zero or one. 1..* = one or more. 0..* = zero or more. Example: 1 Professor teaches 1..* Courses."
        ],
        blueprint: `graph TD
    subgraph "Student"
        S["📦 Student
        ─────────────
        - id: int
        - name: String
        - email: String
        - gpa: float
        ─────────────
        + enroll(course)
        + dropCourse(course)
        + viewGrades(): Grade[]"]
    end

    subgraph "Course"
        C["📦 Course
        ─────────────
        - code: String
        - title: String
        - credits: int
        - maxSeats: int
        ─────────────
        + addStudent(student)
        + getAvailableSeats(): int"]
    end

    subgraph "Professor"
        P["📦 Professor
        ─────────────
        - id: int
        - name: String
        - rank: String
        ─────────────
        + teach(course)
        + assignGrade(student, grade)"]
    end

    S -->|"enrolls in 0..*"| C
    P -->|"teaches 1..*"| C
    C -->|"has 1..* "| SEC["📦 Section"]

    style S fill:#1a1a2e,stroke:#ffd700,stroke-width:2px
    style C fill:#1a1a2e,stroke:#00d4ff,stroke-width:2px
    style P fill:#1a1a2e,stroke:#ff6600,stroke-width:2px`,
        forge: `### Building a Class Diagram — Step by Step

\\\`\\\`\\\`
SCENARIO: Build a class diagram for an Online Bookstore

═══════════════════════════════════════════════════
STEP 1: Find the NOUNS (= Classes)
═══════════════════════════════════════════════════
Read the requirements and underline every NOUN:

"CUSTOMERS can browse BOOKS, add them to a CART,
 and place ORDERS. Each ORDER has multiple ORDER ITEMS.
 BOOKS belong to CATEGORIES."

Classes found: Customer, Book, Cart, Order, OrderItem, Category

═══════════════════════════════════════════════════
STEP 2: Define ATTRIBUTES (what data do they hold?)
═══════════════════════════════════════════════════

┌─────────────────────┐
│      Customer       │
├─────────────────────┤
│ - id: int           │
│ - name: String      │
│ - email: String     │
│ - address: String   │
├─────────────────────┤
│ + register()        │
│ + login()           │
│ + placeOrder()      │
└─────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐
│       Book          │    │     Category        │
├─────────────────────┤    ├─────────────────────┤
│ - isbn: String      │    │ - id: int           │
│ - title: String     │    │ - name: String      │
│ - price: float      │    │ - description: str  │
│ - stock: int        │    ├─────────────────────┤
├─────────────────────┤    │ + getBooks(): Book[]│
│ + getDetails()      │    └─────────────────────┘
│ + updateStock(qty)  │
└─────────────────────┘

═══════════════════════════════════════════════════
STEP 3: Draw RELATIONSHIPS
═══════════════════════════════════════════════════

Customer ────────── Order       (Association)
  1                  0..*
  "A customer places zero or more orders"

Order ◆──────────── OrderItem   (Composition)
  1                  1..*
  "An order CONTAINS order items (items can't exist alone)"

OrderItem ─────────── Book      (Association)
  *                    1
  "Each order item references ONE book"

Book ─────────────── Category   (Association)
  0..*                 1
  "A book belongs to ONE category"

Customer ◇────────── Cart       (Aggregation)
  1                    0..1
  "A customer HAS a cart (cart can exist without customer)"

═══════════════════════════════════════════════════
STEP 4: Add MULTIPLICITY numbers
═══════════════════════════════════════════════════

Multiplicity Cheat Sheet:
  1     = Exactly one
  0..1  = Zero or one (optional)
  1..*  = One or more (at least one)
  0..*  = Zero or more (any number)
  *     = Same as 0..*

═══════════════════════════════════════════════════
COMMON MISTAKES:
═══════════════════════════════════════════════════
  ❌ Adding implementation details (arrays, getters/setters)
  ✅ Focus on the DOMAIN concepts only

  ❌ Forgetting multiplicity numbers
  ✅ Always add them — they define the rules!

  ❌ Confusing Aggregation vs Composition
  ✅ Ask: "Can it exist ALONE?"
     Yes → Aggregation (hollow diamond ◇)
     No  → Composition (filled diamond ◆)
\\\`\\\`\\\`
`
    },
    {
        title: "Package Diagrams — Step by Step with Examples",
        importance: "Advanced",
        principles: [
            "What is a Package Diagram? It shows how you ORGANIZE your classes into GROUPS (packages). Think of it like folders on your computer — each folder groups related files.",
            "Why Use Packages? If you have 50 classes, you can't just dump them in one place. Packages group related classes so your system is organized and manageable.",
            "Element — Package (tabbed folder icon): A container that groups related classes. Named after the module/feature. Examples: 'User Management', 'Payment', 'Reporting'.",
            "Element — Dependency Arrow (dashed arrow): Shows which packages DEPEND on which. Arrow points FROM the user TO the dependency. Example: 'UI' depends on 'Business Logic'.",
            "Layered Architecture in Packages: Presentation Layer → Business Logic Layer → Data Access Layer. Each layer is a package.",
            "Rule: Dependencies should flow ONE DIRECTION (top-to-bottom). UI depends on Logic, Logic depends on Data. NEVER Data depending on UI!",
            "Coupling: Fewer arrows between packages = GOOD (loose coupling). Many arrows = BAD (tight coupling, hard to change).",
            "How to Build: (1) List all classes (2) Group related classes into packages (3) Draw dependency arrows showing which packages use which.",
            "Real Example: E-commerce → Packages: User, Product, Cart, Order, Payment, Shipping, Notification. Payment depends on Order, Notification depends on Order, etc.",
            "Common Mistake: Making packages too small (1-2 classes) or too large (30+ classes). Aim for 5-10 related classes per package."
        ],
        blueprint: `graph TD
    subgraph "📱 Presentation Layer"
        UI["UI Components"]
        CTRL["Controllers"]
    end

    subgraph "⚙️ Business Logic Layer"
        AUTH["Authentication"]
        COURSE["Course Management"]
        GRADE["Grade Processing"]
    end

    subgraph "💾 Data Access Layer"
        REPO["Repositories"]
        DB["Database Connectors"]
    end

    UI --> CTRL
    CTRL --> AUTH
    CTRL --> COURSE
    CTRL --> GRADE
    AUTH --> REPO
    COURSE --> REPO
    GRADE --> REPO
    REPO --> DB

    style UI fill:#1a1a2e,stroke:#ffd700,stroke-width:2px
    style AUTH fill:#16213e,stroke:#00d4ff,stroke-width:2px
    style REPO fill:#0d2818,stroke:#00ff88,stroke-width:2px`,
        forge: `### Building a Package Diagram — Step by Step

\\\`\\\`\\\`
SCENARIO: Organize a University Management System

═══════════════════════════════════════════════════
STEP 1: List ALL your classes
═══════════════════════════════════════════════════
  Student, Professor, Course, Section, Grade,
  User, Login, Registration, 
  Payment, Invoice, Receipt,
  Report, GradeReport, AttendanceReport,
  StudentDAO, CourseDAO, PaymentDAO,
  DatabaseConnection, QueryBuilder

  That's 17 classes! Too many to keep in one place.

═══════════════════════════════════════════════════
STEP 2: GROUP related classes into packages
═══════════════════════════════════════════════════

  📦 User Management          📦 Academic
  ├── User                    ├── Course
  ├── Login                   ├── Section
  └── Registration            ├── Grade
                              └── Professor

  📦 Financial                📦 Reporting
  ├── Payment                 ├── Report
  ├── Invoice                 ├── GradeReport
  └── Receipt                 └── AttendanceReport

  📦 Data Access              📦 Infrastructure
  ├── StudentDAO              ├── DatabaseConnection
  ├── CourseDAO               └── QueryBuilder
  └── PaymentDAO

═══════════════════════════════════════════════════
STEP 3: Draw DEPENDENCY arrows
═══════════════════════════════════════════════════
  Ask: "Which package NEEDS which other package?"

  ┌────────────────┐     ┌────────────────┐
  │ User Mgmt      │     │ Academic       │
  └───────┬────────┘     └───────┬────────┘
          │                      │
          ▼                      ▼
  ┌────────────────┐     ┌────────────────┐
  │ Financial      │────→│ Reporting      │
  └───────┬────────┘     └───────┬────────┘
          │                      │
          └──────────┬───────────┘
                     ▼
          ┌────────────────┐
          │ Data Access    │
          └───────┬────────┘
                  ▼
          ┌────────────────┐
          │ Infrastructure │
          └────────────────┘

═══════════════════════════════════════════════════
READING THE DIAGRAM:
═══════════════════════════════════════════════════
  ✅ Dependencies flow DOWNWARD (top to bottom)
  ✅ User Mgmt and Academic are independent
  ✅ Both Financial and Reporting use Data Access
  ✅ Infrastructure is at the bottom (used by all)

  ❌ BAD: If Infrastructure depended on User Mgmt
     (bottom layer should NOT depend on top layer!)

GOLDEN RULE: 
  Arrows flow ONE direction: TOP → BOTTOM
  Never BOTTOM → TOP (circular dependency!)
\\\`\\\`\\\`
`
    }
];

async function seed() {
    try {
        console.log("🚀 Seeding CS 321: UML Diagrams (Individual Topics)...");
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

        // Delete only old combined UML topics
        for (const topic of diagrams) {
            await pool.query("DELETE FROM topics WHERE course_id = $1 AND title = $2", [courseId, topic.title]);
        }
        await pool.query("DELETE FROM topics WHERE course_id = $1 AND title LIKE '%Use Cases & Sequence%'", [courseId]);
        await pool.query("DELETE FROM topics WHERE course_id = $1 AND title LIKE '%Package & Class%'", [courseId]);
        console.log("Cleared old diagram topics.");

        for (const topic of diagrams) {
            const first_principles = JSON.stringify(topic.principles);
            await pool.query(
                "INSERT INTO topics (title, course_id, importance_level, first_principles, architectural_logic, forge_protocol) VALUES ($1, $2, $3, $4, $5, $6)",
                [topic.title, courseId, topic.importance, first_principles, topic.blueprint, topic.forge]
            );
            console.log(`✅ Synced: ${topic.title}`);
        }
        console.log(`\n🎓 UML Diagrams Seeding Complete — ${diagrams.length} topics inserted.`);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
    } finally {
        await pool.end();
    }
}
seed();
