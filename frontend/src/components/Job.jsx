import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import MarkdownEditor from "./MarkdownEditor";
import MarkdownRenderer from "./MarkdownRenderer";

const API = "http://localhost:5000/api";

const JOB_TYPES = {
  fulltime: "משרה מלאה",
  parttime: "משרה חלקית",
  freelance: "פרילנס",
  internship: "סטאז'"
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "היום";
  if (days === 1) return "אתמול";
  if (days < 30) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString("he-IL");
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

export default function JobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const user = getUser();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/jobs/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) { setError("המשרה לא נמצאה"); return; }
        const data = await res.json();
        setJob(data);
      } catch {
        setError("שגיאה בטעינת המשרה");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleLike = async () => {
    if (!token) return navigate("/login");
    const res = await fetch(`${API}/jobs/${id}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setJob(prev => ({
      ...prev,
      likes: Array(data.likes).fill(null),
      _liked: data.liked
    }));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!token || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`${API}/jobs/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });
      const newComment = await res.json();
      setJob(prev => ({ ...prev, comments: [...prev.comments, newComment] }));
      setCommentText("");
    } catch {
      console.error("שגיאה בשליחת תגובה");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return;
    try {
      await fetch(`${API}/jobs/${id}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setJob(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }));
    } catch { console.error("שגיאה במחיקת תגובה"); }
  };

  if (loading) return <div className="main"><div className="text-center py-20 text-slate-200/40 text-sm font-mono rtl">// טוען משרה...</div></div>;
  if (error) return <div className="main"><div className="text-center py-20 text-slate-200/40 text-sm font-mono rtl">⚠ {error}</div></div>;
  if (!job) return null;

  const isLiked = job._liked || (user && job.likes?.some(l => l === user._id || l?._id === user._id));
  const isAuthor = user && job.author?._id === user._id;

  return (
    <div className="main rtl">
       <Breadcrumb customNames={{ [id]: job?.title }} />
      <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-200/40 no-underline font-mono text-xs px-0 pt-8 hover:text-cyan-500 transition-colors rtl">← חזרה למשרות</Link>

      {/* ── Header ── */}
      <div className="py-7 px-0 border-b border-cyan-500/8 mb-8 relative z-10 rtl">
        <div className="flex gap-2 flex-wrap mb-3.5 rtl">
          <span className="font-mono text-xs px-2.5 py-0.75 bg-cyan-500/7 border border-cyan-500/15 text-cyan-500/70 tracking-widest">{JOB_TYPES[job.type] || job.type}</span>
          {job.tags?.map(tag => (
            <span key={tag} className="font-mono text-2.5 px-2.5 py-0.75 bg-cyan-500/7 border border-cyan-500/15 text-cyan-500/70 tracking-widest">#{tag}</span>
          ))}
        </div>

        <h1 className="text-4xl font-black text-white m-0 mb-2 leading-snug">{job.title}</h1>
        <p className="text-slate-200/60 text-lg mb-5 font-sans">{job.company}</p>

        <div className="flex gap-6 flex-wrap mb-6 rtl">
          <div className="flex items-center gap-1 text-sm text-slate-200/40">📍 <strong className="text-white">{job.location}</strong></div>
          {job.salary && <div className="flex items-center gap-1 text-sm text-slate-200/40">💰 <strong className="text-white">{job.salary}</strong></div>}
          <div className="flex items-center gap-1 text-sm text-slate-200/40">🕐 <strong className="text-white">פורסם {timeAgo(job.createdAt)}</strong></div>
          <div className="flex items-center gap-1 text-sm text-slate-200/40">♥ <strong className="text-white">{job.likes?.length || 0} לייקים</strong></div>
        </div>

        <div className="flex gap-2.5 flex-wrap rtl">
          {job.applyLink ? (
            <a href={job.applyLink} target="_blank" rel="noreferrer" className="job-apply-btn">
              הגש מועמדות ←
            </a>
          ) : (
            <button
                className="px-7 py-2.75 transition-all font-bold uppercase tracking-widest text-sm font-sans border border-cyan-500 bg-transparent text-cyan-500 hover:bg-cyan-500 hover:text-gray-950 hover:shadow-lg hover:shadow-cyan-500/20"
                onClick={() => document.querySelector(".md-textarea")?.focus()}
              >
                פנה דרך תגובה ↓
              </button>
          )}
          <button className={`px-5 py-2.75 transition-all font-sans text-sm flex items-center gap-1.75 ${isLiked ? "text-rose-500 border-rose-500/30 bg-rose-500/5 border" : "bg-white/3 border border-white/8 text-slate-200/40 hover:text-rose-500 hover:border-rose-500"}`} onClick={handleLike}>
            ♥ {job.likes?.length || 0}
          </button>
          {isAuthor && (
            <Link to={`/jobs/${id}/edit`} className="px-5 py-2.75 bg-transparent border border-white/10 text-slate-200/40 font-sans text-sm no-underline transition-all hover:border-cyan-500 hover:text-cyan-500 inline-flex items-center">עריכה</Link>
          )}
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="grid grid-cols-[1fr_260px] gap-8 items-start rtl">

        {/* תוכן + תגובות */}
        <div>
          {/* תיאור */}
          <p className="font-mono text-xs tracking-widest text-cyan-500/50 mb-4">// תיאור המשרה</p>
          <div className="text-slate-200/80 leading-relaxed mb-8 animate-fade-in"><MarkdownRenderer source={job.description} /></div>

          {/* דרישות */}
          {job.requirements?.filter(r => r.trim()).length > 0 && (
            <div className="mb-8">
              <p className="font-mono text-xs tracking-widest text-cyan-500/50 mb-4">// דרישות התפקיד</p>
              <div className="flex flex-col gap-2">
                {job.requirements.filter(r => r.trim()).map((req, i) => (
                  <div key={i} className="flex items-start gap-3 rtl">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                    <span className="text-slate-200/75">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* תגובות */}
          <div className="mt-12 rtl">
            <div className="flex items-center gap-3 mb-7">
              <div className="flex-1 h-px bg-cyan-500/10" />
              <span className="font-mono text-2.5 tracking-widest text-cyan-500/50">// שאלות ותגובות ({job.comments?.length || 0})</span>
              <div className="flex-1 h-px bg-cyan-500/10" />
            </div>

            {token ? (
              <form className="bg-white/3 border border-white/8 px-6 py-5 mb-6" onSubmit={handleComment}>
                <p className="font-mono text-2.5 tracking-widest text-cyan-500/50 mb-3">// שאל שאלה או הגב</p>
                <MarkdownEditor
                  value={commentText}
                  onChange={setCommentText}
                  placeholder="יש שאלה על המשרה? רוצה לגלות פרטים נוספים?"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-2.5 rtl">
                  <span className="text-2.5 text-slate-200/25 font-mono">{commentText.length}/1000</span>
                  <button
                    type="submit"
                    className="px-5.5 py-2.25 bg-cyan-500 text-gray-950 font-sans text-sm font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!commentText.trim() || commentLoading}
                  >
                    {commentLoading ? "שולח..." : "שלח"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white/3 border border-dashed border-white/8 px-6 py-4.5 flex items-center justify-center gap-3.5 text-slate-200/40 text-sm mb-6 rtl">
                <span>🔒 כדי להגיב צריך להתחבר</span>
                <Link to="/login" className="px-4 py-1.5 border border-cyan-500 text-cyan-500 bg-transparent font-sans text-xs font-bold no-underline transition-all hover:bg-cyan-500 hover:text-gray-950">התחבר</Link>
              </div>
            )}

            {job.comments?.length === 0 ? (
              <div className="text-center py-10 text-slate-200/25 text-sm font-mono rtl">// אין שאלות עדיין — שאל הראשון!</div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {job.comments.map((comment, i) => (
                  <div key={comment._id || i} className="bg-white/2 border border-white/5 px-6 py-5 rtl animate-fade-in relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-0.75 bg-cyan-500 transform scale-y-0 hover:scale-y-100 transition-transform" />
                    <div className="flex items-center justify-between mb-3 rtl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2.5 font-bold text-cyan-500 flex-shrink-0">
                          {comment.author?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-sans font-bold text-sm text-white">{`${comment.author?.firstName} ${comment.author?.lastName}`}</div>
                          <div className="text-2.5 text-slate-200/25 font-mono">{timeAgo(comment.createdAt)}</div>
                        </div>
                      </div>
                      {user && comment.author?._id === user._id && (
                        <button className="bg-none border-none text-slate-200/25 cursor-pointer text-xs px-1.5 py-0.5 hover:text-rose-500 transition-colors" onClick={() => handleDeleteComment(comment._id)}>
                          מחק
                        </button>
                      )}
                    </div>
                    <div className="text-sm leading-7 text-slate-200/75 break-words overflow-hidden w-full"><MarkdownRenderer source={comment.content} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="sticky top-20 flex flex-col gap-4">

          {job.applyLink && (
            <div className="bg-white/3 border border-white/7 px-5.5 py-5">
              <a href={job.applyLink} target="_blank" rel="noreferrer" className="block w-full text-center px-7 py-2.75 bg-cyan-500 text-gray-950 font-sans text-sm font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/20 no-underline">
                הגש מועמדות ←
              </a>
            </div>
          )}

          <div className="bg-white/3 border border-white/7 px-5.5 py-5">
            <p className="font-mono text-2.5 tracking-widest text-cyan-500/50 mb-3.5 flex items-center gap-2">
              // פרטי משרה
              <span className="flex-1 h-px bg-cyan-500/10" />
            </p>
            <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
              <span className="text-3 text-slate-200/40">סוג</span>
              <span className="font-mono text-sm text-cyan-500">{JOB_TYPES[job.type]}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
              <span className="text-3 text-slate-200/40">מיקום</span>
              <span className="font-mono text-2.5 text-cyan-500">{job.location}</span>
            </div>
            {job.salary && (
              <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
                <span className="text-3 text-slate-200/40">שכר</span>
                <span className="font-mono text-2.5 text-cyan-500">{job.salary}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
              <span className="text-3 text-slate-200/40">פורסם</span>
              <span className="font-mono text-2.5 text-cyan-500">{timeAgo(job.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center py-2 rtl">
              <span className="text-3 text-slate-200/40">לייקים</span>
              <span className="font-mono text-sm text-cyan-500">{job.likes?.length || 0}</span>
            </div>
          </div>

          <div className="bg-white/3 border border-white/7 px-5.5 py-5">
            <p className="font-mono text-2.5 tracking-widest text-cyan-500/50 mb-3.5 flex items-center gap-2">
              // פרסם
              <span className="flex-1 h-px bg-cyan-500/10" />
            </p>
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-500 mx-auto mb-2">
              {job.author?.firstName?.[0]?.toUpperCase()}
            </div>
            <div className="text-center font-sans font-bold text-sm text-white mb-1">{job.author?.firstName}</div>
            <div className="text-center text-xs text-slate-200/40">חבר קהילה</div>
          </div>

          {job.tags?.length > 0 && (
            <div className="bg-white/3 border border-white/7 px-5.5 py-5">
              <p className="font-mono text-2.5 tracking-widest text-cyan-500/50 mb-3.5 flex items-center gap-2">
                // טכנולוגיות
                <span className="flex-1 h-px bg-cyan-500/10" />
              </p>
              <div className="flex flex-wrap gap-1.5 rtl">
                {job.tags.map(tag => (
                  <span key={tag} className="font-mono text-2.5 px-2.5 py-0.75 bg-cyan-500/7 border border-cyan-500/15 text-cyan-500/70 tracking-widest">#{tag}</span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}