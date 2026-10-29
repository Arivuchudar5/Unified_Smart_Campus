
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Alert from "../../components/common/Alert";
import { Plus, Trash2, Megaphone } from "lucide-react";

const FacultyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Academic",
    targetAudience: "Course",
    course: ""
  });

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
        API.get("/announcements")
      ]);
      if (cRes.data.success) {
        setCourses(cRes.data.data);
        if (cRes.data.data.length > 0 && !formData.course) {
          setFormData((prev) => ({ ...prev, course: cRes.data.data[0]._id }));
        }
      }
      if (aRes.data.success) setAnnouncements(aRes.data.data);
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
      category: "Academic",
      targetAudience: "Course",
      course: courses[0]?._id || ""
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
        setFormSuccess("Announcement published!");
        setTimeout(() => {
          setIsAddModalOpen(false);
          fetchInitial();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to publish.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Class Announcements</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Post notices, assignment reminders, and lecture updates directly to your students.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus} className="shadow-md">
          Post Notice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="col-span-2 text-center text-slate-400 py-12">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="col-span-2 text-center text-slate-400 py-12">No announcements posted yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="primary">{a.category}</Badge>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {new Date(a.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{a.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{a.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-700">Posted by: {a.authorName || "Faculty"}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Class Notice">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Notice Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Lab 4 Submission Deadline Extension"
          />

          <Select
            label="Target Course"
            required
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))}
          />

          <Textarea
            label="Notice Body"
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Write announcement details..."
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyAnnouncements;
