import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "kilo_admin_session";
const DEFAULT_SESSION_SECRET = "kilo-leb-super-secure-production-secret-key-2025";

function getSecretKey(): string {
    return process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET;
}

function strToBuf(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}

function bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

async function signMessage(message: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        strToBuf(secret) as any,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, strToBuf(message) as any);
    return bufToHex(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

async function verifyToken(token: string | undefined): Promise<boolean> {
    if (!token || typeof token !== "string") return false;
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payloadStr, signature] = parts;
    const expectedSig = await signMessage(payloadStr, getSecretKey());

    if (!timingSafeEqual(signature, expectedSig)) {
        return false;
    }

    try {
        const json = atob(payloadStr.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(json);
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    } catch {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes
    if (pathname.startsWith("/admin")) {
        const token = request.cookies.get(COOKIE_NAME)?.value;
        const isAuthenticated = await verifyToken(token);

        // If trying to access /admin/login while already authenticated -> redirect to /admin
        if (pathname === "/admin/login") {
            if (isAuthenticated) {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            return NextResponse.next();
        }

        // If trying to access protected /admin pages while not authenticated -> redirect to /admin/login
        if (!isAuthenticated) {
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
