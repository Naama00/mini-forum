import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import "../css/Article.css";
import MarkdownEditor from "./MarkdownEditor";
import MarkdownRenderer from "./MarkdownRenderer";

const API = "http://localhost:5000/api";

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "עכשיו";
    if (mins < 60) return `לפני ${mins} דקות`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `לפני ${hours} שעות`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `לפני ${days} ימים`;
    return new Date(dateStr).toLocaleDateString("he-IL");
}

function getUser() {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
}

export default function ArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    const user = getUser();
    const token = localStorage.getItem("token");

    // ── טעינת המאמר ────────────────────────────────────────
    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/articles/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!res.ok) { setError("המאמר לא נמצא"); return; }
                const data = await res.json();
                setArticle(data);
            } catch {
                setError("שגיאה בטעינת המאמר");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    // ── לייק ───────────────────────────────────────────────
    const handleLike = async () => {
        if (!token) return navigate("/login");
        const res = await fetch(`${API}/articles/${id}/like`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setArticle(prev => ({
            ...prev,
            likes: Array(data.likes).fill(null),
            _liked: data.liked
        }));
    };

    // ── שליחת תגובה ────────────────────────────────────────
    const handleComment = async (e) => {
        e.preventDefault();
        if (!token) return navigate("/login");
        if (!commentText.trim()) return;

        setCommentLoading(true);
        try {
            const res = await fetch(`${API}/articles/${id}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: commentText })
            });
            const newComment = await res.json();
            setArticle(prev => ({ ...prev, comments: [...prev.comments, newComment] }));
            setCommentText("");
        } catch {
            console.error("שגיאה בשליחת תגובה");
        } finally {
            setCommentLoading(false);
        }
    };

    // ── מחיקת תגובה ────────────────────────────────────────
    const handleDeleteComment = async (commentId) => {
        if (!token) return;
        try {
            await fetch(`${API}/articles/${id}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setArticle(prev => ({
                ...prev,
                comments: prev.comments.filter(c => c._id !== commentId)
            }));
        } catch {
            console.error("שגיאה במחיקת תגובה");
        }
    };

    // ── Loading / Error ─────────────────────────────────────
    if (loading) return <div className="main"><div className="article-loading">// טוען מאמר...</div></div>;
    if (error) return <div className="main"><div className="article-error">⚠ {error}</div></div>;
    if (!article) return null;

    const isLiked = article._liked || (user && article.likes?.some(l => l === user._id || l?._id === user._id));
    const isAuthor = user && article.author?._id === user._id;

    return (
        <div className="main">
            <Breadcrumb customNames={{ [id]: article?.title }} />
            <Link to="/articles" className="article-back">← חזרה למאמרים</Link>

            {/* ── Header ── */}
            <div className="article-header">
                <div className="article-tags">
                    {article.tags?.map(tag => (
                        <span key={tag} className="article-tag">#{tag}</span>
                    ))}
                </div>

                <div className="article-header-top">
                    <h1 className="article-page-title">{article.title}</h1>
                    <div className="article-actions">
                        <button className={`action-btn${isLiked ? " liked" : ""}`} onClick={handleLike}>
                            ♥ {article.likes?.length || 0}
                        </button>
                        {isAuthor && (
                            <Link to={`/articles/${id}/edit`} className="action-btn" style={{ textDecoration: "none" }}>
                                עריכה
                            </Link>
                        )}
                    </div>
                </div>

                {article.summary && (
                    <p className="article-summary">{article.summary}</p>
                )}

                <div className="article-meta">
                    <div className="article-author-block">
                        <div className="article-author-avatar">
                            {article.author?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <div className="article-author-name">{article.author?.firstName}</div>
                            <div className="article-author-time">{timeAgo(article.createdAt)}</div>
                        </div>
                    </div>
                    <div className="article-meta-stats">
                        <span className="article-meta-stat">👁 {article.views || 0} צפיות</span>
                        <span className="article-meta-stat">💬 {article.comments?.length || 0} תגובות</span>
                    </div>
                </div>
            </div>

            {/* ── תמונה ── */}
            {article.image && (
                <img src={article.image} alt={article.title} className="article-cover-image" />
            )}

            {/* ── Layout ── */}
            <div className="article-layout">

                {/* תוכן */}
                <div>
                    <div className="article-content"><MarkdownRenderer source={article.content} /></div>

                    {/* תגובות */}
                    <div className="comments-section">
                        <div className="comments-divider">
                            <div className="comments-divider-line" />
                            <span className="comments-divider-text">// תגובות ({article.comments?.length || 0})</span>
                            <div className="comments-divider-line" />
                        </div>

                        {/* טופס תגובה */}
                        {token ? (
                            <form className="comment-form" onSubmit={handleComment}>
                                <p className="comment-form-header">// הוסף תגובה</p>
                                <MarkdownEditor
                                    value={commentText}
                                    onChange={setCommentText}
                                    placeholder="מה דעתך על המאמר?"
                                    rows={4}
                                />
                                <div className="comment-form-footer">
                                    <span className="comment-char">{commentText.length}/1000</span>
                                    <button
                                        type="submit"
                                        className="comment-submit-btn"
                                        disabled={!commentText.trim() || commentLoading}
                                    >
                                        {commentLoading ? "שולח..." : "שלח תגובה"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="comment-login-notice">
                                <span>🔒 כדי להגיב צריך להתחבר</span>
                                <Link to="/login" className="comment-login-btn">התחבר</Link>
                            </div>
                        )}

                        {/* רשימת תגובות */}
                        {article.comments?.length === 0 ? (
                            <div className="comments-empty">// אין תגובות עדיין — היה הראשון!</div>
                        ) : (
                            <div className="comments-list">
                                {article.comments.map((comment, i) => (
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
                                                <button
                                                    className="comment-delete-btn"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                >
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
                <div className="article-sidebar">

                    <div className="sidebar-card">
                        <p className="sidebar-card-title">// סטטיסטיקות</p>
                        <div className="sidebar-stat-row">
                            <span className="sidebar-stat-label">צפיות</span>
                            <span className="sidebar-stat-value">{article.views || 0}</span>
                        </div>
                        <div className="sidebar-stat-row">
                            <span className="sidebar-stat-label">לייקים</span>
                            <span className="sidebar-stat-value">{article.likes?.length || 0}</span>
                        </div>
                        <div className="sidebar-stat-row">
                            <span className="sidebar-stat-label">תגובות</span>
                            <span className="sidebar-stat-value">{article.comments?.length || 0}</span>
                        </div>
                        <div className="sidebar-stat-row">
                            <span className="sidebar-stat-label">פורסם</span>
                            <span className="sidebar-stat-value" style={{ fontSize: 11 }}>
                                {new Date(article.createdAt).toLocaleDateString("he-IL")}
                            </span>
                        </div>
                    </div>

                    <div className="sidebar-card">
                        <button className={`sidebar-like-btn${isLiked ? " liked" : ""}`} onClick={handleLike}>
                            {isLiked ? "♥ אהבת את זה" : "♡ סמן לייק"}
                        </button>
                    </div>

                    <div className="sidebar-card">
                        <p className="sidebar-card-title">// כותב</p>
                        <div className="author-card-avatar">
                            {article.author?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div className="author-card-name">{article.author?.firstName}</div>
                        <div className="author-card-sub">חבר קהילה</div>
                    </div>

                    {article.tags?.length > 0 && (
                        <div className="sidebar-card">
                            <p className="sidebar-card-title">// תגיות</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, direction: "rtl" }}>
                                {article.tags.map(tag => (
                                    <span key={tag} className="article-tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}