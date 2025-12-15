const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const StudentChat = require("./models/StudentChat.js");
const DriverChat = require("./models/driverChat.js");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));

const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "https://student-driver-frontend-cambr91nv-ankit-nehras-projects.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  },
});

let onlineStudents = [];
let onlineDrivers = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", async ({ name, rollno, role, location, course }) => {
    // ✅ UPDATED: course bhi store kiya
    socket.user = { name, rollno, role, location, course };

    if (role === "student") {
      onlineStudents = onlineStudents.filter(
        (s) => s.rollno !== rollno
      );
      onlineStudents.push(socket.user);

      const otherStudents = onlineStudents.filter(
        (s) => s.rollno !== rollno
      );

      io.emit("onlineStudents", otherStudents);

      const history = await StudentChat.find()
        .sort({ timestamp: 1 })
        .limit(50);
      socket.emit("chatHistory", history);
    }

    if (role === "driver") {
      onlineDrivers = onlineDrivers.filter(
        (d) => d.rollno !== rollno
      );
      onlineDrivers.push(socket.user);

      // ✅ UPDATED: poori list emit
      io.emit("onlineDrivers", onlineDrivers);

      const history = await DriverChat.find()
        .sort({ timestamp: 1 })
        .limit(50);
      socket.emit("chatHistory", history);
    }
  });

  socket.on("sendMessage", async (message) => {
    if (!socket.user) return;

    if (socket.user.role === "student") {
      const msg = new StudentChat({
        name: socket.user.name,
        rollno: socket.user.rollno,
        message,
        timestamp: new Date(),
      });
      await msg.save();
      io.emit("receiveMessage", msg);
    }

    if (socket.user.role === "driver") {
      const msg = new DriverChat({
        name: socket.user.name,
        vehicleNo: socket.user.rollno,
        message,
        timestamp: new Date(),
      });
      await msg.save();
      io.emit("receiveDriverMessage", msg);
    }
  });

  socket.on("disconnect", () => {
    if (!socket.user) return;

    if (socket.user.role === "student") {
      onlineStudents = onlineStudents.filter(
        (s) => s.rollno !== socket.user.rollno
      );
      io.emit("onlineStudents", onlineStudents);
    }

    if (socket.user.role === "driver") {
      onlineDrivers = onlineDrivers.filter(
        (d) => d.rollno !== socket.user.rollno
      );
      io.emit("onlineDrivers", onlineDrivers);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);



