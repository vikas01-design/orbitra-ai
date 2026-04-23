import { useGetOpportunity, useRunRecovery, useGenerateApplication, getListOpportunitiesQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Target, Briefcase, FileText, RefreshCw, Zap, Building2, MapPin, DollarSign, Calendar } from "lucide-react";
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
    generateApp.mutate(
      { data: { opportunityId: oppId, tone } },
      {
        onSuccess: () => {
          toast.success("Application generated", { description: "Check the Applications tab to view it." });
          setIsAppDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to generate application");
        }
      }
    );
  };

  const handleRunRecovery = () => {
    runRecovery.mutate(
      { data: { opportunityId: oppId } },
      {
        onSuccess: (data) => {
          setRecoveryAlternatives(data);
          toast.success("Recovery protocol complete", { description: `Found ${data.length} alternative paths.` });
        },
        onError: () => {
          toast.error("Recovery protocol failed");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-24 mb-8" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-8 w-1/3 mb-8" />
        <div className="glass-card p-8 rounded-2xl h-64"><Skeleton className="h-full w-full" /></div>
      </div>
    );
  }

  if (!opp) {
    return <div className="container mx-auto p-8 text-center text-muted-foreground">Opportunity not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <Link href="/opportunities">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-cyan-400 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Radar
        </Button>
      </Link>

      {/* Header Area */}
      <div className="relative">
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className={`uppercase tracking-wider font-mono ${opp.status === 'rejected' ? 'text-destructive border-destructive/30 bg-destructive/10' : 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10'}`}>
                {opp.status}
              </Badge>
              <Badge variant="secondary" className="bg-white/5">{opp.type}</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">{opp.title}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm font-medium">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {opp.company}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {opp.location}</span>
              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {opp.salary || "Undisclosed"}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border-white/5 shrink-0 min-w-[140px]">
            <span className="text-sm font-display text-muted-foreground mb-2 uppercase tracking-wider">Match Score</span>
            <div className="text-4xl font-display font-bold text-cyan-400">{opp.matchScore}<span className="text-2xl text-cyan-400/50">%</span></div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 py-6 border-y border-white/5">
        <Dialog open={isAppDialogOpen} onOpenChange={setIsAppDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="font-display bg-violet-500 hover:bg-violet-600 text-white gap-2">
              <FileText className="w-5 h-5" /> Generate Application
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-400" /> App Generator Agent
              </DialogTitle>
              <DialogDescription>
                Select a tone for the generated cover letter and resume tweaks.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-background/50 border-white/10">
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
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAppDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerateApp} disabled={generateApp.isPending} className="bg-violet-500 hover:bg-violet-600 text-white">
                {generateApp.isPending ? "Generating..." : "Generate Docs"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {opp.status === 'rejected' && (
          <Button 
            size="lg" 
            variant="outline" 
            onClick={handleRunRecovery} 
            disabled={runRecovery.isPending}
            className="font-display border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/10 gap-2"
          >
            {runRecovery.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Run Recovery Protocol
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold flex items-center gap-2 text-cyan-400">
              <Zap className="w-5 h-5" /> Agent Analysis
            </h3>
            <div className="glass-card p-6 rounded-2xl border-white/5 text-lg leading-relaxed text-muted-foreground">
              {opp.whyMatch}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" /> Job Description
            </h3>
            <div className="glass-card p-6 rounded-2xl border-white/5 whitespace-pre-wrap text-muted-foreground font-mono text-sm leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
              {opp.description}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border-white/5 space-y-4">
            <h3 className="font-display font-bold mb-4">Opportunity Intel</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Date Found</p>
                <p className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4 opacity-50" /> {new Date(opp.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Source</p>
                <p className="font-medium">{opp.url ? <a href={opp.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">External Link</a> : "Manual Entry"}</p>
              </div>
            </div>
          </div>

          {/* Recovery Results Panel */}
          {recoveryAlternatives && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl border-fuchsia-500/30 bg-fuchsia-500/5 space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-2xl rounded-full pointer-events-none" />
              <h3 className="font-display font-bold flex items-center gap-2 text-fuchsia-400">
                <RefreshCw className="w-4 h-4" /> Recovery Tactics
              </h3>
              <div className="space-y-4 relative z-10">
                {recoveryAlternatives.map((alt, i) => (
                  <div key={i} className="space-y-2">
                    <p className="font-medium text-sm text-fuchsia-300">{alt.tactic}</p>
                    <p className="text-xs text-muted-foreground">{alt.explanation}</p>
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
