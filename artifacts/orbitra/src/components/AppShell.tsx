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
      <Link href="/" className="flex items-center gap-2.5 px-3 py-3 mb-5 rounded-xl hover:bg-white/[0.03] transition-colors" onClick={onNav}>
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Orbitra" className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
        <span className="font-display font-bold text-base tracking-widest text-white">ORBITRA</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-blink-dot" />
      </Link>

      {/* Section label */}
      <p className="text-[9px] font-semibold tracking-[0.18em] text-white/25 uppercase px-3 mb-1.5">Navigation</p>

      {/* Nav Links */}
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
      <div className="border-t border-white/[0.06] pt-4 space-y-3 mt-2">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/8 to-purple-500/8 border border-white/[0.06]">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white leading-none">7 Agents Active</p>
            <p className="text-[10px] text-white/35 mt-0.5">All systems nominal</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 border border-white/20 shadow-[0_0_10px_rgba(34,211,238,0.15)]" } }} />
          <span className="text-xs text-white/40 font-medium">Account</span>
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
        border-r border-white/[0.055]
        bg-[rgba(6,9,15,0.96)] backdrop-blur-2xl
        shadow-[4px_0_28px_rgba(0,0,0,0.5)]">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14
        border-b border-white/[0.06] bg-[rgba(6,9,15,0.96)] backdrop-blur-2xl
        flex items-center justify-between px-4
        shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <Link href="/" className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Orbitra" className="w-7 h-7 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
          <span className="font-display font-bold text-sm tracking-widest">ORBITRA</span>
        </Link>
        <div className="flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 border border-white/20" } }} />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-white/60 hover:text-white border border-white/[0.06]"
          >
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
              className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="md:hidden fixed left-0 top-0 h-full w-[220px] z-50
                border-r border-white/[0.06]
                bg-[rgba(6,9,15,0.99)] backdrop-blur-2xl"
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
