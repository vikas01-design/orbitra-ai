import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { db, profilesTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";
import { requireAuth, ensureProfile } from "../lib/auth";

const router: IRouter = Router();

function serialize(row: typeof profilesTable.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    email: row.email,
    targetRole: row.targetRole,
    skills: row.skills ?? [],
    interests: row.interests ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/profile", requireAuth, async (req, res) => {
  const userId = req.userId!;
  let name = "Explorer";
  let email = "";
  try {
    const user = await clerkClient.users.getUser(userId);
    name = user.firstName
      ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
      : user.username ?? user.emailAddresses[0]?.emailAddress?.split("@")[0] ?? "Explorer";
    email = user.emailAddresses[0]?.emailAddress ?? "";
  } catch (err) {
    req.log.warn({ err }, "Failed to fetch Clerk user");
  }
  const row = await ensureProfile(userId, name, email);
  res.json(serialize(row));
});

router.put("/profile", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const body = UpdateProfileBody.parse(req.body);
  const existing = await ensureProfile(userId, body.name, "");
  const [updated] = await db
    .update(profilesTable)
    .set({
      name: body.name,
      targetRole: body.targetRole ?? null,
      skills: body.skills,
      interests: body.interests,
    })
    .where(eq(profilesTable.id, existing.id))
    .returning();
  res.json(serialize(updated));
});

export default router;
