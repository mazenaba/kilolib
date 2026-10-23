import { Product } from "@/types";
import { products as initialSeedProducts } from "@/data/products";
import { getSupabaseServerClient, isSupabaseConfigured } from "./supabase";

// In-memory cache/store for when running locally without Supabase configured yet
let localProductsStore: Product[] = [...initialSeedProducts];

function mapDbRowToProduct(row: any): Product {
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

function mapProductToDbRow(product: Partial<Product>) {
    const row: any = {};
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
        const client = getSupabaseServerClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from("products")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (!error && data && data.length > 0) {
                    return data.map(mapDbRowToProduct);
                }
                if (error) {
                    console.warn("Supabase query error, falling back to local store:", error.message);
                }
            } catch (err) {
                console.warn("Supabase connection exception:", err);
            }
        }
    }

    return localProductsStore;
}

export async function getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
        const client = getSupabaseServerClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from("products")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (!error && data) {
                    return mapDbRowToProduct(data);
                }
            } catch (err) {
                console.warn("Supabase getById error:", err);
            }
        }
    }

    const found = localProductsStore.find((p) => p.id === id);
    return found || null;
}

export async function createProduct(
    input: Omit<Product, "id">
): Promise<Product> {
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
        const client = getSupabaseServerClient();
        if (client) {
            const dbRow = {
                id: newId,
                ...mapProductToDbRow(newProduct),
                created_at: new Date().toISOString(),
            };

            const { data, error } = await client
                .from("products")
                .insert([dbRow])
                .select()
                .single();

            if (!error && data) {
                const created = mapDbRowToProduct(data);
                localProductsStore.unshift(created);
                return created;
            } else if (error) {
                console.error("Supabase insert error:", error);
                throw new Error("فشل إضافة المنتج في قاعدة البيانات: " + error.message);
            }
        }
    }

    // Local fallback
    localProductsStore.unshift(newProduct);
    return newProduct;
}

export async function updateProduct(
    id: string,
    input: Partial<Product>
): Promise<Product> {
    if (isSupabaseConfigured()) {
        const client = getSupabaseServerClient();
        if (client) {
            const dbRow = mapProductToDbRow(input);
            dbRow.updated_at = new Date().toISOString();

            const { data, error } = await client
                .from("products")
                .update(dbRow)
                .eq("id", id)
                .select()
                .single();

            if (!error && data) {
                const updated = mapDbRowToProduct(data);
                localProductsStore = localProductsStore.map((p) => (p.id === id ? updated : p));
                return updated;
            } else if (error) {
                console.error("Supabase update error:", error);
                throw new Error("فشل تعديل المنتج في قاعدة البيانات: " + error.message);
            }
        }
    }

    // Local fallback
    const index = localProductsStore.findIndex((p) => p.id === id);
    if (index === -1) {
        throw new Error("المنتج غير موجود");
    }

    const updated: Product = {
        ...localProductsStore[index],
        ...input,
        id,
    };
    localProductsStore[index] = updated;
    return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
        const client = getSupabaseServerClient();
        if (client) {
            const { error } = await client.from("products").delete().eq("id", id);
            if (error) {
                console.error("Supabase delete error:", error);
                throw new Error("فشل حذف المنتج من قاعدة البيانات: " + error.message);
            }
        }
    }

    localProductsStore = localProductsStore.filter((p) => p.id !== id);
    return true;
}
