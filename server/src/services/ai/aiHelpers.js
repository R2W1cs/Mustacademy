export function sanitizeMermaid(mermaidCode) {
  if (!mermaidCode) return null;
  let code = mermaidCode.trim();
  code = code.replace(/```(?:mermaid)?/g, '').trim();
  code = code.replace(/(\w+)\(([^)]*\([^)]*\)[^)]*)\)/g, '$1["$2"]');
  code = code.replace(/(\w+)\(([^)]+\s+[^)]+)\)/g, '$1["$2"]');
  return code;
}