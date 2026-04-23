import { motion } from "framer-motion";
import { Link } from "wouter";
import { SignedIn, SignedOut } from "@/lib/clerk-auth";
import { Button } from "@/components/ui/button";
import OrbitraRobot from "@/components/OrbitraRobot";
import { ArrowRight, Bot, Target, Activity, FileText, RefreshCw, Wrench, Video } from "lucide-react";

const AGENTS = [
  { icon: Bot, title: "Manager", desc: "Coordinates your career strategy." },
  { icon: Target, title: "Opportunity Radar", desc: "Scouts roles fitting your profile." },
  { icon: Activity, title: "Skill Gap Analyzer", desc: "Identifies what you need to learn." },
  { icon: FileText, title: "Application Generator", desc: "Crafts bespoke resumes & cover letters." },
  { icon: RefreshCw, title: "Recovery", desc: "Pivots strategy after rejections." },
  { icon: Wrench, title: "Self-Correction", desc: "Learns and optimizes over time." },
  { icon: Video, title: "AI Interviewer", desc: "Simulates high-pressure interviews." },
];

export default function LandingPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="w-8 h-8" />
          <span className="font-display font-bold text-xl tracking-wider">ORBITRA</span>
        </div>
        <div>
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="secondary" className="font-display">Go to Dashboard</Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="outline" className="mr-4">Log In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="font-display">Sign Up</Button>
            </Link>
          </SignedOut>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 min-h-[90vh] flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <OrbitraRobot />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-display text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary"
        >
          Your AI career,<br/>in orbit.
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
        >
          Orbitra is a multi-agent copilot that scouts opportunities, analyzes skill gaps, generates applications, and preps you for interviews.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <SignedOut>
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 font-display">
                Get Started
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 font-display">
                Enter Dashboard
              </Button>
            </Link>
          </SignedIn>
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 font-display">
            See How It Works <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Agents Section */}
      <section className="py-24 px-4 bg-card/30 border-y border-white/5 relative">
        <div className="container mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">Meet your agent crew</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl flex flex-col items-start gap-4 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="p-3 bg-primary/20 text-primary rounded-xl">
                  <agent.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl">{agent.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-muted-foreground border-t border-white/10">
        <p className="font-display">&copy; {new Date().getFullYear()} Orbitra AI. All systems nominal.</p>
      </footer>
    </div>
  );
}
