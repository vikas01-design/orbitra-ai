import { openai } from "@workspace/integrations-openai-ai-server";
import { logger } from "./logger";

const MODEL = "gpt-5.4";

async function chatJSON<T>(system: string, user: string): Promise<T> {
  const resp = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const content = resp.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content) as T;
  } catch (err) {
    logger.error({ err, content }, "Agent returned invalid JSON");
    throw new Error("Agent returned invalid JSON");
  }
}

async function chatText(system: string, user: string): Promise<string> {
  const resp = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 2048,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return resp.choices[0]?.message?.content ?? "";
}

export type DiscoveredOpportunity = {
  name: string;
  type: string;
  matchScore: number;
  whyMatch: string;
  deadline: string | null;
  link: string | null;
};

export async function runOpportunityRadarAgent(input: {
  skills: string[];
  interests: string[];
  targetRole: string | null;
  focus?: string | null;
}): Promise<DiscoveredOpportunity[]> {
  const system = `You are the Opportunity Radar Agent inside Orbitra AI.
Find 5-7 realistic, currently-relevant opportunities (hackathons, internships, tech events) that match the user's profile.
Use real-world programs, conferences, and hackathons that are well-known in the tech community (e.g. MLH hackathons, Major League Hacking events, HackMIT, TreeHacks, Google Summer of Code, Outreachy, Google STEP, Microsoft Explore, Meta University, etc.). Do NOT fabricate fake program names.
For each opportunity calculate a Skill Match % (0-100) and explain WHY it matches.
Return STRICT JSON: { "opportunities": [{ "name": str, "type": "Hackathon"|"Internship"|"Event", "matchScore": int, "whyMatch": str, "deadline": str|null, "link": str|null }] }`;
  const user = JSON.stringify({
    skills: input.skills,
    interests: input.interests,
    targetRole: input.targetRole,
    focus: input.focus ?? null,
  });
  const out = await chatJSON<{ opportunities: DiscoveredOpportunity[] }>(system, user);
  return (out.opportunities ?? []).slice(0, 8).map((o) => ({
    name: String(o.name ?? "Untitled"),
    type: String(o.type ?? "Event"),
    matchScore: Math.max(0, Math.min(100, Math.round(Number(o.matchScore ?? 0)))),
    whyMatch: String(o.whyMatch ?? ""),
    deadline: o.deadline ?? null,
    link: o.link ?? null,
  }));
}

export type SkillGapResult = {
  requiredSkills: string[];
  missingSkills: string[];
  roadmap: { day: string; title: string; details: string }[];
};

export async function runSkillGapAgent(input: {
  currentSkills: string[];
  targetRole: string;
}): Promise<SkillGapResult> {
  const system = `You are the Skill Gap Analyzer Agent inside Orbitra AI.
Given the user's current skills and a target role, identify required skills, missing skills, and produce a practical 14-day learning roadmap (day-by-day or grouped by 2-day blocks).
Return STRICT JSON: { "requiredSkills": [str], "missingSkills": [str], "roadmap": [{ "day": "Day 1" | "Days 1-2", "title": str, "details": str }] }
Make the roadmap beginner-friendly with concrete, actionable items (specific resources are okay).`;
  const user = JSON.stringify({
    currentSkills: input.currentSkills,
    targetRole: input.targetRole,
  });
  const out = await chatJSON<SkillGapResult>(system, user);
  return {
    requiredSkills: out.requiredSkills ?? [],
    missingSkills: out.missingSkills ?? [],
    roadmap: out.roadmap ?? [],
  };
}

export type ApplicationResult = {
  message: string;
  strengths: string[];
  resumeSuggestions: string[];
};

