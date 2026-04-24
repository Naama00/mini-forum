import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/NewEvent.css";
import MarkdownEditor from "./MarkdownEditor";

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
    const token = localStorage.getItem("token");
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
    <div className="main">
      <div className="new-event-header">
        <p className="new-event-section-label">// פרסום אירוע</p>
        <h1 className="new-event-title">פרסם <span>אירוע חדש</span></h1>
        <p className="new-event-subtitle">כנסים, מיטאפים, האקתונים ואירועי קהילה</p>
      </div>

      <form onSubmit={handleSubmit} className="new-event-form">

        {/* ── עמודה ראשית ── */}
        <div className="new-event-main">

          <div className="form-card">
            <p className="form-card-title">// פרטי האירוע</p>

            <div className="form-field">
              <label className="form-label">שם האירוע <span>*</span></label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="שם האירוע..." />
              {errors.title && <span className="form-error">⚠ {errors.title}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">תיאור <span>*</span></label>
              <MarkdownEditor
                value={form.description}
                onChange={(v) => setForm(prev => ({ ...prev, description: v }))}
                placeholder="תאר את האירוע — מה יקרה, למי הוא מתאים, מה ניתן ללמוד..."
                rows={6}
              />
              {errors.description && <span className="form-error">⚠ {errors.description}</span>}
            </div>
          </div>

          <div className="form-card">
            <p className="form-card-title">// מתי ואיפה</p>

            <div className="form-field">
              <label className="form-label">תאריך ושעה <span>*</span></label>
              <input
                className="form-input"
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
              {errors.date && <span className="form-error">⚠ {errors.date}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">מיקום <span>*</span></label>
              <input
                className="form-input"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="עיר, כתובת או Online..."
              />
              {errors.location && <span className="form-error">⚠ {errors.location}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">לינק לאירוע</label>
              <input
                className="form-input"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://..."
              />
              <span className="form-hint">Eventbrite, Meetup, אתר רשמי וכו' (אופציונלי)</span>
            </div>
          </div>

        </div>

        {/* ── סיידבר ── */}
        <div className="new-event-sidebar">

          <div className="form-card">
            <p className="form-card-title">// תגיות</p>
            <div className="form-field">
              <label className="form-label">תגיות (עד 5)</label>
              <div className="tags-input-wrapper">
                {tags.map(tag => (
                  <span key={tag} className="tag-pill">
                    #{tag}
                    <button type="button" className="tag-pill-remove" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    className="tags-input"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "הוסף תגית..." : "+"}
                  />
                )}
              </div>
              <span className="form-hint">Enter או פסיק להוספה</span>
            </div>
            <div className="quick-tags">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`quick-tag-btn${tags.includes(tag) ? " selected" : ""}`}
                  onClick={() => toggleQuickTag(tag)}
                  disabled={!tags.includes(tag) && tags.length >= 5}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="form-card">
            <p className="form-card-title">// תמונה</p>
            <div className="form-field">
              <label className="form-label">קישור לתמונה</label>
              <input
                className="form-input"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
              />
              <span className="form-hint">אופציונלי</span>
            </div>
          </div>

          <div className="form-card">
            {errors.submit && <div className="form-error" style={{ marginBottom: 14 }}>⚠ {errors.submit}</div>}
            <div className="form-submit-area">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "מפרסם..." : "פרסם אירוע"}
              </button>
              <Link to="/events" className="cancel-btn">ביטול</Link>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}