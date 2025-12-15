const express = require("express");
const router = express.Router();
const {
  signupDriver,
  loginDriver,
} = require("../controllers/driverController");

router.post("/signup", signupDriver);
router.post("/login", loginDriver);

module.exports = router;
