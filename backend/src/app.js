const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const bootstrapRoutes = require("./routes/bootstrap.routes");
const propertyRoutes = require("./routes/properties.routes");
const agentRoutes = require("./routes/agents.routes");
const userRoutes = require("./routes/users.routes");
const interactionRoutes = require("./routes/interactions.routes");
const adminRoutes = require("./routes/admin.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error");

const app = express();

function getAllowedOrigins() {
  const raw = String(process.env.CORS_ORIGIN || "").trim();
  if (!raw) return ["http://localhost:3000"];

  const normalize = (value) => String(value).trim().replace(/\/+$/, "");

  return raw
    .split(",")
    .map((origin) => normalize(origin))
    .filter(Boolean);
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = String(origin).trim().replace(/\/+$/, "");

      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      const err = new Error(`CORS origin not allowed: ${origin}`);
      err.statusCode = 403;
      return callback(err);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/bootstrap", bootstrapRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
