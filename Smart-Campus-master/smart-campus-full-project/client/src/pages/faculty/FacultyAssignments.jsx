
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
import { Plus, Trash2, Edit2, FileText, Calendar, ExternalLink, Users } from "lucide-react";
import { Link } from "react-router-dom";

const FacultyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
    maxMarks: 100
  });
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [cRes, aRes] = await Promise.all([
        API.get("/courses"),
        API.get("/assignments/faculty")
      ]);
      if (cRes.data.success) {
        setCourses(cRes.data.data);
        if (cRes.data.data.length > 0 && !formData.course) {
          setFormData((prev) => ({ ...prev, course: cRes.data.data[0]._id }));
        }
      }
      if (aRes.data.success) {
        setAssignments(aRes.data.data);
      }
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
      course: courses[0]?._id || "",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      maxMarks: 100
    });
    setAttachmentFile(null);
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
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("course", formData.course);
      data.append("dueDate", formData.dueDate);
      data.append("maxMarks", formData.maxMarks);
      if (attachmentFile) {
        data.append("attachment", attachmentFile);
      }

      const res = await API.post("/assignments", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setFormSuccess("Assignment published and student notifications sent!");
        setTimeout(() => {
          setIsAddModalOpen(false);
          fetchInitial();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this assignment and all student submissions?")) {
      try {
        await API.delete(`/assignments/${id}`);
        fetchInitial();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Course Assignments</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create coursework tasks, attach reference problem sets, set deadlines, and monitor student submission progress.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus} className="shadow-md">
          Create Assignment
        </Button>
      </div>

      {/* Table */}
      <Table
        headers={["Assignment Title", "Course", "Due Date", "Max Marks", "Submissions Status", "Attachment", "Actions"]}
        loading={loading}
        colSpan={7}
      >
        {assignments.map((a) => (
          <tr key={a._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4">
              <p className="font-bold text-slate-900 text-sm">{a.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{a.description}</p>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
              {a.course?.name} ({a.course?.code})
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-800">
              {new Date(a.dueDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-xs font-bold text-slate-900">{a.maxMarks} pts</td>
            <td className="px-6 py-4">
              <Link
                to="/faculty/submissions"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-100"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{a.totalSubmissions || 0} Submissions</span>
                <span className="text-[10px] text-indigo-500 font-normal">({a.evaluatedSubmissions || 0} graded)</span>
              </Link>
            </td>
            <td className="px-6 py-4 text-xs">
              {a.attachmentUrl ? (
                <a
                  href={a.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View File
                </a>
              ) : (
                <span className="text-slate-400">None</span>
              )}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => handleDelete(a._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete Assignment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {/* Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Assignment">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Assignment Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Binary Search Trees & AVL Tree Balancing"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Course / Subject"
              required
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))}
            />
            <Input
              label="Due Date"
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <Input
              label="Maximum Marks"
              type="number"
              required
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Instructions & Description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide problem specification, guidelines, and submission format..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Attachment File (PDF, DOCX, ZIP)
            </label>
            <input
              type="file"
              onChange={(e) => setAttachmentFile(e.target.files[0])}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Publish Assignment to Enrolled Students
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyAssignments;
