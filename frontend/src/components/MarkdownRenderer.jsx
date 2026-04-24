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
import "../css/MarkdownEditor.css";

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

      if (!match && inline) {
        return <code className={className} {...props}>{children}</code>;
      }

      return (
        <div className="code-block-wrapper" style={{ direction: 'ltr', textAlign: 'left' }}>
          <SyntaxHighlighter
            language={match ? match[1] : 'javascript'} // ברירת מחדל JS אם לא צוין
            style={vscDarkPlus}
            useInlineStyles={false} // חשוב מאוד! כדי שישתמש ב-CSS שכתבת
            PreTag="div"
            className="md-syntax" // ה-class שכתבת ב-CSS
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }
  };

  return (
    <div className="md-renderer" dir="rtl">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]} components={components}>{source}</ReactMarkdown>
    </div>
  );
}
