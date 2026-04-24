import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../css/EditArticle.css";
import MarkdownEditor from "./MarkdownEditor";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CATEGORIES = ["AI", "Web", "Mobile", "DevOps", "Security", "Career", "Design", "Other"];

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = getUser();

  const [form, setForm] = useState({ title: "", content: "", category: "", tags: [], image: "" });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/articles/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.author?._id !== user?._id) { navigate(`/articles/${id}`); return; }
        setForm({
          title: data.title || "",
          content: data.content || "",
          category: data.category || "",
          tags: data.tags || [],
          image: data.image || "",
        });
        setLoading(false);
      })
      .catch(() => { setError("שגיאה בטעינת הכתבה"); setLoading(false); });
  }, [id]);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const wordCount = form.content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200) || 0;

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };
  const removeTag = (t) => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      navigate(`/articles/${id}`);
    } catch {
      setError("שגיאה בשמירת הכתבה");
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="main">
      <div className="state-center"><div className="big-spinner" /></div>
    </div>
  );

  return (
    <div className="main" dir="rtl">
      <div className="edit-topbar">
        <Link to={`/articles/${id}`} className="edit-back">← חזרה לכתבה</Link>
        <div className="edit-topbar-right">
          <span className="edit-word-count">{wordCount} מילים · {readTime} דקות קריאה</span>
          <Link to={`/articles/${id}`} className="cancel-btn">ביטול</Link>
          <button onClick={submit} disabled={saving} className="submit-btn">
            {saving ? "שומר..." : "פרסם שינויים"}
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="edit-article-layout">
        <div className="edit-article-main">
          <div className="edit-section-label-sm">// עריכת כתבה</div>
          <input
            name="title" value={form.title} onChange={handle} required
            className="edit-article-title-input"
            placeholder="כותרת הכתבה..."
          />
          <MarkdownEditor
            value={form.content}
            onChange={(v) => setForm(p => ({ ...p, content: v }))}
            placeholder="כתוב את הכתבה שלך כאן..."
            rows={12}
          />
        </div>

        <div className="edit-article-sidebar">
          <div className="form-card">
            <p className="form-card-title">הגדרות</p>

            <div className="form-field">
              <label className="form-label">קטגוריה</label>
              <select name="category" value={form.category} onChange={handle} className="form-select">
                <option value="">בחר קטגוריה</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">תמונה ראשית (URL)</label>
              <input name="image" value={form.image} onChange={handle} className="form-input" placeholder="https://..." />
              {form.image && (
                <img src={form.image} alt="preview" className="edit-img-preview"
                  onError={(e) => e.target.style.display = "none"} />
              )}
            </div>

            <div className="form-field">
              <label className="form-label">תגיות</label>
              <div className="tags-input-wrapper">
                {form.tags.map((t) => (
                  <span key={t} className="tag-pill">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="tag-pill-remove">×</button>
                  </span>
                ))}
                <input value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="tags-input" placeholder="הוסף תגית..." />
              </div>
            </div>
          </div>

          <div className="form-card edit-stats-card">
            <p className="form-card-title">סטטיסטיקה</p>
            <div className="edit-stats-grid">
              <div className="edit-stat"><span className="edit-stat-num">{wordCount}</span><span className="edit-stat-label">מילים</span></div>
              <div className="edit-stat"><span className="edit-stat-num">{form.content.length}</span><span className="edit-stat-label">תווים</span></div>
              <div className="edit-stat"><span className="edit-stat-num">{readTime}</span><span className="edit-stat-label">דקות קריאה</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}