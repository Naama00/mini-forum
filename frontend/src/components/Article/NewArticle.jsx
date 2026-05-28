import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ImageIcon, Tag } from "lucide-react";

import MarkdownEditor from "../MarkdownEditor";
import { getToken } from "../../utils/storage";

const API = "http://localhost:5000/api";

const QUICK_TAGS = [
  "AI", "React", "Node.js", "TypeScript", "CSS",
  "Cyber", "DevOps", "Career", "Python", "Docker",
];

export default function NewArticleForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", summary: "", content: "", image: "" });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addTag = (tag) => {
    const clean = tag.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean) && tags.length < 5) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput("");
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const toggleQuickTag = (tag) => {
    tags.includes(tag) ? removeTag(tag) : addTag(tag);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "כותרת היא שדה חובה";
    else if (form.title.length < 5) newErrors.title = "כותרת קצרה מדי";
    if (!form.content.trim()) newErrors.content = "תוכן המאמר הוא שדה חובה";
    else if (form.content.length < 50) newErrors.content = "תוכן קצר מדי";
    if (form.summary.length > 300) newErrors.summary = "סיכום ארוך מדי";
    return newErrors;
  };

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
      setTimeout(() => navigate(`/articles/${data._id}`), 1800);
    } catch {
      setErrors({ submit: "שגיאת רשת" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 text-4xl font-black mx-auto mb-6">
            ✓
          </div>
          <h2 className="text-4xl font-black text-white mb-3">המאמר פורסם!</h2>
          <p className="text-slate-400">מעביר אותך למאמר...</p>
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

      <div className="page-container">
        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-5">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-medium">CREATE ARTICLE</span>
          </div>

          <h1 className="text-5xl font-black mb-4">
            פרסם{" "}
            <span className="text-gradient">מאמר חדש</span>
          </h1>

          <p className="text-slate-400 max-w-2xl">
            שתף מדריכים, רעיונות ותוכן טכנולוגי עם הקהילה.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8"
        >
          {/* ─── Main ────────────────────────────────────────── */}
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="section-card section-card-lg">
              <h2 className="text-2xl font-black mb-8">פרטי המאמר</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">כותרת</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="כותרת המאמר שלך..."
                  maxLength={120}
                  className="form-input"
                />
                {errors.title && (
                  <p className="text-rose-400 text-sm mt-2">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">סיכום קצר</label>
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  placeholder="תיאור קצר שיופיע בכרטיסיית המאמר..."
                  maxLength={300}
                  rows={4}
                  className="form-textarea"
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.summary ? (
                    <p className="text-rose-400 text-sm">{errors.summary}</p>
                  ) : (
                    <div />
                  )}
                  <span className="text-xs text-slate-500">{form.summary.length}/300</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="section-card section-card-lg">
              <h2 className="text-2xl font-black mb-6">תוכן המאמר</h2>
              <MarkdownEditor
                value={form.content}
                onChange={(v) => setForm((prev) => ({ ...prev, content: v }))}
                placeholder="כתוב את המאמר שלך כאן..."
                rows={14}
              />
              <div className="flex items-center justify-between mt-3">
                {errors.content ? (
                  <p className="text-rose-400 text-sm">{errors.content}</p>
                ) : (
                  <div />
                )}
                <span className="text-xs text-slate-500">{form.content.length} תווים</span>
              </div>
            </div>
          </div>

          {/* ─── Sidebar ─────────────────────────────────────── */}
          <div className="space-y-8">
            {/* Tags */}
            <div className="section-card section-card-md sticky top-10">
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-black">תגיות</h2>
              </div>

              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 p-3 mb-4 min-h-[56px]">
                {tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                      ×
                    </button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "הוסף תגית..." : "+"}
                    className="tag-input"
                  />
                )}
              </div>

              <p className="text-xs text-slate-500 mb-5">Enter או פסיק להוספה</p>

              <div className="grid grid-cols-2 gap-2">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleQuickTag(tag)}
                    disabled={!tags.includes(tag) && tags.length >= 5}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      tags.includes(tag)
                        ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950"
                        : "border border-slate-700 bg-slate-950/50 text-slate-300 hover:border-cyan-500/40"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="section-card section-card-md">
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-black">תמונה</h2>
              </div>

              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
                className="form-input"
              />
              <p className="text-xs text-slate-500 mt-3">קישור לתמונה ראשית (אופציונלי)</p>

              {form.image ? (
                <img
                  src={form.image}
                  alt="preview"
                  className="mt-5 h-40 w-full object-cover rounded-2xl border border-slate-700"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div className="mt-5 h-40 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center text-slate-600">
                  Preview
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="section-card section-card-md">
              {errors.submit && (
                <p className="text-rose-400 text-sm mb-4">{errors.submit}</p>
              )}
              <div className="space-y-3">
                <button type="submit" disabled={loading} className="button-primary w-full">
                  {loading ? "מפרסם..." : "פרסם מאמר"}
                </button>
                <Link to="/articles" className="button-secondary w-full text-center">
                  ביטול
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}