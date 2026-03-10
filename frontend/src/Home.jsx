import { useState, useEffect } from "react";
import "./css/style.css";
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
    <>
      <link rel="stylesheet" href="/styles.css" />
      <div className="forum-root">
        <div className="grid-overlay" />
        <div className="glow-orb glow-1" />
        <div className="glow-orb glow-2" />

        <header className="header">
          <div className="container">
            <div className="header-inner">
              <a href="/" className="logo">
                <div className="logo-mark" />
                <span className="logo-text">Dev<span>Hub</span></span>
              </a>
              <nav>
                <ul className="nav-links">
                  <li><a href="#">פורום</a></li>
                  <li><a href="#">מאמרים</a></li>
                  <li><a href="#">אירועים</a></li>
                  <li><a href="#">משרות</a></li>
                </ul>
              </nav>
              {!user && (
                <button className="header-cta" onClick={() => window.location.href = "/auth"}>
                  הרשמה / כניסה
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="hero">
          <div className="container">
            <div className="hero-label">TECH FORUM // קהילת הייטק ישראלית</div>
            <h1 className="hero-title">
              הקהילה <span className="accent">הטכנולוגית</span><br />שחיכית לה
            </h1>
            <p className="hero-sub">
              שאלות, תשובות, דיונים ורעיונות — הכל במקום אחד.
              מפתחים, ארכיטקטים ו-CTOs ברחבי ישראל.
            </p>
            <div className="stats-row">
              <div className="stat"><span className="stat-num">12K+</span><span className="stat-label">MEMBERS</span></div>
              <div className="stat"><span className="stat-num">94K+</span><span className="stat-label">THREADS</span></div>
              <div className="stat"><span className="stat-num">340K+</span><span className="stat-label">POSTS</span></div>
            </div>
          </div>
        </section>

        <section className="categories-section">
          <div className="container">
            <div className="section-divider">
              <div className="section-divider-line" />
              <span className="section-divider-text">// קטגוריות הפורום</span>
              <div className="section-divider-line" />
            </div>

            {loading && <div className="state-center"><div className="big-spinner" /><span>טוען קטגוריות...</span></div>}
            {error && <div className="state-center"><div className="error-box">{error}</div></div>}

            {!loading && !error && (
              <div className="categories-grid">
                {categories.map((cat, idx) => {
                  const id = cat.id || cat._id;
                  const accent = accentColors[idx % accentColors.length];
                  const isExpanded = expandedId === id;
                  const subs = subcategories[id] || [];
                  const isLoadingSub = loadingSub[id];
                  return (
                    <div key={id} className={`cat-card${isExpanded ? " expanded" : ""}`}
                      style={{ "--accent": accent, animationDelay: `${idx * 0.05}s` }}>
                      <div className="cat-card-inner" onClick={(e) => handleCategoryClick(cat, e)}>
                        <span className="cat-icon">{getCategoryIcon(cat.name)}</span>
                        <div className="cat-info">
                          <div className="cat-name">{cat.name}</div>
                          {cat.description && <div className="cat-desc">{cat.description}</div>}
                          <div className="cat-meta">
                            {cat.postCount != null && <span className="cat-badge">{cat.postCount} פוסטים</span>}
                            {cat.topicCount != null && <span className="cat-badge">{cat.topicCount} נושאים</span>}
                          </div>
                        </div>
                        <span className="cat-arrow">›</span>
                      </div>
                      <div className={`sub-panel${isExpanded ? " open" : ""}`}>
                        {isLoadingSub ? (
                          <div className="sub-loading"><div className="spinner" /><span>טוען...</span></div>
                        ) : isExpanded && subs.length === 0 ? (
                          <div className="sub-empty">אין קטגוריות משנה</div>
                        ) : (
                          <div className="sub-list">
                            {subs.map((sub) => (
                              <a key={sub.id || sub._id}
                                href={`/category?categoryId=${sub.id || sub._id}`}
                                className="sub-item" style={{ "--accent": accent }}>
                                <span className="sub-dot" />
                                <span className="sub-name">{sub.name}</span>
                                {sub.postCount != null && <span className="sub-count">{sub.postCount}</span>}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <footer className="footer">
          <div className="container">© 2026 DevHub // כל הזכויות שמורות</div>
        </footer>
      </div>
    </>
  );
}