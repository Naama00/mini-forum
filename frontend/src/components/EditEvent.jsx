import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MarkdownEditor from "./MarkdownEditor";
import { useAuth } from "../hooks";
import { getToken } from "../utils/storage";

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
        setLoading(false)
      })
      .catch((err) => {
        console.error(err);
        setError("שגיאה במשיכת נתוני האירוע משרת הניהול");
        setLoading(false);
      });
  }, [id, navigate, token, user?.id]);

  const removeTag = (idx) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    const clean = tagInput.trim();
    if (clean && !form.tags.includes(clean)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, clean] }));
    }
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

    // שילוב תאריך ושעה ל-ISO string אחד אחיד
    const combinedDate = new Date(`${form.date}T${form.time}:00`);

    try {
      const r = await fetch(`${API}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, date: combinedDate.toISOString() })
      });
      const res = await r.json();
      if (res.success || res._id) {
        navigate(`/events/${id}`);
      } else {
        setError(res.message || "עדכון האירוע נכשל במערכת המרכזית");
      }
    } catch {
      setError("שגיאת רשת בשילוח מסמך האירוע המעודכן");
    } finally {
      setSaving(false);
    }
  };

  const EDIT_EVENT_STYLES = `
    .cyber-panel-card {
      background: rgba(255, 255, 255, 0.015);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(204, 255, 0, 0.05);
    }
    .label-mono-dh {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(204, 255, 0, 0.4);
      font-weight: 700;
    }
  `;

  if (loading) return <div className="text-center py-32 font-mono text-[#ccff00] animate-pulse text-xs">// SCHEDULING INTERFACE COMPILED...</div>;

  return (
    <>
      <style>{EDIT_EVENT_STYLES}</style>
      <div className="relative min-h-screen text-slate-200 pb-20" dir="rtl">
        <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
          
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div>
              <div className="font-mono text-[10px] text-[#ccff00] tracking-wider">// EVENT_SCHEDULER_v2</div>
              <h1 className="text-2xl font-black text-white">עריכת אירוע ומפגש קהילה</h1>
            </div>
            <Link to={`/events/${id}`} className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
              ← ביטול ועזיבה
            </Link>
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">[ERROR]: {error}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* גוף הטופס הראשי */}
            <div className="lg:col-span-3 space-y-6">
              <div className="cyber-panel-card p-6 md:p-8 rounded-2xl space-y-5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">שם המפגש / האירוע</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="וובינר בנושא ארכיטקטורת מערכת..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition-all"
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

                {/* הגדרות זמן וסוג מפגש */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">תאריך</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ccff00] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">שעת התחלה</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ccff00] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">מגבלת מקום (קיבולת)</label>
                    <input
                      type="number"
                      value={form.capacity}
                      onChange={e => setForm(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="השאר ריק ללא הגבלה"
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ccff00] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.isOnline}
                      onChange={e => setForm(prev => ({ ...prev, isOnline: e.target.checked }))}
                      className="accent-[#ccff00] h-4 w-4"
                    />
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
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition-all"
                  />
                </div>

              </div>
            </div>

            {/* לוח ניהול צידי - תגיות וסיכום */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="cyber-panel-card p-5 rounded-2xl">
                <p className="label-mono-dh mb-3 flex items-center gap-2">// Tags_Registry <span className="flex-1 h-px bg-white/5" /></p>
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
                  placeholder="הוסף תגית ולחץ Enter..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#ccff00] transition-all"
                />
              </div>

              <div className="cyber-panel-card p-5 rounded-2xl space-y-3">
                <p className="label-mono-dh flex items-center gap-2">// Live_Summary <span className="flex-1 h-px bg-white/5" /></p>
                <div className="space-y-2 text-xs font-mono text-slate-400">
                  <div className="flex justify-between"><span>📅 Schedule:</span> <span className="text-white">{form.date || "—"}</span></div>
                  <div className="flex justify-between"><span>📍 Type:</span> <span className="text-white">{form.isOnline ? "Online" : "Physical"}</span></div>
                  <div className="flex justify-between"><span>👥 Capacity:</span> <span className="text-white">{form.capacity ? `${form.capacity} Max` : "Unlimited"}</span></div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-[#ccff00] hover:bg-[#bfff00] text-black font-black font-mono text-xs py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                {saving ? "Commiting Changes..." : "Save_Event_Settings ⚡"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </>
  );
}