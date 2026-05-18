import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import { useAuth } from "../hooks";
import { getToken } from "../utils/storage";

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

const ARTICLES_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;400;700;800&display=swap');
  :root { --bg-dark: #0a0a0c; --accent-glow: #ccff00; --glass-bg: rgba(255,255,255,0.03); --border-glass: rgba(204,255,0,0.15); }
  .dh-grid-bg{ position:fixed; inset:0; background-image: radial-gradient(circle at 2px 2px, rgba(204,255,0,0.03) 1px, transparent 0); background-size:40px 40px; z-index:-1 }
  .ambient-glow{ position:fixed; width:500px;height:500px; background:radial-gradient(circle, rgba(204,255,0,0.08), transparent 70%); filter:blur(80px); z-index:-1 }
  .glass-card{ background:var(--glass-bg); backdrop-filter: blur(12px); border:1px solid var(--border-glass); transition:all .25s ease }
  .glass-card:hover{ box-shadow:0 8px 30px rgba(204,255,0,0.06); transform:translateY(-3px); }
`;

export default function ArticlesPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const TAGS = ["AI", "React", "Node.js", "Cyber", "Career", "DevOps"];

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
    if (!token) return navigate('/auth');
    try {
      // optimistic update
      setArticles(prev => prev.map(a => a._id === id ? ({ ...a, _liked: !a._liked, likes: a._liked ? (a.likes || []).slice(0,-1) : [...(a.likes||[]), 'me'] }) : a));
      await fetch(`${API}/articles/${id}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    } catch (e) {
      console.error(e);
      fetchArticles();
    }
  };

  return (
    <>
      <style>{ARTICLES_STYLES}</style>
      <div className="dh-grid-bg" />
      <div className="ambient-glow" style={{ right: -120, top: -80 }} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb path={[{label:'דפים',to:'/'},{label:'מאמרים'}]} />
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חפש מאמרים" className="bg-[#0f0f11] text-slate-300 px-3 py-2 rounded-lg border border-white/5" />
              <button type="submit" className="bg-white/5 text-slate-200 px-3 py-2 rounded-lg">חפש</button>
            </form>
            {isLoggedIn && (
              <button onClick={()=>navigate('/articles/new')} className="bg-[#ccff00] text-black px-3 py-2 rounded-lg font-semibold">מאמר חדש</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400">טוען...</div>
        ) : articles.length === 0 ? (
          <div className="glass-card py-20 rounded-3xl text-center max-w-md mx-auto">
            <div className="text-slate-600 text-3xl mb-2">⬡</div>
            <p className="text-slate-400 font-light text-sm">לא נמצאו מאמרים התואמים את החיפוש שלך.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(a => (
              <div key={a._id || a.id} className="glass-card p-5 rounded-2xl no-underline hover:no-underline flex flex-col justify-between">
                <div>
                  <div className="text-sm text-slate-400 font-mono mb-2">{a.category || 'כללי'} · {timeAgo(a.createdAt)}</div>
                  <Link to={`/articles/${a._id || a.id}`} className="no-underline">
                    <h3 className="text-lg font-bold text-slate-100 mb-2">{a.title}</h3>
                  </Link>
                  <p className="text-slate-300 text-sm line-clamp-3">{a.excerpt || a.body?.slice(0,140)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-400">{a.author?.firstName || 'מחבר'}</div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleLike(a._id || a.id)} className="text-xs text-slate-400">♥ {a.likes?.length || 0}</button>
                    <Link to={`/articles/${a._id || a.id}`} className="text-xs text-[#ccff00] font-semibold">קרא עוד →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
