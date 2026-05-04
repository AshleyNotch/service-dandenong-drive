import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Dandy Autoworks Dandenong South" },
      { name: "description", content: "Call, email or visit our Dandenong South workshop. Open Mon–Sat." },
      { property: "og:title", content: "Contact Dandy Autoworks" },
      { property: "og:description", content: "Workshop in Dandenong South. Call or book online." },
    ],
  }),
  component: ContactPage,
});

const blocks = [
  { icon: MapPin, label: "Workshop", value: "12 Greens Road, Dandenong South VIC 3175" },
  { icon: Phone, label: "Phone", value: "(03) 9000 1234" },
  { icon: Mail, label: "Email", value: "service@dandyautoworks.com.au" },
  { icon: Clock, label: "Hours", value: "Mon–Fri 7:30–17:30 · Sat 8:00–13:00" },
];

function ContactPage() {
  return (
    <div className="bg-background">
      <SiteHeader />
      <section className="container-page pb-20 pt-40">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Contact</p>
        <h1 className="mt-4 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] md:text-7xl">
          Drop in, call, or book online.
        </h1>
      </section>

      <section className="container-page pb-28">
        <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2">
          {blocks.map((b) => (
            <div key={b.label} className="bg-card p-8 md:p-12">
              <b.icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
              <div className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {b.label}
              </div>
              <div className="mt-2 text-xl font-medium">{b.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/book" className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-medium text-accent-foreground">
            Book a service <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
