
import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

const Alert = ({ type = "info", message, className = "" }) => {
  if (!message) return null;

  const config = {
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-800",
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
    }
  };

  const { bg, icon } = config[type] || config.info;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${bg} text-sm font-medium ${className}`}>
      {icon}
      <div className="flex-1">{message}</div>
    </div>
  );
};

export default Alert;
