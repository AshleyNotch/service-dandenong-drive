import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ClipboardCheck, Wrench, BookOpen, Gauge, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Dandy Autoworks Dandenong South" },
      { name: "description", content: "Roadworthy inspections, mechanical repairs, log book servicing and vehicle system diagnostics in Dandenong South." },
      { property: "og:title", content: "Services — Dandy Autoworks" },
      { property: "og:description", content: "Everything we do at our Dandenong South workshop." },
    ],
  }),
  component: ServicesPage,
});

const items = [
  {
    icon: ClipboardCheck,
    title: "Roadworthy Inspections",
    body: "Licensed VicRoads Vehicle Tester. We perform a full RWC inspection covering brakes, steering, suspension, tyres, lights, body and structural condition. Most inspections completed same day.",
    points: ["VicRoads-licensed tester", "Same-day reports", "Re-inspection included within 14 days"],
  },
  {
    icon: Wrench,
    title: "Mechanical Repairs",
    body: "From basic services to complex driveline work. Brakes, suspension, clutches, timing belts, cooling systems, electrical faults and more — for all makes and models.",
    points: ["All makes & models", "Genuine or quality OEM parts", "12-month / 20,000 km warranty"],
  },
  {
    icon: BookOpen,
    title: "Log Book Servicing",
    body: "Manufacturer-grade log book service that maintains your new-car warranty. We follow the manufacturer schedule using approved parts and fluids and stamp your book.",
    points: ["Protects new car warranty", "Approved fluids & filters", "Capped fixed pricing"],
  },
  {
    icon: Gauge,
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
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Services</p>
        <h1 className="mt-4 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] md:text-7xl">
          Everything your car needs, under one roof.
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Four core services, delivered by qualified technicians at our Dandenong South workshop.
        </p>
      </section>

      <section className="container-page pb-28">
        <div className="grid gap-px overflow-hidden rounded-2xl border bg-border">
          {items.map((it) => (
            <div key={it.title} className="grid gap-8 bg-card p-8 md:grid-cols-12 md:p-14">
              <div className="md:col-span-4">
                <it.icon className="h-8 w-8 text-accent" strokeWidth={1.5} />
                <h2 className="mt-6 text-3xl font-semibold md:text-4xl">{it.title}</h2>
              </div>
              <div className="md:col-span-6">
                <p className="text-base text-muted-foreground">{it.body}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {it.points.map((p) => (
                    <li key={p} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-start md:col-span-2 md:justify-end">
                <Link to="/book" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
                  Book <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
