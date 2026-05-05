import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { QuoteRequest, QuoteStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { Search, X, Mail, Phone, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/inquiries")({
  component: InquiriesPage,
});

const SERVICES = ["Roadworthy Inspections", "Mechanical Repairs", "Log Book Servicing", "Vehicle Diagnostics"];
const STATUSES: QuoteStatus[] = ["pending", "sent", "completed"];

const STATUS_COLOURS: Record<QuoteStatus, string> = {
  pending:   "bg-yellow-400/15 text-yellow-400",
  sent:      "bg-blue-400/15 text-blue-400",
  completed: "bg-green-400/15 text-green-400",
};

const STATUS_BORDER: Record<QuoteStatus, string> = {
  pending:   "border-l-yellow-400",
  sent:      "border-l-blue-400",
  completed: "border-l-green-400",
};

function InquiriesPage() {
  const [quotes, setQuotes]         = useState<QuoteRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [serviceFilter, setService] = useState("all");
  const [statusFilter, setStatus]   = useState("all");
  const [selected, setSelected]     = useState<QuoteRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updating, setUpdating]     = useState(false);
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === "super_admin";
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    supabase.from("quote_requests").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setQuotes(data ?? []); setLoading(false); });
  }, []);

  useEffect(() => { setAdminNotes(selected?.admin_notes ?? ""); }, [selected]);

  const filtered = useMemo(() => quotes.filter(q => {
    if (serviceFilter !== "all" && !q.services.includes(serviceFilter)) return false;
    if (statusFilter  !== "all" && q.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (![q.name, q.email, q.phone, q.make, q.model].some(v => v?.toLowerCase().includes(s))) return false;
    }
    return true;
  }), [quotes, serviceFilter, statusFilter, search]);

  const pendingCount   = quotes.filter(q => q.status === "pending").length;
  const sentCount      = quotes.filter(q => q.status === "sent").length;
  const completedCount = quotes.filter(q => q.status === "completed").length;

  async function deleteInquiry(id: string) {
    if (!confirm("Permanently delete this inquiry?")) return;
    setDeleting(true);
    await supabase.from("quote_requests").delete().eq("id", id);
    setQuotes(prev => prev.filter(q => q.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(false);
  }

  async function updateStatus(id: string, status: QuoteStatus) {
    setUpdating(true);
    await supabase.from("quote_requests").update({ status }).eq("id", id);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    setUpdating(false);
  }

  async function saveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    await supabase.from("quote_requests").update({ admin_notes: adminNotes }).eq("id", selected.id);
    setQuotes(prev => prev.map(q => q.id === selected.id ? { ...q, admin_notes: adminNotes } : q));
    setSelected(prev => prev ? { ...prev, admin_notes: adminNotes } : null);
    setSavingNotes(false);
  }

  if (loading) return <PageLoader />;

  return (
    <div className="flex h-screen flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-white/10 px-8 py-6">
        <div>
          <h1 className="font-display text-4xl">Inquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {quotes.length} total · <span className="text-yellow-400">{pendingCount} pending</span>
          </p>
        </div>

        {/* Stat cards */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Pending",   value: pendingCount,   colour: "text-yellow-400" },
            { label: "Sent",      value: sentCount,      colour: "text-blue-400" },
            { label: "Completed", value: completedCount, colour: "text-green-400" },
          ].map(({ label, value, colour }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <p className={cn("font-display text-3xl", colour)}>{value}</p>
              <p className="mt-0.5 font-mono-tag text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + status */}
        <div className="mt-4 flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone, vehicle…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition" />
          </div>
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition">
            <option value="all">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
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

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* List */}
        <div className={cn("flex flex-col overflow-y-auto divide-y divide-white/5", selected ? "w-[55%]" : "flex-1")}>
          {filtered.map(q => (
            <button key={q.id} onClick={() => setSelected(s => s?.id === q.id ? null : q)}
              className={cn(
                "w-full border-l-2 px-6 py-4 text-left transition hover:bg-white/[0.03]",
                selected?.id === q.id ? "bg-white/[0.05] border-l-[#fcbb04]" : STATUS_BORDER[q.status]
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{q.name}</span>
                    {q.services.slice(0, 2).map(s => (
                      <span key={s} className="rounded-full border border-white/10 px-2 py-0.5 font-mono-tag text-[9px] uppercase tracking-wide text-muted-foreground">
                        {s.split(" ")[0]}
                      </span>
                    ))}
                    <span className={cn("rounded-full px-2 py-0.5 font-mono-tag text-[9px] uppercase tracking-wide", STATUS_COLOURS[q.status])}>
                      {q.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{q.email}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{q.year} {q.make} {q.model}</p>
                  {q.notes && <p className="mt-1 truncate text-xs text-muted-foreground/60 italic">{q.notes}</p>}
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {new Date(q.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                </p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-20 text-sm text-muted-foreground">
              No inquiries found
            </div>
          )}
        </div>

        {/* Side panel */}
        {selected && (
          <div className="flex w-[45%] flex-col overflow-y-auto border-l border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <span className={cn("rounded-full px-3 py-1 font-mono-tag text-xs uppercase tracking-wide", STATUS_COLOURS[selected.status])}>
                {selected.status}
              </span>
              <div className="flex items-center gap-2">
                {isSuperAdmin && (
                  <button onClick={() => deleteInquiry(selected.id)} disabled={deleting}
                    className="flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-1.5 font-mono-tag text-[10px] text-red-400 transition hover:bg-red-400/10 disabled:opacity-30">
                    <Trash2 size={11} />{deleting ? "…" : "Delete"}
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-6 p-6">
              {/* Contact */}
              <div>
                <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Contact Info</p>
                <div className="space-y-2 text-sm">
                  <p className="text-lg font-semibold">{selected.name}</p>
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-[#fcbb04] transition">
                    <Mail size={13} />{selected.email}
                  </a>
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-[#fcbb04] transition">
                    <Phone size={13} />{selected.phone}
                  </a>
                  <p className="text-muted-foreground">
                    Received {new Date(selected.created_at).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
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
                <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Services Requested</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.services.map(s => (
                    <span key={s} className="rounded-full border border-white/10 px-3 py-1 text-xs">{s}</span>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div>
                  <p className="mb-2 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Client Notes</p>
                  <p className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">{selected.notes}</p>
                </div>
              )}

              {/* Update status */}
              <div>
                <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Update Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map(s => (
                    <button key={s} disabled={selected.status === s || updating}
                      onClick={() => updateStatus(selected.id, s)}
                      className={cn(
                        "rounded-xl border py-2.5 font-mono-tag text-xs capitalize transition",
                        selected.status === s
                          ? STATUS_COLOURS[s] + " border-transparent"
                          : "border-white/10 text-muted-foreground hover:border-white/30 disabled:opacity-30"
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin notes */}
              <div>
                <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Admin Notes</p>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes here…"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition"
                />
                <button onClick={saveNotes} disabled={savingNotes}
                  className="mt-2 w-full rounded-xl bg-[#fcbb04] py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50">
                  {savingNotes ? "Saving…" : "Save Notes"}
                </button>
              </div>

              {/* Delivery preference badge */}
              {(selected as any).quote_delivery && (
                <div className="flex items-center gap-2">
                  <p className="font-mono-tag text-[10px] text-muted-foreground">Prefers quotation via</p>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 font-mono-tag text-[10px] capitalize",
                    (selected as any).quote_delivery === "whatsapp"
                      ? "bg-green-400/15 text-green-400"
                      : "bg-blue-400/15 text-blue-400"
                  )}>
                    {(selected as any).quote_delivery}
                  </span>
                </div>
              )}

              {/* Contact actions */}
              <div className={cn("grid gap-2 pb-4", (selected as any).whatsapp_number ? "grid-cols-3" : "grid-cols-2")}>
                <a href={`mailto:${selected.email}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-muted-foreground transition hover:border-white/30 hover:text-foreground">
                  <Mail size={14} /> Email
                </a>
                <a href={`tel:${selected.phone}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-muted-foreground transition hover:border-white/30 hover:text-foreground">
                  <Phone size={14} /> Call
                </a>
                {(selected as any).whatsapp_number && (
                  <a
                    href={`https://wa.me/${((selected as any).whatsapp_number as string).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 py-3 text-sm text-green-400 transition hover:bg-green-400/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                )}
              </div>
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
