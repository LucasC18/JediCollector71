import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { Product, CartItem } from "@/types/product";

/* =======================
   Types
   ======================= */
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "lego-consult-cart";

/* =======================
   Storage Helper (Safari-safe)
   ======================= */
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage no disponible:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("No se pudo guardar en localStorage:", e);
    }
  },
};

/* =======================
   Provider
   ======================= */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  /* Load from storage */
  useEffect(() => {
    const stored = safeStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setItems(parsed);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.warn("Error al cargar carrito:", e);
      setItems([]);
    }
  }, []);

  /* Persist */
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* Actions */
  const addToCart = useCallback((product: Product) => {
    if (!product.inStock) return;

    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev;

      const newItem: CartItem = {
        ...product,
        quantity: 1,
      };

      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: string) => items.some((item) => item.id === productId),
    [items]
  );

  const itemCount = useMemo(() => items.length, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* =======================
   Hook
   ======================= */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};