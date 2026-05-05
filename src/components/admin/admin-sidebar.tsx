import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, MessageSquare, Clock, Users, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

const nav = [
  { href: "/admin/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/bookings",   label: "Bookings",   icon: Calendar },
  { href: "/admin/inquiries",  label: "Inquiries",  icon: MessageSquare },
  { href: "/admin/slots",      label: "Manage Slots", icon: Clock },
] as const;

const superAdminNav = [
  { href: "/admin/users", label: "Users", icon: Users },
] as const;

export function AdminSidebar() {
  const { pathname }       = useLocation();
  const navigate           = useNavigate();
  const { profile, signOut } = useAuth();
  const isSuperAdmin       = profile?.role === "super_admin";

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/admin/login" });
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0e0e0e]">
      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-5">
        <Link to="/">
          <img src={logo} alt="Mac City" className="h-9 w-auto" />
        </Link>
        <p className="mt-2 font-mono-tag text-[10px] text-muted-foreground">Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition",
              pathname.startsWith(href)
                ? "bg-[#fcbb04]/10 text-[#fcbb04]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}

        {isSuperAdmin && (
          <>
            <div className="my-3 border-t border-white/10" />
            <p className="mb-1 px-4 font-mono-tag text-[10px] text-muted-foreground">Super Admin</p>
            {superAdminNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition",
                  pathname.startsWith(href)
                    ? "bg-[#fcbb04]/10 text-[#fcbb04]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fcbb04]/15 text-[#fcbb04]">
            <ShieldCheck size={14} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{profile?.full_name ?? profile?.email}</p>
            <p className="font-mono-tag text-[10px] text-muted-foreground capitalize">
              {profile?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
