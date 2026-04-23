import { useListOpportunities, useRunOpportunityRadar, getListOpportunitiesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Target, Search, Filter, Briefcase, ChevronRight, Bot } from "lucide-react";
import { toast } from "sonner";

export default function OpportunitiesPage() {
  const queryClient = useQueryClient();
  const { data: opportunities, isLoading } = useListOpportunities();
  const runRadar = useRunOpportunityRadar();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [focusKeyword, setFocusKeyword] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "applied" | "rejected" | "interviewing">("all");

  const handleRunRadar = () => {
    runRadar.mutate(
      { data: { focusKeyword: focusKeyword || undefined } },
      {
        onSuccess: (newOpps) => {
          queryClient.invalidateQueries({ queryKey: getListOpportunitiesQueryKey() });
          toast.success("Radar scan complete", { description: `Found ${newOpps.length} new opportunities.` });
          setIsDialogOpen(false);
          setFocusKeyword("");
        },
        onError: () => {
          toast.error("Radar scan failed", { description: "The agent encountered an error." });
        }
      }
    );
  };

  const filteredOpps = opportunities?.filter(o => filter === "all" || o.status === filter) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Target className="text-cyan-400 w-8 h-8" /> Opportunity Radar
          </h1>
          <p className="text-muted-foreground mt-1">Your agent is continuously scanning the market.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-display bg-cyan-500 hover:bg-cyan-600 text-black">
              <Search className="w-4 h-4 mr-2" /> Manual Scan
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" /> Deploy Radar Agent
              </DialogTitle>
              <DialogDescription>
                Command the agent to scan for new roles. Optionally provide a focus keyword to narrow the search.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                value={focusKeyword} 
                onChange={e => setFocusKeyword(e.target.value)} 
                placeholder="e.g. 'Remote', 'Web3', 'Lead'" 
                className="bg-background/50 border-white/10 focus-visible:ring-cyan-400"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleRunRadar} disabled={runRadar.isPending} className="bg-cyan-500 hover:bg-cyan-600 text-black">
                {runRadar.isPending ? "Scanning..." : "Initialize Scan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
        <Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("all")} className="rounded-full">All</Button>
        <Button variant={filter === "new" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("new")} className="rounded-full">New</Button>
        <Button variant={filter === "applied" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("applied")} className="rounded-full">Applied</Button>
        <Button variant={filter === "interviewing" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("interviewing")} className="rounded-full">Interviewing</Button>
        <Button variant={filter === "rejected" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("rejected")} className="rounded-full">Rejected</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6 rounded-2xl h-48">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-10 w-full mt-auto" />
            </div>
          ))}
        </div>
      ) : filteredOpps.length === 0 ? (
        <div className="glass-card border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-cyan-400/10 flex items-center justify-center">
            <Target className="w-12 h-12 text-cyan-400 opacity-50" />
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-display font-bold mb-2">No targets found</h3>
            <p className="text-muted-foreground mb-6">Your radar hasn't picked up any opportunities matching this filter. Deploy the agent to find new ones.</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-cyan-500 hover:bg-cyan-600 text-black font-display px-8">
              Deploy Agent
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredOpps.map((opp, i) => (
              <motion.div
                key={opp.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Link href={`/opportunities/${opp.id}`}>
                  <div className="glass-card p-6 rounded-2xl border-white/5 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-all cursor-pointer h-full flex flex-col group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl mb-1 group-hover:text-cyan-400 transition-colors">{opp.title}</h3>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> {opp.company}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-white/10 uppercase tracking-wider text-xs">
                        {opp.status}
                      </Badge>
                    </div>

                    <div className="mb-6 flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{opp.whyMatch}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-display">
                          <span className="text-cyan-400">Match Score</span>
                          <span>{opp.matchScore}%</span>
                        </div>
                        <Progress value={opp.matchScore} className="h-1.5 bg-background/50 [&>div]:bg-cyan-400" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-white/5 text-xs font-mono">{opp.type}</Badge>
                      </div>
                      <div className="text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all flex items-center text-sm font-display font-bold">
                        Analyze <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
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
