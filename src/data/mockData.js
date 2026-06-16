// ─── DailyMart Mock Data ────────────────────────────────────────────────────
// Realistic Indian retail products, categories, banners, orders for Joura MP

export const STORE_INFO = {
  name: 'DailyMart',
  tagline: 'Your Neighbourhood Store',
  address: 'Main Market, Joura, Madhya Pradesh',
  pincode: '476221',
  city: 'Joura',
  state: 'Madhya Pradesh',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  deliveryFreeAbove: 299,
  deliveryFee: 30,
  gst: 5,
  operatingHours: { open: '07:00', close: '22:00' },
  serviceablePincodes: ['476221', '476224', '476228'],
};

export const CATEGORIES = [
  { id: 'dairy',        slug: 'dairy',        name: 'Dairy',         emoji: '🥛', color: '#dbeafe', count: 12 },
  { id: 'vegetables',   slug: 'vegetables',   name: 'Vegetables',    emoji: '🥦', color: '#dcfce7', count: 18 },
  { id: 'personal-care',slug: 'personal-care',name: 'Personal Care', emoji: '🧴', color: '#fce7f3', count: 15 },
  { id: 'cleaning',     slug: 'cleaning',     name: 'Cleaning',      emoji: '🧹', color: '#ede9fe', count: 10 },
  { id: 'snacks',       slug: 'snacks',       name: 'Snacks',        emoji: '🍿', color: '#ffedd5', count: 22 },
  { id: 'beverages',    slug: 'beverages',    name: 'Beverages',     emoji: '🥤', color: '#cffafe', count: 16 },
  { id: 'kitchen',      slug: 'kitchen',      name: 'Kitchen',       emoji: '🍳', color: '#fef9c3', count: 20 },
];

export const BANNERS = [
  {
    id: 'b1',
    title: 'Fresh Groceries',
    subtitle: 'Delivered in 30 Mins',
    badge: '⚡ Express Delivery',
    bg: 'from-brand-600 to-brand-400',
    accent: '#86efac',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  },
  {
    id: 'b2',
    title: 'New Arrivals',
    subtitle: 'Fresh Stock Every Day',
    badge: '🆕 Just In',
    bg: 'from-blue-600 to-cyan-400',
    accent: '#bae6fd',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
  },
  {
    id: 'b3',
    title: "Today's Deals",
    subtitle: 'Up to 40% Off on Essentials',
    badge: '🔥 Hot Deals',
    bg: 'from-accent-600 to-amber-400',
    accent: '#fed7aa',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
  },
];

