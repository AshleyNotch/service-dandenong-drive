import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  "Roadworthy Inspections",
  "Mechanical Repairs",
  "Log Book Servicing",
  "Vehicle Diagnostics",
];

const SLOTS_WD_MORNING   = ["7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM"];
const SLOTS_WD_AFTERNOON = ["12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"];
const SLOTS_SAT_MORNING  = ["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM"];
const SLOTS_SAT_AFTERNOON= ["12:00 PM","12:30 PM"];

const DAY  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH= ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  services: string[];
  date:     Date   | null;
  time:     string | null;
  make:     string;
  model:    string;
  year:     string;
  odometer: string;
  name:     string;
  phone:    string;
  email:    string;
}

const empty: Booking = {
  services: [], date: null, time: null,
  make: "", model: "", year: "", odometer: "",
  name: "", phone: "", email: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function weekMonday(offset: number): Date {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function slotsFor(date: Date) {
  const isSat = date.getDay() === 6;
  return isSat
    ? [{ label: "Morning", times: SLOTS_SAT_MORNING }, { label: "Afternoon", times: SLOTS_SAT_AFTERNOON }]
    : [{ label: "Morning", times: SLOTS_WD_MORNING  }, { label: "Afternoon", times: SLOTS_WD_AFTERNOON }];
}

// ─── Input ───────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono-tag text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition";

// ─── Widget ──────────────────────────────────────────────────────────────────

export function BookingWidget() {
  const [step, setStep]         = useState(1);
  const [weekOff, setWeekOff]   = useState(0);
  const [booking, setBooking]   = useState<Booking>(empty);
  const [confirmed, setConfirmed] = useState(false);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monday = weekMonday(weekOff);
  const week   = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });

  const set = <K extends keyof Booking>(k: K, v: Booking[K]) =>
    setBooking(prev => ({ ...prev, [k]: v }));

  const toggleService = (s: string) =>
    set("services", booking.services.includes(s)
      ? booking.services.filter(x => x !== s)
      : [...booking.services, s]);

  const step1ok = booking.services.length > 0 && booking.date !== null && booking.time !== null;
  const step2ok = booking.make.trim() !== "" && booking.model.trim() !== "" && booking.year.trim() !== "";
  const step3ok = booking.name.trim() !== "" && booking.phone.trim() !== "" && booking.email.trim() !== "";

  // ── Confirmed state ──────────────────────────────────────────────────────

  if (confirmed) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="flex min-h-[420px] flex-col items-center justify-center p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fcbb04]/15 text-3xl">✓</div>
          <h3 className="mt-6 font-display text-3xl">Booking received</h3>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Thanks {booking.name.split(" ")[0]} — we'll confirm your{" "}
            {booking.date?.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })} at {booking.time} slot via{" "}
            <span className="text-foreground">{booking.email}</span>.
          </p>
          <button
            onClick={() => { setBooking(empty); setStep(1); setConfirmed(false); }}
            className="mt-8 rounded-full border border-white/10 px-6 py-2.5 text-sm hover:border-white/30 transition"
          >
            Book another service
          </button>
        </div>
      </div>
    );
  }

  // ── Step labels ──────────────────────────────────────────────────────────

  const steps = ["Date & Service", "Your Vehicle", "Your Details"];

  // ── Summary helpers ──────────────────────────────────────────────────────

  const summaryDate = booking.date?.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="grid md:grid-cols-[1fr_320px]">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="p-8 md:p-10">

          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-4">
            {steps.map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done   = step > n;
              return (
                <div key={n} className={cn("flex items-center gap-2 text-xs font-mono-tag transition", active ? "opacity-100" : "opacity-35")}>
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    done   ? "bg-[#fcbb04] text-black" :
                    active ? "bg-[#fcbb04] text-black" :
                             "border border-white/20"
                  )}>
                    {done ? "✓" : n}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              );
            })}
          </div>

          {/* ─ STEP 1 ─────────────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              {/* Services */}
              <p className="mb-3 font-mono-tag text-xs text-muted-foreground">↳ Select services</p>
              <div className="mb-8 grid grid-cols-2 gap-2">
                {SERVICES.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleService(s)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left text-sm transition",
                      booking.services.includes(s)
                        ? "border-[#fcbb04] bg-[#fcbb04]/10 text-[#fcbb04]"
                        : "border-white/10 hover:border-white/25"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Date picker header */}
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono-tag text-xs text-muted-foreground">↳ Select a date</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setWeekOff(w => Math.max(0, w - 1))}
                    disabled={weekOff === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-sm disabled:opacity-25 hover:border-white/30 transition"
                  >‹</button>
                  <button
                    onClick={() => setWeekOff(w => w + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-sm hover:border-white/30 transition"
                  >›</button>
                </div>
              </div>

              {booking.date && (
                <p className="mb-3 text-sm font-semibold">
                  {DAY[booking.date.getDay()]}, {MONTH[booking.date.getMonth()]} {booking.date.getDate()}
                </p>
              )}

              {/* Week row */}
              <div className="mb-6 grid grid-cols-7 gap-1">
                {week.map((d, i) => {
                  const past   = d < today;
                  const isSun  = d.getDay() === 0;
                  const sel    = booking.date?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={i}
                      disabled={past || isSun}
                      onClick={() => set("date", d) && set("time", null) || set("date", d)}
                      className={cn(
                        "flex flex-col items-center rounded-xl py-3 text-xs transition",
                        sel    ? "bg-[#fcbb04] text-black font-semibold" :
                        (past || isSun) ? "opacity-20 cursor-not-allowed" :
                                 "border border-white/10 hover:border-white/30"
                      )}
                    >
                      <span className="font-mono-tag text-[10px]">{DAY[d.getDay()]}</span>
                      <span className="mt-1 text-sm font-bold">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time slots */}
              {booking.date && (
                <div className="space-y-5">
                  {slotsFor(booking.date).map(({ label, times }) => (
                    <div key={label}>
                      <p className="mb-2 font-mono-tag text-xs text-muted-foreground">{label}</p>
                      <div className="flex flex-wrap gap-2">
                        {times.map(t => (
                          <button
                            key={t}
                            onClick={() => set("time", t)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm transition",
                              booking.time === t
                                ? "border-[#fcbb04] bg-[#fcbb04]/10 text-[#fcbb04]"
                                : "border-white/10 hover:border-white/30"
                            )}
                          >{t}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                disabled={!step1ok}
                onClick={() => setStep(2)}
                className="mt-8 w-full rounded-xl bg-[#fcbb04] py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </>
          )}

          {/* ─ STEP 2 ─────────────────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <p className="mb-6 font-mono-tag text-xs text-muted-foreground">↳ Vehicle details</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Make">
                    <input value={booking.make} onChange={e => set("make", e.target.value)}
                      placeholder="e.g. Toyota" className={inputCls} />
                  </Field>
                  <Field label="Model">
                    <input value={booking.model} onChange={e => set("model", e.target.value)}
                      placeholder="e.g. Corolla" className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Year">
                    <input value={booking.year} onChange={e => set("year", e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 2020" maxLength={4} className={inputCls} />
                  </Field>
                  <Field label="Odometer (km)">
                    <input value={booking.odometer} onChange={e => set("odometer", e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 85000" className={inputCls} />
                  </Field>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setStep(1)}
                  className="rounded-xl border border-white/10 px-6 py-3.5 text-sm hover:border-white/30 transition">
                  ← Back
                </button>
                <button disabled={!step2ok} onClick={() => setStep(3)}
                  className="flex-1 rounded-xl bg-[#fcbb04] py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed">
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ─ STEP 3 ─────────────────────────────────────────────────────── */}
          {step === 3 && (
            <>
              <p className="mb-6 font-mono-tag text-xs text-muted-foreground">↳ Your details</p>
              <div className="space-y-4">
                <Field label="Full Name">
                  <input value={booking.name} onChange={e => set("name", e.target.value)}
                    placeholder="Jane Smith" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone">
                    <input value={booking.phone} onChange={e => set("phone", e.target.value)}
                      placeholder="+61 4XX XXX XXX" className={inputCls} />
                  </Field>
                  <Field label="Email">
                    <input value={booking.email} onChange={e => set("email", e.target.value)}
                      placeholder="jane@example.com" className={inputCls} />
                  </Field>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setStep(2)}
                  className="rounded-xl border border-white/10 px-6 py-3.5 text-sm hover:border-white/30 transition">
                  ← Back
                </button>
                <button disabled={!step3ok} onClick={() => setConfirmed(true)}
                  className="flex-1 rounded-xl bg-[#fcbb04] py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed">
                  Confirm Booking ✓
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT PANEL — Summary ───────────────────────────────────────── */}
        <div className="border-t border-white/10 bg-white/[0.02] p-8 md:border-l md:border-t-0 md:p-10">
          <p className="mb-6 font-mono-tag text-xs text-muted-foreground">↳ Your booking</p>

          {booking.services.length === 0 && !booking.date ? (
            <p className="text-sm text-muted-foreground">Your selections will appear here as you go.</p>
          ) : (
            <div className="space-y-6 text-sm">
              {booking.services.length > 0 && (
                <div>
                  <p className="mb-2 font-mono-tag text-[10px] text-muted-foreground uppercase tracking-widest">Services</p>
                  {booking.services.map(s => (
                    <p key={s} className="flex items-center gap-2">
                      <span className="text-[#fcbb04]">✓</span> {s}
                    </p>
                  ))}
                </div>
              )}

              {booking.date && (
                <div>
                  <p className="mb-2 font-mono-tag text-[10px] text-muted-foreground uppercase tracking-widest">Date & Time</p>
                  <p>{summaryDate}</p>
                  {booking.time && <p className="text-muted-foreground">{booking.time}</p>}
                </div>
              )}

              {booking.make && (
                <div>
                  <p className="mb-2 font-mono-tag text-[10px] text-muted-foreground uppercase tracking-widest">Vehicle</p>
                  <p>{[booking.year, booking.make, booking.model].filter(Boolean).join(" ")}</p>
                  {booking.odometer && <p className="text-muted-foreground">{Number(booking.odometer).toLocaleString()} km</p>}
                </div>
              )}

              {booking.name && (
                <div>
                  <p className="mb-2 font-mono-tag text-[10px] text-muted-foreground uppercase tracking-widest">Contact</p>
                  <p>{booking.name}</p>
                  {booking.phone && <p className="text-muted-foreground">{booking.phone}</p>}
                  {booking.email && <p className="text-muted-foreground">{booking.email}</p>}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
