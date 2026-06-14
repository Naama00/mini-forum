import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, X } from "lucide-react";
import Breadcrumb from "../Breadcrumb";
import MarkdownEditor from '../Markdown/MarkdownEditor';
import { useAuth } from "../../hooks";
import { getToken } from "../../utils/storage";
import Loading from "../common/Loading";

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
      .then((r) => {
        if (!r.ok) throw new Error('שגיאה בטעינת המאמר');
        return r.json();
      })
      .then((res) => {
        const data = res?.data || res;
        if (!data) throw new Error('לא נמצאו נתונים');
        if (data.author?._id !== user?.id && data.author?._id !== user?._id && data.author !== user?.id && data.author !== user?._id && !user?.isAdmin) {
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
        setError("שגיאה בטעינת המאמר");
        setLoading(false);
      });
  }, [id, navigate, token, user?.id]);

  const removeTag = (idx) => setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));
  const addTag = () => {
    const clean = tagInput.trim();
    if (clean && !form.tags.includes(clean)) setForm(prev => ({ ...prev, tags: [...prev.tags, clean] }));
    setTagInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("יש למלא כותרת ותוכן מאמר.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`${API}/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const res = await r.json();
      // ✅ תוקן: בודק גם res._id כי השרת מחזיר את המאמר עצמו (ללא שדה success)
      if (res.success || res._id) navigate(`/articles/${id}`);
      else setError(res.message || res.error || "נכשל בעדכון המאמר");
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="טוען מאמר..." />;

  if (error && !form.title) return (
    <div className="page-shell flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
        <p className="text-red-400 mb-6">{error}</p>
        <Link to="/articles" className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold">
          חזרה למאמרים
        </Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="page-shell">
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-10">
          <Breadcrumb items={[
            { label: "מאמרים", to: "/articles" },
            { label: form.title, to: `/articles/${id}` },
            { label: "עריכה", active: true },
          ]} />
        </div>

        <div className="section-card section-card-lg">
          <h1 className="text-3xl font-black text-white mb-8">עריכת מאמר</h1>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">כותרת</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="form-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">קטגוריה</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="form-input w-full"
              >
                <option value="">בחר קטגוריה...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">תוכן (Markdown נתמך)</label>
              <MarkdownEditor value={form.content} onChange={(val) => setForm(prev => ({ ...prev, content: val }))} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                תגיות <span className="text-slate-500 font-normal">(לחץ Enter להוספה)</span>
              </label>
              <div className="flex flex-wrap gap-2 bg-slate-950/50 border border-slate-700/40 px-3.5 py-2.5 min-h-12 items-center rounded-3xl">
                {form.tags.map((tag, i) => (
                  <span key={i} className="rounded-full border border-slate-700/50 bg-slate-900/70 px-3 py-1 text-xs text-slate-200 flex items-center gap-2">
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag(i)} className="rounded-full p-1 text-slate-400 hover:text-cyan-300 transition-colors">×</button>
                  </span>
                ))}
                <input
                  className="flex-1 bg-transparent text-slate-200 outline-none placeholder:text-slate-500 text-sm min-w-16 py-1"
                  placeholder="הוסף תגית..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="button-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? "שומר..." : "שמור שינויים"}
              </button>
              <Link to={`/articles/${id}`} className="button-secondary flex items-center gap-2">
                <X className="w-4 h-4" />
                ביטול
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
