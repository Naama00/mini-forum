import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="max-w-7xl mx-auto px-6 rtl" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8 rtl animate-fade-in">
        <div>
          <p className="font-mono text-xs tracking-widest text-cyan-500 uppercase mb-2.5">// התראות</p>
          <h1 className="text-3xl font-black text-white flex items-center gap-3.5 flex-wrap">
            ההתראות <span className="text-cyan-500">שלך</span>
            {unread > 0 && <span className="text-xs font-semibold bg-rose-500/15 border border-rose-500/40 text-rose-500 px-3 py-0.75 tracking-wide">{unread} חדשות</span>}
          </h1>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          {unread > 0 && (
            <button className="bg-transparent border border-white/10 text-slate-200/50 font-sans text-xs font-semibold px-4 py-2 cursor-pointer transition-all whitespace-nowrap hover:border-cyan-500/40 hover:text-cyan-500" onClick={markAllRead}>
              ✓ סמן הכל כנקרא
            </button>
          )}
          {notifications.length > 0 && (
            <button className="bg-transparent border border-white/10 text-slate-200/50 font-sans text-xs font-semibold px-4 py-2 cursor-pointer transition-all whitespace-nowrap hover:border-rose-500/40 hover:text-rose-500" onClick={deleteAll}>
              🗑 מחק הכל
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap mb-5 rtl">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`flex items-center gap-1 px-3.5 py-1.5 bg-white/3 border border-white/8 text-slate-200/45 font-sans text-xs font-semibold cursor-pointer transition-all ${filter === f ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500/30 hover:text-slate-200/80"}`}
            onClick={() => setFilter(f)}
          >
            {f !== "all" && f !== "unread" && <span>{TYPE_ICON[f]}</span>}
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 rtl">
        <div className="flex-1 h-px bg-cyan-500/10" />
        <span className="font-mono text-xs tracking-wide text-cyan-500/50">// {filtered.length} התראות</span>
        <div className="flex-1 h-px bg-cyan-500/10" />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20"><div className="text-4xl animate-spin">⏳</div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600 text-sm"><div className="text-4xl mb-3 opacity-30">🔔</div>אין התראות להצגה</div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {filtered.map((n, i) => (
            <Link
              key={n._id}
              to={notifLink(n)}
              className={`flex items-center gap-4 px-5 py-4 bg-white/2 border border-white/5 no-underline text-inherit transition-all relative animate-fade-in rtl group ${n.read ? "" : "bg-cyan-500/3 border-cyan-500/10"}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => !n.read && markRead(n._id)}
            >
              <div className="absolute right-0 top-0 bottom-0 w-0.75 bg-cyan-500 scale-y-0 transition-transform group-hover:scale-y-100" />
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {n.sender?.avatar || n.sender?.icon ? (
                  <img src={n.sender.avatar || n.sender.icon} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full text-sm bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 flex items-center justify-center font-bold">
                    {n.sender?.firstName?.[0]?.toUpperCase() || n.sender?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="absolute -bottom-1 -left-1 w-5 h-5 bg-gray-900 border border-white/10 rounded-full flex items-center justify-center text-xs leading-none">{TYPE_ICON[n.type]}</span>
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0 rtl">
                <div className="text-sm text-white mb-1">
                  <strong>{n.sender?.firstName || n.sender?.username}</strong>
                  {" "}{TYPE_TEXT[n.type]}
                  {n.text && (
                    <span className="text-gray-400"> — "{n.text.slice(0, 60)}{n.text.length > 60 ? "..." : ""}"</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 bg-white/4 border border-white/6 text-gray-400">{TYPE_LABEL[n.type]}</span>
                  <span className="text-xs text-gray-600 font-mono">{timeAgo(n.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.read && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
                <button className="bg-none border-none text-gray-400 cursor-pointer text-lg leading-none transition-colors hover:text-rose-500" onClick={(e) => deleteOne(n._id, e)} title="מחק">×</button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10 rtl">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 bg-white/3 border border-white/8 text-gray-400 font-sans text-sm font-semibold cursor-pointer transition-all ${p === page ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500 hover:text-cyan-500"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}