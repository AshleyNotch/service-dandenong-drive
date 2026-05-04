import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const onDark = variant === "dark";

  return (
    <header
      className={`absolute inset-x-0 top-0 z-40 ${onDark ? "text-surface-foreground" : "text-foreground"}`}
    >
      <div className="container-page flex items-center justify-between py-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          DANDY AUTOWORKS
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="opacity-80 transition hover:opacity-100"
              activeProps={{ className: "opacity-100 font-medium" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:brightness-95"
          >
            Book service →
          </Link>
        </div>

        <button
          aria-label="Menu"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/30 bg-background text-foreground md:hidden">
          <div className="container-page flex flex-col gap-4 py-6">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-base">
                {n.label}
              </Link>
            ))}
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
            >
              Book service →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
