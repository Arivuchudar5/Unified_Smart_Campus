
const Mark = require("../models/Mark");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Course = require("../models/Course");
const Notification = require("../models/Notification");

exports.saveMarks = async (req, res, next) => {
  try {
    const { studentId, courseId, internalMarks, assignmentMarks, examMarks, maxMarks } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ success: false, message: "Student and Course are required." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const faculty = await Faculty.findOne({ user: req.user._id });
    const facultyId = faculty ? faculty._id : course.faculty;

    const total = (Number(internalMarks) || 0) + (Number(assignmentMarks) || 0) + (Number(examMarks) || 0);
    const maximum = Number(maxMarks) || 100;

    if (total > maximum) {
      return res.status(400).json({ success: false, message: `Total marks (${total}) exceed maximum marks (${maximum}).` });
    }

    let mark = await Mark.findOne({ student: studentId, course: courseId });
    if (mark) {
      mark.internalMarks = Number(internalMarks) || 0;
      mark.assignmentMarks = Number(assignmentMarks) || 0;
      mark.examMarks = Number(examMarks) || 0;
      mark.maxMarks = maximum;
      mark.faculty = facultyId;
      await mark.save();
    } else {
      mark = await Mark.create({
        student: studentId,
        faculty: facultyId,
        department: course.department,
        course: courseId,
        semester: course.semester,
        internalMarks: Number(internalMarks) || 0,
        assignmentMarks: Number(assignmentMarks) || 0,
        examMarks: Number(examMarks) || 0,
        maxMarks: maximum
      });
    }

    await Notification.create({
      recipient: student.user,
      title: "Marks Published",
      message: `Marks updated for ${course.name}: Total ${mark.totalMarks}/${mark.maxMarks} (Grade: ${mark.grade}).`,
      type: "marks",
      link: "/student/marks"
    });

    const populated = await Mark.findById(mark._id).populate("student course faculty");
    res.status(200).json({ success: true, message: "Marks saved successfully.", data: populated });
  } catch (error) {
    next(error);
  }
};

exports.getStudentMarks = async (req, res, next) => {
  try {
    let studentId = req.query.studentId;
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.status(404).json({ success: false, message: "Student record not found." });
      studentId = student._id;
    }

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID required." });
    }

    const marks = await Mark.find({ student: studentId })
      .populate("course", "name code credits semester")
      .populate("faculty", "name")
      .sort({ semester: 1 });

    const totalCredits = marks.reduce((acc, m) => acc + (m.course ? m.course.credits || 3 : 3), 0);
    const avgPercentage =
      marks.length > 0 ? Math.round((marks.reduce((acc, m) => acc + m.percentage, 0) / marks.length) * 10) / 10 : 0;

    res.status(200).json({
      success: true,
      data: {
        marks,
        totalSubjects: marks.length,
        avgPercentage,
        totalCredits
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getFacultyMarks = async (req, res, next) => {
  try {
    const { courseId, semester } = req.query;
    let query = {};
    if (courseId) query.course = courseId;
    if (semester) query.semester = Number(semester);

    const marks = await Mark.find(query)
      .populate("student", "name registerNumber email")
      .populate("course", "name code")
      .sort({ "student.registerNumber": 1 });

    res.status(200).json({ success: true, count: marks.length, data: marks });
  } catch (error) {
    next(error);
  }
};
