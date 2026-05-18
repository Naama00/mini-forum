import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../utils/storage";

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
  const [filter, setFilter]       = useState("all");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token   = getToken();
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
    <div className="relative min-h-screen overflow-hidden text-[#e2e8f0] pb-20" dir="rtl">
      {/* Background Layers */}
      <div className="dh-grid-bg" />
      <div className="ambient-glow -top-20 -left-20" />
      <div className="ambient-glow bottom-0 right-0 opacity-50" />

      <div className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="font-mono text-[10px] tracking-[3px] text-[#ccff00] uppercase mb-2">// TERMINAL NOTIFICATIONS</p>
            <h1 className="text-3xl font-black text-white flex items-center gap-3 flex-wrap">
              ההתראות <span className="text-[#ccff00] italic">שלך</span>
              {unread > 0 && (
                <span className="text-[10px] font-bold bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] px-3 py-1 rounded-full uppercase tracking-wider live-pulse">
                  {unread} NEW_DATA
                </span>
              )}
            </h1>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            {unread > 0 && (
              <button className="px-4 py-2 border border-white/5 bg-white/5 rounded-xl text-xs font-bold text-slate-300 hover:text-[#ccff00] hover:border-[#ccff00]/30 transition-all" onClick={markAllRead}>
                ✓ סמן הכל כנקרא
              </button>
            )}
            {notifications.length > 0 && (
              <button className="px-4 py-2 border border-white/5 bg-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all" onClick={deleteAll}>
                🗑 מחק הכל
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-sans text-xs font-bold transition-all ${filter === f ? "bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]" : "bg-white/3 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"}`}
              onClick={() => setFilter(f)}
            >
              {f !== "all" && f !== "unread" && <span>{TYPE_ICON[f]}</span>}
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#ccff001a] to-transparent" />
          <span className="font-mono text-[10px] tracking-widest text-slate-500">// {filtered.length} LOGS FOUND</span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#ccff001a] to-transparent" />
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-20 text-[#ccff00] animate-pulse font-mono uppercase tracking-tighter text-sm">Querying Database...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl text-slate-500 text-sm">
            <div className="text-3xl mb-3 opacity-40">🔔</div>
            <span className="font-mono uppercase tracking-wider">No stream notifications active</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((n, i) => (
              <Link
                key={n._id}
                to={notifLink(n)}
                className={`glass-card flex items-center gap-5 px-6 py-4 rounded-2xl no-underline text-inherit transition-all relative group ${!n.read ? "ring-1 ring-[#ccff00]/30 bg-[#ccff00]/3" : ""}`}
                onClick={() => !n.read && markRead(n._id)}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {n.sender?.avatar || n.sender?.icon ? (
                    <img src={n.sender.avatar || n.sender.icon} alt="" className="w-11 h-11 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl text-sm bg-white/5 text-white border border-white/10 flex items-center justify-center font-bold group-hover:border-[#ccff00]/40 group-hover:text-[#ccff00] transition-colors">
                      {n.sender?.firstName?.[0]?.toUpperCase() || n.sender?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -left-1 w-5 h-5 bg-[#0a0a0c] border border-white/10 rounded-md flex items-center justify-center text-xs shadow-md">{TYPE_ICON[n.type]}</span>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-300 mb-1 leading-relaxed">
                    <strong className="text-white font-bold">{n.sender?.firstName || n.sender?.username}</strong>
                    {" "}{TYPE_TEXT[n.type]}
                    {n.text && (
                      <span className="text-slate-500 font-light italic"> — "{n.text.slice(0, 60)}{n.text.length > 60 ? "..." : ""}"</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-white/5 border border-white/5 text-slate-400 uppercase rounded">{TYPE_LABEL[n.type]}</span>
                    <span className="text-xs text-slate-500 font-mono">{timeAgo(n.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#ccff00] live-pulse" />}
                  <button className="bg-transparent border-none text-slate-600 hover:text-rose-400 cursor-pointer text-xl font-light transition-colors p-1" onClick={(e) => deleteOne(n._id, e)} title="מחק">×</button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl border text-xs font-mono font-bold transition-all ${p === page ? "bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]" : "bg-white/3 border-white/5 text-slate-500 hover:border-[#ccff00]/30 hover:text-[#ccff00]"}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}