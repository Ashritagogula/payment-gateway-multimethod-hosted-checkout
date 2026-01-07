const express = require("express");
const authenticateMerchant = require("../middleware/auth");
const {
  createOrder,
  getOrderById,
  getPublicOrderById
} = require("../controllers/orderController");

const router = express.Router();

router.post("/api/v1/orders", authenticateMerchant, createOrder);

router.get("/api/v1/orders/:order_id/public", getPublicOrderById);

router.get(
  "/api/v1/orders/:order_id",
  authenticateMerchant,
  getOrderById
);

module.exports = router;
