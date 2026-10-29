const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: Number, required: true },
    internalMarks: { type: Number, required: true, default: 0 },
    assignmentMarks: { type: Number, required: true, default: 0 },
    examMarks: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, default: 0 },
    maxMarks: { type: Number, required: true, default: 100 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: "N/A" }
  },
  { timestamps: true }
);

markSchema.index({ student: 1, course: 1 }, { unique: true });

markSchema.pre("save", function (next) {
  this.totalMarks = (this.internalMarks || 0) + (this.assignmentMarks || 0) + (this.examMarks || 0);
  const max = this.maxMarks || 100;
  this.percentage = Math.min(100, Math.round((this.totalMarks / max) * 100 * 10) / 10);
  
  if (this.percentage >= 90) this.grade = "A+";
  else if (this.percentage >= 80) this.grade = "A";
  else if (this.percentage >= 70) this.grade = "B+";
  else if (this.percentage >= 60) this.grade = "B";
  else if (this.percentage >= 50) this.grade = "C";
  else if (this.percentage >= 40) this.grade = "P";
  else this.grade = "F";
  
  next();
});

module.exports = mongoose.model("Mark", markSchema);
