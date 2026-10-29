
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Alert from "../../components/common/Alert";
import { Plus, Search, Eye, Edit2, Trash2, Power } from "lucide-react";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    registerNumber: "",
    email: "",
    phone: "",
    department: "",
    course: "",
    year: 1,
    semester: 1,
    password: "",
    profilePhoto: "",
    address: "",
    status: "active"
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, deptFilter, statusFilter]);

  const fetchInitialData = async () => {
    try {
      const [deptRes, courseRes] = await Promise.all([
        API.get("/departments"),
        API.get("/courses")
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (courseRes.data.success) setCourses(courseRes.data.data);
    } catch (err) {
      console.error("Error fetching depts/courses:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get("/students", { params });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      registerNumber: "",
      email: "",
      phone: "",
      department: departments[0]?._id || "",
      course: "",
      year: 1,
      semester: 1,
      password: "Student@123",
      profilePhoto: "",
      address: "",
      status: "active"
    });
    setFormError("");
    setFormSuccess("");
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const res = await API.post("/students", formData);
      if (res.data.success) {
        setFormSuccess("Student created successfully! Credentials active for login.");
        setTimeout(() => {
          setIsAddModalOpen(false);
          fetchStudents();
        }, 1000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create student.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      registerNumber: student.registerNumber,
      email: student.email,
      phone: student.phone || "",
      department: student.department?._id || student.department,
      course: student.course?._id || student.course || "",
      year: student.year,
      semester: student.semester,
      address: student.address || "",
      profilePhoto: student.profilePhoto || "",
      status: student.status
    });
    setFormError("");
    setFormSuccess("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const res = await API.put(`/students/${selectedStudent._id}`, formData);
      if (res.data.success) {
        setFormSuccess("Student updated successfully!");
        setTimeout(() => {
          setIsEditModalOpen(false);
          fetchStudents();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update student.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/students/${id}/toggle-status`);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student and their login account?")) {
      try {
        await API.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage student registrations, academic standing, and login access.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus} className="shadow-md">
          Add Student
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, register number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-36 py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Students Table */}
      <Table
        headers={["Student Name", "Register No", "Email", "Department", "Year / Sem", "Status", "Actions"]}
        loading={loading}
        colSpan={7}
      >
        {students.map((st) => (
          <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {st.profilePhoto ? (
                  <img src={st.profilePhoto} alt={st.name} className="w-full h-full object-cover" />
                ) : (
                  st.name.charAt(0)
                )}
              </div>
              <span>{st.name}</span>
            </td>
            <td className="px-6 py-4 font-semibold text-slate-600 text-xs">{st.registerNumber}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{st.email}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
              {st.department?.code || "N/A"}
            </td>
            <td className="px-6 py-4 text-xs text-slate-600 font-medium">
              Year {st.year} &bull; Sem {st.semester}
            </td>
            <td className="px-6 py-4">
              <Badge variant={st.status === "active" ? "success" : "danger"}>{st.status}</Badge>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedStudent(st);
                    setIsViewModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  title="View Profile"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(st)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Edit Student"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(st._id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    st.status === "active"
                      ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                      : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                  title={st.status === "active" ? "Deactivate" : "Activate"}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(st._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Student"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Student">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Student Full Name" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. John Doe" />
            <Input label="Register Number" name="registerNumber" required value={formData.registerNumber} onChange={handleInputChange} placeholder="e.g. 2026CS115" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Official Email" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="e.g. john@campus.edu" />
            <Input label="Contact Phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. +1 555-0199" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              name="department"
              required
              value={formData.department}
              onChange={handleInputChange}
              options={departments.map((d) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
            />
            <Select
              label="Assigned Primary Course"
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Academic Year"
              name="year"
              required
              value={formData.year}
              onChange={handleInputChange}
              options={[
                { value: 1, label: "Year 1 (Freshman)" },
                { value: 2, label: "Year 2 (Sophomore)" },
                { value: 3, label: "Year 3 (Junior)" },
                { value: 4, label: "Year 4 (Senior)" },
              ]}
            />
            <Select
              label="Semester"
              name="semester"
              required
              value={formData.semester}
              onChange={handleInputChange}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Initial Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              helperText="Encrypted via bcrypt. Student uses this to sign in."
            />
            <Input
              label="Profile Avatar URL (Optional)"
              name="profilePhoto"
              value={formData.profilePhoto}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>

          <Input label="Residential Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="City, State, Zip" />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Student & Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student Profile">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Student Full Name" name="name" required value={formData.name} onChange={handleInputChange} />
            <Input label="Register Number (Fixed)" name="registerNumber" disabled value={formData.registerNumber} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email (Fixed)" name="email" disabled value={formData.email} />
            <Input label="Contact Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              options={departments.map((d) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Academic Year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              options={[1, 2, 3, 4].map((y) => ({ value: y, label: `Year ${y}` }))}
            />
            <Select
              label="Semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
            />
          </div>

          <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Student Academic Record">
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl overflow-hidden shrink-0">
                {selectedStudent.profilePhoto ? (
                  <img src={selectedStudent.profilePhoto} alt={selectedStudent.name} className="w-full h-full object-cover" />
                ) : (
                  selectedStudent.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs text-indigo-600 font-bold">{selectedStudent.registerNumber}</p>
                <p className="text-xs text-slate-500">{selectedStudent.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold uppercase">Department</span>
                <p className="font-bold text-slate-800 mt-1">{selectedStudent.department?.name || "N/A"}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold uppercase">Academic Standing</span>
                <p className="font-bold text-slate-800 mt-1">Year {selectedStudent.year} &bull; Sem {selectedStudent.semester}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold uppercase">Status</span>
                <p className="mt-1">
                  <Badge variant={selectedStudent.status === "active" ? "success" : "danger"}>
                    {selectedStudent.status}
                  </Badge>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold uppercase">Contact Phone</span>
                <p className="font-bold text-slate-800 mt-1">{selectedStudent.phone || "Not provided"}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 sm:col-span-2">
                <span className="text-slate-400 font-semibold uppercase">Address</span>
                <p className="font-bold text-slate-800 mt-1">{selectedStudent.address || "Not provided"}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminStudents;
