import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg md:hidden z-50">
          <nav className="flex flex-col gap-0">
            <Link 
              to="/" 
              className="px-4 py-3 border-b border-border hover:bg-secondary active:bg-secondary" 
              activeOptions={{ exact: true }}
              onClick={closeMenu}
            >
              Accueil
            </Link>
            <Link 
              to="/products" 
              className="px-4 py-3 border-b border-border hover:bg-secondary active:bg-secondary"
              onClick={closeMenu}
            >
              Boutique
            </Link>
            <button
              onClick={() => {
                router.navigate({ to: "/products", search: { category: "fruit" } as any });
                closeMenu();
              }}
              className="px-4 py-3 border-b border-border hover:bg-secondary active:bg-secondary text-left w-full"
            >
              Fruits
            </button>
            <button
              onClick={() => {
                router.navigate({ to: "/products", search: { category: "legume" } as any });
                closeMenu();
              }}
              className="px-4 py-3 border-b border-border hover:bg-secondary active:bg-secondary text-left w-full"
            >
              Légumes
            </button>
            <Link 
              to="/contact" 
              className="px-4 py-3 hover:bg-secondary active:bg-secondary"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

