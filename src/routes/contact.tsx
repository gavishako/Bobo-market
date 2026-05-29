import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { Phone, Mail, MapPin, Clock, Truck, Music2 } from "lucide-react";
import logo from "@/assets/logo-bobo.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Bobo-Market" },
      { name: "description", content: "Contactez Bobo-Market à Kinshasa : téléphone, e-mail, adresses et horaires." },
      { property: "og:title", content: "Contact — Bobo-Market" },
      { property: "og:description", content: "Votre partenaire de confiance pour les fruits et légumes à Kinshasa." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="w-full py-10">
        <div className="flex flex-col items-center justify-center text-center gap-2 md:gap-3">
          <img src={logo} alt="Bobo-Market" className="h-14 w-14 rounded-full object-contain" />
          <div className="font-display text-2xl text-primary">Bobo-Market</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Contact</div>
          <p className="mt-4 text-xs uppercase tracking-widest text-gold">Nous sommes Bobo-Market</p>
          <p className="mt-2 font-display text-2xl text-muted-foreground">votre partenaire de confiance</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-primary md:text-6xl">
            La qualité est<br /><em className="text-gold">notre signature</em>.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Nous sommes spécialisés dans la vente de fruits et légumes importés, locaux et divers.
          </p>
        </div>

        <div className="mt-10 grid gap-4 grid-cols-2">
          <Card icon={<Phone className="h-5 w-5" />} title="Téléphone">
            <a href="tel:+243808884449" className="block hover:text-primary">+243 80 888 4449</a>
            <a href="tel:+243823539530" className="block hover:text-primary">+243 82 353 9530</a>
          </Card>
          <Card icon={<Mail className="h-5 w-5" />} title="E-mail">
            <a href="mailto:bobomarket229@gmail.com" className="hover:text-primary">bobomarket229@gmail.com</a>
          </Card>
          <Card icon={<Music2 className="h-5 w-5" />} title="TikTok">
            <span>BOBO-MARKET</span>
          </Card>
          <Card icon={<Clock className="h-5 w-5" />} title="Horaires">
            <p>Lundi – Samedi</p>
            <p className="text-muted-foreground">07h30 – 16h00</p>
            <p className="mt-2">Dimanche</p>
            <p className="text-muted-foreground">07h30 – 12h30</p>
          </Card>
          <Card icon={<MapPin className="h-5 w-5" />} title="Adresses">
            <p>N°3, 13ème Rue Limeté industrielle — réf. Radio Elikya.</p>
            <p className="mt-2">N°202, Av. Des Enseignements, croisement Éthiopie à Kasavubu.</p>
          </Card>
          <Card icon={<Truck className="h-5 w-5" />} title="Livraison">
            <p>Nous livrons partout à Kinshasa à partir de 30 kilos.</p>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm w-full">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">{icon}</div>
        <h2 className="font-display text-base text-primary">{title}</h2>
      </div>
      <div className="mt-2 text-xs">{children}</div>
    </div>
  );
}
