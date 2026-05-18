import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLoggedInUserFromToken, getToken } from "../utils/storage";
import { useAuth } from '../hooks';

const API_BASE = "http://localhost:5000";

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
  const loggedIn = getLoggedInUserFromToken();
  const { logout } = useAuth();
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
      const token = getToken();
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
    if (logout) logout();
    navigate('/');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
      <div className="text-center">
        <div className="text-[#ccff00] animate-pulse font-mono uppercase tracking-tighter text-sm">
          Accessing Mainframe...
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
      <div className="text-center max-w-md px-4">
        <div className="bg-rose-500/10 border border-rose-500/30 px-6 py-4 rounded-2xl mb-6 text-rose-400 font-mono text-sm">
          CRITICAL_ERROR: {error}
        </div>
        <button className="neon-btn px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer" onClick={() => navigate("/")}>
          Return to Terminal
        </button>
      </div>
    </div>
  );

  const topics = profile?.topics || [];
  const posts = profile?.posts || [];
  const totalVotes = (profile?.votes || 0);

  return (
    <div className="relative min-h-screen overflow-hidden text-[#e2e8f0] pb-20" dir="rtl">
      {/* Background Layers */}
      <div className="dh-grid-bg" />
      <div className="ambient-glow -top-20 -left-20" />
      <div className="ambient-glow bottom-0 right-0 opacity-50" />

      <div className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
        {/* TOPBAR */}
        <div className="flex items-center justify-between mb-12">
          <a href="/" className="text-2xl font-black text-[#ccff00] tracking-tighter">DEV.HUB</a>
          <div className="flex gap-4">
            <button className="px-4 py-2 border border-white/5 bg-white/5 backdrop-blur-md rounded-xl text-sm font-medium hover:border-[#ccff00]/30 hover:text-[#ccff00] transition-all" onClick={() => navigate("/")}>
              ← בית
            </button>
            {loggedIn && (
              <button className="px-4 py-2 border border-white/5 bg-white/5 backdrop-blur-md rounded-xl text-sm font-medium hover:border-rose-500/30 hover:text-rose-400 transition-all" onClick={handleLogout}>
                התנתק
              </button>
            )}
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="glass-card rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            
            {/* AVATAR */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl p-[1px] bg-gradient-to-br from-[#ccff00] to-transparent shadow-lg">
                {profile?.icon && !imgErr ? (
                  <img src={profile.icon} alt="avatar" className="w-full h-full rounded-2xl bg-[#0a0a0c] object-cover border-2 border-[#0a0a0c]" onError={() => setImgErr(true)} />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-[#0a0a0c] text-3xl font-bold text-[#ccff00] flex items-center justify-center border-2 border-[#0a0a0c]">
                    {avatarInitials(profile?.firstName, profile?.lastName)}
                  </div>
                )}
              </div>
              {profile?.isConnected && (
                <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-[#ccff00] border-4 border-[#0a0a0c] live-pulse" />
              )}
            </div>

            {/* INFO */}
            <div className="flex-1 text-center md:text-right w-full">
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                  <input className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-100 text-sm outline-none focus:border-[#ccff00] transition-colors" value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} placeholder="שם פרטי" />
                  <input className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-100 text-sm outline-none focus:border-[#ccff00] transition-colors" value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} placeholder="שם משפחה" />
                  <input className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-100 text-sm outline-none focus:border-[#ccff00] transition-colors md:col-span-2" value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} placeholder="עיר מגורים" />
                  <div className="flex gap-3 md:col-span-2 mt-2">
                    <button className="neon-btn px-5 py-2 rounded-xl font-bold text-xs disabled:opacity-50" onClick={handleSave} disabled={saving}>
                      {saving ? "שומר..." : "שמור שינויים"}
                    </button>
                    <button className="px-5 py-2 border border-white/10 bg-white/5 rounded-xl font-bold text-xs text-slate-400 hover:text-white transition-colors" onClick={() => setEditing(false)}>ביטול</button>
                  </div>
                  {saveError && <p className="text-rose-400 text-sm md:col-span-2 font-mono">{saveError}</p>}
                </div>
              ) : (
                <div>
                  <span className="font-mono text-[10px] text-[#ccff00]/70 tracking-widest block mb-1">SYSTEM_USER_{userId.slice(-4).toUpperCase()}</span>
                  <h1 className="text-3xl font-black text-white mb-4 leading-tight">{profile?.firstName} {profile?.lastName}</h1>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                    <span className="text-xs bg-white/5 px-3 py-1.5 border border-white/5 rounded-xl text-slate-400">📍 {profile?.city || "Unknown_Sector"}</span>
                    <span className="text-xs bg-white/5 px-3 py-1.5 border border-white/5 rounded-xl text-slate-400">🕒 כניסה: {timeAgo(profile?.lastLogin)}</span>
                    {profile?.isVerifiedEmail && <span className="text-xs bg-[#ccff00]/10 px-3 py-1.5 border border-[#ccff00]/20 rounded-xl text-[#ccff00] font-mono tracking-wide">✓ VERIFIED_SECURE</span>}
                  </div>

                  {isOwnProfile && (
                    <button className="px-4 py-2 border border-white/10 bg-white/5 rounded-xl text-slate-300 text-xs font-bold hover:border-[#ccff00]/40 hover:text-[#ccff00] transition-all" onClick={() => setEditing(true)}>
                      ✎ עריכת נתוני פרופיל
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* STATS */}
            <div className="flex gap-4 w-full md:w-auto justify-center">
              <div className="glass-card px-5 py-4 rounded-2xl min-w-[90px] text-center">
                <span className="block text-2xl font-black text-white">{topics.length}</span>
                <span className="block text-[10px] text-slate-500 font-bold tracking-wider mt-1">נושאים</span>
              </div>
              <div className="px-5 py-4 rounded-2xl min-w-[90px] text-center border bg-[#ccff00]/5 border-[#ccff00]/20">
                <span className="block text-2xl font-black text-[#ccff00]">
                  {totalVotes >= 0 ? "+" : ""}{totalVotes}
                </span>
                <span className="block text-[10px] text-[#ccff00]/60 font-bold tracking-wider mt-1">מוניטין</span>
              </div>
              <div className="glass-card px-5 py-4 rounded-2xl min-w-[90px] text-center">
                <span className="block text-2xl font-black text-white">{posts.length}</span>
                <span className="block text-[10px] text-slate-500 font-bold tracking-wider mt-1">תגובות</span>
              </div>
            </div>

          </div>
        </section>

        {/* TABS */}
        <div className="mt-12">
          <div className="flex gap-6 border-b border-white/5 mb-8">
            <button className={`pb-4 font-sans font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === "topics" ? "border-[#ccff00] text-[#ccff00]" : "border-transparent text-slate-500 hover:text-slate-300"}`} onClick={() => setActiveTab("topics")}>
              דיונים שפתחתי <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md mr-1 text-white">{topics.length}</span>
            </button>
            <button className={`pb-4 font-sans font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === "posts" ? "border-[#ccff00] text-[#ccff00]" : "border-transparent text-slate-500 hover:text-slate-300"}`} onClick={() => setActiveTab("posts")}>
              תגובות בקהילה <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md mr-1 text-white">{posts.length}</span>
            </button>
          </div>

          <div>
            {activeTab === "topics" ? (
              topics.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-2xl text-slate-500 text-sm font-mono uppercase tracking-wider">No active logs found in this sector</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {topics.map((t, i) => (
                    <a key={t._id || i} href={`/category?topicId=${t._id}`} className="glass-card flex items-center gap-4 px-6 py-4 rounded-2xl no-underline text-inherit group">
                      <span className="text-[#ccff00] text-lg group-hover:animate-pulse">◈</span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-white group-hover:text-[#ccff00] transition-colors truncate">{t.title}</span>
                        <span className="text-xs text-slate-500 font-mono mt-1 block">{timeAgo(t.createdAt)}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/5 px-2 py-1 rounded-md">VOTES: {t.votes ?? 0}</span>
                    </a>
                  ))}
                </div>
              )
            ) : (
              posts.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-2xl text-slate-500 text-sm font-mono uppercase tracking-wider">Transmission database empty</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {posts.map((p, i) => (
                    <a key={p._id || i} href={p.topicId ? `/category?topicId=${p.topicId}` : "#"} className="glass-card flex items-center gap-4 px-6 py-4 rounded-2xl no-underline text-inherit group">
                      <span className="text-[#ccff00] opacity-60 text-lg">◇</span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">{(p.content || "").slice(0, 80)}...</span>
                        <span className="text-xs text-slate-500 font-mono mt-1 block">{timeAgo(p.createdAt)}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#ccff00] bg-[#ccff00]/5 border border-[#ccff00]/10 px-2 py-1 rounded-md">▲ {p.numberOfVotes ?? 0}</span>
                    </a>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}