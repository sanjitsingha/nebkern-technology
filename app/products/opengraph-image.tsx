import { renderOgImage } from "@/lib/og";

export const alt = "Products by Nebkern Technology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Products",
    title: "Instant, Ask Maya and Flowra CRM.",
  });
}
