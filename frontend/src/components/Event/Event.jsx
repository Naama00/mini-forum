import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from "../MarkdownRenderer";
import { useAuth } from "../../hooks";
import { getToken, getLoggedInUserFromToken } from "../../utils/storage";

const API = "http://localhost:5000/api";

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "עכשיו";
    if (mins < 60) return `לפני ${mins} דק'`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `לפני ${hours} שע'`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `לפני ${days} ימים`;
    return new Date(dateStr).toLocaleDateString("he-IL");
}

function formatDate(dateStr) {
    if (!dateStr) return "טרם נקבע תאריך";
    return new Date(dateStr).toLocaleDateString("he-IL", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
}

export default function EventPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const token = getToken();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const r = await fetch(`${API}/events/${id}`, {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (!r.ok) throw new Error("נכשל בטעינת נתוני האירוע מהשרת");
                const res = await r.json();
                setEvent(res.data ? res.data : res);
            } catch (err) {
                setError(err.message || "שגיאת רשת בחיבור לשרת המרכזי");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, token]);

    const handleAttend = async () => {
        if (!token) {
            navigate("/auth");
            return;
        }
        setSubmitting(true);
        try {
            const r = await fetch(`${API}/events/${id}/attend`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await r.json();
            if (r.ok) {
                // עדכון ה-State בצורה דינמית חכמה
                setEvent(res.data ? res.data : res);
            } else {
                alert(res.message || "פעולת ההרשמה נכשלה");
            }
        } catch {
            alert("שגיאת שרת בעיבוד הבקשה");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-cyan-400 font-mono animate-pulse">FETCHING_EVENT_METRICS...</div>;
    if (error) return <div className="text-center py-20 text-rose-500 font-sans border border-rose-500/20 bg-rose-500/5 max-w-xl mx-auto my-10 p-4">{error}</div>;
    if (!event) return <div className="text-center py-20 text-slate-500">האירוע המבוקש לא קיים.</div>;

    const isPast = new Date(event.date) < new Date();
    const currentUserId = user?._id || getLoggedInUserFromToken()?.id;
    const isAttending = event.attendees?.some(a => a._id === currentUserId || a === currentUserId);
    const isAuthor = event.author?._id === currentUserId;

    return (
        <div className="page-wrapper min-h-screen bg-[#080b12] text-slate-200">
            <div className="page-content max-w-5xl mx-auto px-4 py-8" dir="rtl">
                <Breadcrumb customNames={{ [id]: event.title }} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                    
                    {/* תוכן ראשי של האירוע */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/[0.01] border border-white/[0.05] p-6 md:p-8 rounded-xl relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
                            
                            <header className="mb-6 pb-6 border-b border-white/5">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <span className="font-mono text-xs text-purple-400 bg-purple-500/5 px-2.5 py-1 border border-purple-500/10 rounded">
                                        // {event.isOnline ? "מיטאפ אונליין" : "אירוע פיזי"}
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono">{timeAgo(event.createdAt)}</span>
                                </div>

                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">{event.title}</h1>
                            </header>

                            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm md:text-base">
                                <MarkdownRenderer source={event.description} />
                            </div>
                        </div>

                        {/* רשימת רשומים אולטרה-מודרנית */}
                        <div className="bg-white/[0.01] border border-white/[0.05] p-6 rounded-xl">
                            <p className="font-mono text-xs tracking-widest text-slate-500 uppercase mb-4 flex items-center gap-2">
                                <span>// משתתפים רשומים ({event.attendees?.length || 0})</span>
                                <span className="flex-1 h-px bg-white/5" />
                            </p>
                            
                            {(!event.attendees || event.attendees.length === 0) ? (
                                <p className="text-xs text-slate-600">אין משתתפים רשומים לאירוע זה כרגע.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {event.attendees.slice(0, 12).map((attendee, idx) => (
                                        <div key={idx} className="w-8 h-8 rounded-full bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 transition-transform hover:scale-110" title={attendee.firstName || "חבר קהילה"}>
                                            {attendee.firstName?.[0]?.toUpperCase() || "?"}
                                        </div>
                                    ))}
                                    {event.attendees.length > 12 && (
                                        <div className="h-8 px-2.5 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-mono">
                                            +{event.attendees.length - 12} נוספים
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* סיידבר של לוגיסטיקה ורישום */}
                    <div className="space-y-6">
                        <div className="glass-card p-5 rounded-xl space-y-4">
                            <div className="space-y-3.5 text-sm">
                                <div className="flex gap-3 items-start text-slate-300">
                                    <span className="text-base text-[#ccff00]">📅</span>
                                    <div>
                                        <p className="font-semibold text-white">מתי זה קורה?</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(event.date)}</p>
                                        {event.time && <p className="text-xs font-mono text-[#ccff00] mt-0.5"> בשעה {event.time}</p>}
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 items-start text-slate-300 border-t border-white/5 pt-3">
                                    <span className="text-base text-purple-400">{event.isOnline ? "🌐" : "📍"}</span>
                                    <div>
                                        <p className="font-semibold text-white">מיקום האירוע</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{event.isOnline ? "מפגש דיגיטלי — הקישור יישלח לרשומים" : event.location}</p>
                                    </div>
                                </div>
                            </div>

                                {!isPast ? (
                                <button
                                    onClick={handleAttend}
                                    disabled={submitting}
                                    className={`w-full text-center py-3 font-sans font-bold uppercase tracking-widest text-xs rounded transition-all cursor-pointer ${
                                        isAttending 
                                        ? "bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00]" 
                                        : "border border-white/10 text-[#ccff00] bg-transparent hover:bg-[#ccff00] hover:text-black"
                                    }`}
                                >
                                    {submitting ? "מעבד בקשה..." : isAttending ? "✓ ביטול הרשמה" : "הירשם לאירוע"}
                                </button>
                            ) : (
                                <div className="w-full text-center py-2.5 bg-white/5 border border-white/5 text-slate-600 font-mono text-xs uppercase tracking-wider rounded">
                                    // אירוע מהעבר
                                </div>
                            )}

                            {isAuthor && (
                                <Link to={`/events/${id}/edit`} className="block w-full text-center py-2.5 border border-white/10 text-slate-400 no-underline font-sans text-xs rounded hover:border-purple-500/30 hover:text-purple-400 transition-all">
                                    ערוך פרטי אירוע
                                </Link>
                            )}
                        </div>

                        {/* תגיות אירוע */}
                        {event.tags?.length > 0 && (
                            <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-xl">
                                <p className="font-mono text-[10px] tracking-widest text-slate-600 uppercase mb-3 flex items-center gap-2">
                                    <span>// נושאי מפגש</span>
                                    <span className="flex-1 h-px bg-white/5" />
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {event.tags.map(tag => (
                                        <span key={tag} className="font-mono text-xs px-2 py-0.5 bg-white/5 border border-white/10 text-slate-400 rounded">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}