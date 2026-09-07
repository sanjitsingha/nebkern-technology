"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { PRODUCTS, STATUS_LABEL } from "@/lib/products";

/**
 * The "Access your apps" dialog.
 *
 * Built on the native `<dialog>` element rather than a div with a high
 * z-index. `showModal()` puts it in the browser's top layer, so it
 * cannot be trapped behind the sticky nav's stacking context, and it
 * brings focus trapping, Escape-to-close and an inert background with
 * it — three things a hand-rolled modal has to reimplement and usually
 * gets wrong.
 *
 * Rows come from the catalogue, so an app added to lib/products.ts
 * appears here without anyone remembering to add it. A row is a link
 * only when the product has an `appHref` — Flowra CRM has no sign-in to
 * send anybody to yet, and a menu item that looks clickable and goes
 * nowhere is worse than one that plainly says "in development".
 */
const APPS = PRODUCTS.filter((p) => p.isApp);

/** Lockup height inside a row, matching the apps slab. */
const LOGO_H = 26;

export function AppsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Drive the element from the prop. `showModal()` throws if the dialog
  // is already open, hence the guards.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Escape and the browser's own dismissal close the element without
  // going through React, which would leave `open` stuck true and the
  // dialog unopenable a second time.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = () => onClose();
    el.addEventListener("close", handle);
    return () => el.removeEventListener("close", handle);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="apps-modal-title"
      // The dialog box itself covers the whole viewport for hit-testing
      // purposes, so a click whose target IS the dialog landed on the
      // backdrop, not on the panel inside it.
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-0 text-ink shadow-[0_24px_64px_-24px_rgb(0_0_0/0.35)] backdrop:bg-ink/40"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="apps-modal-title"
              className="text-[1.25rem] font-semibold tracking-[-0.02em] text-ink"
            >
              Access your apps
            </h2>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
              Sign in to the products you already use.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <span className="sr-only">Close</span>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <ul className="mt-6 flex flex-col gap-2">
          {APPS.map((app) => {
            const name = app.logo ? (
              <Image
                src={app.logo.src}
                alt={app.name}
                width={LOGO_H * (app.logo.width / app.logo.height)}
                height={LOGO_H}
                className="h-[26px] w-auto"
              />
            ) : (
              <span className="text-[1.0625rem] font-semibold tracking-[-0.018em] text-ink">
                {app.name}
              </span>
            );

            const body = (
              <>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex items-center">{name}</span>
                  <span className="text-[0.875rem] leading-snug text-muted">
                    {app.kicker}
                  </span>
                </span>

                {app.appHref ? (
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                ) : (
                  <span className="shrink-0 text-[0.75rem] font-medium text-warning">
                    {app.statusLabel ?? STATUS_LABEL[app.status]}
                  </span>
                )}
              </>
            );

            return (
              <li key={app.slug}>
                {app.appHref ? (
                  <a
                    href={app.appHref}
                    onClick={onClose}
                    className="group flex items-center justify-between gap-4 rounded-md border border-line px-4 py-3.5 transition-colors hover:border-accent hover:text-accent"
                  >
                    {body}
                  </a>
                ) : (
                  <span className="flex items-center justify-between gap-4 rounded-md border border-line-soft bg-surface-2 px-4 py-3.5">
                    {body}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}
