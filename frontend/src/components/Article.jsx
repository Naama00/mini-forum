import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import MarkdownEditor from "./MarkdownEditor";
import MarkdownRenderer from "./MarkdownRenderer";
import { useAuth } from "../hooks";
import { getToken } from "../utils/storage";

const API = "http://localhost:5000/api";

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "עכשיו";
    if (mins < 60) return `לפני ${mins} דק'`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `לפני ${hours} שע'`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `לפני ${days} ימים`;
    return new Date(dateStr).toLocaleDateString("he-IL");
}

const ARTICLE_STYLES = `
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
  .glass-card:hover {
    background: rgba(204, 255, 0, 0.05);
    border-color: var(--accent-glow);
    box-shadow: 0 0 30px rgba(204, 255, 0, 0.1);
  }
`;

export default function ArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    const isLoggedIn = !!user;

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const r = await fetch(`${API}/articles/${id}`);
                if (!r.ok) throw new Error("נכשל בטעינת המאמר מהשרת");
                
                const res = await r.json();
                const articleData = res.data ? res.data : res;
                setArticle(articleData);
            } catch (err) {
                setError(err.message || "שגיאת רשת בחיבור לשרת המרכזי");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmittingComment(true);

        try {
            const token = getToken();
            const r = await fetch(`${API}/articles/${id}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: commentText })
            });
            
            const res = await r.json();
            if (r.ok) {
                setCommentText("");
                const newComment = res.data ? res.data : res;
                
                setArticle(prev => ({
                    ...prev,
                    comments: [...(prev.comments || []), newComment]
                }));
            } else {
                alert(res.message || "נכשל בשילוח התגובה");
            }
        } catch {
            alert("שגיאת שרת בהזרקת התגובה");
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) return <div className="text-center py-32 font-mono text-[#ccff00] animate-pulse tracking-widest text-xs uppercase">// DOWNLOADING ARTICLE DATA...</div>;
    if (error || !article) return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white/5 border border-red-500/20 rounded-2xl text-center backdrop-blur-md">
        <p className="text-red-400 font-bold mb-4">{error || "המאמר אינו זמין עוד בשרת."}</p>
        <Link to="/articles" className="inline-block px-5 py-2 bg-[#ccff00] text-black font-bold rounded-xl text-xs">חזרה לרשימה</Link>
      </div>
    );

    return (
        <>
            <style>{ARTICLE_STYLES}</style>
            <div className="relative min-h-screen text-slate-200 pb-20" dir="rtl">
                <div className="dh-grid-bg" />
                <div className="ambient-glow top-0 right-10" />

                <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
                    <Breadcrumb items={[{ label: "מאמרים", to: "/articles" }, { label: article.title, active: true }]} />

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-8">
                        
                        {/* תפריט צדדי */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card p-6 rounded-2xl text-center">
                                <div className="w-12 h-12 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center text-base font-mono font-bold text-[#ccff00] mb-3 mx-auto">
                                    {article.author?.firstName?.[0]?.toUpperCase() || "M"}
                                </div>
                                <div className="text-sm font-bold text-white mb-0.5">{article.author?.firstName || "כותב"}</div>
                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">// {article.author?.role || "חבר"}</div>
                            </div>

                            {article.tags?.length > 0 && (
                                <div className="glass-card p-5 rounded-2xl">
                                    <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3 flex items-center gap-2">
                                        // תגיות
                                        <span className="flex-1 h-px bg-white/5" />
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {article.tags.map(tag => (
                                            <span key={tag} className="font-mono text-[11px] px-2.5 py-1 bg-[#ccff00]/5 border border-[#ccff00]/10 text-slate-300 rounded-lg">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* גוף המאמר */}
                        <div className="lg:col-span-3 space-y-8">
                            <article className="glass-card p-8 md:p-10 rounded-3xl">
                                <div className="flex items-center gap-2 font-mono text-[10px] text-[#ccff00] uppercase tracking-wider mb-4">
                                    <span>// ARTICLE</span>
                                    <span>•</span>
                                    <span className="text-slate-500">{timeAgo(article.createdAt)}</span>
                                </div>

                                <h1 className="text-2xl md:text-3xl font-black text-white mb-6 leading-tight">{article.title}</h1>
                                
                                <div className="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed font-light">
                                    <MarkdownRenderer source={article.content || ""} />
                                </div>
                            </article>

                            {/* תגובות */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-slate-500">
                                    <span>// תגובות ({article.comments?.length || 0})</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>

                                {article.comments?.length === 0 ? (
                                    <div className="glass-card py-10 rounded-2xl text-center text-sm text-slate-500 font-light">
                                        אין תגובות עדיין.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {article.comments?.map((comment, idx) => {
                                            const cAuthor = comment.user?.firstName || comment.authorName || "אנונימי";
                                            return (
                                                <div key={comment._id || idx} className="glass-card p-6 rounded-2xl">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                                                                {cAuthor[0]?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-slate-300">{cAuthor}</div>
                                                                <div className="text-[10px] text-slate-500 font-mono">{timeAgo(comment.createdAt)}</div>
                                                            </div>
                                                        </div>
                                                        <span className="font-mono text-[10px] text-slate-700">#{idx + 1}</span>
                                                    </div>
                                                    <div className="text-sm text-slate-300 font-light leading-relaxed pl-4">
                                                        <MarkdownRenderer source={comment.content || ""} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* טופס הגברת תגובה */}
                                <div className="glass-card p-6 rounded-2xl">
                                    <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
                                        <span className="text-[#ccff00]">↳</span> הוסף תגובה
                                    </h3>
                                    
                                    {isLoggedIn ? (
                                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                                            <MarkdownEditor 
                                                value={commentText} 
                                                onChange={setCommentText} 
                                                placeholder="כתוב תגובה..." 
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={submittingComment || !commentText.trim()}
                                                    className="bg-[#ccff00] hover:bg-[#bfff00] text-black font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#ccff00]/5 transition-all disabled:opacity-30"
                                                >
                                                    {submittingComment ? "שולח..." : "שגר ↳"}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="text-center py-4 bg-black/20 rounded-xl border border-white/5">
                                            <p className="text-xs text-slate-500 mb-2.5">עליך להתחבר כדי להגיב.</p>
                                            <button onClick={() => navigate("/auth")} className="border border-[#ccff00] text-[#ccff00] font-bold text-[11px] px-4 py-1.5 rounded-lg hover:bg-[#ccff00] hover:text-black transition-all">התחבר</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
 