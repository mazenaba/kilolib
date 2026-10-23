import { Product } from "@/types";
import { products as initialSeedProducts } from "@/data/products";

// In-memory cache/store for when running locally without Supabase configured yet
let localProductsStore: Product[] = [...initialSeedProducts];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && (supabaseServiceKey || supabaseAnonKey));
}

// Build base headers for Supabase REST API
function getHeaders(): Record<string, string> {
    const key = supabaseServiceKey || supabaseAnonKey || "";
    return {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    };
}

// Base URL for Supabase REST API
function restUrl(path: string): string {
    return `${supabaseUrl}/rest/v1/${path}`;
}

function mapRowToProduct(row: any): Product {
    let weightOptions: string[] = ["¼ كج", "½ كج", "1 كج"];
    if (Array.isArray(row.weight_options)) {
        weightOptions = row.weight_options;
    } else if (typeof row.weight_options === "string") {
        try {
            weightOptions = JSON.parse(row.weight_options);
        } catch {
            weightOptions = ["¼ كج", "½ كج", "1 كج"];
        }
    }

    return {
        id: String(row.id),
        name: row.name || "",
        description: row.description || "",
        price: Number(row.price) || 0,
        originalPrice: row.original_price ? Number(row.original_price) : undefined,
        discount: row.discount ? Number(row.discount) : 0,
        unit: row.unit || "ج.م",
        weightOptions,
        category: row.category || "seeds",
        image: row.image || "/products/sunflower-seeds.png",
        inStock: row.in_stock !== undefined ? Boolean(row.in_stock) : true,
        badge: row.badge || undefined,
        rating: row.rating ? Number(row.rating) : 4.5,
        reviewCount: row.review_count ? Number(row.review_count) : 10,
    };
}

function mapProductToRow(product: Partial<Product>): Record<string, any> {
    const row: Record<string, any> = {};
    if (product.name !== undefined) row.name = product.name;
    if (product.description !== undefined) row.description = product.description;
    if (product.price !== undefined) row.price = Number(product.price);
    if (product.originalPrice !== undefined) row.original_price = product.originalPrice ? Number(product.originalPrice) : null;
    if (product.discount !== undefined) row.discount = Number(product.discount);
    if (product.unit !== undefined) row.unit = product.unit;
    if (product.weightOptions !== undefined) row.weight_options = product.weightOptions;
    if (product.category !== undefined) row.category = product.category;
    if (product.image !== undefined) row.image = product.image;
    if (product.inStock !== undefined) row.in_stock = Boolean(product.inStock);
    if (product.badge !== undefined) row.badge = product.badge || null;
    if (product.rating !== undefined) row.rating = Number(product.rating);
    if (product.reviewCount !== undefined) row.review_count = Number(product.reviewCount);
    return row;
}

export async function getAllProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
        try {
            const res = await fetch(
                restUrl("products?select=*&order=created_at.desc"),
                { headers: getHeaders(), cache: "no-store" }
            );
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const products = data.map(mapRowToProduct);
                    localProductsStore = products;
                    return products;
                }
            } else {
                const err = await res.text();
                console.warn("Supabase getAllProducts error:", res.status, err);
            }
        } catch (err) {
            console.warn("Supabase getAllProducts fetch error:", err);
        }
    }
    return localProductsStore;
}

export async function getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
        try {
            const res = await fetch(
                restUrl(`products?id=eq.${encodeURIComponent(id)}&select=*&limit=1`),
                { headers: getHeaders(), cache: "no-store" }
            );
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    return mapRowToProduct(data[0]);
                }
            } else {
                const err = await res.text();
                console.warn("Supabase getProductById error:", res.status, err);
            }
        } catch (err) {
            console.warn("Supabase getProductById fetch error:", err);
        }
    }
    return localProductsStore.find((p) => p.id === id) || null;
}

export async function createProduct(input: Omit<Product, "id">): Promise<Product> {
    const newId = "prod_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    const newProduct: Product = {
        ...input,
        id: newId,
        unit: input.unit || "ج.م",
        rating: input.rating ?? 5.0,
        reviewCount: input.reviewCount ?? 1,
        weightOptions: input.weightOptions?.length ? input.weightOptions : ["¼ كج", "½ كج", "1 كج"],
        inStock: input.inStock ?? true,
    };

    if (isSupabaseConfigured()) {
        try {
            const row = {
                id: newId,
                ...mapProductToRow(newProduct),
                created_at: new Date().toISOString(),
            };

            const res = await fetch(restUrl("products"), {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(row),
            });

            if (res.ok) {
                const data = await res.json();
                const created = mapRowToProduct(Array.isArray(data) ? data[0] : data);
                localProductsStore.unshift(created);
                return created;
            } else {
                const err = await res.text();
                console.error("Supabase createProduct error:", res.status, err);
                throw new Error("فشل إضافة المنتج في قاعدة البيانات: " + err);
            }
        } catch (err: any) {
            if (err.message?.includes("فشل")) throw err;
            console.warn("Supabase createProduct fetch exception:", err);
        }
    }

    localProductsStore.unshift(newProduct);
    return newProduct;
}

export async function updateProduct(id: string, input: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured()) {
        try {
            const row = {
                ...mapProductToRow(input),
                updated_at: new Date().toISOString(),
            };

            const res = await fetch(
                restUrl(`products?id=eq.${encodeURIComponent(id)}`),
                {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify(row),
                }
            );

            if (res.ok) {
                const data = await res.json();
                const updated = mapRowToProduct(Array.isArray(data) ? data[0] : data);
                localProductsStore = localProductsStore.map((p) => (p.id === id ? updated : p));
                return updated;
            } else {
                const err = await res.text();
                console.error("Supabase updateProduct error:", res.status, err);
                throw new Error("فشل تعديل المنتج في قاعدة البيانات: " + err);
            }
        } catch (err: any) {
            if (err.message?.includes("فشل")) throw err;
            console.warn("Supabase updateProduct fetch exception:", err);
        }
    }

    const index = localProductsStore.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("المنتج غير موجود");
    const updated: Product = { ...localProductsStore[index], ...input, id };
    localProductsStore[index] = updated;
    return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
        try {
            const res = await fetch(
                restUrl(`products?id=eq.${encodeURIComponent(id)}`),
                {
                    method: "DELETE",
                    headers: getHeaders(),
                }
            );

            if (!res.ok) {
                const err = await res.text();
                console.error("Supabase deleteProduct error:", res.status, err);
                throw new Error("فشل حذف المنتج من قاعدة البيانات: " + err);
            }
        } catch (err: any) {
            if (err.message?.includes("فشل")) throw err;
            console.warn("Supabase deleteProduct fetch exception:", err);
        }
    }

    localProductsStore = localProductsStore.filter((p) => p.id !== id);
    return true;
}
