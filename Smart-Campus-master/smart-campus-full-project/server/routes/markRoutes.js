
const express = require("express");
const router = express.Router();
const {
  saveMarks,
  getStudentMarks,
  getFacultyMarks
} = require("../controllers/markController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(authenticate);

router.post("/", authorize("faculty", "admin"), saveMarks);
router.get("/student", getStudentMarks);
router.get("/faculty", authorize("faculty", "admin"), getFacultyMarks);

module.exports = router;
