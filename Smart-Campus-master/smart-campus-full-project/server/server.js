require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static Folder for Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/marks", require("./routes/markRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Health Check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Smart Campus Management System API is running smoothly.",
    timestamp: new Date().toISOString()
  });
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Smart Campus Server] Running on http://localhost:${PORT}`);
});
