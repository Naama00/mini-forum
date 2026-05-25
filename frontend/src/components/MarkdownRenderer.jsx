import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
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

export default function MarkdownRenderer({ source }) {
  if (!source) return null;

  // register Prism languages (safe to call repeatedly in HMR)
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
  } catch (e) {
    /* ignore duplicate registration during HMR */
  }

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, '');

      // Inline code
      if (inline || !match) {
        return <code className={className} {...props}>{children}</code>;
      }

      // Code block - use span as wrapper instead of div to avoid nesting issues
      return (
        <SyntaxHighlighter
          language={match ? match[1] : 'javascript'}
          style={vscDarkPlus}
          useInlineStyles={false}
          PreTag="span"
          className="md-syntax ltr"
        >
          {codeString}
        </SyntaxHighlighter>
      );
    },
    pre({ children, ...props }) {
      // Handle pre blocks
      return (
        <pre className="md-pre" style={{ direction: 'ltr', textAlign: 'left' }} {...props}>
          {children}
        </pre>
      );
    }
  };

  return (
    <div className="text-slate-200/95 leading-relaxed rtl" dir="rtl">
      <style>{`
        .md-renderer h1, .md-renderer h2, .md-renderer h3 { margin: 12px 0; }
        .md-renderer p { margin: 8px 0; }
        .md-pre { background: rgba(0,0,0,0.6); padding: 12px; border-radius: 6px; overflow: auto; margin: 12px 0; display: block; }
        .md-renderer code { background: rgba(0,0,0,0.45); padding: 2px 6px; border-radius: 4px; }
        .md-syntax { display: block !important; }
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
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]} components={components}>{source}</ReactMarkdown>
    </div>
  );
}
