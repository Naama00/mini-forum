import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";

import Breadcrumb from "./Breadcrumb";
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
        if (!r.ok) throw new Error("נכשל בטעינת המאמר");
        const res = await r.json();
        setArticle(res.data ? res.data : res);
      } catch (err) {
        setError(err.message || "שגיאת שרת");
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText }),
      });
      const res = await r.json();
      if (r.ok) {
        setCommentText("");
        setArticle((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data ? res.data : res],
        }));
      } else {
        alert(res.message || "נכשל בשליחת תגובה");
      }
    } catch {
      alert("שגיאת שרת");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        טוען מאמר...
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="page-shell flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
          <p className="text-red-400 mb-6">{error || "המאמר לא נמצא"}</p>
          <Link
            to="/articles"
            className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold"
          >
            חזרה למאמרים
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="page-shell">
      {/* ─── Background ──────────────────────────────────────── */}
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Breadcrumb */}
        <div className="mb-10">
          <Breadcrumb
            items={[
              { label: "מאמרים", to: "/articles" },
              { label: article.title, active: true },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ─── Sidebar ───────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Author */}
            <div className="section-card section-card-md">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 text-xl font-black mb-4">
                {article.author?.firstName?.[0]?.toUpperCase() || "M"}
              </div>
              <h3 className="font-bold text-lg text-white">
                {article.author?.firstName || "מחבר"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {article.author?.role || "Member"}
              </p>
            </div>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="section-card section-card-md">
                <h3 className="text-sm font-bold text-white mb-4">תגיות</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Main Content ──────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-8">
            {/* Article */}
            <article className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 md:p-12">
              <div className="flex items-center gap-3 text-sm text-cyan-300 mb-5">
                <span>{article.category || "Article"}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500">{timeAgo(article.createdAt)}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-8">
                {article.title}
              </h1>

              <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white">
                <MarkdownRenderer source={article.content || ""} />
              </div>
            </article>

            {/* Comments List */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <h2 className="text-2xl font-black">
                  תגובות ({article.comments?.length || 0})
                </h2>
              </div>

              {article.comments?.length === 0 ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-10 text-center text-slate-500">
                  אין תגובות עדיין.
                </div>
              ) : (
                <div className="space-y-4">
                  {article.comments?.map((comment, idx) => {
                    const cAuthor =
                      comment.user?.firstName || comment.authorName || "אנונימי";
                    return (
                      <div key={comment._id || idx} className="section-card section-card-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 font-black">
                              {cAuthor[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{cAuthor}</p>
                              <p className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-600">#{idx + 1}</span>
                        </div>
                        <div className="text-slate-300 leading-relaxed">
                          <MarkdownRenderer source={comment.content || ""} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="section-card section-card-md">
              <h3 className="text-xl font-bold mb-5">הוסף תגובה</h3>

              {isLoggedIn ? (
                <form onSubmit={handleCommentSubmit} className="space-y-5">
                  <MarkdownEditor
                    value={commentText}
                    onChange={setCommentText}
                    placeholder="כתוב תגובה..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="button-primary"
                    >
                      <Send className="w-4 h-4" />
                      {submittingComment ? "שולח..." : "שלח תגובה"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500 mb-4">עליך להתחבר כדי להגיב.</p>
                  <button onClick={() => navigate("/auth")} className="button-secondary">
                    התחבר
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}