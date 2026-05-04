import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/hero-workshop.jpg";
import roadworthyImg from "@/assets/service-roadworthy.jpg";
import repairsImg from "@/assets/service-repairs.jpg";
import logbookImg from "@/assets/service-logbook.jpg";
import diagnosticsImg from "@/assets/service-diagnostics.jpg";
import teamImg from "@/assets/about-team.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maccity Car Workshop — Dandenong South" },
      { name: "description", content: "Independent car workshop in Dandenong South: roadworthy inspections, mechanical repairs, log book servicing and vehicle diagnostics." },
      { property: "og:title", content: "Maccity Car Workshop — Dandenong South" },
      { property: "og:description", content: "Honest, dealer-grade car service in Dandenong South. Book online in 60 seconds." },
    ],
  }),
  component: Home,
});

const services = [
  { title: "Roadworthy Inspections", img: roadworthyImg, slug: "roadworthy" },
  { title: "Mechanical Repairs", img: repairsImg, slug: "repairs" },
  { title: "Log Book Servicing", img: logbookImg, slug: "logbook" },
  { title: "Vehicle Diagnostics", img: diagnosticsImg, slug: "diagnostics" },
];

function Home() {
  return (
    <>
      <SiteHeader variant="dark" />

      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden bg-surface text-surface-foreground">
        <img
          src={heroImg}
          alt="Maccity Car Workshop street view in Dandenong South"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />

        <div className="container-page relative flex min-h-[100svh] flex-col justify-end pb-20 pt-40">
          <h1 className="font-display text-[3.5rem] leading-[0.95] sm:text-7xl md:text-[8rem] lg:text-[10rem]">
            Honest<br />
            <span className="italic">Car Care</span>
          </h1>

          <div className="mt-12 max-w-md border-l border-white/40 pl-5 text-sm opacity-90">
            <span className="mr-2 inline-block">↳</span>
            For over 15 years, Maccity Car Workshop has set the standard for
            independent vehicle servicing in Dandenong South.
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-surface py-32 text-surface-foreground">
        <div className="container-page grid gap-16 md:grid-cols-2 md:items-end">
          {/* left — mission text */}
          <div>
            <h2 className="font-display text-4xl leading-[1.05] md:text-5xl lg:text-6xl">
              Our mission is to keep Melbourne's south-east moving — with{" "}
              <span className="italic opacity-70">dealer-grade workmanship</span>,{" "}
              modern diagnostics and prices that respect your budget.
            </h2>
            <div className="mt-12">
              <Link
                to="/about"
                className="inline-flex items-center gap-3 rounded-full bg-surface-foreground px-7 py-3.5 text-sm text-surface hover:opacity-90"
              >
                About us ↳
              </Link>
            </div>
          </div>

          {/* right — service links */}
          <div className="divide-y divide-surface-foreground/20 border-t border-surface-foreground/20">
            {services.map((s) => (
              <Link
                key={s.slug}
                to="/services"
                className="group flex items-center justify-between py-5 text-base transition-opacity hover:opacity-70"
              >
                <span>{s.title}</span>
                <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES — image cards row */}
      <section className="bg-background pb-24">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {services.map((s) => (
              <Link
                key={s.slug}
                to="/services"
                className="group block"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={s.img}
                    alt={s.title}
                    width={900}
                    height={900}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 font-display text-xl leading-tight md:text-2xl">
                  {s.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT BLOCK */}
      <section className="bg-background py-24">
        <div className="container-page grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <img
              src={teamImg}
              alt="The Maccity team"
              width={1100}
              height={1400}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
          </div>
          <div className="md:col-span-7">
            <h2 className="font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl">
              Trusted Local<br />
              <span className="italic opacity-70">Mechanics Since 2008</span>
            </h2>
            <p className="mt-8 max-w-lg text-base text-muted-foreground">
              Two-bay workshop, dealer-level scan tools and licensed VicRoads
              testers. From a Corolla due for its log book service to a European
              wagon throwing intermittent faults — you'll talk to the same
              person from quote to handover.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background pb-32 pt-12">
        <div className="container-page">
          <div className="rounded-2xl bg-surface p-10 text-surface-foreground md:p-20">
            <p className="font-mono-tag opacity-60">↳ Ready when you are</p>
            <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.02] md:text-7xl">
              Pick a slot in 60 seconds.
            </h2>
            <Link
              to="/book"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-surface-foreground px-7 py-3.5 text-sm text-surface hover:opacity-90"
            >
              Book a service ↳
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
