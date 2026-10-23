"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function AdminHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    // Don't show admin header on login page
    if (pathname === "/admin/login") {
        return null;
    }

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch("/api/admin/logout", { method: "POST" });
            router.push("/admin/login");
            router.refresh();
        } catch {
            setLoggingOut(false);
        }
    };

    return (
        <header className="admin-navbar" dir="rtl">
            <div className="admin-navbar-inner">
                {/* Brand & Nav */}
                <div className="admin-nav-right">
                    <Link href="/admin" className="admin-logo-link">
                        <Image
                            src="/products/hero.jpg"
                            alt="كيلو لب"
                            width={38}
                            height={38}
                            style={{
                                borderRadius: "50%",
                                border: "1px solid #e2e8f0",
                                display: "block",
                            }}
                        />
                        <span style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>
                            كيلو لب
                        </span>
                        <span className="admin-badge">لوحة الإدارة</span>
                    </Link>

                    <nav className="admin-nav-links">
                        <Link
                            href="/admin"
                            className={`admin-nav-item ${pathname === "/admin" ? "active" : ""}`}
                        >
                            📦 المنتجات
                        </Link>
                        <Link
                            href="/admin/products/new"
                            className={`admin-nav-item ${pathname === "/admin/products/new" ? "active" : ""}`}
                        >
                            ➕ إضافة منتج
                        </Link>
                    </nav>
                </div>

                {/* Left Actions */}
                <div className="admin-nav-left">
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn-outline"
                        title="فتح المتجر في نافذة جديدة"
                    >
                        🏪 معاينة المتجر
                    </a>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="admin-btn-outline admin-btn-logout"
                    >
                        {loggingOut ? "جاري الخروج..." : "🚪 خروج"}
                    </button>
                </div>
            </div>
        </header>
    );
}
