import { useGetDashboardSummary, useGetRecentActivity, useGetProfile } from "@workspace/api-client-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Link } from "wouter";
import { Target, Activity, FileText, Video, ArrowRight, Bot, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvatarUrl } from "@/lib/avatars";

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  useEffect(() => {
    const animation = animate(count, value, { duration: 1.8, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);
  return <motion.span>{rounded}</motion.span>;
}

const STATS = [
  { title: "Opportunities",      key: "totalOpportunities",    icon: Target,   text: "text-cyan-600",    iconBg: "bg-cyan-50 border-cyan-200",    glow: "rgba(6,182,212,0.12)"   },
  { title: "Applications",       key: "applicationsGenerated", icon: FileText, text: "text-violet-600",  iconBg: "bg-violet-50 border-violet-200", glow: "rgba(124,58,237,0.12)"  },
  { title: "Interviews Done",    key: "interviewsCompleted",   icon: Video,    text: "text-fuchsia-600", iconBg: "bg-fuchsia-50 border-fuchsia-200",glow: "rgba(162,28,175,0.12)"  },
  { title: "Skill Gaps Tracked", key: "missingSkillsCount",    icon: Activity, text: "text-blue-600",    iconBg: "bg-blue-50 border-blue-200",     glow: "rgba(37,99,235,0.12)"   },
] as const;

const ACTIONS = [
  { href: "/opportunities", label: "Run Radar",       icon: Target,   color: "text-cyan-600",    border: "border-cyan-200",    bg: "bg-cyan-50/60 hover:bg-cyan-100/80"   },
  { href: "/applications",  label: "Resume AI",       icon: FileText, color: "text-violet-600",  border: "border-violet-200",  bg: "bg-violet-50/60 hover:bg-violet-100/80" },
  { href: "/skill-gap",     label: "Analyze Skills",  icon: Activity, color: "text-blue-600",    border: "border-blue-200",    bg: "bg-blue-50/60 hover:bg-blue-100/80"   },
  { href: "/interview",     label: "Start Interview", icon: Video,    color: "text-fuchsia-600", border: "border-fuchsia-200", bg: "bg-fuchsia-50/60 hover:bg-fuchsia-100/80" },
];

const ACTIVITY_ICONS: Record<string, JSX.Element> = {
  opportunity: <Target   className="w-4 h-4 text-cyan-600"    />,
  application: <FileText className="w-4 h-4 text-violet-600"  />,
  interview:   <Video    className="w-4 h-4 text-fuchsia-600" />,
  skillgap:    <Activity className="w-4 h-4 text-blue-600"    />,
};

export default function DashboardPage() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: isActivityLoading } = useGetRecentActivity();
  const { data: profile } = useGetProfile();
  const displayName = profile?.name?.trim() || profile?.email?.split("@")[0] || "Explorer";
  const avatarUrl   = getAvatarUrl(profile?.avatarId, displayName);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">

      {/* ── Welcome Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="neu-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 via-transparent to-violet-50/40 pointer-events-none" />
        <img
          src={avatarUrl} alt={displayName}
          className="w-14 h-14 rounded-2xl border border-slate-200 shadow-[0_4px_16px_rgba(150,165,210,0.25)] shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold mb-0.5">Welcome back</p>
          <h1 className="font-display text-2xl font-bold truncate">
            <span className="gradient-text-cyan">{displayName}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Your AI career crew is standing by.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-300/50 bg-cyan-50 text-cyan-700 text-xs font-semibold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-blink-dot" />
          7 Agents Active
        </div>
      </motion.div>

      {/* ── Bento Stats ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="neu-card p-5 relative overflow-hidden group cursor-default"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${stat.glow} 0%, transparent 70%)` }} />
            <div className="flex items-center gap-2.5 mb-4">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                <stat.icon className={`w-4 h-4 ${stat.text}`} />
              </div>
              <p className="text-slate-500 text-xs font-semibold leading-tight">{stat.title}</p>
            </div>
            <div className={`font-display text-3xl font-black ${stat.text}`}>
              {isSummaryLoading
                ? <div className="h-9 w-14 rounded-lg shimmer-bg" />
                : <AnimatedNumber value={(summary as any)?.[stat.key] ?? 0} />}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Bento ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Agent Commands */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="neu-card p-5"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-600" />
            </div>
            <h2 className="font-display font-bold text-sm text-slate-800 tracking-wide">Agent Commands</h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {ACTIONS.map((a) => (
              <Link key={a.href} href={a.href}>
                <motion.div
                  whileHover={{ x: 3 }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border ${a.border} ${a.bg}
                    cursor-pointer transition-all duration-250 group`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0 shadow-sm">
                    <a.icon className={`w-4 h-4 ${a.color}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{a.label}</span>
                  <ArrowRight className={`w-4 h-4 ${a.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 neu-card p-5"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
              <Clock className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="font-display font-bold text-sm text-slate-800 tracking-wide">Recent Activity</h2>
          </div>

          {isActivityLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full shrink-0 shimmer-bg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/2 rounded shimmer-bg" />
                    <div className="h-2.5 w-1/3 rounded shimmer-bg" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                <Bot className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">No activity yet.</p>
              <p className="text-slate-300 text-xs mt-1">Deploy an agent to get started.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activity?.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors relative
                    before:absolute before:left-[26px] before:top-12 before:bottom-0 before:w-px before:bg-slate-200 last:before:hidden"
                >
                  <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10
                    shadow-[2px_2px_8px_rgba(150,165,210,0.2)]">
                    {ACTIVITY_ICONS[item.kind] ?? <Bot className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="flex-1 pt-1.5 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                    <div className="flex items-center justify-between mt-0.5 gap-2">
                      <p className="text-xs text-slate-400 truncate">{item.subtitle ?? ""}</p>
                      <span className="text-[10px] text-slate-300 shrink-0">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
