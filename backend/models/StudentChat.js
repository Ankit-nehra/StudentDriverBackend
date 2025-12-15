const mongoose = require("mongoose");

const studentChatSchema = new mongoose.Schema({
  name: { type: String, required: true },     // sender name
  rollno: { type: String, required: true },   // sender rollno
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StudentChat", studentChatSchema);
