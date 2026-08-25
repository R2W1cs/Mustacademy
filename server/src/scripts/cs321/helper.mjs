/**
 * Lesson factory for CS 321 curriculum modules.
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

  if (!Array.isArray(first_principles) || !Array.isArray(learning_objectives)) {
    throw new Error(`lesson("${title}"): first_principles and learning_objectives must be arrays`);
  }

  return {
    title,
    titleMatch: titleMatch || title,
    importance_level,
    breadcrumb_path,
    first_principles,
    learning_objectives,
    content_easy_markdown,
    content_deep_markdown,
  };
}
