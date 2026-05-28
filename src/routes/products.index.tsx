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
      <div className="w-full py-8">
        <Button asChild variant="secondary" size="lg" className="mb-6 rounded-xl">
          <Link to="/" className="text-sm sm:text-base"><ArrowLeft className="mr-2 h-4 w-4" />Retour à l'accueil</Link>
        </Button>
        <div className="mb-8 flex flex-wrap items-end gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Boutique</p>
            <h1 className="font-display text-5xl text-primary">
              {category === "fruit" ? "Nos fruits" : category === "legume" ? "Nos légumes" : "Tous les produits"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant={!category ? "default" : "outline"} size="sm"><Link to="/products">Tout</Link></Button>
            <Button asChild variant={category === "fruit" ? "default" : "outline"} size="sm"><Link to="/products" search={{ category: "fruit" } as any}>Fruits</Link></Button>
            <Button asChild variant={category === "legume" ? "default" : "outline"} size="sm"><Link to="/products" search={{ category: "legume" } as any}>Légumes</Link></Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Aucun produit disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((p: any) => {
              const img = [...(p.product_images ?? [])].sort((a: any, b: any) => a.position - b.position)[0]?.url;
              return (
                <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="group block overflow-hidden bg-card shadow-sm transition hover:shadow-[var(--shadow-elegant)]">
                  {img ? <img src={img} alt={p.name} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" /> : <div className="aspect-square bg-muted" />}
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.category === "fruit" ? "Fruit" : "Légume"}</div>
                    <h3 className="font-display text-2xl text-primary">{p.name}</h3>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-lg font-semibold">{fcfa(p.price_per_kg)} <span className="text-xs font-normal text-muted-foreground">/kg</span></span>
                      <span className="text-xs text-muted-foreground">Stock: {p.stock_kg} kg</span>
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
