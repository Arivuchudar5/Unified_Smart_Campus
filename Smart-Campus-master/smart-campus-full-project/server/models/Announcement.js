const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["Academic", "Administrative", "Exam", "Event", "General"], default: "General" },
    targetAudience: { type: String, enum: ["All", "All Students", "All Faculty", "Department", "Course"], default: "All" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "Admin" },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
