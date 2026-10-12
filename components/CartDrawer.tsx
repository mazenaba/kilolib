"use client";

import React from "react";
import { useCart } from "@/app/global";
import { openWhatsApp } from "@/utils/whatsapp";
import { getItemPrice } from "@/utils/weightPrice";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, updateQuantity, removeItem, clearCart, totalPrice } =
        useCart();

    const handleCheckout = () => {
        if (items.length === 0) return;
        openWhatsApp(items, totalPrice);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`cart-overlay ${isOpen ? "open" : ""}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
                {/* Header */}
                <div className="cart-drawer-header">
                    <h2 className="cart-drawer-title">🛒 سلة المشتريات</h2>
                    <button
                        className="cart-drawer-close"
                        onClick={onClose}
                        aria-label="إغلاق السلة"
                    >
                        ✕
                    </button>
                </div>

                {/* Items */}
                <div className="cart-drawer-items">
                    {items.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty-icon">🛒</div>
                            <div className="cart-empty-text">سلتك فاضية</div>
                            <div className="cart-empty-sub">
                                أضف منتجات لتبدأ التسوق!
                            </div>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.product.id} className="cart-item">
                                <div className="cart-item-emoji">🥜</div>

                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.product.name}</div>
                                    <div className="cart-item-weight">{item.selectedWeight}</div>
                                    <div className="cart-item-price">
                                        {getItemPrice(item.product.price, item.selectedWeight) * item.quantity} ج.م
                                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 4 }}>
                                            ({getItemPrice(item.product.price, item.selectedWeight)} ج.م × {item.quantity})
                                        </span>
                                    </div>
                                </div>

                                <div className="cart-item-controls">
                                    <button
                                        className="cart-item-qty-btn"
                                        onClick={() =>
                                            updateQuantity(item.product.id, item.quantity - 1)
                                        }
                                        aria-label="تقليل"
                                    >
                                        −
                                    </button>
                                    <span className="cart-item-qty">{item.quantity}</span>
                                    <button
                                        className="cart-item-qty-btn"
                                        onClick={() =>
                                            updateQuantity(item.product.id, item.quantity + 1)
                                        }
                                        aria-label="زيادة"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className="cart-item-remove"
                                    onClick={() => removeItem(item.product.id)}
                                    aria-label={`حذف ${item.product.name}`}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="cart-total-row">
                            <span className="cart-total-label">الإجمالي</span>
                            <span className="cart-total-amount">{totalPrice} ج.م</span>
                        </div>

                        <button
                            id="checkout-whatsapp"
                            className="cart-checkout-btn"
                            onClick={handleCheckout}
                        >
                            <span style={{ fontSize: 20 }}>💬</span>
                            اطلب عبر واتساب
                        </button>

                        <button className="cart-clear-btn" onClick={clearCart}>
                            تفريغ السلة
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}