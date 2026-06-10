import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, User, Calendar, Plus, Trash2, Heart, Pencil, X, Check } from 'lucide-react';
import Loading from '../common/Loading';
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from '../MarkdownRenderer';
import PostSummary from './PostSummary';
import { useAuth } from '../../hooks';
import { getToken } from '../../utils/storage';
import { timeAgo } from '../../utils/formatters';
import { uploadImage } from '../../utils/upload';
const API = 'http://localhost:5000/api';

export default function TopicPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyUploading, setReplyUploading] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState(false);
  const replyFileRef = useRef(null);

  // ── Like state ────────────────────────────────────────────────────────────
  const [topicLikes, setTopicLikes] = useState(0);
  const [topicLiked, setTopicLiked] = useState(false);
  const [postLikes, setPostLikes] = useState({});

  // ── Edit/Delete post state ────────────────────────────────────────────────
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const r = await fetch(`${API}/topics/${id}`);
        if (!r.ok) throw new Error('נכשל בטעינת הנושא');
        const res = await r.json();
        const topicData = res.data ? res.data : res;

        setTopic(topicData);
        setPosts(topicData.posts || []);

        setTopicLikes(topicData.likes?.length || 0);
        const userId = user?._id || user?.id || user?.userId;
        setTopicLiked(
          topicData.likes?.some(id => id?.toString() === userId?.toString()) || false
        );

        const initialPostLikes = {};
        (topicData.posts || []).forEach(post => {
          initialPostLikes[post._id] = {
            count: post.likes?.length || 0,
            liked: post.likes?.some(id => id?.toString() === userId?.toString()) || false,
          };
        });
        setPostLikes(initialPostLikes);
      } catch (err) {
        setError(err.message || 'שגיאת שרת');
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  // ── Like על הנושא ─────────────────────────────────────────────────────────
  const handleTopicLike = async () => {
    const token = getToken();
    if (!token) return navigate('/auth');
    const wasLiked = topicLiked;
    setTopicLiked(!wasLiked);
    setTopicLikes(prev => wasLiked ? prev - 1 : prev + 1);
    try {
      const r = await fetch(`${API}/topics/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error();
    } catch {
      setTopicLiked(wasLiked);
      setTopicLikes(prev => wasLiked ? prev + 1 : prev - 1);
    }
  };

  // ── Like על תגובה ─────────────────────────────────────────────────────────
  const handlePostLike = async (postId) => {
    const token = getToken();
    if (!token) return navigate('/auth');
    const current = postLikes[postId] || { count: 0, liked: false };
    const wasLiked = current.liked;
    setPostLikes(prev => ({
      ...prev,
      [postId]: { count: wasLiked ? current.count - 1 : current.count + 1, liked: !wasLiked },
    }));
    try {
      const r = await fetch(`${API}/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error();
    } catch {
      setPostLikes(prev => ({ ...prev, [postId]: current }));
    }
  };

  // ── מחיקת תגובה ──────────────────────────────────────────────────────────
  const handleDeletePost = async (postId) => {
    if (!window.confirm('למחוק את התגובה?')) return;
    setDeletingPostId(postId);
    try {
      const token = getToken();
      const r = await fetch(`${API}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error('מחיקה נכשלה');
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.message || 'שגיאה במחיקה');
    } finally {
      setDeletingPostId(null);
    }
  };

  // ── עריכת תגובה ──────────────────────────────────────────────────────────
  const handleStartEdit = (post) => {
    setEditingPostId(post._id);
    setEditingText(post.content || '');
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (postId) => {
    if (!editingText.trim()) return;
    setSavingEdit(true);
    try {
      const token = getToken();
      const r = await fetch(`${API}/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editingText }),
      });
      if (!r.ok) throw new Error('עריכה נכשלה');
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, content: editingText } : p));
      setEditingPostId(null);
      setEditingText('');
    } catch (err) {
      alert(err.message || 'שגיאה בעריכה');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTopic = async () => {
    const currentCategoryId = topic?.category?._id || topic?.category?.id || topic?.categoryId;
    if (!window.confirm('האם את/ה בטוח/ה שברצונך למחוק את הנושא? פעולה זו בלתי הפיכה.')) return;
    setDeletingTopic(true);
    try {
      const token = getToken();
      const r = await fetch(`${API}/topics/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error('מחיקה נכשלה');
      const res = await r.json();
      if (res.success || r.ok) {
        if (currentCategoryId) navigate(`/category?categoryId=${currentCategoryId}`);
        else navigate('/');
      } else {
        throw new Error(res.message || 'מחיקת הנושא נכשלה');
      }
    } catch (err) {
      alert(err.message || 'שגיאה במחיקת הנושא');
    } finally {
      setDeletingTopic(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const token = getToken();
      const r = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: replyText, topicId: id }),
      });
      if (r.ok) {
        const res = await r.json();
        const newPost = res.data ? res.data : res;
        setPosts(prev => [...prev, newPost]);
        setPostLikes(prev => ({ ...prev, [newPost._id]: { count: 0, liked: false } }));
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

  if (loading) return <Loading text="טוען דיון..." />;

  if (error || !topic) {
    return (
      <div className="page-shell flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
          <p className="text-red-400 mb-6">{error || 'הנושא לא נמצא'}</p>
          <Link to="/" className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold">
            חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    );
  }

  const isChallenge = topic.tags?.includes('challenge');
  const isAuthor = topic.author?._id === user?._id || topic.author === user?._id;
  const userId = user?._id || user?.id || user?.userId;

  return (
    <div dir="rtl" className="page-shell">
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
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
            <div className="section-card section-card-md">
              <h3 className="text-sm font-bold text-white mb-4">פרטי הנושא</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
                  <User className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-500">מחבר</p>
                    <p className="text-slate-200 font-semibold">{topic.author?.firstName || 'משתמש'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-400" />
                  <div>
                    <p className="text-xs text-slate-500">תאריך</p>
                    <p className="text-slate-200">{topic.createdAt ? timeAgo(topic.createdAt) : 'לא ידוע'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                  <MessageCircle className="w-4 h-4 text-pink-400" />
                  <div>
                    <p className="text-xs text-slate-500">תגובות</p>
                    <p className="text-slate-200 font-semibold">{Math.max(0, posts.length - 1)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <div>
                      <p className="text-xs text-slate-500">לייקים</p>
                      <p className="text-slate-200 font-semibold">{topicLikes}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleTopicLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                      topicLiked
                        ? 'border-rose-500/50 bg-rose-500/15 text-rose-400'
                        : 'border-slate-700 text-slate-400 hover:border-rose-500/40 hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${topicLiked ? 'fill-rose-400' : ''}`} />
                    {topicLiked ? 'אהבתי' : 'לייק'}
                  </button>
                </div>
              </div>

              {isAuthor && (
                <Link to={`/edit-topic/${id}`} className="button-primary w-full text-center mt-5 block no-underline">
                  ערוך נושא
                </Link>
              )}
              {(isAuthor || user?.isAdmin) && (
                <button
                  onClick={handleDeleteTopic}
                  disabled={deletingTopic}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingTopic ? 'מוחק...' : 'מחק נושא'}
                </button>
              )}
              <Link to={`/category?categoryId=${topic.category?._id || topic.categoryId || ''}`} className="button-secondary w-full text-center mt-3 block">
                חזרה
              </Link>
            </div>

            {topic.tags?.length > 0 && (
              <div className="section-card section-card-md">
                <h3 className="text-sm font-bold text-white mb-4">תגיות</h3>
                <div className="flex flex-wrap gap-2">
                  {topic.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-300 border border-cyan-500/20">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
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
                <p className="text-sm text-slate-400">קטגוריה: {topic.category?.name || 'כללי'}</p>
              </div>

              {posts.length > 0 && (
                <div className="prose-invert max-w-none">
                  {posts[0].imageUrl && (
                    <img src={posts[0].imageUrl} alt="תמונה מצורפת" className="w-full max-h-96 object-cover rounded-2xl mb-6" />
                  )}
                  <MarkdownRenderer source={posts[0].content || ''} />
                </div>
              )}

              {posts.length >= 2 && (
                <PostSummary
                  title={topic.title}
                  content={posts[0]?.content || ''}
                  comments={posts.slice(1).map((p) => p.content || '')}
                />
              )}
            </div>

            {/* Replies */}
            {posts.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">תגובות ({posts.length - 1})</h3>
                {posts.slice(1).map((post, idx) => {
                  const likesData = postLikes[post._id] || { count: 0, liked: false };
                  const postAuthorId = post.author?._id?.toString() || post.author?.id?.toString() || post.author?.toString();
                  const isPostAuthor = postAuthorId === userId?.toString();
                  const canDelete = isPostAuthor || user?.isAdmin;
                  const isEditing = editingPostId === post._id;

                  return (
                    <div key={idx} className="section-card section-card-md">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 text-sm font-bold">
                            {post.author?.firstName?.[0] || 'M'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{post.author?.firstName || 'משתמש'}</p>
                            <p className="text-xs text-slate-500">{timeAgo(post.createdAt)}</p>
                          </div>
                        </div>

                        {/* ── כפתורי עריכה/מחיקה ────────────────────────── */}
                        {(isPostAuthor || canDelete) && !isEditing && (
                          <div className="flex items-center gap-2">
                            {isPostAuthor && (
                              <button
                                onClick={() => handleStartEdit(post)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-400 transition-all text-xs"
                                title="ערוך תגובה"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                ערוך
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeletePost(post._id)}
                                disabled={deletingPostId === post._id}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-xs disabled:opacity-50"
                                title="מחק תגובה"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {deletingPostId === post._id ? '...' : 'מחק'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* תוכן — מצב עריכה או תצוגה */}
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="form-input min-h-[100px] w-full text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 transition-all text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                              ביטול
                            </button>
                            <button
                              onClick={() => handleSaveEdit(post._id)}
                              disabled={savingEdit}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-all text-xs disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {savingEdit ? 'שומר...' : 'שמור'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="prose-invert max-w-none text-sm">
                          <MarkdownRenderer source={post.content || ''} />
                        </div>
                      )}

                      {/* Like */}
                      {!isEditing && (
                        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                          <button
                            onClick={() => handlePostLike(post._id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                              likesData.liked
                                ? 'border-rose-500/50 bg-rose-500/15 text-rose-400'
                                : 'border-slate-700 text-slate-400 hover:border-rose-500/40 hover:text-rose-400'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${likesData.liked ? 'fill-rose-400' : ''}`} />
                            <span>{likesData.count > 0 ? likesData.count : ''}</span>
                            {likesData.liked ? 'אהבתי' : 'לייק'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reply Form */}
            {user ? (
              <form onSubmit={handleReplySubmit} className="section-card section-card-md">
                <h3 className="text-sm font-bold text-white mb-4">הוסף תגובה</h3>
                <div className="mb-3">
                  <input
                    ref={replyFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setReplyUploading(true);
                      try {
                        const url = await uploadImage(file);
                        setReplyText((p) => p + `\n![תמונה](${url})\n`);
                      } catch (err) {
                        alert(err.message || 'Error uploading image');
                      } finally {
                        setReplyUploading(false);
                        if (replyFileRef.current) replyFileRef.current.value = '';
                      }
                    }}
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => replyFileRef.current?.click()}
                      disabled={replyUploading}
                      className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-300"
                    >
                      <Plus className="w-4 h-4" />
                      {replyUploading ? 'מעלה...' : 'הוסף תמונה'}
                    </button>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="כתוב את התגובה שלך כאן..."
                    className="form-input min-h-[120px] mb-2"
                    required
                  />
                </div>
                <button type="submit" disabled={submittingReply} className="button-primary w-full md:w-auto">
                  {submittingReply ? 'שולח...' : 'שלח תגובה'}
                </button>
              </form>
            ) : (
              <div className="glass-card glass-card-lg text-center">
                <p className="text-slate-400 mb-5">עליך להתחבר כדי להגיב.</p>
                <Link to="/auth" className="button-primary">התחברות</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}