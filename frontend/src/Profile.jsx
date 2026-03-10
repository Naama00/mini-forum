import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./css/Profile.css";
const API_BASE = "http://localhost:5000";

// לוגיקה קיימת שלך
function getLoggedInUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch { return null; }
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "עכשיו";
  if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דק'`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שע'`;
  if (diff < 604800) return `לפני ${Math.floor(diff / 86400)} ימים`;
  return new Date(dateStr).toLocaleDateString("he-IL");
}

function avatarInitials(firstName = "", lastName = "") {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?";
}

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const loggedIn = getLoggedInUser();
  const isOwnProfile = loggedIn?.userId === userId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("topics");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/users/${userId}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(res => {
        if (!res.success) throw new Error(res.message);
        setProfile(res.data);
        setEditForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          city: res.data.city || "",
        });
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "שגיאה בשמירה");
      setProfile(p => ({ ...p, ...editForm }));
      setEditing(false);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  if (loading) return (
    <div className="state-center">
      <div className="big-spinner" />
      <span className="loading-text">טוען פרופיל דיגיטלי...</span>
    </div>
  );

  if (error) return (
    <div className="state-center">
      <div className="error-box">שגיאה: {error}</div>
      <button className="cyber-btn-small" onClick={() => navigate("/")}>חזור לבית</button>
    </div>
  );

  const topics = profile?.topics || [];
  const posts = profile?.posts || [];
  const totalVotes = (profile?.votes || 0);

  return (
    <div className="profile-wrapper fade-in">
      <div className="profile-topbar">
        <a href="/" className="profile-topbar-logo">Dev<span>Hub</span></a>
        <div className="profile-topbar-actions">
          <button className="topbar-home-btn" onClick={() => navigate("/")}>← בית</button>
          {loggedIn && (
            <button className="topbar-logout-btn" onClick={handleLogout}>התנתק</button>
          )}
        </div>
      </div>
      {/* HERO SECTION - מראה הייטקי חדש */}
      <section className="profile-hero-modern">
        <div className="hero-glass-bg" />

        <div className="hero-layout">
          <div className="profile-avatar-container">
            <div className="avatar-ring">
              {profile?.icon && !imgErr ? (
                <img src={profile.icon} alt="avatar" className="main-avatar-img" onError={() => setImgErr(true)} />
              ) : (
                <div className="main-avatar-initials">{avatarInitials(profile?.firstName, profile?.lastName)}</div>
              )}
            </div>
            {profile?.isConnected && <div className="status-indicator online" />}
          </div>

          <div className="profile-info-content">
            {editing ? (
              <div className="profile-edit-grid">
                <input className="cyber-input" value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} placeholder="שם פרטי" />
                <input className="cyber-input" value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} placeholder="שם משפחה" />
                <input className="cyber-input full-width" value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} placeholder="עיר מגורים" />
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? <div className="mini-spinner" /> : "שמור שינויים"}
                  </button>
                  <button className="cancel-btn" onClick={() => setEditing(false)}>ביטול</button>
                </div>
                {saveError && <p className="error-text">{saveError}</p>}
              </div>
            ) : (
              <div className="info-display">
                <span className="profile-tag">SYSTEM_USER_{userId.slice(-4)}</span>
                <h1 className="user-full-name">{profile?.firstName} {profile?.lastName}</h1>
                <div className="user-meta-tags">
                  <span className="meta-tag">📍 {profile?.city || "Unknown_Sector"}</span>
                  <span className="meta-tag">🕒 כניסה: {timeAgo(profile?.lastLogin)}</span>
                  {profile?.isVerifiedEmail && <span className="meta-tag verified">VERIFIED_ACCOUNT</span>}
                </div>
                {isOwnProfile && <button className="edit-trigger-btn" onClick={() => setEditing(true)}>✎ עריכת נתוני פרופיל</button>}
              </div>
            )}
          </div>

          <div className="profile-stats-dashboard">
            <div className="stat-card">
              <span className="stat-value">{topics.length}</span>
              <span className="stat-label">נושאים</span>
            </div>
            <div className="stat-card accent">
              <span className="stat-value" style={{ color: totalVotes >= 0 ? "#00ff88" : "#ff4081" }}>
                {totalVotes >= 0 ? "+" : ""}{totalVotes}
              </span>
              <span className="stat-label">מוניטין</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{posts.length}</span>
              <span className="stat-label">תגובות</span>
            </div>
          </div>
        </div>
      </section>

      {/* TABS SECTION */}
      <div className="content-tabs-wrapper">
        <div className="tabs-nav">
          <button className={`tab-btn ${activeTab === "topics" ? "active" : ""}`} onClick={() => setActiveTab("topics")}>
            דיונים שפתחתי <span>{topics.length}</span>
          </button>
          <button className={`tab-btn ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
            תגובות בקהילה <span>{posts.length}</span>
          </button>
        </div>

        <div className="tab-panel">
          {activeTab === "topics" ? (
            topics.length === 0 ? (
              <div className="empty-state">אין נתונים להצגה במגזר זה</div>
            ) : (
              <div className="cyber-list">
                {topics.map((t, i) => (
                  <a key={t._id || i} href={`/category?topicId=${t._id}`} className="cyber-list-item">
                    <div className="item-prefix">◈</div>
                    <div className="item-info">
                      <span className="item-title">{t.title}</span>
                      <span className="item-date">{timeAgo(t.createdAt)}</span>
                    </div>
                    <div className="item-suffix">Votes: {t.votes ?? 0}</div>
                  </a>
                ))}
              </div>
            )
          ) : (
            posts.length === 0 ? (
              <div className="empty-state">לא נמצאו תגובות רשומות</div>
            ) : (
              <div className="cyber-list">
                {posts.map((p, i) => (
                  <a key={p._id || i} href={p.topicId ? `/category?topicId=${p.topicId}` : "#"} className="cyber-list-item post">
                    <div className="item-prefix">◇</div>
                    <div className="item-info">
                      <span className="item-title content-preview">{(p.content || "").slice(0, 80)}...</span>
                      <span className="item-date">{timeAgo(p.createdAt)}</span>
                    </div>
                    <div className="item-suffix hearts">♥ {p.numberOfVotes ?? 0}</div>
                  </a>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>

  );
}