export async function runApplicationAgent(input: {
  jobDescription: string;
  opportunityName: string;
  skills: string[];
  tone: string;
}): Promise<ApplicationResult> {
  const system = `You are the Application Generator Agent inside Orbitra AI.
Write a personalized application for the given opportunity using the user's skills and the requested tone (formal | confident | startup).
Return STRICT JSON: { "message": str, "strengths": [str], "resumeSuggestions": [str] }
The message should be 2-4 short paragraphs, human and warm, never robotic. Strengths: 3-5 bullet points. Resume suggestions: 3-5 actionable bullets.`;
  const user = JSON.stringify({
    opportunityName: input.opportunityName,
    jobDescription: input.jobDescription,
    skills: input.skills,
    tone: input.tone,
  });
  const out = await chatJSON<ApplicationResult>(system, user);
  return {
    message: out.message ?? "",
    strengths: out.strengths ?? [],
    resumeSuggestions: out.resumeSuggestions ?? [],
  };
}

export type RecoveryAlternativeResult = {
  alternatives: {
    name: string;
    type: string;
    similarityReason: string;
    actionSuggestion: string;
    deadline: string | null;
  }[];
};

export async function runRecoveryAgent(input: {
  missedOpportunity: string;
  skills: string[];
  interests: string[];
  targetRole: string | null;
}): Promise<RecoveryAlternativeResult["alternatives"]> {
  const system = `You are the Recovery Agent inside Orbitra AI.
The user missed an opportunity. Recommend 3-5 similar real-world alternatives. Use real, known programs/events when possible.
Return STRICT JSON: { "alternatives": [{ "name": str, "type": "Hackathon"|"Internship"|"Event", "similarityReason": str, "actionSuggestion": str, "deadline": str|null }] }`;
  const user = JSON.stringify({
    missedOpportunity: input.missedOpportunity,
    skills: input.skills,
    interests: input.interests,
    targetRole: input.targetRole,
  });
  const out = await chatJSON<RecoveryAlternativeResult>(system, user);
  return (out.alternatives ?? []).slice(0, 5);
}

export async function generateInterviewQuestion(input: {
  role: string;
  difficulty: string;
  prior: { question: string; answer?: string | null }[];
}): Promise<string> {
  const system = `You are the AI Interviewer inside Orbitra AI.
Ask ONE structured interview question for the given role and difficulty (easy/medium/hard).
Vary topics across the session: fundamentals, system/code design, behavioral. Avoid repeating prior questions.
Reply with JUST the question text, no preamble.`;
  const user = JSON.stringify({
    role: input.role,
    difficulty: input.difficulty,
    priorQuestions: input.prior.map((p) => p.question),
  });
  const out = await chatText(system, user);
  return out.trim();
}

export type InterviewFeedback = {
  feedback: string;
  strengths: string;
  weaknesses: string;
};

export async function evaluateInterviewAnswer(input: {
  role: string;
  difficulty: string;
  question: string;
  answer: string;
}): Promise<InterviewFeedback> {
  const system = `You are the AI Interviewer inside Orbitra AI.
Evaluate the candidate's answer. Return STRICT JSON: { "feedback": str (2-4 sentences of constructive feedback + improvement tips), "strengths": str (one line), "weaknesses": str (one line) }`;
  const user = JSON.stringify(input);
  const out = await chatJSON<InterviewFeedback>(system, user);
  return {
    feedback: out.feedback ?? "",
    strengths: out.strengths ?? "",
    weaknesses: out.weaknesses ?? "",
  };
}

export type InterviewSummaryResult = {
  overallScore: number;
  summary: string;
};

export async function summarizeInterview(input: {
  role: string;
  difficulty: string;
  turns: { question: string; answer?: string | null; feedback?: string | null }[];
}): Promise<InterviewSummaryResult> {
  const system = `You are the AI Interviewer inside Orbitra AI.
Score the candidate on a 1-10 scale based on the full transcript and write a 2-4 sentence wrap-up.
Return STRICT JSON: { "overallScore": int 1-10, "summary": str }.`;
  const user = JSON.stringify(input);
  const out = await chatJSON<InterviewSummaryResult>(system, user);
  const score = Math.max(1, Math.min(10, Math.round(Number(out?.overallScore ?? 5))));
  return { overallScore: score, summary: out?.summary ?? "" };
}
