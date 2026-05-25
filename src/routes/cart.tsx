import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fcfa } from "@/lib/format";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { items, updateQty, removeItem, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary">Mon panier</h1>
        {items.length === 0 ? (
          <div className="mt-6 sm:mt-8 rounded-lg sm:rounded-xl border border-dashed border-border p-6 sm:p-10 text-center">
            <p className="text-sm text-muted-foreground">Votre panier est vide.</p>
            <Button asChild className="mt-4" size="sm"><Link to="/products">Voir la boutique</Link></Button>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_350px]">
            <div className="space-y-3 sm:space-y-4">
              {items.map((it) => (
                <div key={it.product_id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 rounded-lg sm:rounded-xl bg-card p-3 sm:p-4 shadow-sm">
                  <div className="flex-shrink-0">
                    {it.image ? <img src={it.image} alt={it.name} className="h-16 sm:h-20 w-16 sm:w-20 rounded-lg object-cover" /> : <div className="h-16 sm:h-20 w-16 sm:w-20 rounded-lg bg-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-base sm:text-lg md:text-xl line-clamp-2">{it.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{fcfa(it.price_per_kg)} / kg</div>
                  </div>
                  <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
                    <Input type="number" min={0.25} step={0.25} value={it.quantity_kg} onChange={(e) => updateQty(it.product_id, +e.target.value)} className="w-16 sm:w-20 text-xs sm:text-sm" />
                    <div className="text-xs sm:text-sm font-semibold whitespace-nowrap">{fcfa(it.price_per_kg * it.quantity_kg)}</div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(it.product_id)} className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <aside className="h-fit rounded-lg sm:rounded-xl bg-primary p-4 sm:p-6 text-primary-foreground">
              <h2 className="font-display text-lg sm:text-2xl">Récapitulatif</h2>
              <div className="mt-4 space-y-2 text-xs sm:text-sm opacity-90">
                <div className="flex justify-between"><span>Sous-total</span><span>{fcfa(total)}</span></div>
                <div className="flex justify-between"><span>Livraison</span><span>À calculer</span></div>
              </div>
              <div className="my-4 border-t border-primary-foreground/20" />
              <div className="flex justify-between text-base sm:text-lg font-semibold"><span>Total</span><span>{fcfa(total)}</span></div>
              <Button onClick={() => navigate({ to: "/checkout" })} className="mt-4 sm:mt-6 w-full bg-gold text-gold-foreground hover:bg-gold/90 text-xs sm:text-sm">Passer la commande</Button>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
