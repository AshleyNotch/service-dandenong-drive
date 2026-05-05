import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Booking, QuoteRequest } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

const STATUS_COLOURS: Record<string, string> = {
  pending:   "bg-yellow-400/10 text-yellow-400",
  confirmed: "bg-green-400/10 text-green-400",
  cancelled: "bg-red-400/10 text-red-400",
  sent:      "bg-blue-400/10 text-blue-400",
  completed: "bg-green-400/10 text-green-400",
};

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-6", accent ? "border-[#fcbb04]/30 bg-[#fcbb04]/5" : "border-white/10 bg-white/[0.02]")}>
      <div className="flex items-start justify-between">
        <p className="font-mono-tag text-xs text-muted-foreground">{label}</p>
        <Icon size={16} className={accent ? "text-[#fcbb04]" : "text-muted-foreground"} />
      </div>
      <p className={cn("mt-4 font-display text-5xl", accent && "text-[#fcbb04]")}>{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [quotes, setQuotes]       = useState<QuoteRequest[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(50),
    ]).then(([b, q]) => {
      setBookings(b.data ?? []);
      setQuotes(q.data ?? []);
      setLoading(false);
    });
  }, []);

  const today          = new Date().toISOString().split("T")[0];
  const todayBookings  = bookings.filter(b => b.date === today).length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const pendingQuotes  = quotes.filter(q => q.status === "pending").length;

  if (loading) return <PageLoader />;

  return (
    <div className="p-8 space-y-8">
      <div>
        <p className="font-mono-tag text-xs text-muted-foreground">↳ Overview</p>
        <h1 className="mt-1 font-display text-4xl">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's bookings"  value={todayBookings}   icon={Calendar}      accent />
        <StatCard label="Pending bookings"  value={pendingBookings} icon={Clock} />
        <StatCard label="Total bookings"    value={bookings.length} icon={CheckCircle} />
        <StatCard label="Pending quotes"    value={pendingQuotes}   icon={MessageSquare} />
      </div>

      {/* Recent bookings */}
      <div>
        <h2 className="mb-4 font-mono-tag text-xs text-muted-foreground">↳ Recent bookings</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr>
                {["Date", "Time", "Name", "Vehicle", "Services", "Status"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.slice(0, 8).map(b => (
                <tr key={b.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">{new Date(b.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.time}</td>
                  <td className="px-5 py-3 font-medium">{b.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.year} {b.make} {b.model}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.services.join(", ")}</td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 font-mono-tag text-[10px] capitalize", STATUS_COLOURS[b.status])}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent quotes */}
      <div>
        <h2 className="mb-4 font-mono-tag text-xs text-muted-foreground">↳ Recent quote requests</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr>
                {["Date", "Name", "Vehicle", "Services", "Status"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {quotes.slice(0, 5).map(q => (
                <tr key={q.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">{new Date(q.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</td>
                  <td className="px-5 py-3 font-medium">{q.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{q.year} {q.make} {q.model}</td>
                  <td className="px-5 py-3 text-muted-foreground">{q.services.join(", ")}</td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 font-mono-tag text-[10px] capitalize", STATUS_COLOURS[q.status])}>
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No quote requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
