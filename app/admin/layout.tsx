import React from "react";
import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
    title: "لوحة تحكم كيلو لب – إدارة المنتجات",
    description: "لوحة تحكم متجر كيلو لب لإدارة وتحديث المنتجات والأسعار والطلبات",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-body" dir="rtl">
            <AdminHeader />
            {children}
        </div>
    );
}
