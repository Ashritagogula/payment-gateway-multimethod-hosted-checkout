const express = require("express");
const authenticateMerchant = require("../middleware/auth");
const { createOrder } = require("../controllers/orderController");

const router = express.Router();

router.post("/api/v1/orders", authenticateMerchant, createOrder);
const { getOrderById } = require("../controllers/orderController");

router.get(
  "/api/v1/orders/:order_id",
  authenticateMerchant,
  getOrderById
);

module.exports = router;
