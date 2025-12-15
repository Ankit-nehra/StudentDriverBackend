const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// SIGNUP
exports.signupStudent = async (req, res) => {
  const { name, rollno, course, password } = req.body;
  if (!name || !rollno || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const exists = await Student.findOne({ rollno });
    if (exists) {
      return res.status(400).json({ message: "Student already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, rollno, course, password: hashedPassword });
    res.status(201).json({
      message: "Signup successful",
      user: {
        name: student.name,
        rollno: student.rollno,
        course: student.course,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.loginStudent = async (req, res) => {
  const { rollno, password } = req.body;
  if (!rollno || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const student = await Student.findOne({ rollno });
    if (!student) return res.status(400).json({ message: "Student not found" });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    res.json({
      message: "Login success",
      user: {
        name: student.name,
        rollno: student.rollno,
        course: student.course,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
