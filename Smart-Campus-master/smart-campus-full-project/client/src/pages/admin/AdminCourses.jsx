
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Alert from "../../components/common/Alert";
import { Plus, Search, Edit2, Trash2, BookOpen } from "lucide-react";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department: "",
    semester: 1,
    credits: 3,
    faculty: "",
    description: "",
    status: "active"
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [search, deptFilter, semFilter]);

  const fetchInitial = async () => {
    try {
      const [dRes, fRes] = await Promise.all([
        API.get("/departments"),
        API.get("/faculty")
      ]);
      if (dRes.data.success) setDepartments(dRes.data.data);
      if (fRes.data.success) setFaculty(fRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (semFilter) params.semester = semFilter;

      const res = await API.get("/courses", { params });
      if (res.data.success) setCourses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      name: "",
      code: "",
      department: departments[0]?._id || "",
      semester: 1,
      credits: 3,
      faculty: "",
      description: "",
      status: "active"
    });
    setFormError("");
    setFormSuccess("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCourse(c);
    setFormData({
      name: c.name,
      code: c.code,
      department: c.department?._id || c.department,
      semester: c.semester,
      credits: c.credits,
      faculty: c.faculty?._id || c.faculty || "",
      description: c.description || "",
      status: c.status
    });
    setFormError("");
    setFormSuccess("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      if (editingCourse) {
        await API.put(`/courses/${editingCourse._id}`, formData);
        setFormSuccess("Course updated successfully!");
      } else {
        await API.post("/courses", formData);
        setFormSuccess("Course created successfully!");
      }
      setTimeout(() => {
        setIsModalOpen(false);
        fetchCourses();
      }, 800);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save course.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this course from curriculum?")) {
      try {
        await API.delete(`/courses/${id}`);
        fetchCourses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Course Curriculum</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage degree courses, credit weights, semester distribution, and faculty assignments.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus} className="shadow-md">
          Add Course
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-full md:w-48 py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>

        <select
          value={semFilter}
          onChange={(e) => setSemFilter(e.target.value)}
          className="w-full md:w-36 py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table
        headers={["Course Title", "Code", "Department", "Semester", "Credits", "Assigned Faculty", "Actions"]}
        loading={loading}
        colSpan={7}
      >
        {courses.map((c) => (
          <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>{c.name}</span>
            </td>
            <td className="px-6 py-4 font-bold text-indigo-600 text-xs">{c.code}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700">{c.department?.name || "—"}</td>
            <td className="px-6 py-4 text-xs text-slate-600">Semester {c.semester}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-800">{c.credits} Credits</td>
            <td className="px-6 py-4 text-xs font-medium text-slate-700">
              {c.faculty ? c.faculty.name : <span className="text-slate-400 italic">Unassigned</span>}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourse ? "Edit Course" : "Add Course"}>
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Course Title"
              name="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Cloud Computing & Microservices"
            />
            <Input
              label="Course Code"
              name="code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. CS405"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              name="department"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={departments.map((d) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
            />
            <Select
              label="Assigned Faculty"
              name="faculty"
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              options={faculty.map((f) => ({ value: f._id, label: `${f.name} (${f.facultyId})` }))}
              placeholder="Assign Faculty Professor"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Semester"
              name="semester"
              required
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
            />
            <Select
              label="Credits"
              name="credits"
              required
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              options={[1, 2, 3, 4, 5, 6].map((c) => ({ value: c, label: `${c} Credits` }))}
            />
          </div>

          <Textarea
            label="Course Syllabus / Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Key topics and learning outcomes..."
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCourses;
