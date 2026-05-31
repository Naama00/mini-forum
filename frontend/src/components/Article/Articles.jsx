import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart } from "lucide-react";

import Breadcrumb from "../Breadcrumb";
import { useAuth } from "../../hooks";
import { getToken } from "../../utils/storage";

const API = "http://localhost:5000/api";

function timeAgo(dateStr) {
  if (!dateStr) return "עכשיו";
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דק'`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שע'`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

export default function ArticlesPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchArticles = async (opts = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append("q", search);
      if (opts.tag) params.append("tag", opts.tag);
      const res = await fetch(`${API}/articles?${params.toString()}`);
      const r = await res.json();
      const data = r.data ? r.data : r;
      setArticles(data.articles || data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const handleLike = async (id) => {
    const token = getToken();
    if (!token) return navigate("/auth");
    const previousArticles = articles;

    setArticles((prev) =>
      prev.map((a) =>
        a._id === id
          ? {
              ...a,
              _liked: !a._liked,
              likes: a._liked
                ? (a.likes || []).slice(0, -1)
                : [...(a.likes || []), "me"],
            }
          : a
      )
    );

    try {
      const res = await fetch(`${API}/articles/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to toggle like');
      }
    } catch (e) {
      console.error(e);
      setArticles(previousArticles);
    }
  };

  return (
    <div className="page-shell">
      {/* ─── Background ─────────────────────────────────────── */}
      {/* הרקע מוגדר ב-components.css תחת .page-bg */}
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="page-container">
        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-sm text-cyan-300 font-medium">ARTICLES</span>
            </div>

            <h1 className="text-5xl font-black mb-4">
              <span className="text-white">Tech</span>{" "}
              <span className="text-gradient">Articles</span>
            </h1>

            <p className="text-slate-400 max-w-xl">
              Discover modern development articles, AI guides and advanced engineering content.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חפש מאמרים"
                  className="bg-slate-900/70 border border-slate-700 rounded-2xl py-3 pr-4 pl-10 text-slate-200 outline-none focus:border-cyan-400 transition-all"
                />
              </div>
              <button type="submit" className="button-primary">חיפוש</button>
            </form>

            {isLoggedIn && (
              <button onClick={() => navigate("/articles/new")} className="button-secondary">
                + מאמר חדש
              </button>
            )}
          </div>
        </div>

        {/* ─── Breadcrumb ──────────────────────────────────────── */}
        <div className="mb-10">
          <Breadcrumb path={[{ label: "דפים", to: "/" }, { label: "מאמרים" }]} />
        </div>

        {/* ─── Content ─────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">טוען מאמרים...</div>
        ) : articles.length === 0 ? (
          <div className="card-empty">
            <p className="text-slate-400">לא נמצאו מאמרים התואמים לחיפוש שלך.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((a) => (
                <div
                  key={a._id || a.id}
                  className="group section-card section-card-md section-shadow-hover"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
                      {a.category || "General"}
                    </span>
                    <span className="text-xs text-slate-500">{timeAgo(a.createdAt)}</span>
                  </div>

                  <Link to={`/articles/${a._id || a.id}`}>
                    <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {a.title}
                    </h2>
                  </Link>

                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-4 mb-8">
                    {a.excerpt || a.body?.slice(0, 180)}
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Author</p>
                      <p className="text-sm font-semibold text-slate-200">
                        {a.author?.firstName || "מחבר"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(a._id || a.id)}
                        className="flex items-center gap-2 text-slate-400 hover:text-pink-400 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{a.likes?.length || 0}</span>
                      </button>

                      <Link
                        to={`/articles/${a._id || a.id}`}
                        className="text-cyan-300 font-semibold hover:text-cyan-200 transition-colors"
                      >
                        קרא עוד
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── Pagination ──────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-14 flex-wrap">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-11 h-11 rounded-2xl border transition-all ${
                      page === i + 1
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                        : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-cyan-500/50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}