import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks";

const API_BASE = "http://localhost:5000";

/* ─── helpers ─────────────────────────────────────────────────── */
function getCategoryIcon(name = "") {
  const l = name.toLowerCase();
  if (l.includes("ai") || l.includes("machine")) return "◈";
  if (l.includes("web") || l.includes("frontend")) return "▣";
  if (l.includes("mobile")) return "📱";
  if (l.includes("security")) return "🔐";
  if (l.includes("devops")) return "⚙";
  return "◓";
}

// פלטת צבעים עתידנית: צהוב זוהר וירוק חומצה
const ACCENTS = ["#ccff00", "#d4ff3f", "#e5ff80", "#bfff00"];

/* ─── animated counter ───────────────────────────────────────── */
function AnimatedCounter({ target }) {
  const isK = target.includes("K");
  const finalVal = parseInt(target.replace(/\D/g, ""), 10);
  const [display, setDisplay] = useState("0" + (isK ? "K" : ""));
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 50;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const eased = 1 - Math.pow(1 - step / steps, 3);
          const current = Math.floor(finalVal * eased);
          setDisplay(current + (isK ? "K" : ""));
          if (step >= steps) { setDisplay(finalVal + (isK ? "K" : "")); clearInterval(timer); }
        }, 1200 / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, finalVal, isK]);

  return <span ref={ref}>{display}</span>;
}

