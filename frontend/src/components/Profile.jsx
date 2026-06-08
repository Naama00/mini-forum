import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getLoggedInUserFromToken, getToken } from "../utils/storage";
import { useAuth } from "../hooks";
import { timeAgo } from "../utils/formatters";
import CityAutocomplete from "./CityAutocomplete";

import { API_BASE } from "../utils/constants";

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
    navigate("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      טוען פרופיל...
    </div>
  );

  if (error) return (
    <div className="page-shell flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900/60 p-10 text-center">
        <p className="text-red-400 mb-6">{error}</p>
        <Link to="/" className="inline-flex px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold">
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );

  const topics = profile?.topics || [];
  const posts = profile?.posts || [];
  const totalVotes = profile?.votes || 0;

  return (
    <div dir="rtl" className="page-shell">
      {/* רקע */}
      <div className="page-bg">
        <div className="page-bg-blob page-bg-blob--cyan" />
        <div className="page-bg-blob page-bg-blob--violet" />
        <div className="page-bg-grid" />
      </div>

      <div className="page-container">

        {/* ── כותרת עמוד ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-sm text-cyan-300 font-medium">PROFILE</span>
            </div>
            <h1 className="text-5xl font-black mb-4">
              <span className="text-white">{profile?.firstName}</span>{" "}
              <span className="text-gradient">{profile?.lastName}</span>
            </h1>
            <p className="text-slate-400 max-w-xl">
              {profile?.city && `📍 ${profile.city} · `}
              כניסה אחרונה {timeAgo(profile?.lastLogin)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate("/")} className="button-secondary">
              חזור לדיונים
            </button>
            {isOwnProfile && !editing && (
              <button onClick={() => setEditing(true)} className="button-primary">
                ✎ ערוך פרופיל
              </button>
            )}
            {isOwnProfile && (
              <button onClick={handleLogout} className="px-5 py-3 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-semibold">
                התנתק
              </button>
            )}
          </div>
        </div>

        {/* ── כרטיס פרופיל ── */}
        <div className="section-card section-card-lg mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* אווטר */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 p-[2px]">
                {profile?.icon && !imgErr ? (
                  <img
                    src={profile.icon}
                    alt="avatar"
                    className="w-full h-full rounded-2xl object-cover bg-slate-900"
                    onError={() => setImgErr(true)}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-3xl font-black text-white">
                    {avatarInitials(profile?.firstName, profile?.lastName)}
                  </div>
                )}
              </div>
              {profile?.isVerifiedEmail && (
                <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-cyan-400 border-4 border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-black">✓</div>
              )}
            </div>

            {/* מידע / טופס עריכה */}
            <div className="flex-1 text-center md:text-right w-full">
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">שם פרטי</label>
                    <input className="form-input" value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} placeholder="שם פרטי" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">שם משפחה</label>
                    <input className="form-input" value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} placeholder="שם משפחה" />
                  </div>
                  <div className="md:col-span-2">
                    <CityAutocomplete
                      label="עיר מגורים"
                      name="city"
                      placeholder="בחר עיר בישראל"
                      value={editForm.city}
                      onChange={e => setEditForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                    />
                  </div>
                  {saveError && <p className="text-rose-400 text-sm md:col-span-2">{saveError}</p>}
                  <div className="flex gap-3 md:col-span-2">
                    <button onClick={handleSave} disabled={saving} className="button-primary">
                      {saving ? "שומר..." : "שמור שינויים"}
                    </button>
                    <button onClick={() => setEditing(false)} className="button-secondary">
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-black text-white mb-3">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {profile?.city && (
                      <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs">
                        📍 {profile.city}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs">
                      🕒 {timeAgo(profile?.lastLogin)}
                    </span>
                    {profile?.isVerifiedEmail && (
                      <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                        ✓ מאומת
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* סטטיסטיקה */}
            <div className="flex gap-4 flex-shrink-0">
              {[
                { value: topics.length, label: "נושאים", accent: false },
                { value: (totalVotes >= 0 ? "+" : "") + totalVotes, label: "מוניטין", accent: true },
                { value: posts.length, label: "תגובות", accent: false },
              ].map(stat => (
                <div key={stat.label} className={`px-5 py-4 rounded-2xl min-w-[80px] text-center border ${stat.accent ? "bg-cyan-500/10 border-cyan-500/20" : "bg-slate-800/50 border-slate-700"}`}>
                  <span className={`block text-2xl font-black ${stat.accent ? "text-cyan-300" : "text-white"}`}>{stat.value}</span>
                  <span className="block text-[10px] text-slate-500 font-bold tracking-wider mt-1 uppercase">{stat.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── טאבים ── */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-0">
          {[
            { key: "topics", label: "דיונים שפתחתי", count: topics.length },
            { key: "posts", label: "תגובות בקהילה", count: posts.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
              <span className="mr-2 text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md text-slate-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── תוכן טאב ── */}
        {activeTab === "topics" ? (
          topics.length === 0 ? (
            <div className="card-empty">
              <p className="text-slate-400">עדיין לא נפתחו דיונים על ידי משתמש זה.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((t, i) => (
                <a key={t._id || i} href={`/category?topicId=${t._id}`} className="group section-card section-card-md section-shadow-hover flex items-center gap-4 no-underline text-inherit">
                  <span className="text-cyan-400 text-lg flex-shrink-0">◈</span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">{t.title}</span>
                    <span className="text-xs text-slate-500 mt-1 block">{timeAgo(t.createdAt)}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl flex-shrink-0">
                    ▲ {t.votes ?? 0}
                  </span>
                </a>
              ))}
            </div>
          )
        ) : (
          posts.length === 0 ? (
            <div className="card-empty">
              <p className="text-slate-400">עדיין לא נכתבו תגובות על ידי משתמש זה.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((p, i) => (
                <a key={p._id || i} href={p.topicId ? `/category?topicId=${p.topicId}` : "#"} className="group section-card section-card-md section-shadow-hover flex items-center gap-4 no-underline text-inherit">
                  <span className="text-slate-600 text-lg flex-shrink-0 group-hover:text-cyan-400 transition-colors">◇</span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                      {(p.content || "").slice(0, 90)}...
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">{timeAgo(p.createdAt)}</span>
                  </div>
                  <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl flex-shrink-0">
                    ▲ {p.numberOfVotes ?? 0}
                  </span>
                </a>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
}