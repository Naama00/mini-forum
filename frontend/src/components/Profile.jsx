import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    <div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="text-4xl animate-spin mb-4">⏳</div><span className="text-gray-400 font-mono text-sm">טוען פרופיל דיגיטלי...</span></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="bg-rose-500/20 border border-rose-500/40 px-6 py-4 rounded-lg mb-4 text-rose-400">שגיאה: {error}</div><button className="px-5 py-2.5 bg-cyan-500 text-gray-900 border-none font-bold text-sm cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/50" onClick={() => navigate("/")}>חזור לבית</button></div>
    </div>
  );

  const topics = profile?.topics || [];
  const posts = profile?.posts || [];
  const totalVotes = (profile?.votes || 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 rtl animate-fade-in">
      {/* TOPBAR */}
      <div className="flex items-center justify-between mb-8">
        <a href="/" className="text-2xl font-black text-white no-underline">Dev<span className="text-cyan-500">Hub</span></a>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/3 border border-white/8 text-gray-400 font-sans text-sm font-semibold cursor-pointer transition-all hover:border-cyan-500/40 hover:text-cyan-500" onClick={() => navigate("/")}>← בית</button>
          {loggedIn && (
            <button className="px-4 py-2 bg-white/3 border border-white/8 text-gray-400 font-sans text-sm font-semibold cursor-pointer transition-all hover:border-rose-500/40 hover:text-rose-500" onClick={handleLogout}>התנתק</button>
          )}
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="bg-white/3 border border-white/10 rounded-3xl px-10 py-10 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 h-24 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 z-0" />

        <div className="flex items-center gap-10 relative z-1 rtl">
          {/* AVATAR */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/20">
              {profile?.icon && !imgErr ? (
                <img src={profile.icon} alt="avatar" className="w-full h-full rounded-full bg-gray-900 object-cover border-4 border-gray-900" onError={() => setImgErr(true)} />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-900 text-4xl font-bold text-cyan-500 flex items-center justify-center border-4 border-gray-900">{avatarInitials(profile?.firstName, profile?.lastName)}</div>
              )}
            </div>
            {profile?.isConnected && <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-green-500 border-2 border-gray-900" />}
          </div>

          {/* INFO */}
          <div className="flex-1">
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="px-4 py-2 bg-white/3 border border-white/8 text-gray-100 font-sans text-sm outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20" value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} placeholder="שם פרטי" />
                <input className="px-4 py-2 bg-white/3 border border-white/8 text-gray-100 font-sans text-sm outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20" value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} placeholder="שם משפחה" />
                <input className="px-4 py-2 bg-white/3 border border-white/8 text-gray-100 font-sans text-sm outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20 md:col-span-2" value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} placeholder="עיר מגורים" />
                <div className="flex gap-3 md:col-span-2">
                  <button className="px-5 py-2 bg-cyan-500 text-gray-900 border-none font-bold text-xs cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50" onClick={handleSave} disabled={saving}>
                    {saving ? "שומר..." : "שמור שינויים"}
                  </button>
                  <button className="px-5 py-2 bg-white/3 border border-white/8 text-gray-400 font-bold text-xs cursor-pointer transition-all hover:border-white/20 hover:text-gray-200" onClick={() => setEditing(false)}>ביטול</button>
                </div>
                {saveError && <p className="text-rose-400 text-sm md:col-span-2">{saveError}</p>}
              </div>
            ) : (
              <div>
                <span className="font-mono text-xs text-cyan-500/70 tracking-widest">SYSTEM_USER_{userId.slice(-4)}</span>
                <h1 className="text-4xl font-black text-white mb-3 leading-tight">{profile?.firstName} {profile?.lastName}</h1>
                <div className="flex gap-3 flex-wrap mb-4 rtl">
                  <span className="text-xs bg-white/5 px-3 py-1.5 border border-white/10 text-gray-400">📍 {profile?.city || "Unknown_Sector"}</span>
                  <span className="text-xs bg-white/5 px-3 py-1.5 border border-white/10 text-gray-400">🕒 כניסה: {timeAgo(profile?.lastLogin)}</span>
                  {profile?.isVerifiedEmail && <span className="text-xs bg-green-500/10 px-3 py-1.5 border border-green-500/30 text-green-400">✓ VERIFIED_ACCOUNT</span>}
                </div>
                {isOwnProfile && <button className="px-4 py-2 bg-white/3 border border-white/8 text-gray-400 font-sans text-xs font-semibold cursor-pointer transition-all hover:border-cyan-500/40 hover:text-cyan-500" onClick={() => setEditing(true)}>✎ עריכת נתוני פרופיל</button>}
              </div>
            )}
          </div>

          {/* STATS */}
          <div className="flex gap-4">
            <div className="bg-white/3 px-5 py-4 rounded-xl min-w-24 text-center border border-white/8">
              <span className="block text-2xl font-black text-white">{topics.length}</span>
              <span className="block text-xs text-gray-600 uppercase tracking-wide">נושאים</span>
            </div>
            <div className="bg-cyan-500/10 px-5 py-4 rounded-xl min-w-24 text-center border border-cyan-500/20">
              <span className="block text-2xl font-black" style={{ color: totalVotes >= 0 ? "#00ff88" : "#ff4081" }}>
                {totalVotes >= 0 ? "+" : ""}{totalVotes}
              </span>
              <span className="block text-xs text-gray-600 uppercase tracking-wide">מוניטין</span>
            </div>
            <div className="bg-white/3 px-5 py-4 rounded-xl min-w-24 text-center border border-white/8">
              <span className="block text-2xl font-black text-white">{posts.length}</span>
              <span className="block text-xs text-gray-600 uppercase tracking-wide">תגובות</span>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div>
        <div className="flex gap-4 border-b border-white/10 mb-6 rtl">
          <button className={`px-6 py-4 font-sans font-semibold text-sm border-b-2 transition-all ${activeTab === "topics" ? "border-cyan-500 text-cyan-500" : "border-transparent text-gray-400 hover:text-gray-300"}`} onClick={() => setActiveTab("topics")}>
            דיונים שפתחתי <span className="text-xs bg-white/10 px-2 py-0.5 rounded ml-2">{topics.length}</span>
          </button>
          <button className={`px-6 py-4 font-sans font-semibold text-sm border-b-2 transition-all ${activeTab === "posts" ? "border-cyan-500 text-cyan-500" : "border-transparent text-gray-400 hover:text-gray-300"}`} onClick={() => setActiveTab("posts")}>
            תגובות בקהילה <span className="text-xs bg-white/10 px-2 py-0.5 rounded ml-2">{posts.length}</span>
          </button>
        </div>

        <div className="tab-panel">
          {activeTab === "topics" ? (
            topics.length === 0 ? (
              <div className="text-center py-12 text-gray-600 text-sm">אין נתונים להצגה במגזר זה</div>
            ) : (
              <div className="flex flex-col gap-3">
                {topics.map((t, i) => (
                  <a key={t._id || i} href={`/category?topicId=${t._id}`} className="flex items-center gap-3 px-4 py-3 bg-white/2 border border-white/5 no-underline text-inherit transition-all hover:bg-white/4 hover:border-white/10 rtl">
                    <span className="text-cyan-500">◈</span>
                    <div className="flex-1 min-w-0 rtl">
                      <span className="block text-sm font-semibold text-white truncate">{t.title}</span>
                      <span className="text-xs text-gray-600">{timeAgo(t.createdAt)}</span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">Votes: {t.votes ?? 0}</span>
                  </a>
                ))}
              </div>
            )
          ) : (
            posts.length === 0 ? (
              <div className="text-center py-12 text-gray-600 text-sm">לא נמצאו תגובות רשומות</div>
            ) : (
              <div className="flex flex-col gap-3">
                {posts.map((p, i) => (
                  <a key={p._id || i} href={p.topicId ? `/category?topicId=${p.topicId}` : "#"} className="flex items-center gap-3 px-4 py-3 bg-white/2 border border-white/5 no-underline text-inherit transition-all hover:bg-white/4 hover:border-white/10 rtl">
                    <span className="text-purple-400">◇</span>
                    <div className="flex-1 min-w-0 rtl">
                      <span className="block text-sm font-semibold text-white truncate">{(p.content || "").slice(0, 80)}...</span>
                      <span className="text-xs text-gray-600">{timeAgo(p.createdAt)}</span>
                    </div>
                    <span className="text-xs text-rose-400 flex-shrink-0">♥ {p.numberOfVotes ?? 0}</span>
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