import { renderOgImage } from "@/lib/og";

export const alt = "About Nebkern Technology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "About Nebkern",
    title: "We build, host and support our own software.",
  });
}
