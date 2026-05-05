import { useState, useEffect } from "react";
import { Calendar, Clock, Wrench, Car, User, Mail, Phone, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  "Roadworthy Inspections",
  "Mechanical Repairs",
  "Log Book Servicing",
  "Vehicle Diagnostics",
];

const SLOTS_WD_MORNING    = ["7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM"];
const SLOTS_WD_AFTERNOON  = ["12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"];
const SLOTS_SAT_MORNING   = ["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM"];
const SLOTS_SAT_AFTERNOON = ["12:00 PM","12:30 PM"];

const DAY   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  date:     Date   | null;
  time:     string | null;
  services: string[];
  make:     string;
  model:    string;
  year:     string;
  odometer: string;
  name:     string;
  phone:    string;
  email:    string;
}

const empty: Booking = {
  date: null, time: null, services: [],
  make: "", model: "", year: "", odometer: "",
  name: "", phone: "", email: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Always format using local time — toISOString() shifts to UTC and breaks date comparisons in AU timezone
function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function weekMonday(offset: number): Date {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function slotsFor(date: Date) {
  return date.getDay() === 6
    ? [{ label: "Morning", times: SLOTS_SAT_MORNING }, { label: "Afternoon", times: SLOTS_SAT_AFTERNOON }]
    : [{ label: "Morning", times: SLOTS_WD_MORNING  }, { label: "Afternoon", times: SLOTS_WD_AFTERNOON  }];
}

// ─── Validation & formatting ──────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v: string) => v.replace(/\D/g, "").length >= 8;

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // NANP (+1) gets a 1-digit country code; everything else gets 2 digits
  const ccLen = digits[0] === "1" ? 1 : 2;
  if (digits.length <= ccLen) return `(+${digits}`;
  const cc = digits.slice(0, ccLen);
  const local = digits.slice(ccLen);
  const groups: string[] = [];
  for (let i = 0; i < local.length; i += 3) groups.push(local.slice(i, i + 3));
  return `(+${cc}) ${groups.join(" ")}`;
}

// ─── Small pieces ─────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition";
const inputClsError = "w-full rounded-xl border border-red-500/60 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono-tag text-xs text-muted-foreground">{label}</label>
      {children}
      {error && <p className="mt-1.5 font-mono-tag text-xs text-red-400">{error}</p>}
    </div>
  );
}

function SummaryRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-[#fcbb04]">{icon}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

// ─── Widget ───────────────────────────────────────────────────────────────────

export function BookingWidget() {
  const [step, setStep]             = useState(1);
  const [weekOff, setWeekOff]       = useState(0);
  const [booking, setBooking]       = useState<Booking>(empty);
  const [confirmed, setConfirmed]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched]       = useState({ phone: false, email: false });
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<{ date: string; time: string | null }[]>([]);

  const touch = (k: "phone" | "email") => setTouched(prev => ({ ...prev, [k]: true }));

  const today  = new Date(); today.setHours(0, 0, 0, 0);
  const monday = weekMonday(weekOff);
  const week   = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });

  // Fetch blocked slots for the visible week on mount and when week changes
  useEffect(() => {
    const from = toDateStr(monday);
    const to   = toDateStr(new Date(monday.getTime() + 6 * 86400000));
    supabase.from("blocked_slots").select("date,time").gte("date", from).lte("date", to)
      .then(({ data }) => setBlockedSlots(data ?? []));
  }, [weekOff]);

  // Fetch booked times when date is selected
  async function fetchAvailability(date: Date) {
    const dateStr = toDateStr(date);
    const { data } = await supabase.rpc("get_booked_times", { p_date: dateStr });
    setBookedTimes((data ?? []).map((r: { booked_time: string }) => r.booked_time));
  }

  // Check if a full day is blocked
  function isDayBlocked(date: Date) {
    const dateStr = toDateStr(date);
    return blockedSlots.some(s => s.date === dateStr && s.time === null);
  }

  // Check if a specific time is unavailable (booked or blocked)
  function isTimeUnavailable(time: string) {
    if (bookedTimes.includes(time)) return true;
    if (!booking.date) return false;
    const dateStr = toDateStr(booking.date);
    return blockedSlots.some(s => s.date === dateStr && s.time === time);
  }

  const set = <K extends keyof Booking>(k: K, v: Booking[K]) =>
    setBooking(prev => ({ ...prev, [k]: v }));

  const toggleService = (s: string) =>
    set("services", booking.services.includes(s)
      ? booking.services.filter(x => x !== s)
      : [...booking.services, s]);

  const step1ok = booking.services.length > 0;
  const step2ok = booking.date !== null && booking.time !== null;
  const step3ok = booking.make.trim() !== "" && booking.model.trim() !== "" && booking.year.trim() !== "";
  const phoneErr = touched.phone && booking.phone.trim() !== "" && !isValidPhone(booking.phone) ? "Enter a valid phone number" : undefined;
  const emailErr = touched.email && booking.email.trim() !== "" && !isValidEmail(booking.email) ? "Enter a valid email address" : undefined;
  const step4ok  = booking.name.trim() !== "" && isValidPhone(booking.phone) && isValidEmail(booking.email);

  const summaryDate = booking.date?.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  // ── Confirmed ──────────────────────────────────────────────────────────────

  function downloadTicketPDF() {
    const ref = Math.random().toString(36).slice(2, 10).toUpperCase();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=ffffff&bgcolor=0a0a0a&data=MACCITY-${ref}&margin=10`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Mac City — Booking Ticket</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0a0a0a; font-family:'Arial Black',Arial,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:32px; }
  .ticket { background:#0a0a0a; border:1px solid #222; border-radius:24px; width:100%; max-width:400px; overflow:hidden; }
  .top { padding:32px 32px 24px; }
  .brand { font-size:88px; font-weight:900; color:#fff; line-height:0.85; letter-spacing:-4px; font-family:'Arial Black',Arial,sans-serif; }
  .services { margin-top:20px; font-size:15px; color:#fcbb04; font-weight:700; font-family:'Helvetica Neue',Arial,sans-serif; line-height:1.5; }
  .divider { border-top:2px dashed #222; margin:24px 0; }
  .bottom { padding:0 32px 32px; font-family:'Helvetica Neue',Arial,sans-serif; }
  .info-row { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
  .info-block {}
  .info-label { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#555; margin-bottom:3px; }
  .info-value { font-size:13px; font-weight:700; color:#fff; }
  .qr-wrap { display:flex; justify-content:center; margin-top:24px; }
  .qr-wrap img { border-radius:12px; }
  .ref { text-align:center; margin-top:10px; font-size:10px; letter-spacing:3px; color:#444; font-family:'Helvetica Neue',Arial,sans-serif; }
  @media print {
    body { padding:0; background:#0a0a0a; }
    .no-print { display:none !important; }
  }
</style>
</head>
<body>
<div class="ticket">
  <div class="top">
    <div class="brand">MAC<br/>CITY</div>
    <div class="services">${booking.services.join(" + ")}</div>
    <div class="services" style="color:#888;font-size:13px;margin-top:6px;">${booking.year} ${booking.make} ${booking.model}</div>
  </div>
  <div style="padding:0 32px;">
    <div class="divider"></div>
  </div>
  <div class="bottom">
    <div class="info-row">
      <div class="info-block">
        <div class="info-label">Date</div>
        <div class="info-value">${summaryDate}</div>
      </div>
      <div class="info-block" style="text-align:right;">
        <div class="info-label">Time</div>
        <div class="info-value">${booking.time}</div>
      </div>
    </div>
    <div class="info-row">
      <div class="info-block">
        <div class="info-label">Name</div>
        <div class="info-value">${booking.name}</div>
      </div>
    </div>
    <div class="info-row">
      <div class="info-block">
        <div class="info-label">Phone</div>
        <div class="info-value">${booking.phone}</div>
      </div>
      <div class="info-block" style="text-align:right;">
        <div class="info-label">Email</div>
        <div class="info-value" style="font-size:11px;">${booking.email}</div>
      </div>
    </div>
    <div class="qr-wrap">
      <img src="${qrUrl}" width="120" height="120" alt="QR" />
    </div>
    <div class="ref">#${ref}</div>
  </div>
</div>
<div class="no-print" style="text-align:center;margin-top:24px;">
  <button onclick="window.print()" style="background:#fcbb04;color:#000;border:none;padding:12px 28px;font-size:14px;font-weight:900;border-radius:100px;cursor:pointer;font-family:'Arial Black',Arial,sans-serif;">
    Save as PDF
  </button>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`);
    win.document.close();
  }

  if (confirmed) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="flex min-h-[420px] flex-col items-center justify-center p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fcbb04]/15 text-[#fcbb04] text-2xl">✓</div>
          <h3 className="mt-6 font-display text-3xl">Booking received</h3>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Thanks {booking.name.split(" ")[0]} — we'll confirm your{" "}
            {summaryDate} at {booking.time} slot via{" "}
            <span className="text-foreground">{booking.email}</span>.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              onClick={downloadTicketPDF}
              className="rounded-full bg-[#fcbb04] px-6 py-2.5 text-sm font-semibold text-black hover:opacity-90 transition"
            >
              Download Ticket PDF
            </button>
            <button
              onClick={() => { setBooking(empty); setStep(1); setConfirmed(false); }}
              className="rounded-full border border-white/10 px-6 py-2.5 text-sm hover:border-white/30 transition"
            >
              Book another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = ["Services", "Date & Time", "Your Vehicle", "Your Details"];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="grid md:grid-cols-[1fr_300px]">

        {/* ── LEFT ───────────────────────────────────────────────────────── */}
        <div className="p-8 md:p-10">

          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-3">
            {steps.map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done   = step > n;
              return (
                <div key={n} className={cn("flex items-center gap-2 text-xs font-mono-tag transition", active ? "opacity-100" : "opacity-35")}>
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0",
                    done || active ? "bg-[#fcbb04] text-black" : "border border-white/20"
                  )}>
                    {done ? "✓" : n}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                  {n < steps.length && <span className="hidden sm:inline text-white/20 ml-1">·</span>}
                </div>
              );
            })}
          </div>

          {/* ─ STEP 1 — Services ────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <p className="mb-5 font-mono-tag text-xs text-muted-foreground">↳ Select one or more services</p>
              <div className="mb-8 grid grid-cols-2 gap-3">
                {SERVICES.map(s => (
                  <button key={s} onClick={() => toggleService(s)}
                    className={cn(
                      "rounded-xl border px-4 py-4 text-left text-sm transition",
                      booking.services.includes(s)
                        ? "border-[#fcbb04] bg-[#fcbb04]/10 text-[#fcbb04]"
                        : "border-white/10 hover:border-white/25"
                    )}>
                    {s}
                  </button>
                ))}
              </div>
              <button disabled={!step1ok} onClick={() => setStep(2)}
                className="w-full rounded-xl bg-[#fcbb04] py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed">
                Continue →
              </button>
            </>
          )}

          {/* ─ STEP 2 — Date & Time ─────────────────────────────────────── */}
          {step === 2 && (
            <>
              {/* Date */}
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono-tag text-xs text-muted-foreground">↳ Select a date</p>
                <div className="flex gap-1">
                  <button onClick={() => setWeekOff(w => Math.max(0, w - 1))} disabled={weekOff === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-sm disabled:opacity-25 hover:border-white/30 transition">‹</button>
                  <button onClick={() => setWeekOff(w => w + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-sm hover:border-white/30 transition">›</button>
                </div>
              </div>

              {booking.date && (
                <p className="mb-3 text-sm font-semibold">
                  {DAY[booking.date.getDay()]}, {MONTH[booking.date.getMonth()]} {booking.date.getDate()}
                </p>
              )}

              <div className="mb-8 grid grid-cols-7 gap-1">
                {week.map((d, i) => {
                  const past    = d < today;
                  const isSun   = d.getDay() === 0;
                  const blocked = isDayBlocked(d);
                  const sel     = booking.date?.toDateString() === d.toDateString();
                  const disabled = past || isSun || blocked;
                  return (
                    <button key={i} disabled={disabled}
                      onClick={() => { setBooking(prev => ({ ...prev, date: d, time: null })); fetchAvailability(d); }}
                      className={cn(
                        "flex flex-col items-center rounded-xl py-3 text-xs transition",
                        sel      ? "bg-[#fcbb04] text-black font-semibold" :
                        disabled ? "opacity-20 cursor-not-allowed" :
                                   "border border-white/10 hover:border-white/30"
                      )}>
                      <span className="font-mono-tag text-[10px]">{DAY[d.getDay()]}</span>
                      <span className="mt-1 text-sm font-bold">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time — revealed after date */}
              {booking.date && (
                <div className="mb-8 space-y-5">
                  <p className="font-mono-tag text-xs text-muted-foreground">↳ Select a time</p>
                  {slotsFor(booking.date).map(({ label, times }) => (
                    <div key={label}>
                      <p className="mb-2 font-mono-tag text-[10px] text-muted-foreground">{label}</p>
                      <div className="flex flex-wrap gap-2">
                        {times.map(t => {
                          const unavailable = isTimeUnavailable(t);
                          return (
                            <button key={t} disabled={unavailable} onClick={() => set("time", t)}
                              className={cn(
                                "rounded-lg border px-3 py-2 text-sm transition",
                                unavailable
                                  ? "border-white/5 opacity-30 cursor-not-allowed line-through"
                                  : booking.time === t
                                    ? "border-[#fcbb04] bg-[#fcbb04]/10 text-[#fcbb04]"
                                    : "border-white/10 hover:border-white/30"
                              )}>{t}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="rounded-xl border border-white/10 px-6 py-3.5 text-sm hover:border-white/30 transition">← Back</button>
                <button disabled={!step2ok} onClick={() => setStep(3)}
                  className="flex-1 rounded-xl bg-[#fcbb04] py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed">
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ─ STEP 3 — Vehicle Details ──────────────────────────────────── */}
          {step === 3 && (
            <>
              <p className="mb-6 font-mono-tag text-xs text-muted-foreground">↳ Vehicle details</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Make">
                    <input value={booking.make} onChange={e => set("make", e.target.value)} placeholder="e.g. Toyota" className={inputCls} />
                  </Field>
                  <Field label="Model">
                    <input value={booking.model} onChange={e => set("model", e.target.value)} placeholder="e.g. Corolla" className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Year">
                    <input value={booking.year} onChange={e => set("year", e.target.value.replace(/\D/g, ""))} placeholder="e.g. 2020" maxLength={4} className={inputCls} />
                  </Field>
                  <Field label="Odometer (km)">
                    <input value={booking.odometer} onChange={e => set("odometer", e.target.value.replace(/\D/g, ""))} placeholder="e.g. 85000" className={inputCls} />
                  </Field>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setStep(2)} className="rounded-xl border border-white/10 px-6 py-3.5 text-sm hover:border-white/30 transition">← Back</button>
                <button disabled={!step3ok} onClick={() => setStep(4)}
                  className="flex-1 rounded-xl bg-[#fcbb04] py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed">
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ─ STEP 4 — Client Details ───────────────────────────────────── */}
          {step === 4 && (
            <>
              <p className="mb-6 font-mono-tag text-xs text-muted-foreground">↳ Your details</p>
              <div className="space-y-4">
                <Field label="Full Name">
                  <input value={booking.name} onChange={e => set("name", e.target.value)} placeholder="Jane Smith" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone" error={phoneErr}>
                    <input value={booking.phone} onChange={e => set("phone", formatPhone(e.target.value))} onBlur={() => touch("phone")} placeholder="(+61) 412 345 678" className={phoneErr ? inputClsError : inputCls} />
                  </Field>
                  <Field label="Email" error={emailErr}>
                    <input value={booking.email} onChange={e => set("email", e.target.value)} onBlur={() => touch("email")} placeholder="jane@example.com" className={emailErr ? inputClsError : inputCls} />
                  </Field>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setStep(3)} className="rounded-xl border border-white/10 px-6 py-3.5 text-sm hover:border-white/30 transition">← Back</button>
                <button
                  disabled={!step4ok || submitting}
                  onClick={async () => {
                    setSubmitting(true);
                    const payload = {
                      id:       crypto.randomUUID(),
                      date:     toDateStr(booking.date!),
                      time:     booking.time!,
                      services: booking.services,
                      make:     booking.make,
                      model:    booking.model,
                      year:     booking.year,
                      odometer: booking.odometer || null,
                      name:     booking.name,
                      phone:    booking.phone,
                      email:    booking.email,
                    };

                    await supabase.from("bookings").insert(payload);

                    // Send confirmation email (fire-and-forget)
                    fetch("/api/send-booking-confirmation", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    }).catch(() => {});

                    setSubmitting(false);
                    setConfirmed(true);
                    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#fcbb04", "#ffffff", "#000000"] });
                  }}
                  className="flex-1 rounded-xl bg-[#fcbb04] py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed">
                  {submitting ? "Confirming…" : "Confirm Booking ✓"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT — Summary ─────────────────────────────────────────────── */}
        <div className="border-t border-white/10 bg-white/[0.02] p-8 md:border-l md:border-t-0 md:p-10">
          <p className="mb-6 font-mono-tag text-xs text-muted-foreground">↳ Your booking</p>

          {!booking.date && !booking.time && booking.services.length === 0 && !booking.make ? (
            <p className="text-sm text-muted-foreground">Your selections will appear here as you go.</p>
          ) : (
            <div className="space-y-5 text-sm">

              {booking.services.length > 0 && (
                <SummaryRow icon={<Wrench size={15} />}>
                  <p className="font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Services</p>
                  {booking.services.map(s => <p key={s}>{s}</p>)}
                </SummaryRow>
              )}

              {booking.date && (
                <SummaryRow icon={<Calendar size={15} />}>
                  <p className="font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Date</p>
                  <p>{summaryDate}</p>
                </SummaryRow>
              )}

              {booking.time && (
                <SummaryRow icon={<Clock size={15} />}>
                  <p className="font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Time</p>
                  <p>{booking.time}</p>
                </SummaryRow>
              )}

              {booking.make && (
                <SummaryRow icon={<Car size={15} />}>
                  <p className="font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Vehicle</p>
                  <p>{[booking.year, booking.make, booking.model].filter(Boolean).join(" ")}</p>
                  {booking.odometer && (
                    <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                      <Gauge size={12} />
                      {Number(booking.odometer).toLocaleString()} km
                    </p>
                  )}
                </SummaryRow>
              )}

              {booking.name && (
                <SummaryRow icon={<User size={15} />}>
                  <p>{booking.name}</p>
                </SummaryRow>
              )}

              {booking.phone && (
                <SummaryRow icon={<Phone size={15} />}>
                  <p>{booking.phone}</p>
                </SummaryRow>
              )}

              {booking.email && (
                <SummaryRow icon={<Mail size={15} />}>
                  <p>{booking.email}</p>
                </SummaryRow>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
