
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
import { Plus, Trash2, Megaphone, Search } from "lucide-react";

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    targetAudience: "All",
    department: ""
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [search, categoryFilter]);

  const fetchInitial = async () => {
    try {
      const dRes = await API.get("/departments");
      if (dRes.data.success) setDepartments(dRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await API.get("/announcements", { params });
      if (res.data.success) setAnnouncements(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      description: "",
      category: "General",
      targetAudience: "All",
      department: ""
    });
    setFormError("");
    setFormSuccess("");
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const res = await API.post("/announcements", formData);
      if (res.data.success) {
        setFormSuccess("Announcement broadcasted and notifications sent!");
        setTimeout(() => {
          setIsAddModalOpen(false);
          fetchAnnouncements();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to publish announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this announcement?")) {
      try {
        await API.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Announcements</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Broadcast official circulars, exam schedules, and events to Students and Faculty.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus} className="shadow-md">
          New Announcement
        </Button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-48 py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
        >
          <option value="">All Categories</option>
          {["Academic", "Administrative", "Exam", "Event", "General"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-400 font-medium">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400 font-medium">No announcements found.</div>
        ) : (
          announcements.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="primary">{item.category}</Badge>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-700">Target: {item.targetAudience}</span>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Publish Announcement">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Announcement Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. End Semester Lab Examination Schedule Released"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={["Academic", "Administrative", "Exam", "Event", "General"].map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Target Audience"
              required
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              options={[
                { value: "All", label: "All Campus (Students & Faculty)" },
                { value: "All Students", label: "All Students" },
                { value: "All Faculty", label: "All Faculty Members" },
                { value: "Department", label: "Specific Department" },
              ]}
            />
          </div>

          {formData.targetAudience === "Department" && (
            <Select
              label="Select Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={departments.map((d) => ({ value: d._id, label: d.name }))}
            />
          )}

          <Textarea
            label="Announcement Content"
            rows={5}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Write the full details of the notice..."
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Broadcast Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;
