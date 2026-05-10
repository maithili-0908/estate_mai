const User = require("../models/User");
const Agent = require("../models/Agent");
const { generateId } = require("../utils/id");
const { signToken } = require("../middleware/auth");

function sanitizeUser(userDoc) {
  const raw = userDoc.toJSON ? userDoc.toJSON() : { ...userDoc };
  delete raw.password;
  return raw;
}

function buildRandomAvatar() {
  const type = Math.random() > 0.5 ? "men" : "women";
  const idx = Math.floor(Math.random() * 70);
  return `https://randomuser.me/api/portraits/${type}/${idx}.jpg`;
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (user.status === "Suspended") {
      res.status(403).json({ message: "Account is suspended" });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken(user);
    const safeUser = sanitizeUser(user);

    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      name,
      email,
      phone,
      password,
      role = "user",
    } = req.body;

    const emailLower = String(email || "").toLowerCase().trim();
    const normalizedRole = String(role || "user").toLowerCase().trim();

    if (!emailLower || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    if (!["user", "agent"].includes(normalizedRole)) {
      res.status(400).json({ message: "Role must be 'user' or 'agent'" });
      return;
    }

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const fullName =
      name || `${String(firstName || "").trim()} ${String(lastName || "").trim()}`.trim();

    if (!fullName) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    const userId = generateId("u");
    let agentId = null;

    if (normalizedRole === "agent") {
      const nextIndex = (await Agent.countDocuments()) + 1;
      agentId = `a${nextIndex}`;

      await Agent.create({
        id: agentId,
        userId,
        name: fullName,
        title: "Real Estate Agent",
        avatar: buildRandomAvatar(),
        phone: phone || "",
        email: emailLower,
        location: "",
        bio: "",
        specialties: [],
        languages: ["English"],
        rating: 0,
        reviewCount: 0,
        propertiesSold: 0,
        yearsExp: 1,
        propertiesActive: 0,
        certifications: [],
        social: { instagram: "#", linkedin: "#", twitter: "#" },
        status: "Active",
      });
    }

    const user = await User.create({
      id: userId,
      name: fullName,
      email: emailLower,
      password,
      role: normalizedRole,
      avatar: buildRandomAvatar(),
      phone: phone || "",
      agentId,
      notifications: [
        {
          id: generateId("n"),
          type: "system",
          message: "Welcome to LuxEstate",
          read: false,
          time: "Just now",
          createdAt: new Date(),
        },
      ],
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    if (err?.code === 11000) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  login,
  register,
  me,
};

