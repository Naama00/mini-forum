import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';

const API = "http://localhost:5000/api";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const TAGS = ["AI", "React", "Node.js", "Cyber", "Career", "DevOps"];

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.append("search", search);
      if (activeTag) params.append("tag", activeTag);

      const res = await fetch(`${API}/articles?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setArticles(data.articles || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, [page, activeTag]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const handleLike = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    const res = await fetch(`${API}/articles/${id}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setArticles(prev =>
      prev.map(a => a._id === id ? { ...a, likes: Array(data.likes).fill(null), _liked: data.liked } : a)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <Breadcrumb />
      <div className="py-13 relative z-1 rtl">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-7">
          <div>
            <p className="font-mono text-xs tracking-widest text-cyan-500 uppercase mb-2.5">// מאמרים</p>
            <h1 className="text-4xl font-black text-white mb-2 leading-tight">ידע שנכתב <span className="text-cyan-500">בשביל מפתחים</span></h1>
            <p className="text-sm text-gray-400 leading-relaxed">מאמרים טכניים, מדריכים ותובנות מהקהילה</p>
          </div>
          <Link to="/articles/new" className="inline-flex items-center gap-2 px-5.5 py-2.75 bg-transparent border border-cyan-500 text-cyan-500 font-sans text-xs font-bold no-underline uppercase tracking-widest cursor-pointer transition-all hover:bg-cyan-500 hover:text-gray-900 hover:shadow-lg hover:shadow-cyan-500/50 whitespace-nowrap">+ כתוב מאמר</Link>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-3 flex-wrap mb-5 rtl">
          <div className="flex items-center gap-2.5 bg-white/3 border border-white/8 px-4 py-2.5 flex-1 min-w-56 max-w-96 transition-all focus-within:border-cyan-500 focus-within:shadow-lg focus-within:shadow-cyan-500/50 focus-within:bg-white/5">
            <span className="text-cyan-500/50 text-base flex-shrink-0">🔍</span>
            <input className="bg-none border-none outline-none text-gray-100 font-sans text-sm w-full rtl placeholder:text-gray-600" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש מאמרים..." />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-cyan-500 text-gray-900 border-none font-sans text-xs font-bold cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/50 flex-shrink-0">חפש</button>
        </form>
      </div>

      <div className="flex gap-2 flex-wrap mb-7 rtl">
        <button className={`px-3.5 py-1.25 bg-white/3 border border-white/8 text-gray-400 font-sans text-xs font-semibold cursor-pointer transition-all tracking-wide ${!activeTag ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500 hover:text-cyan-500"}`} onClick={() => { setActiveTag(""); setPage(1); }}>הכל</button>
        {TAGS.map(tag => (
          <button key={tag} className={`px-3.5 py-1.25 bg-white/3 border border-white/8 text-gray-400 font-sans text-xs font-semibold cursor-pointer transition-all tracking-wide ${activeTag === tag ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500 hover:text-cyan-500"}`} onClick={() => { setActiveTag(tag); setPage(1); }}>#{tag}</button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 rtl">
        <div className="flex-1 h-px bg-cyan-500/10" />
        <span className="font-mono text-xs tracking-wide text-cyan-500/50">// {articles.length} מאמרים</span>
        <div className="flex-1 h-px bg-cyan-500/10" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm font-mono">טוען מאמרים...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-600 text-sm"><div className="text-4xl mb-3 opacity-30">📝</div>אין מאמרים עדיין</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 rtl">
          {articles.map(article => <ArticleCard key={article._id} article={article} onLike={handleLike} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10 rtl">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 bg-white/3 border border-white/8 text-gray-400 font-sans text-sm font-semibold cursor-pointer transition-all ${p === page ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500 hover:text-cyan-500"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article, onLike }) {
  // חילוץ הנתונים בצורה בטוחה
  const authorName = article.author?.firstName || "אנונימי";
  const authorIcon = article.author?.icon || "👤";

  return (
    <div className="bg-gradient-to-br from-white/2 to-cyan-500/1 border border-cyan-500/8 rounded-3xl relative overflow-hidden transition-all duration-350 animate-fade-in flex flex-col shadow-lg hover:border-cyan-500/15 hover:bg-gradient-to-br hover:from-white/5 hover:to-cyan-500/2 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/8 group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
      {article.image && (
        <img src={article.image} alt={article.title} className="w-full h-40 object-cover display-block border-b border-cyan-500/10" />
      )}
      <div className="px-5.5 py-5 flex-1 flex flex-col">
        <div className="flex gap-1.5 flex-wrap mb-3 rtl">
          {article.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="font-mono text-xs px-2.25 py-0.5 bg-cyan-500/7 border border-cyan-500/15 text-cyan-500/70 tracking-wide">#{tag}</span>
          ))}
        </div>
        <Link to={`/articles/${article._id}`} className="font-sans text-base font-bold text-white no-underline mb-2.5 leading-relaxed block transition-colors hover:text-cyan-500">{article.title}</Link>
        {article.summary && (
          <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">{article.summary.slice(0, 100)}...</p>
        )}
        <div className="flex items-center justify-between pt-3.5 border-t border-white/5 rtl">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-full bg-cyan-500/15 border border-cyan-500 flex items-center justify-center text-xs font-bold text-cyan-500 flex-shrink-0 shadow-lg shadow-cyan-500">{authorIcon}</div>
            <div>
              <div className="text-xs text-gray-400 font-semibold">{authorName}</div>
              <div className="text-xs text-gray-600">{timeAgo(article.createdAt)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className={`bg-none border-none cursor-pointer text-gray-400 text-xs flex items-center gap-1 px-0 transition-colors hover:text-cyan-500 font-sans ${article._liked ? "text-rose-500 hover:text-rose-500" : ""}`} onClick={() => onLike(article._id)}>
              ♥ {article.likes?.length || 0}
            </button>
            <span className="text-xs text-gray-400 flex items-center gap-1">💬 {article.comments?.length || 0}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">👁 {article.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}