const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    submissionDate: { type: Date, default: Date.now },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "submission.pdf" },
    comments: { type: String, default: "" },
    marksObtained: { type: Number, default: null },
    feedback: { type: String, default: "" },
    status: { type: String, enum: ["Submitted", "Evaluated", "Late"], default: "Submitted" },
    evaluatedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
