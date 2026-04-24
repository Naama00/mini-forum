import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/SearchBar.css";

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
    <div className="searchbar-wrap" ref={wrapRef} dir="rtl">
      <div className={`searchbar-input-wrap${open ? " active" : ""}`}>
        <span className="searchbar-icon">
          {loading ? <span className="searchbar-spinner" /> : "🔍"}
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results && setOpen(true)}
          placeholder="חיפוש גלובלי..."
          className="searchbar-input"
          autoComplete="off"
        />
        {query && (
          <button className="searchbar-clear" onClick={() => { setQuery(""); setResults(null); setOpen(false); }}>×</button>
        )}
      </div>

      {open && (
        <div className="searchbar-dropdown">
          {!hasResults ? (
            <div className="searchbar-empty">
              {loading ? "מחפש..." : `אין תוצאות עבור "${query}"`}
            </div>
          ) : (
            <>
              {Object.entries(SECTION_CONFIG).map(([key, config]) => {
                const items = results[key];
                if (!items?.length) return null;
                return (
                  <div key={key} className="searchbar-section">
                    <div className="searchbar-section-title">
                      <span>{config.icon}</span> {config.label}
                    </div>
                    {items.map((item) => (
                      <button
                        key={item._id}
                        className="searchbar-result-item"
                        onClick={() => handleResultClick(config.path(item))}
                      >
                        {key === "users" ? (
                          <div className="searchbar-user-result">
                            <div className="searchbar-user-avatar">
                              {item.icon || item.avatar
                                ? <img src={item.icon || item.avatar} alt="" />
                                : <span>{item.firstName?.[0] || item.username?.[0] || "?"}</span>
                              }
                            </div>
                            <span>{item.firstName} {item.lastName || ""} <small>@{item.username}</small></span>
                          </div>
                        ) : (
                          <div className="searchbar-text-result">
                            <span className="searchbar-result-title">
                              {item.title || item.username}
                            </span>
                            {(item.company || item.location || item.category) && (
                              <span className="searchbar-result-sub">
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

              <div className="searchbar-footer">
                <button onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setOpen(false); }}>
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