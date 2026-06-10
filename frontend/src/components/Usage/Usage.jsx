import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    MessageSquare, BookOpen, Zap, Heart, Eye, Trophy,
    Users, TrendingUp, Briefcase, CalendarDays, BarChart2, Flame
} from 'lucide-react';
import { useAuth } from '../../hooks';
import usageService from '../../services/usageService';
import styles from './Usage.module.css';

// ─── Custom Tooltip ───────────────────────────────────────────────
function CyberTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-cyan-500/30 bg-slate-900/95 px-4 py-3 shadow-xl shadow-cyan-500/10 backdrop-blur-xl text-sm">
            <p className="mb-1 text-xs text-slate-400">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, glow }) {
    return (
        <div
            className={styles['usage-glass-card']}
            style={{ borderColor: `${color}25` }}
        >
            <div
                className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-10"
                style={{ background: color }}
            />
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-semibold">{label}</p>
                    <p className="text-3xl font-black text-slate-100" style={{ textShadow: glow }}>
                        {value?.toLocaleString() ?? '—'}
                    </p>
                </div>
                <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300"
                    style={{ borderColor: `${color}30`, background: `${color}10` }}
                >
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
            </div>
        </div>
    );
}

// ─── Section Title ────────────────────────────────────────────────
function SectionTitle({ children, icon: Icon, color = '#00e5ff' }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}
            >
                <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <h2 className="text-xs uppercase tracking-widest text-slate-300 font-bold">{children}</h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-800" />
        </div>
    );
}

