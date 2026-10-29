
const express = require("express");
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require("../controllers/departmentController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(authenticate);

router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.post("/", authorize("admin"), createDepartment);
router.put("/:id", authorize("admin"), updateDepartment);
router.delete("/:id", authorize("admin"), deleteDepartment);

module.exports = router;
