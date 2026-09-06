import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Product lockups are served from our own media host rather than
     * copied into `public/`, so a logo updated there updates here with
     * no redeploy. Scoped to the assets prefix rather than the whole
     * host — `remotePatterns` is an allowlist for an optimizer that
     * will fetch whatever it is pointed at, so it should be as narrow
     * as the use case.
     *
     * `domains` is deprecated as of Next 16; this is its replacement.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.instant.nebkern.com",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
