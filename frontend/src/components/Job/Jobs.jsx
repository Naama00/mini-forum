import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from "../MarkdownRenderer";
import { useAuth } from "../../hooks";
import { getToken, getLoggedInUserFromToken } from "../../utils/storage";

const API = "http://localhost:5000/api";

const JOB_TYPES = { fulltime: "משרה מלאה", parttime: "משרה חלקית", freelance: "פרילנס", internship: "סטאג'" };

function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return "היום";
  if (days === 1) return "אתמול";
  return `לפני ${days} ימים`;
}

export default function JobsPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);
      const res = await fetch(`${API}/jobs?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleLike = async (id) => {
    const token = getToken();
    if (!token) return navigate("/auth");
    try {
      const r = await fetch(`${API}/jobs/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await r.json();
      if (res.success) {
        setJobs(prev => prev.map(job => {
          if (job._id === id) {
            const userId = getLoggedInUserFromToken()?.id;
            const liked = job.likes?.includes(userId);
            return {
              ...job,
              likes: liked ? job.likes.filter(u => u !== userId) : [...(job.likes || []), userId],
              _liked: !liked
            };
          }
          return job;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const JOBS_STYLES = `
    .cyber-grid-jobs {
      position: fixed;
      inset: 0;
      background-image: radial-gradient(circle at 2px 2px, rgba(204, 255, 0, 0.02) 1px, transparent 0);
      background-size: 32px 32px;
      z-index: -1;
    }
    .ambient-glow-jobs {
      position: fixed;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(204, 255, 0, 0.03), transparent 70%);
      filter: blur(140px);
      z-index: -1;
      pointer-events: none;
    }
    .glass-job-card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(204, 255, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .glass-job-card:hover {
      border-color: rgba(204, 255, 0, 0.2);
      background: rgba(255, 255, 255, 0.03);
      transform: translateX(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(204, 255, 0, 0.02);
    }
    .neon-job-btn {
      background: #ccff00;
      color: #0a0a0c;
      transition: all 0.2s ease;
    }
    .neon-job-btn:hover {
      background: #bfff00;
      box-shadow: 0 0 15px rgba(204, 255, 0, 0.3);
    }
  `;

  return (
    <>
      <style>{JOBS_STYLES}</style>
      <div className="relative min-h-screen text-slate-200 pb-16" dir="rtl">
        <div className="cyber-grid-jobs" />
        <div className="ambient-glow-jobs top-40 right-20" />

        <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
          <Breadcrumb items={[{ label: "לוח משרות וקריירה", active: true }]} />

          {/* לוח עליון - כותרת וחיפוש */}
          <div className="glass-job-card p-8 md:p-10 rounded-3xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">לוח משרות הקהילה</h1>
              <p className="text-slate-400 text-sm max-w-xl font-light">משרות פיתוח, דאטה, DevOps וסייבר מחברות טכנולוגיה מובילות ומחברי הקהילה.</p>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="חפש תפקיד, חברה או טכנולוגיה..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all"
              />
              <button type="submit" className="absolute left-3 top-3.5 text-slate-500 hover:text-[#ccff00] text-xs font-mono">🔍</button>
            </form>
          </div>

          {/* סנן סוג משרה קבוע */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <button
              onClick={() => { setTypeFilter(""); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all border ${
                typeFilter === "" 
                  ? "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00] font-bold" 
                  : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
              }`}
            >
              // All_Positions
            </button>
            {Object.entries(JOB_TYPES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTypeFilter(key); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-sans transition-all border ${
                  typeFilter === key 
                    ? "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00] font-bold" 
                    : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* גוף הלוח */}
          {loading ? (
            <div className="text-center py-24 font-mono text-[#ccff00] animate-pulse text-xs tracking-widest">// DOWNLOADING HEADHUNTER INDEX...</div>
          ) : jobs.length === 0 ? (
            <div className="glass-job-card py-20 rounded-3xl text-center max-w-md mx-auto">
              <div className="text-slate-600 text-3xl mb-2">◇</div>
              <p className="text-slate-400 font-light text-sm">אין כרגע משרות זמינות בחתך שנבחר.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-10">
              {jobs.map(job => (
                <div key={job._id} className="glass-job-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* פרטי משרה */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] text-slate-500">{timeAgo(job.createdAt)}</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 text-[11px]">
                        {JOB_TYPES[job.type] || job.type}
                      </span>
                      {job.salary && <span className="text-xs text-[#ccff00]/80 font-mono">💰 {job.salary}</span>}
                    </div>

                    <Link to={`/jobs/${job._id}`} className="block focus:outline-none">
                      <h2 className="text-lg font-bold text-white hover:text-[#ccff00] transition-colors leading-snug">
                        {job.title}
                      </h2>
                    </Link>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-light">
                      <span className="font-medium text-slate-300">🏢 {job.company}</span>
                      <span>📍 {job.location}</span>
                    </div>

                    {job.description && (
                      <div className="text-xs text-slate-400 font-light line-clamp-2 leading-relaxed pt-1">
                        <MarkdownRenderer source={(job.description || "").slice(0, 140) + "..."} />
                      </div>
                    )}
                  </div>

                  {/* כפתורי פעולה צידיים */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    {job.applyLink && (
                      <a 
                        href={job.applyLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="neon-job-btn px-5 py-2.5 rounded-xl font-bold text-xs text-center whitespace-nowrap no-underline shadow-sm"
                      >
                        הגש מועמדות
                      </a>
                    )}
                    <button 
                      onClick={() => handleLike(job._id)} 
                      className={`px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs font-mono transition-all flex items-center gap-1 ${
                        job._liked ? "border-rose-500/20 text-rose-400 bg-rose-500/5" : "hover:text-rose-400 hover:border-rose-500/10"
                      }`}
                    >
                      ♥ {job.likes?.length || 0}
                    </button>
                  </div>

                </div>
              ))}

              {/* ניווט / עמודים */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 font-mono pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-9 h-9 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-sm disabled:opacity-30 hover:border-[#ccff00]/40 transition-colors"
                  >
                    ←
                  </button>
                  <span className="text-xs text-slate-500 px-2">עמוד {page} מתוך {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="w-9 h-9 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-sm disabled:opacity-30 hover:border-[#ccff00]/40 transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}