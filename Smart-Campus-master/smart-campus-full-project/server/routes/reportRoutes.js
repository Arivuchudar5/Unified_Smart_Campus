
const express = require("express");
const router = express.Router();
const {
  getAdminDashboardStats,
  getFacultyDashboardStats,
  getStudentDashboardStats,
  getReports
} = require("../controllers/reportController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(authenticate);

router.get("/dashboard/admin", authorize("admin"), getAdminDashboardStats);
router.get("/dashboard/faculty", authorize("faculty"), getFacultyDashboardStats);
router.get("/dashboard/student", authorize("student"), getStudentDashboardStats);
router.get("/data", authorize("admin"), getReports);

module.exports = router;
