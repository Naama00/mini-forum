import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import "../css/Jobs.css";
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
    <div className="main">
      <Breadcrumb />
      <div className="jobs-header">
        <div className="jobs-header-top">
          <div>
            <p className="jobs-section-label">// משרות</p>
            <h1 className="jobs-title">הזדמנויות <span>קריירה</span> בהייטק</h1>
            <p className="jobs-subtitle">משרות מפותחים עבור מפותחים — ללא דמי תיווך</p>
          </div>
          <Link to="/jobs/new" className="post-job-btn">+ פרסם משרה</Link>
        </div>
        <form onSubmit={handleSearch} className="jobs-toolbar">
          <div className="jobs-search">
            <span className="jobs-search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי תפקיד, חברה..." />
          </div>
          <button type="submit" className="jobs-search-btn">חפש</button>
        </form>
      </div>

      <div className="jobs-type-filters">
        <button className={`type-filter-btn${!typeFilter ? " active" : ""}`} onClick={() => { setTypeFilter(""); setPage(1); }}>הכל</button>
        {Object.entries(JOB_TYPES).map(([val, label]) => (
          <button key={val} className={`type-filter-btn${typeFilter === val ? " active" : ""}`} onClick={() => { setTypeFilter(val); setPage(1); }}>{label}</button>
        ))}
      </div>

      <div className="jobs-divider">
        <div className="jobs-divider-line" />
        <span className="jobs-divider-text">// {jobs.length} משרות</span>
        <div className="jobs-divider-line" />
      </div>

      {loading ? (
        <div className="jobs-loading">טוען משרות...</div>
      ) : jobs.length === 0 ? (
        <div className="jobs-empty"><div className="jobs-empty-icon">💼</div>אין משרות עדיין</div>
      ) : (
        <div className="jobs-list">
          {jobs.map(job => <JobRow key={job._id} job={job} onLike={handleLike} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="jobs-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`page-btn${p === page ? " active" : ""}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function JobRow({ job, onLike }) {
  return (
    <div className="job-row">
      <div className="job-row-main">
        <div className="job-row-top">
          <span className="job-type-badge">{JOB_TYPES[job.type] || job.type}</span>
          {job.tags?.slice(0, 3).map(tag => <span key={tag} className="job-tag">#{tag}</span>)}
          <span className="job-time">{timeAgo(job.createdAt)}</span>
        </div>
        <Link to={`/jobs/${job._id}`} className="job-row-title">{job.title}</Link>
        <p className="job-row-company">{job.company}</p>
        <div className="job-row-meta">
          <span className="job-meta-item">📍 {job.location}</span>
          {job.salary && <span className="job-meta-item">💰 {job.salary}</span>}
        </div>
        <div className="job-row-desc"><MarkdownRenderer source={(job.description || "").slice(0, 120) + (job.description && job.description.length > 120 ? "..." : "")} /></div>
      </div>
      <div className="job-row-actions">
        {job.applyLink && (
          <a href={job.applyLink} target="_blank" rel="noreferrer" className="job-apply-btn">הגש מועמדות</a>
        )}
        <div className="job-row-stats">
          <button className={`job-like-btn${job._liked ? " liked" : ""}`} onClick={() => onLike(job._id)}>
            ♥ {job.likes?.length || 0}
          </button>
          <Link to={`/jobs/${job._id}`} className="job-comments-link">💬 {job.comments?.length || 0}</Link>
        </div>
      </div>
    </div>
  );
}