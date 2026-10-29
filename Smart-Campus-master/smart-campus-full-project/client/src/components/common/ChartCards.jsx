
import React from "react";

export const BarChartCard = ({ title, data = [] }) => {
  const max = Math.max(...data.map((d) => d.count || 0), 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h4 className="text-base font-bold text-slate-800 mb-4">{title}</h4>
      <div className="space-y-4">
        {data.map((item, idx) => {
          const pct = Math.round(((item.count || 0) / max) * 100);
          return (
            <div key={idx}>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>{item.name} ({item.code})</span>
                <span className="text-indigo-600 font-bold">{item.count} Students</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DonutChartCard = ({ title, present = 0, absent = 0, rate = 0 }) => {
  const total = present + absent || 1;
  const presentPct = Math.round((present / total) * 100);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
      <h4 className="text-base font-bold text-slate-800 mb-2">{title}</h4>
      <div className="flex items-center justify-center my-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-rose-100"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500"
              strokeDasharray={`${presentPct}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-slate-800">{rate}%</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Attendance</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-100">
        <div className="bg-emerald-50 rounded-xl p-2">
          <p className="text-xs font-semibold text-emerald-800">Present</p>
          <p className="text-base font-bold text-emerald-600">{present}</p>
        </div>
        <div className="bg-rose-50 rounded-xl p-2">
          <p className="text-xs font-semibold text-rose-800">Absent</p>
          <p className="text-base font-bold text-rose-600">{absent}</p>
        </div>
      </div>
    </div>
  );
};
