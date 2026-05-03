import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "hostack_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(menuItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
          description: menuItem.description,
          size: menuItem.size,
          quantity: 1
        }
      ];
    });
  }

  function increaseQuantity(id) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  }

  function decreaseQuantity(id) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  const totals = useMemo(() => {
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { totalItems, totalPrice };
  }, [items]);

  const value = {
    items,
    ...totals,
    addItem,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart должен использоваться внутри CartProvider");
  return ctx;
}
