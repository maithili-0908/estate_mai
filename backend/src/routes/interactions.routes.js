const express = require("express");
const {
  toggleSaved,
  clearSaved,
  toggleCompare,
  markNotificationsRead,
  createInquiry,
  sendAgentMessage,
  replyToMessage,
  updateAppointmentStatus,
  markMessageRead,
} = require("../controllers/interactions.controller");
const { protect, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/saved/:propertyId/toggle", protect, toggleSaved);
router.post("/saved/clear", protect, clearSaved);
router.post("/compare/:propertyId/toggle", protect, toggleCompare);
router.post("/notifications/read-all", protect, markNotificationsRead);

router.post("/inquiries", optionalAuth, createInquiry);
router.post("/agents/:agentId/message", optionalAuth, sendAgentMessage);
router.post("/messages/:id/reply", protect, replyToMessage);

router.patch("/appointments/:id/status", protect, updateAppointmentStatus);
router.patch("/messages/:id/read", protect, markMessageRead);

module.exports = router;

