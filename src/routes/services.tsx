import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import roadworthyImg from "@/assets/service-roadworthy.jpg";
import repairsImg from "@/assets/service-repairs.jpg";
import logbookImg from "@/assets/service-logbook.jpg";
import diagnosticsImg from "@/assets/service-diagnostics.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Maccity Car Workshop" },
      { name: "description", content: "Roadworthy inspections, mechanical repairs, log book servicing and vehicle diagnostics in Dandenong South." },
      { property: "og:title", content: "Services — Maccity Car Workshop" },
      { property: "og:description", content: "Everything we do at our Dandenong South workshop." },
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
      <SiteHeader />

      <section className="container-page pb-20 pt-40">
        <p className="font-mono-tag text-muted-foreground">↳ Services</p>
        <h1 className="mt-6 max-w-5xl font-display text-5xl leading-[0.95] md:text-8xl lg:text-[10rem]">
          What we do<br />
          <span className="italic text-[#fcbb04]">under one roof</span>
        </h1>
      </section>

      <section className="container-page pb-32">
        <div className="space-y-24">
          {items.map((it, i) => (
            <article
              key={it.n}
              className={`grid gap-10 md:grid-cols-12 md:items-center ${
                i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="md:col-span-6">
                <img
                  src={it.img}
                  alt={it.title}
                  width={900}
                  height={900}
                  loading="lazy"
                  className="aspect-square w-full rounded-xl object-cover"
                />
              </div>
              <div className="md:col-span-6">
                <p className="font-mono-tag text-muted-foreground">— {it.n}</p>
                <h2 className="mt-4 font-display text-4xl leading-[1.02] md:text-6xl">
                  {it.title}
                </h2>
                <p className="mt-6 max-w-md text-base text-muted-foreground">{it.body}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {it.points.map((p) => (
                    <li key={p} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href="/#book"
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-sm text-background hover:opacity-90"
                >
                  Book this service ↳
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
