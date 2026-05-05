import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
      <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" /></div>
    </div>
  );

  return (
    <div className="main rtl" dir="rtl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 rtl">
        <Link to={`/articles/${id}`} className="inline-flex items-center gap-1.5 text-cyan-500/60 no-underline text-sm tracking-tight hover:text-cyan-500 transition-colors">← חזרה לכתבה</Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2.5 text-slate-200/30">{wordCount} מילים · {readTime} דקות קריאה</span>
          <Link to={`/articles/${id}`} className="px-5 py-2.5 bg-transparent border border-white/10 text-slate-200/50 font-sans text-sm font-semibold no-underline transition-all hover:border-white/20 hover:text-slate-200">ביטול</Link>
          <button onClick={submit} disabled={saving} className="px-6 py-2.5 bg-cyan-500 text-gray-950 font-sans text-sm font-bold uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-cyan-500/35 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "שומר..." : "פרסם שינויים"}
          </button>
        </div>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500/80 px-4 py-3 mb-6 text-sm">{error}</div>}

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start rtl animate-fade-in">
        <div className="flex flex-col gap-0">
          <div className="font-mono text-2.5 tracking-widest text-cyan-500/50 uppercase mb-3">// עריכת כתבה</div>
          <input
            name="title" value={form.title} onChange={handle} required
            className="w-full bg-white/2 border border-white/7 border-b-0 text-white font-sans text-2xl font-black px-6 py-5 outline-none rtl transition-all focus:border-cyan-500 focus:bg-cyan-500/2 placeholder:text-white/15"
            placeholder="כותרת הכתבה..."
          />
          <MarkdownEditor
            value={form.content}
            onChange={(v) => setForm(p => ({ ...p, content: v }))}
            placeholder="כתוב את הכתבה שלך כאן..."
            rows={12}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white/2 border border-white/7 px-7 py-6">
            <p className="font-mono text-2.5 tracking-widest text-cyan-500/50 uppercase mb-4.5 flex items-center gap-2">
              הגדרות
              <span className="flex-1 h-px bg-cyan-500/10" />
            </p>

            <div className="flex flex-col gap-1.75 mb-4">
              <label className="font-sans text-sm font-semibold text-slate-200/40 rtl">קטגוריה</label>
              <select name="category" value={form.category} onChange={handle} className="bg-white/3 border border-white/8 text-slate-200 font-sans text-sm px-3.5 py-2.75 outline-none rtl transition-all focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/15 cursor-pointer appearance-none w-full">
                <option value="">בחר קטגוריה</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.75 mb-4">
              <label className="font-sans text-sm font-semibold text-slate-200/40 rtl">תמונה ראשית (URL)</label>
              <input name="image" value={form.image} onChange={handle} className="bg-white/3 border border-white/8 text-slate-200 font-sans text-sm px-3.5 py-2.75 outline-none rtl transition-all focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/15 placeholder:text-slate-200/20 w-full" placeholder="https://..." />
              {form.image && (
                <img src={form.image} alt="preview" className="w-full max-h-30 object-cover border border-white/7 mt-2"
                  onError={(e) => e.target.style.display = "none"} />
              )}
            </div>

            <div className="flex flex-col gap-1.75">
              <label className="font-sans text-sm font-semibold text-slate-200/40 rtl">תגיות</label>
              <div className="flex flex-wrap gap-2 bg-white/3 border border-white/8 px-3.5 py-2.5 min-h-12 items-center rtl transition-all focus-within:border-cyan-500 focus-within:shadow-lg focus-within:shadow-cyan-500/15">
                {form.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1.25 px-2.5 py-0.75 bg-cyan-500/8 border border-cyan-500/20 text-cyan-500 font-mono text-2.5">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="bg-none border-none text-cyan-500/50 cursor-pointer text-sm leading-none hover:text-rose-500 transition-colors">×</button>
                  </span>
                ))}
                <input value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="bg-none border-none outline-none text-slate-200 font-sans text-sm min-w-25 flex-1 rtl placeholder:text-slate-200/20" placeholder="הוסף תגית..." />
              </div>
            </div>
          </div>

          <div className="bg-white/2 border border-white/7 px-7 py-6">
            <p className="font-mono text-2.5 tracking-widest text-cyan-500/50 uppercase mb-4.5 flex items-center gap-2">
              סטטיסטיקה
              <span className="flex-1 h-px bg-cyan-500/10" />
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col gap-1"><span className="font-sans text-2xl font-bold text-cyan-500">{wordCount}</span><span className="text-2.5 text-slate-200/30 tracking-widest">מילים</span></div>
              <div className="flex flex-col gap-1"><span className="font-sans text-2xl font-bold text-cyan-500">{form.content.length}</span><span className="text-2.5 text-slate-200/30 tracking-widest">תווים</span></div>
              <div className="flex flex-col gap-1"><span className="font-sans text-2xl font-bold text-cyan-500">{readTime}</span><span className="text-2.5 text-slate-200/30 tracking-widest">דקות</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}