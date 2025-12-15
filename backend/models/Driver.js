const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: String,
  location: String,
  vehicleNo: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model("Driver", driverSchema);
