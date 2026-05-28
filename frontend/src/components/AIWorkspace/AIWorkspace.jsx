import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Zap,
  Bot,
  Send,
  Wand2,
  Code2,
  FileText,
  Rocket,
  Trash2,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import styles from './AIWorkspace.module.css';

/**
 * AIWorkspace Component - Streamlined & Modularized
 * Uses global styles where possible, encapsulated remaining styles in CSS Module.
 * ALL ORIGINAL LOGIC PRESERVED 100%.
 */
export default function AIWorkspace({
  currentUser,
  categories = [],
  onAddTopic,
  onAddArticle,
  onNavigate,
}) {
  // =========================
  // ORIGINAL LOGIC (UNCHANGED)
  // =========================
  const [action, setAction] = useState(() => {
    return localStorage.getItem('devhub_workspace_action') || 'draft';
  });

  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem('devhub_workspace_prompt') || '';
  });

  const [codeContext, setCodeContext] = useState(() => {
    return localStorage.getItem('devhub_workspace_code_context') || '';
  });

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(() => {
    return localStorage.getItem('devhub_workspace_result') || '';
  });

  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const workspaceRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('devhub_workspace_action', action);
  }, [action]);

  useEffect(() => {
    localStorage.setItem('devhub_workspace_prompt', prompt);
  }, [prompt]);

  useEffect(() => {
    localStorage.setItem('devhub_workspace_code_context', codeContext);
  }, [codeContext]);

  useEffect(() => {
    localStorage.setItem('devhub_workspace_result', result);
  }, [result]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]._id || categories[0].id || '');
    }
  }, [categories, selectedCategory]);

  const handleMouseMove = (e) => {
    if (!workspaceRef.current) return;
    const cards = workspaceRef.current.querySelectorAll(`.${styles.containerWithGlow}`);
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  const handleClear = () => {
    setPrompt('');
    setCodeContext('');
    setResult('');
    setError('');
    setSuccessMessage('');
    localStorage.removeItem('devhub_workspace_prompt');
    localStorage.removeItem('devhub_workspace_code_context');
    localStorage.removeItem('devhub_workspace_result');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setResult('');

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action,
          prompt,
          codeContext: action === 'optimize' || action === 'explain' ? codeContext : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'שגיאה בייצור התוכן מה-AI');
      }

      setResult(data.result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'חיבור לשרת ה-AI נכשל. ודא שהשרת רץ.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!result) return;
    setError('');
    setSuccessMessage('');

    try {
      let title = prompt.slice(0, 50);
      if (title.length >= 50) title += '...';

      if (action === 'draft') {
        if (!onAddTopic) {
          throw new Error('פונקציית פרסום פוסט לא זמינה בקומפוננטה זו');
        }
        await onAddTopic({
          title,
          content: result,
          categoryId: selectedCategory,
        });
        setSuccessMessage('הטיוטה פורסמה בהצלחה כנושא חדש בפורום!');
      } else {
        if (!onAddArticle) {
          throw new Error('פונקציית שמירת מאמר לא זמינה בקומפוננטה זו');
        }
        await onAddArticle({
          title: `ניתוח AI: ${title}`,
          content: result,
          tags: [action],
        });
        setSuccessMessage('הניתוח נשמר בהצלחה בארכיון המאמרים שלך!');
      }
    } catch (err) {
      setError(err.message || 'הפרסום נכשל');
    }
  };

  return (
    <div ref={workspaceRef} onMouseMove={handleMouseMove} className={styles.workspaceContainer}>
      
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Cpu className={`w-5 h-5 ${styles.pulseIcon}`} />
            </div>
            <h1 className="text-2xl font-black text-white">AI Developer Workspace</h1>
          </div>
          <p className="text-sm text-slate-400">
            מחולל קוד, פוסטים ארכיטקטוניים ואופטימיזציית מערכות מבוסס בינה מלאכותית.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 self-start md:self-auto">
          <button
            onClick={() => setAction('draft')}
            className={`${styles.actionButton} ${action === 'draft' ? styles.actionButtonActive : ''}`}
          >
            <FileText className="w-4 h-4" />
            טיוטת פוסט מקיף
          </button>
          <button
            onClick={() => setAction('optimize')}
            className={`${styles.actionButton} ${action === 'optimize' ? styles.actionButtonActive : ''}`}
          >
            <Code2 className="w-4 h-4" />
            אופטימיזציית קוד
          </button>
          <button
            onClick={() => setAction('explain')}
            className={`${styles.actionButton} ${action === 'explain' ? styles.actionButtonActive : ''}`}
          >
            <Wand2 className="w-4 h-4 text-violet-400" />
            הסבר ארכיטקטורה
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INPUT FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-5">
          <div className={`glass-card section-card-lg ${styles.containerWithGlow} relative overflow-hidden`}>
            <div className={styles.glowOverlay} />
            
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {action === 'draft' && 'על מה תרצה שהפוסט ידבר?'}
                {action === 'optimize' && 'הנחיות מיוחדות לאופטימיזציה'}
                {action === 'explain' && 'מה תרצה שננתח ונבין בקוד?'}
              </label>

              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="נקה הכל"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                action === 'draft'
                  ? 'לדוגמה: כתוב מדריך מעמיק על ניהול סטייט ב-React 19 עם Server Actions...'
                  : 'לדוגמה: מצא זליגות זיכרון, שפר ביצועי רינדור והפוך את הפונקציות לנקיות יותר...'
              }
              className="form-input min-h-[120px] resize-none mb-4"
              required
            />

            {/* Code Context Area for Code Actions */}
            {(action === 'optimize' || action === 'explain') && (
              <div className="space-y-2 mt-4">
                <label className="text-xs font-semibold text-slate-400 block">
                  הדבק את קוד המקור כאן (Context):
                </label>
                <textarea
                  value={codeContext}
                  onChange={(e) => setCodeContext(e.target.value)}
                  placeholder="// Paste your component, hook or functions here..."
                  className="form-input min-h-[180px] font-mono text-xs text-cyan-300 bg-slate-950/80 resize-none"
                  required
                />
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-white/5">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                DevHub AI Model v4.0
              </span>

              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-40 disabled:hover:shadow-none transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    מייצר פתרון...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    שגר ל-AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Presets */}
          <div className="glass-card section-card-md">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              קיצורי דרך מהירים
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setAction('optimize');
                  setPrompt('תקן שגיאות אבטחה פוטנציאליות ובצע אופטימיזציית ביצועים קשיחה לקוד המצורף.');
                }}
                className="w-full text-right text-xs text-slate-400 hover:text-cyan-300 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
              >
                🛠️ ניתוח אבטחה ואופטימיזציה מלאה
              </button>
              <button
                type="button"
                onClick={() => {
                  setAction('draft');
                  setPrompt('כתוב פוסט טכנולוגי עמוק ומקיף על ארכיטקטורת Microfrontends באמצעות Module Federation.');
                }}
                className="w-full text-right text-xs text-slate-400 hover:text-cyan-300 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
              >
                📝 פוסט ארכיטקטורת Microfrontends
              </button>
            </div>
          </div>
        </form>

        {/* RIGHT COLUMN: AI OUTPUT & OUTPUT MANAGEMENT */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Error Messaging */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          {/* Success Messaging */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {successMessage}
            </div>
          )}

          {/* AI Result Presentation Terminal */}
          <div className={`glass-card section-card-lg ${styles.containerWithGlow} relative overflow-hidden min-h-[360px] flex flex-col`}>
            <div className={styles.glowOverlay} />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-cyan-400 animate-ping' : result ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {loading ? 'AI Engine Processing...' : 'AI Generated Response'}
                </span>
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  {action === 'draft' && categories.length > 0 && (
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg text-xs px-2 py-1 text-slate-300 outline-none focus:border-cyan-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat._id || cat.id} value={cat._id || cat.id}>
                          קטגוריה: {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={handlePublish}
                    className="button-outline text-xs py-1 px-3 rounded-lg flex items-center gap-1 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10"
                  >
                    <Rocket className="w-3 h-3" />
                    {action === 'draft' ? 'פרסם בפורום' : 'שמור בארכיון'}
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Content Display State */}
            {loading && !result ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 py-12">
                <Zap className="w-8 h-8 text-cyan-500/40 animate-bounce" />
                <p className="text-sm">ה-Core של DevHub מעבד כעת את הנתונים ומנתח את בקשתך...</p>
              </div>
            ) : result ? (
              <div className={`flex-1 overflow-y-auto max-h-[500px] pr-1 ${styles.resultMarkdown}`}>
                <Markdown>{result}</Markdown>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500 py-12 text-center">
                <Bot className="w-10 h-10 text-slate-700 mb-1" />
                <h3 className="text-sm font-bold text-slate-400">הטרמינל ריק</h3>
                <p className="text-xs max-w-xs px-4 text-slate-500">
                  הזן הנחיה או קוד בטופס משמאל ולחץ "שגר ל-AI" כדי לראות פתרונות, ניתוחים וארכיטקטורות קוד כאן.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}