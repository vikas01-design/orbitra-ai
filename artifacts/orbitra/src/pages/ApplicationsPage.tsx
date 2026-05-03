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
  Entry: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Mid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Senior: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Lead: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

/* ───────────────────────────── helpers ───────────────────────────── */

function isAllCaps(line: string) {
  const clean = line.trim();
  return clean.length > 2 && clean === clean.toUpperCase() && /[A-Z]/.test(clean) && !/https?:\/\//.test(clean) && !/\|/.test(clean);
}

function parseLink(text: string): { label: string; url: string } | null {
  const m = text.match(/^(LinkedIn|GitHub|Portfolio):\s*(https?:\/\/\S+)$/i);
  if (m) return { label: m[1], url: m[2] };
  return null;
}

/* ─────────────────────── Resume Preview renderer ─────────────────── */

function ResumePreview({ content }: { content: string }) {
  const lines = content.split("\n");
  let isFirstLine = true;

  return (
    <div className="space-y-[2px] text-sm leading-relaxed select-text">
      {lines.map((raw, i) => {
        const line = raw.trimEnd();

        if (i === 0 && isFirstLine) {
          isFirstLine = false;
          return (
            <p key={i} className="text-white font-bold text-xl tracking-wide">
              {line}
            </p>
          );
        }

        if (line === "") return <div key={i} className="h-3" />;

        const link = parseLink(line);
        if (link) {
          return (
            <p key={i} className="text-gray-400 text-xs">
              {link.label}:{" "}
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 break-all">
                {link.url}
              </a>
            </p>
          );
        }

        if (isAllCaps(line)) {
          return (
            <div key={i} className="mt-5 mb-1">
              <p className="text-cyan-400 font-bold text-xs tracking-widest uppercase">
                {line}
              </p>
              <div className="border-b border-cyan-500/30 mt-0.5" />
            </div>
          );
        }

        if (line.startsWith("•")) {
          return (
            <p key={i} className="text-gray-300 pl-4 flex gap-2">
              <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
              <span>{line.slice(1).trim()}</span>
            </p>
          );
        }

        if (line.includes("|")) {
          const parts = line.split("|").map((p) => p.trim());
          return (
            <p key={i} className="text-white font-semibold mt-2">
              {parts.map((p, pi) => (
                <span key={pi}>
                  {p}
                  {pi < parts.length - 1 && (
                    <span className="text-gray-500 mx-2">|</span>
                  )}
                </span>
              ))}
            </p>
          );
        }

        if (line.includes(":") && !line.startsWith("•")) {
          const colon = line.indexOf(":");
          const label = line.slice(0, colon);
          const value = line.slice(colon + 1);
          return (
            <p key={i} className="text-gray-300">
              <span className="text-gray-400 font-medium">{label}:</span>
              {value}
            </p>
          );
        }

        return <p key={i} className="text-gray-300">{line}</p>;
      })}
    </div>
  );
}

/* ─────────────────────────── PDF export ──────────────────────────── */

function downloadPDF(content: string, fileName: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const maxW = pageW - margin * 2;
  let y = 20;
  const lineH = 5.2;

  function ensurePage(needed = lineH) {
    if (y + needed > 278) { doc.addPage(); y = 20; }
  }

  const lines = content.split("\n");
  let firstLine = true;

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (firstLine && line) {
      firstLine = false;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      ensurePage(10);
      doc.text(line, margin, y);
      y += 9;
      continue;
    }

    if (line === "") {
      y += 3;
      continue;
    }

    const link = parseLink(line);
    if (link) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      ensurePage();
      doc.text(`${link.label}: ${link.url}`, margin, y);
      y += lineH;
      continue;
    }

    if (line.includes("|") && !isAllCaps(line)) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      ensurePage();
      const parts = line.split("|").join("  |  ");
      const wrapped = doc.splitTextToSize(parts, maxW);
      doc.text(wrapped, margin, y);
      y += wrapped.length * lineH;
      continue;
    }

    if (isAllCaps(line)) {
      y += 3;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      ensurePage(8);
      doc.text(line, margin, y);
      y += 4;
      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, pageW - margin, y);
      y += 3;
      continue;
    }

    if (line.startsWith("•")) {
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      ensurePage();
      const text = "• " + line.slice(1).trim();
      const wrapped = doc.splitTextToSize(text, maxW - 4);
      doc.text(wrapped, margin + 3, y);
      y += wrapped.length * lineH;
      continue;
    }

    if (line.includes(":") && !line.startsWith("•")) {
      const colon = line.indexOf(":");
      const label = line.slice(0, colon);
      const value = line.slice(colon + 1);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      ensurePage();
      const fullLine = `${label}:${value}`;
      const wrapped = doc.splitTextToSize(fullLine, maxW);
      doc.text(wrapped, margin, y);
      y += wrapped.length * lineH;
      continue;
    }

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    ensurePage();
    const wrapped = doc.splitTextToSize(line, maxW);
    doc.text(wrapped, margin, y);
    y += wrapped.length * lineH;
  }

  const safe = fileName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]/gi, "_");
  doc.save(`${safe}_enhanced.pdf`);
}

/* ──────────────────────────── upload zone ────────────────────────── */

