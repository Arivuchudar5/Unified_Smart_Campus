
import React, { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";
import { ShieldCheck, KeyRound, Building2 } from "lucide-react";

const AdminSettings = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await API.put("/auth/change-password", {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System & Account Settings</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage campus administrator profile credentials and system configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Campus Administrator Details
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-3">
            <div>
              <span className="text-slate-400 font-semibold uppercase">Administrator Name</span>
              <p className="font-bold text-slate-800 mt-0.5">{user?.name}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase">Official Email</span>
              <p className="font-bold text-slate-800 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase">Access Level</span>
              <p className="font-bold text-purple-700 mt-0.5">Full Super Administrator</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            Security & Password Update
          </h3>

          {error && <Alert type="error" message={error} className="mb-4" />}
          {success && <Alert type="success" message={success} className="mb-4" />}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimum 6 characters."
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Update Security Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
