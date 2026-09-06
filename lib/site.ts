/**
 * Company facts, in one place.
 *
 * Every value here is transcribed from the legal pages already
 * published on instant.nebkern.com, which are the documents Razorpay's
 * merchant review and Meta's Tech Provider review actually read. If a
 * fact changes it changes there first, then here — a company site that
 * disagrees with its own Terms page is worse than one that says less.
 */
export const SITE = {
  name: "Nebkern Technology",
  shortName: "Nebkern",
  /** How the business is constituted. Named because "Nebkern
   *  Technology" alone does not tell a buyer which legal person they
   *  would be contracting with. */
  entity: "a sole proprietorship",
  tagline: "We build the software Indian businesses run on.",
  description:
    "Nebkern Technology is a software company in Siliguri, West Bengal. We design, build, host and support our own products end to end — including Instant, sales and support on the official WhatsApp Business API.",

  city: "Siliguri",
  address: "Siliguri, West Bengal, India",
  country: "India",

  /**
   * A role address, not a personal one — and today the only monitored
   * one, which is why it is still product-scoped. Worth moving to a
   * company-level address (contact@nebkern.com) once that inbox exists;
   * change it here and the footer, contact card and JSON-LD all follow.
   */
  email: "contact@instant.nebkern.com",

  /** As issued. Shown verbatim so it can be checked character for
   *  character against the Udyam portal. */
  udyam: "UDYAM-WB-06-0069607",

  url: "https://nebkern.com",
} as const;

/** Outbound destinations. Instant owns its own marketing site, so this
 *  site links into it rather than restating it. */
export const LINKS = {
  instant: "https://instant.nebkern.com",
  instantPricing: "https://instant.nebkern.com/pricing",
  instantSignup: "https://instant.nebkern.com/signup",
  instantLogin: "https://instant.nebkern.com/login",
  askMaya: "https://instant.nebkern.com/ask-maya",
  blog: "https://instant.nebkern.com/blog",
  contact: "https://instant.nebkern.com/contact",
  privacy: "https://instant.nebkern.com/privacy",
  terms: "https://instant.nebkern.com/terms",
  security: "https://instant.nebkern.com/security",
  dpa: "https://instant.nebkern.com/dpa",
  subprocessors: "https://instant.nebkern.com/subprocessors",
  refunds: "https://instant.nebkern.com/refunds",
} as const;
