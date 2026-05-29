import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from "../MarkdownRenderer";
import { useAuth } from "../../hooks";
import { getToken, getLoggedInUserFromToken } from "../../utils/storage";
import { timeAgo } from "../../utils/formatters";

const API = "http://localhost:5000/api";
const JOB_TYPES = { fulltime: "משרה מלאה", parttime: "משרה חלקית", freelance: "פרילנס", internship: "סטאג'" };

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
      const res = await fetch(`${API}/jobs?${params}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalPages(data.pages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [page, typeFilter]);

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(1); fetchJobs(); };

  const handleLike = async (id) => {
    const token = getToken();
    if (!token) return navigate("/auth");
    try {
      const r = await fetch(`${API}/jobs/${id}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const res = await r.json();
      if (res.success) {
        setJobs(prev => prev.map(job => {
          if (job._id !== id) return job;
          const userId = getLoggedInUserFromToken()?.id;
          const liked = job.likes?.includes(userId);
          return { ...job, likes: liked ? job.likes.filter(u => u !== userId) : [...(job.likes || []), userId], _liked: !liked };
        }));
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="page-shell" dir="rtl">
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-sm text-cyan-300 font-medium">JOBS</span>
            </div>
            <h1 className="text-5xl font-black mb-4">
              <span className="text-white">Tech</span> <span className="text-gradient">Jobs</span>
            </h1>
            <p className="text-slate-400 max-w-xl">משרות פיתוח, דאטה, DevOps וסייבר מחברות טכנולוגיה מובילות ומחברי הקהילה.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="חפש תפקיד, חברה או טכנולוגיה..."
                className="bg-slate-900/70 border border-slate-700 rounded-2xl py-3 px-4 text-slate-200 outline-none focus:border-cyan-400 transition-all"
              />
              <button type="submit" className="button-primary">חיפוש</button>
            </form>
            {isLoggedIn && (
              <button onClick={() => navigate("/jobs/new")} className="button-secondary">+ משרה חדשה</button>
            )}
          </div>
        </div>

        <div className="mb-10">
          <Breadcrumb items={[{ label: "לוח משרות וקריירה", active: true }]} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[{ key: "", label: "הכל" }, ...Object.entries(JOB_TYPES).map(([k, v]) => ({ key: k, label: v }))].map(t => (
            <button
              key={t.key}
              onClick={() => { setTypeFilter(t.key); setPage(1); }}
              className={`px-5 py-2 rounded-2xl text-sm font-semibold transition-all border ${
                typeFilter === t.key
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                  : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-cyan-500/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">טוען משרות...</div>
        ) : jobs.length === 0 ? (
          <div className="card-empty">
            <p className="text-slate-400">אין כרגע משרות זמינות בחתך שנבחר.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job._id} className="group section-card section-card-md section-shadow-hover flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
                        {JOB_TYPES[job.type] || job.type}
                      </span>
                      <span className="text-xs text-slate-500">{timeAgo(job.createdAt)}</span>
                      {job.salary && <span className="text-xs text-slate-300 font-mono">💰 {job.salary}</span>}
                    </div>

                    <Link to={`/jobs/${job._id}`}>
                      <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                        {job.title}
                      </h2>
                    </Link>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="font-semibold text-slate-300">🏢 {job.company}</span>
                      <span>📍 {job.location}</span>
                    </div>

                    {job.description && (
                      <div className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                        <MarkdownRenderer source={(job.description || "").slice(0, 140) + "..."} />
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col items-center gap-3 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                    {job.applyLink && (
                      <a href={job.applyLink} target="_blank" rel="noreferrer" className="button-primary text-sm px-5 py-2 no-underline">
                        הגש מועמדות
                      </a>
                    )}
                    <button
                      onClick={() => handleLike(job._id)}
                      className={`flex items-center gap-1 text-slate-400 hover:text-pink-400 transition-colors ${job._liked ? "text-pink-400" : ""}`}
                    >
                      ♥ <span>{job.likes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-14 flex-wrap">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-11 h-11 rounded-2xl border transition-all ${
                      page === i + 1
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                        : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-cyan-500/50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}