export const PRODUCTS = [
  // ─── Dairy ──────────────────────────────────────────────────────────
  {
    id: 'p001', category: 'dairy', brand: 'Amul', name: 'Amul Taaza Toned Milk',
    weight: '500 ml', mrp: 28, price: 26, discount: 7, stock: 80, threshold: 10,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    description: 'Fresh toned milk from Amul. Pasteurised and homogenised for better taste and nutrition.',
    ingredients: 'Toned milk, Vitamin A & D',
    storage: 'Keep refrigerated below 4°C. Consume within 2 days of opening.',
    active: true,
  },
  {
    id: 'p002', category: 'dairy', brand: 'Amul', name: 'Amul Butter Salted',
    weight: '100 g', mrp: 55, price: 50, discount: 9, stock: 40, threshold: 5,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
    description: 'Rich, creamy Amul butter made from fresh cream. Perfect for cooking, baking and spreading.',
    ingredients: 'Cream, Salt',
    storage: 'Keep refrigerated. Use within 30 days of manufacture.',
    active: true,
  },
  {
    id: 'p003', category: 'dairy', brand: 'Amul', name: 'Amul Dahi (Curd)',
    weight: '400 g', mrp: 42, price: 38, discount: 10, stock: 25, threshold: 5,
    image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&q=80',
    description: 'Fresh set curd with live cultures. Smooth, creamy texture ideal for daily consumption.',
    ingredients: 'Standardised Milk, Live cultures',
    storage: 'Keep refrigerated. Best consumed fresh.',
    active: true,
  },
  {
    id: 'p004', category: 'dairy', brand: 'Mother Dairy', name: 'Paneer Fresh',
    weight: '200 g', mrp: 95, price: 89, discount: 6, stock: 15, threshold: 3,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
    description: 'Fresh cottage cheese made from whole milk. Soft, moist and rich in protein.',
    ingredients: 'Milk, Acidulants (Citric Acid)',
    storage: 'Keep refrigerated. Consume within 3 days.',
    active: true,
  },
  {
    id: 'p005', category: 'dairy', brand: 'Nestle', name: 'MUNCH CHOCO Milkshake',
    weight: '180 ml', mrp: 25, price: 20, discount: 20, stock: 60, threshold: 10,
    image: 'https://images.unsplash.com/photo-1572490122747-3a4b5a765c3e?w=400&q=80',
    description: 'Rich chocolate milkshake, ready to drink. Made with real milk and cocoa.',
    ingredients: 'Milk, Sugar, Cocoa, Natural Flavours',
    storage: 'Keep refrigerated.',
    active: true,
  },
  // ─── Snacks ──────────────────────────────────────────────────────────
  {
    id: 'p006', category: 'snacks', brand: 'Parle', name: 'Parle-G Original Biscuits',
    weight: '250 g', mrp: 30, price: 25, discount: 17, stock: 120, threshold: 15,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    description: 'The world\'s largest selling biscuit brand. Crispy glucose biscuits loved by generations.',
    ingredients: 'Wheat Flour, Sugar, Glucose, Shortening, Milk Solids',
    storage: 'Store in a cool dry place. Best before see pack.',
    active: true,
  },
  {
    id: 'p007', category: 'snacks', brand: 'Haldirams', name: 'Aloo Bhujia Sev',
    weight: '150 g', mrp: 55, price: 45, discount: 18, stock: 50, threshold: 8,
    image: 'https://images.unsplash.com/photo-1555529771-7888783a18d3?w=400&q=80',
    description: 'Classic Indian savoury snack made from potato and gram flour. Crispy and perfectly spiced.',
    ingredients: 'Potato, Gram Flour, Spices, Salt, Edible Oil',
    storage: 'Store in a cool dry place. Keep sealed after opening.',
    active: true,
  },
  {
    id: 'p008', category: 'snacks', brand: 'Britannia', name: 'Good Day Cashew Cookies',
    weight: '200 g', mrp: 45, price: 38, discount: 16, stock: 75, threshold: 10,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80',
    description: 'Buttery shortcake cookies loaded with cashew nuts. A premium everyday indulgence.',
    ingredients: 'Refined Wheat Flour, Sugar, Butter, Cashew Nuts, Milk',
    storage: 'Store in a cool dry place. Best before see pack.',
    active: true,
  },
  {
    id: 'p009', category: 'snacks', brand: 'Lay\'s', name: 'Lay\'s Classic Salted Chips',
    weight: '52 g', mrp: 20, price: 18, discount: 10, stock: 0, threshold: 10,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
    description: 'Light, crispy potato chips with a classic salted flavor. Perfect for snacking.',
    ingredients: 'Potatoes, Edible Vegetable Oil, Salt',
    storage: 'Store in a cool dry place.',
    active: true,
  },
  {
    id: 'p010', category: 'snacks', brand: 'Maggi', name: 'Maggi 2-Minute Noodles',
    weight: '70 g × 4', mrp: 64, price: 56, discount: 13, stock: 95, threshold: 15,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    description: 'India\'s favourite instant noodles. Ready in just 2 minutes with the iconic Masala tastemaker.',
    ingredients: 'Wheat Flour, Edible Vegetable Oil, Salt, Spices, Starch',
    storage: 'Store in a cool dry place.',
    active: true,
  },
  // ─── Beverages ───────────────────────────────────────────────────────
  {
    id: 'p011', category: 'beverages', brand: 'Coca-Cola', name: 'Coca-Cola Original',
    weight: '750 ml', mrp: 45, price: 40, discount: 11, stock: 60, threshold: 10,
    image: 'https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=400&q=80',
    description: 'The original and iconic Coca-Cola. Enjoy the classic taste of refreshment.',
    ingredients: 'Carbonated Water, Sugar, Caramel Color, Phosphoric Acid, Natural Flavors',
    storage: 'Best served cold.',
    active: true,
  },
  {
    id: 'p012', category: 'beverages', brand: 'Real', name: 'Real Mango Juice',
    weight: '1 L', mrp: 99, price: 85, discount: 14, stock: 30, threshold: 5,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
    description: 'Made from Alphonso mangoes. No preservatives, no artificial colours.',
    ingredients: 'Mango Pulp, Water, Sugar, Citric Acid, Vitamin C',
    storage: 'Refrigerate after opening. Consume within 5 days.',
    active: true,
  },
  {
    id: 'p013', category: 'beverages', brand: 'Bisleri', name: 'Bisleri Mineral Water',
    weight: '1 L', mrp: 20, price: 18, discount: 10, stock: 200, threshold: 20,
    image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&q=80',
    description: 'Pure and safe Bisleri mineral water. 7-stage purification process.',
    ingredients: 'Purified Water, Mineral Salts',
    storage: 'Store in cool place away from direct sunlight.',
    active: true,
  },
  {
    id: 'p014', category: 'beverages', brand: 'Nescafe', name: 'Nescafé Classic Instant Coffee',
    weight: '50 g', mrp: 150, price: 130, discount: 13, stock: 20, threshold: 3,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    description: 'Bold and aromatic Nescafé Classic. Made from carefully selected coffee beans.',
    ingredients: 'Instant Coffee (100%)',
    storage: 'Store in a cool dry place. Keep sealed after opening.',
    active: true,
  },
  {
    id: 'p015', category: 'beverages', brand: 'Tropicana', name: 'Tropicana Orange Juice',
    weight: '1 L', mrp: 120, price: 99, discount: 18, stock: 25, threshold: 5,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80',
    description: '100% pure orange juice. No added sugars, preservatives or flavours.',
    ingredients: 'Orange Juice (100%)',
    storage: 'Refrigerate after opening. Best consumed within 4 days.',
    active: true,
  },
  // ─── Personal Care ───────────────────────────────────────────────────
  {
    id: 'p016', category: 'personal-care', brand: 'Colgate', name: 'Colgate MaxFresh Toothpaste',
    weight: '150 g', mrp: 99, price: 85, discount: 14, stock: 45, threshold: 8,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80',
    description: 'Colgate MaxFresh with cooling crystals gives long-lasting fresh breath.',
    ingredients: 'Sodium Fluoride, Sorbitol, Hydrated Silica, Cooling Crystals',
    storage: 'Store below 30°C.',
    active: true,
  },
  {
    id: 'p017', category: 'personal-care', brand: 'Dettol', name: 'Dettol Original Soap',
    weight: '75 g × 3', mrp: 90, price: 78, discount: 13, stock: 55, threshold: 8,
    image: 'https://images.unsplash.com/photo-1585445490582-4ef1f5b987d2?w=400&q=80',
    description: 'Dettol Original antiseptic soap protects from 100 illness-causing germs.',
    ingredients: 'Sodium Tallowate, Chloroxylenol, Fragrance, Titanium Dioxide',
    storage: 'Store in a cool dry place.',
    active: true,
  },
  {
    id: 'p018', category: 'personal-care', brand: 'Dove', name: 'Dove Shampoo Intense Repair',
    weight: '340 ml', mrp: 299, price: 259, discount: 13, stock: 18, threshold: 3,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80',
    description: 'Dove Intense Repair Shampoo with Keratin Actives repairs damage up to the core.',
    ingredients: 'Aqua, Sodium Laureth Sulfate, Keratin Protein, Fragrance',
    storage: 'Store in a cool place.',
    active: true,
  },
  {
    id: 'p019', category: 'personal-care', brand: 'Gillette', name: 'Gillette Fusion Razor',
    weight: '1 piece', mrp: 249, price: 219, discount: 12, stock: 22, threshold: 3,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80',
    description: '5-blade technology for a close, comfortable shave. Includes 1 cartridge.',
    ingredients: 'Stainless Steel Blades, Lubricating Strip',
    storage: 'Keep dry when not in use.',
    active: true,
  },
  {
    id: 'p020', category: 'personal-care', brand: 'Vaseline', name: 'Vaseline Body Lotion',
    weight: '200 ml', mrp: 175, price: 149, discount: 15, stock: 30, threshold: 5,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80',
    description: 'Vaseline Intensive Care deep moisture lotion for soft, healthy skin.',
    ingredients: 'Aqua, Glycerin, Mineral Oil, Petroleum, Dimethicone',
    storage: 'Store in a cool place. Keep tightly closed.',
    active: true,
  },
  // ─── Cleaning ────────────────────────────────────────────────────────
  {
    id: 'p021', category: 'cleaning', brand: 'Surf Excel', name: 'Surf Excel Easy Wash',
    weight: '1 kg', mrp: 135, price: 119, discount: 12, stock: 40, threshold: 8,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
    description: 'Surf Excel Easy Wash removes tough stains in just 1 wash. Works in hard water.',
    ingredients: 'Anionic Surfactants, Optical Brighteners, Fragrance, Enzymes',
    storage: 'Store in a cool dry place.',
    active: true,
  },
  {
    id: 'p022', category: 'cleaning', brand: 'Colin', name: 'Colin Glass Cleaner Spray',
    weight: '500 ml', mrp: 129, price: 109, discount: 16, stock: 25, threshold: 5,
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80',
    description: 'Colin leaves glass surfaces sparkling clean with zero streaks.',
    ingredients: 'Isopropyl Alcohol, Surfactants, Ammonia, Fragrance',
    storage: 'Keep away from children. Store in cool place.',
    active: true,
  },
  {
    id: 'p023', category: 'cleaning', brand: 'Vim', name: 'Vim Dishwash Gel',
    weight: '500 ml', mrp: 89, price: 74, discount: 17, stock: 35, threshold: 5,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80',
    description: 'Vim Active Gel removes tough grease and leaves utensils sparkling clean.',
    ingredients: 'Anionic Surfactants, Lemon Extract, Fragrance',
    storage: 'Store in a cool place.',
    active: true,
  },
  // ─── Kitchen ─────────────────────────────────────────────────────────
  {
    id: 'p024', category: 'kitchen', brand: 'Fortune', name: 'Fortune Refined Sunflower Oil',
    weight: '1 L', mrp: 160, price: 139, discount: 13, stock: 50, threshold: 8,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    description: 'Fortune Sunlite refined sunflower oil is light, healthy and cholesterol free.',
    ingredients: 'Refined Sunflower Oil',
    storage: 'Store in a cool dry place. Keep away from direct sunlight.',
    active: true,
  },
  {
    id: 'p025', category: 'kitchen', brand: 'Tata', name: 'Tata Salt Lite (Low Sodium)',
    weight: '1 kg', mrp: 35, price: 30, discount: 14, stock: 90, threshold: 10,
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80',
    description: 'Tata Salt with 15% less sodium than regular iodised salt. Healthier choice.',
    ingredients: 'Sodium Chloride, Potassium Chloride, Iodine',
    storage: 'Store in a cool dry place.',
    active: true,
  },
  {
    id: 'p026', category: 'kitchen', brand: 'MDH', name: 'MDH Chana Masala',
    weight: '100 g', mrp: 55, price: 48, discount: 13, stock: 35, threshold: 5,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    description: 'Authentic blend of 15+ hand-picked spices for perfect chana masala every time.',
    ingredients: 'Coriander, Cumin, Chilli, Turmeric, Mango Powder, Salt',
    storage: 'Store in a cool dry place. Keep sealed after use.',
    active: true,
  },
  {
    id: 'p027', category: 'kitchen', brand: 'Aashirvaad', name: 'Aashirvaad Atta (Whole Wheat)',
    weight: '5 kg', mrp: 295, price: 269, discount: 9, stock: 20, threshold: 3,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
    description: 'Aashirvaad Select Atta is made from carefully selected grains from Golden Triangle.',
    ingredients: '100% Whole Wheat',
    storage: 'Store in a cool dry place. Keep sealed.',
    active: true,
  },
  {
    id: 'p028', category: 'kitchen', brand: 'Tata', name: 'Tata Tea Gold',
    weight: '250 g', mrp: 185, price: 160, discount: 14, stock: 45, threshold: 5,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80',
    description: 'Tata Tea Gold blends the finest Assam and Darjeeling leaves. Strong and aromatic.',
    ingredients: 'Assam Tea, Darjeeling Tea',
    storage: 'Store in a cool dry place. Keep sealed after opening.',
    active: true,
  },
  {
    id: 'p029', category: 'kitchen', brand: 'Lijjat', name: 'Lijjat Papad (Urad Dal)',
    weight: '200 g', mrp: 45, price: 40, discount: 11, stock: 55, threshold: 8,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
    description: 'Crispy and delicious Lijjat Urad Dal Papads. Women cooperative product.',
    ingredients: 'Urad Dal Flour, Salt, Black Pepper, Papad Khar',
    storage: 'Store in a cool dry place.',
    active: true,
  },
  {
    id: 'p030', category: 'kitchen', brand: 'Knorr', name: 'Knorr Classic Tomato Soup Mix',
    weight: '53 g', mrp: 55, price: 45, discount: 18, stock: 40, threshold: 5,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    description: 'Quick and easy tomato soup. Ready in 3 minutes. No artificial flavors.',
    ingredients: 'Tomato Powder, Starch, Sugar, Salt, Spices',
    storage: 'Store in a cool dry place. Use within 6 months of opening.',
    active: true,
  },
  // ─── Vegetables ──────────────────────────────────────────────────────
  {
    id: 'p031', category: 'vegetables', brand: 'Fresh', name: 'Onions (Pyaaz)',
    weight: '1 kg', mrp: 40, price: 35, discount: 13, stock: 60, threshold: 10,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
    description: 'Farm-fresh onions, hand-picked and sorted for quality. Essential for every Indian kitchen.',
    ingredients: 'Onions',
    storage: 'Store in a cool dry place with good air circulation.',
    active: true,
  },
  {
    id: 'p032', category: 'vegetables', brand: 'Fresh', name: 'Tomatoes (Tamatar)',
    weight: '500 g', mrp: 30, price: 25, discount: 17, stock: 45, threshold: 8,
    image: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400&q=80',
    description: 'Ripe, red tomatoes bursting with flavour. Grown with care, delivered fresh.',
    ingredients: 'Tomatoes',
    storage: 'Store at room temperature away from sunlight.',
    active: true,
  },
];

