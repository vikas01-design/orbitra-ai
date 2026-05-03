import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useRef, useState, useEffect } from "react";
import { SignedIn, SignedOut } from "@/lib/clerk-auth";
import { Button } from "@/components/ui/button";
import OrbitraRobot from "@/components/OrbitraRobot";
import CanvasBackground from "@/components/CanvasBackground";
import FloatingOrbs from "@/components/FloatingOrbs";
import { ArrowRight, Bot, Target, Activity, FileText, RefreshCw, Wrench, Video, Zap, Shield, Brain, User, ChevronRight } from "lucide-react";

const AGENTS = [
  { icon: Bot,       title: "Manager",           desc: "Coordinates your entire career strategy with precision.",    color: "cyan",    span: "md:col-span-2" },
  { icon: Target,    title: "Opportunity Radar",  desc: "Scouts and ranks roles fitting your exact profile.",         color: "cyan",    span: "" },
  { icon: Activity,  title: "Skill Gap Analyzer", desc: "Identifies learning gaps and builds your custom roadmap.",   color: "blue",    span: "" },
  { icon: FileText,  title: "Resume AI",          desc: "Enhances your resume for ATS and finds live job matches.",   color: "violet",  span: "" },
  { icon: Video,     title: "AI Interviewer",     desc: "Runs high-pressure simulations for the real thing.",         color: "fuchsia", span: "" },
  { icon: RefreshCw, title: "Recovery",           desc: "Pivots strategy intelligently after rejections.",            color: "pink",    span: "" },
  { icon: Wrench,    title: "Self-Correction",    desc: "Learns from outcomes and continuously self-optimises.",      color: "amber",   span: "md:col-span-2" },
];

const FEATURES = [
  { icon: Zap,    title: "Instant Analysis",  desc: "AI agents process your profile and surface opportunities in seconds." },
  { icon: Shield, title: "ATS-Optimized",     desc: "Resumes and applications engineered to pass automated screening." },
  { icon: Brain,  title: "Adaptive Strategy", desc: "The system learns from your responses and evolves its approach." },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  cyan:    { bg: "bg-cyan-500/8",    text: "text-cyan-600",    border: "border-cyan-200",    glow: "hover:shadow-[0_4px_16px_rgba(34,211,238,0.08)]" },
  blue:    { bg: "bg-blue-500/8",    text: "text-blue-600",    border: "border-blue-200",    glow: "hover:shadow-[0_4px_16px_rgba(96,165,250,0.08)]" },
  violet:  { bg: "bg-violet-500/8",  text: "text-violet-600",  border: "border-violet-200",  glow: "hover:shadow-[0_4px_16px_rgba(167,139,250,0.08)]" },
  fuchsia: { bg: "bg-fuchsia-500/8", text: "text-fuchsia-600", border: "border-fuchsia-200", glow: "hover:shadow-[0_4px_16px_rgba(232,121,249,0.08)]" },
  pink:    { bg: "bg-pink-500/8",    text: "text-pink-600",    border: "border-pink-200",    glow: "hover:shadow-[0_4px_16px_rgba(244,114,182,0.08)]" },
  amber:   { bg: "bg-amber-500/8",   text: "text-amber-600",   border: "border-amber-200",   glow: "hover:shadow-[0_4px_16px_rgba(245,158,11,0.08)]" },
};

