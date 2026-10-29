
const express = require("express");
const router = express.Router();
const {
  getTimetable,
  getStudentTimetable,
  getFacultyTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable
} = require("../controllers/timetableController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(authenticate);

router.get("/", getTimetable);
router.get("/student", authorize("student"), getStudentTimetable);
router.get("/faculty", authorize("faculty", "admin"), getFacultyTimetable);
router.post("/", authorize("admin"), createTimetable);
router.put("/:id", authorize("admin"), updateTimetable);
router.delete("/:id", authorize("admin"), deleteTimetable);

module.exports = router;
