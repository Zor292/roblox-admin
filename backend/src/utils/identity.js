function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function createRobloxIdentity(input = {}) {
  return {
    userId: Number(input.userId || 0) || 0,
    username: String(input.username || input.player || "").trim(),
    usernameLower: normalizeUsername(input.username || input.player),
    displayName: String(input.displayName || input.username || input.player || "").trim()
  };
}

module.exports = {
  normalizeUsername,
  createRobloxIdentity
};
