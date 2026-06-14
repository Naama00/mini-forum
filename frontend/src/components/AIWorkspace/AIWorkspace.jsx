import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles, Zap, Bot, Send, Wand2, Code2, FileText,
  Rocket, Trash2, Cpu, Clock, AlertTriangle, Plus,
} from 'lucide-react';
import styles from './AIWorkspace.module.css';
import { uploadImage } from '../../utils/upload';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const RATE_LIMIT_MESSAGES = {
  rate_limit_minute: {
    icon: <Clock className="w-5 h-5 text-amber-400 shrink-0" />,
    title: 'המתן רגע',
    text: 'ניסית יותר מדי פעמים בדקה האחרונה. המתן מעט ונסה שנית.',
    border: 'border-amber-500/20', bg: 'bg-amber-500/5',
    titleColor: 'text-amber-300', textColor: 'text-amber-400/80',
  },
  rate_limit_day: {
    icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
    title: 'המכסה היומית נגמרה',
    text: 'הגעת למכסת בקשות ה-AI היומית שלך. המכסה מתאפסת בחצות — חזור מחר!',
    border: 'border-rose-500/20', bg: 'bg-rose-500/5',
    titleColor: 'text-rose-300', textColor: 'text-rose-400/80',
  },
};

const ACTIONS = [
  { id: 'draft',            label: 'טיוטת פוסט',   icon: FileText, color: 'text-amber-400' },
  { id: 'optimize',         label: 'קוד אופטימלי',  icon: Code2,    color: 'text-pink-400'  },
  { id: 'explain',          label: 'ארכיטקטורה',    icon: Wand2,    color: 'text-violet-400'},
  { id: 'tech-interview',   label: 'ראיון טק',       icon: Zap,      color: 'text-amber-400' },
  { id: 'create-challenge', label: 'אתגר קוד',       icon: Rocket,   color: 'text-pink-400'  },
];

const PROMPT_LABEL = {
  draft:            'על מה תרצה שהפוסט ידבר?',
  optimize:         'הנחיות מיוחדות לאופטימיזציה',
  explain:          'מה תרצה שננתח ונבין בקוד?',
  'tech-interview': 'לאיזה משרה / תפקיד תרצה להתכונן?',
  'create-challenge':'אתגר קוד — לאילו תחומים?',
};

const PROMPT_PLACEHOLDER = {
  draft:            'לדוגמה: כתוב מדריך מעמיק על ניהול סטייט ב-React 19 עם Server Actions...',
  optimize:         'לדוגמה: מצא זליגות זיכרון, שפר ביצועי רינדור והפוך את הפונקציות לנקיות יותר...',
  explain:          'לדוגמה: הסבר את ארכיטקטורת Microfrontends ומתי להשתמש בה...',
  'tech-interview': 'לדוגמה: ראיון Fullstack - שאל אותי על React hooks, Node.js ו-SQL...',
  'create-challenge':'לדוגמה: בעיה: שרת PostgreSQL מתנעל בשיאי עומס; רמז: עדיפות queries',
};

