
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import {
  Clock,
  FileText,
  Award,
  FileCheck2,
  Calendar,
  Megaphone,
  Bell,
  Sparkles,
  MapPin,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports/dashboard/student");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold text-xs">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  const student = data?.student;
  const attendanceRate = data?.attendancePercentage || 0;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Student Academic Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {student?.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Register No: <span className="font-bold text-white">{student?.registerNumber}</span> &bull; {student?.department?.name} (Year {student?.year}, Sem {student?.semester})
          </p>
        </div>
      </div>

      {/* Attendance Warning if below 75% */}
      {attendanceRate < 75 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Low Attendance Alert ({attendanceRate}%)</p>
            <p className="text-amber-700 font-normal">Your overall attendance is below 75%. Please attend upcoming classes to meet examination eligibility criteria.</p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Attendance"
          value={`${attendanceRate}%`}
          icon={Clock}
          color={attendanceRate >= 75 ? "emerald" : "amber"}
          subtitle="Class attendance rate"
        />
        <StatCard
          title="Pending Assignments"
          value={data?.pendingAssignments || 0}
          icon={FileText}
          color="indigo"
          subtitle="Awaiting solution submission"
        />
        <StatCard
          title="Graded Courses"
          value={data?.latestMarks?.length || 0}
          icon={Award}
          color="purple"
          subtitle="Evaluated marksheets"
        />
        <StatCard
          title="Leave Requests"
          value={data?.recentLeaves?.length || 0}
          icon={FileCheck2}
          color="blue"
          subtitle="Submitted applications"
        />
      </div>

      {/* Grid of Sections: Today's Classes & Latest Marks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Timetable */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Today's Lectures ({data?.todayDay})
              </h3>
              <Link to="/student/timetable" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                Weekly View &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {data?.todayClasses?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No lectures scheduled for today.</p>
              ) : (
                data?.todayClasses?.map((cls) => (
                  <div key={cls._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{cls.subject}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {cls.startTime} - {cls.endTime}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {cls.room}</span>
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{cls.faculty?.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Latest Marks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Latest Published Marks
              </h3>
              <Link to="/student/marks" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                All Marks &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {data?.latestMarks?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No marks published yet.</p>
              ) : (
                data?.latestMarks?.map((m) => (
                  <div key={m._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{m.course?.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Internal: {m.internalMarks} &bull; Assignment: {m.assignmentMarks} &bull; Exam: {m.examMarks}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{m.totalMarks} / {m.maxMarks}</p>
                      <Badge variant="primary">Grade {m.grade}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Announcements & Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              Campus Announcements
            </h3>
            <Link to="/student/announcements" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentAnnouncements?.map((a) => (
              <div key={a._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="info">{a.category}</Badge>
                  <span className="text-[10px] text-slate-400">{new Date(a.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              Recent Leave Applications
            </h3>
            <Link to="/student/leave" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Apply Leave &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentLeaves?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No leave applications submitted.</p>
            ) : (
              data?.recentLeaves?.map((l) => (
                <div key={l._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{l.leaveType}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{l.fromDate} to {l.toDate}</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">"{l.reason}"</p>
                  </div>
                  <Badge>{l.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
