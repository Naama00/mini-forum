import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import "../css/Event.css";
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

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("he-IL", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function isPast(dateStr) { return new Date(dateStr) < new Date(); }

function getUser() {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
}

export default function EventPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    const user = getUser();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/events/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!res.ok) { setError("האירוע לא נמצא"); return; }
                const data = await res.json();
                setEvent(data);
            } catch {
                setError("שגיאה בטעינת האירוע");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleAttend = async () => {
        if (!token) return navigate("/login");
        const res = await fetch(`${API}/events/${id}/attend`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setEvent(prev => ({
            ...prev,
            attendees: Array(data.attendees).fill(null),
            _attending: data.attending
        }));
    };

    const handleLike = async () => {
        if (!token) return navigate("/login");
        const res = await fetch(`${API}/events/${id}/like`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setEvent(prev => ({
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
            const res = await fetch(`${API}/events/${id}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: commentText })
            });
            const newComment = await res.json();
            setEvent(prev => ({ ...prev, comments: [...prev.comments, newComment] }));
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
            await fetch(`${API}/events/${id}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvent(prev => ({
                ...prev,
                comments: prev.comments.filter(c => c._id !== commentId)
            }));
        } catch { console.error("שגיאה במחיקת תגובה"); }
    };

    if (loading) return <div className="main"><div className="event-loading">// טוען אירוע...</div></div>;
    if (error) return <div className="main"><div className="event-error">⚠ {error}</div></div>;
    if (!event) return null;

    const past = isPast(event.date);
    const isLiked = event._liked || (user && event.likes?.some(l => l === user._id || l?._id === user._id));
    const isAttending = event._attending || (user && event.attendees?.some(a => a === user._id || a?._id === user._id));
    const isAuthor = user && event.author?._id === user._id;

    return (
        <div className="main">
            <Breadcrumb customNames={{ [id]: event?.title }} />
            <Link to="/events" className="event-back">← חזרה לאירועים</Link>

            {/* ── Header ── */}
            <div className="event-page-header">
                {past && <span className="event-past-label">// אירוע שעבר</span>}

                <div className="event-page-tags">
                    {event.tags?.map(tag => (
                        <span key={tag} className="event-page-tag">#{tag}</span>
                    ))}
                </div>

                <h1 className="event-page-title">{event.title}</h1>

                <div className="event-info-strip">
                    <div className={`event-info-item${past ? " past" : ""}`}>
                        <span>📅</span>
                        <strong>{formatDate(event.date)}</strong>
                    </div>
                    <div className={`event-info-item${past ? " past" : ""}`}>
                        <span>🕐</span>
                        <strong>{formatTime(event.date)}</strong>
                    </div>
                    <div className="event-info-item">
                        <span>📍</span>
                        <strong>{event.location}</strong>
                    </div>
                    <div className="event-info-item">
                        <span>👥</span>
                        <strong>{event.attendees?.length || 0} נרשמו</strong>
                    </div>
                </div>

                <div className="event-header-actions">
                    {!past && (
                        <button
                            className={`event-attend-btn${isAttending ? " attending" : ""}`}
                            onClick={handleAttend}
                        >
                            {isAttending ? "✓ נרשמת לאירוע" : "הירשם לאירוע"}
                        </button>
                    )}
                    <button
                        className={`event-like-btn${isLiked ? " liked" : ""}`}
                        onClick={handleLike}
                    >
                        ♥ {event.likes?.length || 0}
                    </button>
                    {event.link && (
                        <a href={event.link} target="_blank" rel="noreferrer" className="event-external-btn">
                            🔗 אתר האירוע
                        </a>
                    )}
                    {isAuthor && (
                        <Link to={`/events/${id}/edit`} className="event-external-btn">עריכה</Link>
                    )}
                </div>
            </div>

            {/* ── Layout ── */}
            <div className="event-page-layout">

                {/* תיאור + תגובות */}
                <div>
                    <div className="event-description"><MarkdownRenderer source={event.description} /></div>

                    {/* תגובות */}
                    <div className="comments-section">
                        <div className="comments-divider">
                            <div className="comments-divider-line" />
                            <span className="comments-divider-text">// תגובות ({event.comments?.length || 0})</span>
                            <div className="comments-divider-line" />
                        </div>

                        {token ? (
                            <form className="comment-form" onSubmit={handleComment}>
                                <p className="comment-form-header">// הוסף תגובה</p>
                                    <MarkdownEditor
                                        value={commentText}
                                        onChange={setCommentText}
                                        placeholder="שאלה על האירוע? ספר על חוויה?"
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

                        {event.comments?.length === 0 ? (
                            <div className="comments-empty">// אין תגובות עדיין — היה הראשון!</div>
                        ) : (
                            <div className="comments-list">
                                {event.comments.map((comment, i) => (
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
                <div className="event-sidebar">

                    <div className="sidebar-card">
                        <p className="sidebar-card-title">// פרטים</p>
                        <div className="sidebar-stat-row">
                            <span className="sidebar-stat-label">תאריך</span>
                            <span className="sidebar-stat-value" style={{ fontSize: 11 }}>
                                {new Date(event.date).toLocaleDateString("he-IL")}
                            </span>
                        </div>
                        <div className="sidebar-stat-row">
                            <span className="sidebar-stat-label">שעה</span>
                            <span className="sidebar-stat-value">{formatTime(event.date)}</span>
                        </div>
                        <div className="sidebar-stat-row">
                            <span className="sidebar-stat-label">מיקום</span>
                            <span className="sidebar-stat-value" style={{ fontSize: 11 }}>{event.location}</span>
                        </div>
                        <div className="sidebar-stat-row">
                            <span className="sidebar-stat-label">נרשמו</span>
                            <span className="sidebar-stat-value">{event.attendees?.length || 0}</span>
                        </div>
                        <div className="sidebar-stat-row">
                            <span className="sidebar-stat-label">לייקים</span>
                            <span className="sidebar-stat-value">{event.likes?.length || 0}</span>
                        </div>
                    </div>

                    {event.attendees?.length > 0 && (
                        <div className="sidebar-card">
                            <p className="sidebar-card-title">// נרשמו</p>
                            <div className="attendees-preview">
                                {event.attendees.slice(0, 8).map((a, i) => (
                                    <div key={i} className="attendee-avatar">
                                        {a?.firstName?.[0]?.toUpperCase() || "?"}
                                    </div>
                                ))}
                            </div>
                            {event.attendees.length > 8 && (
                                <p className="attendees-more">ועוד {event.attendees.length - 8}...</p>
                            )}
                        </div>
                    )}

                    {!past && (
                        <div className="sidebar-card">
                            <button
                                className={`event-attend-btn${isAttending ? " attending" : ""}`}
                                style={{ width: "100%", textAlign: "center" }}
                                onClick={handleAttend}
                            >
                                {isAttending ? "✓ נרשמת" : "הירשם לאירוע"}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}