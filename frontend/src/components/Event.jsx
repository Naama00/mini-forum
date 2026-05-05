import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
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

    if (loading) return <div className="main"><div className="text-center py-20 text-slate-200/40 text-sm font-mono rtl">// טוען אירוע...</div></div>;
    if (error) return <div className="main"><div className="text-center py-20 text-slate-200/40 text-sm font-mono rtl">⚠ {error}</div></div>;
    if (!event) return null;

    const past = isPast(event.date);
    const isLiked = event._liked || (user && event.likes?.some(l => l === user._id || l?._id === user._id));
    const isAttending = event._attending || (user && event.attendees?.some(a => a === user._id || a?._id === user._id));
    const isAuthor = user && event.author?._id === user._id;

    return (
        <div className="main rtl">
            <Breadcrumb customNames={{ [id]: event?.title }} />
            <Link to="/events" className="inline-flex items-center gap-2 text-slate-200/40 no-underline font-mono text-xs px-0 pt-8 hover:text-cyan-500 transition-colors rtl">← חזרה לאירועים</Link>

            {/* ── Header ── */}
            <div className="py-7 px-0 border-b border-cyan-500/8 mb-8 relative z-10 rtl">
                {past && <span className="inline-block px-3 py-0.75 border border-white/10 text-slate-200/25 font-mono text-xs tracking-widest mb-3">// אירוע שעבר</span>}

                <div className="flex gap-2 flex-wrap mb-3.5 rtl">
                    {event.tags?.map(tag => (
                        <span key={tag} className="font-mono text-2.5 px-2.5 py-0.75 bg-cyan-500/7 border border-cyan-500/15 text-cyan-500/70 tracking-widest">#{tag}</span>
                    ))}
                </div>

                <h1 className="text-4xl font-black text-white m-0 mb-5 leading-snug">{event.title}</h1>

                <div className="flex gap-6 flex-wrap mb-6 rtl">
                    <div className={`flex items-center gap-2 text-sm ${past ? "text-slate-200/25" : "text-slate-200/40"}`}>
                        <span>📅</span>
                        <strong className="text-white">{formatDate(event.date)}</strong>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${past ? "text-slate-200/25" : "text-slate-200/40"}`}>
                        <span>🕐</span>
                        <strong className="text-white">{formatTime(event.date)}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-200/40">
                        <span>📍</span>
                        <strong className="text-white">{event.location}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-200/40">
                        <span>👥</span>
                        <strong className="text-white">{event.attendees?.length || 0} נרשמו</strong>
                    </div>
                </div>

                <div className="flex gap-2.5 flex-wrap rtl">
                    {!past && (
                        <button
                            className={`px-7 py-2.75 transition-all font-bold uppercase tracking-widest text-sm font-sans ${isAttending ? "bg-cyan-500 text-gray-950 border-cyan-500 shadow-lg shadow-cyan-500/20" : "border border-cyan-500 bg-transparent text-cyan-500 hover:bg-cyan-500 hover:text-gray-950 hover:shadow-lg hover:shadow-cyan-500/20"}`}
                            onClick={handleAttend}
                        >
                            {isAttending ? "✓ נרשמת לאירוע" : "הירשם לאירוע"}
                        </button>
                    )}
                    <button
                        className={`px-5 py-2.75 transition-all font-sans text-sm flex items-center gap-1.75 ${isLiked ? "text-rose-500 border-rose-500/30 bg-rose-500/5 border" : "bg-white/3 border border-white/8 text-slate-200/40 hover:text-rose-500 hover:border-rose-500"}`}
                        onClick={handleLike}
                    >
                        ♥ {event.likes?.length || 0}
                    </button>
                    {event.link && (
                        <a href={event.link} target="_blank" rel="noreferrer" className="px-5 py-2.75 bg-transparent border border-white/10 text-slate-200/40 font-sans text-sm no-underline transition-all hover:border-cyan-500 hover:text-cyan-500 inline-flex items-center gap-1.5">
                            🔗 אתר האירוע
                        </a>
                    )}
                    {isAuthor && (
                        <Link to={`/events/${id}/edit`} className="px-5 py-2.75 bg-transparent border border-white/10 text-slate-200/40 font-sans text-sm no-underline transition-all hover:border-cyan-500 hover:text-cyan-500 inline-flex items-center">עריכה</Link>
                    )}
                </div>
            </div>

            {/* ── Layout ── */}
            <div className="grid grid-cols-[1fr_260px] gap-8 items-start rtl">

                {/* תיאור + תגובות */}
                <div>
                    <div className="text-slate-200/80 leading-relaxed animate-fade-in"><MarkdownRenderer source={event.description} /></div>

                    {/* תגובות */}
                    <div className="mt-12 rtl">
                        <div className="flex items-center gap-3 mb-7">
                            <div className="flex-1 h-px bg-cyan-500/10" />
                            <span className="font-mono text-2.5 tracking-widest text-cyan-500/50">// תגובות ({event.comments?.length || 0})</span>
                            <div className="flex-1 h-px bg-cyan-500/10" />
                        </div>

                        {token ? (
                            <form className="bg-white/3 border border-white/8 px-6 py-5 mb-6" onSubmit={handleComment}>
                                <p className="font-mono text-2.5 tracking-widest text-cyan-500/50 mb-3">// הוסף תגובה</p>
                                    <MarkdownEditor
                                        value={commentText}
                                        onChange={setCommentText}
                                        placeholder="שאלה על האירוע? ספר על חוויה?"
                                        rows={4}
                                    />
                                <div className="flex justify-between items-center mt-2.5 rtl">
                                    <span className="text-2.5 text-slate-200/25 font-mono">{commentText.length}/1000</span>
                                    <button
                                        type="submit"
                                        className="px-5.5 py-2.25 bg-cyan-500 text-gray-950 font-sans text-sm font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!commentText.trim() || commentLoading}
                                    >
                                        {commentLoading ? "שולח..." : "שלח תגובה"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-white/3 border border-dashed border-white/8 px-6 py-4.5 flex items-center justify-center gap-3.5 text-slate-200/40 text-sm mb-6 rtl">
                                <span>🔒 כדי להגיב צריך להתחבר</span>
                                <Link to="/login" className="px-4 py-1.5 border border-cyan-500 text-cyan-500 bg-transparent font-sans text-xs font-bold no-underline transition-all hover:bg-cyan-500 hover:text-gray-950">התחבר</Link>
                            </div>
                        )}

                        {event.comments?.length === 0 ? (
                            <div className="text-center py-10 text-slate-200/25 text-sm font-mono rtl">// אין תגובות עדיין — היה הראשון!</div>
                        ) : (
                            <div className="flex flex-col gap-0.5">
                                {event.comments.map((comment, i) => (
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

                    <div className="bg-white/3 border border-white/7 px-5.5 py-5">
                        <p className="font-mono text-2.5 tracking-widest text-cyan-500/50 mb-3.5 flex items-center gap-2">
                            // פרטים
                            <span className="flex-1 h-px bg-cyan-500/10" />
                        </p>
                        <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
                            <span className="text-3 text-slate-200/40">תאריך</span>
                            <span className="font-mono text-sm text-cyan-500">{new Date(event.date).toLocaleDateString("he-IL")}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
                            <span className="text-3 text-slate-200/40">שעה</span>
                            <span className="font-mono text-sm text-cyan-500">{formatTime(event.date)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
                            <span className="text-3 text-slate-200/40">מיקום</span>
                            <span className="font-mono text-2.5 text-cyan-500">{event.location}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 rtl">
                            <span className="text-3 text-slate-200/40">נרשמו</span>
                            <span className="font-mono text-sm text-cyan-500">{event.attendees?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 rtl">
                            <span className="text-3 text-slate-200/40">לייקים</span>
                            <span className="font-mono text-sm text-cyan-500">{event.likes?.length || 0}</span>
                        </div>
                    </div>

                    {event.attendees?.length > 0 && (
                        <div className="bg-white/3 border border-white/7 px-5.5 py-5">
                            <p className="font-mono text-2.5 tracking-widest text-cyan-500/50 mb-3.5 flex items-center gap-2">
                                // נרשמו
                                <span className="flex-1 h-px bg-cyan-500/10" />
                            </p>
                            <div className="flex flex-wrap gap-1.5 rtl">
                                {event.attendees.slice(0, 8).map((a, i) => (
                                    <div key={i} className="w-7.5 h-7.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2.5 font-bold text-cyan-500">
                                        {a?.firstName?.[0]?.toUpperCase() || "?"}
                                    </div>
                                ))}
                            </div>
                            {event.attendees.length > 8 && (
                                <p className="text-2.5 text-slate-200/40 pt-1 rtl">ועוד {event.attendees.length - 8}...</p>
                            )}
                        </div>
                    )}

                    {!past && (
                        <div className="bg-white/3 border border-white/7 px-5.5 py-5">
                            <button
                                className={`w-full text-center px-7 py-2.75 transition-all font-bold uppercase tracking-widest text-sm font-sans ${isAttending ? "bg-cyan-500 text-gray-950 border-cyan-500 shadow-lg shadow-cyan-500/20" : "border border-cyan-500 bg-transparent text-cyan-500 hover:bg-cyan-500 hover:text-gray-950 hover:shadow-lg hover:shadow-cyan-500/20"}`}
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