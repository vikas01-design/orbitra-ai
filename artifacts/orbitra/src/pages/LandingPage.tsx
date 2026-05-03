import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { useRef } from "react";
import { SignedIn, SignedOut } from "@/lib/clerk-auth";
import { Button } from "@/components/ui/button";
import OrbitraRobot from "@/components/OrbitraRobot";
import { ArrowRight, Bot, Target, Activity, FileText, RefreshCw, Wrench, Video, Zap, Shield, Brain } from "lucide-react";

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
  { icon: Zap,    title: "Instant Analysis",    desc: "AI agents process your profile and surface opportunities in seconds." },
  { icon: Shield, title: "ATS-Optimized",       desc: "Resumes and applications engineered to pass automated screening." },
  { icon: Brain,  title: "Adaptive Strategy",   desc: "The system learns from your responses and evolves its approach." },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/20",    glow: "shadow-[0_0_20px_rgba(34,211,238,0.15)]" },
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20",    glow: "shadow-[0_0_20px_rgba(96,165,250,0.15)]" },
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20",  glow: "shadow-[0_0_20px_rgba(167,139,250,0.15)]" },
  fuchsia: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", border: "border-fuchsia-500/20", glow: "shadow-[0_0_20px_rgba(232,121,249,0.15)]" },
  pink:    { bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/20",    glow: "shadow-[0_0_20px_rgba(244,114,182,0.15)]" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
};

export default function LandingPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY  = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroO  = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">

      {/* ── Header ───────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between
          border-b border-white/[0.05] bg-[rgba(6,9,15,0.8)] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-2.5">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
          <span className="font-display font-bold text-lg tracking-widest">ORBITRA</span>
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-blink-dot" />
        </div>
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" className="font-display text-xs tracking-wider">Dashboard →</Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white text-xs">Log In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="font-display text-xs tracking-wider bg-cyan-500 hover:bg-cyan-400 text-black px-5">
                Get Started
              </Button>
            </Link>
          </SignedOut>
        </div>
      </motion.header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden">
        {/* Parallax bg orbs */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-[150px]" />
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroO }} className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <OrbitraRobot />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              border border-cyan-500/25 bg-cyan-500/8 text-cyan-400 text-xs font-semibold tracking-widest uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-blink-dot" />
            AI-Powered Career Platform
          </motion.div>

          <motion.h1
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[0.95]"
          >
            <span className="gradient-text">Your AI career,</span>
            <br />
            <span className="text-white">in orbit.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-white/55 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
          >
            A multi-agent copilot that scouts opportunities, analyzes skill gaps, enhances your resume,
            and prepares you for every interview — all on autopilot.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <SignedOut>
              <Link href="/sign-up">
                <Button size="lg"
                  className="w-full sm:w-auto px-10 h-14 font-display text-sm tracking-wider
                    bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300
                    text-black shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)]
                    transition-all duration-300">
                  Launch Orbitra
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg"
                  className="w-full sm:w-auto px-10 h-14 font-display text-sm tracking-wider
                    bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300
                    text-black shadow-[0_0_40px_rgba(34,211,238,0.4)]">
                  Enter Dashboard
                </Button>
              </Link>
            </SignedIn>
            <Button size="lg" variant="outline"
              className="w-full sm:w-auto px-10 h-14 font-display text-sm tracking-wider
                border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white">
              See How It Works <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-center"
          >
            {[["7", "AI Agents"], ["ATS", "Optimized"], ["Live", "Job Links"]].map(([val, label]) => (
              <div key={label} className="space-y-1">
                <p className="font-display text-2xl font-bold gradient-text-cyan">{val}</p>
                <p className="text-white/35 text-xs tracking-wider uppercase">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features strip ───────────────────────────────────────── */}
      <section className="py-20 px-4 border-y border-white/[0.05] bg-white/[0.015]">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 neu-card"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white mb-1">{f.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agent Bento Grid ─────────────────────────────────────── */}
      <section className="py-28 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400/70 uppercase mb-4">The Crew</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white">Meet your agent crew</h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">Seven specialized AI agents working in concert to accelerate your career.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AGENTS.map((agent, i) => {
              const c = COLOR_MAP[agent.color] ?? COLOR_MAP.cyan;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`${agent.span} neu-card p-6 flex flex-col gap-4 cursor-default
                    hover:border-white/15 transition-all duration-300 ${c.glow}`}
                >
                  <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <agent.icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <div>
                    <h3 className={`font-display font-bold text-base ${c.text} mb-1.5`}>{agent.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{agent.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative neu-card p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/6 via-transparent to-purple-500/6 pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/8 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/8 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to launch?
              </h2>
              <p className="text-white/45 mb-8 max-w-lg mx-auto">
                Join and let your AI crew handle the heavy lifting while you focus on what matters.
              </p>
              <SignedOut>
                <Link href="/sign-up">
                  <Button size="lg"
                    className="px-12 h-13 font-display text-sm tracking-wider
                      bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500
                      text-white shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.4)]
                      transition-all duration-300 border-0">
                    Create Free Account
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="px-12 h-13 font-display text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0">
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="py-10 text-center border-t border-white/[0.05]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="w-5 h-5 opacity-50" />
          <span className="font-display text-xs tracking-widest text-white/25">ORBITRA AI</span>
        </div>
        <p className="text-white/20 text-xs">&copy; {new Date().getFullYear()} Orbitra AI. All systems nominal.</p>
      </footer>
    </div>
  );
}
