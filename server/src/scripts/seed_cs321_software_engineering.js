import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

const syllabus = [
    {
        title: "Introduction to Software Engineering",
        importance: "Foundational",
        principles: [
            "Software Engineering: Systematic application of engineering principles to software development",
            "Software vs. Programs: Software includes code, documentation, configuration, and operational procedures",
            "Key Challenges: Complexity, conformity, changeability, and invisibility (Brooks, 1987)",
            "SE Principles: Abstraction, decomposition, modularity, separation of concerns, information hiding",
            "Roles: Requirements Engineer, Architect, Developer, Tester, Project Manager, DevOps Engineer",
            "Ethics in SE: Integrity, confidentiality, professional conduct — IEEE/ACM Code of Ethics",
            "Software Crisis: The origin of SE as a discipline (NATO 1968 Conference)",
            "Quality Attributes: Reliability, maintainability, efficiency, usability, portability"
        ],
        blueprint: `graph TD
    A[Software Engineering Discipline] --> B{Core Pillars}
    B --> C[Process]
    B --> D[Methods]
    B --> E[Tools]
    B --> F[Quality]

    C --> G[Systematic Approach]
    D --> H[Technical Practices]
    E --> I[CASE Tools & IDEs]
    F --> J[Standards & Metrics]

    A --> K{Ethical Foundation}
    K --> L[IEEE/ACM Code of Ethics]
    K --> M[Professional Responsibility]
    K --> N[Public Interest]

    L --> O[8 Principles]
    O --> P[Public]
    O --> Q[Client & Employer]
    O --> R[Product Quality]
    O --> S[Judgment & Integrity]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style K fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### The Software Engineering Manifesto
Understanding the difference between programming and engineering.

\\\`\\\`\\\`python
from dataclasses import dataclass
from enum import Enum
from typing import List

class QualityAttribute(Enum):
    RELIABILITY = "System performs correctly under stated conditions"
    MAINTAINABILITY = "Ease of modification and extension"
    EFFICIENCY = "Resource utilization vs. performance"
    USABILITY = "User experience and learnability"
    PORTABILITY = "Adaptability across environments"

@dataclass
class SoftwareProject:
    name: str
    team_size: int
    duration_months: int
    quality_goals: List[QualityAttribute]

    @property
    def needs_engineering(self) -> bool:
        """A program becomes software when it needs engineering discipline."""
        return (
            self.team_size > 1 or
            self.duration_months > 3 or
            len(self.quality_goals) > 2
        )

    def assess_risk(self) -> str:
        if not self.needs_engineering:
            return "Low risk — simple program"
        risk_score = self.team_size * self.duration_months
        if risk_score > 50:
            return "HIGH RISK — Full SE process required"
        return "MODERATE — Lightweight SE process recommended"

# Example
project = SoftwareProject(
    name="Hospital Management System",
    team_size=8,
    duration_months=12,
    quality_goals=[QualityAttribute.RELIABILITY, QualityAttribute.USABILITY, QualityAttribute.MAINTAINABILITY]
)
print(f"Needs Engineering: {project.needs_engineering}")  # True
print(f"Risk: {project.assess_risk()}")  # HIGH RISK
\\\`\\\`\\\`
`
    },
    {
        title: "System Development Life Cycles (SDLC)",
        importance: "Foundational",
        principles: [
            "SDLC: A structured framework defining phases from inception to retirement of software",
            "Core Phases: Planning → Analysis → Design → Implementation → Testing → Deployment → Maintenance",
            "Planning Phase: Feasibility study, resource estimation, risk identification, project scope definition",
            "Analysis Phase: Requirements gathering, stakeholder interviews, current system study",
            "Design Phase: Architectural design, interface design, database design, component design",
            "Implementation Phase: Coding, unit testing, integration, code reviews",
            "Testing Phase: System testing, acceptance testing, regression testing",
            "Deployment & Maintenance: Release management, bug fixes, enhancements, adaptive maintenance",
            "Ethical Impact: How ethical decision-making at each phase affects project success and stakeholder trust",
            "Feedback Loops: Each phase informs and may trigger revisiting previous phases"
        ],
        blueprint: `graph LR
    A[Planning] --> B[Analysis]
    B --> C[Design]
    C --> D[Implementation]
    D --> E[Testing]
    E --> F[Deployment]
    F --> G[Maintenance]

    G -.->|Feedback| A
    E -.->|Defects| D
    E -.->|Requirements Gap| B

    subgraph "SDLC Phases"
        A
        B
        C
        D
        E
        F
        G
    end

    style A fill:#0d1b2a,stroke:#00d4ff,stroke-width:2px
    style G fill:#1b2838,stroke:#ffd700,stroke-width:2px`,
        forge: `### SDLC Phase Tracker
A model for tracking project lifecycle with ethical checkpoints.

\\\`\\\`\\\`javascript
class SDLCPhase {
    constructor(name, deliverables, ethicalChecks) {
        this.name = name;
        this.deliverables = deliverables;
        this.ethicalChecks = ethicalChecks;
        this.status = 'pending';
    }

    complete() {
        const unmetChecks = this.ethicalChecks
            .filter(check => !check.passed);

        if (unmetChecks.length > 0) {
            console.warn(\`⚠️ Phase '\${this.name}' has unmet ethical checks:\`);
            unmetChecks.forEach(c => console.warn(\`  - \${c.description}\`));
            return false;
        }
        this.status = 'completed';
        return true;
    }
}

const phases = [
    new SDLCPhase('Planning', ['Project Charter', 'Feasibility Report'], [
        { description: 'Stakeholder impact assessment', passed: true },
        { description: 'Data privacy risk evaluation', passed: true }
    ]),
    new SDLCPhase('Analysis', ['SRS Document'], [
        { description: 'Accessibility requirements included', passed: false },
        { description: 'Security requirements defined', passed: true }
    ])
];

phases.forEach(phase => {
    const ok = phase.complete();
    console.log(\`\${phase.name}: \${ok ? '✅ Passed' : '❌ Blocked'}\`);
});
\\\`\\\`\\\`
`
    },
    {
        title: "Software Engineering Methodologies — Traditional to Agile",
        importance: "Critical",
        principles: [
            "Waterfall Model: Sequential phases with formal sign-off — best for stable, well-understood requirements",
            "V-Model: Extension of Waterfall linking each development phase to a corresponding testing phase",
            "Incremental Model: Delivers software in planned increments, each adding functionality",
            "Spiral Model: Risk-driven iterative approach combining prototyping with controlled waterfall elements",
            "Agile Manifesto: Individuals & interactions, working software, customer collaboration, responding to change",
            "Scrum: Sprint-based framework with roles (PO, SM, Dev Team), ceremonies, and artifacts",
            "Kanban: Flow-based method with WIP limits, visual boards, continuous delivery",
            "XP (Extreme Programming): Pair programming, TDD, continuous integration, collective ownership",
            "Traditional vs. Agile: Plan-driven (predictive) vs. Value-driven (adaptive) approaches",
            "Hybrid Approaches: Combining waterfall governance with agile execution (e.g., SAFe, Water-Scrum-Fall)"
        ],
        blueprint: `graph TD
    A[Methodology Selection] --> B{Requirements Stability?}

    B -->|Stable & Clear| C[Traditional]
    B -->|Evolving & Unclear| D[Agile]
    B -->|Mixed| E[Hybrid]

    C --> C1[Waterfall]
    C --> C2[V-Model]
    C --> C3[Spiral]

    D --> D1[Scrum]
    D --> D2[Kanban]
    D --> D3[XP]

    E --> E1[SAFe]
    E --> E2[Water-Scrum-Fall]

    C1 --> F[Sequential Phases]
    D1 --> G[Iterative Sprints]
    E1 --> H[Scaled Agile Cadence]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style B fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Methodology Comparison Engine
Evaluating which methodology fits a given project scenario.

\\\`\\\`\\\`python
from dataclasses import dataclass
from typing import Literal

@dataclass
class ProjectContext:
    requirements_stability: Literal["stable", "evolving", "unknown"]
    team_size: int
    deadline_pressure: Literal["low", "medium", "high"]
    customer_availability: Literal["low", "medium", "high"]
    risk_tolerance: Literal["low", "medium", "high"]

def recommend_methodology(ctx: ProjectContext) -> str:
    score = {"waterfall": 0, "scrum": 0, "kanban": 0, "spiral": 0, "hybrid": 0}

    if ctx.requirements_stability == "stable":
        score["waterfall"] += 3
        score["spiral"] += 1
    elif ctx.requirements_stability == "evolving":
        score["scrum"] += 3
        score["kanban"] += 2
    else:
        score["spiral"] += 3

    if ctx.team_size <= 9:
        score["scrum"] += 2
        score["kanban"] += 2
    else:
        score["hybrid"] += 3

    if ctx.customer_availability == "high":
        score["scrum"] += 2
        score["kanban"] += 1
    else:
        score["waterfall"] += 2

    if ctx.risk_tolerance == "low":
        score["spiral"] += 2
        score["waterfall"] += 1

    best = max(score, key=score.get)
    return f"Recommended: {best.upper()} (score: {score[best]})"

# Example: Startup with changing requirements
startup = ProjectContext(
    requirements_stability="evolving",
    team_size=5,
    deadline_pressure="high",
    customer_availability="high",
    risk_tolerance="medium"
)
print(recommend_methodology(startup))  # Recommended: SCRUM
\\\`\\\`\\\`
`
    },
    {
        title: "Evaluating & Selecting Methodologies",
        importance: "Critical",
        principles: [
            "Selection Criteria: Project size, complexity, requirements clarity, team experience, stakeholder involvement",
            "Trade-off Analysis: Speed vs. quality, flexibility vs. predictability, documentation vs. communication",
            "Context Sensitivity: No methodology is universally superior — fitness depends on project context",
            "Case Study Analysis: Evaluating real-world projects to identify methodology mismatches and their consequences",
            "Ethical Methodology Application: Long-term consequences of cutting corners in process selection",
            "Regulatory Constraints: Some domains (medical, aviation, finance) mandate specific process rigor",
            "Team Dynamics: Methodology must match team culture, skill level, and geographic distribution",
            "Continuous Improvement: Retrospectives and process adaptation based on empirical data"
        ],
        blueprint: `graph TD
    A[Project Characteristics] --> B[Decision Matrix]

    B --> C{Team Size}
    B --> D{Requirements}
    B --> E{Domain Risk}
    B --> F{Timeline}

    C -->|Small < 10| G[Agile-friendly]
    C -->|Large > 50| H[Scaled Framework]

    D -->|Fixed| I[Plan-driven]
    D -->|Volatile| J[Adaptive]

    E -->|Safety-critical| K[V-Model / Spiral]
    E -->|Standard| L[Any]

    G & J --> M[Scrum / XP]
    H & I --> N[Waterfall / SAFe]
    K --> O[V-Model + Reviews]

    style B fill:#1a1a2e,stroke:#ffd700,stroke-width:3px`,
        forge: `### Methodology Decision Matrix
A weighted scoring system for selecting the right methodology.

\\\`\\\`\\\`javascript
const METHODOLOGIES = ['Waterfall', 'Scrum', 'Kanban', 'Spiral', 'XP', 'SAFe'];

const CRITERIA = {
    requirementsClarity:  { weight: 0.25, scores: [5, 2, 2, 3, 2, 3] },
    teamSize:             { weight: 0.15, scores: [4, 5, 5, 3, 5, 2] },
    customerInvolvement:  { weight: 0.20, scores: [2, 5, 4, 3, 5, 4] },
    riskLevel:            { weight: 0.20, scores: [3, 3, 2, 5, 3, 4] },
    timeToMarket:         { weight: 0.20, scores: [2, 4, 5, 2, 4, 3] }
};

function evaluateMethodologies() {
    const results = METHODOLOGIES.map((name, i) => {
        const total = Object.values(CRITERIA).reduce((sum, criterion) => {
            return sum + (criterion.scores[i] * criterion.weight);
        }, 0);
        return { name, score: total.toFixed(2) };
    });

    results.sort((a, b) => b.score - a.score);
    console.log("\\n📊 Methodology Ranking:");
    results.forEach((r, i) =>
        console.log(\`  \${i + 1}. \${r.name}: \${r.score}\`)
    );
    return results[0];
}

const best = evaluateMethodologies();
console.log(\`\\n✅ Recommendation: \${best.name}\`);
\\\`\\\`\\\`
`,
        dilemma: {
            scenario: "Your client demands a fixed-price, fixed-scope contract for a complex system with vague requirements. They insist on Waterfall because 'it has clear milestones.' You know from experience this will likely lead to scope creep, late changes, and budget overruns. What do you do?",
            options: [
                {
                    label: "Accept Waterfall (Client knows best)",
                    alignment: "Client Deference",
                    feedback: "You chose **Client Deference**. While respecting client wishes is important, as a professional you have an ethical obligation to advise against approaches likely to fail. Accepting a doomed process is not serving the client's true interests."
                },
                {
                    label: "Propose Agile with milestone checkpoints",
                    alignment: "Professional Advisory",
                    feedback: "You chose the **Professional Advisory** path. By proposing Agile with structured checkpoints (sprint reviews as milestones), you balance the client's need for predictability with the reality of evolving requirements. This demonstrates ethical professional responsibility."
                },
                {
                    label: "Refuse the project",
                    alignment: "Risk Aversion",
                    feedback: "You chose **Risk Aversion**. Walking away from a project you believe will fail protects your integrity. However, you could also explore hybrid approaches that address both concerns before refusing outright."
                }
            ]
        }
    },
    {
        title: "Software Requirements Process & Feasibility Study",
        importance: "Critical",
        principles: [
            "Requirements Engineering: Systematic process of eliciting, analyzing, specifying, and validating requirements",
            "Requirements Process Activities: Elicitation → Analysis → Specification → Validation → Management",
            "Feasibility Study: Technical, economic, operational, legal, and schedule feasibility assessment",
            "Technical Feasibility: Can the system be built with available technology and expertise?",
            "Economic Feasibility: Cost-benefit analysis — will the investment generate sufficient ROI?",
            "Operational Feasibility: Will the system be used effectively within the organization?",
            "Stakeholder Identification: Categorize actors by influence, interest, and impact on the project",
            "Requirements Traceability: Linking requirements to their source and downstream artifacts"
        ],
        blueprint: `graph TD
    A[Project Idea] --> B{Feasibility Study}

    B --> C[Technical]
    B --> D[Economic]
    B --> E[Operational]
    B --> F[Legal]
    B --> G[Schedule]

    C -->|Can we build it?| H{Feasible?}
    D -->|Is it worth it?| H
    E -->|Will they use it?| H
    F -->|Is it legal?| H
    G -->|Can we deliver on time?| H

    H -->|Yes to All| I[Proceed to Requirements]
    H -->|No| J[Reassess or Cancel]

    I --> K[Elicitation]
    K --> L[Analysis]
    L --> M[Specification]
    M --> N[Validation]
    N -.->|Issues Found| K

    style B fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style H fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Feasibility Assessment Framework
Evaluating project viability across multiple dimensions.

\\\`\\\`\\\`python
from dataclasses import dataclass
from typing import Dict

@dataclass
class FeasibilityDimension:
    name: str
    score: float  # 0.0 to 1.0
    risks: list
    justification: str

class FeasibilityStudy:
    def __init__(self, project_name: str):
        self.project_name = project_name
        self.dimensions: Dict[str, FeasibilityDimension] = {}

    def add_dimension(self, dim: FeasibilityDimension):
        self.dimensions[dim.name] = dim

    def overall_score(self) -> float:
        weights = {
            "Technical": 0.30,
            "Economic": 0.25,
            "Operational": 0.20,
            "Legal": 0.15,
            "Schedule": 0.10,
        }
        return sum(
            self.dimensions[name].score * weights.get(name, 0.2)
            for name in self.dimensions
        )

    def verdict(self) -> str:
        score = self.overall_score()
        if score >= 0.7:
            return f"✅ GO — Score: {score:.2f}"
        elif score >= 0.5:
            return f"⚠️ CONDITIONAL — Score: {score:.2f}"
        return f"❌ NO-GO — Score: {score:.2f}"

study = FeasibilityStudy("Student Portal v2")
study.add_dimension(FeasibilityDimension("Technical", 0.85, [], "Team has React/Node expertise"))
study.add_dimension(FeasibilityDimension("Economic", 0.70, ["Budget tight"], "ROI in 18 months"))
study.add_dimension(FeasibilityDimension("Operational", 0.90, [], "Staff training planned"))
study.add_dimension(FeasibilityDimension("Legal", 0.95, [], "GDPR compliant"))
study.add_dimension(FeasibilityDimension("Schedule", 0.60, ["Deadline risk"], "6-month window"))

print(study.verdict())  # ✅ GO — Score: 0.81
\\\`\\\`\\\`
`
    },
    {
        title: "Software Requirements Elicitation Techniques",
        importance: "Critical",
        principles: [
            "Functional Requirements: What the system should DO — features, operations, behaviors",
            "Non-Functional Requirements: HOW the system should behave — performance, security, usability, scalability",
            "Domain Requirements: Constraints from the application domain (regulations, industry standards)",
            "Elicitation Techniques: Interviews, questionnaires, observation, document analysis, prototyping, workshops",
            "Interviews: Structured (predefined questions) vs. Unstructured (open-ended exploration)",
            "Workshops/JAD Sessions: Collaborative sessions with all stakeholders for consensus building",
            "Prototyping: Building throwaway or evolutionary prototypes to discover hidden requirements",
            "Observation/Ethnography: Watching users in their natural environment to uncover implicit needs",
            "Technique Selection: Match technique to stakeholder type, project phase, and requirement complexity"
        ],
        blueprint: `graph TD
    A[Stakeholders] --> B{Elicitation Techniques}

    B --> C[Interviews]
    B --> D[Questionnaires]
    B --> E[Observation]
    B --> F[Prototyping]
    B --> G[Workshops]
    B --> H[Document Analysis]

    C --> I[Structured]
    C --> J[Unstructured]

    I & J & D & E & F & G & H --> K[Raw Requirements]

    K --> L{Classification}
    L --> M[Functional]
    L --> N[Non-Functional]
    L --> O[Domain]

    M & N & O --> P[Requirements Document]

    style B fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style L fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Requirements Classification Engine
Automating the categorization of raw requirements.

\\\`\\\`\\\`javascript
const REQUIREMENT_TYPES = {
    FUNCTIONAL: {
        keywords: ['shall', 'must', 'allow', 'enable', 'provide', 'display', 'calculate'],
        description: 'What the system does'
    },
    NON_FUNCTIONAL: {
        keywords: ['performance', 'security', 'usability', 'availability', 'scalable', 'response time', 'within'],
        description: 'How the system behaves'
    },
    DOMAIN: {
        keywords: ['regulation', 'compliance', 'standard', 'GDPR', 'HIPAA', 'ISO', 'policy'],
        description: 'Domain-specific constraints'
    }
};

function classifyRequirement(text) {
    const lower = text.toLowerCase();
    const scores = {};

    for (const [type, config] of Object.entries(REQUIREMENT_TYPES)) {
        scores[type] = config.keywords.filter(kw => lower.includes(kw)).length;
    }

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return { text, type: best[0], confidence: best[1] > 0 ? 'high' : 'low' };
}

// Example requirements
const requirements = [
    "The system shall allow users to register with email and password",
    "The system must respond to queries within 2 seconds",
    "All patient data must comply with HIPAA regulations",
    "The system shall generate monthly sales reports"
];

requirements.forEach(req => {
    const result = classifyRequirement(req);
    console.log(\`[\${result.type}] \${result.text}\`);
});
\\\`\\\`\\\`
`
    },
    {
        title: "Software Requirements Analysis with UML — Use Cases & Sequence Diagrams",
        importance: "Advanced",
        principles: [
            "UML (Unified Modeling Language): Standardized visual language for modeling software systems",
            "Use Case Diagram: Shows system boundary, actors, use cases, and relationships (include, extend, generalization)",
            "Actor: An external entity (person, system, device) that interacts with the system",
            "Use Case: A unit of functionality the system provides — described from the actor's perspective",
            "Relationships: <<include>> (mandatory sub-behavior), <<extend>> (optional/conditional behavior), generalization",
            "Use Case Description: Preconditions, main flow, alternative flows, postconditions, exceptions",
            "System Sequence Diagram (SSD): Shows temporal interaction between actor and system for a specific use case",
            "SSD Elements: Actor lifeline, system lifeline, messages (requests/responses), activation bars",
            "From Use Case to SSD: Each step in the use case main flow becomes a message in the sequence diagram"
        ],
        blueprint: `graph TD
    A[Use Case Diagram] --> B[Identify Actors]
    A --> C[Define Use Cases]
    A --> D[Establish Relationships]

    B --> E[Primary Actors]
    B --> F[Secondary Actors]

    C --> G[Core Flows]
    C --> H[Edge Cases]

    D --> I["<<include>>"]
    D --> J["<<extend>>"]
    D --> K[Generalization]

    G --> L[Use Case Description]
    L --> M[Preconditions]
    L --> N[Main Flow Steps]
    L --> O[Alternative Flows]
    L --> P[Postconditions]

    N --> Q[System Sequence Diagram]
    Q --> R[Actor Messages]
    Q --> S[System Responses]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style Q fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Use Case to Sequence Diagram Mapping
Translating use case flows into system interactions.

\\\`\\\`\\\`python
from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class UseCaseStep:
    step_number: int
    actor_action: str
    system_response: str

@dataclass
class UseCase:
    name: str
    primary_actor: str
    preconditions: List[str]
    main_flow: List[UseCaseStep]
    postconditions: List[str]
    includes: List[str] = field(default_factory=list)
    extends: List[str] = field(default_factory=list)

    def to_sequence_messages(self) -> List[str]:
        """Convert main flow to SSD messages."""
        messages = []
        for step in self.main_flow:
            messages.append(f"{self.primary_actor} -> System: {step.actor_action}")
            messages.append(f"System -> {self.primary_actor}: {step.system_response}")
        return messages

# Example: Login Use Case
login_uc = UseCase(
    name="Login",
    primary_actor="Student",
    preconditions=["Student has a registered account", "System is available"],
    main_flow=[
        UseCaseStep(1, "Enter credentials", "Validate credentials"),
        UseCaseStep(2, "Submit login", "Grant access and display dashboard"),
    ],
    postconditions=["Student is authenticated", "Session is created"],
    includes=["Validate Credentials"]
)

print(f"Use Case: {login_uc.name}")
print(f"Actor: {login_uc.primary_actor}")
print("\\nSequence Diagram Messages:")
for msg in login_uc.to_sequence_messages():
    print(f"  {msg}")
\\\`\\\`\\\`
`
    },
    {
        title: "Software Requirements Specification with UML — Package & Class Diagrams",
        importance: "Advanced",
        principles: [
            "Package Diagram: Organizes model elements into logical groupings (namespaces/modules)",
            "Package Dependencies: Shows which packages depend on which — reveals coupling",
            "Domain Class Diagram: Models the problem domain's key concepts and their relationships",
            "Class Elements: Class name, attributes (data), operations (behavior)",
            "Relationships: Association, aggregation, composition, generalization/inheritance, dependency",
            "Multiplicity: Cardinality constraints (1, 0..1, 1..*, 0..*) defining how many instances can be related",
            "Association vs. Aggregation vs. Composition: Varying strengths of 'has-a' relationships",
            "Generalization: 'is-a' relationship — subclass inherits from superclass",
            "Domain Modeling: Identify key concepts from requirements, define attributes, and link via relationships"
        ],
        blueprint: `graph TD
    A[Domain Analysis] --> B[Identify Key Concepts]
    B --> C[Define Attributes]
    B --> D[Define Relationships]

    D --> E[Association]
    D --> F[Aggregation]
    D --> G[Composition]
    D --> H[Generalization]

    E --> I["Student --- Course (enrolls)"]
    F --> J["Department ◇--- Professor"]
    G --> K["Order ◆--- OrderItem"]
    H --> L["Person ←── Student"]

    C --> M[Multiplicity]
    M --> N["1 to 1..* (mandatory)"]
    M --> O["0..* to 0..* (optional)"]

    subgraph "Package Structure"
        P[UI Package] --> Q[Business Logic]
        Q --> R[Data Access]
    end

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px`,
        forge: `### Domain Class Model Builder
Modeling entity relationships from requirements text.

\\\`\\\`\\\`javascript
class DomainClass {
    constructor(name, attributes = [], operations = []) {
        this.name = name;
        this.attributes = attributes;
        this.operations = operations;
        this.relationships = [];
    }

    addRelationship(type, target, multiplicity) {
        this.relationships.push({ type, target: target.name, multiplicity });
    }

    describe() {
        console.log(\`\\n📦 Class: \${this.name}\`);
        console.log(\`  Attributes: \${this.attributes.join(', ')}\`);
        console.log(\`  Operations: \${this.operations.join(', ')}\`);
        this.relationships.forEach(r =>
            console.log(\`  \${r.type} → \${r.target} [\${r.multiplicity}]\`)
        );
    }
}

// Domain Model for University System
const student  = new DomainClass('Student', ['id', 'name', 'gpa'], ['enroll()', 'graduate()']);
const course   = new DomainClass('Course', ['code', 'title', 'credits'], ['addStudent()', 'getCapacity()']);
const section  = new DomainClass('Section', ['sectionNo', 'semester', 'room'], ['getSchedule()']);
const professor = new DomainClass('Professor', ['id', 'name', 'rank'], ['teach()', 'grade()']);

student.addRelationship('Association', course, '0..*');
course.addRelationship('Composition', section, '1..*');
professor.addRelationship('Association', section, '1..*');

[student, course, section, professor].forEach(c => c.describe());
\\\`\\\`\\\`
`
    },
    {
        title: "SRS Document & Requirements Validation",
        importance: "Advanced",
        principles: [
            "SRS (Software Requirements Specification): Formal document describing what the system shall do",
            "IEEE 830 Standard: Industry standard for SRS structure — introduction, overall description, specific requirements",
            "SRS Sections: Purpose, scope, definitions, functional requirements, non-functional requirements, constraints, interfaces",
            "Good Requirements: SMART — Specific, Measurable, Achievable, Relevant, Traceable",
            "Testable Requirements: Each requirement must have a verifiable acceptance criterion",
            "Feasibility Integration: SRS incorporates feasibility study results to ground requirements in reality",
            "Validation Techniques: Reviews, walkthroughs, inspections, prototyping, test-case generation",
            "Requirements Reviews: Formal peer review process to detect defects, ambiguities, and inconsistencies",
            "Prototyping for Validation: Building throwaway prototypes to confirm requirements with stakeholders",
            "Traceability Matrix: Mapping each requirement to design, code, and test artifacts"
        ],
        blueprint: `graph TD
    A[SRS Document] --> B[Structure]
    B --> C[Introduction]
    B --> D[Overall Description]
    B --> E[Specific Requirements]
    B --> F[Appendices]

    E --> G[Functional]
    E --> H[Non-Functional]
    E --> I[Interface]
    E --> J[Constraints]

    A --> K{Validation}
    K --> L[Review & Inspection]
    K --> M[Prototyping]
    K --> N[Test-Case Generation]
    K --> O[Traceability Check]

    L --> P{Issues Found?}
    P -->|Yes| Q[Revise SRS]
    Q --> K
    P -->|No| R[Baseline SRS]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style K fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Requirements Quality Checker
Validating requirements against SMART criteria.

\\\`\\\`\\\`python
import re
from dataclasses import dataclass
from typing import List

@dataclass
class Requirement:
    id: str
    text: str
    acceptance_criteria: str = ""

class RequirementValidator:
    VAGUE_WORDS = ['fast', 'efficient', 'user-friendly', 'easy', 'flexible',
                   'robust', 'appropriate', 'good', 'better', 'nice']
    MEASURABLE_PATTERNS = [
        r'\\d+\\s*(seconds?|ms|%|users?|MB|GB|requests?)',
        r'within\\s+\\d+',
        r'at least\\s+\\d+',
        r'no more than\\s+\\d+'
    ]

    @staticmethod
    def check_specific(req: Requirement) -> bool:
        lower = req.text.lower()
        return not any(word in lower for word in RequirementValidator.VAGUE_WORDS)

    @staticmethod
    def check_measurable(req: Requirement) -> bool:
        return any(re.search(p, req.text) for p in RequirementValidator.MEASURABLE_PATTERNS)

    @staticmethod
    def check_testable(req: Requirement) -> bool:
        return len(req.acceptance_criteria.strip()) > 10

    @classmethod
    def validate(cls, req: Requirement) -> dict:
        return {
            'id': req.id,
            'specific': cls.check_specific(req),
            'measurable': cls.check_measurable(req),
            'testable': cls.check_testable(req),
        }

# Validate sample requirements
reqs = [
    Requirement("FR-01", "The system shall authenticate users within 2 seconds",
                "Login with valid credentials completes in < 2s"),
    Requirement("FR-02", "The system should be user-friendly",
                ""),
    Requirement("NFR-01", "The system shall support at least 1000 concurrent users",
                "Load test with 1000 simulated users shows no errors"),
]

for req in reqs:
    result = RequirementValidator.validate(req)
    status = "✅" if all([result['specific'], result['measurable'], result['testable']]) else "❌"
    print(f"{status} [{result['id']}] Specific:{result['specific']} Measurable:{result['measurable']} Testable:{result['testable']}")
\\\`\\\`\\\`
`
    },
    {
        title: "Architectural Design — Principles & Styles",
        importance: "Expert",
        principles: [
            "Software Architecture: High-level structure of a system — components, connectors, and their configurations",
            "Quality Attributes: Performance, security, availability, modifiability, scalability, testability",
            "Modularity: Decomposing systems into cohesive, loosely coupled modules with clear interfaces",
            "Separation of Concerns: Each module addresses a distinct aspect of the system's functionality",
            "Loose Coupling: Minimize dependencies between modules — changes in one shouldn't cascade",
            "High Cohesion: Elements within a module should be strongly related and serve a single purpose",
            "Architectural Styles: Layered, Client-Server, Microservices, Event-Driven, Pipe-and-Filter, MVC",
            "Layered Architecture: Presentation → Business Logic → Data Access — clear dependency direction",
            "Microservices: Independent, deployable services communicating via APIs — scalability and autonomy",
            "Event-Driven Architecture: Components react to events asynchronously — decoupled and responsive"
        ],
        blueprint: `graph TD
    A[Architectural Decision] --> B{Quality Attributes}

    B --> C[Performance]
    B --> D[Security]
    B --> E[Scalability]
    B --> F[Maintainability]

    A --> G{Styles}
    G --> H[Layered]
    G --> I[Microservices]
    G --> J[Event-Driven]
    G --> K[MVC]

    H --> L["Presentation → Logic → Data"]
    I --> M["Service A ↔ API Gateway ↔ Service B"]
    J --> N["Producer → Event Bus → Consumer"]
    K --> O["Model ↔ View ↔ Controller"]

    subgraph "Design Principles"
        P[Modularity]
        Q[Separation of Concerns]
        R[Loose Coupling]
        S[High Cohesion]
    end

    P & Q & R & S --> G

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style B fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Architectural Style Evaluator
Matching quality attributes to architectural styles.

\\\`\\\`\\\`python
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class ArchStyle:
    name: str
    strengths: Dict[str, int]  # quality attribute -> score (1-5)
    tradeoffs: List[str]

STYLES = [
    ArchStyle("Layered", {
        "maintainability": 5, "testability": 4, "performance": 2, "scalability": 2
    }, ["Performance overhead from layer traversal", "Can become rigid"]),

    ArchStyle("Microservices", {
        "scalability": 5, "deployability": 5, "performance": 3, "maintainability": 3
    }, ["Operational complexity", "Network latency", "Data consistency challenges"]),

    ArchStyle("Event-Driven", {
        "scalability": 5, "responsiveness": 5, "decoupling": 5, "testability": 2
    }, ["Debugging difficulty", "Eventual consistency", "Event ordering"]),

    ArchStyle("MVC", {
        "separation_of_concerns": 5, "testability": 4, "maintainability": 4, "scalability": 2
    }, ["Controller bloat", "Tight coupling between V and C"])
]

def recommend_architecture(priorities: Dict[str, int]) -> str:
    scores = {}
    for style in STYLES:
        score = sum(
            style.strengths.get(attr, 0) * weight
            for attr, weight in priorities.items()
        )
        scores[style.name] = score

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    print("🏗️ Architecture Ranking:")
    for name, score in ranked:
        style = next(s for s in STYLES if s.name == name)
        print(f"  {name}: {score} pts")
        print(f"    ⚠️ Tradeoffs: {', '.join(style.tradeoffs[:2])}")

    return ranked[0][0]

# Example: E-commerce platform priorities
best = recommend_architecture({
    "scalability": 5,
    "performance": 4,
    "maintainability": 3,
    "deployability": 4
})
print(f"\\n✅ Recommended: {best}")
\\\`\\\`\\\`
`
    },
    {
        title: "Architectural Design — Trade-offs & Modeling",
        importance: "Expert",
        principles: [
            "Architecture Trade-off Analysis Method (ATAM): Systematic evaluation of architecture against quality goals",
            "Trade-off Points: Where achieving one quality attribute negatively impacts another",
            "Sensitivity Points: Architectural decisions that significantly affect a single quality attribute",
            "Risk Analysis: Identifying architectural decisions that may lead to future problems",
            "Architecture Documentation: Views (logical, process, development, physical) + scenarios (4+1 model)",
            "Component Diagram: High-level view of system components and their interfaces",
            "Deployment Diagram: Mapping software components to hardware infrastructure",
            "ADR (Architecture Decision Records): Documenting the context, decision, and consequences of key choices",
            "Evolutionary Architecture: Designing for change — fitness functions that guard quality attributes over time"
        ],
        blueprint: `graph TD
    A[Architecture Evaluation] --> B[ATAM Process]

    B --> C[Present Architecture]
    C --> D[Identify Quality Goals]
    D --> E[Generate Scenarios]
    E --> F[Analyze Against Architecture]
    F --> G{Decision Points}

    G --> H[Sensitivity Points]
    G --> I[Trade-off Points]
    G --> J[Risk Points]

    H --> K["🎯 High impact on single attribute"]
    I --> L["⚖️ Attribute conflict zone"]
    J --> M["⚠️ Potential future failures"]

    A --> N[Documentation]
    N --> O["4+1 View Model"]
    O --> P[Logical View]
    O --> Q[Process View]
    O --> R[Development View]
    O --> S[Physical View]
    O --> T[Scenarios]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style G fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Architecture Decision Record (ADR) Generator
Documenting architectural choices with context and consequences.

\\\`\\\`\\\`javascript
class ArchitectureDecisionRecord {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.date = new Date().toISOString().split('T')[0];
        this.status = 'Proposed'; // Proposed → Accepted → Deprecated → Superseded
        this.context = '';
        this.decision = '';
        this.consequences = { positive: [], negative: [], risks: [] };
        this.alternatives = [];
    }

    addAlternative(name, prosConsMap) {
        this.alternatives.push({ name, ...prosConsMap });
    }

    toMarkdown() {
        return \`
# ADR-\${this.id}: \${this.title}
**Date:** \${this.date} | **Status:** \${this.status}

## Context
\${this.context}

## Decision
\${this.decision}

## Alternatives Considered
\${this.alternatives.map(a =>
    \`- **\${a.name}**: Pros: \${a.pros.join(', ')} | Cons: \${a.cons.join(', ')}\`
).join('\\n')}

## Consequences
### Positive
\${this.consequences.positive.map(p => \`- \${p}\`).join('\\n')}
### Negative
\${this.consequences.negative.map(n => \`- \${n}\`).join('\\n')}
### Risks
\${this.consequences.risks.map(r => \`- \${r}\`).join('\\n')}
\`;
    }
}

const adr = new ArchitectureDecisionRecord(1, 'Adopt Microservices Architecture');
adr.context = 'Current monolith cannot scale to handle 10x user growth.';
adr.decision = 'Decompose the monolith into domain-bounded microservices.';
adr.addAlternative('Stay Monolith', {
    pros: ['Simple deployment', 'No distributed complexity'],
    cons: ['Cannot scale independently', 'Single point of failure']
});
adr.addAlternative('Serverless', {
    pros: ['Zero infrastructure management', 'Pay per use'],
    cons: ['Vendor lock-in', 'Cold start latency']
});
adr.consequences.positive = ['Independent scaling per service', 'Team autonomy'];
adr.consequences.negative = ['Increased operational complexity', 'Network latency'];
adr.consequences.risks = ['Data consistency across services', 'Service discovery failures'];

console.log(adr.toMarkdown());
\\\`\\\`\\\`
`
    },
    {
        title: "Software Construction & Quality",
        importance: "Critical",
        principles: [
            "Programming Paradigms: Procedural, Object-Oriented, Functional, Event-Driven — each with distinct strengths",
            "Procedural: Sequential execution, functions, global/local state — suited for scripts and linear processes",
            "Object-Oriented: Encapsulation, inheritance, polymorphism — models real-world entities and relationships",
            "Functional: Pure functions, immutability, higher-order functions — predictable, testable, parallelizable",
            "Code Quality: Readability, simplicity, consistency, DRY (Don't Repeat Yourself), KISS, YAGNI",
            "Code Smells: Long methods, large classes, duplicate code, feature envy, data clumps, primitive obsession",
            "Refactoring: Restructuring existing code without changing behavior — Extract Method, Rename, Move, etc.",
            "Ethical Programming: Avoiding plagiarism, respecting intellectual property, writing secure code",
            "Secure Coding: Input validation, SQL injection prevention, XSS protection, proper authentication",
            "Code Reviews: Peer review process for quality, knowledge sharing, and catching defects early"
        ],
        blueprint: `graph TD
    A[Software Construction] --> B{Paradigm Selection}

    B --> C[Procedural]
    B --> D[Object-Oriented]
    B --> E[Functional]

    C --> F["Functions + Sequential logic"]
    D --> G["Classes + Encapsulation"]
    E --> H["Pure functions + Immutability"]

    A --> I{Quality Practices}
    I --> J[Clean Code]
    I --> K[Refactoring]
    I --> L[Code Reviews]
    I --> M[Secure Coding]

    J --> N[DRY / KISS / YAGNI]
    K --> O[Eliminate Code Smells]
    L --> P[Peer Review Checklist]
    M --> Q[OWASP Top 10]

    O --> R["Long Method → Extract Method"]
    O --> S["Duplicate Code → Template Method"]
    O --> T["Feature Envy → Move Method"]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style I fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Code Smell Detector
Identifying and refactoring common code quality issues.

\\\`\\\`\\\`javascript
class CodeSmellDetector {
    static SMELLS = {
        longMethod: { threshold: 20, description: 'Method exceeds line limit' },
        duplicateCode: { threshold: 3, description: 'Similar blocks repeated' },
        largeClass: { threshold: 300, description: 'Class has too many responsibilities' },
        deepNesting: { threshold: 3, description: 'Excessive conditional nesting' }
    };

    static analyze(codeMetrics) {
        const issues = [];

        if (codeMetrics.methodLines > this.SMELLS.longMethod.threshold) {
            issues.push({
                smell: 'Long Method',
                severity: 'medium',
                refactoring: 'Extract Method — Break into smaller, named functions',
                lines: codeMetrics.methodLines
            });
        }

        if (codeMetrics.duplicateBlocks > this.SMELLS.duplicateCode.threshold) {
            issues.push({
                smell: 'Duplicate Code',
                severity: 'high',
                refactoring: 'Extract common logic into shared utility or base class',
                count: codeMetrics.duplicateBlocks
            });
        }

        if (codeMetrics.nestingDepth > this.SMELLS.deepNesting.threshold) {
            issues.push({
                smell: 'Deep Nesting',
                severity: 'medium',
                refactoring: 'Use early returns (guard clauses) or Strategy pattern',
                depth: codeMetrics.nestingDepth
            });
        }

        return issues;
    }
}

const metrics = { methodLines: 45, duplicateBlocks: 5, nestingDepth: 4, classLines: 150 };
const smells = CodeSmellDetector.analyze(metrics);

console.log('🔍 Code Smell Report:');
smells.forEach(s => {
    console.log(\`  ⚠️ \${s.smell} [Severity: \${s.severity}]\`);
    console.log(\`     Fix: \${s.refactoring}\`);
});
\\\`\\\`\\\`
`,
        dilemma: {
            scenario: "You're under deadline pressure and find a Stack Overflow answer that perfectly solves your complex algorithm. The license says 'CC BY-SA' but your company's codebase is proprietary. A colleague says: 'Just copy it, nobody checks licenses.' What do you do?",
            options: [
                {
                    label: "Copy it directly (Deadline first)",
                    alignment: "Pragmatic Shortcut",
                    feedback: "You chose **Pragmatic Shortcut**. This violates the CC BY-SA license terms, which require attribution and share-alike. Even if 'nobody checks,' this is intellectual property theft and could expose your company to legal liability. It also sets a dangerous precedent."
                },
                {
                    label: "Use it with attribution and note the license",
                    alignment: "Ethical Compliance",
                    feedback: "You chose **Ethical Compliance**. By attributing the source and documenting the license, you respect intellectual property while solving the problem. However, you should also check if CC BY-SA is compatible with your proprietary codebase — it may require your code to also be shared under the same license."
                },
                {
                    label: "Understand the approach and rewrite from scratch",
                    alignment: "Clean Room Implementation",
                    feedback: "You chose **Clean Room Implementation**. By understanding the concept and writing original code, you avoid all licensing issues. This takes more time but is the safest approach for proprietary software. It also ensures you truly understand the solution."
                }
            ]
        }
    },
    {
        title: "Software Testing",
        importance: "Critical",
        principles: [
            "Testing Purpose: Finding defects, building confidence, verifying requirements, preventing regression",
            "Testing Levels: Unit → Integration → System → Acceptance — each level tests at different granularity",
            "Unit Testing: Testing individual functions/methods in isolation — fast, automated, developer-written",
            "Integration Testing: Testing interactions between components — API contracts, data flow, error handling",
            "System Testing: Testing the complete system against requirements — functional and non-functional",
            "Acceptance Testing: UAT (User Acceptance Testing) — stakeholders verify the system meets their needs",
            "Test Case Design: Derived from use cases — each main flow and alternative flow becomes test scenarios",
            "Black-box vs. White-box: Testing from external behavior vs. internal structure knowledge",
            "Regression Testing: Re-running tests after changes to ensure nothing is broken",
            "Test-Driven Development (TDD): Write failing test → Write code to pass → Refactor — Red-Green-Refactor"
        ],
        blueprint: `graph TD
    A[Testing Strategy] --> B{Testing Levels}

    B --> C[Unit Tests]
    B --> D[Integration Tests]
    B --> E[System Tests]
    B --> F[Acceptance Tests]

    C --> G["Individual functions/methods"]
    D --> H["Component interactions"]
    E --> I["Full system vs. SRS"]
    F --> J["User validation"]

    A --> K{Approaches}
    K --> L[Black-box]
    K --> M[White-box]
    K --> N[Grey-box]

    L --> O["Equivalence Partitioning"]
    L --> P["Boundary Value Analysis"]
    M --> Q["Statement Coverage"]
    M --> R["Branch Coverage"]

    A --> S{From Use Cases}
    S --> T[Main Flow → Happy Path]
    S --> U[Alt Flow → Edge Cases]
    S --> V[Exception → Error Handling]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style B fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Test Case Generator from Use Cases
Deriving test scenarios from use case descriptions.

\\\`\\\`\\\`python
from dataclasses import dataclass, field
from typing import List

@dataclass
class TestCase:
    id: str
    name: str
    preconditions: str
    steps: List[str]
    expected_result: str
    priority: str  # Critical, High, Medium, Low

@dataclass
class UseCaseFlow:
    name: str
    steps: List[str]
    flow_type: str  # main, alternative, exception

class TestCaseGenerator:
    def __init__(self, use_case_name: str):
        self.use_case = use_case_name
        self.counter = 0

    def generate_from_flow(self, flow: UseCaseFlow) -> TestCase:
        self.counter += 1
        priority_map = {
            "main": "Critical",
            "alternative": "High",
            "exception": "Medium"
        }
        return TestCase(
            id=f"TC-{self.use_case[:3].upper()}-{self.counter:03d}",
            name=f"Test {flow.name}",
            preconditions="System is running and user is on login page",
            steps=flow.steps,
            expected_result=f"System handles {flow.flow_type} flow correctly",
            priority=priority_map.get(flow.flow_type, "Low")
        )

gen = TestCaseGenerator("Login")
flows = [
    UseCaseFlow("Valid Login", ["Enter valid email", "Enter valid password", "Click submit"], "main"),
    UseCaseFlow("Invalid Password", ["Enter valid email", "Enter wrong password", "Click submit"], "alternative"),
    UseCaseFlow("Empty Fields", ["Leave fields empty", "Click submit"], "exception"),
    UseCaseFlow("Account Locked", ["Enter locked account email", "Enter password", "Click submit"], "exception"),
]

print("📋 Generated Test Cases:")
for flow in flows:
    tc = gen.generate_from_flow(flow)
    print(f"  [{tc.priority}] {tc.id}: {tc.name}")
    print(f"    Steps: {' → '.join(tc.steps)}")
    print(f"    Expected: {tc.expected_result}\\n")
\\\`\\\`\\\`
`
    },
    {
        title: "Project Presentation & Integration",
        importance: "Foundational",
        principles: [
            "Project Integration: Combining all SE artifacts — SRS, architecture, code, tests — into a coherent deliverable",
            "Presentation Skills: Clear communication of technical decisions to diverse audiences",
            "Demo Preparation: Working prototype demonstrating key use cases with live validation",
            "Lessons Learned: Reflecting on what worked, what didn't, and what you would do differently",
            "Team Collaboration: Effective task division, version control (Git), code reviews, and conflict resolution",
            "Process Retrospective: Evaluating the chosen methodology's fitness for the project in hindsight",
            "Documentation Package: README, user guide, API docs, deployment instructions, architectural diagrams",
            "Professional Communication: Structuring presentations with problem → approach → solution → results → future work"
        ],
        blueprint: `graph TD
    A[Project Deliverables] --> B[Documentation]
    A --> C[Working Software]
    A --> D[Presentation]

    B --> E[SRS Document]
    B --> F[Architecture Docs]
    B --> G[Test Reports]
    B --> H[User Guide]

    C --> I[Source Code]
    C --> J[Deployed Demo]
    C --> K[Test Suite]

    D --> L[Problem Statement]
    D --> M[Methodology & Process]
    D --> N[Architecture & Design]
    D --> O[Live Demo]
    D --> P[Lessons Learned]

    A --> Q{Retrospective}
    Q --> R[What Went Well?]
    Q --> S[What Went Wrong?]
    Q --> T[What Would We Change?]

    style A fill:#1a1a2e,stroke:#ffd700,stroke-width:3px
    style Q fill:#16213e,stroke:#00d4ff,stroke-width:2px`,
        forge: `### Project Health Dashboard
Tracking deliverable completeness for final presentation.

\\\`\\\`\\\`javascript
class ProjectDashboard {
    constructor(projectName, teamMembers) {
        this.projectName = projectName;
        this.team = teamMembers;
        this.deliverables = [];
    }

    addDeliverable(name, category, weight) {
        this.deliverables.push({
            name,
            category,
            weight,
            status: 'pending',
            completionPct: 0
        });
    }

    updateStatus(name, status, completionPct) {
        const d = this.deliverables.find(d => d.name === name);
        if (d) {
            d.status = status;
            d.completionPct = completionPct;
        }
    }

    getOverallHealth() {
        const totalWeight = this.deliverables.reduce((s, d) => s + d.weight, 0);
        const weightedCompletion = this.deliverables.reduce(
            (s, d) => s + (d.completionPct / 100) * d.weight, 0
        );
        return ((weightedCompletion / totalWeight) * 100).toFixed(1);
    }

    report() {
        console.log(\`\\n📊 Project: \${this.projectName}\`);
        console.log(\`   Team: \${this.team.join(', ')}\`);
        console.log(\`   Overall Health: \${this.getOverallHealth()}%\\n\`);

        const categories = [...new Set(this.deliverables.map(d => d.category))];
        categories.forEach(cat => {
            console.log(\`  📁 \${cat}\`);
            this.deliverables
                .filter(d => d.category === cat)
                .forEach(d => {
                    const icon = d.completionPct === 100 ? '✅' :
                                 d.completionPct > 50 ? '🔄' : '⬜';
                    console.log(\`    \${icon} \${d.name}: \${d.completionPct}%\`);
                });
        });
    }
}

const project = new ProjectDashboard('Student Portal', ['Alice', 'Bob', 'Charlie']);
project.addDeliverable('SRS Document', 'Documentation', 25);
project.addDeliverable('Architecture Design', 'Documentation', 20);
project.addDeliverable('Source Code', 'Software', 30);
project.addDeliverable('Test Suite', 'Software', 15);
project.addDeliverable('Presentation Slides', 'Presentation', 10);

project.updateStatus('SRS Document', 'complete', 100);
project.updateStatus('Architecture Design', 'complete', 100);
project.updateStatus('Source Code', 'in-progress', 75);
project.updateStatus('Test Suite', 'in-progress', 40);
project.updateStatus('Presentation Slides', 'pending', 10);

project.report();
\\\`\\\`\\\`
`
    }
];

