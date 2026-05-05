import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MarkdownEditor from "./MarkdownEditor";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const JOB_TYPES = ["fulltime", "parttime", "freelance", "internship", "remote"];
const JOB_TYPE_LABELS = {
  fulltime: "משרה מלאה",
  parttime: "משרה חלקית",
  freelance: "פרילנס",
  internship: "סטאג'",
  remote: "עבודה מהבית",
};

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = getUser();

  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "fulltime",
    description: "", requirements: [], applyLink: "", salary: "", tags: [],
  });
  const [reqInput, setReqInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/jobs/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.author?._id !== user?._id) { navigate(`/jobs/${id}`); return; }
        setForm({
          title: data.title || "",
          company: data.company || "",
          location: data.location || "",
          type: data.type || "fulltime",
          description: data.description || "",
          requirements: data.requirements || [],
          applyLink: data.applyLink || "",
          salary: data.salary || "",
          tags: data.tags || [],
        });
        setLoading(false);
      })
      .catch(() => { setError("שגיאה בטעינת המשרה"); setLoading(false); });
  }, [id]);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addReq = () => {
    if (reqInput.trim()) {
      setForm((p) => ({ ...p, requirements: [...p.requirements, reqInput.trim()] }));
      setReqInput("");
    }
  };
  const removeReq = (i) => setForm((p) => ({ ...p, requirements: p.requirements.filter((_, idx) => idx !== i) }));

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
      const res = await fetch(`${API}/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      navigate(`/jobs/${id}`);
    } catch {
      setError("שגיאה בשמירת המשרה");
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="main">
      <div className="state-center"><div className="big-spinner" /></div>
    </div>
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 py-8 rtl" dir="rtl">
      <Link to={`/jobs/${id}`} className="text-cyan-500 hover:text-cyan-400 text-sm mb-4 inline-block">← חזרה למשרה</Link>

      <div className="mb-8">
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">// עריכת משרה</p>
        <h1 className="text-4xl font-bold text-white mb-2">עריכת <span className="text-cyan-500">משרה</span></h1>
      </div>

      {error && <div className="bg-rose-500/15 border border-rose-500/40 text-rose-400 px-5 py-3 rounded-lg mb-6">{error}</div>}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-bold text-white mb-6 text-lg">פרטי המשרה</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">כותרת המשרה <span className="text-rose-500">*</span></label>
                <input name="title" value={form.title} onChange={handle} required className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="Senior React Developer" />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">חברה <span className="text-rose-500">*</span></label>
                <input name="company" value={form.company} onChange={handle} required className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="Google, Microsoft..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-0">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">מיקום</label>
                <input name="location" value={form.location} onChange={handle} className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="תל אביב, ירושלים..." />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">שכר</label>
                <input name="salary" value={form.salary} onChange={handle} className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="20,000–25,000 ₪" />
              </div>
            </div>
            <div className="mt-6">
              <label className="text-slate-300 text-sm font-medium mb-2 block">קישור להגשת מועמדות</label>
              <input name="applyLink" value={form.applyLink} onChange={handle} className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="https://..." />
            </div>
          </div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-bold text-white mb-6 text-lg">סוג משרה</p>
            <div className="grid grid-cols-2 gap-2">
              {JOB_TYPES.map((t) => (
                <button key={t} type="button"
                  className={`px-4 py-2.5 rounded text-sm font-medium transition-colors ${form.type === t ? "bg-cyan-500 text-gray-950 font-bold" : "bg-white/3 border border-white/8 text-slate-200 hover:bg-white/5"}`}
                  onClick={() => setForm((p) => ({ ...p, type: t }))}>
                  {JOB_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-bold text-white mb-6 text-lg">תיאור המשרה</p>
            <div>
                <MarkdownEditor
                  value={form.description}
                  onChange={(v) => setForm(p => ({ ...p, description: v }))}
                  placeholder="תאר את התפקיד, סביבת העבודה, ומה אנחנו מחפשים..."
                  rows={6}
                />
            </div>
          </div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-bold text-white mb-6 text-lg">דרישות</p>
            <div className="space-y-2 mb-4">
              {form.requirements.map((r, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={r} readOnly className="flex-1 bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded" />
                  <button type="button" onClick={() => removeReq(i)} className="px-3 py-2.75 bg-rose-500/15 text-rose-400 rounded hover:bg-rose-500/25 font-bold">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addReq())}
                className="flex-1 bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="הוסף דרישה ולחץ Enter" />
              <button type="button" onClick={addReq} className="px-4 py-2.75 bg-cyan-500 text-gray-950 rounded font-bold hover:shadow-lg hover:shadow-cyan-500/35">+</button>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg sticky top-20">
            <p className="font-bold text-white mb-6 text-lg">תגיות</p>
            <div className="flex flex-wrap gap-2 bg-white/3 border border-white/8 px-3.5 py-2.5 min-h-12 items-center rounded rtl mb-4">
              {form.tags.map((t) => (
                <span key={t} className="bg-cyan-500/20 text-cyan-300 px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="font-bold hover:text-cyan-200">×</button>
                </span>
              ))}
              <input value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1 bg-transparent text-slate-200 outline-none placeholder-slate-400 text-sm min-w-16" placeholder="React, Node.js..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["React", "Node.js", "Python", "TypeScript", "AWS"].map((t) => (
                <button key={t} type="button"
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors ${form.tags.includes(t) ? "bg-cyan-500 text-gray-950 font-bold" : "bg-white/3 border border-white/8 text-slate-200 hover:bg-white/5"}`}
                  onClick={() => form.tags.includes(t) ? removeTag(t) : setForm(p => ({ ...p, tags: [...p.tags, t] }))}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-bold text-white mb-4 text-lg">סיכום</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-300"><span>סוג</span><span>{JOB_TYPE_LABELS[form.type]}</span></div>
              <div className="flex justify-between text-sm text-slate-300"><span>מיקום</span><span>{form.location || "—"}</span></div>
              <div className="flex justify-between text-sm text-slate-300"><span>שכר</span><span>{form.salary || "—"}</span></div>
              <div className="flex justify-between text-sm text-slate-300"><span>דרישות</span><span>{form.requirements.length}</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={saving} className="w-full px-6 py-2.75 bg-cyan-500 text-gray-950 font-sans font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "שומר..." : "שמור שינויים"}
            </button>
            <Link to={`/jobs/${id}`} className="w-full px-6 py-2.75 bg-white/3 border border-white/8 text-slate-200 font-sans font-bold uppercase tracking-widest rounded text-center hover:bg-white/5">ביטול</Link>
          </div>
        </div>
      </form>
    </div>
  );
}