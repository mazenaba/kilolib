-- ========================================================
-- Kilo Leb (كيلو لب) Database Schema & Initial Migration
-- Compatible with Supabase PostgreSQL & Storage
-- ========================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC,
    discount NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'ج.م',
    weight_options JSONB DEFAULT '["¼ كج", "½ كج", "1 كج"]'::jsonb,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    badge TEXT,
    rating NUMERIC DEFAULT 4.5,
    review_count INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow anyone (storefront visitors) to view products
CREATE POLICY "Allow public read-only access to products" 
ON public.products 
FOR SELECT 
USING (true);

-- Allow service role full access (admin server-side mutations)
CREATE POLICY "Allow service role full access to products" 
ON public.products 
FOR ALL 
USING (auth.role() = 'service_role' OR auth.role() = 'anon');

-- 4. Create Public Storage Bucket for Product Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to storage
CREATE POLICY "Allow public read-only access to products bucket"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'products');

-- Allow uploads to products bucket
CREATE POLICY "Allow uploads to products bucket"
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'products');

-- 5. Seed Initial Store Products
INSERT INTO public.products (id, name, description, price, original_price, discount, unit, weight_options, category, image, in_stock, badge, rating, review_count)
VALUES
('s1', 'لب ابيض فاخر', 'محمص وطازج', 400, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'seeds', '/products/sunflower-seeds.png', true, 'الأكثر طلباً', 4.5, 256),
('s2', 'لب سوري فاخر', 'محمص ومملح', 280, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'seeds', '/products/syrian-seeds.png', true, NULL, 4.3, 198),
('s3', 'لب اسمر سوبر', 'محمص ومملح ', 360, NULL, 10, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'seeds', '/products/white-seeds.png', true, NULL, 4.2, 145),
('s4', 'سوداني ', 'سوداني امريكاني فاخر', 320, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'seeds', '/products/chickpeas.png', true, NULL, 4.0, 89),
('n1', 'كاندي ', 'كاندي اسباني ', 500, NULL, 5, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'nuts', '/products/cashew.png', true, 'فاخر', 4.8, 312),
('n2', 'ذرة', 'ذرة اطعم', 320, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'nuts', '/products/pistachio.png', true, NULL, 4.9, 421),
('n3', 'لوز محمص', 'لوز كامل محمص ومملح', 480, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'nuts', '/products/almonds.png', true, NULL, 4.6, 267),
('n4', 'عين جمل', 'عين جمل طبيعي', 540, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'nuts', '/products/walnuts.png', true, NULL, 4.4, 156),
('n5', 'بندق محمص', 'بندق تركي فاخر', 520, NULL, 8, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'nuts', '/products/hazelnuts.png', true, NULL, 4.5, 134),
('c1', 'مقرمشات مشكلة', 'مقرمشة ولذيذة', 180, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'snacks', '/products/mixed-crackers.png', true, NULL, 4.1, 145),
('c2', 'بسكويت مملح', 'بسكويت مقرمش بالملح', 160, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'snacks', '/products/salt-biscuits.png', true, NULL, 4.0, 98),
('c3', 'تسالي مشكلة', 'تشكيلة تسالي متنوعة', 190, NULL, 15, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'snacks', '/products/mixed-snacks.png', true, 'جديد', 4.3, 76),
('mx1', 'خلطة كيلو لب', 'خلطة مميزة', 350, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'mixes', '/products/kilo-mix.png', true, 'الأكثر طلباً', 4.7, 312),
('mx2', 'خلطة المكسرات الفاخرة', 'كاجو ولوز وفستق وبندق', 560, NULL, 10, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'mixes', '/products/premium-mix.png', true, 'فاخر', 4.9, 189),
('mx3', 'خلطة سهرة', 'خلطة مثالية للسهرات', 380, NULL, 0, 'ج.م', '["¼ كج", "½ كج", "1 كج"]'::jsonb, 'mixes', '/products/party-mix.png', true, NULL, 4.5, 234),
('o1', 'عرض لب وخلطة', 'لب خشب + خلطة كيلو لب', 320, 380, 16, 'ج.م', '["½ كج", "1 كج"]'::jsonb, 'offers', '/products/offer-1.png', true, 'عرض خاص', 4.8, 467),
('o2', 'عرض المكسرات', 'كاجو + لوز + فستق', 490, 610, 20, 'ج.م', '["½ كج", "1 كج"]'::jsonb, 'offers', '/products/offer-2.png', true, 'توفير 20%', 4.9, 328)
ON CONFLICT (id) DO NOTHING;
