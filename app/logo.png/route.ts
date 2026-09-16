import { renderBrandTile } from "@/lib/og";

/**
 * /logo.png — a stable, extension-bearing URL for the company logo.
 *
 * The Organization structured data in app/layout.tsx points here. Google
 * wants a raster logo of at least 112px at a URL that does not change;
 * the file-convention icons get hashed query strings, which is why this
 * is its own route. Rendered once at build.
 */
export const dynamic = "force-static";

export function GET() {
  return renderBrandTile(512);
}
