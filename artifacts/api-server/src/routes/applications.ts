import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, applicationsTable, profilesTable } from "@workspace/db";
import { GenerateApplicationBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { runApplicationAgent } from "../lib/agents";

const router: IRouter = Router();

function serialize(row: typeof applicationsTable.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    opportunityId: row.opportunityId,
    opportunityName: row.opportunityName,
    tone: row.tone,
    message: row.message,
    strengths: row.strengths ?? [],
    resumeSuggestions: row.resumeSuggestions ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/applications", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.userId, req.userId!))
    .orderBy(desc(applicationsTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/applications", requireAuth, async (req, res) => {
  const body = GenerateApplicationBody.parse(req.body);
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, req.userId!),
  });
  const result = await runApplicationAgent({
    jobDescription: body.jobDescription,
    opportunityName: body.opportunityName,
    skills: profile?.skills ?? [],
    tone: body.tone,
  });
  const [inserted] = await db
    .insert(applicationsTable)
    .values({
      userId: req.userId!,
      opportunityId: body.opportunityId ?? null,
      opportunityName: body.opportunityName,
      tone: body.tone,
      message: result.message,
      strengths: result.strengths,
      resumeSuggestions: result.resumeSuggestions,
    })
    .returning();
  res.json(serialize(inserted));
});

export default router;
