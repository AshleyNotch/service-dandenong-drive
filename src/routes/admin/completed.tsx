import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Booking } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { Search, X, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/admin/completed")({
  component: CompletedPage,
});

const SERVICES = ["Roadworthy Inspections", "Mechanical Repairs", "Log Book Servicing", "Vehicle Diagnostics"];

function CompletedPage() {
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [serviceFilter, setService] = useState("all");
  const [selected, setSelected]     = useState<Booking | null>(null);

  useEffect(() => {
    supabase.from("bookings").select("*")
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .then(({ data }) => { setBookings(data ?? []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => bookings.filter(b => {
    if (serviceFilter !== "all" && !b.services.includes(serviceFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![b.name, b.email, b.phone, b.make, b.model].some(v => v?.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [bookings, serviceFilter, search]);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.cost ?? 0), 0);

  if (loading) return <PageLoader />;

  return (
    <div className="flex h-screen flex-col overflow-hidden">

      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-8 py-6">
        <h1 className="font-display text-4xl">Completed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {bookings.length} services completed
        </p>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="font-display text-3xl text-purple-400">{bookings.length}</p>
            <p className="mt-0.5 font-mono-tag text-[10px] text-muted-foreground">Total completed</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="font-display text-3xl text-[#fcbb04]">${totalRevenue.toFixed(0)}</p>
            <p className="mt-0.5 font-mono-tag text-[10px] text-muted-foreground">Total revenue</p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone, vehicle…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition" />
        </div>

        {/* Service filter */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
          {["all", ...SERVICES].map(s => (
            <button key={s} onClick={() => setService(s)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 font-mono-tag text-[10px] uppercase tracking-wide transition",
                serviceFilter === s ? "bg-[#fcbb04] text-black" : "border border-white/10 text-muted-foreground hover:border-white/30"
              )}>
              {s === "all" ? "All services" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* List */}
        <div className={cn("flex flex-col overflow-y-auto divide-y divide-white/5", selected ? "w-[55%]" : "flex-1")}>
          {filtered.map(b => (
            <button key={b.id} onClick={() => setSelected(s => s?.id === b.id ? null : b)}
              className={cn(
                "w-full border-l-2 border-l-purple-400 px-6 py-4 text-left transition hover:bg-white/[0.03]",
                selected?.id === b.id && "bg-white/[0.05]"
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{b.name}</span>
                    {b.services.slice(0, 2).map(s => (
                      <span key={s} className="rounded-full border border-white/10 px-2 py-0.5 font-mono-tag text-[9px] uppercase tracking-wide text-muted-foreground">
                        {s.split(" ")[0]}
                      </span>
                    ))}
                    <span className="rounded-full bg-purple-400/15 px-2 py-0.5 font-mono-tag text-[9px] uppercase tracking-wide text-purple-400">
                      completed
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{b.email}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{b.year} {b.make} {b.model}</p>
                </div>
                <div className="shrink-0 text-right">
                  {b.cost != null && (
                    <p className="text-sm font-semibold text-[#fcbb04]">${b.cost.toFixed(2)}</p>
                  )}
                  <p className="mt-0.5 font-mono-tag text-[10px] text-muted-foreground">
                    {b.completed_at
                      ? new Date(b.completed_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })
                      : new Date(b.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-20 text-sm text-muted-foreground">
              No completed services yet
            </div>
          )}
        </div>

        {/* Side panel */}
        {selected && (
          <div className="flex w-[45%] flex-col overflow-y-auto border-l border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <span className="rounded-full bg-purple-400/15 px-3 py-1 font-mono-tag text-xs uppercase tracking-wide text-purple-400">
                Completed
              </span>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-6 p-6">
              {/* Completion summary */}
              <div className="rounded-xl border border-purple-400/20 bg-purple-400/5 p-4 space-y-2">
                <p className="font-mono-tag text-[10px] uppercase tracking-widest text-purple-400">Service Summary</p>
                {selected.completed_at && (
                  <p className="text-sm">
                    Completed {new Date(selected.completed_at).toLocaleString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
                {selected.cost != null && (
                  <p className="font-display text-3xl text-[#fcbb04]">${selected.cost.toFixed(2)}</p>
                )}
                {selected.completion_notes && (
                  <p className="text-sm text-muted-foreground">{selected.completion_notes}</p>
                )}
              </div>

              {/* Appointment */}
              <div>
                <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Appointment</p>
                <p className="text-sm">
                  {new Date(selected.date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {selected.time}
                </p>
              </div>

              {/* Contact */}
              <div>
                <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Client</p>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{selected.name}</p>
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-[#fcbb04] transition">
                    <Mail size={13} />{selected.email}
                  </a>
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-[#fcbb04] transition">
                    <Phone size={13} />{selected.phone}
                  </a>
                </div>
              </div>

              {/* Vehicle */}
              <div>
                <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Vehicle</p>
                <div className="space-y-1.5 text-sm">
                  {[
                    ["Make", selected.make],
                    ["Model", selected.model],
                    ["Year", selected.year],
                    ...(selected.odometer ? [["Odometer", `${Number(selected.odometer).toLocaleString()} km`]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.services.map(s => (
                    <span key={s} className="rounded-full border border-white/10 px-3 py-1 text-xs">{s}</span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div>
                  <p className="mb-2 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Client Notes</p>
                  <p className="text-sm text-muted-foreground">{selected.notes}</p>
                </div>
              )}

              {selected.admin_notes && (
                <div className="pb-4">
                  <p className="mb-2 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Admin Notes</p>
                  <p className="text-sm text-muted-foreground">{selected.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#fcbb04]" />
    </div>
  );
}
