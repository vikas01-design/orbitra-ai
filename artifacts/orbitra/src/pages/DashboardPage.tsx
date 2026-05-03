import { useGetDashboardSummary, useGetRecentActivity, useGetProfile } from "@workspace/api-client-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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
  { title: "Opportunities",     key: "totalOpportunities",    icon: Target,   from: "from-cyan-500/15",   to: "to-cyan-600/5",  text: "text-cyan-400",   glow: "rgba(34,211,238,0.25)"    },
  { title: "Applications",      key: "applicationsGenerated", icon: FileText, from: "from-violet-500/15", to: "to-violet-600/5",text: "text-violet-400", glow: "rgba(167,139,250,0.25)"   },
  { title: "Interviews Done",   key: "interviewsCompleted",   icon: Video,    from: "from-fuchsia-500/15",to: "to-fuchsia-600/5",text: "text-fuchsia-400",glow: "rgba(232,121,249,0.25)"   },
  { title: "Skill Gaps Tracked",key: "missingSkillsCount",    icon: Activity, from: "from-blue-500/15",   to: "to-blue-600/5",  text: "text-blue-400",   glow: "rgba(96,165,250,0.25)"    },
] as const;

const ACTIONS = [
  { href: "/opportunities", label: "Run Radar",      icon: Target,   color: "text-cyan-400",    border: "border-cyan-500/20",   bg: "bg-cyan-500/5 hover:bg-cyan-500/10",   glow: "hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"   },
  { href: "/applications",  label: "Resume AI",      icon: FileText, color: "text-violet-400",  border: "border-violet-500/20", bg: "bg-violet-500/5 hover:bg-violet-500/10",glow: "hover:shadow-[0_0_20px_rgba(167,139,250,0.15)]"  },
  { href: "/skill-gap",     label: "Analyze Skills", icon: Activity, color: "text-blue-400",    border: "border-blue-500/20",   bg: "bg-blue-500/5 hover:bg-blue-500/10",   glow: "hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]"   },
  { href: "/interview",     label: "Start Interview",icon: Video,    color: "text-fuchsia-400", border: "border-fuchsia-500/20",bg: "bg-fuchsia-500/5 hover:bg-fuchsia-500/10",glow: "hover:shadow-[0_0_20px_rgba(232,121,249,0.15)]"},
];

const ACTIVITY_ICONS: Record<string, JSX.Element> = {
  opportunity: <Target   className="w-4 h-4 text-cyan-400"    />,
  application: <FileText className="w-4 h-4 text-violet-400"  />,
  interview:   <Video    className="w-4 h-4 text-fuchsia-400" />,
  skillgap:    <Activity className="w-4 h-4 text-blue-400"    />,
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
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/4 via-transparent to-purple-500/4 pointer-events-none" />
        <img
          src={avatarUrl} alt={displayName}
          className="w-14 h-14 rounded-2xl border border-white/15 shadow-[0_0_20px_rgba(34,211,238,0.2)] shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white/40 text-xs tracking-widest uppercase font-semibold mb-0.5">Welcome back</p>
          <h1 className="font-display text-2xl font-bold text-white truncate">
            <span className="gradient-text-cyan">{displayName}</span>
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Your AI career crew is standing by.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/8 text-cyan-400 text-xs font-semibold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-blink-dot" />
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
            style={{ "--glow": stat.glow } as React.CSSProperties}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.from} ${stat.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center mb-4`}>
              <stat.icon className={`w-4 h-4 ${stat.text}`} />
            </div>
            <div className={`font-display text-3xl font-black ${stat.text} mb-1`}>
              {isSummaryLoading
                ? <div className="h-9 w-14 rounded-lg shimmer-bg" />
                : <AnimatedNumber value={(summary as any)?.[stat.key] ?? 0} />}
            </div>
            <p className="text-white/40 text-xs font-medium">{stat.title}</p>
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
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="font-display font-bold text-sm text-white tracking-wide">Agent Commands</h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {ACTIONS.map((a) => (
              <Link key={a.href} href={a.href}>
                <motion.div
                  whileHover={{ x: 3 }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border ${a.border} ${a.bg} ${a.glow}
                    cursor-pointer transition-all duration-250 group`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0`}>
                    <a.icon className={`w-4 h-4 ${a.color}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-white/70 group-hover:text-white transition-colors">{a.label}</span>
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
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="font-display font-bold text-sm text-white tracking-wide">Recent Activity</h2>
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
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <Bot className="w-7 h-7 text-white/20" />
              </div>
              <p className="text-white/30 text-sm">No activity yet.</p>
              <p className="text-white/20 text-xs mt-1">Deploy an agent to get started.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activity?.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-white/[0.025] transition-colors relative
                    before:absolute before:left-[26px] before:top-12 before:bottom-0 before:w-px before:bg-white/[0.06] last:before:hidden"
                >
                  <div className="w-9 h-9 rounded-full bg-[rgba(12,17,30,0.9)] border border-white/[0.08] flex items-center justify-center shrink-0 z-10
                    shadow-[4px_4px_10px_rgba(0,0,0,0.4)]">
                    {ACTIVITY_ICONS[item.kind] ?? <Bot className="w-4 h-4 text-white/30" />}
                  </div>
                  <div className="flex-1 pt-1.5 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{item.title}</p>
                    <div className="flex items-center justify-between mt-0.5 gap-2">
                      <p className="text-xs text-white/35 truncate">{item.subtitle ?? ""}</p>
                      <span className="text-[10px] text-white/25 shrink-0">
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
