import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarkdownEditor from "./MarkdownEditor";
import { getToken } from "../utils/storage";

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

    const token = getToken();
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
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-3xl font-bold text-white mb-2">המאמר פורסם בהצלחה!</h2>
          <p className="text-slate-400">מעביר אותך לדף המאמר...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 py-8 rtl" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">// כתיבת מאמר</p>
        <h1 className="text-4xl font-bold text-white mb-2">פרסם <span className="text-cyan-500">מאמר חדש</span></h1>
        <p className="text-slate-400 text-sm">שתף ידע, תובנות ומדריכים עם הקהילה</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* ── עמודה ראשית ── */}
        <div>

          {/* כותרת */}
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// פרטים בסיסיים</p>

            <div className="mb-6">
              <label className="text-slate-300 text-sm font-medium mb-2 block">כותרת <span className="text-rose-500">*</span></label>
              <input
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="כותרת המאמר שלך..."
                maxLength={120}
              />
              {errors.title && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.title}</span>}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">סיכום קצר</label>
              <textarea
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                name="summary"
                value={form.summary}
                onChange={handleChange}
                placeholder="תיאור קצר שיופיע בכרטיסיית המאמר (עד 300 תווים)..."
                maxLength={300}
                rows={3}
              />
              <div className={`text-xs mt-1 ${form.summary.length > 270 ? "text-rose-400" : "text-slate-400"} ${form.summary.length >= 300 ? "text-rose-500" : ""}`}>
                {form.summary.length}/300
              </div>
              {errors.summary && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.summary}</span>}
            </div>
          </div>

          {/* תוכן */}
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// תוכן המאמר</p>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">תוכן <span className="text-rose-500">*</span></label>

              <MarkdownEditor
                value={form.content}
                onChange={(v) => setForm(prev => ({ ...prev, content: v }))}
                placeholder={"כתוב את המאמר שלך כאן...\n\nאפשר להשתמש בשורות ריקות לפסקאות נפרדות."}
                rows={12}
              />
              <div className="text-slate-400 text-xs mt-2">
                {form.content.length} תווים
                {form.content.length < 50 && form.content.length > 0 && " (מינימום 50)"}
              </div>
              {errors.content && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.content}</span>}
            </div>
          </div>

        </div>

        {/* ── סיידבר ── */}
        <div className="flex flex-col gap-6">

          {/* תגיות */}
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg sticky top-20">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// תגיות</p>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">תגיות (עד 5)</label>
              <div className="flex flex-wrap gap-2 bg-white/3 border border-white/8 px-3.5 py-2.5 min-h-12 items-center rounded rtl mb-4">
                {tags.map(tag => (
                  <span key={tag} className="bg-cyan-500/20 text-cyan-300 px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
                    #{tag}
                    <button type="button" className="font-bold hover:text-cyan-200" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    className="flex-1 bg-transparent text-slate-200 outline-none placeholder-slate-400 text-sm min-w-16"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "הוסף תגית..." : "+"}
                  />
                )}
              </div>
              <span className="text-slate-400 text-xs">Enter או פסיק להוספה</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors ${tags.includes(tag) ? "bg-cyan-500 text-gray-950 font-bold" : "bg-white/3 border border-white/8 text-slate-200 hover:bg-white/5"} ${!tags.includes(tag) && tags.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => toggleQuickTag(tag)}
                  disabled={!tags.includes(tag) && tags.length >= 5}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* תמונה */}
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// תמונה</p>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">קישור לתמונה</label>
              <input
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
              />
              <span className="text-slate-400 text-xs mt-2 block">URL לתמונה ראשית (אופציונלי)</span>
            </div>

            {form.image ? (
              <img
                src={form.image}
                alt="תצוגה מקדימה"
                className="mt-3 max-h-32 rounded"
                onError={e => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="mt-4 h-24 bg-white/3 border border-white/8 rounded flex items-center justify-center text-slate-400">תצוגה מקדימה</div>
            )}
          </div>

          {/* כפתורי שליחה */}
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            {errors.submit && (
              <div className="text-rose-400 text-xs mb-3">⚠ {errors.submit}</div>
            )}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="w-full px-6 py-2.75 bg-cyan-500 text-gray-950 font-sans font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "מפרסם..." : "פרסם מאמר"}
              </button>
              <Link to="/articles" className="w-full px-6 py-2.75 bg-white/3 border border-white/8 text-slate-200 font-sans font-bold uppercase tracking-widest rounded text-center hover:bg-white/5">ביטול</Link>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}