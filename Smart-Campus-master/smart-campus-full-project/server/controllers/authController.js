
const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "smart_campus_super_secure_jwt_secret_key_2026_x79!", {
    expiresIn: "30d"
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      const student = await Student.findOne({ registerNumber: email.toUpperCase().trim() });
      if (student) {
        user = await User.findById(student.user);
      } else {
        const faculty = await Faculty.findOne({ facultyId: email.toUpperCase().trim() });
        if (faculty) {
          user = await User.findById(faculty.user);
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid login credentials." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid login credentials." });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ success: false, message: "Account is inactive. Contact Administrator." });
    }

    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ user: user._id }).populate("department course");
    } else if (user.role === "faculty") {
      profile = await Faculty.findOne({ user: user._id }).populate("department assignedSubjects");
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ user: user._id }).populate("department course");
    } else if (user.role === "faculty") {
      profile = await Faculty.findOne({ user: user._id }).populate("department assignedSubjects");
    }

    res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, address, avatar, name } = req.body;
    const user = await User.findById(req.user._id);

    if (name && req.user.role === "admin") {
      user.name = name;
    }
    if (avatar) {
      user.avatar = avatar;
    }
    await user.save();

    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        if (phone !== undefined) student.phone = phone;
        if (address !== undefined) student.address = address;
        if (avatar) student.profilePhoto = avatar;
        await student.save();
      }
    } else if (req.user.role === "faculty") {
      const faculty = await Faculty.findOne({ user: req.user._id });
      if (faculty) {
        if (phone !== undefined) faculty.phone = phone;
        if (avatar) faculty.profilePhoto = avatar;
        await faculty.save();
      }
    }

    res.status(200).json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide current and new password." });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
};
