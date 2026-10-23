import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && (supabaseServiceKey || supabaseAnonKey));
}

// Server-side privileged client (for mutations and server operations)
export function getSupabaseServerClient() {
    if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
        return null;
    }
    const key = supabaseServiceKey || supabaseAnonKey!;
    return createClient(supabaseUrl, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        db: {
            schema: "public",
        },
        global: {
            headers: {
                "Accept-Profile": "public",
                "Content-Profile": "public",
            },
        },
    });
}

// Public client (for read-only queries)
export function getSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }
    return createClient(supabaseUrl, supabaseAnonKey);
}
