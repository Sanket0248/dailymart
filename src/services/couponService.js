import { supabase } from '@/lib/supabase';

export async function validateCoupon(code) {
  if (!code) return null;
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('active', true)
    .single();
  if (error || !data) return null;
  // Check expiry
  if (data.expiry && new Date(data.expiry) < new Date()) return null;
  // Check max uses
  if (data.max_uses && data.uses >= data.max_uses) return null;
  // Return in camelCase matching the existing cart store expectations
  return {
    code: data.code,
    type: data.type,
    value: data.value,
    minOrder: data.min_order,
  };
}

export async function incrementCouponUse(code) {
  await supabase.rpc('increment_coupon_uses', { coupon_code: code });
}
