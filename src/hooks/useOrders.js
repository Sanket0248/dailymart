import { useState, useEffect, useCallback } from 'react';
import { getUserOrders, getOrderById } from '@/services/orderService';

export function useOrders(userUid) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userUid) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getUserOrders(userUid);
      setOrders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userUid]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { orders, loading, error, refetch: fetch };
}

export function useOrder(orderId) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { order, loading, error, refetch: fetch };
}
