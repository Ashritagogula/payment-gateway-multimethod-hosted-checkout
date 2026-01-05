const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.json({ message: "Payment Gateway API running" });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