/* ─── CSS CUSTOM — הלב של העיצוב העתידני ──────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;400;700;800&display=swap');

  :root {
    --bg-dark: #0a0a0c;
    --accent-glow: #ccff00;
    --glass-bg: rgba(255, 255, 255, 0.03);
    --border-glass: rgba(204, 255, 0, 0.15);
  }

  body { 
    background-color: var(--bg-dark) !important; 
    font-family: 'Assistant', sans-serif;
    color: #e2e8f0;
  }

  /* אפקט הטשטוש בכותרת (Masking) */
  .fade-out-text {
    background: linear-gradient(to bottom, #fff 40%, rgba(255, 255, 255, 0));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* רקע רשת עתידני */
  .dh-grid-bg {
    position: fixed;
    inset: 0;
    background-image: 
      radial-gradient(circle at 2px 2px, rgba(204, 255, 0, 0.05) 1px, transparent 0);
    background-size: 40px 40px;
    z-index: -1;
  }

  /* תאורת אווירה צדדית */
  .ambient-glow {
    position: fixed;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(204, 255, 0, 0.08), transparent 70%);
    filter: blur(80px);
    z-index: -1;
    pointer-events: none;
  }

  /* כרטיס זכוכית עתידני */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-glass);
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .glass-card:hover {
    background: rgba(204, 255, 0, 0.05);
    border-color: var(--accent-glow);
    box-shadow: 0 0 30px rgba(204, 255, 0, 0.1);
    transform: translateY(-5px);
  }

  /* אנימציית דופק לנקודה החיה */
  @keyframes livePulse {
    0% { box-shadow: 0 0 0 0px rgba(204, 255, 0, 0.4); }
    100% { box-shadow: 0 0 0 10px rgba(204, 255, 0, 0); }
  }
  .live-pulse {
    animation: livePulse 2s infinite;
  }

  /* כפתור ניאון */
  .neon-btn {
    border: 1px solid var(--accent-glow);
    color: var(--accent-glow);
    text-shadow: 0 0 8px rgba(204, 255, 0, 0.5);
    box-shadow: inset 0 0 10px rgba(204, 255, 0, 0.1);
    transition: 0.3s;
  }
  .neon-btn:hover {
    background: var(--accent-glow);
    color: #000;
    box-shadow: 0 0 20px var(--accent-glow);
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--accent-glow); border-radius: 10px; }
`;

/* ─── main ───────────────────────────────────────────────────── */
export default function ForumHome() {
  const [categories, setCategories] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setCategories(res.data);
        setLoading(false);
      })
      .catch(() => { setError("שגיאת תקשורת עם ה-Mainframe"); setLoading(false); });
  }, []);

  const handleCategoryClick = async (cat, e) => {
    const id = cat.id || cat._id;
    if (e.target.closest(".arrow-btn")) {
      e.preventDefault();
      if (expandedId === id) { setExpandedId(null); return; }
      setExpandedId(id);
      if (!subcategories[id]) {
        try {
          const res = await fetch(`${API_BASE}/api/categories/${id}`);
          const data = await res.json();
          setSubcategories(p => ({ ...p, [id]: data.data?.subCategories || [] }));
        } catch { }
      }
    } else {
      window.location.href = `/category?categoryId=${id}`;
    }
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      
      <div className="relative min-h-screen overflow-hidden" dir="rtl">
        {/* Background Layers */}
        <div className="dh-grid-bg" />
        <div className="ambient-glow -top-20 -left-20" />
        <div className="ambient-glow bottom-0 right-0 opacity-50" />

        {/* ── HERO SECTION ── */}
        <section className="relative z-10 px-6 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-10 border rounded-full border-white/10 bg-white/5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]"></span>
              </span>
              <span className="text-[10px] font-bold tracking-[3px] uppercase text-[#ccff00]">System Online</span>
            </div>

            {/* Title עם אפקט הטשטוש המבוקש */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="block">העתיד של</span>
              <span className="fade-out-text block italic">הטכנולוגיה</span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light">
              זירת הדיונים המתקדמת למפתחי המחר. קוד, ארכיטקטורה, וחדשנות ישראלית.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { label: "דיונים", val: "120K" },
                { label: "מפתחים", val: "15K" },
                { label: "משרות", val: "400" }
              ].map((s, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl">
                  <div className="text-2xl md:text-4xl font-bold text-[#ccff00] mb-1">
                    <AnimatedCounter target={s.val} />+
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="relative z-10 px-6 pb-32">
          <div className="max-w-6xl mx-auto">
            
            <div className="flex items-center gap-6 mb-16">
              <h2 className="text-[#ccff00] font-bold text-sm tracking-widest uppercase">Select Terminal</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#ccff0033] to-transparent" />
            </div>

            {loading ? (
              <div className="text-center py-20 text-[#ccff00] animate-pulse font-mono uppercase tracking-tighter">Initializing Database...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, idx) => {
                  const id = cat.id || cat._id;
                  const isExpanded = expandedId === id;
                  return (
                    <div
                      key={id}
                      onClick={(e) => handleCategoryClick(cat, e)}
                      className={`glass-card group relative p-8 rounded-3xl cursor-pointer ${isExpanded ? 'ring-1 ring-[#ccff00]' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#ccff00]/10 flex items-center justify-center text-2xl border border-[#ccff00]/20 group-hover:bg-[#ccff00] group-hover:text-black transition-colors duration-500">
                          {getCategoryIcon(cat.name)}
                        </div>
                        <button className="arrow-btn p-2 hover:bg-white/5 rounded-full transition-transform" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccff00" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#ccff00] transition-colors">{cat.name}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">{cat.description || "חקור את חזית הטכנולוגיה בקטגוריה זו."}</p>
                      
                      <div className="flex gap-4 border-t border-white/5 pt-6">
                        <div className="text-[10px] font-mono text-slate-500 uppercase">Topics: <span className="text-white">{cat.topicCount || 0}</span></div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">Active: <span className="text-white">LIVE</span></div>
                      </div>

                      {/* Subcategories Expandable */}
                      {isExpanded && (
                        <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-2">
                          {(subcategories[id] || []).map(sub => (
                            <a key={sub._id} href={`/category?categoryId=${sub._id}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-[#ccff00]/10 border border-transparent hover:border-[#ccff00]/30 transition-all">
                              <span className="text-sm text-slate-300">{sub.name}</span>
                              <span className="text-[10px] text-[#ccff00]">{sub.postCount || 0}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="relative z-10 py-12 border-t border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[#ccff00] font-black text-2xl tracking-tighter">DEV.HUB</div>
            <div className="text-slate-600 text-xs font-mono uppercase tracking-widest">
              © {new Date().getFullYear()} Israel Tech Community // v2.0.4
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}