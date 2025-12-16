const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const StudentChat = require("./models/studentChat");
const DriverChat = require("./models/DriverChat");

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
    methods: ["GET", "POST"] },
    credentials: true
});

let onlineStudents = [];
let onlineDrivers = [];

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join", async ({ name, rollno, role, course, location }) => {
    socket.user = { name, rollno, role, course, location };

    if (role === "student") {
      onlineStudents = onlineStudents.filter(s => s.rollno !== rollno);
      onlineStudents.push(socket.user);

      // 🔥 SEND INITIAL DATA
      socket.emit(
        "onlineStudents",
        onlineStudents.filter(s => s.rollno !== rollno)
      );
      socket.emit("onlineDrivers", onlineDrivers);

      const history = await StudentChat.find().sort({ timestamp: 1 });
      socket.emit("chatHistory", history);
    }

    if (role === "driver") {
      onlineDrivers = onlineDrivers.filter(d => d.rollno !== rollno);
      onlineDrivers.push(socket.user);

      socket.emit(
        "onlineDrivers",
        onlineDrivers.filter(d => d.rollno !== rollno)
      );

      const history = await DriverChat.find().sort({ timestamp: 1 });
      socket.emit("chatHistory", history);
    }

    broadcastLists();
  });

  socket.on("sendMessage", async ({ message, role }) => {
    if (!socket.user) return;

    if (role === "student") {
      const chat = await StudentChat.create({
        name: socket.user.name,
        rollno: socket.user.rollno,
        message,
      });
      io.emit("receiveMessage", chat);
    }

    if (role === "driver") {
      const chat = await DriverChat.create({
        name: socket.user.name,
        vehicleNo: socket.user.rollno,
        message,
      });
      io.emit("receiveDriverMessage", chat);
    }
  });

  socket.on("disconnect", () => {
    if (!socket.user) return;

    if (socket.user.role === "student") {
      onlineStudents = onlineStudents.filter(
        s => s.rollno !== socket.user.rollno
      );
    }

    if (socket.user.role === "driver") {
      onlineDrivers = onlineDrivers.filter(
        d => d.rollno !== socket.user.rollno
      );
    }

    broadcastLists();
    console.log("Disconnected:", socket.id);
  });

  function broadcastLists() {
    io.sockets.sockets.forEach((s) => {
      if (!s.user) return;

      if (s.user.role === "student") {
        s.emit(
          "onlineStudents",
          onlineStudents.filter(st => st.rollno !== s.user.rollno)
        );
        s.emit("onlineDrivers", onlineDrivers);
      }

      if (s.user.role === "driver") {
        s.emit(
          "onlineDrivers",
          onlineDrivers.filter(d => d.rollno !== s.user.rollno)
        );
      }
    });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);