// ─── Activity Heatmap ─────────────────────────────────────────────
function Heatmap({ matrix }) {
    if (!matrix?.length) return null;
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    const maxVal = Math.max(1, ...matrix.flat());

    const getColor = (val) => {
        if (!val) return 'rgba(30,41,59,0.4)';
        const intensity = val / maxVal;
        if (intensity < 0.25) return 'rgba(6,182,212,0.25)';
        if (intensity < 0.5)  return 'rgba(6,182,212,0.5)';
        if (intensity < 0.75) return 'rgba(6,182,212,0.75)';
        return 'rgba(6,182,212,1)';
    };

    return (
        <div className="overflow-x-auto py-2">
            <div className="flex gap-1 min-w-0">
                {/* Day labels */}
                <div className="flex flex-col gap-1 ml-2">
                    {days.map(d => (
                        <div key={d} className="h-4 w-4 flex items-center justify-center text-[10px] text-slate-500 font-medium">{d}</div>
                    ))}
                </div>
                {/* Weeks */}
                {matrix.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                        {week.map((val, di) => (
                            <div
                                key={di}
                                title={`${val} פעולות`}
                                className={styles['heatmap-cell']}
                                style={{ background: getColor(val) }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Tags Bar ─────────────────────────────────────────────────────
function TagsBar({ tags, color = '#a855f7' }) {
    if (!tags?.length) return <p className="text-slate-500 text-sm">אין תגיות עדיין</p>;
    const max = tags[0]?.count || 1;
    return (
        <div className="space-y-3">
            {tags.map(({ tag, count }) => (
                <div key={tag} className="flex items-center gap-3">
                    <span className="w-20 text-right text-xs text-slate-400 shrink-0 font-mono">#{tag}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${(count / max) * 100}%`,
                                background: `linear-gradient(90deg, ${color}, ${color}88)`
                            }}
                        />
                    </div>
                    <span className="w-6 text-right text-xs text-slate-500 shrink-0 font-bold">{count}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────
function Skeleton({ className = '' }) {
    return <div className={`animate-pulse rounded-2xl bg-slate-800/40 border border-white/5 ${className}`} />;
}

function LoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </div>
        </div>
    );
}

// ─── Personal Tab ─────────────────────────────────────────────────
function PersonalTab({ data }) {
    if (!data) return <LoadingSkeleton />;
    const { stats, activityOverTime, postsOverTime, topicsOverTime, myTags, heatmap } = data;

    const personalCards = [
        { icon: MessageSquare, label: 'פוסטים',   value: stats.posts,      color: '#00e5ff', glow: '0 0 20px rgba(0,229,255,0.3)' },
        { icon: BookOpen,      label: 'נושאים',   value: stats.topics,     color: '#a855f7', glow: '0 0 20px rgba(168,85,247,0.3)' },
        { icon: Trophy,        label: 'אתגרים שפתרת בהצלחה', value: stats.challengesSolved ?? 0, color: '#facc15', glow: '0 0 20px rgba(250,204,21,0.3)' },
        { icon: Heart,         label: 'לייקים',   value: stats.totalLikes, color: '#ec4899', glow: '0 0 20px rgba(236,72,153,0.3)' },
        { icon: Eye,           label: 'צפיות',    value: stats.totalViews, color: '#ccff00', glow: '0 0 20px rgba(204,255,0,0.3)'  },
        { icon: Trophy,        label: 'הצבעות',   value: stats.totalVotes, color: '#f59e0b', glow: '0 0 20px rgba(245,158,11,0.3)' },
        { icon: BookOpen,      label: 'מאמרים',   value: stats.articles,   color: '#06b6d4', glow: '0 0 20px rgba(6,182,212,0.3)'  },
        { icon: CalendarDays,  label: 'אירועים',  value: stats.events,     color: '#8b5cf6', glow: '0 0 20px rgba(139,92,246,0.3)' },
        { icon: Briefcase,     label: 'משרות',    value: stats.jobs,       color: '#10b981', glow: '0 0 20px rgba(16,185,129,0.3)' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {personalCards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Activity Line Chart */}
            <div className={styles['usage-glass-card']}>
                <SectionTitle icon={TrendingUp} color="#00e5ff">פעילות לאורך זמן</SectionTitle>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={activityOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CyberTooltip />} />
                        <Line type="monotone" dataKey="count" name="פעולות" stroke="#00e5ff" strokeWidth={2.5} dot={{ fill: '#00e5ff', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#00e5ff', filter: 'drop-shadow(0 0 6px #00e5ff)' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Posts vs Topics Bar + Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles['usage-glass-card']}>
                    <SectionTitle icon={BarChart2} color="#a855f7">פוסטים vs נושאים</SectionTitle>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={postsOverTime.map((p, i) => ({ label: p.label, פוסטים: p.count, נושאים: topicsOverTime[i]?.count || 0 }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CyberTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                            <Bar dataKey="פוסטים" fill="#a855f7" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="נושאים" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className={styles['usage-glass-card']}>
                    <SectionTitle icon={Flame} color="#a855f7">התגיות שלי</SectionTitle>
                    <TagsBar tags={myTags} color="#a855f7" />
                </div>
            </div>

            {/* Heatmap */}
            <div className={styles['usage-glass-card']}>
                <SectionTitle icon={Zap} color="#ccff00">מפת פעילות — 12 שבועות אחרונים</SectionTitle>
                <Heatmap matrix={heatmap} />
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>פחות</span>
                    {['rgba(30,41,59,0.4)', 'rgba(6,182,212,0.25)', 'rgba(6,182,212,0.5)', 'rgba(6,182,212,0.75)', 'rgba(6,182,212,1)'].map((c, i) => (
                        <div key={i} className="h-3 w-3 rounded-sm" style={{ background: c }} />
                    ))}
                    <span>יותר</span>
                </div>
            </div>
        </div>
    );
}

// ─── Global Tab ───────────────────────────────────────────────────
function GlobalTab({ data }) {
    if (!data) return <LoadingSkeleton />;
    const { stats, usersOverTime, postsOverTime, topicsOverTime, globalTags, jobTypeData, topTopics } = data;

    const globalCards = [
        { icon: Users,         label: 'משתמשים',  value: stats.users,    color: '#00e5ff', glow: '0 0 20px rgba(0,229,255,0.3)' },
        { icon: MessageSquare, label: 'פוסטים',   value: stats.posts,    color: '#a855f7', glow: '0 0 20px rgba(168,85,247,0.3)' },
        { icon: BookOpen,      label: 'נושאים',   value: stats.topics,   color: '#ccff00', glow: '0 0 20px rgba(204,255,0,0.3)'  },
        { icon: Heart,         label: 'לייקים',   value: stats.totalLikes, color: '#ec4899', glow: '0 0 20px rgba(236,72,153,0.3)' },
        { icon: BookOpen,      label: 'מאמרים',   value: stats.articles, color: '#06b6d4', glow: '0 0 20px rgba(6,182,212,0.3)'  },
        { icon: CalendarDays,  label: 'אירועים',  value: stats.events,   color: '#8b5cf6', glow: '0 0 20px rgba(139,92,246,0.3)' },
        { icon: Briefcase,     label: 'משרות',    value: stats.jobs,     color: '#10b981', glow: '0 0 20px rgba(16,185,129,0.3)' },
    ];

    const jobTypeLabels = { fulltime: 'משרה מלאה', parttime: 'חצי משרה', freelance: 'פרילנס', internship: 'סטאז׳' };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {globalCards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Growth over time */}
            <div className={styles['usage-glass-card']}>
                <SectionTitle icon={TrendingUp} color="#00e5ff">צמיחת הפורום</SectionTitle>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={usersOverTime.map((u, i) => ({ label: u.label, משתמשים: u.count, פוסטים: postsOverTime[i]?.count || 0, נושאים: topicsOverTime[i]?.count || 0 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CyberTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                        <Line type="monotone" dataKey="משתמשים" stroke="#00e5ff" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="פוסטים"  stroke="#a855f7" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="נושאים"  stroke="#ccff00" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Tags + Job Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles['usage-glass-card']}>
                    <SectionTitle icon={Flame} color="#00e5ff">תגיות פופולריות</SectionTitle>
                    <TagsBar tags={globalTags} color="#00e5ff" />
                </div>

                <div className={styles['usage-glass-card']}>
                    <SectionTitle icon={Briefcase} color="#10b981">סוגי משרות</SectionTitle>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={jobTypeData.map(j => ({ name: jobTypeLabels[j.type] || j.type, count: j.count }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CyberTooltip />} />
                            <Bar dataKey="count" name="כמות" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Challenge leaderboard */}
            {data.challengeLeaderboard?.length > 0 && (
                <div className={styles['usage-glass-card']}>
                    <SectionTitle icon={Trophy} color="#f59e0b">לוח מובילים אתגרי השבוע</SectionTitle>
                    <div className="space-y-3">
                        {data.challengeLeaderboard.map((user, i) => (
                            <div key={user.userId || i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-slate-950/40 px-5 py-4 transition-colors duration-200 hover:bg-slate-950/60">
                                <span className="text-lg font-black font-mono" style={{ color: ['#f59e0b','#94a3b8','#cd7c3a','#00e5ff','#a855f7'][i] || '#64748b' }}>
                                    #{i + 1}
                                </span>
                                <span className="flex-1 text-sm font-medium text-slate-200 truncate">{user.name}</span>
                                <span className="text-xs text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1 rounded-md font-semibold">{user.count} פתרונות</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Topics */}
            {topTopics?.length > 0 && (
                <div className={styles['usage-glass-card']}>
                    <SectionTitle icon={Trophy} color="#f59e0b">נושאים פעילים ביותר</SectionTitle>
                    <div className="space-y-3">
                        {topTopics.map((t, i) => (
                            <Link
                                key={t._id || t.id || i}
                                to={`/category?topicId=${t._id || t.id}`}
                                className="flex items-center gap-4 rounded-xl border border-white/5 bg-slate-950/40 px-5 py-4 transition-colors duration-200 hover:bg-slate-950/60 no-underline"
                            >
                                <span className="text-lg font-black font-mono" style={{ color: ['#f59e0b','#94a3b8','#cd7c3a','#00e5ff','#a855f7'][i] || '#64748b' }}>
                                    #{i + 1}
                                </span>
                                <span className="flex-1 text-sm font-medium text-slate-200 truncate">{t.title}</span>
                                <span className="text-xs text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1 rounded-md font-semibold">{t.posts} פוסטים</span>
                                <span className="text-xs text-slate-500 font-medium">{t.views} צפיות</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Usage Component ─────────────────────────────────────────
export default function Usage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(user ? 'personal' : 'global');
    const [personalData, setPersonalData] = useState(null);
    const [globalData, setGlobalData]     = useState(null);
    const [loading, setLoading]           = useState({ personal: false, global: false });
    const [error, setError]               = useState({ personal: null, global: null });

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Handle mouse move glow effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Load personal data
    useEffect(() => {
        if (!user) return;
        setLoading(l => ({ ...l, personal: true }));
        usageService.getMyUsage()
            .then(res => setPersonalData(res.data))
            .catch(e => setError(er => ({ ...er, personal: e.message })))
            .finally(() => setLoading(l => ({ ...l, personal: false })));
    }, [user]);

    // Load global data
    useEffect(() => {
        setLoading(l => ({ ...l, global: true }));
        usageService.getGlobalUsage()
            .then(res => setGlobalData(res.data))
            .catch(e => setError(er => ({ ...er, global: e.message })))
            .finally(() => setLoading(l => ({ ...l, global: false })));
    }, []);

    const tabs = [
        ...(user ? [{ id: 'personal', label: 'הפרופיל שלי', icon: Zap, color: '#00e5ff' }] : []),
        { id: 'global', label: 'הפורום כולו', icon: Users, color: '#a855f7' },
    ];

    return (
        <div className={styles['usage-shell']} dir="rtl">
            {/* Background elements */}
            <div className={styles['usage-bg-container']}>
                <div className={`${styles['usage-bg-blob']} ${styles['usage-bg-blob-1']}`} />
                <div className={`${styles['usage-bg-blob']} ${styles['usage-bg-blob-2']}`} />
                <div
                    className={styles['usage-cursor-glow']}
                    style={{
                        left: `${mousePos.x - 200}px`,
                        top: `${mousePos.y - 200}px`,
                    }}
                />
                <div className={styles['usage-grid-overlay']} />
            </div>

            {/* Container for content */}
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 blur opacity-50" />
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-slate-950">
                                <BarChart2 className="w-6 h-6 text-cyan-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className={`${styles['usage-gradient-text']} text-3xl font-black tracking-tight`}>
                                USAGE STATS
                            </h1>
                            <p className="text-[10px] tracking-widest text-slate-500 uppercase font-mono font-bold mt-0.5">Analytics Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={`${styles['usage-tabs-container']} mb-8`}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300"
                                style={isActive ? {
                                    background: `${tab.color}15`,
                                    border: `1px solid ${tab.color}35`,
                                    color: tab.color,
                                    boxShadow: `0 0 25px ${tab.color}15`
                                } : {
                                    color: '#64748b',
                                    border: '1px solid transparent'
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="mt-4">
                    {activeTab === 'personal' && (
                        loading.personal
                            ? <LoadingSkeleton />
                            : error.personal
                                ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400 text-sm">{error.personal}</div>
                                : <PersonalTab data={personalData} />
                    )}
                    {activeTab === 'global' && (
                        loading.global
                            ? <LoadingSkeleton />
                            : error.global
                                ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400 text-sm">{error.global}</div>
                                : <GlobalTab data={globalData} />
                    )}
                </div>
            </div>
        </div>
    );
}