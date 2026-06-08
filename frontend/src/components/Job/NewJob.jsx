import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import MarkdownEditor from "../MarkdownEditor";
import { getToken } from "../../utils/storage";
import { API_BASE_URL as API } from "../../utils/constants";
const JOB_TYPES = [{ value: "fulltime", label: "משרה מלאה" }, { value: "parttime", label: "משרה חלקית" }, { value: "freelance", label: "פרילנס" }, { value: "internship", label: "סטאז'" }];
const QUICK_TAGS = ["React", "Node.js", "Python", "TypeScript", "DevOps", "Cyber", "AI", "Mobile", "Junior", "Remote"];

export default function NewJobForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", company: "", location: "", type: "fulltime", description: "", applyLink: "", salary: "" });
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

  const updateReq = (i, val) => setRequirements(prev => prev.map((r, idx) => idx === i ? val : r));
  const addReq = () => setRequirements(prev => [...prev, ""]);
  const removeReq = (i) => { if (requirements.length > 1) setRequirements(prev => prev.filter((_, idx) => idx !== i)); };

  const addTag = (tag) => {
    const clean = tag.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean) && tags.length < 5) setTags(prev => [...prev, clean]);
    setTagInput("");
  };
  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));
  const toggleQuickTag = (tag) => tags.includes(tag) ? removeTag(tag) : addTag(tag);
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
    if (e.key === "Backspace" && !tagInput && tags.length) setTags(prev => prev.slice(0, -1));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "תפקיד הוא שדה חובה";
    if (!form.company.trim()) errs.company = "שם חברה הוא שדה חובה";
    if (!form.location.trim()) errs.location = "מיקום הוא שדה חובה";
    if (!form.description.trim()) errs.description = "תיאור הוא שדה חובה";
    else if (form.description.length < 30) errs.description = "תיאור קצר מדי";
    return errs;
  };

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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, requirements: cleanReqs, tags }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ submit: data.error || "שגיאה בפרסום המשרה" }); return; }
      setSuccess(true);
      setTimeout(() => navigate(`/jobs/${data._id}`), 2000);
    } catch { setErrors({ submit: "שגיאת רשת — נסי שוב" }); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 text-4xl font-black mx-auto mb-6">💼</div>
        <h2 className="text-4xl font-black text-white mb-3">המשרה פורסמה!</h2>
        <p className="text-slate-400">מעביר אותך לדף המשרה...</p>
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

      <div className="page-container">
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-5">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-medium">POST JOB</span>
          </div>
          <h1 className="text-5xl font-black mb-4">
            פרסם <span className="text-gradient">משרה חדשה</span>
          </h1>
          <p className="text-slate-400 max-w-2xl">הגע למפתחים הטובים ביותר בקהילה — ישירות.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main */}
          <div className="space-y-8">
            <div className="section-card section-card-lg">
              <h2 className="text-2xl font-black mb-8">פרטי המשרה</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">תפקיד <span className="text-rose-400">*</span></label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="Full Stack Developer..." className="form-input" />
                  {errors.title && <p className="text-rose-400 text-sm mt-2">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">חברה <span className="text-rose-400">*</span></label>
                  <input name="company" value={form.company} onChange={handleChange} placeholder="שם החברה..." className="form-input" />
                  {errors.company && <p className="text-rose-400 text-sm mt-2">{errors.company}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">מיקום <span className="text-rose-400">*</span></label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="תל אביב / Remote..." className="form-input" />
                  {errors.location && <p className="text-rose-400 text-sm mt-2">{errors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">שכר</label>
                  <input name="salary" value={form.salary} onChange={handleChange} placeholder='25,000-35,000 ש"ח...' className="form-input" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">תיאור המשרה <span className="text-rose-400">*</span></label>
                <MarkdownEditor value={form.description} onChange={(v) => setForm(prev => ({ ...prev, description: v }))} placeholder="תאר את המשרה, הצוות, הטכנולוגיות..." rows={6} />
                {errors.description && <p className="text-rose-400 text-sm mt-2">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">לינק להגשת מועמדות</label>
                <input name="applyLink" value={form.applyLink} onChange={handleChange} placeholder="https://..." className="form-input" />
                <p className="text-xs text-slate-500 mt-2">אם ריק — ניתן יהיה לפנות דרך תגובות</p>
              </div>
            </div>

            <div className="section-card section-card-lg">
              <h2 className="text-2xl font-black mb-6">דרישות התפקיד</h2>
              <div className="space-y-3 mb-4">
                {requirements.map((req, i) => (
                  <div key={i} className="flex gap-3">
                    <input className="form-input flex-1" value={req} onChange={e => updateReq(i, e.target.value)} placeholder={`דרישה ${i + 1}...`} />
                    <button type="button" onClick={() => removeReq(i)} className="px-4 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors font-bold">×</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addReq} className="button-secondary w-full">+ הוסף דרישה</button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="section-card section-card-md sticky top-10">
              <h2 className="text-xl font-black mb-6">סוג משרה</h2>
              <div className="grid grid-cols-2 gap-2 mb-8">
                {JOB_TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => setForm(prev => ({ ...prev, type: t.value }))}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${form.type === t.value ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950" : "border border-slate-700 bg-slate-950/50 text-slate-300 hover:border-cyan-500/40"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-black mb-4">תגיות</h2>
              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 p-3 mb-4 min-h-[56px]">
                {tags.map(tag => (
                  <span key={tag} className="tag-chip">#{tag}<button type="button" onClick={() => removeTag(tag)} className="hover:text-white">×</button></span>
                ))}
                {tags.length < 5 && <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={tags.length === 0 ? "React, Node.js..." : "+"} className="tag-input" />}
              </div>
              <p className="text-xs text-slate-500 mb-4">Enter או פסיק להוספה</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_TAGS.map(tag => (
                  <button key={tag} type="button" onClick={() => toggleQuickTag(tag)} disabled={!tags.includes(tag) && tags.length >= 5}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${tags.includes(tag) ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950" : "border border-slate-700 bg-slate-950/50 text-slate-300 hover:border-cyan-500/40"}`}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-card section-card-md">
              {errors.submit && <p className="text-rose-400 text-sm mb-4">{errors.submit}</p>}
              <div className="space-y-3">
                <button type="submit" disabled={loading} className="button-primary w-full">
                  {loading ? "מפרסם..." : "פרסם משרה"}
                </button>
                <Link to="/jobs" className="button-secondary w-full text-center">ביטול</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}