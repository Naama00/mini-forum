import { useRef, useState } from "react";
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
    <div className="border border-white/8 rounded-lg bg-gray-950/75 rtl" dir="rtl">
      <div className="flex gap-2 px-2 py-2 border-b border-white/6 rtl">
        <button type="button" title="Heading" onClick={() => onHeading(2)} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold">H</button>
        <button type="button" title="Bold" onClick={onBold} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold"><b>B</b></button>
        <button type="button" title="Italic" onClick={onItalic} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold"><i>I</i></button>
        <button type="button" title="Link" onClick={onLink} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold">🔗</button>
        <button type="button" title="Code" onClick={onCode} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold">{`</>`}</button>
        <button type="button" title="Code block" onClick={onCodeBlock} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold">▤</button>
        <button type="button" title="Quote" onClick={onQuote} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold">❝</button>
        <button type="button" title="Ordered list" onClick={onOL} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold">1.</button>
        <button type="button" title="Bullet list" onClick={onUL} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold">•</button>
        <button type="button" title="Horizontal rule" onClick={onHR} className="bg-transparent border border-white/6 text-slate-200/95 px-2 py-1.5 rounded transition-all hover:bg-white/1 font-bold">―</button>
        <div style={{ flex: 1 }} />
        <button type="button" className={`bg-transparent border rounded transition-all font-bold px-2 py-1.5 ${showPreview ? "bg-cyan-500/6 border-cyan-500 text-slate-200/95" : "border-white/6 text-slate-200/95 hover:bg-white/1"}`} onClick={() => setShowPreview(s => !s)} title="הצג תצוגה מקדימה">👁</button>
      </div>

      <div className={`flex gap-3 items-start ${showPreview ? "split" : ""}`}>
        <textarea
          ref={taRef}
          className={`${showPreview ? "w-1/2" : "w-full"} px-3.5 py-3 resize-none border border-white/10 outline-none text-slate-200/95 font-sans text-sm min-h-36 max-h-96 overflow-auto rtl transition-all bg-black/60 focus:border-cyan-500 focus:bg-black/66 focus:shadow-lg focus:shadow-cyan-500/6 placeholder:text-slate-200/60`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
        {showPreview && (
          <div className={`${showPreview ? "w-1/2" : ""} bg-transparent border-l border-white/6 pl-3 overflow-auto`}><MarkdownRenderer source={value} /></div>
        )}
      </div>

      <div className="text-xs text-slate-200/90 px-3 py-2">ניתן להשתמש ב-Markdown — למשל **בולד**, *איטליק*, `קוד` ועוד.</div>
    </div>
  );
}
