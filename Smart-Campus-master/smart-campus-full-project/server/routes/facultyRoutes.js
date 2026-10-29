
const express = require("express");
const router = express.Router();
const {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  toggleStatus
} = require("../controllers/facultyController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(authenticate);

router.get("/", getFaculty);
router.get("/:id", getFacultyById);
router.post("/", authorize("admin"), createFaculty);
router.put("/:id", authorize("admin"), updateFaculty);
router.delete("/:id", authorize("admin"), deleteFaculty);
router.patch("/:id/toggle-status", authorize("admin"), toggleStatus);

module.exports = router;
