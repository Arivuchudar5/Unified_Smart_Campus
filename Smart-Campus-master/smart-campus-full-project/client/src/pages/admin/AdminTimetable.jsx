
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Alert from "../../components/common/Alert";
import { Plus, Trash2, CalendarDays, Clock, MapPin, User, AlertTriangle } from "lucide-react";

const AdminTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    course: "",
    semester: 4,
    subject: "",
    faculty: "",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    room: "LH-101"
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [deptFilter, semFilter, dayFilter]);

  const fetchInitial = async () => {
    try {
      const [dRes, cRes, fRes] = await Promise.all([
        API.get("/departments"),
        API.get("/courses"),
        API.get("/faculty")
      ]);
      if (dRes.data.success) {
        setDepartments(dRes.data.data);
        if (dRes.data.data.length > 0 && !deptFilter) {
          setDeptFilter(dRes.data.data[0]._id);
        }
      }
      if (cRes.data.success) setCourses(cRes.data.data);
      if (fRes.data.success) setFaculty(fRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const params = {};
      if (deptFilter) params.department = deptFilter;
      if (semFilter) params.semester = semFilter;
      if (dayFilter) params.day = dayFilter;

      const res = await API.get("/timetable", { params });
      if (res.data.success) setTimetable(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      department: deptFilter || departments[0]?._id || "",
      course: courses[0]?._id || "",
      semester: semFilter || 4,
      subject: courses[0]?.name || "",
      faculty: faculty[0]?._id || "",
      day: dayFilter || "Monday",
      startTime: "09:00",
      endTime: "10:00",
      room: "LH-101"
    });
    setFormError("");
    setFormSuccess("");
    setIsAddModalOpen(true);
  };

  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    const foundCourse = courses.find((c) => c._id === selectedCourseId);
    setFormData({
      ...formData,
      course: selectedCourseId,
      subject: foundCourse ? `${foundCourse.name} (${foundCourse.code})` : "",
      faculty: foundCourse?.faculty?._id || foundCourse?.faculty || formData.faculty,
      semester: foundCourse?.semester || formData.semester,
      department: foundCourse?.department?._id || foundCourse?.department || formData.department
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const res = await API.post("/timetable", formData);
      if (res.data.success) {
        setFormSuccess("Timetable slot added successfully!");
        setTimeout(() => {
          setIsAddModalOpen(false);
          fetchTimetable();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create timetable slot.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this scheduled timetable slot?")) {
      try {
        await API.delete(`/timetable/${id}`);
        fetchTimetable();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Master Timetable Schedule</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure weekly lecture timings, faculty assignments, lecture halls, with automated conflict checking.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus} className="shadow-md">
          Add Timetable Slot
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>

        <select
          value={semFilter}
          onChange={(e) => setSemFilter(e.target.value)}
          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>

        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
        >
          <option value="">All Days (Mon - Sat)</option>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table
        headers={["Day", "Time Slot", "Subject / Course", "Semester", "Assigned Faculty", "Room", "Actions"]}
        loading={loading}
        colSpan={7}
      >
        {timetable.map((slot) => (
          <tr key={slot._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4">
              <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                {slot.day}
              </span>
            </td>
            <td className="px-6 py-4 font-semibold text-xs text-slate-800 flex items-center gap-1.5 mt-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {slot.startTime} - {slot.endTime}
            </td>
            <td className="px-6 py-4">
              <p className="font-bold text-slate-900 text-xs">{slot.subject}</p>
              <p className="text-[10px] text-slate-400">{slot.course?.code || "Course Code"}</p>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-600">Sem {slot.semester}</td>
            <td className="px-6 py-4 text-xs font-medium text-slate-700 flex items-center gap-1.5 mt-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {slot.faculty?.name || "—"}
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                <MapPin className="w-3 h-3 text-slate-400" />
                {slot.room}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => handleDelete(slot._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete Slot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {/* Add Slot Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Timetable Slot">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        {formSuccess && <Alert type="success" message={formSuccess} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Course / Subject"
            name="course"
            required
            value={formData.course}
            onChange={handleCourseChange}
            options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code} - Sem ${c.semester})` }))}
          />

          <Input
            label="Subject Display Name"
            name="subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g. Data Structures (CS201)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned Faculty"
              name="faculty"
              required
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              options={faculty.map((f) => ({ value: f._id, label: `${f.name} (${f.facultyId})` }))}
            />
            <Select
              label="Day of the Week"
              name="day"
              required
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => ({
                value: d,
                label: d
              }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Start Time"
              name="startTime"
              type="text"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              placeholder="09:00"
            />
            <Input
              label="End Time"
              name="endTime"
              type="text"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              placeholder="10:00"
            />
            <Input
              label="Room / Hall"
              name="room"
              required
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g. LH-101 or Lab-2"
            />
          </div>

          <p className="text-[11px] text-slate-500 italic bg-amber-50 p-2.5 rounded-xl border border-amber-100 text-amber-800">
            Note: System automatically checks and blocks overlapping class bookings for both Faculty and Lecture Rooms.
          </p>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Validate & Schedule Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTimetable;
