-- ============================================================
-- DailyMart Phase 2 — Full Supabase Schema + Seed Data
-- Run in Supabase SQL Editor (safe to re-run: ON CONFLICT DO NOTHING)
-- RLS is DISABLED on all tables for Phase 2
-- ============================================================

-- ─────────────────────────────────────────
-- 1. TABLE: categories
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  icon        TEXT,
  color       TEXT,
  count       INT DEFAULT 0,
  sort_order  INT DEFAULT 0,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 2. TABLE: products
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY,
  category      TEXT NOT NULL REFERENCES categories(slug) ON DELETE RESTRICT,
  brand         TEXT,
  name          TEXT NOT NULL,
  weight        TEXT,
  mrp           NUMERIC(10,2) NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  discount      INT DEFAULT 0,
  stock         INT DEFAULT 0,
  threshold     INT DEFAULT 5,
  image         TEXT,
  description   TEXT,
  ingredients   TEXT,
  storage       TEXT,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 3. TABLE: banners
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  badge       TEXT,
  image       TEXT,
  bg          TEXT,
  accent      TEXT,
  sort_order  INT DEFAULT 0,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE banners DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 4. TABLE: coupons
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  type      TEXT NOT NULL CHECK (type IN ('flat', 'percent')),
  value     NUMERIC(10,2) NOT NULL,
  min_order NUMERIC(10,2) DEFAULT 0,
  max_uses  INT,
  uses      INT DEFAULT 0,
  expiry    DATE,
  active    BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 5. TABLE: users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid        TEXT NOT NULL UNIQUE,   -- Firebase UID
  phone      TEXT,
  name       TEXT,
  is_admin   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 6. TABLE: addresses
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_uid   TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  label      TEXT,           -- e.g. "Home", "Work"
  name       TEXT,
  phone      TEXT,
  line1      TEXT NOT NULL,
  line2      TEXT,
  city       TEXT,
  pincode    TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 7. TABLE: orders
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,   -- e.g. "ORD-2026-12345"
  user_uid         TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'placed'
                     CHECK (status IN ('placed','confirmed','packed','out_for_delivery','delivered','cancelled')),
  subtotal         NUMERIC(10,2) NOT NULL,
  delivery_fee     NUMERIC(10,2) DEFAULT 0,
  coupon_code      TEXT,
  coupon_discount  NUMERIC(10,2) DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  payment_method   TEXT,
  delivery_slot    TEXT,
  address          JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 8. TABLE: order_items
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  product_image TEXT,
  price         NUMERIC(10,2) NOT NULL,
  mrp           NUMERIC(10,2),
  qty           INT NOT NULL,
  subtotal      NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 9. TABLE: settings
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id                    INT PRIMARY KEY DEFAULT 1,
  store_name            TEXT DEFAULT 'DailyMart',
  tagline               TEXT DEFAULT 'Your Neighbourhood Store',
  phone                 TEXT,
  whatsapp              TEXT,
  address               TEXT,
  city                  TEXT,
  pincode               TEXT,
  delivery_free_above   NUMERIC(10,2) DEFAULT 299,
  delivery_fee          NUMERIC(10,2) DEFAULT 30,
  gst                   NUMERIC(5,2) DEFAULT 5,
  open_time             TEXT DEFAULT '07:00',
  close_time            TEXT DEFAULT '22:00',
  serviceable_pincodes  TEXT[] DEFAULT ARRAY['476221','476224','476228'],
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT settings_single_row CHECK (id = 1)
);

