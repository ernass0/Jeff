// Simple permission helpers
export const OWNER_ID = null; // fill at runtime if desired

export function isOwner(userId, ownerIdFromEnv) {
  if (ownerIdFromEnv) return userId === ownerIdFromEnv;
  if (OWNER_ID) return userId === OWNER_ID;
  return false; // default: no owner configured yet
}

export function isGM(league, userId) {
  return league.teams.some((t) => t.gmUserId === userId || (t.assistantGmUserIds || []).includes(userId));
}

export function teamOfGM(league, userId) {
  return league.teams.find((t) => t.gmUserId === userId || (t.assistantGmUserIds || []).includes(userId));
}
