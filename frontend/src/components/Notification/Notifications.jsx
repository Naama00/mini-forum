import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getToken } from "../../utils/storage";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TYPE_ICON  = { comment: "⬡", like: "◆", attend: "◎", message: "◇" };
const TYPE_LABEL = { comment: "תגובה", like: "לייק", attend: "הרשמה", message: "הודעה" };
const TYPE_TEXT  = {
  comment: "הגיב/ה על התוכן שלך",
  like:    "עשה/תה לייק לתוכן שלך",
  attend:  "נרשם/ה לאירוע שלך",
  message: "שלח/ה לך הודעה פרטית",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString("he-IL");
}

function notifLink(n) {
  if (n.type === "message") return "#";
  if (!n.refModel || !n.refId) return "#";
  const map = { Article: "articles", Event: "events", Job: "jobs" };
  return `/${map[n.refModel]}/${n.refId}`;
}

/* ── Tab button ── */
function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.4rem 0.85rem",
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
        boxShadow: active ? "0 0 14px rgba(0,229,255,0.08)" : "none",
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.borderColor = "var(--surface-border-strong)";
          e.currentTarget.style.color = "#e2e8f0";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.borderColor = "var(--surface-border)";
          e.currentTarget.style.color = "var(--text-muted)";
        }
      }}
    >
      {children}
    </button>
  );
}

