import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../utils/storage";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TYPE_ICON = {
    comment: "💬",
    like: "♥",
    attend: "📅",
    message: "✉️",
};

const TYPE_TEXT = {
    comment: "הגיב/ה על",
    like: "עשה/תה לייק ל",
    attend: "נרשם/ה לאירוע",
    message: "שלח/ה לך הודעה",
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "עכשיו";
    if (mins < 60) return `לפני ${mins} דק'`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `לפני ${hours} שע'`;
    const days = Math.floor(hours / 24);
    return `לפני ${days} ימים`;
}

function notifLink(n) {
    if (n.type === "message") return "/notifications";
    if (!n.refModel || !n.refId) return "/notifications";
    const map = { Article: "articles", Event: "events", Job: "jobs" };
    return `/${map[n.refModel]}/${n.refId}`;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropRef = useRef(null);
    const token = getToken();
    const navigate = useNavigate();

useEffect(() => {
  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token');
    
    // הגנה קריטית: אם המשתמש בכלל לא מחובר כרגע (אין טוקן), אל תפנה לשרת!
    if (!token) {
      console.log("אין טוקן ב-LocalStorage, מדלג על הבאת התראות");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/notifications/unread-count', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // שליחת הטוקן בצורה תקינה
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        console.warn("השרת החזיר 401 - הטוקן באמת פג תוקף. מנקה ומפנה ל-Auth.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');  
        navigate("/auth"); 
        return;
      }

      if (res.ok) {
        const data = await res.json();
        // כאן הקוד שלך שמעדכן את כמות ההתראות (למשל setUnreadCount(data.count))
      }

    } catch (err) {
      console.error("שגיאת רשת בניסיון להביא התראות:", err);
    }
  };

  fetchUnreadCount();
}, [navigate]); // ודאי ש-navigate נמצא במערך התלויות או הורידי אותו אם אין צורך

    // סגור dropdown בלחיצה מחוץ
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const openDropdown = async () => {
        console.log("נלחץ! open =", open);
        console.log("token =", token);
        if (!token) return navigate("/auth");

        const isOpening = !open;
        setOpen(isOpening);
        console.log("isOpening =", isOpening);
        if (isOpening) {
            setLoading(true);
            try {
                const res = await fetch(`${API}/notifications?limit=8`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnread(data.unreadCount || 0);
            } catch { }
            setLoading(false);
        }
    };

    const markAllRead = async (e) => {
        e.stopPropagation();
        try {
            await fetch(`${API}/notifications/read-all`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((p) => p.map((n) => ({ ...n, read: true })));
            setUnread(0);
        } catch { }
    };

    const markRead = async (id) => {
        try {
            await fetch(`${API}/notifications/${id}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((p) => p.map((n) => n._id === id ? { ...n, read: true } : n));
            setUnread((p) => Math.max(0, p - 1));
        } catch { }
    };

    if (!token) return null;

    return (
        <div className="relative z-50 rtl" ref={dropRef} dir="rtl">
            <button className="bg-none border-none cursor-pointer relative p-1.5 flex items-center transition-transform hover:scale-110" onClick={openDropdown} aria-label="התראות">
                <span className="text-5xl leading-none">🔔</span>
                {unread > 0 && (
                    <span className="absolute top-0 left-0 bg-rose-500 text-white font-sans text-xs font-bold min-w-4.5 h-4.5 rounded-full flex items-center justify-center px-1 border-2 border-gray-900 animate-bounce">{unread > 9 ? "9+" : unread}</span>
                )}
            </button>

            {open && (
                <div className="absolute top-12 right-0 w-80 bg-gray-950/95 border border-white/10 rounded-lg shadow-2xl animate-fade-in rtl" style={{ backdropFilter: 'blur(10px)' }}>
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6">
                        <span className="font-mono text-xs tracking-widest text-cyan-500/60 uppercase">// התראות</span>
                        {unread > 0 && (
                            <button className="bg-none border-none text-cyan-500/50 font-sans text-xs cursor-pointer transition-colors hover:text-cyan-500" onClick={markAllRead}>
                                סמן הכל כנקרא
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center px-4 py-7 text-center text-slate-200/25 text-sm"><div className="text-2xl animate-spin mb-2">⏳</div>טוען...</div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-7 text-center text-slate-200/25 text-sm">אין התראות חדשות</div>
                        ) : (
                            notifications.map((n) => (
                                <Link
                                    key={n._id}
                                    to={notifLink(n)}
                                    className={`flex items-start gap-2.5 px-4 py-3 text-inherit no-underline border-b border-white/4 transition-all ${n.read ? "hover:bg-white/3" : "bg-cyan-500/4 hover:bg-cyan-500/7"}`}
                                    onClick={() => { markRead(n._id); setOpen(false); }}
                                >
                                    <span className="text-4.5 flex-shrink-0 mt-0.5">{TYPE_ICON[n.type]}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-slate-200/70 leading-relaxed">
                                            <strong className="text-white">{n.sender?.firstName || n.sender?.username}</strong>
                                            {" "}{TYPE_TEXT[n.type]}
                                            {n.text && (
                                                <span className="text-slate-200/45 text-xs"> — {n.text.slice(0, 40)}{n.text.length > 40 ? "..." : ""}</span>
                                            )}
                                            <div className="text-xs text-slate-200/25 font-mono mt-0.75">{timeAgo(n.createdAt)}</div>
                                        </div>
                                    </div>
                                    {!n.read && <span className="w-1.75 h-1.75 rounded-full bg-cyan-500 flex-shrink-0 mt-1.25 shadow-lg shadow-cyan-500/60" />}
                                </Link>
                            ))
                        )}
                    </div>

                    <Link to="/notifications" className="block text-center px-4 py-3 border-t border-white/6 font-sans text-xs text-cyan-500/60 no-underline transition-all hover:text-cyan-500 hover:bg-cyan-500/4 tracking-wide">
                        כל ההתראות ←
                    </Link>
                </div>
            )}
        </div>
    );
}