// ─── Deals of the Day (products with high discounts) ─────────────────────────
export const DEALS = PRODUCTS.filter(p => p.discount >= 15 && p.stock > 0).slice(0, 8);

// ─── Top Picks (best sellers) ────────────────────────────────────────────────
export const TOP_PICKS = [
  ...PRODUCTS.filter(p => ['p006','p010','p001','p016','p021','p025','p028','p013'].includes(p.id))
];

// ─── Sample Coupons ──────────────────────────────────────────────────────────
export const COUPONS = [
  { code: 'FIRST50', type: 'flat', value: 50, minOrder: 200, maxUses: 1000, uses: 234, expiry: '2025-12-31', active: true },
  { code: 'SAVE20', type: 'percent', value: 20, minOrder: 299, maxUses: 500, uses: 89, expiry: '2025-11-30', active: true },
  { code: 'DAILY30', type: 'flat', value: 30, minOrder: 149, maxUses: 2000, uses: 567, expiry: '2025-12-31', active: true },
];

// ─── Sample Orders ───────────────────────────────────────────────────────────
export const SAMPLE_ORDERS = [
  {
    id: 'ORD-2024-001',
    date: '2024-10-28T09:15:00Z',
    status: 'delivered',
    items: [
      { product: PRODUCTS[0], qty: 2 },
      { product: PRODUCTS[5], qty: 1 },
      { product: PRODUCTS[9], qty: 3 },
    ],
    subtotal: 243, delivery: 0, discount: 0, total: 243,
    address: { name: 'Rajan Sharma', phone: '9876543210', flat: '12, Shanti Nagar', area: 'Main Market', city: 'Joura', pincode: '476221' },
    payment: 'cod',
    estimatedDelivery: '25 mins',
  },
  {
    id: 'ORD-2024-002',
    date: '2024-10-27T14:30:00Z',
    status: 'confirmed',
    items: [
      { product: PRODUCTS[15], qty: 1 },
      { product: PRODUCTS[20], qty: 2 },
    ],
    subtotal: 302, delivery: 0, discount: 50, total: 252,
    coupon: 'FIRST50',
    address: { name: 'Priya Patel', phone: '9876543211', flat: '8, Gandhi Colony', area: 'Station Road', city: 'Joura', pincode: '476221' },
    payment: 'upi',
    estimatedDelivery: '30 mins',
  },
  {
    id: 'ORD-2024-003',
    date: '2024-10-26T11:00:00Z',
    status: 'delivered',
    items: [
      { product: PRODUCTS[23], qty: 1 },
      { product: PRODUCTS[26], qty: 1 },
      { product: PRODUCTS[27], qty: 2 },
    ],
    subtotal: 598, delivery: 0, discount: 0, total: 598,
    address: { name: 'Amit Verma', phone: '9876543212', flat: '3, Nehru Ward', area: 'Hospital Road', city: 'Joura', pincode: '476221' },
    payment: 'cod',
    estimatedDelivery: '20 mins',
  },
];

