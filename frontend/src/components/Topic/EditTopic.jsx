import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus } from 'lucide-react';
import Breadcrumb from '../Breadcrumb';
import MarkdownEditor from '../Markdown/MarkdownEditor';
import { useAuth } from "../../hooks";
import { getToken } from "../../utils/storage";
import { uploadImage } from '../../utils/upload';
import Loading from '../common/Loading';

const API = 'http://localhost:5000/api';

export default function EditTopic() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const PRESET_TAGS = ['React', 'JavaScript', 'UI', 'Backend', 'Bug', 'Feature'];

  const [topic, setTopic] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  // טעינת הנושא הקיים
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const r = await fetch(`${API}/topics/${id}`);
        if (!r.ok) throw new Error('נכשל בטעינת הנושא');
        const res = await r.json();
        const topicData = res.data ? res.data : res;

        // בדיקת הרשאה — רק המחבר או אדמין
        const authorId = topicData.author?._id || topicData.author;
        if (user && authorId !== user._id && authorId !== user.id && !user.isAdmin) {
          navigate(`/topic/${id}`);
          return;
        }

        setTopic(topicData);
        setTitle(topicData.title || '');
        setTags(topicData.tags || []);

        // התוכן הוא הפוסט הראשון
        const firstPost = topicData.posts?.[0];
        setContent(firstPost?.content || topicData.content || '');
      } catch (err) {
        setError(err.message || 'שגיאת שרת');
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id, user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setContent((prev) => prev + `\n![תמונה](${url})\n`);
    } catch (err) {
      alert(err.message || 'שגיאה בהעלאת תמונה');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, '');
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags((prev) => [...prev, tag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const addPresetTag = (tag) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    try {
      const token = getToken();
      const parsedTags = tags;

      // עדכון כותרת ותגיות על הנושא
      const topicRes = await fetch(`${API}/topics/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, tags: parsedTags }),
      });

      if (!topicRes.ok) throw new Error('עדכון הנושא נכשל');

      // עדכון תוכן הפוסט הראשון
      const firstPostId = topic?.posts?.[0]?._id || topic?.posts?.[0]?.id;
      if (firstPostId) {
        const postRes = await fetch(`${API}/posts/${firstPostId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        });
        if (!postRes.ok) throw new Error('עדכון התוכן נכשל');
      }

      navigate(`/topic/${id}`);
    } catch (err) {
      alert(err.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──
  if (loading) return <Loading text="טוען..." />;

  // ── Error ──
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

  return (
    <div dir="rtl" className="page-shell">
      {/* Background */}
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Breadcrumb */}
        <div className="mb-10">
          <Breadcrumb
            items={[
              { label: 'בית', to: '/' },
              { label: topic.title, to: `/topic/${id}` },
              { label: 'עריכה', active: true },
            ]}
          />
        </div>

        <div className="section-card section-card-lg">
          <h1 className="text-3xl font-black text-white mb-8">עריכת נושא</h1>

          <form onSubmit={handleSave} className="space-y-6">
            {/* כותרת */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                כותרת
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input w-full"
                required
              />
            </div>

            {/* תוכן */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                תוכן
              </label>

              {/* כפתור העלאת תמונה */}
              <div className="flex items-center gap-2 mb-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {uploading ? 'מעלה...' : 'הוסף תמונה'}
                </button>
              </div>

              <MarkdownEditor value={content} onChange={setContent} />
            </div>

            {/* תגיות */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                תגיות <span className="text-slate-500 font-normal">(עד 5, לחץ Enter להוספה)</span>
              </label>
              <div className="flex flex-wrap gap-2 bg-slate-950/50 border border-slate-700/40 px-3.5 py-2.5 min-h-12 items-center rounded-3xl rtl">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700/50 bg-slate-900/70 px-3 py-1 text-xs text-slate-200 flex items-center gap-2 transition-all">
                    <span>{tag}</span>
                    <button
                      className="rounded-full p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                      onClick={() => removeTag(tag)}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    className="flex-1 bg-transparent text-slate-200 outline-none placeholder:text-slate-500 placeholder:text-sm text-sm min-w-16 py-1"
                    placeholder={tags.length === 0 ? 'הוסף תגית...' : ''}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                )}
              </div>
              <div className="mt-3 text-slate-300 text-xs font-medium">תגיות מוכנות</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_TAGS.map((tag) => {
                  const isActive = tags.includes(tag);
                  const isDisabled = !isActive && tags.length >= 5;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addPresetTag(tag)}
                      disabled={isDisabled}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${isActive ? 'border border-cyan-500/40 bg-cyan-500/15 text-cyan-200 shadow-[0_10px_30px_-20px_rgba(56,189,248,0.65)]' : 'border border-slate-700/40 bg-slate-950/60 text-slate-200 hover:border-cyan-500/30 hover:bg-slate-900/80'} ${isDisabled ? 'opacity-60 cursor-not-allowed hover:border-slate-700 hover:bg-slate-950' : ''}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* כפתורים */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="button-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'שומר...' : 'שמור שינויים'}
              </button>

              <Link
                to={`/topic/${id}`}
                className="button-secondary flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                ביטול
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}