import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Upload, Sparkles, Edit3, Save, ChevronDown, ChevronUp,
  Briefcase, Loader2, X, Download, ExternalLink, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useListResumes, useUpdateResume, useMatchResumeJobs, getListResumesQueryKey,
} from "@workspace/api-client-react";
import type { Resume } from "@workspace/api-client-react";
import jsPDF from "jspdf";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const LEVEL_COLORS: Record<string, string> = {
  Entry:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  Mid:    "bg-blue-50 text-blue-700 border-blue-200",
  Senior: "bg-violet-50 text-violet-700 border-violet-200",
  Lead:   "bg-amber-50 text-amber-700 border-amber-200",
};

function isAllCaps(line: string) {
  const clean = line.trim();
  return clean.length > 2 && clean === clean.toUpperCase() && /[A-Z]/.test(clean) && !/https?:\/\//.test(clean) && !/\|/.test(clean);
}

function parseLink(text: string): { label: string; url: string } | null {
  const m = text.match(/^(LinkedIn|GitHub|Portfolio):\s*(https?:\/\/\S+)$/i);
  if (m) return { label: m[1], url: m[2] };
  return null;
}

function ResumePreview({ content }: { content: string }) {
  const lines = content.split("\n");
  let isFirstLine = true;
  return (
    <div className="space-y-[2px] text-sm leading-relaxed select-text">
      {lines.map((raw, i) => {
        const line = raw.trimEnd();
        if (i === 0 && isFirstLine) {
          isFirstLine = false;
          return <p key={i} className="text-slate-800 font-bold text-xl tracking-wide">{line}</p>;
        }
        if (line === "") return <div key={i} className="h-3" />;
        const link = parseLink(line);
        if (link) return (
          <p key={i} className="text-slate-400 text-xs">
            {link.label}:{" "}
            <a href={link.url} target="_blank" rel="noopener noreferrer"
              className="text-cyan-600 hover:text-cyan-700 underline underline-offset-2 break-all">
              {link.url}
            </a>
          </p>
        );
        if (isAllCaps(line)) return (
          <div key={i} className="mt-5 mb-1">
            <p className="text-cyan-600 font-bold text-xs tracking-widest uppercase">{line}</p>
            <div className="border-b border-cyan-300/40 mt-0.5" />
          </div>
        );
        if (line.startsWith("•")) return (
          <p key={i} className="text-slate-600 pl-4 flex gap-2">
            <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
            <span>{line.slice(1).trim()}</span>
          </p>
        );
        if (line.includes("|")) {
          const parts = line.split("|").map(p => p.trim());
          return (
            <p key={i} className="text-slate-800 font-semibold mt-2">
              {parts.map((p, pi) => (
                <span key={pi}>{p}{pi < parts.length - 1 && <span className="text-slate-300 mx-2">|</span>}</span>
              ))}
            </p>
          );
        }
        if (line.includes(":") && !line.startsWith("•")) {
          const colon = line.indexOf(":");
          return (
            <p key={i} className="text-slate-600">
              <span className="text-slate-500 font-medium">{line.slice(0, colon)}:</span>
              {line.slice(colon + 1)}
            </p>
          );
        }
        return <p key={i} className="text-slate-600">{line}</p>;
      })}
    </div>
  );
}

