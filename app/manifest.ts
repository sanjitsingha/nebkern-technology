import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

/**
 * /manifest.webmanifest
 *
 * `display: "browser"`, not `standalone`: this is a company website, not
 * an app, and opening it without browser chrome would hide the address
 * bar a visitor uses to check which site they are on.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "browser",
    lang: "en-IN",
    background_color: "#fafafc",
    theme_color: "#fafafc",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
