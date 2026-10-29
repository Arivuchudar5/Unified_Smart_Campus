
const Student = require("../models/Student");
const User = require("../models/User");

exports.getStudents = async (req, res, next) => {
  try {
    const { search, department, year, semester, status } = req.query;
    let query = {};
    if (department) query.department = department;
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { registerNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const students = await Student.find(query)
      .populate("department", "name code")
      .populate("course", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate("department course");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const { name, registerNumber, email, phone, department, course, year, semester, password, profilePhoto, address, status } = req.body;
    if (!name || !registerNumber || !email || !department || !year || !semester) {
      return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists." });
    }

    const existingStudent = await Student.findOne({ registerNumber: registerNumber.toUpperCase().trim() });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: "Student with this Register Number already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password || "Student@123",
      role: "student",
      status: status || "active",
      avatar: profilePhoto || ""
    });

    const student = await Student.create({
      user: user._id,
      name: name.trim(),
      registerNumber: registerNumber.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      phone: phone || "",
      department,
      course: course || null,
      year: Number(year),
      semester: Number(semester),
      address: address || "",
      profilePhoto: profilePhoto || "",
      status: status || "active"
    });

    const populated = await Student.findById(student._id).populate("department course");
    res.status(201).json({ success: true, message: "Student created successfully.", data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const { name, phone, department, course, year, semester, address, profilePhoto, status } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    if (name) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (department) student.department = department;
    if (course !== undefined) student.course = course;
    if (year) student.year = Number(year);
    if (semester) student.semester = Number(semester);
    if (address !== undefined) student.address = address;
    if (profilePhoto !== undefined) student.profilePhoto = profilePhoto;
    if (status) student.status = status;

    await student.save();

    const user = await User.findById(student.user);
    if (user) {
      if (name) user.name = name;
      if (status) user.status = status;
      if (profilePhoto) user.avatar = profilePhoto;
      await user.save();
    }

    const updated = await Student.findById(student._id).populate("department course");
    res.status(200).json({ success: true, message: "Student updated successfully.", data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }
    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(student._id);
    res.status(200).json({ success: true, message: "Student deleted successfully." });
  } catch (error) {
    next(error);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }
    const newStatus = student.status === "active" ? "inactive" : "active";
    student.status = newStatus;
    await student.save();
    await User.findByIdAndUpdate(student.user, { status: newStatus });
    res.status(200).json({ success: true, message: "Student status updated.", data: student });
  } catch (error) {
    next(error);
  }
};
