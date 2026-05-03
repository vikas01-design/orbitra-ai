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
  roadmap: { day: string; title: string; details: string; videoQuery: string }[];
};

export async function runSkillGapAgent(input: {
  currentSkills: string[];
  targetRole: string;
}): Promise<SkillGapResult> {
  const system = `You are the Skill Gap Analyzer Agent inside Orbitra AI.

FIRST: Validate that the "targetRole" field is a legitimate technical job role, technology, or skill area (e.g. "Backend Engineer", "React Developer", "Machine Learning", "Kubernetes", "Python", "DevOps", "Data Scientist").
If it is a greeting, casual phrase, question, or any non-technical input (e.g. "how are you", "what is your name", "hello", "tell me a joke"), you MUST return ONLY: { "error": "not_technical" }

If it IS technical, identify required skills, missing skills, and produce a practical 14-day learning roadmap (day-by-day or grouped by 2-day blocks).
For each roadmap step include a "videoQuery" field: a concise YouTube search string to find a tutorial video for that specific step (e.g. "React hooks tutorial beginner", "Docker containerization guide").
Return STRICT JSON: { "requiredSkills": [str], "missingSkills": [str], "roadmap": [{ "day": "Day 1" | "Days 1-2", "title": str, "details": str, "videoQuery": str }] }
Make the roadmap beginner-friendly with concrete, actionable items.`;
  const user = JSON.stringify({
    currentSkills: input.currentSkills,
    targetRole: input.targetRole,
  });
  const out = await chatJSON<SkillGapResult & { error?: string }>(system, user);
  if (out.error === "not_technical") {
    throw new Error("not_technical");
  }
  return {
    requiredSkills: out.requiredSkills ?? [],
    missingSkills: out.missingSkills ?? [],
    roadmap: (out.roadmap ?? []).map((step) => ({
      day: step.day,
      title: step.title,
      details: step.details,
      videoQuery: step.videoQuery ?? step.title,
    })),
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

export type ResumeJobMatch = {
  title: string;
  companyType: string;
  matchReason: string;
  skillsNeeded: string[];
  level: string;
  link: string;
};

export async function runResumeEnhancerAgent(originalText: string): Promise<string> {
  const system = `You are a professional resume writer and ATS optimization expert inside Orbitra AI.

Your task is to enhance the provided resume to be concise, professional, and ATS-optimized.

STRICT FORMAT RULES:
- Do NOT use markdown symbols like #, ##, *, **, or _.
- Section headings must be ALL CAPS on their own line (e.g. PROFESSIONAL SUMMARY, WORK EXPERIENCE, PROJECT EXPERIENCE, TECHNICAL SKILLS, EDUCATION, CERTIFICATIONS, LANGUAGES).
- Bullet points use the • character (not - or *).
- Name goes on the very first line in ALL CAPS.
- Contact line: Phone | Email (on second line).
- If LinkedIn or GitHub present, each on its own line: "LinkedIn: URL" and "GitHub: URL".
- Leave one blank line before each section heading.
- For project/work entries: "Project or Job Title | Company or context | Year" on one line, then bullets below.
- For TECHNICAL SKILLS: group as "Category: item1, item2, item3" lines.
- For EDUCATION: Degree Name on one line, then "University | Year" on next line.
- Keep length tight — 1 page maximum worth of content.
- Focus on achievements, strong action verbs, measurable impact.
- Avoid age, marital status, full address, photos, tables, or HTML.
- Only include sections that exist in the original resume.

MANDATORY SECTION ORDER (skip if not in original):
1. NAME (all caps)
2. Contact info + LinkedIn/GitHub
3. PROFESSIONAL SUMMARY
4. WORK EXPERIENCE (if present)
5. PROJECT EXPERIENCE (if present instead of or alongside work experience)
6. TECHNICAL SKILLS
7. EDUCATION
8. CERTIFICATIONS (if present)
9. LANGUAGES (if present)

OUTPUT: Return ONLY the enhanced resume text. No commentary, no preamble, no explanation.`;

  const resp = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 4096,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Here is the original resume to enhance:\n\n${originalText}` },
    ],
  });
  return (resp.choices[0]?.message?.content ?? "").trim();
}

export async function runResumeJobMatchAgent(enhancedResume: string): Promise<ResumeJobMatch[]> {
  const system = `You are a career advisor inside Orbitra AI.
Based on the candidate's resume, identify 5-7 specific job opportunity paths that are a strong match.
For each path be realistic and specific to the candidate's actual skills and experience level.
For the "link" field, generate a real LinkedIn Jobs search URL for that specific job title using this format:
  https://www.linkedin.com/jobs/search/?keywords=ENCODED_JOB_TITLE&f_TPR=r604800&f_E=2
where ENCODED_JOB_TITLE is the URL-encoded job title (spaces → %20). Use the exact title from your "title" field.
Return STRICT JSON: { "jobs": [{ "title": str, "companyType": str, "matchReason": str (1-2 sentences), "skillsNeeded": [str], "level": "Entry"|"Mid"|"Senior"|"Lead", "link": str }] }`;
  const out = await chatJSON<{ jobs: ResumeJobMatch[] }>(system, `Resume:\n\n${enhancedResume}`);
  return (out.jobs ?? []).slice(0, 7).map((j) => {
    const title = String(j.title ?? "");
    const fallbackLink = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&f_TPR=r604800`;
    return {
      title,
      companyType: String(j.companyType ?? ""),
      matchReason: String(j.matchReason ?? ""),
      skillsNeeded: Array.isArray(j.skillsNeeded) ? j.skillsNeeded.map(String) : [],
      level: String(j.level ?? "Mid"),
      link: String(j.link ?? fallbackLink) || fallbackLink,
    };
  });
}

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
