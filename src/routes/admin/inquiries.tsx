import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { QuoteRequest, QuoteStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/inquiries")({
  component: InquiriesPage,
});

const STATUSES: QuoteStatus[] = ["pending", "sent", "completed"];

const STATUS_COLOURS: Record<QuoteStatus, string> = {
  pending:   "bg-yellow-400/10 text-yellow-400",
  sent:      "bg-blue-400/10 text-blue-400",
  completed: "bg-green-400/10 text-green-400",
};

function InquiriesPage() {
  const [quotes, setQuotes]       = useState<QuoteRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<QuoteStatus | "all">("all");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [updating, setUpdating]   = useState<string | null>(null);

  useEffect(() => {
    supabase.from("quote_requests").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setQuotes(data ?? []); setLoading(false); });
  }, []);

  async function updateStatus(id: string, status: QuoteStatus) {
    setUpdating(id);
    await supabase.from("quote_requests").update({ status }).eq("id", id);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    setUpdating(null);
  }

  const filtered = filter === "all" ? quotes : quotes.filter(q => q.status === filter);

  if (loading) return <PageLoader />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono-tag text-xs text-muted-foreground">↳ Quote requests</p>
          <h1 className="mt-1 font-display text-4xl">Inquiries</h1>
        </div>
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
              {["Received", "Client", "Vehicle", "Services", "Status", ""].map((h, i) => (
                <th key={i} className="px-5 py-3.5 text-left font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(q => (
              <>
                <tr
                  key={q.id}
                  className="cursor-pointer hover:bg-white/[0.02]"
                  onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                >
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{q.name}</p>
                    <p className="text-xs text-muted-foreground">{q.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{q.year} {q.make} {q.model}</td>
                  <td className="px-5 py-3.5 text-muted-foreground max-w-[180px]">
                    <p className="truncate">{q.services.join(", ")}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("rounded-full px-2.5 py-0.5 font-mono-tag text-[10px] capitalize", STATUS_COLOURS[q.status])}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", expanded === q.id && "rotate-180")} />
                  </td>
                </tr>
                {expanded === q.id && (
                  <tr key={`${q.id}-exp`} className="bg-white/[0.015]">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="space-y-3">
                          <div>
                            <p className="font-mono-tag text-[10px] text-muted-foreground">Email</p>
                            <p>{q.email}</p>
                          </div>
                          {q.odometer && (
                            <div>
                              <p className="font-mono-tag text-[10px] text-muted-foreground">Odometer</p>
                              <p>{Number(q.odometer).toLocaleString()} km</p>
                            </div>
                          )}
                          {q.notes && (
                            <div>
                              <p className="font-mono-tag text-[10px] text-muted-foreground">Notes from client</p>
                              <p className="text-muted-foreground">{q.notes}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="mb-2 font-mono-tag text-[10px] text-muted-foreground">Update status</p>
                          <div className="flex gap-2 flex-wrap">
                            {STATUSES.map(s => (
                              <button
                                key={s}
                                disabled={q.status === s || updating === q.id}
                                onClick={() => updateStatus(q.id, s)}
                                className={cn(
                                  "rounded-lg border px-4 py-2 font-mono-tag text-xs capitalize transition",
                                  q.status === s
                                    ? STATUS_COLOURS[s] + " border-transparent"
                                    : "border-white/10 text-muted-foreground hover:border-white/30 disabled:opacity-30"
                                )}
                              >
                                {updating === q.id ? "…" : s}
                              </button>
                            ))}
                          </div>
                          <p className="mt-3 font-mono-tag text-[10px] text-muted-foreground">
                            Reply to: <a href={`mailto:${q.email}`} className="text-[#fcbb04] hover:underline">{q.email}</a>
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">No inquiries found</td></tr>
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
