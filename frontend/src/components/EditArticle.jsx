import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MarkdownEditor from "./MarkdownEditor";
import { useAuth } from "../hooks";
import { getToken } from "../utils/storage";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CATEGORIES = ["AI", "Web", "Mobile", "DevOps", "Security", "Career", "Design", "Other"];

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = getToken();

  const [form, setForm] = useState({ title: "", content: "", category: "", tags: [], image: "" });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/articles/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((r) => r.json())
      .then((res) => {
        const data = res.data || res;
        // בדיקת הרשאות עריכה
        if (data.author?._id !== user?.id && data.author !== user?.id) { 
          navigate(`/articles/${id}`); 
          return; 
        }
        setForm({
          title: data.title || "",
          content: data.content || "",
          category: data.category || "",
          tags: data.tags || [],
          image: data.image || ""
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("שגיאה במשיכת נתוני המאמר מהשרת המרכזי");
        setLoading(false);
      });
  }, [id, navigate, token, user?.id]);

  const wordCount = form.content ? form.content.trim().split(/\s+/).filter(Boolean).length : 0;

  const removeTag = (idx) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    const clean = tagInput.trim();
    if (clean && !form.tags.includes(clean)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, clean] }));
    }
    setTagInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("יש למלא כותרת ותוכן מאמר מלאים.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const r = await fetch(`${API}/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const res = await r.json();
      if (res.success) {
        navigate(`/articles/${id}`);
      } else {
        setError(res.message || "נכשל בעדכון ליבת המאמר");
      }
    } catch {
      setError("שגיאת רשת בשילוח העדכון למסד הנתונים");
    } finally {
      setSaving(false);
    }
  };

  const EDIT_ARTICLE_STYLES = `
    .cyber-dots {
      position: fixed;
      inset: 0;
      background-image: radial-gradient(circle at 2px 2px, rgba(204, 255, 0, 0.02) 1px, transparent 0);
      background-size: 32px 32px;
      z-index: -1;
    }
    .neon-glow-blob {
      position: fixed;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(204, 255, 0, 0.03), transparent 75%);
      filter: blur(120px);
      z-index: -1;
      pointer-events: none;
    }
    .glass-editor-card {
      background: rgba(255, 255, 255, 0.015);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(204, 255, 0, 0.05);
    }
    .sidebar-label-mono {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: rgba(204, 255, 0, 0.4);
      font-weight: 700;
    }
  `;

  if (loading) {
    return (
      <div className="text-center py-32 font-mono text-[#ccff00] animate-pulse tracking-widest text-xs">
        // ACCESSING SECURE STORAGE & COMPILING DOCUMENT...
      </div>
    );
  }

  return (
    <>
      <style>{EDIT_ARTICLE_STYLES}</style>
      <div className="relative min-h-screen text-slate-200 pb-20" dir="rtl">
        <div className="cyber-dots" />
        <div className="neon-glow-blob top-10 left-10" />

        <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
          
          {/* Top Info Bar */}
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div>
              <div className="font-mono text-[10px] text-[#ccff00] tracking-wider uppercase mb-1">// EDITOR_TERMINAL</div>
              <h1 className="text-2xl font-black text-white tracking-tight">עריכת מחקר מדעי</h1>
            </div>
            <Link to={`/articles/${id}`} className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
              ← ביטול וחזרה למאמר
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
              [ERROR]: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* גוף העורך הראשי */}
            <div className="lg:col-span-3 space-y-6">
              <div className="glass-editor-card p-6 md:p-8 rounded-2xl space-y-5">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">כותרת המאמר</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="הזן כותרת טכנולוגית חדה..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-base text-white placeholder-slate-700 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all"
                  />
                </div>

                {/* Markdown Workspace */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">גוף המחקר (Markdown נתמך)</label>
                  <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20 focus-within:border-[#ccff00]/40 transition-all">
                    <MarkdownEditor
                      value={form.content}
                      onChange={(val) => setForm(prev => ({ ...prev, content: val }))}
                      placeholder="כתוב את הקוד, הארכיטקטורה והניתוח שלך כאן..."
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* לוח ניהול צידי - מטא דאטה */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* קטגוריה */}
              <div className="glass-editor-card p-5 rounded-2xl">
                <p className="sidebar-label-mono mb-4.5 flex items-center gap-2">
                  ערוץ הפצה
                  <span className="flex-1 h-px bg-white/5" />
                </p>
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-black/50 border border-white/5 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-[#ccff00] transition-all"
                >
                  <option value="">בחר קטגוריה מקצועית...</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* ניהול תגיות */}
              <div className="glass-editor-card p-5 rounded-2xl">
                <p className="sidebar-label-mono mb-4 flex items-center gap-2">
                  תגיות מפתח
                  <span className="flex-1 h-px bg-white/5" />
                </p>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      onClick={() => removeTag(i)}
                      className="group cursor-pointer font-mono text-[11px] px-2.5 py-1 bg-[#ccff00]/5 border border-[#ccff00]/10 text-slate-300 rounded-lg hover:border-red-500/30 hover:text-red-400 transition-all"
                    >
                      #{tag} <span className="text-slate-600 group-hover:text-red-400 ml-0.5">×</span>
                    </span>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="הוסף תגית ולחץ Enter..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#ccff00] transition-all"
                  />
                </div>
              </div>

              {/* סטטיסטיקה מובנית */}
              <div className="glass-editor-card p-5 rounded-2xl">
                <p className="sidebar-label-mono mb-4.5 flex items-center gap-2">
                  סטטיסטיקת קוד
                  <span className="flex-1 h-px bg-white/5" />
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                    <span className="block font-mono text-xl font-bold text-[#ccff00]">{wordCount}</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Words_</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                    <span className="block font-mono text-xl font-bold text-[#ccff00]">{form.content?.length || 0}</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Bytes_</span>
                  </div>
                </div>
              </div>

              {/* כפתור שמירה סופי */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#ccff00] hover:bg-[#bfff00] text-black font-black text-xs py-3.5 rounded-xl shadow-lg shadow-[#ccff00]/5 transition-all disabled:opacity-30 cursor-pointer"
              >
                {saving ? "מזרים נתונים מוצפנים..." : "עדכן והפץ מאמר ⚡"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </>
  );
}