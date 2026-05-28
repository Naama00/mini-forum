import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Radio,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

import SearchBar from "../Searchbar";
import ThemeToggle from "../ThemeToggle";
import NotificationBell from "../Notificationbell";
import { useAuth } from "../../hooks";

function AppShell({ children }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`
    : "א";

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    document.addEventListener("mousedown", handler);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-cyan-500/25">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        {/* Glow Blobs */}
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse -top-1/4 -left-1/4" />

        <div className="absolute w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse top-1/3 -right-1/4" />

        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse -bottom-1/4 left-1/3" />

        {/* Cursor Glow */}
        <div
          className="absolute w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-full blur-3xl transition-all duration-300"
          style={{
            left: `${mousePos.x - 160}px`,
            top: `${mousePos.y - 160}px`,
          }}
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(
                0deg,
                transparent 24%,
                rgba(0,229,255,.05) 25%,
                rgba(0,229,255,.05) 26%,
                transparent 27%,
                transparent 74%,
                rgba(0,229,255,.05) 75%,
                rgba(0,229,255,.05) 76%,
                transparent 77%,
                transparent
              ),
              linear-gradient(
                90deg,
                transparent 24%,
                rgba(0,229,255,.05) 25%,
                rgba(0,229,255,.05) 26%,
                transparent 27%,
                transparent 74%,
                rgba(0,229,255,.05) 75%,
                rgba(0,229,255,.05) 76%,
                transparent 77%,
                transparent
              )
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/60 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          {/* Left */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Logo */}
            <Link
              to="/"
              className="group flex items-center gap-3"
            >
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

            {/* Status */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-sm">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />

              <span className="text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">
                  Online
                </span>{" "}
                systems active
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 blur-xl opacity-70" />

              <div className="relative">
                <SearchBar />
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <NotificationBell />
              </div>
            </div>

            {/* User */}
            {user ? (
              <div
                className="relative"
                ref={userMenuRef}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen((s) => !s);
                  }}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-900/80"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 blur opacity-70" />

                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/40 bg-slate-950 text-sm font-bold text-cyan-300">
                      {initials}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-semibold text-slate-100">
                      {user.firstName}
                    </span>

                    <span className="text-[10px] uppercase tracking-widest text-slate-500">
                      Member
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute left-0 mt-3 w-52 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate(`/profile/${user._id}`);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-200 transition-all duration-200 hover:bg-slate-800/80 hover:text-cyan-300"
                      >
                        <User className="w-4 h-4" />

                        פרופיל
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);

                          if (logout) logout();

                          navigate("/auth");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-rose-400 transition-all duration-200 hover:bg-slate-800/80"
                      >
                        <LogOut className="w-4 h-4" />

                        התנתק
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <span className="relative z-10">
                  התחבר / הרשמה
                </span>

                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}

            {/* Theme */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="relative z-10 flex-1 px-4 py-6 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppShell;