import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/about-team.jpg";

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
  { label: "Workshop", value: ["1/7 England Street", "Dandenong South, VIC 3175"] },
  { label: "Phone", value: ["+61 426 899 272"] },
  { label: "Email", value: ["info@maccity.com.au"] },
  { label: "Hours", value: ["Mon–Fri · 7:30 – 17:30", "Sat · 8:00 – 13:00"] },
];

function ContactPage() {
  return (
    <div className="bg-background">
      <SiteHeader variant="dark" />

      <section className="relative min-h-[100svh] overflow-hidden bg-surface text-surface-foreground">
        <img
          src={heroImg}
          alt="The Maccity team"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
        <div className="container-page relative flex min-h-[100svh] flex-col justify-end pb-20 pt-40">
          <p className="font-mono-tag mb-6 text-white/60">↳ Contact</p>
          <h1 className="font-display text-[3.5rem] leading-[0.95] sm:text-7xl md:text-[8rem] lg:text-[10rem]">
            Drop in, call,<br />
            <span className="italic text-[#fcbb04]">or book online.</span>
          </h1>
          <div className="mt-12 max-w-md border-l border-white/40 pl-5 text-sm opacity-90">
            <span className="mr-2 inline-block">↳</span>
            1/7 England Street, Dandenong South · Mon–Fri 7:30–17:30 · Sat 8:00–13:00
          </div>
        </div>
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
          <a
            href="/#book"
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm text-background hover:opacity-90"
          >
            Book a service ↳
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
