import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Calendar, User, Tag } from 'lucide-react';
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from '../MarkdownRenderer';
import { useAuth } from '../../hooks';
import { timeAgo } from '../../utils/formatters';

const API = 'http://localhost:5000/api';

export default function ChallengePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract real title from Markdown content; prefer the first H1 header if present
  const getRealTitle = (content) => {
    if (!content) return null;
    const headings = [...content.matchAll(/^\s*(#{1,6})\s*(.+)$/gm)];
    if (headings.length === 0) return null;
    const firstH1 = headings.find(([, hashes]) => hashes.length === 1);
    if (firstH1) return firstH1[2].trim();
    return headings[0][2].trim();
  };

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const r = await fetch(`${API}/topics/${id}`);
        if (!r.ok) throw new Error('נכשל בטעינת האתגר');
        const res = await r.json();
        const data = res.data ? res.data : res;
        
        // וודא שזה אתגר
        if (!data.tags?.includes('challenge')) {
          throw new Error('זה לא אתגר תקף');
        }
        
        setChallenge(data);
      } catch (err) {
        setError(err.message || 'שגיאת שרת');
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  const handleViewThread = () => {
    navigate(`/topic/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        טוען אתגר...
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="page-shell flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
          <p className="text-red-400 mb-6">{error || 'האתגר לא נמצא'}</p>
          <Link
            to="/challenges"
            className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold"
          >
            חזרה לאתגרים
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="page-shell">
      {/* Background */}
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Breadcrumb */}
        <div className="mb-10">
          <Breadcrumb
            items={[
              { label: 'אתגרים', to: '/challenges' },
              { label: challenge.title, active: true },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <div className="section-card section-card-md">
              <h3 className="text-sm font-bold text-white mb-4">פרטי האתגר</h3>
              <div className="space-y-3 text-sm">
                {/* Author */}
                <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
                  <User className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-500">פורסם על ידי</p>
                    <p className="text-slate-200 font-semibold">
                      {challenge.author?.firstName || 'משתמש'}
                    </p>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-400" />
                  <div>
                    <p className="text-xs text-slate-500">תאריך</p>
                    <p className="text-slate-200">
                      {challenge.createdAt ? timeAgo(challenge.createdAt) : 'לא ידוע'}
                    </p>
                  </div>
                </div>

                {/* Responses */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                  <MessageCircle className="w-4 h-4 text-pink-400" />
                  <div>
                    <p className="text-xs text-slate-500">תשובות</p>
                    <p className="text-slate-200 font-semibold">
                      {Math.max((challenge.posts?.length || 1) - 1, 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* View Thread Button */}
              <button
                onClick={handleViewThread}
                className="button-primary w-full text-center mt-5 block no-underline"
              >
                הצג שרשור 💬
              </button>

              <Link
                to="/challenges"
                className="button-secondary w-full text-center mt-3 block"
              >
                חזרה לאתגרים
              </Link>
            </div>

            {/* Tags */}
            {challenge.tags?.length > 0 && (
              <div className="section-card section-card-md">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  תגיות
                </h3>
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-300 border border-cyan-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Challenge Title Card */}
            <div className="section-card section-card-lg">
              <div className="mb-6 border-b border-slate-700 pb-6">
                <h1 className="text-3xl font-black text-white mb-3">
                  {getRealTitle(challenge.posts?.[0]?.content) || challenge.title}
                </h1>
                <p className="text-sm text-slate-400">
                  קטגוריה: {challenge.category?.name || 'כללי'}
                </p>
              </div>
            </div>

            {/* Challenge Content - Full Display */}
            <div className="section-card section-card-lg">
              <div className="prose-invert max-w-none overflow-visible">
                {challenge.posts?.[0]?.content ? (
                  <MarkdownRenderer source={challenge.posts[0].content.replace(/^#+\s+.+?\n/m, '')} />
                ) : challenge.content ? (
                  <MarkdownRenderer source={challenge.content.replace(/^#+\s+.+?\n/m, '')} />
                ) : (
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ לא נמצא תוכן עבור אתגר זה.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Call to Action */}
            <div className="section-card section-card-md bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
              <p className="text-sm text-slate-300 mb-6">
                רוצה להשתתף בפתרון האתגר? לחץ על הכפתור להצגת השרשור המלא עם כל התגובות!
              </p>
              <button
                onClick={handleViewThread}
                className="button-primary w-full"
              >
                הצג שרשור ודיון 💬
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
