import { renderOgImage } from "@/lib/og";

export const alt = "Ask Maya playground — Nebkern Technology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Ask Maya",
    title: "Try Maya, the AI agent inside Instant.",
  });
}
