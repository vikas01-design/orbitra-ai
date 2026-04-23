import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  opportunitiesTable,
  applicationsTable,
  skillGapsTable,
  interviewsTable,
} from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const [opps, apps, gaps, sessions] = await Promise.all([
    db.select().from(opportunitiesTable).where(eq(opportunitiesTable.userId, userId)),
    db.select().from(applicationsTable).where(eq(applicationsTable.userId, userId)),
    db
      .select()
      .from(skillGapsTable)
      .where(eq(skillGapsTable.userId, userId))
      .orderBy(desc(skillGapsTable.createdAt)),
    db.select().from(interviewsTable).where(eq(interviewsTable.userId, userId)),
  ]);
  const total = opps.length;
  const open = opps.filter((o) => o.status === "open").length;
  const applied = opps.filter((o) => o.status === "applied").length;
  const missed = opps.filter((o) => o.status === "missed").length;
  const avg =
    total > 0 ? Math.round(opps.reduce((a, o) => a + o.matchScore, 0) / total) : 0;
  const top = gaps[0];
  res.json({
    totalOpportunities: total,
    openOpportunities: open,
    appliedCount: applied,
    missedCount: missed,
    applicationsGenerated: apps.length,
    interviewsCompleted: sessions.filter((s) => s.status === "completed").length,
    averageMatchScore: avg,
    topSkillGapRole: top?.targetRole ?? null,
    missingSkillsCount: top?.missingSkills?.length ?? 0,
  });
});

router.get("/dashboard/activity", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const [opps, apps, gaps, sessions] = await Promise.all([
    db
      .select()
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.userId, userId))
      .orderBy(desc(opportunitiesTable.createdAt))
      .limit(5),
    db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.userId, userId))
      .orderBy(desc(applicationsTable.createdAt))
      .limit(5),
    db
      .select()
      .from(skillGapsTable)
      .where(eq(skillGapsTable.userId, userId))
      .orderBy(desc(skillGapsTable.createdAt))
      .limit(5),
    db
      .select()
      .from(interviewsTable)
      .where(eq(interviewsTable.userId, userId))
      .orderBy(desc(interviewsTable.createdAt))
      .limit(5),
  ]);
  const items = [
    ...opps.map((o) => ({
      id: `opp-${o.id}`,
      kind: "opportunity",
      title: o.name,
      subtitle: `${o.type} · ${o.matchScore}% match`,
      createdAt: o.createdAt.toISOString(),
    })),
    ...apps.map((a) => ({
      id: `app-${a.id}`,
      kind: "application",
      title: `Application for ${a.opportunityName}`,
      subtitle: `Tone: ${a.tone}`,
      createdAt: a.createdAt.toISOString(),
    })),
    ...gaps.map((g) => ({
      id: `gap-${g.id}`,
      kind: "skillgap",
      title: `Skill gap: ${g.targetRole}`,
      subtitle: `${g.missingSkills?.length ?? 0} missing skills`,
      createdAt: g.createdAt.toISOString(),
    })),
    ...sessions.map((s) => ({
      id: `int-${s.id}`,
      kind: "interview",
      title: `Interview · ${s.role}`,
      subtitle: `${s.difficulty} · ${s.status}`,
      createdAt: s.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 12);
  res.json(items);
});

export default router;
