
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, GraduationCap, Building2 } from "lucide-react";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "faculty") {
        navigate("/faculty/dashboard");
      } else if (data.user.role === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Invalid credentials or server unavailable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (accEmail, accPass) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Smart Campus</h2>
        <p className="mt-2 text-sm text-slate-400 font-medium">
          Unified Academic & Administrative Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl">
          {error && <Alert type="error" message={error} className="mb-6" />}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email / Register Number / Faculty ID
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@campus.edu or 2026CS101"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full font-bold shadow-lg shadow-indigo-600/30"
            >
              {loading ? "Authenticating & Loading..." : "Sign In to Portal"}
            </Button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Quick Demo Logins (Click to Autofill):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("admin@campus.edu", "Admin@123")}
                className="text-left px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/50 hover:bg-purple-900/50 text-xs font-semibold text-purple-300 transition-all flex flex-col"
              >
                <span className="font-bold text-white">Campus Admin</span>
                <span className="text-[10px] text-purple-400">admin@campus.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("faculty1@campus.edu", "Faculty@123")}
                className="text-left px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-800/50 hover:bg-blue-900/50 text-xs font-semibold text-blue-300 transition-all flex flex-col"
              >
                <span className="font-bold text-white">Faculty (CSE)</span>
                <span className="text-[10px] text-blue-400">Dr. Alan Turing</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("faculty2@campus.edu", "Faculty@123")}
                className="text-left px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-800/50 hover:bg-blue-900/50 text-xs font-semibold text-blue-300 transition-all flex flex-col"
              >
                <span className="font-bold text-white">Faculty (IT)</span>
                <span className="text-[10px] text-blue-400">Dr. Ada Lovelace</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("student1@campus.edu", "Student@123")}
                className="text-left px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 text-xs font-semibold text-emerald-300 transition-all flex flex-col"
              >
                <span className="font-bold text-white">Student (Alex)</span>
                <span className="text-[10px] text-emerald-400">2026CS101</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Protected with JWT & bcrypt encryption &bull; Real MongoDB Integration
        </p>
      </div>
    </div>
  );
};

export default Login;
