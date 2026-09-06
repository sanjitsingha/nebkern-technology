/**
 * The nebkern mark.
 *
 * The name is neb + kern — nebula and kernel — so the mark is exactly
 * that and nothing else: a solid core with an orbit tilted off it. Drawn
 * in `currentColor` at a 32-unit grid, so one component serves the ink
 * nav, the ink footer and any product colour it is dropped into without
 * a second asset.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* The orbit. Tilted rather than concentric — a centred ring
          around a centred square reads as a loading spinner. */}
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6.1"
        transform="rotate(-32 16 16)"
        stroke="currentColor"
        strokeWidth="2.25"
        opacity="0.6"
      />
      {/* The kernel. */}
      <rect x="11.5" y="11.5" width="9" height="9" fill="currentColor" />
    </svg>
  );
}

/** Mark plus wordmark. The wordmark is set in the body face at a tight
 *  track — a company this size does not need a custom logotype, it
 *  needs to look consistent everywhere it appears. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <Mark className="h-8 w-8 shrink-0 text-accent" />
      <span className="text-[1.25rem] font-semibold tracking-[-0.02em]">
        nebkern
      </span>
    </span>
  );
}
