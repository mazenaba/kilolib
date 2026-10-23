import { NextRequest, NextResponse } from "next/server";
import {
    verifyAdminCredentials,
    createSessionToken,
    COOKIE_NAME,
} from "@/lib/auth";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
    try {
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1";

        // Check rate limit
        const rateCheck = checkRateLimit(ip);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                {
                    error: `تم حظر المحاولات مؤقتاً لتكرار الفشل. يرجى الانتظار ${rateCheck.retryAfterSeconds} ثانية.`,
                    retryAfterSeconds: rateCheck.retryAfterSeconds,
                },
                { status: 429 }
            );
        }

        const body = await req.json().catch(() => null);
        if (!body || !body.username || !body.password) {
            return NextResponse.json(
                { error: "اسم المستخدم وكلمة المرور مطلوبان" },
                { status: 400 }
            );
        }

        const { username, password } = body;
        const isValid = verifyAdminCredentials(username, password);

        if (!isValid) {
            const attemptInfo = recordFailedAttempt(ip);
            const remainingMsg =
                attemptInfo.remainingAttempts > 0
                    ? ` (المحاولات المتبقية: ${attemptInfo.remainingAttempts})`
                    : " (تم إيقاف المحاولات مؤقتاً)";
            return NextResponse.json(
                {
                    error: "اسم المستخدم أو كلمة المرور غير صحيحة" + remainingMsg,
                    remainingAttempts: attemptInfo.remainingAttempts,
                },
                { status: 401 }
            );
        }

        // Login successful
        resetRateLimit(ip);
        const token = await createSessionToken(username);

        const response = NextResponse.json({
            success: true,
            message: "تم تسجيل الدخول بنجاح",
        });

        // Set secure HTTP-only cookie
        response.cookies.set({
            name: COOKIE_NAME,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (err: any) {
        console.error("Login error:", err);
        return NextResponse.json(
            { error: "حدث خطأ في الخادم أثناء تسجيل الدخول" },
            { status: 500 }
        );
    }
}
