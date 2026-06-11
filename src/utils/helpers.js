export const formatPrice = (n) => `₹${n}`;
export const formatDiscount = (mrp, price) => Math.round(((mrp - price) / mrp) * 100);
export const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
export const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};
export const debounce = (fn, delay) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};
export const clsx = (...classes) => classes.filter(Boolean).join(' ');
