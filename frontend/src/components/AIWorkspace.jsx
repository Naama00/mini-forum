import React, { useState, useEffect } from 'react';
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

/**
 * AIWorkspace Component
 * LOGIC PRESERVED — DESIGN UPGRADED
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

  const [publishTarget, setPublishTarget] = useState(() => {
    return localStorage.getItem('devhub_workspace_publish_target') || 'topic';
  });

  const [selectedCatId, setSelectedCatId] = useState(() => {
    return localStorage.getItem('devhub_workspace_selected_cat_id') || '';
  });

  useEffect(() => {
    if (!selectedCatId && categories.length > 0) {
      const defaultCatId = categories[0]?.id || categories[0]?._id || '';
      if (defaultCatId) {
        setSelectedCatId(defaultCatId);
      }
    }
  }, [categories, selectedCatId]);

  const [articleSummary, setArticleSummary] = useState(() => {
    return localStorage.getItem('devhub_workspace_article_summary') || '';
  });

  const [articleImage, setArticleImage] = useState(() => {
    return (
      localStorage.getItem('devhub_workspace_article_image') ||
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80'
    );
  });

  const [publishTags, setPublishTags] = useState(() => {
    return localStorage.getItem('devhub_workspace_publish_tags') || 'AI, CodeGen, Tutorial';
  });

  const [publishedLink, setPublishedLink] = useState('');

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
    localStorage.setItem('devhub_workspace_publish_target', publishTarget);
  }, [publishTarget]);

  useEffect(() => {
    localStorage.setItem('devhub_workspace_selected_cat_id', selectedCatId);
  }, [selectedCatId]);

  useEffect(() => {
    localStorage.setItem('devhub_workspace_article_summary', articleSummary);
  }, [articleSummary]);

  useEffect(() => {
    localStorage.setItem('devhub_workspace_article_image', articleImage);
  }, [articleImage]);

  useEffect(() => {
    localStorage.setItem('devhub_workspace_publish_tags', publishTags);
  }, [publishTags]);

  const handleClearWorkspace = () => {
    setPrompt('');
    setCodeContext('');
    setResult('');
    setArticleSummary('');
    setError('');
    setPublishedLink('');
    localStorage.removeItem('devhub_workspace_prompt');
    localStorage.removeItem('devhub_workspace_code_context');
    localStorage.removeItem('devhub_workspace_result');
    localStorage.removeItem('devhub_workspace_article_summary');
  };

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('devhub_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        sender: 'assistant',
        text: 'שלום! אני עוזר הפיתוח והנוסח שלך בפורום DevHub. במה נשדרג את הפוסט או הקוד שלך היום?',
      },
    ];
  });

  const [chatLoading, setChatLoading] = useState(false);

  const handleAIRequest = async () => {
    if (!prompt.trim()) {
      setError('אנא הקלד הנחיה או תיאור עבור הבינה המלאכותית.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setPublishedLink('');

    try {
      const resp = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:
            action === 'draft'
              ? 'generate-draft'
              : action === 'optimize'
              ? 'optimize-code'
              : 'refine-content',
          prompt,
          extraContext: codeContext,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'נכשלה פנייה לשרת ה-AI.');
      }

      setResult(data.text || '');
    } catch (e) {
      setError(e.message || 'שגיאה בעיבוד הבקשה. אנא ודא שהשרת רץ.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const newUserMsg = { sender: 'user', text: userMsg };
    const updatedWithUser = [...chatMessages, newUserMsg];

    setChatMessages(updatedWithUser);
    setChatInput('');
    setChatLoading(true);

    try {
      localStorage.setItem(
        'devhub_chat_history',
        JSON.stringify(updatedWithUser)
      );
    } catch (e) {
      console.error(e);
    }

    try {
      const resp = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          prompt: userMsg,
          history: updatedWithUser,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) throw new Error(data.error);

      const assistantMsg = {
        sender: 'assistant',
        text: data.text || '',
      };

      const finalHistory = [...updatedWithUser, assistantMsg];

      setChatMessages(finalHistory);

      try {
        localStorage.setItem(
          'devhub_chat_history',
          JSON.stringify(finalHistory)
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      const errorMsg = {
        sender: 'assistant',
        text:
          'שגיאה: ' +
          (e.message || 'לא הצלחתי להתחבר למנוע ה-AI.'),
      };

      setChatMessages((prev) => {
        const withError = [...prev, errorMsg];

        try {
          localStorage.setItem(
            'devhub_chat_history',
            JSON.stringify(withError)
          );
        } catch (err) {
          console.error(err);
        }

        return withError;
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handlePublish = () => {
    if (!result.trim()) return;

    let title = 'פרסום מחקר מוכן מ-AI';

    const firstLine = result.trim().split('\n')[0];

    if (firstLine && firstLine.startsWith('#')) {
      title = firstLine.replace(/^#\s*/, '').trim();
    }

    const tagsArray = publishTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (publishTarget === 'topic') {
      const newId = onAddTopic(
        {
          categoryId: selectedCatId,
          title,
          tags: tagsArray,
        },
        result
      );

      setPublishedLink(`/category?topicId=${newId}`);
      onNavigate('category', selectedCatId);
    } else {
      onAddArticle({
        title,
        summary:
          articleSummary ||
          'מאמר טכנולוגי שהופק בעזרת AI Workspace בקהילה.',
        content: result,
        tags: tagsArray,
        image: articleImage,
      });

      setPublishedLink(`/articles`);
      onNavigate('articles');
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div
      className="relative mx-auto w-full max-w-7xl px-4 py-8 text-slate-100"
      dir="rtl"
    >
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 mb-5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">
                AI GENERATIVE DEVELOPMENT SYSTEM
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              סביבת עבודה
              <span className="block bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                AI Workspace
              </span>
            </h1>

            <p className="mt-4 text-slate-400 max-w-2xl leading-relaxed">
              יצירת מאמרים, שדרוג קוד, ניתוח באגים והפצה ישירה לקהילה —
              בממשק futurstic חדש.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full" />

              <div className="relative w-32 h-32 rounded-3xl border border-cyan-500/30 bg-slate-950/80 flex items-center justify-center">
                <Sparkles className="w-14 h-14 text-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Main */}
        <div className="space-y-8">
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 lg:p-8">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500" />

            {/* Modes */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: 'draft',
                    label: 'יצירת תוכן',
                    icon: FileText,
                  },
                  {
                    id: 'optimize',
                    label: 'שדרוג קוד',
                    icon: Code2,
                  },
                  {
                    id: 'refine',
                    label: 'שיפור ניסוח',
                    icon: Wand2,
                  },
                ].map((act) => {
                  const Icon = act.icon;

                  return (
                    <button
                      key={act.id}
                      onClick={() => setAction(act.id)}
                      className={`group flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-300 ${
                        action === act.id
                          ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                          : 'border border-slate-700 bg-slate-900/60 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {act.label}
                    </button>
                  );
                })}
              </div>

              {(prompt || codeContext || result) && (
                <button
                  type="button"
                  onClick={handleClearWorkspace}
                  className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm font-semibold text-rose-300 transition-all hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                  נקה סביבת עבודה
                </button>
              )}
            </div>

            {/* Prompt */}
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-300">
                  {action === 'draft'
                    ? 'מה תרצה ליצור?'
                    : action === 'optimize'
                    ? 'איזו בעיה קיימת בקוד?'
                    : 'איזה טקסט תרצה לשפר?'}
                </label>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    action === 'draft'
                      ? 'לדוגמה: כתוב מדריך מלא על RAG Pipeline עם Node.js ו-Redis Vector...'
                      : action === 'optimize'
                      ? 'לדוגמה: האלגוריתם איטי מאוד, בצע אופטימיזציה...'
                      : 'הדבק כאן טקסט שתרצה לשפר מקצועית...'
                  }
                  className="min-h-[160px] w-full rounded-3xl border border-slate-700 bg-slate-950/60 px-5 py-5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all focus:border-cyan-500/60"
                />
              </div>

              {action === 'optimize' && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-300">
                    קוד מקור
                  </label>

                  <textarea
                    value={codeContext}
                    onChange={(e) => setCodeContext(e.target.value)}
                    placeholder={`function fetchData() {\n  // code here\n}`}
                    className="min-h-[260px] w-full rounded-3xl border border-slate-700 bg-black/50 px-5 py-5 font-mono text-xs leading-relaxed text-cyan-300 outline-none transition-all focus:border-cyan-500/60"
                    style={{
                      direction: 'ltr',
                      textAlign: 'left',
                    }}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <Bot className="w-4 h-4" />
                Engine: gemini-3.5-flash
              </div>

              <button
                onClick={handleAIRequest}
                disabled={loading}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:shadow-2xl hover:shadow-cyan-500/30 disabled:opacity-50"
              >
                {loading ? (
                  'מעבד בקשה...'
                ) : (
                  <>
                    <Rocket className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    שלח ל-AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    AI Output
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    GENERATED CONTENT
                  </p>
                </div>

                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-300">
                  Markdown Ready
                </div>
              </div>

              {/* Markdown */}
              <div className="max-h-[650px] overflow-y-auto px-6 py-6">
                <div className="prose prose-invert max-w-none">
                  <Markdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-3xl font-black text-white border-b border-slate-700 pb-3 mb-5"
                          {...props}
                        />
                      ),

                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-2xl font-bold text-cyan-300 mt-8 mb-4"
                          {...props}
                        />
                      ),

                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-xl font-bold text-violet-300 mt-6 mb-3"
                          {...props}
                        />
                      ),

                      p: ({ node, ...props }) => (
                        <p
                          className="text-slate-300 leading-relaxed mb-4"
                          {...props}
                        />
                      ),

                      code: ({ node, children, ...props }) => {
                        const isInline = !String(children).includes('\n');

                        return isInline ? (
                          <code
                            className="rounded bg-slate-800 px-1.5 py-1 text-cyan-300"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <pre className="overflow-x-auto rounded-2xl border border-slate-700 bg-black/50 p-5 text-cyan-300">
                            <code {...props}>{children}</code>
                          </pre>
                        );
                      },
                    }}
                  >
                    {result}
                  </Markdown>
                </div>
              </div>

              {/* Publish */}
              <div className="border-t border-slate-800 px-6 py-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-white">
                    פרסום ישיר לקהילה
                  </h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      יעד פרסום
                    </label>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPublishTarget('topic')}
                        className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                          publishTarget === 'topic'
                            ? 'bg-cyan-500 text-slate-950'
                            : 'border border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        Forum Topic
                      </button>

                      <button
                        onClick={() => setPublishTarget('article')}
                        className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                          publishTarget === 'article'
                            ? 'bg-cyan-500 text-slate-950'
                            : 'border border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        Article
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      קטגוריה
                    </label>

                    <select
                      value={selectedCatId}
                      onChange={(e) =>
                        setSelectedCatId(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm outline-none"
                    >
                      {categories.map((c) => {
                        const catId = c.id || c._id;

                        return (
                          <option
                            key={catId}
                            value={catId}
                          >
                            {c.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {publishTarget === 'article' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <input
                      type="text"
                      value={articleSummary}
                      onChange={(e) =>
                        setArticleSummary(e.target.value)
                      }
                      placeholder="תקציר קצר..."
                      className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm outline-none"
                    />

                    <input
                      type="text"
                      value={articleImage}
                      onChange={(e) =>
                        setArticleImage(e.target.value)
                      }
                      placeholder="Image URL"
                      className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm outline-none"
                    />
                  </div>
                )}

                <input
                  type="text"
                  value={publishTags}
                  onChange={(e) =>
                    setPublishTags(e.target.value)
                  }
                  placeholder="AI, React, Node..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm outline-none"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handlePublish}
                    className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-7 py-4 text-sm font-bold text-slate-950 transition-all hover:shadow-2xl hover:shadow-cyan-500/30"
                  >
                    פרסם לקהילה
                    <ChevronRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chat */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
            <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  AI Co-Pilot
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Assistant Chat
                </p>
              </div>

              {chatMessages.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('devhub_chat_history');

                    setChatMessages([
                      {
                        sender: 'assistant',
                        text: 'שלום! היסטוריית הצ׳אט אופסה.',
                      },
                    ]);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  נקה
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="h-[420px] overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'mr-auto border border-cyan-500/20 bg-cyan-500/10 text-cyan-100'
                      : 'ml-auto border border-slate-700 bg-slate-800/70 text-slate-300'
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {chatLoading && (
                <div className="text-xs text-slate-500 animate-pulse">
                  AI חושב...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-800 p-4 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleChatSend()
                }
                placeholder="שאל משהו..."
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm outline-none focus:border-cyan-500/60"
              />

              <button
                onClick={handleChatSend}
                className="flex items-center justify-center rounded-2xl bg-cyan-500 px-4 text-slate-950 transition-all hover:bg-cyan-400"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-5">
            <h4 className="mb-4 font-bold text-white">
              Quick Actions
            </h4>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setAction('optimize');
                  setPrompt(
                    'תקן שגיאות אבטחה וכנס לאופטימיזציה קשיחה לקוד הבא'
                  );
                }}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-right text-sm text-slate-300 transition-all hover:border-cyan-500/40 hover:text-cyan-300"
              >
                🛠️ תקן אבטחה ואופטימיזציה
              </button>

              <button
                onClick={() => {
                  setAction('draft');

                  setPrompt(
                    'כתוב פוסט מקיף על פיתוח Microfrontends עם Module Federation'
                  );
                }}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-right text-sm text-slate-300 transition-all hover:border-violet-500/40 hover:text-violet-300"
              >
                ✍️ רעיון לפוסט: Microfrontends
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}