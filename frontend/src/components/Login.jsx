import { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

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
    <div className="min-h-screen flex flex-col relative forum-root">
      <div className="grid-overlay" />
      <div className="glow-orb glow-1" />
      <div className="glow-orb glow-2" />
      <div className="fixed w-96 h-96 bg-rose-500/5 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

      {/* HEADER */}
      <header className="border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="flex items-center gap-2">
              <div className="logo-mark" />
              <span className="text-white font-black">Dev<span className="text-cyan-500">Hub</span></span>
            </a>
            <div className="flex items-center gap-1.5 rtl text-xs text-slate-300/40">
              {mode === "login" ? "עדיין אין לך חשבון?" : "כבר יש לך חשבון?"}
              <button
                className="bg-none border-none text-cyan-500 font-sans text-xs cursor-pointer px-1.5 no-underline hover:text-white transition-colors"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "הירשם עכשיו" : "התחבר"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 flex items-stretch relative z-1">
        {/* LEFT PANEL — decorative */}
        <div className="flex-1 flex items-center justify-center px-12 py-16 border-r border-cyan-500/8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 to-transparent pointer-events-none" />
          <div className="max-w-xs rtl animate-fade-in-down">
            <div className="text-xs tracking-widest text-cyan-500/60 mb-6">// DEVHUB FORUM</div>
            <h2 className="text-5xl font-black text-white leading-tight mb-10 -tracking-tight">
              קהילת<br />
              <span className="text-cyan-500">המפתחים</span><br />
              הישראלית
            </h2>
            <div className="flex gap-8 mb-10 pb-10 border-b border-white/5">
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">12K+</span>
                <span className="text-xs text-slate-300/35 tracking-wide">חברים</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">94K+</span>
                <span className="text-xs text-slate-300/35 tracking-wide">נושאים</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">340K+</span>
                <span className="text-xs text-slate-300/35 tracking-wide">פוסטים</span>
              </div>
            </div>
            <div className="flex flex-col gap-3.5">
              {["דיונים טכניים מעמיקים", "שאלות ותשובות מהקהילה", "הזדמנויות עבודה", "כנסים ואירועים"].map((f) => (
                <div key={f} className="text-sm text-slate-300/50 flex items-center gap-2.5">
                  <span className="text-cyan-500">◈</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — form */}
        <div className="w-96 flex-shrink-0 flex items-center justify-center px-8 py-10">
          <div className={`w-full max-w-sm ${animating ? "animate-fade-out" : "animate-fade-in-up"}`}>

            {/* TOGGLE */}
            <div className="flex bg-white/3 border border-white/7 p-1 mb-8 rtl">
              <button
                className={`flex-1 bg-transparent border-none text-slate-300/40 px-2.5 py-2.5 font-sans text-sm cursor-pointer transition-all tracking-wide ${mode === "login" ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/30" : ""}`}
                onClick={() => switchMode("login")}
              >כניסה</button>
              <button
                className={`flex-1 bg-transparent border-none text-slate-300/40 px-2.5 py-2.5 font-sans text-sm cursor-pointer transition-all tracking-wide ${mode === "register" ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/30" : ""}`}
                onClick={() => switchMode("register")}
              >הרשמה</button>
            </div>

            <div className="flex flex-col rtl">
              <h1 className="text-2xl font-black text-white mb-2 -tracking-tight">
                {mode === "login" ? "ברוך הבא בחזרה" : "הצטרף לקהילה"}
              </h1>
              <p className="text-sm text-slate-300/40 mb-7 leading-relaxed">
                {mode === "login"
                  ? "התחבר לחשבון שלך כדי להמשיך"
                  : "צור חשבון חדש ותתחיל לקחת חלק"}
              </p>

              {/* GOOGLE */}
              <div className="mb-5 w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("כניסה עם Google נכשלה")}
                  text={mode === "login" ? "signin_with" : "signup_with"}
                  shape="rectangular"
                  theme="filled_black"
                  size="large"
                  locale="he"
                />
              </div>

              <div className="flex items-center gap-3 mb-5 rtl">
                <span className="flex-1 h-px bg-white/7" />
                <span className="text-xs text-slate-300/30 tracking-wide whitespace-nowrap">או עם מייל</span>
                <span className="flex-1 h-px bg-white/7" />
              </div>

              {/* FIELDS */}
              <div className="flex flex-col gap-3.5 mb-4">
                {mode === "register" && (
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-xs tracking-wide text-slate-300/50">שם פרטי</label>
                      <input className="bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 font-sans text-sm outline-none rtl w-full transition-colors focus:border-cyan-500/40 focus:bg-cyan-500/3 placeholder:text-slate-300/20" name="firstName" placeholder="ישראל"
                        value={form.firstName} onChange={handleChange} />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-xs tracking-wide text-slate-300/50">שם משפחה</label>
                      <input className="bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 font-sans text-sm outline-none rtl w-full transition-colors focus:border-cyan-500/40 focus:bg-cyan-500/3 placeholder:text-slate-300/20" name="lastName" placeholder="ישראלי"
                        value={form.lastName} onChange={handleChange} />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-wide text-slate-300/50">אימייל</label>
                  <input className="bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 font-sans text-sm outline-none rtl w-full transition-colors focus:border-cyan-500/40 focus:bg-cyan-500/3 placeholder:text-slate-300/20" name="email" type="email" placeholder="israel@example.com"
                    value={form.email} onChange={handleChange} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-wide text-slate-300/50">סיסמה</label>
                  <input className="bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 font-sans text-sm outline-none rtl w-full transition-colors focus:border-cyan-500/40 focus:bg-cyan-500/3 placeholder:text-slate-300/20" name="password" type="password" placeholder="••••••••"
                    value={form.password} onChange={handleChange} />
                </div>

                {mode === "register" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs tracking-wide text-slate-300/50">עיר (אופציונלי)</label>
                    <input className="bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 font-sans text-sm outline-none rtl w-full transition-colors focus:border-cyan-500/40 focus:bg-cyan-500/3 placeholder:text-slate-300/20" name="city" placeholder="תל אביב"
                      value={form.city} onChange={handleChange} />
                  </div>
                )}
              </div>

              {error && <div className="text-xs text-rose-500 border border-rose-500/25 px-3.5 py-2.5 mb-3.5 rtl bg-rose-500/5">{error}</div>}

              {mode === "login" && (
                <div className="text-left mb-1">
                  <button className="bg-none border-none text-cyan-500 font-sans text-xs cursor-pointer px-1.5 no-underline hover:text-white transition-colors">שכחתי סיסמה</button>
                </div>
              )}

              <button
                className={`w-full bg-cyan-500 text-gray-900 border-none px-3.5 py-3.25 font-bold text-sm cursor-pointer tracking-wide flex items-center justify-center gap-1.5 mt-2 min-h-12 transition-all ${loading ? "bg-cyan-500/30" : "hover:bg-white hover:shadow-lg hover:shadow-cyan-500/30"} disabled:opacity-60 disabled:cursor-not-allowed`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <span className="w-4.5 h-4.5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                  : mode === "login" ? "התחבר" : "צור חשבון"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}