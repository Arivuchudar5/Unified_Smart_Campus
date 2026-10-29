
const LeaveRequest = require("../models/LeaveRequest");
const Student = require("../models/Student");
const Notification = require("../models/Notification");

exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, fromDate, toDate, reason, attachmentUrl } = req.body;
    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ success: false, message: "From Date, To Date, and Reason are required." });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    let fileUrl = attachmentUrl || "";
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const leave = await LeaveRequest.create({
      student: student._id,
      department: student.department,
      leaveType: leaveType || "Personal Leave",
      fromDate,
      toDate,
      reason: reason.trim(),
      attachmentUrl: fileUrl,
      status: "Pending"
    });

    const populated = await LeaveRequest.findById(leave._id).populate("student department");
    res.status(201).json({ success: true, message: "Leave application submitted successfully.", data: populated });
  } catch (error) {
    next(error);
  }
};

exports.getStudentLeaves = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    const leaves = await LeaveRequest.find({ student: student._id })
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    next(error);
  }
};

exports.getAllLeaves = async (req, res, next) => {
  try {
    const { status, department, leaveType } = req.query;
    let query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await LeaveRequest.find(query)
      .populate("student", "name registerNumber email phone")
      .populate("department", "name code")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    next(error);
  }
};

exports.approveLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate("student");
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    }

    leave.status = "Approved";
    leave.reviewedBy = req.user._id;
    leave.reviewerName = req.user.name;
    leave.reviewRemarks = remarks || "Approved by administration.";
    await leave.save();

    if (leave.student && leave.student.user) {
      await Notification.create({
        recipient: leave.student.user,
        title: "Leave Request Approved",
        message: `Your leave application for ${leave.fromDate} to ${leave.toDate} has been APPROVED.`,
        type: "leave",
        link: "/student/leave"
      });
    }

    res.status(200).json({ success: true, message: "Leave request approved.", data: leave });
  } catch (error) {
    next(error);
  }
};

exports.rejectLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate("student");
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    }

    leave.status = "Rejected";
    leave.reviewedBy = req.user._id;
    leave.reviewerName = req.user.name;
    leave.reviewRemarks = remarks || "Rejected by administration.";
    await leave.save();

    if (leave.student && leave.student.user) {
      await Notification.create({
        recipient: leave.student.user,
        title: "Leave Request Rejected",
        message: `Your leave application for ${leave.fromDate} to ${leave.toDate} has been REJECTED. Reason: ${leave.reviewRemarks}`,
        type: "leave",
        link: "/student/leave"
      });
    }

    res.status(200).json({ success: true, message: "Leave request rejected.", data: leave });
  } catch (error) {
    next(error);
  }
};
