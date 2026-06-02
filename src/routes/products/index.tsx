import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fcfa } from "@/lib/format";
import { normalizeProductImageUrl } from "@/lib/utils";
import { z } from "zod";

const searchSchema = z.object({ category: z.enum(["fruit", "legume"]).optional() });

export const Route = createFileRoute("/products/")({
  component: ProductsList,
  validateSearch: (s) => searchSchema.parse(s),
});

type CatalogProduct = {
  id: string;
  name: string;
  category: "fruit" | "legume";
  price_per_kg: number;
  image_url: string;
  product_images: { url: string; position: number }[];
};

const NAME_TO_IMAGE: Record<string, string> = {
  tomate: "tomates.jpg",
  ananas: "ananas.jpg",
  gingembre: "gingembre.jpg",
  chou: "chou.jpg",
  carotte: "carottes.jpg",
  champignon: "champignons.jpg",
  passion: "passion.jpg",
  "pomme de terre": "pomme-de-terre.jpg",
  orange: "orange.jpg",
  pomme: "pomme-rouge-verte.jpg",
  mandarine: "mandarine.jpg",
  kiwi: "kiwi.jpg",
  fraise: "fraise.jpg",
  "chou fleur": "chou-fleur.jpg",
  ciboulette: "ciboulette.jpg",
  betterave: "betterave.jpg",
  papaye: "papaye.jpg",
  poivron: "poivrons-verts.jpg",
  ail: "ail.jpg",
  oignon: "oignons.jpg",
  brocoli: "brocolis.jpg",
  avocat: "avocat.jpg",
  banane: "bananes.jpg",
  mangue: "mangues.jpg",
  raisin: "raisins.jpg",
};

function pickImageByProductName(name: string) {
  const normalizedName = name.toLowerCase();
  for (const [key, fileName] of Object.entries(NAME_TO_IMAGE)) {
    if (normalizedName.includes(key)) {
      return `/products/${fileName}`;
    }
  }
  return "/products/placeholder.svg";
}

function ProductsList() {
  const { category } = useSearch({ from: "/products/" });
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<"fruit" | "legume">(category === "legume" ? "legume" : "fruit");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    const { data, error } = await supabase
      .from("products")
      .select("id,name,category,price_per_kg,product_images(url,position)")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setProducts([]);
    } else {
      const productsFromDb: CatalogProduct[] = (data ?? []).map((product) => {
        const firstImage = [...(product.product_images ?? [])]
          .sort((a, b) => a.position - b.position)
          .find((img) => !!img.url)?.url;

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          price_per_kg: Number(product.price_per_kg ?? 0),
          image_url: firstImage || pickImageByProductName(product.name),
          product_images: product.product_images ?? [],
        };
      });

      setProducts(productsFromDb);
    }

    if (!silent) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setActiveCategory(category === "legume" ? "legume" : "fruit");
  }, [category]);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("products-live-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          fetchProducts(true);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_images" },
        () => {
          fetchProducts(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.category === activeCategory),
    [products, activeCategory],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10">
      {error ? (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Impossible de charger les produits depuis Supabase. Veuillez réessayer.
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activeCategory === "fruit" ? "default" : "outline"}
          onClick={() => setActiveCategory("fruit")}
        >
          Fruits
        </Button>
        <Button
          type="button"
          variant={activeCategory === "legume" ? "default" : "outline"}
          onClick={() => setActiveCategory("legume")}
        >
          Légumes
        </Button>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : !products.length ? (
        <div>Aucun produit trouvé.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>{product.name}</CardHeader>
              <CardContent>
                <img
                  src={normalizeProductImageUrl(product.image_url) || "/products/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-32 object-cover mb-2"
                  onError={e => (e.currentTarget.src = "/products/placeholder.svg")}
                />
                <div>{fcfa(product.price_per_kg)} / kg</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {product.category === "fruit" ? "Fruit" : "Légume"}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>

          {!filteredProducts.length ? (
            <div className="mt-4 text-sm text-muted-foreground">
              Aucun produit dans la catégorie {activeCategory === "fruit" ? "Fruits" : "Légumes"}.
            </div>
          ) : null}
        </>
      )}
      </div>

      <Footer />
    </div>
  );
}
