/**
 * CyberLayout
 * -----------
 * עוטפת עמוד עם רקע הגריד + ה-glow הירוק,
 * במקום שכל קומפוננטה תגדיר את זה בעצמה.
 *
 * שימוש:
 *   <CyberLayout>
 *     <div>תוכן העמוד</div>
 *   </CyberLayout>
 *
 * Props:
 *   className  — class נוסף על ה-wrapper החיצוני
 *   glowTop    — מיקום גלו עליון (ברירת מחדל: "top-20 left-10")
 *   glowBottom — מיקום גלו תחתון (ברירת מחדל: "bottom-20 right-10")
 */
export default function CyberLayout({ children, className = "", glowTop = "top-20 left-10", glowBottom = "bottom-20 right-10" }) {
  return (
    <div className={`relative min-h-screen text-slate-200 pb-16 ${className}`} dir="rtl">
      <div className="cyber-bg-grid" />
      <div className={`cyber-bg-glow ${glowTop}`} />
      <div className={`cyber-bg-glow ${glowBottom} opacity-60`} />
      {children}
    </div>
  );
}