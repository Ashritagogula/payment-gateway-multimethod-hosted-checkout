const pool = require("../db");

// Generate order_id: order_ + 16 alphanumeric characters
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

    // Validation
    if (!Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "amount must be at least 100"
        }
      });
    }

    // Generate unique order id
    let orderId;
    let exists = true;

    while (exists) {
      orderId = generateOrderId();
      const check = await pool.query(
        "SELECT id FROM orders WHERE id = $1",
        [orderId]
      );
      exists = check.rows.length > 0;
    }

    // Insert order
    const result = await pool.query(
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

  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Unable to create order"
      }
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM orders
       WHERE id = $1 AND merchant_id = $2`,
      [order_id, req.merchant.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found"
        }
      });
    }

    const order = result.rows[0];

    return res.status(200).json({
      id: order.id,
      merchant_id: order.merchant_id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes || {},
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at
    });

  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Unable to fetch order"
      }
    });
  }
};

const getPublicOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      `SELECT id, amount, currency, status
       FROM orders
       WHERE id = $1`,
      [order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found"
        }
      });
    }

    const order = result.rows[0];

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });

  } catch (error) {
    console.error("Get Public Order Error:", error);

    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Unable to fetch order"
      }
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getPublicOrderById
};
