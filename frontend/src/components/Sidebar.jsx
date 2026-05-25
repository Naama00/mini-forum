import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

const API_BASE = 'http://localhost:5000';

const NAV = [
  { to: '/',              icon: '⌂',  label: 'דף הבית'  },
  { to: '/articles',      icon: '◎',  label: 'מאמרים'   },
  { to: '/events',        icon: '◆',  label: 'אירועים'  },
  { to: '/jobs',          icon: '◇',  label: 'משרות'    },
  { to: '/notifications', icon: '◐',  label: 'התראות'   },
];

const TAGS = ['React', 'Node.js', 'Cyber', 'AI', 'Career', 'DevOps'];

/* CSS — עיצובים משלימים השומרים על קו הניאון וה-Glassmorphic */
const SIDEBAR_STYLES = `
  /* glow pulse on active nav item */
  .nav-active-glow {
    box-shadow: inset -2px 0 0 #ccff00, 0 0 16px rgba(204, 255, 0, 0.06);
  }

  /* custom scrollbar for sidebar */
  .sidebar-scroll::-webkit-scrollbar {
    width: 3px;
  }
  .sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(204, 255, 0, 0.1);
    border-radius: 10px;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background: #ccff00;
  }

  .sidebar-label {
    font-size: 10px;
    font-family: var(--font-family);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(226, 232, 240, 0.25);
    font-weight: 700;
  }
`;

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
      <style>{SIDEBAR_STYLES}</style>
      
      <div 
        className="sidebar-scroll modern-sidebar sticky top-0 flex h-screen w-[280px] shrink-0 flex-col border-l border-white/[0.04] bg-[var(--bg-secondary)] py-6 text-slate-300 pointer-events-auto z-50"
        dir="rtl"
        style={{
          boxShadow: 'inset -10px 0 30px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* ── LOGO BRANDING ── */}
        <div className="relative z-10 mb-8 px-6">
          <Link to="/" className="group flex items-center gap-2.5 text-xl font-black tracking-tight text-white focus:outline-none">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ccff00]/10 font-mono text-sm text-[#ccff00] border border-[#ccff00]/20 transition-all group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(204,255,0,0.3)]">
              ⬡
            </span>
            <span className="transition-colors group-hover:text-slate-100">
              Dev<span className="text-[#ccff00] transition-all group-hover:text-[#bfff00]">Hub</span>
            </span>
          </Link>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-600">// COMMUNITY TERMINAL v2.6</div>
        </div>

        {/* ── MAIN NAV LINKS ── */}
        <div className="relative z-10 mb-6 px-3">
          <ul className="space-y-1 list-none p-0 m-0">
            {NAV.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to} className="p-0 m-0">
                  <Link
                    to={item.to}
                    className={`block w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                      isActive
                        ? 'nav-active-glow bg-white/[0.02] text-white font-bold'
                        : 'text-slate-400 hover:bg-white/[0.01] hover:text-slate-200'
                    }`}
                  >
                    <span 
                      className={`font-mono text-base transition-colors ${isActive ? 'text-[#ccff00]' : 'text-slate-600'}`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </li>
              );
            })}
            {isLoggedIn && (
              <li className="p-0 m-0">
                <Link
                  to="/ai-workspace"
                  className={`block w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                    location.pathname === '/ai-workspace'
                      ? 'nav-active-glow bg-white/[0.02] text-white font-bold'
                      : 'text-slate-400 hover:bg-white/[0.01] hover:text-slate-200'
                  }`}
                >
                  <span 
                    className={`font-mono text-base transition-colors ${location.pathname === '/ai-workspace' ? 'text-[#ccff00]' : 'text-slate-600'}`}
                  >
                    🤖
                  </span>
                  <span className="flex-1">AI Workspace</span>
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* divider */}
        <div className="mx-4 my-2 h-px bg-gradient-to-l from-transparent via-white/[0.04] to-transparent" />

        {/* ── CATEGORIES ── */}
        <div className="relative z-10 mb-6 flex-1 overflow-y-auto px-3">
          <div className="mb-2 px-4">
            <p className="sidebar-label">ערוצי פיתוח</p>
          </div>

          {loading ? (
            <div className="px-4 py-3 font-mono text-[10px] tracking-widest text-slate-600 animate-pulse uppercase">
              // FETCHING CORES...
            </div>
          ) : (
            <ul className="space-y-0.5 list-none p-0 m-0">
              {categories.map((cat) => {
                const catId = cat.id || cat._id;
                const searchParams = new URLSearchParams(location.search);
                const isSelected = location.pathname === '/category' && searchParams.get('categoryId') === catId;

                return (
                  <li key={catId} className="p-0 m-0">
                    <Link
                      to={`/category?categoryId=${catId}`}
                      className={`block w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 cursor-pointer focus:outline-none ${
                        isSelected
                          ? 'bg-[#ccff00]/5 text-white font-semibold border border-[#ccff00]/10'
                          : 'text-slate-400 hover:bg-white/[0.01] hover:text-slate-200'
                      }`}
                    >
                      <span className={`font-mono text-xs ${isSelected ? 'text-[#ccff00]' : 'text-slate-600'}`}>◈</span>
                      <span className="flex-1 truncate">{cat.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* divider */}
        <div className="mx-4 my-3 h-px bg-gradient-to-l from-transparent via-white/[0.04] to-transparent" />

        {/* ── TAGS ── */}
        <div className="relative z-10 mb-4 px-4">
          <p className="sidebar-label mb-3">תגיות חמות</p>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((tag) => (
              <Link
                key={tag}
                to={`/search?tag=${encodeURIComponent(tag)}`}
                className="sidebar-tag block cursor-pointer rounded-lg border border-white/[0.04] px-2.5 py-1 text-[11px] font-mono text-slate-500 transition-all duration-200 hover:border-[#ccff00]/20 hover:text-[#ccff00] hover:bg-[#ccff00]/5"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* ── FOOTER USER STATUS ── */}
        <div className="relative z-10 border-t border-white/[0.04] px-4 pt-4 bg-black/10">
          <button
            onClick={() => isLoggedIn ? navigate(`/profile/${user._id}`) : navigate('/auth')}
            className="w-full text-right flex items-center gap-3 rounded-xl p-2 bg-white/[0.01] border border-white/[0.03]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 font-bold font-mono text-xs text-slate-400">
              {isLoggedIn ? user.name?.slice(0, 2).toUpperCase() : '??'}
            </div>

            <div className="flex-1 min-w-0">
              {isLoggedIn ? (
                <>
                  <p className="truncate text-xs font-bold text-slate-200">{user.name}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">מחובר — לחץ לפרופיל / התנתק</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-slate-500">מצב אורח</p>
                  <p className="mt-0.5 text-[10px] text-[#ccff00]">לחץ להתחבר / הרשמה</p>
                </>
              )}
            </div>

            <div className="flex items-center px-1">
              <span className="inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#ccff00' }} />
            </div>
          </button>
        </div>

      </div>
    </>
  );
}