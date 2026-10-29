
const Faculty = require("../models/Faculty");
const User = require("../models/User");

exports.getFaculty = async (req, res, next) => {
  try {
    const { search, department, designation, status } = req.query;
    let query = {};
    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { facultyId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const facultyList = await Faculty.find(query)
      .populate("department", "name code")
      .populate("assignedSubjects", "name code semester")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: facultyList.length, data: facultyList });
  } catch (error) {
    next(error);
  }
};

exports.getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate("department assignedSubjects");
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty member not found." });
    }
    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    next(error);
  }
};

exports.createFaculty = async (req, res, next) => {
  try {
    const { name, facultyId, email, phone, department, designation, assignedSubjects, password, profilePhoto, status } = req.body;
    if (!name || !facultyId || !email || !department) {
      return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists." });
    }

    const existingFaculty = await Faculty.findOne({ facultyId: facultyId.toUpperCase().trim() });
    if (existingFaculty) {
      return res.status(400).json({ success: false, message: "Faculty ID already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password || "Faculty@123",
      role: "faculty",
      status: status || "active",
      avatar: profilePhoto || ""
    });

    const faculty = await Faculty.create({
      user: user._id,
      name: name.trim(),
      facultyId: facultyId.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      phone: phone || "",
      department,
      designation: designation || "Assistant Professor",
      assignedSubjects: assignedSubjects || [],
      profilePhoto: profilePhoto || "",
      status: status || "active"
    });

    const populated = await Faculty.findById(faculty._id).populate("department assignedSubjects");
    res.status(201).json({ success: true, message: "Faculty created successfully.", data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateFaculty = async (req, res, next) => {
  try {
    const { name, phone, department, designation, assignedSubjects, profilePhoto, status } = req.body;
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found." });
    }

    if (name) faculty.name = name;
    if (phone !== undefined) faculty.phone = phone;
    if (department) faculty.department = department;
    if (designation) faculty.designation = designation;
    if (assignedSubjects !== undefined) faculty.assignedSubjects = assignedSubjects;
    if (profilePhoto !== undefined) faculty.profilePhoto = profilePhoto;
    if (status) faculty.status = status;

    await faculty.save();

    const user = await User.findById(faculty.user);
    if (user) {
      if (name) user.name = name;
      if (status) user.status = status;
      if (profilePhoto) user.avatar = profilePhoto;
      await user.save();
    }

    const updated = await Faculty.findById(faculty._id).populate("department assignedSubjects");
    res.status(200).json({ success: true, message: "Faculty updated successfully.", data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found." });
    }
    await User.findByIdAndDelete(faculty.user);
    await Faculty.findByIdAndDelete(faculty._id);
    res.status(200).json({ success: true, message: "Faculty deleted successfully." });
  } catch (error) {
    next(error);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found." });
    }
    const newStatus = faculty.status === "active" ? "inactive" : "active";
    faculty.status = newStatus;
    await faculty.save();
    await User.findByIdAndUpdate(faculty.user, { status: newStatus });
    res.status(200).json({ success: true, message: "Faculty status updated.", data: faculty });
  } catch (error) {
    next(error);
  }
};
