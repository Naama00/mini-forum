import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Save preference
    localStorage.setItem('theme', newTheme);
    
    // Apply to document
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
    
    // DEBUG
    console.log('Theme changed to:', newTheme);
    console.log('HTML data-theme:', document.documentElement.getAttribute('data-theme'));
    console.log('Body data-theme:', document.body.getAttribute('data-theme'));
    console.log('Computed --bg-primary:', getComputedStyle(document.body).getPropertyValue('--bg-primary'));
    console.log('Computed background-color:', getComputedStyle(document.body).backgroundColor);
    console.log('Body styles:', document.body.getAttribute('style'));
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: newTheme } }));
  };

  return (
    <button
      className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-[#ccff00] shadow-sm transition-all hover:bg-[#ccff00]/10 hover:text-slate-950 hover:scale-105 active:scale-95"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        // Sun icon for switching to light mode
        <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        // Moon icon for switching to dark mode
        <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}