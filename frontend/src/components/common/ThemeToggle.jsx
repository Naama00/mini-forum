import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeToggle Component
 * כפתור לעבור בין מצב כהה ובהיר
 */
export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const lightModeButtonStyle = !isDarkMode
    ? {
        border: '1px solid rgba(148,163,184,0.25)',
        background: 'rgba(10,12,22,0.45)',
        color: '#94a3b8',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease',
      }
    : {};

  return (
    <button
      className="p-2 rounded-2xl border border-slate-700 bg-slate-900/60 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-300 transition-all"
      style={lightModeButtonStyle}
      onClick={toggleTheme}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <svg className="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg className="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
