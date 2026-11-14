import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { CartItem } from "@/lib/reservations";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (offerId: string) => void;
  updateQuantity: (offerId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const storageKey = `capim-connect-cart-${userId}`;
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setLoaded(true);
    }
  }, [storageKey]);
  useEffect(() => {
    if (loaded) window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, loaded, storageKey]);
  const value = useMemo<CartContextValue>(() => ({
    items,
    addItem: (item) => {
      setItems((current) => {
        const existing = current.find((entry) => entry.offerId === item.offerId);
        if (existing) return current.map((entry) => entry.offerId === item.offerId ? { ...entry, quantity: Math.min(5, entry.quantity + item.quantity), selectedOption: item.selectedOption } : entry);
        return [...current, item];
      });
      toast.success("Item adicionado à seleção de reserva");
    },
    removeItem: (offerId) => setItems((current) => current.filter((item) => item.offerId !== offerId)),
    updateQuantity: (offerId, quantity) => setItems((current) => current.map((item) => item.offerId === offerId ? { ...item, quantity: Math.max(1, Math.min(5, quantity)) } : item)),
    clear: () => setItems([]),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro do CartProvider");
  return context;
}
