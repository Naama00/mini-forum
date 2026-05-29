import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MarkdownEditor from "../MarkdownEditor";
import CyberLayout from "../common/CyberLayout";
import { useAuth } from "../../hooks";
import { getToken } from "../../utils/storage";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CATEGORIES = ["AI", "Web", "Mobile", "DevOps", "Security", "Career", "Design", "Other"];

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = getToken();

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
      .then((res) => {
        const data = res.data || res;
        if (data.author?._id !== user?.id && data.author !== user?.id) {
          navigate(`/articles/${id}`);
          return;
        }
        setForm({
          title: data.title || "",
          content: data.content || "",
          category: data.category || "",
          tags: data.tags || [],
          image: data.image || ""
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("שגיאה במשיכת נתוני המאמר מהשרת המרכזי");
        setLoading(false);
      });
  }, [id, navigate, token, user?.id]);

  const wordCount = form.content ? form.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const removeTag = (idx) => setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));
  const addTag = () => {
    const clean = tagInput.trim();
    if (clean && !form.tags.includes(clean)) setForm(prev => ({ ...prev, tags: [...prev.tags, clean] }));
    setTagInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("יש למלא כותרת ותוכן מאמר מלאים.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`${API}/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const res = await r.json();
      if (res.success) navigate(`/articles/${id}`);
      else setError(res.message || "נכשל בעדכון ליבת המאמר");
    } catch {
      setError("שגיאת רשת בשילוח העדכון למסד הנתונים");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="text-center py-32 font-mono text-[#ccff00] animate-pulse tracking-widest text-xs">
      // ACCESSING SECURE STORAGE & COMPILING DOCUMENT...
    </div>
  );

  return (
    <CyberLayout>
      <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">

        <div className="cyber-page-header">
          <div>
            <p className="cyber-page-eyebrow">// EDITOR_TERMINAL</p>
            <h1 className="text-2xl font-black text-white tracking-tight">עריכת מאמר</h1>
          </div>
          <Link to={`/articles/${id}`} className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
            ← ביטול וחזרה למאמר
          </Link>
        </div>

        {error && <div className="cyber-error">[ERROR]: {error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          <div className="lg:col-span-3 space-y-6">
            <div className="cyber-card p-6 md:p-8 space-y-5">

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">כותרת המאמר</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="הזן כותרת טכנולוגית חדה..."
                  className="cyber-input text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">גוף המאמר (Markdown נתמך)</label>
                <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20 focus-within:border-[#ccff00]/40 transition-all">
                  <MarkdownEditor
                    value={form.content}
                    onChange={(val) => setForm(prev => ({ ...prev, content: val }))}
                    placeholder="כתוב את הקוד, הארכיטקטורה והניתוח שלך כאן..."
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">

            <div className="cyber-card p-5">
              <p className="cyber-label mb-4">ערוץ הפצה</p>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="cyber-input text-xs"
              >
                <option value="">בחר קטגוריה מקצועית...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="cyber-card p-5">
              <p className="cyber-label mb-4">תגיות מפתח</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {form.tags.map((tag, i) => (
                  <span key={i} onClick={() => removeTag(i)} className="cyber-tag">
                    #{tag} <span className="text-slate-600 group-hover:text-red-400 ml-0.5">×</span>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="הוסף תגית ולחץ Enter..."
                className="cyber-input text-xs"
              />
            </div>

            <div className="cyber-card p-5">
              <p className="cyber-label mb-4">סטטיסטיקת קוד</p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                  <span className="block font-mono text-xl font-bold text-[#ccff00]">{wordCount}</span>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Words_</span>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                  <span className="block font-mono text-xl font-bold text-[#ccff00]">{form.content?.length || 0}</span>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Bytes_</span>
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="cyber-btn-primary">
              {saving ? "מזרים נתונים מוצפנים..." : "עדכן והפץ מאמר ⚡"}
            </button>

          </div>

        </form>
      </div>
    </CyberLayout>
  );
}