import { Link, useRouter } from "@tanstack/react-router";
import { User, LogOut, ShieldCheck, ShoppingCart } from "lucide-react";
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <img src={logo} alt="Bobo-Market" className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-contain flex-shrink-0" />
          <div className="leading-tight min-w-0">
            <div className="font-display text-lg sm:text-xl text-primary truncate">Bobo-Market</div>
            <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">Votre partenaire</div>
          </div>
        </Link>

        <nav className="hidden gap-6 sm:gap-8 text-sm md:flex">
          <Link to="/" className="hover:text-primary transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-primary font-semibold" }}>Accueil</Link>
          <Link to="/products" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>Boutique</Link>
          <Link to="/products" search={{ category: "fruit" } as any} className="hover:text-primary transition-colors">Fruits</Link>
          <Link to="/products" search={{ category: "legume" } as any} className="hover:text-primary transition-colors">Légumes</Link>
          <Link to="/contact" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>Contact</Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.navigate({ to: "/cart" })} className="relative">
            <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 sm:h-5 min-w-4 sm:min-w-5 place-items-center rounded-full bg-gold px-0.5 sm:px-1 text-[8px] sm:text-[10px] font-semibold text-gold-foreground">
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
            <Button onClick={() => router.navigate({ to: "/auth" })} size="sm" variant="default" className="hidden sm:inline-flex">
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
    <footer className="mt-12 sm:mt-16 md:mt-20 border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto w-full grid max-w-7xl gap-6 sm:gap-8 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 grid-cols-1 sm:grid-cols-3">
        <div>
          <div className="font-display text-lg sm:text-xl md:text-2xl text-gold">Bobo-Market</div>
          <p className="mt-2 max-w-xs text-xs sm:text-sm opacity-80">
            Fruits et légumes frais, livrés directement chez vous. Sélectionnés chaque matin auprès de producteurs locaux.
          </p>
        </div>
        <div>
          <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm uppercase tracking-widest text-gold">Boutique</h4>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm opacity-80">
            <li><Link to="/products" className="hover:opacity-100 transition-opacity">Tous les produits</Link></li>
            <li><Link to="/products" search={{ category: "fruit" } as any} className="hover:opacity-100 transition-opacity">Fruits</Link></li>
            <li><Link to="/products" search={{ category: "legume" } as any} className="hover:opacity-100 transition-opacity">Légumes</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm uppercase tracking-widest text-gold">Contact</h4>
          <p className="text-xs sm:text-sm opacity-80">Bobo-Dioulasso, Burkina Faso<br />contact@bobo-market.bf</p>
        </div>
      </div>
      <div className="border-t border-sidebar-border/40 py-3 sm:py-4 text-center text-[10px] sm:text-xs opacity-60">
        © {new Date().getFullYear()} Bobo-Market. Tous droits réservés.
      </div>
    </footer>
  );
}
