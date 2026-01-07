const pool = require("../db");

const getTestMerchant = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, api_key 
       FROM merchants 
       WHERE email = 'test@example.com'`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Test merchant not found"
        }
      });
    }

    const merchant = result.rows[0];

    return res.status(200).json({
      id: merchant.id,
      email: merchant.email,
      api_key: merchant.api_key,
      seeded: true
    });

  } catch (error) {
    console.error("Test Merchant Error:", error.message);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Unable to fetch test merchant"
      }
    });
  }
};

module.exports = {
  getTestMerchant
};
