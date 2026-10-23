// In-memory rate limiter for login attempts
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (!entry) {
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
    }

    if (now > entry.resetTime) {
        loginAttempts.delete(ip);
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
    }

    if (entry.count >= MAX_ATTEMPTS) {
        const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
        return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
    }

    return {
        allowed: true,
        remainingAttempts: MAX_ATTEMPTS - entry.count,
        retryAfterSeconds: 0,
    };
}

export function recordFailedAttempt(ip: string): { remainingAttempts: number; retryAfterSeconds: number } {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (!entry || now > entry.resetTime) {
        loginAttempts.set(ip, {
            count: 1,
            resetTime: now + WINDOW_MS,
        });
        return { remainingAttempts: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
    }

    entry.count += 1;
    loginAttempts.set(ip, entry);

    const remaining = Math.max(0, MAX_ATTEMPTS - entry.count);
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return { remainingAttempts: remaining, retryAfterSeconds: retryAfter };
}

export function resetRateLimit(ip: string): void {
    loginAttempts.delete(ip);
}
