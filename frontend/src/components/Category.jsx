import { useState, useEffect } from "react";
import { getToken } from "../utils/storage";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MarkdownEditor from "./MarkdownEditor";
import MarkdownRenderer from "./MarkdownRenderer";
import { useAuth } from "../hooks";

const API_BASE = "http://localhost:5000";

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("categoryId") || params.get("topicId") || null;
}
function getModeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("topicId")) return "topic";
  return "category";
}
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "עכשיו";
  if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דק'`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שע'`;
  if (diff < 604800) return `לפני ${Math.floor(diff / 86400)} ימים`;
  return new Date(dateStr).toLocaleDateString("he-IL");
}
function avatarInitials(name = "") {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function getAuthorData(item) {
  if (!item) return null;
  if (item.author) return item.author;
  if (item.user) return item.user;
  if (item.userId) return item.userId;
  if (item.authorName) return { name: item.authorName };
  return null;
}

function getAuthorName(item) {
  const author = getAuthorData(item);
  if (!author) return "אנונימי";
  const name = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  return author.name || author.username || author.authorName || "אנונימי";
}

function getAuthorId(item) {
  const author = getAuthorData(item);
  if (!author) return null;
  return author._id || author.id || null;
}

export default function CategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const id = getIdFromUrl();
  const mode = getModeFromUrl(); // "category" | "topic"

  const isLoggedIn = !!user;

  // State
  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State עבור נושא חדש
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [creatingTopic, setCreatingTopic] = useState(false);

  // מעקב אחרי שינוי ה-URL (ניווט פנימי)
  useEffect(() => {
    setLoading(true);
    setError(null);
    setShowNewTopicForm(false);
    setNewTopicTitle("");
    setNewTopicContent("");

    if (!id) {
      setError("מזהה חסר בכתובת ה-URL");
      setLoading(false);
      return;
    }

    if (mode === "category") {
      // 1. טעינת קטגוריה ונושאיה
      fetch(`${API_BASE}/api/categories/${id}`)
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            setCategory(res.data);
            setTopics(res.data?.topics || []);
          } else {
            setError(res.message || "נכשל בטעינת הקטגוריה");
          }
          setLoading(false);
        })
        .catch(() => {
          setError("שגיאת רשת בטעינת הקטגוריה");
          setLoading(false);
        });
    } else {
      // 2. טעינת דיון (Topic) והפוסטים שלו
      fetch(`${API_BASE}/api/topics/${id}`)
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            setTopic(res.data);
            setPosts(res.data?.posts || []);
            // אם יש מזהה קטגוריה בתוך הנושא, נביא גם את פרטי הקטגוריה בשביל ה-Breadcrumbs
            if (res.data?.categoryId) {
              fetch(`${API_BASE}/api/categories/${res.data.categoryId}`)
                .then(r => r.json())
                .then(cRes => { if (cRes.success) setCategory(cRes.data); });
            }
          } else {
            setError(res.message || "נכשל בטעינת הדיון");
          }
          setLoading(false);
        })
        .catch(() => {
          setError("שגיאת רשת בטעינת הדיון");
          setLoading(false);
        });
    }
  }, [id, mode, location.search]);

  // יצירת נושא חדש
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
    setCreatingTopic(true);

    try {
      const token = getToken();
      const r = await fetch(`${API_BASE}/api/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTopicTitle,
          content: newTopicContent,
          categoryId: id
        })
      });
      const res = await r.json();
      if (res.success) {
        // רענון הנושאים או מעבר לנושא החדש
        window.location.href = `/category?topicId=${res.data._id || res.data.id}`;
      } else {
        alert(res.message || "יצירת הדיון נכשלה");
      }
    } catch {
      alert("שגיאת תקשורת בבניית הדיון");
    } finally {
      setCreatingTopic(false);
    }
  };

  // הוספת תגובה
  const handleReplyAdded = (newPost) => {
    setPosts(prev => [...prev, newPost]);
  };

  const handlePostUpdated = (postId, newContent) => {
    if (mode === "topic" && topic) {
      setPosts(prev => prev.map(p => {
        if ((p.id || p._id) === postId) return { ...p, content: newContent, isEdited: true };
        return p;
      }));
      if ((topic.firstPostId === postId) || (topic.posts?.[0]?._id === postId)) {
        setTopic(prev => prev ? { ...prev, content: newContent } : null);
      }
    }
  };

  const handlePostDeleted = (postId) => {
    if (mode === "topic") {
      setPosts(prev => prev.filter(p => (p.id || p._id) !== postId));
    }
  };

  const topicAuthorId = getAuthorId(topic) || getAuthorId(posts[0]) || null;

  // סגנונות מקומיים ייחודיים לטובת מראה ניאון-גלאס בהתאמה לתמונה
  const CATEGORY_STYLES = `
    /* Background grid + glow spots */
    .cyber-bg-grid {
      position: fixed;
      inset: 0;
      background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.0) 1px, transparent 0),
                        linear-gradient(90deg, rgba(10,10,12,0.96), rgba(6,6,8,0.98));
      background-size: 32px 32px;
      z-index: -1;
      opacity: 0.9;
    }

    .cyber-glow-spot {
      position: fixed;
      width: 520px;
      height: 520px;
      background: radial-gradient(circle, rgba(0,229,255,0.08), transparent 50%);
      filter: blur(80px);
      z-index: -1;
      pointer-events: none;
    }

    /* Base glass-panel transformed into neon gradient cards */
    .glass-panel {
      background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.04);
      box-shadow: 0 8px 30px rgba(2,6,23,0.7), inset 0 1px 0 rgba(255,255,255,0.02);
      backdrop-filter: blur(14px) saturate(120%);
      transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease, background 220ms ease;
    }

    /* Prominent hover state for cards */
    .glass-panel:hover {
      transform: translateY(-6px);
      border-color: rgba(204,255,0,0.12);
      box-shadow: 0 18px 50px rgba(2,6,23,0.8), 0 0 40px rgba(0,229,255,0.06);
      background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.03));
    }

    /* Large hero/category header look */
    .glass-panel.p-8, .glass-panel.p-12 {
      border-radius: 28px;
      padding: 2rem;
      background: linear-gradient(90deg, rgba(16,12,28,0.6), rgba(6,6,8,0.55));
      border: 1px solid rgba(102,51,255,0.06);
    }

    /* Gradient headline mask */
    .fade-mask-header {
      background: linear-gradient(90deg, rgba(0,229,255,0.25), rgba(204,255,0,0.25) 40%, rgba(255,0,170,0.12));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    /* Neon text glow used in titles */
    .neon-text-glow {
      color: #dfffbf;
      text-shadow: 0 6px 40px rgba(0,229,255,0.06), 0 0 10px rgba(204,255,0,0.06);
    }

    /* Action buttons with neon outline */
    .neon-border-btn {
      border: 1px solid rgba(204,255,0,0.9);
      color: rgba(204,255,0,0.95);
      background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.02));
      box-shadow: 0 6px 18px rgba(0,0,0,0.6), inset 0 0 8px rgba(204,255,0,0.03);
      transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
    }

    .neon-border-btn:hover {
      transform: translateY(-2px);
      background: linear-gradient(180deg, rgba(204,255,0,0.12), rgba(0,229,255,0.06));
      color: #071012;
      box-shadow: 0 10px 36px rgba(204,255,0,0.12), 0 0 40px rgba(0,229,255,0.06);
    }

    /* Avatar and highlight tweaks for list items */
    .glass-panel .w-10.h-10, .glass-panel .w-9.h-9, .glass-panel .w-8.h-8 {
      background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
      border: 1px solid rgba(255,255,255,0.04);
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.45);
    }

    /* Small stat chip style */
    .stat-chip {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.04);
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 11px;
      color: #dbeafe;
    }

    /* Link arrow animation */
    .glass-panel .w-8.h-8 svg {
      transition: transform 220ms ease, opacity 220ms ease;
    }
    .glass-panel:hover .w-8.h-8 svg { transform: translateX(-4px); opacity: 1; }

    /* Small utility tweaks */
    .badge-pinned { background: rgba(204,255,0,0.08); color: #ccff00; padding: 2px 8px; border-radius: 999px; font-size: 10px; }
    .badge-trending { background: linear-gradient(90deg,#ff6bd9,#5be0ff); color: white; padding: 3px 8px; border-radius: 999px; font-size: 10px; }

    @media (min-width: 768px) {
      .glass-panel.p-8, .glass-panel.p-12 { padding: 2.5rem; }
    }
  `;

  return (
    <>
      <style>{CATEGORY_STYLES}</style>
      <div className="relative min-h-screen text-slate-200 overflow-hidden pb-20" dir="rtl">
        {/* שכבות רקע */}
        <div className="cyber-bg-grid" />
        <div className="cyber-glow-spot -top-40 -right-20" />
        <div className="cyber-glow-spot bottom-20 -left-20 opacity-60" />

        <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
          
          {/* ─── BREADCRUMBS (נתיב ניווט) ─── */}
          <nav className="flex items-center gap-2 text-xs font-mono tracking-wide text-slate-500 uppercase mb-8 bg-white/5 inline-flex px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
            <a href="/" className="hover:text-[#ccff00] transition-colors">DevHub</a>
            <span>/</span>
            {category && (
              <a href={`/category?categoryId=${category.id || category._id}`} className={`hover:text-[#ccff00] transition-colors ${mode === "category" ? "text-[#ccff00] font-bold" : ""}`}>
                {category.name}
              </a>
            )}
            {mode === "topic" && topic && (
              <>
                <span>/</span>
                <span className="text-slate-300 font-bold max-w-[200px] truncate">{topic.title}</span>
              </>
            )}
          </nav>

          {/* שגיאות / טעינה */}
          {loading && (
            <div className="text-center py-32 font-mono text-[#ccff00] animate-pulse tracking-widest uppercase">
              // LOADING CORE TERMINAL...
            </div>
          )}

          {error && (
            <div className="glass-panel p-8 rounded-2xl border-red-500/30 text-center max-w-xl mx-auto my-12">
              <div className="text-red-400 text-3xl mb-3">⚠️</div>
              <div className="text-slate-300 text-lg font-bold mb-4">{error}</div>
              <a href="/" className="neon-border-btn px-6 py-2 rounded-xl text-sm inline-block">חזרה לדף הבית</a>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* ════════════════════════════════════════════════════════════
                  MODE 1: CATEGORY VIEW (רשימת הדיונים בקטגוריה)
                  ════════════════════════════════════════════════════════════ */}
              {mode === "category" && category && (
                <div>
                  {/* Category Header */}
                  <div className="glass-panel p-8 md:p-12 rounded-3xl mb-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/5 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <h1 className="text-4xl font-black text-white mb-3 tracking-tight fade-mask-header">{category.name}</h1>
                      <p className="text-slate-400 text-sm max-w-2xl font-light leading-relaxed">{category.description || "ברוכים הבאים לזירת הדיונים המקצועית."}</p>
                    </div>

                    {isLoggedIn ? (
                      <button
                        onClick={() => setShowNewTopicForm(!showNewTopicForm)}
                        className="neon-border-btn px-6 py-3 rounded-2xl font-bold text-sm tracking-wide shrink-0"
                      >
                        {showNewTopicForm ? "סגור חלונית" : "◇ פתח דיון חדש"}
                      </button>
                    ) : (
                      <button onClick={() => navigate("/auth")} className="glass-panel hover:bg-white/5 border-white/10 text-slate-400 px-6 py-3 rounded-2xl text-sm font-medium shrink-0">
                        התחבר כדי לפתוח דיון
                      </button>
                    )}
                  </div>

                  {/* New Topic Form */}
                  {showNewTopicForm && (
                    <form onSubmit={handleCreateTopic} className="glass-panel p-8 rounded-3xl mb-12 border-[#ccff00]/30 animate-in fade-in slide-in-from-top-4 duration-300">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-[#ccff00]">◈</span> יצירת נושא טכנולוגי חדש
                      </h3>
                      <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">כותרת הדיון</label>
                        <input
                          type="text"
                          required
                          placeholder="למשל: ארכיטקטורת מיקרו-פרונטאנד ב-React 19..."
                          value={newTopicTitle}
                          onChange={e => setNewTopicTitle(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all"
                        />
                      </div>
                      <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">תוכן הדיון (תומך Markdown)</label>
                        <MarkdownEditor value={newTopicContent} onChange={setNewTopicContent} placeholder="פרט את השאלה, הארכיטקטורה או הבעיה..." />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowNewTopicForm(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 text-sm transition-colors">ביטול</button>
                        <button type="submit" disabled={creatingTopic} className="bg-[#ccff00] hover:bg-[#bfff00] text-black font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-[#ccff00]/10 transition-all disabled:opacity-50">
                          {creatingTopic ? "מפיץ לשרת..." : "שגר נושא"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Topics List */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-mono">// נושאים חמים בזירה</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/5 to-transparent" />
                  </div>

                  {topics.length === 0 ? (
                    <div className="glass-panel py-20 rounded-3xl text-center">
                      <div className="text-slate-600 text-5xl mb-4">⬡</div>
                      <p className="text-slate-400 max-w-sm mx-auto font-light">אין עדיין דיונים בקטגוריה זו. תהיה המפתח שיוזם את השיחה הראשונה!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topics.map(t => {
                        const tId = t.id || t._id;
                        return (
                          <Link
                            key={tId}
                            to={`/category?topicId=${tId}`}
                            className="glass-panel block w-full p-6 rounded-2xl flex flex-col sm:flex-row-reverse items-end gap-4 cursor-pointer group transition-all no-underline border border-white/5 hover:border-[#ccff00]/30 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#ccff00]/20 text-right"
                          >
                            <div className="flex items-end justify-end gap-4 min-w-0 w-full max-w-full text-right">
                              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 font-bold font-mono text-xs text-slate-400 group-hover:border-[#ccff00]/40 group-hover:text-[#ccff00] transition-colors">
                                {avatarInitials(getAuthorName(t))}
                              </div>
                              <div className="min-w-0 flex-1 text-right">
                                <h2 className="text-base font-bold text-slate-200 group-hover:text-[#ccff00] transition-colors truncate mb-1">{t.title}</h2>
                                <div className="flex items-center gap-3 justify-end text-xs text-slate-500 font-mono">
                                  <span>מאת: <span className="text-slate-400">{getAuthorName(t)}</span></span>
                                  <span>•</span>
                                  <span>{timeAgo(t.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 shrink-0 self-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                              <div className="flex gap-4 font-mono text-[11px] text-slate-500 uppercase justify-end">
                                <div>תגובות: <span className="text-slate-300 font-bold">{t.postCount || 0}</span></div>
                                <div>צפיות: <span className="text-slate-300">{t.views || 0}</span></div>
                              </div>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 group-hover:border-[#ccff00] group-hover:bg-[#ccff00]/10 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccff00" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  MODE 2: TOPIC VIEW (עמוד הדיון הפנימי והתגובות)
                  ════════════════════════════════════════════════════════════ */}
              {mode === "topic" && topic && (
                <div>
                  {/* Topic Main Box */}
                  <div className="glass-panel p-8 rounded-3xl mb-10 relative overflow-hidden border-[#ccff00]/20">
                    <div className="absolute top-0 left-0 px-4 py-1 bg-[#ccff00]/10 text-[#ccff00] font-mono text-[10px] uppercase tracking-widest rounded-bl-xl border-l border-b border-[#ccff00]/20">
                      Main Thread
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-white mb-6 leading-tight neon-text-glow">{topic.title}</h1>
                    
                    <div className="flex items-center gap-3 border-b border-white/5 pb-6 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#ccff00]/5 border border-[#ccff00]/10 flex items-center justify-center font-bold text-xs text-[#ccff00]">
                        {avatarInitials(getAuthorName(topic))}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">{getAuthorName(topic)}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{timeAgo(topic.createdAt)}</div>
                      </div>
                    </div>

                    {/* פוסט ראשון / תוכן הדיון */}
                    <div className="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-light">
                      {posts[0] ? (
                        <MarkdownRenderer source={posts[0].content} />
                      ) : (
                        <MarkdownRenderer source={topic.content || ""} />
                      )}
                    </div>

                    {/* פעולות מנהל / כותב פוסט מקורי */}
                    {posts[0] && (
                      <PostActionsBlock
                        post={posts[0]}
                        isLoggedIn={isLoggedIn}
                        onNavigateAuth={() => navigate("/auth")}
                        onPostUpdated={handlePostUpdated}
                        onPostDeleted={() => { handlePostDeleted(posts[0]._id || posts[0].id); navigate(`/category?categoryId=${topic.categoryId}`); }}
                        topicAuthorId={topicAuthorId}
                        isMainThread={true}
                      />
                    )}
                  </div>

                  {/* כותרת הפרדת תגובות */}
                  <div className="flex items-center gap-4 my-10">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                    <span className="text-slate-400 font-mono text-xs uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                      // תגובות מומחים ({Math.max(0, posts.length - 1)})
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                  </div>

                  {/* רשימת תגובות */}
                  {posts.length <= 1 ? (
                    <div className="glass-panel py-16 rounded-3xl text-center mb-10">
                      <div className="text-slate-600 text-3xl mb-2">◇</div>
                      <div className="text-slate-400 font-light">אין תגובות עדיין בדיון זה. הוסף את הניתוח המקצועי שלך ראשון!</div>
                    </div>
                  ) : (
                    <div className="space-y-6 mb-12">
                      {posts.slice(1).map((p, i) => (
                        <PostRow
                          key={p.id || p._id || i}
                          post={p}
                          index={i + 1}
                          isLoggedIn={isLoggedIn}
                          onNavigateAuth={() => navigate("/auth")}
                          onPostUpdated={handlePostUpdated}
                          onPostDeleted={handlePostDeleted}
                          topicAuthorId={topicAuthorId}
                        />
                      ))}
                    </div>
                  )}

                  {/* תיבת תגובה מהירה */}
                  <div className="glass-panel p-6 md:p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-[#ccff00]">↳</span> הוסף תגובה לסימולציה
                    </h3>
                    <ReplyBox topicId={id} onReplyAdded={handleReplyAdded} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTS פנימיים משודרגים לעיצוב הניאון והכהה
   ════════════════════════════════════════════════════════════════════════════ */

function PostRow({ post, index, isLoggedIn, onNavigateAuth, onPostUpdated, onPostDeleted, topicAuthorId }) {
  const pId = post.id || post._id;
  const isOP = getAuthorId(post) === topicAuthorId;

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all hover:bg-white/[0.03]">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold font-mono text-xs text-slate-400">
            {avatarInitials(getAuthorName(post))}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-300 flex items-center gap-2">
              {getAuthorName(post)}
              {isOP && <span className="text-[10px] bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] px-1.5 py-0.5 rounded-md font-mono">OP</span>}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">#{index} • {timeAgo(post.createdAt)}</div>
          </div>
        </div>

        {/* מערכת הצבעות מובנית */}
        <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/5 font-mono text-xs">
          <button className="text-slate-500 hover:text-[#ccff00] transition-colors">▲</button>
          <span className="text-slate-300 px-0.5">{post.likesCount || 0}</span>
          <button className="text-slate-500 hover:text-red-400 transition-colors">▼</button>
        </div>
      </div>

      <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed mb-4 font-light">
        <MarkdownRenderer source={post.content || ""} />
      </div>

      <PostActionsBlock
        post={post}
        isLoggedIn={isLoggedIn}
        onNavigateAuth={onNavigateAuth}
        onPostUpdated={onPostUpdated}
        onPostDeleted={onPostDeleted}
        topicAuthorId={topicAuthorId}
        isMainThread={false}
      />
    </div>
  );
}

function PostActionsBlock({ post, isLoggedIn, onNavigateAuth, onPostUpdated, onPostDeleted, topicAuthorId, isMainThread }) {
  const pId = post.id || post._id;
  const { user } = useAuth();
  const currentUserId = user ? (user.id || user._id) : null;
  const postOwnerId = getAuthorId(post);
  const canEdit = isLoggedIn && (currentUserId === postOwnerId || user?.role === "admin");

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const token = getToken();
      const r = await fetch(`${API_BASE}/api/posts/${pId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: editContent })
      });
      const res = await r.json();
      if (res.success) {
        onPostUpdated(pId, editContent);
        setIsEditing(false);
      } else { alert(res.message || "עדכון נכשל"); }
    } catch { alert("שגיאת רשת בעדכון"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(isMainThread ? "מחיקת הפוסט הראשי תמחוק את כל השרשור חלוטין. להמשיך?" : "למחוק תגובה זו?")) return;
    try {
      const token = getToken();
      const r = await fetch(`${API_BASE}/api/posts/${pId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const res = await r.json();
      if (res.success) { onPostDeleted(pId); }
      else { alert(res.message || "מחיקה נכשלה"); }
    } catch { alert("שגיאת רשת במחיקה"); }
  };

  if (isEditing) {
    return (
      <div className="mt-4 bg-black/30 p-4 rounded-xl border border-white/5 animate-in fade-in duration-200">
        <MarkdownEditor value={editContent} onChange={setEditContent} />
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={() => setIsEditing(false)} className="text-xs text-slate-400 px-3 py-1.5 hover:bg-white/5 rounded-lg">ביטול</button>
          <button onClick={handleSave} disabled={saving} className="bg-[#ccff00] text-black font-bold text-xs px-4 py-1.5 rounded-lg shadow-md">
            {saving ? "מעדכן..." : "שמור שינויים"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3 text-xs font-mono text-slate-500">
      <div className="flex items-center gap-4">
        {post.isEdited && <span className="text-[10px] text-slate-600 italic">// נערך</span>}
      </div>
      
      {canEdit && (
        <div className="flex items-center gap-3">
          <button onClick={() => { setIsEditing(true); setEditContent(post.content); }} className="hover:text-[#ccff00] transition-colors">ערוך</button>
          <span className="text-slate-700">|</span>
          <button onClick={handleDelete} className="hover:text-red-400 transition-colors">מחק</button>
        </div>
      )}
    </div>
  );
}

function ReplyBox({ topicId, onReplyAdded }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);

    try {
      const token = getToken();
      const r = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content, topicId })
      });
      const res = await r.json();
      if (res.success) {
        setContent("");
        if (onReplyAdded) onReplyAdded(res.data);
      } else { alert(res.message || "הוספת התגובה נכשלה"); }
    } catch { alert("שגיאת שרת בשילוח התגובה"); }
    finally { setSending(false); }
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center py-6 bg-black/20 rounded-2xl border border-white/5">
        <p className="text-sm text-slate-400 mb-3">עליך להיות מחובר למערכת על מנת להגיב בדיון זה.</p>
        <button onClick={() => navigate("/auth")} className="neon-border-btn px-5 py-2 rounded-xl text-xs font-bold">התחבר עכשיו</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MarkdownEditor value={content} onChange={setContent} placeholder="כתוב את תגובתך המקצועית כאן..." />
      <div className="flex justify-between items-center">
        <div className="text-[11px] font-mono text-slate-600 uppercase tracking-widest">// תומך בקוד ועיצוב Markdown</div>
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="bg-[#ccff00] hover:bg-[#bfff00] text-black font-black text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-[#ccff00]/5 transition-all disabled:opacity-30"
        >
          {sending ? "מזרים..." : "שגר תגובה ↳"}
        </button>
      </div>
    </form>
  );
}