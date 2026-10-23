import { cookies } from "next/headers";

export const COOKIE_NAME = "kilo_admin_session";
const DEFAULT_SESSION_SECRET = "kilo-leb-super-secure-production-secret-key-2025";

function getSecretKey(): string {
    return process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET;
}

export function getAdminCredentials(): { username: string; password: string } {
    return {
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "kiloleb2025",
    };
}

// Convert string to Uint8Array
function strToBuf(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}

// Convert buffer to hex string
function bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// Generate HMAC-SHA256 signature
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

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

export interface SessionPayload {
    username: string;
    role: "admin";
    iat: number;
    exp: number;
}

/**
 * Creates a signed session token: base64(payload).signature
 */
export async function createSessionToken(username: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 7 * 24 * 60 * 60; // 7 days

    const payload: SessionPayload = {
        username,
        role: "admin",
        iat: now,
        exp,
    };

    const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = await signMessage(payloadStr, getSecretKey());

    return `${payloadStr}.${signature}`;
}

/**
 * Verifies the signed session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const expectedSig = await signMessage(payloadStr, getSecretKey());

    if (!timingSafeEqual(signature, expectedSig)) {
        return null;
    }

    try {
        const json = Buffer.from(payloadStr, "base64url").toString("utf8");
        const payload: SessionPayload = JSON.parse(json);

        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
            return null; // Expired
        }

        return payload;
    } catch {
        return null;
    }
}

/**
 * Verifies admin username and password securely
 */
export function verifyAdminCredentials(inputUser: string, inputPass: string): boolean {
    const creds = getAdminCredentials();
    return (
        timingSafeEqual(inputUser.trim(), creds.username.trim()) &&
        timingSafeEqual(inputPass.trim(), creds.password.trim())
    );
}

/**
 * Server-side helper to read and verify admin session from Next.js cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

/**
 * Ensures caller is an authenticated admin. Throws error if not.
 */
export async function requireAdminSession(): Promise<SessionPayload> {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized: Admin session required");
    }
    return session;
}
