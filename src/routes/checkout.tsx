import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const { items, total, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"mobile_money" | "cash_on_delivery">("cash_on_delivery");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate({ to: "/auth", search: { redirect: "/checkout" } as any });
    else {
      supabase.from("profiles").select("phone,address").eq("id", user.id).single().then(({ data }) => {
        if (data?.address) setAddress(data.address);
        if (data?.phone) setPhone(data.phone);
      });
    }
  }, [user, authLoading]);

  if (!user) return null;
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl p-10 text-center">
          <p className="text-muted-foreground">Votre panier est vide.</p>
        </div>
      </div>
    );
  }

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      total,
      delivery_address: address,
      phone,
      notes,
      payment_method: payment,
      payment_status: "pending",
      status: "pending",
    }).select().single();

    if (error || !order) {
      setSubmitting(false);
      return toast.error(error?.message ?? "Erreur lors de la création de la commande");
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.name,
        price_per_kg: i.price_per_kg,
        quantity_kg: i.quantity_kg,
        subtotal: i.price_per_kg * i.quantity_kg,
      }))
    );
    setSubmitting(false);
    if (itemsErr) return toast.error(itemsErr.message);

    clear();
    toast.success("Commande enregistrée !");
    navigate({ to: "/account/orders" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <form onSubmit={submitOrder} className="mx-auto w-full grid max-w-5xl gap-6 sm:gap-8 md:gap-10 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_360px]">
        <div className="space-y-4 sm:space-y-6">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-primary">Livraison & paiement</h1>

          <div className="space-y-3 rounded-lg sm:rounded-xl bg-card p-4 sm:p-5 shadow-sm">
            <h2 className="font-display text-lg sm:text-xl">Adresse de livraison</h2>
            <div>
              <Label className="text-xs sm:text-sm">Adresse complète</Label>
              <Textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Quartier, rue, repère…" className="mt-1 text-xs sm:text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Téléphone</Label>
              <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+226 ..." className="mt-1 text-xs sm:text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Notes (facultatif)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 text-xs sm:text-sm" />
            </div>
          </div>

          <div className="space-y-3 rounded-lg sm:rounded-xl bg-card p-4 sm:p-5 shadow-sm">
            <h2 className="font-display text-lg sm:text-xl">Mode de paiement</h2>
            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as any)} className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50">
                <RadioGroupItem value="cash_on_delivery" className="mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base">Paiement à la livraison</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Réglez en espèces ou Mobile Money à la réception du colis.</div>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50">
                <RadioGroupItem value="mobile_money" className="mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base">Mobile Money (à venir)</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Orange / MTN / Moov. La commande sera marquée à payer — un agent vous appellera pour finaliser.</div>
                </div>
              </label>
            </RadioGroup>
          </div>
        </div>

        <aside className="h-fit space-y-3 sm:space-y-4 rounded-lg sm:rounded-xl bg-primary p-4 sm:p-6 text-primary-foreground">
          <h2 className="font-display text-lg sm:text-2xl">Votre commande</h2>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            {items.map((i) => (
              <li key={i.product_id} className="flex justify-between gap-2">
                <span className="opacity-80 min-w-0 truncate">{i.name} × {i.quantity_kg} kg</span>
                <span className="flex-shrink-0">{fcfa(i.price_per_kg * i.quantity_kg)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-primary-foreground/20 pt-2 sm:pt-3 text-base sm:text-lg font-semibold flex justify-between"><span>Total</span><span>{fcfa(total)}</span></div>
          <Button type="submit" disabled={submitting} className="w-full bg-gold text-gold-foreground hover:bg-gold/90 text-xs sm:text-sm">
            {submitting ? "Envoi…" : "Confirmer la commande"}
          </Button>
        </aside>
      </form>
      <Footer />
    </div>
  );
}
