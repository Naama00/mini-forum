 import { Link, useLocation } from "react-router-dom";

// מיפוי של נתיבים לשמות עבריים
const ROUTE_NAMES = {
  "":           "דף הבית",
  "articles":   "מאמרים",
  "events":     "אירועים",
  "jobs":       "משרות",
  "new":        "חדש",
  "edit":       "עריכה",
  "notifications": "התראות",
  "profile":    "פרופיל",
};

// קיצורי ID — מחליף מזהה ארוך בטקסט קצר
function isMongoId(str) {
  return /^[a-f\d]{24}$/i.test(str);
}

export default function Breadcrumb({ customNames = {} }) {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  const crumbs = [
    { label: "דף הבית", to: "/" },
    ...parts.map((part, i) => {
      const to = "/" + parts.slice(0, i + 1).join("/");
      const label =
        customNames[part] ||
        ROUTE_NAMES[part] ||
        (isMongoId(part) ? null : part);
      return { label, to };
    }),
  ].filter((c) => c.label !== null);

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-300/35 rtl mb-6 flex-wrap" dir="rtl">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.to} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="text-slate-300/50 font-mono text-xs tracking-wide">{crumb.label}</span>
            ) : (
              <>
                <Link to={crumb.to} className="text-cyan-500/60 no-underline font-mono text-xs tracking-wide transition-colors hover:text-cyan-500">
                  {crumb.label}
                </Link>
                <span className="text-slate-300/20 text-sm leading-tight">›</span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}