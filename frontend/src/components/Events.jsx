import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import MarkdownRenderer from "./MarkdownRenderer";

const API = "http://localhost:5000/api";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function isPast(dateStr) { return new Date(dateStr) < new Date(); }

export default function EventsPage() {
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setEvents(data.events || []);
      setTotalPages(data.pages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [page, showUpcoming]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchEvents(); };

  const handleAttend = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    const res = await fetch(`${API}/events/${id}/attend`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setEvents(prev => prev.map(ev => ev._id === id ? { ...ev, attendees: Array(data.attendees).fill(null), _attending: data.attending } : ev));
  };

  const handleLike = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    const res = await fetch(`${API}/events/${id}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setEvents(prev => prev.map(ev => ev._id === id ? { ...ev, likes: Array(data.likes).fill(null), _liked: data.liked } : ev));
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <Breadcrumb />
      <div className="py-13 relative z-1 rtl">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-7">
          <div>
            <p className="font-mono text-xs tracking-widest text-cyan-500 uppercase mb-2.5">// אירועים</p>
            <h1 className="text-4xl font-black text-white mb-2 leading-tight">אירועי <span className="text-cyan-500">הייטק</span> ישראל</h1>
            <p className="text-sm text-gray-400 leading-relaxed">כנסים, מיטאפים, האקתונים ואירועי קהילה</p>
          </div>
          <Link to="/events/new" className="inline-flex items-center gap-2 px-5.5 py-2.75 bg-transparent border border-cyan-500 text-cyan-500 font-sans text-xs font-bold no-underline uppercase tracking-widest cursor-pointer transition-all hover:bg-cyan-500 hover:text-gray-900 hover:shadow-lg hover:shadow-cyan-500/50 whitespace-nowrap">+ פרסם אירוע</Link>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-3 flex-wrap mb-5 rtl">
          <div className="flex items-center gap-2.5 bg-white/3 border border-white/8 px-4 py-2.5 flex-1 min-w-56 max-w-96 transition-all focus-within:border-cyan-500 focus-within:shadow-lg focus-within:shadow-cyan-500/50 focus-within:bg-white/5">
            <span className="text-cyan-500/50 text-base flex-shrink-0">🔍</span>
            <input className="bg-none border-none outline-none text-gray-100 font-sans text-sm w-full rtl placeholder:text-gray-600" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש אירועים..." />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-cyan-500 text-gray-900 border-none font-sans text-xs font-bold cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/50 flex-shrink-0">חפש</button>
        </form>
      </div>

      <div className="flex gap-1 bg-white/3 border border-white/8 p-1 w-fit rtl mb-6">
        <button className={`px-5 py-2 bg-transparent border-none text-gray-400 font-sans text-xs font-semibold cursor-pointer transition-all ${showUpcoming ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" : "hover:text-white"}`} onClick={() => { setShowUpcoming(true); setPage(1); }}>אירועים קרובים</button>
        <button className={`px-5 py-2 bg-transparent border-none text-gray-400 font-sans text-xs font-semibold cursor-pointer transition-all ${!showUpcoming ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" : "hover:text-white"}`} onClick={() => { setShowUpcoming(false); setPage(1); }}>כל האירועים</button>
      </div>

      <div className="flex items-center gap-3 mb-5 rtl">
        <div className="flex-1 h-px bg-cyan-500/10" />
        <span className="font-mono text-xs tracking-wide text-cyan-500/50">// {events.length} אירועים</span>
        <div className="flex-1 h-px bg-cyan-500/10" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm font-mono">טוען אירועים...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-600 text-sm"><div className="text-4xl mb-3 opacity-30">📅</div>אין אירועים</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 rtl">
          {events.map(event => <EventCard key={event._id} event={event} onAttend={handleAttend} onLike={handleLike} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10 rtl">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 bg-white/3 border border-white/8 text-gray-400 font-sans text-sm font-semibold cursor-pointer transition-all ${p === page ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "hover:border-cyan-500 hover:text-cyan-500"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onAttend, onLike }) {
  const past = isPast(event.date);
  return (
    <div className={`bg-gradient-to-br from-white/2 to-cyan-500/1 border border-cyan-500/8 rounded-3xl relative overflow-hidden transition-all duration-350 animate-fade-in flex flex-col shadow-lg ${!past ? "hover:border-cyan-500/25 hover:bg-gradient-to-br hover:from-white/5 hover:to-cyan-500/2 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/8 group" : "opacity-55"}`}>
      <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 transition-all ${!past ? "group-hover:w-full" : ""}`} />
      <div className={`flex items-center justify-between px-4.5 py-2.75 border-b ${past ? "bg-white/2 border-white/5" : "bg-cyan-500/5 border-cyan-500/10"} rtl`}>
        <span className={`font-mono text-xs font-medium ${past ? "text-gray-400" : "text-cyan-500"}`}>📅 {formatDate(event.date)}</span>
        {past && <span className="font-mono text-xs px-2.5 py-0.5 border border-white/10 text-gray-600 tracking-wide">עבר</span>}
      </div>
      <div className="px-5.5 py-5 flex-1 flex flex-col rtl">
        <Link to={`/events/${event._id}`} className="font-sans text-base font-bold text-white no-underline mb-2 leading-relaxed block transition-colors hover:text-cyan-500">{event.title}</Link>
        <p className="text-xs text-gray-400 mb-2.5 flex items-center gap-1">📍 {event.location}</p>
        <div className="text-sm text-gray-400 leading-relaxed mb-4 flex-1"><MarkdownRenderer source={(event.description || "").slice(0, 100) + (event.description && event.description.length > 100 ? "..." : "")} /></div>
        <div className="flex gap-2 flex-wrap rtl">
          {!past && (
            <button onClick={() => onAttend(event._id)} className={`flex-1 px-4 py-2.25 border border-cyan-500 text-cyan-500 font-sans text-xs font-bold cursor-pointer transition-all min-w-24 ${event._attending ? "bg-cyan-500 text-gray-900 hover:shadow-lg hover:shadow-cyan-500/50" : "bg-transparent hover:bg-cyan-500 hover:text-gray-900 hover:shadow-lg hover:shadow-cyan-500/50"}`}>
              {event._attending ? "✓ נרשמת" : "הירשם לאירוע"}
            </button>
          )}
          <button onClick={() => onLike(event._id)} className={`px-3.5 py-2.25 bg-white/3 border border-white/8 text-gray-400 font-sans text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${event._liked ? "border-rose-500/40 text-rose-500" : "hover:border-rose-500/40 hover:text-rose-500"}`}>
            ♥ {event.likes?.length || 0}
          </button>
          <Link to={`/events/${event._id}`} className="px-3.5 py-2.25 bg-white/3 border border-white/8 text-gray-400 font-sans text-xs font-semibold no-underline flex items-center gap-1 transition-all hover:border-cyan-500/40 hover:text-cyan-500">
            💬 {event.comments?.length || 0}
          </Link>
        </div>
      </div>
    </div>
  );
}