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
  Clock,
  AlertTriangle,
} from 'lucide-react';
import styles from './AIWorkspace.module.css';

import { API_BASE_URL as API } from "../../utils/constants";

// ✨ חדש: הודעות rate limit מובנות — זהות ל-PostSummary
const RATE_LIMIT_MESSAGES = {
  rate_limit_minute: {
    icon: <Clock className="w-5 h-5 text-amber-400 shrink-0" />,
    title: 'המתן רגע',
    text: 'ניסית יותר מדי פעמים בדקה האחרונה. המתן מעט ונסה שנית.',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    titleColor: 'text-amber-300',
    textColor: 'text-amber-400/80',
  },
  rate_limit_day: {
    icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
    title: 'המכסה היומית נגמרה',
    text: 'הגעת למכסת בקשות ה-AI היומית שלך. המכסה מתאפסת בחצות — חזור מחר!',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/5',
    titleColor: 'text-rose-300',
    textColor: 'text-rose-400/80',
  },
};

/**
 * AIWorkspace Component
 * שינויים: הוספת טיפול בשגיאות rate limit בלבד.
 * כל שאר הלוגיקה והעיצוב — ללא שינוי.
 */
export default function AIWorkspace({
  currentUser,
  categories = [],
  onAddTopic,
  onAddArticle,
  onNavigate,
}) {
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
  const [rateLimitError, setRateLimitError] = useState(null); // ✨ חדש
  const [selectedCategory, setSelectedCategory] = useState('');
  const [publishTarget, setPublishTarget] = useState('topic');
  const [successMessage, setSuccessMessage] = useState('');

  const abortControllerRef = useRef(null);
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

  useEffect(() => {
    if (action === 'optimize' || action === 'explain') {
      setPublishTarget('article');
    } else {
      setPublishTarget('topic');
    }
  }, [action]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const handleMouseMove = (e) => {
    if (!workspaceRef.current) return;
    const cards = workspaceRef.current.querySelectorAll(`.${styles.containerWithGlow}`);
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();
    setPrompt('');
    setCodeContext('');
    setResult('');
    setError('');
    setRateLimitError(null); // ✨ חדש
    setSuccessMessage('');
    localStorage.removeItem('devhub_workspace_prompt');
    localStorage.removeItem('devhub_workspace_code_context');
    localStorage.removeItem('devhub_workspace_result');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError('');
    setRateLimitError(null); // ✨ חדש — מאפס rate limit לפני כל בקשה
    setSuccessMessage('');
    setResult('');

    try {
      const response = await fetch(`${API}/gemini/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action,
          prompt,
          extraContext: action === 'optimize' || action === 'explain' ? codeContext : undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      // ✨ חדש: טיפול בשגיאות rate limit לפני קריאת ה-stream
      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        setRateLimitError(data.error || 'rate_limit_minute');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'שגיאה בייצור התוכן מה-AI');
      }

      // ── קריאת SSE — ללא שינוי ────────────────────────────────────────────
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = 'message';
          let dataLine = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            if (line.startsWith('data: '))  dataLine  = line.slice(6).trim();
          }

          if (!dataLine) continue;

          let parsed;
          try { parsed = JSON.parse(dataLine); } catch { continue; }

          if (eventType === 'chunk' && parsed.text) {
            setResult((prev) => prev + parsed.text);
          }

          if (eventType === 'error') {
            throw new Error(parsed.message || 'שגיאה בזרם ה-AI');
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setError(err.message || 'חיבור לשרת ה-AI נכשל. ודא שהשרת רץ.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.isAdmin;

  const handlePublish = async () => {
    if (!result) return;
    setError('');
    setSuccessMessage('');

    try {
      let title = prompt.slice(0, 50);
      if (title.length >= 50) title += '...';

      if (action === 'create-challenge' && !isAdmin) {
        setSuccessMessage('האתגר נשאר בארגז הכלים הפרטי שלך. רק מנהל יכול לפרסם אתגרים רשמיים בפורום.');
        return;
      }

      const isTopicPublish =
        action === 'draft' ||
        action === 'create-challenge' ||
        (action === 'tech-interview' && publishTarget === 'topic');

      if (isTopicPublish) {
        if (!onAddTopic) throw new Error('פונקציית פרסום פוסט לא זמינה בקומפוננטה זו');
        const tags = action === 'create-challenge' ? ['challenge'] : action === 'tech-interview' ? ['interview'] : [];
        const type = action === 'create-challenge' ? 'challenge' : action === 'tech-interview' ? 'interview' : 'question';

        await onAddTopic({ title, content: result, categoryId: selectedCategory, tags, type });
        const actionLabel = action === 'tech-interview' ? 'ראיון' : action === 'create-challenge' ? 'אתגר' : 'טיוטה';
        const successText = action === 'create-challenge'
          ? 'האתגר פורסם בהצלחה באתגרים!'
          : `ה${actionLabel} פורסם בהצלחה כנושא חדש בפורום!`;
        setSuccessMessage(successText);
      } else if (action === 'tech-interview' && publishTarget === 'article') {
        if (!onAddArticle) throw new Error('פונקציית שמירת מאמר לא זמינה בקומפוננטה זו');
        await onAddArticle({ title: `ראיון AI: ${title}`, content: result, tags: ['interview'], categoryId: selectedCategory });
        setSuccessMessage('הראיון נשמר בהצלחה כמאמר בארכיון!');
      } else {
        if (!onAddArticle) throw new Error('פונקציית שמירת מאמר לא זמינה בקומפוננטה זו');
        await onAddArticle({ title: `ניתוח AI: ${title}`, content: result, tags: [action], categoryId: selectedCategory });
        setSuccessMessage('הניתוח נשמר בהצלחה בארכיון!');
      }
    } catch (err) {
      setError(err.message || 'הפרסום נכשל');
    }
  };

  const rateMsg = RATE_LIMIT_MESSAGES[rateLimitError];

  return (
    <div ref={workspaceRef} onMouseMove={handleMouseMove} className={styles.workspaceContainer}>

      {/* ── AI WORKSPACE HERO ── */}
      <div className="glass-card-futuristic section-card-lg">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] items-start">
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-cyan-200/80 font-semibold">
              <Sparkles className="w-4 h-4" /> DevHub AI Workspace
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                הפעל את ה-AI שלך כדי ליצור, לחדד ולפרסם תוכן טכנולוגי במהירות.
              </h1>
              <p className="max-w-2xl text-slate-300 leading-7">
                בחר סגנון עבודה, הזן הנחיה ותן למנוע לכתוב עבורך קוד, הסברים, מאמרים ואתגרים בהתאמה אישית.
                כל מסך בנוי כדי להיות נקי, מזמין ובעל זרימת עבודה ברורה.
              </p>
            </div>

          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">טיפ מהיר:</strong> החלף בין מצבי הפעולה כדי לשנות את הזרימה מהר ולהתאים את התוצאה לסוג התוכן הרצוי.
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">שדה Prompt:</strong> כתוב כאן את הרעיון או הקוד, והצד הימני יציג את התוצאה מיידית עם חוויית קריאה נוחה.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className={styles.tabsWrap}>
          <button onClick={() => setAction('draft')} className={`${styles.actionButton} ${action === 'draft' ? styles.actionButtonActive : ''}`}>
            <FileText className="w-4 h-4 text-amber-400" /> טיוטת פוסט
          </button>
          <button onClick={() => setAction('optimize')} className={`${styles.actionButton} ${action === 'optimize' ? styles.actionButtonActive : ''}`}>
            <Code2 className="w-4 h-4 text-pink-400" /> קוד אופטימלי
          </button>
          <button onClick={() => setAction('explain')} className={`${styles.actionButton} ${action === 'explain' ? styles.actionButtonActive : ''}`}>
            <Wand2 className="w-4 h-4 text-violet-400" /> ארכיטקטורה
          </button>
          <button onClick={() => setAction('tech-interview')} className={`${styles.actionButton} ${action === 'tech-interview' ? styles.actionButtonActive : ''}`}>
            <Zap className="w-4 h-4 text-amber-400" /> ראיון טק
          </button>
          <button onClick={() => setAction('create-challenge')} className={`${styles.actionButton} ${action === 'create-challenge' ? styles.actionButtonActive : ''}`}>
            <Rocket className="w-4 h-4 text-pink-400" /> אתגר קוד
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTENT — ללא שינוי ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: INPUT FORM — ללא שינוי */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-5">
          <div className={`glass-card section-card-lg ${styles.containerWithGlow} relative overflow-hidden`}>
            <div className={styles.glowOverlay} />

            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {action === 'draft'            && 'על מה תרצה שהפוסט ידבר?'}
                {action === 'optimize'         && 'הנחיות מיוחדות לאופטימיזציה'}
                {action === 'explain'          && 'מה תרצה שננתח ונבין בקוד?'}
                {action === 'tech-interview'   && 'לאיזה משרה/תפקיד תרצה להיחקק?'}
                {action === 'create-challenge' && 'אתגר קוד לאילו תחומים?'}
              </label>
              <button type="button" onClick={handleClear} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="נקה הכל">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                action === 'draft' ? 'לדוגמה: כתוב מדריך מעמיק על ניהול סטייט ב-React 19 עם Server Actions...'
                : action === 'optimize' ? 'לדוגמה: מצא זליגות זיכרון, שפר ביצועי רינדור והפוך את הפונקציות לנקיות יותר...'
                : action === 'explain' ? 'לדוגמה: הסבר את ארכיטקטורת Microfrontends ומתי להשתמש בה...'
                : action === 'tech-interview' ? 'לדוגמה: ראיון Fullstack - שאל אותי על React hooks, Node.js ו-SQL...'
                : 'לדוגמה: בעיה: שרת PostgreSQL מתנעל בשיאי עומס; רמז: עדיפות queries'
              }
              className="form-input min-h-30 resize-none mb-4"
              required
            />

            {(action === 'optimize' || action === 'explain') && (
              <div className="space-y-2 mt-4">
                <label className="text-xs font-semibold text-slate-400 block">הדבק את קוד המקור כאן (Context):</label>
                <textarea
                  value={codeContext}
                  onChange={(e) => setCodeContext(e.target.value)}
                  placeholder="// Paste your component, hook or functions here..."
                  className="form-input min-h-45 font-mono text-xs text-cyan-300 bg-slate-950/80 resize-none"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-white/5">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" /> DevHub AI Model v4.0
              </span>
              {loading ? (
                <button type="button" onClick={() => abortControllerRef.current?.abort()} className="px-5 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-sm hover:bg-rose-500/30 transition-all flex items-center gap-2 cursor-pointer">
                  <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" /> עצור
                </button>
              ) : (
                <button type="submit" disabled={!prompt.trim()} className="px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-40 disabled:hover:shadow-none transition-all duration-300 flex items-center gap-2 cursor-pointer">
                  <Send className="w-4 h-4" /> שגר ל-AI
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Presets — ללא שינוי */}
          <div className="glass-card section-card-md">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">קיצורי דרך מהירים</h4>
            <div className="space-y-2">
              <button type="button" onClick={() => { setAction('optimize'); setPrompt('תקן שגיאות אבטחה פוטנציאליות ובצע אופטימיזציית ביצועים קשיחה לקוד המצורף.'); }} className="w-full text-right text-xs text-slate-400 hover:text-cyan-300 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">🛠️ ניתוח אבטחה ואופטימיזציה</button>
              <button type="button" onClick={() => { setAction('draft'); setPrompt('כתוב פוסט טכנולוגי עמוק ומקיף על ארכיטקטורת Microfrontends באמצעות Module Federation.'); }} className="w-full text-right text-xs text-slate-400 hover:text-cyan-300 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">📝 Microfrontends ארכיטקטורה</button>
              <button type="button" onClick={() => { setAction('tech-interview'); setPrompt('ראיון Fullstack Developer — שאל אותי שאלות טכניות קשות על React, Node.js, Databases ו-Deployment.'); }} className="w-full text-right text-xs text-slate-400 hover:text-amber-300 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">🎤 ראיון Fullstack קשה</button>
              <button type="button" onClick={() => { setAction('create-challenge'); setPrompt('יצר אתגר קוד שבועי עבור הקהילה: בעיה אלגוריתמית מסובכת או דיזיין סיסטם עם טוויסט פעלתי.'); }} className="w-full text-right text-xs text-slate-400 hover:text-pink-300 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">🚀 אתגר קוד שבועי</button>
            </div>
          </div>
        </form>

        {/* RIGHT COLUMN: AI OUTPUT */}
        <div className="lg:col-span-7 space-y-4">

          {/* ✨ חדש: הודעת Rate Limit — מוצגת במקום שגיאה רגילה */}
          {rateLimitError && rateMsg && (
            <div className={`flex items-start gap-3 rounded-xl p-4 border ${rateMsg.border} ${rateMsg.bg}`}>
              {rateMsg.icon}
              <div>
                <p className={`text-sm font-bold ${rateMsg.titleColor}`}>{rateMsg.title}</p>
                <p className={`text-xs mt-1 ${rateMsg.textColor}`}>{rateMsg.text}</p>
              </div>
            </div>
          )}

          {/* שגיאה רגילה — ללא שינוי */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {successMessage}
            </div>
          )}

          {/* תיבת תוצאה — ללא שינוי */}
          <div className={`glass-card section-card-lg ${styles.containerWithGlow} relative overflow-hidden min-h-90 flex flex-col`}>
            <div className={styles.glowOverlay} />

            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-cyan-400 animate-ping' : result ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {loading ? 'AI Streaming...' : result ? 'AI Generated Response' : 'AI Engine Idle'}
                </span>
                {loading && result && (
                  <span className="text-xs text-slate-500 font-mono">{result.length} תווים</span>
                )}
              </div>

              {result && !loading && (
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
                  {action !== 'create-challenge' && categories.length > 0 && (
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg text-xs px-2 py-1 text-slate-300 outline-none focus:border-cyan-500">
                      {categories.map((cat) => (
                        <option key={cat._id || cat.id} value={cat._id || cat.id}>קטגוריה: {cat.name}</option>
                      ))}
                    </select>
                  )}

                  {action === 'tech-interview' && (
                    <div className="flex flex-row flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span className="whitespace-nowrap">שמור בתור:</span>
                      <button type="button" onClick={() => setPublishTarget('topic')} className={`px-2 py-1 rounded-lg ${publishTarget === 'topic' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                        נושא
                      </button>
                      <button type="button" onClick={() => setPublishTarget('article')} className={`px-2 py-1 rounded-lg ${publishTarget === 'article' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                        מאמר
                      </button>
                    </div>
                  )}

                  {action === 'create-challenge' && !isAdmin ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200 px-4 py-3 text-sm">
                      אתגר זה נשמר כטיוטה אישית ב-Workspace. רק מנהל יכול לפרסם אתגרים רשמיים בפורום.
                    </div>
                  ) : (
                    <button onClick={handlePublish} className="button-outline text-xs py-1 px-3 rounded-lg flex items-center gap-1 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10">
                      <Rocket className="w-3 h-3" />
                      {action === 'draft'
                        ? 'פרסם בפורום'
                        : action === 'create-challenge'
                          ? 'פרסם אתגר רשמי'
                          : action === 'tech-interview' && publishTarget === 'article'
                            ? 'שמור כמאמר'
                            : 'שמור בארכיון'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {result ? (
              <div className={`flex-1 overflow-y-auto max-h-125 pr-1 ${styles.resultMarkdown}`}>
                <Markdown>{result}</Markdown>
                {loading && (
                  <span style={{ display: 'inline-block', width: '2px', height: '1.1em', background: 'var(--accent-cyan, #00e5ff)', verticalAlign: 'text-bottom', marginRight: '2px', animation: 'blink 0.8s step-end infinite' }} />
                )}
              </div>
            ) : loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 py-12">
                <Zap className="w-8 h-8 text-cyan-500/40 animate-bounce" />
                <p className="text-sm">ה-Core של DevHub מעבד כעת את הנתונים...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500 py-12 text-center">
                <Bot className="w-10 h-10 text-slate-700 mb-1" />
                <h3 className="text-sm font-bold text-slate-400">הטרמינל ריק</h3>
                <p className="text-xs max-w-xs px-4 text-slate-500">הזן הנחיה או קוד בטופס משמאל ולחץ "שגר ל-AI" כדי לראות פתרונות, ניתוחים וארכיטקטורות קוד כאן.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}