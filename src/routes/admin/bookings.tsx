import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Booking, BookingStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { Search, X, Calendar, List, ChevronLeft, ChevronRight, Mail, Phone, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICES = ["Roadworthy Inspections", "Mechanical Repairs", "Log Book Servicing", "Vehicle Diagnostics"];
const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];

const ALL_SLOTS = [
  "7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM",
];

const STATUS_COLOURS: Record<BookingStatus, string> = {
  pending:   "bg-yellow-400/15 text-yellow-400",
  confirmed: "bg-green-400/15 text-green-400",
  cancelled: "bg-red-400/15 text-red-400",
  completed: "bg-purple-400/15 text-purple-400",
};

const STATUS_BORDER: Record<BookingStatus, string> = {
  pending:   "border-l-yellow-400",
  confirmed: "border-l-green-400",
  cancelled: "border-l-red-400",
  completed: "border-l-purple-400",
};

// ─── Main page ────────────────────────────────────────────────────────────────

function BookingsPage() {
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [serviceFilter, setService] = useState("all");
  const [statusFilter, setStatus]   = useState("all");
  const [view, setView]             = useState<"list" | "calendar">("list");
  const [selected, setSelected]     = useState<Booking | null>(null);
  const [calDate, setCalDate]       = useState(new Date());
  const [adminNotes, setAdminNotes]     = useState("");
  const [savingNotes, setSavingNotes]   = useState(false);
  const [updating, setUpdating]         = useState(false);
  const [showDoneForm, setShowDoneForm] = useState(false);
  const [doneData, setDoneData]         = useState({ cost: "", completionNotes: "", completedAt: new Date().toISOString().slice(0, 16) });
  const [markingDone, setMarkingDone]   = useState(false);

  useEffect(() => {
    supabase.from("bookings").select("*")
      .neq("status", "completed")
      .order("date", { ascending: false })
      .then(({ data }) => { setBookings(data ?? []); setLoading(false); });
  }, []);

  // Sync admin notes + reset done form when selection changes
  useEffect(() => {
    setAdminNotes(selected?.admin_notes ?? "");
    setShowDoneForm(false);
    setDoneData({ cost: "", completionNotes: "", completedAt: new Date().toISOString().slice(0, 16) });
  }, [selected?.id]);

  const filtered = useMemo(() => bookings.filter(b => {
    if (serviceFilter !== "all" && !b.services.includes(serviceFilter)) return false;
    if (statusFilter  !== "all" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![b.name, b.email, b.phone, b.make, b.model].some(v => v?.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [bookings, serviceFilter, statusFilter, search]);

  const today     = new Date().toISOString().split("T")[0];
  const todayCount  = bookings.filter(b => b.date === today).length;
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdating(true);
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    setUpdating(false);
  }

  async function markAsDone() {
    if (!selected) return;
    setMarkingDone(true);
    const update = {
      status:           "completed" as BookingStatus,
      completed_at:     doneData.completedAt ? new Date(doneData.completedAt).toISOString() : new Date().toISOString(),
      cost:             doneData.cost ? parseFloat(doneData.cost) : null,
      completion_notes: doneData.completionNotes || null,
    };
    await supabase.from("bookings").update(update).eq("id", selected.id);
    setBookings(prev => prev.map(b => b.id === selected.id ? { ...b, ...update } : b));
    setSelected(prev => prev ? { ...prev, ...update } : null);
    setShowDoneForm(false);
    setMarkingDone(false);
  }

  async function saveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    await supabase.from("bookings").update({ admin_notes: adminNotes }).eq("id", selected.id);
    setBookings(prev => prev.map(b => b.id === selected.id ? { ...b, admin_notes: adminNotes } : b));
    setSelected(prev => prev ? { ...prev, admin_notes: adminNotes } : null);
    setSavingNotes(false);
  }

  // Calendar day bookings
  const calDateStr = calDate.toISOString().split("T")[0];
  const calBookings = bookings.filter(b => b.date === calDateStr);

  if (loading) return <PageLoader />;

  return (
    <div className="flex h-screen flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-white/10 px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl">Bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {bookings.length} total · <span className="text-yellow-400">{pendingCount} pending</span>
            </p>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 p-1">
            <button onClick={() => setView("list")}
              className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition", view === "list" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <List size={13} /> List
            </button>
            <button onClick={() => setView("calendar")}
              className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition", view === "calendar" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Calendar size={13} /> Calendar
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Today", value: todayCount,     colour: "text-[#fcbb04]" },
            { label: "Pending", value: pendingCount,  colour: "text-yellow-400" },
            { label: "Confirmed", value: confirmedCount, colour: "text-green-400" },
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

        {/* Service filter tabs */}
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

        {view === "list" ? (
          <>
            {/* List */}
            <div className={cn("flex flex-col overflow-y-auto divide-y divide-white/5", selected ? "w-[55%]" : "flex-1")}>
              {filtered.map(b => (
                <button key={b.id} onClick={() => setSelected(s => s?.id === b.id ? null : b)}
                  className={cn(
                    "w-full border-l-2 px-6 py-4 text-left transition hover:bg-white/[0.03]",
                    selected?.id === b.id ? "bg-white/[0.05] border-l-[#fcbb04]" : STATUS_BORDER[b.status]
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
                        <span className={cn("rounded-full px-2 py-0.5 font-mono-tag text-[9px] uppercase tracking-wide", STATUS_COLOURS[b.status])}>
                          {b.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{b.email}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{b.year} {b.make} {b.model}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium">{new Date(b.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</p>
                      <p className="mt-0.5 font-mono-tag text-[10px] text-muted-foreground">{b.time}</p>
                    </div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="flex flex-1 items-center justify-center py-20 text-sm text-muted-foreground">
                  No bookings found
                </div>
              )}
            </div>

            {/* Side panel */}
            {selected && (
              <div className="flex w-[45%] flex-col overflow-y-auto border-l border-white/10">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <span className={cn("rounded-full px-3 py-1 font-mono-tag text-xs uppercase tracking-wide", STATUS_COLOURS[selected.status])}>
                    {selected.status}
                  </span>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition">
                    <X size={16} />
                  </button>
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
                        {new Date(selected.date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {selected.time}
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
                    <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Services</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.services.map(s => (
                        <span key={s} className="rounded-full border border-white/10 px-3 py-1 text-xs">{s}</span>
                      ))}
                    </div>
                  </div>

                  {selected.notes && (
                    <div>
                      <p className="mb-2 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Client Notes</p>
                      <p className="text-sm text-muted-foreground">{selected.notes}</p>
                    </div>
                  )}

                  {/* Completed details */}
                  {selected.status === "completed" && (
                    <div className="rounded-xl border border-purple-400/20 bg-purple-400/5 p-4 space-y-3">
                      <p className="font-mono-tag text-[10px] uppercase tracking-widest text-purple-400">Service Completed</p>
                      {selected.completed_at && (
                        <p className="text-sm">{new Date(selected.completed_at).toLocaleString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                      )}
                      {selected.cost != null && (
                        <p className="font-display text-2xl text-purple-400">${selected.cost.toFixed(2)}</p>
                      )}
                      {selected.completion_notes && (
                        <p className="text-sm text-muted-foreground">{selected.completion_notes}</p>
                      )}
                    </div>
                  )}

                  {/* Mark as Done */}
                  {selected.status === "confirmed" && (
                    <div>
                      {!showDoneForm ? (
                        <button onClick={() => setShowDoneForm(true)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500/20 border border-purple-400/30 py-3 text-sm font-semibold text-purple-400 transition hover:bg-purple-500/30">
                          <CheckCircle2 size={15} /> Mark as Done
                        </button>
                      ) : (
                        <div className="space-y-3 rounded-xl border border-purple-400/20 bg-purple-400/5 p-4">
                          <p className="font-mono-tag text-[10px] uppercase tracking-widest text-purple-400">Complete Service</p>
                          <div>
                            <label className="mb-1 block font-mono-tag text-[10px] text-muted-foreground">Finished at</label>
                            <input type="datetime-local" value={doneData.completedAt}
                              onChange={e => setDoneData(d => ({ ...d, completedAt: e.target.value }))}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-[#fcbb04] focus:outline-none transition" />
                          </div>
                          <div>
                            <label className="mb-1 block font-mono-tag text-[10px] text-muted-foreground">Cost (AUD)</label>
                            <input type="number" min="0" step="0.01" placeholder="e.g. 250.00"
                              value={doneData.cost}
                              onChange={e => setDoneData(d => ({ ...d, cost: e.target.value }))}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-[#fcbb04] focus:outline-none transition" />
                          </div>
                          <div>
                            <label className="mb-1 block font-mono-tag text-[10px] text-muted-foreground">Completion notes</label>
                            <textarea rows={3} placeholder="Work done, parts replaced, follow-up needed…"
                              value={doneData.completionNotes}
                              onChange={e => setDoneData(d => ({ ...d, completionNotes: e.target.value }))}
                              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-[#fcbb04] focus:outline-none transition" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setShowDoneForm(false)}
                              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-muted-foreground transition hover:border-white/30">
                              Cancel
                            </button>
                            <button onClick={markAsDone} disabled={markingDone}
                              className="flex-1 rounded-xl bg-purple-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                              {markingDone ? "Saving…" : "Confirm Done"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Update status */}
                  <div>
                    <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Update Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["pending", "confirmed", "cancelled"] as BookingStatus[]).map(s => (
                        <button key={s} disabled={selected.status === s || updating || selected.status === "completed"}
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

                  {/* Contact actions */}
                  <div className="grid grid-cols-2 gap-2 pb-4">
                    <a href={`mailto:${selected.email}`}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-muted-foreground transition hover:border-white/30 hover:text-foreground">
                      <Mail size={14} /> Email
                    </a>
                    <a href={`tel:${selected.phone}`}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-muted-foreground transition hover:border-white/30 hover:text-foreground">
                      <Phone size={14} /> Call
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ── Calendar day view ─────────────────────────────────────── */
          <div className="flex-1 overflow-y-auto p-6">
            {/* Day nav */}
            <div className="mb-6 flex items-center gap-4">
              <button onClick={() => setCalDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; })}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:border-white/30 transition">
                <ChevronLeft size={15} />
              </button>
              <h2 className="font-display text-2xl">
                {calDate.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </h2>
              <button onClick={() => setCalDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; })}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:border-white/30 transition">
                <ChevronRight size={15} />
              </button>
              <button onClick={() => setCalDate(new Date())}
                className="ml-2 rounded-full border border-white/10 px-3 py-1 font-mono-tag text-xs text-muted-foreground hover:border-white/30 transition">
                Today
              </button>
            </div>

            {/* Time slots */}
            <div className="space-y-1">
              {ALL_SLOTS.map(slot => {
                const slotBookings = calBookings.filter(b => b.time === slot);
                return (
                  <div key={slot} className="flex gap-4">
                    <div className="w-20 shrink-0 py-2 text-right font-mono-tag text-[11px] text-muted-foreground">{slot}</div>
                    <div className="flex-1 min-h-[44px] border-l border-white/5 pl-4">
                      {slotBookings.length > 0 ? (
                        <div className="space-y-1 py-1">
                          {slotBookings.map(b => (
                            <button key={b.id} onClick={() => { setView("list"); setSelected(b); }}
                              className={cn(
                                "w-full rounded-xl border-l-2 bg-white/[0.04] px-4 py-2.5 text-left transition hover:bg-white/[0.07]",
                                STATUS_BORDER[b.status]
                              )}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold">{b.name}</p>
                                  <p className="text-xs text-muted-foreground">{b.year} {b.make} {b.model} · {b.services.join(", ")}</p>
                                </div>
                                <span className={cn("rounded-full px-2.5 py-0.5 font-mono-tag text-[9px] uppercase", STATUS_COLOURS[b.status])}>
                                  {b.status}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="border-b border-white/[0.04] h-full" />
                      )}
                    </div>
                  </div>
                );
              })}
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
