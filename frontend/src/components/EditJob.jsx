import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MarkdownEditor from "./MarkdownEditor";
import { useAuth } from "../hooks";
import { getToken } from "../utils/storage";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const JOB_TYPES = ["fulltime", "parttime", "freelance", "internship", "remote"];
const JOB_TYPE_LABELS = {
  fulltime: "משרה מלאה",
  parttime: "משרה חלקית",
  freelance: "פרילנס",
  internship: "סטאג'",
  remote: "עבודה מהבית",
};

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = getToken();

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
        if (data.author?._id !== user?.id && data.author !== user?.id) { 
          navigate(`/jobs/${id}`); 
          return; 
        }
        setForm({
          title: data.title || "",
          company: data.company || "",
          location: data.location || "",
          type: data.type || "fulltime",
          description: data.description || "",
          requirements: data.requirements || [],
          applyLink: data.applyLink || "",
          salary: data.salary || "",
          tags: data.tags || []
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("שגיאה במשיכת מפרט המשרה משרת הניהול");
        setLoading(false);
      });
  }, [id, navigate, token, user?.id]);

  const addRequirement = () => {
    const clean = reqInput.trim();
    if (clean && !form.requirements.includes(clean)) {
      setForm(prev => ({ ...prev, requirements: [...prev.requirements, clean] }));
    }
    setReqInput("");
  };

  const removeRequirement = (idx) => {
    setForm(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    const clean = tagInput.trim();
    if (clean && !form.tags.includes(clean)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, clean] }));
    }
    setTagInput("");
  };

  const removeTag = (idx) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) {
      setError("יש למלא כותרת תפקיד ושם חברה לפחות.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const r = await fetch(`${API}/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const res = await r.json();
      if (res.success || res._id) {
        navigate(`/jobs/${id}`);
      } else {
        setError(res.message || "עדכון רשומת המשרה נכשל.");
      }
    } catch {
      setError("שגיאת רשת בהעלאת מפרט המשרה המעודכן.");
    } finally {
      setSaving(false);
    }
  };

  const EDIT_JOB_STYLES = `
    .cyber-job-panel {
      background: rgba(255, 255, 255, 0.015);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(204, 255, 0, 0.05);
    }
    .label-mono-jobs {
      font-size: 10px;
      font-family: var(--font-family);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(204, 255, 0, 0.4);
      font-weight: 700;
    }
  `;

  if (loading) return <div className="text-center py-32 font-mono text-[#ccff00] animate-pulse text-xs">// DEPLOYING POSITION EDITOR CONFIG...</div>;

  return (
    <>
      <style>{EDIT_JOB_STYLES}</style>
      <div className="relative min-h-screen text-slate-200 pb-20" dir="rtl">
        <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
          
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div>
              <div className="font-mono text-[10px] text-[#ccff00] tracking-wider">// RECRUITMENT_PORTAL_v2</div>
              <h1 className="text-2xl font-black text-white">עריכת פרסום משרה</h1>
            </div>
            <Link to={`/jobs/${id}`} className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
              ← ביטול ועזיבה
            </Link>
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">[ERROR]: {error}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* גוף הטופס */}
            <div className="lg:col-span-3 space-y-6">
              <div className="cyber-job-panel p-6 md:p-8 rounded-2xl space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">תפקיד / כותרת המשרה</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Senior Full Stack Engineer..."
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">שם החברה המגייסת</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => setForm(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="DevHub Tech Ltd..."
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">מיקום (עיר / היברידי)</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="תל אביב / היברידי"
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ccff00] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">סוג המשרה</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ccff00] transition-all"
                    >
                      {JOB_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{JOB_TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">טווח שכר (אופציונלי)</label>
                    <input
                      type="text"
                      value={form.salary}
                      onChange={e => setForm(prev => ({ ...prev, salary: e.target.value }))}
                      placeholder="25,000 - 32,000"
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ccff00] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">תיאור התפקיד והחברה</label>
                  <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20 focus-within:border-[#ccff00]/40 transition-all">
                    <MarkdownEditor
                      value={form.description}
                      onChange={val => setForm(prev => ({ ...prev, description: val }))}
                      placeholder="פרט על הצוות, האתגר הטכנולוגי והיום-יום בתפקיד..."
                    />
                  </div>
                </div>

                {/* רשימת דרישות חובה/רשות דינמית */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">דרישות ליבה (רשימה נקודתית)</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={reqInput}
                        onChange={e => setReqInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                        placeholder="לדוגמה: 3 שנות ניסיון מעשי עם Node.js..."
                        className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ccff00]"
                      />
                      <button type="button" onClick={addRequirement} className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 rounded-xl border border-white/5 transition-colors">
                        + הוסף
                      </button>
                    </div>
                    
                    {form.requirements.length > 0 && (
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-1.5">
                        {form.requirements.map((req, i) => (
                          <div key={i} className="flex justify-between items-center text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <span>• {req}</span>
                            <button type="button" onClick={() => removeRequirement(i)} className="text-rose-400 hover:text-rose-500 font-mono text-sm">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">קישור להגשת מועמדות (URL או אימייל)</label>
                  <input
                    type="text"
                    value={form.applyLink}
                    onChange={e => setForm(prev => ({ ...prev, applyLink: e.target.value }))}
                    placeholder="https://company.com/careers/job-123 או mailto:jobs@company.com"
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition-all"
                  />
                </div>

              </div>
            </div>

            {/* תגיות וסיכום צידי */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="cyber-job-panel p-5 rounded-2xl">
                <p className="label-mono-jobs mb-3 flex items-center gap-2">// Keyword_Tags <span className="flex-1 h-px bg-white/5" /></p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.tags.map((tag, i) => (
                    <span key={i} onClick={() => removeTag(i)} className="cursor-pointer font-mono text-[11px] px-2 py-0.5 bg-[#ccff00]/5 border border-[#ccff00]/10 text-slate-300 rounded hover:border-red-500/20 hover:text-red-400 transition-all">
                      #{tag} ×
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="הוסף טכנולוגיה (React)..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#ccff00] transition-all"
                />
              </div>

              <div className="cyber-job-panel p-5 rounded-2xl space-y-3">
                <p className="label-mono-jobs flex items-center gap-2">// Live_Summary <span className="flex-1 h-px bg-white/5" /></p>
                <div className="space-y-2 text-xs font-mono text-slate-400">
                  <div className="flex justify-between"><span>🏢 Entity:</span> <span className="text-white truncate max-w-[120px]">{form.company || "—"}</span></div>
                  <div className="flex justify-between"><span>💼 Model:</span> <span className="text-white">{JOB_TYPE_LABELS[form.type]}</span></div>
                  <div className="flex justify-between"><span>📋 Req_Count:</span> <span className="text-white">{form.requirements.length} Items</span></div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-[#ccff00] hover:bg-[#bfff00] text-black font-black font-mono text-xs py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                {saving ? "Commiting Listing..." : "Update_Job_Posting ⚡"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </>
  );
}