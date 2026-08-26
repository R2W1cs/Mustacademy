/**
 * Lesson factory for MATH 270 Probability & Statistics.
 * Builds long-form, student-friendly dual-track markdown.
 */
export function lesson({
  title,
  titleMatch,
  importance_level,
  breadcrumb_path,
  first_principles,
  learning_objectives,
  content_easy_markdown,
  content_deep_markdown,
}) {
  const required = {
    title,
    titleMatch,
    importance_level,
    breadcrumb_path,
    first_principles,
    learning_objectives,
    content_easy_markdown,
    content_deep_markdown,
  };

  for (const [key, value] of Object.entries(required)) {
    if (value === undefined || value === null || value === "") {
      throw new Error(`lesson(): missing required field "${key}"`);
    }
  }

  if (!Array.isArray(first_principles)) {
    throw new Error(`lesson("${title}"): first_principles must be an array`);
  }
  if (!Array.isArray(learning_objectives)) {
    throw new Error(`lesson("${title}"): learning_objectives must be an array`);
  }
  if (typeof content_easy_markdown !== "string" || content_easy_markdown.length < 100) {
    throw new Error(`lesson("${title}"): content_easy_markdown too short or invalid`);
  }
  if (typeof content_deep_markdown !== "string" || content_deep_markdown.length < 100) {
    throw new Error(`lesson("${title}"): content_deep_markdown too short or invalid`);
  }

  return {
    title,
    titleMatch,
    importance_level,
    breadcrumb_path,
    first_principles,
    learning_objectives,
    content_easy_markdown,
    content_deep_markdown,
  };
}

function bullets(items, fallback = []) {
  const list = (items && items.length ? items : fallback) || [];
  return list.map((x) => `- ${x}`).join("\n");
}

function stepsBlock(steps) {
  return (steps || [])
    .map((s, i) => `### Step ${i + 1}: ${s.title || `Part ${i + 1}`}\n${s.body}`)
    .join("\n\n");
}

/**
 * Build dual-track markdown — detailed explanations + gentle math.
 *
 * Extra optional fields:
 *   story, mathSimple, walkthrough, example2, practice (array of {q,a}), bridge, derivation
 */
export function buildLesson({
  title,
  partLabel,
  importance = "Essential",
  principles,
  objectives,
  why,
  idea,
  steps,
  example,
  labCue,
  check,
  formal,
  formulas,
  pitfalls,
  interview,
  story,
  mathSimple,
  walkthrough,
  example2,
  practice,
  bridge,
  derivation,
}) {
  const breadcrumb_path = `MATH 270 > ${partLabel}`;
  const titleMatch = `${title}%`;

  const practiceBlock = (practice || [])
    .map(
      (p, i) =>
        `**Practice ${i + 1}.** ${p.q}\n\n<details><summary>Show answer</summary>\n\n${p.a}\n\n</details>`
    )
    .join("\n\n");

  const content_easy_markdown = `# ${title}

## Why this lesson exists
${why}

${story ? `## A concrete picture\n${story}\n` : ""}
## The idea in plain language
${idea}

## How to do it (step by step)
${stepsBlock(steps)}

## Math, explained gently
${mathSimple || "We will introduce symbols only after the idea is clear. Every formula below is just a shortcut for something you can say in words."}

${walkthrough ? `## Walk through the numbers\n${walkthrough}\n` : ""}
## Worked example 1
${example}

${example2 ? `## Worked example 2\n${example2}\n` : ""}
## Try the Interactive lab
${labCue}

Read the lesson, then use the lab until the **picture** matches the **formula**. If they disagree, re-read the step that defines the quantity you are looking at.

## What you should be able to say out loud
${bullets(check, ["Explain the main idea without looking at notes.", "Solve a small numeric example from scratch."])}

${practiceBlock ? `## Practice (try before peeking)\n${practiceBlock}\n` : ""}
## Common mistakes (and how to avoid them)
${bullets(pitfalls, ["Rushing to a formula before naming the quantity you want.", "Mixing up population vs sample, or parameter vs statistic."])}

## Mini summary
- **Core idea:** ${idea.split(".")[0].replace(/\*\*/g, "")}.
- **Do this next:** ${bridge || "Open the lab, change one control, and predict what should happen before you move it."}
`;

  const content_deep_markdown = `# ${title} — Deep track

## Formal statement
${formal}

## Key formulas (with meaning)
${formulas}

${derivation ? `## Where the formula comes from\n${derivation}\n` : ""}
## Connection to the easy track
Everything above is the same story as the Essential tab — only written with precise symbols. If a line feels opaque, translate it back:

| Symbol move | In words |
|---|---|
| Sum / average | Add pieces, divide by how many |
| Probability of a set | Total weight of outcomes in that set |
| Conditioning | Rebuild the weights using only the outcomes you now know happened |

## Edge cases & assumptions
${bullets(pitfalls)}

## Exam / interview tip
${interview || "Before computing, write one sentence: what is random, what is fixed, and what question you are answering. Then pick the formula."}

## Bridge to the next lesson
${bridge || "Keep the lab open while you skim the next topic — most of MATH 270 reuses the same vocabulary: experiment, distribution, mean, variance, and conditioning."}
`;

  return lesson({
    title,
    titleMatch,
    importance_level: importance,
    breadcrumb_path,
    first_principles: principles,
    learning_objectives: objectives,
    content_easy_markdown,
    content_deep_markdown,
  });
}
