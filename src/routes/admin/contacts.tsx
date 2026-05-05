import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Contact, Booking, QuoteRequest } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { Search, X, Mail, Phone, Calendar, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/contacts")({
  component: ContactsPage,
});

const STATUS_COLOURS: Record<string, string> = {
  pending:   "bg-yellow-400/15 text-yellow-400",
  confirmed: "bg-green-400/15 text-green-400",
  cancelled: "bg-red-400/15 text-red-400",
  completed: "bg-purple-400/15 text-purple-400",
  sent:      "bg-blue-400/15 text-blue-400",
};

function ContactsPage() {
  const [contacts, setContacts]     = useState<Contact[]>([]);
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [quotes, setQuotes]         = useState<QuoteRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<Contact | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("contacts").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("date", { ascending: false }),
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
    ]).then(([c, b, q]) => {
      setContacts(c.data ?? []);
      setBookings(b.data ?? []);
      setQuotes(q.data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => contacts.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [c.name, c.email, c.phone ?? ""].some(v => v.toLowerCase().includes(q));
  }), [contacts, search]);

  // History for selected contact
  const contactBookings = selected
    ? bookings.filter(b => b.email === selected.email)
    : [];
  const contactQuotes = selected
    ? quotes.filter(q => q.email === selected.email)
    : [];

  const totalSpend = contactBookings
    .filter(b => b.cost != null)
    .reduce((sum, b) => sum + (b.cost ?? 0), 0);

  if (loading) return <PageLoader />;

  return (
    <div className="flex h-screen flex-col overflow-hidden">

      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-8 py-6">
        <h1 className="font-display text-4xl">Contacts</h1>
        <p className="mt-1 text-sm text-muted-foreground">{contacts.length} total</p>

        <div className="mt-5 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email or phone…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* List */}
        <div className={cn("flex flex-col overflow-y-auto divide-y divide-white/5", selected ? "w-[45%]" : "flex-1")}>
          {filtered.map(c => {
            const cBookings = bookings.filter(b => b.email === c.email);
            const cQuotes   = quotes.filter(q => q.email === c.email);
            const lastActivity = [...cBookings.map(b => b.created_at), ...cQuotes.map(q => q.created_at)]
              .sort().at(-1);

            return (
              <button key={c.id} onClick={() => setSelected(s => s?.id === c.id ? null : c)}
                className={cn(
                  "w-full px-6 py-4 text-left transition hover:bg-white/[0.03]",
                  selected?.id === c.id && "bg-white/[0.05]"
                )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fcbb04]/10 font-semibold text-[#fcbb04] text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold">{c.name}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground pl-10">{c.email}</p>
                    {c.phone && <p className="truncate text-xs text-muted-foreground pl-10">{c.phone}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {cBookings.length > 0 && (
                        <span className="flex items-center gap-1"><Calendar size={11} />{cBookings.length}</span>
                      )}
                      {cQuotes.length > 0 && (
                        <span className="flex items-center gap-1"><MessageSquare size={11} />{cQuotes.length}</span>
                      )}
                    </div>
                    {lastActivity && (
                      <p className="mt-1 font-mono-tag text-[10px] text-muted-foreground">
                        {new Date(lastActivity).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-20 text-sm text-muted-foreground">
              No contacts found
            </div>
          )}
        </div>

        {/* Side panel */}
        {selected && (
          <div className="flex w-[55%] flex-col overflow-y-auto border-l border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fcbb04]/10 font-semibold text-[#fcbb04]">
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="font-mono-tag text-[10px] text-muted-foreground">
                    First contact {new Date(selected.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-6 p-6">
              {/* Contact info */}
              <div className="space-y-2 text-sm">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-[#fcbb04] transition">
                  <Mail size={13} />{selected.email}
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-[#fcbb04] transition">
                    <Phone size={13} />{selected.phone}
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <p className="font-display text-2xl">{contactBookings.length}</p>
                  <p className="mt-0.5 font-mono-tag text-[10px] text-muted-foreground">Bookings</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <p className="font-display text-2xl">{contactQuotes.length}</p>
                  <p className="mt-0.5 font-mono-tag text-[10px] text-muted-foreground">Quotes</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <p className="font-display text-2xl text-[#fcbb04]">${totalSpend.toFixed(0)}</p>
                  <p className="mt-0.5 font-mono-tag text-[10px] text-muted-foreground">Total spend</p>
                </div>
              </div>

              {/* Booking history */}
              {contactBookings.length > 0 && (
                <div>
                  <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Booking History</p>
                  <div className="space-y-2">
                    {contactBookings.map(b => (
                      <div key={b.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(b.date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {b.time}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{b.year} {b.make} {b.model}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{b.services.join(", ")}</p>
                            {b.completion_notes && (
                              <p className="mt-2 text-xs text-muted-foreground/70 italic">{b.completion_notes}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className={cn("rounded-full px-2.5 py-0.5 font-mono-tag text-[9px] uppercase", STATUS_COLOURS[b.status])}>
                              {b.status}
                            </span>
                            {b.cost != null && (
                              <p className="mt-2 text-sm font-semibold text-[#fcbb04]">${b.cost.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quote history */}
              {contactQuotes.length > 0 && (
                <div className="pb-4">
                  <p className="mb-3 font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">Quote Requests</p>
                  <div className="space-y-2">
                    {contactQuotes.map(q => (
                      <div key={q.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(q.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{q.year} {q.make} {q.model}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{q.services.join(", ")}</p>
                            {q.notes && <p className="mt-2 text-xs text-muted-foreground/70 italic">{q.notes}</p>}
                          </div>
                          <span className={cn("rounded-full px-2.5 py-0.5 font-mono-tag text-[9px] uppercase shrink-0", STATUS_COLOURS[q.status])}>
                            {q.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
