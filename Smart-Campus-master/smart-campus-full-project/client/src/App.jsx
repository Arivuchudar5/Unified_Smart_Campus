import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// Auth
import Login from "./pages/auth/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminTimetable from "./pages/admin/AdminTimetable";
import AdminLeaves from "./pages/admin/AdminLeaves";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

// Faculty Pages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyProfile from "./pages/faculty/FacultyProfile";
import FacultyAttendance from "./pages/faculty/FacultyAttendance";
import FacultyAssignments from "./pages/faculty/FacultyAssignments";
import FacultySubmissions from "./pages/faculty/FacultySubmissions";
import FacultyMarks from "./pages/faculty/FacultyMarks";
import FacultyTimetable from "./pages/faculty/FacultyTimetable";
import FacultyLeaves from "./pages/faculty/FacultyLeaves";
import FacultyNotes from "./pages/faculty/FacultyNotes";
import FacultyAnnouncements from "./pages/faculty/FacultyAnnouncements";
import FacultySettings from "./pages/faculty/FacultySettings";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentMarks from "./pages/student/StudentMarks";
import StudentLeave from "./pages/student/StudentLeave";
import StudentNotes from "./pages/student/StudentNotes";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentSettings from "./pages/student/StudentSettings";

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === "faculty") return <Navigate to="/faculty/dashboard" replace />;
  if (user?.role === "student") return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<MainLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="faculty" element={<AdminFaculty />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="timetable" element={<AdminTimetable />} />
              <Route path="leaves" element={<AdminLeaves />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Faculty Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
            <Route path="/faculty" element={<MainLayout />}>
              <Route index element={<Navigate to="/faculty/dashboard" replace />} />
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="profile" element={<FacultyProfile />} />
              <Route path="attendance" element={<FacultyAttendance />} />
              <Route path="assignments" element={<FacultyAssignments />} />
              <Route path="submissions" element={<FacultySubmissions />} />
              <Route path="marks" element={<FacultyMarks />} />
              <Route path="timetable" element={<FacultyTimetable />} />
              <Route path="leaves" element={<FacultyLeaves />} />
              <Route path="notes" element={<FacultyNotes />} />
              <Route path="announcements" element={<FacultyAnnouncements />} />
              <Route path="settings" element={<FacultySettings />} />
            </Route>
          </Route>

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<MainLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="marks" element={<StudentMarks />} />
              <Route path="leave" element={<StudentLeave />} />
              <Route path="notes" element={<StudentNotes />} />
              <Route path="announcements" element={<StudentAnnouncements />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="settings" element={<StudentSettings />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