function downloadPDF(content: string, fileName: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18; const maxW = pageW - margin * 2; let y = 20; const lineH = 5.2;
  function ensurePage(needed = lineH) { if (y + needed > 278) { doc.addPage(); y = 20; } }
  const lines = content.split("\n"); let firstLine = true;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (firstLine && line) {
      firstLine = false; doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); ensurePage(10); doc.text(line, margin, y); y += 9; continue;
    }
    if (line === "") { y += 3; continue; }
    const link = parseLink(line);
    if (link) { doc.setFontSize(8.5); doc.setFont("helvetica","normal"); doc.setTextColor(80,80,80); ensurePage(); doc.text(`${link.label}: ${link.url}`, margin, y); y += lineH; continue; }
    if (line.includes("|") && !isAllCaps(line)) { doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(30,30,30); ensurePage(); const wrapped = doc.splitTextToSize(line.split("|").join("  |  "), maxW); doc.text(wrapped, margin, y); y += wrapped.length * lineH; continue; }
    if (isAllCaps(line)) { y += 3; doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(20,20,20); ensurePage(8); doc.text(line, margin, y); y += 4; doc.setDrawColor(180,180,180); doc.line(margin, y, pageW - margin, y); y += 3; continue; }
    if (line.startsWith("•")) { doc.setFontSize(9.5); doc.setFont("helvetica","normal"); doc.setTextColor(40,40,40); ensurePage(); const wrapped = doc.splitTextToSize("• " + line.slice(1).trim(), maxW - 4); doc.text(wrapped, margin + 3, y); y += wrapped.length * lineH; continue; }
    if (line.includes(":") && !line.startsWith("•")) { doc.setFontSize(9.5); doc.setFont("helvetica","bold"); doc.setTextColor(40,40,40); ensurePage(); const wrapped = doc.splitTextToSize(line, maxW); doc.text(wrapped, margin, y); y += wrapped.length * lineH; continue; }
    doc.setFontSize(9.5); doc.setFont("helvetica","normal"); doc.setTextColor(50,50,50); ensurePage(); const wrapped = doc.splitTextToSize(line, maxW); doc.text(wrapped, margin, y); y += wrapped.length * lineH;
  }
  doc.save(`${fileName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]/gi, "_")}_enhanced.pdf`);
}

function UploadZone({ onUpload, isUploading }: { onUpload: (f: File) => void; isUploading: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
        ${isDragging
          ? "border-cyan-400 bg-cyan-50 scale-[1.01] shadow-[0_0_30px_rgba(34,211,238,0.15)]"
          : "border-slate-200 bg-white/60 hover:border-cyan-300 hover:bg-cyan-50/30"}
        ${isUploading ? "pointer-events-none" : ""}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.txt" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-cyan-100/50 animate-ping" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-50 to-violet-50
            flex items-center justify-center border border-slate-200 shadow-sm">
            <Upload className="w-7 h-7 text-cyan-500" />
          </div>
        )}
        <div>
          <p className="text-slate-700 font-semibold text-base">
            {isUploading ? "Processing your resume…" : "Drop your resume here"}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {isUploading ? "AI is enhancing and optimizing for ATS" : "PDF or TXT · up to 10 MB"}
          </p>
        </div>
        {!isUploading && (
          <Button variant="outline" size="sm"
            className="border-slate-200 text-slate-400 hover:border-cyan-300 hover:text-cyan-600 gap-2 text-xs">
            <FileText className="w-3.5 h-3.5" /> Browse files
          </Button>
        )}
      </div>
    </div>
  );
}

