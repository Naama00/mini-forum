import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authFetch from '../../services/api';
import { Loading } from '../common/Loading';

// Extract real title from Markdown content; prefer the first H1 header if present
const getRealTitle = (content) => {
  if (!content) return null;
  const headings = [...content.matchAll(/^\s*(#{1,6})\s*(.+)$/gm)];
  if (headings.length === 0) return null;
  const firstH1 = headings.find(([, hashes]) => hashes.length === 1);
  if (firstH1) return firstH1[2].trim();
  return headings[0][2].trim();
};

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadChallenges() {
      setLoading(true);
      setError('');

      try {
        const response = await authFetch.get('/topics?tag=challenge&limit=50');
        if (!response.success) {
          throw new Error(response.message || 'נכשל בטעינת אתגרים');
        }
        setChallenges(response.data || []);
      } catch (err) {
        setError(err.message || 'שגיאה בטעינת אתגרים');
      } finally {
        setLoading(false);
      }
    }

    loadChallenges();
  }, []);

  return (
    <section className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">אתגרי קהילה</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            אתגרי קוד רשמיים מהפורום. ניתן לפנות לעמוד זה כדי לראות אתגרים שפורסמו על ידי מנהלים.
          </p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">
          {error}
        </div>
      ) : challenges.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-6 text-slate-300">
          עדיין לא פורסמו אתגרי קהילה.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {challenges.map((topic) => {
            const challengeTitle = getRealTitle(topic.posts?.[0]?.content) || topic.title || 'אתגר';
            const replyCount = Math.max((topic.postsCount ?? (topic.posts?.length || 1)) - 1, 0);

            return (
              <Link key={topic._id || topic.id} to={`/challenges/${topic._id || topic.id}`}>
                <article className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/20 hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all cursor-pointer h-full">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white leading-tight hover:text-cyan-300 transition-colors">
                        {challengeTitle}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">{replyCount} תגובות</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-300 whitespace-nowrap">
                      אתגר
                    </span>
                  </div>

                <div className="mt-4 text-xs text-slate-400 space-y-2">
                  <div>
                    <span className="font-semibold text-slate-200">קטגוריה:</span>{' '}
                    {topic.category?.name || 'כללי'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">פורסם על ידי:</span>{' '}
                    {topic.author?.firstName || 'משתמש'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">נוצר ב:</span>{' '}
                    {new Date(topic.createdAt).toLocaleDateString('he-IL')}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(topic.tags || []).map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[.18em] text-slate-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            </Link>
          )})}
        </div>
      )}
    </section>
  );
}

