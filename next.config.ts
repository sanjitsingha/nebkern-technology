import type { NextConfig } from "next";

/**
 * The Supabase project, read from the same variable the app uses. Next
 * loads `.env*` files before it evaluates this config, so `.env.local`
 * applies here too. Unset means no Supabase images are allowed, which is
 * the safe failure — the site still builds.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

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
      /**
       * Blog uploads: the public `blog-images` bucket, and only that
       * bucket. Scoped to its path rather than the whole Supabase host,
       * for the same reason as above — this allowlist is also what stops
       * our optimizer being used to resize anyone else's files.
       *
       * Must match `isAllowedImageUrl` in lib/media.ts, which is what
       * the admin checks before saving an image into a post.
       */
      ...(supabaseUrl
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(supabaseUrl).hostname,
              pathname: "/storage/v1/object/public/blog-images/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
