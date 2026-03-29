import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });
import pool from "../config/db.js";

const topics = [
  {
    title: "Academic Vocabulary Building",
    importance_level: "Essential",
    estimated_time: "30 mins",
    estimated_time_minutes: 30,
    breadcrumb_path: "ENG 101 > Unit 1",
    first_principles: [
      "Language precision directly affects how well your ideas are understood.",
      "A strong academic vocabulary signals credibility and discipline membership.",
      "Words carry connotation — choosing the right word changes the meaning of an argument."
    ],
    learning_objectives: [
      "Identify and use tier-2 and tier-3 academic vocabulary correctly.",
      "Understand the difference between informal, general, and discipline-specific vocabulary.",
      "Apply new vocabulary in sentence-level and paragraph-level writing."
    ],
    prerequisites: [],
    content_markdown: `## Academic Vocabulary Building

Academic writing demands a vocabulary that is precise, formal, and appropriate to the discipline. There are three tiers of vocabulary to understand: **Tier 1** (everyday words like *house* or *run*), **Tier 2** (cross-disciplinary academic words like *analyze*, *evaluate*, *contrast*), and **Tier 3** (subject-specific terms like *algorithm* or *syntax* in CS).

### Why It Matters

Readers of academic work — professors, peers, and employers — judge writing quality partly on vocabulary. Using vague or informal words (*stuff*, *a lot*, *really good*) undermines your argument. Compare:

> Weak: "There are a lot of problems with this approach."
> Strong: "This approach presents several significant limitations."

### Strategies for Building Vocabulary

1. **Read actively**: When you encounter an unfamiliar academic word, write it down with its context sentence.
2. **Use a vocabulary journal**: Record new words with their definition, part of speech, and an example sentence you write yourself.
3. **Learn word families**: If you know *analyze*, extend it — *analysis*, *analytical*, *analytically*.
4. **Use the Academic Word List (AWL)**: The AWL contains 570 word families covering ~10% of academic texts. Studying it systematically is efficient.
5. **Practice in writing**: Don't just recognize words — use them. Write a sentence using each new word within 24 hours of learning it.

### Common Mistakes

- Choosing complex words for their own sake (*utilize* when *use* is clearer).
- Misusing hedging language (*this proves* vs. *this suggests*).
- Ignoring collocations — words that naturally go together (*conduct research*, not *do research*).

Consistent exposure and deliberate practice are the most reliable paths to an expanded academic vocabulary.`,
    content_easy_markdown: `## Academic Vocabulary — Simple Version

Academic writing needs formal, precise words. There are three word levels: everyday words, cross-subject academic words (like *analyze* or *evaluate*), and subject-specific terms.

To improve your vocabulary: read often, keep a vocabulary journal, and learn word families. Practice using new words in your own sentences right away.

Avoid informal words like *stuff* or *a lot* in essays. Instead, choose words that are clear and specific. The Academic Word List is a great free resource to study.`,
    forge_snippet: `# Vocabulary Journal Template

| Word         | Part of Speech | Definition                          | My Example Sentence                                    |
|--------------|----------------|-------------------------------------|--------------------------------------------------------|
| analyze      | verb           | examine something in detail         | We will analyze the efficiency of three sorting algorithms. |
| evaluate     | verb           | assess the value or quality of sth  | The report evaluates the trade-offs between speed and memory. |
| significant  | adjective      | important or meaningful             | The results show a significant improvement in runtime.  |
| demonstrate  | verb           | show clearly using evidence         | The experiment demonstrates that the hypothesis is valid. |
| methodology  | noun           | a system of methods used in a field | The methodology section explains how data was collected. |`
  },
  {
    title: "Reading Strategies for Technical Texts",
    importance_level: "Essential",
    estimated_time: "35 mins",
    estimated_time_minutes: 35,
    breadcrumb_path: "ENG 101 > Unit 1",
    first_principles: [
      "Reading is an active process, not a passive one.",
      "Different texts require different reading approaches.",
      "Comprehension improves when you engage with a text before, during, and after reading."
    ],
    learning_objectives: [
      "Apply the SQ3R method to technical and academic reading.",
      "Identify main ideas, supporting details, and authorial purpose in a text.",
      "Annotate texts effectively to aid comprehension and retention."
    ],
    prerequisites: ["Academic Vocabulary Building"],
    content_markdown: `## Reading Strategies for Technical Texts

Technical and academic texts are dense by design. They assume background knowledge, use specialized vocabulary, and pack multiple ideas into single paragraphs. Reading them the same way you read a novel will leave you confused and slow.

### The SQ3R Method

SQ3R is one of the most researched active-reading frameworks:

1. **Survey**: Skim the entire text first. Read headings, subheadings, the introduction, conclusion, and any bold terms. Build a mental map before you read.
2. **Question**: Turn each heading into a question. "Sorting Algorithms" becomes "What are sorting algorithms and why do they matter?" This gives your reading a purpose.
3. **Read**: Read one section at a time with your question in mind. Look for the answer.
4. **Recite**: After each section, close the text and explain the main idea in your own words — out loud or in writing.
5. **Review**: After finishing, review your notes and the full text outline. Identify any gaps.

### Annotation Techniques

Active annotation transforms passive reading into a dialogue with the text:

- **Underline** key claims and definitions.
- **Circle** terms you don't understand and look them up immediately.
- **Write margin notes** summarizing paragraphs in one sentence.
- **Use symbols**: a *?* for confusion, a *!* for important points, an arrow (→) to link related ideas.

### Reading Technical Documentation

CS courses often require reading documentation, RFCs, and data sheets. For these:

- Read the purpose/overview first.
- Skip to examples before reading the full specification.
- Test the examples yourself as you read.

Consistent application of these strategies reduces re-reading time and significantly improves retention.`,
    content_easy_markdown: `## Reading Technical Texts — Simple Version

Technical texts are dense and require active reading, not passive scanning. Use the SQ3R method: Survey the text first, turn headings into Questions, Read for answers, Recite the main ideas in your own words, then Review your notes.

While reading, annotate: underline key points, circle unknown words, and write short margin notes. For technical documentation, always read examples before the full specification. These habits reduce re-reading time and help you remember more.`,
    forge_snippet: `# SQ3R Reading Worksheet

**Text title:** _______________________________________________
**Reading goal (why am I reading this?):** ___________________

## Survey — Skim & Map
- Main topic: _______________
- Key headings/sections listed:
  1. ___
  2. ___
  3. ___

## Question — Turn headings into questions
| Heading            | My Question                              |
|--------------------|------------------------------------------|
|                    |                                          |
|                    |                                          |

## Read & Recite — After each section, summarize in 1-2 sentences
| Section            | My Summary (in my own words)             |
|--------------------|------------------------------------------|
|                    |                                          |
|                    |                                          |

## Review — What were the 3 most important ideas?
1. ___
2. ___
3. ___`
  },
  {
    title: "Paragraph Structure and Coherence",
    importance_level: "Essential",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "ENG 101 > Unit 2",
    first_principles: [
      "A paragraph is a unit of thought — one main idea, fully developed.",
      "Coherence means ideas connect logically; cohesion means the language connects them explicitly.",
      "Readers should never have to guess how sentences relate to each other."
    ],
    learning_objectives: [
      "Write a well-structured paragraph using the PEEL or TEEL method.",
      "Use transitional phrases to create cohesion between sentences and paragraphs.",
      "Identify and fix common paragraph problems: lack of focus, unsupported claims, abrupt endings."
    ],
    prerequisites: ["Academic Vocabulary Building"],
    content_markdown: `## Paragraph Structure and Coherence

Every strong academic paragraph has a clear internal logic. The reader should be able to identify the main point, follow the reasoning, and understand how it connects to the essay's larger argument.

### The PEEL Structure

**P — Point**: State the main idea of the paragraph in one sentence (the topic sentence).
**E — Evidence**: Provide data, a quotation, or a specific example to support the point.
**E — Explanation**: Explain *how* the evidence supports your point. This is the step most students skip.
**L — Link**: Connect back to the essay question or to the next paragraph.

#### Example (CS context):

> **[Point]** Object-oriented programming promotes code reusability through the principle of inheritance. **[Evidence]** In Python, a \`Car\` class can inherit attributes like \`speed\` and \`fuel\` from a parent \`Vehicle\` class, avoiding redundant code. **[Explanation]** This means developers can extend functionality without rewriting existing logic, reducing both development time and the potential for bugs. **[Link]** This reusability principle is central to understanding why OOP became the dominant paradigm in large-scale software development.

### Coherence and Cohesion

**Coherence** = the ideas are logically connected.
**Cohesion** = the language signals those connections.

Use these cohesive devices:
- **Addition**: furthermore, in addition, moreover
- **Contrast**: however, on the other hand, nevertheless
- **Cause/Effect**: therefore, consequently, as a result
- **Illustration**: for example, specifically, to illustrate
- **Summary**: in conclusion, overall, to summarize

### Common Paragraph Mistakes

1. Two or more unrelated ideas in the same paragraph.
2. Evidence presented without any explanation.
3. Topic sentences that are too vague ("This topic is important").
4. No connection between the paragraph and the essay question.

Applying PEEL consistently gives your writing a professional, logical rhythm.`,
    content_easy_markdown: `## Paragraph Structure — Simple Version

A good paragraph has one main idea and follows a clear structure. Use PEEL: **Point** (your main claim), **Evidence** (a fact or example), **Explanation** (why the evidence matters), and **Link** (connect to the next idea or essay question).

Use transition words like *however*, *therefore*, and *furthermore* to connect your sentences smoothly. Avoid putting two different ideas in one paragraph, and never leave evidence unexplained. One paragraph = one idea, fully developed.`,
    forge_snippet: `# PEEL Paragraph Template

**Essay Question / Topic:** ___________________________________

**[P] Topic Sentence — State your main point:**
> ___________________________________________________________

**[E] Evidence — Quote, statistic, or example:**
> According to ___________, "___________" / For example, ___________

**[E] Explanation — Why does this evidence support your point?**
> This demonstrates that _______________________________________
> because ____________________________________________________

**[L] Link — Connect back to the essay question or next idea:**
> Therefore, _________________ / This highlights the importance of ___________

---
**Checklist before submitting:**
- [ ] Topic sentence states ONE clear idea
- [ ] Evidence is specific (not vague)
- [ ] Explanation is present and in my own words
- [ ] Link sentence is included`
  },
  {
    title: "The Essay Writing Process",
    importance_level: "Essential",
    estimated_time: "45 mins",
    estimated_time_minutes: 45,
    breadcrumb_path: "ENG 101 > Unit 2",
    first_principles: [
      "Writing is a process, not an event — quality comes from revision, not first drafts.",
      "An essay argues a position; it does not merely describe or list facts.",
      "Every sentence should serve the thesis."
    ],
    learning_objectives: [
      "Write a focused thesis statement that is arguable, specific, and supported.",
      "Produce a structured essay outline before drafting.",
      "Apply a multi-stage writing process: plan, draft, revise, edit, proofread."
    ],
    prerequisites: ["Paragraph Structure and Coherence"],
    content_markdown: `## The Essay Writing Process

Many students treat essay writing as a single event: sit down, write, submit. This approach produces weak work. Professional and academic writers treat writing as a **multi-stage process**.

### Stage 1: Understand the Prompt

Before writing a single word, analyze the assignment:
- What is the **topic**?
- What **task words** are used? (*Discuss*, *analyze*, *compare*, *evaluate* — these require different approaches.)
- What is the **scope** (length, sources required, citation style)?

### Stage 2: Brainstorm and Research

Generate ideas freely. Use mind maps or bullet lists. Then research to find evidence that supports or challenges your initial ideas. Let your argument evolve.

### Stage 3: Thesis and Outline

Your **thesis statement** is the core claim of the essay. It must be:
- **Arguable** (not a fact everyone agrees with)
- **Specific** (not too broad)
- **Supported** by evidence you have

> Weak thesis: "Programming is important."
> Strong thesis: "Teaching Python as a first language in secondary schools produces stronger computational thinking than block-based languages because it exposes students to real syntax and debugging from the start."

Then build your outline: introduction → body paragraphs (each with a topic sentence) → conclusion.

### Stage 4: Draft

Write without stopping to perfect every sentence. Get ideas on the page. Leave gaps if needed.

### Stage 5: Revise

Revise at the **macro level** first: Does the argument flow? Is each paragraph necessary? Does the conclusion reflect the body?

### Stage 6: Edit and Proofread

Edit for sentence clarity, word choice, and grammar. Proofread last — read slowly, out loud, or backward.

Treat each stage as a distinct task. This separation dramatically improves the final product.`,
    content_easy_markdown: `## Essay Writing Process — Simple Version

Writing a good essay takes multiple steps, not one sitting. First, read the prompt carefully and understand what task words like *analyze* or *compare* mean. Then brainstorm ideas and research evidence. Write a thesis — your main argument — before drafting.

Draft freely, then revise for structure and argument. Edit for grammar last. Revising and editing are separate steps: revising checks logic, editing checks language. This process approach always produces better work than writing once and submitting.`,
    forge_snippet: `# Essay Planning Template

**Assignment prompt:** ________________________________________
**Task word(s):** _____________ **Word count:** _____ **Due date:** _____

## Thesis Statement (draft)
> ___________________________________________________________

## Outline

**Introduction**
- Hook: ___________________________________________________
- Background: ______________________________________________
- Thesis: __________________________________________________

**Body Paragraph 1**
- Topic sentence: ____________________________________________
- Evidence: _________________________________________________
- Explanation: ______________________________________________

**Body Paragraph 2**
- Topic sentence: ____________________________________________
- Evidence: _________________________________________________
- Explanation: ______________________________________________

**Body Paragraph 3**
- Topic sentence: ____________________________________________
- Evidence: _________________________________________________
- Explanation: ______________________________________________

**Conclusion**
- Restate thesis (new words): __________________________________
- Summarize key points: ______________________________________
- Closing thought / implication: _________________________________

## Writing Process Checklist
- [ ] Prompt analyzed
- [ ] Thesis is arguable and specific
- [ ] Outline complete before drafting
- [ ] Draft completed
- [ ] Revised (structure / argument)
- [ ] Edited (language / grammar)
- [ ] Proofread`
  },
  {
    title: "Technical Writing Conventions",
    importance_level: "Essential",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "ENG 101 > Unit 3",
    first_principles: [
      "Technical writing prioritizes clarity and accuracy over style.",
      "The reader's need to act on the information shapes every decision.",
      "Consistency in format, terminology, and tone is a technical virtue."
    ],
    learning_objectives: [
      "Distinguish technical writing from academic and creative writing.",
      "Apply conventions of technical writing: active voice, plain language, numbered steps.",
      "Structure a short technical document (memo, instructions, or brief report)."
    ],
    prerequisites: ["The Essay Writing Process"],
    content_markdown: `## Technical Writing Conventions

Technical writing is the craft of communicating complex, specialized information to a specific audience who needs to understand or act on it. It is used in software documentation, engineering reports, user manuals, and professional emails.

### Key Principles

**1. Clarity over cleverness**
Write to be understood immediately. Avoid ornate sentences. Use short, declarative statements.

> Instead of: "It is important to note that the configuration file must be modified prior to the initialization of the system."
> Write: "Edit the configuration file before starting the system."

**2. Use active voice**
Active voice is direct and reduces ambiguity.

> Passive: "The function was called by the main module."
> Active: "The main module calls the function."

**3. Plain language**
Use the simplest word that accurately conveys the meaning. Avoid jargon when writing for a non-specialist audience.

**4. Consistent terminology**
If you call something a "user account" in paragraph one, do not call it a "profile" or "member record" later. Consistency prevents confusion.

**5. Structured formatting**
Use headings, numbered lists for sequential steps, bullet points for non-sequential items, and tables for comparisons. White space aids readability.

### Writing Numbered Instructions

For step-by-step procedures:
1. Start each step with an **imperative verb** (*Click*, *Enter*, *Select*, *Open*).
2. Cover **one action per step**.
3. Include expected outcomes where helpful: "Click Submit. A confirmation email will be sent."

### Audience Awareness

Before writing any technical document, identify your audience:
- What do they already know?
- What do they need to be able to do after reading?
- What format do they expect?

Answering these questions shapes every decision from vocabulary to document length.`,
    content_easy_markdown: `## Technical Writing — Simple Version

Technical writing communicates complex information clearly so the reader can understand or act on it. The key rules are: be clear, use active voice, use plain language, and stay consistent with your terms.

Format matters too — use numbered lists for steps, bullet points for options, and headings to organize sections. Every step in an instruction list should start with an action verb and cover one action only. Always write for your audience: think about what they know and what they need to do.`,
    forge_snippet: `# Technical Instructions Template

**Document title:** How to ______________________________________
**Audience:** ________________________________________________
**Prerequisites (what the user needs before starting):** ____________

---

## Overview
This guide explains how to _____________________________________.
It takes approximately _____ minutes.

## Requirements
- ___________________________________________________________
- ___________________________________________________________

## Steps

1. **[Action verb + object]** ____________________________________
   > Expected result: _________________________________________

2. **[Action verb + object]** ____________________________________
   > Expected result: _________________________________________

3. **[Action verb + object]** ____________________________________
   > Expected result: _________________________________________

## Troubleshooting

| Problem                        | Solution                        |
|--------------------------------|---------------------------------|
|                                |                                 |
|                                |                                 |

## Notes / Warnings
> **Note:** ___________________________________________________
> **Warning:** ________________________________________________`
  },
  {
    title: "Grammar: Complex and Compound Sentences",
    importance_level: "Essential",
    estimated_time: "35 mins",
    estimated_time_minutes: 35,
    breadcrumb_path: "ENG 101 > Unit 3",
    first_principles: [
      "Sentence variety signals a mature, controlled writing style.",
      "The relationship between ideas determines the sentence structure to use.",
      "Punctuation is not decoration — it signals the grammar of a sentence."
    ],
    learning_objectives: [
      "Identify and correctly write simple, compound, and complex sentences.",
      "Use coordinating and subordinating conjunctions to express relationships between ideas.",
      "Avoid common errors: run-on sentences, comma splices, and sentence fragments."
    ],
    prerequisites: ["Paragraph Structure and Coherence"],
    content_markdown: `## Grammar: Complex and Compound Sentences

Sentence variety is a hallmark of mature academic writing. Stringing together only simple sentences makes writing feel choppy. Overusing one structure makes it monotonous. The key is knowing when and how to combine ideas.

### Sentence Types

| Type | Structure | Example |
|------|-----------|---------|
| Simple | One independent clause | "Python is readable." |
| Compound | Two independent clauses joined by a coordinating conjunction (FANBOYS) | "Python is readable, and it is widely used in data science." |
| Complex | One independent + one dependent clause | "Although Python is readable, mastering it requires consistent practice." |
| Compound-Complex | Two independent + at least one dependent | "Python is readable, and it is widely used, although other languages are faster." |

### Coordinating Conjunctions (FANBOYS)
**F**or, **A**nd, **N**or, **B**ut, **O**r, **Y**et, **S**o

Use a **comma before** the conjunction in a compound sentence:
> "The program compiled, **but** it produced incorrect output."

### Subordinating Conjunctions
*although, because, since, while, if, unless, whenever, after, before, until*

The dependent clause can come first (followed by a comma) or second (no comma needed):
> "**Because** the loop was infinite, the program crashed." ✓
> "The program crashed **because** the loop was infinite." ✓

### Common Errors

- **Run-on sentence**: Two independent clauses with no punctuation or conjunction.
  > Wrong: "The test failed the logic was incorrect."
  > Correct: "The test failed because the logic was incorrect."

- **Comma splice**: Two independent clauses joined only by a comma.
  > Wrong: "The test failed, the logic was incorrect."
  > Correct: "The test failed; the logic was incorrect."

- **Fragment**: A dependent clause or phrase presented as a sentence.
  > Wrong: "Although the test failed."
  > Correct: "Although the test failed, the code was revised."

Practice rewriting your own sentences to vary structure deliberately.`,
    content_easy_markdown: `## Compound & Complex Sentences — Simple Version

Simple sentences are fine, but using only simple sentences makes writing choppy. Compound sentences join two complete ideas using words like *and*, *but*, or *so* (FANBOYS) with a comma. Complex sentences add a dependent clause using words like *because*, *although*, or *while*.

Avoid run-ons (two sentences with no punctuation), comma splices (two sentences joined by only a comma), and fragments (incomplete sentences). Varying your sentence types makes academic writing sound more confident and controlled.`,
    forge_snippet: `# Sentence Type Practice

## Combine these ideas — practice writing each sentence type:

**Ideas:** "The algorithm runs in O(n²) time." / "It produces correct results."

1. **Compound** (use FANBOYS):
   > _______________________________________________________

2. **Complex** (use although/even though):
   > _______________________________________________________

3. **Compound-Complex** (combine both techniques):
   > _______________________________________________________

---

## Error Correction Practice

Fix each sentence:

| Error Type     | Incorrect                                              | Your Correction                   |
|----------------|--------------------------------------------------------|-----------------------------------|
| Run-on         | The server crashed the database was corrupted.         |                                   |
| Comma splice   | The test passed, the code was ready to deploy.         |                                   |
| Fragment       | Because the memory was not freed.                      |                                   |
| Run-on         | Recursion is powerful it can cause stack overflow.     |                                   |`
  },
  {
    title: "Citation Styles and Academic Integrity",
    importance_level: "Advanced",
    estimated_time: "45 mins",
    estimated_time_minutes: 45,
    breadcrumb_path: "ENG 101 > Unit 4",
    first_principles: [
      "Citation is not bureaucratic formality — it is intellectual honesty.",
      "Every idea that is not your own must be attributed to its source.",
      "Plagiarism harms both the original author and the academic community."
    ],
    learning_objectives: [
      "Correctly format in-text citations and reference lists in APA and IEEE styles.",
      "Distinguish between quoting, paraphrasing, and summarizing — and when to use each.",
      "Define plagiarism and identify its different forms, including self-plagiarism."
    ],
    prerequisites: ["The Essay Writing Process", "Research Skills and Note-Taking"],
    content_markdown: `## Citation Styles and Academic Integrity

Citing sources is a fundamental academic skill. It gives credit to original authors, allows readers to verify your claims, and situates your work within the scholarly conversation.

### Why Citation Matters

- It is **ethically required**: using someone's ideas without attribution is theft.
- It **strengthens your argument**: cited evidence is more credible than unsupported claims.
- It **protects you**: documented sources prove you did legitimate research.

### APA Style (Common in Social Sciences)

**In-text**: (Author, Year) or (Author, Year, p. XX) for direct quotes.
> "Structured programming reduces cognitive load (Dijkstra, 1968)."

**Reference list entry (journal article)**:
> Dijkstra, E. W. (1968). Go to statement considered harmful. *Communications of the ACM, 11*(3), 147–148.

### IEEE Style (Common in Engineering and CS)

**In-text**: Numbered references in brackets [1].
> "Structured programming reduces cognitive load [1]."

**Reference list**:
> [1] E. W. Dijkstra, "Go to statement considered harmful," *Commun. ACM*, vol. 11, no. 3, pp. 147–148, Mar. 1968.

### Quoting vs. Paraphrasing vs. Summarizing

| Technique | When to use | Citation needed? |
|-----------|-------------|-----------------|
| **Quote** | Exact wording matters (a definition, a key phrase) | Yes |
| **Paraphrase** | You restate one idea in your own words | Yes |
| **Summarize** | You condense a longer argument | Yes |

**All three require citation.** Paraphrasing does not eliminate the need for attribution.

### Forms of Plagiarism

- **Direct plagiarism**: Copying text without quotation marks or citation.
- **Mosaic plagiarism**: Replacing a few words in a copied passage.
- **Improper paraphrase**: Changing words but keeping the sentence structure without citation.
- **Self-plagiarism**: Submitting work from a previous course as new work.

When in doubt, cite.`,
    content_easy_markdown: `## Citation and Academic Integrity — Simple Version

You must cite every source you use — even when you paraphrase. Citation is not just a rule; it is honesty. Common styles are APA (Author, Year) and IEEE [numbered brackets].

Plagiarism means using someone else's ideas without credit. This includes copying, paraphrasing without citation, and even submitting your own old work again. Quoting, paraphrasing, and summarizing all require a citation. When you are unsure whether to cite something, always cite it.`,
    forge_snippet: `# Citation Quick Reference

## APA In-Text
- One author:    (Smith, 2021)
- Two authors:   (Smith & Jones, 2021)
- Direct quote:  (Smith, 2021, p. 45)
- No author:     ("Article Title," 2021)

## APA Reference List Examples
**Journal article:**
> Smith, J. A. (2021). Title of article. *Journal Name, 12*(3), 45–58. https://doi.org/xxxxx

**Book:**
> Smith, J. A. (2020). *Title of book* (2nd ed.). Publisher Name.

**Website:**
> Smith, J. A. (2021, March 15). *Title of page*. Site Name. https://www.example.com

---

## IEEE In-Text
- Single ref:   [1]
- Multiple:     [1], [2], [3] or [1]–[3]

## IEEE Reference List Example
**Journal:**
> [1] J. A. Smith, "Title of article," *J. Name*, vol. 12, no. 3, pp. 45–58, Mar. 2021.

**Conference paper:**
> [2] J. A. Smith and B. Jones, "Paper title," in *Proc. Conf. Name*, City, Country, 2021, pp. 100–105.

---

## Self-Check Before Submitting
- [ ] Every quote has quotation marks AND a citation
- [ ] Every paraphrase has a citation (even without quote marks)
- [ ] Reference list matches every in-text citation
- [ ] Citation style is consistent throughout`
  },
  {
    title: "Research Skills and Note-Taking",
    importance_level: "Advanced",
    estimated_time: "45 mins",
    estimated_time_minutes: 45,
    breadcrumb_path: "ENG 101 > Unit 4",
    first_principles: [
      "Research is a conversation with existing knowledge — you must understand it before contributing to it.",
      "Not all sources are equal; evaluating source credibility is a core academic skill.",
      "Notes taken in your own words are more useful than copied text."
    ],
    learning_objectives: [
      "Evaluate sources using the CRAAP test or similar framework.",
      "Locate academic sources using databases such as Google Scholar, IEEE Xplore, or ACM DL.",
      "Use the Cornell Note-Taking System and synthesis notes to organize research."
    ],
    prerequisites: ["Reading Strategies for Technical Texts"],
    content_markdown: `## Research Skills and Note-Taking

Effective research is not about finding any source — it is about finding the right sources and extracting information from them systematically.

### Evaluating Sources: The CRAAP Test

Use these five criteria to evaluate any source:

| Criterion | Questions to ask |
|-----------|-----------------|
| **Currency** | When was it published? Is the field fast-moving? |
| **Relevance** | Does it directly address your research question? |
| **Authority** | Who is the author? What are their credentials? |
| **Accuracy** | Is it peer-reviewed? Are claims supported by evidence? |
| **Purpose** | Is it informing, selling, or persuading? Any bias? |

### Finding Academic Sources

For CS topics, use these databases:
- **Google Scholar**: Free, broad coverage.
- **IEEE Xplore** (ieeexplore.ieee.org): Engineering and CS journals/conferences.
- **ACM Digital Library** (dl.acm.org): Computing-focused papers.
- **Your university library portal**: Often provides free access to journals unavailable elsewhere.

Search tip: Use **Boolean operators** to refine searches.
- AND narrows results: *machine learning AND fairness*
- OR broadens: *neural network OR deep learning*
- NOT excludes: *sorting algorithm NOT bubble sort*

### The Cornell Note-Taking System

Divide your page into three sections:
- **Notes column** (right, ~70%): Main ideas and details as you read.
- **Cue column** (left, ~30%): Keywords, questions, or headings you add after reading.
- **Summary box** (bottom): A 2–3 sentence summary of the page, written in your own words.

The cue column and summary force you to **process** the information, not just transcribe it.

### Synthesis Notes

Once you have notes from multiple sources, create a synthesis table:

| Theme / Argument | Source A | Source B | Source C |
|-----------------|----------|----------|----------|
| Definition      | ...      | ...      | ...      |
| Key claim       | ...      | ...      | ...      |

This structure reveals agreements, contradictions, and gaps in the literature.`,
    content_easy_markdown: `## Research Skills — Simple Version

Good research means finding reliable sources and taking notes you can actually use. Evaluate every source with the CRAAP test: check Currency, Relevance, Authority, Accuracy, and Purpose.

Use academic databases like Google Scholar, IEEE Xplore, or the ACM Digital Library for CS topics. Use Boolean operators (AND, OR, NOT) to refine searches. Take notes using the Cornell method: write details on the right, keywords on the left, and a summary at the bottom — always in your own words.`,
    forge_snippet: `# Cornell Notes Template

**Source:** _________________________________________________
**Date:** _____________ **Topic:** __________________________

| CUE COLUMN (keywords/questions) | NOTES COLUMN (main ideas, details, examples)       |
|----------------------------------|----------------------------------------------------|
|                                  |                                                    |
|                                  |                                                    |
|                                  |                                                    |
|                                  |                                                    |

**SUMMARY** (Write 2–3 sentences in your own words after reading):
> ___________________________________________________________
> ___________________________________________________________

---

# Source Evaluation (CRAAP)
**Source:** ________________________________________________
- Currency (date): ___________ Acceptable? Y / N
- Relevance: Y / N — Why: ___________________________________
- Authority (author/publisher): _______________________________
- Accuracy (peer-reviewed?): Y / N
- Purpose (inform/sell/persuade): _____________________________
**Overall verdict:** Use / Do not use — Reason: _______________`
  },
  {
    title: "Oral Presentation Skills",
    importance_level: "Advanced",
    estimated_time: "40 mins",
    estimated_time_minutes: 40,
    breadcrumb_path: "ENG 101 > Unit 5",
    first_principles: [
      "Oral communication is a skill — it improves with deliberate practice, not just exposure.",
      "The audience's understanding, not the speaker's comfort, is the primary goal.",
      "Non-verbal communication reinforces or undermines the spoken message."
    ],
    learning_objectives: [
      "Structure a short academic oral presentation with a clear introduction, body, and conclusion.",
      "Apply techniques for managing nervousness and projecting confidence.",
      "Design supporting slides that enhance, not duplicate, the spoken content."
    ],
    prerequisites: ["The Essay Writing Process"],
    content_markdown: `## Oral Presentation Skills

In CS careers, you will present technical work to peers, clients, and managers. The ability to communicate complex ideas clearly and confidently is as valuable as the technical work itself.

### Structure Your Presentation

Follow the classic three-part structure:

**Introduction (10–15% of time)**
- Open with a hook: a surprising fact, a question, or a brief scenario.
- State your topic and why it matters to this audience.
- Preview your main points: "I will cover three areas: X, Y, and Z."

**Body (70–80% of time)**
- Cover 2–4 main points, each introduced with a signpost: "Moving on to my second point..."
- Use concrete examples and visuals to illustrate abstract ideas.
- Pause after each main point to let it land.

**Conclusion (10% of time)**
- Summarize key points: "Today I've shown that..."
- Deliver a clear closing statement — do not trail off.
- Open for questions: "I'm happy to take any questions."

### Managing Nervousness

Nervousness is energy — the goal is to redirect it, not eliminate it.
- **Prepare thoroughly**: confidence comes from knowing your material.
- **Practice out loud**, not just in your head. Time yourself.
- **Breathe**: slow, deep breaths before you begin slow your heart rate.
- **Make eye contact** with friendly faces in the audience at the start.

### Slide Design Principles

- **One idea per slide**: If you need two minutes to explain a slide, split it.
- **Minimal text**: Use bullet points of 5–7 words, not full sentences.
- **Visuals over text**: A clear diagram explains code architecture faster than a paragraph.
- **Contrast and font size**: Text must be readable from the back of the room (minimum 24pt font).
- **Do not read your slides**: You are the presentation; slides are the visual aid.

Practice in front of a mirror or record yourself. Watching a recording is uncomfortable but highly effective.`,
    content_easy_markdown: `## Oral Presentation Skills — Simple Version

A good presentation has three parts: introduction (hook + preview), body (2–4 clear points with examples), and conclusion (summary + closing). Always tell the audience what you will cover before you cover it.

To manage nerves, prepare thoroughly and practice out loud. Breathe deeply before you start and make eye contact. For slides, use one idea per slide, minimal text, and clear visuals. Never just read your slides — they support you, they are not your script.`,
    forge_snippet: `# Presentation Planning Template

**Topic:** ________________________________________________
**Duration:** ________ mins  **Audience:** ________________

## Introduction (~____  mins)
- Hook (question/fact/scenario): ____________________________
- Topic statement: _________________________________________
- Preview: "Today I will cover: (1) _______, (2) _______, (3) _______."

## Body

### Point 1 (~____ mins)
- Signpost: "Let's start with..."
- Main idea: ______________________________________________
- Example / Visual: ________________________________________
- Transition: "Now that we've covered X, let's look at Y..."

### Point 2 (~____ mins)
- Main idea: ______________________________________________
- Example / Visual: ________________________________________
- Transition: _______________________________________________

### Point 3 (~____ mins)
- Main idea: ______________________________________________
- Example / Visual: ________________________________________

## Conclusion (~____ mins)
- Summary: "Today I've shown that..."
- Closing statement: ________________________________________
- Q&A prompt: "I'm happy to take any questions."

## Slide Checklist
- [ ] Max 1 idea per slide
- [ ] No full sentences on slides
- [ ] Font >= 24pt
- [ ] Slides rehearsed (not read)`
  },
  {
    title: "Active Listening and Discussion",
    importance_level: "Advanced",
    estimated_time: "30 mins",
    estimated_time_minutes: 30,
    breadcrumb_path: "ENG 101 > Unit 5",
    first_principles: [
      "Listening is not waiting to speak — it is actively constructing meaning from what is said.",
      "Academic discussion requires building on others' ideas, not just asserting your own.",
      "Respectful disagreement is a core intellectual skill."
    ],
    learning_objectives: [
      "Apply active listening techniques in lecture and seminar settings.",
      "Contribute to academic discussions using appropriate discourse markers.",
      "Respond to opposing views critically and respectfully."
    ],
    prerequisites: ["Academic Vocabulary Building"],
    content_markdown: `## Active Listening and Discussion

University-level learning happens largely through dialogue — lectures, seminars, group projects, and peer review. Students who listen actively and participate effectively get more from every interaction.

### Active Listening Techniques

**1. Focus completely**
Remove distractions — close unrelated tabs, put your phone face-down. You cannot listen deeply while multitasking.

**2. Take structured notes**
Don't transcribe everything. Listen for the main point, evidence, and the speaker's conclusion. Note down questions as they arise.

**3. Reflect back**
After a speaker finishes, mentally summarize: "The main point was ____ because ____." This checks your comprehension and reveals gaps.

**4. Ask clarifying questions**
"Could you explain what you mean by ____?"
"Are you saying that ____?"

### Contributing to Academic Discussions

Use these discourse markers to structure contributions:

| Function | Phrases |
|----------|---------|
| Agreeing | "I'd agree with that because..." / "Building on that point..." |
| Disagreeing | "I see it differently because..." / "That's one perspective, but..." |
| Adding | "In addition to that..." / "Another angle worth considering is..." |
| Clarifying | "What I mean is..." / "To put it another way..." |
| Summarizing | "So the key point here is..." / "In essence, we're saying..." |

### Respectful Disagreement

Disagreement is intellectually productive when it targets the argument, not the person.

- **Attack the idea**: "That claim seems to assume X, but the evidence suggests Y."
- **Not the person**: Never say "That's wrong" or dismiss without reasoning.
- **Acknowledge merit**: "I understand the logic of that argument; however..."

### In Seminars and Tutorials

Preparation is the foundation of good participation. If you have read the assigned material and thought about the questions in advance, contributing becomes significantly easier. Even asking a genuine question counts as active participation.`,
    content_easy_markdown: `## Active Listening and Discussion — Simple Version

Active listening means focusing fully on the speaker, not just waiting for your turn to talk. Take structured notes, mentally summarize what was said, and ask clarifying questions when confused.

In discussions, use phrases like "Building on that point..." to agree, or "I see it differently because..." to respectfully disagree. Always argue against ideas, never against people. Prepare before seminars by reading assigned material — preparation is what makes confident participation possible.`,
    forge_snippet: `# Discussion Participation Self-Assessment

**Session / Topic:** ________________________________________
**Date:** __________________________________________________

## Active Listening Checklist
- [ ] Removed distractions (phone away, irrelevant tabs closed)
- [ ] Took structured notes (main points, not transcription)
- [ ] Mentally summarized the speaker's argument
- [ ] Asked at least one clarifying question

## My Contributions Today
| Contribution type        | What I said (brief note)                    |
|--------------------------|---------------------------------------------|
| Agreed / built on idea   |                                             |
| Disagreed (respectfully) |                                             |
| Added a new point        |                                             |
| Asked a question         |                                             |

## Reflection
- Most interesting point raised by someone else: _______________
- Something I still don't understand: _________________________
- How I would prepare differently next time: __________________

## Useful Phrases I Want to Practice
- "Building on [name]'s point, I think..."
- "I see it differently because..."
- "Could you clarify what you mean by...?"`
  },
  {
    title: "Writing a Technical Report",
    importance_level: "Advanced",
    estimated_time: "60 mins",
    estimated_time_minutes: 60,
    breadcrumb_path: "ENG 101 > Unit 6",
    first_principles: [
      "A technical report communicates findings to decision-makers; it must be complete and scannable.",
      "Every section of a report serves a defined purpose and audience need.",
      "Data must be presented visually where possible and interpreted explicitly in writing."
    ],
    learning_objectives: [
      "Identify and write each section of a standard technical report.",
      "Integrate tables, figures, and code snippets into technical writing correctly.",
      "Write an executive summary that stands alone from the full report."
    ],
    prerequisites: ["Technical Writing Conventions", "Research Skills and Note-Taking"],
    content_markdown: `## Writing a Technical Report

Technical reports are among the most common documents produced by engineers and computer scientists. Unlike essays, reports are structured around a standard format designed for scannable, decision-supporting communication.

### Standard Report Structure

**1. Title Page**
Title, author(s), date, institution, and course/project code.

**2. Executive Summary (Abstract)**
A self-contained 150–250 word summary covering: purpose, methods, key findings, and recommendations. Write this *last*, even though it appears first.

**3. Table of Contents**
List all sections with page numbers. Essential for any report over five pages.

**4. Introduction**
- Background: Why is this topic being investigated?
- Objectives: What specific questions does this report answer?
- Scope: What is included and what is excluded?

**5. Methodology**
How was the investigation conducted? What data was collected and how? What tools or frameworks were used? This section must be detailed enough for the reader to replicate your work.

**6. Results / Findings**
Present data clearly. Use tables and figures. Every figure or table needs:
- A number and title (*Figure 1: CPU Usage Over 60 Seconds*)
- A reference in the body text ("As shown in Figure 1...")
- An interpretation — do not leave data unexplained.

**7. Discussion**
Interpret the results. What do they mean? How do they answer the objectives? What are the limitations of your findings?

**8. Conclusions and Recommendations**
Summarize what was established. Make specific, actionable recommendations.

**9. References**
All sources cited in the report, formatted consistently.

**10. Appendices**
Supporting material (raw data, full code, extended tables) that would disrupt the flow of the main report.

### Writing the Executive Summary

The executive summary is read by people who may not read the full report. It must include: what was investigated, how, what was found, and what is recommended. Do not include information not in the report body.`,
    content_easy_markdown: `## Technical Report Writing — Simple Version

A technical report has a fixed structure: Title Page, Executive Summary, Table of Contents, Introduction, Methodology, Results, Discussion, Conclusions, References, and Appendices. Each section has a specific job.

The executive summary is a short, self-contained version of the whole report — write it last. Every table and figure needs a number, title, and a sentence in the body text explaining what it shows. Reports are designed to be scanned, so use clear headings and avoid burying key findings in paragraphs.`,
    forge_snippet: `# Technical Report Template

---
**Title:** ________________________________________________
**Author(s):** ____________________________________________
**Date:** _________________ **Course/Project:** ____________
---

## Executive Summary
*(Write last. 150–250 words. Cover: purpose, methods, findings, recommendations.)*

> ___________________________________________________________

---

## Table of Contents
1. Introduction ................... p.X
2. Methodology ................... p.X
3. Results ....................... p.X
4. Discussion .................... p.X
5. Conclusions ................... p.X
6. References .................... p.X
7. Appendices .................... p.X

---

## 1. Introduction
**Background:** ______________________________________________
**Objectives:** (What questions does this report answer?)
1. ___
2. ___
**Scope:** This report covers ________. It does not cover ________.

## 2. Methodology
**Approach:** ________________________________________________
**Tools / Environment:** _____________________________________
**Data collected:** __________________________________________

## 3. Results
*(Use tables and figures. Reference each one in the text.)*
> As shown in Figure 1, ______________________________________

## 4. Discussion
*(Interpret results. Link back to objectives. State limitations.)*

## 5. Conclusions and Recommendations
**Conclusion:** ______________________________________________
**Recommendation 1:** ________________________________________
**Recommendation 2:** ________________________________________

## 6. References

## 7. Appendices`
  },
  {
    title: "Critical Thinking Through Reading",
    importance_level: "Advanced",
    estimated_time: "50 mins",
    estimated_time_minutes: 50,
    breadcrumb_path: "ENG 101 > Unit 6",
    first_principles: [
      "All texts — academic, technical, journalistic — have a perspective and purpose.",
      "Critical thinking is not skepticism; it is systematic evaluation of evidence and reasoning.",
      "The quality of an argument depends on the quality of its evidence and logic, not its source's prestige."
    ],
    learning_objectives: [
      "Identify an author's argument, assumptions, and evidence in a text.",
      "Evaluate the strength of an argument using criteria of logic, evidence, and bias.",
      "Write a critical response that acknowledges merit and challenges weaknesses."
    ],
    prerequisites: ["Reading Strategies for Technical Texts", "Citation Styles and Academic Integrity"],
    content_markdown: `## Critical Thinking Through Reading

Reading critically means engaging with a text as a thinker, not just a receiver of information. It means asking not only "What does this say?" but "Is this well-reasoned? What is assumed? What is missing?"

### Anatomy of an Argument

Every argument has three parts:
- **Claim**: The main position or conclusion.
- **Evidence**: The data, examples, or research used to support the claim.
- **Warrant**: The unstated assumption linking evidence to claim.

To think critically, expose the warrant. Ask: "What has to be true for this evidence to support this claim?"

### Questions to Ask When Reading

**About the claim:**
- Is it clear and specific, or vague?
- Is it falsifiable? Could evidence contradict it?

**About the evidence:**
- Is it from a credible source?
- Is the sample size or scope adequate?
- Does the evidence actually prove the claim, or just correlate with it?

**About the reasoning:**
- Are there logical fallacies? (e.g., false dichotomy, appeal to authority, hasty generalization)
- Does the conclusion follow logically from the premises?

**About bias and context:**
- Who funded the research?
- What perspective is not represented?
- When was this written, and does that context matter?

### Writing a Critical Response

A critical response is not a summary. It is an evaluation.

Structure:
1. **Brief summary** (1–2 sentences): What does the author argue?
2. **Strengths**: What does the argument do well? What evidence is compelling?
3. **Weaknesses/limitations**: What is assumed without justification? What counterevidence exists?
4. **Your position**: Based on the evidence, do you agree, partially agree, or disagree? Why?

Avoid: "I think this article is good." State specific reasons, backed by evidence.

Critical thinking is a discipline. It requires slowing down and resisting the impulse to accept or reject ideas based on gut feeling.`,
    content_easy_markdown: `## Critical Thinking Through Reading — Simple Version

Critical reading means asking whether an argument is well-reasoned, not just what it says. Every argument has a claim, evidence, and a hidden assumption (warrant). Your job is to find and question the assumption.

Ask: Is the evidence credible and sufficient? Does the conclusion actually follow from the evidence? Are there logical fallacies? What perspective is missing?

A critical response briefly summarizes the argument, then evaluates its strengths and weaknesses with specific reasons. Avoid vague statements like "this article is good" — say exactly why.`,
    forge_snippet: `# Critical Reading Analysis Worksheet

**Source:** ________________________________________________
**Author:** __________________ **Year:** __________________

## Step 1 — Identify the Argument
- **Main Claim:** __________________________________________
- **Key Evidence (list 2-3 pieces):**
  1. ___
  2. ___
  3. ___
- **Unstated Assumption (Warrant):** _______________________
  > "This evidence supports the claim only if we assume that ___"

## Step 2 — Evaluate the Evidence
| Evidence                   | Credible? | Sufficient? | Directly proves claim? |
|----------------------------|-----------|-------------|------------------------|
|                            |           |             |                        |
|                            |           |             |                        |

## Step 3 — Check the Reasoning
- False dichotomy?      Y / N — ____________________________
- Appeal to authority?  Y / N — ____________________________
- Hasty generalization? Y / N — ____________________________
- Other issues: ____________________________________________

## Step 4 — Identify Bias / Gaps
- Whose perspective is missing? _____________________________
- Any conflict of interest? __________________________________

## Step 5 — My Critical Response (draft)
- **Summary (1–2 sentences):** ______________________________
- **Strength:** ____________________________________________
- **Weakness:** ____________________________________________
- **My position:** _________________________________________`
  }
];

async function seed() {
  const courseRes = await pool.query("SELECT id FROM courses WHERE name ILIKE '%ENG 101%' LIMIT 1");
  if (!courseRes.rows.length) { console.error("Course not found!"); await pool.end(); return; }
  const courseId = courseRes.rows[0].id;
  await pool.query("DELETE FROM topics WHERE course_id = $1", [courseId]);
  let count = 0;
  for (const t of topics) {
    await pool.query(
      `INSERT INTO topics (title, course_id, importance_level, estimated_time,
       estimated_time_minutes, breadcrumb_path, first_principles, learning_objectives,
       prerequisites, content_markdown, content_easy_markdown, forge_snippet)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [t.title, courseId, t.importance_level, t.estimated_time,
       t.estimated_time_minutes, t.breadcrumb_path,
       JSON.stringify(t.first_principles), JSON.stringify(t.learning_objectives),
       JSON.stringify(t.prerequisites), t.content_markdown, t.content_easy_markdown, t.forge_snippet]
    );
    console.log(`  ✓ ${t.title}`);
    count++;
  }
  console.log(`\nDone. ${count} topics seeded.`);
  await pool.end();
}
seed().catch(e => { console.error(e); process.exit(1); });
