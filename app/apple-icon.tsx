import { renderBrandTile } from "@/lib/og";

/** The home-screen icon iOS uses when someone saves the site. Same
 *  drawing as app/icon.svg, rasterised, because iOS ignores SVG icons. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderBrandTile(180);
}
