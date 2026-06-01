import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from "../MarkdownRenderer";
import { useAuth } from "../../hooks";
import { getToken, getUser } from "../../utils/storage";
import { timeAgo } from "../../utils/formatters";

const API = "http://localhost:5000/api";

function formatDate(dateStr) {
  if (!dateStr) return "טרם נקבע תאריך";
  return new Date(dateStr).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = getToken();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const r = await fetch(`${API}/events/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!r.ok) throw new Error("נכשל בטעינת נתוני האירוע");
        const res = await r.json();
        setEvent(res.data ? res.data : res);
      } catch (err) {
        setError(err.message || "שגיאת רשת");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, token]);

  const handleAttend = async () => {
    if (!token) { navigate("/auth"); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/events/${id}/attend`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const res = await r.json();
      if (r.ok && res.success) {
        // Re-fetch the full event to get populated attendees with names
        const eventRes = await fetch(`${API}/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const eventData = await eventRes.json();
        setEvent(eventData.data || eventData);
      } else {
        alert(res.message || "פעולת ההרשמה נכשלה");
      }
    } catch (err) {
      console.error("Event registration error:", err);
      alert("שגיאת שרת");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">טוען אירוע...</div>;

  if (error || !event) return (
    <div className="page-shell flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
        <p className="text-red-400 mb-6">{error || "האירוע לא נמצא"}</p>
        <Link to="/events" className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold">
          חזרה לאירועים
        </Link>
      </div>
    </div>
  );

  const isPast = new Date(event.date) < new Date();
  const storedUser = getUser();
  const currentUserId = user?._id || storedUser?._id || storedUser?.id;
  const isAttending = event.attendees?.some(a => a && (a._id ? a._id.toString() : a.toString()) === currentUserId?.toString());
  const isAuthor = event.author?._id?.toString() === currentUserId?.toString();

  return (
    <div dir="rtl" className="page-shell">
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-10">
          <Breadcrumb items={[{ label: "אירועים", to: "/events" }, { label: event.title, active: true }]} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="section-card section-card-md">
              <h3 className="text-sm font-bold text-white mb-4">פרטי האירוע</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">מתי</p>
                  <p className="text-slate-200">{formatDate(event.date)}</p>
                  {event.time && <p className="text-xs text-cyan-300 mt-0.5">בשעה {event.time}</p>}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">{event.isOnline ? "סוג" : "מיקום"}</p>
                  <p className="text-slate-200">{event.isOnline ? "מפגש אונליין" : event.location}</p>
                </div>
              </div>

              {!isPast ? (
                <button
                  onClick={handleAttend}
                  disabled={submitting}
                  className={`w-full mt-5 py-2.5 rounded-2xl text-sm font-semibold transition-all border ${
                    isAttending
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                      : "button-primary"
                  }`}
                >
                  {submitting ? "מעבד..." : isAttending ? "✓ ביטול הרשמה" : "הירשם לאירוע"}
                </button>
              ) : (
                <div className="w-full mt-5 py-2.5 text-center text-slate-600 text-xs border border-slate-800 rounded-2xl">
                  אירוע שהסתיים
                </div>
              )}

              {isAuthor && (
                <Link to={`/events/${id}/edit`} className="block w-full text-center mt-3 py-2.5 button-secondary rounded-2xl text-sm">
                  ערוך אירוע
                </Link>
              )}
            </div>

            {event.tags?.length > 0 && (
              <div className="section-card section-card-md">
                <h3 className="text-sm font-bold text-white mb-4">תגיות</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="lg:col-span-3 space-y-8">
            <article className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 md:p-12">
              <div className="flex items-center gap-3 text-sm text-cyan-300 mb-5">
                <span>{event.isOnline ? "מיטאפ אונליין" : "אירוע פיזי"}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500">{timeAgo(event.createdAt)}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-8">{event.title}</h1>
              <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white">
                <MarkdownRenderer source={event.description} />
              </div>
            </article>

            {/* משתתפים */}
            <div className="section-card section-card-md">
              <h3 className="text-xl font-bold mb-5">משתתפים רשומים ({event.attendees?.length || 0})</h3>
              {(!event.attendees || event.attendees.length === 0) ? (
                <p className="text-slate-500 text-sm">אין משתתפים רשומים לאירוע זה עדיין.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {event.attendees.slice(0, 12).map((attendee, idx) => {
                    const name = attendee?.firstName || attendee?.username || null;
                    return (
                      <div key={idx} className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 font-black text-sm" title={name || "חבר קהילה"}>
                        {name?.[0]?.toUpperCase() || "?"}
                      </div>
                    );
                  })}
                  {event.attendees.length > 12 && (
                    <div className="h-10 px-3 rounded-xl border border-slate-700 bg-slate-900/50 flex items-center text-xs text-slate-400">
                      +{event.attendees.length - 12} נוספים
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}