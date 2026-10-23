"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/products";

const PRESET_IMAGES = [
    { label: "لب سوري", url: "/products/syrian-seeds.png" },
    { label: "لب أبيض", url: "/products/white-seeds.png" },
    { label: "لب دوار الشمس", url: "/products/sunflower-seeds.png" },
    { label: "لوز", url: "/products/almonds.png" },
    { label: "كاجو", url: "/products/cashew.png" },
    { label: "بندق", url: "/products/hazelnuts.png" },
    { label: "فستق", url: "/products/pistachio.png" },
    { label: "عين جمل", url: "/products/walnuts.png" },
    { label: "حمص", url: "/products/chickpeas.png" },
    { label: "مقرمشات مشكلة", url: "/products/mixed-crackers.png" },
    { label: "سناكس مشكل", url: "/products/mixed-snacks.png" },
    { label: "خلطة سهرة", url: "/products/party-mix.png" },
    { label: "خلطة كيلو لب", url: "/products/kilo-mix.png" },
];

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const resolvedParams = use(params);
    const productId = resolvedParams.id;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [discount, setDiscount] = useState("0");
    const [category, setCategory] = useState("seeds");
    const [image, setImage] = useState("");
    const [badge, setBadge] = useState("");
    const [inStock, setInStock] = useState(true);
    const [weightOptions, setWeightOptions] = useState<string[]>([
        "¼ كج",
        "½ كج",
        "1 كج",
    ]);

    // Load initial product data
    useEffect(() => {
        async function fetchProduct() {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();

                if (!res.ok || !data.product) {
                    setError("المنتج غير موجود أو حدث خطأ أثناء تحميل البيانات");
                    setLoading(false);
                    return;
                }

                const p = data.product;
                setName(p.name || "");
                setDescription(p.description || "");
                setPrice(String(p.price || ""));
                setOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
                setDiscount(String(p.discount || 0));
                setCategory(p.category || "seeds");
                setImage(p.image || "/products/sunflower-seeds.png");
                setBadge(p.badge || "");
                setInStock(p.inStock !== undefined ? p.inStock : true);
                if (Array.isArray(p.weightOptions) && p.weightOptions.length > 0) {
                    setWeightOptions(p.weightOptions);
                }
            } catch {
                setError("فشل الاتصال بالخادم لتحميل تفاصيل المنتج");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [productId]);

    // Toggle weight options
    const toggleWeight = (w: string) => {
        if (weightOptions.includes(w)) {
            if (weightOptions.length === 1) {
                setError("يجب اختيار خيار وزن واحد على الأقل");
                return;
            }
            setWeightOptions(weightOptions.filter((item) => item !== w));
        } else {
            setWeightOptions([...weightOptions, w]);
        }
    };

    // Upload replacement image
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "فشل رفع الصورة");
            } else {
                setImage(data.url);
            }
        } catch {
            setError("حدث خطأ أثناء رفع الصورة");
        } finally {
            setUploading(false);
        }
    };

    // Save updates
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("اسم المنتج مطلوب");
            return;
        }

        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice < 0) {
            setError("السعر يجب أن يكون رقماً موجباً");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    price: numPrice,
                    originalPrice: originalPrice ? Number(originalPrice) : undefined,
                    discount: discount ? Number(discount) : 0,
                    category,
                    image,
                    inStock,
                    badge: badge.trim() || undefined,
                    weightOptions,
                    unit: "ج.م",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "فشل تحديث المنتج");
                setSubmitting(false);
                return;
            }

            // Redirect back to admin dashboard
            router.push("/admin");
            router.refresh();
        } catch {
            setError("حدث خطأ في الاتصال بالخادم");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-container" style={{ textAlign: "center", padding: "100px 20px" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#475569" }}>
                    جاري تحميل بيانات المنتج...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div style={{ maxWidth: 860, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 className="admin-page-title">
                        <span>✏️</span> تعديل المنتج: {name}
                    </h1>
                    <p className="admin-page-desc">
                        قم بتعديل الأسعار أو الصور أو الأقسام وستنعكس فوراً في المتجر
                    </p>
                </div>
                <Link href="/admin" className="admin-btn-outline">
                    ← إلغاء والعودة
                </Link>
            </div>

            {error && (
                <div
                    style={{
                        maxWidth: 860,
                        margin: "0 auto 20px",
                        background: "#fee2e2",
                        border: "1px solid #fecaca",
                        color: "#b91c1c",
                        padding: "12px 18px",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            <div className="admin-form-card">
                <form onSubmit={handleSubmit} className="admin-form-grid">
                    {/* Name */}
                    <div className="admin-form-group full">
                        <label className="admin-label">
                            اسم المنتج <span className="req">*</span>
                        </label>
                        <input
                            type="text"
                            className="admin-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="admin-form-group">
                        <label className="admin-label">
                            القسم <span className="req">*</span>
                        </label>
                        <select
                            className="admin-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            {categories
                                .filter((c) => c.id !== "all")
                                .map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Price */}
                    <div className="admin-form-group">
                        <label className="admin-label">
                            السعر الأساسي (للكيلو) بالجنيه <span className="req">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            className="admin-input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    {/* Original Price */}
                    <div className="admin-form-group">
                        <label className="admin-label">السعر قبل الخصم (اختياري)</label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            className="admin-input"
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value)}
                        />
                    </div>

                    {/* Discount */}
                    <div className="admin-form-group">
                        <label className="admin-label">نسبة الخصم % (اختياري)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            className="admin-input"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="admin-form-group full">
                        <label className="admin-label">وصف المنتج</label>
                        <textarea
                            className="admin-input admin-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Image Area */}
                    <div className="admin-form-group full">
                        <label className="admin-label">صورة المنتج الحالية واستبدالها</label>

                        <div className="admin-upload-preview" style={{ marginBottom: 12 }}>
                            <Image
                                src={image || "/products/sunflower-seeds.png"}
                                alt={name}
                                width={80}
                                height={80}
                                className="admin-preview-img"
                                style={{ objectFit: "contain", background: "#f8fafc" }}
                            />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                    معاينة الصورة الحالية
                                </div>
                                <div style={{ fontSize: 12, color: "#64748b", wordBreak: "break-all", marginTop: 2 }}>
                                    {image}
                                </div>
                            </div>
                        </div>

                        <div className="admin-upload-zone">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    opacity: 0,
                                    cursor: "pointer",
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                            <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a6fb5" }}>
                                {uploading ? "جاري رفع الصورة..." : "اضغط لاستبدال الصورة من جهازك"}
                            </div>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                                يدعم JPG, PNG, WEBP حتى 5 ميجابايت
                            </div>
                        </div>

                        {/* Presets */}
                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                                أو اختر من صور المتجر الجاهزة:
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {PRESET_IMAGES.map((preset) => (
                                    <button
                                        type="button"
                                        key={preset.url}
                                        onClick={() => setImage(preset.url)}
                                        className={`admin-action-btn ${image === preset.url ? "delete" : ""}`}
                                        style={{ fontSize: 12 }}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Weight Options */}
                    <div className="admin-form-group full">
                        <label className="admin-label">خيارات الوزن المتاحة للطلب</label>
                        <div className="admin-weights-selector">
                            {["¼ كج", "½ كج", "1 كج"].map((w) => (
                                <div
                                    key={w}
                                    onClick={() => toggleWeight(w)}
                                    className={`admin-weight-pill ${
                                        weightOptions.includes(w) ? "selected" : ""
                                    }`}
                                >
                                    <span>{weightOptions.includes(w) ? "✓" : "○"}</span>
                                    <span>{w}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="admin-form-group">
                        <label className="admin-label">شارة مميزة (اختياري)</label>
                        <input
                            type="text"
                            className="admin-input"
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                        />
                    </div>

                    {/* Stock Status */}
                    <div className="admin-form-group" style={{ justifyContent: "center" }}>
                        <label className="admin-label">حالة التوفر بالمخزون</label>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 6 }}>
                            <input
                                type="checkbox"
                                checked={inStock}
                                onChange={(e) => setInStock(e.target.checked)}
                                style={{ width: 18, height: 18, accentColor: "#1a6fb5" }}
                            />
                            <span style={{ fontSize: 14, fontWeight: 600, color: inStock ? "#15803d" : "#b91c1c" }}>
                                {inStock ? "● متوفر للطلب الآن" : "✕ غير متوفر حالياً"}
                            </span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="admin-form-group full" style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                        <Link href="/admin" className="admin-btn-outline" style={{ padding: "10px 20px" }}>
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            className="admin-btn-primary"
                            disabled={submitting || uploading}
                            style={{ minWidth: 140 }}
                        >
                            {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
