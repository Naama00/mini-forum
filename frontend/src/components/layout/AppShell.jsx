import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Search, Plus, Zap, Menu, ChevronDown, LogOut, User, House, BookOpen, CalendarDays, Briefcase, Bell } from "lucide-react";
import SearchBar from "../Search/Searchbar";
import { ThemeToggle } from "../common";
import NotificationBell from "../Notification/Notificationbell";
import { useAuth } from "../../hooks";

// דפים שמציגים סיידבר — כל השאר מלא-רוחב (לוגין, פרופיל וכו')
const SIDEBAR_ROUTES = [
  "/", "/category", "/articles", "/events", "/jobs",
  "/notifications", "/search", "/ai-workspace",
  "/new-topic","/challenge","/challenges","/usage",
];

function hasSidebar(pathname) {
  return SIDEBAR_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"))
    || /^\/(articles|events|jobs|category|challenge|challenges)/.test(pathname);
}

export default function AppShell({ children, sidebar, isSidebarOpen, isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 0, left: 0 });
  const userMenuButtonRef = useRef(null);
  const userMenuPanelRef = useRef(null);

  const showSidebar = hasSidebar(location.pathname);

  const collapsedNavItems = [
    { to: '/', icon: House, label: 'בית' },
    { to: '/articles', icon: BookOpen, label: 'מאמרים' },
    { to: '/events', icon: CalendarDays, label: 'אירועים' },
    { to: '/jobs', icon: Briefcase, label: 'משרות' },
    { to: '/notifications', icon: Bell, label: 'התראות' },
  ];

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : "א";

  useEffect(() => {
    const handler = (e) => {
      if (
        userMenuButtonRef.current &&
        userMenuPanelRef.current &&
        !userMenuButtonRef.current.contains(e.target) &&
        !userMenuPanelRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const profileMenuPortal = userMenuOpen && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={userMenuPanelRef}
          className="fixed w-52 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10 z-[99999]"
          style={{ top: profileMenuPosition.top, left: profileMenuPosition.left }}
        >
          <div className="p-2">
            <button
              onClick={() => { setUserMenuOpen(false); navigate(`/profile/${user._id}`); }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-200 transition-all hover:bg-slate-800/80 hover:text-cyan-300"
            >
              <User className="w-4 h-4" /> פרופיל
            </button>
            <button
              onClick={() => { setUserMenuOpen(false); if (logout) logout(); navigate("/auth"); }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-rose-400 transition-all hover:bg-slate-800/80"
            >
              <LogOut className="w-4 h-4" /> התנתק
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div 
      className={`relative min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/25 transition-all duration-300`}
      style={{
        paddingRight: isCollapsed ? '5.5rem' : '0rem',
        transition: 'padding-right 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
      }}
      dir="rtl"
    >

      {/* ── רקע גלובלי ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse -top-1/4 -left-1/4" />
        <div className="absolute w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse top-1/3 -right-1/4" />
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse -bottom-1/4 left-1/3" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0,229,255,.05) 25%, rgba(0,229,255,.05) 26%, transparent 27%,
                transparent 74%, rgba(0,229,255,.05) 75%, rgba(0,229,255,.05) 76%, transparent 77%),
              linear-gradient(90deg, transparent 24%, rgba(0,229,255,.05) 25%, rgba(0,229,255,.05) 26%, transparent 27%,
                transparent 74%, rgba(0,229,255,.05) 75%, rgba(0,229,255,.05) 76%, transparent 77%)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <header 
        className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/90 backdrop-blur-2xl transition-all duration-300"
        style={{
          paddingRight: isCollapsed ? '5.5rem' : '0rem',
          transition: 'padding-right 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        <div dir="ltr" className="mx-auto grid w-full max-w-screen-2xl grid-cols-[minmax(260px,1fr)_minmax(420px,2fr)_minmax(260px,1fr)] items-center gap-4 px-4 py-4 md:px-6">

          <div className="flex items-center gap-3 justify-start min-w-[260px]">
            <NotificationBell />

            {user ? (
              <div className="relative" ref={userMenuButtonRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - 260 - 16);
                    const top = Math.min(rect.bottom + 10, window.innerHeight - 16);
                    setProfileMenuPosition({ top, left });
                    setUserMenuOpen((s) => !s);
                  }}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2 transition-all hover:border-cyan-500/50 hover:bg-slate-900/80"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 blur opacity-70" />
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/40 bg-slate-950 text-sm font-bold text-cyan-300">
                      {initials}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-semibold text-slate-100">{user.firstName}</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Member</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {profileMenuPortal}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-all hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <span className="relative z-10">התחבר / הרשמה</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            <ThemeToggle />
          </div>

          <div className="flex justify-center min-w-0" dir="rtl">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 blur-xl opacity-70" />
                <div className="relative"><SearchBar /></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end min-w-[260px]">
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl blur opacity-70 animate-pulse" />
                <div className="relative w-11 h-11 rounded-xl border border-cyan-500/40 bg-slate-950 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                  DEV.HUB
                </h1>
                <p className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">
                  COMMUNITY NETWORK
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Collapsed vertical toolbar (slim) */}
      {isCollapsed && setIsCollapsed && (
        <div
          className="fixed right-0 top-1/2 z-[9999] -translate-y-1/2 transform flex flex-col items-center gap-2 w-14 rounded-l-3xl bg-slate-900/80 border-l border-slate-700/50 p-1 shadow-2xl shadow-cyan-500/10"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          <button
            onClick={() => setIsCollapsed(false)}
            aria-label="פתח סיידבר"
            title="פתח סיידבר"
            className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-900/90 transition-colors text-cyan-300"
          >
            <Menu className="w-6 h-6" />
          </button>

          <nav className="flex flex-col items-center gap-2 py-2">
            {collapsedNavItems.map((item) => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-colors ${isActive ? 'bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-500/10' : 'text-slate-200 hover:bg-slate-900/90'}`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>

          <Link
            to="/new-topic"
            title="נושא חדש"
            className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-900/90 transition-colors text-pink-400"
          >
            <Plus className="w-5 h-5" />
          </Link>

          <Link
            to="/ai-workspace"
            title="AI Workspace"
            className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-900/90 transition-colors text-violet-400"
          >
            <Zap className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* ── Layout: סיידבר + תוכן ── */}
      <div className={`flex min-h-[calc(100vh-73px)] ${showSidebar ? "" : "justify-center"}`}>

        {/* סיידבר — מוצג רק בדפים הרלוונטיים ומוחזק במקום כשהדף גלול */}
        {showSidebar && !isCollapsed && sidebar && (
          <aside className="fixed right-0 top-[73px] bottom-0 z-40 border-l border-white/5 bg-slate-900/30 w-[20rem]">
            {sidebar}
          </aside>
        )}

        {/* תוכן ראשי */}
        <main
          className={`flex-1 min-w-0 overflow-y-auto ${showSidebar && !isCollapsed ? "" : "max-w-7xl w-full"}`}
          style={{ marginRight: showSidebar && !isCollapsed ? '20rem' : '0' }}
        >
          {children}
        </main>

      </div>
    </div>
  );
}
