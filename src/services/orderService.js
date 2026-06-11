import { supabase } from '@/lib/supabase';

function generateOrderId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `ORD-${year}-${rand}`;
}

export async function placeOrder({
  userUid,
  items,
  subtotal,
  deliveryFee,
  couponCode,
  couponDiscount,
  total,
  paymentMethod,
  deliverySlot,
  address,
}) {
  const orderId = generateOrderId();

  // Insert order
  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    user_uid: userUid,
    status: 'placed',
    subtotal,
    delivery_fee: deliveryFee,
    coupon_code: couponCode || null,
    coupon_discount: couponDiscount || 0,
    total,
    payment_method: paymentMethod,
    delivery_slot: deliverySlot,
    address,
  });
  if (orderError) throw orderError;

  // Insert order items
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.image,
    price: item.product.price,
    mrp: item.product.mrp,
    qty: item.qty,
    subtotal: item.product.price * item.qty,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  // Decrement stock for each item
  try {
    await supabase.rpc('decrement_stock', {
      items: items.map((i) => ({ product_id: i.product.id, qty: i.qty })),
    });
  } catch (e) {
    console.warn('Stock decrement failed (non-critical):', e);
  }

  return orderId;
}

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();
  if (error) return null;
  return data;
}

export async function getUserOrders(userUid) {
  if (!userUid) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_uid', userUid)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}
