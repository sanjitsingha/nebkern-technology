import { renderOgImage } from "@/lib/og";

export const alt = "Trust & security at Nebkern Technology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Trust & security",
    title: "What we protect, and how we protect it.",
  });
}
