const express = require("express");
const authenticateMerchant = require("../middleware/auth");
const {
  createPayment,
  getPaymentById
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/api/v1/payments", authenticateMerchant, createPayment);
router.get("/api/v1/payments/:payment_id", authenticateMerchant, getPaymentById);

module.exports = router;
