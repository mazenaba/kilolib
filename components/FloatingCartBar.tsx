"use client";

import React from "react";
import { useCart } from "@/app/global";
import { openWhatsApp } from "@/utils/whatsapp";

interface FloatingCartBarProps {
    onCartClick: () => void;
}

export default function FloatingCartBar({ onCartClick }: FloatingCartBarProps) {
    const { items, totalItems, totalPrice } = useCart();

    const handleCheckout = () => {
        if (items.length === 0) return;
        openWhatsApp(items, totalPrice);
    };

    return (
        <div className={`floating-cart-bar ${totalItems > 0 ? "visible" : ""}`}>
            <div className="floating-cart-inner">
                <div className="floating-cart-right" onClick={onCartClick}>
                    <div className="floating-cart-icon-circle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                        <span className="floating-cart-icon-badge">{totalItems}</span>
                    </div>
                </div>

                <div className="floating-cart-details">
                    <span className="floating-cart-count-text">
                        {totalItems} منتجات
                    </span>
                    <span className="floating-cart-total-text">
                        الإجمالي{" "}
                        <span className="floating-cart-total-amount">{totalPrice} ج.م</span>
                    </span>
                </div>

                <button className="floating-cart-checkout" onClick={handleCheckout}>
                    اطلب عبر واتساب
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                </button>
            </div>
        </div>
    );
}
