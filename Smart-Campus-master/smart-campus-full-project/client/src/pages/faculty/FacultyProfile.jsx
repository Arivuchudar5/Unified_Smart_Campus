
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Alert from "../../components/common/Alert";
import { GraduationCap, Mail, Phone, Building2, BookOpen, ShieldCheck, CheckCircle2 } from "lucide-react";

const FacultyProfile = () => {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/me");
      if (res.data.success && res.data.profile) {
        setFaculty(res.data.profile);
        setPhone(res.data.profile.phone || "");
        setAvatar(res.data.profile.profilePhoto || user?.avatar || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await API.put("/auth/profile", {
        phone,
        avatar
      });
      if (res.data.success) {
        setSuccess("Profile details updated successfully!");
        fetchProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 font-medium">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Profile</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          View your academic appointment, assigned courses, and update contact information.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Avatar & Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-3xl overflow-hidden border-2 border-blue-200 shadow-md">
            {faculty?.profilePhoto ? (
              <img src={faculty.profilePhoto} alt={faculty.name} className="w-full h-full object-cover" />
            ) : (
              faculty?.name?.charAt(0) || "F"
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-4">{faculty?.name}</h3>
          <p className="text-xs font-bold text-indigo-600">{faculty?.designation}</p>
          <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {faculty?.facultyId}
          </span>

          <div className="mt-6 w-full pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{faculty?.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{faculty?.department?.name || "Engineering"}</span>
            </p>
          </div>
        </div>

        {/* Right Form: Permitted fields */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Edit Profile Contact</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name (Official)" disabled value={faculty?.name || ""} />
              <Input label="Faculty ID (Fixed)" disabled value={faculty?.facultyId || ""} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email Address (Fixed)" disabled value={faculty?.email || ""} />
              <Input
                label="Contact Phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
              />
            </div>

            <Input
              label="Profile Avatar URL"
              name="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
            />

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Assigned Subjects</h4>
              <div className="space-y-2">
                {faculty?.assignedSubjects?.map((sub) => (
                  <div key={sub._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{sub.name}</span>
                    <span className="text-indigo-600 font-semibold">{sub.code} &bull; Sem {sub.semester}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-100">
              <Button type="submit" variant="primary" loading={saving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
