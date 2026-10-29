
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import { Check, X, Clock, CheckCircle2, AlertCircle, Save } from "lucide-react";

const FacultyAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: "Present" | "Absent" }
  const [remarks, setRemarks] = useState({}); // { studentId: "..." }
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const fetchAssignedCourses = async () => {
    try {
      const res = await API.get("/courses");
      if (res.data.success) {
        setCourses(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedCourse(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchRosterAndExistingAttendance();
    }
  }, [selectedCourse, selectedDate]);

  const fetchRosterAndExistingAttendance = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const chosenCourse = courses.find((c) => c._id === selectedCourse);
      if (!chosenCourse) return;

      // 1. Fetch enrolled students in department & semester
      const stRes = await API.get("/students", {
        params: {
          department: chosenCourse.department?._id || chosenCourse.department,
          semester: chosenCourse.semester
        }
      });

      // 2. Fetch any already marked attendance for this course & date
      const attRes = await API.get("/attendance/faculty", {
        params: {
          courseId: selectedCourse,
          date: selectedDate
        }
      });

      if (stRes.data.success) {
        const studentList = stRes.data.data;
        setStudents(studentList);

        const initialStatus = {};
        const initialRemarks = {};

        // Default all to Present
        studentList.forEach((s) => {
          initialStatus[s._id] = "Present";
          initialRemarks[s._id] = "";
        });

        // Overlay with existing records in MongoDB if already taken
        if (attRes.data.success && attRes.data.data.length > 0) {
          attRes.data.data.forEach((rec) => {
            const sid = rec.student?._id || rec.student;
            if (sid) {
              initialStatus[sid] = rec.status;
              initialRemarks[sid] = rec.remarks || "";
            }
          });
        }

        setAttendanceRecords(initialStatus);
        setRemarks(initialRemarks);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load class roster.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (studentId) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "Present" ? "Absent" : "Present"
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse || !selectedDate || students.length === 0) return;
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: attendanceRecords[s._id] || "Present",
        remarks: remarks[s._id] || ""
      }));

      const res = await API.post("/attendance", {
        courseId: selectedCourse,
        date: selectedDate,
        records
      });

      if (res.data.success) {
        setSuccess(`Attendance successfully recorded in MongoDB for ${records.length} students.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceRecords).filter((s) => s === "Present").length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mark Class Attendance</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Select subject course and date to load student roster. Syncs directly to student attendance dashboards.
          </p>
        </div>

        <Button
          onClick={handleSaveAttendance}
          variant="primary"
          icon={Save}
          loading={saving}
          disabled={loading || students.length === 0}
          className="shadow-md"
        >
          Save Attendance to MongoDB
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Select Course / Subject"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          options={courses.map((c) => ({
            value: c._id,
            label: `${c.name} (${c.code} - Sem ${c.semester})`
          }))}
        />

        <Input
          label="Attendance Date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <div className="sm:col-span-2 flex flex-col justify-end">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Quick Bulk Actions
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll("Present")}
              className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll("Absent")}
              className="flex-1 py-2 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" /> Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex items-center gap-4 text-xs font-bold">
        <span className="text-slate-500">Class Summary:</span>
        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800">Total: {students.length} Students</span>
        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800">Present: {presentCount}</span>
        <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800">Absent: {absentCount}</span>
      </div>

      {/* Student Roster Table */}
      <Table
        headers={["Roll / Reg No", "Student Name", "Status", "Quick Toggle", "Remarks"]}
        loading={loading}
        colSpan={5}
      >
        {students.map((st) => {
          const isPresent = attendanceRecords[st._id] === "Present";
          return (
            <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-6 py-4 font-bold text-xs text-indigo-600">{st.registerNumber}</td>
              <td className="px-6 py-4 font-bold text-slate-900 text-sm">{st.name}</td>
              <td className="px-6 py-4">
                <Badge variant={isPresent ? "success" : "danger"}>
                  {isPresent ? "Present" : "Absent"}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(st._id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                    isPresent
                      ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                      : "bg-rose-600 text-white border-rose-700 hover:bg-rose-700"
                  }`}
                >
                  {isPresent ? "Mark Absent" : "Mark Present"}
                </button>
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  placeholder="Optional remark..."
                  value={remarks[st._id] || ""}
                  onChange={(e) => setRemarks({ ...remarks, [st._id]: e.target.value })}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
};

export default FacultyAttendance;
