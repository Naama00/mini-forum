import { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "../css/Auth.css";

const GOOGLE_CLIENT_ID = "151921932655-85p00136srh9nb2tquam8qkkjtuvfnl5.apps.googleusercontent.com";
const API_BASE = "http://localhost:5000";

export default function AuthPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthForm />
    </GoogleOAuthProvider>
  );
}

function AuthForm() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", city: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setAnimating(true);
    setError(null);
    setTimeout(() => {
      setMode(newMode);
      setAnimating(false);
    }, 300);
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, city: form.city };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "שגיאה");

      // שמירת טוקן והפניה
      if (data.token) localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "שגיאה בכניסה עם Google");
      if (data.token) localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-root auth-root">
      <div className="grid-overlay" />
      <div className="glow-orb glow-1" />
      <div className="glow-orb glow-2" />
      <div className="auth-glow-3" />

      {/* HEADER */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <a href="/" className="logo">
              <div className="logo-mark" />
              <span className="logo-text">Dev<span>Hub</span></span>
            </a>
            <div className="auth-header-hint" style={{ direction: "rtl", fontSize: 13, color: "rgba(226,232,240,0.4)" }}>
              {mode === "login" ? "עדיין אין לך חשבון?" : "כבר יש לך חשבון?"}
              <button
                className="auth-link-btn"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "הירשם עכשיו" : "התחבר"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="auth-page-body">
        {/* LEFT PANEL — decorative */}
        <div className="auth-side-panel">
          <div className="auth-side-content">
            <div className="auth-side-label">// DEVHUB FORUM</div>
            <h2 className="auth-side-title">
              קהילת<br />
              <span style={{ color: "#00e5ff" }}>המפתחים</span><br />
              הישראלית
            </h2>
            <div className="auth-side-stats">
              <div className="auth-side-stat"><span className="auth-side-num">12K+</span><span className="auth-side-lbl">חברים</span></div>
              <div className="auth-side-stat"><span className="auth-side-num">94K+</span><span className="auth-side-lbl">נושאים</span></div>
              <div className="auth-side-stat"><span className="auth-side-num">340K+</span><span className="auth-side-lbl">פוסטים</span></div>
            </div>
            <div className="auth-side-features">
              {["דיונים טכניים מעמיקים", "שאלות ותשובות מהקהילה", "הזדמנויות עבודה", "כנסים ואירועים"].map((f) => (
                <div key={f} className="auth-side-feature">
                  <span style={{ color: "#00e5ff" }}>◈</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — form */}
        <div className="auth-form-panel">
          <div className={`auth-card${animating ? " auth-card-exit" : " auth-card-enter"}`}>

            {/* TOGGLE */}
            <div className="auth-toggle">
              <button
                className={`auth-toggle-btn${mode === "login" ? " active" : ""}`}
                onClick={() => switchMode("login")}
              >כניסה</button>
              <button
                className={`auth-toggle-btn${mode === "register" ? " active" : ""}`}
                onClick={() => switchMode("register")}
              >הרשמה</button>
            </div>

            <div className="auth-card-inner" style={{ direction: "rtl" }}>
              <h1 className="auth-title">
                {mode === "login" ? "ברוך הבא בחזרה" : "הצטרף לקהילה"}
              </h1>
              <p className="auth-subtitle">
                {mode === "login"
                  ? "התחבר לחשבון שלך כדי להמשיך"
                  : "צור חשבון חדש ותתחיל לקחת חלק"}
              </p>

              {/* GOOGLE */}
              <div className="auth-google-wrap">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("כניסה עם Google נכשלה")}
                  text={mode === "login" ? "signin_with" : "signup_with"}
                  shape="rectangular"
                  theme="filled_black"
                  size="large"
                  width="100%"
                  locale="he"
                />
              </div>

              <div className="auth-divider">
                <span className="auth-divider-line" />
                <span className="auth-divider-text">או עם מייל</span>
                <span className="auth-divider-line" />
              </div>

              {/* FIELDS */}
              <div className="auth-fields">
                {mode === "register" && (
                  <div className="auth-row">
                    <div className="auth-field">
                      <label className="auth-label">שם פרטי</label>
                      <input className="auth-input" name="firstName" placeholder="ישראל"
                        value={form.firstName} onChange={handleChange} />
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">שם משפחה</label>
                      <input className="auth-input" name="lastName" placeholder="ישראלי"
                        value={form.lastName} onChange={handleChange} />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <label className="auth-label">אימייל</label>
                  <input className="auth-input" name="email" type="email" placeholder="israel@example.com"
                    value={form.email} onChange={handleChange} />
                </div>

                <div className="auth-field">
                  <label className="auth-label">סיסמה</label>
                  <input className="auth-input" name="password" type="password" placeholder="••••••••"
                    value={form.password} onChange={handleChange} />
                </div>

                {mode === "register" && (
                  <div className="auth-field">
                    <label className="auth-label">עיר (אופציונלי)</label>
                    <input className="auth-input" name="city" placeholder="תל אביב"
                      value={form.city} onChange={handleChange} />
                  </div>
                )}
              </div>

              {error && <div className="auth-error">{error}</div>}

              {mode === "login" && (
                <div style={{ textAlign: "left", marginBottom: 4 }}>
                  <button className="auth-link-btn" style={{ fontSize: 12 }}>שכחתי סיסמה</button>
                </div>
              )}

              <button
                className={`auth-submit${loading ? " loading" : ""}`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <span className="auth-spinner" />
                  : mode === "login" ? "התחבר" : "צור חשבון"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}