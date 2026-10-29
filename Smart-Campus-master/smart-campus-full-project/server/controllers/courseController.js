
const Course = require("../models/Course");

exports.getCourses = async (req, res, next) => {
  try {
    const { department, semester, faculty, search, status } = req.query;
    let query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (faculty) query.faculty = faculty;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } }
      ];
    }

    const courses = await Course.find(query)
      .populate("department", "name code")
      .populate("faculty", "name facultyId email")
      .sort({ code: 1 });

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    next(error);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate("department faculty");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, department, semester, credits, faculty, description, status } = req.body;
    if (!name || !code || !department || !semester) {
      return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    const course = await Course.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      department,
      semester: Number(semester),
      credits: Number(credits) || 3,
      faculty: faculty || null,
      description: description || "",
      status: status || "active"
    });

    const populated = await Course.findById(course._id).populate("department faculty");
    res.status(201).json({ success: true, message: "Course created successfully.", data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { name, code, department, semester, credits, faculty, description, status } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (name) course.name = name.trim();
    if (code) course.code = code.toUpperCase().trim();
    if (department) course.department = department;
    if (semester) course.semester = Number(semester);
    if (credits !== undefined) course.credits = Number(credits);
    if (faculty !== undefined) course.faculty = faculty || null;
    if (description !== undefined) course.description = description;
    if (status) course.status = status;

    await course.save();
    const updated = await Course.findById(course._id).populate("department faculty");
    res.status(200).json({ success: true, message: "Course updated successfully.", data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Course deleted successfully." });
  } catch (error) {
    next(error);
  }
};
