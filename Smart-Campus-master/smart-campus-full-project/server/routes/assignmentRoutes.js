
const express = require("express");
const router = express.Router();
const {
  getAssignments,
  getStudentAssignments,
  getFacultyAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require("../controllers/assignmentController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const upload = require("../middleware/upload");

router.use(authenticate);

router.get("/", getAssignments);
router.get("/student", authorize("student"), getStudentAssignments);
router.get("/faculty", authorize("faculty", "admin"), getFacultyAssignments);
router.post("/", authorize("faculty", "admin"), upload.single("attachment"), createAssignment);
router.put("/:id", authorize("faculty", "admin"), upload.single("attachment"), updateAssignment);
router.delete("/:id", authorize("faculty", "admin"), deleteAssignment);

module.exports = router;
