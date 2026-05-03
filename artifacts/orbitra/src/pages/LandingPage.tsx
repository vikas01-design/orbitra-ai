import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useRef, useState, useEffect } from "react";
import { SignedIn, SignedOut } from "@/lib/clerk-auth";
import { Button } from "@/components/ui/button";
import OrbitraRobot from "@/components/OrbitraRobot";
import CanvasBackground from "@/components/CanvasBackground";
import FloatingOrbs from "@/components/FloatingOrbs";
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
  { icon: Zap,    title: "Instant Analysis",  desc: "AI agents process your profile and surface opportunities in seconds." },
  { icon: Shield, title: "ATS-Optimized",     desc: "Resumes and applications engineered to pass automated screening." },
  { icon: Brain,  title: "Adaptive Strategy", desc: "The system learns from your responses and evolves its approach." },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/20",    glow: "hover:shadow-[0_0_28px_rgba(34,211,238,0.18)]" },
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20",    glow: "hover:shadow-[0_0_28px_rgba(96,165,250,0.18)]" },
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20",  glow: "hover:shadow-[0_0_28px_rgba(167,139,250,0.18)]" },
  fuchsia: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", border: "border-fuchsia-500/20", glow: "hover:shadow-[0_0_28px_rgba(232,121,249,0.18)]" },
  pink:    { bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/20",    glow: "hover:shadow-[0_0_28px_rgba(244,114,182,0.18)]" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   glow: "hover:shadow-[0_0_28px_rgba(245,158,11,0.18)]" },
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

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(6,9,18,0.72)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.048)",
          boxShadow: "0 1px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="w-8 h-8 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
          <span className="font-display font-bold text-lg tracking-widest">ORBITRA</span>
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-blink-dot" />
        </div>
        <div className="flex items-center gap-3">
          <SignedIn>
            <button onClick={() => handleLaunch("/dashboard")}
              className="px-4 py-2 rounded-xl text-sm font-display font-semibold tracking-wider
                text-white/70 hover:text-cyan-400 transition-colors">
              Dashboard →
            </button>
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in">
              <button className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors font-medium">
                Log In
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="px-5 py-2.5 rounded-xl text-sm font-display font-semibold tracking-wider text-black
                bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400
                shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_32px_rgba(34,211,238,0.55)]
                transition-all duration-300">
                Get Started
              </button>
            </Link>
          </SignedOut>
        </div>
      </motion.header>

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
              border border-cyan-500/22 bg-cyan-500/7 text-cyan-400 text-xs font-semibold tracking-[0.18em] uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-blink-dot" />
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
              <span className="text-white" style={{ textShadow: "0 0 80px rgba(255,255,255,0.06)" }}>in orbit.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.8 }}
            className="text-white/45 text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
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
              className="px-10 h-14 rounded-2xl font-display text-sm tracking-wider text-white/65 hover:text-white
                border border-white/10 hover:border-white/20
                bg-white/[0.025] hover:bg-white/[0.05]
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
                <p className="text-white/30 text-[11px] tracking-[0.18em] uppercase font-semibold">{label}</p>
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
            className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-white/35" />
          </motion.div>
          <p className="text-[10px] text-white/20 tracking-widest uppercase font-semibold">Scroll</p>
        </motion.div>
      </section>

      {/* ── Features strip ──────────────────────────────────── */}
      <section className="relative z-[2] py-20 px-4"
        style={{ background: "rgba(6,9,18,0.6)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
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
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/18 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white mb-1">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
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
            <p className="text-[10px] font-bold tracking-[0.22em] text-cyan-400/60 uppercase mb-4">The Crew</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">Meet your agent crew</h2>
            <p className="text-white/35 text-sm max-w-md mx-auto leading-relaxed">
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
                    <p className="text-white/38 text-sm leading-relaxed">{agent.desc}</p>
                  </div>
                </motion.div>
              );
            })}
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
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to launch?</h2>
              <p className="text-white/38 mb-8 max-w-md mx-auto text-sm leading-relaxed">
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
      <footer className="relative z-[2] py-10 text-center border-t border-white/[0.04]"
        style={{ background: "rgba(4,6,14,0.7)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="w-5 h-5 opacity-35" />
          <span className="font-display text-xs tracking-widest text-white/22">ORBITRA AI</span>
        </div>
        <p className="text-white/18 text-xs">&copy; {new Date().getFullYear()} Orbitra AI. All systems nominal.</p>
      </footer>
    </div>
  );
}
