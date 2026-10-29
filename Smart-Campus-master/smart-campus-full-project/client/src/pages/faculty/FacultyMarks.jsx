
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import { Award, Save, CheckCircle2 } from "lucide-react";

const FacultyMarks = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({}); // { studentId: { internal: 0, assignment: 0, exam: 0, max: 100 } }
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingStudentId, setSavingStudentId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
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
      fetchStudentsAndExistingMarks();
    }
  }, [selectedCourse]);

  const fetchStudentsAndExistingMarks = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const chosen = courses.find((c) => c._id === selectedCourse);
      if (!chosen) return;

      const [stRes, mRes] = await Promise.all([
        API.get("/students", {
          params: {
            department: chosen.department?._id || chosen.department,
            semester: chosen.semester
          }
        }),
        API.get("/marks/faculty", {
          params: { courseId: selectedCourse }
        })
      ]);

      if (stRes.data.success) {
        const studentList = stRes.data.data;
        setStudents(studentList);

        const initial = {};
        studentList.forEach((s) => {
          initial[s._id] = {
            internalMarks: 25,
            assignmentMarks: 18,
            examMarks: 45,
            maxMarks: 100
          };
        });

        if (mRes.data.success && mRes.data.data.length > 0) {
          mRes.data.data.forEach((m) => {
            const sid = m.student?._id || m.student;
            if (sid) {
              initial[sid] = {
                internalMarks: m.internalMarks,
                assignmentMarks: m.assignmentMarks,
                examMarks: m.examMarks,
                maxMarks: m.maxMarks || 100
              };
            }
          });
        }

        setMarksData(initial);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load student marks.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (studentId, field, val) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: Number(val) || 0
      }
    }));
  };

  const handleSaveStudentMarks = async (studentId) => {
    setError("");
    setSuccess("");
    setSavingStudentId(studentId);

    try {
      const data = marksData[studentId];
      const total = (data.internalMarks || 0) + (data.assignmentMarks || 0) + (data.examMarks || 0);
      if (total > (data.maxMarks || 100)) {
        setError(`Total marks (${total}) exceed maximum marks of ${data.maxMarks || 100}.`);
        setSavingStudentId(null);
        return;
      }

      const res = await API.post("/marks", {
        studentId,
        courseId: selectedCourse,
        internalMarks: data.internalMarks,
        assignmentMarks: data.assignmentMarks,
        examMarks: data.examMarks,
        maxMarks: data.maxMarks
      });

      if (res.data.success) {
        setSuccess(`Marks saved and grade calculated for student!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save marks.");
    } finally {
      setSavingStudentId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Marks & Grading Entry</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Enter internal, assignment, and terminal exam marks. Automated percentage and grade calculation synced to students.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Select Course */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs max-w-md">
        <Select
          label="Select Course Module"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          options={courses.map((c) => ({
            value: c._id,
            label: `${c.name} (${c.code} - Sem ${c.semester})`
          }))}
        />
      </div>

      {/* Marks Table */}
      <Table
        headers={["Roll / Reg No", "Student Name", "Internal (Max 30)", "Assignment (Max 20)", "Exam (Max 50)", "Total / Max", "Grade", "Action"]}
        loading={loading}
        colSpan={8}
      >
        {students.map((st) => {
          const m = marksData[st._id] || { internalMarks: 0, assignmentMarks: 0, examMarks: 0, maxMarks: 100 };
          const total = (m.internalMarks || 0) + (m.assignmentMarks || 0) + (m.examMarks || 0);
          const pct = Math.round((total / (m.maxMarks || 100)) * 100);

          let grade = "F";
          if (pct >= 90) grade = "A+";
          else if (pct >= 80) grade = "A";
          else if (pct >= 70) grade = "B+";
          else if (pct >= 60) grade = "B";
          else if (pct >= 50) grade = "C";
          else if (pct >= 40) grade = "P";

          return (
            <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-6 py-4 font-bold text-xs text-indigo-600">{st.registerNumber}</td>
              <td className="px-6 py-4 font-bold text-slate-900 text-sm">{st.name}</td>
              <td className="px-6 py-4">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={m.internalMarks}
                  onChange={(e) => handleFieldChange(st._id, "internalMarks", e.target.value)}
                  className="w-20 text-xs px-2 py-1 border border-slate-200 rounded-lg text-center font-bold focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={m.assignmentMarks}
                  onChange={(e) => handleFieldChange(st._id, "assignmentMarks", e.target.value)}
                  className="w-20 text-xs px-2 py-1 border border-slate-200 rounded-lg text-center font-bold focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={m.examMarks}
                  onChange={(e) => handleFieldChange(st._id, "examMarks", e.target.value)}
                  className="w-20 text-xs px-2 py-1 border border-slate-200 rounded-lg text-center font-bold focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-4 text-xs font-extrabold text-slate-900">
                {total} / {m.maxMarks} <span className="text-slate-400 text-[10px]">({pct}%)</span>
              </td>
              <td className="px-6 py-4 font-bold text-xs">
                <Badge variant={grade === "F" ? "danger" : "primary"}>{grade}</Badge>
              </td>
              <td className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => handleSaveStudentMarks(st._id)}
                  disabled={savingStudentId === st._id}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingStudentId === st._id ? "Saving..." : "Save Marks"}
                </button>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
};

export default FacultyMarks;
