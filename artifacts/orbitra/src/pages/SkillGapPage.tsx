import { useListSkillGaps, useRunSkillGap, getListSkillGapsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Activity, Target, Zap, ChevronDown, ChevronUp, Bot, BookOpen, Youtube, X, Globe } from "lucide-react";
import { toast } from "sonner";

type Channel = { name: string; handle: string; url: string };

const LANGUAGE_CHANNELS: Record<string, { label: string; channels: Channel[] }> = {
  english:    { label: "English",    channels: [{ name: "freeCodeCamp", handle: "@freecodecamp", url: "https://www.youtube.com/@freecodecamp" }, { name: "Derek Banas", handle: "@derekbanas", url: "https://www.youtube.com/@derekbanas" }] },
  hindi:      { label: "Hindi",      channels: [{ name: "Code With Harry", handle: "@CodeWithHarry", url: "https://www.youtube.com/@CodeWithHarry" }, { name: "MySirG", handle: "@mysirgdotcom", url: "https://www.youtube.com/@mysirgdotcom" }, { name: "freeCodeCamp Hindi", handle: "@freecodecamphindi", url: "https://www.youtube.com/@freecodecamphindi" }] },
  spanish:    { label: "Spanish",    channels: [{ name: "Hola Mundo", handle: "@HolaMundoDev", url: "https://www.youtube.com/@HolaMundoDev" }, { name: "Píldoras Informáticas", handle: "@pildorasinformaticas", url: "https://www.youtube.com/@pildorasinformaticas" }] },
  french:     { label: "French",     channels: [{ name: "Grafikart", handle: "@grafikart", url: "https://www.youtube.com/@grafikart" }, { name: "Graven", handle: "@Gravenilvectuto", url: "https://www.youtube.com/@Gravenilvectuto" }, { name: "École du Web", handle: "@EcoleduWeb", url: "https://www.youtube.com/@EcoleduWeb" }] },
  german:     { label: "German",     channels: [{ name: "Data Science Institute", handle: "@datascience.institute", url: "https://www.youtube.com/@datascience.institute" }, { name: "Programmieren Lernen", handle: "@Programmierenlernen", url: "https://www.youtube.com/@Programmierenlernen" }] },
  portuguese: { label: "Portuguese", channels: [{ name: "Curso em Vídeo", handle: "@cursoemvideo", url: "https://www.youtube.com/cursoemvideo" }, { name: "Rocketseat", handle: "@rocketseat", url: "https://www.youtube.com/@rocketseat" }, { name: "cod3r", handle: "@cod3r", url: "https://www.youtube.com/@cod3r" }] },
  telugu:     { label: "Telugu",     channels: [{ name: "Vamsi Bhavani", handle: "@VamsiBhavani", url: "https://www.youtube.com/@VamsiBhavani" }, { name: "Telugu Web Guru", handle: "@teluguwebguru", url: "https://www.youtube.com/@teluguwebguru" }, { name: "Software School", handle: "@software-school", url: "https://www.youtube.com/@software-school" }, { name: "Python Life Telugu", handle: "@PythonLifetelugu", url: "https://www.youtube.com/@PythonLifetelugu" }] },
  tamil:      { label: "Tamil",      channels: [{ name: "Code IO", handle: "@codeio", url: "https://www.youtube.com/@codeio" }, { name: "Error Makes Clever", handle: "@ErrorMakesClever", url: "https://www.youtube.com/@ErrorMakesClever" }, { name: "Codebinx", handle: "@codebinx", url: "https://www.youtube.com/@codebinx" }] },
};

