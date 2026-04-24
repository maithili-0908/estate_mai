const Agent = require("../models/Agent");
const Property = require("../models/Property");
const Review = require("../models/Review");

async function listAgents(req, res, next) {
  try {
    const agents = await Agent.find({}).sort({ createdAt: 1 });
    res.json(agents);
  } catch (err) {
    next(err);
  }
}

async function getAgentById(req, res, next) {
  try {
    const agent = await Agent.findOne({ id: req.params.id });

    if (!agent) {
      res.status(404).json({ message: "Agent not found" });
      return;
    }

    const [listings, reviews] = await Promise.all([
      Property.find({ agentId: agent.id, pendingApproval: false }).sort({ createdAt: -1 }),
      Review.find({ agentId: agent.id }).sort({ createdAt: -1 }),
    ]);

    res.json({
      agent,
      listings,
      reviews,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAgents,
  getAgentById,
};

