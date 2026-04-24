const express = require("express");
const { bootstrap } = require("../controllers/bootstrap.controller");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", optionalAuth, bootstrap);

module.exports = router;

