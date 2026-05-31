import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SECTION_CONFIG = {
  articles: { label: "מאמרים",  icon: "◎", path: (r) => `/articles/${r._id}` },
  events:   { label: "אירועים", icon: "◆", path: (r) => `/events/${r._id}` },
  jobs:     { label: "משרות",   icon: "◇", path: (r) => `/jobs/${r._id}` },
  topics:   { label: "פורום",   icon: "⬡", path: (r) => `/category?topicId=${r._id}` },
  users:    { label: "משתמשים", icon: "◐", path: (r) => `/profile/${r._id}` },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "היום";
  if (days < 30) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString("he-IL");
}

/* ── Tab Button ── */
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.4rem 0.9rem",
        borderRadius: "0.625rem",
        border: `1px solid ${active ? "rgba(0,229,255,0.3)" : "var(--surface-border)"}`,
        background: active ? "rgba(0,229,255,0.07)" : "rgba(10,12,22,0.3)",
        color: active ? "var(--accent-cyan)" : "var(--text-muted)",
        fontSize: "0.75rem",
        fontWeight: 700,
        fontFamily: "'Assistant', sans-serif",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 0 14px rgba(0,229,255,0.1)" : "none",
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.borderColor = "var(--surface-border-strong)";
          e.currentTarget.style.color       = "#e2e8f0";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.borderColor = "var(--surface-border)";
          e.currentTarget.style.color       = "var(--text-muted)";
        }
      }}
    >
      {children}
    </button>
  );
}

