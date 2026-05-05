import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import teamImg from "@/assets/about-team.jpg";
import heroImg from "@/assets/mechanic-hands.webp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Mac City — Dandenong South Car Workshop" },
      { name: "description", content: "Meet the team behind Mac City — a family-run workshop in Dandenong South serving Melbourne's south-east since 2008. Licensed VicRoads vehicle testers with dealer-grade equipment and a commitment to honest, transparent service." },
      { property: "og:title", content: "About Us | Mac City — Dandenong South Car Workshop" },
      { property: "og:description", content: "Meet the team behind Mac City — a family-run workshop in Dandenong South serving Melbourne's south-east since 2008. Licensed VicRoads vehicle testers with dealer-grade equipment and a commitment to honest, transparent service." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-background">
      <SiteHeader variant="dark" />

      <section className="relative min-h-[100svh] overflow-hidden bg-surface text-surface-foreground">
        <img
          src={heroImg}
          alt="Mechanic working at Maccity Car Workshop"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />

        <div className="container-page relative flex min-h-[100svh] flex-col justify-end pb-20 pt-40">
          <p className="font-mono-tag mb-6 text-white/60">↳ About us</p>
          <h1 className="font-display text-[3.5rem] leading-[0.95] sm:text-7xl md:text-[8rem] lg:text-[10rem]">
            A workshop built<br />
            <span className="italic text-[#fcbb04]">on trust.</span>
          </h1>
          <div className="mt-12 max-w-md border-l border-white/40 pl-5 text-sm opacity-90">
            <span className="mr-2 inline-block">↳</span>
            Independent, family-run mechanics in Dandenong South since 2008.
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-24 md:grid-cols-12 md:items-start">
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

      <section className="bg-background py-24">
        <div className="container-page">
          <p className="mb-10 font-mono-tag text-muted-foreground">↳ Maccity in numbers</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { n: "15+",     l: "Years serving Dandenong South", desc: "Family-run since 2008 — same faces, same standards." },
              { n: "12,000+", l: "Cars serviced",                  desc: "Every make and model, from daily drivers to European exotics." },
              { n: "4.9★",    l: "Average customer rating",        desc: "Rated across Google and Facebook by our local community." },
            ].map((s) => (
              <div key={s.l} className="flex flex-col justify-between rounded-2xl border border-white/10 p-8 md:p-10">
                <div className="font-display text-6xl leading-none text-[#fcbb04] md:text-7xl">{s.n}</div>
                <div className="mt-8">
                  <div className="text-base font-medium">{s.l}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container-page">
          <a
            href="/#book"
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 text-sm text-background hover:opacity-90"
          >
            Book a service ↳
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
