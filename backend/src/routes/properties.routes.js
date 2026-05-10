const express = require("express");
const {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/properties.controller");
const { protect, requireRole, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", optionalAuth, listProperties);
router.get("/:id", getPropertyById);
router.post("/", protect, requireRole("agent", "admin"), createProperty);
router.patch("/:id", protect, requireRole("agent", "admin"), updateProperty);
router.delete("/:id", protect, requireRole("agent", "admin"), deleteProperty);

module.exports = router;

