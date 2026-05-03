import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface OrbitraRobotProps {
  isLaunching?: boolean;
  onLaunchComplete?: () => void;
}

export default function OrbitraRobot({ isLaunching = false, onLaunchComplete }: OrbitraRobotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 20, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 20, mass: 0.6 });

  const headRotateX = useTransform(smoothY, [-500, 500], [15, -15]);
  const headRotateY = useTransform(smoothX, [-500, 500], [-25, 25]);

  const leftPupilCx  = useTransform(smoothX, [-600, 600], [83, 89]);
  const leftPupilCy  = useTransform(smoothY, [-600, 600], [85, 91]);
  const rightPupilCx = useTransform(smoothX, [-600, 600], [111, 117]);
  const rightPupilCy = useTransform(smoothY, [-600, 600], [85, 91]);

  const leftEyeX  = useTransform(smoothX, [-600, 600], [78, 82]);
  const rightEyeX = useTransform(smoothX, [-600, 600], [106, 110]);

  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top  - rect.height / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const id = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      if (Math.random() > 0.7) {
        setTimeout(() => { setIsBlinking(true); setTimeout(() => setIsBlinking(false), 150); }, 250);
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Fire callback after launch animation finishes
  useEffect(() => {
    if (!isLaunching) return;
    const t = setTimeout(() => { onLaunchComplete?.(); }, 1100);
    return () => clearTimeout(t);
  }, [isLaunching, onLaunchComplete]);

  const launchVariants = {
    idle: { scale: 1, opacity: 1 },
    launching: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.9, ease: [0.4, 0, 1, 1] as any },
    },
  };

  const outerRingVariants = {
    idle: { rotate: 0 },
    launching: {
      rotate: 1440,
      scale: 0,
      transition: { duration: 1.05, ease: [0.2, 0, 0.8, 1] as any },
    },
  };

  const innerRingVariants = {
    idle: { rotate: 0 },
    launching: {
      rotate: -1440,
      scale: 0,
      transition: { duration: 1.05, ease: [0.2, 0, 0.8, 1] as any },
    },
  };

  const state = isLaunching ? "launching" : "idle";

  return (
    <div ref={containerRef} className="relative w-64 h-64 mx-auto" style={{ perspective: "800px" }}>

      {/* Portal flash on launch */}
      {isLaunching && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 3.5, opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0 rounded-full pointer-events-none z-20"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.5) 0%, rgba(139,92,246,0.3) 40%, transparent 70%)",
          }}
        />
      )}

      <motion.div
        animate={isLaunching
          ? { y: 0, scale: 0, opacity: 0, transition: { duration: 0.9, ease: [0.4,0,1,1] } }
          : { y: [0, -10, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } }
        }
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Head with 3D tilt */}
        <motion.div
          style={{ rotateX: headRotateX, rotateY: headRotateY, transformStyle: "preserve-3d" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,255,255,0.45)]">
            <defs>
              <linearGradient id="r-cyan-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="r-purple-glow" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <radialGradient id="r-body-grad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
                <stop offset="60%" stopColor="rgba(10,10,30,0.9)" />
                <stop offset="100%" stopColor="rgba(5,5,18,0.98)" />
              </radialGradient>
              <linearGradient id="r-scan-beam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <filter id="r-glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Outer Ring — animates fast on launch */}
            <motion.circle
              cx="100" cy="100" r="80"
              fill="none" stroke="url(#r-cyan-glow)" strokeWidth="1.5"
              strokeDasharray="8 18 35 18"
              animate={isLaunching
                ? { rotate: [0, 1440], scale: [1, 0], opacity: [1, 0], transition: { duration: 1.05, ease: [0.2,0,0.8,1] } }
                : { rotate: [0, 360], transition: { repeat: Infinity, duration: 20, ease: "linear" } }
              }
              style={{ transformOrigin: "100px 100px" }}
            />

            {/* Mid ring */}
            <motion.circle
              cx="100" cy="100" r="74"
              fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="0.5"
              strokeDasharray="4 8"
              animate={isLaunching
                ? { rotate: [0, -720], scale: [1, 0], opacity: [0.6, 0], transition: { duration: 0.85, ease: [0.2,0,0.8,1] } }
                : { rotate: [0, -360], transition: { repeat: Infinity, duration: 30, ease: "linear" } }
              }
              style={{ transformOrigin: "100px 100px" }}
            />

            {/* Inner Ring */}
            <motion.circle
              cx="100" cy="100" r="68"
              fill="none" stroke="url(#r-purple-glow)" strokeWidth="3"
              strokeDasharray="90 50" opacity="0.55"
              animate={isLaunching
                ? { rotate: [0, -1440], scale: [1, 0], opacity: [0.55, 0], transition: { duration: 1.0, ease: [0.2,0,0.8,1] } }
                : { rotate: [0, -360], transition: { repeat: Infinity, duration: 15, ease: "linear" } }
              }
              style={{ transformOrigin: "100px 100px" }}
            />

            {/* Orbit dot on outer ring */}
            <motion.circle
              cx="180" cy="100" r="3.5" fill="#22d3ee" opacity="0.9"
              filter="url(#r-glow)"
              animate={isLaunching
                ? { opacity: 0, scale: 0, transition: { duration: 0.4 } }
                : {
                    cx: [180, 100, 20, 100, 180],
                    cy: [100, 20, 100, 180, 100],
                    transition: { repeat: Infinity, duration: 20, ease: "linear" },
                  }
              }
            />

            {/* Core Body */}
            <path
              d="M 58 72 Q 100 48 142 72 L 132 132 Q 100 152 68 132 Z"
              fill="url(#r-body-grad)"
              stroke="rgba(34,211,238,0.12)"
              strokeWidth="1.5"
            />

            {/* Chest accent line */}
            <line x1="80" y1="115" x2="120" y2="115" stroke="rgba(34,211,238,0.25)" strokeWidth="0.8" />
            <rect x="94" y="112" width="12" height="3" rx="1.5" fill="rgba(34,211,238,0.18)" />

            {/* Eyes */}
            <g style={{ transform: isBlinking ? "scaleY(0.05)" : "scaleY(1)", transformOrigin: "100px 88px", transition: "transform 0.08s" }}>
              <motion.rect x={leftEyeX} y="84" width="13" height="7" rx="3.5" fill="#22d3ee" filter="url(#r-glow)" />
              <motion.rect x={rightEyeX} y="84" width="13" height="7" rx="3.5" fill="#22d3ee" filter="url(#r-glow)" />
              <motion.circle cx={leftPupilCx}  cy={leftPupilCy}  r="2.2" fill="rgba(255,255,255,0.9)" />
              <motion.circle cx={rightPupilCx} cy={rightPupilCy} r="2.2" fill="rgba(255,255,255,0.9)" />
            </g>

            {/* Scanner beam */}
            <motion.path
              d="M 94 112 L 106 112 L 152 182 L 48 182 Z"
              fill="url(#r-scan-beam)"
              animate={isLaunching
                ? { opacity: 0, transition: { duration: 0.3 } }
                : { opacity: [0.08, 0.38, 0.08], transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" } }
              }
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
