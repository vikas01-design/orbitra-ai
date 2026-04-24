import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function OrbitraRobot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoothly follow the cursor for both head and eyes
  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 20, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 20, mass: 0.6 });

  // Parallax subtle tracking
  const headRotateX = useTransform(smoothY, [-500, 500], [15, -15]);
  const headRotateY = useTransform(smoothX, [-500, 500], [-25, 25]);

  // Eye pupils translate within the eye sockets
  const leftPupilCx = useTransform(smoothX, [-600, 600], [83, 89]);
  const leftPupilCy = useTransform(smoothY, [-600, 600], [85, 91]);
  const rightPupilCx = useTransform(smoothX, [-600, 600], [111, 117]);
  const rightPupilCy = useTransform(smoothY, [-600, 600], [85, 91]);

  // Eye glow tint slides along the eye bar
  const leftEyeX = useTransform(smoothX, [-600, 600], [78, 82]);
  const rightEyeX = useTransform(smoothX, [-600, 600], [106, 110]);

  // Cursor light spotlight on the head
  const lightCx = useTransform(smoothX, [-600, 600], [60, 140]);
  const lightCy = useTransform(smoothY, [-600, 600], [70, 130]);

  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      
      // Double blink chance
      if (Math.random() > 0.7) {
        setTimeout(() => {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 150);
        }, 250);
      }
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div ref={containerRef} className="relative w-64 h-64 mx-auto perspective-1000">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="w-full h-full relative preserve-3d"
      >
        {/* Glow Aura */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
        />

        {/* Head */}
        <motion.div
          style={{ rotateX: headRotateX, rotateY: headRotateY }}
          className="absolute inset-0 flex items-center justify-center preserve-3d"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            {/* Outer Ring */}
            <motion.circle
              cx="100" cy="100" r="80"
              fill="none" stroke="url(#cyan-glow)" strokeWidth="2"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              style={{ transformOrigin: "100px 100px" }}
              strokeDasharray="10 20 40 20"
            />
            
            {/* Inner Ring */}
            <motion.circle
              cx="100" cy="100" r="70"
              fill="none" stroke="url(#purple-glow)" strokeWidth="4"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              style={{ transformOrigin: "100px 100px" }}
              strokeDasharray="100 50"
              opacity="0.5"
            />

            {/* Core Body */}
            <path
              d="M 60 70 Q 100 50 140 70 L 130 130 Q 100 150 70 130 Z"
              fill="rgba(10, 10, 30, 0.8)"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />
            
            {/* Cursor-following spotlight */}
            <motion.circle
              cx={lightCx}
              cy={lightCy}
              r="35"
              fill="url(#cursor-light)"
              opacity="0.45"
            />

            {/* Eyes */}
            <g className="eyes" style={{ transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)', transformOrigin: 'center' }}>
              <motion.rect x={leftEyeX} y="85" width="12" height="6" rx="3" fill="#00FFFF" />
              <motion.rect x={rightEyeX} y="85" width="12" height="6" rx="3" fill="#00FFFF" />
              <motion.circle cx={leftPupilCx} cy={leftPupilCy} r="2" fill="#FFF" />
              <motion.circle cx={rightPupilCx} cy={rightPupilCy} r="2" fill="#FFF" />
            </g>

            {/* Scanner Beam */}
            <motion.path
              d="M 95 110 L 105 110 L 150 180 L 50 180 Z"
              fill="url(#scan-beam)"
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />

            <defs>
              <linearGradient id="cyan-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00FFFF" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="purple-glow" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#8A2BE2" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="scan-beam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="cursor-light" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
