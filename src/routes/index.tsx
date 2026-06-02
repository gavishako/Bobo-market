import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { fcfa } from "@/lib/format";
import { normalizeProductImageUrl } from "@/lib/utils";
import { ArrowRight, Leaf, Truck, ShieldCheck, Clock } from "lucide-react";
import hero from "@/assets/hero-market.jpg";
import catFruits from "@/assets/cat-fruits.jpg";
import catVeg from "@/assets/cat-vegetables.jpg";
import heroCarousel1 from "@/assets/carousel-fruits-1.jpg";
import heroCarousel2 from "@/assets/carousel-veg-1.jpg";
import heroCarousel3 from "@/assets/carousel-fruits-2.jpg";
import heroCarousel4 from "@/assets/carousel-veg-2.jpg";

export const Route = createFileRoute("/")({ component: Home });

type ProductWithImage = {
  id: string;
  name: string;
  category: "fruit" | "legume";
  price_per_kg: number;
  available: boolean;
  product_images: { url: string; position: number }[];
};

function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,category,price_per_kg,available,product_images(url,position)")
        .eq("featured", true)
        .eq("available", true)
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data as ProductWithImage[];
    },
  });
}

function useAvailableProducts() {
  return useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,category,price_per_kg,stock_kg,available,product_images(url,position)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (ProductWithImage & { stock_kg: number })[];
    },
  });
}

