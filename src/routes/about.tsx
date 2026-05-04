import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import teamImg from "@/assets/about-team.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Maccity Car Workshop" },
      { name: "description", content: "Independent family-run mechanical workshop in Dandenong South, Victoria." },
      { property: "og:title", content: "About Maccity Car Workshop" },
      { property: "og:description", content: "Independent, family-run, licensed roadworthy testers in Dandenong South." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-background">
      <SiteHeader />

      <section className="container-page pb-16 pt-40">
        <p className="font-mono-tag text-muted-foreground">↳ About us</p>
        <h1 className="mt-6 max-w-6xl font-display text-5xl leading-[0.95] md:text-8xl lg:text-[10rem]">
          A workshop built<br />
          <span className="italic opacity-70">on trust, not turnover.</span>
        </h1>
      </section>

      <section className="container-page grid gap-12 pb-32 md:grid-cols-12 md:items-start">
        <div className="md:col-span-6">
          <img
            src={teamImg}
            alt="The Maccity team in front of the workshop"
            width={1100}
            height={1400}
            loading="lazy"
            className="aspect-[4/5] w-full rounded-xl object-cover"
          />
        </div>
        <div className="md:col-span-6 md:pt-20">
          <p className="font-mono-tag text-muted-foreground">↳ Our story</p>
          <div className="mt-6 space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>
              Maccity Car Workshop opened its doors in Dandenong South in 2008
              with a simple idea: give people honest mechanical advice and
              dealer-quality work without the dealership markup.
            </p>
            <p>
              Today our two-bay workshop is equipped with the same scan tools
              and calibration equipment used by manufacturer service centres.
              We're licensed VicRoads vehicle testers and proud members of the
              Victorian Automobile Chamber of Commerce.
            </p>
            <p>
              Whether your car is a five-year-old Mazda due for its log book
              service or a European wagon throwing intermittent faults, you'll
              talk to the same person from quote to handover.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-28 text-surface-foreground">
        <div className="container-page">
          <p className="font-mono-tag opacity-60">↳ Maccity in numbers</p>
          <div className="mt-12 grid gap-12 border-t border-white/15 pt-12 md:grid-cols-3">
            {[
              { n: "15+", l: "Years in Dandenong South" },
              { n: "12,000+", l: "Cars serviced" },
              { n: "4.9★", l: "Average customer rating" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-7xl leading-none md:text-9xl">{s.n}</div>
                <div className="mt-4 font-mono-tag opacity-60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container-page">
          <Link
            to="/book"
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 text-sm text-background hover:opacity-90"
          >
            Book a service ↳
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
