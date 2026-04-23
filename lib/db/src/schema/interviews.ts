import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export type InterviewTurnData = {
  question: string;
  answer?: string | null;
  feedback?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
};

export const interviewsTable = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  difficulty: text("difficulty").notNull(),
  status: text("status").notNull().default("active"),
  turns: jsonb("turns").$type<InterviewTurnData[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type InterviewRow = typeof interviewsTable.$inferSelect;
