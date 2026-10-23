import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
    try {
        // Authenticate admin session
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "غير مصرح لك برفع الصور. يرجى تسجيل الدخول كمسؤول." },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "لم يتم اختيار أي ملف" }, { status: 400 });
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "نوع الملف غير مدعوم. الصيغ المقبولة: JPG, PNG, WEBP, GIF" },
                { status: 400 }
            );
        }

        // Validate size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine extension
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const safeName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

        // 1. If Supabase is configured, upload to Supabase Storage bucket 'products'
        if (isSupabaseConfigured()) {
            const client = getSupabaseServerClient();
            if (client) {
                const { error: uploadError } = await client.storage
                    .from("products")
                    .upload(safeName, buffer, {
                        contentType: file.type,
                        upsert: true,
                    });

                if (uploadError) {
                    console.error("Supabase storage upload error:", uploadError);
                    // Don't crash; if bucket doesn't exist yet, we notify the user
                    return NextResponse.json(
                        {
                            error: `فشل الرفع إلى Supabase Storage: ${uploadError.message}. تأكد من إنشاء bucket باسم 'products' في Supabase وجعلها Public.`,
                        },
                        { status: 500 }
                    );
                }

                const { data: publicUrlData } = client.storage
                    .from("products")
                    .getPublicUrl(safeName);

                return NextResponse.json({
                    success: true,
                    url: publicUrlData.publicUrl,
                    fileName: safeName,
                });
            }
        }

        // 2. Offline / local fallback: Return high-performance Base64 data URL
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
        return NextResponse.json({
            success: true,
            url: base64,
            fileName: safeName,
            isLocalFallback: true,
            message: "تم حفظ الصورة محلياً (Data URL). عند ربط Supabase سيتم حفظها في Cloud Storage.",
        });
    } catch (err: any) {
        console.error("Upload route error:", err);
        return NextResponse.json(
            { error: "حدث خطأ غير متوقع أثناء معالجة الصورة" },
            { status: 500 }
        );
    }
}
