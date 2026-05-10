const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || "").trim();
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
}

function extractToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

async function attachUserFromToken(req) {
  const token = extractToken(req);
  if (!token) return null;

  const jwtSecret = getJwtSecret();

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ id: decoded.id }).select("-password");
    return user;
  } catch (_err) {
    return null;
  }
}

async function optionalAuth(req, _res, next) {
  req.user = await attachUserFromToken(req);
  next();
}

async function protect(req, res, next) {
  const user = await attachUserFromToken(req);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (user.status === "Suspended") {
    res.status(403).json({ message: "Account is suspended" });
    return;
  }

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

module.exports = {
  getJwtSecret,
  optionalAuth,
  protect,
  requireRole,
  signToken,
};
