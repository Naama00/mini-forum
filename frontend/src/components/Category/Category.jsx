import {
  ChevronRight,
  MessageSquare,
  Eye,
  Plus,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getToken } from "../../utils/storage";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MarkdownEditor from "../MarkdownEditor";
import MarkdownRenderer from "../MarkdownRenderer";
import { useAuth } from "../../hooks";
import styles from "./Category.module.css";


const API_BASE = "http://localhost:5000";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

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
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שעות`;
  if (diff < 604800) return `לפני ${Math.floor(diff / 86400)} ימים`;

  return new Date(dateStr).toLocaleDateString("he-IL");
}

function avatarInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getAuthorData(item) {
  if (!item) return null;

  return (
    item.author ||
    item.user ||
    item.userId ||
    (item.authorName ? { name: item.authorName } : null)
  );
}

function getAuthorName(item) {
  const author = getAuthorData(item);

  if (!author) return "אנונימי";

  const fullName = [author.firstName, author.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    author.name ||
    author.username ||
    author.authorName ||
    "אנונימי"
  );
}

function getAuthorId(item) {
  const author = getAuthorData(item);

  if (!author) return null;

  return author._id || author.id || null;
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function CategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const id = getIdFromUrl();
  const mode = getModeFromUrl();

  const isLoggedIn = !!user;

  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNewTopicForm, setShowNewTopicForm] = useState(false);

  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");

  const [creatingTopic, setCreatingTopic] = useState(false);

  /* ───────────────────────────────────────────── */

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!id) {
      setError("Missing ID");
      setLoading(false);
      return;
    }

    if (mode === "category") {
      fetch(`${API_BASE}/api/categories/${id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setCategory(res.data);
            setTopics(res.data?.topics || []);
          } else {
            setError(res.message);
          }

          setLoading(false);
        })
        .catch(() => {
          setError("Connection error");
          setLoading(false);
        });
    } else {
      fetch(`${API_BASE}/api/topics/${id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setTopic(res.data);
            setPosts(res.data?.posts || []);

            if (res.data?.categoryId) {
              fetch(`${API_BASE}/api/categories/${res.data.categoryId}`)
                .then((r) => r.json())
                .then((cRes) => {
                  if (cRes.success) {
                    setCategory(cRes.data);
                  }
                });
            }
          } else {
            setError(res.message);
          }

          setLoading(false);
        })
        .catch(() => {
          setError("Connection error");
          setLoading(false);
        });
    }
  }, [id, mode, location.search]);

  /* ─────────────────────────────────────────────
     CREATE TOPIC
  ───────────────────────────────────────────── */

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTopicTitle,
          content: newTopicContent,
          categoryId: id,
        }),
      });

      const res = await r.json();

      if (res.success) {
        window.location.href = `/category?topicId=${
          res.data._id || res.data.id
        }`;
      } else {
        alert(res.message);
      }
    } catch {
      alert("Error");
    } finally {
      setCreatingTopic(false);
    }
  };

  /* ───────────────────────────────────────────── */

  const handleReplyAdded = (newPost) => {
    setPosts((prev) => [...prev, newPost]);
  };

  const topicAuthorId =
    getAuthorId(topic) || getAuthorId(posts[0]) || null;

  /* ───────────────────────────────────────────── */

  return (
    <div className="page-shell relative overflow-hidden min-h-screen">
      {/* BG */}

      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="page-container relative z-10">
        {/* BREADCRUMBS */}

        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500 mb-8">
          <Link to="/">Home</Link>

          {category && (
            <>
              <span>/</span>

              <Link
                to={`/category?categoryId=${category.id || category._id}`}
                className="text-cyan-400"
              >
                {category.name}
              </Link>
            </>
          )}

          {mode === "topic" && topic && (
            <>
              <span>/</span>

              <span className="text-slate-300 truncate">
                {topic.title}
              </span>
            </>
          )}
        </div>

        {/* LOADING */}

        {loading && (
          <div className="py-32 text-center">
            <Zap className="w-10 h-10 text-cyan-400 animate-pulse mx-auto mb-4" />

            <p className="text-slate-500 uppercase tracking-widest text-sm">
              Loading...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="card-empty">
            <p className="text-red-400 mb-4">{error}</p>

            <Link to="/" className="button-primary">
              חזרה
            </Link>
          </div>
        )}

        {/* CATEGORY VIEW */}

        {!loading &&
          !error &&
          mode === "category" &&
          category && (
            <>
              {/* HERO */}

              <div className="glass-card glass-card-lg mb-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div>
                    <div className="tag-chip mb-5">
                      <Zap className="w-4 h-4" />
                      Active Category
                    </div>

                    <h1 className="text-5xl font-black mb-4 text-white">
                      <span className="text-gradient">
                        {category.name}
                      </span>
                    </h1>

                    <p className="text-slate-400 max-w-2xl leading-relaxed">
                      {category.description ||
                        "Explore advanced discussions and developer topics."}
                    </p>
                  </div>

                  {isLoggedIn ? (
                    <button
                      onClick={() =>
                        setShowNewTopicForm(!showNewTopicForm)
                      }
                      className="button-primary"
                    >
                      <Plus className="w-5 h-5" />
                      דיון חדש
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/auth")}
                      className="button-secondary"
                    >
                      התחבר
                    </button>
                  )}
                </div>
              </div>

              {/* NEW TOPIC */}

              {showNewTopicForm && (
                <form
                  onSubmit={handleCreateTopic}
                  className="glass-card glass-card-lg mb-10"
                >
                  <h3 className="panel-title">
                    Create New Topic
                  </h3>

                  <div className="space-y-5">
                    <input
                      type="text"
                      value={newTopicTitle}
                      onChange={(e) =>
                        setNewTopicTitle(e.target.value)
                      }
                      placeholder="Topic title..."
                      className="form-input"
                    />

                    <MarkdownEditor
                      value={newTopicContent}
                      onChange={setNewTopicContent}
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={creatingTopic}
                        className="button-primary"
                      >
                        {creatingTopic
                          ? "Creating..."
                          : "Create Topic"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* TOPICS */}

              {topics.length === 0 ? (
                <div className="card-empty">
                  <p className="text-slate-400">
                    אין עדיין דיונים בקטגוריה הזאת.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {topics.map((t) => {
                    const tId = t.id || t._id;

                    return (
                      <Link
                        key={tId}
                        to={`/category?topicId=${tId}`}
                        className="glass-card glass-card-md section-shadow-hover block group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl border border-slate-700 bg-slate-900/50 flex items-center justify-center font-bold text-cyan-400">
                              {avatarInitials(
                                getAuthorName(t)
                              )}
                            </div>

                            <div>
                              <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                                {t.title}
                              </h2>

                              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-slate-500">
                                <span>
                                  By{" "}
                                  {getAuthorName(t)}
                                </span>

                                <span>•</span>

                                <span>
                                  {timeAgo(t.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-sm text-slate-400 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />

                              {t.postCount || 0}
                            </div>

                            <div className="text-sm text-slate-400 flex items-center gap-2">
                              <Eye className="w-4 h-4" />

                              {t.views || 0}
                            </div>

                            <div className="w-10 h-10 rounded-full border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:translate-x-1 transition-transform">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

        {/* TOPIC VIEW */}

        {!loading &&
          !error &&
          mode === "topic" &&
          topic && (
            <>
              <div className="glass-card glass-card-lg mb-10">
                <h1 className="text-4xl font-black text-white mb-6">
                  {topic.title}
                </h1>

                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl border border-slate-700 bg-slate-900/50 flex items-center justify-center font-bold text-cyan-400">
                    {avatarInitials(getAuthorName(topic))}
                  </div>

                  <div>
                    <div className="font-semibold text-white">
                      {getAuthorName(topic)}
                    </div>

                    <div className="text-xs uppercase tracking-wider text-slate-500">
                      {timeAgo(topic.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  {posts[0] ? (
                    <MarkdownRenderer
                      source={posts[0].content}
                    />
                  ) : (
                    <MarkdownRenderer
                      source={topic.content || ""}
                    />
                  )}
                </div>
              </div>

              {/* POSTS */}

              <div className="space-y-6 mb-10">
                {posts.slice(1).map((post, i) => (
                  <div
                    key={post._id || post.id || i}
                    className="glass-card glass-card-md"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-900/50 flex items-center justify-center font-bold text-cyan-400">
                        {avatarInitials(
                          getAuthorName(post)
                        )}
                      </div>

                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          {getAuthorName(post)}

                          {getAuthorId(post) ===
                            topicAuthorId && (
                            <span className="tag-chip">
                              OP
                            </span>
                          )}
                        </div>

                        <div className="text-xs uppercase tracking-wider text-slate-500">
                          {timeAgo(post.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <MarkdownRenderer
                        source={post.content}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* REPLY */}

              <ReplyBox
                topicId={id}
                onReplyAdded={handleReplyAdded}
              />
            </>
          )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REPLY BOX
───────────────────────────────────────────── */

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          topicId,
        }),
      });

      const res = await r.json();

      if (res.success) {
        setContent("");

        if (onReplyAdded) {
          onReplyAdded(res.data);
        }
      }
    } catch {
      alert("Error");
    } finally {
      setSending(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="glass-card glass-card-lg text-center">
        <p className="text-slate-400 mb-5">
          עליך להתחבר כדי להגיב.
        </p>

        <button
          onClick={() => navigate("/auth")}
          className="button-primary"
        >
          התחברות
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card glass-card-lg"
    >
      <h3 className="panel-title">
        הוסף תגובה
      </h3>

      <div className="space-y-5">
        <MarkdownEditor
          value={content}
          onChange={setContent}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="button-primary"
          >
            {sending ? "Sending..." : "שלח תגובה"}
          </button>
        </div>
      </div>
    </form>
  );
}