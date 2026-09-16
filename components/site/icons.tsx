import type { ReactNode } from "react";

/**
 * The line icons used across the inner pages.
 *
 * Drawn inline rather than pulled from an icon set, for the reason the
 * homepage's values panel already gives: a dozen glyphs is not worth a
 * dependency, and drawing them here means they share the site's stroke
 * weight and inherit `currentColor` instead of arriving with their own.
 *
 * All on a 24-unit grid at a 1.5 stroke, so any two sit together without
 * one looking heavier.
 */
function Glyph({
  children,
  className = "h-6 w-6",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

type IconProps = { className?: string };

export const IconMapPin = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Glyph>
);

export const IconBadgeCheck = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 3l2.1 1.6 2.6-.2.9 2.5 2.3 1.2-.6 2.6 1.1 2.4-2 1.7-.4 2.6-2.6.3L13.8 20 12 18.3 10.2 20l-1.6-2.1-2.6-.3-.4-2.6-2-1.7 1.1-2.4-.6-2.6 2.3-1.2.9-2.5 2.6.2z" />
    <path d="M8.8 12.2l2.2 2.2 4.2-4.3" />
  </Glyph>
);

export const IconBuilding = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 21V5.5L12 3v18" />
    <path d="M12 8.5l8 2.5V21" />
    <path d="M3 21h18" />
    <path d="M7.5 8h1.5M7.5 11.5h1.5M7.5 15h1.5M15.5 13.5h1.5M15.5 17h1.5" />
  </Glyph>
);

export const IconLayers = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 12.5l9 5 9-5" />
    <path d="M3 17l9 5 9-5" />
  </Glyph>
);

export const IconShield = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Glyph>
);

export const IconLock = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="1.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <path d="M12 14.5v2.5" />
  </Glyph>
);

export const IconDatabase = (p: IconProps) => (
  <Glyph {...p}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" />
    <path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13" />
    <path d="M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" />
  </Glyph>
);

export const IconPlug = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M9 3v4M15 3v4" />
    <path d="M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0V7z" />
    <path d="M12 16v5" />
  </Glyph>
);

export const IconUsers = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 5.6a3.2 3.2 0 0 1 0 5.8" />
    <path d="M18 14.3A6 6 0 0 1 21 20" />
  </Glyph>
);

export const IconBell = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
    <path d="M10 21h4" />
  </Glyph>
);

export const IconCode = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5" />
    <path d="M13.5 5l-3 14" />
  </Glyph>
);

export const IconMessage = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M20 13.5a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7.5z" />
    <path d="M8.5 9.5h7M8.5 12.5h4" />
  </Glyph>
);

export const IconSparkles = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M11 4l1.6 4.4L17 10l-4.4 1.6L11 16l-1.6-4.4L5 10l4.4-1.6z" />
    <path d="M18 14.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" />
  </Glyph>
);

export const IconServer = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3.5" y="4" width="17" height="6.5" rx="1" />
    <rect x="3.5" y="13.5" width="17" height="6.5" rx="1" />
    <path d="M7 7.25h.01M7 16.75h.01M11 7.25h6M11 16.75h6" />
  </Glyph>
);

export const IconDocument = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
    <path d="M9 12h6M9 15.5h6M9 9h2.5" />
  </Glyph>
);

export const IconMail = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
  </Glyph>
);

export const IconCheck = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Glyph>
);

export const IconArrowUpRight = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M7 17L17 7M8.5 7H17v8.5" />
  </Glyph>
);

export const IconMinusCircle = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12h7" />
  </Glyph>
);
