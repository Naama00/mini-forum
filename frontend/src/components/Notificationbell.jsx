import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/NotificationBell.css";

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
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    // שלוף מספר שלא-נקראו בכל 30 שניות
    useEffect(() => {
        if (!token) return;
        const fetchCount = async () => {
            try {
                const res = await fetch(`${API}/notifications/unread-count`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setUnread(data.count || 0);
            } catch { }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [token]);

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
        if (!token) return navigate("/login");

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
        <div className="notif-bell-wrap" ref={dropRef} dir="rtl">
            <button className="notif-bell-btn" onClick={openDropdown} aria-label="התראות">
                <span className="notif-bell-icon">🔔</span>
                {unread > 0 && (
                    <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>
                )}
            </button>

            {open && (
                <div className="notif-dropdown">
                    <div className="notif-drop-header">
                        <span className="notif-drop-title">// התראות</span>
                        {unread > 0 && (
                            <button className="notif-mark-all" onClick={markAllRead}>
                                סמן הכל כנקרא
                            </button>
                        )}
                    </div>

                    <div className="notif-drop-list">
                        {loading ? (
                            <div className="notif-drop-empty"><div className="spinner" />טוען...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-drop-empty">אין התראות חדשות</div>
                        ) : (
                            notifications.map((n) => (
                                <Link
                                    key={n._id}
                                    to={notifLink(n)}
                                    className={`notif-drop-item${n.read ? "" : " unread"}`}
                                    onClick={() => { markRead(n._id); setOpen(false); }}
                                >
                                    <span className="notif-drop-type-icon">{TYPE_ICON[n.type]}</span>
                                    <div className="notif-drop-body">
                                        <span className="notif-drop-sender">
                                            {n.sender?.firstName || n.sender?.username}
                                        </span>
                                        {" "}{TYPE_TEXT[n.type]}
                                        {n.text && (
                                            <span className="notif-drop-text"> — {n.text.slice(0, 40)}{n.text.length > 40 ? "..." : ""}</span>
                                        )}
                                        <div className="notif-drop-time">{timeAgo(n.createdAt)}</div>
                                    </div>
                                    {!n.read && <span className="notif-drop-dot" />}
                                </Link>
                            ))
                        )}
                    </div>

                    <Link to="/notifications" className="notif-drop-footer" onClick={() => setOpen(false)}>
                        כל ההתראות ←
                    </Link>
                </div>
            )}
        </div>
    );
}