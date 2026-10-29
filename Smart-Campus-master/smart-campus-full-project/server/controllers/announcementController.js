
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

exports.getAnnouncements = async (req, res, next) => {
  try {
    const { category, targetAudience, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (targetAudience) query.targetAudience = targetAudience;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (req.user && req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      query.$or = [
        { targetAudience: "All" },
        { targetAudience: "All Students" },
        ...(student ? [{ department: student.department }, { course: student.course }] : [])
      ];
    } else if (req.user && req.user.role === "faculty") {
      const faculty = await Faculty.findOne({ user: req.user._id });
      query.$or = [
        { targetAudience: "All" },
        { targetAudience: "All Faculty" },
        ...(faculty ? [{ department: faculty.department }] : [])
      ];
    }

    const announcements = await Announcement.find(query)
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("postedBy", "name role")
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    next(error);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, category, targetAudience, department, course } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required." });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      description: description.trim(),
      category: category || "General",
      targetAudience: targetAudience || "All",
      department: department || null,
      course: course || null,
      postedBy: req.user._id,
      authorName: req.user.name || "Campus Administration",
      date: new Date()
    });

    let userQuery = { status: "active" };
    if (targetAudience === "All Students") userQuery.role = "student";
    else if (targetAudience === "All Faculty") userQuery.role = "faculty";

    const targetUsers = await User.find(userQuery).select("_id");
    const notifs = targetUsers.map((u) => ({
      recipient: u._id,
      title: `Announcement: ${title}`,
      message: description.slice(0, 100) + (description.length > 100 ? "..." : ""),
      type: "announcement",
      link: req.user.role === "student" ? "/student/announcements" : "/admin/announcements"
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    res.status(201).json({ success: true, message: "Announcement published successfully.", data: announcement });
  } catch (error) {
    next(error);
  }
};

exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { title, description, category, targetAudience, department, course } = req.body;
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found." });
    }

    if (title) announcement.title = title.trim();
    if (description) announcement.description = description.trim();
    if (category) announcement.category = category;
    if (targetAudience) announcement.targetAudience = targetAudience;
    if (department !== undefined) announcement.department = department || null;
    if (course !== undefined) announcement.course = course || null;

    await announcement.save();
    res.status(200).json({ success: true, message: "Announcement updated successfully.", data: announcement });
  } catch (error) {
    next(error);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found." });
    }
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Announcement deleted successfully." });
  } catch (error) {
    next(error);
  }
};
