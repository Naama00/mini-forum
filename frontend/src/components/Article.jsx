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
    if (loading) return <div className="max-w-4xl mx-auto px-6"><div className="text-center py-20 text-gray-400 text-sm font-mono rtl">// טוען מאמר...</div></div>;
    if (error) return <div className="max-w-4xl mx-auto px-6"><div className="text-center py-20 text-gray-400 text-sm font-mono rtl">⚠ {error}</div></div>;
    if (!article) return null;

    const isLiked = article._liked || (user && article.likes?.some(l => l === user._id || l?._id === user._id));
    const isAuthor = user && article.author?._id === user._id;

    return (
        <div className="max-w-4xl mx-auto px-6">
            <Breadcrumb customNames={{ [id]: article?.title }} />
            <Link to="/articles" className="inline-flex items-center gap-2 text-gray-400 no-underline font-mono text-xs tracking-wide pt-8 rtl hover:text-cyan-500 transition-colors">← חזרה למאמרים</Link>

            {/* ── Header ── */}
            <div className="py-7 pb-9 rtl relative z-1 border-b border-cyan-500/10 mb-8">
                <div className="flex gap-2 flex-wrap mb-4 rtl">
                    {article.tags?.map(tag => (
                        <span key={tag} className="font-mono text-xs px-2.5 py-0.75 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500/70 tracking-wide">#{tag}</span>
                    ))}
                </div>

                <div className="flex items-start justify-between gap-5 flex-wrap mb-5">
                    <h1 className="text-4xl font-black text-white mb-4 leading-tight">{article.title}</h1>
                    <div className="flex gap-2.5 rtl">
                        <button className={`flex items-center gap-1.5 px-4 py-2 bg-white/3 border border-white/8 text-gray-400 font-semibold text-sm cursor-pointer transition-colors hover:border-white/20 hover:text-gray-200 ${isLiked ? "border-rose-500/40 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10" : ""}`} onClick={handleLike}>
                            ♥ {article.likes?.length || 0}
                        </button>
                        {isAuthor && (
                            <Link to={`/articles/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 bg-white/3 border border-white/8 text-gray-400 font-semibold text-sm cursor-pointer transition-colors hover:border-white/20 hover:text-gray-200 no-underline">
                                עריכה
                            </Link>
                        )}
                    </div>
                </div>

                {article.summary && (
                    <p className="text-base text-gray-400 leading-relaxed mb-6 border-r-4 border-cyan-500/30 pr-4 rtl">{article.summary}</p>
                )}

                <div className="flex items-center gap-5 flex-wrap rtl">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-cyan-500/12 border border-cyan-500/30 flex items-center justify-center text-sm font-bold text-cyan-500 shadow-lg shadow-cyan-500/30">
                            {article.author?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-white">{article.author?.firstName}</div>
                            <div className="text-xs text-gray-600 mt-0.5 font-mono">{timeAgo(article.createdAt)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mr-auto rtl">
                        <span className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">👁 {article.views || 0} צפיות</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">💬 {article.comments?.length || 0} תגובות</span>
                    </div>
                </div>
            </div>

            {/* ── תמונה ── */}
            {article.image && (
                <img src={article.image} alt={article.title} className="w-full max-h-96 object-cover border border-cyan-500/10 mb-8 block" />
            )}

            {/* ── Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-start rtl">

                {/* תוכן */}
                <div>
                    <div className="text-base leading-relaxed text-slate-200/80 whitespace-pre-wrap animate-fade-in"><MarkdownRenderer source={article.content} /></div>

                    {/* תגובות */}
                    <div className="mt-12 rtl">
                        <div className="flex items-center gap-3 mb-7 rtl">
                            <div className="flex-1 h-px bg-cyan-500/10" />
                            <span className="font-mono text-xs tracking-wide text-cyan-500/50">// תגובות ({article.comments?.length || 0})</span>
                            <div className="flex-1 h-px bg-cyan-500/10" />
                        </div>

                        {/* טופס תגובה */}
                        {token ? (
                            <form className="bg-gray-900/50 border border-cyan-500/10 p-6 mb-6 rtl" onSubmit={handleComment}>
                                <p className="font-mono text-xs tracking-wide text-cyan-500/50 mb-3">// הוסף תגובה</p>
                                <MarkdownEditor
                                    value={commentText}
                                    onChange={setCommentText}
                                    placeholder="מה דעתך על המאמר?"
                                    rows={4}
                                />
                                <div className="flex justify-between items-center mt-2.5 rtl">
                                    <span className="text-xs text-gray-600 font-mono">{commentText.length}/1000</span>
                                    <button
                                        type="submit"
                                        className="px-5.5 py-2.25 bg-cyan-500 text-gray-900 border-none font-bold text-sm cursor-pointer transition-shadow hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!commentText.trim() || commentLoading}
                                    >
                                        {commentLoading ? "שולח..." : "שלח תגובה"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-gray-900/50 border border-dashed border-white/8 p-4.5 p-6 flex items-center justify-center gap-3.5 text-gray-400 text-sm mb-6 rtl">
                                <span>🔒 כדי להגיב צריך להתחבר</span>
                                <Link to="/login" className="py-1.5 px-4 border border-cyan-500 text-cyan-500 bg-transparent font-bold text-xs cursor-pointer no-underline transition-all hover:bg-cyan-500 hover:text-gray-900">התחבר</Link>
                            </div>
                        )}

                        {/* רשימת תגובות */}
                        {article.comments?.length === 0 ? (
                            <div className="text-center py-10 text-gray-600 text-sm font-mono">// אין תגובות עדיין — היה הראשון!</div>
                        ) : (
                            <div className="flex flex-col gap-0.5">
                                {article.comments.map((comment, i) => (
                                    <div key={comment._id || i} className="bg-white/2 border border-white/5 p-5 p-6 rtl relative w-full overflow-hidden">
                                        <div className="absolute right-0 top-0 bottom-0 w-0.75 bg-cyan-500 scale-y-0 transition-transform hover:scale-y-100" />
                                        <div className="flex items-center justify-between mb-3 rtl">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-500 flex-shrink-0">
                                                   {comment.author?.firstName?.[0]?.toUpperCase()}
                                                   
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-white"> {`${comment.author?.firstName} ${comment.author?.lastName}`}</div>
                                                    <div className="text-xs text-gray-600 font-mono">{timeAgo(comment.createdAt)}</div>
                                                </div>
                                            </div>
                                            {user && comment.author?._id === user._id && (
                                                <button
                                                    className="bg-none border-none text-gray-600 cursor-pointer text-xs px-1.5 py-0.5 transition-colors hover:text-red-500"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                >
                                                    מחק
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-sm leading-relaxed text-slate-200/75 whitespace-pre-wrap break-words overflow-wrap-break-word w-full"><MarkdownRenderer source={comment.content} /></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div className="sticky top-20 flex flex-col gap-4">

                    <div className="bg-gray-900/50 border border-cyan-500/10 p-5.5">
                        <p className="font-mono text-xs tracking-widest text-cyan-500/50 uppercase mb-3.5 flex items-center gap-2">// סטטיסטיקות
                            <span className="flex-1 h-px bg-cyan-500/10" />
                        </p>
                        <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
                            <span className="text-xs text-gray-400">צפיות</span>
                            <span className="font-mono text-sm font-medium text-cyan-500">{article.views || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
                            <span className="text-xs text-gray-400">לייקים</span>
                            <span className="font-mono text-sm font-medium text-cyan-500">{article.likes?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/4 rtl">
                            <span className="text-xs text-gray-400">תגובות</span>
                            <span className="font-mono text-sm font-medium text-cyan-500">{article.comments?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 rtl">
                            <span className="text-xs text-gray-400">פורסם</span>
                            <span className="font-mono text-xs font-medium text-cyan-500">
                                {new Date(article.createdAt).toLocaleDateString("he-IL")}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-cyan-500/10 p-5.5">
                        <button className={`w-full py-2.75 bg-transparent border border-rose-500/30 text-rose-500/70 font-bold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-rose-500/10 hover:border-rose-500 hover:text-rose-500 ${isLiked ? "bg-rose-500/10 border-rose-500 text-rose-500" : ""}`} onClick={handleLike}>
                            {isLiked ? "♥ אהבת את זה" : "♡ סמן לייק"}
                        </button>
                    </div>

                    <div className="bg-gray-900/50 border border-cyan-500/10 p-5.5">
                        <p className="font-mono text-xs tracking-widest text-cyan-500/50 uppercase mb-3.5 flex items-center gap-2">// כותב
                            <span className="flex-1 h-px bg-cyan-500/10" />
                        </p>
                        <div className="w-12 h-12 rounded-full bg-cyan-500/12 border border-cyan-500/30 flex items-center justify-center text-lg font-bold text-cyan-500 shadow-lg shadow-cyan-500/30 mb-2.5 mx-auto">
                            {article.author?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div className="text-base font-bold text-white mb-1 rtl text-center">{article.author?.firstName}</div>
                        <div className="text-xs text-gray-400 rtl text-center">חבר קהילה</div>
                    </div>

                    {article.tags?.length > 0 && (
                        <div className="bg-gray-900/50 border border-cyan-500/10 p-5.5">
                            <p className="font-mono text-xs tracking-widest text-cyan-500/50 uppercase mb-3.5 flex items-center gap-2">// תגיות
                                <span className="flex-1 h-px bg-cyan-500/10" />
                            </p>
                            <div className="flex flex-wrap gap-1.5 rtl">
                                {article.tags.map(tag => (
                                    <span key={tag} className="font-mono text-xs px-2.5 py-0.75 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500/70 tracking-wide">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}