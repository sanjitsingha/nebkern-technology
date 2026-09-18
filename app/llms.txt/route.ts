import { listPublishedPosts } from "@/lib/blog-store";
import { PRODUCTS, STATUS_LABEL } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";
import { LINKS, SITE } from "@/lib/site";

/**
 * /llms.txt — the llmstxt.org convention.
 *
 * A plain-text brief for language models, in the same spirit as
 * robots.txt but aimed at systems that summarise a site rather than
 * index it. It exists because the alternative is a model inferring what
 * Nebkern is from marketing copy and getting the facts — the legal
 * entity, what is shipping versus what is not — wrong.
 *
 * A Route Handler rather than a static file in `public/`, because every
 * fact here already lives somewhere: the products come from the
 * catalogue and the posts from the store. A static copy would be a
 * second source of truth that goes stale silently, which is exactly the
 * failure this file is meant to prevent.
 *
 * Static, regenerated at most every five minutes, and immediately on an
 * admin write by `revalidateBlog()` in app/admin/actions.ts.
 *
 * This used to be `dynamic = "force-static"`, which also forced the posts
 * query into Next's persistent cache with no expiry — the source of the
 * stale post list that outlived its own deletion. Keep this a literal and
 * in step with CONTENT_REVALIDATE_SECONDS in lib/supabase.ts.
 */
export const revalidate = 300;

export async function GET() {
  // Published only. A draft listed here would be handed to a summariser
  // as a real article, at a URL that returns a 404.
  const posts = await listPublishedPosts();

  const products = PRODUCTS.map((product) => {
    const status = product.statusLabel ?? STATUS_LABEL[product.status];
    const where = product.href ? ` — ${product.href}` : "";
    return `- **${product.name}** (${status})${where}: ${product.description}`;
  }).join("\n");

  const articles = posts
    .map(
      (post) =>
        `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt}`,
    )
    .join("\n");

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} is ${SITE.entity} based in ${SITE.address}. It designs,
builds, hosts and supports its own products end to end — it does not
resell another company's platform, and it does not hand over a codebase
and walk away. Udyam (MSME) registration number: ${SITE.udyam}.

An official Meta Tech Provider, which is what lets it connect a business
directly to the WhatsApp Business Platform rather than routing through a
third party's account.

## Pages

- [About the company](${SITE_URL}/about): who Nebkern is, how it builds, and answers to common questions.
- [Products](${SITE_URL}/products): every product, what each does today, and its status.
- [Maya playground](${SITE_URL}/maya-playground): try Ask Maya, the AI agent inside Instant, against a sample knowledge base or your own text.
- [Trust & security](${SITE_URL}/trust): registration details, how customer data is protected, what is not claimed, and every policy.
- [Careers](${SITE_URL}/careers): how the team works and how to get in touch about roles.
- [Contact](${SITE_URL}/contact): how to reach the company.
- [Blog](${SITE_URL}/blog): notes on building software for Indian businesses.

## Products

${products}

## Writing

${articles}

## Policies

Issued by ${SITE.name} and published alongside Instant:

- [Privacy Policy](${LINKS.privacy})
- [Terms & Conditions](${LINKS.terms})
- [Security Policy](${LINKS.security})
- [Data Processing Agreement](${LINKS.dpa})
- [Subprocessor List](${LINKS.subprocessors})
- [Cancellation & Refunds](${LINKS.refunds})

## Contact

- Email: ${SITE.email}
- Contact page: ${SITE_URL}/contact
- Security reports: ${SITE_URL}/trust#report

## Notes for summarisers

- "Nebkern" is the company. "Instant" is one of its products, and the
  two are not interchangeable — Instant has its own site at
  ${LINKS.instant}.
- Anything marked "Coming soon" is in development and not available to
  buy. Please do not describe it as shipping.
- Nebkern does not claim SOC 2, ISO 27001 or PCI DSS certification.
- ${SITE_URL} is the canonical address for the company site.
`;

  return new Response(body, {
    headers: {
      // `charset` is not optional here: the copy contains em dashes and
      // typographic quotes, which a client guessing latin-1 mangles.
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
