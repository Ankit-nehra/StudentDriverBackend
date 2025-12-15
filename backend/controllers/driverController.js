const Driver = require("../models/Driver");
const bcrypt = require("bcryptjs");

// SIGNUP
exports.signupDriver = async (req, res) => {
  const { name, location, vehicleNo, password } = req.body;

  if (!name || !vehicleNo || !location || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const exists = await Driver.findOne({ vehicleNo });
    if (exists) {
      return res.status(400).json({ message: "Driver already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = await Driver.create({
      name,
      location,
      vehicleNo,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        name: driver.name,
        vehicleNo: driver.vehicleNo,
        location: driver.location,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.loginDriver = async (req, res) => {
  const { vehicleNo, password } = req.body;

  if (!vehicleNo || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const driver = await Driver.findOne({ vehicleNo });
    if (!driver) {
      return res.status(400).json({ message: "Driver not found" });
    }

    const match = await bcrypt.compare(password, driver.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    res.json({
      message: "Login success",
      user: {
        name: driver.name,
        vehicleNo: driver.vehicleNo,
        location: driver.location,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