function Home() {
  const { data: featured = [], isLoading } = useFeaturedProducts();
  const { data: available = [], isLoading: loadingAvailable } = useAvailableProducts();
  const autoplay = useRef(Autoplay({ delay: 2200, stopOnInteraction: false, stopOnMouseEnter: true }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={hero} alt="Fruits et légumes frais sur étal" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-background/70 sm:bg-background/60 md:bg-gradient-to-r md:from-background/80 md:via-background/60 md:to-background/30" />
        </div>
        <div className="w-full py-10">
          <div className="flex flex-row items-center gap-4 sm:gap-6 lg:grid lg:grid-cols-2 lg:gap-14 xl:gap-16">
            <div className="flex-1 ml-0 md:ml-8 lg:ml-16 xl:ml-24 2xl:ml-32 max-w-2xl">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[4.2rem] xl:text-[5rem] leading-tight text-primary text-center md:text-left">
                Le marché du jour,<br /><em className="text-[oklch(0.85_0.20_130)] text-2xl sm:text-3xl md:text-4xl lg:text-[2.8rem] xl:text-[3.2rem]">livré à Kinshasa</em>.
              </h1>
              <p className="mt-4 sm:mt-5 md:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-muted-foreground text-center md:text-left">
                Livraison de fruits, légumes et divers, importés et locaux et de saison, cueillis chez nos producteurs, déposés à votre porte.
              </p>
              <div className="mt-6 sm:mt-7 flex justify-center md:justify-start">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-4 sm:px-7 sm:py-5 text-base sm:text-lg lg:text-xl">
                  <Link to="/products">Découvrir la boutique <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center items-center flex-shrink-0 w-[120px] h-[120px] sm:w-[180px] sm:h-[180px] lg:w-full lg:h-full">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="w-full max-w-screen-2xl mx-auto py-6">
        <div className="grid grid-cols-2 gap-4">
          <CategoryCard title="Fruits" img={catFruits} to="/products" cat="fruit" />
          <CategoryCard title="Légumes" img={catVeg} to="/products" cat="legume" />
        </div>
      </section>

      {/* FEATURED CAROUSEL */}
      <section className="w-full py-10">
        <div className="mb-6 flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-widest text-gold">Sélection du marché</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary">Mis en vedette</h2>
          </div>
          <Link to="/products" className="hidden text-sm sm:text-base text-primary hover:underline md:inline">Tout voir →</Link>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : featured.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Aucun produit en vedette pour le moment. L'admin peut en ajouter depuis l'espace admin.
          </div>
        ) : (
          <Carousel opts={{ align: "start", loop: true }} plugins={[autoplay.current]} className="w-full">
            <CarouselContent>
              {featured.map((p) => {
                const img = normalizeProductImageUrl(
                  [...(p.product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url,
                );
                return (
                  <CarouselItem key={p.id} className="basis-[45%] max-w-[260px] lg:max-w-[320px] pl-2 sm:pl-3">
                    <Link to="/products/$id" params={{ id: p.id }} className="group block">
                      <div className="overflow-hidden bg-secondary">
                        {img ? (
                          <img src={img} alt={p.name} loading="lazy" className="aspect-square w-full max-w-[220px] lg:max-w-[280px] mx-auto object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.src = "/products/placeholder.svg"; }} />
                        ) : <div className="aspect-square bg-muted max-w-[220px] lg:max-w-[280px] mx-auto" />}
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        <h3 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl line-clamp-2">{p.name}</h3>
                        <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground">{p.category === "fruit" ? "Fruit" : "Légume"}</p>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-base sm:text-lg lg:text-xl font-semibold">{fcfa(p.price_per_kg)} <span className="text-xs sm:text-sm font-normal text-muted-foreground">/ kg</span></span>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        )}
      </section>

      {/* AVAILABLE PRODUCTS */}
      <section className="w-full pb-8">
        <div className="mb-4 flex flex-col gap-2">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gold">En stock</p>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary">Disponibles</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Produits prêts à être livrés dès aujourd'hui.</p>
          </div>
        </div>

        {loadingAvailable ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : available.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Aucun produit disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {available.map((p) => {
              const img = (p.product_images && p.product_images.length > 0)
                ? normalizeProductImageUrl(p.product_images.find(img => !!img.url)?.url)
                : undefined;
              return (
                <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="group block overflow-hidden bg-card shadow-sm transition hover:shadow-[var(--shadow-elegant)]">
                  {img ? (
                    <img src={img} alt={p.name} loading="lazy" className="aspect-square w-full max-w-[220px] lg:max-w-[280px] mx-auto object-cover transition group-hover:scale-105" onError={(e) => { e.currentTarget.src = "/products/placeholder.svg"; }} />
                  ) : (
                    <div className="aspect-square bg-muted max-w-[220px] lg:max-w-[280px] mx-auto flex items-center justify-center">
                      <span className="text-xs text-muted-foreground text-center px-2">Image manquante</span>
                    </div>
                  )}
                  <div className="p-3 sm:p-4 md:p-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-xs sm:text-sm lg:text-base uppercase tracking-widest text-muted-foreground">{p.category === "fruit" ? "Fruit" : "Légume"}</div>
                      <span className="rounded-full bg-[oklch(0.95_0.06_140)] px-2 py-1 text-[8px] sm:text-[9px] lg:text-xs font-semibold text-[oklch(0.35_0.12_140)] whitespace-nowrap">En stock</span>
                    </div>
                    <h3 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary line-clamp-2">{p.name}</h3>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-base sm:text-lg lg:text-xl font-semibold">{fcfa(p.price_per_kg)} <span className="text-xs sm:text-sm font-normal text-muted-foreground">/kg</span></span>
                      <span className="text-xs sm:text-sm lg:text-base text-muted-foreground">{p.stock_kg} kg</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>


      {/* VALUE PROPS */}
      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10 pb-10 sm:pb-14 md:pb-16">
        <div className="grid gap-6 rounded-3xl bg-primary p-8 sm:p-10 lg:p-12 text-primary-foreground md:grid-cols-3">
          <Value icon={<Leaf />} title="Frais du matin" desc="Cueillis et triés chaque jour avant la livraison." />
          <Value icon={<Truck />} title="Livraison rapide" desc="Livré à votre porte partout dans Bobo-Dioulasso." />
          <Value icon={<ShieldCheck />} title="Paiement flexible" desc="Mobile Money ou à la réception du colis." />
        </div>
      </section>

      {/* HORAIRES */}
      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10 pb-10 sm:pb-14 md:pb-16">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid gap-0 md:grid-cols-[1fr_1.2fr]">
            <div className="bg-primary p-8 sm:p-10 md:p-12 text-primary-foreground">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-gold text-gold-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <p className="text-xs sm:text-sm uppercase tracking-widest opacity-80">Horaires</p>
              <h2 className="font-display text-5xl md:text-6xl">Bobo-Market</h2>
              <p className="mt-4 text-sm sm:text-base opacity-80">
                Nous sommes à votre service tous les jours pour vous livrer les meilleurs fruits et légumes de Kinshasa.
              </p>
            </div>
            <div className="p-6 sm:p-8 md:p-10">
              <ul className="divide-y divide-border">
                {[
                  { day: "Lundi", hours: "07h30 — 16h00" },
                  { day: "Mardi", hours: "07h30 — 16h00" },
                  { day: "Mercredi", hours: "07h30 — 16h00" },
                  { day: "Jeudi", hours: "07h30 — 16h00" },
                  { day: "Vendredi", hours: "07h30 — 16h00" },
                  { day: "Samedi", hours: "07h30 — 16h00" },
                  { day: "Dimanche", hours: "07h30 — 12h30" },
                ].map((s) => (
                  <li key={s.day} className="flex items-center justify-between py-4">
                    <span className="font-medium text-base sm:text-lg text-primary">{s.day}</span>
                    <span className="text-sm sm:text-base text-muted-foreground">{s.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
}

function CategoryCard({ title, img, cat }: { title: string; img: string; to: string; cat: "fruit" | "legume" }) {
  return (
    <Link to="/products" search={{ category: cat } as any} className="group relative block overflow-hidden rounded-xl shadow-md min-h-[120px] w-full">
      <img src={img} alt={title} loading="lazy" className="aspect-[4/3] w-full h-[220px] md:h-[280px] object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
      <div className="absolute bottom-8 left-8 text-primary-foreground">
       <h3 className="font-display text-5xl md:text-7xl">{title}</h3>
       <p className="mt-4 inline-flex items-center text-xl md:text-3xl">Découvrir <ArrowRight className="ml-4 h-7 w-7" /></p>
      </div>
    </Link>
  );
}

function Value({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div>
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-gold text-gold-foreground">{icon}</div>
      <h3 className="font-display text-3xl md:text-4xl">{title}</h3>
      <p className="mt-2 text-base opacity-80">{desc}</p>
    </div>
  );
}

function HeroCarousel() {
  const autoplay = useRef(Autoplay({ delay: 2800, stopOnInteraction: false, stopOnMouseEnter: true }));
  const slides = [
    { src: heroCarousel1, alt: "Fruits tropicaux frais" },
    { src: heroCarousel2, alt: "Panier de légumes frais" },
    { src: heroCarousel3, alt: "Agrumes juteux" },
    { src: heroCarousel4, alt: "Herbes et légumes verts" },
  ];
  return (
    <div className="relative block w-full max-w-[220px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[380px] xl:max-w-[420px] mx-auto lg:mx-0 self-start">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-[oklch(0.85_0.20_130)]/20 blur-2xl" />
      <Carousel opts={{ loop: true }} plugins={[autoplay.current]} className="h-full overflow-hidden rounded-[2rem] shadow-[var(--shadow-elegant)]">
        <CarouselContent className="h-full ml-0">
          {slides.map((s) => (
            <CarouselItem key={s.src} className="h-full pl-0">
              <img src={s.src} alt={s.alt} loading="lazy" width={1000} height={1000} className="h-full w-full object-cover" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
