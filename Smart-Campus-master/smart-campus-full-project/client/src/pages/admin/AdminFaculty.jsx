
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

const AdminFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    facultyId: "",
    email: "",
    phone: "",
    department: "",
    designation: "Assistant Professor",
    assignedSubjects: [],
    password: "",
    profilePhoto: "",
    status: "active"
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [search, deptFilter]);

  const fetchInitial = async () => {
    try {
      const dRes = await API.get("/departments");
      if (dRes.data.success) setDepartments(dRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;

      const res = await API.get("/faculty", { params });
      if (res.data.success) {
        setFacultyList(res.data.data);
      }
    } catch (err) {
      console.error(err);
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
      facultyId: "",
      email: "",
      phone: "",
      department: departments[0]?._id || "",
      designation: "Assistant Professor",
      assignedSubjects: [],
      password: "Faculty@123",
      profilePhoto: "",
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
      const res = await API.post("/faculty", formData);
      if (res.data.success) {
        setFormSuccess("Faculty member created successfully! Credentials active for login.");
        setTimeout(() => {
          setIsAddModalOpen(false);
          fetchFaculty();
        }, 1000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create faculty.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (f) => {
    setSelectedFaculty(f);
    setFormData({
      name: f.name,
      facultyId: f.facultyId,
      email: f.email,
      phone: f.phone || "",
      department: f.department?._id || f.department,
      designation: f.designation,
      assignedSubjects: f.assignedSubjects?.map((s) => s._id || s) || [],
      profilePhoto: f.profilePhoto || "",
      status: f.status
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
      const res = await API.put(`/faculty/${selectedFaculty._id}`, formData);
      if (res.data.success) {
        setFormSuccess("Faculty details updated successfully!");
        setTimeout(() => {
          setIsEditModalOpen(false);
          fetchFaculty();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update faculty.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/faculty/${id}/toggle-status`);
      fetchFaculty();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this faculty member and their login account?")) {
      try {
        await API.delete(`/faculty/${id}`);
        fetchFaculty();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Directory</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage professors, lecturers, HOD appointments, and teaching allocations.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus} className="shadow-md">
          Add Faculty
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by faculty name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-full md:w-56 py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table
        headers={["Faculty Name", "Faculty ID", "Email", "Phone", "Department", "Designation", "Status", "Actions"]}
        loading={loading}
        colSpan={8}
      >
        {facultyList.map((f) => (
          <tr key={f._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {f.profilePhoto ? (
                  <img src={f.profilePhoto} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  f.name.charAt(0)
                )}
              </div>
              <span>{f.name}</span>
            </td>
            <td className="px-6 py-4 font-semibold text-slate-600 text-xs">{f.facultyId}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{f.email}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{f.phone || "—"}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700">{f.department?.code || "—"}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{f.designation}</td>
            <td className="px-6 py-4">
              <Badge variant={f.status === "active" ? "success" : "danger"}>{f.status}</Badge>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedFaculty(f);
                    setIsViewModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  title="View Profile"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(f)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Edit Faculty"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(f._id)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                  title="Toggle Status"
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(f._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Faculty"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Faculty Member">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Faculty Full Name" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Dr. Alan Turing" />
            <Input label="Faculty ID" name="facultyId" required value={formData.facultyId} onChange={handleInputChange} placeholder="e.g. FAC-CSE-05" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Official Email" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="e.g. faculty@campus.edu" />
            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 555-0199" />
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
              label="Designation"
              name="designation"
              required
              value={formData.designation}
              onChange={handleInputChange}
              options={[
                { value: "Professor & HOD", label: "Professor & HOD" },
                { value: "Professor", label: "Professor" },
                { value: "Associate Professor", label: "Associate Professor" },
                { value: "Assistant Professor", label: "Assistant Professor" },
                { value: "Visiting Lecturer", label: "Visiting Lecturer" },
              ]}
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
              helperText="Hashed with bcrypt. Used by faculty to sign in."
            />
            <Input
              label="Profile Photo URL (Optional)"
              name="profilePhoto"
              value={formData.profilePhoto}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Faculty & Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Faculty Profile">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Faculty Name" name="name" required value={formData.name} onChange={handleInputChange} />
            <Input label="Faculty ID (Fixed)" name="facultyId" disabled value={formData.facultyId} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email (Fixed)" name="email" disabled value={formData.email} />
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
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
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              options={[
                { value: "Professor & HOD", label: "Professor & HOD" },
                { value: "Professor", label: "Professor" },
                { value: "Associate Professor", label: "Associate Professor" },
                { value: "Assistant Professor", label: "Assistant Professor" },
              ]}
            />
          </div>

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

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Faculty Details">
        {selectedFaculty && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl overflow-hidden shrink-0">
                {selectedFaculty.profilePhoto ? (
                  <img src={selectedFaculty.profilePhoto} alt={selectedFaculty.name} className="w-full h-full object-cover" />
                ) : (
                  selectedFaculty.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedFaculty.name}</h3>
                <p className="text-xs text-blue-600 font-bold">{selectedFaculty.facultyId}</p>
                <p className="text-xs text-slate-500">{selectedFaculty.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold uppercase">Department</span>
                <p className="font-bold text-slate-800 mt-1">{selectedFaculty.department?.name || "—"}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold uppercase">Designation</span>
                <p className="font-bold text-slate-800 mt-1">{selectedFaculty.designation}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold uppercase">Status</span>
                <p className="mt-1">
                  <Badge variant={selectedFaculty.status === "active" ? "success" : "danger"}>
                    {selectedFaculty.status}
                  </Badge>
                </p>
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

export default AdminFaculty;
