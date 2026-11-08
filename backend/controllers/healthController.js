const mongoose = require("mongoose");

const getHealth = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ledgerline-backend",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
};

module.exports = { getHealth };
