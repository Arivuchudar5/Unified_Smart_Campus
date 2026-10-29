
const express = require("express");
const router = express.Router();
const {
  saveAttendance,
  getStudentAttendance,
  getFacultyAttendance
} = require("../controllers/attendanceController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(authenticate);

router.post("/", authorize("faculty", "admin"), saveAttendance);
router.get("/student", getStudentAttendance);
router.get("/faculty", authorize("faculty", "admin"), getFacultyAttendance);

module.exports = router;
