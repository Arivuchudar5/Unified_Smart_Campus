
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import { Download, Filter, BarChart3 } from "lucide-react";

const AdminReports = () => {
  const [reportType, setReportType] = useState("students");
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchDepts();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [reportType, deptFilter, semFilter, statusFilter]);

  const fetchDepts = async () => {
    try {
      const res = await API.get("/departments");
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = {
        type: reportType
      };
      if (deptFilter) params.department = deptFilter;
      if (semFilter) params.semester = semFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get("/reports/data", { params });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return alert("No data to export.");
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `campus_report_${reportType}_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Reports & Analytics</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Generate and export filtered reports for accreditation, academic audits, and administrative reporting.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="secondary" icon={Download} className="shadow-xs">
          Export JSON / Dataset
        </Button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: "students", label: "Student Report" },
          { id: "faculty", label: "Faculty Report" },
          { id: "attendance", label: "Attendance Report" },
          { id: "marks", label: "Marks Report" },
          { id: "assignments", label: "Assignment Report" },
          { id: "leaves", label: "Leave Report" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              reportType === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>

        <select
          value={semFilter}
          onChange={(e) => setSemFilter(e.target.value)}
          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Report Tables */}
      {reportType === "students" && (
        <Table headers={["Name", "Register Number", "Email", "Department", "Semester", "Status"]} loading={loading} colSpan={6}>
          {data.map((st) => (
            <tr key={st._id} className="hover:bg-slate-50/80">
              <td className="px-6 py-4 font-bold text-slate-900">{st.name}</td>
              <td className="px-6 py-4 font-semibold text-xs text-slate-600">{st.registerNumber}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{st.email}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-700">{st.department?.code || "—"}</td>
              <td className="px-6 py-4 text-xs text-slate-600">Sem {st.semester}</td>
              <td className="px-6 py-4"><Badge>{st.status}</Badge></td>
            </tr>
          ))}
        </Table>
      )}

      {reportType === "faculty" && (
        <Table headers={["Name", "Faculty ID", "Email", "Department", "Designation", "Status"]} loading={loading} colSpan={6}>
          {data.map((f) => (
            <tr key={f._id} className="hover:bg-slate-50/80">
              <td className="px-6 py-4 font-bold text-slate-900">{f.name}</td>
              <td className="px-6 py-4 font-semibold text-xs text-slate-600">{f.facultyId}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{f.email}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-700">{f.department?.code || "—"}</td>
              <td className="px-6 py-4 text-xs text-slate-600">{f.designation}</td>
              <td className="px-6 py-4"><Badge>{f.status}</Badge></td>
            </tr>
          ))}
        </Table>
      )}

      {reportType === "attendance" && (
        <Table headers={["Date", "Student", "Subject", "Semester", "Status", "Faculty"]} loading={loading} colSpan={6}>
          {data.map((att) => (
            <tr key={att._id} className="hover:bg-slate-50/80">
              <td className="px-6 py-4 font-bold text-xs text-slate-900">{att.date}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-800">{att.student?.name}</td>
              <td className="px-6 py-4 text-xs text-slate-700">{att.course?.name}</td>
              <td className="px-6 py-4 text-xs text-slate-600">Sem {att.semester}</td>
              <td className="px-6 py-4"><Badge>{att.status}</Badge></td>
              <td className="px-6 py-4 text-xs text-slate-500">{att.faculty?.name}</td>
            </tr>
          ))}
        </Table>
      )}

      {reportType === "marks" && (
        <Table headers={["Student", "Course", "Internals", "Assignment", "Exam", "Total", "Percentage", "Grade"]} loading={loading} colSpan={8}>
          {data.map((m) => (
            <tr key={m._id} className="hover:bg-slate-50/80">
              <td className="px-6 py-4 font-bold text-slate-900 text-xs">{m.student?.name}</td>
              <td className="px-6 py-4 text-xs text-slate-700">{m.course?.name}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-700">{m.internalMarks}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-700">{m.assignmentMarks}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-700">{m.examMarks}</td>
              <td className="px-6 py-4 text-xs font-bold text-slate-900">{m.totalMarks} / {m.maxMarks}</td>
              <td className="px-6 py-4 text-xs font-bold text-indigo-600">{m.percentage}%</td>
              <td className="px-6 py-4 font-bold text-xs"><Badge variant="primary">{m.grade}</Badge></td>
            </tr>
          ))}
        </Table>
      )}

      {reportType === "assignments" && (
        <Table headers={["Assignment Title", "Course", "Faculty", "Due Date", "Max Marks"]} loading={loading} colSpan={5}>
          {data.map((a) => (
            <tr key={a._id} className="hover:bg-slate-50/80">
              <td className="px-6 py-4 font-bold text-slate-900 text-xs">{a.title}</td>
              <td className="px-6 py-4 text-xs text-slate-700">{a.course?.name}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{a.faculty?.name}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-700">{new Date(a.dueDate).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-xs font-bold text-slate-800">{a.maxMarks} Marks</td>
            </tr>
          ))}
        </Table>
      )}

      {reportType === "leaves" && (
        <Table headers={["Student", "Department", "Type", "From Date", "To Date", "Status", "Reviewer"]} loading={loading} colSpan={7}>
          {data.map((l) => (
            <tr key={l._id} className="hover:bg-slate-50/80">
              <td className="px-6 py-4 font-bold text-slate-900 text-xs">{l.student?.name}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-700">{l.department?.code}</td>
              <td className="px-6 py-4 text-xs text-indigo-600 font-semibold">{l.leaveType}</td>
              <td className="px-6 py-4 text-xs text-slate-600">{l.fromDate}</td>
              <td className="px-6 py-4 text-xs text-slate-600">{l.toDate}</td>
              <td className="px-6 py-4"><Badge>{l.status}</Badge></td>
              <td className="px-6 py-4 text-xs text-slate-500">{l.reviewedBy?.name || "Pending"}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default AdminReports;
