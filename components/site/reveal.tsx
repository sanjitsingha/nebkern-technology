"use client";

import { useEffect, useRef } from "react";

/**
 * Reveals its children as they scroll into view.
 *
 * An IntersectionObserver rather than a scroll handler: the browser
 * decides when the element crosses the threshold, so there is no work
 * on frames where nothing changed. The observer disconnects on the
 * first hit — this is an entrance, and a section that faded out again
 * on the way back up would be a distraction, not an effect.
 *
 * The class is toggled directly on the node instead of through state.
 * A `setState` here would re-render every child of every revealed
 * section for a change that is purely presentational and already
 * expressible in CSS.
 *
 * `rootMargin`'s negative bottom holds the trigger back until the
 * element is properly in view rather than a pixel over the edge, which
 * is what stops a section animating while it is still off-screen.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal-up ${className}`}>
      {children}
    </div>
  );
}
