import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./css/NewTopic.css";
const API_BASE = "http://localhost:5000";

const TOPIC_TYPES = [
  { value: "question", label: "שאלה", icon: "?" },
  { value: "discussion", label: "דיון", icon: "◈" },
  { value: "announcement", label: "הכרזה", icon: "◉" },
];

export default function NewTopic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCategory = searchParams.get("categoryId");

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "question",
    categoryId: preselectedCategory || "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // בדיקת משתמש מחובר
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    } catch {
      navigate("/auth");
    }
  }, []);

  // טעינת קטגוריות
  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, "");
      if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
        setForm((p) => ({ ...p, tags: [...p.tags, tag] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("יש להזין כותרת לנושא");
    if (!form.content.trim()) return setError("יש להזין תוכן לפוסט");
    if (!form.categoryId) return setError("יש לבחור קטגוריה");

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          type: form.type,
          categoryId: form.categoryId,
          tags: form.tags,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "שגיאה ביצירת הנושא");

      // מעבר לדף הנושא החדש
      const newId = data.data?._id || data.data?.id;
      navigate(`/category?topicId=${newId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-root">
      <div className="grid-overlay" />
      <div className="glow-orb glow-1" />
      <div className="glow-orb glow-2" />

      {/* HEADER */}
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
              {preselectedCategory && (
                <>
                  <a href={`/category?categoryId=${preselectedCategory}`}>קטגוריה</a>
                  <span className="breadcrumb-sep">/</span>
                </>
              )}
              <span style={{ color: "rgba(226,232,240,0.7)" }}>נושא חדש</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="nt-layout">

          {/* FORM */}
          <div className="nt-form-col">
            <div className="page-header" style={{ marginBottom: 28 }}>
              <div className="page-category-label">// יצירת נושא חדש</div>
              <h1 className="page-title">פתח דיון חדש</h1>
            </div>

            {/* TYPE */}
            <div className="nt-section">
              <label className="nt-label">סוג הנושא</label>
              <div className="nt-type-row">
                {TOPIC_TYPES.map((t) => (
                  <button
                    key={t.value}
                    className={`nt-type-btn${form.type === t.value ? " active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                    type="button"
                  >
                    <span className="nt-type-icon">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORY */}
            <div className="nt-section">
              <label className="nt-label">קטגוריה *</label>
              <select
                className="nt-input nt-select"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
              >
                <option value="">בחר קטגוריה...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* TITLE */}
            <div className="nt-section">
              <label className="nt-label">כותרת *</label>
              <input
                className="nt-input"
                name="title"
                placeholder="מה השאלה או הנושא שלך?"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
              />
              <div className="nt-char-count">{form.title.length}/120</div>
            </div>

            {/* CONTENT */}
            <div className="nt-section">
              <label className="nt-label">תוכן *</label>
              <textarea
                className="nt-input nt-textarea"
                name="content"
                placeholder="פרט את השאלה או הנושא שלך בצורה מלאה..."
                value={form.content}
                onChange={handleChange}
                rows={10}
              />
              <div className="nt-char-count">{form.content.length} תווים</div>
            </div>

            {/* TAGS */}
            <div className="nt-section">
              <label className="nt-label">תגיות <span style={{ opacity: 0.4, fontSize: 11 }}>(עד 5, לחץ Enter להוספה)</span></label>
              <div className="nt-tags-box">
                {form.tags.map((tag) => (
                  <span key={tag} className="nt-tag">
                    {tag}
                    <button className="nt-tag-remove" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
                {form.tags.length < 5 && (
                  <input
                    className="nt-tag-input"
                    placeholder={form.tags.length === 0 ? "הוסף תגית..." : ""}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                )}
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="nt-actions">
              <button
                className="nt-cancel-btn"
                onClick={() => navigate(preselectedCategory ? `/category?categoryId=${preselectedCategory}` : "/")}
                type="button"
              >
                ביטול
              </button>
              <button
                className={`auth-submit nt-submit${loading ? " loading" : ""}`}
                onClick={handleSubmit}
                disabled={loading}
                type="button"
              >
                {loading ? <span className="auth-spinner" /> : "פרסם נושא ◈"}
              </button>
            </div>
          </div>

          {/* TIPS SIDEBAR */}
          <div className="nt-tips-col">
            <div className="nt-tips-card">
              <div className="nt-tips-title">// טיפים לפוסט טוב</div>
              <div className="nt-tips-list">
                {[
                  { icon: "◇", text: "כותרת ברורה וממוקדת" },
                  { icon: "◈", text: "תאר את הבעיה בפירוט" },
                  { icon: "◉", text: "הוסף קוד לדוגמה אם רלוונטי" },
                  { icon: "◑", text: "ציין מה כבר ניסית" },
                  { icon: "◆", text: "בחר קטגוריה מתאימה" },
                ].map((tip) => (
                  <div key={tip.text} className="nt-tip">
                    <span style={{ color: "#00e5ff" }}>{tip.icon}</span>
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="nt-tips-card" style={{ marginTop: 16 }}>
              <div className="nt-tips-title">// כללי הקהילה</div>
              <div className="nt-tips-list">
                {[
                  "כבד את חברי הקהילה",
                  "אל תשאל שאלות כפולות",
                  "חפש לפני שאתה פותח נושא",
                  "סמן תשובה כפתרון אם פותר",
                ].map((rule) => (
                  <div key={rule} className="nt-tip">
                    <span style={{ color: "rgba(226,232,240,0.3)" }}>—</span>
                    <span style={{ color: "rgba(226,232,240,0.5)" }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}