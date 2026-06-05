// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Sparkles, GitFork, Code2, Cpu, BookOpen, Trophy, Zap, CalendarDays, Briefcase } from 'lucide-react';

const GITHUB_URL = 'https://github.com/Naama00/mini-forum';

const NAV_LINKS = [
  { to: '/',             icon: Sparkles,    label: 'בית' },
  { to: '/articles',     icon: BookOpen,    label: 'מאמרים' },
  { to: '/challenges',   icon: Trophy,      label: 'אתגרים' },
  { to: '/ai-workspace', icon: Zap,         label: 'AI Workspace' },
  { to: '/events',       icon: CalendarDays,label: 'אירועים' },
  { to: '/jobs',         icon: Briefcase,   label: 'משרות' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer dir="rtl" className="mt-auto border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* ── עמודה 1: לוגו + תיאור ─────────────────────────────────── */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 w-fit">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl blur opacity-60" />
                <div className="relative w-9 h-9 rounded-xl border border-cyan-500/40 bg-slate-950 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <p className="text-base font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  DEV.HUB
                </p>
                <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Community Network
                </p>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              פורום טכנולוגי מבוסס AI למפתחים — שאל, שתף, התאתגר וצמח עם הקהילה.
            </p>

            {/* GitHub */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition-colors group"
            >
              <GitFork className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
              <span>קוד פתוח ב-GitHub</span>
            </a>
          </div>

          {/* ── עמודה 2: ניווט מהיר ──────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              ניווט מהיר
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition-colors group w-fit"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── עמודה 3: טכנולוגיות ──────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Built with
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'MongoDB', 'Redis', 'Socket.io', 'Gemini AI', 'Tailwind CSS', 'Vite'].map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                             bg-slate-800/60 border border-slate-700/50
                             text-xs text-slate-400 font-mono"
                >
                  <Code2 className="w-3 h-3 text-cyan-500/50" />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── שורה תחתונה ──────────────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © {year} DEV.HUB — All rights reserved
          </p>
          <p className="text-xs text-slate-600 flex items-center gap-1">
            Built with
            <span className="text-rose-500/70">♥</span>
            by Naama
          </p>
        </div>
      </div>
    </footer>
  );
}