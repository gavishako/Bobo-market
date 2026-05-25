import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fcfa } from "@/lib/format";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ count: products }, { count: orders }, { count: customers }, { data: revenue }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total").eq("payment_status", "paid"),
      ]);
      const total = (revenue ?? []).reduce((s: number, r: any) => s + Number(r.total), 0);
      return { products: products ?? 0, orders: orders ?? 0, customers: customers ?? 0, revenue: total };
    },
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-primary">Tableau de bord</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Produits" value={data?.products ?? "…"} />
        <Stat label="Commandes" value={data?.orders ?? "…"} />
        <Stat label="Clients" value={data?.customers ?? "…"} />
        <Stat label="Revenu encaissé" value={data ? fcfa(data.revenue) : "…"} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl text-primary">{value}</div>
    </div>
  );
}
