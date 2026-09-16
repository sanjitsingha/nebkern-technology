import { renderOgImage } from "@/lib/og";

export const alt = "Careers at Nebkern Technology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Careers",
    title: "Build the software Indian businesses run on.",
  });
}
