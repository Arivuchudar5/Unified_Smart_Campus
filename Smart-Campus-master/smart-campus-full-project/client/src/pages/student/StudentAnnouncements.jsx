
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Badge from "../../components/common/Badge";
import { Megaphone, Search } from "lucide-react";

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, [search, categoryFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await API.get("/announcements", { params });
      if (res.data.success) {
        setAnnouncements(res.data.data);
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Notices & Announcements</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Official academic alerts, schedule changes, college circulars, and departmental event notifications.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-48 py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
        >
          <option value="">All Categories</option>
          {["Academic", "Administrative", "Exam", "Event", "General"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="col-span-2 text-center text-slate-400 py-12">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="col-span-2 text-center text-slate-400 py-12">No announcements found.</p>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="primary">{a.category}</Badge>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {new Date(a.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{a.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{a.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-700">Issued by: {a.authorName || "Administration"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;
