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
  const dropdownRef             = useRef(null);
  const navigate                = useNavigate();

  const fetchResults = useCallback(
    debounce(async (q) => {
      if (!q.trim()) {
        setResults(null);
        setTotal(0);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || {});
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      fetchResults(query);
    } else {
      setResults(null);
      setTotal(0);
      setLoading(false);
    }
  }, [query, fetchResults]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (path) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm font-sans" ref={dropdownRef} style={{ direction: "rtl" }}>
      {/* Search Input Wrapper */}
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="חיפוש מאמרים, משרות, פורומים..."
          className="w-full bg-slate-950/40 border border-white/[0.08] text-sm rounded-xl py-2.5 pr-10 pl-4 text-slate-200 placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-slate-950/80 focus:shadow-[0_0_15px_rgba(0,229,255,0.15)]"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-base transition-colors group-focus-within:text-cyan-400 pointer-events-none">
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : "🔍"}
        </span>
      </div>

      {/* Floating Results Panel */}
      {open && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0e1a]/95 border border-white/[0.08] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {!results || total === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              {loading ? "מחפש תוצאות..." : "לא נמצאו תוצאות עבור הביטוי הנוכחי"}
            </div>
          ) : (
            <>
              <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-3">
                {Object.keys(results).map((section) => {
                  const list = results[section] || [];
                  if (list.length === 0) return null;
                  const config = SECTION_CONFIG[section] || { label: section, icon: "•", path: () => "/" };

                  return (
                    <div key={section} className="space-y-1">
                      {/* Section Label */}
                      <div className="flex items-center gap-2 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-500/50 font-bold">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                        <span className="flex-1 h-px bg-cyan-500/10" />
                      </div>

                      {/* Items */}
                      <div className="space-y-0.5">
                        {list.map((item) => (
                          <button
                            key={item._id}
                            onClick={() => handleSelect(config.path(item))}
                            className="w-full flex items-center gap-3 text-right px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all duration-150 group"
                          >
                            {section === "users" ? (
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                                  {item.firstName?.[0]?.toUpperCase() || "👤"}
                                </div>
                                <div className="text-xs text-slate-300 font-medium group-hover:text-cyan-400">
                                  {item.firstName} {item.lastName || ""}{" "}
                                  <span className="text-[11px] text-slate-600 mr-1 font-mono">@{item.username}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5 w-full min-w-0">
                                <span className="text-xs font-medium truncate group-hover:text-cyan-400 transition-colors">
                                  {item.title || item.username}
                                </span>
                                {(item.company || item.location || item.category) && (
                                  <span className="text-[10px] text-slate-500 font-sans truncate">
                                    {item.company ? `🏢 ${item.company}` : ""}
                                    {item.location ? ` • 📍 ${item.location}` : ""}
                                    {item.category ? ` • #${item.category}` : ""}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View All Button */}
              <div className="p-2 border-t border-white/[0.05] bg-slate-950/20">
                <button
                  onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setOpen(false); }}
                  className="w-full py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 rounded-lg font-sans text-xs font-bold transition-all duration-200 text-center block"
                >
                  הצג את כל {total} התוצאות במערכת ←
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}