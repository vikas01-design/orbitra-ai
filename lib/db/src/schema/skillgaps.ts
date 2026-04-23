import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export type RoadmapStepData = { day: string; title: string; details: string };

export const skillGapsTable = pgTable("skill_gaps", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  targetRole: text("target_role").notNull(),
  requiredSkills: jsonb("required_skills").$type<string[]>().notNull().default([]),
  missingSkills: jsonb("missing_skills").$type<string[]>().notNull().default([]),
  roadmap: jsonb("roadmap").$type<RoadmapStepData[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SkillGapRow = typeof skillGapsTable.$inferSelect;
