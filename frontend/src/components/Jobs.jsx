import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import MarkdownRenderer from "./MarkdownRenderer";

const API = "http://localhost:5000/api";

const JOB_TYPES = { fulltime: "משרה מלאה", parttime: "משרה חלקית", freelance: "פרילנס", internship: "סטאז'" };

function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return "היום";
  if (days === 1) return "אתמול";
  return `לפני ${days} ימים`;
}

export default function JobsPage() {
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalPages(data.pages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [page, typeFilter]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchJobs(); };

  const handleLike = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    const res = await fetch(`${API}/jobs/${id}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setJobs(prev => prev.map(j => j._id === id ? { ...j, likes: Array(data.likes).fill(null), _liked: data.liked } : j));
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <Breadcrumb />
      <div className="py-13 relative z-1 rtl">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-7">
          <div>
            <p className="font-mono text-xs tracking-widest text-cyan-500 uppercase mb-2.5">// משרות</p>
            <h1 className="text-4xl font-black text-white mb-2 leading-tight">הזדמנויות <span className="text-cyan-500">קריירה</span> בהייטק</h1>
            <p className="text-sm text-gray-400 leading-relaxed">משרות מפותחים עבור מפותחים — ללא דמי תיווך</p>
          </div>
          <Link to="/jobs/new" className="inline-flex items-center gap-2 px-5.5 py-2.75 bg-transparent border border-cyan-500 text-cyan-500 font-sans text-xs font-bold no-underline uppercase tracking-widest cursor-pointer transition-all hover:bg-cyan-500 hover:text-gray-900 hover:shadow-lg hover:shadow-cyan-500/50 whitespace-nowrap">+ פרסם משרה</Link>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-3 flex-wrap mb-5 rtl">
          <div className="flex items-center gap-2.5 bg-white/3 border border-white/8 px-4 py-2.5 flex-1 min-w-56 max-w-96 transition-all focus-within:border-cyan-500 focus-within:shadow-lg focus-within:shadow-cyan-500/50 focus-within:bg-white/5">
            <span className="text-cyan-500/50 text-base flex-shrink-0">🔍</span>
            <input className="bg-none border-none outline-none text-gray-100 font-sans text-sm w-full rtl placeholder:text-gray-600" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי תפקיד, חברה..." />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-cyan-500 text-gray-900 border-none font-sans text-xs font-bold cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/50 flex-shrink-0">חפש</button>
        </form>
      </div>

      <div className="flex gap-2 flex-wrap mb-7 rtl">
        <button className={`px-3.5 py-1.25 bg-white/3 border border-white/8 text-gray-400 font-sans text-xs font-semibold cursor-pointer transition-all tracking-wide ${!typeFilter ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500 hover:text-cyan-500"}`} onClick={() => { setTypeFilter(""); setPage(1); }}>הכל</button>
        {Object.entries(JOB_TYPES).map(([val, label]) => (
          <button key={val} className={`px-3.5 py-1.25 bg-white/3 border border-white/8 text-gray-400 font-sans text-xs font-semibold cursor-pointer transition-all tracking-wide ${typeFilter === val ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500 hover:text-cyan-500"}`} onClick={() => { setTypeFilter(val); setPage(1); }}>{label}</button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 rtl">
        <div className="flex-1 h-px bg-cyan-500/10" />
        <span className="font-mono text-xs tracking-wide text-cyan-500/50">// {jobs.length} משרות</span>
        <div className="flex-1 h-px bg-cyan-500/10" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm font-mono">טוען משרות...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-600 text-sm"><div className="text-4xl mb-3 opacity-30">💼</div>אין משרות עדיין</div>
      ) : (
        <div className="flex flex-col gap-2.5 rtl">
          {jobs.map(job => <JobRow key={job._id} job={job} onLike={handleLike} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10 rtl">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 bg-white/3 border border-white/8 text-gray-400 font-sans text-sm font-semibold cursor-pointer transition-all ${p === page ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500 hover:text-cyan-500"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function JobRow({ job, onLike }) {
  return (
    <div className="bg-gradient-to-br from-white/2 to-cyan-500/1 border border-cyan-500/8 px-7 py-5.5 flex justify-between items-start gap-5 relative transition-all duration-350 animate-slide-in-right rtl shadow-lg hover:border-cyan-500/20 hover:bg-gradient-to-br hover:from-white/5 hover:to-cyan-500/2 hover:-translate-x-0.75 hover:shadow-2xl hover:shadow-cyan-500/8 group">
      <div className="absolute right-0 top-0 bottom-0 w-0.75 bg-cyan-500 scale-y-0 transition-transform group-hover:scale-y-100" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap mb-2 rtl">
          <span className="font-mono text-xs px-2.5 py-0.75 border border-cyan-500/20 text-cyan-500 bg-cyan-500/5 tracking-wide">{JOB_TYPES[job.type] || job.type}</span>
          {job.tags?.slice(0, 3).map(tag => <span key={tag} className="font-mono text-xs px-2 py-0.5 bg-white/4 border border-white/6 text-gray-600">#{tag}</span>)}
          <span className="font-mono text-xs text-gray-600 mr-auto">{timeAgo(job.createdAt)}</span>
        </div>
        <Link to={`/jobs/${job._id}`} className="font-sans text-base font-bold text-white no-underline block mb-1 leading-relaxed transition-colors hover:text-cyan-500">{job.title}</Link>
        <p className="font-sans text-sm font-semibold text-cyan-500 mb-2">{job.company}</p>
        <div className="flex gap-5 mb-3 rtl flex-wrap">
          <span className="text-xs text-gray-400 flex items-center gap-1">📍 {job.location}</span>
          {job.salary && <span className="text-xs text-gray-400 flex items-center gap-1">💰 {job.salary}</span>}
        </div>
        <div className="text-sm text-gray-400 leading-relaxed"><MarkdownRenderer source={(job.description || "").slice(0, 120) + (job.description && job.description.length > 120 ? "..." : "")} /></div>
      </div>
      <div className="flex flex-col items-end gap-3 flex-shrink-0 min-w-32">
        {job.applyLink && (
          <a href={job.applyLink} target="_blank" rel="noreferrer" className="block px-5 py-2.5 bg-cyan-500 text-gray-900 no-underline font-sans text-xs font-bold text-center whitespace-nowrap transition-all border border-cyan-500 hover:bg-transparent hover:text-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50">הגש מועמדות</a>
        )}
        <div className="flex gap-3 items-center">
          <button className={`bg-none border-none cursor-pointer text-gray-400 text-xs flex items-center gap-1 px-0 transition-colors hover:text-rose-500 font-sans ${job._liked ? "text-rose-500 hover:text-rose-500" : ""}`} onClick={() => onLike(job._id)}>
            ♥ {job.likes?.length || 0}
          </button>
          <Link to={`/jobs/${job._id}`} className="text-xs text-gray-400 no-underline flex items-center gap-1 transition-colors hover:text-cyan-500 font-sans">💬 {job.comments?.length || 0}</Link>
        </div>
      </div>
    </div>
  );
}