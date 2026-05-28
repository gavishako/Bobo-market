import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { fcfa, frDateTime } from "@/lib/format";

export const Route = createFileRoute("/account/orders")({ component: OrdersPage });

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", preparing: "Préparation",
  delivering: "En livraison", delivered: "Livrée", cancelled: "Annulée",
};

function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading]);

  const { data = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*,order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary">Mes commandes</h1>
        {data.length === 0 ? (
          <div className="mt-6 sm:mt-8 rounded-lg sm:rounded-xl border border-dashed border-border p-6 sm:p-10 text-center text-xs sm:text-sm text-muted-foreground">
            Aucune commande. <Link to="/products" className="text-primary underline">Voir la boutique</Link>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
            {data.map((o: any) => (
              <div key={o.id} className="rounded-lg sm:rounded-xl bg-card p-3 sm:p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div>
                    <div className="font-display text-base sm:text-lg">Commande #{o.id.slice(0, 8)}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{frDateTime(o.created_at)}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span className="rounded-full bg-secondary px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs">{STATUS_LABEL[o.status]}</span>
                    <span className="rounded-full bg-gold/20 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs">
                      {o.payment_method === "mobile_money" ? "Mobile Money" : "À la livraison"} · {o.payment_status === "paid" ? "Payée" : "Non payée"}
                    </span>
                  </div>
                </div>
                <ul className="mt-2 sm:mt-3 space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                  {o.order_items?.map((it: any) => (
                    <li key={it.id} className="flex justify-between gap-2">
                      <span className="min-w-0 truncate">{it.product_name} × {it.quantity_kg} kg</span>
                      <span className="flex-shrink-0">{fcfa(Number(it.subtotal))}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 sm:mt-3 flex justify-between border-t border-border pt-2 sm:pt-3 text-sm sm:text-base font-semibold">
                  <span>Total</span><span>{fcfa(Number(o.total))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
