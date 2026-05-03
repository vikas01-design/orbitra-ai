import { useListOpportunities, useRunOpportunityRadar, getListOpportunitiesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Target, Search, Briefcase, ChevronRight, Bot, Zap } from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  open:    "text-cyan-700 border-cyan-300 bg-cyan-50",
  applied: "text-violet-700 border-violet-300 bg-violet-50",
  missed:  "text-rose-700 border-rose-300 bg-rose-50",
};

const FILTERS = ["all", "open", "applied", "missed"] as const;

export default function OpportunitiesPage() {
  const queryClient = useQueryClient();
  const { data: opportunities, isLoading } = useListOpportunities();
  const runRadar = useRunOpportunityRadar();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [focusKeyword, setFocusKeyword] = useState("");
  const [filter, setFilter] = useState<typeof FILTERS[number]>("all");

  const handleRunRadar = () => {
    runRadar.mutate(
      { data: { focus: focusKeyword || undefined } },
      {
        onSuccess: (newOpps) => {
          queryClient.invalidateQueries({ queryKey: getListOpportunitiesQueryKey() });
          toast.success("Radar scan complete", { description: `Found ${newOpps.length} new opportunities.` });
          setIsDialogOpen(false);
          setFocusKeyword("");
        },
        onError: () => toast.error("Radar scan failed", { description: "The agent encountered an error." }),
      }
    );
  };

  const filteredOpps = opportunities?.filter(o => filter === "all" || o.status === filter) ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="neu-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
            <Target className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-slate-800">Opportunity Radar</h1>
            <p className="text-slate-400 text-xs mt-0.5">Continuously scanning the market for you</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="relative z-10 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300
              text-white font-display text-xs tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.3)] border-0 shrink-0">
              <Search className="w-4 h-4 mr-2" /> Manual Scan
            </Button>
          </DialogTrigger>
          <DialogContent className="neu-card border-slate-200 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-slate-800">
                <Target className="w-5 h-5 text-cyan-600" /> Deploy Radar Agent
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Optionally provide a focus keyword to narrow the scan.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)}
                placeholder="e.g. Remote, Web3, Lead Engineer"
                className="bg-white border-slate-200 focus-visible:ring-cyan-400/50 text-slate-800 placeholder:text-slate-300" />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-slate-700">Cancel</Button>
              <Button onClick={handleRunRadar} disabled={runRadar.isPending}
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white font-display border-0">
                {runRadar.isPending
                  ? <><Bot className="w-4 h-4 mr-2 animate-pulse" /> Scanning...</>
                  : <><Zap className="w-4 h-4 mr-2" /> Initialize Scan</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all duration-200
              ${filter === f
                ? "bg-cyan-50 border-cyan-300 text-cyan-700 shadow-sm"
                : "border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 bg-white/60"}`}>
            {f}
          </button>
        ))}
        {opportunities && (
          <span className="ml-auto self-center text-xs text-slate-300 font-mono">
            {filteredOpps.length} result{filteredOpps.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="neu-card p-6 h-52 space-y-4">
              <div className="h-5 w-3/4 rounded shimmer-bg" />
              <div className="h-3.5 w-1/2 rounded shimmer-bg" />
              <div className="h-2 w-full rounded-full shimmer-bg mt-4" />
              <div className="h-9 w-full rounded-xl shimmer-bg mt-2" />
            </div>
          ))}
        </div>
      ) : filteredOpps.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="neu-card p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-cyan-300" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-800 mb-2">No targets acquired</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-7">
            Your radar hasn't found opportunities matching this filter. Deploy the agent to scan the market.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white font-display text-xs tracking-wider border-0 px-8">
            Deploy Agent
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOpps.map((opp, i) => (
              <motion.div key={opp.id} layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
              >
                <Link href={`/opportunities/${opp.id}`}>
                  <div className="neu-card p-5 neu-card-hover cursor-pointer h-full flex flex-col group
                    hover:border-cyan-300 transition-all duration-300">

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-base truncate mb-1 group-hover:text-cyan-700 transition-colors">
                          {opp.name}
                        </h3>
                        <p className="text-slate-400 text-xs flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" /> {opp.type}
                          {opp.deadline && <span className="text-slate-300">· {opp.deadline}</span>}
                        </p>
                      </div>
                      <Badge variant="outline"
                        className={`text-[10px] font-mono tracking-wider uppercase shrink-0 border ${STATUS_STYLES[opp.status] ?? "text-slate-400 border-slate-200"}`}>
                        {opp.status}
                      </Badge>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{opp.whyMatch}</p>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-cyan-600 font-display font-semibold tracking-wider">MATCH SCORE</span>
                        <span className="text-slate-500 font-mono">{opp.matchScore}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${opp.matchScore}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-400 text-[10px] border-slate-200">
                        {opp.type}
                      </Badge>
                      <span className="text-xs text-cyan-600 font-display font-semibold opacity-0 group-hover:opacity-100
                        transition-all duration-200 flex items-center gap-1">
                        Analyze <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
