
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Modal from "../../components/common/Modal";
import Alert from "../../components/common/Alert";
import { Plus, Trash2, Download, BookMarked, ExternalLink } from "lucide-react";

const FacultyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: ""
  });
  const [noteFile, setNoteFile] = useState(null);

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [cRes, nRes] = await Promise.all([
        API.get("/courses"),
        API.get("/notes")
      ]);
      if (cRes.data.success) {
        setCourses(cRes.data.data);
        if (cRes.data.data.length > 0 && !formData.course) {
          setFormData((prev) => ({ ...prev, course: cRes.data.data[0]._id }));
        }
      }
      if (nRes.data.success) setNotes(nRes.data.data);
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
      course: courses[0]?._id || ""
    });
    setNoteFile(null);
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
      if (noteFile) {
        data.append("file", noteFile);
      }

      const res = await API.post("/notes", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setFormSuccess("Study material uploaded successfully!");
        setTimeout(() => {
          setIsAddModalOpen(false);
          fetchInitial();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to upload note.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this learning material?")) {
      try {
        await API.delete(`/notes/${id}`);
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Study Materials & Notes</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Upload lecture notes, presentation slide decks, and reference study material for enrolled students.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus} className="shadow-md">
          Upload Study Material
        </Button>
      </div>

      <Table
        headers={["Material Title", "Course / Subject", "Uploaded Date", "File Details", "Action"]}
        loading={loading}
        colSpan={5}
      >
        {notes.map((n) => (
          <tr key={n._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4">
              <p className="font-bold text-slate-900 text-sm">{n.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.description}</p>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
              {n.course?.name} ({n.course?.code})
            </td>
            <td className="px-6 py-4 text-xs text-slate-600">
              {new Date(n.uploadedDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-xs">
              <a
                href={n.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> {n.fileName} ({n.fileSize})
              </a>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => handleDelete(n._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Upload Learning Material">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Note Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Unit 4: Distributed Database Transactions"
          />

          <Select
            label="Course / Subject"
            required
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))}
          />

          <Textarea
            label="Description / Topic Overview"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Key concepts covered in this module..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Document File (PDF, PPTX, DOCX)
            </label>
            <input
              type="file"
              onChange={(e) => setNoteFile(e.target.files[0])}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Upload Material
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyNotes;
