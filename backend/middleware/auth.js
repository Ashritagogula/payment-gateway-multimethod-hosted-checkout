const pool = require("../db");

const authenticateMerchant = async (req, res, next) => {
  console.log("AUTH HEADERS RECEIVED:", req.headers);

  const apiKey = req.get("X-Api-Key");
  const apiSecret = req.get("X-Api-Secret");

  console.log("apiKey:", apiKey);
  console.log("apiSecret:", apiSecret);

  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Invalid API credentials"
      }
    });
  }

  try {
    const result = await pool.query(
      `SELECT id FROM merchants
       WHERE api_key = $1 AND api_secret = $2`,
      [apiKey.trim(), apiSecret.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials"
        }
      });
    }

    req.merchant = result.rows[0];
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Invalid API credentials"
      }
    });
  }
};

module.exports = authenticateMerchant;
