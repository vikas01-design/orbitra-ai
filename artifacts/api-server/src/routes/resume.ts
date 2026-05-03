import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import multer from "multer";
import { db, resumesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { runResumeEnhancerAgent, runResumeJobMatchAgent } from "../lib/agents";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF and TXT files are accepted"));
  },
});

function serialize(row: typeof resumesTable.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    fileName: row.fileName,
    originalText: row.originalText,
    enhancedResume: row.enhancedResume,
    editedResume: row.editedResume ?? null,
    jobMatches: row.jobMatches ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/resume", requireAuth, async (req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.userId, req.userId!))
    .orderBy(desc(resumesTable.createdAt));
  res.json(rows.map(serialize));
});

router.post(
  "/resume/upload",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    let originalText = "";
    if (file.mimetype === "application/pdf") {
      const { default: pdfParse } = await import("pdf-parse");
      const parsed = await pdfParse(file.buffer);
      originalText = parsed.text;
    } else {
      originalText = file.buffer.toString("utf-8");
    }

    if (!originalText.trim()) {
      res.status(400).json({ error: "Could not extract text from the file. Please try a text-based PDF." });
      return;
    }

    const enhancedResume = await runResumeEnhancerAgent(originalText);

    const [inserted] = await db
      .insert(resumesTable)
      .values({
        userId: req.userId!,
        fileName: file.originalname,
        originalText,
        enhancedResume,
      })
      .returning();

    res.json(serialize(inserted));
  }
);

router.patch("/resume/:id", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { editedResume } = req.body as { editedResume?: string };
  if (!editedResume) {
    res.status(400).json({ error: "editedResume is required" });
    return;
  }
  const [updated] = await db
    .update(resumesTable)
    .set({ editedResume })
    .where(eq(resumesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }
  res.json(serialize(updated));
});

router.post("/resume/:id/jobs", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const row = await db.query.resumesTable.findFirst({
    where: eq(resumesTable.id, id),
  });
  if (!row) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }
  const resumeContent = row.editedResume ?? row.enhancedResume;
  const jobs = await runResumeJobMatchAgent(resumeContent);
  const [updated] = await db
    .update(resumesTable)
    .set({ jobMatches: jobs })
    .where(eq(resumesTable.id, id))
    .returning();
  res.json(serialize(updated));
});

export default router;
