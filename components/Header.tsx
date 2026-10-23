"use client";

import React from "react";
import Image from "next/image";
import { useCart } from "@/app/global";

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onCartClick: () => void;
}

export default function Header({
    searchQuery,
    onSearchChange,
    onCartClick,
}: HeaderProps) {
    const { totalItems } = useCart();

    return (
        <>
            {/* Top info bar */}
            <div className="top-bar">
                <div className="top-bar-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                    <span>منتجات طبيعية 100%</span>
                </div>
                <div className="top-bar-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span>جودة عالية</span>
                </div>
                <div className="top-bar-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                    <span>توصيل سريع لكل المحافظات</span>
                </div>
            </div>

            {/* Main header */}
            <header className="header">
                <div className="header-inner">

                    {/* Logo and Nav (Right) */}
                    <div className="header-right">
                        <a href="#" className="header-logo-container" title="كيلو لب">
                            <Image
                                src="/products/hero.jpg"
                                alt="كيلو لب"
                                width={48}
                                height={48}
                                style={{
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    display: "block",
                                    border: "1px solid #eef2f6",
                                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)"
                                }}
                                priority
                            />
                        </a>
                        <nav className="header-nav">
                            <a href="#" className="header-nav-link active">الرئيسية</a>
                            <a href="#" className="header-nav-link">لب </a>
                            <a href="#" className="header-nav-link">مكسرات</a>
                            <a href="#" className="header-nav-link">مقرمشات</a>
                            <a href="#" className="header-nav-link">عروضنا</a>
                        </nav>
                    </div>

                    {/* Search (Center) */}
                    <div className="header-center">
                        <div className="header-search">
                            <svg className="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                            <input
                                id="search-input"
                                type="text"
                                className="header-search-input"
                                placeholder="ابحث عن منتج..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions (Left) */}
                    <div className="header-left">
                        <button className="header-action-btn">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            <span>حسابي</span>
                        </button>
                        <button className="header-action-btn">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                            <span>المفضلة</span>
                        </button>
                        <button className="header-action-btn" onClick={onCartClick}>
                            <div style={{ position: 'relative' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                                {totalItems > 0 ? (
                                    <span className="header-action-badge">{totalItems}</span>
                                ) : (
                                    <span className="header-action-badge">0</span>
                                )}
                            </div>
                            <span>السلة</span>
                        </button>
                    </div>

                </div>
            </header>
        </>
    );
}