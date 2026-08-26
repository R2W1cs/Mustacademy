/**
 * Lesson factory for MATH 270 Probability & Statistics.
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

/**
 * Build dual-track markdown from structured fields (keeps pedagogy consistent).
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
}) {
  const breadcrumb_path = `MATH 270 > ${partLabel}`;
  const titleMatch = `${title}%`;

  const stepList = (steps || [])
    .map((s, i) => `${i + 1}. **${s.title || `Step ${i + 1}`}** — ${s.body}`)
    .join("\n");

  const content_easy_markdown = `# ${title}

## Why it matters
${why}

## The simple idea
${idea}

## Step by step
${stepList}

## Worked example
${example}

## Try the Interactive lab
${labCue}

## Check yourself
${(check || []).map((c) => `- ${c}`).join("\n")}

## Common mistakes
${(pitfalls || ["Confusing population with sample", "Mixing up parameters and statistics"]).map((p) => `- ${p}`).join("\n")}
`;

  const content_deep_markdown = `# ${title} — Deep track

## Formal view
${formal}

## Key formulas
${formulas}

## Edge cases & caveats
${(pitfalls || []).map((p) => `- ${p}`).join("\n")}

## Interview / exam tip
${interview || "State assumptions (independence, identical distribution, known variance) before applying a formula."}

## Connect forward
Use the Interactive lab until the motion matches the formula, then restate the result in one sentence without symbols.
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
