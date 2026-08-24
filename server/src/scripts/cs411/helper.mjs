/**
 * Lesson factory for CS 411 curriculum modules.
 * Returns the lesson object as-is after validating required fields.
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