/* ── כרטיס התראה ── */
function NotifCard({ n, onRead, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={notifLink(n)}
      onClick={onRead}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem 1.25rem",
        borderRadius: "1rem",
        border: `1px solid ${!n.read
          ? "rgba(0,229,255,0.18)"
          : hovered ? "var(--surface-border-strong)" : "var(--surface-border)"}`,
        background: !n.read
          ? (hovered ? "rgba(0,229,255,0.06)" : "rgba(0,229,255,0.03)")
          : (hovered ? "rgba(255,255,255,0.02)" : "rgba(10,12,22,0.25)"),
        textDecoration: "none",
        color: "inherit",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "0 6px 24px rgba(0,0,0,0.3)" : "none",
        position: "relative",
      }}
    >
      {/* אווטאר + בדג אייקון */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {n.sender?.avatar || n.sender?.icon ? (
          <img
            src={n.sender.avatar || n.sender.icon}
            alt=""
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "0.75rem",
              objectFit: "cover",
              border: "1px solid var(--surface-border)",
            }}
          />
        ) : (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "0.75rem",
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${hovered ? "rgba(0,229,255,0.2)" : "var(--surface-border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 800,
              color: hovered ? "var(--accent-cyan)" : "var(--text-muted)",
              transition: "all 0.2s",
            }}
          >
            {n.sender?.firstName?.[0]?.toUpperCase() ||
              n.sender?.username?.[0]?.toUpperCase() || "◐"}
          </div>
        )}
        {/* סמל סוג */}
        <span
          style={{
            position: "absolute",
            bottom: "-4px",
            left: "-4px",
            width: "18px",
            height: "18px",
            borderRadius: "0.375rem",
            background: "#0a0c16",
            border: "1px solid var(--surface-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            fontFamily: "Assistant, sans-serif",
            color: "var(--text-muted)",
          }}
        >
          {TYPE_ICON[n.type]}
        </span>
      </div>

      {/* גוף */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.875rem", color: "#cbd5e1", lineHeight: 1.5, marginBottom: "0.35rem" }}>
          <strong style={{ color: "#fff", fontWeight: 700 }}>
            {n.sender?.firstName || n.sender?.username}
          </strong>{" "}
          {TYPE_TEXT[n.type]}
          {n.text && (
            <span style={{ color: "rgba(148,163,184,0.4)", fontStyle: "italic" }}>
              {" "}— "{n.text.slice(0, 60)}{n.text.length > 60 ? "..." : ""}"
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="tag-chip" style={{ fontSize: "10px", padding: "1px 7px" }}>
            {TYPE_LABEL[n.type]}
          </span>
          <span style={{ fontFamily: "Assistant, sans-serif", fontSize: "11px", color: "rgba(148,163,184,0.35)" }}>
            {timeAgo(n.createdAt)}
          </span>
        </div>
      </div>

      {/* אינדיקטורים */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        {!n.read && (
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--accent-cyan)",
              boxShadow: "0 0 8px rgba(0,229,255,0.5)",
            }}
          />
        )}
        <button
          onClick={onDelete}
          style={{
            background: "none",
            border: "none",
            color: "rgba(148,163,184,0.25)",
            fontSize: "18px",
            lineHeight: 1,
            cursor: "pointer",
            padding: "0.1rem 0.25rem",
            borderRadius: "0.375rem",
            transition: "all 0.15s",
            fontWeight: 300,
          }}
          title="מחק"
          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.07)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(148,163,184,0.25)"; e.currentTarget.style.background = "none"; }}
        >
          ×
        </button>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore]       = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const token  = getToken();
  const loadMoreRef = useRef(null);
  const socketRef = useRef(null);
  const SERVER_URL = API.replace(/\/api\/?$/, '');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchNotifications(page);
  }, [page, token]);

  useEffect(() => {
    if (!token) return;

    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      auth: { token },
      autoConnect: true,
    });

    socket.on('connect_error', (error) => {
      console.warn('Notifications socket connect error:', error.message);
    });

    socket.on('authenticated', () => {
      console.debug('Notifications socket authenticated');
    });

    socket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnread((prev) => prev + 1);
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [SERVER_URL, token]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isFetchingMore) {
          setPage((current) => Math.min(current + 1, totalPages));
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 120px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, isFetchingMore, totalPages]);

  const fetchNotifications = async (requestedPage = 1) => {
    if (!token) return;
    if (requestedPage === 1) {
      setLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const res  = await fetch(`${API}/notifications?page=${requestedPage}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications((prev) =>
        requestedPage === 1
          ? data.notifications || []
          : [...prev, ...(data.notifications || [])]
      );
      setUnread(data.unreadCount || 0);
      setTotalPages(data.pages || 1);
      setHasMore(requestedPage < (data.pages || 1));
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((p) => p.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((p) =>
        p.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnread((p) => Math.max(0, p - 1));
    } catch {}
  };

  const deleteOne = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`${API}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((p) => p.filter((n) => n._id !== id));
    } catch {}
  };

  const deleteAll = async () => {
    if (!confirm("למחוק את כל ההתראות?")) return;
    try {
      await fetch(`${API}/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      setUnread(0);
    } catch {}
  };

  const FILTERS       = ["all", "unread", "comment", "like", "attend", "message"];
  const FILTER_LABELS = { all: "הכל", unread: "לא נקרא", comment: "תגובות", like: "לייקים", attend: "הרשמות", message: "הודעות" };

  const filtered = notifications.filter((n) => {
    if (filter === "all")    return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  return (
    <div
      className="page-shell"
      dir="rtl"
      style={{ fontFamily: "'Assistant', sans-serif" }}
    >
      {/* רקע */}
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="page-container" style={{ maxWidth: "860px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* ── כותרת ── */}
          <div
            className="page-header"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              borderBottom: "1px solid var(--surface-border)",
              paddingBottom: "1.5rem",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "Assistant, sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(0,229,255,0.45)",
                  marginBottom: "0.5rem",
                }}
              >
                // NOTIFICATION LOG
              </p>
              <h1
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                ההתראות{" "}
                <span className="text-gradient">שלך</span>
                {unread > 0 && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      background: "rgba(0,229,255,0.08)",
                      border: "1px solid rgba(0,229,255,0.25)",
                      color: "var(--accent-cyan)",
                      padding: "3px 10px",
                      borderRadius: "9999px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontFamily: "Assistant, sans-serif",
                    }}
                  >
                    {unread} חדשות
                  </span>
                )}
              </h1>
            </div>

            {/* כפתורי פעולה */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              {unread > 0 && (
                <button
                  className="button-secondary"
                  onClick={markAllRead}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", borderRadius: "0.75rem" }}
                >
                  ✓ סמן הכל כנקרא
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={deleteAll}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.8rem",
                    borderRadius: "0.75rem",
                    border: "1px solid var(--surface-border)",
                    background: "rgba(10,12,22,0.3)",
                    color: "rgba(148,163,184,0.5)",
                    cursor: "pointer",
                    fontFamily: "'Assistant', sans-serif",
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(148,163,184,0.5)"; e.currentTarget.style.borderColor = "var(--surface-border)"; }}
                >
                  מחק הכל
                </button>
              )}
            </div>
          </div>

          {/* ── פילטרים ── */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <FilterBtn key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f !== "all" && f !== "unread" && (
                  <span style={{ fontFamily: "Assistant, sans-serif", fontSize: "10px" }}>{TYPE_ICON[f]}</span>
                )}
                {FILTER_LABELS[f]}
              </FilterBtn>
            ))}
          </div>

          {/* מפריד */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(0,229,255,0.1))" }} />
            <span style={{ fontFamily: "Assistant, sans-serif", fontSize: "10px", color: "rgba(148,163,184,0.3)", letterSpacing: "0.1em" }}>
              // {filtered.length} רשומות
            </span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(0,229,255,0.1))" }} />
          </div>

          {/* ── רשימה ── */}
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
              <p style={{ fontFamily: "Assistant, sans-serif", fontSize: "12px", color: "rgba(148,163,184,0.35)" }}>
                // מושך נתונים...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-empty">
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.3, fontFamily: "Assistant, sans-serif" }}>◐</div>
              <h3 style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: "0.5rem" }}>
                {filter === "unread" ? "אין התראות שלא נקראו" : "אין התראות בקטגוריה זו"}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                // no stream notifications active
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {filtered.map((n) => (
                <NotifCard
                  key={n._id}
                  n={n}
                  onRead={() => !n.read && markRead(n._id)}
                  onDelete={(e) => deleteOne(n._id, e)}
                />
              ))}
            </div>
          )}

          {/* ── עימוד ── */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginTop: "1rem" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "0.625rem",
                    border: `1px solid ${p === page ? "rgba(0,229,255,0.3)" : "var(--surface-border)"}`,
                    background: p === page ? "rgba(0,229,255,0.07)" : "rgba(10,12,22,0.3)",
                    color: p === page ? "var(--accent-cyan)" : "var(--text-muted)",
                    fontFamily: "Assistant, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div ref={loadMoreRef} style={{ height: "1px", width: "100%" }} />
          {isFetchingMore && (
            <div style={{ padding: "1rem 0", textAlign: "center", color: "rgba(148,163,184,0.6)" }}>
              טוען עוד התראות...
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}