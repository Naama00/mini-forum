import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from "../MarkdownRenderer";
import { useAuth } from "../../hooks";
import { getToken, getUser } from "../../utils/storage";
import { timeAgo } from "../../utils/formatters";

const API = "http://localhost:5000/api";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}
function isPast(dateStr) { return new Date(dateStr) < new Date(); }

export default function EventsPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ page, limit: 9, upcoming: showUpcoming });
      if (search) params.append("search", search);
      const res = await fetch(`${API}/events?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'שגיאה בטעינת אירועים');
      setEvents(data.events || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error(e);
      setFetchError(e.message || 'שגיאת רשת');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [page, showUpcoming]);

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(1); fetchEvents(); };

  const handleAttend = async (id) => {
    const token = getToken();
    if (!token) return navigate("/auth");
    const previousEvents = events;
    const tokenUser = getUser();
    const userId = tokenUser?._id || tokenUser?.id;
    console.log("userId from token:", userId);
    console.log("attendees of event:", events.find(e => e._id === id)?.attendees);

    // Optimistic update — normalise both object-attendees and string-attendees
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev._id !== id) return ev;
        const attending = ev.attendees?.some(
          (a) => a && (a._id ? a._id.toString() : a.toString()) === userId
        );
        return {
          ...ev,
          attendees: attending
            ? ev.attendees.filter(
                (a) => a && (a._id ? a._id.toString() : a.toString()) !== userId
              )
            : [...(ev.attendees || []), userId],
        };
      })
    );

    try {
      const r = await fetch(`${API}/events/${id}/attend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await r.json();
      if (!r.ok || !res.success) {
        throw new Error(res.message || "Failed to update attendance");
      }
      // Sync with server's real attendees list
      setEvents((prev) =>
        prev.map((ev) => (ev._id === id ? { ...ev, attendees: res.attendees } : ev))
      );
    } catch (e) {
      console.error("Event attendance error:", e);
      setEvents(previousEvents);
      alert("שגיאה בעדכון ההרשמה");
    }
  };

  const handleLike = async (id) => {
    const token = getToken();
    if (!token) return navigate("/auth");
    const previousEvents = events;
    const tokenUser = getUser();
    const userId = tokenUser?._id || tokenUser?.id;

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev._id !== id) return ev;
        const liked = ev.likes?.includes(userId);
        return {
          ...ev,
          likes: liked ? ev.likes.filter((u) => u !== userId) : [...(ev.likes || []), userId],
          _liked: !liked,
        };
      })
    );

    try {
      const r = await fetch(`${API}/events/${id}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const res = await r.json();
      if (!r.ok) {
        throw new Error(res.message || res.error || 'Failed to update like');
      }
    } catch (e) {
      console.error(e);
      setEvents(previousEvents);
    }
  };

  return (
    <div className="page-shell" dir="rtl">
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-sm text-cyan-300 font-medium">EVENTS</span>
            </div>
            <h1 className="text-5xl font-black mb-4">
              <span className="text-white">Tech</span> <span className="text-gradient">Events</span>
            </h1>
            <p className="text-slate-400 max-w-xl">וובינרים, האקתונים, מיטאפים טכנולוגיים וסדנאות קוד לייב של חברי הקהילה.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="חפש מיטאפ, נושא או כותב..."
                className="bg-slate-900/70 border border-slate-700 rounded-2xl py-3 px-4 text-slate-200 outline-none focus:border-cyan-400 transition-all"
              />
              <button type="submit" className="button-primary">חיפוש</button>
            </form>
            {isLoggedIn && (
              <button onClick={() => navigate("/events/new")} className="button-secondary">+ אירוע חדש</button>
            )}
          </div>
        </div>

        <div className="mb-10">
          <Breadcrumb items={[{ label: "אירועים ומפגשי קהילה", active: true }]} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {[{ label: "אירועים קרובים", val: true }, { label: "ארכיון", val: false }].map(t => (
            <button
              key={String(t.val)}
              onClick={() => { setShowUpcoming(t.val); setPage(1); }}
              className={`px-5 py-2 rounded-2xl text-sm font-semibold transition-all border ${
                showUpcoming === t.val
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                  : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-cyan-500/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {fetchError ? (
          <div className="text-center py-20 text-red-400">{fetchError}</div>
        ) : loading ? (
          <div className="text-center py-20 text-slate-400">טוען אירועים...</div>
        ) : events.length === 0 ? (
          <div className="card-empty">
            <p className="text-slate-400">אין כרגע אירועים זמינים בחתך המבוקש.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map(event => {
                const past = isPast(event.date);
                const tokenUser = getUser();
                const currentUserId = tokenUser?._id || tokenUser?.id;
                const isAttending = event.attendees?.some(
                  (a) => a && (a._id ? a._id.toString() : a.toString()) === currentUserId
                );
                const isLiked = event.likes?.some(
                  (u) => u && (u._id ? u._id.toString() : u.toString()) === currentUserId
                );
                return (
                  <div key={event._id} className="group section-card section-card-md section-shadow-hover flex flex-col justify-between min-h-[280px]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
                          {event.isOnline ? "Online" : "Physical"}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(event.date)}</span>
                      </div>

                      <Link to={`/events/${event._id}`}>
                        <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {event.title}
                        </h2>
                      </Link>

                      {event.description && (
                        <div className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
                          <MarkdownRenderer source={(event.description || "").slice(0, 110) + "..."} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-800 mt-4 gap-2">
                      {!past && (
                        <button
                          onClick={() => handleAttend(event._id)}
                          className={`flex-1 py-2 rounded-2xl text-sm font-semibold transition-all border ${
                            isAttending
                              ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                              : "border-slate-700 bg-slate-900/50 text-slate-300 hover:border-cyan-500/50"
                          }`}
                        >
                          {isAttending ? "✓ נרשמת" : "הירשם"}
                        </button>
                      )}
                      <button
                        onClick={() => handleLike(event._id)}
                        className={`flex items-center gap-1 text-slate-400 hover:text-pink-400 transition-colors px-2 ${isLiked ? "text-pink-400" : ""}`}
                      >
                        ♥ <span>{event.likes?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-14 flex-wrap">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-11 h-11 rounded-2xl border transition-all ${
                      page === i + 1
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                        : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-cyan-500/50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}