export default function LandingPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const [, setLocation] = useLocation();
  const [isLaunching, setIsLaunching] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const heroO = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Mouse parallax for hero text
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 25 });
  const textX = useTransform(smoothX, v => v * 0.018);
  const textY = useTransform(smoothY, v => v * 0.012);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth  / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  const handleLaunch = (href: string) => {
    setIsLaunching(true);
    setTimeout(() => setLocation(href), 1150);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">

      {/* ── Layer 0: Particle constellation bg ──────────── */}
      <CanvasBackground />

      {/* ── Layer 1: 3D floating orbs ────────────────────── */}
      <FloatingOrbs />

      {/* ── Layer 2: Deep radial vignette ────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 50% 0%,   rgba(6,9,20,0) 0%, rgba(6,9,20,0.55) 100%),
            radial-gradient(ellipse 100% 40% at 50% 100%, rgba(6,9,20,0.7) 0%, transparent 80%)
          `,
        }}
      />

      {/* ── Header — Floating Pill Nav ──────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4 pointer-events-none">
        <motion.header
          initial={{ y: -32, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-2xl relative"
          style={{
            background: "rgba(240,242,252,0.78)",
            backdropFilter: "blur(28px)",
            boxShadow: "0 8px 40px rgba(120,140,220,0.18), 0 1px 0 rgba(255,255,255,0.8) inset",
            border: "1px solid rgba(180,195,245,0.5)",
          }}
        >
          {/* Subtle gradient border accent */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.12) 0%, rgba(139,92,246,0.06) 50%, rgba(34,211,238,0.04) 100%)",
            }}
          />

          {/* Logo */}
          <Link href="/" className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl
            hover:bg-white/60 transition-all duration-200 group">
            <img src={`${basePath}/logo.svg`} alt="Logo" className="w-7 h-7 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <span className="font-display font-bold text-sm tracking-widest text-slate-800">ORBITRA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-blink-dot" />
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200/80 mx-1 relative z-10" />

          {/* Nav links */}
          <nav className="relative flex items-center gap-0.5">
            {[
              { label: "Agents", anchor: "agents" },
              { label: "Workflow", anchor: "workflow" },
            ].map(({ label, anchor }) => (
              <button
                key={anchor}
                onClick={() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" })}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide text-slate-500
                  hover:text-slate-800 hover:bg-white/70 transition-all duration-200"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200/80 mx-1 relative z-10" />

          {/* Auth actions */}
          <div className="relative flex items-center gap-1.5 pl-1">
            <SignedIn>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleLaunch("/dashboard")}
                className="px-4 py-1.5 rounded-xl text-xs font-display font-bold tracking-wider text-white
                  bg-gradient-to-r from-cyan-500 to-violet-600
                  shadow-[0_2px_16px_rgba(34,211,238,0.35)]
                  hover:shadow-[0_4px_24px_rgba(34,211,238,0.5)]
                  transition-all duration-300"
              >
                Dashboard →
              </motion.button>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <button className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500
                  hover:text-slate-800 hover:bg-white/70 transition-all duration-200">
                  Log In
                </button>
              </Link>
              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="px-4 py-1.5 rounded-xl text-xs font-display font-bold tracking-wider text-white
                    bg-gradient-to-r from-cyan-500 to-violet-600
                    shadow-[0_2px_16px_rgba(34,211,238,0.35)]
                    hover:shadow-[0_4px_24px_rgba(34,211,238,0.5)]
                    transition-all duration-300"
                >
                  Get Started
                </motion.button>
              </Link>
            </SignedOut>
          </div>
        </motion.header>
      </div>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden z-[2]">

        <motion.div style={{ y: heroY, opacity: heroO }} className="flex flex-col items-center">

          {/* Robot — with launch animation */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 relative"
          >
            {/* Depth rings behind robot */}
            <div className="absolute inset-[-40px] pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
                className="w-full h-full rounded-full"
                style={{
                  border: "1px dashed rgba(34,211,238,0.06)",
                  boxShadow: "0 0 60px rgba(34,211,238,0.04)",
                }}
              />
            </div>
            <div className="absolute inset-[-70px] pointer-events-none">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 55, ease: "linear" }}
                className="w-full h-full rounded-full"
                style={{ border: "1px dashed rgba(139,92,246,0.04)" }}
              />
            </div>

            <OrbitraRobot
              isLaunching={isLaunching}
              onLaunchComplete={() => {}}
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              border border-cyan-400/30 bg-cyan-500/10 text-cyan-600 text-xs font-semibold tracking-[0.18em] uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-blink-dot" />
            AI-Powered Career Platform · 7 Agents
          </motion.div>

          {/* Headline with mouse parallax */}
          <motion.div
            style={{ x: textX, y: textY }}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.92]">
              <span className="gradient-text">Your AI career,</span>
              <br />
              <span className="text-slate-800">in orbit.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.8 }}
            className="text-slate-500 text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
          >
            A multi-agent copilot that scouts opportunities, closes skill gaps,
            perfects your resume, and preps you for every interview — all on autopilot.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.56 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <SignedOut>
              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="px-10 h-14 rounded-2xl font-display text-sm tracking-wider text-black font-bold
                    bg-gradient-to-r from-cyan-400 to-cyan-500
                    shadow-[0_0_40px_rgba(34,211,238,0.45),0_0_0_1px_rgba(34,211,238,0.2)]
                    hover:shadow-[0_0_60px_rgba(34,211,238,0.6),0_0_0_1px_rgba(34,211,238,0.35)]
                    transition-all duration-300"
                >
                  Launch Orbitra
                </motion.button>
              </Link>
            </SignedOut>
            <SignedIn>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleLaunch("/dashboard")}
                disabled={isLaunching}
                className="px-10 h-14 rounded-2xl font-display text-sm tracking-wider text-black font-bold
                  bg-gradient-to-r from-cyan-400 to-cyan-500
                  shadow-[0_0_40px_rgba(34,211,238,0.45),0_0_0_1px_rgba(34,211,238,0.2)]
                  hover:shadow-[0_0_60px_rgba(34,211,238,0.6)]
                  transition-all duration-300 disabled:opacity-70"
              >
                {isLaunching ? "Initiating…" : "Enter Dashboard"}
              </motion.button>
            </SignedIn>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("agents")?.scrollIntoView({ behavior: "smooth" })}
              className="px-10 h-14 rounded-2xl font-display text-sm tracking-wider text-slate-500 hover:text-slate-800
                border border-slate-200 hover:border-slate-300
                bg-white/60 hover:bg-white/80
                shadow-[4px_4px_14px_rgba(150,165,210,0.25),-3px_-3px_10px_rgba(255,255,255,0.9)]
                transition-all duration-300 flex items-center gap-2 justify-center"
            >
              Explore Agents <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-16 flex flex-wrap justify-center gap-10 text-center"
          >
            {[["7", "AI Agents"], ["ATS", "Optimized"], ["Live", "Job Links"]].map(([val, label]) => (
              <motion.div key={label} whileHover={{ y: -3 }} className="space-y-1 cursor-default">
                <p className="font-display text-2xl font-black gradient-text-cyan">{val}</p>
                <p className="text-slate-400 text-[11px] tracking-[0.18em] uppercase font-semibold">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-slate-300 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-slate-400/60" />
          </motion.div>
          <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Scroll</p>
        </motion.div>
      </section>

      {/* ── Features strip ──────────────────────────────────── */}
      <section className="relative z-[2] py-20 px-4"
        style={{ background: "rgba(255,255,255,0.45)", borderTop: "1px solid rgba(160,180,240,0.2)", borderBottom: "1px solid rgba(160,180,240,0.2)", backdropFilter: "blur(12px)" }}>
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex items-start gap-4 p-6 neu-card cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/12 border border-cyan-400/25 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-800 mb-1">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agent Bento Grid ─────────────────────────────────── */}
      <section id="agents" className="relative z-[2] py-28 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] font-bold tracking-[0.22em] text-cyan-600/70 uppercase mb-4">The Crew</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-800 mb-4">Meet your agent crew</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Seven specialized AI agents working in concert to accelerate your career trajectory.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AGENTS.map((agent, i) => {
              const c = COLOR_MAP[agent.color] ?? COLOR_MAP.cyan;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 32, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5, transition: { duration: 0.22 } }}
                  className={`${agent.span} neu-card p-6 flex flex-col gap-4 cursor-default
                    hover:border-white/12 transition-all duration-300 ${c.glow}`}
                >
                  <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <agent.icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <div>
                    <h3 className={`font-display font-bold text-base ${c.text} mb-1.5`}>{agent.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{agent.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Workflow Blueprint ──────────────────────────────── */}
      <section id="workflow" className="relative z-[2] py-28 px-4 overflow-hidden">

        {/* Diagonal stripe background — distinct from agents section */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              rgba(139,92,246,1) 0px,
              rgba(139,92,246,1) 1px,
              transparent 1px,
              transparent 28px
            )`,
          }}
        />

        <div className="container mx-auto max-w-5xl relative">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[10px] font-bold tracking-[0.22em] text-violet-600/70 uppercase mb-4">How It Works</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-800 mb-4">The Orbitra workflow</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              From first login to accepted offer — a fully automated pipeline of 7 specialized agents working in sequence.
            </p>
          </motion.div>

          {/* Vertical alternating timeline */}
          <div className="relative max-w-3xl mx-auto">

            {/* Central spine */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block"
              style={{ background: "linear-gradient(180deg, rgba(34,211,238,0.3) 0%, rgba(139,92,246,0.4) 50%, rgba(245,158,11,0.3) 100%)" }}
            />

            {[
              {
                icon: User,      step: "01", side: "left",
                agent: "You",    tag: "INPUT",
                tagColor: "bg-slate-100 text-slate-500 border-slate-200",
                accent: "border-l-cyan-400", dot: "bg-cyan-500", dotRing: "ring-cyan-200",
                label: "Set your profile",
                detail: "Define your target role, skills, and career goals. This is the only manual step.",
                output: "Profile created",
              },
              {
                icon: Bot,       step: "02", side: "right",
                agent: "Manager Agent", tag: "ORCHESTRATOR",
                tagColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
                accent: "border-l-cyan-500", dot: "bg-cyan-500", dotRing: "ring-cyan-200",
                label: "Builds your strategy",
                detail: "Reads your profile, sets goals, and dispatches all other agents with context.",
                output: "Strategy dispatched",
              },
              {
                icon: Target,    step: "03", side: "left",
                agent: "Opportunity Radar", tag: "AGENT",
                tagColor: "bg-blue-50 text-blue-700 border-blue-200",
                accent: "border-l-blue-500", dot: "bg-blue-500", dotRing: "ring-blue-200",
                label: "Scouts live opportunities",
                detail: "Crawls job boards, ranks matches by fit score, and surfaces the best-aligned roles.",
                output: "Ranked opportunity list",
              },
              {
                icon: Activity,  step: "04", side: "right",
                agent: "Skill Gap Analyzer", tag: "AGENT",
                tagColor: "bg-violet-50 text-violet-700 border-violet-200",
                accent: "border-l-violet-500", dot: "bg-violet-500", dotRing: "ring-violet-200",
                label: "Maps what's missing",
                detail: "Compares your skills against top roles and generates a prioritised learning roadmap.",
                output: "Roadmap + gap report",
              },
              {
                icon: FileText,  step: "05", side: "left",
                agent: "Resume AI", tag: "AGENT",
                tagColor: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
                accent: "border-l-fuchsia-500", dot: "bg-fuchsia-500", dotRing: "ring-fuchsia-200",
                label: "Tailors your application",
                detail: "Rewrites your resume per role, passes ATS filters, and generates a custom cover letter.",
                output: "ATS-ready resume + letter",
              },
              {
                icon: Video,     step: "06", side: "right",
                agent: "AI Interviewer", tag: "AGENT",
                tagColor: "bg-pink-50 text-pink-700 border-pink-200",
                accent: "border-l-pink-500", dot: "bg-pink-500", dotRing: "ring-pink-200",
                label: "Runs mock interviews",
                detail: "Simulates real high-pressure interviews with role-specific questions and instant feedback.",
                output: "Interview readiness score",
              },
              {
                icon: RefreshCw, step: "07", side: "left",
                agent: "Recovery Agent", tag: "FALLBACK",
                tagColor: "bg-rose-50 text-rose-700 border-rose-200",
                accent: "border-l-rose-400", dot: "bg-rose-500", dotRing: "ring-rose-200",
                label: "Pivots after rejection",
                detail: "Detects rejections, finds alternative paths, and restarts the pipeline on similar roles.",
                output: "Alternative opportunities",
              },
              {
                icon: Wrench,    step: "08", side: "right",
                agent: "Self-Correction", tag: "OPTIMIZER",
                tagColor: "bg-amber-50 text-amber-700 border-amber-200",
                accent: "border-l-amber-500", dot: "bg-amber-500", dotRing: "ring-amber-200",
                label: "Learns and improves",
                detail: "Analyses outcomes across all agents, updates strategy weights, and improves over time.",
                output: "Optimised pipeline",
              },
            ].map(({ icon: Icon, step, side, agent, tag, tagColor, accent, dot, dotRing, label, detail, output }, i) => (
              <motion.div key={step}
                initial={{ opacity: 0, x: side === "left" ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex items-start gap-0 mb-6 ${side === "right" ? "md:flex-row-reverse" : "md:flex-row"} flex-row`}
              >
                {/* Content card — half width on desktop */}
                <div className={`w-full md:w-[calc(50%-28px)] ${side === "right" ? "md:pl-0" : "md:pr-0"}`}>
                  <div className={`border-l-4 ${accent} bg-white/80 rounded-r-xl rounded-bl-xl p-4 shadow-[0_2px_12px_rgba(150,165,210,0.12)] border border-l-0 border-slate-100`}>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="font-display font-bold text-xs text-slate-700 tracking-wide">{agent}</span>
                      </div>
                      <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${tagColor}`}>{tag}</span>
                    </div>
                    {/* Step label */}
                    <p className="font-display font-black text-slate-800 text-sm mb-1 leading-snug">{label}</p>
                    <p className="text-slate-400 text-xs leading-relaxed mb-3">{detail}</p>
                    {/* Output */}
                    <div className="flex items-center gap-1.5 pt-2.5 border-t border-slate-100">
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Output</span>
                      <span className="text-[10px] font-bold text-slate-600 ml-1">{output}</span>
                    </div>
                  </div>
                </div>

                {/* Center node */}
                <div className="hidden md:flex flex-col items-center shrink-0 w-14 relative z-10">
                  <div className={`w-8 h-8 rounded-full ${dot} ring-4 ${dotRing} flex items-center justify-center shadow-sm`}>
                    <span className="font-display text-[9px] font-black text-white">{step}</span>
                  </div>
                </div>

                {/* Spacer other side */}
                <div className="hidden md:block w-[calc(50%-28px)]" />

                {/* Mobile step badge */}
                <div className={`md:hidden shrink-0 w-7 h-7 rounded-full ${dot} flex items-center justify-center mr-3 mt-0.5 shadow-sm`}>
                  <span className="font-display text-[9px] font-black text-white">{step}</span>
                </div>
              </motion.div>
            ))}

            {/* Final outcome */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-center mt-8 relative z-10"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-px h-8 bg-gradient-to-b from-amber-300/60 to-cyan-300/60" />
                <div className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl
                  bg-gradient-to-r from-cyan-500 to-violet-600
                  shadow-[0_4px_24px_rgba(34,211,238,0.25)]">
                  <div className="w-2 h-2 rounded-full bg-white animate-blink-dot" />
                  <span className="font-display font-bold text-sm text-white tracking-wide">Offer Accepted</span>
                  <span className="text-white/40 text-xs">· Full cycle automated</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="relative z-[2] py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative neu-card p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-cyan-500/6 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/6 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-800 mb-4">Ready to launch?</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                Your AI crew is standing by. Start optimizing your career today.
              </p>
              <SignedOut>
                <Link href="/sign-up">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    className="px-12 h-13 rounded-2xl font-display text-sm tracking-wider text-white font-bold
                      bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500
                      shadow-[0_0_40px_rgba(139,92,246,0.35)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)]
                      transition-all duration-300 border-0"
                  >
                    Create Free Account
                  </motion.button>
                </Link>
              </SignedOut>
              <SignedIn>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleLaunch("/dashboard")}
                  disabled={isLaunching}
                  className="px-12 h-13 rounded-2xl font-display text-sm tracking-wider text-white font-bold
                    bg-gradient-to-r from-cyan-500 to-violet-600 border-0
                    shadow-[0_0_40px_rgba(139,92,246,0.35)] transition-all duration-300"
                >
                  Go to Dashboard
                </motion.button>
              </SignedIn>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="relative z-[2] py-10 text-center"
        style={{ background: "rgba(255,255,255,0.45)", borderTop: "1px solid rgba(160,180,240,0.2)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="w-5 h-5 opacity-50" />
          <span className="font-display text-xs tracking-widest text-slate-400">ORBITRA AI</span>
        </div>
        <p className="text-slate-400 text-xs">&copy; {new Date().getFullYear()} Orbitra AI. All systems nominal.</p>
      </footer>
    </div>
  );
}
