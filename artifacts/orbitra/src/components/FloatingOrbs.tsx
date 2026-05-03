import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

/* Light neumorphic orbs — inspired by the reference portfolio */
const ORBS = [
  {
    size: 540,
    style: { top: "-20%", left: "-18%" },
    sphere: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(210,225,255,0.9) 35%, rgba(180,205,255,0.75) 65%, rgba(160,190,255,0.55) 100%)",
    outerGlow: "radial-gradient(circle at 40% 35%, rgba(120,180,255,0.35) 0%, transparent 65%)",
    glowBlur: "220px",
    shadow: "inset 10px 10px 30px rgba(255,255,255,0.95), inset -12px -12px 30px rgba(120,160,240,0.18), 12px 12px 40px rgba(140,170,230,0.35), -6px -6px 20px rgba(255,255,255,0.9)",
    delay: 0, duration: 14, px: 0.28, py: 0.2,
  },
  {
    size: 460,
    style: { top: "4%", right: "-16%" },
    sphere: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.92) 0%, rgba(225,210,255,0.88) 35%, rgba(205,185,255,0.72) 65%, rgba(185,165,255,0.52) 100%)",
    outerGlow: "radial-gradient(circle at 40% 35%, rgba(160,120,255,0.3) 0%, transparent 65%)",
    glowBlur: "200px",
    shadow: "inset 10px 10px 28px rgba(255,255,255,0.92), inset -12px -12px 28px rgba(140,100,240,0.16), 12px 12px 38px rgba(160,140,230,0.32), -6px -6px 18px rgba(255,255,255,0.88)",
    delay: 2, duration: 17, px: -0.24, py: -0.18,
  },
  {
    size: 320,
    style: { bottom: "-8%", left: "18%" },
    sphere: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(200,235,255,0.85) 35%, rgba(170,215,255,0.7) 65%, rgba(150,200,255,0.5) 100%)",
    outerGlow: "radial-gradient(circle at 40% 35%, rgba(80,180,255,0.28) 0%, transparent 65%)",
    glowBlur: "150px",
    shadow: "inset 8px 8px 22px rgba(255,255,255,0.9), inset -10px -10px 22px rgba(80,140,240,0.14), 10px 10px 32px rgba(120,160,225,0.3), -5px -5px 14px rgba(255,255,255,0.85)",
    delay: 3.5, duration: 15, px: 0.16, py: -0.13,
  },
  {
    size: 260,
    style: { bottom: "0%", right: "6%" },
    sphere: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(255,215,240,0.85) 35%, rgba(255,185,220,0.7) 65%, rgba(245,165,210,0.5) 100%)",
    outerGlow: "radial-gradient(circle at 40% 35%, rgba(220,100,180,0.25) 0%, transparent 65%)",
    glowBlur: "125px",
    shadow: "inset 8px 8px 20px rgba(255,255,255,0.9), inset -10px -10px 20px rgba(200,80,160,0.13), 10px 10px 28px rgba(200,150,210,0.28), -5px -5px 12px rgba(255,255,255,0.85)",
    delay: 1.5, duration: 20, px: -0.18, py: 0.15,
  },
  {
    size: 190,
    style: { top: "36%", left: "-4%" },
    sphere: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.88) 0%, rgba(200,250,240,0.82) 35%, rgba(170,235,220,0.68) 65%, rgba(150,220,205,0.48) 100%)",
    outerGlow: "radial-gradient(circle at 40% 35%, rgba(40,200,170,0.24) 0%, transparent 65%)",
    glowBlur: "95px",
    shadow: "inset 6px 6px 18px rgba(255,255,255,0.88), inset -8px -8px 18px rgba(30,160,140,0.12), 8px 8px 24px rgba(100,200,185,0.26), -4px -4px 10px rgba(255,255,255,0.82)",
    delay: 2.8, duration: 22, px: 0.12, py: 0.1,
  },
];

function Orb({
  size, style, sphere, outerGlow, glowBlur, shadow, delay, duration, px, py,
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
        position: "absolute", inset: "-40%",
        background: outerGlow,
        filter: `blur(${glowBlur})`,
        borderRadius: "50%",
      }} />
      {/* Sphere */}
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: sphere,
        boxShadow: shadow,
        border: "1px solid rgba(255,255,255,0.9)",
      }} />
      {/* Specular highlight */}
      <div style={{
        position: "absolute", top: "14%", left: "20%",
        width: "36%", height: "24%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)",
        filter: "blur(6px)",
      }} />
      {/* Soft edge rim */}
      <div style={{
        position: "absolute", bottom: "16%", right: "16%",
        width: "22%", height: "14%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 80%)",
        filter: "blur(4px)",
      }} />
    </motion.div>
  );
}

export default function FloatingOrbs() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 35, damping: 26 });
  const mouseY = useSpring(rawY, { stiffness: 35, damping: 26 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth  - 0.5) * 80);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 80);
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
