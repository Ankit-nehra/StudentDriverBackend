const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://ankit:ankit123@cluster1.eumhbfh.mongodb.net/studentDriverDB?retryWrites=true&w=majority"
);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;