/* ── Result Card ── */
function ResultCard({ item, section, config }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={config.path(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "1rem 1.25rem",
        borderRadius: "1rem",
        border: `1px solid ${hovered ? "rgba(0,229,255,0.2)" : "var(--surface-border)"}`,
        background: hovered
          ? "rgba(15,23,42,0.55)"
          : "rgba(10,12,22,0.3)",
        textDecoration: "none",
        transition: "all 0.25s ease",
        boxShadow: hovered
          ? "0 8px 32px rgba(0,0,0,0.35), 0 0 16px rgba(0,229,255,0.05)"
          : "none",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      {/* ── צד ימין: אייקון + תוכן ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", minWidth: 0, flex: 1 }}>
        {/* אייקון / אווטאר */}
        {section === "users" ? (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: hovered ? "var(--accent-cyan)" : "rgba(0,229,255,0.07)",
              border: "1px solid rgba(0,229,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 800,
              color: hovered ? "#0a0c16" : "var(--accent-cyan)",
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
          >
            {item.firstName?.[0]?.toUpperCase() || "◐"}
          </div>
        ) : (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "0.625rem",
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${hovered ? "rgba(0,229,255,0.15)" : "var(--surface-border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
              color: hovered ? "var(--accent-cyan)" : "var(--text-muted)",
              transition: "all 0.2s ease",
            }}
          >
            {config.icon}
          </div>
        )}

        {/* מידע */}
        <div style={{ minWidth: 0 }}>
          {section === "users" ? (
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: hovered ? "var(--accent-cyan)" : "#e2e8f0",
                transition: "color 0.2s",
              }}
            >
              {item.firstName} {item.lastName || ""}{" "}
              <span
                style={{
                  fontFamily: "Assistant",
                  fontSize: "11px",
                  color: "rgba(148,163,184,0.45)",
                  marginRight: "0.25rem",
                }}
              >
                @{item.username}
              </span>
            </div>
          ) : (
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: hovered ? "var(--accent-cyan)" : "#e2e8f0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                transition: "color 0.2s",
              }}
            >
              {item.title || item.username}
            </div>
          )}

          {/* תגיות / meta */}
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              alignItems: "center",
              marginTop: "0.3rem",
            }}
          >
            {item.company && (
              <span className="tag-chip" style={{ fontSize: "11px", padding: "2px 8px" }}>
                🏢 {item.company}
              </span>
            )}
            {item.location && (
              <span className="tag-chip" style={{ fontSize: "11px", padding: "2px 8px" }}>
                📍 {item.location}
              </span>
            )}
            {item.category && (
              <span
                style={{
                  fontFamily: "Assistant",
                  fontSize: "11px",
                  color: "rgba(0,229,255,0.6)",
                  fontWeight: 700,
                }}
              >
                #{item.category}
              </span>
            )}
            {item.tags?.slice(0, 3).map((t) => (
              <span
                key={t}
                style={{ fontFamily: "Assistant", fontSize: "11px", color: "rgba(148,163,184,0.4)" }}
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── צד שמאל: תאריך + חץ ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexShrink: 0,
        }}
      >
        {item.createdAt && (
          <span
            style={{
              fontFamily: "Assistant",
              fontSize: "11px",
              color: "rgba(148,163,184,0.35)",
            }}
          >
            {timeAgo(item.createdAt)}
          </span>
        )}
        <span
          style={{
            fontFamily: "Assistant",
            fontSize: "14px",
            color: hovered ? "var(--accent-cyan)" : "rgba(148,163,184,0.2)",
            transform: hovered ? "translateX(-3px)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          ←
        </span>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setActiveTab("all");
    fetch(`${API}/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results || {}))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [query]);

  const totalCount = results
    ? Object.values(results).reduce((a, c) => a + (c?.length || 0), 0)
    : 0;

  if (!query) {
    return (
      <div className="page-shell">
        <div className="page-bg">
          <div className="page-bg-blob page-bg-blob--cyan" />
          <div className="page-bg-blob page-bg-blob--violet" />
          <div className="page-bg-grid" />
        </div>
        <div
          className="page-container"
          dir="rtl"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}
        >
          <div className="glass-card glass-card-lg" style={{ textAlign: "center", maxWidth: "420px", width: "100%" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.5 }}>⌕</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              הזן מילת מפתח בשורת החיפוש כדי להציג תוצאות.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell" dir="rtl" style={{ fontFamily: "'Assistant', sans-serif" }}>
      {/* רקע */}
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="page-container" style={{ maxWidth: "900px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* ── כותרת ── */}
          <div className="page-header" style={{ borderBottom: "1px solid var(--surface-border)", paddingBottom: "1.5rem" }}>
            <p
              style={{
                fontFamily: "Assistant",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(0,229,255,0.45)",
                marginBottom: "0.5rem",
              }}
            >
              // תוצאות סריקה גלובלית
            </p>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "0.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              תוצאות עבור:{" "}
              <span className="text-gradient">"{query}"</span>
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              נמצאו{" "}
              <span
                style={{
                  fontFamily: "Assistant",
                  color: "var(--accent-cyan)",
                  fontWeight: 700,
                }}
              >
                {totalCount}
              </span>{" "}
              רשומות רלוונטיות.
            </p>
          </div>

          {/* ── טאבים ── */}
          {results && totalCount > 0 && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                paddingBottom: "0.25rem",
                borderBottom: "1px solid var(--surface-border)",
              }}
            >
              <TabBtn active={activeTab === "all"} onClick={() => setActiveTab("all")}>
                הכל ({totalCount})
              </TabBtn>
              {Object.keys(results).map((key) => {
                const count = results[key]?.length || 0;
                if (!count) return null;
                return (
                  <TabBtn key={key} active={activeTab === key} onClick={() => setActiveTab(key)}>
                    {SECTION_CONFIG[key]?.label || key} ({count})
                  </TabBtn>
                );
              })}
            </div>
          )}

          {/* ── מצבים: טעינה / ריק / תוצאות ── */}
          {loading ? (
            <div style={{ padding: "5rem 0", textAlign: "center" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "3px solid rgba(0,229,255,0.15)",
                  borderTopColor: "var(--accent-cyan)",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 1rem",
                }}
              />
              <p style={{ fontFamily: "Assistant", fontSize: "12px", color: "rgba(148,163,184,0.4)" }}>
                // מעבד רשומות...
              </p>
            </div>
          ) : totalCount === 0 ? (
            <div className="card-empty">
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.35 }}>📭</div>
              <h3 style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: "0.5rem" }}>אין תוצאות תואמות</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", maxWidth: "320px", margin: "0 auto" }}>
                לא הצלחנו למצוא מידע תואם. נסה ביטויים חלופיים.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {Object.keys(results).map((section) => {
                const list = results[section] || [];
                if (!list.length) return null;
                if (activeTab !== "all" && activeTab !== section) return null;
                const config = SECTION_CONFIG[section] || { label: section, icon: "•", path: () => "/" };

                return (
                  <div key={section} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {/* כותרת סקציה */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontFamily: "Assistant",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(0,229,255,0.5)",
                        fontWeight: 700,
                      }}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label} ({list.length})</span>
                      <span
                        style={{
                          flex: 1,
                          height: "1px",
                          background: "linear-gradient(to left, rgba(0,229,255,0.15), transparent)",
                        }}
                      />
                    </div>

                    {/* כרטיסי תוצאות */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {list.map((item) => (
                        <ResultCard key={item._id} item={item} section={section} config={config} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
