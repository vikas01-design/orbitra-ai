export type AvatarOption = { id: string; label: string; url: string };

const styles: Array<{ style: string; seed: string; label: string; bg: string }> = [
  { style: "bottts-neutral", seed: "Nebula",   label: "Nebula",   bg: "0ea5e9" },
  { style: "bottts-neutral", seed: "Vortex",   label: "Vortex",   bg: "8b5cf6" },
  { style: "bottts-neutral", seed: "Quasar",   label: "Quasar",   bg: "f97316" },
  { style: "bottts-neutral", seed: "Pulsar",   label: "Pulsar",   bg: "10b981" },
  { style: "bottts-neutral", seed: "Comet",    label: "Comet",    bg: "ef4444" },
  { style: "bottts-neutral", seed: "Aurora",   label: "Aurora",   bg: "ec4899" },
  { style: "bottts-neutral", seed: "Eclipse",  label: "Eclipse",  bg: "eab308" },
  { style: "bottts-neutral", seed: "Stellar",  label: "Stellar",  bg: "06b6d4" },
];

export const AVATARS: AvatarOption[] = styles.map((s) => ({
  id: `${s.style}:${s.seed}`,
  label: s.label,
  url: `https://api.dicebear.com/7.x/${s.style}/svg?seed=${encodeURIComponent(s.seed)}&backgroundColor=${s.bg}&radius=50`,
}));

export function getAvatarUrl(avatarId: string | null | undefined, fallbackSeed?: string | null): string {
  const found = AVATARS.find((a) => a.id === avatarId);
  if (found) return found.url;
  const seed = encodeURIComponent(fallbackSeed?.trim() || "Explorer");
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}&backgroundColor=6366f1&radius=50`;
}
