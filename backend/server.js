require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/health", healthRoutes);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`LedgerLine API running on http://localhost:${PORT}`);
  });
};

startServer();
