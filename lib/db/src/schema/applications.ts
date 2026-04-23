import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  opportunityId: integer("opportunity_id"),
  opportunityName: text("opportunity_name").notNull(),
  tone: text("tone").notNull(),
  message: text("message").notNull(),
  strengths: jsonb("strengths").$type<string[]>().notNull().default([]),
  resumeSuggestions: jsonb("resume_suggestions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ApplicationRow = typeof applicationsTable.$inferSelect;
