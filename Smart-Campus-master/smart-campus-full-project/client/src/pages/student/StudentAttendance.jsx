
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Alert from "../../components/common/Alert";
import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance/student");
      if (res.data.success) {
        setAttendanceData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const overall = attendanceData?.overallPercentage || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Attendance Record</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Real-time subject-wise and cumulative attendance percentages computed directly from faculty lecture logs.
        </p>
      </div>

      {overall < 75 && (
        <Alert
          type="warning"
          message={`Low Attendance Warning: Your current overall attendance is ${overall}%. The university minimum requirement for semester exam eligibility is 75%.`}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Rate</span>
          <div className="my-2">
            <span className={`text-3xl font-extrabold ${overall >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
              {overall}%
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Calculated: (Present / Total) × 100</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Lectures</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900">{attendanceData?.totalClasses || 0}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Total conducted classes</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Classes</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-emerald-600">{attendanceData?.totalPresent || 0}</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">Attended lectures</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent Classes</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-rose-600">{attendanceData?.totalAbsent || 0}</span>
          </div>
          <span className="text-[11px] font-semibold text-rose-600">Missed lectures</span>
        </div>
      </div>

      {/* Subject-wise Breakdown Table */}
      <h3 className="text-base font-bold text-slate-900 pt-2">Subject-wise Attendance Breakdown</h3>
      <Table
        headers={["Subject / Course Name", "Code", "Total Conducted", "Present", "Absent", "Attendance %", "Standing"]}
        loading={loading}
        colSpan={7}
      >
        {attendanceData?.subjectWise?.map((sub) => (
          <tr key={sub.courseId} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900 text-sm">{sub.courseName}</td>
            <td className="px-6 py-4 font-bold text-xs text-indigo-600">{sub.courseCode}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-800">{sub.total} Classes</td>
            <td className="px-6 py-4 text-xs font-bold text-emerald-600">{sub.present}</td>
            <td className="px-6 py-4 text-xs font-bold text-rose-600">{sub.absent}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-900 w-10">{sub.percentage}%</span>
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sub.percentage >= 75 ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${sub.percentage}%` }}
                  ></div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <Badge variant={sub.percentage >= 75 ? "success" : "danger"}>
                {sub.percentage >= 75 ? "Good" : "Shortage"}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default StudentAttendance;