ALTER TABLE settings DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- ─────────────────────────────────────────
-- decrement_stock: Called after order placement
-- Accepts: items JSONB array of {product_id, qty}
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION decrement_stock(items JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    UPDATE products
    SET
      stock      = GREATEST(0, stock - (item->>'qty')::INT),
      updated_at = NOW()
    WHERE id = item->>'product_id';
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────
-- increment_coupon_uses: Called after successful order with coupon
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_coupon_uses(coupon_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE coupons
  SET uses = uses + 1
  WHERE code = UPPER(TRIM(coupon_code));
END;
$$;


-- ============================================================
-- SEED DATA
-- ============================================================

-- ─────────────────────────────────────────
-- Settings (single row)
-- ─────────────────────────────────────────
INSERT INTO settings (id, store_name, tagline, phone, whatsapp, address, city, pincode, delivery_free_above, delivery_fee, gst, open_time, close_time, serviceable_pincodes)
VALUES (
  1,
  'DailyMart',
  'Your Neighbourhood Store',
  '+91 8889898961',
  '918889898961',
  'Main Market, Joura, Madhya Pradesh',
  'Joura',
  '476221',
  299,
  30,
  5,
  '07:00',
  '22:00',
  ARRAY['476221','476224','476228']
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- Categories (7)
-- ─────────────────────────────────────────
INSERT INTO categories (id, slug, name, icon, color, count, sort_order, active) VALUES
  ('dairy',        'dairy',        'Dairy',         '🥛', '#dbeafe', 12, 1, TRUE),
  ('vegetables',   'vegetables',   'Vegetables',    '🥦', '#dcfce7', 18, 2, TRUE),
  ('personal-care','personal-care','Personal Care', '🧴', '#fce7f3', 15, 3, TRUE),
  ('cleaning',     'cleaning',     'Cleaning',      '🧹', '#ede9fe', 10, 4, TRUE),
  ('snacks',       'snacks',       'Snacks',        '🍿', '#ffedd5', 22, 5, TRUE),
  ('beverages',    'beverages',    'Beverages',     '🥤', '#cffafe', 16, 6, TRUE),
  ('kitchen',      'kitchen',      'Kitchen',       '🍳', '#fef9c3', 20, 7, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- Products (32)
-- ─────────────────────────────────────────

-- DAIRY (5 products)
INSERT INTO products (id, category, brand, name, weight, mrp, price, discount, stock, threshold, image, description, ingredients, storage, active) VALUES
(
  'p001', 'dairy', 'Amul', 'Amul Taaza Toned Milk', '500 ml',
  28, 26, 7, 80, 10,
  'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  'Fresh toned milk from Amul. Pasteurised and homogenised.',
  'Toned milk Vitamin A & D',
  'Keep refrigerated below 4°C. Consume within 2 days of opening.',
  TRUE
),
(
  'p002', 'dairy', 'Amul', 'Amul Butter Salted', '100 g',
  55, 50, 9, 40, 5,
  'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
  'Rich creamy Amul butter made from fresh cream.',
  'Cream Salt',
  'Keep refrigerated. Use within 30 days.',
  TRUE
),
(
  'p003', 'dairy', 'Amul', 'Amul Dahi (Curd)', '400 g',
  42, 38, 10, 25, 5,
  'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&q=80',
  'Fresh set curd with live cultures.',
  'Standardised Milk Live cultures',
  'Keep refrigerated. Best consumed fresh.',
  TRUE
),
(
  'p004', 'dairy', 'Mother Dairy', 'Paneer Fresh', '200 g',
  95, 89, 6, 15, 3,
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
  'Fresh cottage cheese made from whole milk.',
  'Milk Acidulants (Citric Acid)',
  'Keep refrigerated. Consume within 3 days.',
  TRUE
),
(
  'p005', 'dairy', 'Nestle', 'MUNCH CHOCO Milkshake', '180 ml',
  25, 20, 20, 60, 10,
  'https://images.unsplash.com/photo-1572490122747-3a4b5a765c3e?w=400&q=80',
  'Rich chocolate milkshake ready to drink.',
  'Milk Sugar Cocoa Natural Flavours',
  'Keep refrigerated.',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- SNACKS (5 products)
INSERT INTO products (id, category, brand, name, weight, mrp, price, discount, stock, threshold, image, description, ingredients, storage, active) VALUES
(
  'p006', 'snacks', 'Parle', 'Parle-G Original Biscuits', '250 g',
  30, 25, 17, 120, 15,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'India''s favourite glucose biscuit. Crispy, light and delicious.',
  'Wheat Flour Sugar Edible Vegetable Oil Invert Syrup Leavening Agents Salt Dough Conditioner',
  'Store in a cool and dry place.',
  TRUE
),
(
  'p007', 'snacks', 'Haldirams', 'Aloo Bhujia Sev', '150 g',
  55, 45, 18, 50, 8,
  'https://images.unsplash.com/photo-1555529771-7888783a18d3?w=400&q=80',
  'Classic aloo bhujia sev — crispy, spicy and irresistible.',
  'Potato Chickpea Flour Spices Edible Vegetable Oil Salt',
  'Store in a cool and dry place.',
  TRUE
),
(
  'p008', 'snacks', 'Britannia', 'Good Day Cashew Cookies', '200 g',
  45, 38, 16, 75, 10,
  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80',
  'Crunchy butter cookies loaded with real cashew pieces.',
  'Wheat Flour Sugar Edible Vegetable Fat Cashew Pieces Milk Solids Invert Syrup Salt Leavening Agents Emulsifier',
  'Store in a cool and dry place.',
  TRUE
),
(
  'p009', 'snacks', 'Lays', 'Lays Classic Salted Chips', '52 g',
  20, 18, 10, 0, 10,
  'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
  'Thin crispy potato chips with classic salt flavour.',
  'Potatoes Edible Vegetable Oil Salt',
  'Store in a cool and dry place away from direct sunlight.',
  TRUE
),
(
  'p010', 'snacks', 'Maggi', 'Maggi 2-Minute Noodles', '70 g x 4',
  64, 56, 13, 95, 15,
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
  'The original 2-minute noodles with iconic Masala tastemaker.',
  'Wheat Flour Refined Palm Oil Salt Wheat Gluten Minerals Vitamins',
  'Store in a cool and dry place.',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- BEVERAGES (5 products)
INSERT INTO products (id, category, brand, name, weight, mrp, price, discount, stock, threshold, image, description, ingredients, storage, active) VALUES
(
  'p011', 'beverages', 'Coca-Cola', 'Coca-Cola Original', '750 ml',
  45, 40, 11, 60, 10,
  'https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=400&q=80',
  'The original refreshing cola beverage.',
  'Carbonated Water Sugar Caramel Colour Phosphoric Acid Natural Flavours Caffeine',
  'Store in a cool and dry place. Best served chilled.',
  TRUE
),
(
  'p012', 'beverages', 'Real', 'Real Mango Juice', '1 L',
  99, 85, 14, 30, 5,
  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
  'Rich and refreshing mango juice made from Alphonso mangoes.',
  'Water Mango Pulp Sugar Citric Acid Ascorbic Acid Flavour',
  'Store in a cool and dry place. Refrigerate after opening.',
  TRUE
),
(
  'p013', 'beverages', 'Bisleri', 'Bisleri Mineral Water', '1 L',
  20, 18, 10, 200, 20,
  'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&q=80',
  'Pure and safe mineral water from Bisleri.',
  'Mineral Water',
  'Store away from direct sunlight and strong odours.',
  TRUE
),
(
  'p014', 'beverages', 'Nescafe', 'Nescafe Classic Instant Coffee', '50 g',
  150, 130, 13, 20, 3,
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  'Premium instant coffee with rich aroma and bold taste.',
  'Instant Coffee',
  'Store in a cool dry place. Seal tightly after use.',
  TRUE
),
(
  'p015', 'beverages', 'Tropicana', 'Tropicana Orange Juice', '1 L',
  120, 99, 18, 25, 5,
  'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80',
  'Freshly squeezed orange juice with no added preservatives.',
  'Orange Juice Vitamin C',
  'Refrigerate after opening. Best consumed within 5 days.',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- PERSONAL CARE (5 products)
INSERT INTO products (id, category, brand, name, weight, mrp, price, discount, stock, threshold, image, description, ingredients, storage, active) VALUES
(
  'p016', 'personal-care', 'Colgate', 'Colgate MaxFresh Toothpaste', '150 g',
  99, 85, 14, 45, 8,
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80',
  'Whitening toothpaste with cooling crystals for fresh breath.',
  'Sodium Fluoride Sorbitol Hydrated Silica Sodium Lauryl Sulphate Menthol Flavour',
  'Store in a cool and dry place.',
  TRUE
),
(
  'p017', 'personal-care', 'Dettol', 'Dettol Original Soap', '75 g x 3',
  90, 78, 13, 55, 8,
  'https://images.unsplash.com/photo-1585445490582-4ef1f5b987d2?w=400&q=80',
  'Antibacterial soap that kills 99.9% of germs.',
  'Sodium Palmate Aqua Glycerin Chloroxylenol Pine Needle Oil',
  'Store in a dry place.',
  TRUE
),
(
  'p018', 'personal-care', 'Dove', 'Dove Shampoo Intense Repair', '340 ml',
  299, 259, 13, 18, 3,
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80',
  'Nourishing shampoo for damaged hair with Keratin Actives.',
  'Aqua Sodium Laureth Sulfate Cocamidopropyl Betaine Keratin Hydrolysed Protein Panthenol',
  'Store below 30°C.',
  TRUE
),
(
  'p019', 'personal-care', 'Gillette', 'Gillette Fusion Razor', '1 piece',
  249, 219, 12, 22, 3,
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80',
  '5-blade razor for a precise and comfortable shave.',
  'Steel Blades Rubber Handle Lubricating Strip',
  'Store in a dry place.',
  TRUE
),
(
  'p020', 'personal-care', 'Vaseline', 'Vaseline Body Lotion', '200 ml',
  175, 149, 15, 30, 5,
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80',
  'Non-greasy body lotion with triple-purified petroleum jelly.',
  'Aqua Glycerin Petrolatum Dimethicone Stearic Acid Vitamin E',
  'Store below 30°C.',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- CLEANING (3 products)
INSERT INTO products (id, category, brand, name, weight, mrp, price, discount, stock, threshold, image, description, ingredients, storage, active) VALUES
(
  'p021', 'cleaning', 'Surf Excel', 'Surf Excel Easy Wash', '1 kg',
  135, 119, 12, 40, 8,
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
  'Detergent powder that removes tough stains in just one wash.',
  'Anionic Surfactants Non-Ionic Surfactants Sodium Carbonate Sodium Perborate Enzymes Optical Brighteners',
  'Store in a cool and dry place.',
  TRUE
),
(
  'p022', 'cleaning', 'Colin', 'Colin Glass Cleaner Spray', '500 ml',
  129, 109, 16, 25, 5,
  'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80',
  'Streak-free glass cleaner for windows and mirrors.',
  'Isopropyl Alcohol Ethylene Glycol Detergent Ammonia Water',
  'Keep away from children. Store in a cool place.',
  TRUE
),
(
  'p023', 'cleaning', 'Vim', 'Vim Dishwash Gel', '500 ml',
  89, 74, 17, 35, 5,
  'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80',
  'Powerful dish gel that cuts through grease with ease.',
  'Surfactants Fragrance Colour pH Adjusters Water',
  'Store in a cool and dry place.',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- KITCHEN (7 products)
INSERT INTO products (id, category, brand, name, weight, mrp, price, discount, stock, threshold, image, description, ingredients, storage, active) VALUES
(
  'p024', 'kitchen', 'Fortune', 'Fortune Refined Sunflower Oil', '1 L',
  160, 139, 13, 50, 8,
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  'Light and healthy sunflower oil for everyday cooking.',
  'Refined Sunflower Oil',
  'Store in a cool and dry place away from sunlight.',
  TRUE
),
(
  'p025', 'kitchen', 'Tata', 'Tata Salt Lite (Low Sodium)', '1 kg',
  35, 30, 14, 90, 10,
  'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80',
  'Low sodium salt with 15% less sodium than regular salt.',
  'Sodium Chloride Potassium Chloride Iodine',
  'Store in a cool and dry place.',
  TRUE
),
(
  'p026', 'kitchen', 'MDH', 'MDH Chana Masala', '100 g',
  55, 48, 13, 35, 5,
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  'Authentic blend of spices for making chana masala.',
  'Coriander Cumin Dry Mango Chilli Pomegranate Seeds Black Pepper Ginger Salt Clove Cardamom',
  'Store in a cool dry place.',
  TRUE
),
(
  'p027', 'kitchen', 'Aashirvaad', 'Aashirvaad Atta (Whole Wheat)', '5 kg',
  295, 269, 9, 20, 3,
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  'Whole wheat flour milled from selected wheat grains.',
  '100% Whole Wheat',
  'Store in a cool and dry place.',
  TRUE
),
(
  'p028', 'kitchen', 'Tata', 'Tata Tea Gold', '250 g',
  185, 160, 14, 45, 5,
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80',
  'Premium blend of long leaf and dust tea for rich flavour.',
  'Assam Tea Leaves',
  'Store in an airtight container in a cool and dry place.',
  TRUE
),
(
  'p029', 'kitchen', 'Lijjat', 'Lijjat Papad (Urad Dal)', '200 g',
  45, 40, 11, 55, 8,
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
  'Crispy urad dal papad — roast or fry for a crunchy snack.',
  'Urad Dal Flour Edible Common Salt Edible Vegetable Oil Black Pepper',
  'Store in a cool and dry place.',
  TRUE
),
(
  'p030', 'kitchen', 'Knorr', 'Knorr Classic Tomato Soup Mix', '53 g',
  55, 45, 18, 40, 5,
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
  'Ready-to-make classic tomato soup in minutes.',
  'Tomato Powder Modified Starch Sugar Salt Acidity Regulators Vegetable Fat Spices',
  'Store in a cool and dry place.',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- VEGETABLES (2 products)
INSERT INTO products (id, category, brand, name, weight, mrp, price, discount, stock, threshold, image, description, ingredients, storage, active) VALUES
(
  'p031', 'vegetables', 'Fresh', 'Onions (Pyaaz)', '1 kg',
  40, 35, 13, 60, 10,
  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  'Farm-fresh onions — an essential kitchen staple.',
  'Fresh Onions',
  'Store in a cool and dry place.',
  TRUE
),
(
  'p032', 'vegetables', 'Fresh', 'Tomatoes (Tamatar)', '500 g',
  30, 25, 17, 45, 8,
  'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400&q=80',
  'Ripe and juicy tomatoes sourced directly from farms.',
  'Fresh Tomatoes',
  'Store in a cool and dry place. Refrigerate once ripe.',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- Banners (3)
-- ─────────────────────────────────────────
INSERT INTO banners (id, title, subtitle, badge, image, bg, accent, sort_order, active) VALUES
(
  'b1',
  'Fresh Groceries',
  'Delivered in 30 Mins',
  '⚡ Express Delivery',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  'from-brand-600 to-brand-400',
  '#86efac',
  1,
  TRUE
),
(
  'b2',
  'New Arrivals',
  'Fresh Stock Every Day',
  '🆕 Just In',
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
  'from-blue-600 to-cyan-400',
  '#bae6fd',
  2,
  TRUE
),
(
  'b3',
  'Today''s Deals',
  'Up to 40% Off on Essentials',
  '🔥 Hot Deals',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
  'from-accent-600 to-amber-400',
  '#fed7aa',
  3,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- Coupons (3)
-- ─────────────────────────────────────────
INSERT INTO coupons (code, type, value, min_order, max_uses, uses, expiry, active) VALUES
  ('FIRST50', 'flat',    50,  200, 1000, 0, '2027-12-31', TRUE),
  ('SAVE20',  'percent', 20,  299, NULL, 0, '2027-12-31', TRUE),
  ('DAILY30', 'flat',    30,  149, NULL, 0, '2027-12-31', TRUE)
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- VERIFICATION QUERIES (optional — uncomment to check counts)
-- ============================================================
-- SELECT 'categories' AS tbl, COUNT(*) FROM categories
-- UNION ALL SELECT 'products', COUNT(*) FROM products
-- UNION ALL SELECT 'banners',  COUNT(*) FROM banners
-- UNION ALL SELECT 'coupons',  COUNT(*) FROM coupons
-- UNION ALL SELECT 'settings', COUNT(*) FROM settings;
