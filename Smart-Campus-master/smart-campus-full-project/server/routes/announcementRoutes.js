
const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require("../controllers/announcementController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(authenticate);

router.get("/", getAnnouncements);
router.post("/", authorize("admin", "faculty"), createAnnouncement);
router.put("/:id", authorize("admin", "faculty"), updateAnnouncement);
router.delete("/:id", authorize("admin", "faculty"), deleteAnnouncement);

module.exports = router;
