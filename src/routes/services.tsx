import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/workshop-exterior.jpg";
import roadworthyImg from "@/assets/service-roadworthy.jpg";
import repairsImg from "@/assets/service-repairs.jpg";
import logbookImg from "@/assets/service-logbook.jpg";
import diagnosticsImg from "@/assets/service-diagnostics.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Our Services | Mac City — Dandenong South Car Workshop" },
      { name: "description", content: "From roadworthy inspections and log book servicing to mechanical repairs and vehicle diagnostics — Mac City handles it all under one roof in Dandenong South. All makes and models welcome. Transparent pricing, same-day results." },
      { property: "og:title", content: "Our Services | Mac City — Dandenong South Car Workshop" },
      { property: "og:description", content: "From roadworthy inspections and log book servicing to mechanical repairs and vehicle diagnostics — Mac City handles it all under one roof in Dandenong South. All makes and models welcome. Transparent pricing, same-day results." },
    ],
  }),
  component: ServicesPage,
});

const items = [
  {
    n: "01",
    img: roadworthyImg,
    title: "Roadworthy Inspections",
    body: "Licensed VicRoads Vehicle Tester. Full RWC inspection covering brakes, steering, suspension, tyres, lights, body and structural condition. Most inspections completed same day.",
    points: ["VicRoads-licensed tester", "Same-day reports", "Re-inspection within 14 days"],
  },
  {
    n: "02",
    img: repairsImg,
    title: "Mechanical Repairs",
    body: "From basic services to complex driveline work. Brakes, suspension, clutches, timing belts, cooling systems, electrical faults — for all makes and models.",
    points: ["All makes & models", "Genuine or quality OEM parts", "12-month / 20,000 km warranty"],
  },
  {
    n: "03",
    img: logbookImg,
    title: "Log Book Servicing",
    body: "Manufacturer-grade log book servicing that protects your new-car warranty. We follow the manufacturer schedule using approved parts and fluids — and stamp your book.",
    points: ["Protects new-car warranty", "Approved fluids & filters", "Capped fixed pricing"],
  },
  {
    n: "04",
    img: diagnosticsImg,
    title: "Vehicle System Diagnostics",
    body: "Check engine light? Intermittent fault? Our dealer-level scan tools read every module — engine, ABS, airbag, transmission, body — to find the real cause, not just the symptom.",
    points: ["OBD-II + manufacturer protocols", "Live data analysis", "Clear written diagnosis"],
  },
];

function ServicesPage() {
  return (
    <div className="bg-background">
      <SiteHeader variant="dark" />

      <section className="relative min-h-[100svh] overflow-hidden bg-surface text-surface-foreground">
        <img
          src={heroImg}
          alt="Maccity Car Workshop exterior"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
        <div className="container-page relative flex min-h-[100svh] flex-col justify-end pb-20 pt-40">
          <p className="font-mono-tag mb-6 text-white/60">↳ Services</p>
          <h1 className="font-display text-[3.5rem] leading-[0.95] sm:text-7xl md:text-[8rem] lg:text-[10rem]">
            What we do<br />
            <span className="italic text-[#fcbb04]">under one roof</span>
          </h1>
          <div className="mt-12 max-w-md border-l border-white/40 pl-5 text-sm opacity-90">
            <span className="mr-2 inline-block">↳</span>
            Roadworthy inspections, mechanical repairs, log book servicing and vehicle diagnostics — all in Dandenong South.
          </div>
        </div>
      </section>

      <section className="container-page py-24">
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((it) => (
            <article key={it.n} className="group relative overflow-hidden rounded-2xl">
              <img
                src={it.img}
                alt={it.title}
                width={900}
                height={900}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <span className="font-mono-tag text-white/40">{it.n}</span>
                <div>
                  <h2 className="font-display text-3xl leading-tight text-white md:text-4xl">
                    {it.title}
                  </h2>
                  <p className="mt-3 line-clamp-2 text-sm text-white/60">{it.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {it.points.map((p) => (
                      <span key={p} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60">
                        {p}
                      </span>
                    ))}
                  </div>
                  <a
                    href="/#book"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#fcbb04] px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Book this service ↳
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
