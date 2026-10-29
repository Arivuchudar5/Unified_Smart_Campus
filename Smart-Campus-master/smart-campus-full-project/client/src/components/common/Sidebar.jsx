
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarDays,
  FileCheck2,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
  FileText,
  Upload,
  BookMarked,
  Award,
  Bell,
  Clock
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminNav = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", path: "/admin/students", icon: Users },
    { label: "Faculty", path: "/admin/faculty", icon: GraduationCap },
    { label: "Departments", path: "/admin/departments", icon: Building2 },
    { label: "Courses", path: "/admin/courses", icon: BookOpen },
    { label: "Timetable", path: "/admin/timetable", icon: CalendarDays },
    { label: "Leave Management", path: "/admin/leaves", icon: FileCheck2 },
    { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { label: "Reports", path: "/admin/reports", icon: BarChart3 },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const facultyNav = [
    { label: "Dashboard", path: "/faculty/dashboard", icon: LayoutDashboard },
    { label: "Profile", path: "/faculty/profile", icon: UserCheck },
    { label: "Attendance", path: "/faculty/attendance", icon: Clock },
    { label: "Assignments", path: "/faculty/assignments", icon: FileText },
    { label: "Submissions", path: "/faculty/submissions", icon: Upload },
    { label: "Marks Entry", path: "/faculty/marks", icon: Award },
    { label: "Timetable", path: "/faculty/timetable", icon: CalendarDays },
    { label: "Leave Management", path: "/faculty/leaves", icon: FileCheck2 },
    { label: "Study Notes", path: "/faculty/notes", icon: BookMarked },
    { label: "Announcements", path: "/faculty/announcements", icon: Megaphone },
    { label: "Settings", path: "/faculty/settings", icon: Settings },
  ];

  const studentNav = [
    { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Profile", path: "/student/profile", icon: UserCheck },
    { label: "Attendance", path: "/student/attendance", icon: Clock },
    { label: "Assignments", path: "/student/assignments", icon: FileText },
    { label: "Timetable", path: "/student/timetable", icon: CalendarDays },
    { label: "My Marks", path: "/student/marks", icon: Award },
    { label: "Apply Leave", path: "/student/leave", icon: FileCheck2 },
    { label: "Lecture Notes", path: "/student/notes", icon: BookMarked },
    { label: "Announcements", path: "/student/announcements", icon: Megaphone },
    { label: "Notifications", path: "/student/notifications", icon: Bell },
    { label: "Settings", path: "/student/settings", icon: Settings },
  ];

  const navItems = user?.role === "admin" ? adminNav : user?.role === "faculty" ? facultyNav : studentNav;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
            SC
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wide">SMART CAMPUS</h1>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Management System</p>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/40">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Logged in as</p>
          <p className="text-sm font-bold text-white truncate mt-0.5">{user?.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {user?.role}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