function UploadZone({ onUpload, isUploading }: { onUpload: (f: File) => void; isUploading: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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
        ${isDragging ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]" : "border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-white/[0.04]"}
        ${isUploading ? "pointer-events-none opacity-70" : ""}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.txt" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
            <Upload className="w-7 h-7 text-cyan-400" />
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-lg">
            {isUploading ? "Processing your resume…" : "Drop your resume here"}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {isUploading ? "AI is enhancing and optimizing for ATS" : "PDF or TXT · up to 10 MB"}
          </p>
        </div>
        {!isUploading && (
          <Button variant="outline" size="sm"
            className="border-white/20 text-gray-300 hover:border-cyan-400 hover:text-cyan-400 gap-2">
            <FileText className="w-4 h-4" /> Browse files
          </Button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────── resume card ────────────────────────── */

function ResumeCard({ resume }: { resume: Resume }) {
  const qc = useQueryClient();
  const updateResume = useUpdateResume();
  const matchJobs = useMatchResumeJobs();

  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [showJobs, setShowJobs] = useState(false);

  const displayContent = resume.editedResume ?? resume.enhancedResume;

  function startEdit() {
    setDraft(displayContent);
    setEditing(true);
  }

  async function saveEdit() {
    try {
      await updateResume.mutateAsync({ id: resume.id, data: { editedResume: draft } });
      await qc.invalidateQueries({ queryKey: getListResumesQueryKey() });
      setEditing(false);
      toast.success("Changes saved");
    } catch {
      toast.error("Failed to save");
    }
  }

  async function findJobs() {
    setShowJobs(true);
    try {
      await matchJobs.mutateAsync({ id: resume.id });
      await qc.invalidateQueries({ queryKey: getListResumesQueryKey() });
      toast.success("Job paths found!");
    } catch {
      toast.error("Failed to find jobs");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">

      {/* header */}
      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/10">
          <FileText className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{resume.fileName}</p>
          <p className="text-gray-500 text-xs">{new Date(resume.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        {resume.editedResume && (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs shrink-0 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Edited
          </Badge>
        )}
        <div className="text-gray-500 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>

            <div className="px-5 pb-5 border-t border-white/5">

              {/* action buttons */}
              <div className="flex flex-wrap gap-2 mt-4 mb-4">
                {!editing ? (
                  <>
                    <Button size="sm" variant="outline"
                      onClick={startEdit}
                      className="border-white/15 text-gray-300 hover:border-cyan-400/50 hover:text-cyan-400 gap-1.5 text-xs">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="outline"
                      onClick={() => downloadPDF(displayContent, resume.fileName)}
                      className="border-white/15 text-gray-300 hover:border-purple-400/50 hover:text-purple-400 gap-1.5 text-xs">
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </Button>
                    <Button size="sm"
                      onClick={findJobs}
                      disabled={matchJobs.isPending}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white gap-1.5 text-xs">
                      {matchJobs.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />}
                      {matchJobs.isPending ? "Matching…" : "Find Job Paths"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm"
                      onClick={saveEdit}
                      disabled={updateResume.isPending}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white gap-1.5 text-xs">
                      {updateResume.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </Button>
                    <Button size="sm" variant="outline"
                      onClick={() => setEditing(false)}
                      className="border-white/15 text-gray-400 hover:text-white gap-1.5 text-xs">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  </>
                )}
              </div>

              {/* resume content */}
              {editing ? (
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 font-mono text-sm resize-none focus:outline-none focus:border-cyan-500/50 transition-colors"
                  rows={28}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              ) : (
                <div className="bg-black/30 border border-white/8 rounded-xl p-5">
                  <ResumePreview content={displayContent} />
                </div>
              )}

              {/* job matches */}
              <AnimatePresence>
                {showJobs && resume.jobMatches && resume.jobMatches.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-5">
                    <p className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Recommended Job Paths
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {resume.jobMatches.map((job, ji) => (
                        <div key={ji}
                          className="border border-white/10 rounded-xl p-4 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-white font-semibold text-sm leading-tight">{job.title}</p>
                            <Badge variant="outline"
                              className={`text-xs shrink-0 border ${LEVEL_COLORS[job.level] ?? LEVEL_COLORS.Mid}`}>
                              {job.level}
                            </Badge>
                          </div>
                          <p className="text-gray-500 text-xs">{job.companyType}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{job.matchReason}</p>
                          {job.skillsNeeded && job.skillsNeeded.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {job.skillsNeeded.map((s, si) => (
                                <span key={si} className="text-xs bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-gray-400">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View live jobs on LinkedIn
                          </a>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {showJobs && matchJobs.isPending && (
                  <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Finding best job matches…
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

/* ──────────────────────────── main page ──────────────────────────── */

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const { data: resumes = [], isLoading } = useListResumes();
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(file: File) {
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF or TXT files are supported");
      return;
    }
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
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-white/10">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Resume Enhancer</h1>
              <p className="text-gray-500 text-sm">AI-powered ATS optimization &amp; job matching</p>
            </div>
          </div>
        </div>

        {/* upload */}
        <UploadZone onUpload={handleUpload} isUploading={isUploading} />

        {/* history */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-600 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading resumes…
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No resumes yet — upload one above to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 text-xs uppercase tracking-widest font-medium">Your Resumes</p>
            {resumes.map((r) => <ResumeCard key={r.id} resume={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
