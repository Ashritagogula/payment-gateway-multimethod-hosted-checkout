const { query } = require("../db");

const generateOrderId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "order_";
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const createOrder = async (req, res) => {
  const { amount, currency = "INR", receipt, notes } = req.body;

  if (!Number.isInteger(amount) || amount < 100) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST_ERROR",
        description: "amount must be at least 100"
      }
    });
  }

  let orderId;
  let exists = true;

  while (exists) {
    orderId = generateOrderId();
    const check = await query("SELECT id FROM orders WHERE id = $1", [orderId]);
    exists = check.rows.length > 0;
  }

  const result = await query(
    `INSERT INTO orders 
     (id, merchant_id, amount, currency, receipt, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'created')
     RETURNING *`,
    [
      orderId,
      req.merchant.id,
      amount,
      currency,
      receipt || null,
      notes || null
    ]
  );

  res.status(201).json({
    id: result.rows[0].id,
    merchant_id: result.rows[0].merchant_id,
    amount: result.rows[0].amount,
    currency: result.rows[0].currency,
    receipt: result.rows[0].receipt,
    notes: result.rows[0].notes || {},
    status: result.rows[0].status,
    created_at: result.rows[0].created_at
  });
};

module.exports = {
  createOrder
};