// ─── Admin Dashboard Mock Stats ──────────────────────────────────────────────
export const DASHBOARD_STATS = {
  todayOrders: 24,
  todayRevenue: 6840,
  pendingOrders: 5,
  lowStockItems: 4,
  chartData: [
    { day: 'Mon', orders: 18 },
    { day: 'Tue', orders: 22 },
    { day: 'Wed', orders: 15 },
    { day: 'Thu', orders: 28 },
    { day: 'Fri', orders: 31 },
    { day: 'Sat', orders: 38 },
    { day: 'Sun', orders: 24 },
  ],
};

// ─── Delivery slots ──────────────────────────────────────────────────────────
export const DELIVERY_SLOTS = [
  { id: 'express', label: 'Express Delivery', time: '20–40 mins', icon: '⚡', price: 0 },
  { id: 'sameday', label: 'Same Day Delivery', time: 'By evening today', icon: '🕔', price: 0 },
  { id: 'tomorrow', label: 'Tomorrow', time: 'Morning delivery', icon: '📅', price: 0 },
];

// Helper: get product by id
export const getProduct = (id) => PRODUCTS.find(p => p.id === id);
// Helper: get products by category
export const getByCategory = (slug) => PRODUCTS.filter(p => p.category === slug);
// Helper: search products
export const searchProducts = (q) => {
  if (!q) return [];
  const lower = q.toLowerCase();
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.brand.toLowerCase().includes(lower) ||
    p.category.toLowerCase().includes(lower)
  );
};
