import { renderOgImage } from "@/lib/og";

export const alt = "Contact Nebkern Technology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Contact",
    title: "Reach an engineer, not a queue.",
  });
}
