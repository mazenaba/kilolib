import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProductById, updateProduct, deleteProduct } from "@/lib/products";
import { getSession } from "@/lib/auth";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const product = await getProductById(id);

        if (!product) {
            return NextResponse.json(
                { error: "المنتج غير موجود" },
                { status: 404 }
            );
        }

        return NextResponse.json({ product });
    } catch (err: any) {
        console.error("Error fetching product:", err);
        return NextResponse.json(
            { error: "حدث خطأ أثناء جلب المنتج" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "غير مصرح لك بإجراء هذه العملية" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const body = await req.json().catch(() => null);

        if (!body) {
            return NextResponse.json(
                { error: "بيانات التعديل غير صالحة" },
                { status: 400 }
            );
        }

        // Validate fields if provided
        if (body.name !== undefined && (!body.name || !body.name.trim())) {
            return NextResponse.json(
                { error: "اسم المنتج لا يمكن أن يكون فارغاً" },
                { status: 400 }
            );
        }

        if (body.price !== undefined) {
            const price = Number(body.price);
            if (isNaN(price) || price < 0) {
                return NextResponse.json(
                    { error: "السعر يجب أن يكون رقماً موجباً" },
                    { status: 400 }
                );
            }
        }

        const updated = await updateProduct(id, body);

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath(`/admin/products/${id}/edit`);

        return NextResponse.json({
            success: true,
            product: updated,
            message: "تم تحديث المنتج بنجاح",
        });
    } catch (err: any) {
        console.error("Error updating product:", err);
        return NextResponse.json(
            { error: err.message || "حدث خطأ أثناء تعديل المنتج" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "غير مصرح لك بحذف المنتجات" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        await deleteProduct(id);

        revalidatePath("/");
        revalidatePath("/admin");

        return NextResponse.json({
            success: true,
            message: "تم حذف المنتج بنجاح",
        });
    } catch (err: any) {
        console.error("Error deleting product:", err);
        return NextResponse.json(
            { error: err.message || "حدث خطأ أثناء حذف المنتج" },
            { status: 500 }
        );
    }
}
