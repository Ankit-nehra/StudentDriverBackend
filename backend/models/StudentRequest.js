const mongoose = require("mongoose");

const studentRequestSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rollno: { type: String, required: true },
  status: { type: String, default: "pending" }, // pending / accepted
  acceptedBy: {
    driverName: String,
    vehicleNo: String,
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.StudentRequest ||
  mongoose.model("StudentRequest", studentRequestSchema);
