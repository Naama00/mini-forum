import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const RECENT_KEY = "devhub_recent_searches";
const MAX_RECENT = 5;

const SECTION_CONFIG = {
  topics:   { label: "פורום",   icon: "⬡", color: "#8b5cf6", path: (r) => `/category?topicId=${r._id}` },
  articles: { label: "מאמרים",  icon: "◎", color: "#ec4899", path: (r) => `/articles/${r._id}` },
  jobs:     { label: "משרות",   icon: "◇", color: "#06b6d4", path: (r) => `/jobs/${r._id}` },
  events:   { label: "אירועים", icon: "◆", color: "#22d3ee", path: (r) => `/events/${r._id}` },
  users:    { label: "משתמשים", icon: "◐", color: "#a78bfa", path: (r) => `/profile/${r._id}` },
};

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
}

function saveRecentSearch(query) {
  if (!query?.trim()) return;
  const recent = getRecentSearches().filter(q => q !== query.trim());
  recent.unshift(query.trim());
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY);
}

export default function SearchBar() {
  const [query, setQuery]                   = useState("");
  const [results, setResults]               = useState(null);
  const [loading, setLoading]               = useState(false);
  const [open, setOpen]                     = useState(false);
  const [total, setTotal]                   = useState(0);
  const [error, setError]                   = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const dropdownRef                         = useRef(null);
  const overlayInputRef                     = useRef(null);
  const navigate                            = useNavigate();

  useEffect(() => { setRecentSearches(getRecentSearches()); }, [open]);

  const fetchResults = useCallback(
    debounce(async (q) => {
      const cleanQuery = q.trim();
      if (cleanQuery.length < 2) {
        setResults(null); setTotal(0);
        setError(cleanQuery.length === 1 ? 'הכנס לפחות 2 תווים' : '');
        setLoading(false);
        return;
      }
      try {
        const res  = await fetch(`${API}/search?q=${encodeURIComponent(cleanQuery)}&limit=20`);
        const data = await res.json();
        if (!res.ok) { setError(data.message || 'שגיאת חיפוש'); setResults(null); setTotal(0); return; }
        setResults(data.results || {}); setTotal(data.total || 0); setError('');
      } catch (err) {
        console.error("Search error:", err);
        setError('שגיאת רשת. נסה שוב'); setResults(null); setTotal(0);
      } finally { setLoading(false); }
    }, 300), []
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) { setResults(null); setTotal(0); setLoading(false); setError(""); return; }
    if (trimmed.length < 2) { setResults(null); setTotal(0); setLoading(false); setError('הכנס לפחות 2 תווים'); return; }
    setLoading(true); setError(""); fetchResults(trimmed);
  }, [query, fetchResults]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open && overlayInputRef.current) overlayInputRef.current.focus();
  }, [open]);

  const handleSelect = (path, searchQuery) => {
    if (searchQuery) saveRecentSearch(searchQuery);
    navigate(path); setOpen(false); setQuery("");
  };

  const handleRecentSelect = (recentQuery) => {
    setQuery(recentQuery);
    saveRecentSearch(recentQuery);
    setRecentSearches(getRecentSearches());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      saveRecentSearch(query.trim());
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setOpen(false);
    }
  };

  const showRecent = open && !query.trim() && recentSearches.length > 0;

  return (
    <div ref={dropdownRef} dir="rtl" className="relative w-full max-w-full font-body">

      {/* ── שדה חיפוש קטן ── */}
      <div className="relative group search-futuristic">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="חפש..."
          className="w-full rounded-xl border border-white/10 bg-dark-950/70 py-2.5 pr-10 pl-4 text-sm text-dark-100 outline-none transition-all duration-250 backdrop-blur-md placeholder:text-dark-500 focus:border-cyan-500/45 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.08),0_0_20px_rgba(6,182,212,0.12)]"
        />
        {/* אייקון חיפוש — z-10 מונע כיסוי ע"י טקסט */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-sm font-mono"
              style={{ color: loading ? '#06b6d4' : 'rgba(100,116,139,0.8)', background: 'rgba(15,23,42,0.8)', borderRadius: '4px', padding: '0 2px' }}>
          {loading ? (
            <svg style={{ animation: "spin 0.8s linear infinite", width: "14px", height: "14px", display: "block" }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : "⌕"}
        </span>
      </div>

      {/* ── לוח תוצאות צף ── */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-8 pointer-events-none">
          <div className="absolute inset-0 bg-transparent backdrop-blur-2xl" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-[750px] min-h-[420px] rounded-3xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto"
               style={{ backgroundColor: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', boxShadow: '0 0 40px rgba(139,92,246,0.15)' }}>
            <div style={{ padding: "1.25rem 1.5rem 1rem" }}>

              {/* ── שדה חיפוש ב-overlay ── */}
              <div style={{ position: "relative", marginBottom: "1rem" }}>
                <input
                  ref={overlayInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="הכנס מילת חיפוש..."
                  className="input-futuristic min-h-14 pr-12 text-base"
                  style={{ paddingRight: "3rem" }}
                />
                <span style={{
                  position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
                  pointerEvents: "none", zIndex: 10, fontSize: "1.1rem", fontFamily: "monospace",
                  color: loading ? '#06b6d4' : 'rgba(100,116,139,0.6)',
                  background: 'rgba(15,23,42,0.9)', borderRadius: '4px', padding: '0 3px',
                }}>
                  {loading ? (
                    <svg style={{ animation: "spin 0.8s linear infinite", width: "18px", height: "18px", display: "block" }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : "⌕"}
                </span>
              </div>

              {/* ── חיפושים אחרונים ── */}
              {showRecent && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 0.6rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8b5cf6", fontWeight: 700 }}>
                      🕐 חיפושים אחרונים
                    </span>
                    <button
                      onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                      style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.5)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0.5rem", borderRadius: "0.5rem" }}
                      onMouseEnter={e => e.currentTarget.style.color = "rgba(248,113,113,0.8)"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(148,163,184,0.5)"}
                    >
                      נקה הכל
                    </button>
                  </div>
                  {recentSearches.map((recent, i) => (
                    <button key={i} onClick={() => handleRecentSelect(recent)}
                      style={{ width: "100%", textAlign: "right", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "1rem", border: "1px solid rgba(148,163,184,0.08)", background: "rgba(255,255,255,0.02)", color: "#e2e8f0", cursor: "pointer", transition: "all 0.2s ease", marginBottom: "0.35rem" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.08)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(148,163,184,0.08)"; }}
                    >
                      <span style={{ color: "rgba(148,163,184,0.4)", fontSize: "0.9rem" }}>🕐</span>
                      <span style={{ fontSize: "0.95rem" }}>{recent}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ── תוצאות / מצבים ── */}
              {error ? (
                <div style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(220,38,38,0.08)", color: "#f8d7da", fontSize: "0.95rem", border: "1px solid rgba(248,113,113,0.2)" }}>
                  {error}
                </div>
              ) : loading ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "rgba(148,163,184,0.8)", fontSize: "0.95rem" }}>מחפש תוצאות...</div>
              ) : query.trim() && (!results || total === 0) ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "rgba(148,163,184,0.7)", fontSize: "0.95rem" }}>
                  לא נמצאו תוצאות עבור "{query.trim()}"
                </div>
              ) : results && total > 0 ? (
                <div style={{ maxHeight: "380px", overflowY: "auto", paddingRight: "0.25rem" }}>
                  {Object.keys(results).map((section) => {
                    const list   = results[section] || [];
                    if (!list.length) return null;
                    const config = SECTION_CONFIG[section] || { label: section, icon: "•", color: "#94a3b8", path: () => "/" };

                    return (
                      <div key={section} style={{ marginBottom: "1rem" }}>
                        {/* כותרת קטגוריה */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.1em", color: config.color, fontWeight: 700 }}>
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                          <span style={{ flex: 1, height: "1px", background: `${config.color}22` }} />
                        </div>

                        {list.map((item) => (
                          <button
                            key={item._id}
                            onClick={() => handleSelect(config.path(item), query.trim())}
                            style={{ width: "100%", textAlign: "right", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.9rem 1rem", borderRadius: "1rem", border: "1px solid rgba(148,163,184,0.08)", background: "rgba(255,255,255,0.02)", color: "#e2e8f0", cursor: "pointer", transition: "all 0.2s ease" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = `${config.color}12`; e.currentTarget.style.borderColor = `${config.color}44`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(148,163,184,0.08)"; }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                              <div style={{ width: "34px", height: "34px", borderRadius: section === "users" ? "50%" : "0.8rem", background: `${config.color}18`, border: `1px solid ${config.color}33`, display: "flex", alignItems: "center", justifyContent: "center", color: config.color, fontSize: "1rem", flexShrink: 0 }}>
                                {section === "users" ? (item.firstName?.[0]?.toUpperCase() || "◐") : config.icon}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: "0.95rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.title || item.username}
                                </div>
                                {(item.company || item.location || item.category) && (
                                  <div style={{ fontSize: "0.78rem", color: "rgba(148,163,184,0.6)", marginTop: "0.25rem" }}>
                                    {item.company && `🏢 ${item.company}`}
                                    {item.location && ` · 📍 ${item.location}`}
                                    {item.category && ` · #${item.category}`}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span style={{ color: config.color, fontSize: "0.95rem", opacity: 0.6 }}>←</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}