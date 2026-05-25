import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { fcfa } from "@/lib/format";

const searchSchema = z.object({
  category: z.enum(["fruit", "legume"]).optional(),
});

export const Route = createFileRoute("/products/")({
  component: ProductsList,
  validateSearch: (s) => searchSchema.parse(s),
});

function ProductsList() {
  const { category } = useSearch({ from: "/products/" });

  const { data = [], isLoading } = useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: async () => {
      let q = supabase.from("products")
        .select("id,name,category,price_per_kg,stock_kg,available,product_images(url,position)")
        .eq("available", true)
        .order("created_at", { ascending: false });
      if (category) q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12">
        <Button asChild variant="ghost" size="sm" className="mb-4 sm:mb-6 -ml-2">
          <Link to="/"><ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />Retour à l'accueil</Link>
        </Button>
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gold">Boutique</p>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary leading-tight">
              {category === "fruit" ? "Nos fruits" : category === "legume" ? "Nos légumes" : "Tous les produits"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button asChild variant={!category ? "default" : "outline"} size="sm" className="text-xs sm:text-sm"><Link to="/products">Tout</Link></Button>
            <Button asChild variant={category === "fruit" ? "default" : "outline"} size="sm" className="text-xs sm:text-sm"><Link to="/products" search={{ category: "fruit" } as any}>Fruits</Link></Button>
            <Button asChild variant={category === "legume" ? "default" : "outline"} size="sm" className="text-xs sm:text-sm"><Link to="/products" search={{ category: "legume" } as any}>Légumes</Link></Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Aucun produit disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((p: any) => {
              const img = [...(p.product_images ?? [])].sort((a: any, b: any) => a.position - b.position)[0]?.url;
              return (
                <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="group block overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-card shadow-sm transition hover:shadow-[var(--shadow-elegant)]">
                  {img ? <img src={img} alt={p.name} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" /> : <div className="aspect-square bg-muted" />}
                  <div className="p-3 sm:p-4">
                    <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground">{p.category === "fruit" ? "Fruit" : "Légume"}</div>
                    <h3 className="font-display text-base sm:text-lg md:text-xl text-primary line-clamp-2">{p.name}</h3>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <span className="text-sm sm:text-base font-semibold">{fcfa(p.price_per_kg)} <span className="text-[8px] sm:text-xs font-normal text-muted-foreground">/kg</span></span>
                      <span className="text-[8px] sm:text-xs text-muted-foreground">Stock: {p.stock_kg}kg</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
