import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon, Check, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Service — Dandy Autoworks" },
      { name: "description", content: "Book your roadworthy, log book service, repair or diagnostic in 60 seconds." },
      { property: "og:title", content: "Book a Service — Dandy Autoworks" },
      { property: "og:description", content: "Pick a time slot in 60 seconds." },
    ],
  }),
  component: BookPage,
});

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const SERVICE_TYPES = [
  { id: "roadworthy", label: "Roadworthy Inspection" },
  { id: "logbook", label: "Log Book Service" },
  { id: "repair", label: "Mechanical Repair" },
  { id: "diagnostic", label: "Vehicle Diagnostics" },
  { id: "other", label: "Something else" },
];

const detailsSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(30),
});

type Booking = {
  date?: Date;
  time?: string;
  make: string;
  model: string;
  year: string;
  odometer: string;
  serviceType?: string;
  description: string;
  name: string;
  email: string;
  phone: string;
};

function BookPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const [b, setB] = useState<Booking>({
    make: "", model: "", year: "", odometer: "",
    description: "", name: "", email: "", phone: "",
  });

  const update = <K extends keyof Booking>(k: K, v: Booking[K]) => setB((p) => ({ ...p, [k]: v }));

  const canNext = useMemo(() => {
    if (step === 0) return !!b.date && !!b.time;
    if (step === 1) return b.make.trim() && b.model.trim() && /^\d{4}$/.test(b.year) && b.odometer.trim() && !!b.serviceType;
    return true;
  }, [step, b]);

  function submit() {
    const parsed = detailsSchema.safeParse({ name: b.name, email: b.email, phone: b.phone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container-page flex min-h-[80vh] items-center justify-center pt-32">
          <div className="max-w-xl text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-accent" strokeWidth={1.5} />
            <h1 className="mt-6 text-4xl font-semibold md:text-5xl">Booking received</h1>
            <p className="mt-4 text-muted-foreground">
              Thanks {b.name.split(" ")[0]} — we've reserved{" "}
              <span className="font-medium text-foreground">
                {b.date && format(b.date, "EEE d MMM")} at {b.time}
              </span>{" "}
              for your {b.year} {b.make} {b.model}. We'll send a confirmation to{" "}
              <span className="font-medium text-foreground">{b.email}</span> shortly.
            </p>
            <Button className="mt-8" onClick={() => navigate({ to: "/" })}>Back to home</Button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Toaster />
      <section className="container-page pb-20 pt-36">
        <div className="mx-auto max-w-3xl">
          <Link to="/" className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-accent">
            ← Back
          </Link>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight md:text-6xl">
            Book your service
          </h1>
          <p className="mt-3 text-muted-foreground">Three quick steps. Takes about 60 seconds.</p>

          <Stepper step={step} />

          <div className="mt-10 rounded-2xl border bg-card p-6 md:p-10">
            {step === 0 && <StepDateTime b={b} update={update} />}
            {step === 1 && <StepVehicle b={b} update={update} />}
            {step === 2 && <StepDetails b={b} update={update} />}

            <div className="mt-10 flex items-center justify-between border-t pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={submit} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Confirm booking <Check className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Time & date", "Vehicle & service", "Your details"];
  return (
    <ol className="mt-10 flex items-center gap-3 text-xs">
      {labels.map((l, i) => (
        <li key={l} className="flex flex-1 items-center gap-3">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-medium",
              i <= step ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground"
            )}
          >
            {i + 1}
          </span>
          <span className={cn("uppercase tracking-[0.18em]", i === step ? "text-foreground" : "text-muted-foreground")}>
            {l}
          </span>
          {i < labels.length - 1 && <span className="ml-2 hidden h-px flex-1 bg-border md:block" />}
        </li>
      ))}
    </ol>
  );
}

function StepDateTime({ b, update }: { b: Booking; update: <K extends keyof Booking>(k: K, v: Booking[K]) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <Label className="text-sm">Pick a date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("mt-2 w-full justify-start text-left font-normal md:w-72", !b.date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {b.date ? format(b.date, "EEEE, d MMMM yyyy") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={b.date}
              onSelect={(d) => update("date", d)}
              disabled={(date) => {
                const today = new Date(); today.setHours(0,0,0,0);
                return date < today || date.getDay() === 0;
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label className="text-sm">Pick a time slot</Label>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIME_SLOTS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update("time", t)}
              className={cn(
                "rounded-lg border px-4 py-3 text-sm transition",
                b.time === t
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-background hover:border-accent/60"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepVehicle({ b, update }: { b: Booking; update: <K extends keyof Booking>(k: K, v: Booking[K]) => void }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Make"><Input value={b.make} maxLength={40} onChange={(e) => update("make", e.target.value)} placeholder="Toyota" /></Field>
        <Field label="Model"><Input value={b.model} maxLength={40} onChange={(e) => update("model", e.target.value)} placeholder="Corolla" /></Field>
        <Field label="Year"><Input value={b.year} maxLength={4} inputMode="numeric" onChange={(e) => update("year", e.target.value.replace(/\D/g, ""))} placeholder="2019" /></Field>
        <Field label="Odometer (km)"><Input value={b.odometer} maxLength={7} inputMode="numeric" onChange={(e) => update("odometer", e.target.value.replace(/\D/g, ""))} placeholder="78500" /></Field>
      </div>

      <div>
        <Label className="text-sm">Type of service</Label>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {SERVICE_TYPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => update("serviceType", s.id)}
              className={cn(
                "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition",
                b.serviceType === s.id
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/60"
              )}
            >
              {s.label}
              <span className={cn("h-4 w-4 rounded-full border", b.serviceType === s.id ? "border-accent bg-accent" : "border-border")} />
            </button>
          ))}
        </div>
      </div>

      <Field label="Description (optional)">
        <Textarea
          rows={4}
          maxLength={1000}
          value={b.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Tell us anything we should know — symptoms, noises, dashboard lights…"
        />
      </Field>
    </div>
  );
}

function StepDetails({ b, update }: { b: Booking; update: <K extends keyof Booking>(k: K, v: Booking[K]) => void }) {
  const [agree, setAgree] = useState(false);
  return (
    <div className="space-y-6">
      <Field label="Full name"><Input value={b.name} maxLength={80} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email"><Input type="email" value={b.email} maxLength={160} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" /></Field>
        <Field label="Phone"><Input type="tel" value={b.phone} maxLength={30} onChange={(e) => update("phone", e.target.value)} placeholder="0400 000 000" /></Field>
      </div>
      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
        <span>I agree to be contacted about this booking. We won't share your details.</span>
      </label>

      <div className="rounded-lg border bg-secondary/50 p-4 text-sm">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Summary</div>
        <div className="mt-2">
          {b.date ? format(b.date, "EEE d MMM") : "—"} · {b.time ?? "—"} · {b.year} {b.make} {b.model} · {SERVICE_TYPES.find(s => s.id === b.serviceType)?.label ?? "—"}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
