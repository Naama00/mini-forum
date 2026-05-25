import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks";
import CityAutocomplete from "./CityAutocomplete";

const GOOGLE_CLIENT_ID = "151921932655-85p00136srh9nb2tquam8qkkjtuvfnl5.apps.googleusercontent.com";
const API_BASE = "http://localhost:5000";

/* ─── CSS CUSTOM — עיצוב עתידני עם ניאון צהוב ─────────────────────── */
const AUTH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;400;700;800&display=swap');

  :root {
    --bg-dark: #0a0a0c;
    --accent-glow: #ccff00;
    --glass-bg: rgba(255, 255, 255, 0.03);
    --border-glass: rgba(204, 255, 0, 0.15);
  }

  body { 
    background-color: var(--bg-primary) !important; 
    color: var(--text-primary);
    font-family: 'Assistant', sans-serif;
  }

  .dh-grid-bg {
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle at 2px 2px, rgba(204, 255, 0, 0.05) 1px, transparent 0);
    background-size: 40px 40px;
    z-index: -1;
  }

  .ambient-glow {
    position: fixed;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(204, 255, 0, 0.08), transparent 70%);
    filter: blur(80px);
    z-index: -1;
    pointer-events: none;
  }

  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-glass);
  }

  .neon-btn {
    border: 1px solid var(--accent-glow);
    color: var(--accent-glow);
    text-shadow: 0 0 8px rgba(204, 255, 0, 0.5);
    box-shadow: inset 0 0 10px rgba(204, 255, 0, 0.1);
    transition: 0.3s;
  }
  .neon-btn:hover {
    background: var(--accent-glow);
    color: #000;
    box-shadow: 0 0 20px var(--accent-glow);
  }
`;

export default function AuthPage() {
  return (
    <>
      <style>{AUTH_STYLES}</style>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthForm />
      </GoogleOAuthProvider>
    </>
  );
}

function AuthForm() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", city: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();
  const { login, register, googleLogin } = useAuth();

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
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, city: form.city });
      }
      navigate('/');
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
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl">
      {/* Background Layers */}
      <div className="dh-grid-bg" />
      <div className="ambient-glow -top-20 -right-20" />
      <div className="ambient-glow bottom-0 left-0 opacity-50" />

      {/* HEADER */}
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="flex items-center gap-2">
              <span className="text-[#ccff00] font-black text-2xl tracking-tighter">DEV.HUB</span>
            </a>
            <div className="flex items-center gap-1.5 text-xs text-slate-300/40">
              {mode === "login" ? "עדיין אין לך חשבון?" : "כבר יש לך חשבון?"}
              <button
                className="bg-none border-none text-[#ccff00] font-sans text-xs cursor-pointer px-1.5 no-underline hover:text-white transition-colors"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "הירשם עכשיו" : "התחבר"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-16 relative z-10">
        <div className="w-full max-w-2xl">
          <div className="glass-card p-12 rounded-3xl">
            <div className={`${animating ? "animate-fade-out" : "animate-fade-in"}`}>

              {/* TOGGLE */}
              <div className="flex gap-4 mb-10 rtl">
                <button
                  className={`flex-1 px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all rounded-xl ${mode === "login" ? "bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30" : "bg-white/5 text-slate-300 border border-white/10"}`}
                  onClick={() => switchMode("login")}
                >כניסה</button>
                <button
                  className={`flex-1 px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all rounded-xl ${mode === "register" ? "bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30" : "bg-white/5 text-slate-300 border border-white/10"}`}
                  onClick={() => switchMode("register")}
                >הרשמה</button>
              </div>

              <div className="flex flex-col rtl mb-10">
                <h1 className="text-4xl font-black text-white mb-3">
                  {mode === "login" ? "ברוך הבא בחזרה" : "הצטרף לקהילה"}
                </h1>
                <p className="text-slate-400 leading-relaxed">
                  {mode === "login"
                    ? "התחבר לחשבון שלך כדי להמשיך בדיון"
                    : "צור חשבון חדש והתחיל לקחת חלק בקהילת המפתחים"}
                </p>
              </div>

              {/* GOOGLE */}
              <div className="mb-6">
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

              <div className="flex items-center gap-4 mb-6 rtl">
                <span className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-400 font-mono uppercase">או עם מייל</span>
                <span className="flex-1 h-px bg-white/10" />
              </div>

              {/* FIELDS */}
              <div className="flex flex-col gap-4 mb-6">
                {mode === "register" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs tracking-widest text-slate-400 mb-2 uppercase">שם פרטי</label>
                      <input className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-sans text-sm outline-none rtl transition-colors focus:border-[#ccff00]/50 focus:bg-[#ccff00]/5 placeholder:text-slate-500" name="firstName" placeholder="ישראל"
                        value={form.firstName} onChange={handleChange} />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs tracking-widest text-slate-400 mb-2 uppercase">שם משפחה</label>
                      <input className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-sans text-sm outline-none rtl transition-colors focus:border-[#ccff00]/50 focus:bg-[#ccff00]/5 placeholder:text-slate-500" name="lastName" placeholder="ישראלי"
                        value={form.lastName} onChange={handleChange} />
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  <label className="text-xs tracking-widest text-slate-400 mb-2 uppercase">אימייל</label>
                  <input className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-sans text-sm outline-none rtl transition-colors focus:border-[#ccff00]/50 focus:bg-[#ccff00]/5 placeholder:text-slate-500" name="email" type="email" placeholder="israel@example.com"
                    value={form.email} onChange={handleChange} />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs tracking-widest text-slate-400 mb-2 uppercase">סיסמה</label>
                  <input className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-sans text-sm outline-none rtl transition-colors focus:border-[#ccff00]/50 focus:bg-[#ccff00]/5 placeholder:text-slate-500" name="password" type="password" placeholder="••••••••"
                    value={form.password} onChange={handleChange} />
                </div>

                {mode === "register" && (
                  <div className="flex flex-col">
                    <CityAutocomplete
                      label="עיר (אופציונלי)"
                      name="city"
                      placeholder="בחר עיר בישראל"
                      value={form.city}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="text-xs text-red-400 border border-red-500/25 px-4 py-3 mb-6 rounded-xl bg-red-500/5 rtl">
                  {error}
                </div>
              )}

              {mode === "login" && (
                <div className="mb-4 text-right">
                  <button className="bg-none border-none text-[#ccff00] font-sans text-xs cursor-pointer px-0 no-underline hover:text-white transition-colors">שכחתי סיסמה</button>
                </div>
              )}

              <button
                className="w-full bg-[#ccff00] text-black hover:bg-[#bfff00] border-none px-4 py-3 font-bold text-sm cursor-pointer tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#ccff00]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : mode === "login" ? "התחבר" : "צור חשבון"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center">
        <div className="text-slate-600 text-xs font-mono uppercase tracking-widest">
          © {new Date().getFullYear()} Dev.Hub Israel // v2.0.4
        </div>
      </footer>
    </div>
  );
}