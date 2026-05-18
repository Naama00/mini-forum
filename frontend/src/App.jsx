import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Suspense, useState, useEffect, useRef } from "react";
import { routes } from './config/routeConfig';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import Sidebar from "./components/Sidebar";
import ThemeToggle from './components/ThemeToggle';
import NotificationBell from './components/Notificationbell';
import { useAuth } from './hooks';
import './css/global.css';

const TOP_NAV = [
  { to: '/', icon: '⌂', label: 'בית' },
  { to: '/articles', icon: '◎', label: 'מאמרים' },
  { to: '/events', icon: '◆', label: 'אירועים' },
  { to: '/jobs', icon: '◇', label: 'משרות' },
  { to: '/notifications', icon: '◐', label: 'התראות' },
];

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.element />}
          />
        ))}
      </Routes>
    </Suspense>
  );
}

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}` : 'אורח';
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#080c14]/95 px-4 backdrop-blur-md md:px-8">
        <div />

        <div className="flex items-center gap-3">
          <NotificationBell />
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setUserMenuOpen((s) => !s); }}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-[#ccff00]/40 hover:bg-[#ccff00]/10"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ccff00]/10 text-sm font-bold text-[#ccff00]">
                  {initials}
                </span>
                <span className="hidden sm:inline">{user.firstName || 'פרופיל'}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-gray-950/95 border border-white/10 rounded-xl shadow-2xl py-2 z-50" style={{ backdropFilter: 'blur(6px)' }}>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate(`/profile/${user._id}`); }}
                    className="w-full text-right px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
                  >
                    פרופיל
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); if (logout) logout(); navigate('/auth'); }}
                    className="w-full text-right px-4 py-2 text-sm text-rose-400 hover:bg-white/5"
                  >
                    התנתק
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="rounded-full border border-white/10 bg-[#ccff00]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#ccff00] transition hover:bg-[#ccff00]/10"
            >
              התחבר / הרשמה
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 py-8 md:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-[80rem]">
          <AppRoutes />
        </div>
      </div>
    </>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState({
    firstName: "אורח",
    lastName: "בבדיקה",
    votes: 10,
    isAdmin: false,
    links: { topics: [], posts: [], uploads: [] }
  });

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <div
                className="min-h-dvh w-full overflow-x-hidden bg-transparent text-slate-100 antialiased selection:bg-cyan-500/25 selection:text-cyan-50"
                dir="rtl"
              >
                {/*
                  Grid ב-RTL: העמודה הראשונה ב-template נצבת מימין → סיידבר, השנייה משמאל → תוכן מלא רוחב.
                */}
                <div className="grid min-h-dvh w-full grid-cols-[14rem_minmax(0,1fr)] sm:grid-cols-[16rem_minmax(0,1fr)] md:grid-cols-[17.5rem_minmax(0,1fr)]">
                  <Sidebar currentUser={currentUser} />
                  <main className="app-shell-main relative flex min-h-dvh min-w-0 flex-col border-s border-white/[0.06] bg-transparent">
                    <AppShell />
                  </main>
                </div>
              </div>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
