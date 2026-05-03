import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Upload, Sparkles, Edit3, Save, ChevronDown, ChevronUp,
  Briefcase, CheckCircle2, Loader2, ArrowRight, X, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { useListResumes, useUpdateResume, useMatchResumeJobs, getListResumesQueryKey } from "@workspace/api-client-react";
import type { Resume } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const LEVEL_COLORS: Record<string, string> = {
  Entry: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Mid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Senior: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Lead: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-200 space-y-0.5">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h2 key={i} className="text-blue-300 font-bold text-base mt-4 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="text-white font-bold text-xl mt-2 mb-1">{line.slice(2)}</h1>;
        if (line.startsWith("- ")) return <p key={i} className="text-gray-300 pl-2">• {line.slice(2)}</p>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
        if (line === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-gray-300">{line}</p>;
      })}
    </div>
  );
}

function UploadZone({ onUpload, isUploading }: { onUpload: (file: File) => void; isUploading: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer p-12 text-center
        ${isDragging ? "border-violet-400 bg-violet-500/10 scale-[1.01]" : "border-white/10 hover:border-violet-400/50 hover:bg-violet-500/5"}
        ${isUploading ? "pointer-events-none opacity-70" : ""}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleChange} />
      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-violet-300">Enhancing your resume...</p>
              <p className="text-sm text-muted-foreground mt-1">AI is applying ATS optimization. This takes ~20 seconds.</p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-violet-400"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <p className="font-display font-bold text-lg">Upload Your Resume</p>
              <p className="text-sm text-muted-foreground mt-1">Drag & drop or click to browse</p>
              <p className="text-xs text-muted-foreground/60 mt-2">PDF or TXT · Max 10 MB</p>
            </div>
            <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">AI-powered ATS enhancement</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResumeCard({ resume }: { resume: Resume }) {
  const queryClient = useQueryClient();
  const updateResume = useUpdateResume();
  const matchJobs = useMatchResumeJobs();

  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showJobs, setShowJobs] = useState(false);

  const displayResume = resume.editedResume ?? resume.enhancedResume;
  const hasJobs = (resume.jobMatches ?? []).length > 0;

  const handleEditStart = () => {
    setEditContent(displayResume);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateResume.mutate(
      { id: resume.id, data: { editedResume: editContent } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListResumesQueryKey() });
          setIsEditing(false);
          toast.success("Changes saved");
        },
        onError: () => toast.error("Failed to save changes"),
      }
    );
  };

  const handleFindJobs = () => {
    matchJobs.mutate(
      { id: resume.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListResumesQueryKey() });
          setShowJobs(true);
          toast.success("Job paths identified");
        },
        onError: () => toast.error("Failed to find job matches"),
      }
    );
  };

  return (
    <div className="glass-card border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-violet-500/30">
      <div
        className="p-5 cursor-pointer flex justify-between items-center bg-background/20 hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">{resume.fileName}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="text-violet-400/70 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ATS Enhanced
              </span>
              {resume.editedResume && <span className="text-emerald-400/70">• Edited</span>}
              {hasJobs && <span className="text-blue-400/70">• {resume.jobMatches!.length} job paths</span>}
              <span>• {new Date(resume.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 text-violet-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-6 bg-black/30 space-y-6">

              {/* Action bar */}
              <div className="flex flex-wrap gap-3">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEditStart}
                    className="gap-2 border-white/10 hover:bg-violet-500/20 hover:border-violet-500/40">
                    <Edit3 className="w-4 h-4" /> Edit Resume
                  </Button>
                ) : (
                  <>
                    <Button size="sm" onClick={handleSave} disabled={updateResume.isPending}
                      className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                      {updateResume.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}
                      className="gap-2 border-white/10 hover:bg-white/5">
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                  </>
                )}

                {!isEditing && (
                  <Button
                    size="sm"
                    onClick={handleFindJobs}
                    disabled={matchJobs.isPending}
                    className="gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 hover:border-blue-500/40"
                  >
                    {matchJobs.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding paths...</>
                      : <><Briefcase className="w-4 h-4" /> {hasJobs ? "Refresh" : "Find"} Job Paths</>
                    }
                  </Button>
                )}

                {hasJobs && !isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setShowJobs(!showJobs)}
                    className="gap-2 text-blue-400 hover:bg-blue-500/10">
                    <ArrowRight className={`w-4 h-4 transition-transform ${showJobs ? "rotate-90" : ""}`} />
                    {showJobs ? "Hide" : "Show"} Job Paths
                  </Button>
                )}
              </div>

              {/* Resume content */}
              {isEditing ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-mono">Editing — changes are not saved until you click Save</p>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[500px] bg-background/50 border border-white/10 rounded-xl p-4 text-sm font-mono text-gray-200 resize-none focus:outline-none focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/30"
                  />
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-background/40 border border-white/5">
                  <MarkdownPreview content={displayResume} />
                </div>
              )}

              {/* Job matches */}
              <AnimatePresence>
                {showJobs && hasJobs && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="font-display font-bold text-lg flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-400" /> Recommended Job Paths
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {resume.jobMatches!.map((job, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/25 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display font-bold text-blue-100">{job.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{job.companyType}</p>
                            </div>
                            <Badge variant="secondary" className={`shrink-0 text-xs ${LEVEL_COLORS[job.level] ?? LEVEL_COLORS.Mid}`}>
                              {job.level}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{job.matchReason}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {job.skillsNeeded.map((s) => (
                              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">{s}</span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const { data: resumes, isLoading } = useListResumes();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(file.type)) {
      toast.error("Unsupported file type", { description: "Please upload a PDF or TXT file." });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${BASE}/api/resume/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      await queryClient.invalidateQueries({ queryKey: getListResumesQueryKey() });
      toast.success("Resume enhanced!", { description: "Your ATS-optimized resume is ready to view and edit." });
    } catch (err: any) {
      toast.error("Enhancement failed", { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Sparkles className="text-violet-400 w-8 h-8" /> Resume Enhancer
        </h1>
        <p className="text-muted-foreground">Upload your resume — our AI rewrites it to be ATS-optimized and recruiter-ready. Then discover matched job opportunities.</p>
      </div>

      <UploadZone onUpload={handleUpload} isUploading={isUploading} />

      <div className="space-y-6">
        <h2 className="font-display text-xl font-bold border-b border-white/5 pb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-400" /> Enhanced Resumes
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        ) : !resumes?.length ? (
          <div className="text-center py-16 text-muted-foreground border border-white/5 border-dashed rounded-2xl bg-white/5">
            <Upload className="w-12 h-12 mx-auto opacity-20 mb-4" />
            <p className="font-medium">No resumes enhanced yet</p>
            <p className="text-sm mt-1 opacity-60">Upload your first resume above to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map(resume => <ResumeCard key={resume.id} resume={resume} />)}
          </div>
        )}
      </div>
    </div>
  );
}
