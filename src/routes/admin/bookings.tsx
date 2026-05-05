import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Booking, BookingStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];

const STATUS_COLOURS: Record<BookingStatus, string> = {
  pending:   "bg-yellow-400/10 text-yellow-400",
  confirmed: "bg-green-400/10 text-green-400",
  cancelled: "bg-red-400/10 text-red-400",
};

function BookingsPage() {
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<BookingStatus | "all">("all");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [updating, setUpdating]     = useState<string | null>(null);

  useEffect(() => {
    supabase.from("bookings").select("*").order("date", { ascending: false })
      .then(({ data }) => { setBookings(data ?? []); setLoading(false); });
  }, []);

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdating(id);
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setUpdating(null);
  }

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <PageLoader />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono-tag text-xs text-muted-foreground">↳ All appointments</p>
          <h1 className="mt-1 font-display text-4xl">Bookings</h1>
        </div>
        {/* Filter */}
        <div className="flex gap-2">
          {(["all", ...STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-4 py-1.5 font-mono-tag text-xs capitalize transition",
                filter === s
                  ? "bg-[#fcbb04] text-black"
                  : "border border-white/10 text-muted-foreground hover:border-white/30"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-white/[0.02]">
            <tr>
              {["Date & Time", "Client", "Vehicle", "Services", "Status", "Action"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(b => (
              <>
                <tr
                  key={b.id}
                  className="cursor-pointer hover:bg-white/[0.02]"
                  onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{new Date(b.date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</p>
                    <p className="text-xs text-muted-foreground">{b.time}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{b.year} {b.make} {b.model}</td>
                  <td className="px-5 py-3.5 text-muted-foreground max-w-[180px]">
                    <p className="truncate">{b.services.join(", ")}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("rounded-full px-2.5 py-0.5 font-mono-tag text-[10px] capitalize", STATUS_COLOURS[b.status])}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", expanded === b.id && "rotate-180")} />
                  </td>
                </tr>
                {expanded === b.id && (
                  <tr key={`${b.id}-exp`} className="bg-white/[0.015]">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                          <p className="font-mono-tag text-[10px] text-muted-foreground">Email</p>
                          <p>{b.email}</p>
                          {b.odometer && (
                            <>
                              <p className="mt-3 font-mono-tag text-[10px] text-muted-foreground">Odometer</p>
                              <p>{Number(b.odometer).toLocaleString()} km</p>
                            </>
                          )}
                          {b.notes && (
                            <>
                              <p className="mt-3 font-mono-tag text-[10px] text-muted-foreground">Notes</p>
                              <p className="text-muted-foreground">{b.notes}</p>
                            </>
                          )}
                        </div>
                        <div>
                          <p className="mb-2 font-mono-tag text-[10px] text-muted-foreground">Update status</p>
                          <div className="flex gap-2 flex-wrap">
                            {STATUSES.map(s => (
                              <button
                                key={s}
                                disabled={b.status === s || updating === b.id}
                                onClick={() => updateStatus(b.id, s)}
                                className={cn(
                                  "rounded-lg border px-4 py-2 font-mono-tag text-xs capitalize transition",
                                  b.status === s
                                    ? STATUS_COLOURS[s] + " border-transparent"
                                    : "border-white/10 text-muted-foreground hover:border-white/30 disabled:opacity-30"
                                )}
                              >
                                {updating === b.id ? "…" : s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">No bookings found</td></tr>
            )}
          </tbody>
        </table>
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
