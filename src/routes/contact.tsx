import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TestimonialsSection, contactReviews } from "@/components/testimonials-section";
import { BookingWidget } from "@/components/booking-widget";
import { GetAQuoteSection } from "@/components/quote-modal";
import heroImg from "@/assets/contact-hero.webp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Mac City — Dandenong South Car Workshop" },
      { name: "description", content: "Visit Mac City at 1/7 England Street, Dandenong South. Open Monday to Friday 7:30am–5:30pm and Saturday 8am–1pm. Call +61 426 899 272, email info@maccity.com.au or book your service online." },
      { property: "og:title", content: "Contact Us | Mac City — Dandenong South Car Workshop" },
      { property: "og:description", content: "Visit Mac City at 1/7 England Street, Dandenong South. Open Monday to Friday 7:30am–5:30pm and Saturday 8am–1pm. Call +61 426 899 272, email info@maccity.com.au or book your service online." },
    ],
  }),
  component: ContactPage,
});

const details = [
  {
    icon: <MapPin size={18} />,
    label: "Workshop",
    lines: ["1/7 England Street", "Dandenong South, VIC 3175"],
  },
  {
    icon: <Phone size={18} />,
    label: "Phone",
    lines: ["+61 426 899 272"],
  },
  {
    icon: <Mail size={18} />,
    label: "Email",
    lines: ["info@maccity.com.au"],
  },
  {
    icon: <Clock size={18} />,
    label: "Hours",
    lines: ["Mon – Fri · 7:30 – 17:30", "Saturday · 8:00 – 13:00", "Sunday · Closed"],
  },
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
          <h1 className="font-display text-[3.5rem] leading-[0.95] sm:text-7xl md:text-[6.5rem] lg:text-[7rem]">
            Drop in, call,<br />
            <span className="italic text-[#fcbb04]">or book online.</span>
          </h1>
          <div className="mt-12 max-w-md border-l border-white/40 pl-5 text-sm opacity-90">
            <span className="mr-2 inline-block">↳</span>
            1/7 England Street, Dandenong South · Mon–Fri 7:30–17:30 · Sat 8:00–13:00
          </div>
        </div>
      </section>

      <section className="container-page py-24">
        <div className="grid gap-10 md:grid-cols-12 md:items-stretch">

          {/* Contact details */}
          <div className="flex flex-col justify-between gap-6 md:col-span-5">
            {details.map((d) => (
              <div key={d.label} className="flex items-start gap-4 rounded-2xl border border-white/10 p-7">
                <span className="mt-0.5 shrink-0 text-[#fcbb04]">{d.icon}</span>
                <div>
                  <p className="font-mono-tag text-xs text-muted-foreground">{d.label}</p>
                  {d.lines.map((line) => (
                    <p key={line} className="mt-1 text-sm leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            <a
              href="/#book"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fcbb04] px-6 py-3.5 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Book a service ↳
            </a>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-2xl md:col-span-7">
            <iframe
              title="Maccity Car Workshop location"
              src="https://maps.google.com/maps?q=1+England+Street+Dandenong+South+VIC+3175&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "480px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </section>

      <section id="book" className="bg-background py-24">
        <div className="container-page">
          <p className="font-mono-tag text-muted-foreground">↳ Ready when you are</p>
          <h2 className="mt-4 mb-10 font-display text-4xl leading-[1.02] md:text-6xl">
            Book a service — <span className="italic text-[#fcbb04]">in 60 seconds.</span>
          </h2>
          <BookingWidget />
        </div>
      </section>

      <GetAQuoteSection />

      <TestimonialsSection reviews={contactReviews} />
      <SiteFooter />
    </div>
  );
}
