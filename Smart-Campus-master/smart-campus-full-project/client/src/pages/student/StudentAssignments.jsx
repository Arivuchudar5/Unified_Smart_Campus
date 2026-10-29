
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Alert from "../../components/common/Alert";
import { Download, Upload, FileText, CheckCircle2, Clock } from "lucide-react";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAssign, setSelectedAssign] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [solutionFile, setSolutionFile] = useState(null);
  const [comments, setComments] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/assignments/student");
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (assign) => {
    setSelectedAssign(assign);
    setSolutionFile(null);
    setComments("");
    setFormError("");
    setFormSuccess("");
    setIsSubmitModalOpen(true);
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!solutionFile) {
      return setFormError("Please select your solution document file.");
    }
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("assignmentId", selectedAssign._id);
      data.append("comments", comments);
      data.append("file", solutionFile);

      const res = await API.post("/submissions", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setFormSuccess("Solution submitted successfully to MongoDB!");
        setTimeout(() => {
          setIsSubmitModalOpen(false);
          fetchAssignments();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Coursework & Assignments</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          View assigned problem sets, download question specs, submit solutions, and view instructor evaluation feedback.
        </p>
      </div>

      <Table
        headers={["Assignment Title", "Subject", "Instructor", "Due Date", "Max Marks", "Submission Status", "Grade / Feedback", "Action"]}
        loading={loading}
        colSpan={8}
      >
        {assignments.map((a) => (
          <tr key={a._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4">
              <p className="font-bold text-slate-900 text-sm">{a.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{a.description}</p>
              {a.attachmentUrl && (
                <a
                  href={a.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline mt-1"
                >
                  <Download className="w-3 h-3" /> Question Spec ({a.attachmentName || "Attachment"})
                </a>
              )}
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700">{a.course?.name}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{a.faculty?.name}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-800">
              {new Date(a.dueDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-xs font-bold text-slate-900">{a.maxMarks} pts</td>
            <td className="px-6 py-4">
              <Badge>{a.submissionStatus}</Badge>
            </td>
            <td className="px-6 py-4 text-xs">
              {a.submission?.status === "Evaluated" ? (
                <div>
                  <span className="font-black text-emerald-700">{a.submission.marksObtained} / {a.maxMarks}</span>
                  {a.submission.feedback && (
                    <p className="text-[10px] text-slate-500 italic mt-0.5">"{a.submission.feedback}"</p>
                  )}
                </div>
              ) : (
                <span className="text-slate-400 italic">—</span>
              )}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => handleOpenSubmit(a)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                {a.submissionStatus === "Not Submitted" ? "Submit" : "Re-submit"}
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {/* Submit Modal */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Upload Assignment Solution">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleSubmitSolution} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <p className="font-bold text-slate-800">Task: {selectedAssign?.title}</p>
            <p className="text-slate-600">Course: {selectedAssign?.course?.name}</p>
            <p className="text-slate-600">Due Date: <span className="font-bold">{selectedAssign ? new Date(selectedAssign.dueDate).toLocaleDateString() : ""}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Solution File (PDF, ZIP, DOCX, TXT) *
            </label>
            <input
              type="file"
              required
              onChange={(e) => setSolutionFile(e.target.files[0])}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <Textarea
            label="Student Comments / Notes (Optional)"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Notes regarding approach, assumptions, or tools used..."
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Upload & Submit Solution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentAssignments;
