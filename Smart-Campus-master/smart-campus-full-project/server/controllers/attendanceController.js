
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Course = require("../models/Course");

exports.saveAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;
    if (!courseId || !date || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid attendance payload." });
    }

    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only faculty or admin can mark attendance." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const facultyId = faculty ? faculty._id : course.faculty;

    const bulkOps = records.map((rec) => ({
      updateOne: {
        filter: { student: rec.studentId, course: courseId, date: date },
        update: {
          $set: {
            student: rec.studentId,
            faculty: facultyId,
            department: course.department,
            course: courseId,
            semester: course.semester,
            date: date,
            status: rec.status,
            remarks: rec.remarks || ""
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: `Attendance for ${date} saved successfully for ${records.length} students.`
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentAttendance = async (req, res, next) => {
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

    const attendanceRecords = await Attendance.find({ student: studentId })
      .populate("course", "name code")
      .populate("faculty", "name")
      .sort({ date: -1 });

    const subjectMap = {};
    let totalClasses = 0;
    let totalPresent = 0;

    attendanceRecords.forEach((att) => {
      if (!att.course) return;
      const courseId = att.course._id.toString();
      if (!subjectMap[courseId]) {
        subjectMap[courseId] = {
          courseId: att.course._id,
          courseName: att.course.name,
          courseCode: att.course.code,
          total: 0,
          present: 0,
          absent: 0,
          records: []
        };
      }

      subjectMap[courseId].total += 1;
      totalClasses += 1;

      if (att.status === "Present") {
        subjectMap[courseId].present += 1;
        totalPresent += 1;
      } else {
        subjectMap[courseId].absent += 1;
      }

      subjectMap[courseId].records.push(att);
    });

    const subjectWise = Object.values(subjectMap).map((sub) => {
      const percentage = sub.total > 0 ? Math.round((sub.present / sub.total) * 100 * 10) / 10 : 0;
      return { ...sub, percentage };
    });

    const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100 * 10) / 10 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalClasses,
        totalPresent,
        totalAbsent: totalClasses - totalPresent,
        overallPercentage,
        subjectWise,
        allRecords: attendanceRecords
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getFacultyAttendance = async (req, res, next) => {
  try {
    const { courseId, date } = req.query;
    let query = {};
    if (courseId) query.course = courseId;
    if (date) query.date = date;

    const records = await Attendance.find(query)
      .populate("student", "name registerNumber email")
      .populate("course", "name code")
      .sort({ "student.name": 1 });

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};
