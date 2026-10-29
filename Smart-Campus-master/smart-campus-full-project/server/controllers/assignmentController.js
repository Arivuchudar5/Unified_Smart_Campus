
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Course = require("../models/Course");
const Notification = require("../models/Notification");

exports.getAssignments = async (req, res, next) => {
  try {
    const { courseId, semester, department } = req.query;
    let query = {};
    if (courseId) query.course = courseId;
    if (semester) query.semester = Number(semester);
    if (department) query.department = department;

    const assignments = await Assignment.find(query)
      .populate("course", "name code")
      .populate("faculty", "name facultyId")
      .sort({ dueDate: -1 });

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    next(error);
  }
};

exports.getStudentAssignments = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    const assignments = await Assignment.find({
      department: student.department,
      semester: student.semester
    })
      .populate("course", "name code")
      .populate("faculty", "name")
      .sort({ dueDate: 1 });

    const submissions = await Submission.find({ student: student._id });
    const subMap = {};
    submissions.forEach((sub) => {
      subMap[sub.assignment.toString()] = sub;
    });

    const enriched = assignments.map((assign) => {
      const sub = subMap[assign._id.toString()];
      let submissionStatus = "Not Submitted";
      if (sub) {
        submissionStatus = sub.status;
      }
      return {
        ...assign.toObject(),
        submissionStatus,
        submission: sub || null
      };
    });

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

exports.getFacultyAssignments = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty record not found." });
    }

    const assignments = await Assignment.find({ faculty: faculty._id })
      .populate("course", "name code semester")
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      assignments.map(async (assign) => {
        const totalSubmissions = await Submission.countDocuments({ assignment: assign._id });
        const evaluatedSubmissions = await Submission.countDocuments({
          assignment: assign._id,
          status: "Evaluated"
        });
        return {
          ...assign.toObject(),
          totalSubmissions,
          evaluatedSubmissions
        };
      })
    );

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const { title, description, course: courseId, dueDate, maxMarks } = req.body;
    if (!title || !courseId || !dueDate) {
      return res.status(400).json({ success: false, message: "Title, Course, and Due Date are required." });
    }

    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only faculty or admin can create assignments." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    let attachmentUrl = "";
    let attachmentName = "";
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
      attachmentName = req.file.originalname;
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description || "",
      department: course.department,
      course: course._id,
      semester: course.semester,
      faculty: faculty ? faculty._id : course.faculty,
      dueDate: new Date(dueDate),
      maxMarks: Number(maxMarks) || 100,
      attachmentUrl,
      attachmentName
    });

    const enrolledStudents = await Student.find({
      department: course.department,
      semester: course.semester,
      status: "active"
    });

    const notifs = enrolledStudents.map((s) => ({
      recipient: s.user,
      title: "New Assignment Posted",
      message: `"${title}" has been assigned for ${course.name}. Due on ${new Date(dueDate).toLocaleDateString()}.`,
      type: "assignment",
      link: "/student/assignments"
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    const populated = await Assignment.findById(assignment._id).populate("course faculty");
    res.status(201).json({ success: true, message: "Assignment created successfully.", data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, maxMarks } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    if (title) assignment.title = title.trim();
    if (description !== undefined) assignment.description = description;
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (maxMarks) assignment.maxMarks = Number(maxMarks);

    if (req.file) {
      assignment.attachmentUrl = `/uploads/${req.file.filename}`;
      assignment.attachmentName = req.file.originalname;
    }

    await assignment.save();
    const updated = await Assignment.findById(assignment._id).populate("course faculty");
    res.status(200).json({ success: true, message: "Assignment updated successfully.", data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }
    await Submission.deleteMany({ assignment: assignment._id });
    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Assignment deleted successfully." });
  } catch (error) {
    next(error);
  }
};
