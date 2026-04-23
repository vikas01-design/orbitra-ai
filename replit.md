# Orbitra AI

A multi-agent AI career copilot for students and early-career engineers — sleek mission-control UI with an animated robot mascot.

## Stack
- **Frontend** (`artifacts/orbitra`): React + Vite + Tailwind v4 + framer-motion + wouter, Clerk auth (managed)
- **Backend** (`artifacts/api-server`): Express 5 + Drizzle ORM + Clerk middleware + Replit OpenAI integration
- **DB**: PostgreSQL (Replit-managed) via Drizzle
- **AI**: OpenAI `gpt-5.4` via `@workspace/integrations-openai-ai-server`

## Agents (`artifacts/api-server/src/lib/agents.ts`)
1. **Opportunity Radar** — discovers hackathons/internships/events with match score
2. **Skill Gap Analyzer** — identifies missing skills + 14-day roadmap
3. **Application Generator** — writes tailored applications with strengths + resume tips
4. **Recovery** — finds alternatives for missed opportunities
5. **AI Interviewer** — multi-turn chat interview with per-answer feedback
6. **Manager / Self-Correction** — embodied in the dashboard orchestration & evaluator JSON in agents

## Routes (api)
- `GET/PUT /api/profile`
- `GET /api/dashboard/summary` · `GET /api/dashboard/activity`
- `GET/POST /api/opportunities` · `GET /api/opportunities/:id`
- `GET/POST /api/skillgap`
- `GET/POST /api/applications`
- `POST /api/recovery`
- `GET/POST /api/interviews` · `GET /api/interviews/:id` · `POST /api/interviews/:id/answer`

## Frontend pages
`/` landing (animated robot), `/sign-in`, `/sign-up`, `/dashboard`, `/profile`,
`/opportunities`, `/opportunities/:id`, `/skill-gap`, `/applications`,
`/interview`, `/interview/:id`.

## Free-tier deferred
Payments (Stripe), email, admin dashboard, mobile app — out of scope on free tier.
