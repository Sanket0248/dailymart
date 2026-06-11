import { supabase } from '@/lib/supabase';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data;
}

export async function getProductsByCategory(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', slug)
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data;
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function searchProducts(q) {
  if (!q || q.trim().length < 2) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${q}%,brand.ilike.%${q}%,category.ilike.%${q}%`)
    .eq('active', true)
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getBanners() {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getDeals() {
  // Products with discount >= 15 and in stock
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .gte('discount', 15)
    .gt('stock', 0)
    .order('discount', { ascending: false })
    .limit(8);
  if (error) throw error;
  return data ?? [];
}

export async function getTopPicks() {
  // Most common staples — filter by specific IDs from seeded data
  const ids = ['p006', 'p010', 'p001', 'p016', 'p021', 'p025', 'p028', 'p013'];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)
    .eq('active', true);
  if (error) throw error;
  return data ?? [];
}

export async function getProductsByIds(ids) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids);
  if (error) throw error;
  return data ?? [];
}

export async function updateProductStock(productId, newStock) {
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', productId);
  if (error) throw error;
}
