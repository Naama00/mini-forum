import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import './Sidebar.css';

const API_BASE = 'http://localhost:5000';

const NAV = [
  { to: '/',              icon: '⌂',  label: 'דף הבית'  },
  { to: '/articles',      icon: '◎',  label: 'מאמרים'   },
  { to: '/events',        icon: '◆',  label: 'אירועים'  },
  { to: '/jobs',          icon: '◇',  label: 'משרות'    },
  { to: '/notifications', icon: '◐',  label: 'התראות'   },
];

const TAGS = ['React', 'Node.js', 'Cyber', 'AI', 'Career', 'DevOps'];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(res => res.json())
      .then(res => { if (res.success) setCategories(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => { if (logout) logout(); navigate('/auth'); };

  return (
    <aside className="sidebar-shell sidebar-scroll" dir="rtl">

      {/* ── לוגו ── */}
      <div className="sidebar-section">
        <Link to="/" className="sidebar-brand">
          <span className="sidebar-brand-icon">⬡</span>
          <span>Dev<span className="sidebar-brand-accent">Hub</span></span>
        </Link>
        <p className="sidebar-subtitle">// COMMUNITY TERMINAL v2.6</p>
      </div>

      {/* ── ניווט עיקרי ── */}
      <div className="sidebar-section">
        <p className="sidebar-label">ניווט עיקרי</p>
        <ul className="sidebar-nav">
          {NAV.map(item => {
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link to={item.to} className={`sidebar-link${isActive ? ' active' : ''}`}>
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
          {isLoggedIn && (
            <li>
              <Link to="/ai-workspace" className={`sidebar-link${location.pathname === '/ai-workspace' ? ' active' : ''}`}>
                <span className="sidebar-icon">🤖</span>
                <span className="flex-1">AI Workspace</span>
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* ── קטגוריות ── */}
      <div className="sidebar-section sidebar-categories">
        <p className="sidebar-label">ערוצי פיתוח</p>
        {loading ? (
          <p className="sidebar-loading">// FETCHING CORES...</p>
        ) : (
          <ul className="sidebar-category-list">
            {categories.map(cat => {
              const catId = cat.id || cat._id;
              const searchParams = new URLSearchParams(location.search);
              const isSelected = location.pathname === '/category' && searchParams.get('categoryId') === catId;
              return (
                <li key={catId}>
                  <Link to={`/category?categoryId=${catId}`} className={`sidebar-category-item${isSelected ? ' active' : ''}`}>
                    <span className="sidebar-category-marker" />
                    <span className="flex-1 truncate">{cat.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── תגיות ── */}
      <div className="sidebar-section">
        <p className="sidebar-label">תגיות חמות</p>
        <div className="sidebar-tags">
          {TAGS.map(tag => (
            <Link key={tag} to={`/search?tag=${encodeURIComponent(tag)}`} className="sidebar-tag">
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* ── משתמש ── */}
      <div className="sidebar-user-panel">
        <button onClick={() => isLoggedIn ? navigate(`/profile/${user._id}`) : navigate('/auth')} className="sidebar-user-btn">
          <div className="sidebar-user-avatar">
            {isLoggedIn ? user.name?.slice(0, 2).toUpperCase() : '??'}
          </div>
          <div className="flex-1 min-w-0 text-right">
            {isLoggedIn ? (
              <>
                <p className="sidebar-user-name">{user.name}</p>
                <p className="sidebar-user-meta">מחובר — לחץ לפרופיל</p>
              </>
            ) : (
              <>
                <p className="sidebar-user-name">מצב אורח</p>
                <p className="sidebar-user-meta sidebar-user-meta--cta">לחץ להתחבר</p>
              </>
            )}
          </div>
          <span className="sidebar-pulse" />
        </button>

        <div className="sidebar-footer">
          <span className="sidebar-pulse" />
          <span className="sidebar-footer-count">14</span>
          <span>משתמשים אונליין</span>
        </div>
      </div>

    </aside>
  );
}