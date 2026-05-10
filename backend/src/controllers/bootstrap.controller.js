const Agent = require("../models/Agent");
const Property = require("../models/Property");
const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const Message = require("../models/Message");
const User = require("../models/User");
const { computePlatformStats, computeAdminStats } = require("../utils/stats");
const { buildFilterOptions } = require("../utils/filters");

function toJoinedLabel(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function bootstrap(req, res, next) {
  try {
    const [allProperties, agents, reviews] = await Promise.all([
      Property.find({}).sort({ createdAt: -1 }),
      Agent.find({}).sort({ createdAt: 1 }),
      Review.find({}).sort({ createdAt: -1 }),
    ]);

    const properties = allProperties.filter((property) => !property.pendingApproval);
    const platformStats = computePlatformStats(properties, agents);
    const filterOptions = buildFilterOptions(properties);

    const payload = {
      user: null,
      properties,
      agents,
      reviews,
      platformStats,
      adminStats: null,
      filterOptions,
      savedProperties: [],
      compareList: [],
      notifications: [],
      appointments: [],
      messages: [],
      users: [],
      pendingApprovals: [],
    };

    if (!req.user) {
      res.json(payload);
      return;
    }

    const user = await User.findOne({ id: req.user.id }).select("-password");
    if (!user) {
      res.json(payload);
      return;
    }

    payload.user = user;
    payload.savedProperties = user.savedProperties || [];
    payload.compareList = user.compareList || [];
    payload.notifications = (user.notifications || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (user.role === "agent") {
      const [appointments, messages] = await Promise.all([
        Appointment.find({ agentId: user.agentId }).sort({ createdAt: -1 }),
        Message.find({ agentId: user.agentId }).sort({ createdAt: -1 }),
      ]);

      payload.appointments = appointments;
      payload.messages = messages;
    }

    if (user.role === "user") {
      const [appointments, messages] = await Promise.all([
        Appointment.find({
          $or: [{ clientUserId: user.id }, { clientEmail: user.email }],
        }).sort({ createdAt: -1 }),
        Message.find({
          $or: [{ userId: user.id }, { fromEmail: user.email }],
        }).sort({ createdAt: -1 }),
      ]);

      payload.appointments = appointments;
      payload.messages = messages;
    }

    if (user.role === "admin") {
      const [appointments, messages, users, pendingApprovals] = await Promise.all([
        Appointment.find({}).sort({ createdAt: -1 }),
        Message.find({}).sort({ createdAt: -1 }),
        User.find({}).select("-password").sort({ createdAt: -1 }),
        Property.find({ pendingApproval: true }).sort({ createdAt: -1 }),
      ]);

      payload.appointments = appointments;
      payload.messages = messages;
      payload.pendingApprovals = pendingApprovals;
      payload.users = users.map((entry) => ({
        ...entry.toJSON(),
        joined: toJoinedLabel(entry.createdAt),
      }));
      payload.adminStats = computeAdminStats({
        users: payload.users,
        properties: allProperties,
        agents,
        appointments,
      });
    }

    res.json(payload);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  bootstrap,
};

