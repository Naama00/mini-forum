import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE } from "../utils/constants";

function getUser() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        return JSON.parse(atob(token.split(".")[1]));
    } catch { return null; }
}

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [trending, setTrending] = useState([]);
    const [profile, setProfile] = useState(null);
    const [imgErr, setImgErr] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                // שליפת נושאים חמים
                const trendingRes = await fetch(`${API_BASE}/api/trending`, { signal: controller.signal });
                if (trendingRes.ok) {
                    const data = await trendingRes.json();
                    if (isMounted) setTrending(Array.isArray(data.data) ? data.data.slice(0, 5) : []);
                }

                // שליפת פרטי משתמש
                const tokenUser = getUser();
                if (tokenUser?.userId) {
                    const userRes = await fetch(`${API_BASE}/api/users/${tokenUser.userId}`, { signal: controller.signal });
                    if (userRes.ok) {
                        const res = await userRes.json();
                        if (res.success && isMounted) {
                            setProfile(res.data);
                        }
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError' && isMounted) {
                    console.error('Sidebar fetch error:', err);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const isActive = (path) => location.pathname === path;
    const tokenUser = getUser();

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const initials = profile?.firstName
        ? `${profile.firstName[0]}${profile.lastName?.[0] || ""}`.toUpperCase()
        : "?";

    return (
        <aside 
          className="w-56 h-screen max-h-screen bg-gray-950/85 backdrop-blur-2xl border-r border-cyan-500/10 px-4 py-6 flex flex-col gap-0 z-40 rtl overflow-y-auto overflow-x-hidden scrollbar-hide flex-shrink-0 sticky top-0"
          style={{ position: 'sticky', top: 0, height: '100vh' }}
        >
            <div className="absolute -top-16 -right-32 w-72 h-72 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />

            {/* משתמש */}
           {profile ? (
    <div className="bg-cyan-500/3 border border-cyan-500/12 p-4 relative overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${tokenUser.userId}`)} style={{ backgroundImage: 'linear-gradient(180deg, rgba(0,229,255,0.02) 0%, transparent 100%)' }}>
        <div className="before:absolute before:top-0 before:right-0 before:left-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-cyan-500 before:to-transparent before:opacity-50" />
        <div className="flex items-center gap-3 mb-3.5 rtl">
            <div className="relative flex-shrink-0">
                {profile.icon && !imgErr ? (
                    <img src={profile.icon} alt={initials} className="w-12 h-12 rounded-full border-2 border-cyan-500 object-cover flex items-center justify-center shadow-lg shadow-cyan-500/20 relative z-2" onError={() => setImgErr(true)} />
                ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-cyan-500 bg-cyan-500/8 text-cyan-500 font-sans text-lg font-black flex items-center justify-center shadow-lg shadow-cyan-500/20 relative z-2">{initials}</div>
                )}
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950 shadow-lg shadow-green-500/60 z-3" />
            </div>
            <div className="min-w-0">
                <span className="block font-sans text-sm font-black text-white text-shadow shadow-cyan-500/30 whitespace-nowrap overflow-hidden text-ellipsis mb-1 group-hover:text-cyan-500 transition-colors">{profile.firstName} {profile.lastName}</span>
                <span className="inline-flex items-center gap-1.25 text-xs tracking-wide text-cyan-500 bg-cyan-500/8 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.25 h-1.25 bg-green-500 rounded-full shadow-lg shadow-green-500" />
                    {profile.isAdmin ? "Admin" : "חבר פעיל"}
                </span>
            </div>
            <button className="mr-auto flex-shrink-0 bg-transparent border border-rose-500/25 text-rose-500/70 px-2 py-1.5 font-sans text-xs cursor-pointer transition-all hover:bg-rose-500/8 hover:text-rose-500" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                התנתק
            </button>
        </div>
    </div>
) : (
    <div className="text-center px-3 py-5 border border-dashed border-white/8 flex-shrink-0">
        <div className="text-3xl text-cyan-500/40 mb-2.5">◈</div>
        <p className="text-xs text-slate-300/35 leading-relaxed mb-3.5">הצטרף לקהילה</p>
        <Link to="/auth" className="block bg-cyan-500 text-gray-950 px-2.5 py-1.5 no-underline font-sans font-bold text-xs transition-all hover:bg-white hover:shadow-lg hover:shadow-cyan-500/30">כניסה / הרשמה</Link>
    </div>
)}

            <div className="h-px bg-white/5 my-4 flex-shrink-0" />

            {/* ניווט */}
            <nav className="mb-1">
                <div className="text-xs tracking-widest text-cyan-500/55 mb-3 font-bold">// ניווט</div>
                <ul className="list-none flex flex-col gap-0.5">
                    {[
                        { to: "/", icon: "◉", label: "דף הבית" },
                        { to: "/articles", icon: "◎", label: "מאמרים" },
                        { to: "/events", icon: "◆", label: "אירועים" },
                        { to: "/jobs", icon: "◇", label: "משרות" },
                        { to: "/notifications", icon: "◐", label: "התראות" },
                    ].map(({ to, icon, label }) => (
                        <li key={to}>
                            <Link to={to} className={`flex items-center gap-2.5 px-3 py-2.25 text-slate-300/45 no-underline text-sm transition-all border-r-2 border-transparent ${isActive(to) ? "bg-cyan-500/5 text-cyan-500 border-cyan-500 pr-4" : "hover:bg-white/3 hover:text-slate-300/80 hover:border-cyan-500/40 hover:pr-4"}`}>
                                <span className="text-sm flex-shrink-0">{icon}</span>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="h-px bg-white/5 my-4 flex-shrink-0" />

            {/* נושאים חמים */}
            <div className="mb-1">
                <div className="text-xs tracking-widest text-cyan-500/55 mb-3 font-bold">// חם עכשיו</div>
                <ul className="list-none flex flex-col gap-0.5">
                    {trending.length === 0 ? (
                        <li className="text-xs text-slate-300/20 px-3 py-2">אין נושאים כרגע</li>
                    ) : trending.map((t) => (
                        <li key={t._id}>
                            <Link to={`/category?topicId=${t._id}`} className="flex items-center gap-2 px-2.5 py-2 no-underline text-slate-300/50 text-xs transition-all border-r-2 border-transparent hover:text-slate-300/85 hover:bg-white/2 hover:border-cyan-500/30">
                                <span className="w-1.25 h-1.25 bg-cyan-500 rounded-full opacity-50 flex-shrink-0" />
                                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{t.title}</span>
                                <span className="text-cyan-500/50 flex-shrink-0">↑{t.votes ?? 0}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="h-px bg-white/5 my-4 flex-shrink-0" />

            {/* תגיות */}
            <div className="mb-1">
                <div className="text-xs tracking-widest text-cyan-500/55 mb-3 font-bold">// תגיות נפוצות</div>
                <div className="flex flex-wrap gap-1.5">
                    {["React", "Node.js", "Cyber", "AI", "Career", "DevOps"].map(tag => (
                        <span key={tag} className="text-xs bg-white/3 border border-white/7 text-slate-300/40 px-2.25 py-0.75 cursor-pointer transition-all hover:text-cyan-500 hover:border-cyan-500/30 hover:bg-cyan-500/5"># {tag}</span>
                    ))}
                </div>
            </div>

            {/* פוטר */}
            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-slate-300/30">
                <span className="w-1.75 h-1.75 bg-green-500 rounded-full shadow-lg shadow-green-500 flex-shrink-0 animate-pulse" />
                <span className="text-white font-bold">14</span>
                <span>משתמשים אונליין</span>
            </div>
        </aside>
    );
}