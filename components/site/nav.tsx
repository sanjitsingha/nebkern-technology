"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Logo } from "./logo";
import { LINKS } from "@/lib/site";
import { PRODUCTS, STATUS_LABEL } from "@/lib/products";

type MenuItem = {
  label: string;
  href?: string;
  /** Shown beside the label. Carries "Coming soon" for anything that has
   *  nowhere to link yet. */
  note?: string;
};

/** Products come from the catalogue rather than a second hand-written
 *  list, so a product added to lib/products.ts appears here too. Only
 *  standalone apps — Ask Maya ships inside Instant. */
const PRODUCT_ITEMS: MenuItem[] = PRODUCTS.filter((p) => p.isApp).map((p) => ({
  label: p.name,
  href: p.href,
  note: p.href ? undefined : (p.statusLabel ?? STATUS_LABEL[p.status]),
}));

const RESOURCE_ITEMS: MenuItem[] = [
  { label: "Docs", href: LINKS.docs },
  { label: "Blog", href: "/blog" },
  { label: "Newsletter", href: LINKS.newsletter },
];

const MENUS: { label: string; items: MenuItem[] }[] = [
  { label: "Products", items: PRODUCT_ITEMS },
  { label: "Resources", items: RESOURCE_ITEMS },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M4 6.5l4 4 4-4" />
    </svg>
  );
}

/** The arrow on the bar's action. Slides forward on hover, driven by
 *  the `group` on the anchor rather than its own hover — the movement
 *  should answer a pointer anywhere on the button, not only on the
 *  12px of arrow.
 *
 *  Under `prefers-reduced-motion` the slide still happens but lands
 *  instantly: globals.css clamps every transition to 0.01ms. That is
 *  the rule working, not a broken animation. */
function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

/** One item inside a dropdown. A product with no site yet is not a link
 *  — it renders as plain text with its status, because a menu entry
 *  that looks clickable and goes nowhere is worse than no entry. */
