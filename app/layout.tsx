import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider, ToastProvider } from "./global";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: "كيلو لب – أجود أنواع اللب والمكسرات",
    description:
        "تسوق أجود أنواع اللب والمكسرات والمقرمشات. طازجة.. نظيفة.. ومضمونة 100%. اطلب الآن عبر واتساب.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <head />
            <body>
                <CartProvider>
                    <ToastProvider>{children}</ToastProvider>
                </CartProvider>
            </body>
        </html>
    );
}