export default function AIWorkspace({ currentUser, categories = [], onAddTopic, onAddArticle, onNavigate }) {
  const [action, setAction]               = useState(() => localStorage.getItem('devhub_workspace_action') || 'draft');
  const [prompt, setPrompt]               = useState(() => localStorage.getItem('devhub_workspace_prompt') || '');
  const [codeContext, setCodeContext]     = useState(() => localStorage.getItem('devhub_workspace_code_context') || '');
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(() => localStorage.getItem('devhub_workspace_result') || '');
  const [error, setError]                 = useState('');
  const [rateLimitError, setRateLimitError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [publishTarget, setPublishTarget] = useState('topic');
  const [successMessage, setSuccessMessage] = useState('');
  const [aiImageUrl, setAiImageUrl]       = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fileToSend, setFileToSend]       = useState(null);
  const [previewUrl, setPreviewUrl]       = useState(null);

  const abortControllerRef = useRef(null);
  const workspaceRef        = useRef(null);
  const fileRef             = useRef(null);

  useEffect(() => { localStorage.setItem('devhub_workspace_action', action); }, [action]);
  useEffect(() => { localStorage.setItem('devhub_workspace_prompt', prompt); }, [prompt]);
  useEffect(() => { localStorage.setItem('devhub_workspace_code_context', codeContext); }, [codeContext]);
  useEffect(() => { localStorage.setItem('devhub_workspace_result', result); }, [result]);
  useEffect(() => { if (categories.length > 0 && !selectedCategory) setSelectedCategory(categories[0]._id || categories[0].id || ''); }, [categories, selectedCategory]);
  useEffect(() => { setPublishTarget(action === 'optimize' || action === 'explain' ? 'article' : 'topic'); }, [action]);
  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const handleMouseMove = (e) => {
    if (!workspaceRef.current) return;
    workspaceRef.current.querySelectorAll(`.${styles.containerWithGlow}`).forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();
    setPrompt(''); setCodeContext(''); setResult(''); setError('');
    setRateLimitError(null); setSuccessMessage(''); setFileToSend(null);
    setAiImageUrl(null); setPreviewUrl(null);
    localStorage.removeItem('devhub_workspace_prompt');
    localStorage.removeItem('devhub_workspace_code_context');
    localStorage.removeItem('devhub_workspace_result');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    setLoading(true); setError(''); setRateLimitError(null); setSuccessMessage(''); setResult('');
    let uploadedImageUrl = null;

    try {
      let endpoint = `${API}/gemini/stream`;
      let fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ action, prompt, extraContext: action === 'optimize' || action === 'explain' ? codeContext : undefined }),
        signal: abortControllerRef.current.signal,
      };

      if (fileToSend) {
        const uploadForm = new FormData();
        uploadForm.append('image', fileToSend);
        const uploadRes  = await fetch(`${API}/gemini/upload-image`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: uploadForm });
        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.imageUrl;
        setAiImageUrl(uploadData.imageUrl);
        endpoint = `${API}/gemini/stream-with-image`;
        const formData = new FormData();
        formData.append('action', action); formData.append('prompt', prompt);
        if (action === 'optimize' || action === 'explain') formData.append('extraContext', codeContext);
        formData.append('image', fileToSend);
        fetchOptions = { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData, signal: abortControllerRef.current.signal };
      }

      const response = await fetch(endpoint, fetchOptions);
      if (response.status === 429) { const data = await response.json().catch(() => ({})); setRateLimitError(data.error || 'rate_limit_minute'); return; }
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'שגיאה בייצור התוכן מה-AI'); }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n'); buffer = parts.pop();
        for (const part of parts) {
          const lines = part.split('\n'); let eventType = 'message', dataLine = '';
          for (const line of lines) { if (line.startsWith('event: ')) eventType = line.slice(7).trim(); if (line.startsWith('data: ')) dataLine = line.slice(6).trim(); }
          if (!dataLine) continue;
          let parsed; try { parsed = JSON.parse(dataLine); } catch { continue; }
          if (eventType === 'chunk' && parsed.text) setResult((prev) => prev + parsed.text);
          if (eventType === 'error') throw new Error(parsed.message || 'שגיאה בזרם ה-AI');
        }
      }
      if (uploadedImageUrl) setResult((prev) => `![תמונה](${uploadedImageUrl})\n\n` + prev);
      setFileToSend(null);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'חיבור לשרת ה-AI נכשל. ודא שהשרת רץ.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.isAdmin;
  const rateMsg = RATE_LIMIT_MESSAGES[rateLimitError];

  const handlePublish = async () => {
    if (!result) return;
    setError(''); setSuccessMessage('');
    try {
      let title = prompt.slice(0, 50); if (title.length >= 50) title += '...';
      if (action === 'create-challenge' && !isAdmin) { setSuccessMessage('האתגר נשאר בארגז הכלים הפרטי שלך. רק מנהל יכול לפרסם אתגרים רשמיים.'); return; }
      const isTopicPublish = action === 'draft' || action === 'create-challenge' || (action === 'tech-interview' && publishTarget === 'topic');
      const sharedImageUrl   = aiImageUrl || undefined;
      const contentWithImage = sharedImageUrl ? `![תמונה](${sharedImageUrl})\n\n${result}` : result;
      if (isTopicPublish) {
        if (!onAddTopic) throw new Error('פונקציית פרסום פוסט לא זמינה');
        const tags = action === 'create-challenge' ? ['challenge'] : action === 'tech-interview' ? ['interview'] : [];
        const type = action === 'create-challenge' ? 'challenge' : action === 'tech-interview' ? 'interview' : 'question';
        await onAddTopic({ title, content: contentWithImage, categoryId: selectedCategory, tags, type });
        setSuccessMessage(action === 'create-challenge' ? 'האתגר פורסם!' : action === 'tech-interview' ? 'הראיון פורסם כנושא!' : 'הטיוטה פורסמה בהצלחה!');
      } else {
        if (!onAddArticle) throw new Error('פונקציית שמירת מאמר לא זמינה');
        await onAddArticle({ title: `ניתוח AI: ${title}`, content: contentWithImage, tags: [action], categoryId: selectedCategory });
        setSuccessMessage('הניתוח נשמר בארכיון!');
      }
      setAiImageUrl(null); setPreviewUrl(null);
    } catch (err) { setError(err.message || 'הפרסום נכשל'); }
  };

  return (
    <div ref={workspaceRef} onMouseMove={handleMouseMove} className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
        {/* רקע גלואי */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr] items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-cyan-400/70 font-bold">
              <Sparkles className={`w-3.5 h-3.5 ${styles.pulseIcon}`} />
              DevHub AI Workspace
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
              הפעל את ה-AI שלך כדי{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                ליצור, לחדד ולפרסם
              </span>{' '}
              תוכן טכנולוגי במהירות.
            </h1>
            <p className="text-slate-400 leading-7 max-w-xl text-sm">
              בחר סגנון עבודה, הזן הנחיה ותן למנוע לכתוב עבורך קוד, הסברים, מאמרים ואתגרים.
              כל מסך בנוי להיות נקי, מזמין ועם זרימת עבודה ברורה.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { title: 'טיפ מהיר', text: 'החלף בין מצבי הפעולה כדי לשנות את הזרימה ולהתאים את התוצאה לסוג התוכן.' },
              { title: 'שדה Prompt', text: 'כתוב כאן את הרעיון או הקוד — התוצאה תופיע מיידית עם חוויית קריאה נוחה.' },
            ].map(({ title, text }) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-400 leading-relaxed backdrop-blur-sm">
                <strong className="text-slate-200 font-semibold">{title}: </strong>{text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className={styles.tabsWrap}>
        {ACTIONS.map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => setAction(id)} className={`${styles.actionButton} ${action === id ? styles.actionButtonActive : ''}`}>
            <Icon className={`w-4 h-4 ${color}`} /> {label}
          </button>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT: INPUT ── */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 flex flex-col gap-4">

          {/* Input card */}
          <div className={`relative overflow-hidden rounded-2xl border border-white/8 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl shadow-black/20 ${styles.containerWithGlow}`}>
            <div className={styles.glowOverlay} />
            <div className="relative z-10 flex flex-col gap-4">

              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  {PROMPT_LABEL[action]}
                </label>
                <button type="button" onClick={handleClear} title="נקה הכל"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Image upload */}
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  setFileToSend(file); setPreviewUrl(URL.createObjectURL(file));
                  setPrompt((p) => p + `\n[תמונה: ${file.name}]\n`);
                  if (fileRef.current) fileRef.current.value = '';
                }} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImage}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 rounded-lg px-3 py-1.5 transition-all">
                  <Plus className="w-3.5 h-3.5" />
                  {fileToSend ? `✓ ${fileToSend.name}` : 'הוסף תמונה'}
                </button>
                {fileToSend && (
                  <button type="button" onClick={() => setFileToSend(null)}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors">(הסר)</button>
                )}
              </div>

              {previewUrl && (
                <img src={previewUrl} alt="תצוגה מקדימה"
                  className="max-h-32 rounded-xl border border-white/10 object-contain" />
              )}

              <textarea
                value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder={PROMPT_PLACEHOLDER[action]}
                className="w-full min-h-[120px] resize-none rounded-xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                required
              />

              {(action === 'optimize' || action === 'explain') && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">קוד מקור (Context):</label>
                  <textarea
                    value={codeContext} onChange={(e) => setCodeContext(e.target.value)}
                    placeholder="// הדבק כאן את הקומפוננטה, הוק או הפונקציות..."
                    className="w-full min-h-[180px] resize-none rounded-xl border border-white/8 bg-slate-950/80 px-4 py-3 font-mono text-xs text-cyan-300 placeholder-slate-700 outline-none focus:border-violet-500/40 transition-all"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[11px] text-slate-600 font-mono flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> DevHub AI v4.0
                </span>
                {loading ? (
                  <button type="button" onClick={() => abortControllerRef.current?.abort()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 text-sm font-bold hover:bg-rose-500/25 transition-all">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block animate-pulse" /> עצור
                  </button>
                ) : (
                  <button type="submit" disabled={!prompt.trim()} className={styles.submitBtn}>
                    <Send className="w-4 h-4" /> שגר ל-AI
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-5 backdrop-blur-xl">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">קיצורי דרך מהירים</h4>
            <div className="flex flex-col gap-1">
              {[
                { action: 'optimize', prompt: 'תקן שגיאות אבטחה פוטנציאליות ובצע אופטימיזציה לקוד המצורף.', emoji: '🛠️', label: 'ניתוח אבטחה ואופטימיזציה', hover: 'hover:text-cyan-300' },
                { action: 'draft',    prompt: 'כתוב פוסט טכנולוגי עמוק על ארכיטקטורת Microfrontends.', emoji: '📝', label: 'Microfrontends ארכיטקטורה', hover: 'hover:text-violet-300' },
                { action: 'tech-interview', prompt: 'ראיון Fullstack Developer — שאל אותי שאלות קשות על React, Node.js ו-Databases.', emoji: '🎤', label: 'ראיון Fullstack קשה', hover: 'hover:text-amber-300' },
                { action: 'create-challenge', prompt: 'יצר אתגר קוד שבועי עבור הקהילה: בעיה אלגוריתמית מסובכת.', emoji: '🚀', label: 'אתגר קוד שבועי', hover: 'hover:text-pink-300' },
              ].map(({ action: a, prompt: p, emoji, label, hover }) => (
                <button key={label} type="button"
                  onClick={() => { setAction(a); setPrompt(p); }}
                  className={`w-full text-right text-xs text-slate-500 ${hover} px-3 py-2.5 rounded-xl hover:bg-white/4 border border-transparent hover:border-white/8 transition-all`}>
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* ── RIGHT: OUTPUT ── */}
        <div className="lg:col-span-7 flex flex-col gap-4">

          {/* Rate limit */}
          {rateLimitError && rateMsg && (
            <div className={`flex items-start gap-3 rounded-xl p-4 border ${rateMsg.border} ${rateMsg.bg}`}>
              {rateMsg.icon}
              <div>
                <p className={`text-sm font-bold ${rateMsg.titleColor}`}>{rateMsg.title}</p>
                <p className={`text-xs mt-1 ${rateMsg.textColor}`}>{rateMsg.text}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" /> {error}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> {successMessage}
            </div>
          )}

          {/* Terminal output card */}
          <div className={`relative overflow-hidden rounded-2xl border border-white/8 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl shadow-black/20 min-h-[420px] flex flex-col ${styles.containerWithGlow} ${styles.terminalCard} ${loading ? styles.terminalCardActive : ''}`}>
            <div className={styles.glowOverlay} />

            {/* Terminal header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/60" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-cyan-400 animate-ping' : result ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  {loading ? 'AI Streaming...' : result ? 'AI Generated Response' : 'AI Engine Idle'}
                </span>
                {loading && result && (
                  <span className="text-[10px] text-slate-600 font-mono">{result.length} תווים</span>
                )}
              </div>

              {result && !loading && (
                <div className="flex flex-wrap items-center gap-2">
                  {action !== 'create-challenge' && categories.length > 0 && (
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-slate-800 border border-white/10 rounded-lg text-xs px-2 py-1.5 text-slate-300 outline-none focus:border-cyan-500">
                      {categories.map((cat) => (
                        <option key={cat._id || cat.id} value={cat._id || cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {action === 'tech-interview' && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>שמור כ:</span>
                      {['topic', 'article'].map((t) => (
                        <button key={t} type="button" onClick={() => setPublishTarget(t)}
                          className={`px-2.5 py-1 rounded-lg transition-all ${publishTarget === t ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}>
                          {t === 'topic' ? 'נושא' : 'מאמר'}
                        </button>
                      ))}
                    </div>
                  )}

                  {action === 'create-challenge' && !isAdmin ? (
                    <span className="text-xs text-amber-400/80 border border-amber-500/20 bg-amber-500/5 rounded-lg px-3 py-1.5">
                      רק מנהל יכול לפרסם אתגרים
                    </span>
                  ) : (
                    <button onClick={handlePublish}
                      className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 border border-cyan-500/25 bg-cyan-500/8 hover:bg-cyan-500/15 hover:border-cyan-500/40 rounded-lg px-3 py-1.5 transition-all">
                      <Rocket className="w-3.5 h-3.5" />
                      {action === 'draft' ? 'פרסם בפורום'
                        : action === 'create-challenge' ? 'פרסם אתגר'
                        : action === 'tech-interview' && publishTarget === 'article' ? 'שמור כמאמר'
                        : 'שמור בארכיון'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="relative z-10 flex-1 flex flex-col">
              {result ? (
                <div className={`flex-1 overflow-y-auto max-h-[500px] pl-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent ${styles.resultMarkdown}`}>
                  <Markdown>{result}</Markdown>
                  {loading && <span className={styles.streamCursor} />}
                </div>
              ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                  <div className={styles.spinner} />
                  <p className={styles.spinnerLabel}>מעבד בקשה...</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Bot className={`w-12 h-12 text-slate-700 ${styles.pulseIcon}`} />
                  <h3 className="text-sm font-bold text-slate-500">הטרמינל ריק</h3>
                  <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                    הזן הנחיה או קוד בטופס משמאל ולחץ "שגר ל-AI" כדי לראות פתרונות, ניתוחים וארכיטקטורות קוד.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}