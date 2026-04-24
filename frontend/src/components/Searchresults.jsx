import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../css/SearchResults.css";

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
    <div className="main" dir="rtl">
      {/* Header */}
      <div className="search-page-header">
        <p className="search-section-label">// חיפוש גלובלי</p>
        <h1 className="search-page-title">
          תוצאות עבור <span>"{q}"</span>
        </h1>
        {!loading && results && (
          <p className="search-page-sub">נמצאו {total} תוצאות</p>
        )}
      </div>

      {/* Filter tabs */}
      {results && (
        <div className="search-filters">
          <button
            className={`search-filter-btn${activeType === "all" ? " active" : ""}`}
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
                className={`search-filter-btn${activeType === key ? " active" : ""}`}
                onClick={() => setActiveType(key)}
              >
                {config.icon} {config.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="search-divider">
        <div className="search-divider-line" />
        <span className="search-divider-text">// תוצאות</span>
        <div className="search-divider-line" />
      </div>

      {loading ? (
        <div className="state-center"><div className="big-spinner" /></div>
      ) : !hasResults ? (
        <div className="empty-box">
          <div className="empty-icon">🔍</div>
          לא נמצאו תוצאות עבור "{q}"
        </div>
      ) : (
        <div className="search-results">
          {filteredSections.map(([key, config]) => {
            const items = results[key];
            if (!items?.length) return null;
            return (
              <div key={key} className="search-section">
                <div className="search-section-header">
                  <span className="search-section-icon">{config.icon}</span>
                  <span className="search-section-label-text">{config.label}</span>
                  <span className="search-section-count">{items.length}</span>
                </div>

                <div className="search-section-list">
                  {items.map((item) => (
                    <Link key={item._id} to={config.path(item)} className="search-result-row">
                      {key === "users" ? (
                        <>
                          <div className="search-user-avatar">
                            {item.icon || item.avatar
                              ? <img src={item.icon || item.avatar} alt="" className="avatar-img" style={{ width: 40, height: 40 }} />
                              : <div className="avatar-initials" style={{ width: 40, height: 40, fontSize: 16, background: "rgba(0,229,255,0.1)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.3)" }}>
                                  {item.firstName?.[0] || item.username?.[0] || "?"}
                                </div>
                            }
                          </div>
                          <div className="search-result-body">
                            <span className="search-result-title">{item.firstName} {item.lastName}</span>
                            <span className="search-result-sub">@{item.username}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="search-result-body">
                            <span className="search-result-title">{item.title}</span>
                            <div className="search-result-meta">
                              {item.company && <span className="search-meta-tag">🏢 {item.company}</span>}
                              {item.location && <span className="search-meta-tag">📍 {item.location}</span>}
                              {item.category && <span className="search-meta-tag">#{item.category}</span>}
                              {item.tags?.slice(0, 2).map(t => (
                                <span key={t} className="search-meta-tag">#{t}</span>
                              ))}
                              {item.createdAt && <span className="search-meta-time">{timeAgo(item.createdAt)}</span>}
                            </div>
                          </div>
                          <span className="search-result-arrow">←</span>
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