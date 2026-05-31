import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Radio, ChevronDown, LogOut, User } from "lucide-react";
import SearchBar from "../Search/Searchbar";
import { ThemeToggle } from "../common";
import NotificationBell from "../Notification/Notificationbell";
import { useAuth } from "../../hooks";

// דפים שמציגים סיידבר — כל השאר מלא-רוחב (לוגין, פרופיל וכו')
const SIDEBAR_ROUTES = [
  "/", "/category", "/articles", "/events", "/jobs",
  "/notifications", "/search", "/ai-workspace",
  "/new-topic",
];

function hasSidebar(pathname) {
  return SIDEBAR_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/") === false && pathname === r)
    || /^\/(articles|events|jobs|category)/.test(pathname);
}

export default function AppShell({ children, sidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const showSidebar = hasSidebar(location.pathname);

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : "א";

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/25" dir="rtl">

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
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/60 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 md:px-6">

          {/* לוגו */}
          <Link to="/" className="group flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl blur opacity-70 animate-pulse" />
              <div className="relative w-11 h-11 rounded-xl border border-cyan-500/40 bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                DEV.HUB
              </h1>
              <p className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">
                COMMUNITY NETWORK
              </p>
            </div>
          </Link>

          {/* סטטוס */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/50">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-semibold">Online</span> systems active
            </span>
          </div>

          {/* חיפוש */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 blur-xl opacity-70" />
              <div className="relative"><SearchBar /></div>
            </div>
          </div>

          {/* ימין — התראות + משתמש + theme */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setUserMenuOpen(s => !s); }}
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

                {userMenuOpen && (
                  <div className="absolute left-0 mt-3 w-52 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10">
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
                  </div>
                )}
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
        </div>
      </header>

      {/* ── Layout: סיידבר + תוכן ── */}
      <div className={`flex min-h-[calc(100vh-73px)] ${showSidebar ? "" : "justify-center"}`}>

        {/* סיידבר — מוצג רק בדפים הרלוונטיים */}
        {showSidebar && sidebar && (
          <aside className="border-l border-white/5 bg-slate-900/30 flex-shrink-0">
            {sidebar}
          </aside>
        )}

        {/* תוכן ראשי */}
        <main className={`flex-1 min-w-0 overflow-y-auto ${showSidebar ? "" : "max-w-7xl w-full"}`}>
          {children}
        </main>

      </div>
    </div>
  );
}
