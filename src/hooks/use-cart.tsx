import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  product_id: string;
  name: string;
  price_per_kg: number;
  quantity_kg: number;
  image?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const KEY = "bobo-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (raw) try { setItems(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((cur) => {
      const ex = cur.find((i) => i.product_id === item.product_id);
      if (ex) return cur.map((i) => i.product_id === item.product_id ? { ...i, quantity_kg: i.quantity_kg + item.quantity_kg } : i);
      return [...cur, item];
    });
  };
  const updateQty = (id: string, qty: number) => {
    setItems((cur) => cur.map((i) => i.product_id === id ? { ...i, quantity_kg: Math.max(0.25, qty) } : i));
  };
  const removeItem = (id: string) => setItems((cur) => cur.filter((i) => i.product_id !== id));
  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price_per_kg * i.quantity_kg, 0);
  const count = items.reduce((s, i) => s + i.quantity_kg, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
