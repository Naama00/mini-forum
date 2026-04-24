import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/NewJob.css";
import MarkdownEditor from "./MarkdownEditor";

const API = "http://localhost:5000/api";

const JOB_TYPES = [
  { value: "fulltime", label: "משרה מלאה" },
  { value: "parttime", label: "משרה חלקית" },
  { value: "freelance", label: "פרילנס" },
  { value: "internship", label: "סטאז'" },
];

const QUICK_TAGS = ["React", "Node.js", "Python", "TypeScript", "DevOps", "Cyber", "AI", "Mobile", "Junior", "Remote"];

export default function NewJobForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "fulltime",
    description: "",
    applyLink: "",
    salary: "",
  });
  const [requirements, setRequirements] = useState(["", ""]);
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

  // ── דרישות ─────────────────────────────────────────────
  const updateReq = (i, val) => {
    setRequirements(prev => prev.map((r, idx) => idx === i ? val : r));
  };

  const addReq = () => setRequirements(prev => [...prev, ""]);

  const removeReq = (i) => {
    if (requirements.length > 1) setRequirements(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── תגיות ──────────────────────────────────────────────
  const addTag = (tag) => {
    const clean = tag.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean) && tags.length < 5) setTags(prev => [...prev, clean]);
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
    if (e.key === "Backspace" && !tagInput && tags.length) setTags(prev => prev.slice(0, -1));
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));
  const toggleQuickTag = (tag) => tags.includes(tag) ? removeTag(tag) : addTag(tag);

  // ── וולידציה ───────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "תפקיד הוא שדה חובה";
    if (!form.company.trim()) errs.company = "שם חברה הוא שדה חובה";
    if (!form.location.trim()) errs.location = "מיקום הוא שדה חובה";
    if (!form.description.trim()) errs.description = "תיאור הוא שדה חובה";
    else if (form.description.length < 30) errs.description = "תיאור קצר מדי (מינימום 30 תווים)";
    return errs;
  };

  // ── שליחה ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    setLoading(true);
    try {
      const cleanReqs = requirements.filter(r => r.trim());
      const res = await fetch(`${API}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, requirements: cleanReqs, tags }),
      });

      const data = await res.json();
      if (!res.ok) { setErrors({ submit: data.error || "שגיאה בפרסום המשרה" }); return; }

      setSuccess(true);
      setTimeout(() => navigate(`/jobs/${data._id}`), 2000);
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
          <div className="form-success-icon">💼</div>
          <h2 className="form-success-title">המשרה פורסמה בהצלחה!</h2>
          <p className="form-success-sub">מעביר אותך לדף המשרה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="new-job-header">
        <p className="new-job-section-label">// פרסום משרה</p>
        <h1 className="new-job-title">פרסם <span>משרה חדשה</span></h1>
        <p className="new-job-subtitle">הגע למפתחים הטובים ביותר בקהילה — ישירות</p>
      </div>

      <form onSubmit={handleSubmit} className="new-job-form">

        {/* ── עמודה ראשית ── */}
        <div className="new-job-main">

          <div className="form-card">
            <p className="form-card-title">// פרטי המשרה</p>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">תפקיד <span>*</span></label>
                <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Full Stack Developer..." />
                {errors.title && <span className="form-error">⚠ {errors.title}</span>}
              </div>
              <div className="form-field">
                <label className="form-label">חברה <span>*</span></label>
                <input className="form-input" name="company" value={form.company} onChange={handleChange} placeholder="שם החברה..." />
                {errors.company && <span className="form-error">⚠ {errors.company}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">מיקום <span>*</span></label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="תל אביב / Remote..." />
                {errors.location && <span className="form-error">⚠ {errors.location}</span>}
              </div>
              <div className="form-field">
                <label className="form-label">שכר</label>
                <input className="form-input" name="salary" value={form.salary} onChange={handleChange} placeholder='25,000-35,000 ש"ח...' />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">תיאור המשרה <span>*</span></label>
                <MarkdownEditor
                  value={form.description}
                  onChange={(v) => setForm(prev => ({ ...prev, description: v }))}
                  placeholder="תאר את המשרה, הצוות, הטכנולוגיות ומה מחכה לעובד..."
                  rows={6}
                />
              {errors.description && <span className="form-error">⚠ {errors.description}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">לינק להגשת מועמדות</label>
              <input className="form-input" name="applyLink" value={form.applyLink} onChange={handleChange} placeholder="https://..." />
              <span className="form-hint">אם ריק — ניתן יהיה לפנות דרך תגובות</span>
            </div>
          </div>

          {/* דרישות */}
          <div className="form-card">
            <p className="form-card-title">// דרישות התפקיד</p>
            <div className="requirements-list">
              {requirements.map((req, i) => (
                <div key={i} className="requirement-item">
                  <input
                    value={req}
                    onChange={e => updateReq(i, e.target.value)}
                    placeholder={`דרישה ${i + 1}...`}
                  />
                  <button type="button" className="req-remove-btn" onClick={() => removeReq(i)}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="add-req-btn" onClick={addReq}>+ הוסף דרישה</button>
          </div>

        </div>

        {/* ── סיידבר ── */}
        <div className="new-job-sidebar">

          {/* סוג משרה */}
          <div className="form-card">
            <p className="form-card-title">// סוג משרה</p>
            <div className="type-selector">
              {JOB_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`type-option${form.type === t.value ? " selected" : ""}`}
                  onClick={() => setForm(prev => ({ ...prev, type: t.value }))}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* תגיות */}
          <div className="form-card">
            <p className="form-card-title">// תגיות</p>
            <div className="form-field">
              <label className="form-label">טכנולוגיות / תגיות (עד 5)</label>
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
                    placeholder={tags.length === 0 ? "React, Node.js..." : "+"}
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

          {/* שליחה */}
          <div className="form-card">
            {errors.submit && <div className="form-error" style={{ marginBottom: 14 }}>⚠ {errors.submit}</div>}
            <div className="form-submit-area">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "מפרסם..." : "פרסם משרה"}
              </button>
              <Link to="/jobs" className="cancel-btn">ביטול</Link>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}