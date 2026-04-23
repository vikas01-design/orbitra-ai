import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const opportunitiesTable = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  matchScore: integer("match_score").notNull(),
  whyMatch: text("why_match").notNull(),
  deadline: text("deadline"),
  link: text("link"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OpportunityRow = typeof opportunitiesTable.$inferSelect;
