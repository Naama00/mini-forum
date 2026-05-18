import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SECTION_CONFIG = {
  articles: { label: "מאמרים",  icon: "📄", path: (r) => `/articles/${r._id}` },
  events:   { label: "אירועים", icon: "📅", path: (r) => `/events/${r._id}` },
  jobs:     { label: "משרות",   icon: "💼", path: (r) => `/jobs/${r._id}` },
  topics:   { label: "פורום",   icon: "💬", path: (r) => `/category?topicId=${r._id}` },
  users:    { label: "משתמשים", icon: "👤", path: (r) => `/profile/${r._id}` },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "היום";
  if (days < 30) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString("he-IL");
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`${API}/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results || {}))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [query]);

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400 font-sans" style={{ direction: "rtl" }}>
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-lg">אנא הזן מילת מפתח בשורת החיפוש כדי להציג תוצאות.</p>
      </div>
    );
  }

  // Calculate total hits
  const totalCount = results
    ? Object.values(results).reduce((acc, curr) => acc + (curr?.length || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 p-6 md:p-10 font-sans selection:bg-cyan-500/30" style={{ direction: "rtl" }}>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="border-b border-white/[0.06] pb-6">
          <p className="font-mono text-xs tracking-widest text-cyan-400/60 uppercase mb-2">// תוצאות סריקה גלובלית</p>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            תוצאות חיפוש עבור: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">"{query}"</span>
          </h1>
          <p className="text-sm text-slate-400">
            נמצאו <span className="font-mono text-cyan-400 font-bold">{totalCount}</span> רשומות רלוונטיות בשרתי הקהילה.
          </p>
        </div>

        {/* Tab Filters */}
        {results && totalCount > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-white/[0.03]">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap border ${
                activeTab === "all"
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                  : "bg-transparent border-white/[0.05] text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              הכל ({totalCount})
            </button>
            {Object.keys(results).map((key) => {
              const count = results[key]?.length || 0;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap border ${
                    activeTab === key
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                      : "bg-transparent border-white/[0.05] text-slate-400 hover:text-slate-200 hover:border-white/20"
                  }`}
                >
                  {SECTION_CONFIG[key]?.label || key} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm font-mono">// מעבד רשומות ומבצע אינדקס...</p>
          </div>
        ) : totalCount === 0 ? (
          /* Empty State */
          <div className="py-20 text-center border border-dashed border-white/[0.05] rounded-2xl bg-white/[0.01]">
            <div className="text-5xl mb-4 opacity-40">📭</div>
            <h3 className="text-lg font-bold text-slate-300 mb-1">אין תוצאות תואמות</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              לא הצלחנו למצוא מידע תואם. נסה לחפש מונח רחב יותר או ביטויים חלופיים באנגלית/עברית.
            </p>
          </div>
        ) : (
          /* Main List Wrapper */
          <div className="space-y-8">
            {Object.keys(results).map((section) => {
              const list = results[section] || [];
              if (list.length === 0) return null;
              if (activeTab !== "all" && activeTab !== section) return null;
              const config = SECTION_CONFIG[section] || { label: section, icon: "•", path: () => "/" };

              return (
                <div key={section} className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  {/* Category Section Header */}
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400/70 font-bold">
                    <span>{config.icon}</span>
                    <span>{config.label} ({list.length})</span>
                    <span className="flex-1 h-px bg-gradient-to-l from-cyan-500/20 via-white/5 to-transparent" />
                  </div>

                  {/* Grid Layout of Items */}
                  <div className="grid grid-cols-1 gap-3">
                    {list.map((item) => (
                      <Link
                        key={item._id}
                        to={config.path(item)}
                        className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.06] hover:border-cyan-500/30 hover:from-white/[0.04] transition-all duration-300 hover:shadow-[0_4px_25px_rgba(0,0,0,0.4),_0_0_15px_rgba(0,229,255,0.04)]"
                      >
                        <div className="flex items-start gap-4 min-w-0">
                          {section === "users" ? (
                            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-300 shadow-md">
                              {item.firstName?.[0]?.toUpperCase() || "👤"}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-base text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-all">
                              {config.icon}
                            </div>
                          )}

                          <div className="space-y-1 min-w-0">
                            {section === "users" ? (
                              <div className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                                {item.firstName} {item.lastName || ""}{" "}
                                <span className="font-mono text-xs text-slate-500 mr-1">@{item.username}</span>
                              </div>
                            ) : (
                              <h4 className="text-base font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                                {item.title || item.username}
                              </h4>
                            )}

                            {/* Badges/Meta */}
                            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
                              {item.company && <span className="bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded text-slate-400">🏢 {item.company}</span>}
                              {item.location && <span className="bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded text-slate-400">📍 {item.location}</span>}
                              {item.category && <span className="text-cyan-400/70 font-mono font-semibold">#{item.category}</span>}
                              {item.tags?.slice(0, 3).map((t) => (
                                <span key={t} className="text-slate-500 font-mono">#{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Left Side Status/Arrow */}
                        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-white/[0.04] pt-2 md:pt-0">
                          {item.createdAt && (
                            <span className="font-mono text-[11px] text-slate-500">
                              {timeAgo(item.createdAt)}
                            </span>
                          )}
                          <span className="text-slate-600 text-sm group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all font-mono hidden md:inline">
                            ←
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}