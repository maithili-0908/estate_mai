const express = require("express");
const {
  suspendAgent,
  removeUser,
  removeProperty,
  handlePendingProperty,
  exportReport,
  generateReport,
} = require("../controllers/admin.controller");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.patch("/agents/:agentId/suspend", suspendAgent);
router.delete("/users/:userId", removeUser);
router.delete("/properties/:propertyId", removeProperty);
router.patch("/pending/:propertyId", handlePendingProperty);
router.get("/reports/export", exportReport);
router.post("/reports/generate", generateReport);

module.exports = router;

