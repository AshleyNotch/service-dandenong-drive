import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="bg-surface text-surface-foreground">
      <div className="container-page py-24">
        <img src={logo} alt="Maccity" className="w-auto" style={{ height: "58px" }} />

        <div className="mt-20 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-mono-tag opacity-50">↳ Workshop</p>
            <p className="mt-4 text-sm leading-relaxed opacity-90">
              1/7 England Street<br />
              Dandenong South, VIC 3175<br />
              Australia
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="font-mono-tag opacity-50">↳ Hours</p>
            <p className="mt-4 text-sm leading-relaxed opacity-90">
              Monday – Friday · 7:30 – 17:30<br />
              Saturday · 8:00 – 13:00<br />
              Sunday · Closed
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="font-mono-tag opacity-50">↳ Get in touch</p>
            <p className="mt-4 text-sm leading-relaxed opacity-90">
              +61 0451 676 558<br />
              info@maccity.com.au
            </p>
            <a
              href="/#book"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-foreground px-5 py-2.5 text-sm text-surface hover:opacity-90"
            >
              Book a service ↳
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-6">
          <h2 className="font-display text-5xl leading-none md:text-7xl lg:text-8xl">
            Maccity <span className="italic text-[#fcbb04]">Car Workshop</span>
          </h2>
          <div className="mt-6 flex flex-col items-start justify-between gap-3 font-mono-tag opacity-60 md:flex-row md:items-center">
            <span>© {new Date().getFullYear()} Maccity Car Workshop · Licensed Vehicle Tester (VIC)</span>
            <span>Dandenong South · Victoria · Australia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
