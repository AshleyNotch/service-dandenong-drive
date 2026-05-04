import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-surface text-surface-foreground">
      <div className="container-page grid gap-12 py-20 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-semibold tracking-tight">
            DANDY AUTOWORKS
          </div>
          <p className="mt-4 max-w-sm text-sm opacity-70">
            Independent mechanical workshop in Dandenong South. Honest diagnostics,
            licensed roadworthy inspections and dealer-grade log book servicing.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium opacity-60">Workshop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>12 Greens Road</li>
            <li>Dandenong South VIC 3175</li>
            <li>Mon – Fri · 7:30 – 17:30</li>
            <li>Sat · 8:00 – 13:00</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium opacity-60">Site</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-accent">Services</Link></li>
            <li><Link to="/about" className="hover:text-accent">About</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            <li><Link to="/book" className="hover:text-accent">Book a service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs opacity-60 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Dandy Autoworks. Licensed Vehicle Tester (VIC).</span>
          <span>Dandenong South · Victoria · Australia</span>
        </div>
      </div>
    </footer>
  );
}
