// frontend/src/components/Topic/PostSummary.jsx
import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertTriangle, Clock } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import { getToken } from '../../utils/storage';

const API = 'http://localhost:5000/api';

// ── הודעות שגיאה לפי סוג ה-rate limit ───────────────────────────────────────
const RATE_LIMIT_MESSAGES = {
  rate_limit_minute: {
    icon: <Clock className="w-5 h-5 text-amber-400 shrink-0" />,
    title: 'המתן רגע',
    text: 'ניסית יותר מדי פעמים בדקה האחרונה. המתן מעט ונסה שנית.',
    color: 'amber',
  },
  rate_limit_day: {
    icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
    title: 'המכסה היומית נגמרה',
    text: 'הגעת למכסת בקשות ה-AI היומית שלך. המכסה מתאפסת בחצות — חזור מחר!',
    color: 'rose',
  },
};

export default function PostSummary({ title, content, comments }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(null); // null | 'rate_limit_minute' | 'rate_limit_day'
  const [genericError, setGenericError] = useState('');

  const handleSummarize = async () => {
    // אם כבר יש סיכום — פשוט פותח/סוגר
    if (summary) {
      setOpen((prev) => !prev);
      return;
    }

    setLoading(true);
    setRateLimitError(null);
    setGenericError('');

    try {
      const token = getToken();
      const res = await fetch(`${API}/gemini/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, comments }),
      });

      const data = await res.json();

      // ── טיפול בשגיאות rate limit ─────────────────────────────────────────
      if (res.status === 429) {
        setRateLimitError(data.error); // 'rate_limit_minute' | 'rate_limit_day'
        return;
      }

      if (!res.ok) {
        setGenericError(data.error || 'שגיאה בסיכום הפוסט.');
        return;
      }

      setSummary(data.text);
      setOpen(true);
    } catch {
      setGenericError('שגיאת חיבור לשרת. נסה שנית.');
    } finally {
      setLoading(false);
    }
  };

  const rateMsg = RATE_LIMIT_MESSAGES[rateLimitError];

  return (
    <div className="mt-6">
      {/* ── כפתור ראשי ───────────────────────────────────────────────────── */}
      <button
        onClick={handleSummarize}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                   bg-gradient-to-r from-cyan-500/10 to-violet-500/10
                   border border-cyan-500/20 hover:border-cyan-400/50
                   text-cyan-300 hover:text-cyan-200 text-sm font-semibold
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? 'מסכם...' : summary ? (open ? 'הסתר סיכום' : 'הצג סיכום') : '✨ סכם שיחה זו'}
        {summary && !loading && (
          open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* ── הודעת Rate Limit יפה ─────────────────────────────────────────── */}
      {rateLimitError && rateMsg && (
        <div
          className={`mt-4 flex items-start gap-3 rounded-xl p-4
                      border border-${rateMsg.color}-500/20
                      bg-${rateMsg.color}-500/5`}
        >
          {rateMsg.icon}
          <div>
            <p className={`text-sm font-bold text-${rateMsg.color}-300`}>{rateMsg.title}</p>
            <p className={`text-xs text-${rateMsg.color}-400/80 mt-1`}>{rateMsg.text}</p>
          </div>
        </div>
      )}

      {/* ── שגיאה כללית ─────────────────────────────────────────────────── */}
      {genericError && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{genericError}</p>
        </div>
      )}

      {/* ── תיבת הסיכום ─────────────────────────────────────────────────── */}
      {summary && open && (
        <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6
                        animate-fade-in">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              סיכום AI
            </span>
          </div>
          <div className="prose-invert max-w-none text-sm">
            <MarkdownRenderer source={summary} />
          </div>
        </div>
      )}
    </div>
  );
}
