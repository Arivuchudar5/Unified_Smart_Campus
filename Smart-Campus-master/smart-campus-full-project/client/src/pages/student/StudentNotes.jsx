
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Table from "../../components/common/Table";
import { Download, BookMarked, Search, User } from "lucide-react";

const StudentNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [search]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notes", { params: { search } });
      if (res.data.success) {
        setNotes(res.data.data);
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lecture Notes & Course Materials</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Access and download lecture slide decks, syllabus modules, and study notes uploaded by your course instructors.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search study materials by topic, title, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <Table
        headers={["Material Title", "Subject / Module", "Uploaded By", "Date", "Download"]}
        loading={loading}
        colSpan={5}
      >
        {notes.map((n) => (
          <tr key={n._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4">
              <p className="font-bold text-slate-900 text-sm">{n.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.description}</p>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
              {n.course?.name} ({n.course?.code})
            </td>
            <td className="px-6 py-4 text-xs text-slate-600 flex items-center gap-1.5 mt-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {n.faculty?.name || "Faculty Instructor"}
            </td>
            <td className="px-6 py-4 text-xs text-slate-600">
              {new Date(n.uploadedDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
              <a
                href={n.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download ({n.fileSize})
              </a>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default StudentNotes;
