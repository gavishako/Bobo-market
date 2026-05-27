import { Outlet, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Package, Users, ClipboardList, Home } from "lucide-react";
import logo from "@/assets/logo-bobo.jpg";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (role && role !== "admin") navigate({ to: "/" });
  }, [user, role, loading]);

  if (loading || !user || role === null) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Chargement…</div>;
  }
  if (role !== "admin") return null;

  return (
    <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
      <aside className="bg-sidebar p-6 text-sidebar-foreground">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Bobo-Market" className="h-10 w-10 rounded-full object-contain" />
          <div>
            <div className="font-display text-2xl text-gold">Bobo-Market</div>
            <div className="text-xs uppercase tracking-widest opacity-60">Admin</div>
          </div>
        </div>
        <nav className="mt-8 space-y-1 text-sm">
          <NavItem to="/admin" icon={<Home className="h-4 w-4" />}>Tableau de bord</NavItem>
          <NavItem to="/admin/products" icon={<Package className="h-4 w-4" />}>Produits</NavItem>
          <NavItem to="/admin/orders" icon={<ClipboardList className="h-4 w-4" />}>Commandes</NavItem>
          <NavItem to="/admin/customers" icon={<Users className="h-4 w-4" />}>Clients</NavItem>
        </nav>
        <Link to="/" className="mt-10 block text-xs opacity-70 hover:opacity-100">← Retour au site</Link>
      </aside>
      <main className="bg-background p-6 md:p-10"><Outlet /></main>
    </div>
  );
}

function NavItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link to={to as any} activeOptions={{ exact: true }} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent" activeProps={{ className: "bg-sidebar-accent text-gold" }}>
      {icon}{children}
    </Link>
  );
}