function ResumeCard({ resume }: { resume: Resume }) {
  const qc = useQueryClient();
  const updateResume = useUpdateResume();
  const matchJobs    = useMatchResumeJobs();

  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState("");
  const [showJobs, setShowJobs] = useState(false);

  const displayContent = resume.editedResume ?? resume.enhancedResume;

  function startEdit() { setDraft(displayContent); setEditing(true); }

  async function saveEdit() {
    try {
      await updateResume.mutateAsync({ id: resume.id, data: { editedResume: draft } });
      await qc.invalidateQueries({ queryKey: getListResumesQueryKey() });
      setEditing(false);
      toast.success("Changes saved");
    } catch { toast.error("Failed to save"); }
  }

  async function findJobs() {
    setShowJobs(true);
    try {
      await matchJobs.mutateAsync({ id: resume.id });
      await qc.invalidateQueries({ queryKey: getListResumesQueryKey() });
      toast.success("Job paths found!");
    } catch { toast.error("Failed to find jobs"); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="neu-card overflow-hidden hover:border-slate-300 transition-all duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-50 to-violet-50
          flex items-center justify-center shrink-0 border border-slate-200">
          <FileText className="w-4 h-4 text-cyan-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 font-semibold text-sm truncate">{resume.fileName}</p>
          <p className="text-slate-400 text-xs">
            {new Date(resume.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        {resume.editedResume && (
          <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px] shrink-0 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Edited
          </Badge>
        )}
        <div className="text-slate-300 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="px-5 pb-6 border-t border-slate-100">

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4 mb-4">
                {!editing ? (
                  <>
                    <Button size="sm" variant="outline" onClick={startEdit}
                      className="border-slate-200 text-slate-500 hover:border-cyan-300 hover:text-cyan-600 gap-1.5 text-xs h-8">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPDF(displayContent, resume.fileName)}
                      className="border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 gap-1.5 text-xs h-8">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </Button>
                    <Button size="sm" onClick={findJobs} disabled={matchJobs.isPending}
                      className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500
                        text-white gap-1.5 text-xs h-8 border-0 shadow-[0_4px_12px_rgba(34,211,238,0.2)]">
                      {matchJobs.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />}
                      {matchJobs.isPending ? "Matching…" : "Find Job Paths"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" onClick={saveEdit} disabled={updateResume.isPending}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white gap-1.5 text-xs h-8 border-0">
                      {updateResume.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}
                      className="border-slate-200 text-slate-400 gap-1.5 text-xs h-8">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  </>
                )}
              </div>

              {/* Content */}
              {editing ? (
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-700
                    font-mono text-sm resize-none focus:outline-none focus:border-cyan-400 transition-colors"
                  rows={28} value={draft} onChange={e => setDraft(e.target.value)}
                />
              ) : (
                <div className="neu-inset p-5 bg-white/80">
                  <ResumePreview content={displayContent} />
                </div>
              )}

              {/* Job matches */}
              <AnimatePresence>
                {showJobs && resume.jobMatches && resume.jobMatches.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-6 space-y-3">
                    <p className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-500" /> Recommended Job Paths
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {resume.jobMatches.map((job, ji) => (
                        <motion.div key={ji}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ji * 0.06 }}
                          className="neu-card p-4 flex flex-col gap-2 hover:border-slate-300 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-slate-800 font-semibold text-sm leading-tight">{job.title}</p>
                            <Badge variant="outline" className={`text-[10px] shrink-0 border ${LEVEL_COLORS[job.level] ?? LEVEL_COLORS.Mid}`}>
                              {job.level}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-xs">{job.companyType}</p>
                          <p className="text-slate-500 text-xs leading-relaxed">{job.matchReason}</p>
                          {job.skillsNeeded && job.skillsNeeded.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {job.skillsNeeded.map((s, si) => (
                                <span key={si} className="text-[10px] bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-500">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          <a href={job.link} target="_blank" rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                            <ExternalLink className="w-3 h-3" /> View live jobs on LinkedIn
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {showJobs && matchJobs.isPending && (
                  <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-500" /> Finding best job matches…
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const { data: resumes = [], isLoading } = useListResumes();
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(file: File) {
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(file.type)) { toast.error("Only PDF or TXT files are supported"); return; }
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const resp = await fetch(`${BASE}/api/resume/upload`, { method: "POST", body: form });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Upload failed");
      }
      await qc.invalidateQueries({ queryKey: getListResumesQueryKey() });
      toast.success("Resume enhanced successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally { setIsUploading(false); }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="neu-card p-5 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-transparent pointer-events-none" />
        <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-slate-800">Resume AI</h1>
          <p className="text-slate-400 text-xs mt-0.5">ATS optimization · job matching · PDF export</p>
        </div>
        {resumes.length > 0 && (
          <div className="ml-auto text-xs text-slate-300 font-mono">
            {resumes.length} resume{resumes.length !== 1 ? "s" : ""}
          </div>
        )}
      </motion.div>

      {/* Upload zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <UploadZone onUpload={handleUpload} isUploading={isUploading} />
      </motion.div>

      {/* Resume list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-violet-500" /> Loading resumes…
        </div>
      ) : resumes.length === 0 ? (
        <div className="neu-card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-violet-300" />
          </div>
          <p className="text-slate-400 text-sm">No resumes yet — upload one above to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-300 uppercase">Your Resumes</p>
          {resumes.map(r => <ResumeCard key={r.id} resume={r} />)}
        </div>
      )}
    </div>
  );
}
