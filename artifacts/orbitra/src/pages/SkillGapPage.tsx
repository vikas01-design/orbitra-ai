import { useListSkillGaps, useRunSkillGap, getListSkillGapsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Target, Zap, ChevronDown, ChevronUp, Bot, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function SkillGapPage() {
  const queryClient = useQueryClient();
  const { data: gaps, isLoading } = useListSkillGaps();
  const runSkillGap = useRunSkillGap();
  
  const [targetRole, setTargetRole] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    runSkillGap.mutate(
      { data: { targetRole } },
      {
        onSuccess: (newGap) => {
          queryClient.invalidateQueries({ queryKey: getListSkillGapsQueryKey() });
          setTargetRole("");
          setExpandedId(newGap.id);
          toast.success("Analysis complete", { description: "Skill gap roadmap generated." });
        },
        onError: () => {
          toast.error("Analysis failed", { description: "The agent encountered an error." });
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Activity className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">Skill Gap Analyzer</h1>
        <p className="text-muted-foreground">Define your target role, and the agent will compare it against your current profile to build a custom learning roadmap.</p>
      </div>

      <div className="glass-card p-2 rounded-full border-white/10 relative z-10 max-w-2xl mx-auto shadow-[0_0_30px_rgba(59,130,246,0.1)]">
        <form onSubmit={handleAnalyze} className="flex gap-2 relative z-20">
          <div className="relative flex-1">
            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="Enter target role (e.g. Staff Fullstack Engineer)" 
              className="pl-12 bg-transparent border-0 h-14 text-lg focus-visible:ring-0 shadow-none"
            />
          </div>
          <Button 
            type="submit" 
            disabled={runSkillGap.isPending || !targetRole.trim()} 
            className="h-14 px-8 rounded-full font-display bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            {runSkillGap.isPending ? <Bot className="w-5 h-5 animate-pulse" /> : <Zap className="w-5 h-5 mr-2" />}
            {runSkillGap.isPending ? "Analyzing..." : "Analyze"}
          </Button>
        </form>
      </div>

      <div className="space-y-6 pt-8">
        <h2 className="font-display text-xl font-bold border-b border-white/5 pb-4">Past Analyses</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : gaps?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-white/5 border-dashed rounded-2xl">
            No skill gaps analyzed yet. Run an analysis above.
          </div>
        ) : (
          <div className="space-y-4">
            {gaps?.map((gap) => (
              <div key={gap.id} className="glass-card border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/30">
                <div 
                  className="p-6 cursor-pointer flex justify-between items-center bg-background/20 hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(expandedId === gap.id ? null : gap.id)}
                >
                  <div>
                    <h3 className="font-display font-bold text-xl text-blue-100">{gap.targetRole}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Analyzed on {new Date(gap.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-blue-400">
                    {expandedId === gap.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </Button>
                </div>
                
                <AnimatePresence>
                  {expandedId === gap.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 border-t border-white/5 space-y-8 bg-black/20">
                        
                        {/* Skills Overview Grid */}
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-sm font-display text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                              <Zap className="w-4 h-4" /> Validated Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {gap.requiredSkills.filter(s => gap.missingSkills.indexOf(s) === -1).map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{skill}</Badge>
                              ))}
                              {gap.requiredSkills.filter(s => gap.missingSkills.indexOf(s) === -1).length === 0 && (
                                <span className="text-sm text-muted-foreground">None validated against target.</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="text-sm font-display text-rose-400 uppercase tracking-wider flex items-center gap-2">
                              <Target className="w-4 h-4" /> Missing Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {gap.missingSkills.map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-rose-500/10 text-rose-400 border-rose-500/20">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Roadmap Timeline */}
                        <div className="space-y-6 pt-6 border-t border-white/5">
                          <h4 className="text-lg font-display font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-400" /> Learning Roadmap
                          </h4>
                          <div className="space-y-6 pl-4 border-l-2 border-blue-500/20 relative">
                            {gap.roadmap.map((step: any, i: number) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 + 0.2 }}
                                className="relative pl-6"
                              >
                                <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-background" />
                                <h5 className="font-bold text-blue-100 mb-1">{step.title}</h5>
                                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                                <div className="flex flex-wrap gap-4 text-xs font-mono text-blue-300">
                                  <span>Time: {step.estimatedTime}</span>
                                  <span>Resources: {step.resources.join(", ")}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
