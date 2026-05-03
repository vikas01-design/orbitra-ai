import { Link, useLocation } from "wouter";
import { UserButton } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, Target, Activity, FileText, Video, Sparkles } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/dashboard",     label: "Dashboard",  icon: LayoutDashboard, activeClass: "nav-active-cyan"    },
  { href: "/opportunities", label: "Radar",       icon: Target,          activeClass: "nav-active-cyan"    },
  { href: "/skill-gap",     label: "Skill Gap",   icon: Activity,        activeClass: "nav-active-blue"    },
  { href: "/applications",  label: "Resume AI",   icon: FileText,        activeClass: "nav-active-violet"  },
  { href: "/interview",     label: "Interview",   icon: Video,           activeClass: "nav-active-fuchsia" },
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full py-5 px-3 gap-1">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-3 py-3 mb-5 rounded-xl hover:bg-slate-100/60 transition-colors" onClick={onNav}>
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Orbitra" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
        <span className="font-display font-bold text-base tracking-widest text-slate-800">ORBITRA</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 animate-blink-dot" />
      </Link>

      <p className="text-[9px] font-semibold tracking-[0.18em] text-slate-400 uppercase px-3 mb-1.5">Navigation</p>

      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_LINKS.map((link) => {
          const active = location.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} onClick={onNav}>
              <div className={`nav-item ${active ? link.activeClass : ""}`}>
                <link.icon className="w-[18px] h-[18px] shrink-0" />
                <span>{link.label}</span>
                {active && (
                  <motion.span
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-current"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom panel */}
      <div className="border-t border-slate-200/60 pt-4 space-y-3 mt-2">
        <div className="px-3 py-2.5 rounded-xl border border-cyan-200 flex items-center gap-2.5 bg-cyan-50">
          <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-cyan-800 leading-none">7 Agents Active</p>
            <p className="text-[10px] text-cyan-600/70 mt-0.5">All systems nominal</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 border border-slate-200 shadow-sm" } }} />
          <span className="text-xs text-slate-500 font-medium">Account</span>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex bg-background text-foreground">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[220px] z-40
        border-r border-slate-200/80 backdrop-blur-2xl
        shadow-[4px_0_24px_rgba(150,165,210,0.15)]"
        style={{ background: "rgba(255,255,255,0.92)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14
        border-b border-slate-200/80 backdrop-blur-2xl
        flex items-center justify-between px-4
        shadow-[0_4px_16px_rgba(150,165,210,0.15)]"
        style={{ background: "rgba(255,255,255,0.92)" }}>
        <Link href="/" className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Orbitra" className="w-7 h-7 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          <span className="font-display font-bold text-sm tracking-widest text-slate-800">ORBITRA</span>
        </Link>
        <div className="flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 border border-slate-200 shadow-sm" } }} />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800
              hover:bg-slate-100 transition-colors bg-white">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="md:hidden fixed left-0 top-0 h-full w-[220px] z-50
                border-r border-slate-200/80"
              style={{ background: "rgba(255,255,255,0.98)" }}
            >
              <SidebarContent onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:ml-[220px] min-w-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
