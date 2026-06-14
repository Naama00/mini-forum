import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, X } from "lucide-react";
import Breadcrumb from "../Breadcrumb";
import MarkdownEditor from '../Markdown/MarkdownEditor';
import { useAuth } from "../../hooks";
import { getToken } from "../../utils/storage";
import Loading from "../common/Loading";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const JOB_TYPES = ["fulltime", "parttime", "freelance", "internship", "remote"];
const JOB_TYPE_LABELS = { fulltime: "משרה מלאה", parttime: "משרה חלקית", freelance: "פרילנס", internship: "סטאג'", remote: "עבודה מהבית" };

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
      .then((r) => {
        if (!r.ok) throw new Error('שגיאה בטעינת המשרה');
        return r.json();
      })
      .then((res) => {
        const data = res?.data || res;
        if (!data) throw new Error('לא נמצאו נתונים');
        if (data.author?._id !== user?.id && data.author?._id !== user?._id && data.author !== user?.id && data.author !== user?._id && !user?.isAdmin) {
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
        setError("שגיאה בטעינת המשרה");
        setLoading(false);
      });
  }, [id, navigate, token, user?.id]);

  const addRequirement = () => {
    const clean = reqInput.trim();
    if (clean && !form.requirements.includes(clean)) setForm(prev => ({ ...prev, requirements: [...prev.requirements, clean] }));
    setReqInput("");
  };
  const removeRequirement = (idx) => setForm(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== idx) }));
  const addTag = () => {
    const clean = tagInput.trim();
    if (clean && !form.tags.includes(clean)) setForm(prev => ({ ...prev, tags: [...prev.tags, clean] }));
    setTagInput("");
  };
  const removeTag = (idx) => setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) {
      setError("יש למלא כותרת תפקיד ושם חברה.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`${API}/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const res = await r.json();
      if (res.success || res._id) navigate(`/jobs/${id}`);
      else setError(res.message || "עדכון המשרה נכשל");
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="טוען משרה..." />;

  if (error && !form.title) return (
    <div className="page-shell flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
        <p className="text-red-400 mb-6">{error}</p>
        <Link to="/jobs" className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold">
          חזרה למשרות
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
            { label: "משרות", to: "/jobs" },
            { label: form.title, to: `/jobs/${id}` },
            { label: "עריכה", active: true },
          ]} />
        </div>

        <div className="section-card section-card-lg">
          <h1 className="text-3xl font-black text-white mb-8">עריכת משרה</h1>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* כותרת + חברה */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">כותרת התפקיד</label>
                <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="form-input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">שם החברה</label>
                <input type="text" value={form.company} onChange={e => setForm(prev => ({ ...prev, company: e.target.value }))} className="form-input w-full" required />
              </div>
            </div>

            {/* מיקום + סוג + שכר */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">מיקום</label>
                <input type="text" value={form.location} onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))} className="form-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">סוג משרה</label>
                <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))} className="form-input w-full">
                  {JOB_TYPES.map(t => <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">שכר (אופציונלי)</label>
                <input type="text" value={form.salary} onChange={e => setForm(prev => ({ ...prev, salary: e.target.value }))} className="form-input w-full" />
              </div>
            </div>

            {/* תיאור */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">תיאור התפקיד (Markdown נתמך)</label>
              <MarkdownEditor value={form.description} onChange={val => setForm(prev => ({ ...prev, description: val }))} />
            </div>

            {/* דרישות */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">דרישות התפקיד</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={reqInput}
                  onChange={e => setReqInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                  placeholder="הוסף דרישה ולחץ Enter..."
                  className="form-input flex-1"
                />
                <button type="button" onClick={addRequirement} className="button-secondary">+ הוסף</button>
              </div>
              {form.requirements.length > 0 && (
                <div className="space-y-2">
                  {form.requirements.map((req, i) => (
                    <div key={i} className="flex justify-between items-center text-sm text-slate-300 bg-slate-800/50 border border-slate-700/40 px-4 py-2 rounded-xl">
                      <span>• {req}</span>
                      <button type="button" onClick={() => removeRequirement(i)} className="text-red-400 hover:text-red-300 transition-colors">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* קישור הגשה */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">קישור להגשת מועמדות</label>
              <input type="text" value={form.applyLink} onChange={e => setForm(prev => ({ ...prev, applyLink: e.target.value }))} className="form-input w-full" placeholder="https://..." />
            </div>

            {/* תגיות */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                תגיות טכנולוגיה <span className="text-slate-500 font-normal">(לחץ Enter להוספה)</span>
              </label>
              <div className="flex flex-wrap gap-2 bg-slate-950/50 border border-slate-700/40 px-3.5 py-2.5 min-h-12 items-center rounded-3xl">
                {form.tags.map((tag, i) => (
                  <span key={i} className="rounded-full border border-slate-700/50 bg-slate-900/70 px-3 py-1 text-xs text-slate-200 flex items-center gap-2">
                    <span>#{tag}</span>
                    <button type="button" onClick={() => removeTag(i)} className="text-slate-400 hover:text-cyan-300 transition-colors">×</button>
                  </span>
                ))}
                <input
                  className="flex-1 bg-transparent text-slate-200 outline-none placeholder:text-slate-500 text-sm min-w-16 py-1"
                  placeholder="הוסף טכנולוגיה..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
              </div>
            </div>

            {/* כפתורים */}
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="button-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? "שומר..." : "שמור שינויים"}
              </button>
              <Link to={`/jobs/${id}`} className="button-secondary flex items-center gap-2">
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
