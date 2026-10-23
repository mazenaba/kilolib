import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            username: session.username,
            isDbConfigured: isSupabaseConfigured(),
        });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}
