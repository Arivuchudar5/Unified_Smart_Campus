
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Department = require("../models/Department");
const Course = require("../models/Course");
const Attendance = require("../models/Attendance");
const Mark = require("../models/Mark");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const LeaveRequest = require("../models/LeaveRequest");
const Announcement = require("../models/Announcement");
const Timetable = require("../models/Timetable");
const Notification = require("../models/Notification");

exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalCourses = await Course.countDocuments();
    const pendingLeaves = await LeaveRequest.countDocuments({ status: "Pending" });
    const recentAnnouncements = await Announcement.find().sort({ date: -1 }).limit(5);

    const departments = await Department.find();
    const studentsByDepartment = await Promise.all(
      departments.map(async (dept) => {
        const count = await Student.countDocuments({ department: dept._id });
        return { name: dept.name, code: dept.code, count };
      })
    );

    const totalPresent = await Attendance.countDocuments({ status: "Present" });
    const totalAbsent = await Attendance.countDocuments({ status: "Absent" });
    const totalAttendance = totalPresent + totalAbsent;
    const avgAttendanceRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

    const approvedLeaves = await LeaveRequest.countDocuments({ status: "Approved" });
    const rejectedLeaves = await LeaveRequest.countDocuments({ status: "Rejected" });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalCourses,
        pendingLeaves,
        recentAnnouncements,
        charts: {
          studentsByDepartment,
          attendance: {
            totalPresent,
            totalAbsent,
            rate: avgAttendanceRate
          },
          leaves: {
            pending: pendingLeaves,
            approved: approvedLeaves,
            rejected: rejectedLeaves
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getFacultyDashboardStats = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user._id }).populate("department assignedSubjects");
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty record not found." });
    }

    const assignedSubjects = faculty.assignedSubjects ? faculty.assignedSubjects.length : 0;
    const studentCount = await Student.countDocuments({ department: faculty.department });
    const pendingAssignments = await Assignment.countDocuments({ faculty: faculty._id });
    const pendingLeaves = await LeaveRequest.countDocuments({ department: faculty.department, status: "Pending" });

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDay = days[new Date().getDay()];
    const todayClasses = await Timetable.find({ faculty: faculty._id, day: todayDay })
      .populate("course", "name code")
      .sort({ startTime: 1 });

    const recentAnnouncements = await Announcement.find({
      $or: [{ targetAudience: "All" }, { targetAudience: "All Faculty" }, { department: faculty.department }]
    })
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        faculty,
        assignedSubjects,
        studentCount,
        pendingAssignments,
        pendingLeaves,
        todayClasses,
        todayDay,
        recentAnnouncements
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentDashboardStats = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate("department course");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    const totalPresent = await Attendance.countDocuments({ student: student._id, status: "Present" });
    const totalRecords = await Attendance.countDocuments({ student: student._id });
    const attendancePercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100 * 10) / 10 : 0;

    const allAssignments = await Assignment.find({
      department: student.department,
      semester: student.semester
    });
    const submissions = await Submission.find({ student: student._id });
    const submittedAssignIds = new Set(submissions.map((s) => s.assignment.toString()));
    const pendingAssignments = allAssignments.filter((a) => !submittedAssignIds.has(a._id.toString())).length;

    const latestMarks = await Mark.find({ student: student._id })
      .populate("course", "name code")
      .sort({ updatedAt: -1 })
      .limit(4);

    const recentLeaves = await LeaveRequest.find({ student: student._id }).sort({ createdAt: -1 }).limit(3);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDay = days[new Date().getDay()];
    const todayClasses = await Timetable.find({
      department: student.department,
      semester: student.semester,
      day: todayDay
    })
      .populate("faculty", "name")
      .populate("course", "name code")
      .sort({ startTime: 1 });

    const recentAnnouncements = await Announcement.find({
      $or: [{ targetAudience: "All" }, { targetAudience: "All Students" }, { department: student.department }]
    })
      .sort({ date: -1 })
      .limit(5);

    const unreadNotifications = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      data: {
        student,
        attendancePercentage,
        pendingAssignments,
        latestMarks,
        recentLeaves,
        todayClasses,
        todayDay,
        recentAnnouncements,
        unreadNotifications
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const { type, department, course, semester, status } = req.query;
    let query = {};
    if (department) query.department = department;
    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (status) query.status = status;

    let result = [];
    if (type === "students") {
      result = await Student.find(query).populate("department course").sort({ name: 1 });
    } else if (type === "faculty") {
      result = await Faculty.find(query).populate("department assignedSubjects").sort({ name: 1 });
    } else if (type === "attendance") {
      result = await Attendance.find(query).populate("student course faculty").sort({ date: -1 });
    } else if (type === "marks") {
      result = await Mark.find(query).populate("student course faculty").sort({ "student.name": 1 });
    } else if (type === "assignments") {
      result = await Assignment.find(query).populate("course faculty").sort({ dueDate: -1 });
    } else if (type === "leaves") {
      result = await LeaveRequest.find(query).populate("student department reviewedBy").sort({ createdAt: -1 });
    } else {
      result = await Student.find().populate("department course");
    }

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};
