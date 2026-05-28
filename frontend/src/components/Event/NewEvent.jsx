import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarkdownEditor from "../MarkdownEditor";
import { getToken } from "../../utils/storage";

const API = "http://localhost:5000/api";

const QUICK_TAGS = ["Conference", "Meetup", "Hackathon", "Workshop", "Webinar", "Networking", "AI", "Cyber", "React", "Career"];

export default function NewEventForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    link: "",
    image: "",
  });
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
    if (clean && !tags.includes(clean) && tags.length < 5) {
      setTags(prev => [...prev, clean]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
    if (e.key === "Backspace" && !tagInput && tags.length) setTags(prev => prev.slice(0, -1));
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const toggleQuickTag = (tag) => {
    tags.includes(tag) ? removeTag(tag) : addTag(tag);
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, tags }),
      });

      const data = await res.json();
      if (!res.ok) { setErrors({ submit: data.error || "שגיאה בפרסום האירוע" }); return; }

      setSuccess(true);
      setTimeout(() => navigate(`/events/${data._id}`), 2000);
    } catch {
      setErrors({ submit: "שגיאת רשת — נסי שוב" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="main">
        <div className="form-success">
          <div className="form-success-icon">📅</div>
          <h2 className="form-success-title">האירוע פורסם בהצלחה!</h2>
          <p className="form-success-sub">מעביר אותך לדף האירוע...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 py-8 rtl" dir="rtl">
      <div className="mb-8">
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">// פרסום אירוע</p>
        <h1 className="text-4xl font-bold text-white mb-2">פרסם <span className="text-cyan-500">אירוע חדש</span></h1>
        <p className="text-slate-400 text-sm">כנסים, מיטאפים, האקתונים ואירועי קהילה</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* ── עמודה ראשית ── */}
        <div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// פרטי האירוע</p>

            <div className="mb-6">
              <label className="text-slate-300 text-sm font-medium mb-2 block">שם האירוע <span className="text-rose-500">*</span></label>
              <input className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" name="title" value={form.title} onChange={handleChange} placeholder="שם האירוע..." />
              {errors.title && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.title}</span>}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">תיאור <span className="text-rose-500">*</span></label>
              <MarkdownEditor
                value={form.description}
                onChange={(v) => setForm(prev => ({ ...prev, description: v }))}
                placeholder="תאר את האירוע — מה יקרה, למי הוא מתאים, מה ניתן ללמוד..."
                rows={6}
              />
              {errors.description && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.description}</span>}
            </div>
          </div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// מתי ואיפה</p>

            <div className="mb-6">
              <label className="text-slate-300 text-sm font-medium mb-2 block">תאריך ושעה <span className="text-rose-500">*</span></label>
              <input
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
              {errors.date && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.date}</span>}
            </div>

            <div className="mb-6">
              <label className="text-slate-300 text-sm font-medium mb-2 block">מיקום <span className="text-rose-500">*</span></label>
              <input
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="עיר, כתובת או Online..."
              />
              {errors.location && <span className="text-rose-400 text-xs mt-1 block">⚠ {errors.location}</span>}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">לינק לאירוע</label>
              <input
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://..."
              />
              <span className="text-slate-400 text-xs mt-2 block">Eventbrite, Meetup, אתר רשמי וכו' (אופציונלי)</span>
            </div>
          </div>

        </div>

        {/* ── סיידבר ── */}
        <div className="flex flex-col gap-6">

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg sticky top-20">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// תגיות</p>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">תגיות (עד 5)</label>
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
                    placeholder={tags.length === 0 ? "הוסף תגית..." : "+"}
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

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-6">// תמונה</p>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">קישור לתמונה</label>
              <input
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
              />
              <span className="text-slate-400 text-xs mt-2 block">אופציונלי</span>
            </div>
          </div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            {errors.submit && <div className="text-rose-400 text-xs mb-3">⚠ {errors.submit}</div>}
            <div className="flex flex-col gap-3">
              <button type="submit" className="w-full px-6 py-2.75 bg-cyan-500 text-gray-950 font-sans font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                {loading ? "מפרסם..." : "פרסם אירוע"}
              </button>
              <Link to="/events" className="w-full px-6 py-2.75 bg-white/3 border border-white/8 text-slate-200 font-sans font-bold uppercase tracking-widest rounded text-center hover:bg-white/5">ביטול</Link>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}