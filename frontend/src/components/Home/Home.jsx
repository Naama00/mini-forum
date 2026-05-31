import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Zap,
  Sparkles,
  Gauge,
  Radio,
} from "lucide-react";
import styles from'./Home.module.css';


const API_BASE = "http://localhost:5000";

function AnimatedCounter({ target }) {
  const isK = target.includes("K");
  const finalVal = parseInt(target.replace(/\D/g, ""), 10);

  const [display, setDisplay] = useState("0" + (isK ? "K" : ""));
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;

          const steps = 50;
          let step = 0;

          const timer = setInterval(() => {
            step++;

            const eased = 1 - Math.pow(1 - step / steps, 3);
            const current = Math.floor(finalVal * eased);

            setDisplay(current + (isK ? "K" : ""));

            if (step >= steps) {
              setDisplay(finalVal + (isK ? "K" : ""));
              clearInterval(timer);
            }
          }, 1200 / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [target, finalVal, isK]);

  return <span ref={ref}>{display}</span>;
}

export default function ForumHome() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Connection error");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleCategoryClick = async (cat, e) => {
    const id = cat.id || cat._id;

    if (!id) return;

    if (e.target.closest(".arrow-btn")) {
      e.preventDefault();

      if (expandedId === id) {
        setExpandedId(null);
        return;
      }

      setExpandedId(id);

      if (!subcategories[id]) {
        try {
          const res = await fetch(`${API_BASE}/api/categories/${id}`);
          const data = await res.json();

          setSubcategories((p) => ({
            ...p,
            [id]: data.data?.subCategories || [],
          }));
        } catch {
          // silent
        }
      }
    } else {
      navigate(`/category?categoryId=${id}`);
    }
  };

  return (
    <>
      <div className="page-shell">
        {/* Background */}
        <div className="home-bg-container">
          <div className="home-bg-blob home-bg-blob-1" />
          <div className="home-bg-blob home-bg-blob-2" />
          <div className="home-bg-blob home-bg-blob-3" />

          {/* Cursor Glow */}
          <div
            className="home-cursor-glow"
            style={{
              left: `${mousePos.x - 160}px`,
              top: `${mousePos.y - 160}px`,
            }}
          />

          {/* Grid */}
          <div className="home-grid-overlay" style={{ transform: `translateY(${scrollY * 0.5}px)` }} />
        </div>

        {/* Hero */}
        <section className="home-hero-section">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono text-cyan-400">
                  Real-Time Discussion Platform
                </span>
              </div>

              <h2 className="text-6xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="text-white">Where Developers</span>
                <br />
                <span className="home-gradient-text">
                  Build The Future
                </span>
              </h2>

              <p className="text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
                Join the next generation tech community. Explore advanced
                discussions, architecture, AI, web systems and innovation.
              </p>

              <div className="flex gap-4 flex-wrap">
                <button className="button-primary px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-cyan-500/30 duration-300">
                  <Zap className="w-5 h-5" />
                  Explore Discussions
                </button>

                <button className="button-secondary px-8 py-4 rounded-xl duration-300">
                  View Categories
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20">
              {[
                { label: "Discussions", val: "120K" },
                { label: "Developers", val: "15K" },
                { label: "Topics", val: "45K" },
                { label: "Communities", val: "400" },
              ].map((stat, i) => (
                <div key={i} className="home-stat-card">
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter target={stat.val} />
                    <span className="text-lg">+</span>
                  </div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="home-categories-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-cyan-500 to-violet-500" />
              <h3 className="text-3xl font-black text-white">
                Explore Categories
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="space-y-3 text-center">
                  <Zap className="w-8 h-8 text-cyan-400 animate-pulse mx-auto" />
                  <p className="text-sm font-mono uppercase tracking-widest text-slate-500">
                    Initializing database...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const id = cat.id || cat._id;
                  const isExpanded = expandedId === id;

                  return (
                    <div
                      key={id}
                      onClick={(e) => handleCategoryClick(cat, e)}
                      className={`home-category-card ${isExpanded ? 'expanded' : ''}`}
                    >
                      <div className="home-category-hover-glow" />
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-500" />

                      <div className="relative z-10 p-8">
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-300">
                                Active
                              </span>
                            </div>

                            <h4 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                              {cat.name}
                            </h4>

                            <p className="text-sm text-slate-400 line-clamp-2">
                              {cat.description || "Explore cutting-edge discussions in this category."}
                            </p>
                          </div>

                          <button
                            className="arrow-btn flex-shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-400 transition-all duration-300 hover:bg-cyan-500/20"
                            style={{
                              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
                            }}
                          >
                            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                          </button>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
                            <span>{cat.topicCount || 0} Topics</span>
                            <span className="text-cyan-400">Activity</span>
                          </div>

                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-1000"
                              style={{
                                width: `${Math.min(100, Math.max(10, (cat.topicCount || 0) / 2))}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-3 border-t border-slate-800 pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider text-slate-500">Discussions</span>
                            <span className="font-semibold text-white">{cat.topicCount || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider text-slate-500">Category</span>
                            <span className="text-sm font-medium text-cyan-300">{cat.name}</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-6 border-t border-slate-800 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="mb-3 text-xs uppercase tracking-widest text-slate-500 font-semibold">Subcategories</p>
                            <div className="space-y-2">
                              {(subcategories[id] || []).map((sub) => (
                                <Link
                                  key={sub._id}
                                  to={`/category?categoryId=${sub._id}`}
                                  className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all duration-200 hover:border-cyan-400/50 hover:bg-slate-800/50"
                                >
                                  <span className="text-sm font-medium text-slate-300">{sub.name}</span>
                                  <span className="text-xs font-semibold text-cyan-400">{sub.postCount || 0}</span>
                                </Link>
                              ))}
                            </div>
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

        {/* CTA */}
        <section className="home-cta-section">
          <div className="max-w-7xl mx-auto">
            <div className="home-cta-container">
              <div className="home-cta-content">
                <h3 className="text-4xl font-black text-white mb-4">Ready to join the future?</h3>
                <p className="text-lg text-slate-400 mb-8">Connect with developers, share ideas and explore advanced tech discussions.</p>
               <button className="button-primary px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-cyan-500/30 duration-300">
                  <Zap className="w-5 h-5" /> Start Exploring
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-lg font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              DEV.HUB
            </div>
            <div className="text-xs text-slate-600 font-mono uppercase tracking-wider">
              © {new Date().getFullYear()} Tech Community • v3.0
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}