
const express = require("express");
const router = express.Router();
const {
  submitAssignment,
  getAssignmentSubmissions,
  getAllSubmissionsForFaculty,
  evaluateSubmission
} = require("../controllers/submissionController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const upload = require("../middleware/upload");

router.use(authenticate);

router.post("/", authorize("student"), upload.single("file"), submitAssignment);
router.get("/assignment/:assignmentId", authorize("faculty", "admin"), getAssignmentSubmissions);
router.get("/all", authorize("faculty", "admin"), getAllSubmissionsForFaculty);
router.put("/:id/evaluate", authorize("faculty", "admin"), evaluateSubmission);

module.exports = router;
