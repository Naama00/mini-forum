import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MarkdownEditor from "./MarkdownEditor";
const API_BASE = "http://localhost:5000";

const TOPIC_TYPES = [
  { value: "question", label: "שאלה", icon: "?" },
  { value: "discussion", label: "דיון", icon: "◈" },
  { value: "announcement", label: "הכרזה", icon: "◉" },
];

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
  const [user, setUser] = useState(null);

  // בדיקת משתמש מחובר
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    } catch {
      navigate("/auth");
    }
  }, []);

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

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("יש להזין כותרת לנושא");
    if (!form.content.trim()) return setError("יש להזין תוכן לפוסט");
    if (!form.categoryId) return setError("יש לבחור קטגוריה");

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
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
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 rtl" dir="rtl">
      {/* Header */}
      <header className="border-b border-white/8 bg-gray-950/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded" />
              <span className="text-white font-bold">Dev<span className="text-cyan-500">Hub</span></span>
            </a>
            <nav className="flex items-center gap-2 text-sm text-slate-400">
              <a href="/" className="hover:text-cyan-500">בית</a>
              <span className="text-white/30">/</span>
              {preselectedCategory && (
                <>
                  <a href={`/category?categoryId=${preselectedCategory}`} className="hover:text-cyan-500">קטגוריה</a>
                  <span className="text-white/30">/</span>
                </>
              )}
              <span className="text-slate-400">נושא חדש</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

          {/* FORM */}
          <div>
            <div className="mb-8">
              <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">// יצירת נושא חדש</div>
              <h1 className="text-4xl font-bold text-white">פתח דיון חדש</h1>
            </div>

            {/* TYPE */}
            <div className="mb-8">
              <label className="text-slate-300 text-sm font-medium mb-3 block">סוג הנושא</label>
              <div className="grid grid-cols-3 gap-2">
                {TOPIC_TYPES.map((t) => (
                  <button
                    key={t.value}
                    className={`px-4 py-3 rounded border-2 font-medium transition-colors ${form.type === t.value ? "bg-cyan-500 text-gray-950 border-cyan-500" : "bg-white/3 border-white/8 text-slate-300 hover:bg-white/5"}`}
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
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
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
                className="w-full bg-white/3 border border-white/8 text-slate-200 px-3.5 py-2.75 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
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
              <MarkdownEditor
                value={form.content}
                onChange={(v) => setForm(p => ({ ...p, content: v }))}
                placeholder="פרט את השאלה או הנושא שלך בצורה מלאה..."
                rows={10}
              />
              <div className="text-slate-400 text-xs mt-2">{form.content.length} תווים</div>
            </div>

            {/* TAGS */}
            <div className="mb-8">
              <label className="text-slate-300 text-sm font-medium mb-2 block">תגיות <span className="text-slate-500 text-xs font-normal">(עד 5, לחץ Enter להוספה)</span></label>
              <div className="flex flex-wrap gap-2 bg-white/3 border border-white/8 px-3.5 py-2.5 min-h-12 items-center rounded rtl">
                {form.tags.map((tag) => (
                  <span key={tag} className="bg-cyan-500/20 text-cyan-300 px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
                    {tag}
                    <button className="font-bold hover:text-cyan-200" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
                {form.tags.length < 5 && (
                  <input
                    className="flex-1 bg-transparent text-slate-200 outline-none placeholder-slate-400 text-sm min-w-16"
                    placeholder={form.tags.length === 0 ? "הוסף תגית..." : ""}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                )}
              </div>
            </div>

            {error && <div className="bg-rose-500/15 border border-rose-500/40 text-rose-400 px-5 py-3 rounded-lg mb-6">{error}</div>}

            <div className="flex gap-3 justify-end">
              <button
                className="px-6 py-2.75 bg-white/3 border border-white/8 text-slate-200 font-sans font-bold uppercase tracking-widest rounded hover:bg-white/5"
                onClick={() => navigate(preselectedCategory ? `/category?categoryId=${preselectedCategory}` : "/")}
                type="button"
              >
                ביטול
              </button>
              <button
                className={`px-6 py-2.75 bg-cyan-500 text-gray-950 font-sans font-bold uppercase tracking-widest rounded hover:shadow-lg hover:shadow-cyan-500/35 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? "opacity-50" : ""}`}
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
            <div className="bg-white/2 border border-white/7 px-5 py-5 rounded-lg sticky top-20">
              <div className="text-slate-300 font-bold text-sm mb-4 font-mono text-slate-400 text-xs uppercase tracking-widest">// טיפים לפוסט טוב</div>
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

            <div className="bg-white/2 border border-white/7 px-5 py-5 rounded-lg">
              <div className="text-slate-300 font-bold text-sm mb-4 font-mono text-slate-400 text-xs uppercase tracking-widest">// כללי הקהילה</div>
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
  );
}