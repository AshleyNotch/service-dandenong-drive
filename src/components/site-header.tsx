import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const nav = [
  { href: "/",         label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about",    label: "About us" },
  { href: "/contact",  label: "Contact" },
  { href: "/#book",    label: "Book a service" },
] as const;

export function SiteHeader({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onDark = variant === "dark";
  const { pathname } = useLocation();
  const isActive = (href: string) => href !== "/#book" && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
          <Link to="/">
            <img src={logo} alt="Maccity" className="h-[52px] w-auto mx-2.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]" />
          </Link>

          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={cn(
              "inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm transition",
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

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer — slides in from the right */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface text-surface-foreground",
          "sm:w-[420px] overflow-y-auto",
          "transition-transform duration-500 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-8 py-6">
          <Link to="/" onClick={() => setOpen(false)}>
            <img src={logo} alt="Maccity" className="h-[42px] w-auto" />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex items-center gap-3 rounded-full bg-surface-foreground px-5 py-2.5 text-sm text-surface transition hover:opacity-80"
          >
            <span>Close</span>
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-8 py-4">
          {nav.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="group flex items-baseline gap-5 border-b border-white/10 py-5 transition"
            >
              <span className="font-mono-tag text-[10px] opacity-40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={cn(
                "font-display text-4xl leading-none transition-colors",
                isActive(n.href) ? "italic text-[#fcbb04]" : "group-hover:text-[#fcbb04]"
              )}>
                {n.label}
              </span>
            </a>
          ))}
        </nav>

        {/* Contact info */}
        <div className="mt-auto space-y-6 border-t border-white/10 px-8 py-8 text-sm text-surface-foreground/70">
          <div>
            <p className="mb-2 font-mono-tag text-[10px] opacity-50">↳ Workshop</p>
            <p className="leading-relaxed">
              1/7 England Street<br />
              Dandenong South, VIC 3175<br />
              Australia
            </p>
          </div>
          <div>
            <p className="mb-2 font-mono-tag text-[10px] opacity-50">↳ Hours</p>
            <p className="leading-relaxed">
              Mon – Fri · 7:30 – 17:30<br />
              Sat · 8:00 – 13:00
            </p>
          </div>
          <div>
            <p className="mb-2 font-mono-tag text-[10px] opacity-50">↳ Contact</p>
            <p className="leading-relaxed">
              +61 0451 676 558<br />
              info@maccity.com.au
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
