
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
import { Plus, Search, Edit2, Trash2, Building2 } from "lucide-react";

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    hod: "",
    description: "",
    status: "active"
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, facRes] = await Promise.all([
        API.get("/departments", { params: { search } }),
        API.get("/faculty")
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (facRes.data.success) setFaculty(facRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: "", code: "", hod: "", description: "", status: "active" });
    setFormError("");
    setFormSuccess("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      hod: dept.hod?._id || "",
      description: dept.description || "",
      status: dept.status
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
      if (editingDept) {
        await API.put(`/departments/${editingDept._id}`, formData);
        setFormSuccess("Department updated successfully!");
      } else {
        await API.post("/departments", formData);
        setFormSuccess("Department created successfully!");
      }
      setTimeout(() => {
        setIsModalOpen(false);
        fetchData();
      }, 800);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save department.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this department?")) {
      try {
        await API.delete(`/departments/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Departments</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure campus departments, assign Head of Departments (HOD), and track active branches.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus} className="shadow-md">
          Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        headers={["Department Name", "Code", "Head of Department (HOD)", "Description", "Status", "Actions"]}
        loading={loading}
        colSpan={6}
      >
        {departments.map((dept) => (
          <tr key={dept._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>{dept.name}</span>
            </td>
            <td className="px-6 py-4 font-bold text-indigo-600 text-xs">{dept.code}</td>
            <td className="px-6 py-4 text-xs font-medium text-slate-700">
              {dept.hod?.name || dept.hodName || "Not Assigned"}
            </td>
            <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{dept.description || "—"}</td>
            <td className="px-6 py-4">
              <Badge variant={dept.status === "active" ? "success" : "danger"}>{dept.status}</Badge>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(dept._id)}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDept ? "Edit Department" : "Add Department"}>
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department Name"
              name="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mechanical Engineering"
            />
            <Input
              label="Department Code"
              name="code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. MECH"
            />
          </div>

          <Select
            label="Head of Department (HOD)"
            name="hod"
            value={formData.hod}
            onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
            options={faculty.map((f) => ({ value: f._id, label: `${f.name} (${f.facultyId} - ${f.designation})` }))}
            placeholder="Select Faculty HOD"
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Academic focus and laboratories overview..."
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingDept ? "Update Department" : "Save Department"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartments;
