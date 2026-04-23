import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

export async function ensureProfile(
  userId: string,
  fallbackName: string,
  fallbackEmail: string,
) {
  const existing = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, userId),
  });
  if (existing) return existing;
  const [created] = await db
    .insert(profilesTable)
    .values({
      userId,
      name: fallbackName,
      email: fallbackEmail,
      skills: [],
      interests: [],
    })
    .returning();
  return created;
}
