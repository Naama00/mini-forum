import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

/**
 * AIWorkspace Component
 * @param {Object} props
 * @param {Object} props.currentUser - Current user object
 * @param {Array} props.categories - Available categories
 * @param {Function} props.onAddTopic - Callback to add new topic
 * @param {Function} props.onAddArticle - Callback to add new article
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function AIWorkspace({
  currentUser,
  categories = [],
  onAddTopic,
  onAddArticle,
  onNavigate,
}) {
  // State initialization with localStorage restoration
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

  // Publication State with localStorage restoration
  const [publishTarget, setPublishTarget] = useState(() => {
    return localStorage.getItem('devhub_workspace_publish_target') || 'topic';
  });
  
  const [selectedCatId, setSelectedCatId] = useState(() => {
    return localStorage.getItem('devhub_workspace_selected_cat_id') || '';
  });

  // Update selectedCatId if it's empty and categories are loaded
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
    return localStorage.getItem('devhub_workspace_article_image') || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80';
  });
  
  const [publishTags, setPublishTags] = useState(() => {
    return localStorage.getItem('devhub_workspace_publish_tags') || 'AI, CodeGen, Tutorial';
  });
  
  const [publishedLink, setPublishedLink] = useState('');

  // Sync state changes with localStorage
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

  // Handle manual draft purge
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

  // AI Chat State inside sidebar with localStorage memory
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
      { sender: 'assistant', text: "שלום! אני עוזר הפיתוח והנוסח שלך בפורום DevHub. במה נשדרג את הפוסט או הקוד שלך היום?" }
    ];
  });
  const [chatLoading, setChatLoading] = useState(false);

  // Invoke Express API for Main drafting
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
          action: action === 'draft' ? 'generate-draft' : action === 'optimize' ? 'optimize-code' : 'refine-content',
          prompt,
          extraContext: codeContext,
        })
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

  // Send message to assistant and retain history
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const newUserMsg = { sender: 'user', text: userMsg };
    const updatedWithUser = [...chatMessages, newUserMsg];

    setChatMessages(updatedWithUser);
    setChatInput('');
    setChatLoading(true);

    try {
      localStorage.setItem('devhub_chat_history', JSON.stringify(updatedWithUser));
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
        })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      const assistantMsg = { sender: 'assistant', text: data.text || '' };
      const finalHistory = [...updatedWithUser, assistantMsg];
      
      setChatMessages(finalHistory);
      
      try {
        localStorage.setItem('devhub_chat_history', JSON.stringify(finalHistory));
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      const errorMsg = { sender: 'assistant', text: 'שגיאה: ' + (e.message || 'לא הצלחתי להתחבר למנוע ה-AI.') };
      setChatMessages((prev) => {
        const withError = [...prev, errorMsg];
        try {
          localStorage.setItem('devhub_chat_history', JSON.stringify(withError));
        } catch (err) {
          console.error(err);
        }
        return withError;
      });
    } finally {
      setChatLoading(false);
    }
  };

  // Publish to forum/article system
  const handlePublish = () => {
    if (!result.trim()) return;

    let title = 'פרסום מחקר מוכן מ-AI';
    const firstLine = result.trim().split('\n')[0];
    if (firstLine && firstLine.startsWith('#')) {
      title = firstLine.replace(/^#\s*/, '').trim();
    }

    const tagsArray = publishTags.split(',').map(t => t.trim()).filter(Boolean);

    if (publishTarget === 'topic') {
      const newId = onAddTopic({
        categoryId: selectedCatId,
        title,
        tags: tagsArray,
      }, result);

      setPublishedLink(`/category?topicId=${newId}`);
      onNavigate('category', selectedCatId);
    } else {
      onAddArticle({
        title,
        summary: articleSummary || 'מאמר טכנולוגי שהופק בעזרת AI Workspace בקהילה.',
        content: result,
        tags: tagsArray,
        image: articleImage,
      });

      setPublishedLink(`/articles`);
      onNavigate('articles');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-1 py-4 text-slate-100 animate-fade-in" dir="rtl">
      {/* Banner Area */}
      <div className="border-b border-white/[0.06] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] tracking-[3px] text-[#ccff00] uppercase mb-1">// CO-PILOT GENERATIVE DRAFTING SYSTEM</p>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            סביבת כתיבה ופיתוח קוד <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#ccff00]">AI WorkSpace</span>
          </h1>
          <p className="text-sm text-slate-400">
            נסח מאמרים, אופטימיזציה לאלגוריתמים, מצא באגים רדומים, ופרסם ישירות לפורום בלחיצת כפתור אחת!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        
        {/* Main drafting board */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-[#ccff00]" />
            
            {/* Action selectors & cleaner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 font-mono tracking-wide">פעולת AI:</span>
                <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                  {[
                    { id: 'draft', label: '✍️ מחלל תוכן' },
                    { id: 'optimize', label: '🛠️ שדרוג קוד' },
                    { id: 'refine', label: '✨ עורך תוכן' }
                  ].map((act) => (
                    <button
                      key={act.id}
                      onClick={() => setAction(act.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-all ${
                        action === act.id
                          ? 'bg-[#ccff00] text-slate-900 shadow-md'
                          : 'bg-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {(prompt || codeContext || result) && (
                <button
                  type="button"
                  onClick={handleClearWorkspace}
                  className="text-right text-slate-400 hover:text-rose-400 text-xs font-medium px-3 py-1.5 rounded-xl border border-white/5 hover:border-rose-500/20 bg-white/[0.02] cursor-pointer transition-all"
                >
                  🧹 נקה טיוטה וקוד מקור
                </button>
              )}
            </div>

            {/* Inputs grid segment */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  {action === 'draft' ? 'על מה תרצה שהמאמר/פוסט יעסוק? (הקש תיאור מפורט)' :
                   action === 'optimize' ? 'מה הבעיה בקוד? (למשל: סובל מדליפת זיכרון / איטי / לא מאובטח)' :
                   'הקלד את התוכן החלק או הטיוטי שברצונך למרק ולשפר'}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    action === 'draft' ? 'לדוגמה: מדריך מפורט ומעמיק של פיתוח RAG Pipeline ב-Node.js עם Redis Vector...' :
                    action === 'optimize' ? 'לדוגמה: הקוד הבא איטי, החלף לי את האלגוריתם ל- binary search או תקן סגירות...' :
                    'הקלד או הדבק משהו שכתבת בקצרה ותרצה שנשפר לו את הניסוח לרמה מקצועית...'
                  }
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-[#ccff00] transition-all min-h-[100px] resize-y"
                />
              </div>

              {action === 'optimize' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">
                    הדבק את קוד המקור שלך פה:
                  </label>
                  <textarea
                    value={codeContext}
                    onChange={(e) => setCodeContext(e.target.value)}
                    placeholder={`function fetchStaticData() {\n  // Code here...\n}`}
                    className="w-full bg-black/50 border border-white/5 rounded-xl p-3.5 text-cyan-300 font-mono text-xs placeholder:text-slate-700 focus:outline-none focus:border-[#ccff00] transition-all min-h-[180px] resize-y leading-relaxed"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-400 font-mono">
                [ERROR_LOG]: {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-slate-500">// Engine target: gemini-3.5-flash</span>
              <button
                onClick={handleAIRequest}
                disabled={loading}
                className="bg-[#ccff00] hover:bg-[#bfff00] text-slate-950 font-sans font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-[#ccff00]/25 disabled:opacity-40 cursor-pointer"
              >
                {loading ? 'מעבד נתונים בענן AI...' : 'שגר לעיבוד AI 🚀'}
              </button>
            </div>
          </div>

          {/* Result block with Markdown Parser */}
          {result && (
            <div className="p-6 rounded-2xl bg-[#0d1017] border border-white/[0.05] shadow-2xl relative block space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                <span className="text-xs font-bold text-[#ccff00] font-mono">// AI_RESULT_OUTPUT.md</span>
                <span className="text-[10px] text-slate-500 font-mono">ערוך לשלמות או פרסם לקוראים</span>
              </div>

              {/* Rendering formatted Markdown containing styled components */}
              <div className="bg-black/20 p-5 rounded-xl border border-white/[0.03] max-h-[500px] overflow-y-auto">
                <div className="text-slate-300 font-sans text-sm leading-relaxed prose prose-invert">
                  <Markdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mt-4 mb-2 border-b border-white/10 pb-1" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-semibold text-white mt-3 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="text-slate-300 text-sm leading-relaxed mb-3" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-3 text-slate-300 pl-4" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-3 text-slate-300 pl-4" {...props} />,
                      li: ({node, ...props}) => <li className="text-sm list-item" {...props} />,
                      code: ({node, children, ...props}) => {
                        const codeString = String(children);
                        const isInline = !codeString.includes('\n');
                        return isInline ? (
                          <code className="bg-white/10 text-[#ccff00] px-1.5 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
                        ) : (
                          <pre className="bg-black/40 border border-white/5 p-4 rounded-xl my-3 overflow-x-auto font-mono text-xs text-cyan-300 leading-relaxed text-left max-w-full" style={{ direction: 'ltr' }}>
                            <code {...props}>{children}</code>
                          </pre>
                        );
                      },
                      a: ({node, ...props}) => <a className="text-[#ccff00] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-cyan-500 bg-white/5 pr-4 py-2 my-2 rounded-l text-slate-400 italic" {...props} />,
                    }}
                  >
                    {result}
                  </Markdown>
                </div>
              </div>

              {/* Direct-to-forum setup */}
              <div className="p-5 rounded-xl bg-white/[0.01] border border-white/[0.03] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>⚡</span> הפץ ישירות לפורום
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5">ערוץ הפצה לקוראים:</label>
                    <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                      <button
                        onClick={() => setPublishTarget('topic')}
                        className={`flex-1 px-3 py-1 text-[11px] font-bold rounded-lg border-none ${
                          publishTarget === 'topic' ? 'bg-cyan-500 text-slate-950' : 'bg-transparent text-slate-400'
                        }`}
                      >
                        דיון (Forum Topic)
                      </button>
                      <button
                        onClick={() => setPublishTarget('article')}
                        className={`flex-1 px-3 py-1 text-[11px] font-bold rounded-lg border-none ${
                          publishTarget === 'article' ? 'bg-cyan-500 text-slate-950' : 'bg-transparent text-slate-400'
                        }`}
                      >
                        מאמר טכנולוגי (Article)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5">קטגוריה רלוונטית:</label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                    >
                      {categories.map(c => {
                        const catId = c.id || c._id;
                        return (
                          <option key={catId} value={catId} className="bg-slate-900">{c.name}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {publishTarget === 'article' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">תקציר מנהלים קצר:</label>
                      <input
                        type="text"
                        value={articleSummary}
                        onChange={(e) => setArticleSummary(e.target.value)}
                        placeholder="רשום תקציר קצר עבור כרטיסיית המאמר..."
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">תמונת רקע (URL):</label>
                      <input
                        type="text"
                        value={articleImage}
                        onChange={(e) => setArticleImage(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">תגיות מופרדות בפסיקים (Tags):</label>
                  <input
                    type="text"
                    value={publishTags}
                    onChange={(e) => setPublishTags(e.target.value)}
                    placeholder="AI, Code, RAG, React"
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handlePublish}
                    className="bg-gradient-to-r from-cyan-400 to-[#ccff00] text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    הפץ ופרסם לקהילה עכשיו! ⚡
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Co-Pilot Chat Helper Column */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.05] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#ccff00] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>🤖</span> Co-Pilot Chat Helper
              </h3>
              {chatMessages.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('devhub_chat_history');
                    setChatMessages([
                      { sender: 'assistant', text: 'שלום! היסטוריית הצ\'אט נמחקה. במה נשדרג את הפוסט או הקוד שלך היום?' }
                    ]);
                  }}
                  className="bg-transparent hover:text-rose-400 text-slate-500 text-[10px] font-bold py-0.5 px-1.5 border border-white/10 hover:border-[#ccff00]/20 rounded cursor-pointer transition-all"
                >
                  נקה צ'אט
                </button>
              )}
            </div>
            
            <p className="text-[11px] text-slate-400 leading-normal">
              שאלי אותי מונחים טכנולוגיים, קבלו הסברי קוד מעמיקים או בקשי טיפיי כתיבה.
            </p>

            <div className="h-[280px] overflow-y-auto bg-black/30 rounded-xl p-3 border border-white/[0.02] space-y-3 flex flex-col">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500/10 text-cyan-100 border border-cyan-500/20 mr-auto text-left'
                      : 'bg-white/5 text-slate-300 ml-auto'
                  }`}
                  style={{ direction: msg.sender === 'user' ? 'ltr' : 'rtl' }}
                >
                  {msg.sender === 'user' ? (
                    msg.text
                  ) : (
                    <Markdown
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-0.5 mb-2 pl-2 text-slate-300" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-0.5 mb-2 pl-2 text-slate-300" {...props} />,
                        code: ({node, children, ...props}) => {
                          const isInline = !String(children).includes('\n');
                          return isInline ? (
                            <code className="bg-white/10 text-[#ccff00] px-1 rounded font-mono text-[10px]" {...props}>{children}</code>
                          ) : (
                            <pre className="bg-black/40 border border-white/5 p-2 rounded my-1 overflow-x-auto font-mono text-[10px] text-cyan-300 leading-normal text-left max-w-full" style={{ direction: 'ltr' }}>
                              <code {...props}>{children}</code>
                            </pre>
                          );
                        }
                      }}
                    >
                      {msg.text}
                    </Markdown>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="p-2 ml-auto text-slate-600 text-[10px] animate-pulse">
                  מחולל תגובה תחת השרת...
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="שאל אותי משהו..."
                className="flex-1 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
              />
              <button
                onClick={handleChatSend}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-2 rounded-xl text-xs font-bold transition-all border-none font-mono cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>

          {/* Quick Helper presets */}
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.05] text-xs space-y-3">
            <h4 className="font-bold text-white">// מקשי עזר מהירים</h4>
            <div className="space-y-2">
              <button 
                onClick={() => { setAction('optimize'); setPrompt('תקן שגיאות אבטחה וכנס לאופטימיזציה קשיחה לקוד הבא'); }}
                className="w-full text-right p-2.5 rounded bg-white/5 hover:bg-[#ccff00]/10 hover:text-[#ccff00] text-[11px] text-slate-400 border border-transparent transition-all cursor-pointer block"
              >
                🛠️ תקן אבטחת סינטקס
              </button>
              <button 
                onClick={() => { setAction('draft'); setPrompt('כתוב פוסט מקיף על פיתוח Microfrontends עם Module Federation'); }}
                className="w-full text-right p-2.5 rounded bg-white/5 hover:bg-[#ccff00]/10 hover:text-[#ccff00] text-[11px] text-slate-400 border border-transparent transition-all cursor-pointer block"
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