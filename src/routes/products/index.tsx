import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fcfa } from "@/lib/format";

export const Route = createFileRoute("/products/")({
  component: ProductsList,
});

function ProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        setError(error.message);
        setProducts([]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!products.length) return <div>Aucun produit trouvé.</div>;

  return (
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
            <div>{fcfa(product.price)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
