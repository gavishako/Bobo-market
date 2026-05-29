import { Link, useRouter } from "@tanstack/react-router";
import { User, LogOut, ShieldCheck, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { MobileMenu } from "@/components/mobile-menu";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo-bobo.jpg";

export function Header() {
  const { user, role, signOut } = useAuth();
  const { count } = useCart();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="w-full flex h-12 lg:h-16 items-start justify-between px-0">
        <Link to="/" className="flex flex-row items-center gap-1 min-w-0">
          <img src={logo} alt="Bobo-Market" className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-full object-contain flex-shrink-0" />
          <div className="leading-tight min-w-0 flex flex-col justify-center -mt-3">
            <div className="font-display text-base sm:text-lg lg:text-xl xl:text-2xl text-primary truncate">Bobo-Market</div>
            <div className="text-[9px] sm:text-xs lg:text-sm xl:text-base uppercase tracking-[0.18em] text-muted-foreground truncate">Votre partenaire</div>
          </div>
        </Link>

        <nav className="hidden gap-6 sm:gap-8 text-lg sm:text-xl lg:text-2xl xl:text-3xl md:flex items-start">
          <Link to="/" className="hover:text-primary transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-primary font-semibold" }}>Accueil</Link>
          <Link to="/products" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>Boutique</Link>
          <Link to="/products" search={{ category: "fruit" } as any} className="hover:text-primary transition-colors ml-2">Fruits</Link>
          <Link to="/products" search={{ category: "legume" } as any} className="hover:text-primary transition-colors mr-2">Légumes</Link>
          <Link to="/contact" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>Contact</Link>
        </nav>

        <div className="flex items-start gap-2 sm:gap-3">
          <Button variant="ghost" size="lg" onClick={() => router.navigate({ to: "/cart" })} className="relative p-3 sm:p-4 lg:p-5">
            <ShoppingBasket className="h-8 w-8 sm:h-10 sm:w-10" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 sm:h-6 min-w-5 sm:min-w-6 place-items-center rounded-full bg-gold px-1 sm:px-1.5 text-[10px] sm:text-xs font-semibold text-gold-foreground">
                {count.toFixed(count % 1 === 0 ? 0 : 1)}
              </span>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-52">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.navigate({ to: "/account" })}>Mon compte</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.navigate({ to: "/account/orders" })}>Mes commandes</DropdownMenuItem>
                {role === "admin" && (
                  <DropdownMenuItem onClick={() => router.navigate({ to: "/admin" })}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Espace admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.navigate({ to: "/auth" })} size="lg" variant="default" className="hidden sm:inline-flex px-6 py-3 text-lg lg:text-xl">
              Se connecter
            </Button>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 sm:gap-10 px-4 sm:px-6 py-8 sm:py-12 grid-cols-1 sm:grid-cols-3">
        <div>
          <div className="font-display text-xl sm:text-2xl text-gold">Bobo-Market</div>
          <p className="mt-2 max-w-xs text-sm opacity-80">
            Fruits et légumes frais, livrés directement chez vous. Sélectionnés chaque matin auprès de producteurs locaux.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm uppercase tracking-widest text-gold">Boutique</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/products" className="hover:opacity-100 transition-opacity">Tous les produits</Link></li>
            <li><Link to="/products" search={{ category: "fruit" } as any} className="hover:opacity-100 transition-opacity">Fruits</Link></li>
            <li><Link to="/products" search={{ category: "legume" } as any} className="hover:opacity-100 transition-opacity">Légumes</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm uppercase tracking-widest text-gold">Contact</h4>
          <p className="text-sm opacity-80">Congo/Kinshasa<br />contact@bobo-market.bf</p>
        </div>
      </div>
      <div className="border-t border-sidebar-border/40 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Bobo-Market. Tous droits réservés.
      </div>
    </footer>
  );
}
