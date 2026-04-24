import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import "../css/Job.css";
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

  if (loading) return <div className="main"><div className="job-loading">// טוען משרה...</div></div>;
  if (error) return <div className="main"><div className="job-error">⚠ {error}</div></div>;
  if (!job) return null;

  const isLiked = job._liked || (user && job.likes?.some(l => l === user._id || l?._id === user._id));
  const isAuthor = user && job.author?._id === user._id;

  return (
    <div className="main">
       <Breadcrumb customNames={{ [id]: job?.title }} />
      <Link to="/jobs" className="job-back">← חזרה למשרות</Link>

      {/* ── Header ── */}
      <div className="job-page-header">
        <div className="job-page-tags">
          <span className="job-type-badge">{JOB_TYPES[job.type] || job.type}</span>
          {job.tags?.map(tag => (
            <span key={tag} className="job-page-tag">#{tag}</span>
          ))}
        </div>

        <h1 className="job-page-title">{job.title}</h1>
        <p className="job-page-company">{job.company}</p>

        <div className="job-info-strip">
          <div className="job-info-item">📍 <strong>{job.location}</strong></div>
          {job.salary && <div className="job-info-item">💰 <strong>{job.salary}</strong></div>}
          <div className="job-info-item">🕐 <strong>פורסם {timeAgo(job.createdAt)}</strong></div>
          <div className="job-info-item">♥ <strong>{job.likes?.length || 0} לייקים</strong></div>
        </div>

        <div className="job-header-actions">
          {job.applyLink ? (
            <a href={job.applyLink} target="_blank" rel="noreferrer" className="job-apply-btn">
              הגש מועמדות ←
            </a>
          ) : (
            <button
                className="job-apply-btn"
                onClick={() => document.querySelector(".md-textarea")?.focus()}
              >
                פנה דרך תגובה ↓
              </button>
          )}
          <button className={`job-like-btn${isLiked ? " liked" : ""}`} onClick={handleLike}>
            ♥ {job.likes?.length || 0}
          </button>
          {isAuthor && (
            <Link to={`/jobs/${id}/edit`} className="job-action-link">עריכה</Link>
          )}
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="job-page-layout">

        {/* תוכן + תגובות */}
        <div>
          {/* תיאור */}
          <p className="job-section-title">// תיאור המשרה</p>
          <div className="job-description"><MarkdownRenderer source={job.description} /></div>

          {/* דרישות */}
          {job.requirements?.filter(r => r.trim()).length > 0 && (
            <div className="job-requirements">
              <p className="job-section-title">// דרישות התפקיד</p>
              <div className="requirements-list">
                {job.requirements.filter(r => r.trim()).map((req, i) => (
                  <div key={i} className="requirement-item">
                    <div className="requirement-dot" />
                    {req}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* תגובות */}
          <div className="comments-section">
            <div className="comments-divider">
              <div className="comments-divider-line" />
              <span className="comments-divider-text">// שאלות ותגובות ({job.comments?.length || 0})</span>
              <div className="comments-divider-line" />
            </div>

            {token ? (
              <form className="comment-form" onSubmit={handleComment}>
                <p className="comment-form-header">// שאל שאלה או הגב</p>
                <MarkdownEditor
                  value={commentText}
                  onChange={setCommentText}
                  placeholder="יש שאלה על המשרה? רוצה לגלות פרטים נוספים?"
                  rows={4}
                />
                <div className="comment-form-footer">
                  <span className="comment-char">{commentText.length}/1000</span>
                  <button
                    type="submit"
                    className="comment-submit-btn"
                    disabled={!commentText.trim() || commentLoading}
                  >
                    {commentLoading ? "שולח..." : "שלח"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="comment-login-notice">
                <span>🔒 כדי להגיב צריך להתחבר</span>
                <Link to="/login" className="comment-login-btn">התחבר</Link>
              </div>
            )}

            {job.comments?.length === 0 ? (
              <div className="comments-empty">// אין שאלות עדיין — שאל הראשון!</div>
            ) : (
              <div className="comments-list">
                {job.comments.map((comment, i) => (
                  <div key={comment._id || i} className="comment-card">
                    <div className="comment-header">
                      <div className="comment-author">
                        <div className="comment-avatar">
                          {comment.author?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="comment-author-name"> {`${comment.author?.firstName} ${comment.author?.lastName}`}</div>
                          <div className="comment-time">{timeAgo(comment.createdAt)}</div>
                        </div>
                      </div>
                      {user && comment.author?._id === user._id && (
                        <button className="comment-delete-btn" onClick={() => handleDeleteComment(comment._id)}>
                          מחק
                        </button>
                      )}
                    </div>
                    <div className="comment-content"><MarkdownRenderer source={comment.content} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="job-sidebar">

          {job.applyLink && (
            <div className="sidebar-card">
              <a href={job.applyLink} target="_blank" rel="noreferrer" className="sidebar-apply-btn">
                הגש מועמדות ←
              </a>
            </div>
          )}

          <div className="sidebar-card">
            <p className="sidebar-card-title">// פרטי משרה</p>
            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">סוג</span>
              <span className="sidebar-stat-value">{JOB_TYPES[job.type]}</span>
            </div>
            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">מיקום</span>
              <span className="sidebar-stat-value" style={{ fontSize: 11 }}>{job.location}</span>
            </div>
            {job.salary && (
              <div className="sidebar-stat-row">
                <span className="sidebar-stat-label">שכר</span>
                <span className="sidebar-stat-value" style={{ fontSize: 11 }}>{job.salary}</span>
              </div>
            )}
            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">פורסם</span>
              <span className="sidebar-stat-value" style={{ fontSize: 11 }}>{timeAgo(job.createdAt)}</span>
            </div>
            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">לייקים</span>
              <span className="sidebar-stat-value">{job.likes?.length || 0}</span>
            </div>
          </div>

          <div className="sidebar-card">
            <p className="sidebar-card-title">// פרסם</p>
            <div className="poster-avatar">
              {job.author?.firstName?.[0]?.toUpperCase()}
            </div>
            <div className="poster-name">{job.author?.firstName}</div>
            <div className="poster-sub">חבר קהילה</div>
          </div>

          {job.tags?.length > 0 && (
            <div className="sidebar-card">
              <p className="sidebar-card-title">// טכנולוגיות</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, direction: "rtl" }}>
                {job.tags.map(tag => (
                  <span key={tag} className="job-page-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}