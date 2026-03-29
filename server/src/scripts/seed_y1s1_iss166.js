import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });
import pool from "../config/db.js";

const topics = [
  // ── Unit 1: University Life ────────────────────────────────────────────────
  {
    title: "University Structure, Policies, and Academic Life",
    importance_level: "Essential",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "ISS 166 > Unit 1: University Life",
    first_principles: [
      "Universities are structured bureaucracies — understanding their rules prevents avoidable academic penalties",
      "Academic policies exist to ensure fairness and consistency across all students",
      "Proactive engagement with institutional resources determines long-term academic outcomes"
    ],
    learning_objectives: [
      "Identify the key administrative offices and their functions (Registrar, Dean of Students, Academic Advising)",
      "Explain the grading system, GPA calculation, and academic standing requirements",
      "Understand add/drop deadlines, course withdrawal policies, and academic leave procedures",
      "Navigate the student portal, course registration system, and official university communications"
    ],
    prerequisites: [],
    content_markdown: `## University Structure, Policies, and Academic Life

Starting university can feel like entering a large, complex system with its own language and rules. The students who thrive are not necessarily the most talented — they are the ones who understand how the system works and use it strategically.

### Key Administrative Offices

**Registrar's Office**: Manages course registration, transcripts, enrollment verification, and graduation audits. Your first stop for anything related to official records.

**Academic Advising**: Advisors help you plan your four-year schedule, choose electives, and ensure you meet all graduation requirements. Visit at least once per semester.

**Dean of Students**: Handles academic appeals, disciplinary matters, and student conduct issues. Also a key resource if you are facing personal challenges affecting your studies.

**Financial Aid Office**: Manages scholarships, loans, grants, and tuition payment plans. Always check deadlines — financial aid processing has strict cutoffs.

**IT Help Desk**: Provides student email accounts, VPN access, software licenses, and Wi-Fi support. Get your university credentials sorted in the first week.

### GPA and Academic Standing

Grade Point Average is a numerical summary of your academic performance. Common scale:
- A (90–100%) → 4.0 points
- B (80–89%) → 3.0 points
- C (70–79%) → 2.0 points
- D (60–69%) → 1.0 point
- F (below 60%) → 0.0 points

**GPA = sum of (grade points × credit hours) / total credit hours attempted**

Most programs require a minimum cumulative GPA (typically 2.0 for continuation, 3.0 for honors).

### Critical Dates and Policies

- **Add/drop period**: usually the first 1–2 weeks of semester; you can change courses without academic penalty
- **Withdrawal deadline**: after this date, a W (withdrawal) appears on your transcript — still better than an F
- **Academic appeal deadlines**: usually 10–30 business days after the grade is posted

### Communication

Check your **university email** daily. Official notices about grades, financial aid, registration, and deadlines are sent only to this address. Missing an official email is not a valid excuse.`,
    content_easy_markdown: `## University Structure — Simple Version

University is a big system. Knowing who does what saves you from avoidable problems.

**Key offices:**
- **Registrar** — registration, transcripts, graduation
- **Academic Advisor** — your course plan and degree requirements
- **Dean of Students** — appeals and support when things go wrong
- **Financial Aid** — scholarships and payment

**GPA basics:**
- A = 4.0, B = 3.0, C = 2.0, F = 0.0
- You need at least 2.0 GPA to stay in good standing

**Survival rules:**
1. Check your university email every day
2. Know add/drop and withdrawal deadlines
3. Visit your advisor every semester`,
    forge_snippet: `# ── University Life: Study Schedule Template ──────────────────────────────

# WEEKLY SCHEDULE BUILDER (Python)
# Customize and print your weekly university schedule

schedule = {
    "Monday": [
        {"time": "08:00", "activity": "CS 121 Lecture",         "location": "Room 101"},
        {"time": "10:00", "activity": "MATH 111 Lecture",       "location": "Room 204"},
        {"time": "14:00", "activity": "Self-study: CS 121",     "location": "Library"},
    ],
    "Tuesday": [
        {"time": "09:00", "activity": "ENG 101 Lecture",        "location": "Room 305"},
        {"time": "11:00", "activity": "Office hours: CS 121",   "location": "Office B12"},
        {"time": "15:00", "activity": "ISS 166 Seminar",        "location": "Room 110"},
    ],
    "Wednesday": [
        {"time": "08:00", "activity": "CS 121 Lab",             "location": "Lab 3"},
        {"time": "14:00", "activity": "Self-study: MATH 111",   "location": "Library"},
    ],
    "Thursday": [
        {"time": "09:00", "activity": "ENG 101 Workshop",       "location": "Room 305"},
        {"time": "13:00", "activity": "Gym / Exercise",         "location": "Sports Center"},
    ],
    "Friday": [
        {"time": "08:00", "activity": "MATH 111 Tutorial",      "location": "Room 210"},
        {"time": "11:00", "activity": "Weekly review + plan",   "location": "Home"},
    ],
    "Saturday": [
        {"time": "10:00", "activity": "Assignment work block",  "location": "Library"},
    ],
    "Sunday": [
        {"time": "19:00", "activity": "Plan next week",         "location": "Home"},
    ],
}

for day, events in schedule.items():
    print(f"\\n── {day} ──────────────────────")
    for e in events:
        print(f"  {e['time']}  {e['activity']:<30} @ {e['location']}")

# IMPORTANT DATES TRACKER:
deadlines = [
    {"date": "Week 2",  "item": "Add/Drop deadline"},
    {"date": "Week 5",  "item": "Assignment 1 due"},
    {"date": "Week 8",  "item": "Midterm exams"},
    {"date": "Week 11", "item": "Withdrawal deadline"},
    {"date": "Week 16", "item": "Final project due"},
]

print("\\n── Semester Deadlines ─────────────────")
for d in deadlines:
    print(f"  {d['date']:<10} {d['item']}")`
  },

  {
    title: "Study Skills and Effective Learning Strategies",
    importance_level: "Essential",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "ISS 166 > Unit 1: University Life",
    first_principles: [
      "Learning is a biological process — memory is strengthened by retrieval, not re-reading",
      "The feeling of fluency while re-reading is a cognitive illusion; testing yourself reveals true knowledge gaps",
      "Spaced repetition exploits the forgetting curve — reviewing material at increasing intervals cements long-term memory"
    ],
    learning_objectives: [
      "Apply retrieval practice (self-testing, flashcards) instead of passive re-reading",
      "Use spaced repetition to schedule review sessions for maximum retention",
      "Apply the Feynman Technique to diagnose and fill knowledge gaps",
      "Identify and eliminate common ineffective study habits (highlighting, re-reading, cramming)"
    ],
    prerequisites: [],
    content_markdown: `## Study Skills and Effective Learning Strategies

Cognitive science research over the past 30 years has consistently shown that the study strategies most students use — highlighting, re-reading, cramming — are among the least effective. The strategies that work are less comfortable because they feel harder, but that difficulty is the mechanism of learning.

### The Most Effective Study Strategies

**1. Retrieval Practice (Testing Effect)**
Instead of re-reading notes, close them and try to recall the information. The act of retrieving something from memory strengthens that memory far more than passively reviewing it. Use:
- Flashcards (physical or Anki)
- Practice problems
- Writing everything you know on a blank page before checking notes

**2. Spaced Repetition**
Review material at increasing intervals: study today, review in 2 days, then 5 days, then 10, then 3 weeks. This exploits the forgetting curve — reviewing just before you forget something maximally reinforces it. Anki automates this.

**3. Interleaving**
Instead of studying one topic until mastery then moving on, mix topics within a study session. Harder, but produces more durable learning.

**4. The Feynman Technique**
1. Pick a concept you are studying.
2. Write an explanation as if teaching it to a 12-year-old.
3. When you get stuck or use jargon you cannot define, that is a knowledge gap.
4. Return to your notes, fill the gap, and try again.

### Study Session Structure

A 2-hour study session should look like:
- 5 min: Review previous session's material (retrieval)
- 50 min: New material (active reading + note-taking)
- 10 min: Break (no screen)
- 50 min: Practice problems or self-testing on new material
- 5 min: Write a summary of everything covered today

### The Illusion of Knowing

Re-reading your notes feels productive because the material becomes familiar. But familiarity is not the same as knowing. The test comes when you close the notes and try to use the knowledge. Always study as if you are preparing to explain the material to someone else.`,
    content_easy_markdown: `## Study Skills — Simple Version

Most common study habits (highlighting, re-reading) do not work well. The best methods feel harder but produce real learning.

**What actually works:**
1. **Self-testing** — close your notes and write what you remember
2. **Spaced repetition** — review a few days later, then a week later, then a month
3. **Feynman Technique** — try to explain it simply; where you struggle reveals gaps

**What does NOT work:**
- Re-reading highlighted notes
- Cramming everything the night before
- Passive watching of lecture recordings at 2x speed without pausing`,
    forge_snippet: `# ── Study Skills: Spaced Repetition Scheduler ────────────────────────────

from datetime import date, timedelta

def spaced_repetition_schedule(learned_date: date, topic: str) -> list:
    """
    Returns a list of recommended review dates based on the
    Ebbinghaus forgetting curve intervals.
    Intervals: 1 day, 3 days, 7 days, 14 days, 30 days, 60 days
    """
    intervals = [1, 3, 7, 14, 30, 60]
    schedule = []
    for days in intervals:
        review_date = learned_date + timedelta(days=days)
        schedule.append({
            "review_date": review_date.strftime("%Y-%m-%d"),
            "days_from_today": days,
            "topic": topic,
            "status": "pending"
        })
    return schedule

# Example usage:
today = date.today()
topics_learned_today = [
    "Binary search algorithm",
    "Big-O notation",
    "Recursion base cases",
]

print("── Spaced Repetition Review Schedule ──────────────────────────")
for topic in topics_learned_today:
    print(f"\\nTopic: {topic}")
    for entry in spaced_repetition_schedule(today, topic):
        print(f"  Review on {entry['review_date']}  (+{entry['days_from_today']} days)")

# ── FEYNMAN TECHNIQUE TEMPLATE ─────────────────────────────────────────────
feynman_template = """
TOPIC: ___________________________________

STEP 1 — Explain it simply (no jargon):
  [Write as if explaining to someone who has never studied CS]

STEP 2 — Identify gaps (where did you get stuck?):
  - Gap 1: I couldn't explain _______________
  - Gap 2: I wasn't sure about _______________

STEP 3 — Return to notes and fill gaps.

STEP 4 — Re-explain more simply:
  [Simplify your previous explanation even further]

TEST: Can you explain the core idea in ONE sentence?
  →
"""
print(feynman_template)`
  },

  {
    title: "Time Management for CS Students",
    importance_level: "Essential",
    estimated_time: "45 mins",
    estimated_time_minutes: 45,
    breadcrumb_path: "ISS 166 > Unit 1: University Life",
    first_principles: [
      "Time is a non-renewable resource — the question is never whether to spend it, but how deliberately",
      "Planning reduces decision fatigue: a pre-made schedule eliminates the daily cost of deciding what to do next",
      "CS work expands to fill available time without constraints; time-boxing imposes productive limits"
    ],
    learning_objectives: [
      "Build a weekly schedule that balances classes, study time, assignments, and personal wellbeing",
      "Apply the Pomodoro Technique and time-boxing for focused work sessions",
      "Prioritize tasks using the Eisenhower Matrix (urgent/important framework)",
      "Avoid procrastination by breaking large tasks into concrete, timed sub-tasks"
    ],
    prerequisites: ["Study Skills and Effective Learning Strategies"],
    content_markdown: `## Time Management for CS Students

CS students face a specific time management challenge: programming assignments, debugging sessions, and mathematical problem sets are notoriously difficult to time-estimate. "This will take 30 minutes" routinely becomes 3 hours. Planning around this reality is essential.

### The Weekly Planning System

Every Sunday, do a 15-minute weekly review and plan:
1. List every deadline for the coming week
2. Estimate time required for each task (then multiply by 1.5 for programming tasks)
3. Block time in your calendar for each task
4. Identify your three most important deliverables for the week

A task without a scheduled time slot rarely gets done.

### The Eisenhower Matrix

Categorize every task into four quadrants:

|          | **Urgent**         | **Not Urgent**       |
|----------|--------------------|----------------------|
| **Important**     | DO NOW (assignments due tomorrow) | SCHEDULE (studying, project work) |
| **Not Important** | DELEGATE if possible (admin tasks) | ELIMINATE (social media, distractions) |

Most students spend too much time in "Urgent/Important" (crisis mode) because they neglected "Not Urgent/Important" (proactive work). Plan ahead to avoid the crisis quadrant.

### The Pomodoro Technique

1. Choose one task
2. Set a timer for 25 minutes — work with zero interruptions
3. When the timer rings, take a 5-minute break
4. After 4 Pomodoros, take a 20–30 minute break

This technique is effective for CS because it forces focus and makes large, intimidating tasks feel manageable.

### Handling CS Assignment Time Estimates

Programming assignments always take longer than expected. Apply the "2× rule":
- Estimate → double it → add 30 minutes for debugging

**Start assignments the day they are released**, not the night before. Bugs discovered at midnight have no solution path.

### Protecting Deep Work Time

CS programming requires **deep work** — extended, uninterrupted focus. Schedule at least one 2-hour deep work block per day, ideally during your peak cognitive hours. During deep work: phone on Do Not Disturb, notifications off, one task only.`,
    content_easy_markdown: `## Time Management — Simple Version

CS assignments always take longer than you think. Plan for this.

**Weekly planning (15 minutes every Sunday):**
1. List all deadlines for the week
2. Estimate time for each task — then multiply by 1.5 for coding
3. Block time in your calendar

**Pomodoro Technique:**
- 25 minutes of focused work
- 5 minute break
- Repeat 4 times, then take a long break

**Golden rule for CS:** Start programming assignments the day they are released. Never the night before.`,
    forge_snippet: `# ── Time Management: Weekly Planner ──────────────────────────────────────

from datetime import date, timedelta

def generate_weekly_planner(week_start: date) -> str:
    """Generate a text-based weekly planner for a CS student."""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    time_blocks = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]

    lines = []
    lines.append(f"WEEKLY PLANNER — Week of {week_start.strftime('%B %d, %Y')}")
    lines.append("=" * 60)

    for i, day in enumerate(days):
        current_date = week_start + timedelta(days=i)
        lines.append(f"\\n{day} {current_date.strftime('%b %d')}")
        lines.append("-" * 40)
        for t in time_blocks:
            lines.append(f"  {t}  [ ] _________________________________")

    lines.append("\\n" + "=" * 60)
    lines.append("TOP 3 PRIORITIES THIS WEEK:")
    lines.append("  1. ___________________________________________")
    lines.append("  2. ___________________________________________")
    lines.append("  3. ___________________________________________")
    lines.append("\\nDEADLINES:")
    lines.append("  [ ] _______________________________  Due: ______")
    lines.append("  [ ] _______________________________  Due: ______")
    lines.append("  [ ] _______________________________  Due: ______")
    return "\\n".join(lines)

print(generate_weekly_planner(date.today()))

# ── EISENHOWER MATRIX TASK SORTER ──────────────────────────────────────────
def eisenhower_sort(tasks: list[dict]) -> None:
    """
    Each task: {"name": str, "urgent": bool, "important": bool}
    """
    quadrants = {
        (True,  True):  "DO NOW (Urgent + Important)",
        (False, True):  "SCHEDULE (Not Urgent + Important)",
        (True,  False): "DELEGATE (Urgent + Not Important)",
        (False, False): "ELIMINATE (Not Urgent + Not Important)",
    }
    grouped = {k: [] for k in quadrants}
    for t in tasks:
        key = (t["urgent"], t["important"])
        grouped[key].append(t["name"])

    for (u, i), label in quadrants.items():
        print(f"\\n{label}:")
        for task in grouped[(u, i)]:
            print(f"  - {task}")

# Example:
eisenhower_sort([
    {"name": "CS 121 assignment due tomorrow", "urgent": True,  "important": True},
    {"name": "Study for midterm next week",    "urgent": False, "important": True},
    {"name": "Reply to group chat",            "urgent": True,  "important": False},
    {"name": "Browse social media",            "urgent": False, "important": False},
])`
  },

  {
    title: "Academic Integrity and Ethics",
    importance_level: "Essential",
    estimated_time: "45 mins",
    estimated_time_minutes: 45,
    breadcrumb_path: "ISS 166 > Unit 1: University Life",
    first_principles: [
      "Academic work is a representation of your own understanding — misrepresenting that understanding harms your own learning",
      "Trust in credentials depends on the integrity of the work behind them; cheating devalues everyone's degree",
      "The habits of honesty and careful attribution in university directly translate to professional ethical behavior"
    ],
    learning_objectives: [
      "Define plagiarism, collusion, fabrication, and contract cheating — and recognize each in practice",
      "Understand the difference between collaboration and collusion on group vs. individual assignments",
      "Explain the consequences of academic dishonesty, from grade penalties to expulsion",
      "Apply strategies for ethical use of AI tools (ChatGPT, Copilot) in academic work"
    ],
    prerequisites: [],
    content_markdown: `## Academic Integrity and Ethics

Academic integrity is not just a rule imposed by universities — it is the foundation of what a degree represents. When you graduate, employers and graduate schools trust that your certificate reflects genuine ability. Shortcuts undermine that trust, and increasingly, they are detectable.

### Forms of Academic Dishonesty

**Plagiarism**: Presenting someone else's words, ideas, or code as your own without attribution. This includes copying from a classmate, a website, a textbook, or an AI tool.

**Collusion**: Working with others on an assignment that was intended to be completed individually, even if you each submitted slightly different versions.

**Fabrication**: Inventing data, citations, or experimental results.

**Contract Cheating**: Paying or asking someone else to complete your assignment for you. This includes academic writing services and certain uses of AI.

**Self-plagiarism**: Submitting the same work (or large portions of it) to two different courses without permission from both instructors.

### AI Tools and Academic Integrity

AI tools like ChatGPT and GitHub Copilot are powerful, and their use policies vary by instructor and institution. General guidelines:

- **Using AI to generate work you submit as your own = academic dishonesty** in most contexts
- **Using AI to understand a concept, then writing your own explanation = generally acceptable** (like using a textbook)
- **Using AI for code suggestions you study and understand = often acceptable**; submitting AI-generated code unchanged = not acceptable
- Always check your course's specific policy. When in doubt, ask the instructor.

### Consequences

Academic dishonesty penalties typically escalate:
1. First offence: zero on the assignment
2. Second offence: zero in the course
3. Third offence: suspension or expulsion
4. Severe cases: permanent notation on academic transcript

These records can affect graduate school applications, professional licensing, and employment background checks.

### The Right Question

The right question is not "Will I get caught?" but "Am I actually learning this?" A degree you cannot use is worthless regardless of how it was obtained.`,
    content_easy_markdown: `## Academic Integrity — Simple Version

Cheating comes in many forms — all of them have real consequences.

**Main types:**
- **Plagiarism** — using someone's words or code without credit
- **Collusion** — working with others on individual assignments
- **Fabrication** — making up data or sources
- **AI misuse** — submitting AI-generated work as your own

**About AI tools:**
- Using AI to learn a concept: usually OK
- Submitting AI-generated work as your own: not OK
- Always check your course policy first

**Why it matters beyond getting caught:** If you cheat through your degree, you graduate without the skills the degree claims you have — and that will become visible in your first job.`,
    forge_snippet: `# ── Academic Integrity: Ethics Checklist ─────────────────────────────────

def check_submission_ethics(assignment_type: str) -> list[str]:
    """
    Returns an ethics checklist before submitting academic work.
    assignment_type: "individual", "group", or "research"
    """
    common_checks = [
        "I wrote this work myself (or with permitted collaborators only)",
        "All external sources are cited correctly",
        "No part of this work was copied from the internet without attribution",
        "I have not submitted this work or a version of it to another course",
        "I understand the course's policy on AI tool usage",
    ]

    individual_checks = [
        "I did not share my work with classmates before the deadline",
        "I did not receive direct code or written answers from another student",
        "Any study group discussions did not cross into collaborative solution-building",
    ]

    group_checks = [
        "All group members contributed equitably",
        "Each member understands and can explain all parts of the submission",
        "We have not split work so that individuals only know their own section",
    ]

    research_checks = [
        "All data is real and accurately reported",
        "No sources are fabricated or misrepresented",
        "Paraphrased sections are truly rewritten, not synonym-swapped",
    ]

    checklist = common_checks[:]
    if assignment_type == "individual":
        checklist += individual_checks
    elif assignment_type == "group":
        checklist += group_checks
    elif assignment_type == "research":
        checklist += research_checks

    return checklist

# Usage before any submission:
print("PRE-SUBMISSION INTEGRITY CHECKLIST")
print("=" * 45)
for item in check_submission_ethics("individual"):
    print(f"  [ ] {item}")

# ── AI TOOL USAGE DECISION TREE ────────────────────────────────────────────
ai_policy = """
BEFORE using an AI tool for academic work:

1. Has your instructor explicitly PERMITTED AI use for this task?
   → NO  : Do not use it. Complete the work independently.
   → YES : Continue to step 2.

2. Are you using AI to UNDERSTAND a concept?
   → YES : Acceptable. Read the explanation, then close AI and write yourself.

3. Are you using AI to GENERATE text or code you will submit?
   → YES : This is likely academic dishonesty. Verify with your instructor first.

4. If AI use IS permitted, are you:
   [ ] Disclosing AI use as required by your instructor?
   [ ] Reviewing and understanding all AI-generated content?
   [ ] Taking responsibility for the accuracy of the final submission?
"""
print(ai_policy)`
  },

  {
    title: "Career Paths in Computer Science",
    importance_level: "Essential",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "ISS 166 > Unit 1: University Life",
    first_principles: [
      "Career paths are not linear — most CS professionals move across roles, industries, and specializations",
      "Technical skills are necessary but insufficient; communication, collaboration, and domain knowledge determine career trajectory",
      "Early exposure to real-world CS work (internships, projects, open source) is the most reliable predictor of employment success"
    ],
    learning_objectives: [
      "Describe at least six distinct career paths in CS with their typical responsibilities and required skills",
      "Map your interests and strengths to two or three career directions worth exploring",
      "Identify the specific skills, experiences, and milestones needed to pursue your target career path",
      "Create a four-year plan that builds toward your first internship or graduate school application"
    ],
    prerequisites: [],
    content_markdown: `## Career Paths in Computer Science

Computer science opens more career paths than almost any other field. Understanding the landscape early allows you to make deliberate choices about electives, projects, and internships rather than graduating with a generic degree.

### Major Career Tracks

**Software Engineering (SWE)**
Build the systems and applications people use daily. Sub-specializations: frontend (UI/UX), backend (APIs, databases), full-stack, mobile (iOS/Android), and DevOps/infrastructure.
Key skills: data structures, algorithms, system design, version control.

**Data Science and Machine Learning**
Extract insights from large datasets and build predictive models.
Key skills: statistics, Python, SQL, machine learning libraries (scikit-learn, PyTorch), data visualization.

**Cybersecurity**
Protect systems and data from threats. Sub-fields: penetration testing, security engineering, cryptography, incident response.
Key skills: networking, operating systems, security protocols, ethical hacking tools.

**Systems and Infrastructure**
Build operating systems, compilers, databases, cloud infrastructure.
Key skills: C/C++, computer architecture, operating systems, distributed systems.

**AI and Robotics**
Design intelligent systems that perceive, reason, and act.
Key skills: mathematics (linear algebra, calculus, probability), deep learning, robotics frameworks.

**Academic Research and Graduate School**
Advance the field through publications and innovation.
Requirements: strong GPA, research experience, recommendation letters, GRE.

**Product Management / Technical PM**
Bridge between engineering teams and business strategy. Requires both technical understanding and communication skills.

### Building Your Four-Year Plan

| Year | Focus |
|------|-------|
| Year 1 | Core CS fundamentals, join a club, attend career fairs |
| Year 2 | First internship or research position, choose specialization |
| Year 3 | Competitive internship (top tech or research), build portfolio |
| Year 4 | Full-time offer conversion or graduate school applications |

The best time to start building your career profile is now — before you feel "ready."`,
    content_easy_markdown: `## CS Career Paths — Simple Version

CS is not just one job. There are many paths, and you do not need to choose permanently right now.

**Main directions:**
- **Software Engineering** — build apps and systems
- **Data Science / ML** — work with data and AI models
- **Cybersecurity** — protect systems from attacks
- **Systems** — build infrastructure, compilers, databases
- **Research** — advance the field through academia

**What to do in Year 1:**
- Focus on fundamentals (data structures, algorithms)
- Join a CS club or hackathon
- Start building projects you can show people`,
    forge_snippet: `# ── Career Path Explorer ─────────────────────────────────────────────────

career_paths = {
    "Software Engineering": {
        "description": "Build products, systems, and services",
        "specializations": ["Frontend", "Backend", "Full-Stack", "Mobile", "DevOps"],
        "core_skills": ["Algorithms", "Data Structures", "System Design", "Git"],
        "avg_entry_salary_usd": "85,000 – 130,000",
        "internship_timeline": "Summer after Year 1 or 2",
    },
    "Data Science / ML": {
        "description": "Extract insights from data and build predictive models",
        "specializations": ["ML Engineering", "Data Analysis", "AI Research", "NLP"],
        "core_skills": ["Python", "Statistics", "SQL", "PyTorch/scikit-learn"],
        "avg_entry_salary_usd": "90,000 – 140,000",
        "internship_timeline": "Summer after Year 2 or 3",
    },
    "Cybersecurity": {
        "description": "Protect systems and investigate threats",
        "specializations": ["Pen Testing", "Security Engineering", "Incident Response"],
        "core_skills": ["Networking", "Linux", "Cryptography", "Ethical Hacking"],
        "avg_entry_salary_usd": "80,000 – 120,000",
        "internship_timeline": "Summer after Year 2",
    },
    "Systems / Infrastructure": {
        "description": "Build OS, compilers, databases, and cloud infrastructure",
        "specializations": ["OS Development", "Cloud Engineering", "Compiler Design"],
        "core_skills": ["C/C++", "Computer Architecture", "Distributed Systems"],
        "avg_entry_salary_usd": "95,000 – 145,000",
        "internship_timeline": "Summer after Year 2 or 3",
    },
}

def explore_career(interest: str) -> None:
    path = career_paths.get(interest)
    if not path:
        print(f"Unknown path: {interest}")
        return
    print(f"\\n── {interest} ──────────────────────────────")
    print(f"  What you do:    {path['description']}")
    print(f"  Specializations: {', '.join(path['specializations'])}")
    print(f"  Core skills:    {', '.join(path['core_skills'])}")
    print(f"  Salary range:   ${path['avg_entry_salary_usd']}")
    print(f"  First internship: {path['internship_timeline']}")

for career in career_paths:
    explore_career(career)`
  },

  // ── Unit 2: Skills for Success ────────────────────────────────────────────
  {
    title: "Library, Databases, and Research Resources",
    importance_level: "Advanced",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "ISS 166 > Unit 2: Skills for Success",
    first_principles: [
      "University libraries provide access to research that is not freely available on the open web",
      "Search strategy determines the quality of sources found — precise queries beat broad ones",
      "Primary sources (original research) are more reliable than secondary summaries"
    ],
    learning_objectives: [
      "Navigate the university library catalog and major academic databases (IEEE Xplore, ACM, Google Scholar)",
      "Construct effective search queries using Boolean operators and filters",
      "Access full-text papers through institutional library subscriptions and interlibrary loan",
      "Distinguish between peer-reviewed research, conference papers, textbooks, and web resources"
    ],
    prerequisites: ["University Structure, Policies, and Academic Life"],
    content_markdown: `## Library, Databases, and Research Resources

Your university library is one of the most underused and most valuable resources available to you. Institutional subscriptions provide free access to thousands of research papers, textbooks, and databases that would otherwise cost hundreds of dollars per article.

### Key Academic Databases for CS Students

**Google Scholar** (scholar.google.com)
Free, comprehensive, and excellent for starting any search. Use the "Cite" button to export references in APA or IEEE format. Check "Since [year]" to filter by recency.

**IEEE Xplore** (ieeexplore.ieee.org)
The primary repository for IEEE conferences and journals covering CS, electrical engineering, and information technology. Most universities provide institutional access — log in through your library portal.

**ACM Digital Library** (dl.acm.org)
Covers computer science research from ACM conferences (like SIGGRAPH, SOSP, PLDI) and journals. Highly relevant for algorithms, systems, and HCI.

**University Library Catalog**
Use for textbooks, e-books, and print resources. Many universities subscribe to O'Reilly Learning, which provides access to thousands of technical books and video courses.

### Effective Search Techniques

**Boolean operators:**
- AND: narrows results — "machine learning AND healthcare"
- OR: broadens results — "neural network OR deep learning"
- NOT: excludes terms — "sorting algorithm NOT bubble sort"

**Quotation marks**: search exact phrases — "binary search tree"

**Filters**: use Year, Publication Type, and Subject Area filters to narrow large result sets.

**Citation chaining**: find a good paper → check its references (backward chaining) and check who cited it (forward chaining via "Cited by" in Google Scholar).

### When You Cannot Access a Full Paper

1. Check if your university library has a subscription
2. Email the corresponding author directly — most researchers will send their paper for free
3. Check arXiv.org — many CS and AI papers are freely posted here by the authors
4. Use Unpaywall browser extension — finds legal free versions automatically`,
    content_easy_markdown: `## Library Resources — Simple Version

Your university library gives you free access to research worth thousands of dollars. Use it.

**Best databases for CS:**
- **Google Scholar** — start here for any topic
- **IEEE Xplore** — for CS and engineering papers
- **ACM Digital Library** — for CS conference papers

**Search tips:**
- Use AND to narrow: "sorting AND python"
- Use "" for exact phrases: "binary search tree"
- Filter by year to get recent work

**Can't find the full paper?** Check arXiv.org — many CS papers are free there.`,
    forge_snippet: `# ── Research Resource Finder ─────────────────────────────────────────────

# BOOLEAN SEARCH QUERY BUILDER
def build_search_query(
    required_terms: list[str],
    any_of: list[str] = None,
    exclude: list[str] = None
) -> str:
    """
    Builds a Boolean search query for academic databases.
    required_terms: all must appear (AND)
    any_of: at least one must appear (OR group)
    exclude: none must appear (NOT)
    """
    parts = []

    if required_terms:
        parts.append(" AND ".join(f'"{t}"' for t in required_terms))

    if any_of:
        or_group = "(" + " OR ".join(f'"{t}"' for t in any_of) + ")"
        parts.append(or_group)

    query = " AND ".join(parts)

    if exclude:
        for term in exclude:
            query += f' NOT "{term}"'

    return query

# Example searches:
print("── Sample Academic Search Queries ─────────────────────────────")
print()

q1 = build_search_query(
    required_terms=["graph neural network"],
    any_of=["node classification", "link prediction"],
    exclude=["survey"]
)
print(f"Query 1: {q1}")

q2 = build_search_query(
    required_terms=["cache replacement policy"],
    any_of=["LRU", "LFU", "optimal"],
)
print(f"Query 2: {q2}")

q3 = build_search_query(
    required_terms=["compiler optimization"],
    any_of=["loop unrolling", "dead code elimination"],
    exclude=["JIT"]
)
print(f"Query 3: {q3}")

# ── DATABASE QUICK REFERENCE ────────────────────────────────────────────────
resources = {
    "Google Scholar":     "scholar.google.com         — All fields, free, great for starting",
    "IEEE Xplore":        "ieeexplore.ieee.org         — CS/EE, institutional login needed",
    "ACM Digital Library":"dl.acm.org                  — CS conferences and journals",
    "arXiv":              "arxiv.org                   — Free preprints, esp. AI/ML/CS",
    "Semantic Scholar":   "semanticscholar.org         — Free, AI-powered, good for citations",
    "LibGen (textbooks)": "library.lol                 — Free textbooks (verify legality)",
}

print("\\n── Academic Database Reference ─────────────────────────────────")
for name, info in resources.items():
    print(f"  {name:<25} {info}")`
  },

  {
    title: "Teamwork and Collaborative Problem-Solving",
    importance_level: "Advanced",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "ISS 166 > Unit 2: Skills for Success",
    first_principles: [
      "Software is almost always built by teams — individual brilliance without collaborative skill has limited real-world value",
      "Team dysfunction is rarely caused by lack of skill; it is caused by poor communication and unclear expectations",
      "Conflict in teams is inevitable — the goal is not to avoid it but to resolve it constructively"
    ],
    learning_objectives: [
      "Identify common team roles and apply them in a CS project context",
      "Use structured communication practices (standups, retrospectives) to keep a team aligned",
      "Apply conflict resolution techniques to disagreements over technical decisions",
      "Contribute equitably to a group project and hold team members accountable professionally"
    ],
    prerequisites: ["Study Skills and Effective Learning Strategies"],
    content_markdown: `## Teamwork and Collaborative Problem-Solving

Every meaningful software product is the result of teamwork. Learning to work effectively in a team — to communicate clearly, resolve disagreements, divide work fairly, and deliver on commitments — is as important as any technical skill.

### Team Roles in CS Projects

Effective teams need people in distinct roles. In small student teams, individuals often play multiple roles:

- **Team lead / project manager**: coordinates tasks, runs meetings, ensures progress
- **Technical architect**: makes high-level design decisions
- **Developer**: implements features
- **Tester / QA**: finds bugs, writes tests
- **Documentarian**: writes reports, README, and comments

Confusion about who is responsible for what is the most common source of team conflict. Assign roles and task ownership explicitly.

### Agile Team Practices (Scaled for Students)

**Daily standup** (keep to 5–10 minutes):
1. What did you complete since last meeting?
2. What will you complete before next meeting?
3. What blockers do you have?

**Sprint planning**: At the start of each work period, agree on exactly what will be completed and who is responsible.

**Retrospective**: After each major milestone, ask: What went well? What should we change? What should we try?

### Handling Disagreements

**Technical disagreements** (e.g., "should we use REST or GraphQL?"):
- State your reasoning, not just your preference
- Ask the other person to state their reasoning
- Evaluate both options against concrete criteria (performance, simplicity, maintainability)
- When uncertain, prototype both and measure

**Workload disputes** ("they're not contributing equally"):
- Address it early — resentment compounds over time
- Be specific: "You missed the last two deadlines" not "You never do anything"
- If peer-level resolution fails, bring in the instructor or TA

### Version Control as a Collaboration Tool

Git was designed for collaborative coding. Every team project should use branches, pull requests, and commit messages that explain the "why" of each change. Git history becomes a record of team accountability.`,
    content_easy_markdown: `## Teamwork — Simple Version

Most real CS work is done in teams. Team skills are as important as coding skills.

**For every team project:**
1. Assign roles and tasks explicitly — do not assume
2. Use a short standup to stay aligned (3 questions: done, doing, blocked)
3. Use Git — everyone on branches, code reviewed before merging

**When conflict happens:**
- Be specific about the issue, not personal
- Address it early — small problems become large ones fast
- Focus on what is best for the project, not on "winning"`,
    forge_snippet: `# ── Team Project Management Templates ────────────────────────────────────

# STANDUP LOG (run every work session)
standup_template = """
TEAM STANDUP — {date}
Team: {team_name}
Duration: 5–10 minutes

{member_name}:
  ✓ Completed since last standup:
  → Working on next:
  ⚠ Blockers:

{member_name}:
  ✓ Completed since last standup:
  → Working on next:
  ⚠ Blockers:
"""

# TASK ASSIGNMENT TABLE (paste into shared doc or README):
task_table = """
| Task                          | Owner     | Status      | Due Date |
|-------------------------------|-----------|-------------|----------|
| Design database schema        | Alice     | In Progress | Week 3   |
| Implement user authentication | Bob       | Not started | Week 4   |
| Write API documentation       | Carol     | Not started | Week 5   |
| Set up CI/CD pipeline         | Dave      | Done        | Week 2   |
| Write unit tests for auth     | Bob+Carol | Not started | Week 5   |
"""

# RETROSPECTIVE TEMPLATE (run after each milestone):
retro_template = """
SPRINT RETROSPECTIVE — Sprint {n}
Date: {date}

WHAT WENT WELL?
  +
  +
  +

WHAT SHOULD WE IMPROVE?
  Δ
  Δ

WHAT WILL WE TRY NEXT SPRINT?
  →
  →

ACTION ITEMS (who does what by when):
  [ ] {person}: {action} by {date}
  [ ] {person}: {action} by {date}
"""

# GIT WORKFLOW FOR STUDENT TEAMS:
git_workflow = """
Standard branch workflow for a student project team:

main        — stable, tested code only; never push directly
develop     — integration branch; merge feature branches here first
feature/X   — one branch per feature or task

Workflow:
  git checkout -b feature/user-login
  # make changes
  git add specific-files.py
  git commit -m "feat: implement JWT-based user login"
  git push origin feature/user-login
  # open Pull Request → team lead reviews → merge to develop
"""
print(git_workflow)`
  },

  {
    title: "Mental Health and Student Wellbeing",
    importance_level: "Advanced",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "ISS 166 > Unit 2: Skills for Success",
    first_principles: [
      "Mental health is not separate from academic performance — they are directly and reciprocally linked",
      "Stress is a signal, not a failure; the appropriate response is adjustment, not suppression",
      "Sustainable high performance requires recovery — rest is not wasted time, it is part of the process"
    ],
    learning_objectives: [
      "Recognize the signs of academic burnout and chronic stress in yourself and peers",
      "Apply evidence-based strategies for managing stress: sleep hygiene, exercise, mindfulness",
      "Identify on-campus mental health resources and understand how to access them",
      "Build sustainable study habits that preserve long-term wellbeing alongside academic achievement"
    ],
    prerequisites: ["Time Management for CS Students"],
    content_markdown: `## Mental Health and Student Wellbeing

CS programs are academically demanding. Surveys consistently show that CS students report above-average rates of stress, anxiety, and burnout compared to other majors. Acknowledging this reality and building proactive strategies is not a sign of weakness — it is practical self-management.

### The Stress-Performance Curve

A small amount of stress (pressure, deadlines, challenge) improves performance by increasing focus and motivation. This is called **eustress**. Beyond a tipping point, additional stress degrades performance, decision-making, memory, and sleep — this is **distress**.

The goal is not to eliminate stress but to stay in the productive zone through deliberate management.

### Signs of Burnout

Burnout is chronic, unrecovered stress. Watch for:
- Persistent exhaustion not relieved by sleep
- Cynicism about your work or degree ("nothing matters, this is pointless")
- Reduced performance despite equal or greater effort
- Withdrawal from social activities
- Physical symptoms: frequent illness, headaches, appetite changes

### Evidence-Based Strategies

**Sleep**: The single most powerful cognitive tool. Aim for 7–9 hours. Sleep consolidates memory — studying late at the cost of sleep is a net negative for retention.

**Exercise**: 30 minutes of moderate aerobic exercise 3× per week has been shown to reduce anxiety, improve mood, and improve cognitive function. Even a 15-minute walk during a study break is meaningful.

**Social connection**: Isolation amplifies distress. Maintain at least one regular social commitment per week — a study group, a club, a friend.

**Mindfulness**: 10 minutes per day of focused breathing reduces cortisol and improves attention. Apps like Headspace, Calm, or free guided sessions on YouTube are a practical starting point.

**Limit caffeine dependency**: Coffee is a tool, not a substitute for sleep. Reliance on caffeine to function masks sleep deprivation without solving it.

### When to Seek Help

You do not need to be in crisis to use mental health services. Campus counseling centers offer services for stress, academic anxiety, time management difficulties, and personal challenges — not just severe mental illness. Seeking support early prevents small issues from escalating.`,
    content_easy_markdown: `## Mental Health — Simple Version

CS is demanding. Looking after your mental health is not optional — it directly affects your grades and your future.

**Warning signs of burnout:**
- Tired even after sleeping
- Everything feels pointless
- Doing worse even when trying harder

**What helps (backed by research):**
1. **Sleep 7–9 hours** — this is not negotiable; sleep deprivation destroys learning
2. **Exercise** — even 20 minutes of walking helps
3. **Talk to someone** — campus counseling is free and confidential
4. **Take real breaks** — screen-free breaks restore focus more than scrolling

**You do not have to be in crisis to ask for help.**`,
    forge_snippet: `# ── Wellbeing Tracker and Daily Check-In ─────────────────────────────────

from datetime import date

def daily_checkin() -> dict:
    """
    A simple daily wellbeing check-in template.
    In a real app, this would read from user input.
    Returns a mock example entry.
    """
    return {
        "date": date.today().isoformat(),
        "sleep_hours": 7.5,
        "energy_level": 7,        # 1–10
        "stress_level": 5,        # 1–10 (10 = extremely stressed)
        "exercise_today": True,
        "social_interaction": True,
        "mood_note": "Focused in the morning, tired after lunch. Took a walk. Better.",
        "one_good_thing": "Solved the recursive function bug I was stuck on for 2 days.",
    }

def assess_wellbeing(entry: dict) -> str:
    """Simple heuristic assessment from check-in data."""
    flags = []
    if entry["sleep_hours"] < 6:
        flags.append("⚠ Sleep below 6 hours — cognitive function impaired.")
    if entry["stress_level"] >= 8:
        flags.append("⚠ High stress — consider talking to someone today.")
    if not entry["exercise_today"]:
        flags.append("ℹ No exercise — even a 15-min walk would help.")
    if not flags:
        return "✓ All indicators look healthy today. Keep it up."
    return "\\n".join(flags)

entry = daily_checkin()
print(f"Daily Check-In — {entry['date']}")
print(f"  Sleep:    {entry['sleep_hours']}h")
print(f"  Energy:   {entry['energy_level']}/10")
print(f"  Stress:   {entry['stress_level']}/10")
print(f"  Note:     {entry['mood_note']}")
print(f"  ★ Win:    {entry['one_good_thing']}")
print(f"\\nAssessment: {assess_wellbeing(entry)}")

# ── HEALTHY ROUTINE TEMPLATE ────────────────────────────────────────────────
healthy_routine = """
SUSTAINABLE CS STUDENT DAILY ROUTINE:

06:30  Wake up (consistent — same time on weekends within 1 hour)
07:00  Breakfast + review today's priorities (no social media yet)
08:00  Deep work block 1 — hardest task of the day
10:00  Break: 10-min walk outside
10:10  Deep work block 2
12:00  Lunch + real break (leave desk, ideally social)
13:00  Classes or lighter study work
17:00  Exercise (30 min minimum)
18:00  Dinner + social time
19:30  Study block 3 — review + problem practice
21:30  Wind down: no new difficult material
22:00  Prepare for tomorrow, review check-in
22:30  Sleep prep (dim screens, no phone in bed)
23:00  Lights out
"""
print(healthy_routine)`
  },

  {
    title: "Professional Communication and Networking Basics",
    importance_level: "Advanced",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "ISS 166 > Unit 2: Skills for Success",
    first_principles: [
      "Your professional network is a long-term asset built through genuine relationships, not transactional requests",
      "Professional communication is precise, concise, and respectful of the recipient's time",
      "First impressions in professional contexts are formed quickly and are difficult to revise — preparation is essential"
    ],
    learning_objectives: [
      "Write a professional email to a professor, employer, or industry contact",
      "Create a LinkedIn profile that accurately represents your skills and academic experience",
      "Initiate and sustain professional conversations at networking events and career fairs",
      "Request an informational interview or internship opportunity professionally"
    ],
    prerequisites: ["Career Paths in Computer Science"],
    content_markdown: `## Professional Communication and Networking Basics

Technical skill gets you in the room. Communication skill determines what happens once you are there. In CS, where many graduates struggle to articulate their work to non-technical stakeholders, strong professional communication is a genuine competitive advantage.

### Professional Email Writing

Email is still the primary channel for formal professional communication. Every email to a professor, recruiter, or industry contact reflects your professional identity.

**Structure:**
1. **Subject line**: specific and informative — "CS 121 Lab 3 Submission Question" not "Hi" or "Question"
2. **Salutation**: "Dear Professor [Last Name]," or "Hi [First Name]," (if they've invited it)
3. **Opening**: one sentence stating your purpose
4. **Body**: the minimum necessary information to achieve your goal
5. **Closing**: a clear request or next step
6. **Sign-off**: "Best regards, / Sincerely, [Your Full Name, Year, Major]"

**Response time**: Respond to professional emails within 24 hours. Do not leave people waiting.

### LinkedIn: Your Professional Online Presence

LinkedIn is the professional social network used by every major tech company recruiter. A strong profile includes:
- **Headline**: more than just "CS Student at [University]" — say what you are building or interested in
- **About section**: 3–5 sentences about your interests, skills, and where you are headed
- **Education**: your degree program, expected graduation year
- **Skills**: list technical skills and get endorsements from classmates
- **Projects**: even course projects are worth listing with a description and technology stack

Start connecting now: professors, classmates, speakers you meet at events, LinkedIn alumni from your university.

### Networking at Events and Career Fairs

Networking is not about collecting contacts — it is about having genuine conversations. Prepare:
- A 30-second "pitch": who you are, what you study, what you are interested in
- 2–3 questions about the company or person's work (research them beforehand)
- A follow-up email within 24 hours referencing something specific from your conversation

### Informational Interviews

An informational interview is a 20-minute conversation with someone in a role you are interested in. You are not asking for a job — you are asking for insight and advice. This is the most underused networking strategy among students.`,
    content_easy_markdown: `## Professional Communication — Simple Version

How you communicate professionally matters as much as your technical skills.

**Professional email rules:**
1. Clear subject line — specific, not vague
2. Greet properly: "Dear Professor [Name],"
3. State your purpose in the first sentence
4. Keep it short — get to the point
5. Sign off with your full name and year

**LinkedIn basics:**
- Set up a profile in Year 1
- Add your projects, even course work
- Connect with professors and classmates now

**Networking tip:** People love talking about their work. Ask genuine questions. Follow up within 24 hours after any professional conversation.`,
    forge_snippet: `# ── Professional Communication Templates ─────────────────────────────────

# EMAIL TEMPLATES FOR COMMON CS STUDENT SITUATIONS:

templates = {

    "email_to_professor_question": """
Subject: Question about [Course Code] [Assignment Name]

Dear Professor [Last Name],

I hope this message finds you well. I am a student in [Course Code] [Section].

I am working on [Assignment Name] and have a question about [specific aspect].
I have already [what you tried to solve it yourself], but I am still unclear
about [specific point].

Would you be available to clarify during office hours on [day], or could you
point me toward the relevant section of the course materials?

Thank you for your time.

Best regards,
[Your Full Name]
[Student ID]
[Course: CS 121, Section 02]
""",

    "email_cold_networking": """
Subject: CS Student at [University] — Question about your work in [field]

Dear [Name],

My name is [Your Name], and I am a first-year Computer Science student at
[University]. I came across your profile / talk / article on [where you saw them]
and was genuinely interested in your work on [specific topic].

I would be very grateful for 15–20 minutes of your time for an informational
conversation about [what you want to learn]. I am happy to work around your
schedule and can meet via video call at your convenience.

Thank you for considering this — I understand your time is valuable.

Best regards,
[Your Full Name]
[LinkedIn: linkedin.com/in/yourname]
[University, Year, Major]
""",

    "linkedin_about_section": """
First-year Computer Science student at [University] with a strong interest in
[data science / cybersecurity / software engineering — pick one].

Currently building foundations in [Python / Java / C++] through coursework and
personal projects. Working toward a first internship in [target year].

I enjoy [one genuine interest: competitive programming / hackathons / open source].
Always happy to connect with CS students, alumni, and professionals.
""",

    "career_fair_30_second_pitch": """
"Hi, I'm [Name], a first-year CS student at [University].
I'm particularly interested in [specific area: backend development / ML / security].
I've been working on [brief project or coursework example].
I'd love to learn more about what your team does and what you look for in interns.
What does a typical day look like on your [relevant] team?"
""",
}

for name, template in templates.items():
    print(f"\\n── {name.upper().replace('_', ' ')} ──────────────────────────────")
    print(template)`
  },

  {
    title: "Goal Setting and Personal Development Planning",
    importance_level: "Expert",
    estimated_time: "55 mins",
    estimated_time_minutes: 55,
    breadcrumb_path: "ISS 166 > Unit 2: Skills for Success",
    first_principles: [
      "A goal without a plan is a wish — specificity and measurement transform intention into progress",
      "Self-awareness is the prerequisite to effective personal development: you must know where you are to navigate to where you want to be",
      "Regular reflection and adjustment are more important than perfect initial planning"
    ],
    learning_objectives: [
      "Write SMART goals for academic, technical, and professional development",
      "Create a personal development plan for the current semester with measurable milestones",
      "Conduct a personal SWOT analysis to identify strengths, weaknesses, opportunities, and threats",
      "Build a regular review practice (weekly, monthly, semester) to track progress and adapt"
    ],
    prerequisites: ["Time Management for CS Students", "Career Paths in Computer Science"],
    content_markdown: `## Goal Setting and Personal Development Planning

Most students drift through university reacting to deadlines and assignments. The ones who achieve disproportionate outcomes — internships at top companies, research publications, scholarships — tend to set explicit goals and build backward from them.

### SMART Goals Framework

A SMART goal is:
- **S**pecific: clearly defined, not vague
- **M**easurable: you know when it is achieved
- **A**chievable: challenging but realistic
- **R**elevant: aligned with your broader priorities
- **T**ime-bound: has a clear deadline

**Weak goal**: "Get better at programming."
**SMART goal**: "Complete the first five chapters of *Introduction to Algorithms* and solve 30 LeetCode problems on arrays and strings by the end of Week 12."

### Personal SWOT Analysis

A SWOT analysis gives you honest self-awareness about your current position:

| | **Helpful** | **Harmful** |
|---|---|---|
| **Internal** | **Strengths**: skills and attributes you have | **Weaknesses**: areas where you currently fall short |
| **External** | **Opportunities**: resources and circumstances you can leverage | **Threats**: obstacles and risks you need to plan around |

Example for a CS Year 1 student:
- Strengths: strong math background, self-motivated learner
- Weaknesses: no prior programming experience, poor typing speed
- Opportunities: active CS club, summer internship program, supportive professor
- Threats: heavy course load, financial pressure, imposter syndrome

### The Personal Development Plan (PDP)

A PDP is a structured document you update each semester. It captures:
1. **Current state**: skills audit, GPA, experiences
2. **Target state**: where you want to be in 1 and 4 years
3. **Gap analysis**: what is missing between now and the target
4. **Action plan**: specific steps with deadlines to close the gaps
5. **Success metrics**: how you will know you are on track

### Review Cadences

**Weekly**: 10-minute review every Sunday — are you on track with this week's goals?
**Monthly**: 30-minute review — are your semester goals progressing? Any adjustments?
**Semester**: 1-hour review — did you achieve your semester goals? Set goals for next semester.

Consistent reflection and adjustment over four years compounds into an extraordinary trajectory.`,
    content_easy_markdown: `## Goal Setting — Simple Version

Vague goals produce vague results. Be specific.

**SMART goal formula:**
- What exactly will I do?
- How will I know when I'm done?
- By what date?

**Example:**
- Weak: "Learn Python"
- SMART: "Solve 20 LeetCode Easy problems in Python by end of this semester"

**SWOT analysis — ask yourself:**
- What am I good at? (Strengths)
- Where am I weak? (Weaknesses)
- What resources do I have? (Opportunities)
- What could get in my way? (Threats)

**Review your goals every week.** A goal you never revisit is just a wish.`,
    forge_snippet: `# ── Goal Setting and Personal Development Plan ───────────────────────────

from datetime import date, timedelta

# SMART GOAL BUILDER
def create_smart_goal(
    specific: str,
    measurement: str,
    target_value: float,
    current_value: float,
    deadline: date,
    relevance: str,
    weekly_steps: list[str]
) -> dict:
    days_remaining = (deadline - date.today()).days
    return {
        "goal": specific,
        "measurement": measurement,
        "target": target_value,
        "current": current_value,
        "progress_pct": round(current_value / target_value * 100, 1),
        "deadline": deadline.strftime("%Y-%m-%d"),
        "days_remaining": days_remaining,
        "relevance": relevance,
        "weekly_steps": weekly_steps,
    }

def print_goal(g: dict) -> None:
    print(f"\\nGOAL: {g['goal']}")
    print(f"  Progress:  {g['current']}/{g['target']} {g['measurement']} ({g['progress_pct']}%)")
    print(f"  Deadline:  {g['deadline']} ({g['days_remaining']} days)")
    print(f"  Why:       {g['relevance']}")
    print(f"  Steps:")
    for step in g['weekly_steps']:
        print(f"    • {step}")

# Example goals for a Y1 CS student:
goals = [
    create_smart_goal(
        specific="Complete 30 LeetCode Easy problems in Python",
        measurement="problems solved",
        target_value=30,
        current_value=7,
        deadline=date.today() + timedelta(weeks=10),
        relevance="Build algorithmic thinking for internship interviews",
        weekly_steps=[
            "Solve 3 problems every Monday, Wednesday, Friday",
            "Review wrong answers on Sunday",
            "Write a comment explaining the approach for each solution",
        ]
    ),
    create_smart_goal(
        specific="Achieve a GPA of 3.5 or above this semester",
        measurement="GPA points",
        target_value=3.5,
        current_value=3.2,
        deadline=date.today() + timedelta(weeks=8),
        relevance="Keep scholarship and qualify for honors program",
        weekly_steps=[
            "Attend all office hours for MATH 111",
            "Complete ENG 101 essay one week before deadline for revision time",
            "Do a practice test under exam conditions for each midterm",
        ]
    ),
]

print("═" * 55)
print("  PERSONAL DEVELOPMENT PLAN — SEMESTER GOALS")
print("═" * 55)
for g in goals:
    print_goal(g)

# ── SWOT ANALYSIS TEMPLATE ──────────────────────────────────────────────────
swot_template = """
PERSONAL SWOT ANALYSIS — {name} — {date}

STRENGTHS (internal, helpful):
  +
  +
  +

WEAKNESSES (internal, to improve):
  -
  -
  -

OPPORTUNITIES (external, to leverage):
  →
  →

THREATS (external, to plan around):
  ⚠
  ⚠

KEY INSIGHT:
  "To reach [goal], I should leverage [strength] and [opportunity]
   while addressing [weakness] before [threat] becomes a problem."
"""
print(swot_template.format(name="[Your Name]", date=date.today().strftime("%Y-%m-%d")))`
  }
];

async function seed() {
  try {
    console.log("🎓 Seeding ISS 166: Freshman Seminar topics...");
    const courseRes = await pool.query(
      "SELECT id FROM courses WHERE name ILIKE '%ISS 166%' LIMIT 1"
    );
    if (courseRes.rows.length === 0) {
      throw new Error("ISS 166 not found. Run seed_curriculum.js first.");
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
    console.log(`\n✅ ISS 166 done — ${topics.length} topics seeded.\n`);
  } catch (err) {
    console.error("❌ ISS 166 seeding failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed();
