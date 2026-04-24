import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../css/EditEvent.css";
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
      <div className="state-center"><div className="big-spinner" /></div>
    </div>
  );

  return (
    <div className="main" dir="rtl">
      <Link to={`/events/${id}`} className="edit-back">← חזרה לאירוע</Link>

      <div className="edit-page-header">
        <p className="edit-section-label">// עריכת אירוע</p>
        <h1 className="edit-title">עריכת <span>{form.title || "אירוע"}</span></h1>
        {daysUntil !== null && (
          <p className="edit-subtitle">
            {daysUntil > 0 ? `בעוד ${daysUntil} ימים` : daysUntil === 0 ? "היום!" : `אירוע שעבר`}
          </p>
        )}
      </div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={submit} className="edit-form">
        <div className="edit-main">

          <div className="form-card">
            <p className="form-card-title">פרטי האירוע</p>
            <div className="form-field">
              <label className="form-label">שם האירוע <span>*</span></label>
              <input name="title" value={form.title} onChange={handle} required className="form-input" placeholder="שם האירוע..." />
            </div>
            <div className="form-field">
              <label className="form-label">תיאור <span>*</span></label>
                <MarkdownEditor
                  value={form.description}
                  onChange={(v) => setForm(p => ({ ...p, description: v }))}
                  placeholder="תאר את האירוע..."
                  rows={6}
                />
            </div>
          </div>

          <div className="form-card">
            <p className="form-card-title">זמן ומיקום</p>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">תאריך <span>*</span></label>
                <input type="date" name="date" value={form.date} onChange={handle} required className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">שעה</label>
                <input type="time" name="time" value={form.time} onChange={handle} className="form-input" />
              </div>
            </div>

            <div className="form-field edit-online-toggle">
              <label className="edit-toggle-label">
                <input type="checkbox" name="isOnline" checked={form.isOnline} onChange={handle} />
                🌐 אירוע אונליין
              </label>
            </div>

            {form.isOnline ? (
              <div className="form-field">
                <label className="form-label">קישור לאירוע</label>
                <input name="link" value={form.link} onChange={handle} className="form-input" placeholder="https://zoom.us/..." />
              </div>
            ) : (
              <div className="form-field">
                <label className="form-label">מיקום</label>
                <input name="location" value={form.location} onChange={handle} className="form-input" placeholder="תל אביב, כתובת..." />
              </div>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div className="edit-sidebar">
          <div className="form-card">
            <p className="form-card-title">הגדרות נוספות</p>
            <div className="form-field">
              <label className="form-label">קיבולת (מקס׳ משתתפים)</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handle}
                className="form-input" placeholder="ללא הגבלה" />
            </div>
            <div className="form-field">
              <label className="form-label">תמונת כותרת (URL)</label>
              <input name="image" value={form.image} onChange={handle} className="form-input" placeholder="https://..." />
              {form.image && (
                <img src={form.image} alt="preview" className="edit-img-preview"
                  onError={(e) => e.target.style.display = "none"} />
              )}
            </div>
            <div className="form-field">
              <label className="form-label">תגיות</label>
              <div className="tags-input-wrapper">
                {form.tags.map((t) => (
                  <span key={t} className="tag-pill">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="tag-pill-remove">×</button>
                  </span>
                ))}
                <input value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="tags-input" placeholder="הכנס תגית..." />
              </div>
            </div>
          </div>

          <div className="form-card edit-event-summary">
            <p className="form-card-title">סיכום</p>
            <div className="edit-summary-row"><span>📅</span><span>{form.date || "—"} {form.time || ""}</span></div>
            <div className="edit-summary-row"><span>{form.isOnline ? "🌐" : "📍"}</span><span>{form.isOnline ? "אונליין" : form.location || "—"}</span></div>
            <div className="edit-summary-row"><span>👥</span><span>{form.capacity ? `עד ${form.capacity} משתתפים` : "ללא הגבלה"}</span></div>
          </div>

          <div className="edit-actions">
            <button type="submit" disabled={saving} className="submit-btn">
              {saving ? "שומר..." : "שמור שינויים"}
            </button>
            <Link to={`/events/${id}`} className="cancel-btn">ביטול</Link>
          </div>
        </div>
      </form>
    </div>
  );
}