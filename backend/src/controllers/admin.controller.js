const Agent = require("../models/Agent");
const User = require("../models/User");
const Property = require("../models/Property");
const { syncAgentMetrics } = require("../utils/agentSync");

async function suspendAgent(req, res, next) {
  try {
    const { agentId } = req.params;
    const { suspended = true } = req.body;

    const status = suspended ? "Suspended" : "Active";

    const agent = await Agent.findOneAndUpdate(
      { id: agentId },
      { status },
      { new: true }
    );

    if (!agent) {
      res.status(404).json({ message: "Agent not found" });
      return;
    }

    await User.updateOne({ agentId }, { status: suspended ? "Suspended" : "Active" });

    res.json(agent);
  } catch (err) {
    next(err);
  }
}

async function removeUser(req, res, next) {
  try {
    const { userId } = req.params;

    if (req.user.id === userId) {
      res.status(400).json({ message: "You cannot remove your own admin account" });
      return;
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.role === "agent" && user.agentId) {
      await Agent.updateOne({ id: user.agentId }, { status: "Suspended" });
    }

    await user.deleteOne();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function removeProperty(req, res, next) {
  try {
    const { propertyId } = req.params;

    const property = await Property.findOne({ id: propertyId });
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const { agentId } = property;
    await property.deleteOne();

    if (agentId) {
      await syncAgentMetrics(agentId);
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function handlePendingProperty(req, res, next) {
  try {
    const { propertyId } = req.params;
    const { action } = req.body;

    const property = await Property.findOne({ id: propertyId, pendingApproval: true });

    if (!property) {
      res.status(404).json({ message: "Pending property not found" });
      return;
    }

    if (action === "approve") {
      property.pendingApproval = false;
      if (property.status === "Pending") {
        property.status = "For Sale";
      }
      await property.save();
      await syncAgentMetrics(property.agentId);
      res.json({ success: true, property });
      return;
    }

    if (action === "reject") {
      const { agentId } = property;
      await property.deleteOne();
      await syncAgentMetrics(agentId);
      res.json({ success: true });
      return;
    }

    res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
  } catch (err) {
    next(err);
  }
}

async function exportReport(_req, res) {
  res.json({
    success: true,
    url: "/api/admin/reports/download/latest",
    generatedAt: new Date().toISOString(),
  });
}

async function generateReport(req, res) {
  const { type = "general" } = req.body || {};
  res.json({
    success: true,
    type,
    generatedAt: new Date().toISOString(),
  });
}

module.exports = {
  suspendAgent,
  removeUser,
  removeProperty,
  handlePendingProperty,
  exportReport,
  generateReport,
};

