import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { io } from "socket.io-client";
import { getToken } from "../../utils/storage";

import { API_BASE_URL as API } from "../../utils/constants";
import { timeAgo } from "../../utils/formatters";

const TYPE_ICON = {
  comment: "⬡",
  like:    "◆",
  attend:  "◎",
  message: "◇",
};

const TYPE_TEXT = {
  comment: "הגיב/ה על",
  like:    "עשה/תה לייק ל",
  attend:  "נרשם/ה לאירוע",
  message: "שלח/ה לך הודעה",
};

function notifLink(n) {
  if (n.type === "message") return "/notifications";
  if (!n.refModel || !n.refId) return "/notifications";
  const map = { Article: "articles", Event: "events", Job: "jobs" };
  return `/${map[n.refModel]}/${n.refId}`;
}

export default function NotificationBell() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [loading, setLoading]             = useState(false);
  const dropRef                           = useRef(null);
  const socketRef                        = useRef(null);
  const token                             = getToken();
  const navigate                          = useNavigate();
  const SERVER_URL                       = API.replace(/\/api\/?$/, '');

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("אין טוקן ב-LocalStorage, מדלג על הבאת התראות");
        return;
      }
      try {
        const res = await fetch(`${API}/notifications/unread-count`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.status === 401) {
          console.warn("השרת החזיר 401 - הטוקן באמת פג תוקף. מנקה ומפנה ל-Auth.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/auth");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUnread(data.count || 0);
        }
      } catch (err) {
        console.error("שגיאת רשת בניסיון להביא התראות:", err);
      }
    };
    fetchUnreadCount();
  }, [navigate]);

  useEffect(() => {
    if (!token) return;

    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      auth: { token },
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.debug('Notification socket connected', socket.id);
    });

    socket.on('authenticated', () => {
      console.debug('Notification socket authenticated');
    });

    socket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 8));
      setUnread((prev) => prev + 1);
    });

    socket.on('unauthorized', (payload) => {
      console.warn('Socket unauthorized:', payload?.message);
    });

    socket.on('connect_error', (err) => {
      console.warn('Notification socket connection failed:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [SERVER_URL, token]);

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
        const res  = await fetch(`${API}/notifications?limit=8`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnread(data.unreadCount || 0);
      } catch {}
      setLoading(false);
    }
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
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

  if (!token) return null;

  return (
    <div ref={dropRef} dir="rtl" style={{ position: "relative", zIndex: 50, fontFamily: "'Assistant', sans-serif" }}>
      {/* ── פעמון ── */}
      <button
        onClick={openDropdown}
        aria-label="התראות"
        style={{
          position: "relative",
          border: `1px solid ${open ? "rgba(56,189,248,0.45)" : "rgba(148,163,184,0.25)"}`,
          borderRadius: "0.75rem",
          padding: "0.45rem 0.8rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: open ? "#22d3ee" : "#a5b4fc",
          background: open ? "rgba(56,189,248,0.08)" : "rgba(10,12,22,0.45)",
          backdropFilter: "blur(12px)",
          transition: "all 0.2s ease",
          boxShadow: open ? "0 0 20px rgba(34,211,238,0.15)" : "0 0 0 1px transparent",
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.borderColor = "rgba(56,189,248,0.35)";
            e.currentTarget.style.color = "#cffafe";
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = "rgba(148,163,184,0.25)";
            e.currentTarget.style.color = "#a5b4fc";
          }
        }}
      >
        <Bell
          size={18}
          weight="duotone"
          color={open ? "#22d3ee" : "#94a3b8"}
          style={{ filter: open ? "drop-shadow(0 0 4px rgba(34,211,238,0.6))" : "none" }}
        />

        {/* Badge */}
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              left: "-5px",
              minWidth: "16px",
              height: "16px",
              borderRadius: "9999px",
              background: "var(--accent-cyan)",
              color: "#0a0c16",
              fontSize: "9px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              border: "2px solid #0a0c16",
              fontFamily: "Assistant",
              animation: "bellPulse 2s ease-in-out infinite",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* ── לוח צף ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            left: 0,
            width: "320px",
            background: "rgba(10, 12, 22, 0.97)",
            border: "1px solid var(--surface-border)",
            borderRadius: "1rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.04)",
            backdropFilter: "blur(24px)",
            overflow: "hidden",
            animation: "dropIn 0.15s ease",
          }}
        >
          {/* כותרת */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--surface-border)",
            }}
          >
            <span
              style={{
                fontFamily: "Assistant",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(0,229,255,0.45)",
                fontWeight: 700,
              }}
            >
              // התראות
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(0,229,255,0.45)",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontFamily: "'Assistant', sans-serif",
                  transition: "color 0.15s",
                  padding: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--accent-cyan)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(0,229,255,0.45)"}
              >
                סמן הכל כנקרא
              </button>
            )}
          </div>

          {/* רשימה */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2rem",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "2px solid rgba(0,229,255,0.15)",
                    borderTopColor: "var(--accent-cyan)",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontFamily: "Assistant", fontSize: "11px", color: "rgba(148,163,184,0.35)" }}>
                  // טוען...
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "rgba(148,163,184,0.3)",
                  fontSize: "0.8rem",
                  fontFamily: "Assistant",
                }}
              >
                // אין התראות חדשות
              </div>
            ) : (
              notifications.map((n) => (
                <NotifRow
                  key={n._id}
                  n={n}
                  onRead={() => { markRead(n._id); setOpen(false); }}
                />
              ))
            )}
          </div>

          {/* קישור לדף מלא */}
          <Link
            to="/notifications"
            style={{
              display: "block",
              textAlign: "center",
              padding: "0.65rem 1rem",
              borderTop: "1px solid var(--surface-border)",
              fontSize: "11px",
              fontFamily: "Assistant",
              color: "rgba(0,229,255,0.45)",
              textDecoration: "none",
              transition: "all 0.15s",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "var(--accent-cyan)";
              e.currentTarget.style.background = "rgba(0,229,255,0.04)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgba(0,229,255,0.45)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            כל ההתראות ←
          </Link>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bellPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,229,255,0.4); }
          50%       { box-shadow: 0 0 0 4px rgba(0,229,255,0); }
        }
      `}</style>
    </div>
  );
}

/* ── שורת התראה בודדת ── */
function NotifRow({ n, onRead }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={notifLink(n)}
      onClick={onRead}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.65rem",
        padding: "0.75rem 1rem",
        textDecoration: "none",
        borderBottom: "1px solid var(--surface-border)",
        background: !n.read
          ? (hovered ? "rgba(0,229,255,0.06)" : "rgba(0,229,255,0.03)")
          : (hovered ? "rgba(255,255,255,0.02)" : "transparent"),
        transition: "background 0.15s",
        color: "inherit",
      }}
    >
      {/* אייקון סוג */}
      <span
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "0.5rem",
          border: "1px solid var(--surface-border)",
          background: "rgba(255,255,255,0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: hovered ? "var(--accent-cyan)" : "var(--text-muted)",
          flexShrink: 0,
          marginTop: "1px",
          transition: "color 0.15s",
          fontFamily: "Assistant",
        }}
      >
        {TYPE_ICON[n.type] || "◎"}
      </span>

      {/* גוף */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: 1.5 }}>
          <strong style={{ color: "#fff", fontWeight: 700 }}>
            {n.sender?.firstName || n.sender?.username}
          </strong>{" "}
          {TYPE_TEXT[n.type]}
          {n.text && (
            <span style={{ color: "rgba(148,163,184,0.45)", fontSize: "11px" }}>
              {" "}— {n.text.slice(0, 40)}{n.text.length > 40 ? "..." : ""}
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: "Assistant",
            fontSize: "10px",
            color: "rgba(148,163,184,0.3)",
            marginTop: "0.25rem",
          }}
        >
          {timeAgo(n.createdAt)}
        </div>
      </div>

      {/* נקודה לא-נקרא */}
      {!n.read && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--accent-cyan)",
            flexShrink: 0,
            marginTop: "6px",
            boxShadow: "0 0 6px rgba(0,229,255,0.5)",
          }}
        />
      )}
    </Link>
  );
}