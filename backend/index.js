const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const healthRoutes = require("./routes/health");
const testRoutes = require("./routes/test");
const dashboardRoutes = require("./routes/dashboard");

app.use(orderRoutes);
app.use(paymentRoutes);
app.use("/", healthRoutes);
app.use(testRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
