"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { useCart, useToast } from "@/app/global";
import { getItemPrice } from "@/utils/weightPrice";

interface ProductCardProps {
    product: Product;
    index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
    const { addItem, updateQuantity, getItemQuantity } = useCart();
    const { showToast } = useToast();
    const quantity = getItemQuantity(product.id);
    const [selectedWeight, setSelectedWeight] = useState(
        product.weightOptions[product.weightOptions.length - 1] // defaults to 1 kg
    );
    const [imgError, setImgError] = useState(false);

    // Real layout has 1k on left, 1/2k middle, 1/4k on right RTL
    // We'll reverse the array to match the display exactly (1ك | ½ك | ¼ك)
    const sortedWeights = [...product.weightOptions].reverse();

    const handleAdd = () => {
        addItem(product, selectedWeight);
        showToast(`تم إضافة ${product.name} للسلة`);
    };

    return (
        <div className="product-card" style={{ animationDelay: `${index * 0.05}s` }}>
            {/* Heart Icon top left in RTL (visual right) */}
            <div className="product-card-heart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </div>

            {product.badge && (
                <span className="product-card-badge-top">{product.badge}</span>
            )}

            {/* Image Area */}
            <div className="product-card-image">
                {imgError ? (
                    <div className="product-bowl-placeholder" style={{ width: 100, height: 100, marginTop: 0 }}></div>
                ) : (
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={160}
                        height={160}
                        onError={() => setImgError(true)}
                        style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    />
                )}
            </div>

            <div className="product-card-body">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>

                <div className="product-rating">
                    <div className="product-stars">
                        {/* 5 golden stars */}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        ))}
                    </div>
                    <span className="product-review-count">({product.reviewCount})</span>
                </div>

                <div className="product-weights-group">
                    {sortedWeights.map((w) => (
                        <button
                            key={w}
                            className={`weight-option ${selectedWeight === w ? 'selected' : ''}`}
                            onClick={() => setSelectedWeight(w)}
                        >
                            {selectedWeight === w && (
                                <svg className="weight-check" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                            )}
                            {w}
                        </button>
                    ))}
                </div>

                <div className="product-price-row">
                    <div className="product-price">
                        <span className="amount">{getItemPrice(product.price, selectedWeight)}</span>
                        <span className="currency">{product.unit}</span>
                    </div>
                </div>

                {!product.inStock ? (
                    <button
                        className="product-add-btn"
                        disabled
                        style={{
                            background: "#f1f5f9",
                            color: "#94a3b8",
                            border: "1px solid #cbd5e1",
                            cursor: "not-allowed",
                        }}
                    >
                        ✕ غير متوفر حالياً
                    </button>
                ) : quantity === 0 ? (
                    <button className="product-add-btn" onClick={handleAdd}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                        أضف للطلب
                    </button>
                ) : (
                    <div className="product-qty-row">
                        <button className="qty-btn" onClick={() => updateQuantity(product.id, quantity - 1)}>-</button>
                        <span className="qty-val">{quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                    </div>
                )}
            </div>
        </div>
    );
}