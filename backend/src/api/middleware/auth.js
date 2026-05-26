const jwt = require("jsonwebtoken");

function createRobloxAuth(env) {
  return function robloxAuth(req, res, next) {
    const token = req.header("x-api-key");
    if (!token || token !== env.API_SHARED_SECRET) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    return next();
  };
}

function createDashboardAuth(env) {
  return function dashboardAuth(req, res, next) {
    if (req.path === "/login") {
      return next();
    }
    const authHeader = req.header("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
      return res.status(401).json({ ok: false, message: "Missing token" });
    }

    try {
      req.dashboardUser = jwt.verify(token, env.DASHBOARD_JWT_SECRET);
      return next();
    } catch (error) {
      return res.status(401).json({ ok: false, message: "Invalid token" });
    }
  };
}

module.exports = {
  createRobloxAuth,
  createDashboardAuth
};
