import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "";

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
  const author = topic.author || topic.user || topic.creator || {};
  const authorName = author?.firstName
    ? `${author.firstName} ${author.lastName || ""}`.trim()
    : author?.username || author?.name || "אנונימי";
  const accent = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <a href={`/category?topicId=${topic.id || topic._id}`} className="topic-row"
      style={{ "--accent": accent, animationDelay: `${index * 0.04}s` }}>
      <div className="topic-row-left">
        <Avatar user={author} size={40} />
        <div className="topic-row-body">
          <div className="topic-title">{topic.title || topic.name || "ללא כותרת"}</div>
          <div className="topic-meta">
            <span className="topic-author">{authorName}</span>
            {topic.tags?.slice(0, 3).map((t) => (
              <span key={t} className="topic-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="topic-row-right">
        <div className="topic-stat">
          <span className="topic-stat-num">{topic.posts?.length ?? topic.replyCount ?? "—"}</span>
          <span className="topic-stat-label">תגובות</span>
        </div>
        <div className="topic-time">{timeAgo(topic.createdAt || topic.created_at)}</div>
        <span className="topic-arrow">›</span>
      </div>
    </a>
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
    <div className="vote-buttons">
      <button className={`vote-btn vote-up${voted === "up" ? " voted" : ""}`}
        onClick={() => handleVote("up")} title="הצבע בעד">▲</button>
      <span className={`vote-count${votes > 0 ? " positive" : votes < 0 ? " negative" : ""}`}>
        {votes}
      </span>
      <button className={`vote-btn vote-down${voted === "down" ? " voted" : ""}`}
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
    <div className={`post-card${isFirst ? " post-card-first" : ""}`}
      style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="post-card-header">
        <div className="post-author-block">
          <Avatar user={author} size={44} />
          <div>
            <div className="post-author-name">{authorName}</div>
            <div className="post-author-time">{timeAgo(post.createdAt || post.created_at)}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isFirst && <span className="post-op-badge">OP</span>}
          {isOwner && !editing && (
            <div className="post-actions">
              <button className="post-action-btn edit" onClick={() => { setEditing(true); setEditContent(post.content || ""); }}
                title="ערוך">✎</button>
              <button className="post-action-btn delete" onClick={() => setConfirmDelete(true)}
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

      {/* תוכן — עריכה inline */}
      {editing ? (
        <div className="post-edit-box">
          <textarea
            className="post-edit-textarea"
            value={editContent}
            onChange={e => { setEditContent(e.target.value); setEditError(null); }}
            rows={4}
          />
          {editError && <div className="post-edit-error">{editError}</div>}
          <div className="post-edit-actions">
            <button className="post-edit-save" onClick={handleSave} disabled={saving}>
              {saving ? <span className="auth-spinner" /> : "שמור"}
            </button>
            <button className="post-edit-cancel" onClick={() => { setEditing(false); setEditError(null); }}>
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <div className="post-content">{post.content || post.body || post.text || ""}</div>
      )}

      {/* אישור מחיקה */}
      {confirmDelete && (
        <div className="post-delete-confirm">
          <span>למחוק את הפוסט הזה?</span>
          <button className="post-delete-yes" onClick={handleDelete} disabled={deleting}>
            {deleting ? <span className="auth-spinner" /> : "מחק"}
          </button>
          <button className="post-delete-no" onClick={() => setConfirmDelete(false)}>ביטול</button>
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
      <div className="reply-box reply-box-locked">
        <span className="reply-locked-icon">◆</span>
        <span>יש להתחבר כדי להגיב</span>
        <button className="reply-login-btn" onClick={() => navigate("/auth")}>התחבר / הירשם</button>
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
    <div className="reply-box" style={{ direction: "rtl" }}>
      <div className="reply-box-header">
        <span className="divider-text">// הוסף תגובה</span>
      </div>
      <textarea className="nt-input nt-textarea reply-textarea"
        placeholder="כתוב את תגובתך כאן..."
        value={content}
        onChange={(e) => { setContent(e.target.value); setError(null); }}
        rows={4} />
      {error && <div className="auth-error">{error}</div>}
      <div className="reply-actions">
        <span className="reply-char-count">{content.length} תווים</span>
        <button className={`auth-submit reply-submit${loading ? " loading" : ""}`}
          onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="auth-spinner" /> : "פרסם תגובה ›"}
        </button>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const navigate = useNavigate();
  const [mode] = useState(getModeFromUrl);
  const [id] = useState(getIdFromUrl);
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
    <div className="forum-root">
      <div className="grid-overlay" />
      <div className="glow-orb glow-1" />
      <div className="glow-orb glow-2" />

      <header className="header">
        <div className="container">
          <div className="header-inner">
            <a href="/" className="logo">
              <div className="logo-mark" />
              <span className="logo-text">Dev<span>Hub</span></span>
            </a>
            <nav className="breadcrumb">
              <a href="/">בית</a>
              <span className="breadcrumb-sep">/</span>
              {mode === "topic" && data?.category && (
                <>
                  <a href={`/category?categoryId=${data.categoryId || data.category?.id}`}>
                    {data.category?.name || "קטגוריה"}
                  </a>
                  <span className="breadcrumb-sep">/</span>
                </>
              )}
              <span style={{ color: "rgba(226,232,240,0.7)" }}>{catName}</span>
            </nav>
            {!user && (
              <button className="header-cta" onClick={() => navigate("/auth")}>
                הרשמה / כניסה
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        {loading && <div className="state-center"><div className="big-spinner" /><span>טוען נתונים...</span></div>}
        {error && <div className="state-center"><div className="error-box">{error}</div></div>}

        {!loading && !error && data && (
          <>
            <div className="page-header">
              <div className="page-header-top">
                <div>
                  <div className="page-category-label">{mode === "topic" ? "// נושא" : "// קטגוריה"}</div>
                  <h1 className="page-title">{catName}</h1>
                  {data.description && <p className="page-desc">{data.description}</p>}
                </div>
                <div className="page-stats">
                  {mode === "category" && (
                    <div className="pstat">
                      <span className="pstat-num">{topics.length}</span>
                      <span className="pstat-label">נושאים</span>
                    </div>
                  )}
                  {mode === "topic" && (
                    <div className="pstat">
                      <span className="pstat-num">{Math.max(0, posts.length - 1)}</span>
                      <span className="pstat-label">תגובות</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {mode === "category" && (
              <>
                <div className="toolbar">
                  <div className="search-box">
                    <span className="search-icon">⌕</span>
                    <input placeholder="חיפוש בנושאים..."
                      value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <span className="results-count">{filteredTopics.length} נושאים</span>
                  <button className="new-topic-btn" onClick={() => navigate(`/new-topic?categoryId=${id}`)}>
                    + נושא חדש
                  </button>
                </div>
                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">// נושאים</span>
                  <div className="divider-line" />
                </div>
                {filteredTopics.length === 0 ? (
                  <div className="empty-box"><div className="empty-icon">◈</div><div>אין נושאים להצגה</div></div>
                ) : (
                  <div className="topics-list">
                    {filteredTopics.map((t, i) => <TopicRow key={t.id || t._id || i} topic={t} index={i} />)}
                  </div>
                )}
              </>
            )}

            {mode === "topic" && (
              <>
                {posts.length > 0 && (
                  <>
                    <div className="divider">
                      <div className="divider-line" />
                      <span className="divider-text">// פוסט מקורי</span>
                      <div className="divider-line" />
                    </div>
                    <PostRow post={posts[0]} index={0} isLoggedIn={isLoggedIn}
                      onNavigateAuth={() => navigate("/auth")}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                      topicAuthorId={topicAuthorId} />
                  </>
                )}

                <div className="divider" style={{ marginTop: 24 }}>
                  <div className="divider-line" />
                  <span className="divider-text">// תגובות ({Math.max(0, posts.length - 1)})</span>
                  <div className="divider-line" />
                </div>

                {posts.length <= 1 ? (
                  <div className="empty-box" style={{ paddingBottom: 24 }}>
                    <div className="empty-icon">◇</div>
                    <div>אין תגובות עדיין — היה הראשון להגיב</div>
                  </div>
                ) : (
                  <div className="posts-list">
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