import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

const STATUSES = ["pending", "confirmed", "preparing", "delivering", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;

function AdminOrders() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders")
        .select("*,order_items(*),profiles(full_name,email,phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function update(id: string, patch: any) {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Mis à jour"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); }
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-primary">Commandes</h1>
      <div className="mt-8 space-y-4">
        {data.map((o: any) => (
          <div key={o.id} className="rounded-xl bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-display text-xl">#{o.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</div>
                <div className="mt-1 text-sm">{o.profiles?.full_name || o.profiles?.email} · {o.phone}</div>
                <div className="text-sm text-muted-foreground">{o.delivery_address}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-primary">{fcfa(Number(o.total))}</div>
                <div className="text-xs uppercase text-muted-foreground">{o.payment_method === "mobile_money" ? "Mobile Money" : "À la livraison"}</div>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {o.order_items?.map((it: any) => (
                <li key={it.id} className="flex justify-between text-muted-foreground"><span>{it.product_name} × {it.quantity_kg} kg</span><span>{fcfa(Number(it.subtotal))}</span></li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Statut commande</div>
                <Select value={o.status} onValueChange={(v) => update(o.id, { status: v })}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Statut paiement</div>
                <Select value={o.payment_status} onValueChange={(v) => update(o.id, { payment_status: v })}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-muted-foreground">Aucune commande pour le moment.</p>}
      </div>
    </div>
  );
}
