import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Maccity Car Workshop" },
      { name: "description", content: "Call, email or visit our Dandenong South workshop. Open Mon–Sat." },
      { property: "og:title", content: "Contact Maccity Car Workshop" },
      { property: "og:description", content: "Workshop in Dandenong South. Call or book online." },
    ],
  }),
  component: ContactPage,
});

const blocks = [
  { label: "Workshop", value: ["12 Greens Road", "Dandenong South VIC 3175"] },
  { label: "Phone", value: ["(03) 9000 1234"] },
  { label: "Email", value: ["hello@maccity.com.au"] },
  { label: "Hours", value: ["Mon–Fri · 7:30 – 17:30", "Sat · 8:00 – 13:00"] },
];

function ContactPage() {
  return (
    <div className="bg-background">
      <SiteHeader />

      <section className="container-page pb-16 pt-40">
        <p className="font-mono-tag text-muted-foreground">↳ Contact</p>
        <h1 className="mt-6 max-w-5xl font-display text-5xl leading-[0.95] md:text-8xl lg:text-[10rem]">
          Drop in, call,<br />
          <span className="italic opacity-70">or book online.</span>
        </h1>
      </section>

      <section className="container-page pb-32">
        <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2">
          {blocks.map((b) => (
            <div key={b.label} className="bg-card p-10 md:p-14">
              <p className="font-mono-tag text-muted-foreground">↳ {b.label}</p>
              <div className="mt-4 font-display text-2xl leading-snug md:text-3xl">
                {b.value.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            to="/book"
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm text-background hover:opacity-90"
          >
            Book a service ↳
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
