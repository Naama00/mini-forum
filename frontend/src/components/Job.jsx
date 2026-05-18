import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import MarkdownRenderer from "./MarkdownRenderer";
import { useAuth } from "../hooks";
import { getToken } from "../utils/storage";

const API = "http://localhost:5000/api";

const JOB_TYPES = {
  fulltime: "משרה מלאה",
  parttime: "משרה חלקית",
  freelance: "פרילנס",
  internship: "סטאג'",
  remote: "עבודה מהבית"
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "היום";
  if (days === 1) return "אתמול";
  if (days < 30) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString("he-IL");
}

const JOB_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;400;700;800&display=swap');

  :root {
    --bg-dark: #0a0a0c;
    --accent-glow: #ccff00;
    --glass-bg: rgba(255, 255, 255, 0.03);
    --border-glass: rgba(204, 255, 0, 0.15);
  }

  .dh-grid-bg {
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle at 2px 2px, rgba(204, 255, 0, 0.05) 1px, transparent 0);
    background-size: 40px 40px;
    z-index: -1;
  }

  .ambient-glow {
    position: fixed;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(204, 255, 0, 0.08), transparent 70%);
    filter: blur(80px);
    z-index: -1;
    pointer-events: none;
  }

  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-glass);
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }
`;

export default function JobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = getToken();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const r = await fetch(`${API}/jobs/${id}`);
        if (!r.ok) throw new Error("נכשל בטעינת נתוני המשרה מהשרת");
        const res = await r.json();
        setJob(res.data ? res.data : res);
      } catch (err) {
        setError(err.message || "שגיאת רשת בטעינת המשרה");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-cyan-400 font-mono animate-pulse">FETCHING_JOB_SPEC...</div>;
  if (loading) return <div className="text-center py-32 font-mono text-[#ccff00] animate-pulse tracking-widest text-xs uppercase">// LOADING JOB...</div>;
  if (error || !job) return (
    <div className="max-w-md mx-auto my-20 p-8 bg-white/5 border border-red-500/20 rounded-2xl text-center backdrop-blur-md">
      <p className="text-red-400 font-bold mb-4">{error || "המשרה לא זמינה."}</p>
      <Link to="/jobs" className="inline-block px-5 py-2 bg-[#ccff00] text-black font-bold rounded-xl text-xs">חזרה לרשימה</Link>
    </div>
  );

  return (
    <>
      <style>{JOB_STYLES}</style>
      <div className="relative min-h-screen text-slate-200 pb-20" dir="rtl">
        <div className="dh-grid-bg" />
        <div className="ambient-glow top-0 right-10" />

        <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
          <Breadcrumb items={[{ label: "משרות", to: "/jobs" }, { label: job.title, active: true }]} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-8">
            
            {/* טור צדדי - מטא נתונים */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6 rounded-2xl text-center">
                <div className="text-sm font-bold text-[#ccff00] mb-2">💼 {JOB_TYPES[job.type] || job.type}</div>
                {job.salary && <div className="text-slate-400 text-xs mb-3">💰 {job.salary}</div>}
                <div className="text-sm font-bold text-white mb-1">{job.company}</div>
                <div className="text-xs font-mono text-slate-500">📍 {job.location || "מרחוק"}</div>
              </div>
            </div>

            {/* טור ראשי - תוכן המשרה */}
            <div className="lg:col-span-3 space-y-8">
              <article className="glass-card p-8 md:p-10 rounded-3xl">
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#ccff00] uppercase tracking-wider mb-4">
                  <span>// JOB_POSTING</span>
                  <span>•</span>
                  <span className="text-slate-500">{timeAgo(job.createdAt)}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-white mb-6">{job.title}</h1>
                
                <div className="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed mb-8">
                  <MarkdownRenderer source={job.description || ""} />
                </div>

                {job.requirements?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <h3 className="font-mono text-[10px] tracking-widest text-[#ccff00] uppercase mb-4">// דרישות</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex gap-2 items-start">
                          <span className="text-[#ccff00] flex-shrink-0">◈</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>

              {job.applyLink && (
                <div className="glass-card p-6 rounded-2xl text-center">
                  <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#ccff00] text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#bfff00] transition-all shadow-lg shadow-[#ccff00]/20">
                    שלח קורות חיים 📤
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}