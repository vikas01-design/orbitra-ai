import { useListApplications, useGenerateApplication, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Copy, CheckCircle2, ChevronDown, ChevronUp, Briefcase, Zap, Bot } from "lucide-react";
import { toast } from "sonner";

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const { data: applications, isLoading } = useListApplications();
  const generateApp = useGenerateApplication();
  
  const [jobDescription, setJobDescription] = useState("");
  const [opportunityName, setOpportunityName] = useState("");
  const [tone, setTone] = useState("professional");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || !opportunityName.trim()) return;

    generateApp.mutate(
      { data: { jobDescription, tone, opportunityName } },
      {
        onSuccess: (newApp) => {
          queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
          setJobDescription("");
          setOpportunityName("");
          setExpandedId(newApp.id);
          toast.success("Documents generated", { description: "Cover letter and resume suggestions are ready." });
        },
        onError: () => {
          toast.error("Generation failed", { description: "The agent encountered an error." });
        }
      }
    );
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <FileText className="text-violet-400 w-8 h-8" /> Application Generator
          </h1>
          <p className="text-muted-foreground mt-1">Craft bespoke cover letters and resume tweaks tailored to the JD.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Generator Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border-violet-500/20 bg-violet-500/5 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />
            <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2 relative z-10">
              <Bot className="w-5 h-5 text-violet-400" /> New Document
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-violet-200">Company / Role Name</label>
                <Input 
                  value={opportunityName}
                  onChange={e => setOpportunityName(e.target.value)}
                  placeholder="e.g. Acme Corp Frontend" 
                  className="bg-background/80 border-white/10 focus-visible:ring-violet-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-violet-200">Job Description</label>
                <Textarea 
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the full JD here..." 
                  className="h-48 resize-none bg-background/80 border-white/10 focus-visible:ring-violet-400 text-xs font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-violet-200">Voice Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-background/80 border-white/10">
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
              
              <Button 
                type="submit" 
                disabled={generateApp.isPending || !jobDescription.trim() || !opportunityName.trim()} 
                className="w-full font-display bg-violet-500 hover:bg-violet-600 text-white mt-4"
              >
                {generateApp.isPending ? "Drafting..." : "Generate Application"}
              </Button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display text-xl font-bold border-b border-white/5 pb-4">Document Library</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
            </div>
          ) : applications?.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-white/5 border-dashed rounded-2xl bg-white/5">
              <FileText className="w-12 h-12 mx-auto opacity-20 mb-4" />
              <p>No documents generated yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications?.map((app) => (
                <div key={app.id} className="glass-card border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-violet-500/30">
                  <div 
                    className="p-5 cursor-pointer flex justify-between items-center bg-background/20 hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg">{app.opportunityName}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="uppercase tracking-widest text-violet-400/70">{app.tone}</span>
                          <span>•</span>
                          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-violet-400">
                      {expandedId === app.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedId === app.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/40 border-t border-white/5"
                      >
                        <div className="p-6 space-y-8">
                          
                          {/* Cover Letter */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-end">
                              <h4 className="text-sm font-display text-violet-300 uppercase tracking-wider">Drafted Message</h4>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleCopy(app.message, app.id)}
                                className="h-8 gap-2 border-white/10 hover:bg-violet-500/20"
                              >
                                {copiedId === app.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                Copy
                              </Button>
                            </div>
                            <div className="p-5 rounded-xl bg-background/50 border border-white/5 text-sm leading-relaxed whitespace-pre-wrap font-serif text-gray-300">
                              {app.message}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Highlighted Strengths */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-display text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Highlighted Strengths
                              </h4>
                              <ul className="space-y-2">
                                {(app.strengths ?? []).map((s: string, i: number) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Resume Tweaks */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-display text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Resume Tweaks
                              </h4>
                              <ul className="space-y-2">
                                {(app.resumeSuggestions ?? []).map((t: string, i: number) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-cyan-500 mt-0.5">•</span> {t}
                                  </li>
                                ))}
                              </ul>
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
    </div>
  );
}
