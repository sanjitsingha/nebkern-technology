import Image from "next/image";

/**
 * The credentials band: brand marks on the dark panel, scrolling.
 *
 * What is in it has to be TRUE. These two are claims the site already
 * makes in words elsewhere — Meta Tech Provider on the homepage and in
 * llms.txt, the Udyam number in the footer and on /trust — so the band
 * is showing the marks behind statements that are already made, not
 * implying relationships that do not exist. Client logos belong here
 * too, once there are clients happy to be named: add them to `BRANDS`
 * and the marquee lengthens on its own.
 *
 * Both files are served from the media host the product lockups already
 * use, which is why next.config's optimizer allowlist needs no change.
 */
type Brand = {
  name: string;
  /** What the mark is evidence OF. Read out to screen readers in place
   *  of the picture, since "Meta" alone says nothing about why it is on
   *  this page. */
  note: string;
  src: string;
  width: number;
  height: number;
};

const BRANDS: Brand[] = [
  {
    name: "Meta",
    note: "Official Meta Tech Provider",
    src: "https://media.instant.nebkern.com/assets/meta-logo.png",
    width: 4096,
    height: 825,
  },
  {
    name: "Udyam MSME",
    note: "Udyam-registered MSME, Government of India",
    src: "https://media.instant.nebkern.com/assets/msme-logo.png",
    width: 600,
    height: 276,
  },
];

/**
 * How many marks the moving track needs before it can loop without a
 * gap crossing the band.
 *
 * Two logos are a few hundred pixels; a wide screen is two thousand. So
 * the list is repeated until it is long enough to cover one, and THAT
 * run is then rendered twice — the animation slides the track exactly
 * half its own width, which lands the second run where the first began.
 */
const MIN_RUN = 8;

const RUN = Array.from(
  { length: Math.ceil(MIN_RUN / BRANDS.length) },
  () => BRANDS,
).flat();

/** `brightness-0` crushes the artwork to black, `invert` flips it to
 *  white — one pair of filters that whitens any opaque mark without
 *  needing a separate reversed file per brand. */
const WHITE_OUT = "brightness-0 invert";

function Mark({ brand }: { brand: Brand }) {
  return (
    <Image
      src={brand.src}
      alt=""
      width={brand.width}
      height={brand.height}
      // Height is what is set; width follows the file's own ratio, so a
      // 5:1 wordmark and a 2:1 badge still read as the same weight.
      className={`h-7 w-auto shrink-0 opacity-80 sm:h-8 ${WHITE_OUT}`}
    />
  );
}

export function BrandBand() {
  return (
    <section aria-labelledby="credentials-heading" className="bg-panel">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <h2
          id="credentials-heading"
          className="text-center text-[0.9375rem] leading-relaxed text-panel-muted text-balance"
        >
          An official Meta Tech Provider, and a Udyam-registered MSME.
        </h2>

        {/* The marks are decoration here — the band's meaning is in the
            line above and in the list below, each said once. Without
            this the repeated run would be read out eight times. */}
        <ul className="sr-only">
          {BRANDS.map((brand) => (
            <li key={brand.name}>{brand.note}</li>
          ))}
        </ul>

        {/* The moving version. `mask-image` fades both ends so marks
            enter and leave instead of being cut off at a hard edge, and
            hovering stops it — a logo sliding out from under the pointer
            is the usual complaint about a marquee. */}
        <div
          aria-hidden="true"
          className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] motion-reduce:hidden"
        >
          <div className="flex w-max animate-marquee items-center gap-14 hover:[animation-play-state:paused] sm:gap-20">
            {[0, 1].map((copy) =>
              RUN.map((brand, i) => (
                <Mark key={`${copy}-${brand.name}-${i}`} brand={brand} />
              )),
            )}
          </div>
        </div>

        {/* And the still one. Reduced motion is the setting this band
            would look worst under: the animation stops, but the repeated
            run stays, so the reader gets the same two marks four times
            across. This shows each mark once instead. */}
        <div
          aria-hidden="true"
          className="mt-10 hidden flex-wrap items-center justify-center gap-14 motion-reduce:flex sm:gap-20"
        >
          {BRANDS.map((brand) => (
            <Mark key={brand.name} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
