import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, interviewsTable } from "@workspace/db";
import type { InterviewTurnData } from "@workspace/db";
import {
  StartInterviewBody,
  AnswerInterviewBody,
  AnswerInterviewParams,
  GetInterviewParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { generateInterviewQuestion, evaluateInterviewAnswer } from "../lib/agents";

const router: IRouter = Router();

function serialize(row: typeof interviewsTable.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    role: row.role,
    difficulty: row.difficulty,
    status: row.status,
    turns: row.turns ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/interviews", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(interviewsTable)
    .where(eq(interviewsTable.userId, req.userId!))
    .orderBy(desc(interviewsTable.createdAt));
  res.json(rows.map(serialize));
});

router.get("/interviews/:id", requireAuth, async (req, res) => {
  const { id } = GetInterviewParams.parse({ id: Number(req.params.id) });
  const row = await db.query.interviewsTable.findFirst({
    where: and(eq(interviewsTable.id, id), eq(interviewsTable.userId, req.userId!)),
  });
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(row));
});

router.post("/interviews", requireAuth, async (req, res) => {
  const body = StartInterviewBody.parse(req.body);
  const question = await generateInterviewQuestion({
    role: body.role,
    difficulty: body.difficulty,
    prior: [],
  });
  const turns: InterviewTurnData[] = [
    { question, answer: null, feedback: null, strengths: null, weaknesses: null },
  ];
  const [inserted] = await db
    .insert(interviewsTable)
    .values({
      userId: req.userId!,
      role: body.role,
      difficulty: body.difficulty,
      status: "active",
      turns,
    })
    .returning();
  res.json(serialize(inserted));
});

router.post("/interviews/:id/answer", requireAuth, async (req, res) => {
  const { id } = AnswerInterviewParams.parse({ id: Number(req.params.id) });
  const body = AnswerInterviewBody.parse(req.body);
  const session = await db.query.interviewsTable.findFirst({
    where: and(eq(interviewsTable.id, id), eq(interviewsTable.userId, req.userId!)),
  });
  if (!session) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const turns = [...(session.turns ?? [])] as InterviewTurnData[];
  const lastIdx = turns.length - 1;
  if (lastIdx < 0 || turns[lastIdx]?.answer) {
    res.status(400).json({ error: "No open question to answer" });
    return;
  }
  const current = turns[lastIdx]!;
  const evaluation = await evaluateInterviewAnswer({
    role: session.role,
    difficulty: session.difficulty,
    question: current.question,
    answer: body.answer,
  });
  turns[lastIdx] = {
    ...current,
    answer: body.answer,
    feedback: evaluation.feedback,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
  };
  let status = session.status;
  if (turns.length >= 5) {
    status = "completed";
  } else {
    const next = await generateInterviewQuestion({
      role: session.role,
      difficulty: session.difficulty,
      prior: turns,
    });
    turns.push({ question: next, answer: null, feedback: null, strengths: null, weaknesses: null });
  }
  const [updated] = await db
    .update(interviewsTable)
    .set({ turns, status })
    .where(eq(interviewsTable.id, id))
    .returning();
  res.json(serialize(updated));
});

export default router;
