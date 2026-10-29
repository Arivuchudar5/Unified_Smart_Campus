const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: Number, required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true, default: 100 },
    attachmentUrl: { type: String, default: "" },
    attachmentName: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
