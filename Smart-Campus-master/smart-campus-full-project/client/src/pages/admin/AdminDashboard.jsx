
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import StatCard from "../../components/common/StatCard";
import { BarChartCard, DonutChartCard } from "../../components/common/ChartCards";
import Badge from "../../components/common/Badge";
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  FileCheck2,
  Megaphone,
  ArrowRight,
  Sparkles
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports/dashboard/admin");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold text-xs">Loading Campus Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-indigo-500/10 transform skew-x-12 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Campus Administration Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Operations Overview
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Real-time synchronization across academic departments, student rosters, faculty allocation, attendance tracking, and administrative leaves.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          color="indigo"
          subtitle="Enrolled undergraduates"
        />
        <StatCard
          title="Faculty Members"
          value={stats?.totalFaculty || 0}
          icon={GraduationCap}
          color="blue"
          subtitle="Professors & Lecturers"
        />
        <StatCard
          title="Departments"
          value={stats?.totalDepartments || 0}
          icon={Building2}
          color="purple"
          subtitle="Active academic wings"
        />
        <StatCard
          title="Active Courses"
          value={stats?.totalCourses || 0}
          icon={BookOpen}
          color="emerald"
          subtitle="Curriculum subjects"
        />
      </div>

      {/* Charts & Leave stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChartCard
            title="Student Distribution by Department"
            data={stats?.charts?.studentsByDepartment || []}
          />
        </div>

        <DonutChartCard
          title="Campus Attendance Rate"
          present={stats?.charts?.attendance?.totalPresent || 0}
          absent={stats?.charts?.attendance?.totalAbsent || 0}
          rate={stats?.charts?.attendance?.rate || 0}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leaves */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                Pending Leave Requests ({stats?.pendingLeaves || 0})
              </h3>
              <Link
                to="/admin/leaves"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Review all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Student leave applications requiring administrative approval or status update.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
            <div className="bg-amber-50 p-3 rounded-2xl">
              <span className="text-xs font-semibold text-amber-800">Pending</span>
              <p className="text-xl font-extrabold text-amber-600 mt-1">{stats?.charts?.leaves?.pending || 0}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <span className="text-xs font-semibold text-emerald-800">Approved</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">{stats?.charts?.leaves?.approved || 0}</p>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl">
              <span className="text-xs font-semibold text-rose-800">Rejected</span>
              <p className="text-xl font-extrabold text-rose-600 mt-1">{stats?.charts?.leaves?.rejected || 0}</p>
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              Recent Announcements
            </h3>
            <Link
              to="/admin/announcements"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentAnnouncements?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No announcements published yet.</p>
            ) : (
              stats?.recentAnnouncements?.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                    <Badge variant="primary">{item.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                    Posted on {new Date(item.date).toLocaleDateString()} &bull; Audience: {item.targetAudience}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
