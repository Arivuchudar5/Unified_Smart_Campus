
import React from "react";

const Badge = ({ variant = "default", children, className = "" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  const getVariantByText = (text) => {
    if (!text) return variants.default;
    const str = String(text).toLowerCase();
    if (str.includes("present") || str.includes("approved") || str.includes("evaluated") || str.includes("active") || str.includes("published")) return variants.success;
    if (str.includes("absent") || str.includes("rejected") || str.includes("inactive") || str.includes("failed") || str.includes("late")) return variants.danger;
    if (str.includes("pending") || str.includes("not submitted")) return variants.warning;
    if (str.includes("submitted")) return variants.info;
    return variants[variant] || variants.default;
  };

  const selectedClass = typeof children === "string" ? getVariantByText(children) : variants[variant];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedClass} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
