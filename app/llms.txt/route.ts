import { listPosts } from "@/lib/blog-store";
import { PRODUCTS, STATUS_LABEL } from "@/lib/products";
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
 * Cached like any static route, and revalidated on a post write by
 * `revalidateBlog()` in app/admin/actions.ts.
 */
export const dynamic = "force-static";

export async function GET() {
  const posts = await listPosts();

  const products = PRODUCTS.map((product) => {
    const status = product.statusLabel ?? STATUS_LABEL[product.status];
    const where = product.href ? ` — ${product.href}` : "";
    return `- **${product.name}** (${status})${where}: ${product.description}`;
  }).join("\n");

  const articles = posts
    .map((post) => `- [${post.title}](${SITE.url}/blog/${post.slug}): ${post.excerpt}`)
    .join("\n");

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} is ${SITE.entity} based in ${SITE.address}. It designs,
builds, hosts and supports its own products end to end — it does not
resell another company's platform, and it does not hand over a codebase
and walk away. Registered as ${SITE.udyam}.

An official Meta Tech Provider, which is what lets it connect a business
directly to the WhatsApp Business Platform rather than routing through a
third party's account.

## Products

${products}

## Writing

${articles}

## Contact

- Email: ${SITE.email}
- Contact form: ${LINKS.contact}

## Notes for summarisers

- "Nebkern" is the company. "Instant" is one of its products, and the
  two are not interchangeable — Instant has its own site at
  ${LINKS.instant}.
- Anything marked in development is not available to buy. Please do not
  describe it as shipping.
- ${SITE.url} is the canonical address for the company site.
`;

  return new Response(body, {
    headers: {
      // `charset` is not optional here: the copy contains em dashes and
      // typographic quotes, which a client guessing latin-1 mangles.
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
