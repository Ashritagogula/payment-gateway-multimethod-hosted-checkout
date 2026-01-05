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
  try {
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
      const check = await query(
        "SELECT id FROM orders WHERE id = $1",
        [orderId]
      );
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
        notes ? JSON.stringify(notes) : null
      ]
    );

    const order = result.rows[0];

    return res.status(201).json({
      id: order.id,
      merchant_id: order.merchant_id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes || {},
      status: order.status,
      created_at: order.created_at
    });

  } catch (err) {
    console.error("Create Order Error:", err);

    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Unable to create order"
      }
    });
  }
};

module.exports = {
  createOrder
};
