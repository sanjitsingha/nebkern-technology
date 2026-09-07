"use client";

import { useMotionValue, motion, useMotionTemplate } from "motion/react";
import dynamic from "next/dynamic";
import React, { MouseEvent as ReactMouseEvent, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Aceternity's Card Spotlight, from
 * `npx shadcn@latest add @aceternity/card-spotlight-demo`.
 *
 * Three deliberate changes from what the registry installs. Noted here
 * because re-running that command overwrites this file:
 *
 * 1. The base className keeps upstream's black card and neutral
 *    border, but no longer hardcodes `p-10`. tailwind-merge cannot
 *    resolve `p-10` against a caller's `px-8 py-12` — different class
 *    groups, so both survive and the padding becomes unoverridable.
 *    Spacing is the caller's; the colours are the component's.
 *    Also dropped: two malformed classes the install wrote here
 *    (`border-oklch(0.922 0 0)` and its `dark:` twin), which Tailwind
 *    does not generate, and a `dark:` variant that is dead weight on a
 *    site declaring `color-scheme: light`.
 *
 * 2. `CanvasRevealEffect` is lazily imported. It pulls in three.js and
 *    @react-three/fiber — together the heaviest thing on this site by a
 *    wide margin — and it only ever renders on hover. A static import
 *    would put all of it in the homepage's first load for an effect
 *    most visitors never trigger.
 *
 * 3. `prefers-reduced-motion` is handled inside the canvas, not by
 *    refusing to mount it — see `canvas-reveal-effect.tsx`. An earlier
 *    version of this file skipped the canvas altogether for those
 *    visitors, which meant the dot field was invisible on any machine
 *    with Windows' "animation effects" switched off. That setting is
 *    routinely off for performance rather than for vestibular reasons,
 *    so it was hiding the effect from people who wanted to see it.
 *    The dots now render for everyone; only their animation stops.
 */
const CanvasRevealEffect = dynamic(
  () =>
    import("@/components/ui/canvas-reveal-effect").then(
      (m) => m.CanvasRevealEffect,
    ),
  // Valid because this file is a Client Component; `ssr: false` is an
  // error in a Server Component. There is nothing to render on the
  // server anyway — the canvas exists only after a real mouse enters.
  { ssr: false },
);

export const CardSpotlight = ({
  children,
  radius = 350,
  color = "#262626",
  colors = [
    [59, 130, 246],
    [139, 92, 246],
  ],
  dotSize = 3,
  animationSpeed = 5,
  showGradient = false,
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  /** Dot colours as `[r, g, b]`, up to three. */
  colors?: number[][];
  dotSize?: number;
  animationSpeed?: number;
  /** Upstream defaults this on, which lays a `gray-950` gradient over
   *  the dots. Off here so the effect can sit on a colour other than
   *  black without muddying it. */
  showGradient?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div
      className={cn(
        "group/spotlight relative rounded-md border border-neutral-800 bg-black",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-0 rounded-[inherit] opacity-0 transition duration-300 group-hover/spotlight:opacity-100 motion-reduce:transition-none"
        style={{
          backgroundColor: color,
          maskImage: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
        }}
      >
        {isHovering && (
          <CanvasRevealEffect
            animationSpeed={animationSpeed}
            containerClassName="absolute inset-0 bg-transparent pointer-events-none"
            colors={colors}
            dotSize={dotSize}
            showGradient={showGradient}
          />
        )}
      </motion.div>
      {children}
    </div>
  );
};
