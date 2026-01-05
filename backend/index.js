const express = require("express");
const dotenv = require("dotenv");
const { pool } = require("./db");

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get("/health", async (req, res) => {
  let dbStatus = "connected";

  try {
    await pool.query("SELECT 1");
  } catch (error) {
    dbStatus = "disconnected";
  }

  res.status(200).json({
    status: "healthy",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

const orderRoutes = require("./routes/orders");
app.use(orderRoutes);


app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
