import { useGetOpportunity, useRunRecovery, useGenerateApplication, getListOpportunitiesQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Target, FileText, RefreshCw, Zap, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const oppId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();

  const { data: opp, isLoading } = useGetOpportunity(oppId);
  const generateApp = useGenerateApplication();
  const runRecovery = useRunRecovery();

  const [isAppDialogOpen, setIsAppDialogOpen] = useState(false);
  const [tone, setTone] = useState("professional");
  const [recoveryAlternatives, setRecoveryAlternatives] = useState<any[] | null>(null);

  const handleGenerateApp = () => {
    if (!opp) return;
    generateApp.mutate(
      { data: { opportunityId: oppId, opportunityName: opp.name, jobDescription: `${opp.name} (${opp.type}). Why this matches: ${opp.whyMatch}`, tone } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpportunitiesQueryKey() });
          toast.success("Application generated", { description: "Check Resume AI to view it." });
          setIsAppDialogOpen(false);
        },
        onError: () => toast.error("Failed to generate application"),
      }
    );
  };

  const handleRunRecovery = () => {
    if (!opp) return;
    runRecovery.mutate(
      { data: { missedOpportunity: opp.name } },
      {
        onSuccess: (data) => {
          setRecoveryAlternatives(data);
          toast.success("Recovery protocol complete", { description: `Found ${data.length} alternative paths.` });
        },
        onError: () => toast.error("Recovery protocol failed"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-5">
        <div className="h-8 w-24 rounded-xl shimmer-bg" />
        <div className="neu-card p-8 space-y-4">
          <div className="h-8 w-2/3 rounded shimmer-bg" />
          <div className="h-4 w-1/3 rounded shimmer-bg" />
          <div className="h-32 w-full rounded-xl shimmer-bg mt-4" />
        </div>
      </div>
    );
  }

  if (!opp) return <div className="p-8 text-center text-white/30">Opportunity not found.</div>;

  const isMissed = opp.status === "missed";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

      {/* Back */}
      <Link href="/opportunities">
        <Button variant="ghost" size="sm"
          className="pl-0 text-white/45 hover:text-cyan-400 hover:bg-transparent gap-1.5 text-xs font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Radar
        </Button>
      </Link>

      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="neu-card p-7 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${isMissed ? "from-rose-500/4" : "from-cyan-500/5"} to-transparent pointer-events-none`} />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="outline" className={`text-[10px] font-mono uppercase tracking-wider border
                ${isMissed ? "text-rose-400 border-rose-400/30 bg-rose-400/8" : "text-cyan-400 border-cyan-400/30 bg-cyan-400/8"}`}>
                {opp.status}
              </Badge>
              <Badge variant="secondary" className="bg-white/[0.04] text-white/40 text-[10px] border-white/[0.08]">{opp.type}</Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">{opp.name}</h1>
            <div className="flex flex-wrap gap-4 text-white/40 text-sm">
              {opp.deadline && (
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {opp.deadline}</span>
              )}
              {opp.link && (
                <a href={opp.link} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                  <ExternalLink className="w-4 h-4" /> View Source
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0 w-32 h-32 rounded-2xl
            bg-black/30 border border-white/[0.08] shadow-[inset_4px_4px_12px_rgba(0,0,0,0.4)]">
            <p className="text-[10px] text-white/30 font-display uppercase tracking-wider mb-1">Match</p>
            <p className="font-display text-4xl font-black text-cyan-400" style={{ textShadow: "0 0 20px rgba(34,211,238,0.5)" }}>
              {opp.matchScore}
              <span className="text-xl text-cyan-400/40">%</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3">
        <Dialog open={isAppDialogOpen} onOpenChange={setIsAppDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500
              text-white gap-2 font-display text-xs tracking-wider border-0
              shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]">
              <FileText className="w-4 h-4" /> Generate Application
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/[0.08] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-400" /> App Generator Agent
              </DialogTitle>
              <DialogDescription className="text-white/40 text-sm">Select a tone for the generated cover letter.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-black/30 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Direct</SelectItem>
                  <SelectItem value="passionate">Passionate & Enthusiastic</SelectItem>
                  <SelectItem value="confident">Confident & Bold</SelectItem>
                  <SelectItem value="analytical">Analytical & Data-driven</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAppDialogOpen(false)} className="text-white/50">Cancel</Button>
              <Button onClick={handleGenerateApp} disabled={generateApp.isPending}
                className="bg-gradient-to-r from-violet-500 to-violet-600 text-white border-0">
                {generateApp.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : "Generate Docs"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isMissed && (
          <Button variant="outline" onClick={handleRunRecovery} disabled={runRecovery.isPending}
            className="border-fuchsia-500/25 text-fuchsia-400 hover:bg-fuchsia-500/10 gap-2 font-display text-xs tracking-wider">
            {runRecovery.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />}
            Run Recovery Protocol
          </Button>
        )}
      </motion.div>

      {/* Body */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Analysis */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="md:col-span-2 neu-card p-6">
          <h3 className="font-display font-bold text-sm text-cyan-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Agent Analysis
          </h3>
          <p className="text-white/55 text-sm leading-relaxed">{opp.whyMatch}</p>
        </motion.div>

        {/* Intel sidebar */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="neu-card p-5 space-y-4">
            <h3 className="font-display font-bold text-sm text-white tracking-wide">Opportunity Intel</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-semibold">Date Found</p>
                <p className="text-sm text-white/65 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-white/30" />
                  {new Date(opp.createdAt).toLocaleDateString()}
                </p>
              </div>
              {opp.link && (
                <div className="pt-3 border-t border-white/[0.06]">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-semibold">Source</p>
                  <a href={opp.link} target="_blank" rel="noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Open External Link
                  </a>
                </div>
              )}
            </div>
          </motion.div>

          {recoveryAlternatives && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="neu-card p-5 border-fuchsia-500/15 bg-fuchsia-500/[0.03] space-y-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/8 blur-2xl rounded-full pointer-events-none" />
              <h3 className="font-display font-bold text-sm text-fuchsia-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Recovery Tactics
              </h3>
              <div className="space-y-4">
                {recoveryAlternatives.map((alt, i) => (
                  <div key={i} className="space-y-1.5 pb-3 border-b border-white/[0.05] last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-fuchsia-300">{alt.name}</p>
                      <Badge variant="secondary" className="bg-white/[0.04] text-[10px] uppercase border-white/[0.08]">{alt.type}</Badge>
                    </div>
                    <p className="text-xs text-white/35">{alt.similarityReason}</p>
                    <p className="text-xs text-fuchsia-300/70">Next: {alt.actionSuggestion}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
