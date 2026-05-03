import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const ORBS = [
  {
    size: 500, style: { top: "-12%", left: "-14%" },
    colors: ["#0e2240", "#0a3060", "#083858"],
    glow: "rgba(20,100,200,0.18)", glowSize: "240px",
    delay: 0, duration: 13,
    px: 0.35, py: 0.25,
  },
  {
    size: 420, style: { top: "8%", right: "-14%" },
    colors: ["#180a38", "#2d0a5a", "#1a0a40"],
    glow: "rgba(100,20,200,0.16)", glowSize: "190px",
    delay: 2, duration: 17,
    px: -0.28, py: -0.2,
  },
  {
    size: 310, style: { bottom: "-8%", left: "28%" },
    colors: ["#0c1a30", "#082040", "#081a38"],
    glow: "rgba(10,80,180,0.12)", glowSize: "145px",
    delay: 4, duration: 15,
    px: 0.18, py: -0.16,
  },
  {
    size: 250, style: { bottom: "4%", right: "10%" },
    colors: ["#200840", "#380a60", "#200848"],
    glow: "rgba(120,30,200,0.13)", glowSize: "125px",
    delay: 1.5, duration: 19,
    px: -0.2, py: 0.17,
  },
];

function Orb({
  size, style, colors, glow, glowSize, delay, duration, px, py,
  mouseX, mouseY,
}: typeof ORBS[number] & { mouseX: any; mouseY: any }) {
  const orbX = useTransform(mouseX, (v: number) => v * px);
  const orbY = useTransform(mouseY, (v: number) => v * py);

  return (
    <motion.div
      style={{ ...style, x: orbX, y: orbY, position: "absolute", width: size, height: size }}
      animate={{ y: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration, ease: "easeInOut", delay }}
    >
      {/* Outer glow bloom */}
      <div style={{
        position: "absolute", inset: "-35%",
        background: `radial-gradient(circle at 40% 35%, ${glow} 0%, transparent 65%)`,
        filter: `blur(${glowSize})`,
        borderRadius: "50%",
      }} />

      {/* Orb sphere with neumorphic depth */}
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: `
          radial-gradient(circle at 33% 28%,
            rgba(255,255,255,0.065) 0%,
            ${colors[0]} 28%,
            ${colors[1]} 62%,
            ${colors[2]} 100%
          )
        `,
        boxShadow: `
          inset 8px 8px 24px rgba(255,255,255,0.04),
          inset -10px -10px 32px rgba(0,0,0,0.65),
          0 24px 64px rgba(0,0,0,0.55),
          0 0 50px ${glow}
        `,
        border: "1px solid rgba(255,255,255,0.042)",
      }} />

      {/* Specular highlight */}
      <div style={{
        position: "absolute", top: "13%", left: "20%",
        width: "34%", height: "24%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 80%)",
        filter: "blur(8px)",
      }} />
    </motion.div>
  );
}

export default function FloatingOrbs() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 38, damping: 28 });
  const mouseY = useSpring(rawY, { stiffness: 38, damping: 28 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth  - 0.5) * 70);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 70);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {ORBS.map((orb, i) => (
        <Orb key={i} {...orb} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  );
}
