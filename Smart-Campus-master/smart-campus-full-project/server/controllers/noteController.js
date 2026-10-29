
const Note = require("../models/Note");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Course = require("../models/Course");

exports.getNotes = async (req, res, next) => {
  try {
    const { courseId, semester, department, search } = req.query;
    let query = {};
    if (courseId) query.course = courseId;
    if (semester) query.semester = Number(semester);
    if (department) query.department = department;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (req.user && req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        query.department = student.department;
        query.semester = student.semester;
      }
    }

    const notes = await Note.find(query)
      .populate("course", "name code")
      .populate("faculty", "name facultyId")
      .populate("department", "name code")
      .sort({ uploadedDate: -1 });

    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    next(error);
  }
};

exports.uploadNote = async (req, res, next) => {
  try {
    const { title, description, course: courseId } = req.body;
    if (!title || !courseId) {
      return res.status(400).json({ success: false, message: "Title and Course are required." });
    }

    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only faculty or admin can upload study materials." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    let fileUrl = "/uploads/sample-lecture-notes.pdf";
    let fileName = "Lecture-Notes.pdf";
    let fileSize = "1.2 MB";

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + " MB";
    }

    const note = await Note.create({
      title: title.trim(),
      description: description || "",
      department: course.department,
      course: course._id,
      semester: course.semester,
      faculty: faculty ? faculty._id : course.faculty,
      fileUrl,
      fileName,
      fileSize,
      uploadedDate: new Date()
    });

    const populated = await Note.findById(note._id).populate("course faculty department");
    res.status(201).json({ success: true, message: "Study material uploaded successfully.", data: populated });
  } catch (error) {
    next(error);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found." });
    }
    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Note deleted successfully." });
  } catch (error) {
    next(error);
  }
};
