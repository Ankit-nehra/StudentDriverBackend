const mongoose = require("mongoose");

const driverChatSchema = new mongoose.Schema({
  name: String,
  vehicleNo: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DriverChat", driverChatSchema);
