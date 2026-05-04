import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import exteriorImg from "@/assets/workshop-exterior.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Dandy Autoworks" },
      { name: "description", content: "Independent family-run mechanical workshop in Dandenong South, Victoria." },
      { property: "og:title", content: "About Dandy Autoworks" },
      { property: "og:description", content: "Independent, family-run, licensed roadworthy testers in Dandenong South." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-background">
      <SiteHeader />
      <section className="container-page pb-20 pt-40">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">About</p>
        <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold leading-[1.05] md:text-7xl">
          A workshop built on trust, not turnover.
        </h1>
      </section>

      <section className="container-page grid gap-12 pb-28 md:grid-cols-2">
        <img src={exteriorImg} alt="Dandy Autoworks workshop exterior" loading="lazy" width={1600} height={1200} className="h-[520px] w-full rounded-2xl object-cover" />
        <div className="flex flex-col justify-center gap-6 text-base text-muted-foreground">
          <p>
            Dandy Autoworks opened its doors in Dandenong South in 2008 with a simple
            idea: give people honest mechanical advice and dealer-quality work without
            the dealership markup.
          </p>
          <p>
            Today our two-bay workshop is equipped with the same scan tools and
            calibration equipment used by manufacturer service centres. We're licensed
            VicRoads vehicle testers and proud members of the Victorian Automobile
            Chamber of Commerce.
          </p>
          <p>
            Whether your car is a five-year-old Mazda due for its log book service or a
            European wagon throwing intermittent faults, you'll talk to the same person
            from quote to handover.
          </p>
        </div>
      </section>

      <section className="bg-surface py-28 text-surface-foreground">
        <div className="container-page grid gap-12 md:grid-cols-3">
          {[
            { n: "15+", l: "Years in Dandenong South" },
            { n: "12,000+", l: "Cars serviced" },
            { n: "4.9★", l: "Average customer rating" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-6xl font-semibold text-accent">{s.n}</div>
              <div className="mt-3 text-sm opacity-70">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
