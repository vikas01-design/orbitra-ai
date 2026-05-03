import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export type ResumeJobMatch = {
  title: string;
  companyType: string;
  matchReason: string;
  skillsNeeded: string[];
  level: string;
};

export const resumesTable = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  fileName: text("file_name").notNull(),
  originalText: text("original_text").notNull(),
  enhancedResume: text("enhanced_resume").notNull(),
  editedResume: text("edited_resume"),
  jobMatches: jsonb("job_matches").$type<ResumeJobMatch[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ResumeRow = typeof resumesTable.$inferSelect;