const LANGUAGES = Object.entries(LANGUAGE_CHANNELS).map(([value, { label }]) => ({ value, label }));
const TECHNICAL_ROLE_PATTERN = /^[a-zA-Z0-9.#+\-/ ]{2,80}$/;
const CONVERSATIONAL_PATTERNS = [/^(hi|hello|hey|yo|howdy)\b/i, /^how (are|do|can|is)\b/i, /^what (is|are|do)\b/i, /^(tell|explain|can you)\b/i, /^(why|when|where)\b/i, /^(thanks|ok|yes|no|sure)\b/i, /^(i am|i'm|my name)\b/i];
function looksNonTechnical(input: string) { return CONVERSATIONAL_PATTERNS.some(p => p.test(input.trim().toLowerCase())); }

type VideoPickerState   = { query: string; title: string };
type ChannelPickerState = { query: string; title: string; language: string };

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        className="neu-card w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function SkillGapPage() {
  const queryClient = useQueryClient();
  const { data: gaps, isLoading } = useListSkillGaps();
  const runSkillGap = useRunSkillGap();

  const [targetRole, setTargetRole]     = useState("");
  const [expandedId, setExpandedId]     = useState<number | null>(null);
  const [videoPicker, setVideoPicker]   = useState<VideoPickerState | null>(null);
  const [channelPicker, setChannelPicker] = useState<ChannelPickerState | null>(null);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = targetRole.trim();
    if (!trimmed) return;
    if (looksNonTechnical(trimmed) || !TECHNICAL_ROLE_PATTERN.test(trimmed)) {
      toast.error("Invalid input", { description: "Enter a technical role or technology (e.g. Frontend Developer, Python)." });
      return;
    }
    runSkillGap.mutate({ data: { targetRole: trimmed } }, {
      onSuccess: (newGap) => {
        queryClient.invalidateQueries({ queryKey: getListSkillGapsQueryKey() });
        setTargetRole("");
        setExpandedId(newGap.id);
        toast.success("Analysis complete", { description: "Skill gap roadmap generated." });
      },
      onError: (err: any) => {
        toast.error("Analysis failed", { description: err?.response?.data?.error ?? err?.message ?? "Agent error." });
      },
    });
  };

  const selectLanguage = (language: string) => {
    if (!videoPicker) return;
    setChannelPicker({ query: videoPicker.query, title: videoPicker.title, language });
    setVideoPicker(null);
  };

  const openChannel = (channel: Channel) => {
    if (!channelPicker) return;
    window.open(`${channel.url}/search?query=${encodeURIComponent(channelPicker.query)}`, "_blank", "noopener,noreferrer");
    setChannelPicker(null);
  };

  const channelList     = channelPicker ? LANGUAGE_CHANNELS[channelPicker.language]?.channels ?? [] : [];
  const channelLangLabel = channelPicker ? LANGUAGE_CHANNELS[channelPicker.language]?.label ?? "" : "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto
          shadow-[0_0_20px_rgba(96,165,250,0.2)]">
          <Activity className="w-7 h-7 text-blue-400" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Skill Gap Analyzer</h1>
        <p className="text-white/40 text-sm leading-relaxed max-w-md mx-auto">
          Define your target role and the agent builds a custom learning roadmap with resources.
        </p>
      </motion.div>

      {/* Input */}
      <motion.form onSubmit={handleAnalyze} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl pointer-events-none" />
          <div className="relative neu-inset flex items-center rounded-2xl px-4 border border-blue-500/15">
            <Target className="w-5 h-5 text-blue-400/60 shrink-0 mr-3" />
            <Input
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Staff Fullstack Engineer, ML Engineer…"
              className="h-14 bg-transparent border-0 text-white placeholder:text-white/25 focus-visible:ring-0 shadow-none text-sm"
            />
          </div>
        </div>
        <Button type="submit" disabled={runSkillGap.isPending || !targetRole.trim()}
          className="h-14 px-7 rounded-2xl font-display text-xs tracking-wider shrink-0
            bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500
            text-white border-0 shadow-[0_0_24px_rgba(96,165,250,0.4)] hover:shadow-[0_0_32px_rgba(96,165,250,0.5)]">
          {runSkillGap.isPending
            ? <Bot className="w-5 h-5 animate-pulse" />
            : <><Zap className="w-4 h-4 mr-2" /> Analyze</>}
        </Button>
      </motion.form>

      {/* Modals */}
      <AnimatePresence>
        {videoPicker && (
          <Modal onClose={() => setVideoPicker(null)}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className="font-display font-bold text-base">Select Language</h3>
              </div>
              <button onClick={() => setVideoPicker(null)} className="text-white/30 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/40 mb-5">For: <span className="text-blue-300 font-medium">"{videoPicker.title}"</span></p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang.value} onClick={() => selectLanguage(lang.value)}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium
                    bg-white/[0.03] hover:bg-blue-500/15 hover:text-blue-300
                    border border-white/[0.06] hover:border-blue-500/30 transition-all">
                  {lang.label}
                </button>
              ))}
            </div>
          </Modal>
        )}

        {channelPicker && (
          <Modal onClose={() => setChannelPicker(null)}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-400" />
                <h3 className="font-display font-bold text-base">{channelLangLabel} Channels</h3>
              </div>
              <button onClick={() => setChannelPicker(null)} className="text-white/30 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/40 mb-4">Topic: <span className="text-yellow-300 font-medium">"{channelPicker.title}"</span></p>
            <div className="flex flex-col gap-2">
              {channelList.map(channel => (
                <button key={channel.handle} onClick={() => openChannel(channel)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left
                    bg-white/[0.03] hover:bg-red-500/12 hover:text-red-300
                    border border-white/[0.06] hover:border-red-500/25 transition-all">
                  <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold text-sm">{channel.name}</p>
                    <p className="text-white/35 text-xs">{channel.handle}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { setChannelPicker(null); setVideoPicker({ query: channelPicker.query, title: channelPicker.title }); }}
              className="mt-4 w-full text-xs text-white/30 hover:text-white/60 transition-colors text-center">
              ← Back to language selection
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Past Analyses */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <h2 className="font-display text-sm font-bold text-white tracking-wider uppercase">Past Analyses</h2>
          {gaps && gaps.length > 0 && (
            <span className="text-xs text-white/25 font-mono">{gaps.length} record{gaps.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 w-full rounded-2xl shimmer-bg" />)}
          </div>
        ) : gaps?.length === 0 ? (
          <div className="neu-card p-12 text-center">
            <Bot className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No analyses yet. Run one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gaps?.map((gap) => (
              <div key={gap.id}
                className="neu-card overflow-hidden hover:border-blue-500/20 transition-all duration-300">
                <div
                  onClick={() => setExpandedId(expandedId === gap.id ? null : gap.id)}
                  className="p-5 cursor-pointer flex items-center justify-between
                    hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <h3 className="font-display font-bold text-base text-blue-100">{gap.targetRole}</h3>
                    <p className="text-xs text-white/30 mt-0.5">
                      {new Date(gap.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="text-xs text-emerald-400 font-mono">{gap.requiredSkills.filter(s => !gap.missingSkills.includes(s)).length} ✓</span>
                      <span className="text-xs text-rose-400 font-mono">{gap.missingSkills.length} ✗</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400">
                      {expandedId === gap.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === gap.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 border-t border-white/[0.05] space-y-6 bg-black/20 pt-5">

                        {/* Skills */}
                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold tracking-[0.18em] text-emerald-400 uppercase flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Validated Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {gap.requiredSkills.filter(s => !gap.missingSkills.includes(s)).map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">{skill}</Badge>
                              ))}
                              {gap.requiredSkills.filter(s => !gap.missingSkills.includes(s)).length === 0 && (
                                <p className="text-xs text-white/30">None validated.</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold tracking-[0.18em] text-rose-400 uppercase flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5" /> Missing Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {gap.missingSkills.map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Roadmap */}
                        <div className="space-y-4 pt-4 border-t border-white/[0.05]">
                          <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-400" /> Learning Roadmap
                          </h4>
                          <div className="space-y-4 pl-4 border-l-2 border-blue-500/15 relative">
                            {gap.roadmap.map((step: any, i: number) => (
                              <motion.div key={i}
                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="relative pl-5"
                              >
                                <div className="absolute -left-[29px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-[3px] border-background shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-mono text-blue-300/70 mb-0.5">{step.day}</p>
                                    <h5 className="font-semibold text-sm text-white/85 mb-1">{step.title}</h5>
                                    <p className="text-xs text-white/40 leading-relaxed">{step.details}</p>
                                  </div>
                                  {step.videoQuery && (
                                    <button onClick={() => setVideoPicker({ query: step.videoQuery, title: step.title })}
                                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                        bg-red-500/10 text-red-400 border border-red-500/20
                                        hover:bg-red-500/20 hover:border-red-500/40 transition-all mt-0.5">
                                      <Youtube className="w-3.5 h-3.5" /> Watch
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
