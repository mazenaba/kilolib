"use client";

import React, { useState, useMemo } from "react";
import { products, categories } from "@/data/products";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import FloatingCartBar from "@/components/FloatingCartBar";

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [cartOpen, setCartOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (activeCategory !== "all") {
            filtered = filtered.filter((p) => p.category === activeCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.includes(searchQuery) ||
                    p.description.includes(searchQuery) ||
                    p.name.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [searchQuery, activeCategory]);

    return (
        <>
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCartClick={() => setCartOpen(true)}
            />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            قعدتك وسهرتك
                            <br />
                            أحلى مع كيلو لب
                        </h1>
                        <p className="hero-subtitle">
                            أجود أنواع اللب والمكسرات والمقرمشات
                            <br />
                            طازجة.. نظيفة.. ومضمونة 100%
                        </p>
                        <button
                            className="hero-cta"
                            onClick={() => {
                                const el = document.querySelector(".products-section");
                                el?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            تسوق الآن
                            <span style={{
                                background: '#709d2b',
                                color: 'white',
                                borderRadius: '50%',
                                width: 22,
                                height: 22,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 6
                            }}>&lt;</span>
                        </button>
                    </div>
                    <div className="hero-image">
                        <div className="product-bowl-placeholder" style={{ width: 250, height: 250, marginTop: 0 }}></div>
                    </div>
                </div>
                <div className="hero-wave"></div>
            </section>

            {/* Category Filter */}
            <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            {/* Section Header */}
            <div className="section-header">
                <div className="section-title">
                    <span className="section-title-icon">🔥</span>
                    <div>
                        <h2>الأكثر طلباً</h2>
                        <div className="section-subtitle">منتجاتنا المميزة</div>
                    </div>
                </div>
                <span className="section-view-all">عرض الكل</span>
            </div>

            {/* Products Grid */}
            <main className="products-section">
                <div className="products-grid">
                    {filteredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "var(--color-text-muted)",
                        }}
                    >
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                            لا توجد منتجات
                        </div>
                        <div style={{ fontSize: 14 }}>
                            جرب تغيير البحث أو القسم.
                        </div>
                    </div>
                )}
            </main>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">✅</div>
                        <div className="feature-title">جودة مضمونة</div>
                        <div className="feature-desc">منتجات مختارة بأعلى جودة</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🚚</div>
                        <div className="feature-title">توصيل سريع</div>
                        <div className="feature-desc">يوصلك لكل المحافظات</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📦</div>
                        <div className="feature-title">تغليف آمن</div>
                        <div className="feature-desc">يحافظ على الجودة</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💳</div>
                        <div className="feature-title">دفع آمن</div>
                        <div className="feature-desc">طرق دفع آمنة ومتعددة</div>
                    </div>
                </div>
            </section>

            {/* Promo Banner */}
            <section className="promo-banner">
                <div className="promo-banner-inner">
                    <div className="promo-content">
                        <div className="promo-title">
                            مكسرات طازجة
                            <br />
                            لأوقاتك أحلى
                        </div>
                        <button
                            className="promo-cta"
                            onClick={() => setActiveCategory("nuts")}
                        >
                            تسوق المكسرات
                            <span>←</span>
                        </button>
                    </div>
                    <div className="promo-emoji">🥜</div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                جميع الحقوق محفوظة © كيلو لب 2024
            </footer>

            {/* Floating Cart Bar */}
            <FloatingCartBar onCartClick={() => setCartOpen(true)} />

            {/* Cart Drawer */}
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}