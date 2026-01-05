const express = require("express");
const authenticateMerchant = require("../middleware/auth");
const { createOrder } = require("../controllers/orderController");

const router = express.Router();

router.post("/api/v1/orders", authenticateMerchant, createOrder);

module.exports = router;
