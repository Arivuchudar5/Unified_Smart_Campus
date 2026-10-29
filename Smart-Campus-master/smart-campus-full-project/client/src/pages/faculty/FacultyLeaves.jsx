
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import Badge from "../../components/common/Badge";
import { CheckCircle2, XCircle, User, ExternalLink } from "lucide-react";

const FacultyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState("approve");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leaves/faculty");
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setRemarks(action === "approve" ? "Approved by Course Instructor." : "Rejected by Instructor.");
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setSubmitting(true);

    try {
      const endpoint = reviewAction === "approve" ? `/leaves/${selectedLeave._id}/approve` : `/leaves/${selectedLeave._id}/reject`;
      const res = await API.put(endpoint, { remarks });
      if (res.data.success) {
        setIsReviewModalOpen(false);
        fetchLeaves();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update leave status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Leave Approvals</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Review leave applications submitted by students in your academic department.
        </p>
      </div>

      <Table
        headers={["Student", "Register No", "Duration", "Leave Reason", "Status", "Reviewed By", "Action"]}
        loading={loading}
        colSpan={7}
      >
        {leaves.map((l) => (
          <tr key={l._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900 text-xs flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>{l.student?.name}</span>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-600">{l.student?.registerNumber}</td>
            <td className="px-6 py-4 text-xs text-slate-700">
              <span className="font-bold">{l.fromDate}</span> to <span className="font-bold">{l.toDate}</span>
            </td>
            <td className="px-6 py-4 max-w-xs">
              <span className="text-[10px] font-bold uppercase text-indigo-600">{l.leaveType}</span>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{l.reason}</p>
            </td>
            <td className="px-6 py-4">
              <Badge>{l.status}</Badge>
            </td>
            <td className="px-6 py-4 text-xs text-slate-500">
              {l.reviewerName || l.reviewedBy?.name || "Pending Review"}
              {l.reviewRemarks && <p className="text-[10px] text-slate-400 italic">"{l.reviewRemarks}"</p>}
            </td>
            <td className="px-6 py-4">
              {l.status === "Pending" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReview(l, "approve")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleOpenReview(l, "reject")}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold shadow-xs flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-semibold italic">Reviewed</span>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`${reviewAction === "approve" ? "Approve" : "Reject"} Student Leave`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <p className="font-bold text-slate-800">Student: {selectedLeave?.student?.name}</p>
            <p className="text-slate-600">Duration: {selectedLeave?.fromDate} to {selectedLeave?.toDate}</p>
            <p className="text-slate-600">Reason: {selectedLeave?.reason}</p>
          </div>

          <Textarea
            label="Instructor Remarks / Feedback"
            required
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={reviewAction === "approve" ? "success" : "danger"}
              loading={submitting}
            >
              Confirm {reviewAction === "approve" ? "Approval" : "Rejection"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyLeaves;
