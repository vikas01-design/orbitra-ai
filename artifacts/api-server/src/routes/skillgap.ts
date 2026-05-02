import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, skillGapsTable, profilesTable } from "@workspace/db";
import { RunSkillGapBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { runSkillGapAgent } from "../lib/agents";

const router: IRouter = Router();

function serialize(row: typeof skillGapsTable.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    targetRole: row.targetRole,
    requiredSkills: row.requiredSkills ?? [],
    missingSkills: row.missingSkills ?? [],
    roadmap: row.roadmap ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/skillgap", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(skillGapsTable)
    .where(eq(skillGapsTable.userId, req.userId!))
    .orderBy(desc(skillGapsTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/skillgap", requireAuth, async (req, res) => {
  const body = RunSkillGapBody.parse(req.body);
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, req.userId!),
  });
  let result;
  try {
    result = await runSkillGapAgent({
      currentSkills: profile?.skills ?? [],
      targetRole: body.targetRole,
    });
  } catch (err: any) {
    if (err.message === "not_technical") {
      res.status(400).json({ error: "Please enter a valid technical role or technology (e.g. Frontend Developer, Python, Machine Learning)." });
      return;
    }
    throw err;
  }
  const [inserted] = await db
    .insert(skillGapsTable)
    .values({
      userId: req.userId!,
      targetRole: body.targetRole,
      requiredSkills: result.requiredSkills,
      missingSkills: result.missingSkills,
      roadmap: result.roadmap,
    })
    .returning();
  res.json(serialize(inserted));
});

export default router;
