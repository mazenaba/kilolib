"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
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
                        <Image
                            src="/products/hero.jpg"
                            alt="كيلو لب"
                            width={320}
                            height={320}
                            style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "50%" }}
                            priority
                        />
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

            {/* Contact & Location Section */}
            <section className="contact-section">
                <div className="contact-inner">
                    <div className="contact-header">
                        <span className="contact-header-icon">📍</span>
                        <div>
                            <h2 className="contact-title">تواصل معنا</h2>
                            <p className="contact-subtitle">نحن هنا لخدمتك في أي وقت</p>
                        </div>
                    </div>

                    <div className="contact-grid">
                        {/* Info Cards */}
                        <div className="contact-cards">
                            <a href="tel:+201044220707" className="contact-card">
                                <div className="contact-card-icon">📞</div>
                                <div>
                                    <div className="contact-card-label">اتصل بنا</div>
                                    <div className="contact-card-value" dir="ltr">+20 104 422 0707</div>
                                </div>
                            </a>

                            <a href="https://wa.me/201044220707" target="_blank" rel="noreferrer" className="contact-card contact-card-whatsapp">
                                <div className="contact-card-icon">💬</div>
                                <div>
                                    <div className="contact-card-label">واتساب</div>
                                    <div className="contact-card-value" dir="ltr">+20 104 422 0707</div>
                                </div>
                            </a>

                            <div className="contact-card">
                                <div className="contact-card-icon">📍</div>
                                <div>
                                    <div className="contact-card-label">العنوان</div>
                                    <div className="contact-card-value">امام دوران كليوباترا, طريق القصر - عجيبة الغرام،  مرسي مطروح، مصر</div>
                                    <div className="contact-card-value">الفرع الثاني بجوار معصرة فيرجينيا-شارع القصر- مرسي مطروح، مصر</div>
                                </div>
                            </div>

                            <div className="contact-card">
                                <div className="contact-card-icon">🕐</div>
                                <div>
                                    <div className="contact-card-label">ساعات العمل</div>
                                    <div className="contact-card-value">علي مدار الساعه </div>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="contact-map">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1048.0740017249072!2d27.170571430359487!3d31.356983743618507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1461f9dd2321987b%3A0x7d4144677a1077ec!2z2YXYrdmF2LXYqSDZg9mK2YTZiCDZhNio!5e1!3m2!1sar!2seg!4v1791776429984!5m2!1sar!2seg"
                                width="100%"
                                height="100%"
                                style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="موقعنا على الخريطة"
                            />
                        </div>
                    </div>
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