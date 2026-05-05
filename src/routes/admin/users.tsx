import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, Role } from "@/lib/database.types";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheck, Shield, User } from "lucide-react";
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
  const [users, setUsers]      = useState<Profile[]>([]);
  const [loading, setLoading]  = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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
                    {isMe || isSA ? (
                      <span className="font-mono-tag text-[10px] text-muted-foreground">—</span>
                    ) : (
                      <div className="flex gap-2">
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
                      </div>
                    )}
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
