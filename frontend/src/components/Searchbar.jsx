import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SECTION_CONFIG = {
  articles: { label: "מאמרים",  icon: "📄", path: (r) => `/articles/${r._id}` },
  events:   { label: "אירועים", icon: "📅", path: (r) => `/events/${r._id}` },
  jobs:     { label: "משרות",   icon: "💼", path: (r) => `/jobs/${r._id}` },
  topics:   { label: "פורום",   icon: "💬", path: (r) => `/category?topicId=${r._id}` },
  users:    { label: "משתמשים", icon: "👤", path: (r) => `/profile/${r._id}` },
};

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function SearchBar() {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [total, setTotal]       = useState(0);
  const wrapRef                 = useRef(null);
  const navigate                = useNavigate();

  // סגור בלחיצה מחוץ
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(
    debounce(async (q) => {
      if (q.trim().length < 2) { setResults(null); setOpen(false); return; }
      setLoading(true);
      try {
        const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}&limit=4`);
        const data = await res.json();
        setResults(data.results || {});
        setTotal(data.total || 0);
        setOpen(true);
      } catch {
        setResults(null);
      }
      setLoading(false);
    }, 350),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setOpen(false);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const handleResultClick = (path) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const hasResults = results && Object.values(results).some((arr) => arr?.length > 0);

  return (
    <div className="relative z-50 rtl" ref={wrapRef} dir="rtl">
      <div className={`flex items-center gap-2 bg-white/3 border border-white/8 px-3.5 py-2 transition-all duration-250 ${open ? "border-cyan-500 bg-cyan-500/3 shadow-lg shadow-cyan-500/12 w-75" : "w-55"}`}>
        <span className="text-sm text-cyan-500/50 flex-shrink-0 leading-none">
          {loading ? <span className="inline-block w-3.5 h-3.5 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" /> : "🔍"}
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results && setOpen(true)}
          placeholder="חיפוש גלובלי..."
          className="bg-none border-none outline-none text-slate-200 font-sans text-xs flex-1 rtl placeholder:text-slate-200/25 min-w-0"
          autoComplete="off"
        />
        {query && (
          <button className="bg-none border-none text-slate-200/30 text-lg cursor-pointer px-0 leading-none transition-colors hover:text-rose-500 flex-shrink-0" onClick={() => { setQuery(""); setResults(null); setOpen(false); }}>×</button>
        )}
      </div>

      {open && (
        <div className="absolute top-12 right-0 w-90 bg-gray-950/98 border border-cyan-500/15 rounded-lg shadow-2xl z-50 animate-fade-in rtl max-h-120 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/15" style={{ backdropFilter: 'blur(20px)' }}>
          {!hasResults ? (
            <div className="px-4 py-6 text-center text-slate-200/30 text-sm">
              {loading ? "מחפש..." : `אין תוצאות עבור "${query}"`}
            </div>
          ) : (
            <>
              {Object.entries(SECTION_CONFIG).map(([key, config]) => {
                const items = results[key];
                if (!items?.length) return null;
                return (
                  <div key={key} className="border-b border-white/5 last:border-b-0">
                    <div className="flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs tracking-widest text-cyan-500/45 uppercase">
                      <span>{config.icon}</span> {config.label}
                    </div>
                    {items.map((item) => (
                      <button
                        key={item._id}
                        className="w-full bg-none border-none px-3.5 py-2.25 cursor-pointer text-right transition-all text-inherit hover:bg-white/4"
                        onClick={() => handleResultClick(config.path(item))}
                      >
                        {key === "users" ? (
                          <div className="flex items-center gap-2.5 rtl">
                            <div className="w-7.5 h-7.5 rounded-full overflow-hidden bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-500 flex-shrink-0">
                              {item.icon || item.avatar
                                ? <img src={item.icon || item.avatar} alt="" className="w-full h-full object-cover" />
                                : <span>{item.firstName?.[0] || item.username?.[0] || "?"}</span>
                              }
                            </div>
                            <div className="text-sm text-slate-200">{item.firstName} {item.lastName || ""} <span className="text-xs text-slate-200/40 mr-1">@{item.username}</span></div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5 rtl">
                            <span className="text-sm text-slate-200 font-semibold truncate">
                              {item.title || item.username}
                            </span>
                            {(item.company || item.location || item.category) && (
                              <span className="text-xs text-slate-200/35">
                                {item.company || item.location || item.category}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}

              <div className="px-3.5 py-2.5 border-t border-white/6">
                <button className="w-full bg-none border-none text-cyan-500/60 font-sans text-xs cursor-pointer px-0 transition-colors hover:text-cyan-500 text-right" onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setOpen(false); }}>
                  הצג את כל {total} התוצאות ←
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}