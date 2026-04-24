import { useRef, useState } from "react";
import "../css/MarkdownEditor.css";
import MarkdownRenderer from "./MarkdownRenderer";

export default function MarkdownEditor({ value, onChange, placeholder, rows = 8 }) {
  const taRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  const wrap = (before, after = "") => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || "טקסט";
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);
    // restore selection
    requestAnimationFrame(() => {
      const pos = start + (before.length) + selected.length + (after.length);
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const insertAtCursor = (text) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = value.slice(0, start) + text + value.slice(end);
    onChange(newVal);
    requestAnimationFrame(() => {
      const pos = start + text.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const onLink = () => {
    const url = window.prompt("כתובת URL (כולל https://)", "https://");
    if (!url) return;
    const ta = taRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || "קישור";
    const md = `[${selected}](${url})`;
    insertAtCursor(md);
  };

  const onHeading = (level = 2) => wrap("\n" + "#".repeat(level) + " ", "\n");
  const onBold = () => wrap("**", "**");
  const onItalic = () => wrap("*", "*");
  const onCode = () => wrap("`", "`");
const onCodeBlock = () => wrap("\n\n```javascript\n", "\n```\n\n");
  const onQuote = () => wrap("\n> ", "\n");
  const onOL = () => wrap("\n1. ", "\n");
  const onUL = () => wrap("\n- ", "\n");
  const onHR = () => insertAtCursor("\n---\n");

  return (
    <div className="md-editor" dir="rtl">
      <div className="md-toolbar">
        <button type="button" title="Heading" onClick={() => onHeading(2)}>H</button>
        <button type="button" title="Bold" onClick={onBold}><b>B</b></button>
        <button type="button" title="Italic" onClick={onItalic}><i>I</i></button>
        <button type="button" title="Link" onClick={onLink}>🔗</button>
        <button type="button" title="Code" onClick={onCode}>{`</>`}</button>
        <button type="button" title="Code block" onClick={onCodeBlock}>▤</button>
        <button type="button" title="Quote" onClick={onQuote}>❝</button>
        <button type="button" title="Ordered list" onClick={onOL}>1.</button>
        <button type="button" title="Bullet list" onClick={onUL}>•</button>
        <button type="button" title="Horizontal rule" onClick={onHR}>―</button>
        <div style={{ flex: 1 }} />
        <button type="button" className={`preview-toggle${showPreview ? " active" : ""}`} onClick={() => setShowPreview(s => !s)} title="הצג תצוגה מקדימה">👁</button>
      </div>

      <div className={`md-body${showPreview ? " split" : ""}`}>
        <textarea
          ref={taRef}
          className="md-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
        {showPreview && (
          <div className="md-preview"><MarkdownRenderer source={value} /></div>
        )}
      </div>

      <div className="md-hint">ניתן להשתמש ב-Markdown — למשל **בולד**, *איטליק*, `קוד` ועוד.</div>
    </div>
  );
}
