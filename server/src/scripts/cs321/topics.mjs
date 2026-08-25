/**
 * CS 321 — Principles of Software Engineering lesson content.
 * Source of truth for enrich_cs321_software.mjs and seed_cs321_software_engineering.js
 */
import { lesson } from "./helper.mjs";

const BC = "CS 321";

export const topics = [
  lesson({
    title: "Introduction to Software Engineering",
    titleMatch: "Introduction to Software Engineering%",
    importance_level: "Foundational",
    breadcrumb_path: `${BC} > Lesson 1`,
    first_principles: [
      "Software Engineering: Systematic application of engineering principles to software development",
      "Software vs. Programs: Software includes code, documentation, configuration, and operational procedures",
      "Key Challenges: Complexity, conformity, changeability, and invisibility (Brooks, 1987)",
      "SE Principles: Abstraction, decomposition, modularity, separation of concerns, information hiding",
      "Roles: Requirements Engineer, Architect, Developer, Tester, Project Manager, DevOps Engineer",
      "Ethics in SE: Integrity, confidentiality, professional conduct — IEEE/ACM Code of Ethics",
      "Software Crisis: The origin of SE as a discipline (NATO 1968 Conference)",
      "Quality Attributes: Reliability, maintainability, efficiency, usability, portability",
    ],
    learning_objectives: [
      "Distinguish programming from software engineering as a discipline",
      "Name Brooks's four essential difficulties of software",
      "List core SE principles and typical team roles",
      "Identify when a project requires formal engineering process",
      "Relate quality attributes to stakeholder expectations",
    ],
    content_easy_markdown: `# Introduction to Software Engineering

## Hook: One script vs. a hospital system
You can hack a 50-line script alone over a weekend. A **hospital management system** with eight people for twelve months needs schedules, reviews, tests, and ethics — that's **Software Engineering (SE)**, not just coding.

## Core idea
**SE** applies **systematic, measurable process** to build software that survives real teams, real users, and real change.

Software ≠ source code alone. It includes:
- Documentation and runbooks
- Configuration and deployment scripts
- Operational procedures

## Brooks's four difficulties (1987)
| Difficulty | What it means |
|------------|---------------|
| **Complexity** | Millions of states — no physical intuition |
| **Conformity** | Must match messy human rules and legacy systems |
| **Changeability** | Requirements never stop moving |
| **Invisibility** | No physical shape to inspect |

These explain the **1968 NATO Software Crisis** — why "just hire more programmers" failed.

## SE principles you will reuse everywhere
- **Abstraction** — hide detail behind clear interfaces
- **Decomposition** — split big problems into parts
- **Modularity** — independent replaceable units
- **Separation of concerns** — one reason to change per module
- **Information hiding** — expose behavior, not internals

## Real-world example
\`Hospital Management System\`: 8 engineers, 12 months, goals = reliability + usability + maintainability → **full SE process required** (not a weekend hack).

\`\`\`python
@dataclass
class SoftwareProject:
    name: str
    team_size: int
    duration_months: int
    quality_goals: List[QualityAttribute]

    @property
    def needs_engineering(self) -> bool:
        return (
            self.team_size > 1
            or self.duration_months > 3
            or len(self.quality_goals) > 2
        )
\`\`\`

## Check yourself
1. Name two things included in "software" beyond code.
   - Answer: Documentation, configuration, operational procedures (any two).
2. Which Brooks difficulty explains changing requirements mid-project?
   - Answer: Changeability.
3. When does a hobby script become an engineering problem?
   - Answer: Multiple stakeholders, long timeline, or multiple quality attributes at risk.`,
    content_deep_markdown: `# Introduction to Software Engineering (Deep)

## IEEE/ACM Code of Ethics (high level)
Public interest, client/employer honesty, product quality, judgment, profession, colleagues, self-improvement. SE is a **professional** obligation, not only syntax.

## Quality attribute trade-offs
Optimizing reliability may cost performance; portability may constrain platform-specific optimizations. Architects document these tensions explicitly.

## Practice
1. Map team roles to SDLC phases for a mobile banking app.
2. Which quality attributes dominate for a pacemaker vs. a meme generator?
3. Write three first-principle design decisions for a student portal MVP.`,
  }),

  lesson({
    title: "System Development Life Cycles (SDLC)",
    titleMatch: "System Development Life Cycles%",
    importance_level: "Foundational",
    breadcrumb_path: `${BC} > Lesson 2`,
    first_principles: [
      "SDLC: A structured framework defining phases from inception to retirement of software",
      "Core Phases: Planning → Analysis → Design → Implementation → Testing → Deployment → Maintenance",
      "Planning Phase: Feasibility study, resource estimation, risk identification, project scope definition",
      "Analysis Phase: Requirements gathering, stakeholder interviews, current system study",
      "Design Phase: Architectural design, interface design, database design, component design",
      "Implementation Phase: Coding, unit testing, integration, code reviews",
      "Testing Phase: System testing, acceptance testing, regression testing",
      "Deployment & Maintenance: Release management, bug fixes, enhancements, adaptive maintenance",
    ],
    learning_objectives: [
      "Name and order the core SDLC phases",
      "Identify deliverables typical of each phase",
      "Explain feedback loops between phases",
      "Embed ethical checkpoints in phase completion criteria",
      "Relate SDLC to project planning artifacts",
    ],
    content_easy_markdown: `# System Development Life Cycles (SDLC)

## Hook: Building a house without a blueprint
You *can* pour concrete before permits — then tear it down when inspectors arrive. **SDLC** is the blueprint + inspection schedule for software.

## The classic pipeline
\`\`\`
Planning → Analysis → Design → Implementation → Testing → Deployment → Maintenance
\`\`\`

| Phase | Question answered | Example deliverable |
|-------|-------------------|---------------------|
| **Planning** | Should we build it? | Project charter, feasibility report |
| **Analysis** | What must it do? | Requirements, stakeholder map |
| **Design** | How will it work? | Architecture, UI mockups, ERD |
| **Implementation** | Build it | Source code, unit tests |
| **Testing** | Does it meet spec? | Test reports, defect log |
| **Deployment** | Ship it safely | Release notes, rollback plan |
| **Maintenance** | Keep it alive | Patches, enhancements |

## Feedback loops (real projects are not linear)
- Testing finds defects → back to **Implementation**
- UAT gaps → back to **Analysis**
- Production incidents → **Maintenance** may trigger **Design** changes

## Ethical checkpoints
Before closing a phase, ask: accessibility included? privacy assessed? stakeholder impact documented?

\`\`\`javascript
class SDLCPhase {
  complete() {
    const unmet = this.ethicalChecks.filter(c => !c.passed);
    if (unmet.length) return false;  // blocked until ethics addressed
    this.status = 'completed';
    return true;
  }
}
\`\`\`

## Check yourself
1. Which phase produces the SRS?
   - Answer: Analysis (refined into specification documents).
2. Why can testing send you back to analysis?
   - Answer: Requirements gaps discovered late must be fixed at the source.
3. Name one maintenance type.
   - Answer: Corrective (bugs), adaptive (environment change), perfective (features).`,
    content_deep_markdown: `# SDLC (Deep)

## Phase entry/exit criteria
Mature organizations define **gates**: e.g., Design exit requires architecture review sign-off and threat model draft.

## Retirement
SDLC ends with **decommissioning**: data migration, legal retention, user communication.

## Practice
Draw a swimlane diagram for a 6-month capstone showing two feedback loops from Testing.`,
  }),

  lesson({
    title: "Software Engineering Methodologies — Traditional to Agile",
    titleMatch: "Software Engineering Methodologies%",
    importance_level: "Critical",
    breadcrumb_path: `${BC} > Lesson 3`,
    first_principles: [
      "Waterfall Model: Sequential phases with formal sign-off — best for stable, well-understood requirements",
      "V-Model: Extension of Waterfall linking each development phase to a corresponding testing phase",
      "Incremental Model: Delivers software in planned increments, each adding functionality",
      "Spiral Model: Risk-driven iterative approach combining prototyping with controlled waterfall elements",
      "Agile Manifesto: Individuals & interactions, working software, customer collaboration, responding to change",
      "Scrum: Sprint-based framework with roles (PO, SM, Dev Team), ceremonies, and artifacts",
      "Kanban: Flow-based method with WIP limits, visual boards, continuous delivery",
      "XP (Extreme Programming): Pair programming, TDD, continuous integration, collective ownership",
    ],
    learning_objectives: [
      "Contrast plan-driven and adaptive methodologies",
      "Describe Waterfall, V-Model, Spiral, Scrum, Kanban, and XP",
      "Map Agile manifesto values to concrete practices",
      "Recommend a methodology given project context signals",
      "Explain hybrid approaches (SAFe, Water-Scrum-Fall)",
    ],
    content_easy_markdown: `# Methodologies — Traditional to Agile

## Hook: Assembly line vs. jazz ensemble
**Waterfall** is an assembly line — each station finishes before the next starts. **Agile** is a jazz ensemble — short solos (sprints), constant listening (feedback), improvisation within structure.

## Traditional (plan-driven)
| Model | Idea | Best when |
|-------|------|-----------|
| **Waterfall** | Sequential phases, sign-offs | Stable requirements, contracts |
| **V-Model** | Each build phase paired with test phase | Regulated domains |
| **Incremental** | Ship slices of functionality | Early value, staged rollout |
| **Spiral** | Prototype + risk analysis loops | High uncertainty, large systems |

## Agile (adaptive)
**Manifesto values:** people over process, working software over docs, collaboration over contracts, responding to change over plans.

| Framework | Rhythm | Signature tool |
|-----------|--------|----------------|
| **Scrum** | 1–4 week sprints | Sprint backlog, daily standup |
| **Kanban** | Continuous flow | WIP limits on board |
| **XP** | Technical excellence | Pair programming, TDD |

## Choosing at a glance
\`\`\`python
def recommend_methodology(ctx):
    if ctx.requirements_stability == "evolving":
        score["scrum"] += 3
    if ctx.requirements_stability == "stable":
        score["waterfall"] += 3
    # ... team size, customer availability, risk
\`\`\`

Startup with changing requirements + small team → **Scrum**.

## Check yourself
1. V-Model adds what to Waterfall?
   - Answer: Explicit test phase for each development phase.
2. Kanban's key constraint mechanism?
   - Answer: WIP (work-in-progress) limits.
3. One XP engineering practice?
   - Answer: Pair programming, TDD, or continuous integration.`,
    content_deep_markdown: `# Methodologies (Deep)

## Hybrid patterns
**Water-Scrum-Fall:** agile teams inside waterfall governance (common in enterprises). **SAFe:** scales Scrum to dozens of teams with PI planning.

## Ceremony map (Scrum)
Sprint planning, daily scrum, review, retrospective — each has a time box and outcome artifact.

## Practice
Score a fictional medical device project (stable reqs, high regulation) across Waterfall, Spiral, Scrum.`,
  }),

  lesson({
    title: "Evaluating & Selecting Methodologies",
    titleMatch: "Evaluating & Selecting%",
    importance_level: "Critical",
    breadcrumb_path: `${BC} > Lesson 4`,
    first_principles: [
      "Selection Criteria: Project size, complexity, requirements clarity, team experience, stakeholder involvement",
      "Trade-off Analysis: Speed vs. quality, flexibility vs. predictability, documentation vs. communication",
      "Context Sensitivity: No methodology is universally superior — fitness depends on project context",
      "Regulatory Constraints: Some domains mandate specific process rigor",
      "Team Dynamics: Methodology must match team culture, skill level, and geographic distribution",
      "Continuous Improvement: Retrospectives and process adaptation based on empirical data",
    ],
    learning_objectives: [
      "Build a weighted decision matrix for methodology selection",
      "Analyze case studies of methodology mismatch",
      "Advise stakeholders professionally when their preferred process is risky",
      "Factor regulatory and ethical constraints into selection",
      "Plan retrospectives for process improvement",
    ],
    content_easy_markdown: `# Evaluating & Selecting Methodologies

## Hook: The client who insists on Waterfall for foggy requirements
Fixed-price contract + vague scope + Waterfall = **predictable pain**. Selection is an engineering judgment, not a fashion choice.

## Decision dimensions
| Factor | Favors plan-driven | Favors adaptive |
|--------|-------------------|-----------------|
| Requirements | Stable, signed | Evolving, exploratory |
| Customer access | Low | High (for feedback) |
| Domain risk | Safety-critical formal gates | Rapid experimentation |
| Team | Large, distributed governance | Small, co-located |

## Weighted scoring example
\`\`\`javascript
const CRITERIA = {
  requirementsClarity: { weight: 0.25, scores: [5,2,2,3,2,3] }, // Waterfall..SAFe
  customerInvolvement: { weight: 0.20, scores: [2,5,4,3,5,4] },
  riskLevel:           { weight: 0.20, scores: [3,3,2,5,3,4] },
};
\`\`\`

## Ethical advisory scenario
Client demands Waterfall on vague requirements. **Professional response:** propose Agile with **milestone checkpoints** (sprint reviews as contract gates) — predictability *and* reality.

## Check yourself
1. Is any methodology universally best?
   - Answer: No — context determines fitness.
2. Two trade-offs in selection?
   - Answer: Speed vs. quality; flexibility vs. predictability (among others).
3. Why might aviation prefer V-Model?
   - Answer: Regulatory traceability from requirements to tests.`,
    content_deep_markdown: `# Methodology Selection (Deep)

## ATAM-style thinking for process
Sensitivity points: e.g., distributed team → documentation weight increases. Trade-off: heavy gates slow delivery but reduce audit risk.

## Case study debrief
Analyze a failed ERP rollout: was the mismatch requirements volatility vs. waterfall, or team skill vs. XP?

## Practice
Complete a decision matrix for: (a) fintech startup MVP, (b) municipal tax system replacement.`,
  }),

  lesson({
    title: "Software Requirements Process & Feasibility Study",
    titleMatch: "Software Requirements Process%",
    importance_level: "Critical",
    breadcrumb_path: `${BC} > Lesson 5`,
    first_principles: [
      "Requirements Engineering: Systematic process of eliciting, analyzing, specifying, and validating requirements",
      "Requirements Process Activities: Elicitation → Analysis → Specification → Validation → Management",
      "Feasibility Study: Technical, economic, operational, legal, and schedule feasibility assessment",
      "Technical Feasibility: Can the system be built with available technology and expertise?",
      "Economic Feasibility: Cost-benefit analysis — will the investment generate sufficient ROI?",
      "Operational Feasibility: Will the system be used effectively within the organization?",
      "Stakeholder Identification: Categorize actors by influence, interest, and impact on the project",
      "Requirements Traceability: Linking requirements to their source and downstream artifacts",
    ],
    learning_objectives: [
      "Order requirements engineering activities",
      "Conduct a multi-dimensional feasibility study",
      "Identify and categorize stakeholders",
      "Explain requirements traceability forward and backward",
      "Decide go/no-go using weighted feasibility scores",
    ],
    content_easy_markdown: `# Requirements Process & Feasibility Study

## Hook: Build the wrong thing efficiently?
Perfect code that nobody uses is a **feasible disaster**. Requirements engineering asks **what** and **whether** before **how**.

## Requirements pipeline
\`\`\`
Elicitation → Analysis → Specification → Validation → Management
\`\`\`

## Five feasibility lenses
| Dimension | Question |
|-----------|----------|
| **Technical** | Can we build it with our stack and skills? |
| **Economic** | Is ROI worth the cost? |
| **Operational** | Will people actually adopt it? |
| **Legal** | GDPR, HIPAA, licensing OK? |
| **Schedule** | Can we hit the deadline credibly? |

\`\`\`python
class FeasibilityStudy:
    def verdict(self) -> str:
        score = self.overall_score()
        if score >= 0.7: return "GO"
        if score >= 0.5: return "CONDITIONAL"
        return "NO-GO"
\`\`\`

**Student Portal v2** example: Technical 0.85, Economic 0.70, Operational 0.90 → weighted **GO**.

## Traceability
Every requirement links **backward** to a stakeholder need and **forward** to design, code, and tests. Lose the chain → audit and maintenance nightmares.

## Check yourself
1. First activity after project idea?
   - Answer: Feasibility study (often within Planning) before full elicitation commitment.
2. Operational feasibility example question?
   - Answer: Will staff receive training and use the new system?
3. What is traceability?
   - Answer: Mapping requirements to sources and downstream artifacts.`,
    content_deep_markdown: `# Requirements & Feasibility (Deep)

## Stakeholder power/interest grid
Manage closely: high power + high interest. Keep satisfied: high power, low interest.

## Requirements management
Versioning, change control boards, impact analysis when REQ-042 changes.

## Practice
Draft feasibility scores for an AI grading assistant — include legal/ethical risks.`,
  }),

  lesson({
    title: "Software Requirements Elicitation Techniques",
    titleMatch: "Requirements Elicitation%",
    importance_level: "Critical",
    breadcrumb_path: `${BC} > Lesson 6`,
    first_principles: [
      "Functional Requirements: What the system should DO — features, operations, behaviors",
      "Non-Functional Requirements: HOW the system should behave — performance, security, usability, scalability",
      "Domain Requirements: Constraints from the application domain (regulations, industry standards)",
      "Elicitation Techniques: Interviews, questionnaires, observation, document analysis, prototyping, workshops",
      "Interviews: Structured (predefined questions) vs. Unstructured (open-ended exploration)",
      "Workshops/JAD Sessions: Collaborative sessions with all stakeholders for consensus building",
      "Prototyping: Building throwaway or evolutionary prototypes to discover hidden requirements",
      "Observation/Ethnography: Watching users in their natural environment to uncover implicit needs",
    ],
    learning_objectives: [
      "Classify requirements as functional, non-functional, or domain",
      "Select elicitation techniques for stakeholder types",
      "Contrast structured and unstructured interviews",
      "Use prototyping to surface tacit requirements",
      "Automate basic requirement classification from text",
    ],
    content_easy_markdown: `# Requirements Elicitation Techniques

## Hook: Users say "make it fast" — fast how?
**Elicitation** digs out testable needs. "Fast" becomes "95th percentile API latency < 200 ms under 500 concurrent users."

## Three requirement buckets
| Type | Starts with... | Example |
|------|----------------|---------|
| **Functional** | shall / must / allow | "System shall register users via email" |
| **Non-functional** | performance, security | "Respond within 2 seconds" |
| **Domain** | regulation, standard | "HIPAA-compliant audit logs" |

## Technique toolbox
| Technique | When it shines |
|-----------|----------------|
| **Interviews** | Deep exploration with key experts |
| **Questionnaires** | Many stakeholders, quantitative trends |
| **Observation** | Users can't articulate workflow pain |
| **Workshops (JAD)** | Conflicting stakeholders need consensus |
| **Prototyping** | UI/flow uncertainty |
| **Document analysis** | Legacy specs, regulations |

## Classifier sketch
\`\`\`javascript
function classifyRequirement(text) {
  // keyword hits for FUNCTIONAL vs NON_FUNCTIONAL vs DOMAIN
  return { text, type: bestType, confidence };
}
\`\`\`

## Check yourself
1. "Must comply with GDPR" — which type?
   - Answer: Domain (regulatory constraint).
2. Best technique for watching nurses use existing software?
   - Answer: Observation / ethnography.
3. Structured vs unstructured interview?
   - Answer: Fixed questions vs. open-ended exploration.`,
    content_deep_markdown: `# Elicitation (Deep)

## Conflict resolution
MoSCoW prioritization: Must, Should, Could, Won't — surfaces trade-offs in workshops.

## Prototype fidelity
Low-fi paper → clickable Figma → vertical slice — match cost to uncertainty.

## Practice
Write 5 requirements for a library app; classify each; pick elicitation technique per stakeholder role.`,
  }),

  lesson({
    title: "Software Requirements Analysis with UML — Use Cases & Sequence Diagrams",
    titleMatch: "Use Cases & Sequence%",
    importance_level: "Advanced",
    breadcrumb_path: `${BC} > Lesson 7`,
    first_principles: [
      "UML: Standardized visual language for modeling software systems",
      "Use Case Diagram: System boundary, actors, use cases, relationships (include, extend, generalization)",
      "Actor: External entity (person, system, device) interacting with the system",
      "Use Case: Unit of functionality from the actor's perspective",
      "Relationships: <<include>>, <<extend>>, generalization",
      "Use Case Description: Preconditions, main flow, alternative flows, postconditions, exceptions",
      "System Sequence Diagram (SSD): Temporal interaction between actor and system for a use case",
      "From Use Case to SSD: Each main-flow step becomes a message pair",
    ],
    learning_objectives: [
      "Draw use case diagrams with actors and relationships",
      "Write structured use case descriptions",
      "Translate main flows to system sequence diagrams",
      "Apply include and extend correctly",
      "Connect use cases to test scenarios",
    ],
    content_easy_markdown: `# UML Analysis — Use Cases & Sequence Diagrams

## Hook: The feature list nobody understands
A bullet list says "login." A **use case** says who logs in, what can go wrong, and what success looks like — in the user's language.

## Use case diagram pieces
- **Actor** — stick figure (Student, Payment Gateway)
- **Use case** — oval (Login, Enroll in Course)
- **System boundary** — box around software responsibilities
- **<<include>>** — mandatory sub-behavior (Login included by Checkout)
- **<<extend>>** — optional branch (Forgot Password extends Login)

## Use case text template
| Section | Content |
|---------|---------|
| Preconditions | Account exists, system online |
| Main flow | 1. Enter credentials 2. Submit 3. Show dashboard |
| Alternates | Invalid password → show error |
| Postconditions | Session created |

## To System Sequence Diagram (SSD)
Each actor step → message to **System**; system responds.

\`\`\`python
# Login main flow → messages:
# Student -> System: enterCredentials()
# System -> Student: validateAndShowDashboard()
\`\`\`

## Check yourself
1. <<include>> vs <<extend>>?
   - Answer: Include is mandatory shared behavior; extend is optional conditional add-on.
2. SSD shows which objects minimum?
   - Answer: Actor lifeline + System lifeline.
3. Primary actor?
   - Answer: Initiates the use case (Student for Login).`,
    content_deep_markdown: `# Use Cases & SSD (Deep)

## Generalization
Payment use case generalized by CreditCardPayment and PayPalPayment — shared flow inherited.

## SSD to design
Messages become controller/service operations; responses inform DTO contracts.

## Practice
Full use case + SSD for "Drop Course" with one alternate (deadline passed).`,
  }),

  lesson({
    title: "Software Requirements Specification with UML — Package & Class Diagrams",
    titleMatch: "Package & Class Diagrams%",
    importance_level: "Advanced",
    breadcrumb_path: `${BC} > Lesson 8`,
    first_principles: [
      "Package Diagram: Logical groupings (namespaces/modules) and dependencies",
      "Domain Class Diagram: Key concepts and relationships in the problem domain",
      "Class Elements: Name, attributes, operations",
      "Relationships: Association, aggregation, composition, generalization, dependency",
      "Multiplicity: Cardinality (1, 0..1, 1..*, 0..*)",
      "Association vs Aggregation vs Composition: Strength of has-a relationships",
      "Generalization: is-a inheritance",
      "Domain Modeling: Extract nouns from requirements into classes",
    ],
    learning_objectives: [
      "Model domain classes from requirements text",
      "Apply multiplicities to associations",
      "Distinguish aggregation and composition",
      "Organize classes into packages with dependency arrows",
      "Relate domain model to implementation packages",
    ],
    content_easy_markdown: `# UML Specification — Package & Class Diagrams

## Hook: Nouns become classes
Read requirements and **highlight nouns**: Student, Course, Section, Professor. Those are candidate **domain classes** — the vocabulary of your system.

## Class diagram basics
\`\`\`
┌─────────────┐
│   Student   │
├─────────────┤
│ id, name    │
├─────────────┤
│ enroll()    │
└─────────────┘
\`\`\`

## Relationship strength
| Symbol | Meaning | Example |
|--------|---------|---------|
| **Association** | Uses / knows | Student — Course |
| **Aggregation ◇** | Weak whole-part | Department ◇— Professor |
| **Composition ◆** | Strong lifecycle | Order ◆— OrderItem |
| **Generalization △** | is-a | Person ← Student |

## Multiplicity
\`Student 0..* --- 1..* Course\` — a student enrolls in zero or more courses; a course has one or more students.

## Package diagram
Group UI, Business Logic, Data Access packages — arrows show **dependencies** (UI depends on BL, not reverse).

\`\`\`javascript
student.addRelationship('Association', course, '0..*');
course.addRelationship('Composition', section, '1..*');
\`\`\`

## Check yourself
1. Order destroys its line items when deleted — which relationship?
   - Answer: Composition.
2. Package dependency direction?
   - Answer: Dependent package points to provider (UI → Business Logic).
3. 0..1 multiplicity means?
   - Answer: Zero or one instance.`,
    content_deep_markdown: `# Package & Class Diagrams (Deep)

## Domain vs design class diagrams
Domain model avoids UI/database columns; design model adds repositories, controllers.

## Anti-pattern
God class with 40 attributes — split by cohesion and aggregate roots (DDD lite).

## Practice
Extract class diagram from a ride-sharing requirements paragraph; add package layer.`,
  }),

  lesson({
    title: "SRS Document & Requirements Validation",
    titleMatch: "SRS Document%",
    importance_level: "Advanced",
    breadcrumb_path: `${BC} > Lesson 9`,
    first_principles: [
      "SRS: Formal document describing what the system shall do",
      "IEEE 830 Standard: Introduction, overall description, specific requirements",
      "Good Requirements: SMART — Specific, Measurable, Achievable, Relevant, Traceable",
      "Testable Requirements: Each requirement has verifiable acceptance criteria",
      "Validation Techniques: Reviews, walkthroughs, inspections, prototyping, test-case generation",
      "Requirements Reviews: Formal peer review to detect defects and ambiguities",
      "Traceability Matrix: Maps requirements to design, code, and test artifacts",
    ],
    learning_objectives: [
      "Structure an SRS following IEEE 830 sections",
      "Evaluate requirements against SMART criteria",
      "Run a requirements review checklist",
      "Build a traceability matrix skeleton",
      "Reject vague requirements with measurable rewrites",
    ],
    content_easy_markdown: `# SRS Document & Requirements Validation

## Hook: "The system shall be user-friendly"
That's not a requirement — it's a wish. Validation turns wishes into **testable commitments**.

## SRS skeleton (IEEE 830 style)
1. **Introduction** — purpose, scope, definitions
2. **Overall description** — users, constraints, assumptions
3. **Specific requirements** — functional, non-functional, interfaces
4. **Appendices** — models, traceability

## SMART requirements
| Letter | Test |
|--------|------|
| **S** | Specific — no vague "fast" |
| **M** | Measurable — numbers or booleans |
| **A** | Achievable — technically feasible |
| **R** | Relevant — ties to business goal |
| **T** | Traceable — ID links to tests |

## Quality checker
\`\`\`python
VAGUE_WORDS = ['fast', 'user-friendly', 'easy', 'robust']
# FR-02 "user-friendly" → FAIL (no acceptance criteria)
# FR-01 "authenticate within 2 seconds" → PASS
\`\`\`

## Validation activities
- **Walkthrough** — author-led skim
- **Inspection** — formal checklist, defects logged
- **Prototype** — confirm UI flows
- **Test-case generation** — if you can't test it, rewrite it

## Check yourself
1. Where do non-functional requirements live in SRS?
   - Answer: Specific requirements section (NFR subsection).
2. Why traceability matrix?
   - Answer: Ensures every requirement is designed, coded, and tested.
3. Vague word example to flag?
   - Answer: "appropriate," "fast," "user-friendly."`,
    content_deep_markdown: `# SRS & Validation (Deep)

## Baseline control
Once validated, SRS is **baselined** — changes go through change control with impact analysis.

## Review roles
Moderator, author, reviewer, scribe — inspection meeting timed agenda.

## Practice
Rewrite three vague requirements; add IDs and acceptance criteria; map to test case IDs.`,
  }),

  lesson({
    title: "Architectural Design — Principles & Styles",
    titleMatch: "Architectural Design — Principles%",
    importance_level: "Expert",
    breadcrumb_path: `${BC} > Lesson 10`,
    first_principles: [
      "Software Architecture: High-level structure — components, connectors, configurations",
      "Quality Attributes: Performance, security, availability, modifiability, scalability, testability",
      "Modularity: Cohesive, loosely coupled modules with clear interfaces",
      "Separation of Concerns: Each module one distinct aspect",
      "Loose Coupling: Minimize cascading changes",
      "High Cohesion: Elements in a module strongly related",
      "Architectural Styles: Layered, Client-Server, Microservices, Event-Driven, Pipe-and-Filter, MVC",
    ],
    learning_objectives: [
      "Define architecture vs. detailed design",
      "Match quality attributes to architectural tactics",
      "Compare layered, microservices, event-driven, and MVC styles",
      "Apply cohesion/coupling review to a design sketch",
      "Recommend a style given prioritized quality goals",
    ],
    content_easy_markdown: `# Architectural Design — Principles & Styles

## Hook: Blueprint before drywall
Architecture is the **load-bearing structure**: which boxes exist, how they talk, and what quality goals (scale, security) you can still change cheaply.

## Design principles
- **Modularity** — swap parts without demolition
- **Separation of concerns** — UI doesn't embed SQL
- **Loose coupling** — change A without rewriting B
- **High cohesion** — everything in Billing module belongs together

## Common styles
| Style | Shape | Wins on |
|-------|-------|---------|
| **Layered** | Presentation → Logic → Data | Maintainability, clarity |
| **Microservices** | Many small APIs | Independent scale/deploy |
| **Event-driven** | Producers → bus → consumers | Responsiveness, decoupling |
| **MVC** | Model ↔ View ↔ Controller | UI separation |

## Style evaluator
\`\`\`python
def recommend_architecture(priorities):
    # score Microservices high on scalability & deployability
    # score Layered high on maintainability for small teams
\`\`\`

E-commerce needing scale + deploy independence → lean **Microservices** (accept ops complexity).

## Check yourself
1. Architecture vs class diagram?
   - Answer: Architecture = major components/connectors; classes = internal detail.
2. Event-driven weakness?
   - Answer: Debugging async flows, eventual consistency.
3. MVC "Model" holds?
   - Answer: Domain data and business rules (not the HTML).`,
    content_deep_markdown: `# Architecture Principles (Deep)

## Tactics catalog (sample)
Performance: cache, replicate. Security: authenticate at gateway. Modifiability: encapsulate variation behind interfaces.

## Microservices trade-offs
Network latency, distributed transactions, observability stack required.

## Practice
Pick style for: campus LMS, high-frequency trading feed, IoT sensor ingest. Justify with quality attributes.`,
  }),

  lesson({
    title: "Architectural Design — Trade-offs & Modeling",
    titleMatch: "Trade-offs & Modeling%",
    importance_level: "Expert",
    breadcrumb_path: `${BC} > Lesson 11`,
    first_principles: [
      "ATAM: Architecture Trade-off Analysis Method for quality goal evaluation",
      "Trade-off Points: Improving one quality attribute hurts another",
      "Sensitivity Points: Decisions that strongly affect one attribute",
      "Risk Points: Architectural choices that may cause future failure",
      "4+1 View Model: Logical, process, development, physical views + scenarios",
      "ADR: Architecture Decision Records document context, decision, consequences",
      "Evolutionary Architecture: Fitness functions guard qualities over time",
    ],
    learning_objectives: [
      "Facilitate a lightweight ATAM-style scenario walkthrough",
      "Document decisions in ADR format",
      "Identify sensitivity, trade-off, and risk points",
      "Sketch component and deployment diagrams",
      "Plan for architectural evolution",
    ],
    content_easy_markdown: `# Architecture — Trade-offs & Modeling

## Hook: Faster *or* safer — pick two
Every architecture choice **helps** some qualities and **hurts** others. **ATAM** makes those fights explicit before code hardens them.

## ATAM in plain steps
1. Present architecture
2. List quality goals (performance, security, …)
3. Generate scenarios ("1000 users checkout simultaneously")
4. Mark **sensitivity**, **trade-off**, and **risk** points

## Architecture Decision Record (ADR)
\`\`\`markdown
# ADR-1: Adopt Microservices
## Context
Monolith can't scale 10x traffic.
## Decision
Split by bounded contexts.
## Consequences
+ Independent scale  - Ops complexity
\`\`\`

## 4+1 views (Kruchten)
| View | Shows |
|------|-------|
| **Logical** | Classes/components for functionality |
| **Process** | Runtime threads, messaging |
| **Development** | Modules for teams |
| **Physical** | Servers, containers |
| **Scenarios** | Stories tying views together |

## Check yourself
1. Trade-off point example?
   - Answer: Strong encryption adds latency (security vs performance).
2. Why ADRs?
   - Answer: Future you knows *why* a decision was made.
3. Deployment diagram shows?
   - Answer: Software mapped onto hardware/infrastructure.`,
    content_deep_markdown: `# Trade-offs & Modeling (Deep)

## Fitness functions (evolutionary architecture)
Automated checks: e.g., "checkout p95 < 500ms" in CI blocks merges that regress performance.

## Risk themes in microservices
Service discovery failure, cascading timeouts — mitigate with circuit breakers.

## Practice
Write ADR choosing monolith vs microservices for a 3-person startup; list 2 risks each.`,
  }),

  lesson({
    title: "Software Construction & Quality",
    titleMatch: "Software Construction%",
    importance_level: "Critical",
    breadcrumb_path: `${BC} > Lesson 12`,
    first_principles: [
      "Programming Paradigms: Procedural, OOP, Functional, Event-Driven",
      "Code Quality: Readability, DRY, KISS, YAGNI",
      "Code Smells: Long methods, duplicate code, large classes, deep nesting",
      "Refactoring: Restructure without changing behavior",
      "Secure Coding: Input validation, injection prevention, XSS protection",
      "Code Reviews: Peer review for quality and knowledge sharing",
      "Ethical Programming: IP respect, no plagiarism, responsible disclosure",
    ],
    learning_objectives: [
      "Contrast procedural, OOP, and functional styles",
      "Detect common code smells from metrics",
      "Apply refactorings (extract method, guard clauses)",
      "Follow secure coding basics (OWASP awareness)",
      "Participate effectively in code reviews",
    ],
    content_easy_markdown: `# Software Construction & Quality

## Hook: Code that works but terrifies the next developer
Construction is where architecture meets the keyboard. **Quality** means the next teammate can change it safely Monday morning.

## Paradigm snapshot
| Paradigm | Think in... | Good for |
|----------|-------------|----------|
| **Procedural** | Functions, steps | Scripts, pipelines |
| **OOP** | Objects, contracts | Domain models, GUIs |
| **Functional** | Pure functions, immutability | Data transforms, concurrency |
| **Event-driven** | Events, handlers | UI, streaming |

## Code quality mantras
- **DRY** — Don't Repeat Yourself
- **KISS** — Keep It Simple
- **YAGNI** — You Aren't Gonna Need It (yet)

## Code smell detector
\`\`\`javascript
if (methodLines > 20) → 'Long Method' → Extract Method
if (nestingDepth > 3) → 'Deep Nesting' → Guard clauses
if (duplicateBlocks > 3) → 'Duplicate Code' → Shared utility
\`\`\`

## Secure coding basics
Validate **all** inputs; parameterize SQL; escape output (XSS); never store plaintext passwords.

## Ethical moment
Stack Overflow snippet with **CC BY-SA** in proprietary code — understand license, attribute, or **rewrite clean-room**.

## Check yourself
1. Refactoring changes behavior?
   - Answer: No — structure only, tests stay green.
2. One OWASP-class vulnerability?
   - Answer: SQL injection, XSS, broken auth (any valid).
3. Feature envy smell?
   - Answer: Method uses another class's data more than its own — consider move method.`,
    content_deep_markdown: `# Construction & Quality (Deep)

## Review checklist
Correctness, tests, naming, security, error handling, docs for public APIs.

## Refactoring catalog
Extract Method, Rename, Move, Replace Conditional with Polymorphism — Fowler catalog.

## Practice
Refactor a 45-line nested function using guard clauses; list smells found.`,
  }),

  lesson({
    title: "Software Testing",
    titleMatch: "Software Testing%",
    importance_level: "Critical",
    breadcrumb_path: `${BC} > Lesson 13`,
    first_principles: [
      "Testing Levels: Unit → Integration → System → Acceptance",
      "Unit Testing: Isolated functions — fast, developer-written",
      "Integration Testing: Component interactions and contracts",
      "System Testing: Full system vs SRS requirements",
      "Acceptance Testing: Stakeholder validation (UAT)",
      "Black-box vs White-box: External behavior vs internal structure",
      "Regression Testing: Re-run tests after changes",
      "TDD: Red-Green-Refactor cycle",
    ],
    learning_objectives: [
      "Map testing levels to SDLC phases",
      "Derive test cases from use case flows",
      "Apply equivalence partitioning and boundary values",
      "Explain TDD red-green-refactor cycle",
      "Design a regression suite strategy",
    ],
    content_easy_markdown: `# Software Testing

## Hook: Confidence, not checkbox theater
Tests exist to **find defects early** and **prevent regressions**. A suite you don't trust is decoration.

## Testing pyramid (levels)
\`\`\`
        Acceptance (few, slow, high confidence)
       System
      Integration
     Unit (many, fast)
\`\`\`

| Level | Targets | Typical owner |
|-------|---------|---------------|
| **Unit** | One function/class | Developer |
| **Integration** | APIs, DB, modules | Developer/QA |
| **System** | Whole app vs SRS | QA |
| **Acceptance (UAT)** | Business needs | Customer |

## From use cases to tests
Main flow → **happy path** (Critical priority)
Alternate flows → edge cases (High)
Exception flows → error handling (Medium)

\`\`\`python
UseCaseFlow("Invalid Password", steps=[...], flow_type="alternative")
# → TC-LOG-002 priority High
\`\`\`

## Black-box techniques
- **Equivalence partitioning** — group inputs that behave alike
- **Boundary value analysis** — test edges of partitions (0, 1, max)

## TDD cycle
1. **Red** — write failing test
2. **Green** — minimal code to pass
3. **Refactor** — clean up

## Check yourself
1. Fastest, most numerous tests?
   - Answer: Unit tests.
2. UAT purpose?
   - Answer: Stakeholders verify system meets their needs.
3. Boundary test for age 18–65 field?
   - Answer: 17, 18, 65, 66 (and valid interior).`,
    content_deep_markdown: `# Software Testing (Deep)

## Coverage types
Statement, branch, path — 100% coverage ≠ bug-free; missing assertions still pass.

## Contract testing
Microservices: consumer-driven contracts (Pact) catch breaking API changes.

## Practice
Generate 6 test cases for Login use case; tag priority; map to requirement IDs.`,
  }),

  lesson({
    title: "Project Presentation & Integration",
    titleMatch: "Project Presentation%",
    importance_level: "Foundational",
    breadcrumb_path: `${BC} > Lesson 14`,
    first_principles: [
      "Project Integration: Combine SRS, architecture, code, tests into coherent deliverable",
      "Presentation Skills: Communicate technical decisions to diverse audiences",
      "Demo Preparation: Working prototype with live validation of key use cases",
      "Lessons Learned: Reflect on successes, failures, and process improvements",
      "Team Collaboration: Git, code reviews, task division, conflict resolution",
      "Documentation Package: README, user guide, API docs, deployment instructions",
      "Professional Communication: Problem → approach → solution → results → future work",
    ],
    learning_objectives: [
      "Assemble a complete project documentation package",
      "Structure a technical presentation for mixed audiences",
      "Prepare a live demo with fallback plan",
      "Conduct a team retrospective",
      "Report project health across deliverable categories",
    ],
    content_easy_markdown: `# Project Presentation & Integration

## Hook: The grade is the whole story, not just git push
Capstone integration means **SRS + architecture + working software + tests + docs + demo** tell one consistent story.

## Deliverable bundle
| Category | Artifacts |
|----------|-----------|
| **Documentation** | SRS, architecture diagrams, test reports, user guide |
| **Software** | Source repo, deployed demo, automated tests |
| **Presentation** | Slides + live walkthrough |

## Presentation arc (10 minutes)
1. **Problem** — who hurts and why
2. **Approach** — methodology & architecture choices
3. **Solution** — demo key use cases
4. **Results** — tests passed, metrics, lessons
5. **Future work** — honest next steps

## Project health dashboard
\`\`\`javascript
project.addDeliverable('SRS Document', 'Documentation', 25);
project.addDeliverable('Source Code', 'Software', 30);
project.updateStatus('SRS Document', 'complete', 100);
console.log(project.getOverallHealth()); // weighted %
\`\`\`

## Retrospective prompts
- What went well?
- What went wrong?
- What would we change next sprint?

## Demo tips
Rehearse with **seeded data**; have screenshots if Wi-Fi dies; scope demo to 2–3 flows max.

## Check yourself
1. Minimum docs for another dev to deploy?
   - Answer: README with setup, env vars, deployment steps.
2. Retrospective output?
   - Answer: Action items for process improvement.
3. Why weighted deliverable health?
   - Answer: Shows if critical artifacts (SRS, code) lag before deadline.`,
    content_deep_markdown: `# Presentation & Integration (Deep)

## Stakeholder tailoring
Executives: outcomes & risks. Engineers: architecture & trade-offs. Users: workflow demo.

## Integrity check
Presentation claims must match traceability matrix and test report IDs.

## Practice
Outline 8 slides for Student Portal capstone; assign demo script timing per slide.`,
  }),
];
