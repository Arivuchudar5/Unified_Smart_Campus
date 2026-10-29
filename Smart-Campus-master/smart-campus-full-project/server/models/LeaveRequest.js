const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    leaveType: { type: String, enum: ["Medical Leave", "Personal Leave", "Academic Leave", "Other Leave"], default: "Personal Leave" },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    reason: { type: String, required: true },
    attachmentUrl: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewerName: { type: String, default: "" },
    reviewRemarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveSchema);
