
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import { Clock, MapPin, Calendar, User } from "lucide-react";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await API.get("/timetable/student");
      if (res.data.success) {
        setTimetable(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Weekly Lecture Timetable</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Your course timetable schedule customized for your enrolled department, year, and semester.
        </p>
      </div>

      <Table
        headers={["Day", "Time Slot", "Subject / Module", "Instructor", "Room / Hall"]}
        loading={loading}
        colSpan={5}
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
            <td className="px-6 py-4 font-bold text-slate-900 text-xs">{slot.subject}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {slot.faculty?.name || "Faculty"}
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                <MapPin className="w-3 h-3 text-slate-400" />
                {slot.room}
              </span>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default StudentTimetable;
