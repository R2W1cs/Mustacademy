/**
 * Profile is complete when the student has set academic year/semester
 * and a target career path (used by career features).
 * Staff roles are always treated as complete.
 */
export function isProfileComplete(user) {
  if (!user) return false;
  if (user.role === "admin" || user.role === "professor") return true;

  const dreamJob = String(user.dream_job || "").trim();
  const year = user.year;
  const semester = user.semester;

  return Boolean(
    dreamJob &&
      year != null &&
      year !== "" &&
      semester != null &&
      semester !== ""
  );
}
