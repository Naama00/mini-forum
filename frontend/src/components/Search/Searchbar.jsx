import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
      className="relative w-full max-w-full"
      ref={dropdownRef}
      dir="rtl"
      style={{ fontFamily: "'Assistant', sans-serif" }}
    >
      {/* ── שדה חיפוש ── */}
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="חיפוש מאמרים, משרות, פורומים..."
          style={{
            width: "100%",
            background: "rgba(10, 12, 22, 0.6)",
            border: "1px solid var(--surface-border)",
            borderRadius: "0.875rem",
            padding: "0.6rem 2.5rem 0.6rem 1rem",
            color: "#e2e8f0",
            fontSize: "0.875rem",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            backdropFilter: "blur(12px)",
          }}
          onFocus={e => {
            setOpen(true);
            e.target.style.borderColor = "rgba(0,229,255,0.5)";
            e.target.style.boxShadow   = "0 0 0 3px rgba(0,229,255,0.08), 0 0 18px rgba(0,229,255,0.12)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "var(--surface-border)";
            e.target.style.boxShadow   = "none";
          }}
        />
        {/* אייקון ימין */}
        <span
          style={{
            position: "absolute",
            right: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: loading ? "var(--accent-cyan)" : "rgba(148,163,184,0.5)",
            fontSize: "0.85rem",
            pointerEvents: "none",
            transition: "color 0.2s",
            fontFamily: "Assistant",
          }}
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "2rem 1rem 1rem",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(7, 8, 14, 0.85)",
              backdropFilter: "blur(20px)",
            }}
            onClick={() => setOpen(false)}
          />

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "750px",
              minHeight: "420px",
              borderRadius: "1.5rem",
              border: "1px solid rgba(148,163,184,0.12)",
              background: "rgba(10, 12, 22, 0.95)",
              boxShadow: "0 40px 120px rgba(0, 0, 0, 0.45)",
              overflow: "hidden",
              pointerEvents: "auto",
            }}
          >
            <div style={{ padding: "1.25rem 1.5rem 1rem" }}>
              <div style={{ position: "relative", marginBottom: "1rem" }}>
                <input
                  ref={overlayInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="הכנס מילת חיפוש..."
                  style={{
                    width: "100%",
                    minHeight: "3.5rem",
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(148,163,184,0.18)",
                    borderRadius: "1rem",
                    padding: "1rem 3rem 1rem 1.25rem",
                    color: "#e2e8f0",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: loading ? "var(--accent-cyan)" : "rgba(148,163,184,0.55)",
                    fontSize: "1rem",
                    pointerEvents: "none",
                  }}
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
                            color: "rgba(0,229,255,0.55)",
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
                              e.currentTarget.style.background = "rgba(0,229,255,0.08)";
                              e.currentTarget.style.borderColor = "rgba(0,229,255,0.18)";
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
                                  color: "var(--accent-cyan)",
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
