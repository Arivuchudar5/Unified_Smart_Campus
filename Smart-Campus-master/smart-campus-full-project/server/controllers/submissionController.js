
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");
const Notification = require("../models/Notification");

exports.submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId, comments } = req.body;
    if (!assignmentId) {
      return res.status(400).json({ success: false, message: "Assignment ID is required." });
    }

    if (!req.file && !req.body.fileUrl) {
      return res.status(400).json({ success: false, message: "Please upload your solution file." });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
    const fileName = req.file ? req.file.originalname : "solution.pdf";

    const isLate = new Date() > new Date(assignment.dueDate);
    const status = isLate ? "Late" : "Submitted";

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignmentId, student: student._id },
      {
        assignment: assignmentId,
        student: student._id,
        submissionDate: new Date(),
        fileUrl,
        fileName,
        comments: comments || "",
        status
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: "Assignment submitted successfully.", data: submission });
  } catch (error) {
    next(error);
  }
};

exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate("student", "name registerNumber email profilePhoto")
      .populate("assignment", "title maxMarks dueDate")
      .sort({ submissionDate: -1 });

    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    next(error);
  }
};

exports.getAllSubmissionsForFaculty = async (req, res, next) => {
  try {
    const submissions = await Submission.find()
      .populate("student", "name registerNumber email")
      .populate({
        path: "assignment",
        populate: { path: "course", select: "name code" }
      })
      .sort({ submissionDate: -1 });

    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    next(error);
  }
};

exports.evaluateSubmission = async (req, res, next) => {
  try {
    const { marksObtained, feedback } = req.body;
    const submission = await Submission.findById(req.params.id).populate("student assignment");
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    if (marksObtained === undefined || marksObtained === null) {
      return res.status(400).json({ success: false, message: "Marks obtained is required." });
    }

    const maxMarks = submission.assignment ? submission.assignment.maxMarks : 100;
    if (Number(marksObtained) > maxMarks) {
      return res.status(400).json({ success: false, message: `Marks cannot exceed maximum marks of ${maxMarks}.` });
    }

    submission.marksObtained = Number(marksObtained);
    submission.feedback = feedback || "";
    submission.status = "Evaluated";
    submission.evaluatedAt = new Date();
    await submission.save();

    if (submission.student && submission.student.user) {
      await Notification.create({
        recipient: submission.student.user,
        title: "Assignment Evaluated",
        message: `Your submission for "${submission.assignment.title}" has been graded: ${marksObtained}/${maxMarks}.`,
        type: "marks",
        link: "/student/assignments"
      });
    }

    res.status(200).json({ success: true, message: "Submission evaluated successfully.", data: submission });
  } catch (error) {
    next(error);
  }
};
