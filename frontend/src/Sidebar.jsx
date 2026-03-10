import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import "./css/Sidebar.css";
const API_BASE = "http://localhost:5000";

function getUser() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        return JSON.parse(atob(token.split(".")[1]));
    } catch { return null; }
}

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [trending, setTrending] = useState([]);
    const [profile, setProfile] = useState(null);
    const [imgErr, setImgErr] = useState(false);

    useEffect(() => {
        // שליפת נושאים חמים
        fetch(`${API_BASE}/api/trending`)
            .then(r => r.json())
            .then(res => setTrending(Array.isArray(res.data) ? res.data.slice(0, 5) : []))
            .catch(() => { });

        // שליפת פרטי משתמש
        const tokenUser = getUser();
        if (tokenUser?.userId) {
            fetch(`${API_BASE}/api/users/${tokenUser.userId}`)
                .then(r => r.json())
                .then(res => {
                    if (res.success) {
                        console.log("icon:", res.data.icon); // ← הוסיפי
                        setProfile(res.data);
                    }
                })
                .catch(() => { });
        }
    }, []);

    const isActive = (path) => location.pathname === path;
    const tokenUser = getUser();

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const initials = profile?.firstName
        ? `${profile.firstName[0]}${profile.lastName?.[0] || ""}`.toUpperCase()
        : "?";

    return (
        <aside className="sb-root">
            <div className="sb-glow" />

            {/* משתמש */}
            {profile ? (
                <div className="sb-user-card">
                    <div className="sb-user-top"
                        onClick={() => navigate(`/profile/${tokenUser.userId}`)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="sb-avatar-wrap">
                            {profile.icon && !imgErr ? (
                                <img src={profile.icon} alt={initials}
                                    className="sb-avatar" onError={() => setImgErr(true)} />
                            ) : (
                                <div className="sb-avatar sb-avatar-initials">{initials}</div>
                            )}
                            <div className="sb-online-dot" />
                            <div className="sb-avatar-ring" />
                        </div>
                        <div className="sb-user-info">
                            <span className="sb-user-name">{profile.firstName} {profile.lastName}</span>
                            <span className="sb-user-badge">
                                <span className="sb-status-dot" />
                                {profile.isAdmin ? "Admin" : "חבר פעיל"}
                            </span>
                        </div>
                    </div>
                    <div className="sb-user-stats">
                        <div className="sb-stat">
                            <span className="sb-stat-num">{profile.votes ?? 0}</span>
                            <span className="sb-stat-label">הצבעות</span>
                        </div>
                        <div className="sb-stat-div" />
                        <div className="sb-stat">
                            <span className="sb-stat-num">{profile.topics?.length ?? 0}</span>
                            <span className="sb-stat-label">נושאים</span>
                        </div>
                        <div className="sb-stat-div" />
                        <div className="sb-stat">
                            <span className="sb-stat-num">{profile.posts?.length ?? 0}</span>
                            <span className="sb-stat-label">תגובות</span>
                        </div>
                    </div>
                    <div className="sb-user-actions">
                        <button className="sb-logout-btn" onClick={handleLogout}>התנתק</button>
                    </div>
                </div>
            ) : (
                <div className="sb-guest-card">
                    <div className="sb-guest-icon">◈</div>
                    <p className="sb-guest-text">הצטרף לקהילת המפתחים הישראלית</p>
                    <Link to="/auth" className="sb-login-btn">כניסה / הרשמה</Link>
                </div>
            )}

            <div className="sb-divider" />

            {/* ניווט */}
            <nav className="sb-section">
                <div className="sb-section-title">// ניווט</div>
                <ul className="sb-nav-list">
                    {[
                        { to: "/", icon: "◉", label: "דף הבית" },
                    ].map(({ to, icon, label }) => (
                        <li key={to}>
                            <Link to={to} className={`sb-nav-item${isActive(to) ? " active" : ""}`}>
                                <span className="sb-nav-icon">{icon}</span>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sb-divider" />

            {/* נושאים חמים */}
            <div className="sb-section">
                <div className="sb-section-title">// חם עכשיו</div>
                <ul className="sb-trending-list">
                    {trending.length === 0 ? (
                        <li className="sb-empty">אין נושאים כרגע</li>
                    ) : trending.map((t) => (
                        <li key={t._id}>
                            <Link to={`/category?topicId=${t._id}`} className="sb-trending-item">
                                <span className="sb-trending-dot" />
                                <span className="sb-trending-text">{t.title}</span>
                                <span className="sb-trending-votes">↑{t.votes ?? 0}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="sb-divider" />

            {/* תגיות */}
            <div className="sb-section">
                <div className="sb-section-title">// תגיות נפוצות</div>
                <div className="sb-tags">
                    {["React", "Node.js", "Cyber", "AI", "Career", "DevOps"].map(tag => (
                        <span key={tag} className="sb-tag">#{tag}</span>
                    ))}
                </div>
            </div>

            {/* פוטר */}
            <div className="sb-footer">
                <span className="sb-pulse-dot" />
                <span style={{ color: "#fff", fontWeight: 700 }}>14</span>
                <span> משתמשים אונליין</span>
            </div>
        </aside>
    );
}