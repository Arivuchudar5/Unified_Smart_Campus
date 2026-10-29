
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
import { Plus, FileCheck2, Calendar, ExternalLink, Send } from "lucide-react";

const StudentLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "Personal Leave",
    fromDate: "",
    toDate: "",
    reason: ""
  });
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leaves/student");
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      leaveType: "Personal Leave",
      fromDate: today,
      toDate: today,
      reason: ""
    });
    setAttachmentFile(null);
    setFormError("");
    setFormSuccess("");
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("leaveType", formData.leaveType);
      data.append("fromDate", formData.fromDate);
      data.append("toDate", formData.toDate);
      data.append("reason", formData.reason);
      if (attachmentFile) {
        data.append("attachment", attachmentFile);
      }

      const res = await API.post("/leaves", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setFormSuccess("Leave request submitted successfully. Status is Pending review.");
        setTimeout(() => {
          setIsApplyModalOpen(false);
          fetchLeaves();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit leave.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Submit leave requests to faculty and track official administrative approval statuses.
          </p>
        </div>
        <Button onClick={handleOpenApply} variant="primary" icon={Plus} className="shadow-md">
          Apply for Leave
        </Button>
      </div>

      {/* Table */}
      <Table
        headers={["Leave Type", "Duration (From - To)", "Reason", "Attachment", "Status", "Reviewer / Notes"]}
        loading={loading}
        colSpan={6}
      >
        {leaves.map((l) => (
          <tr key={l._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-bold text-xs text-indigo-700">{l.leaveType}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-800">
              {l.fromDate} to {l.toDate}
            </td>
            <td className="px-6 py-4 text-xs text-slate-600 max-w-sm">{l.reason}</td>
            <td className="px-6 py-4 text-xs">
              {l.attachmentUrl ? (
                <a
                  href={l.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> View Doc
                </a>
              ) : (
                <span className="text-slate-400 italic">None</span>
              )}
            </td>
            <td className="px-6 py-4">
              <Badge>{l.status}</Badge>
            </td>
            <td className="px-6 py-4 text-xs text-slate-600">
              <span className="font-semibold">{l.reviewerName || l.reviewedBy?.name || "Pending Review"}</span>
              {l.reviewRemarks && <p className="text-[10px] text-slate-400 italic mt-0.5">"{l.reviewRemarks}"</p>}
            </td>
          </tr>
        ))}
      </Table>

      {/* Apply Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Submit Leave Request">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleApplySubmit} className="space-y-4">
          <Select
            label="Leave Type"
            required
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            options={[
              { value: "Medical Leave", label: "Medical Leave (Illness / Health)" },
              { value: "Personal Leave", label: "Personal Leave (Family / Personal Event)" },
              { value: "Academic Leave", label: "Academic Leave (Hackathon / Conference / Internship)" },
              { value: "Other Leave", label: "Other Leave" },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="From Date"
              type="date"
              required
              value={formData.fromDate}
              onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
            />
            <Input
              label="To Date"
              type="date"
              required
              value={formData.toDate}
              onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
            />
          </div>

          <Textarea
            label="Reason for Leave"
            rows={4}
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="State clear reasons for your leave application..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Supporting Attachment (e.g. Medical Certificate, Event Invite)
            </label>
            <input
              type="file"
              onChange={(e) => setAttachmentFile(e.target.files[0])}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentLeave;
