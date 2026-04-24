import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import "../css/Articles.css";

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
    <div className="main">
      <Breadcrumb />
      <div className="articles-header">
        <div className="articles-header-top">
          <div>
            <p className="articles-section-label">// מאמרים</p>
            <h1 className="articles-title">ידע שנכתב <span>בשביל מפתחים</span></h1>
            <p className="articles-subtitle">מאמרים טכניים, מדריכים ותובנות מהקהילה</p>
          </div>
          <Link to="/articles/new" className="write-btn">+ כתוב מאמר</Link>
        </div>
        <form onSubmit={handleSearch} className="articles-toolbar">
          <div className="articles-search">
            <span className="articles-search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש מאמרים..." />
          </div>
          <button type="submit" className="articles-search-btn">חפש</button>
        </form>
      </div>

      <div className="articles-tags">
        <button className={`tag-filter-btn${!activeTag ? " active" : ""}`} onClick={() => { setActiveTag(""); setPage(1); }}>הכל</button>
        {TAGS.map(tag => (
          <button key={tag} className={`tag-filter-btn${activeTag === tag ? " active" : ""}`} onClick={() => { setActiveTag(tag); setPage(1); }}>#{tag}</button>
        ))}
      </div>

      <div className="articles-divider">
        <div className="articles-divider-line" />
        <span className="articles-divider-text">// {articles.length} מאמרים</span>
        <div className="articles-divider-line" />
      </div>

      {loading ? (
        <div className="articles-loading">טוען מאמרים...</div>
      ) : articles.length === 0 ? (
        <div className="articles-empty"><div className="articles-empty-icon">📝</div>אין מאמרים עדיין</div>
      ) : (
        <div className="articles-grid">
          {articles.map(article => <ArticleCard key={article._id} article={article} onLike={handleLike} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="articles-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`page-btn${p === page ? " active" : ""}`}>{p}</button>
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
    <div className="article-card">
      {article.image && (
        <img src={article.image} alt={article.title} className="article-card-image" />
      )}
      <div className="article-card-body">
        <div className="article-card-tags">
          {article.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="article-tag">#{tag}</span>
          ))}
        </div>
        <Link to={`/articles/${article._id}`} className="article-card-title">{article.title}</Link>
        {article.summary && (
          <p className="article-card-summary">{article.summary.slice(0, 100)}...</p>
        )}
        <div className="article-card-footer">
          <div className="article-author">
            {/* שינוי כאן: מציגים את האיקון במקום האות הראשונה */}
            <div className="article-author-avatar">{authorIcon}</div>
            <div>
              {/* שינוי כאן: משתמשים ב-firstName */}
              <div className="article-author-name">{authorName}</div>
              <div className="article-author-time">{timeAgo(article.createdAt)}</div>
            </div>
          </div>
          <div className="article-card-stats">
            <button className={`article-stat-btn${article._liked ? " liked" : ""}`} onClick={() => onLike(article._id)}>
              ♥ {article.likes?.length || 0}
            </button>
            <span className="article-stat">💬 {article.comments?.length || 0}</span>
            <span className="article-stat">👁 {article.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}