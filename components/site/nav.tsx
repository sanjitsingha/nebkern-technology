"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Logo } from "./logo";
import { LINKS } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";

const SECTIONS = [
  { label: "Company", href: "#company" },
  { label: "Products", href: "#products" },
  { label: "How we work", href: "#approach" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  // An open sheet that scrolls the page behind it is the single most
  // common mobile-nav bug; lock the body while it is up.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        <div className="flex items-center gap-9">
          <Link
            href="/"
            className="text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Logo />
            <span className="sr-only">Nebkern Technology — home</span>
          </Link>

          <ul className="hidden items-center gap-7 md:flex">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  className="text-[0.9375rem] font-medium text-muted transition-colors hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {/* Existing customers land here too, so the way back into the
              product they already pay for stays one click away — but it
              is the quiet link, not the call to action. */}
          <a
            href={LINKS.instantLogin}
            className="text-[0.9375rem] font-medium text-muted transition-colors hover:text-ink"
          >
            Customer sign-in
          </a>
          <a
            href={LINKS.contact}
            className="bg-accent text-accent-fg transition-colors hover:bg-accent-hover px-5 py-2.5 text-[0.9375rem] font-medium"
          >
            Talk to us
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
            <p className="pb-2 text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">
              Products
            </p>
            <ul className="pb-4">
              {PRODUCTS.filter((p) => p.href).map((p) => (
                <li key={p.slug}>
                  <a
                    href={p.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-2.5 py-2 text-[0.9375rem] text-ink"
                  >
                    <span
                      className="size-2 shrink-0 translate-y-[-1px] rounded-full"
                      style={{ background: p.hue }}
                      aria-hidden="true"
                    />
                    {p.name}
                    <span className="text-sm text-muted">{p.kicker}</span>
                  </a>
                </li>
              ))}
            </ul>

            <ul className="border-t border-line-soft pt-4">
              {SECTIONS.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-[0.9375rem] text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href={LINKS.contact}
                className="bg-accent text-accent-fg transition-colors hover:bg-accent-hover px-4 py-2.5 text-center text-sm font-medium"
              >
                Talk to us
              </a>
              <a
                href={LINKS.instantLogin}
                className="border border-line px-4 py-2.5 text-center text-sm font-medium text-ink"
              >
                Customer sign-in
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
