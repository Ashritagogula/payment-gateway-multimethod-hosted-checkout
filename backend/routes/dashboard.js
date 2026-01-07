const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const authenticateMerchant = require("../middleware/auth");

router.get("/stats", authenticateMerchant, getDashboardStats);

module.exports = router;
