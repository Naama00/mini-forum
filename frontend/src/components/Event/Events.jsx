import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from '../Breadcrumb';
import MarkdownRenderer from "../MarkdownRenderer";
import { useAuth } from "../../hooks";
import { getToken, getLoggedInUserFromToken } from "../../utils/storage";

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
  const [search, setSearch] = useState("");
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9, upcoming: showUpcoming });
      if (search) params.append("search", search);
      const res = await fetch(`${API}/events?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setEvents(data.events || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, showUpcoming]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleAttend = async (id) => {
    const token = getToken();
    if (!token) return navigate("/auth");
    try {
      const r = await fetch(`${API}/events/${id}/attend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await r.json();
      if (res.success) {
        setEvents(prev => prev.map(ev => {
          if (ev._id === id) {
            const userId = getLoggedInUserFromToken()?.id;
            const attending = ev.attendees?.includes(userId);
            return {
              ...ev,
              attendees: attending ? ev.attendees.filter(u => u !== userId) : [...(ev.attendees || []), userId],
              _attending: !attending
            };
          }
          return ev;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLike = async (id) => {
    const token = getToken();
    if (!token) return navigate("/auth");
    try {
      const r = await fetch(`${API}/events/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await r.json();
      if (res.success) {
        setEvents(prev => prev.map(ev => {
          if (ev._id === id) {
            const userId = getLoggedInUserFromToken()?.id;
            const liked = ev.likes?.includes(userId);
            return {
              ...ev,
              likes: liked ? ev.likes.filter(u => u !== userId) : [...(ev.likes || []), userId],
              _liked: !liked
            };
          }
          return ev;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const EVENTS_STYLES = `
    .cyber-grid-pattern {
      position: fixed;
      inset: 0;
      background-image: radial-gradient(circle at 2px 2px, rgba(204, 255, 0, 0.03) 1px, transparent 0);
      background-size: 32px 32px;
      z-index: -1;
    }
    .neon-ambient-glow {
      position: fixed;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(204, 255, 0, 0.04), transparent 70%);
      filter: blur(120px);
      z-index: -1;
      pointer-events: none;
    }
    .glass-event-card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(204, 255, 0, 0.06);
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .glass-event-card:hover {
      border-color: rgba(204, 255, 0, 0.25);
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(204, 255, 0, 0.04);
    }
    .neon-action-btn {
      border: 1px solid #ccff00;
      color: #ccff00;
      transition: all 0.2s ease;
    }
    .neon-action-btn:hover {
      background: #ccff00;
      color: #0a0a0c;
      box-shadow: 0 0 15px rgba(204, 255, 0, 0.4);
    }
  `;

  return (
    <>
      <style>{EVENTS_STYLES}</style>
      <div className="relative min-h-screen text-slate-200 pb-16" dir="rtl">
        <div className="cyber-grid-pattern" />
        <div className="neon-ambient-glow top-20 left-10" />
        <div className="neon-ambient-glow bottom-20 right-10 opacity-60" />

        <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
          <Breadcrumb items={[{ label: "אירועים ומפגשי קהילה", active: true }]} />

          {/* Header Panel */}
          <div className="glass-event-card p-8 md:p-10 rounded-3xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">אירועים ומפגשים</h1>
              <p className="text-slate-400 text-sm max-w-xl font-light">וובינרים, האקתונים, מיטאפים טכנולוגיים וסדנאות קוד לייב של חברי הקהילה.</p>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="חפש מיטאפ, נושא או כותב..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all"
              />
              <button type="submit" className="absolute left-3 top-3.5 text-slate-500 hover:text-[#ccff00] text-xs font-mono">🔍</button>
            </form>
          </div>

          {/* Navigation / Toggle Tabs */}
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => { setShowUpcoming(true); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                showUpcoming 
                  ? "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00] font-bold" 
                  : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
              }`}
            >
              // Upcoming_Events
            </button>
            <button
              onClick={() => { setShowUpcoming(false); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                !showUpcoming 
                  ? "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00] font-bold" 
                  : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200"
              }`}
            >
              // Past_Archive
            </button>
          </div>

          {/* Loading core */}
          {loading ? (
            <div className="text-center py-24 font-mono text-[#ccff00] animate-pulse text-xs tracking-widest">// LOADING EVENTS TIMELINE...</div>
          ) : events.length === 0 ? (
            <div className="glass-event-card py-20 rounded-3xl text-center max-w-md mx-auto">
              <div className="text-slate-600 text-3xl mb-2">◇</div>
              <p className="text-slate-400 font-light text-sm">אין כרגע אירועים זמינים בחתך המבוקש.</p>
            </div>
          ) : (
            <>
              {/* Main Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {events.map(event => {
                  const past = isPast(event.date);
                  return (
                    <div key={event._id} className="glass-event-card rounded-2xl p-6 flex flex-col justify-between min-h-[300px]">
                      <div>
                        {/* Tags / Badges row */}
                        <div className="flex items-center justify-between mb-3.5">
                          <span className="font-mono text-[10px] text-slate-500">{formatDate(event.date)}</span>
                          <span className={`font-mono text-[9px] px-2 py-0.5 rounded border uppercase ${
                            event.isOnline 
                              ? "bg-[#ccff00]/5 border-[#ccff00]/10 text-[#ccff00]" 
                              : "bg-white/5 border-white/5 text-slate-400"
                          }`}>
                            {event.isOnline ? "Online" : "Physical"}
                          </span>
                        </div>

                        {/* Title */}
                        <Link to={`/events/${event._id}`} className="block focus:outline-none">
                          <h2 className="text-lg font-bold text-slate-100 hover:text-[#ccff00] transition-colors mb-2 line-clamp-2 leading-tight">
                            {event.title}
                          </h2>
                        </Link>

                        {/* Description Summary */}
                        {event.description && (
                          <div className="text-xs text-slate-400 font-light leading-relaxed mb-4 line-clamp-3">
                            <MarkdownRenderer source={(event.description || "").slice(0, 110) + (event.description.length > 110 ? "..." : "")} />
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Section */}
                      <div className="pt-4 border-t border-white/5 mt-4 flex gap-2">
                        {!past && (
                          <button 
                            onClick={() => handleAttend(event._id)} 
                            className={`flex-1 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                              event._attending 
                                ? "bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00]" 
                                : "neon-action-btn bg-transparent rounded-xl"
                            }`}
                          >
                            {event._attending ? "✓ Attending" : "Join_Event"}
                          </button>
                        )}
                        <button 
                          onClick={() => handleLike(event._id)} 
                          className={`px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs font-mono transition-all flex items-center justify-center gap-1 ${
                            event._liked ? "border-rose-500/20 text-rose-400 bg-rose-500/5" : "hover:text-rose-400 hover:border-rose-500/10"
                          }`}
                        >
                          ♥ {event.likes?.length || 0}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 font-mono mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-9 h-9 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-sm disabled:opacity-30 hover:border-[#ccff00]/40 transition-colors"
                  >
                    ←
                  </button>
                  <span className="text-xs text-slate-500 px-2">עמוד {page} מתוך {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="w-9 h-9 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-sm disabled:opacity-30 hover:border-[#ccff00]/40 transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}