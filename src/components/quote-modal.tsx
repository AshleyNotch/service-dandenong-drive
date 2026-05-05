import { useState, useEffect, useRef } from "react";
import { X, Wrench, Car, User } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  "Roadworthy Inspections",
  "Mechanical Repairs",
  "Log Book Servicing",
  "Vehicle Diagnostics",
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuoteForm {
  services: string[];
  make:     string;
  model:    string;
  year:     string;
  odometer: string;
  name:     string;
  phone:    string;
  email:    string;
  notes:    string;
}

const empty: QuoteForm = {
  services: [], make: "", model: "", year: "", odometer: "",
  name: "", phone: "", email: "", notes: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v: string) => v.replace(/\D/g, "").length >= 8;

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const ccLen = digits[0] === "1" ? 1 : 2;
  if (digits.length <= ccLen) return `(+${digits}`;
  const cc = digits.slice(0, ccLen);
  const local = digits.slice(ccLen);
  const groups: string[] = [];
  for (let i = 0; i < local.length; i += 3) groups.push(local.slice(i, i + 3));
  return `(+${cc}) ${groups.join(" ")}`;
}

const inputCls      = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition";
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

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[#fcbb04]">
      {icon}
      <span className="font-mono-tag text-xs uppercase tracking-widest">{children}</span>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface QuoteModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuoteModal({ open, onClose }: QuoteModalProps) {
  const [form, setForm]           = useState<QuoteForm>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched]     = useState({ phone: false, email: false });
  const overlayRef                = useRef<HTMLDivElement>(null);

  const set = <K extends keyof QuoteForm>(k: K, v: QuoteForm[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const touch = (k: "phone" | "email") => setTouched(prev => ({ ...prev, [k]: true }));

  const toggleService = (s: string) =>
    set("services", form.services.includes(s)
      ? form.services.filter(x => x !== s)
      : [...form.services, s]);

  const phoneErr = touched.phone && form.phone.trim() !== "" && !isValidPhone(form.phone) ? "Enter a valid phone number" : undefined;
  const emailErr = touched.email && form.email.trim() !== "" && !isValidEmail(form.email) ? "Enter a valid email address" : undefined;

  const canSubmit =
    form.services.length > 0 &&
    form.make.trim() && form.model.trim() && form.year.trim() &&
    form.name.trim() && isValidPhone(form.phone) && isValidEmail(form.email);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleClose() {
    onClose();
    setTimeout(() => { setForm(empty); setSubmitted(false); }, 300);
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === overlayRef.current) handleClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0e0e0e] shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0e0e0e] px-8 py-5">
          <div>
            <p className="font-mono-tag text-xs text-muted-foreground">↳ No obligation</p>
            <h2 className="mt-1 font-display text-2xl">Get a Quote</h2>
          </div>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground transition"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          /* ── Success ── */
          <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fcbb04]/15 text-[#fcbb04] text-xl">✓</div>
            <h3 className="mt-6 font-display text-2xl">Quote request received</h3>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Thanks {form.name.split(" ")[0]} — our team will review your details and send a
              personalised quote to <span className="text-foreground">{form.email}</span> within 24 hours.
            </p>
            <button
              onClick={handleClose}
              className="mt-8 rounded-full border border-white/10 px-6 py-2.5 text-sm hover:border-white/30 transition"
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <div className="px-8 py-8 space-y-10">

            {/* Service Type */}
            <div className="space-y-4">
              <SectionLabel icon={<Wrench size={14} />}>Service Type</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {SERVICES.map(s => (
                  <button key={s} type="button" onClick={() => toggleService(s)}
                    className={cn(
                      "rounded-xl border px-4 py-3.5 text-left text-sm transition",
                      form.services.includes(s)
                        ? "border-[#fcbb04] bg-[#fcbb04]/10 text-[#fcbb04]"
                        : "border-white/10 hover:border-white/25"
                    )}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Vehicle Details */}
            <div className="space-y-4">
              <SectionLabel icon={<Car size={14} />}>Vehicle Details</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Make">
                  <input value={form.make} onChange={e => set("make", e.target.value)} placeholder="e.g. Toyota" className={inputCls} />
                </Field>
                <Field label="Model">
                  <input value={form.model} onChange={e => set("model", e.target.value)} placeholder="e.g. Corolla" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Year">
                  <input value={form.year} onChange={e => set("year", e.target.value.replace(/\D/g, ""))} placeholder="e.g. 2020" maxLength={4} className={inputCls} />
                </Field>
                <Field label="Odometer (km) — optional">
                  <input value={form.odometer} onChange={e => set("odometer", e.target.value.replace(/\D/g, ""))} placeholder="e.g. 85000" className={inputCls} />
                </Field>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Personal Details */}
            <div className="space-y-4">
              <SectionLabel icon={<User size={14} />}>Your Details</SectionLabel>
              <Field label="Full Name">
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jane Smith" className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone" error={phoneErr}>
                  <input value={form.phone} onChange={e => set("phone", formatPhone(e.target.value))} onBlur={() => touch("phone")} placeholder="(+61) 412 345 678" className={phoneErr ? inputClsError : inputCls} />
                </Field>
                <Field label="Email" error={emailErr}>
                  <input value={form.email} onChange={e => set("email", e.target.value)} onBlur={() => touch("email")} placeholder="jane@example.com" className={emailErr ? inputClsError : inputCls} />
                </Field>
              </div>
              <Field label="Additional Notes — optional">
                <textarea
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                  placeholder="Describe any symptoms, warning lights, or specific concerns…"
                  rows={3}
                  className={cn(inputCls, "resize-none")}
                />
              </Field>
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => { setSubmitted(true); confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#fcbb04", "#ffffff", "#000000"] }); }}
              className="w-full rounded-xl bg-[#fcbb04] py-4 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              Send Quote Request →
            </button>

          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function GetAQuoteSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="bg-surface py-24 text-surface-foreground">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-mono-tag text-xs text-muted-foreground">↳ Not sure of the cost?</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] md:text-5xl lg:text-6xl">
              Get a free quote —{" "}
              <span className="italic text-[#fcbb04]">no obligation.</span>
            </h2>
          </div>
          <div className="md:text-right">
            <p className="mb-8 text-sm text-muted-foreground max-w-sm md:ml-auto">
              Fill in your service type, vehicle and contact details. Our team will review
              everything and send a personalised quote straight to your inbox within 24 hours.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-3 rounded-full bg-[#fcbb04] px-8 py-4 text-sm font-semibold text-black hover:opacity-90 transition"
            >
              Get a Free Quote →
            </button>
          </div>
        </div>
      </section>

      <QuoteModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
