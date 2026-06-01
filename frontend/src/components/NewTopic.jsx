import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MarkdownEditor from "./MarkdownEditor";
import { useAuth } from "../hooks";
import { getToken } from "../utils/storage";
const API_BASE = "http://localhost:5000";

const TOPIC_TYPES = [
  { value: "question", label: "שאלה", icon: "?" },
  { value: "discussion", label: "דיון", icon: "◈" },
  { value: "announcement", label: "הכרזה", icon: "◉" },
];

const PRESET_TAGS = ["React", "JavaScript", "UI", "Backend", "Bug", "Feature"];

export default function NewTopic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCategory = searchParams.get("categoryId");

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "question",
    categoryId: preselectedCategory || "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user]);

  // use global styles and existing theme variables; keep markup simple here

  // טעינת קטגוריות
  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, "");
      if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
        setForm((p) => ({ ...p, tags: [...p.tags, tag] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  };

  const addPresetTag = (tag) => {
    if (!form.tags.includes(tag) && form.tags.length < 5) {
      setForm((p) => ({ ...p, tags: [...p.tags, tag] }));
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("יש להזין כותרת לנושא");
    if (!form.content.trim()) return setError("יש להזין תוכן לפוסט");
    if (!form.categoryId) return setError("יש לבחור קטגוריה");

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          type: form.type,
          categoryId: form.categoryId,
          tags: form.tags,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "שגיאה ביצירת הנושא");

      // מעבר לדף הנושא החדש
      const newId = data.data?._id || data.data?.id;
      navigate(`/category?topicId=${newId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 overflow-hidden" dir="rtl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96">
          <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-0 top-28 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%)]" />
        </div>
        <main className="relative max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4 mx-auto">
            <span className="text-sm font-mono text-cyan-400">Real-Time Discussion Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
            <span className="block text-white">פתח דיון חדש</span>
            <span className="block" style={{ backgroundImage: 'linear-gradient(90deg,#06b6d4,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              שתף את הרעיון או השאלה שלך
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* FORM */}
          <div className="bg-slate-900/60 border border-slate-700/40 backdrop-blur-lg p-6 rounded-2xl">
            <div className="mb-6 text-center">
              <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">// יצירת נושא חדש</div>
            </div>

            {/* TYPE */}
            <div className="mb-8">
              <label className="text-slate-300 text-sm font-medium mb-3 block">סוג הנושא</label>
              <div className="grid grid-cols-3 gap-2">
                {TOPIC_TYPES.map((t) => (
                  <button
                    key={t.value}
                    className={`px-4 py-3 rounded-3xl border-2 font-medium transition-colors ${form.type === t.value ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" : "bg-slate-950/50 border-slate-700/40 text-slate-300 hover:bg-slate-900/70"}`}
                    onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                    type="button"
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="block text-xs mt-1">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORY */}
            <div className="mb-8">
              <label className="text-slate-300 text-sm font-medium mb-2 block">קטגוריה <span className="text-rose-500">*</span></label>
              <select
                className="w-full bg-slate-950/50 border border-slate-700/40 text-slate-200 px-3.5 py-3 rounded-3xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/25"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
              >
                <option value="">בחר קטגוריה...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* TITLE */}
            <div className="mb-8">
              <label className="text-slate-300 text-sm font-medium mb-2 block">כותרת <span className="text-rose-500">*</span></label>
              <input
                className="w-full bg-slate-950/50 border border-slate-700/40 text-slate-200 px-3.5 py-3 rounded-3xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/25"
                name="title"
                placeholder="מה השאלה או הנושא שלך?"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
              />
              <div className="text-slate-400 text-xs mt-1">{form.title.length}/120</div>
            </div>

            {/* CONTENT */}
            <div className="mb-8">
              <label className="text-slate-300 text-sm font-medium mb-2 block">תוכן <span className="text-rose-500">*</span></label>
              <div className="bg-slate-950/60 border border-slate-700/40 backdrop-blur-xl p-3 rounded-3xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)]">
              <MarkdownEditor
                value={form.content}
                onChange={(v) => setForm(p => ({ ...p, content: v }))}
                placeholder="פרט את השאלה או הנושא שלך בצורה מלאה..."
                rows={10}
              />
              </div>
              <div className="text-slate-400 text-xs mt-2">{form.content.length} תווים</div>
            </div>

            {/* TAGS */}
            <div className="mb-8">
              <label className="text-slate-300 text-sm font-medium mb-2 block">תגיות <span className="text-slate-500 text-xs font-normal">(עד 5, לחץ Enter להוספה)</span></label>
              <div className="flex flex-wrap gap-2 bg-slate-950/50 border border-slate-700/40 px-3.5 py-2.5 min-h-12 items-center rounded-3xl rtl">
                {form.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700/50 bg-slate-900/70 px-3 py-1 text-xs text-slate-200 flex items-center gap-2 transition-all">
                    <span>{tag}</span>
                    <button
                      className="rounded-full p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                      onClick={() => removeTag(tag)}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {form.tags.length < 5 && (
                  <input
                    className="flex-1 bg-transparent text-slate-200 outline-none placeholder:text-slate-500 placeholder:text-sm text-sm min-w-16 py-1"
                    placeholder={form.tags.length === 0 ? "הוסף תגית..." : ""}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                )}
              </div>

              <div className="mt-3 text-slate-300 text-xs font-medium">תגיות מוכנות</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_TAGS.map((tag) => {
                  const isActive = form.tags.includes(tag);
                  const isDisabled = !isActive && form.tags.length >= 5;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addPresetTag(tag)}
                      disabled={isDisabled}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${isActive ? "border border-cyan-500/40 bg-cyan-500/15 text-cyan-200 shadow-[0_10px_30px_-20px_rgba(56,189,248,0.65)]" : "border border-slate-700/40 bg-slate-950/60 text-slate-200 hover:border-cyan-500/30 hover:bg-slate-900/80"} ${isDisabled ? "opacity-60 cursor-not-allowed hover:border-slate-700 hover:bg-slate-950" : ""}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <div className="bg-rose-500/15 border border-rose-500/40 text-rose-400 px-5 py-3 rounded-lg mb-6">{error}</div>}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                className="w-full sm:w-auto px-6 py-3 bg-white/5 border border-slate-700/40 text-slate-200 font-sans font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 transition"
                onClick={() => navigate(preselectedCategory ? `/category?categoryId=${preselectedCategory}` : "/")}
                type="button"
              >
                ביטול
              </button>
              <button
                className={`w-full sm:w-auto button-primary disabled:opacity-50 disabled:cursor-not-allowed ${loading ? "opacity-50" : ""}`}
                onClick={handleSubmit}
                disabled={loading}
                type="button"
              >
                {loading ? "מפרסם..." : "פרסם נושא ◈"}
              </button>
            </div>
          </div>

          {/* TIPS SIDEBAR */}
          <div>
            <div className="bg-slate-900/65 border border-slate-700/40 px-5 py-5 rounded-3xl sticky top-20 backdrop-blur-xl shadow-[0_20px_80px_-40px_rgba(0,0,0,0.55)]">
              <div className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mb-4">// טיפים לפוסט טוב</div>
              <div className="space-y-3">
                {[
                  { icon: "◇", text: "כותרת ברורה וממוקדת" },
                  { icon: "◈", text: "תאר את הבעיה בפירוט" },
                  { icon: "◉", text: "הוסף קוד לדוגמה אם רלוונטי" },
                  { icon: "◑", text: "ציין מה כבר ניסית" },
                  { icon: "◆", text: "בחר קטגוריה מתאימה" },
                ].map((tip) => (
                  <div key={tip.text} className="flex gap-2 text-sm">
                    <span className="text-cyan-500 flex-shrink-0">{tip.icon}</span>
                    <span className="text-slate-300">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/65 border border-slate-700/40 px-5 py-5 rounded-3xl backdrop-blur-xl shadow-[0_20px_80px_-40px_rgba(0,0,0,0.55)]">
              <div className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mb-4">// כללי הקהילה</div>
              <div className="space-y-2">
                {[
                  "כבד את חברי הקהילה",
                  "אל תשאל שאלות כפולות",
                  "חפש לפני שאתה פותח נושא",
                  "סמן תשובה כפתרון אם פותר",
                ].map((rule) => (
                  <div key={rule} className="flex gap-2 text-xs text-slate-400">
                    <span className="text-white/20 flex-shrink-0">—</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
    </>
  );
}