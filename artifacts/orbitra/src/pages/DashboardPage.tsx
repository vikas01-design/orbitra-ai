import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Target, Activity, FileText, Video, ArrowRight, Bot, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, { duration: 2, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function DashboardPage() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: isActivityLoading } = useGetRecentActivity();

  const stats = [
    { title: "Opportunities Found", value: summary?.totalOpportunities ?? 0, icon: Target, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { title: "Applications Generated", value: summary?.applicationsGenerated ?? 0, icon: FileText, color: "text-violet-400", bg: "bg-violet-400/10" },
    { title: "Interviews Completed", value: summary?.interviewsCompleted ?? 0, icon: Video, color: "text-fuchsia-400", bg: "bg-fuchsia-400/10" },
    { title: "Skill Gaps Tracked", value: summary?.missingSkillsCount ?? 0, icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10" },
  ];

  const getActivityIcon = (kind: string) => {
    switch (kind) {
      case "opportunity": return <Target className="w-4 h-4 text-cyan-400" />;
      case "application": return <FileText className="w-4 h-4 text-violet-400" />;
      case "interview": return <Video className="w-4 h-4 text-fuchsia-400" />;
      case "skillgap": return <Activity className="w-4 h-4 text-blue-400" />;
      default: return <Bot className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground mt-1">Your AI career agents are standing by.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">{stat.title}</h3>
            </div>
            <div className="text-4xl font-display font-bold">
              {isSummaryLoading ? <Skeleton className="h-10 w-16" /> : <AnimatedNumber value={stat.value} />}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> Agent Commands
          </h2>
          <div className="flex flex-col gap-3">
            <Link href="/opportunities">
              <Button variant="secondary" className="w-full justify-between h-14 text-md group hover-elevate">
                <span className="flex items-center gap-3"><Target className="w-5 h-5" /> Run Radar</span>
                <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
            <Link href="/applications">
              <Button variant="secondary" className="w-full justify-between h-14 text-md group hover-elevate">
                <span className="flex items-center gap-3"><FileText className="w-5 h-5" /> Generate App</span>
                <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
            <Link href="/skill-gap">
              <Button variant="secondary" className="w-full justify-between h-14 text-md group hover-elevate">
                <span className="flex items-center gap-3"><Activity className="w-5 h-5" /> Analyze Skills</span>
                <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
            <Link href="/interview">
              <Button variant="secondary" className="w-full justify-between h-14 text-md group hover-elevate">
                <span className="flex items-center gap-3"><Video className="w-5 h-5" /> Start Interview</span>
                <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Recent Activity
          </h2>
          <div className="glass-card rounded-2xl border-white/5 p-6 min-h-[300px]">
            {isActivityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 py-12">
                <Bot className="w-12 h-12 opacity-20" />
                <p>No recent activity. Deploy an agent to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activity?.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 relative before:absolute before:left-5 before:top-10 before:bottom-[-24px] before:w-px before:bg-white/10 last:before:hidden"
                  >
                    <div className="w-10 h-10 rounded-full bg-card border border-white/10 flex items-center justify-center z-10 shrink-0 shadow-lg">
                      {getActivityIcon(item.kind)}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">{item.subtitle ?? ""}</p>
                        <span className="text-xs text-muted-foreground opacity-50 whitespace-nowrap ml-4">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
