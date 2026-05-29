import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import MarkdownEditor from "../MarkdownEditor";
import { getToken } from "../../utils/storage";

const API = "http://localhost:5000/api";
const QUICK_TAGS = ["Conference", "Meetup", "Hackathon", "Workshop", "Webinar", "Networking", "AI", "Cyber", "React", "Career"];

export default function NewEventForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "", link: "", image: "" });
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
    if (!form.title.trim()) errs.title = "כותרת היא שדה חובה";
    if (!form.description.trim()) errs.description = "תיאור הוא שדה חובה";
    if (!form.date) errs.date = "תאריך הוא שדה חובה";
    else if (new Date(form.date) < new Date()) errs.date = "לא ניתן לפרסם אירוע שעבר";
    if (!form.location.trim()) errs.location = "מיקום הוא שדה חובה";
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
      const res = await fetch(`${API}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, tags }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ submit: data.error || "שגיאה בפרסום האירוע" }); return; }
      setSuccess(true);
      setTimeout(() => navigate(`/events/${data._id}`), 2000);
    } catch { setErrors({ submit: "שגיאת רשת — נסי שוב" }); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 text-4xl font-black mx-auto mb-6">📅</div>
        <h2 className="text-4xl font-black text-white mb-3">האירוע פורסם!</h2>
        <p className="text-slate-400">מעביר אותך לדף האירוע...</p>
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
            <span className="text-sm text-cyan-300 font-medium">CREATE EVENT</span>
          </div>
          <h1 className="text-5xl font-black mb-4">
            פרסם <span className="text-gradient">אירוע חדש</span>
          </h1>
          <p className="text-slate-400 max-w-2xl">כנסים, מיטאפים, האקתונים ואירועי קהילה.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main */}
          <div className="space-y-8">
            <div className="section-card section-card-lg">
              <h2 className="text-2xl font-black mb-8">פרטי האירוע</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">שם האירוע <span className="text-rose-400">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="שם האירוע..." className="form-input" />
                {errors.title && <p className="text-rose-400 text-sm mt-2">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">תיאור <span className="text-rose-400">*</span></label>
                <MarkdownEditor value={form.description} onChange={(v) => setForm(prev => ({ ...prev, description: v }))} placeholder="תאר את האירוע..." rows={6} />
                {errors.description && <p className="text-rose-400 text-sm mt-2">{errors.description}</p>}
              </div>
            </div>

            <div className="section-card section-card-lg">
              <h2 className="text-2xl font-black mb-8">מתי ואיפה</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">תאריך ושעה <span className="text-rose-400">*</span></label>
                <input type="datetime-local" name="date" value={form.date} onChange={handleChange} className="form-input" />
                {errors.date && <p className="text-rose-400 text-sm mt-2">{errors.date}</p>}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">מיקום <span className="text-rose-400">*</span></label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="עיר, כתובת או Online..." className="form-input" />
                {errors.location && <p className="text-rose-400 text-sm mt-2">{errors.location}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">לינק לאירוע</label>
                <input name="link" value={form.link} onChange={handleChange} placeholder="https://..." className="form-input" />
                <p className="text-xs text-slate-500 mt-2">Eventbrite, Meetup, אתר רשמי (אופציונלי)</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="section-card section-card-md sticky top-10">
              <h2 className="text-xl font-black mb-6">תגיות</h2>
              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 p-3 mb-4 min-h-[56px]">
                {tags.map(tag => (
                  <span key={tag} className="tag-chip">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={tags.length === 0 ? "הוסף תגית..." : "+"} className="tag-input" />
                )}
              </div>
              <p className="text-xs text-slate-500 mb-5">Enter או פסיק להוספה</p>
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
              <h2 className="text-xl font-black mb-6">תמונה</h2>
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." className="form-input" />
              <p className="text-xs text-slate-500 mt-3">קישור לתמונה ראשית (אופציונלי)</p>
            </div>

            <div className="section-card section-card-md">
              {errors.submit && <p className="text-rose-400 text-sm mb-4">{errors.submit}</p>}
              <div className="space-y-3">
                <button type="submit" disabled={loading} className="button-primary w-full">
                  {loading ? "מפרסם..." : "פרסם אירוע"}
                </button>
                <Link to="/events" className="button-secondary w-full text-center">ביטול</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}