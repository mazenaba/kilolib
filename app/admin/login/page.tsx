"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "فشل تسجيل الدخول");
                setLoading(false);
                return;
            }

            // Successfully logged in
            router.push("/admin");
            router.refresh();
        } catch {
            setError("حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-wrap" dir="rtl">
            <div className="admin-login-card">
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <Image
                        src="/products/hero.jpg"
                        alt="كيلو لب"
                        width={64}
                        height={64}
                        style={{
                            borderRadius: "50%",
                            margin: "0 auto 12px",
                            display: "block",
                            border: "2px solid #e2e8f0",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                        }}
                        priority
                    />
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 6px" }}>
                        لوحة تحكم كيلو لب
                    </h1>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                        تسجيل دخول الإدارة لإدارة المنتجات والأسعار
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            background: "#fee2e2",
                            border: "1px solid #fecaca",
                            color: "#b91c1c",
                            padding: "10px 14px",
                            borderRadius: 8,
                            fontSize: 13,
                            marginBottom: 20,
                            lineHeight: 1.5,
                        }}
                    >
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="admin-form-group">
                        <label className="admin-label" htmlFor="username">اسم المستخدم</label>
                        <input
                            id="username"
                            type="text"
                            className="admin-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="أدخل اسم المستخدم"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-label" htmlFor="password">كلمة المرور</label>
                        <input
                            id="password"
                            type="password"
                            className="admin-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-btn-primary"
                        style={{ width: "100%", marginTop: 8, padding: 12 }}
                        disabled={loading}
                    >
                        {loading ? "جاري التحقق..." : "تسجيل الدخول"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#94a3b8" }}>
                    <a href="/" style={{ color: "#1a6fb5", textDecoration: "none", fontWeight: 600 }}>
                        ← العودة لمتجر كيلو لب
                    </a>
                </div>
            </div>
        </div>
    );
}
