
const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStatus
} = require("../controllers/studentController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(authenticate);

router.get("/", getStudents);
router.get("/:id", getStudentById);
router.post("/", authorize("admin"), createStudent);
router.put("/:id", authorize("admin"), updateStudent);
router.delete("/:id", authorize("admin"), deleteStudent);
router.patch("/:id/toggle-status", authorize("admin"), toggleStatus);

module.exports = router;