function MenuRow({
  item,
  onNavigate,
}: {
  item: MenuItem;
  onNavigate: () => void;
}) {
  const body = (
    <>
      <span>{item.label}</span>
      {item.note && (
        <span className="ml-auto pl-3 text-[0.75rem] font-medium text-warning">
          {item.note}
        </span>
      )}
    </>
  );

  // 600, the same weight as the trigger that opens the menu. The rows
  // are not trying to sit below their parent in a hierarchy; the panel
  // already separates them from it, so they read as their own list.
  const shared =
    "flex items-center gap-2.5 px-4 py-2.5 text-[0.9375rem] font-semibold whitespace-nowrap";

  return (
    <li>
      {item.href ? (
        <a
          href={item.href}
          onClick={onNavigate}
          // Colour is the whole hover state — no fill behind the row —
          // so it has to be a colour that reads as a state change and not
          // as a slightly darker grey. Indigo is what the triggers above
          // already use on hover, so the menu answers the pointer the
          // same way at both levels.
          className={`${shared} text-ink-soft transition-colors hover:text-accent`}
        >
          {body}
        </a>
      ) : (
        <span className={`${shared} text-muted`}>{body}</span>
      )}
    </li>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  /** Label of the dropdown that is open, or null. One value rather than
   *  a flag each, so opening one closes the other for free. */
  const [menu, setMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // An open sheet that scrolls the page behind it is the single most
  // common mobile-nav bug; lock the body while it is up.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // A dropdown has to be dismissable without choosing anything from it:
  // Escape for the keyboard, a click anywhere else for the mouse.
  useEffect(() => {
    if (!menu) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setMenu(null);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [menu]);

  return (
    // Solid white with a hairline, at rest and scrolled alike. `bg-surface`
    // is true white where `--paper` is the page's warm off-white, so the
    // bar reads as a distinct plane above the page rather than blending
    // into it.
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <nav
        aria-label="Main"
        className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8"
      >
        {/* Wordmark and links are one left-hand group, so the links sit
            beside the brand rather than floating in the centre.
            `justify-between` on the bar then has two children to push
            apart — this group and the actions — instead of three. */}
        <div ref={barRef} className="flex items-center gap-9">
          <Link
            href="/"
            className="text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Logo />
            <span className="sr-only">Nebkern Technology — home</span>
          </Link>

          <ul className="hidden items-center gap-7 md:flex">
            <li>
              <a
                href="#company"
                className="text-[1.0625rem] font-semibold text-ink transition-colors hover:text-accent"
              >
                Company
              </a>
            </li>

            {MENUS.map(({ label, items }) => (
              <li
                key={label}
                className="relative"
                // Hover is the expected way to open a nav menu with a
                // mouse, but firing it on touch would open the panel and
                // then immediately toggle it shut on the click that
                // follows. Guarding on pointerType keeps both honest.
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setMenu(label);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") setMenu(null);
                }}
              >
                <button
                  type="button"
                  aria-expanded={menu === label}
                  aria-haspopup="true"
                  // Three input types, three rules. On a MOUSE the
                  // hover handlers already own open/close, so a click
                  // must do nothing — otherwise hovering opens the panel
                  // and the click that follows shuts it again, which is
                  // exactly what it looks like when a menu is broken.
                  // Touch and pen toggle on pointerdown. Keyboard
                  // activation arrives as a click with `detail === 0`
                  // and no pointer event at all, so it is handled here.
                  onPointerDown={(e) => {
                    if (e.pointerType !== "mouse") {
                      setMenu((m) => (m === label ? null : label));
                    }
                  }}
                  onClick={(e) => {
                    if (e.detail === 0) {
                      setMenu((m) => (m === label ? null : label));
                    }
                  }}
                  className={`flex items-center gap-1.5 text-[1.0625rem] font-semibold transition-colors ${
                    menu === label
                      ? "text-accent"
                      : "text-ink hover:text-accent"
                  }`}
                >
                  {label}
                  <Chevron open={menu === label} />
                </button>

                {menu === label && (
                  // The wrapper's top padding is a hover bridge — without
                  // it the gap between button and panel counts as
                  // "outside", and the menu closes as the pointer crosses.
                  <div className="absolute top-full left-0 pt-3">
                    <ul className="min-w-60 rounded-md border border-line bg-surface py-1.5 shadow-[0_10px_28px_-14px_rgb(0_0_0/0.22)]">
                      {items.map((item) => (
                        <MenuRow
                          key={item.label}
                          item={item}
                          onNavigate={() => setMenu(null)}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* One button, and it points at the login rather than at
            contact. Existing customers are the people who need the bar
            to do something for them on every page; a prospect already
            has the hero's action and the closing panel. Sending
            "Access your apps" anywhere but the sign-in page would make
            the label a lie. */}
        <div className="hidden items-center md:flex">
          {/* Outlined, not filled. The hero already owns the one solid
              indigo action above the fold; a second one in the bar put
              two primary buttons on screen at once and neither won.
              Border and text both go indigo on hover, which is the same
              answer the dropdown rows give. */}
          <a
            href={LINKS.instantLogin}
            className="group inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-[0.9375rem] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Access your apps
            <Arrow />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 grid h-10 w-10 place-items-center text-ink md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-line bg-paper md:hidden"
        >
          <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
            {/* No dropdowns on the sheet — there is room to lay both
                groups out flat, and a menu inside a menu is a tap
                nobody needs to make. */}
            {MENUS.map(({ label, items }) => (
              <div key={label} className="pb-4">
                <p className="pb-1 text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">
                  {label}
                </p>
                <ul>
                  {items.map((item) => (
                    <MenuRow
                      key={item.label}
                      item={item}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </ul>
              </div>
            ))}

            <ul className="border-t border-line-soft pt-4">
              <li>
                <a
                  href="#company"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-[0.9375rem] text-ink"
                >
                  Company
                </a>
              </li>
            </ul>

            <div className="mt-5">
              <a
                href={LINKS.instantLogin}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Access your apps
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
