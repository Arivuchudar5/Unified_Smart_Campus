
const express = require("express");
const router = express.Router();
const {
  applyLeave,
  getStudentLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave
} = require("../controllers/leaveController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const upload = require("../middleware/upload");

router.use(authenticate);

router.post("/", authorize("student"), upload.single("attachment"), applyLeave);
router.get("/student", authorize("student"), getStudentLeaves);
router.get("/admin", authorize("admin"), getAllLeaves);
router.get("/faculty", authorize("faculty", "admin"), getAllLeaves);
router.put("/:id/approve", authorize("admin", "faculty"), approveLeave);
router.put("/:id/reject", authorize("admin", "faculty"), rejectLeave);

module.exports = router;
