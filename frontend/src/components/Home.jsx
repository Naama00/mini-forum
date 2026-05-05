import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import NotificationBell from './Notificationbell';
import SearchBar from './SearchBar';
const API_BASE = "http://localhost:5000";

function getCategoryIcon(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("ai") || lower.includes("machine")) return "◉";
  if (lower.includes("web") || lower.includes("frontend")) return "◇";
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("ios")) return "◎";
  if (lower.includes("security") || lower.includes("cyber")) return "◆";
  if (lower.includes("devops") || lower.includes("cloud")) return "◈";
  if (lower.includes("data") || lower.includes("database")) return "◑";
  if (lower.includes("hardware") || lower.includes("embedded")) return "◐";
  if (lower.includes("career") || lower.includes("job")) return "◍";
  return "◈";
}

const accentColors = [
  "#00e5ff", "#7c4dff", "#ff4081", "#00e676", "#ff9100",
  "#40c4ff", "#ea80fc", "#69f0ae", "#ffd740", "#ff6e40",
];

function getUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch { return null; }
}
export default function ForumHome() {
  const [categories, setCategories] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingSub, setLoadingSub] = useState({});
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tokenUser = getUser();
    if (tokenUser?.userId) {
      fetch(`http://localhost:5000/api/users/${tokenUser.userId}`)
        .then(r => r.json())
        .then(res => { if (res.success) setUser(res.data); })
        .catch(() => { });
    }
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setCategories(res.data);
        else setCategories([]);
        setLoading(false);
      })
      .catch(() => { setError("לא ניתן להתחבר לשרת"); setLoading(false); });
  }, []);

  const handleCategoryClick = async (cat, e) => {
    if (e.target.closest(".cat-arrow")) {
      e.preventDefault();
      const id = cat.id || cat._id;
      if (expandedId === id) { setExpandedId(null); return; }
      setExpandedId(id);
      if (!subcategories[id]) {
        setLoadingSub((p) => ({ ...p, [id]: true }));
        try {
          const res = await fetch(`${API_BASE}/api/categories/${id}`);
          const data = await res.json();
          const subs = data.data?.subCategories || [];
          setSubcategories((p) => ({ ...p, [id]: subs }));
        } catch {
          setSubcategories((p) => ({ ...p, [id]: [] }));
        } finally {
          setLoadingSub((p) => ({ ...p, [id]: false }));
        }
      }
    } else {
      window.location.href = `/category?categoryId=${cat.id || cat._id}`;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 rtl" dir="rtl">

      {/* Header */}
      <header className="border-b border-white/8 bg-gray-950/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded" />
              <span className="text-white font-bold text-lg">Dev<span className="text-cyan-500">Hub</span></span>
            </a>
            <nav>
              <ul className="flex items-center gap-6 text-sm">
                <li><Link to="/articles" className="nav-link">מאמרים</Link></li>
                <li><Link to="/events" className="nav-link">אירועים</Link></li>
                <li><Link to="/jobs" className="nav-link">משרות</Link></li>
                {user && (
                  <li>
                    <NotificationBell />
                  </li>
                )}
              </ul>
            </nav>             
            <div className="flex items-center gap-4">
              <SearchBar />
              {!user && (
                <button className="px-5 py-2.5 bg-cyan-500 text-gray-950 font-bold uppercase tracking-widest rounded-lg hover:shadow-lg hover:shadow-cyan-500/35 transition-shadow" onClick={() => window.location.href = "/auth"}>
                  הרשמה / כניסה
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-20 px-6 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-400/80 mb-5">TECH FORUM // קהילת הייטק ישראלית</div>
            <h1 className="text-[42px] leading-[1.05] md:text-6xl font-black text-white mb-5">
              הקהילה <span className="text-cyan-500">הטכנולוגית</span><br />שחיכית לה
            </h1>
            <p className="text-slate-300/70 text-base md:text-lg mb-10 leading-relaxed">
            שאלות, תשובות, דיונים ורעיונות — הכל במקום אחד.
            מפתחים, ארכיטקטים ו-CTOs ברחבי ישראל.
            </p>
          </div>

          <div className="mt-10 md:mt-12 grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
            <div className="stat-card">
              <div className="stat-num">12K+</div>
              <div className="stat-label">MEMBERS</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">94K+</div>
              <div className="stat-label">THREADS</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">340K+</div>
              <div className="stat-label">POSTS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 md:py-12 px-6 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-4 mb-8 md:mb-10">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">// קטגוריות הפורום</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {loading && <div className="flex flex-col items-center justify-center py-12"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" /><span className="text-slate-400">טוען קטגוריות...</span></div>}
          {error && <div className="bg-rose-500/15 border border-rose-500/40 text-rose-400 px-5 py-3 rounded-lg">{error}</div>}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {categories.map((cat, idx) => {
                const id = cat.id || cat._id;
                const accentColors = ['#00e5ff', '#ff4081', '#4fff00', '#ff9800', '#9c27b0'];
                const accent = accentColors[idx % accentColors.length];
                const isExpanded = expandedId === id;
                const subs = subcategories[id] || [];
                const isLoadingSub = loadingSub[id];
                return (
                  <div key={id} 
                    className={`bg-white/2 border border-white/7 rounded-2xl overflow-hidden transition-all ${isExpanded ? "ring-2 ring-cyan-500/30" : ""}`}
                    style={{ animationDelay: `${idx * 0.05}s`, borderColor: `${accent}40` }}>
                    <div className="p-5 md:p-6 cursor-pointer hover:bg-white/3 transition-colors" onClick={(e) => handleCategoryClick(cat, e)}>
                      <div className="flex items-start gap-4 md:gap-5">
                        <span className="text-2xl flex-shrink-0">{getCategoryIcon(cat.name)}</span>
                        <div className="flex-1">
                          <div className="font-extrabold text-white text-[17px] leading-tight">{cat.name}</div>
                          {cat.description && <div className="text-slate-400 text-sm mt-1">{cat.description}</div>}
                          <div className="flex gap-2 mt-3">
                            {cat.postCount != null && <span className="text-xs px-2 py-1 bg-white/5 text-slate-300 rounded">{cat.postCount} פוסטים</span>}
                            {cat.topicCount != null && <span className="text-xs px-2 py-1 bg-white/5 text-slate-300 rounded">{cat.topicCount} נושאים</span>}
                          </div>
                        </div>
                        <span className={`text-2xl flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} style={{ color: accent }}>›</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="bg-white/1 border-t border-white/7 p-4">
                        {isLoadingSub ? (
                          <div className="flex items-center gap-2 justify-center py-4"><div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /><span className="text-xs text-slate-400">טוען...</span></div>
                        ) : isExpanded && subs.length === 0 ? (
                          <div className="text-center text-slate-400 text-sm py-4">אין קטגוריות משנה</div>
                        ) : (
                          <div className="space-y-2">
                            {subs.map((sub) => (
                              <a key={sub.id || sub._id}
                                href={`/category?categoryId=${sub.id || sub._id}`}
                                className="flex items-center gap-3 p-2 rounded hover:bg-white/3 transition-colors" style={{ borderLeftColor: `${accent}60` }}>
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                                <span className="text-slate-300 text-sm flex-1">{sub.name}</span>
                                {sub.postCount != null && <span className="text-xs text-slate-400">{sub.postCount}</span>}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-6 px-6 md:px-8 mt-12 text-center text-slate-400 text-sm">
        <div className="max-w-[1200px] mx-auto">© 2026 DevHub // כל הזכויות שמורות</div>
      </footer>
    </div>
  );
}