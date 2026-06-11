import { supabase } from '@/lib/supabase';

// --- Image Upload ---
export async function uploadImage(file, folder = 'general') {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;
  
  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

// --- Products ---
export async function getAllProductsAdmin() {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertProduct(product, imageFile) {
  let imageUrl = product.image;
  if (imageFile) {
    imageUrl = await uploadImage(imageFile, 'products');
  }

  // Remove fields that don't exist in the database schema
  const { unit, ...restProduct } = product;

  const payload = {
    ...restProduct,
    id: restProduct.id || `p${Date.now()}`,
    image: imageUrl
  };

  const { data, error } = await supabase.from('products').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function softDeleteProduct(id) {
  const { error } = await supabase.from('products').update({ active: false }).eq('id', id);
  if (error) throw error;
}

// --- Orders ---
export async function getAllOrdersAdmin() {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Categories ---
export async function getAllCategoriesAdmin() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function upsertCategory(category, imageFile) {
  let imageUrl = category.image;
  if (imageFile) imageUrl = await uploadImage(imageFile, 'categories');

  const payload = { 
    ...category, 
    id: category.id || `cat${Date.now()}`,
    image: imageUrl
  };
  const { data, error } = await supabase.from('categories').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function softDeleteCategory(id) {
  const { error } = await supabase.from('categories').update({ active: false }).eq('id', id);
  if (error) throw error;
}

// --- Banners ---
export async function getAllBannersAdmin() {
  const { data, error } = await supabase.from('banners').select('*').order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function upsertBanner(banner, imageFile) {
  let imageUrl = banner.image;
  if (imageFile) imageUrl = await uploadImage(imageFile, 'banners');

  const payload = { 
    ...banner, 
    id: banner.id || `b${Date.now()}`,
    image: imageUrl
  };
  const { data, error } = await supabase.from('banners').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function softDeleteBanner(id) {
  const { error } = await supabase.from('banners').update({ active: false }).eq('id', id);
  if (error) throw error;
}

// --- Coupons ---
export async function getAllCouponsAdmin() {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertCoupon(coupon) {
  const payload = { ...coupon };
  const { data, error } = await supabase.from('coupons').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function softDeleteCoupon(id) {
  const { error } = await supabase.from('coupons').update({ active: false }).eq('id', id);
  if (error) throw error;
}

// --- Dashboard Stats ---
export async function getDashboardStatsAdmin() {
  // Parallel fetch for speed
  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalProducts },
    { count: lowStockProducts }
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'placed'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock', 5).eq('active', true) // Assuming threshold 5
  ]);

  // Aggregate revenue from all delivered orders
  const { data: deliveredOrders } = await supabase.from('orders').select('total').eq('status', 'delivered');
  const revenue = deliveredOrders?.reduce((sum, o) => sum + o.total, 0) || 0;

  return {
    totalRevenue: revenue,
    totalOrders: totalOrders || 0,
    activeOrders: pendingOrders || 0,
    totalProducts: totalProducts || 0,
    lowStock: lowStockProducts || 0,
  };
}
