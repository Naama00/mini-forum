import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, X } from "lucide-react";
import Breadcrumb from "../Breadcrumb";
import MarkdownEditor from '../Markdown/MarkdownEditor';
import { useAuth } from "../../hooks";
import { getToken } from "../../utils/storage";
import Loading from "../common/Loading";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = getToken();

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
      .then((r) => {
        if (!r.ok) throw new Error('שגיאה בטעינת האירוע');
        return r.json();
      })
      .then((res) => {
        const data = res?.data || res;
        if (!data) throw new Error('לא נמצאו נתונים');
        if (data.author?._id !== user?.id && data.author?._id !== user?._id && data.author !== user?.id && data.author !== user?._id && !user?.isAdmin) {
          navigate(`/events/${id}`);
          return;
        }
        let formattedDate = "";
        let formattedTime = "";
        if (data.date) {
          const d = new Date(data.date);
          formattedDate = d.toISOString().split("T")[0];
          formattedTime = d.toTimeString().split(" ")[0].slice(0, 5);
        }
        setForm({
          title: data.title || "",
          description: data.description || "",
          date: formattedDate,
          time: formattedTime,
          location: data.location || "",
          isOnline: !!data.isOnline,
          link: data.link || "",
          capacity: data.capacity || "",
          tags: data.tags || [],
          image: data.image || ""
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("שגיאה בטעינת האירוע");
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
    if (!form.title.trim() || !form.date || !form.time) {
      setError("יש למלא כותרת, תאריך ושעה.");
      return;
    }
    setSaving(true);
    setError("");
    const combinedDate = new Date(`${form.date}T${form.time}:00`);
    try {
      const r = await fetch(`${API}/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, date: combinedDate.toISOString() })
      });
      const res = await r.json();
      if (res.success || res._id) navigate(`/events/${id}`);
      else setError(res.message || "עדכון האירוע נכשל");
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="טוען אירוע..." />;

  if (error && !form.title) return (
    <div className="page-shell flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
        <p className="text-red-400 mb-6">{error}</p>
        <Link to="/events" className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold">
          חזרה לאירועים
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
            { label: "אירועים", to: "/events" },
            { label: form.title, to: `/events/${id}` },
            { label: "עריכה", active: true },
          ]} />
        </div>

        <div className="section-card section-card-lg">
          <h1 className="text-3xl font-black text-white mb-8">עריכת אירוע</h1>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* כותרת */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">שם האירוע</label>
              <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="form-input w-full" required />
            </div>

            {/* תיאור */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">תיאור האירוע (Markdown נתמך)</label>
              <MarkdownEditor value={form.description} onChange={val => setForm(prev => ({ ...prev, description: val }))} />
            </div>

            {/* תאריך + שעה + קיבולת */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">תאריך</label>
                <input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} className="form-input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">שעת התחלה</label>
                <input type="time" value={form.time} onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))} className="form-input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">קיבולת (אופציונלי)</label>
                <input type="number" value={form.capacity} onChange={e => setForm(prev => ({ ...prev, capacity: e.target.value }))} className="form-input w-full" placeholder="ללא הגבלה" />
              </div>
            </div>

            {/* אונליין */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isOnline}
                  onChange={e => setForm(prev => ({ ...prev, isOnline: e.target.checked }))}
                  className="w-4 h-4 accent-cyan-400"
                />
                <span>מפגש אונליין (Zoom / Discord / Meet)</span>
              </label>
            </div>

            {/* מיקום / קישור */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                {form.isOnline ? "קישור לחדר הוובינר" : "מיקום פיזי"}
              </label>
              <input
                type="text"
                value={form.isOnline ? form.link : form.location}
                onChange={e => setForm(prev => ({ ...prev, [form.isOnline ? "link" : "location"]: e.target.value }))}
                className="form-input w-full"
                placeholder={form.isOnline ? "https://..." : "כתובת המקום..."}
              />
            </div>

            {/* תגיות */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                תגיות <span className="text-slate-500 font-normal">(לחץ Enter להוספה)</span>
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
                  placeholder="הוסף תגית..."
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
              <Link to={`/events/${id}`} className="button-secondary flex items-center gap-2">
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
