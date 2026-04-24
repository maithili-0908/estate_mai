const express = require("express");
const {
  updateProfile,
  updatePassword,
  updateSettings,
  requestUserData,
  enableTwoFactor,
  revokeSession,
  deleteMyAccount,
} = require("../controllers/users.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.patch("/me", protect, updateProfile);
router.patch("/password", protect, updatePassword);
router.patch("/settings", protect, updateSettings);
router.post("/requests", protect, requestUserData);
router.post("/2fa/enable", protect, enableTwoFactor);
router.post("/sessions/revoke", protect, revokeSession);
router.delete("/me", protect, deleteMyAccount);

module.exports = router;