async function seed() {
    try {
        console.log("🚀 Seeding CS 321: Principles of Software Engineering Topics...");

        // Find CS 321 Course
        const courseRes = await pool.query("SELECT id FROM courses WHERE name LIKE '%CS 321%' LIMIT 1");
        let courseId;

        if (courseRes.rows.length === 0) {
            console.log("Course CS 321 not found by code. Attempting to match by title...");
            const titleRes = await pool.query("SELECT id FROM courses WHERE name ILIKE '%software engineering%' LIMIT 1");
            if (titleRes.rows.length === 0) {
                throw new Error("Course CS 321 (Principles of Software Engineering) not found. Run seed_curriculum.js first.");
            }
            courseId = titleRes.rows[0].id;
        } else {
            courseId = courseRes.rows[0].id;
        }

        console.log(`Found Course ID: ${courseId}`);

        // Clear existing topics for this course to avoid duplicates
        await pool.query("DELETE FROM topics WHERE course_id = $1", [courseId]);
        console.log("Cleared existing topics.");

        for (const topic of syllabus) {
            const importance = topic.importance;
            const first_principles = JSON.stringify(topic.principles);
            const dilemma = topic.dilemma ? JSON.stringify(topic.dilemma) : null;

            await pool.query(
                "INSERT INTO topics (title, course_id, importance_level, first_principles, architectural_logic, forge_protocol, ethical_dilemma) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [topic.title, courseId, importance, first_principles, topic.blueprint, topic.forge, dilemma]
            );
            console.log(`✅ Synced: ${topic.title}`);
        }

        console.log(`\n🎓 CS 321 Seeding Complete — ${syllabus.length} topics inserted.`);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
    } finally {
        await pool.end();
    }
}

seed();
