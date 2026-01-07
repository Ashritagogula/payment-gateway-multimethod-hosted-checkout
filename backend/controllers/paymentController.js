const pool = require("../db");

// =======================
// Utility Functions
// =======================

// Generate payment_id: pay_ + 16 alphanumeric characters
const generatePaymentId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "pay_";
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// VPA validation
const isValidVPA = (vpa) => {
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return vpaRegex.test(vpa);
};

// Luhn algorithm
const isValidCardNumber = (number) => {
  const cleaned = number.replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

// Card network detection
const detectCardNetwork = (number) => {
  const cleaned = number.replace(/[\s-]/g, "");

  if (cleaned.startsWith("4")) return "visa";
  const firstTwo = parseInt(cleaned.slice(0, 2), 10);
  if (firstTwo >= 51 && firstTwo <= 55) return "mastercard";
  if (firstTwo === 34 || firstTwo === 37) return "amex";
  if (cleaned.startsWith("60") || cleaned.startsWith("65") || (firstTwo >= 81 && firstTwo <= 89))
    return "rupay";

  return "unknown";
};

// Expiry validation
const isValidExpiry = (month, year) => {
  const m = parseInt(month, 10);
  let y = parseInt(year, 10);

  if (isNaN(m) || m < 1 || m > 12) return false;
  if (year.length === 2) y += 2000;

  const now = new Date();
  const expiry = new Date(y, m);

  return expiry >= new Date(now.getFullYear(), now.getMonth());
};

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// =======================
// Create Payment
// =======================

const createPayment = async (req, res) => {
  try {
    const { order_id, method } = req.body;

    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND merchant_id = $2",
      [order_id, req.merchant.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found"
        }
      });
    }

    const order = orderResult.rows[0];

    let vpa = null;
    let cardNetwork = null;
    let cardLast4 = null;

    if (method === "upi") {
      if (!req.body.vpa || !isValidVPA(req.body.vpa)) {
        return res.status(400).json({
          error: {
            code: "INVALID_VPA",
            description: "VPA format invalid"
          }
        });
      }
      vpa = req.body.vpa;
    }

    if (method === "card") {
      const card = req.body.card;
      if (!card || !card.number || !card.expiry_month || !card.expiry_year || !card.cvv || !card.holder_name) {
        return res.status(400).json({
          error: {
            code: "INVALID_CARD",
            description: "Card validation failed"
          }
        });
      }

      if (!isValidCardNumber(card.number)) {
        return res.status(400).json({
          error: {
            code: "INVALID_CARD",
            description: "Card validation failed"
          }
        });
      }

      if (!isValidExpiry(card.expiry_month, card.expiry_year)) {
        return res.status(400).json({
          error: {
            code: "EXPIRED_CARD",
            description: "Card expiry date invalid"
          }
        });
      }

      cardNetwork = detectCardNetwork(card.number);
      cardLast4 = card.number.slice(-4);
    }

    if (method !== "upi" && method !== "card") {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "Invalid payment method"
        }
      });
    }

    let paymentId;
    let exists = true;
    while (exists) {
      paymentId = generatePaymentId();
      const check = await pool.query("SELECT id FROM payments WHERE id = $1", [paymentId]);
      exists = check.rows.length > 0;
    }

    const insertResult = await pool.query(
      `INSERT INTO payments
       (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
       VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9)
       RETURNING *`,
      [
        paymentId,
        order.id,
        req.merchant.id,
        order.amount,
        order.currency,
        method,
        vpa,
        cardNetwork,
        cardLast4
      ]
    );

    let payment = insertResult.rows[0];

    const testMode = process.env.TEST_MODE === "true";
    const delay = testMode
      ? parseInt(process.env.TEST_PROCESSING_DELAY || "1000", 10)
      : Math.floor(Math.random() * 5000) + 5000;

    await sleep(delay);

    let success;
    if (testMode) {
      success = process.env.TEST_PAYMENT_SUCCESS !== "false";
    } else {
      success = method === "upi" ? Math.random() < 0.9 : Math.random() < 0.95;
    }

    if (success) {
      await pool.query(
        "UPDATE payments SET status = 'success', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [paymentId]
      );
      payment.status = "success";
    } else {
      await pool.query(
        `UPDATE payments
         SET status = 'failed',
             error_code = 'PAYMENT_FAILED',
             error_description = 'Payment processing failed',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [paymentId]
      );
      payment.status = "failed";
    }

    const response = {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      created_at: payment.created_at
    };

    if (method === "upi") response.vpa = payment.vpa;
    if (method === "card") {
      response.card_network = payment.card_network;
      response.card_last4 = payment.card_last4;
    }

    return res.status(201).json(response);

  } catch (error) {
    console.error("Create Payment Error:", error);
    return res.status(500).json({
      error: {
        code: "PAYMENT_FAILED",
        description: "Payment processing failed"
      }
    });
  }
};

// =======================
// Get Payment by ID (TASK 5)
// =======================

const getPaymentById = async (req, res) => {
  try {
    const { payment_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM payments
       WHERE id = $1 AND merchant_id = $2`,
      [payment_id, req.merchant.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Payment not found"
        }
      });
    }

    const payment = result.rows[0];

    const response = {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    };

    if (payment.method === "upi") response.vpa = payment.vpa;
    if (payment.method === "card") {
      response.card_network = payment.card_network;
      response.card_last4 = payment.card_last4;
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error("Get Payment Error:", error);
    return res.status(500).json({
      error: {
        code: "PAYMENT_FAILED",
        description: "Unable to fetch payment"
      }
    });
  }
};

const createPublicPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found"
        }
      });
    }

    req.merchant = { id: orderResult.rows[0].merchant_id };

    return createPayment(req, res);

  } catch (error) {
    console.error("Create Public Payment Error:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Unable to create payment"
      }
    });
  }
};


module.exports = {
  createPayment,
  getPaymentById,
  createPublicPayment
};
