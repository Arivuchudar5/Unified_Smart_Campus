const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    registerNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    year: { type: Number, required: true, min: 1, max: 4, default: 1 },
    semester: { type: Number, required: true, min: 1, max: 8, default: 1 },
    address: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
