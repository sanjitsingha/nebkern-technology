import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { listPosts, formatDate } from "@/lib/blog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Notes from ${SITE.name} on building and running software for Indian businesses.`,
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex() {
  const posts = await listPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main" className="flex-1">
        <section className="border-b border-line-soft">
          <div className="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-8 sm:pt-20 sm:pb-16">
            <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-accent uppercase">
              Blog
            </p>
            <h1 className="display mt-3 max-w-3xl text-[clamp(2rem,4.2vw,3.25rem)] font-medium text-ink text-balance">
              Notes from the people building it.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft text-pretty">
              What we are learning about the WhatsApp Business Platform, running
              our own infrastructure, and building software for businesses in
              India.
            </p>
          </div>
        </section>

        {/* The newest post gets the wide treatment; the rest are a list.
            One lead item is enough hierarchy for a blog this size — a
            grid of equal cards would make five posts look like an
            archive nobody maintains. */}
        <section>
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
            <Link
              href={`/blog/${lead.slug}`}
              className="group block border border-line bg-surface p-7 transition-colors hover:border-ink/20 sm:p-10"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
                <span className="font-medium text-accent">{lead.tag}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={lead.date}>{formatDate(lead.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{lead.readMinutes} min read</span>
              </div>

              <h2 className="display mt-4 max-w-3xl text-[clamp(1.5rem,2.8vw,2.25rem)] font-medium text-ink text-balance">
                {lead.title}
              </h2>

              <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted text-pretty">
                {lead.excerpt}
              </p>

              <span className="mt-6 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink">
                Read it
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
              </span>
            </Link>

            <ul className="mt-4 divide-y divide-line-soft border-t border-line-soft">
              {rest.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid gap-2 py-8 lg:grid-cols-[10rem_1fr] lg:gap-10"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted lg:flex-col lg:items-start lg:gap-1">
                      <span className="font-medium text-accent">
                        {post.tag}
                      </span>
                      <time dateTime={post.date} className="lg:order-first">
                        {formatDate(post.date)}
                      </time>
                      <span className="lg:text-muted/80">
                        {post.readMinutes} min read
                      </span>
                    </div>

                    <div>
                      <h2 className="text-[1.375rem] font-semibold tracking-[-0.018em] text-ink transition-colors group-hover:text-accent text-balance sm:text-[1.5rem]">
                        {post.title}
                      </h2>
                      <p className="mt-2 max-w-2xl text-[1.0625rem] leading-relaxed text-muted text-pretty">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
