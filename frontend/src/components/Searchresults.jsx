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
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "היום";
  if (days < 30) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString("he-IL");
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [total, setTotal]       = useState(0);
  const [activeType, setActiveType] = useState("all");
  const q = searchParams.get("q") || "";

  useEffect(() => {
    if (q.trim().length < 2) return;
    fetchResults();
  }, [q]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}&limit=20`);
      const data = await res.json();
      setResults(data.results || {});
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  const hasResults = results && Object.values(results).some((arr) => arr?.length > 0);

  const filteredSections = results
    ? Object.entries(SECTION_CONFIG).filter(([key]) =>
        activeType === "all" || activeType === key
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-6 rtl" dir="rtl">
      {/* Header */}
      <div className="mb-7 rtl animate-fade-in">
        <p className="font-mono text-xs tracking-widest text-cyan-500 uppercase mb-2.5">// חיפוש גלובלי</p>
        <h1 className="text-3xl font-black text-white mb-1.5">
          תוצאות עבור <span className="text-cyan-500">"{q}"</span>
        </h1>
        {!loading && results && (
          <p className="text-xs text-slate-200/35 font-mono">נמצאו {total} תוצאות</p>
        )}
      </div>

      {/* Filter tabs */}
      {results && (
        <div className="flex gap-1.5 flex-wrap mb-5 rtl">
          <button
            className={`px-3.5 py-1.5 bg-white/3 border border-white/8 text-slate-200/45 font-sans text-xs font-semibold cursor-pointer transition-all ${activeType === "all" ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500/30 hover:text-slate-200/80"}`}
            onClick={() => setActiveType("all")}
          >
            הכל ({total})
          </button>
          {Object.entries(SECTION_CONFIG).map(([key, config]) => {
            const count = results[key]?.length || 0;
            if (!count) return null;
            return (
              <button
                key={key}
                className={`px-3.5 py-1.5 bg-white/3 border border-white/8 text-slate-200/45 font-sans text-xs font-semibold cursor-pointer transition-all ${activeType === key ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500/30 hover:text-slate-200/80"}`}
                onClick={() => setActiveType(key)}
              >
                {config.icon} {config.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3 mb-5 rtl">
        <div className="flex-1 h-px bg-cyan-500/10" />
        <span className="font-mono text-xs tracking-wide text-cyan-500/50">// תוצאות</span>
        <div className="flex-1 h-px bg-cyan-500/10" />
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="text-4xl animate-spin">⏳</div></div>
      ) : !hasResults ? (
        <div className="text-center py-20 text-gray-600 text-sm"><div className="text-4xl mb-3 opacity-30">🔍</div>לא נמצאו תוצאות עבור "{q}"</div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredSections.map(([key, config]) => {
            const items = results[key];
            if (!items?.length) return null;
            return (
              <div key={key} className="animate-fade-in">
                <div className="flex items-center gap-2 mb-2 rtl">
                  <span className="text-base">{config.icon}</span>
                  <span className="font-mono text-xs tracking-wide text-cyan-500/60 uppercase">{config.label}</span>
                  <span className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 px-2 py-0.5 font-mono">{items.length}</span>
                </div>

                <div className="flex flex-col gap-0.5">
                  {items.map((item) => (
                    <Link key={item._id} to={config.path(item)} className="flex items-center gap-3.5 px-4.5 py-3.5 bg-white/2 border border-white/5 no-underline text-inherit transition-all relative rtl hover:bg-white/4 hover:border-white/9 group">
                      <div className="absolute right-0 top-0 bottom-0 w-0.75 bg-cyan-500 scale-y-0 transition-transform group-hover:scale-y-100" />
                      {key === "users" ? (
                        <>
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            {item.icon || item.avatar
                              ? <img src={item.icon || item.avatar} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full text-sm bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 flex items-center justify-center font-bold">
                                  {item.firstName?.[0] || item.username?.[0] || "?"}
                                </div>
                            }
                          </div>
                          <div className="flex-1 min-w-0 rtl">
                            <span className="block text-sm font-semibold text-white mb-1 truncate">{item.firstName} {item.lastName}</span>
                            <span className="text-xs text-slate-200/40">@{item.username}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0 rtl">
                            <span className="block text-sm font-semibold text-white mb-1 truncate group-hover:text-cyan-500">{item.title}</span>
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.company && <span className="text-xs text-slate-200/40 bg-white/4 border border-white/7 px-1.75 py-0.5">🏢 {item.company}</span>}
                              {item.location && <span className="text-xs text-slate-200/40 bg-white/4 border border-white/7 px-1.75 py-0.5">📍 {item.location}</span>}
                              {item.category && <span className="text-xs text-slate-200/40 bg-white/4 border border-white/7 px-1.75 py-0.5">#{item.category}</span>}
                              {item.tags?.slice(0, 2).map(t => (
                                <span key={t} className="text-xs text-slate-200/40 bg-white/4 border border-white/7 px-1.75 py-0.5">#{t}</span>
                              ))}
                              {item.createdAt && <span className="text-xs text-slate-200/25 font-mono mr-auto">{timeAgo(item.createdAt)}</span>}
                            </div>
                          </div>
                          <span className="text-slate-200/20 text-base transition-all flex-shrink-0 group-hover:text-cyan-500 group-hover:-translate-x-0.75">←</span>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}