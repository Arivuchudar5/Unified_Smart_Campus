
const express = require("express");
const router = express.Router();
const {
  getNotes,
  uploadNote,
  deleteNote
} = require("../controllers/noteController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const upload = require("../middleware/upload");

router.use(authenticate);

router.get("/", getNotes);
router.post("/", authorize("faculty", "admin"), upload.single("file"), uploadNote);
router.delete("/:id", authorize("faculty", "admin"), deleteNote);

module.exports = router;
