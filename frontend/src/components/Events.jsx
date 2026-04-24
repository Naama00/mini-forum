import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import "../css/Events.css";
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
    <div className="main">
      <Breadcrumb />
      <div className="events-header">
        <div className="events-header-top">
          <div>
            <p className="events-section-label">// אירועים</p>
            <h1 className="events-title">אירועי <span>הייטק</span> ישראל</h1>
            <p className="events-subtitle">כנסים, מיטאפים, האקתונים ואירועי קהילה</p>
          </div>
          <Link to="/events/new" className="post-event-btn">+ פרסם אירוע</Link>
        </div>
        <form onSubmit={handleSearch} className="events-toolbar">
          <div className="events-search">
            <span className="events-search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש אירועים..." />
          </div>
          <button type="submit" className="events-search-btn">חפש</button>
        </form>
      </div>

      <div className="events-filter-tabs">
        <button className={`events-tab${showUpcoming ? " active" : ""}`} onClick={() => { setShowUpcoming(true); setPage(1); }}>אירועים קרובים</button>
        <button className={`events-tab${!showUpcoming ? " active" : ""}`} onClick={() => { setShowUpcoming(false); setPage(1); }}>כל האירועים</button>
      </div>

      <div className="events-divider">
        <div className="events-divider-line" />
        <span className="events-divider-text">// {events.length} אירועים</span>
        <div className="events-divider-line" />
      </div>

      {loading ? (
        <div className="events-loading">טוען אירועים...</div>
      ) : events.length === 0 ? (
        <div className="events-empty"><div className="events-empty-icon">📅</div>אין אירועים</div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <EventCard key={event._id} event={event} onAttend={handleAttend} onLike={handleLike} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="events-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`page-btn${p === page ? " active" : ""}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onAttend, onLike }) {
  const past = isPast(event.date);
  return (
    <div className={`event-card${past ? " past" : ""}`}>
      <div className="event-date-banner">
        <span className="event-date-text">📅 {formatDate(event.date)}</span>
        {past && <span className="event-past-badge">עבר</span>}
      </div>
      <div className="event-card-body">
        <Link to={`/events/${event._id}`} className="event-card-title">{event.title}</Link>
        <p className="event-card-location">📍 {event.location}</p>
        <div className="event-card-desc"><MarkdownRenderer source={(event.description || "").slice(0, 100) + (event.description && event.description.length > 100 ? "..." : "")} /></div>
        <div className="event-card-actions">
          {!past && (
            <button onClick={() => onAttend(event._id)} className={`event-attend-btn${event._attending ? " attending" : ""}`}>
              {event._attending ? "✓ נרשמת" : "הירשם לאירוע"}
            </button>
          )}
          <button onClick={() => onLike(event._id)} className={`event-like-btn${event._liked ? " liked" : ""}`}>
            ♥ {event.likes?.length || 0}
          </button>
          <Link to={`/events/${event._id}`} className="event-comments-link">
            💬 {event.comments?.length || 0}
          </Link>
        </div>
      </div>
    </div>
  );
}