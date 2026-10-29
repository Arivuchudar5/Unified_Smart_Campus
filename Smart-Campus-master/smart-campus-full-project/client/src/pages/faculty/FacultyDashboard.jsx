
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import {
  BookOpen,
  Users,
  FileText,
  FileCheck2,
  Clock,
  Award,
  Upload,
  BookMarked,
  Megaphone,
  Calendar,
  Sparkles,
  MapPin
} from "lucide-react";

const FacultyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports/dashboard/faculty");
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
          <p className="text-slate-500 font-semibold text-xs">Loading Faculty Portal...</p>
        </div>
      </div>
    );
  }

  const faculty = data?.faculty;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Academic Faculty Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {faculty?.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            {faculty?.designation} &bull; Department of {faculty?.department?.name || "Engineering"} ({faculty?.facultyId})
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Subjects"
          value={data?.assignedSubjects || 0}
          icon={BookOpen}
          color="indigo"
          subtitle="Course modules taught"
        />
        <StatCard
          title="Students in Dept"
          value={data?.studentCount || 0}
          icon={Users}
          color="blue"
          subtitle="Undergraduate roster"
        />
        <StatCard
          title="Active Assignments"
          value={data?.pendingAssignments || 0}
          icon={FileText}
          color="purple"
          subtitle="Posted coursework"
        />
        <StatCard
          title="Leave Applications"
          value={data?.pendingLeaves || 0}
          icon={FileCheck2}
          color="amber"
          subtitle="Pending department review"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Quick Faculty Academic Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => navigate("/faculty/attendance")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
          >
            <Clock className="w-6 h-6 text-indigo-600" />
            <span>Mark Attendance</span>
          </button>

          <button
            onClick={() => navigate("/faculty/assignments")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100 text-blue-700 font-bold text-xs transition-colors"
          >
            <FileText className="w-6 h-6 text-blue-600" />
            <span>New Assignment</span>
          </button>

          <button
            onClick={() => navigate("/faculty/submissions")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-purple-50/60 hover:bg-purple-100/70 border border-purple-100 text-purple-700 font-bold text-xs transition-colors"
          >
            <Upload className="w-6 h-6 text-purple-600" />
            <span>Grade Submissions</span>
          </button>

          <button
            onClick={() => navigate("/faculty/marks")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
          >
            <Award className="w-6 h-6 text-emerald-600" />
            <span>Enter Marks</span>
          </button>

          <button
            onClick={() => navigate("/faculty/leaves")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-100 text-amber-700 font-bold text-xs transition-colors"
          >
            <FileCheck2 className="w-6 h-6 text-amber-600" />
            <span>Manage Leave</span>
          </button>

          <button
            onClick={() => navigate("/faculty/notes")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-100 text-rose-700 font-bold text-xs transition-colors"
          >
            <BookMarked className="w-6 h-6 text-rose-600" />
            <span>Upload Notes</span>
          </button>
        </div>
      </div>

      {/* Today's Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Today's Teaching Schedule ({data?.todayDay})
            </h3>
            <Link to="/faculty/timetable" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Full Timetable &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {data?.todayClasses?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No classes scheduled for today.</p>
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
                  <Badge variant="primary">Sem {cls.semester}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Faculty Announcements
            </h3>
            <Link to="/faculty/announcements" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Manage &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentAnnouncements?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No announcements for faculty.</p>
            ) : (
              data?.recentAnnouncements?.map((item) => (
                <div key={item._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                    <Badge variant="info">{item.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
