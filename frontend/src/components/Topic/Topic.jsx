import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, User, Calendar } from 'lucide-react';
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from '../MarkdownRenderer';
import PostSummary from './PostSummary'; 
import { useAuth } from '../../hooks';
import { getToken } from '../../utils/storage';
import { timeAgo } from '../../utils/formatters';

const API = 'http://localhost:5000/api';

export default function TopicPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const r = await fetch(`${API}/topics/${id}`);
        if (!r.ok) throw new Error('נכשל בטעינת הנושא');
        const res = await r.json();
        const topicData = res.data ? res.data : res;
        setTopic(topicData);
        setPosts(topicData.posts || []);
      } catch (err) {
        setError(err.message || 'שגיאת שרת');
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      const token = getToken();
      const r = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyText,
          topicId: id,
        }),
      });

      if (r.ok) {
        const res = await r.json();
        setPosts([...posts, res.data ? res.data : res]);
        setReplyText('');
      } else {
        throw new Error('נכשל בשליחת התגובה');
      }
    } catch (err) {
      alert(err.message || 'שגיאה');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        טוען דיון...
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="page-shell flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
          <p className="text-red-400 mb-6">{error || 'הנושא לא נמצא'}</p>
          <Link
            to="/"
            className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold"
          >
            חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    );
  }

  const isChallenge = topic.tags?.includes('challenge');
  const isAuthor = topic.author?._id === user?._id || topic.author === user?._id;

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
              isChallenge ? { label: 'אתגרים', to: '/challenges' } : { label: 'בית', to: '/' },
              { label: topic.title, active: true },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Topic Info */}
            <div className="section-card section-card-md">
              <h3 className="text-sm font-bold text-white mb-4">פרטי הנושא</h3>
              <div className="space-y-3 text-sm">
                {/* Author */}
                <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
                  <User className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-500">מחבר</p>
                    <p className="text-slate-200 font-semibold">
                      {topic.author?.firstName || 'משתמש'}
                    </p>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-400" />
                  <div>
                    <p className="text-xs text-slate-500">תאריך</p>
                    <p className="text-slate-200">
                      {topic.createdAt ? timeAgo(topic.createdAt) : 'לא ידוע'}
                    </p>
                  </div>
                </div>

                {/* Responses */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                  <MessageCircle className="w-4 h-4 text-pink-400" />
                  <div>
                    <p className="text-xs text-slate-500">תגובות</p>
                    <p className="text-slate-200 font-semibold">{posts.length}</p>
                  </div>
                </div>
              </div>

              {isAuthor && (
                <Link
                  to={`/edit-topic/${id}`}
                  className="button-primary w-full text-center mt-5 block no-underline"
                >
                  ערוך נושא
                </Link>
              )}

              <Link to="/" className="button-secondary w-full text-center mt-3 block">
                חזרה
              </Link>
            </div>

            {/* Tags */}
            {topic.tags?.length > 0 && (
              <div className="section-card section-card-md">
                <h3 className="text-sm font-bold text-white mb-4">תגיות</h3>
                <div className="flex flex-wrap gap-2">
                  {topic.tags.map((tag) => (
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
          <div className="lg:col-span-3 space-y-6">
            {/* Topic Title and Description */}
            <div className="section-card section-card-lg">
              <div className="mb-6 border-b border-slate-700 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-black text-white">{topic.title}</h1>
                  {isChallenge && (
                    <span className="inline-flex items-center rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase text-pink-300 border border-pink-500/20">
                      אתגר
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  קטגוריה: {topic.category?.name || 'כללי'}
                </p>
              </div>

              {/* First Post (Topic Description) */}
              {posts.length > 0 && (
                <div className="prose-invert max-w-none">
                  <MarkdownRenderer source={posts[0].content || ''} />
                </div>
              )}

              {/* ✨ כפתור סיכום AI — מופיע אם יש לפחות 2 פוסטים */}
            </div>

            {/* Replies */}
            {posts.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">תגובות ({posts.length - 1})</h3>
                {posts.slice(1).map((post, idx) => (
                  <div key={idx} className="section-card section-card-md">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-700">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 text-sm font-bold">
                        {post.author?.firstName?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">
                          {post.author?.firstName || 'משתמש'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {timeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="prose-invert max-w-none text-sm">
                      <MarkdownRenderer source={post.content || ''} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            {user ? (
              <form onSubmit={handleReplySubmit} className="section-card section-card-md">
                <h3 className="text-sm font-bold text-white mb-4">הוסף תגובה</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="כתוב את התגובה שלך כאן..."
                  className="form-input min-h-[120px] mb-4"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyText.trim()}
                  className="button-primary"
                >
                  {submittingReply ? 'שולח...' : 'שלח תגובה'}
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-center">
                <p className="text-sm text-slate-300 mb-4">
                  כדי להוסיף תגובה, עליך להתחבר תחילה.
                </p>
                <Link to="/auth" className="button-primary inline-block">
                  התחבר / הרשמה
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}