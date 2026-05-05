import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MarkdownEditor from "./MarkdownEditor";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = getUser();

  const [form, setForm] = useState({
    title: "", description: "", date: "", time: "",
    location: "", isOnline: false, link: "", capacity: "", tags: [], image: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/events/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.author?._id !== user?._id) { navigate(`/events/${id}`); return; }
        const dt = data.date ? new Date(data.date) : null;
        setForm({
          title: data.title || "",
          description: data.description || "",
          date: dt ? dt.toISOString().split("T")[0] : "",
          time: dt ? dt.toTimeString().slice(0, 5) : "",
          location: data.location || "",
          isOnline: data.isOnline || false,
          link: data.link || "",
          capacity: data.capacity || "",
          tags: data.tags || [],
          image: data.image || "",
        });
        setLoading(false);
      })
      .catch(() => { setError("שגיאה בטעינת האירוע"); setLoading(false); });
  }, [id]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };
  const removeTag = (t) => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  const daysUntil = form.date
    ? Math.ceil((new Date(form.date) - new Date()) / 86400000)
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        date: form.date && form.time
          ? new Date(`${form.date}T${form.time}`).toISOString()
          : form.date,
        capacity: form.capacity ? Number(form.capacity) : undefined,
      };
      const res = await fetch(`${API}/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      navigate(`/events/${id}`);
    } catch {
      setError("שגיאה בשמירת האירוע");
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="main">
      <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" /></div>
    </div>
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 py-8 rtl" dir="rtl">
      <Link to={`/events/${id}`} className="text-cyan-500 hover:text-cyan-400 text-sm mb-4 inline-block">← חזרה לאירוע</Link>

      <div className="mb-8">
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">// עריכת אירוע</p>
        <h1 className="text-4xl font-bold text-white mb-2">עריכת <span className="text-cyan-500">{form.title || "אירוע"}</span></h1>
        {daysUntil !== null && (
          <p className="text-slate-400 text-sm">
            {daysUntil > 0 ? `בעוד ${daysUntil} ימים` : daysUntil === 0 ? "היום!" : `אירוע שעבר`}
          </p>
        )}
      </div>

      {error && <div className="bg-rose-500/15 border border-rose-500/40 text-rose-400 px-5 py-3 rounded-lg mb-6">{error}</div>}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-bold text-white mb-6 text-lg">פרטי האירוע</p>
            <div className="mb-6">
              <label className="text-slate-300 text-sm font-medium mb-2 block">שם האירוע <span className="text-rose-500">*</span></label>
              <input name="title" value={form.title} onChange={handle} required className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="שם האירוע..." />
            </div>
            <div className="mb-0">
              <label className="text-slate-300 text-sm font-medium mb-2 block">תיאור <span className="text-rose-500">*</span></label>
                <MarkdownEditor
                  value={form.description}
                  onChange={(v) => setForm(p => ({ ...p, description: v }))}
                  placeholder="תאר את האירוע..."
                  rows={6}
                />
            </div>
          </div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-bold text-white mb-6 text-lg">זמן ומיקום</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">תאריך <span className="text-rose-500">*</span></label>
                <input type="date" name="date" value={form.date} onChange={handle} required className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">שעה</label>
                <input type="time" name="time" value={form.time} onChange={handle} className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" />
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center cursor-pointer text-slate-200 text-sm">
                <input type="checkbox" name="isOnline" checked={form.isOnline} onChange={handle} className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 accent-cyan-500 cursor-pointer" />
                🌐 אירוע אונליין
              </label>
            </div>

            {form.isOnline ? (
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">קישור לאירוע</label>
                <input name="link" value={form.link} onChange={handle} className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="https://zoom.us/..." />
              </div>
            ) : (
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">מיקום</label>
                <input name="location" value={form.location} onChange={handle} className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="תל אביב, כתובת..." />
              </div>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg sticky top-20">
            <p className="font-bold text-white mb-6 text-lg">הגדרות נוספות</p>
            <div className="mb-6">
              <label className="text-slate-300 text-sm font-medium mb-2 block">קיבולת (מקס׳ משתתפים)</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handle}
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="ללא הגבלה" />
            </div>
            <div className="mb-6">
              <label className="text-slate-300 text-sm font-medium mb-2 block">תמונת כותרת (URL)</label>
              <input name="image" value={form.image} onChange={handle} className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30" placeholder="https://..." />
              {form.image && (
                <img src={form.image} alt="preview" className="mt-3 max-h-32 rounded"
                  onError={(e) => e.target.style.display = "none"} />
              )}
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">תגיות</label>
              <div className="flex flex-wrap gap-2 bg-white/3 border border-white/8 px-3.5 py-2.5 min-h-12 items-center rounded rtl">
                {form.tags.map((t) => (
                  <span key={t} className="bg-cyan-500/20 text-cyan-300 px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="font-bold hover:text-cyan-200">×</button>
                  </span>
                ))}
                <input value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="flex-1 bg-transparent text-slate-200 outline-none placeholder-slate-400 text-sm min-w-16" placeholder="הכנס תגית..." />
              </div>
            </div>
          </div>

          <div className="bg-white/2 border border-white/7 px-7 py-6 rounded-lg">
            <p className="font-bold text-white mb-4 text-lg">סיכום</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-300"><span>📅</span><span>{form.date || "—"} {form.time || ""}</span></div>
              <div className="flex justify-between text-sm text-slate-300"><span>{form.isOnline ? "🌐" : "📍"}</span><span>{form.isOnline ? "אונליין" : form.location || "—"}</span></div>
              <div className="flex justify-between text-sm text-slate-300"><span>👥</span><span>{form.capacity ? `עד ${form.capacity} משתתפים` : "ללא הגבלה"}</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={saving} className="w-full px-6 py-2.75 bg-cyan-500 text-gray-950 font-sans font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "שומר..." : "שמור שינויים"}
            </button>
            <Link to={`/events/${id}`} className="w-full px-6 py-2.75 bg-white/3 border border-white/8 text-slate-200 font-sans font-bold uppercase tracking-widest rounded text-center hover:bg-white/5">ביטול</Link>
          </div>
        </div>
      </form>
    </div>
  );
}