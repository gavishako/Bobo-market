import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fcfa } from "@/lib/format";
import { normalizeProductImageUrl } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { ShoppingBasket, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/products/$id")({ component: ProductDetail });

function ProductDetail() {
  const { id } = useParams({ from: "/products/$id" });
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*,product_images(url,position)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen"><Header /><p className="p-10 text-muted-foreground">Chargement…</p></div>;
  if (!data) return <div className="min-h-screen"><Header /><p className="p-10">Introuvable</p></div>;

  const images = [...(data.product_images ?? [])].sort((a: any, b: any) => a.position - b.position);

  function addToCart() {
    if (!data) return;
    addItem({
      product_id: data.id,
      name: data.name,
      price_per_kg: Number(data.price_per_kg),
      quantity_kg: qty,
      image: normalizeProductImageUrl(images[0]?.url),
    });
    toast.success(`${data.name} ajouté au panier`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="w-full grid gap-6 md:gap-10 py-6 md:grid-cols-2">
        <div>
          <div className="overflow-hidden bg-secondary">
            {images[activeImg] ? <img src={normalizeProductImageUrl(images[activeImg].url)} alt={data.name} className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-muted" />}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
              {images.map((im: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`overflow-hidden border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}
                  title={`Voir l'image ${i + 1}`}
                >
                  <img src={normalizeProductImageUrl(im.url)} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-start">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gold">{data.category === "fruit" ? "Fruit" : "Légume"}</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary">{data.name}</h1>
          <p className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold">{fcfa(Number(data.price_per_kg))} <span className="text-sm sm:text-base font-normal text-muted-foreground">/ kg</span></p>
          {data.description && <p className="mt-3 text-sm text-muted-foreground">{data.description}</p>}

          <div className="mt-6 sm:mt-8">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Quantité (kg)</label>
            <div className="mt-2 flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 sm:h-10 w-8 sm:w-10" onClick={() => setQty((q) => Math.max(0.25, +(q - 0.25).toFixed(2)))}><Minus className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
              <Input type="number" min={0.25} step={0.25} value={qty} onChange={(e) => setQty(Math.max(0.25, +e.target.value))} className="w-20 sm:w-24 text-center text-sm sm:text-base" />
              <Button variant="outline" size="icon" className="h-8 sm:h-10 w-8 sm:w-10" onClick={() => setQty((q) => +(q + 0.25).toFixed(2))}><Plus className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Sous-total : <strong className="text-foreground">{fcfa(Number(data.price_per_kg) * qty)}</strong></p>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-3">
            <Button className="flex-1 min-h-12 text-base sm:text-base font-semibold" size="lg" onClick={addToCart}><ShoppingBasket className="mr-2 h-5 w-5" /> <span>Ajouter au panier</span></Button>
            <Button className="flex-1 min-h-12 text-base sm:text-base font-semibold" size="lg" variant="outline" onClick={() => { addToCart(); navigate({ to: "/cart" }); }}><span>Commander</span></Button>
          </div>

          {data.stock_kg < 5 && <p className="mt-4 text-xs sm:text-sm text-destructive">Plus que {data.stock_kg} kg en stock !</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
