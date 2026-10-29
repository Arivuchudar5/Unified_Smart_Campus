
import React from "react";

const Table = ({ headers = [], children, loading = false, emptyMessage = "No records found.", colSpan = 5 }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-600">
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={colSpan || headers.length} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium text-slate-500">Loading data from database...</span>
                  </div>
                </td>
              </tr>
            ) : children ? (
              children
            ) : (
              <tr>
                <td colSpan={colSpan || headers.length} className="px-6 py-12 text-center text-slate-400 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
