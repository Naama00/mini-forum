import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MarkdownEditor from "../MarkdownEditor";
import CyberLayout from "../common/CyberLayout";
import { useAuth } from "../../hooks";
import { getToken } from "../../utils/storage";
import { API_BASE_URL as API } from "../../utils/constants";

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
      .then((r) => r.json())
      .then((data) => {
        if (data.author?._id !== user?.id && data.author !== user?.id) {
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
        setError("שגיאה במשיכת נתוני האירוע משרת הניהול");
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
      setError("יש למלא כותרת, תאריך ושעה מדויקים לאירוע קהילה.");
      return;
    }
    setSaving(true);
    setError("");
    const combinedDate = new Date(`${form.date}T${form.time}:00`);
    try {
      const r = await fetch(`${API}/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...form, date: combinedDate.toISOString() })
      });
      const res = await r.json();
      if (res.success || res._id) navigate(`/events/${id}`);
      else setError(res.message || "עדכון האירוע נכשל במערכת המרכזית");
    } catch {
      setError("שגיאת רשת בשילוח מסמך האירוע המעודכן");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-32 font-mono text-[#ccff00] animate-pulse text-xs">// SCHEDULING INTERFACE COMPILED...</div>;

  return (
    <CyberLayout>
      <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">

        <div className="cyber-page-header">
          <div>
            <p className="cyber-page-eyebrow">// EVENT_SCHEDULER_v2</p>
            <h1 className="text-2xl font-black text-white">עריכת אירוע ומפגש קהילה</h1>
          </div>
          <Link to={`/events/${id}`} className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
            ← ביטול ועזיבה
          </Link>
        </div>

        {error && <div className="cyber-error">[ERROR]: {error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* גוף הטופס הראשי */}
          <div className="lg:col-span-3 space-y-6">
            <div className="cyber-card p-6 md:p-8 space-y-5">

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">שם המפגש / האירוע</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="וובינר בנושא ארכיטקטורת מערכת..."
                  className="cyber-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">תיאור האירוע ותוכן העניינים</label>
                <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20 focus-within:border-[#ccff00]/40 transition-all">
                  <MarkdownEditor
                    value={form.description}
                    onChange={val => setForm(prev => ({ ...prev, description: val }))}
                    placeholder="פרט על המרצים, הלוז, ודרישות קדם למפגש..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">תאריך</label>
                  <input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} className="cyber-input text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">שעת התחלה</label>
                  <input type="time" value={form.time} onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))} className="cyber-input text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">מגבלת מקום (קיבולת)</label>
                  <input type="number" value={form.capacity} onChange={e => setForm(prev => ({ ...prev, capacity: e.target.value }))} placeholder="השאר ריק ללא הגבלה" className="cyber-input text-xs" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                  <input type="checkbox" checked={form.isOnline} onChange={e => setForm(prev => ({ ...prev, isOnline: e.target.checked }))} className="accent-[#ccff00] h-4 w-4" />
                  <span>זהו מפגש אונליין וירטואלי (Zoom / Discord / Meet)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  {form.isOnline ? "קישור לחדר הוובינר (URL)" : "מיקום פיזי / כתובת אולם"}
                </label>
                <input
                  type="text"
                  value={form.isOnline ? form.link : form.location}
                  onChange={e => setForm(prev => ({ ...prev, [form.isOnline ? "link" : "location"]: e.target.value }))}
                  placeholder={form.isOnline ? "https://..." : "מתחם הבורסה, קומה 14, תל אביב..."}
                  className="cyber-input"
                />
              </div>

            </div>
          </div>

          {/* לוח ניהול צידי */}
          <div className="lg:col-span-1 space-y-6">

            <div className="cyber-card p-5">
              <p className="cyber-label mb-3">// Tags_Registry</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {form.tags.map((tag, i) => (
                  <span key={i} onClick={() => removeTag(i)} className="cyber-tag">#{tag} ×</span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="הוסף תגית ולחץ Enter..."
                className="cyber-input text-xs"
              />
            </div>

            <div className="cyber-card p-5">
              <p className="cyber-label mb-3">// Live_Summary</p>
              <div className="cyber-summary">
                <div className="cyber-summary-row"><span>📅 Schedule:</span> <span>{form.date || "—"}</span></div>
                <div className="cyber-summary-row"><span>📍 Type:</span> <span>{form.isOnline ? "Online" : "Physical"}</span></div>
                <div className="cyber-summary-row"><span>👥 Capacity:</span> <span>{form.capacity ? `${form.capacity} Max` : "Unlimited"}</span></div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="cyber-btn-primary">
              {saving ? "Commiting Changes..." : "Save_Event_Settings ⚡"}
            </button>

          </div>

        </form>
      </div>
    </CyberLayout>
  );
}