import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../css/EditJob.css";
import MarkdownEditor from "./MarkdownEditor";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const JOB_TYPES = ["fulltime", "parttime", "freelance", "internship", "remote"];
const JOB_TYPE_LABELS = {
  fulltime: "משרה מלאה",
  parttime: "משרה חלקית",
  freelance: "פרילנס",
  internship: "סטאג'",
  remote: "עבודה מהבית",
};

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = getUser();

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
      .then((r) => r.json())
      .then((data) => {
        if (data.author?._id !== user?._id) { navigate(`/jobs/${id}`); return; }
        setForm({
          title: data.title || "",
          company: data.company || "",
          location: data.location || "",
          type: data.type || "fulltime",
          description: data.description || "",
          requirements: data.requirements || [],
          applyLink: data.applyLink || "",
          salary: data.salary || "",
          tags: data.tags || [],
        });
        setLoading(false);
      })
      .catch(() => { setError("שגיאה בטעינת המשרה"); setLoading(false); });
  }, [id]);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addReq = () => {
    if (reqInput.trim()) {
      setForm((p) => ({ ...p, requirements: [...p.requirements, reqInput.trim()] }));
      setReqInput("");
    }
  };
  const removeReq = (i) => setForm((p) => ({ ...p, requirements: p.requirements.filter((_, idx) => idx !== i) }));

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };
  const removeTag = (t) => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      navigate(`/jobs/${id}`);
    } catch {
      setError("שגיאה בשמירת המשרה");
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
      <Link to={`/jobs/${id}`} className="edit-back">← חזרה למשרה</Link>

      <div className="edit-page-header">
        <p className="edit-section-label">// עריכת משרה</p>
        <h1 className="edit-title">עריכת <span>משרה</span></h1>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={submit} className="edit-form">
        <div className="edit-main">

          <div className="form-card">
            <p className="form-card-title">פרטי המשרה</p>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">כותרת המשרה <span>*</span></label>
                <input name="title" value={form.title} onChange={handle} required className="form-input" placeholder="Senior React Developer" />
              </div>
              <div className="form-field">
                <label className="form-label">חברה <span>*</span></label>
                <input name="company" value={form.company} onChange={handle} required className="form-input" placeholder="Google, Microsoft..." />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">מיקום</label>
                <input name="location" value={form.location} onChange={handle} className="form-input" placeholder="תל אביב, ירושלים..." />
              </div>
              <div className="form-field">
                <label className="form-label">שכר</label>
                <input name="salary" value={form.salary} onChange={handle} className="form-input" placeholder="20,000–25,000 ₪" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">קישור להגשת מועמדות</label>
              <input name="applyLink" value={form.applyLink} onChange={handle} className="form-input" placeholder="https://..." />
            </div>
          </div>

          <div className="form-card">
            <p className="form-card-title">סוג משרה</p>
            <div className="type-selector">
              {JOB_TYPES.map((t) => (
                <button key={t} type="button"
                  className={`type-option${form.type === t ? " selected" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, type: t }))}>
                  {JOB_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-card">
            <p className="form-card-title">תיאור המשרה</p>
            <div className="form-field">
                <MarkdownEditor
                  value={form.description}
                  onChange={(v) => setForm(p => ({ ...p, description: v }))}
                  placeholder="תאר את התפקיד, סביבת העבודה, ומה אנחנו מחפשים..."
                  rows={6}
                />
            </div>
          </div>

          <div className="form-card">
            <p className="form-card-title">דרישות</p>
            <div className="requirements-list">
              {form.requirements.map((r, i) => (
                <div key={i} className="requirement-item">
                  <input value={r} readOnly className="form-input" />
                  <button type="button" onClick={() => removeReq(i)} className="req-remove-btn">×</button>
                </div>
              ))}
            </div>
            <div className="requirement-item">
              <input value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addReq())}
                className="form-input" placeholder="הוסף דרישה ולחץ Enter" />
              <button type="button" onClick={addReq} className="req-add-inline">+</button>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="edit-sidebar">
          <div className="form-card">
            <p className="form-card-title">תגיות</p>
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
                className="tags-input" placeholder="React, Node.js..." />
            </div>
            <div className="quick-tags">
              {["React", "Node.js", "Python", "TypeScript", "AWS"].map((t) => (
                <button key={t} type="button"
                  className={`quick-tag-btn${form.tags.includes(t) ? " selected" : ""}`}
                  onClick={() => form.tags.includes(t) ? removeTag(t) : setForm(p => ({ ...p, tags: [...p.tags, t] }))}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-card">
            <p className="form-card-title">סיכום</p>
            <div className="edit-summary-row"><span className="edit-summary-label">סוג</span><span className="edit-summary-val">{JOB_TYPE_LABELS[form.type]}</span></div>
            <div className="edit-summary-row"><span className="edit-summary-label">מיקום</span><span className="edit-summary-val">{form.location || "—"}</span></div>
            <div className="edit-summary-row"><span className="edit-summary-label">שכר</span><span className="edit-summary-val">{form.salary || "—"}</span></div>
            <div className="edit-summary-row"><span className="edit-summary-label">דרישות</span><span className="edit-summary-val">{form.requirements.length}</span></div>
          </div>

          <div className="edit-actions">
            <button type="submit" disabled={saving} className="submit-btn">
              {saving ? "שומר..." : "שמור שינויים"}
            </button>
            <Link to={`/jobs/${id}`} className="cancel-btn">ביטול</Link>
          </div>
        </div>
      </form>
    </div>
  );
}