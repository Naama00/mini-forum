import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Notifications.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TYPE_ICON  = { comment: "💬", like: "♥", attend: "📅", message: "✉️" };
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
  if (mins < 1) return "עכשיו";
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]       = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all"); // all | unread | comment | like | attend | message
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token   = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/notifications?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
      setTotalPages(data.pages || 1);
    } catch {}
    setLoading(false);
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((p) => p.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((p) => p.map((n) => n._id === id ? { ...n, read: true } : n));
      setUnread((p) => Math.max(0, p - 1));
    } catch {}
  };

  const deleteOne = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`${API}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((p) => p.filter((n) => n._id !== id));
    } catch {}
  };

  const deleteAll = async () => {
    if (!confirm("למחוק את כל ההתראות?")) return;
    try {
      await fetch(`${API}/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setUnread(0);
    } catch {}
  };

  const FILTERS = ["all", "unread", "comment", "like", "attend", "message"];
  const FILTER_LABELS = { all: "הכל", unread: "לא נקרא", comment: "תגובות", like: "לייקים", attend: "הרשמות", message: "הודעות" };

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  return (
    <div className="main" dir="rtl">
      {/* Header */}
      <div className="notif-page-header">
        <div>
          <p className="notif-section-label">// התראות</p>
          <h1 className="notif-page-title">
            ההתראות <span>שלך</span>
            {unread > 0 && <span className="notif-unread-badge">{unread} חדשות</span>}
          </h1>
        </div>
        <div className="notif-header-actions">
          {unread > 0 && (
            <button className="notif-action-btn" onClick={markAllRead}>
              ✓ סמן הכל כנקרא
            </button>
          )}
          {notifications.length > 0 && (
            <button className="notif-action-btn danger" onClick={deleteAll}>
              🗑 מחק הכל
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="notif-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`notif-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f !== "all" && f !== "unread" && <span>{TYPE_ICON[f]}</span>}
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="notif-divider">
        <div className="notif-divider-line" />
        <span className="notif-divider-text">// {filtered.length} התראות</span>
        <div className="notif-divider-line" />
      </div>

      {/* List */}
      {loading ? (
        <div className="state-center"><div className="big-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">🔔</div>
          אין התראות להצגה
        </div>
      ) : (
        <div className="notif-list">
          {filtered.map((n, i) => (
            <Link
              key={n._id}
              to={notifLink(n)}
              className={`notif-row${n.read ? "" : " unread"}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => !n.read && markRead(n._id)}
            >
              {/* Avatar */}
              <div className="notif-avatar">
                {n.sender?.avatar || n.sender?.icon ? (
                  <img src={n.sender.avatar || n.sender.icon} alt="" className="avatar-img" style={{ width: 40, height: 40 }} />
                ) : (
                  <div className="avatar-initials" style={{ width: 40, height: 40, fontSize: 16, background: "rgba(0,229,255,0.1)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.3)" }}>
                    {n.sender?.firstName?.[0]?.toUpperCase() || n.sender?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="notif-type-bubble">{TYPE_ICON[n.type]}</span>
              </div>

              {/* Body */}
              <div className="notif-row-body">
                <div className="notif-row-text">
                  <strong>{n.sender?.firstName || n.sender?.username}</strong>
                  {" "}{TYPE_TEXT[n.type]}
                  {n.text && (
                    <span className="notif-row-preview"> — "{n.text.slice(0, 60)}{n.text.length > 60 ? "..." : ""}"</span>
                  )}
                </div>
                <div className="notif-row-meta">
                  <span className="notif-type-tag">{TYPE_LABEL[n.type]}</span>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="notif-row-actions">
                {!n.read && <span className="notif-dot" />}
                <button className="notif-delete-btn" onClick={(e) => deleteOne(n._id, e)} title="מחק">×</button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="events-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`page-btn${p === page ? " active" : ""}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}