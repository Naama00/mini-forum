import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import ts from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import cssLang from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'img'],
  attributes: {
    ...defaultSchema.attributes,
    img: ['src', 'alt', 'title', 'width', 'height', 'className'],
  },
};

// ── מיפוי שפה → סיומת קובץ ───────────────────────────────────────────────────
const LANG_TO_EXT = {
  javascript: 'js', jsx: 'jsx', typescript: 'ts', tsx: 'tsx',
  python: 'py', java: 'java', cpp: 'cpp', c: 'c',
  bash: 'sh', shell: 'sh', json: 'json', html: 'html',
  markup: 'html', css: 'css', php: 'php', go: 'go',
  ruby: 'rb', rust: 'rs', swift: 'swift', kotlin: 'kt',
};

// ── כפתורי העתק + הורד על בלוק קוד ──────────────────────────────────────────
function CodeActions({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = LANG_TO_EXT[language?.toLowerCase()] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-actions">
      {language && (
        <span className="code-lang">{language}</span>
      )}
      <button onClick={handleCopy} className="code-btn" title="העתק קוד">
        {copied ? '✓ הועתק' : '⎘ העתק'}
      </button>
      <button onClick={handleDownload} className="code-btn" title="הורד קובץ">
        ↓ הורד
      </button>
    </div>
  );
}

export default function MarkdownRenderer({ source }) {
  if (!source) return null;

  try {
    SyntaxHighlighter.registerLanguage('javascript', js);
    SyntaxHighlighter.registerLanguage('jsx', jsx);
    SyntaxHighlighter.registerLanguage('typescript', ts);
    SyntaxHighlighter.registerLanguage('python', python);
    SyntaxHighlighter.registerLanguage('java', java);
    SyntaxHighlighter.registerLanguage('cpp', cpp);
    SyntaxHighlighter.registerLanguage('bash', bash);
    SyntaxHighlighter.registerLanguage('json', json);
    SyntaxHighlighter.registerLanguage('html', markup);
    SyntaxHighlighter.registerLanguage('markup', markup);
    SyntaxHighlighter.registerLanguage('css', cssLang);
    SyntaxHighlighter.registerLanguage('php', php);
    SyntaxHighlighter.registerLanguage('go', go);
    SyntaxHighlighter.registerLanguage('ruby', ruby);
  } catch (e) { /* ignore HMR */ }

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, '');
      const language = match?.[1];

      if (inline || !match) {
        return <code className={className} {...props}>{children}</code>;
      }

      return (
        <div className="code-block-wrapper">
          <CodeActions code={codeString} language={language} />
          <SyntaxHighlighter
            language={language || 'javascript'}
            style={vscDarkPlus}
            useInlineStyles={false}
            PreTag="span"
            className="md-syntax ltr"
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    },
    pre({ children, ...props }) {
      return (
        <pre className="md-pre" style={{ direction: 'ltr', textAlign: 'left' }} {...props}>
          {children}
        </pre>
      );
    }
  };

  return (
    <div className="text-slate-200/95 leading-relaxed rtl md-renderer" dir="rtl">
      <style>{`
        .md-renderer h1, .md-renderer h2, .md-renderer h3 { margin: 12px 0; }
        .md-renderer p { margin: 8px 0; }
        .md-pre { background: rgba(0,0,0,0.6); padding: 12px; border-radius: 6px; overflow: auto; margin: 12px 0; display: block; }
        .md-renderer code { background: rgba(0,0,0,0.45); padding: 2px 6px; border-radius: 4px; }
        .md-syntax { display: block !important; }

        /* ── עטיפת בלוק קוד ─────────────────────────────────────────────── */
        .code-block-wrapper {
          position: relative;
          background: rgba(0,0,0,0.6);
          border-radius: 8px;
          margin: 12px 0;
          overflow: hidden;
          direction: ltr;
        }

        /* ── שורת כותרת עם שפה + כפתורים ──────────────────────────────────── */
        .code-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          direction: ltr;
        }
        .code-lang {
          font-size: 11px;
          color: #6b7280;
          font-family: monospace;
          margin-left: auto;
          margin-right: auto;
          padding-right: 6px;
          text-transform: lowercase;
        }
        .code-btn {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          white-space: nowrap;
        }
        .code-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #e5e7eb;
          border-color: rgba(255,255,255,0.2);
        }

        /* ── הקוד עצמו ──────────────────────────────────────────────────── */
        .code-block-wrapper .md-pre {
          margin: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
        }

        .md-syntax .token.keyword { color: #569CD6 !important; }
        .md-syntax .token.function { color: #DCDCAA !important; }
        .md-syntax .token.class-name { color: #4EC9B0 !important; }
        .md-syntax .token.tag { color: #569CD6 !important; }
        .md-syntax .token.punctuation { color: #d4d4d4 !important; }
        .md-syntax .token.property, .md-syntax .token.attr-name, .md-syntax .token.variable, .md-syntax .token.parameter { color: #9CDCFE !important; }
        .md-syntax .token.string { color: #CE9178 !important; }
        .md-syntax .token.number { color: #B5CEA8 !important; }
        .md-syntax .token.boolean { color: #B5CEA8 !important; }
        .md-syntax .token.comment { color: #6A9955 !important; font-style: italic !important; }
        .md-syntax .token.operator { color: #d4d4d4 !important; }
        .md-syntax .token.constant { color: #4FC1FF !important; }
        .md-syntax .token.selector { color: #DCDCAA !important; }
        .md-syntax .token.url { color: #4EC9B0 !important; }
        .md-syntax .token.regex { color: #D16969 !important; }
        .md-syntax .token.bold { font-weight: 700 !important; }
        .md-syntax .token.italic { font-style: italic !important; }
        .md-syntax code { color: inherit !important; background: transparent !important; padding: 0 !important; }
        .md-renderer .md-syntax pre { background: transparent !important; margin: 0 !important; padding: 0 !important; }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}