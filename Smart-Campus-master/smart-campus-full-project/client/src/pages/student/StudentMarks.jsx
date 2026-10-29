
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import { Award, BookOpen, Calculator, CheckCircle2 } from "lucide-react";

const StudentMarks = () => {
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/marks/student");
      if (res.data.success) {
        setMarksData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const marksList = marksData?.marks || [];
  const avgPct = marksData?.avgPercentage || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Grade Card</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Official semester marksheet comprising continuous internal assessments, coursework marks, and end-term examination results.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumulative Average</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-indigo-600">{avgPct}%</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Across graded courses</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courses Evaluated</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900">{marksData?.totalSubjects || 0}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Evaluated modules</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Credits Earned</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-emerald-600">{marksData?.totalCredits || 0}</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">Curriculum credits</span>
        </div>
      </div>

      {/* Marks Table */}
      <Table
        headers={["Subject Title", "Code", "Credits", "Internal (30)", "Assignment (20)", "Exam (50)", "Total / Max", "Percentage", "Grade"]}
        loading={loading}
        colSpan={9}
      >
        {marksList.map((m) => (
          <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900 text-sm">{m.course?.name}</td>
            <td className="px-6 py-4 font-bold text-xs text-indigo-600">{m.course?.code}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700">{m.course?.credits || 3}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-700">{m.internalMarks}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-700">{m.assignmentMarks}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-700">{m.examMarks}</td>
            <td className="px-6 py-4 text-xs font-black text-slate-900">{m.totalMarks} / {m.maxMarks}</td>
            <td className="px-6 py-4 text-xs font-bold text-indigo-600">{m.percentage}%</td>
            <td className="px-6 py-4 font-black text-xs">
              <Badge variant="primary">{m.grade}</Badge>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default StudentMarks;
