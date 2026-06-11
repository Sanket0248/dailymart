import { supabase } from '@/lib/supabase';

export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) {
    // fallback to defaults if settings table not yet set up
    return {
      store_name: 'DailyMart',
      tagline: "Your Neighbourhood Store",
      phone: '+91 8889898961',
      whatsapp: '918889898961',
      address: 'Main Market, Joura, Madhya Pradesh',
      city: 'Joura',
      pincode: '476221',
      delivery_free_above: 299,
      delivery_fee: 30,
      gst: 5,
      open_time: '07:00',
      close_time: '22:00',
      serviceable_pincodes: ['476221', '476224', '476228'],
    };
  }
  return data;
}

export async function updateSettings(updates) {
  const { error } = await supabase
    .from('settings')
    .update(updates)
    .eq('id', 1);
  if (error) throw error;
}
