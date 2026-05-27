import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { fcfa } from "@/lib/format";
import { ArrowRight, Leaf, Truck, ShieldCheck, Clock } from "lucide-react";
import hero from "@/assets/hero-market.jpg";
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
    queryKey: ["available-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,category,price_per_kg,stock_kg,available,product_images(url,position)")
        .eq("available", true)
        .gt("stock_kg", 0)
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
          <div className="absolute inset-0 bg-background/75 sm:bg-background/70 md:bg-gradient-to-r md:from-background/80 md:via-background/60 md:to-background/30" />
        </div>
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16 lg:py-24">
          <div className="grid items-center gap-2 sm:gap-8 md:gap-10 grid-cols-2">
            <div className="max-w-2xl">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl leading-tight text-primary">
                Le marché du jour,<br /><em className="text-[oklch(0.85_0.20_130)]">livré à Kinshasa</em>.
              </h1>
              <p className="mt-2 sm:mt-3 md:mt-4 max-w-lg text-sm sm:text-base text-muted-foreground">
                Livraison de fruits et légumes frais, importants et locaux et de saison, cueillis chez nos producteurs, déposés à votre porte.
              </p>
              <div className="mt-4 sm:mt-6">
                <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/products">Découvrir la boutique <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" /></Link>
                </Button>
              </div>
            </div>

            <HeroCarousel />
          </div>
        </div>
      </section>


      {/* CATEGORIES */}
      <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
        <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
          <CategoryCard title="Fruits" img={heroCarousel1} to="/products" cat="fruit" />
          <CategoryCard title="Légumes" img={heroCarousel2} to="/products" cat="legume" />
        </div>
      </section>

      {/* FEATURED CAROUSEL */}
      <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
        <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gold">Sélection du marché</p>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary">Mis en vedette</h2>
          </div>
          <Link to="/products" className="hidden text-xs sm:text-sm text-primary hover:underline md:inline">Tout voir →</Link>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : featured.length === 0 ? (
          <div className="rounded-lg sm:rounded-xl border border-dashed border-border p-4 sm:p-6 text-center text-sm text-muted-foreground">
            Aucun produit en vedette pour le moment. L'admin peut en ajouter depuis l'espace admin.
          </div>
        ) : (
          <Carousel opts={{ align: "start", loop: true }} plugins={[autoplay.current]} className="w-full">
            <CarouselContent className="-ml-2 sm:-ml-3">
              {featured.map((p) => {
                const img = [...(p.product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url;
                return (
                  <CarouselItem key={p.id} className="basis-[78%] max-w-[18rem] pl-2 sm:pl-3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Link to="/products/$id" params={{ id: p.id }} className="group block">
                      <div className="overflow-hidden rounded-lg sm:rounded-xl bg-secondary">
                        {img ? (
                          <img src={img} alt={p.name} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : <div className="aspect-square bg-muted" />}
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        <div>
                          <h3 className="font-display text-sm sm:text-base md:text-lg line-clamp-2">{p.name}</h3>
                          <p className="text-[8px] sm:text-xs uppercase tracking-wider text-muted-foreground">{p.category === "fruit" ? "Fruit" : "Légume"}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-semibold text-primary">{fcfa(p.price_per_kg)}</div>
                          <div className="text-[7px] sm:text-[8px] uppercase tracking-wider text-muted-foreground">/ kg</div>
                        </div>
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
      <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 pb-8 sm:pb-12 md:pb-16">
        <div className="mb-4 sm:mb-6 flex flex-col gap-2">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gold">En stock</p>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary">Disponibles</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Produits prêts à être livrés dès aujourd'hui.</p>
          </div>
        </div>

        {loadingAvailable ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : available.length === 0 ? (
          <div className="rounded-lg sm:rounded-xl border border-dashed border-border p-4 sm:p-6 text-center text-sm text-muted-foreground">
            Aucun produit disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {available.map((p) => {
              const img = [...(p.product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url;
              return (
                <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="group block overflow-hidden rounded-lg sm:rounded-lg bg-card shadow-sm transition hover:shadow-[var(--shadow-elegant)]">
                  {img ? (
                    <img src={img} alt={p.name} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" />
                  ) : <div className="aspect-square bg-muted" />}
                  <div className="p-2 sm:p-3 md:p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground">{p.category === "fruit" ? "Fruit" : "Légume"}</div>
                      <span className="rounded-full bg-[oklch(0.95_0.06_140)] px-1 sm:px-1.5 py-0.5 text-[7px] sm:text-[8px] font-medium text-[oklch(0.35_0.12_140)] whitespace-nowrap">En stock</span>
                    </div>
                    <h3 className="font-display text-sm sm:text-base md:text-lg text-primary line-clamp-2">{p.name}</h3>
                    <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-semibold">{fcfa(p.price_per_kg)} <span className="text-[8px] font-normal text-muted-foreground">/kg</span></span>
                      <span className="text-[8px] text-muted-foreground">{p.stock_kg}kg</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 rounded-3xl bg-primary p-8 text-primary-foreground md:grid-cols-3 md:p-12">
          <Value icon={<Leaf />} title="Frais du matin" desc="Cueillis et triés chaque jour avant la livraison." />
          <Value icon={<Truck />} title="Livraison rapide" desc="Livré à votre porte partout à Kinshasa." />
          <Value icon={<ShieldCheck />} title="Paiement flexible" desc="Mobile Money ou à la réception du colis." />
        </div>
      </section>

      {/* HORAIRES */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid gap-0 md:grid-cols-[1fr_1.2fr]">
            <div className="bg-primary p-8 text-primary-foreground md:p-12">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-gold text-gold-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-xs uppercase tracking-widest opacity-80">Horaires</p>
              <h2 className="font-display text-4xl md:text-5xl">Bobo-Market</h2>
              <p className="mt-3 text-sm opacity-80">
                Nous sommes à votre service tous les jours pour vous livrer les meilleurs fruits et légumes de Kinshasa.
              </p>
            </div>
            <div className="p-8 md:p-12">
              <ul className="divide-y divide-border">
                {[
                  { day: "Lundi", hours: "08h00 — 16h00" },
                  { day: "Mardi", hours: "08h00 — 16h00" },
                  { day: "Mercredi", hours: "08h00 — 16h00" },
                  { day: "Jeudi", hours: "08h00 — 16h00" },
                  { day: "Vendredi", hours: "08h00 — 16h00" },
                  { day: "Samedi", hours: "08h00 — 16h00" },
                  { day: "Dimanche", hours: "08h00 — 16h00" },
                ].map((s) => (
                  <li key={s.day} className="flex items-center justify-between py-3">
                    <span className="font-medium text-primary">{s.day}</span>
                    <span className="text-sm text-muted-foreground">{s.hours}</span>
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
    <Link to="/products" search={{ category: cat } as any} className="group relative block overflow-hidden rounded-3xl">
      <img src={img} alt={title} loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
      <div className="absolute bottom-6 left-6 text-primary-foreground">
        <h3 className="font-display text-4xl">{title}</h3>
        <p className="mt-1 inline-flex items-center text-sm">Découvrir <ArrowRight className="ml-1 h-4 w-4" /></p>
      </div>
    </Link>
  );
}

function Value({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div>
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-gold text-gold-foreground">{icon}</div>
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mt-1 text-sm opacity-80">{desc}</p>
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
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-[oklch(0.85_0.20_130)]/20 blur-2xl" />
      <Carousel opts={{ loop: true }} plugins={[autoplay.current]} className="overflow-hidden rounded-[2rem] shadow-[var(--shadow-elegant)]">
        <CarouselContent className="ml-0">
          {slides.map((s) => (
            <CarouselItem key={s.src} className="pl-0">
              <img src={s.src} alt={s.alt} loading="lazy" width={800} height={800} className="aspect-square w-full object-cover" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
