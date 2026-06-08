import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from "../MarkdownRenderer";
import { useAuth } from "../../hooks";
import { getToken } from "../../utils/storage";
import { timeAgo } from "../../utils/formatters";

import { API_BASE_URL as API } from "../../utils/constants";
const JOB_TYPES = { fulltime: "משרה מלאה", parttime: "משרה חלקית", freelance: "פרילנס", internship: "סטאג'", remote: "עבודה מהבית" };

export default function JobPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const r = await fetch(`${API}/jobs/${id}`);
        if (!r.ok) throw new Error("נכשל בטעינת המשרה");
        const res = await r.json();
        setJob(res.data ? res.data : res);
      } catch (err) {
        setError(err.message || "שגיאת רשת");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">טוען משרה...</div>;

  if (error || !job) return (
    <div className="page-shell flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
        <p className="text-red-400 mb-6">{error || "המשרה לא נמצאה"}</p>
        <Link to="/jobs" className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold">
          חזרה למשרות
        </Link>
      </div>
    </div>
  );

  const isAuthor = job.author?._id === user?._id || job.author === user?._id;

  return (
    <div dir="rtl" className="page-shell">
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-10">
          <Breadcrumb items={[{ label: "משרות", to: "/jobs" }, { label: job.title, active: true }]} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="section-card section-card-md">
              <h3 className="text-sm font-bold text-white mb-4">פרטי המשרה</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">חברה</p>
                  <p className="text-slate-200 font-semibold">{job.company}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">סוג משרה</p>
                  <p className="text-cyan-300">{JOB_TYPES[job.type] || job.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">מיקום</p>
                  <p className="text-slate-200">{job.location || "מרחוק"}</p>
                </div>
                {job.salary && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">שכר</p>
                    <p className="text-slate-200">{job.salary}</p>
                  </div>
                )}
              </div>

              {job.applyLink && (
                <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="button-primary w-full text-center mt-5 block no-underline">
                  שלח קורות חיים 📤
                </a>
              )}

              {isAuthor && (
                <Link to={`/jobs/${id}/edit`} className="button-secondary w-full text-center mt-3 block">
                  ערוך משרה
                </Link>
              )}
            </div>

            {job.tags?.length > 0 && (
              <div className="section-card section-card-md">
                <h3 className="text-sm font-bold text-white mb-4">טכנולוגיות</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="lg:col-span-3 space-y-8">
            <article className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 md:p-12">
              <div className="flex items-center gap-3 text-sm text-cyan-300 mb-5">
                <span>{JOB_TYPES[job.type] || job.type}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500">{timeAgo(job.createdAt)}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-8">{job.title}</h1>
              <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white">
                <MarkdownRenderer source={job.description || ""} />
              </div>

              {job.requirements?.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <h3 className="text-lg font-bold text-white mb-4">דרישות התפקיד</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-300">
                        <span className="text-cyan-400 flex-shrink-0">◈</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}