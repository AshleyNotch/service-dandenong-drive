import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate   = useNavigate();
  const { session, profile, loading, signOut, refetchProfile } = useAuth();
  const [email, setEmail]       = useState("");
  const [sent, setSent]         = useState(false);
  const [working, setWorking]   = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (!loading && session && profile) {
      if (profile.role === "admin" || profile.role === "super_admin") {
        navigate({ to: "/admin/dashboard" });
      }
    }
  }, [session, profile, loading]);

  // Logged in but only has user role — show pending screen
  if (!loading && session && profile && profile.role === "user") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <img src={logo} alt="Mac City" className="h-12 w-auto mx-auto" />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400 mx-auto text-xl">⏳</div>
            <h2 className="font-display text-xl">Access pending</h2>
            <p className="text-sm text-muted-foreground">
              You're signed in as <span className="text-foreground">{profile.email}</span> but you don't have admin access yet. Ask the super admin to approve your account, then click below.
            </p>
            <button
              onClick={async () => { setChecking(true); await refetchProfile(); setChecking(false); }}
              disabled={checking}
              className="w-full rounded-xl bg-[#fcbb04] py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {checking ? "Checking…" : "I've been approved — check again"}
            </button>
            <button
              onClick={async () => { await signOut(); }}
              className="w-full rounded-xl border border-white/10 py-3 text-sm text-muted-foreground transition hover:border-white/30"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const redirectTo = `${window.location.origin}/admin/dashboard`;

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setWorking(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setWorking(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function handleGoogle() {
    setWorking(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) { setError(error.message); setWorking(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-4">
          <img src={logo} alt="Mac City" className="h-12 w-auto" />
          <div className="text-center">
            <h1 className="font-display text-2xl">Admin Portal</h1>
            <p className="mt-1 font-mono-tag text-xs text-muted-foreground">
              Authorised personnel only
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-6">

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={working}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm transition hover:bg-white/10 disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M43.6 24.5c0-1.5-.1-3-.4-4.5H24v8.5h11c-.5 2.6-2 4.9-4.1 6.4v5.3h6.6c3.9-3.6 6.1-8.9 6.1-15.7z" fill="#4285F4"/>
              <path d="M24 44c5.5 0 10.2-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.2 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3C9.1 39.6 16 44 24 44z" fill="#34A853"/>
              <path d="M12.6 27.6c-.4-1.2-.6-2.5-.6-3.8s.2-2.6.6-3.8v-5.3H5.8C4.3 17.5 3.5 20.6 3.5 24s.8 6.5 2.3 9.3l6.8-5.7z" fill="#FBBC05"/>
              <path d="M24 10.8c3 0 5.7 1 7.8 3l5.8-5.8C34.2 4.8 29.5 3 24 3 16 3 9.1 7.4 5.8 14.7l6.8 5.3c1.6-4.8 6.1-9.2 11.4-9.2z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-white/10" />
            <span className="font-mono-tag text-[10px] text-muted-foreground">or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Magic link */}
          {sent ? (
            <div className="rounded-xl border border-[#fcbb04]/30 bg-[#fcbb04]/5 p-4 text-center">
              <p className="text-sm font-semibold text-[#fcbb04]">Check your email</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We sent a sign-in link to <span className="text-foreground">{email}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={working || !email}
                className="w-full rounded-xl bg-[#fcbb04] py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-30"
              >
                {working ? "Sending…" : "Send magic link"}
              </button>
            </form>
          )}

          {error && (
            <p className="text-center font-mono-tag text-xs text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
