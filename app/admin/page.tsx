"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { categories } from "@/data/products";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDbConfigured, setIsDbConfigured] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStock, setSelectedStock] = useState("all");

    // Delete modal state
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Check authentication and load products
    useEffect(() => {
        async function init() {
            try {
                // Verify auth
                const authRes = await fetch("/api/admin/me");
                const authData = await authRes.json();
                if (!authData.authenticated) {
                    router.push("/admin/login");
                    return;
                }

                setIsDbConfigured(authData.isDbConfigured);

                // Fetch products
                const res = await fetch("/api/products");
                const data = await res.json();
                if (data.products) {
                    setProducts(data.products);
                }
            } catch (err) {
                console.error("Dashboard init error:", err);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [router]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch =
                !searchQuery.trim() ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory =
                selectedCategory === "all" || p.category === selectedCategory;

            const matchesStock =
                selectedStock === "all"
                    ? true
                    : selectedStock === "in_stock"
                    ? p.inStock
                    : !p.inStock;

            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [products, searchQuery, selectedCategory, selectedStock]);

    // Statistics
    const stats = useMemo(() => {
        const inStockCount = products.filter((p) => p.inStock).length;
        const outOfStockCount = products.length - inStockCount;
        const activeCategories = new Set(products.map((p) => p.category)).size;
        return {
            total: products.length,
            inStock: inStockCount,
            outOfStock: outOfStockCount,
            categories: activeCategories,
        };
    }, [products]);

    // Handle Delete confirmation
    const handleDelete = async () => {
        if (!productToDelete) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${productToDelete.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok) {
                setActionMessage({ type: "error", text: data.error || "فشل حذف المنتج" });
            } else {
                setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
                setActionMessage({ type: "success", text: `تم حذف "${productToDelete.name}" بنجاح` });
                setTimeout(() => setActionMessage(null), 3000);
            }
        } catch {
            setActionMessage({ type: "error", text: "حدث خطأ أثناء الاتصال بالخادم" });
        } finally {
            setDeleting(false);
            setProductToDelete(null);
        }
    };

    const getCategoryName = (catId: string) => {
        const found = categories.find((c) => c.id === catId);
        return found ? found.name : catId;
    };

    if (loading) {
        return (
            <div className="admin-container" style={{ textAlign: "center", padding: "100px 20px" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#475569" }}>
                    جاري تحميل لوحة التحكم...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">
                        <span>📦</span> إدارة المنتجات
                    </h1>
                    <p className="admin-page-desc">
                        عرض وتعديل وحذف المنتجات المتوفرة على متجر كيلو لب
                    </p>
                </div>
                <Link href="/admin/products/new" className="admin-btn-primary">
                    <span>➕</span> إضافة منتج جديد
                </Link>
            </div>

            {/* Notification alert */}
            {actionMessage && (
                <div
                    style={{
                        padding: "12px 18px",
                        borderRadius: 8,
                        marginBottom: 20,
                        fontSize: 14,
                        fontWeight: 600,
                        background: actionMessage.type === "success" ? "#dcfce7" : "#fee2e2",
                        color: actionMessage.type === "success" ? "#15803d" : "#b91c1c",
                        border: `1px solid ${actionMessage.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                    }}
                >
                    {actionMessage.type === "success" ? "✅" : "⚠️"} {actionMessage.text}
                </div>
            )}

            {/* Connection Banner */}
            <div className={`admin-banner ${isDbConfigured ? "connected" : "fallback"}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{isDbConfigured ? "🟢" : "ℹ️"}</span>
                    <div>
                        <strong>
                            {isDbConfigured
                                ? "قاعدة بيانات Supabase السحابية نشطة ومحدثة"
                                : "الوضع المحلي (Local Fallback Mode)"}
                        </strong>
                        <div style={{ fontSize: 12, marginTop: 2, opacity: 0.9 }}>
                            {isDbConfigured
                                ? "جميع التغييرات تحفظ مباشرة وبشكل دائم في سحابة Supabase ومتاحة لجميع الزوار."
                                : "يتم حفظ التغييرات محلياً حالياً. لربط Supabase السحابي الدائم، أضف مفاتيح البيئة في .env.local أو لوحة Vercel."}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: "#eff6ff", color: "#1a6fb5" }}>
                        📦
                    </div>
                    <div>
                        <div className="admin-stat-val">{stats.total}</div>
                        <div className="admin-stat-label">إجمالي المنتجات</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: "#f0fdf4", color: "#166534" }}>
                        ✅
                    </div>
                    <div>
                        <div className="admin-stat-val">{stats.inStock}</div>
                        <div className="admin-stat-label">منتجات متوفرة</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: "#fef2f2", color: "#991b1b" }}>
                        🚫
                    </div>
                    <div>
                        <div className="admin-stat-val">{stats.outOfStock}</div>
                        <div className="admin-stat-label">منتجات نفدت</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: "#faf5ff", color: "#6b21a8" }}>
                        🏷️
                    </div>
                    <div>
                        <div className="admin-stat-val">{stats.categories}</div>
                        <div className="admin-stat-label">أقسام نشطة</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filter-bar">
                <div className="admin-search-wrap">
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="ابحث باسم المنتج أو الوصف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    className="admin-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="all">جميع الأقسام</option>
                    {categories.filter((c) => c.id !== "all").map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <select
                    className="admin-select"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                >
                    <option value="all">حالة التوفر (الكل)</option>
                    <option value="in_stock">متوفر فقط</option>
                    <option value="out_of_stock">نفد من المخزون</option>
                </select>

                {(searchQuery || selectedCategory !== "all" || selectedStock !== "all") && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                            setSelectedStock("all");
                        }}
                        className="admin-action-btn"
                    >
                        ✕ مسح التصفية
                    </button>
                )}
            </div>

            {/* Products Table */}
            <div className="admin-table-card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>القسم</th>
                                <th>السعر الأساسي</th>
                                <th>خيارات الوزن</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="admin-product-cell">
                                            <div style={{ position: "relative", width: 48, height: 48 }}>
                                                <Image
                                                    src={p.image || "/products/sunflower-seeds.png"}
                                                    alt={p.name}
                                                    width={48}
                                                    height={48}
                                                    className="admin-product-thumb"
                                                    style={{ objectFit: "contain" }}
                                                />
                                            </div>
                                            <div>
                                                <div className="admin-product-name">
                                                    {p.badge && (
                                                        <span className="admin-product-badge">
                                                            {p.badge}
                                                        </span>
                                                    )}
                                                    {p.name}
                                                </div>
                                                <div style={{ fontSize: 12, color: "#64748b" }}>
                                                    {p.description || "بدون وصف"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="admin-cat-badge">
                                            {getCategoryName(p.category)}
                                        </span>
                                    </td>
                                    <td>
                                        <strong style={{ color: "#0f172a", fontSize: 15 }}>
                                            {p.price}
                                        </strong>{" "}
                                        <span style={{ fontSize: 12, color: "#64748b" }}>{p.unit}</span>
                                        {p.originalPrice && p.originalPrice > p.price && (
                                            <div style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>
                                                {p.originalPrice} {p.unit}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ fontSize: 12, color: "#475569" }}>
                                            {p.weightOptions.join(" • ")}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`admin-status-badge ${
                                                p.inStock ? "in-stock" : "out-of-stock"
                                            }`}
                                        >
                                            {p.inStock ? "● متوفر" : "✕ غير متوفر"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-actions">
                                            <Link
                                                href={`/admin/products/${p.id}/edit`}
                                                className="admin-action-btn"
                                            >
                                                ✏️ تعديل
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setProductToDelete(p)}
                                                className="admin-action-btn delete"
                                            >
                                                🗑️ حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "48px 20px" }}>
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: "#334155" }}>
                                            لا توجد منتجات تطابق البحث
                                        </div>
                                        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                                            جرب تغيير الكلمات المفتاحية أو خيارات التصفية
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {productToDelete && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-card">
                        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>⚠️</div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", textAlign: "center", color: "#0f172a" }}>
                            تأكيد حذف المنتج
                        </h3>
                        <p style={{ fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 1.6 }}>
                            هل أنت متأكد من رغبتك في حذف <strong>&quot;{productToDelete.name}&quot;</strong>؟
                            <br />
                            لن يظهر هذا المنتج في المتجر بعد الحذف.
                        </p>

                        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
                            <button
                                type="button"
                                onClick={() => setProductToDelete(null)}
                                className="admin-btn-outline"
                                disabled={deleting}
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="admin-btn-primary"
                                style={{ background: "#dc2626" }}
                                disabled={deleting}
                            >
                                {deleting ? "جاري الحذف..." : "نعم، احذف المنتج"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
