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
    <nav className="breadcrumb" dir="rtl">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.to} className="breadcrumb-item">
            {isLast ? (
              <span className="breadcrumb-current">{crumb.label}</span>
            ) : (
              <>
                <Link to={crumb.to} className="breadcrumb-link">
                  {crumb.label}
                </Link>
                <span className="breadcrumb-sep">›</span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}