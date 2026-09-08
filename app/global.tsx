"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    ReactNode,
} from "react";
import { CartItem, Product } from "@/types";

/* ==================== CART CONTEXT ==================== */
interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, weight: string) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart(): CartContextType {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = useCallback((product: Product, weight: string) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + 1, selectedWeight: weight }
                        : i
                );
            }
            return [...prev, { product, quantity: 1, selectedWeight: weight }];
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
    }, []);

    const updateQuantity = useCallback(
        (productId: string, quantity: number) => {
            if (quantity <= 0) {
                removeItem(productId);
                return;
            }
            setItems((prev) =>
                prev.map((i) =>
                    i.product.id === productId ? { ...i, quantity } : i
                )
            );
        },
        [removeItem]
    );

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = useMemo(
        () => items.reduce((sum, i) => sum + i.quantity, 0),
        [items]
    );

    const totalPrice = useMemo(
        () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
        [items]
    );

    const getItemQuantity = useCallback(
        (productId: string) => {
            const item = items.find((i) => i.product.id === productId);
            return item ? item.quantity : 0;
        },
        [items]
    );

    const value = useMemo(
        () => ({
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
            getItemQuantity,
        }),
        [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, getItemQuantity]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ==================== TOAST CONTEXT ==================== */
interface ToastContextType {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);

    const showToast = useCallback((message: string) => {
        setToast(message);
        setVisible(true);
        setTimeout(() => setVisible(false), 2000);
        setTimeout(() => setToast(null), 2400);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className={`toast ${visible ? "show" : ""}`}>
                    <span>✅</span> {toast}
                </div>
            )}
        </ToastContext.Provider>
    );
}