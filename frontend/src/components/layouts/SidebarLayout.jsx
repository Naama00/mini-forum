import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { dataService } from '../../services/dataService';
import { userService } from '../../services/userService';
import { getAvatarInitials } from '../../utils/formatters';

/**
 * SidebarLayout Component
 * תצוגת סרגל צד עם ניווט, משתמש וטרנדים
 */
export function SidebarLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [imgErr, setImgErr] = useState(false);

  // Load trending topics
  const { data: trendingData } = useFetch(
    () => dataService.getTrendingTopics(),
    []
  );
  const trending = trendingData?.topics || [];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const initials = user?.firstName
    ? getAvatarInitials(user.firstName, user.lastName)
    : "?";

  return (
    <aside className="sb-root">
      <div className="sb-glow" />

      {/* משתמש */}
      {user ? (
        <div className="sb-user-card" onClick={() => navigate(`/profile/${user._id}`)} style={{ cursor: "pointer" }}>
          <div className="sb-user-top">
            <div className="sb-avatar-wrap">
              {user.icon && !imgErr ? (
                <img src={user.icon} alt={initials} className="sb-avatar" onError={() => setImgErr(true)} />
              ) : (
                <div className="sb-avatar sb-avatar-initials">{initials}</div>
              )}
              <div className="sb-online-dot" />
            </div>
            <div className="sb-user-info">
              <span className="sb-user-name">{user.firstName} {user.lastName}</span>
              <span className="sb-user-badge">
                <span className="sb-status-dot" />
                {user.isAdmin ? "Admin" : "חבר פעיל"}
              </span>
            </div>
            <button className="sb-logout-btn" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
              התנתק
            </button>
          </div>
        </div>
      ) : (
        <div className="sb-guest-card">
          <div className="sb-guest-icon">◈</div>
          <p className="sb-guest-text">הצטרף לקהילה</p>
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
            { to: "/articles", icon: "◎", label: "מאמרים" },
            { to: "/events", icon: "◆", label: "אירועים" },
            { to: "/jobs", icon: "◇", label: "משרות" },
            { to: "/notifications", icon: "◐", label: "התראות" },
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
