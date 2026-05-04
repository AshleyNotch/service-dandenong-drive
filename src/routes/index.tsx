import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Wrench, ClipboardCheck, BookOpen, Gauge } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/hero-workshop.jpg";
import handsImg from "@/assets/mechanic-hands.jpg";
import exteriorImg from "@/assets/workshop-exterior.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dandy Autoworks — Car Service & Roadworthy in Dandenong South" },
      { name: "description", content: "Independent mechanical workshop in Dandenong South offering roadworthy inspections, log book servicing, mechanical repairs and vehicle diagnostics." },
      { property: "og:title", content: "Dandy Autoworks — Car Service & Roadworthy in Dandenong South" },
      { property: "og:description", content: "Honest, dealer-grade car service in Dandenong South. Book online in 60 seconds." },
    ],
  }),
  component: Home,
});

const services = [
  { icon: ClipboardCheck, title: "Roadworthy Inspections", body: "Licensed VicRoads RWC inspections completed on-site, usually same day." },
  { icon: Wrench, title: "Mechanical Repairs", body: "From brakes and suspension to timing belts and clutches — all makes." },
  { icon: BookOpen, title: "Log Book Servicing", body: "Manufacturer-grade servicing that protects your new-car warranty." },
  { icon: Gauge, title: "Vehicle Diagnostics", body: "Modern OBD-II and dealer-level scan tools to find faults fast." },
];

function Home() {
  return (
    <>
      <SiteHeader variant="dark" />

      {/* HERO */}
      <section className="relative min-h-[100svh] bg-surface text-surface-foreground">
        <img
          src={heroImg}
          alt="Mechanic working on a car in a modern Dandenong South workshop"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/30 to-surface" />
        <div className="container-page relative flex min-h-[100svh] flex-col justify-end pb-16 pt-40">
          <p className="mb-6 text-xs uppercase tracking-[0.25em] opacity-70">
            ↳ Dandenong South · Est. 2008
          </p>
          <h1 className="max-w-5xl text-balance text-5xl font-semibold leading-[0.95] sm:text-6xl md:text-7xl lg:text-[7.5rem]">
            Mechanical care, <span className="text-accent">engineered</span> around your car.
          </h1>
          <div className="mt-10 flex flex-col items-start justify-between gap-8 border-t border-white/15 pt-8 md:flex-row md:items-end">
            <p className="max-w-md text-sm opacity-80">
              Roadworthy inspections, log book servicing, mechanical repairs and full
              vehicle diagnostics — delivered by qualified technicians who treat every
              car like their own.
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 text-base font-medium text-accent-foreground transition hover:brightness-95"
            >
              Book a service <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-background py-28">
        <div className="container-page grid gap-12 md:grid-cols-12">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground md:col-span-3">
            Our mission
          </p>
          <h2 className="text-balance text-3xl font-medium leading-tight md:col-span-9 md:text-5xl">
            For over 15 years, Dandy Autoworks has set the standard for{" "}
            <span className="text-muted-foreground">
              independent vehicle servicing in Melbourne's south-east — combining workshop
              craft, modern diagnostics and prices that respect your budget.
            </span>
          </h2>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-background pb-28">
        <div className="container-page">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">What we do</p>
              <h2 className="mt-3 text-4xl font-semibold md:text-5xl">Services</h2>
            </div>
            <Link to="/services" className="hidden text-sm hover:text-accent md:inline-flex">
              All services →
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2">
            {services.map((s) => (
              <div key={s.title} className="group flex flex-col gap-6 bg-card p-8 transition hover:bg-secondary md:p-12">
                <s.icon className="h-8 w-8 text-accent" strokeWidth={1.5} />
                <div>
                  <h3 className="text-2xl font-semibold">{s.title}</h3>
                  <p className="mt-3 max-w-md text-sm text-muted-foreground">{s.body}</p>
                </div>
                <Link to="/book" className="mt-auto inline-flex items-center gap-2 text-sm font-medium opacity-70 transition group-hover:opacity-100">
                  Book this service <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT IMAGE BLOCK */}
      <section className="bg-surface py-28 text-surface-foreground">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <img src={handsImg} alt="Mechanic hands holding a torque wrench" loading="lazy" width={1280} height={1280} className="h-[480px] w-full rounded-2xl object-cover" />
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.25em] opacity-70">The workshop</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight md:text-5xl">
              Built for precision. Run by people who actually love cars.
            </h2>
            <p className="mt-6 max-w-md text-sm opacity-80">
              Two hoists, dealer-grade scan tools, and a team of licensed VicRoads testers.
              We service everything from daily commuters to performance and European marques.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" className="rounded-full border border-white/20 px-5 py-3 text-sm hover:bg-white/10">
                About us
              </Link>
              <Link to="/contact" className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground">
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-background py-28">
        <img src={exteriorImg} alt="" loading="lazy" width={1600} height={1200} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15" />
        <div className="container-page text-center">
          <h2 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-6xl">
            Ready when you are. Pick a slot in 60 seconds.
          </h2>
          <Link
            to="/book"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground hover:opacity-90"
          >
            Book your service <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
