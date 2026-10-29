
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Alert from "../../components/common/Alert";
import { GraduationCap, Mail, Phone, MapPin, Building2, BookOpen, ShieldCheck } from "lucide-react";

const StudentProfile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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
        const p = res.data.profile;
        setStudent(p);
        setPhone(p.phone || "");
        setAddress(p.address || "");
        setAvatar(p.profilePhoto || user?.avatar || "");
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
        address,
        avatar
      });
      if (res.data.success) {
        setSuccess("Profile details saved successfully!");
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Academic Profile</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          View official university enrollment details and maintain personal contact information.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left card: Avatar and Fixed Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-3xl overflow-hidden border-2 border-indigo-200 shadow-md">
            {student?.profilePhoto ? (
              <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              student?.name?.charAt(0) || "S"
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-4">{student?.name}</h3>
          <p className="text-xs font-bold text-indigo-600">{student?.registerNumber}</p>
          <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Year {student?.year} &bull; Semester {student?.semester}
          </span>

          <div className="mt-6 w-full pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{student?.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{student?.department?.name}</span>
            </p>
          </div>
        </div>

        {/* Right Form: Permitted fields */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Edit Personal Contact Details</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Student Name (Official)" disabled value={student?.name || ""} />
              <Input label="Register Number (Fixed)" disabled value={student?.registerNumber || ""} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email Address (Fixed)" disabled value={student?.email || ""} />
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

            <Textarea
              label="Residential Address"
              rows={3}
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, city, postal code..."
            />

            <p className="text-[11px] text-slate-400 italic">
              Note: Academic parameters (Register Number, Department, Year, and Semester) are controlled by the Registrar / Administration.
            </p>

            <div className="pt-4 flex justify-end border-t border-slate-100">
              <Button type="submit" variant="primary" loading={saving}>
                Save Changes to MongoDB
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
