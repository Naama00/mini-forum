import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL as API } from "../../utils/constants";

const SECTION_CONFIG = {
  articles: { label: "מאמרים",  icon: "◎", path: (r) => `/articles/${r._id}` },
  events:   { label: "אירועים", icon: "◆", path: (r) => `/events/${r._id}` },
  jobs:     { label: "משרות",   icon: "◇", path: (r) => `/jobs/${r._id}` },
  topics:   { label: "פורום",   icon: "⬡", path: (r) => `/category?topicId=${r._id}` },
  users:    { label: "משתמשים", icon: "◐", path: (r) => `/profile/${r._id}` },
};

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function SearchBar() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [total, setTotal]     = useState(0);
  const [error, setError]     = useState("");
  const dropdownRef           = useRef(null);
  const overlayInputRef      = useRef(null);
  const navigate              = useNavigate();

  const fetchResults = useCallback(
    debounce(async (q) => {
      const cleanQuery = q.trim();
      if (cleanQuery.length < 2) {
        setResults(null);
        setTotal(0);
        setError(cleanQuery.length === 1 ? 'הכנס לפחות 2 תווים' : '');
        setLoading(false);
        return;
      }

      try {
        const res  = await fetch(`${API}/search?q=${encodeURIComponent(cleanQuery)}&limit=20`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'שגיאת חיפוש');
          setResults(null);
          setTotal(0);
          return;
        }

        setResults(data.results || {});
        setTotal(data.total || 0);
        setError('');
      } catch (err) {
        console.error("Search error:", err);
        setError('שגיאת רשת. נסה שוב');
        setResults(null);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults(null);
      setTotal(0);
      setLoading(false);
      setError("");
      return;
    }

    if (trimmed.length < 2) {
      setResults(null);
      setTotal(0);
      setLoading(false);
      setError('הכנס לפחות 2 תווים');
      return;
    }

    setLoading(true);
    setError("");
    fetchResults(trimmed);
  }, [query, fetchResults]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open && overlayInputRef.current) {
      overlayInputRef.current.focus();
    }
  }, [open]);

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
    <div
      ref={dropdownRef}
      dir="rtl"
      className="relative w-full max-w-full font-body"
    >
      {/* ── שדה חיפוש ── */}
      <div className="relative group search-futuristic">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="חיפוש מאמרים, משרות, פורומים..."
          className="w-full rounded-xl border border-white/10 bg-dark-950/70 py-2.5 pr-10 pl-4 text-sm text-dark-100 outline-none transition-all duration-250 backdrop-blur-md placeholder:text-dark-500 focus:border-neon-lime/45 focus:shadow-[0_0_0_3px_rgba(204,255,0,0.08),0_0_20px_rgba(204,255,0,0.12)]"
          onFocus={() => setOpen(true)}
        />
        {/* אייקון ימין */}
        <span
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm font-mono transition-colors ${loading ? 'text-neon-lime' : 'text-dark-500'}`}
        >
          {loading ? (
            <svg
              style={{ animation: "spin 0.8s linear infinite", width: "14px", height: "14px", display: "block" }}
              viewBox="0 0 24 24" fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : "⌕"}
        </span>
      </div>

      {/* ── לוח תוצאות צף ── */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-8 pointer-events-none">
          <div
            className="absolute inset-0 bg-transparent backdrop-blur-2xl"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-[750px] min-h-[420px] rounded-3xl border border-white/10 shadow-2xl shadow-glow-lime overflow-hidden pointer-events-auto glass-card-futuristic"
               style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
            <div style={{ padding: "1.25rem 1.5rem 1rem" }}>
              <div style={{ position: "relative", marginBottom: "1rem" }}>
                <input
                  ref={overlayInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="הכנס מילת חיפוש..."
                  className="input-futuristic min-h-14 pr-12 text-base"
                />
                <span
                  className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-base font-mono ${loading ? 'text-neon-lime' : 'text-dark-500'}`}
                >
                  {loading ? (
                    <svg
                      style={{ animation: "spin 0.8s linear infinite", width: "18px", height: "18px", display: "block" }}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : "⌕"}
                </span>
              </div>

              {error ? (
                <div
                  style={{
                    padding: "1rem 1rem",
                    borderRadius: "1rem",
                    background: "rgba(220,38,38,0.08)",
                    color: "#f8d7da",
                    fontSize: "0.95rem",
                    border: "1px solid rgba(248,113,113,0.2)",
                  }}
                >
                  {error}
                </div>
              ) : loading ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "rgba(148,163,184,0.8)",
                    fontSize: "0.95rem",
                  }}
                >
                  מחפש תוצאות...
                </div>
              ) : (!results || total === 0) ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "rgba(148,163,184,0.7)",
                    fontSize: "0.95rem",
                  }}
                >
                  לא נמצאו תוצאות עבור "{query.trim()}"
                </div>
              ) : (
                <div style={{ maxHeight: "380px", overflowY: "auto", paddingRight: "0.25rem" }}>
                  {Object.keys(results).map((section) => {
                    const list   = results[section] || [];
                    if (!list.length) return null;
                    const config = SECTION_CONFIG[section] || { label: section, icon: "•", path: () => "/" };

                    return (
                      <div key={section} style={{ marginBottom: "1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.4rem 0.6rem",
                            fontFamily: "Assistant",
                            fontSize: "0.82rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "rgba(204,255,0,0.6)",
                            fontWeight: 700,
                          }}
                        >
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                          <span style={{ flex: 1, height: "1px", background: "rgba(148,163,184,0.12)" }} />
                        </div>

                        {list.map((item) => (
                          <button
                            key={item._id}
                            onClick={() => handleSelect(config.path(item))}
                            style={{
                              width: "100%",
                              textAlign: "right",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "1rem",
                              padding: "0.9rem 1rem",
                              borderRadius: "1rem",
                              border: "1px solid rgba(148,163,184,0.08)",
                              background: "rgba(255,255,255,0.02)",
                              color: "#e2e8f0",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(204,255,0,0.06)";
                              e.currentTarget.style.borderColor = "rgba(204,255,0,0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                              e.currentTarget.style.borderColor = "rgba(148,163,184,0.08)";
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: section === "users" ? "50%" : "0.8rem",
                                  background: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(148,163,184,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "var(--accent-lime)",
                                  fontSize: "1rem",
                                  flexShrink: 0,
                                }}
                              >
                                {section === "users" ? (item.firstName?.[0]?.toUpperCase() || "◐") : config.icon}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
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
                            <span style={{ color: "rgba(148,163,184,0.6)", fontSize: "0.95rem" }}>←</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
