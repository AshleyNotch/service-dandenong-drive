import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, Role } from "@/lib/database.types";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheck, Shield, User, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const ROLE_ICONS: Record<Role, React.ElementType> = {
  super_admin: ShieldCheck,
  admin:       Shield,
  user:        User,
};

const ROLE_COLOURS: Record<Role, string> = {
  super_admin: "text-[#fcbb04]",
  admin:       "text-blue-400",
  user:        "text-muted-foreground",
};

function UsersPage() {
  const navigate               = useNavigate();
  const { profile: myProfile } = useAuth();
  const [users, setUsers]        = useState<Profile[]>([]);
  const [loading, setLoading]    = useState(true);
  const [updating, setUpdating]  = useState<string | null>(null);
  const [deleting, setDeleting]  = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting]  = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Only super_admin can access
  useEffect(() => {
    if (myProfile && myProfile.role !== "super_admin") {
      navigate({ to: "/admin/dashboard" });
    }
  }, [myProfile]);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setUsers(data ?? []); setLoading(false); });
  }, []);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);

    // Pre-register the email so the trigger assigns admin role on sign-up
    const { error: insertErr } = await supabase
      .from("pending_admins")
      .insert({ email: inviteEmail, invited_by: myProfile?.id ?? null });

    if (insertErr) {
      setInviteError(insertErr.message);
      setInviting(false);
      return;
    }

    // Send magic link to the invited email
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: inviteEmail,
      options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` },
    });

    setInviting(false);
    if (otpErr) { setInviteError(otpErr.message); return; }
    setInviteSent(true);
    setInviteEmail("");
    setTimeout(() => setInviteSent(false), 5000);
  }

  async function deleteUser(id: string) {
    if (!confirm("Remove this user from the system? They will lose all access.")) return;
    setDeleting(id);
    await supabase.from("profiles").delete().eq("id", id);
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleting(null);
  }

  async function setRole(id: string, role: Role) {
    setUpdating(id);
    await supabase.from("profiles").update({ role }).eq("id", id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    setUpdating(null);
  }

  if (loading) return <PageLoader />;

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="font-mono-tag text-xs text-muted-foreground">↳ Super admin</p>
        <h1 className="mt-1 font-display text-4xl">Users</h1>
      </div>

      {/* Invite */}
      <div className="rounded-2xl border border-white/10 p-6 space-y-4">
        <p className="font-mono-tag text-xs text-muted-foreground">↳ Invite a new admin</p>
        <form onSubmit={sendInvite} className="flex gap-3">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="admin@example.com"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-[#fcbb04] focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!inviteEmail || inviting}
            className="flex items-center gap-2 rounded-xl bg-[#fcbb04] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-30"
          >
            <Send size={14} />
            {inviting ? "Sending…" : "Send invite"}
          </button>
        </form>
        {inviteSent && (
          <p className="font-mono-tag text-xs text-green-400">✓ Invite sent — they'll receive a magic link to sign in as admin.</p>
        )}
        {inviteError && (
          <p className="font-mono-tag text-xs text-red-400">{inviteError}</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-white/[0.02]">
            <tr>
              {["User", "Role", "Joined", "Change role"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left font-mono-tag text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(u => {
              const Icon    = ROLE_ICONS[u.role];
              const isMe    = u.id === myProfile?.id;
              const isSA    = u.role === "super_admin";
              return (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{u.full_name ?? u.email}</p>
                    {u.full_name && <p className="text-xs text-muted-foreground">{u.email}</p>}
                    {isMe && <span className="font-mono-tag text-[10px] text-[#fcbb04]">You</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className={cn("flex items-center gap-1.5 capitalize", ROLE_COLOURS[u.role])}>
                      <Icon size={13} />
                      {u.role.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 flex-wrap">
                      {!isMe && !isSA && (
                        <>
                          <button
                            disabled={u.role === "admin" || updating === u.id}
                            onClick={() => setRole(u.id, "admin")}
                            className="rounded-lg border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 font-mono-tag text-[10px] text-blue-400 transition hover:bg-blue-400/10 disabled:opacity-30"
                          >
                            {updating === u.id ? "…" : "Make admin"}
                          </button>
                          <button
                            disabled={u.role === "user" || updating === u.id}
                            onClick={() => setRole(u.id, "user")}
                            className="rounded-lg border border-white/10 px-3 py-1.5 font-mono-tag text-[10px] text-muted-foreground transition hover:border-white/30 disabled:opacity-30"
                          >
                            {updating === u.id ? "…" : "Remove admin"}
                          </button>
                        </>
                      )}
                      {!isMe && !isSA && (
                        <button
                          disabled={deleting === u.id}
                          onClick={() => deleteUser(u.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-1.5 font-mono-tag text-[10px] text-red-400 transition hover:bg-red-400/10 disabled:opacity-30"
                        >
                          <Trash2 size={11} />
                          {deleting === u.id ? "…" : "Delete"}
                        </button>
                      )}
                      {isMe && <span className="font-mono-tag text-[10px] text-muted-foreground">—</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">No users yet</td></tr>
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
