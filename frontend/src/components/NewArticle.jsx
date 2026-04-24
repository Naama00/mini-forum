import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/NewArticle.css";
import MarkdownEditor from "./MarkdownEditor";

const API = "http://localhost:5000/api";

const QUICK_TAGS = ["AI", "React", "Node.js", "TypeScript", "CSS", "Cyber", "DevOps", "Career", "Python", "Docker"];

export default function NewArticleForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    image: "",
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── שינוי שדה ──────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // ── ניהול תגיות ────────────────────────────────────────
  const addTag = (tag) => {
    const clean = tag.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean) && tags.length < 5) {
      setTags(prev => [...prev, clean]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const toggleQuickTag = (tag) => {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else {
      addTag(tag);
    }
  };

  // ── וולידציה ───────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "כותרת היא שדה חובה";
    else if (form.title.length < 5) newErrors.title = "כותרת קצרה מדי (מינימום 5 תווים)";

    if (!form.content.trim()) newErrors.content = "תוכן המאמר הוא שדה חובה";
    else if (form.content.length < 50) newErrors.content = "תוכן קצר מדי (מינימום 50 תווים)";

    if (form.summary && form.summary.length > 300)
      newErrors.summary = "סיכום ארוך מדי (מקסימום 300 תווים)";

    return newErrors;
  };

  // ── שליחה ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, tags }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || "שגיאה בפרסום המאמר" });
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate(`/articles/${data._id}`), 2000);
    } catch (err) {
      setErrors({ submit: "שגיאת רשת — נסי שוב" });
    } finally {
      setLoading(false);
    }
  };

  // ── מצב הצלחה ──────────────────────────────────────────
  if (success) {
    return (
      <div className="main">
        <div className="form-success">
          <div className="form-success-icon">✓</div>
          <h2 className="form-success-title">המאמר פורסם בהצלחה!</h2>
          <p className="form-success-sub">מעביר אותך לדף המאמר...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      {/* Header */}
      <div className="new-article-header">
        <p className="new-article-section-label">// כתיבת מאמר</p>
        <h1 className="new-article-title">פרסם <span>מאמר חדש</span></h1>
        <p className="new-article-subtitle">שתף ידע, תובנות ומדריכים עם הקהילה</p>
      </div>

      <form onSubmit={handleSubmit} className="new-article-form">

        {/* ── עמודה ראשית ── */}
        <div className="new-article-main">

          {/* כותרת */}
          <div className="form-card">
            <p className="form-card-title">// פרטים בסיסיים</p>

            <div className="form-field">
              <label className="form-label">כותרת <span>*</span></label>
              <input
                className="form-input"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="כותרת המאמר שלך..."
                maxLength={120}
              />
              {errors.title && <span className="form-error">⚠ {errors.title}</span>}
            </div>

            <div className="form-field" style={{ marginTop: 16 }}>
              <label className="form-label">סיכום קצר</label>
              <textarea
                className="form-textarea"
                name="summary"
                value={form.summary}
                onChange={handleChange}
                placeholder="תיאור קצר שיופיע בכרטיסיית המאמר (עד 300 תווים)..."
                maxLength={300}
                rows={3}
              />
              <div className={`form-char-count${form.summary.length > 270 ? " warn" : ""}${form.summary.length >= 300 ? " limit" : ""}`}>
                {form.summary.length}/300
              </div>
              {errors.summary && <span className="form-error">⚠ {errors.summary}</span>}
            </div>
          </div>

          {/* תוכן */}
          <div className="form-card">
            <p className="form-card-title">// תוכן המאמר</p>
            <div className="form-field">
              <label className="form-label">תוכן <span>*</span></label>

              <MarkdownEditor
                value={form.content}
                onChange={(v) => setForm(prev => ({ ...prev, content: v }))}
                placeholder={"כתוב את המאמר שלך כאן...\n\nאפשר להשתמש בשורות ריקות לפסקאות נפרדות."}
                rows={12}
              />
              <div className="form-hint">
                {form.content.length} תווים
                {form.content.length < 50 && form.content.length > 0 && " (מינימום 50)"}
              </div>
              {errors.content && <span className="form-error">⚠ {errors.content}</span>}
            </div>
          </div>

        </div>

        {/* ── סיידבר ── */}
        <div className="new-article-sidebar">

          {/* תגיות */}
          <div className="form-card">
            <p className="form-card-title">// תגיות</p>
            <div className="form-field">
              <label className="form-label">תגיות (עד 5)</label>
              <div className="tags-input-wrapper">
                {tags.map(tag => (
                  <span key={tag} className="tag-pill">
                    #{tag}
                    <button type="button" className="tag-pill-remove" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    className="tags-input"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "הוסף תגית..." : "+"}
                  />
                )}
              </div>
              <span className="form-hint">Enter או פסיק להוספה</span>
            </div>

            <div className="quick-tags">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`quick-tag-btn${tags.includes(tag) ? " selected" : ""}`}
                  onClick={() => toggleQuickTag(tag)}
                  disabled={!tags.includes(tag) && tags.length >= 5}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* תמונה */}
          <div className="form-card">
            <p className="form-card-title">// תמונה</p>
            <div className="form-field">
              <label className="form-label">קישור לתמונה</label>
              <input
                className="form-input"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
              />
              <span className="form-hint">URL לתמונה ראשית (אופציונלי)</span>
            </div>

            {form.image ? (
              <img
                src={form.image}
                alt="תצוגה מקדימה"
                className="image-preview"
                onError={e => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="image-preview-placeholder">תצוגה מקדימה</div>
            )}
          </div>

          {/* כפתורי שליחה */}
          <div className="form-card">
            {errors.submit && (
              <div className="form-error" style={{ marginBottom: 14 }}>⚠ {errors.submit}</div>
            )}
            <div className="form-submit-area">
              <button
                type="submit"
                className={`submit-btn${loading ? " loading" : ""}`}
                disabled={loading}
              >
                {loading ? "מפרסם..." : "פרסם מאמר"}
              </button>
              <Link to="/articles" className="cancel-btn">ביטול</Link>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}