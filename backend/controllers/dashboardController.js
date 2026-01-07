const pool = require("../db");

const getDashboardStats = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    // Total payments
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM payments WHERE merchant_id = $1",
      [merchantId]
    );

    // Successful payments + total amount
    const successResult = await pool.query(
      "SELECT COUNT(*) AS success_count, COALESCE(SUM(amount),0) AS total_amount FROM payments WHERE merchant_id = $1 AND status = 'success'",
      [merchantId]
    );

    const totalTransactions = Number(totalResult.rows[0].count);
    const successCount = Number(successResult.rows[0].success_count);
    const totalAmount = Number(successResult.rows[0].total_amount);

    const successRate =
      totalTransactions === 0
        ? 0
        : Math.round((successCount / totalTransactions) * 100);

    res.status(200).json({
      total_transactions: totalTransactions,
      total_amount: totalAmount,
      success_rate: successRate
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Failed to fetch dashboard stats"
      }
    });
  }
};

module.exports = { getDashboardStats };
