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
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setCategories(res.data || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/auth');
  };

  return (
    <>
      <div
        className="sidebar-scroll sidebar-shell"
        dir="rtl"
      >
        {/* ── LOGO BRANDING ── */}
        <div className="px-4">
          <Link to="/" className="sidebar-brand">
            <span className="sidebar-brand-icon">⬡</span>
            <span>Dev<span className="text-[#ccff00]">Hub</span></span>
          </Link>
          <div className="sidebar-subtitle">// COMMUNITY TERMINAL v2.6</div>
        </div>

        {/* ── MAIN NAV LINKS ── */}
        <div className="px-4 sidebar-section">
          <p className="sidebar-label">ניווט עיקרי</p>
          <ul className="sidebar-nav">
            {NAV.map((item) => {
              // For root path, check exact match; for others, check pathname
              const isActive = item.to === '/' 
                ? location.pathname === '/' 
                : location.pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`sidebar-link${isActive ? ' active' : ''}`}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </li>
              );
            })}
            {isLoggedIn && (
              <li>
                <Link
                  to="/ai-workspace"
                  className={`sidebar-link${location.pathname === '/ai-workspace' ? ' active' : ''}`}
                >
                  <span className="sidebar-icon">🤖</span>
                  <span className="flex-1">AI Workspace</span>
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* ── CATEGORIES ── */}
        <div className="px-4 sidebar-section flex-1 overflow-y-auto">
          <p className="sidebar-label">ערוצי פיתוח</p>

          {loading ? (
            <div className="font-mono text-[10px] tracking-widest text-slate-600 animate-pulse uppercase">
              // FETCHING CORES...
            </div>
          ) : (
            <ul className="sidebar-category-list">
              {categories.map((cat) => {
                const catId = cat.id || cat._id;
                const searchParams = new URLSearchParams(location.search);
                const isSelected = location.pathname === '/category' && searchParams.get('categoryId') === catId;

                return (
                  <li key={catId}>
                    <Link
                      to={`/category?categoryId=${catId}`}
                      className={`sidebar-category-item${isSelected ? ' active' : ''}`}
                    >
                      <span className="sidebar-category-marker" />
                      <span className="flex-1 truncate">{cat.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── TAGS ── */}
        <div className="px-4 sidebar-section">
          <p className="sidebar-label">תגיות חמות</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Link
                key={tag}
                to={`/search?tag=${encodeURIComponent(tag)}`}
                className="sidebar-tag"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* ── FOOTER USER STATUS ── */}
        <div className="px-4 sidebar-user-panel">
          <button
            onClick={() => isLoggedIn ? navigate(`/profile/${user._id}`) : navigate('/auth')}
            className="sidebar-user-btn"
          >
            <div className="sidebar-user-avatar">
              {isLoggedIn ? user.name?.slice(0, 2).toUpperCase() : '??'}
            </div>

            <div className="flex-1 min-w-0 text-right">
              {isLoggedIn ? (
                <>
                  <p className="sidebar-user-name">{user.name}</p>
                  <p className="sidebar-user-meta">מחובר — לחץ לפרופיל / התנתק</p>
                </>
              ) : (
                <>
                  <p className="sidebar-user-name">מצב אורח</p>
                  <p className="sidebar-user-meta text-[#ccff00]">לחץ להתחבר / הרשמה</p>
                </>
              )}
            </div>

            <div className="inline-flex items-center px-1">
              <span className="sidebar-pulse" />
            </div>
          </button>
          <div className="sidebar-footer">
            <span className="sidebar-pulse" />
            <span style={{ color: '#fff', fontWeight: 700 }}>14</span>
            <span>משתמשים אונליין</span>
          </div>
        </div>
      </div>
    </>
  );
}