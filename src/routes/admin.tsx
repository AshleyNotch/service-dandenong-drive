import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { pathname } = useLocation();
  const isLoginPage  = pathname === "/admin/login";

  // Login page renders standalone — no sidebar
  if (isLoginPage) return <Outlet />;

  return <AdminGuard />;
}

function AdminGuard() {
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) { navigate({ to: "/admin/login" }); return; }
    if (profile && profile.role !== "admin" && profile.role !== "super_admin") {
      navigate({ to: "/admin/login" });
    }
  }, [session, profile, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#fcbb04]" />
      </div>
    );
  }

  if (!session || !profile) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
