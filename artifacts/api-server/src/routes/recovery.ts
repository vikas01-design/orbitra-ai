import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { RunRecoveryBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { runRecoveryAgent } from "../lib/agents";

const router: IRouter = Router();

router.post("/recovery", requireAuth, async (req, res) => {
  const body = RunRecoveryBody.parse(req.body);
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, req.userId!),
  });
  const alternatives = await runRecoveryAgent({
    missedOpportunity: body.missedOpportunity,
    skills: profile?.skills ?? [],
    interests: profile?.interests ?? [],
    targetRole: profile?.targetRole ?? null,
  });
  res.json(alternatives);
});

export default router;
