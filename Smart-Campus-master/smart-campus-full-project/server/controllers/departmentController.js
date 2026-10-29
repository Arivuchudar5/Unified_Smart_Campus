
const Department = require("../models/Department");
const Faculty = require("../models/Faculty");

exports.getDepartments = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } }
      ];
    }
    const departments = await Department.find(query).populate("hod", "name email designation").sort({ name: 1 });
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate("hod");
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, hod, description, status } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: "Department name and code are required." });
    }

    let hodName = "";
    if (hod) {
      const faculty = await Faculty.findById(hod);
      if (faculty) hodName = faculty.name;
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      hod: hod || null,
      hodName,
      description: description || "",
      status: status || "active"
    });

    res.status(201).json({ success: true, message: "Department created successfully.", data: department });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { name, code, hod, description, status } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }

    if (name) department.name = name.trim();
    if (code) department.code = code.toUpperCase().trim();
    if (description !== undefined) department.description = description;
    if (status) department.status = status;
    if (hod !== undefined) {
      department.hod = hod || null;
      if (hod) {
        const f = await Faculty.findById(hod);
        department.hodName = f ? f.name : "";
      } else {
        department.hodName = "";
      }
    }

    await department.save();
    const updated = await Department.findById(department._id).populate("hod");
    res.status(200).json({ success: true, message: "Department updated successfully.", data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Department deleted successfully." });
  } catch (error) {
    next(error);
  }
};
