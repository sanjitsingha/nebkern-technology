import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Nebkern admin" },
  // An admin that turns up in search results is a bug, not a feature.
  robots: { index: false, follow: false },
};

/** No site nav, no footer. The public chrome invites a reader deeper
 *  into the marketing site; nothing here should. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-paper">{children}</div>;
}
