
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Alert from "../../components/common/Alert";
import { CheckCircle2, Download, ExternalLink, Award, FileText, User } from "lucide-react";

const FacultySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSub, setSelectedSub] = useState(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [marksObtained, setMarksObtained] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/submissions/all");
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGrade = (sub) => {
    setSelectedSub(sub);
    setMarksObtained(sub.marksObtained !== null && sub.marksObtained !== undefined ? sub.marksObtained : 85);
    setFeedback(sub.feedback || "Good effort. Well structured solution.");
    setFormError("");
    setIsGradeModalOpen(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setFormError("");
    setSubmitting(true);

    try {
      const maxMarks = selectedSub.assignment?.maxMarks || 100;
      if (Number(marksObtained) > maxMarks) {
        setFormError(`Marks cannot exceed maximum of ${maxMarks}.`);
        setSubmitting(false);
        return;
      }

      const res = await API.put(`/submissions/${selectedSub._id}/evaluate`, {
        marksObtained: Number(marksObtained),
        feedback
      });

      if (res.data.success) {
        setIsGradeModalOpen(false);
        fetchSubmissions();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to evaluate submission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Assignment Submissions</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Review uploaded student code/documents, enter evaluated marks, provide feedback, and notify students in real time.
        </p>
      </div>

      {/* Table */}
      <Table
        headers={["Student", "Register No", "Assignment Title", "Submission Date", "Solution File", "Marks", "Status", "Actions"]}
        loading={loading}
        colSpan={8}
      >
        {submissions.map((sub) => (
          <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900 text-xs flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>{sub.student?.name || "Student"}</span>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-600">{sub.student?.registerNumber || "—"}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-800 max-w-xs truncate">
              {sub.assignment?.title || "Assignment"}
            </td>
            <td className="px-6 py-4 text-xs text-slate-600">
              {new Date(sub.submissionDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-xs">
              <a
                href={sub.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> {sub.fileName || "View Submission"}
              </a>
            </td>
            <td className="px-6 py-4 text-xs font-bold text-slate-900">
              {sub.marksObtained !== null && sub.marksObtained !== undefined ? (
                <span className="text-emerald-700 font-black">{sub.marksObtained} / {sub.assignment?.maxMarks || 100}</span>
              ) : (
                <span className="text-slate-400 italic">Not Graded</span>
              )}
            </td>
            <td className="px-6 py-4">
              <Badge>{sub.status}</Badge>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => handleOpenGrade(sub)}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" /> Grade
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {/* Grade Modal */}
      <Modal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} title="Evaluate Student Submission">
        {formError && <Alert type="error" message={formError} className="mb-4" />}

        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <p className="font-bold text-slate-800">Student: {selectedSub?.student?.name} ({selectedSub?.student?.registerNumber})</p>
            <p className="text-slate-600">Assignment: {selectedSub?.assignment?.title}</p>
            <p className="text-slate-600">Maximum Marks: <span className="font-bold">{selectedSub?.assignment?.maxMarks || 100} pts</span></p>
            {selectedSub?.comments && <p className="text-slate-600 italic">Student Comments: "{selectedSub.comments}"</p>}
          </div>

          <Input
            label={`Marks Obtained (Max ${selectedSub?.assignment?.maxMarks || 100})`}
            type="number"
            required
            value={marksObtained}
            onChange={(e) => setMarksObtained(e.target.value)}
          />

          <Textarea
            label="Evaluation Feedback / Instructor Comments"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback on logic, correctness, formatting..."
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsGradeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Evaluation & Notify Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultySubmissions;
