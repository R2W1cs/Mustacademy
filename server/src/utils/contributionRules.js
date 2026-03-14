export const CONTRIBUTION_RULES = {
  PROFILE_COMPLETED: { points: 10 },
  RESUME_UPLOADED: { points: 20 },
  RESUME_SHARED: { points: 10 },
  RESUME_FEEDBACK: { points: 5 },
  DAILY_ONLINE: { points: 2 },
  PEER_HELP: { points: 15 },
  PET_NEGLECT: { points: -10 },
};

export const getLevelFromScore = (score) => {
  if (score >= 150) return "Trusted Peer";
  if (score >= 80) return "Contributor";
  if (score >= 30) return "Active Student";
  return "New Member";
};
