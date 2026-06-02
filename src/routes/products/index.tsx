import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fcfa } from "@/lib/format";

export const Route = createFileRoute("/products/")({
  component: ProductsList,
});

type CatalogProduct = {
  id: string;
  name: string;
  category: "fruit" | "legume";
  price_per_kg: number;
  image_url: string;
};

const LOCAL_IMAGE_NAMES = [
  "ail.jpg",
  "ananas.jpg",
  "avocat.jpg",
  "bananes.jpg",
  "betterave.jpg",
  "brocolis.jpg",
  "carottes.jpg",
  "champignons.jpg",
  "chou-fleur.jpg",
  "chou.jpg",
  "ciboulette.jpg",
  "fraise.jpg",
  "fraises.jpg",
  "fruit-passion.jpg",
  "gingembre.jpg",
  "gombo.jpg",
  "kiwi.jpg",
  "mandarine.jpg",
  "mangues.jpg",
  "mathe.jpg",
  "oignons-verts.jpg",
  "oignons.jpg",
  "orange.jpg",
  "papaye.jpg",
  "passion.jpg",
  "poivrons-rouges-jaunes.jpg",
  "poivrons-verts.jpg",
  "pomme-de-terre.jpg",
  "pomme-rouge-verte.jpg",
  "raisins.jpg",
  "tomates.jpg",
];

const LOCAL_PRODUCTS: CatalogProduct[] = Array.from({ length: 44 }, (_, index) => {
  const imageName = LOCAL_IMAGE_NAMES[index % LOCAL_IMAGE_NAMES.length];
  const category = index % 2 === 0 ? "fruit" : "legume";

  return {
    id: `local-${index + 1}`,
    name: `Produit local ${String(index + 1).padStart(2, "0")}`,
    category,
    price_per_kg: 3500 + (index % 10) * 1000,
    image_url: `/products/${imageName}`,
  };
});

function normalizeProductName(name: string | null | undefined) {
  return (name ?? "").trim().toLowerCase();
}

function mergeWithLocalFallback(productsFromDb: CatalogProduct[]) {
  if (productsFromDb.length >= 44) {
    return productsFromDb;
  }

  const namesFromDb = new Set(productsFromDb.map((p) => normalizeProductName(p.name)));
  const localComplement = LOCAL_PRODUCTS.filter((p) => !namesFromDb.has(normalizeProductName(p.name)));

  return [...productsFromDb, ...localComplement].slice(0, 44);
}

function ProductsList() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("products")
        .select("id,name,category,price_per_kg")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setProducts(LOCAL_PRODUCTS);
      } else {
        const productsFromDb: CatalogProduct[] = (data ?? []).map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price_per_kg: Number(product.price_per_kg ?? 0),
          image_url: `/products/${product.id}.jpg`,
        }));

        setProducts(mergeWithLocalFallback(productsFromDb));
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (!products.length) return <div>Aucun produit trouvé.</div>;

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Données partielles depuis Supabase, catalogue local utilisé en secours.
        </div>
      ) : null}

      <div className="mb-4 text-sm text-muted-foreground">
        {products.length} produits affichés
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>{product.name}</CardHeader>
          <CardContent>
            <img
              src={product.image_url || `/products/${product.id}.jpg`}
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
    </div>
  );
}
