import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarkdownEditor from "../MarkdownEditor";
import { getToken } from "../../utils/storage";

const API = "http://localhost:5000/api";

const JOB_TYPES = [
  { value: "fulltime", label: "משרה מלאה" },
  { value: "parttime", label: "משרה חלקית" },
  { value: "freelance", label: "פרילנס" },
  { value: "internship", label: "סטאז'" },
];

const QUICK_TAGS = ["React", "Node.js", "Python", "TypeScript", "DevOps", "Cyber", "AI", "Mobile", "Junior", "Remote"];

export default function NewJobForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "fulltime",
    description: "",
    applyLink: "",
    salary: "",
  });
  const [requirements, setRequirements] = useState(["", ""]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // ── דרישות ─────────────────────────────────────────────
  const updateReq = (i, val) => {
    setRequirements(prev => prev.map((r, idx) => idx === i ? val : r));
  };

  const addReq = () => setRequirements(prev => [...prev, ""]);

  const removeReq = (i) => {
    if (requirements.length > 1) setRequirements(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── תגיות ──────────────────────────────────────────────
  const addTag = (tag) => {
    const clean = tag.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean) && tags.length < 5) setTags(prev => [...prev, clean]);
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
    if (e.key === "Backspace" && !tagInput && tags.length) setTags(prev => prev.slice(0, -1));
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));
  const toggleQuickTag = (tag) => tags.includes(tag) ? removeTag(tag) : addTag(tag);

  // ── וולידציה ───────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "תפקיד הוא שדה חובה";
    if (!form.company.trim()) errs.company = "שם חברה הוא שדה חובה";
    if (!form.location.trim()) errs.location = "מיקום הוא שדה חובה";
    if (!form.description.trim()) errs.description = "תיאור הוא שדה חובה";
    else if (form.description.length < 30) errs.description = "תיאור קצר מדי (מינימום 30 תווים)";
    return errs;
  };

  // ── שליחה ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return navigate("/login");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    setLoading(true);
    try {
      const cleanReqs = requirements.filter(r => r.trim());
      const res = await fetch(`${API}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, requirements: cleanReqs, tags }),
      });

      const data = await res.json();
      if (!res.ok) { setErrors({ submit: data.error || "שגיאה בפרסום המשרה" }); return; }

      setSuccess(true);
      setTimeout(() => navigate(`/jobs/${data._id}`), 2000);
    } catch {
      setErrors({ submit: "שגיאת רשת — נסי שוב" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-3xl font-bold text-white mb-2">המשרה פורסמה בהצלחה!</h2>
          <p className="text-slate-400">מעביר אותך לדף המשרה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 py-8 rtl" dir="rtl">
      <div className="mb-8">
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">// פרסום משרה</p>
        <h1 className="text-4xl font-bold text-white mb-2">פרסם <span className="text-cyan-500">משרה חדשה</span></h1>
        <p className="text-slate-400 text-sm">הגע למפתחים הטובים ביותר בקהילה — ישירות</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* ── עמודה ראשית ── */}
        <div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// פרטי המשרה</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">תפקיד <span className="text-rose-500">*</span></label>
                <input className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" name="title" value={form.title} onChange={handleChange} placeholder="Full Stack Developer..." />
                {errors.title && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.title}</span>}
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">חברה <span className="text-rose-500">*</span></label>
                <input className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" name="company" value={form.company} onChange={handleChange} placeholder="שם החברה..." />
                {errors.company && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.company}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">מיקום <span className="text-rose-500">*</span></label>
                <input className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" name="location" value={form.location} onChange={handleChange} placeholder="תל אביב / Remote..." />
                {errors.location && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.location}</span>}
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">שכר</label>
                <input className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" name="salary" value={form.salary} onChange={handleChange} placeholder='25,000-35,000 ש"ח...' />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-slate-300 text-sm font-medium mb-2 block">תיאור המשרה <span className="text-rose-500">*</span></label>
                <MarkdownEditor
                  value={form.description}
                  onChange={(v) => setForm(prev => ({ ...prev, description: v }))}
                  placeholder="תאר את המשרה, הצוות, הטכנולוגיות ומה מחכה לעובד..."
                  rows={6}
                />
              {errors.description && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.description}</span>}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">לינק להגשת מועמדות</label>
              <input className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" name="applyLink" value={form.applyLink} onChange={handleChange} placeholder="https://..." />
              <span className="text-slate-400 text-xs mt-2 block">אם ריק — ניתן יהיה לפנות דרך תגובות</span>
            </div>
          </div>

          {/* דרישות */}
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// דרישות התפקיד</p>
            <div className="space-y-2 mb-4">
              {requirements.map((req, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded"
                    value={req}
                    onChange={e => updateReq(i, e.target.value)}
                    placeholder={`דרישה ${i + 1}...`}
                  />
                  <button type="button" className="px-3 py-2.75 bg-rose-500/15 text-rose-400 rounded hover:bg-rose-500/25 font-bold" onClick={() => removeReq(i)}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="w-full px-4 py-2.75 bg-cyan-500 text-gray-950 rounded font-bold hover:shadow-lg hover:shadow-cyan-500/35" onClick={addReq}>+ הוסף דרישה</button>
          </div>

        </div>

        {/* ── סיידבר ── */}
        <div className="flex flex-col gap-6">

          {/* סוג משרה */}
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg sticky top-20">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// סוג משרה</p>
            <div className="grid grid-cols-2 gap-2">
              {JOB_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`px-4 py-2.5 rounded text-sm font-medium transition-colors ${form.type === t.value ? "bg-cyan-500 text-gray-950 font-bold" : "bg-white/3 border border-white/8 text-slate-200 hover:bg-white/5"}`}
                  onClick={() => setForm(prev => ({ ...prev, type: t.value }))}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* תגיות */}
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// תגיות</p>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">טכנולוגיות / תגיות (עד 5)</label>
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
                    placeholder={tags.length === 0 ? "React, Node.js..." : "+"}
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

          {/* שליחה */}
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            {errors.submit && <div className="text-rose-400 text-xs mb-3">⚠ {errors.submit}</div>}
            <div className="flex flex-col gap-3">
              <button type="submit" className="w-full px-6 py-2.75 bg-cyan-500 text-gray-950 font-sans font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                {loading ? "מפרסם..." : "פרסם משרה"}
              </button>
              <Link to="/jobs" className="w-full px-6 py-2.75 bg-white/3 border border-white/8 text-slate-200 font-sans font-bold uppercase tracking-widest rounded text-center hover:bg-white/5">ביטול</Link>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}