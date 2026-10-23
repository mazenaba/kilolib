import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllProducts, createProduct } from "@/lib/products";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
    try {
        const products = await getAllProducts();
        return NextResponse.json({
            products,
            isDbConfigured: isSupabaseConfigured(),
        });
    } catch (err: any) {
        console.error("Error fetching products:", err);
        return NextResponse.json(
            { error: "حدث خطأ أثناء تحميل المنتجات" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        // Authenticate admin session
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "غير مصرح لك بإجراء هذه العملية. يرجى تسجيل الدخول كمسؤول." },
                { status: 401 }
            );
        }

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { error: "بيانات المنتج غير صالحة" },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
            return NextResponse.json(
                { error: "اسم المنتج مطلوب" },
                { status: 400 }
            );
        }

        const price = Number(body.price);
        if (isNaN(price) || price < 0) {
            return NextResponse.json(
                { error: "السعر يجب أن يكون رقماً موجباً" },
                { status: 400 }
            );
        }

        if (!body.category || typeof body.category !== "string") {
            return NextResponse.json(
                { error: "قسم المنتج مطلوب" },
                { status: 400 }
            );
        }

        const newProduct = await createProduct({
            name: body.name.trim(),
            description: body.description ? String(body.description).trim() : "",
            price,
            originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
            discount: body.discount ? Number(body.discount) : 0,
            unit: body.unit || "ج.م",
            weightOptions: Array.isArray(body.weightOptions) && body.weightOptions.length > 0
                ? body.weightOptions
                : ["¼ كج", "½ كج", "1 كج"],
            category: body.category,
            image: body.image || "/products/sunflower-seeds.png",
            inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
            badge: body.badge ? String(body.badge).trim() : undefined,
            rating: body.rating ? Number(body.rating) : 5.0,
            reviewCount: body.reviewCount ? Number(body.reviewCount) : 1,
        });

        // Revalidate storefront and admin paths
        revalidatePath("/");
        revalidatePath("/admin");

        return NextResponse.json({
            success: true,
            product: newProduct,
            message: "تم إضافة المنتج بنجاح",
        }, { status: 201 });
    } catch (err: any) {
        console.error("Error creating product:", err);
        return NextResponse.json(
            { error: err.message || "حدث خطأ أثناء إضافة المنتج" },
            { status: 500 }
        );
    }
}
