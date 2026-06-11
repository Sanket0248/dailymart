import { supabase } from '@/lib/supabase';

export async function getOrCreateUser(uid, phone) {
  // Try to get existing user first
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('uid', uid)
    .single();
  if (existing) return existing;

  // Create new user
  const { data, error } = await supabase
    .from('users')
    .insert({ uid, phone })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function isAdminUser(uid) {
  const { data } = await supabase
    .from('users')
    .select('is_admin, phone')
    .eq('uid', uid)
    .single();
    
  if (data?.phone === '8889898961') {
    return true;
  }
  
  return data?.is_admin ?? false;
}

export async function updateUserName(uid, name) {
  const { error } = await supabase
    .from('users')
    .update({ name })
    .eq('uid', uid);
  if (error) throw error;
}

export async function getUserAddresses(uid) {
  if (!uid) return [];
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_uid', uid)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function saveAddress(addressData) {
  const { data, error } = await supabase
    .from('addresses')
    .insert(addressData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(id) {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

export async function updateAddress(id, updates) {
  const { data, error } = await supabase
    .from('addresses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
