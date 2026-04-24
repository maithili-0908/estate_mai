const express = require("express");
const { listAgents, getAgentById } = require("../controllers/agents.controller");

const router = express.Router();

router.get("/", listAgents);
router.get("/:id", getAgentById);

module.exports = router;

