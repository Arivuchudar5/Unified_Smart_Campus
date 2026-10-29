
const Timetable = require("../models/Timetable");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

exports.getTimetable = async (req, res, next) => {
  try {
    const { department, course, semester, day, faculty } = req.query;
    let query = {};
    if (department) query.department = department;
    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (day) query.day = day;
    if (faculty) query.faculty = faculty;

    const entries = await Timetable.find(query)
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("faculty", "name facultyId")
      .sort({ day: 1, startTime: 1 });

    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    next(error);
  }
};

exports.getStudentTimetable = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    const timetable = await Timetable.find({
      department: student.department,
      semester: student.semester
    })
      .populate("course", "name code")
      .populate("faculty", "name")
      .sort({ day: 1, startTime: 1 });

    res.status(200).json({ success: true, count: timetable.length, data: timetable });
  } catch (error) {
    next(error);
  }
};

exports.getFacultyTimetable = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty record not found." });
    }

    const timetable = await Timetable.find({ faculty: faculty._id })
      .populate("department", "name code")
      .populate("course", "name code")
      .sort({ day: 1, startTime: 1 });

    res.status(200).json({ success: true, count: timetable.length, data: timetable });
  } catch (error) {
    next(error);
  }
};

exports.createTimetable = async (req, res, next) => {
  try {
    const { department, course, semester, subject, faculty, day, startTime, endTime, room } = req.body;

    if (!department || !course || !semester || !subject || !faculty || !day || !startTime || !endTime || !room) {
      return res.status(400).json({ success: false, message: "All timetable fields are required." });
    }

    // Faculty Conflict Checking
    const facultyConflict = await Timetable.findOne({
      faculty,
      day,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    }).populate("faculty");

    if (facultyConflict) {
      return res.status(400).json({
        success: false,
        message: `Faculty Conflict: ${facultyConflict.faculty ? facultyConflict.faculty.name : "Faculty"} is already scheduled for "${facultyConflict.subject}" at ${facultyConflict.startTime}-${facultyConflict.endTime} on ${day}.`
      });
    }

    // Room Conflict Checking
    const roomConflict = await Timetable.findOne({
      room: room.trim(),
      day,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    });

    if (roomConflict) {
      return res.status(400).json({
        success: false,
        message: `Room Conflict: Room ${room} is already booked for "${roomConflict.subject}" at ${roomConflict.startTime}-${roomConflict.endTime} on ${day}.`
      });
    }

    const entry = await Timetable.create({
      department,
      course,
      semester: Number(semester),
      subject: subject.trim(),
      faculty,
      day,
      startTime,
      endTime,
      room: room.trim()
    });

    const populated = await Timetable.findById(entry._id).populate("department course faculty");
    res.status(201).json({ success: true, message: "Timetable slot added successfully.", data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateTimetable = async (req, res, next) => {
  try {
    const { department, course, semester, subject, faculty, day, startTime, endTime, room } = req.body;
    const entry = await Timetable.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ success: false, message: "Timetable slot not found." });
    }

    if (department) entry.department = department;
    if (course) entry.course = course;
    if (semester) entry.semester = Number(semester);
    if (subject) entry.subject = subject.trim();
    if (faculty) entry.faculty = faculty;
    if (day) entry.day = day;
    if (startTime) entry.startTime = startTime;
    if (endTime) entry.endTime = endTime;
    if (room) entry.room = room.trim();

    await entry.save();
    const updated = await Timetable.findById(entry._id).populate("department course faculty");
    res.status(200).json({ success: true, message: "Timetable slot updated successfully.", data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteTimetable = async (req, res, next) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Timetable slot not found." });
    }
    await Timetable.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Timetable slot deleted successfully." });
  } catch (error) {
    next(error);
  }
};
