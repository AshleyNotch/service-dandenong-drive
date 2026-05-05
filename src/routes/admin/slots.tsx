import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { BlockedSlot } from "@/lib/database.types";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/slots")({
  component: SlotsPage,
});

const ALL_SLOTS = [
  "7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM",
];

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition";

function SlotsPage() {
  const [slots, setSlots]       = useState<BlockedSlot[]>([]);
  const [loading, setLoading]   = useState(true);
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState<string>("all");
  const [reason, setReason]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchSlots() {
    const { data } = await supabase.from("blocked_slots").select("*").order("date", { ascending: true });
    setSlots(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchSlots(); }, []);

  async function addBlock() {
    if (!date) return;
    setSaving(true);
    await supabase.from("blocked_slots").insert({
      date,
      time: time === "all" ? null : time,
      reason: reason || null,
    });
    setDate(""); setTime("all"); setReason("");
    await fetchSlots();
    setSaving(false);
  }

  async function removeBlock(id: string) {
    setDeleting(id);
    await supabase.from("blocked_slots").delete().eq("id", id);
    setSlots(prev => prev.filter(s => s.id !== id));
    setDeleting(null);
  }

  if (loading) return <PageLoader />;

  return (
    <div className="p-8 space-y-8">
      <div>
        <p className="font-mono-tag text-xs text-muted-foreground">↳ Availability</p>
        <h1 className="mt-1 font-display text-4xl">Manage Slots</h1>
      </div>

      {/* Add block */}
      <div className="rounded-2xl border border-white/10 p-6 space-y-5">
        <p className="font-mono-tag text-xs text-muted-foreground">↳ Block a date or time slot</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block font-mono-tag text-xs text-muted-foreground">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block font-mono-tag text-xs text-muted-foreground">Time (or block full day)</label>
            <select value={time} onChange={e => setTime(e.target.value)} className={inputCls}>
              <option value="all">All day</option>
              {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-mono-tag text-xs text-muted-foreground">Reason (optional)</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Public holiday" className={inputCls} />
          </div>
        </div>
        <button
          onClick={addBlock}
          disabled={!date || saving}
          className="flex items-center gap-2 rounded-xl bg-[#fcbb04] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-30"
        >
          <Plus size={15} />
          {saving ? "Saving…" : "Block slot"}
        </button>
      </div>

      {/* Existing blocks */}
      <div>
        <p className="mb-4 font-mono-tag text-xs text-muted-foreground">↳ Active blocks ({slots.length})</p>
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No slots blocked — all dates are open.</p>
        ) : (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  {["Date", "Time", "Reason", ""].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {slots.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-medium">
                      {new Date(s.date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.time ? (
                        <span className="rounded-full bg-[#fcbb04]/10 px-2.5 py-0.5 font-mono-tag text-[10px] text-[#fcbb04]">{s.time}</span>
                      ) : (
                        <span className="rounded-full bg-red-400/10 px-2.5 py-0.5 font-mono-tag text-[10px] text-red-400">All day</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.reason ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => removeBlock(s.id)}
                        disabled={deleting === s.id}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono-tag text-xs text-muted-foreground transition hover:border-red-400/40 hover:text-red-400 disabled:opacity-30"
                      >
                        <Trash2 size={12} />
                        {deleting === s.id ? "…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
