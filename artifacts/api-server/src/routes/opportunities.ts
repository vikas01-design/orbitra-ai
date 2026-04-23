import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, opportunitiesTable, profilesTable } from "@workspace/db";
import { RunOpportunityRadarBody, GetOpportunityParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { runOpportunityRadarAgent } from "../lib/agents";

const router: IRouter = Router();

function serialize(row: typeof opportunitiesTable.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    type: row.type,
    matchScore: row.matchScore,
    whyMatch: row.whyMatch,
    deadline: row.deadline,
    link: row.link,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/opportunities", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.userId, req.userId!))
    .orderBy(desc(opportunitiesTable.createdAt));
  res.json(rows.map(serialize));
});

router.get("/opportunities/:id", requireAuth, async (req, res) => {
  const { id } = GetOpportunityParams.parse({ id: Number(req.params.id) });
  const row = await db.query.opportunitiesTable.findFirst({
    where: and(eq(opportunitiesTable.id, id), eq(opportunitiesTable.userId, req.userId!)),
  });
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(row));
});

router.post("/opportunities", requireAuth, async (req, res) => {
  const body = RunOpportunityRadarBody.parse(req.body ?? {});
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, req.userId!),
  });
  const discovered = await runOpportunityRadarAgent({
    skills: profile?.skills ?? [],
    interests: profile?.interests ?? [],
    targetRole: profile?.targetRole ?? null,
    focus: body.focus ?? null,
  });
  if (discovered.length === 0) {
    res.json([]);
    return;
  }
  const inserted = await db
    .insert(opportunitiesTable)
    .values(
      discovered.map((d) => ({
        userId: req.userId!,
        name: d.name,
        type: d.type,
        matchScore: d.matchScore,
        whyMatch: d.whyMatch,
        deadline: d.deadline,
        link: d.link,
        status: "open",
      })),
    )
    .returning();
  res.json(inserted.map(serialize));
});

export default router;
