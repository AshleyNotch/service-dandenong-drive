import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About us" },
  { to: "/contact", label: "Contact" },
  { to: "/book", label: "Book a service" },
] as const;

export function SiteHeader({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onDark = variant === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-black/40 backdrop-blur-md text-surface-foreground"
            : onDark
              ? "bg-gradient-to-b from-black/50 to-transparent text-surface-foreground"
              : "bg-background/90 backdrop-blur-sm text-foreground"
        )}
      >
        <div className="container-page flex items-center justify-between py-5">
          <Link
            to="/"
          >
            <img src={logo} alt="Maccity" className="h-10 w-auto mx-2.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]" />
          </Link>

          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={cn(
              "group inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm transition",
              onDark
                ? "bg-surface-foreground text-surface hover:bg-surface-foreground/90"
                : "bg-foreground text-background hover:bg-foreground/90"
            )}
          >
            <span>Menu</span>
            <span className="flex flex-col gap-[3px]">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
            </span>
          </button>
        </div>
      </header>

      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-50 bg-surface text-surface-foreground transition-transform duration-500 ease-in",
          open ? "translate-y-0" : "-translate-y-full pointer-events-none"
        )}
      >
        <div className="container-page flex items-center justify-between py-7">
          <Link
            to="/"
            onClick={() => setOpen(false)}
          >
            <img src={logo} alt="Maccity" className="h-20 w-auto" />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-3 rounded-full bg-background px-5 py-2.5 text-sm text-foreground"
          >
            <span>Close</span>
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="container-page mt-16 grid gap-12 md:grid-cols-12">
          <nav className="flex flex-col gap-2 md:col-span-8">
            {nav.map((n, i) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="group flex items-baseline gap-6 border-b border-background/15 py-5 transition hover:opacity-80"
              >
                <span className="font-mono-tag opacity-50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-5xl leading-none md:text-7xl">
                  {n.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="md:col-span-4">
            <p className="font-mono-tag opacity-50">↳ Workshop</p>
            <p className="mt-4 text-sm leading-relaxed opacity-90">
              1/7 England Street<br />
              Dandenong South, VIC 3175<br />
              Australia
            </p>
            <p className="mt-8 font-mono-tag opacity-50">↳ Hours</p>
            <p className="mt-4 text-sm leading-relaxed opacity-90">
              Mon – Fri · 7:30 – 17:30<br />
              Sat · 8:00 – 13:00
            </p>
            <p className="mt-8 font-mono-tag opacity-50">↳ Contact</p>
            <p className="mt-4 text-sm leading-relaxed opacity-90">
              +61 426 899 272<br />
              info@maccity.com.au
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
