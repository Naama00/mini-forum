import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks";
import CityAutocomplete from "./CityAutocomplete";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function AuthPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthForm />
    </GoogleOAuthProvider>
  );
}

function AuthForm() {
  const [mode, setMode] = useState("login");
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
    setTimeout(() => { setMode(newMode); setAnimating(false); }, 300);
  };

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

const handleSubmit = async (e) => {
  // עצירת הדפדפן מלבצע רענון דיפולטיבי של הטופס/כפתור שיכול לבטל את הניווט
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  if (!form.email || !form.password) {
    setError("נא למלא אימייל וסיסמה");
    return;
  }

  setLoading(true);
  setError(null);
  try {
    let result;
    if (mode === "login") {
      result = await login(form.email, form.password);
    } else {
      result = await register({ 
        firstName: form.firstName, 
        lastName: form.lastName, 
        email: form.email, 
        password: form.password, 
        city: form.city 
      });
    }

    console.log("מה חזר מהשרת בפועל?", result);

    // בדיקה קריטית: האם ה-token באמת קיים בתוך LocalStorage עכשיו?
    const checkToken = localStorage.getItem('token');
    
    if (!checkToken) {
      console.error("השרת החזיר תשובה, אך הטוקן לא נשמר ב-LocalStorage! בדקי את מבנה ה-response.");
      setError("שגיאה בסנכרון הנתונים מול השרת (הטוקן חסר)");
      return; // עוצר כאן ולא מנווט
    }

    // אם הגענו לכאן - הטוקן קיים ב-100% והדפדפן לא יתרענן מעצמו
    console.log("הטוקן נשמר בהצלחה! מבצע מעבר חלק לעמוד הבית...");
    navigate("/");
    
  } catch (err) {
    console.error("שגיאה שנתפסה ב-catch:", err);
    setError(err.message || "אירעה שגיאה פנימית בשרת");
  } finally {
    setLoading(false);
  }
};

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      console.log("התקבל קוד אימות מגוגל, שולח לשרת...");
      await googleLogin(credentialResponse.credential);
      console.log("התחברות עם גוגל הצליחה! מעביר לעמוד הבית...");
      navigate("/");
    } catch (err) {
      console.error("שגיאה באימות מול השרת עם גוגל:", err);
      setError(err.message || "השרת דחה את ההתחברות עם גוגל");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="page-shell">
      {/* רקע */}
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-blob page-bg-blob--magenta" />
        <div className="page-bg-grid" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="font-display text-white font-black text-2xl tracking-tighter hover:text-neon-lime transition-colors">
              DEV<span className="gradient-text">.HUB</span>
            </a>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {mode === "login" ? "עדיין אין לך חשבון?" : "כבר יש לך חשבון?"}
              <button
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="text-neon-lime font-semibold hover:text-white transition-colors"
              >
                {mode === "login" ? "הירשם עכשיו" : "התחבר"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* תוכן מרכזי */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-16 relative z-10">
        <div className="w-full max-w-lg">
          <div className={`section-card section-card-lg transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}>

            {/* Toggle כניסה/הרשמה */}
            <div className="flex gap-3 mb-10">
              {[{ key: "login", label: "כניסה" }, { key: "register", label: "הרשמה" }].map(t => (
                <button
                  key={t.key}
                  onClick={() => switchMode(t.key)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border ${
                    mode === t.key
                      ? "border-neon-lime/50 bg-neon-lime/15 text-neon-lime shadow-glow-lime"
                      : "border-white/10 bg-dark-900/50 text-dark-400 hover:border-neon-lime/30"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* כותרת */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-lime/25 bg-neon-lime/10 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-lime live-pulse" />
                <span className="text-xs text-neon-lime font-mono font-medium uppercase tracking-wider">
                  {mode === "login" ? "SIGN IN" : "SIGN UP"}
                </span>
              </div>
              <h1 className="font-display text-4xl font-black text-white mb-2">
                {mode === "login" ? "ברוך הבא בחזרה" : "הצטרף לקהילה"}
              </h1>
              <p className="text-slate-400 text-sm">
                {mode === "login"
                  ? "התחבר לחשבון שלך כדי להמשיך בדיון"
                  : "צור חשבון חדש והתחיל לקחת חלק בקהילת המפתחים"}
              </p>
            </div>

            {/* Google Login */}
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.error("כניסה עם Google נכשלה לחלוטין ברמת הספרייה קליינט");
                  setError("חיבור עם גוגל נכשל. ודאי שהכתובת מאושרת ב-Google Console");
                }}
                text={mode === "login" ? "signin_with" : "signup_with"}
                shape="rectangular"
                theme="filled_black"
                size="large"
                locale="he"
              />
            </div>

            {/* מפריד */}
            <div className="flex items-center gap-4 mb-6">
              <span className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">או עם מייל</span>
              <span className="flex-1 h-px bg-slate-800" />
            </div>

            {/* שדות */}
            <div className="space-y-4 mb-6">
              {mode === "register" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">שם פרטי</label>
                    <input className="form-input" name="firstName" placeholder="ישראל" value={form.firstName} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">שם משפחה</label>
                    <input className="form-input" name="lastName" placeholder="ישראלי" value={form.lastName} onChange={handleChange} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">אימייל</label>
                <input className="form-input" name="email" type="email" placeholder="israel@example.com" value={form.email} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">סיסמה</label>
                <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
              </div>

              {mode === "register" && (
                <CityAutocomplete
                  label="עיר (אופציונלי)"
                  name="city"
                  placeholder="בחר עיר בישראל"
                  value={form.city}
                  onChange={handleChange}
                />
              )}
            </div>

            {/* שגיאה */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            {/* שכחתי סיסמה */}
            {mode === "login" && (
              <div className="mb-5 text-left">
                <button className="text-xs text-neon-cyan hover:text-neon-lime transition-colors">שכחתי סיסמה</button>
              </div>
            )}

            {/* כפתור שליחה */}
            <button
              onClick={(e) => handleSubmit(e)}
              disabled={loading}
              className="button-primary w-full flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : mode === "login" ? "התחבר" : "צור חשבון"}
            </button>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center">
        <span className="text-slate-600 text-xs font-mono uppercase tracking-widest">
          © {new Date().getFullYear()} Dev.Hub Israel
        </span>
      </footer>
    </div>
  );
}