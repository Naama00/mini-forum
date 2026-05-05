import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import MarkdownEditor from "./MarkdownEditor";
import MarkdownRenderer from "./MarkdownRenderer";
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
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
const AVATAR_COLORS = [
  "#00e5ff", "#7c4dff", "#ff4081", "#00e676",
  "#ff9100", "#40c4ff", "#ea80fc", "#ffd740",
];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function getUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch { return null; }
}

function Avatar({ user, size = 36 }) {
  const name = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.username || user?.name || "?";
  const color = avatarColor(name);
  const [imgErr, setImgErr] = useState(false);
  if ((user?.avatar || user?.icon) && !imgErr) {
    return (
      <img src={user.avatar || user.icon} alt={name} className="avatar-img"
        onError={() => setImgErr(true)}
        style={{ width: size, height: size, border: `2px solid ${color}` }} />
    );
  }
  return (
    <div className="avatar-initials" style={{
      width: size, height: size,
      background: `${color}22`, border: `2px solid ${color}`,
      fontSize: size * 0.36, color,
    }}>
      {avatarInitials(name)}
    </div>
  );
}

function TopicRow({ topic, index }) {
  const navigate = useNavigate();
  const author = topic.author || topic.user || topic.creator || {};
  const authorName = author?.firstName
    ? `${author.firstName} ${author.lastName || ""}`.trim()
    : author?.username || author?.name || "אנונימי";
  const accent = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className="bg-white/2 border border-white/7 px-6 py-4 rounded hover:bg-white/3 transition-colors cursor-pointer flex items-start justify-between"
      style={{ animationDelay: `${index * 0.04}s`, borderColor: `${accent}40` }}
      onClick={() => navigate(`/category?topicId=${topic.id || topic._id}`)}
    >
      <div className="flex-1 flex gap-4">
        <div className="flex-shrink-0">
          <Avatar user={author} size={40} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-white text-lg mb-2">{topic.title || topic.name || "ללא כותרת"}</div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm">{authorName}</span>
            {topic.tags?.slice(0, 3).map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${accent}20`, color: accent }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-cyan-500 font-bold">{topic.posts?.length ?? topic.replyCount ?? "—"}</div>
        <div className="text-xs text-slate-400">תגובות</div>
        <div className="text-xs text-slate-400 mt-2">{timeAgo(topic.createdAt || topic.created_at)}</div>
      </div>
    </div>
  );
}

function VoteButtons({ postId, initialVotes, isLoggedIn, onNavigateAuth }) {
  const [votes, setVotes] = useState(initialVotes ?? 0);
  const [voted, setVoted] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (dir) => {
    if (!isLoggedIn) {
      onNavigateAuth();
      return;
    }
    if (loading) return;

    const newDir = voted === dir ? null : dir;
    const delta = (newDir === "up" ? 1 : newDir === "down" ? -1 : 0) -
      (voted === "up" ? 1 : voted === "down" ? -1 : 0);

    setVoted(newDir);
    setVotes((v) => v + delta);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ direction: newDir }),
      });
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button className={`text-slate-400 hover:text-cyan-500 transition ${voted === "up" ? "text-cyan-500" : ""}`}
        onClick={() => handleVote("up")} title="הצבע בעד">▲</button>
      <span className={`text-xs font-mono font-bold ${votes > 0 ? "text-cyan-500" : votes < 0 ? "text-rose-500" : "text-slate-400"}`}>
        {votes}
      </span>
      <button className={`text-slate-400 hover:text-rose-500 transition ${voted === "down" ? "text-rose-500" : ""}`}
        onClick={() => handleVote("down")} title="הצבע נגד">▼</button>
    </div>
  );
}

function PostRow({ post, index, isLoggedIn, onNavigateAuth, onPostUpdated, onPostDeleted, topicAuthorId }) {
  const author = post.author || post.user || {};
  const authorName = author?.firstName
    ? `${author.firstName} ${author.lastName || ""}`.trim()
    : author?.username || author?.name || "אנונימי";
  const isFirst = index === 0;
  const loggedIn = getUser();
  const isOwner = loggedIn?.userId && author?._id &&
    loggedIn.userId.toString() === author._id.toString();

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) return setEditError("התוכן לא יכול להיות ריק");
    setSaving(true);
    setEditError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/posts/${post._id || post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "שגיאה בעדכון");
      onPostUpdated(post._id || post.id, editContent.trim());
      setEditing(false);
    } catch (e) {
      setEditError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/posts/${post._id || post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "שגיאה במחיקה");
      onPostDeleted(post._id || post.id);
    } catch (e) {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className={`bg-white/2 border border-white/7 px-6 py-5 rounded ${isFirst ? "border-cyan-500/30" : ""}`}
      style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <Avatar user={author} size={44} />
          <div>
            <div className="font-semibold text-white">{authorName}</div>
            <div className="text-xs text-slate-400">{timeAgo(post.createdAt || post.created_at)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isFirst && <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-mono">OP</span>}
          {isOwner && !editing && (
            <div className="flex gap-1">
              <button className="p-2 text-slate-400 hover:text-cyan-500 transition" onClick={() => { setEditing(true); setEditContent(post.content || ""); }}
                title="ערוך">✎</button>
              <button className="p-2 text-slate-400 hover:text-rose-500 transition" onClick={() => setConfirmDelete(true)}
                title="מחק">✕</button>
            </div>
          )}
          <VoteButtons
            postId={post._id || post.id}
            initialVotes={post.numberOfVotes}
            isLoggedIn={isLoggedIn}
            onNavigateAuth={onNavigateAuth}
          />
        </div>
      </div>

      {editing ? (
        <div className="bg-white/3 border border-white/10 p-4 rounded mb-4">
          <MarkdownEditor
            value={editContent}
            onChange={(v) => { setEditContent(v); setEditError(null); }}
            rows={6}
          />
          {editError && <div className="text-rose-500 text-sm mt-2">{editError}</div>}
          <div className="flex gap-3 mt-3">
            <button className="px-4 py-2 bg-cyan-500 text-gray-950 font-bold rounded hover:shadow-lg hover:shadow-cyan-500/35 disabled:opacity-50" onClick={handleSave} disabled={saving}>
              {saving ? <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /> : "שמור"}
            </button>
            <button className="px-4 py-2 bg-white/3 text-slate-200 font-bold rounded hover:bg-white/5" onClick={() => { setEditing(false); setEditError(null); }}>
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <div className="text-slate-300 mb-4"><MarkdownRenderer source={post.content || post.body || post.text || ""} /></div>
      )}

      {confirmDelete && (
        <div className="bg-rose-500/15 border border-rose-500/40 p-3 rounded flex items-center justify-between gap-4">
          <span className="text-rose-400">למחוק את הפוסט הזה?</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-rose-500 text-white font-bold rounded text-sm hover:shadow-lg hover:shadow-rose-500/35 disabled:opacity-50" onClick={handleDelete} disabled={deleting}>
              {deleting ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "מחק"}
            </button>
            <button className="px-3 py-1.5 bg-white/3 text-slate-200 font-bold rounded text-sm hover:bg-white/5" onClick={() => setConfirmDelete(false)}>ביטול</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReplyBox({ topicId, onReplyAdded }) {
  const navigate = useNavigate();
  const user = getUser();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) {
    return (
      <div className="bg-white/2 border border-white/7 px-6 py-4 rounded flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-cyan-500">◆</span>
          <span className="text-slate-400">יש להתחבר כדי להגיב</span>
        </div>
        <button className="px-6 py-2.75 bg-cyan-500 text-gray-950 font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35" onClick={() => navigate("/auth")}>התחבר / הירשם</button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim()) return setError("יש להזין תוכן לתגובה");
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: content.trim(), topicId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "שגיאה");
      setContent("");
      onReplyAdded(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/2 border border-white/7 px-6 py-5 rounded" dir="rtl">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">// הוסף תגובה</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <MarkdownEditor
        value={content}
        onChange={(v) => { setContent(v); setError(null); }}
        placeholder="כתוב את תגובתך כאן..."
        rows={4}
      />
      {error && <div className="text-rose-500 text-sm mt-3">{error}</div>}
      <div className="flex items-center justify-between mt-4">
        <span className="text-slate-400 text-xs">{content.length} תווים</span>
        <button className={`px-6 py-2.75 bg-cyan-500 text-gray-950 font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35 disabled:opacity-50 flex items-center gap-2 ${loading ? "opacity-60" : ""}`}
          onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" /> : "פרסם תגובה ›"}
        </button>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("topicId") || searchParams.get("categoryId");
  const mode = searchParams.get("topicId") ? "topic" : "category";
  const [data, setData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tokenUser = getUser();
    if (tokenUser?.userId) {
      fetch(`http://localhost:5000/api/users/${tokenUser.userId}`)
        .then(r => r.json())
        .then(res => { if (res.success) setUser(res.data); })
        .catch(() => { });
    }
  }, []);

  useEffect(() => {
    if (!id) { setError("לא סופק ID"); setLoading(false); return; }
    const url = mode === "topic"
      ? `${API_BASE}/api/topics/${id}`
      : `${API_BASE}/api/categories/${id}`;
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => {
        const payload = d.data || d;
        setData(payload);
        if (mode === "category") {
          const t = payload.topics || payload.subcategories || payload.children || [];
          setTopics(Array.isArray(t) ? t : []);
        } else {
          const p = payload.posts || payload.replies || [];
          setPosts(Array.isArray(p) ? p : []);
        }
        setLoading(false);
      })
      .catch((e) => { setError(`שגיאה: ${e.message}`); setLoading(false); });
  }, [id, mode]);

  const handleReplyAdded = (newPost) => setPosts((prev) => [...prev, newPost]);

  const handlePostUpdated = (postId, newContent) => {
    setPosts(prev => prev.map(p =>
      (p._id || p.id) === postId ? { ...p, content: newContent } : p
    ));
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
  };

  const filteredTopics = topics.filter((t) =>
    !search || (t.title || t.name || "").toLowerCase().includes(search.toLowerCase())
  );
  const catName = data?.name || data?.title || (mode === "topic" ? "נושא" : "קטגוריה");
  const isLoggedIn = !!getUser();
  const topicAuthorId = posts[0]?.author?._id;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 rtl" dir="rtl">
      {/* Header */}
      <header className="border-b border-white/8 bg-gray-950/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded" />
              <span className="text-white font-bold">Dev<span className="text-cyan-500">Hub</span></span>
            </a>
            <nav className="flex items-center gap-2 text-sm text-slate-400">
              <a href="/" className="hover:text-cyan-500">בית</a>
              <span className="text-white/30">/</span>

              {mode === "topic" && data?.category && (
                <>
                  <a href={`/category?categoryId=${data.category?._id}`} className="hover:text-cyan-500">
                    {data.category?.name || "קטגוריה"}
                  </a>
                  <span className="text-white/30">/</span>
                </>
              )}

              <span className="text-slate-400">
                {data?.name || data?.title || (mode === "topic" ? "נושא" : "קטגוריה")}
              </span>
            </nav>
            {!user && (
              <button className="px-6 py-2.75 bg-cyan-500 text-gray-950 font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35" onClick={() => navigate("/auth")}>
                הרשמה / כניסה
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-8">
        {loading && <div className="flex flex-col items-center justify-center py-12"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" /><span className="text-slate-400">טוען נתונים...</span></div>}
        {error && <div className="bg-rose-500/15 border border-rose-500/40 text-rose-400 px-5 py-3 rounded-lg">{error}</div>}

        {!loading && !error && data && (
          <>
            <div className="mb-12">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">{mode === "topic" ? "// נושא" : "// קטגוריה"}</div>
                  <h1 className="text-4xl font-bold text-white mb-2">{catName}</h1>
                  {data.description && <p className="text-slate-400 text-sm">{data.description}</p>}
                </div>
                <div className="flex-shrink-0">
                  {mode === "category" && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-500">{topics.length}</div>
                      <div className="text-xs uppercase tracking-widest text-slate-400 mt-1">נושאים</div>
                    </div>
                  )}
                  {mode === "topic" && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-500">{Math.max(0, posts.length - 1)}</div>
                      <div className="text-xs uppercase tracking-widest text-slate-400 mt-1">תגובות</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {mode === "category" && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 flex items-center gap-2 bg-white/3 border border-white/8 px-3.5 py-2.5 rounded">
                    <span className="text-slate-400">⌕</span>
                    <input placeholder="חיפוש בנושאים..." className="flex-1 bg-transparent text-slate-200 outline-none placeholder-slate-400"
                      value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <span className="text-slate-400 text-sm">{filteredTopics.length} נושאים</span>
                  <button className="px-6 py-2.75 bg-cyan-500 text-gray-950 font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35" onClick={() => navigate(`/new-topic?categoryId=${id}`)}>
                    + נושא חדש
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">// נושאים</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                {filteredTopics.length === 0 ? (
                  <div className="text-center py-12"><div className="text-4xl mb-3">◈</div><div className="text-slate-400">אין נושאים להצגה</div></div>
                ) : (
                  <div className="space-y-1">
                    {filteredTopics.map((t, i) => <TopicRow key={t.id || t._id || i} topic={t} index={i} />)}
                  </div>
                )}
              </>
            )}

            {mode === "topic" && (
              <>
                {posts.length > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">// פוסט מקורי</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <PostRow post={posts[0]} index={0} isLoggedIn={isLoggedIn}
                      onNavigateAuth={() => navigate("/auth")}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                      topicAuthorId={topicAuthorId} />
                  </>
                )}

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">// תגובות ({Math.max(0, posts.length - 1)})</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {posts.length <= 1 ? (
                  <div className="text-center py-12 mb-12">
                    <div className="text-4xl mb-3">◇</div>
                    <div className="text-slate-400">אין תגובות עדיין — היה הראשון להגיב</div>
                  </div>
                ) : (
                  <div className="space-y-4 mb-12">
                    {posts.slice(1).map((p, i) => (
                      <PostRow key={p.id || p._id || i} post={p} index={i + 1}
                        isLoggedIn={isLoggedIn} onNavigateAuth={() => navigate("/auth")}
                        onPostUpdated={handlePostUpdated}
                        onPostDeleted={handlePostDeleted}
                        topicAuthorId={topicAuthorId} />
                    ))}
                  </div>
                )}

                <ReplyBox topicId={id} onReplyAdded={handleReplyAdded} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}