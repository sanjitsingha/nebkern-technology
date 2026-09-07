import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class merger for the shadcn/Aceternity components under
 * `components/ui/`, which build a base className and expect a caller's
 * classes to override it.
 *
 * `twMerge` is the half that matters here: plain concatenation would
 * leave `bg-black bg-accent` on the same element and let source order
 * in the stylesheet decide the winner. This resolves the conflict in
 * favour of the caller, which is what lets the spotlight card keep its
 * behaviour while taking our indigo instead of its own black.
 *
 * Nothing in `components/site/` uses it — those write their classes
 * directly, and should keep doing so.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
