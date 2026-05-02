import { useListSkillGaps, useRunSkillGap, getListSkillGapsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Target, Zap, ChevronDown, ChevronUp, Bot, BookOpen, Youtube, X, Globe } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { label: "English", value: "english" },
  { label: "Hindi", value: "hindi" },
  { label: "Spanish", value: "spanish" },
  { label: "French", value: "french" },
  { label: "German", value: "german" },
  { label: "Portuguese", value: "portuguese" },
  { label: "Japanese", value: "japanese" },
  { label: "Korean", value: "korean" },
  { label: "Telugu", value: "telugu" },
  { label: "Tamil", value: "tamil" },
];

const TELUGU_CHANNELS = [
  { name: "Vamsi Bhavani", handle: "@VamsiBhavani", url: "https://www.youtube.com/@VamsiBhavani" },
  { name: "Telugu Web Guru", handle: "@teluguwebguru", url: "https://www.youtube.com/@teluguwebguru" },
  { name: "Software School", handle: "@software-school", url: "https://www.youtube.com/@software-school" },
  { name: "Python Life Telugu", handle: "@PythonLifetelugu", url: "https://www.youtube.com/@PythonLifetelugu" },
];

const TECHNICAL_ROLE_PATTERN = /^[a-zA-Z0-9.#+\-/ ]{2,80}$/;
const CONVERSATIONAL_PATTERNS = [
  /^(hi|hello|hey|yo|howdy|greetings)\b/i,
  /^how (are|do|can|is|was)\b/i,
  /^what (is|are|do|does|was)\b/i,
  /^who (are|is|am)\b/i,
  /^(tell|explain|describe|can you|could you|please|would you)\b/i,
  /^(why|when|where)\b/i,
  /^(thanks|thank you|ok|okay|yes|no|sure|cool)\b/i,
  /^(i am|i'm|my name|i want to|i need)\b/i,
];

function looksNonTechnical(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  return CONVERSATIONAL_PATTERNS.some((p) => p.test(trimmed));
}

type VideoPickerState = {
  query: string;
  title: string;
};

type ChannelPickerState = {
  query: string;
  title: string;
};

export default function SkillGapPage() {
  const queryClient = useQueryClient();
  const { data: gaps, isLoading } = useListSkillGaps();
  const runSkillGap = useRunSkillGap();

  const [targetRole, setTargetRole] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [videoPicker, setVideoPicker] = useState<VideoPickerState | null>(null);
  const [channelPicker, setChannelPicker] = useState<ChannelPickerState | null>(null);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = targetRole.trim();
    if (!trimmed) return;

    if (looksNonTechnical(trimmed) || !TECHNICAL_ROLE_PATTERN.test(trimmed)) {
      toast.error("Invalid input", {
        description: "Please enter a technical role or technology (e.g. Frontend Developer, Python, Machine Learning).",
      });
      return;
    }

    runSkillGap.mutate(
      { data: { targetRole: trimmed } },
      {
        onSuccess: (newGap) => {
          queryClient.invalidateQueries({ queryKey: getListSkillGapsQueryKey() });
          setTargetRole("");
          setExpandedId(newGap.id);
          toast.success("Analysis complete", { description: "Skill gap roadmap generated." });
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error ?? err?.message ?? "The agent encountered an error.";
          toast.error("Analysis failed", { description: msg });
        },
      }
    );
  };

  const openYouTube = (query: string, language: string) => {
    if (language === "telugu") {
      setVideoPicker(null);
      setChannelPicker({ query, title: videoPicker?.title ?? query });
      return;
    }
    const searchQ = language === "english" ? query : `${query} in ${language}`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQ)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setVideoPicker(null);
  };

  const openTeluguChannel = (channel: typeof TELUGU_CHANNELS[0]) => {
    if (!channelPicker) return;
    const searchQ = encodeURIComponent(channelPicker.query);
    const url = `${channel.url}/search?query=${searchQ}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setChannelPicker(null);
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
              onChange={(e) => setTargetRole(e.target.value)}
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

      {/* Language Picker Modal */}
      <AnimatePresence>
        {videoPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setVideoPicker(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-[0_0_40px_rgba(59,130,246,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h3 className="font-display font-bold text-lg">Select Language</h3>
                </div>
                <button onClick={() => setVideoPicker(null)} className="text-muted-foreground hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Choose your preferred language for the YouTube tutorial: <span className="text-blue-300 font-medium">"{videoPicker.title}"</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => openYouTube(videoPicker.query, lang.value)}
                    className="text-left px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 border border-white/5 hover:border-blue-500/30 transition-all"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telugu Channel Picker Modal */}
      <AnimatePresence>
        {channelPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setChannelPicker(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-[0_0_40px_rgba(234,179,8,0.15)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-400" />
                  <h3 className="font-display font-bold text-lg">Choose a Telugu Channel</h3>
                </div>
                <button onClick={() => setChannelPicker(null)} className="text-muted-foreground hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Select a channel to search for: <span className="text-yellow-300 font-medium">"{channelPicker.title}"</span>
              </p>
              <div className="flex flex-col gap-2">
                {TELUGU_CHANNELS.map((channel) => (
                  <button
                    key={channel.handle}
                    onClick={() => openTeluguChannel(channel)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-white/5 hover:bg-red-500/15 hover:text-red-300 border border-white/5 hover:border-red-500/30 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <Youtube className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white/90">{channel.name}</div>
                      <div className="text-xs text-muted-foreground">{channel.handle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 pt-8">
        <h2 className="font-display text-xl font-bold border-b border-white/5 pb-4">Past Analyses</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
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
                              {gap.requiredSkills.filter((s) => gap.missingSkills.indexOf(s) === -1).map((skill) => (
                                <Badge key={skill} variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{skill}</Badge>
                              ))}
                              {gap.requiredSkills.filter((s) => gap.missingSkills.indexOf(s) === -1).length === 0 && (
                                <span className="text-sm text-muted-foreground">None validated against target.</span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-sm font-display text-rose-400 uppercase tracking-wider flex items-center gap-2">
                              <Target className="w-4 h-4" /> Missing Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {gap.missingSkills.map((skill) => (
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
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-mono text-blue-300 mb-1">{step.day}</div>
                                    <h5 className="font-bold text-blue-100 mb-1">{step.title}</h5>
                                    <p className="text-sm text-muted-foreground">{step.details}</p>
                                  </div>
                                  {step.videoQuery && (
                                    <button
                                      onClick={() => setVideoPicker({ query: step.videoQuery, title: step.title })}
                                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all mt-0.5"
                                      title="Watch tutorial on YouTube"
                                    >
                                      <Youtube className="w-3.5 h-3.5" />
                                      Watch
                                    </button>
                                  )}
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
