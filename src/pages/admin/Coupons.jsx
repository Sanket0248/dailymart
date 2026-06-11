import { useState } from 'react';
import { useAdminCoupons } from '@/hooks/useAdmin';
import { upsertCoupon, softDeleteCoupon } from '@/services/adminService';
import { Plus, Tag, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  code: '', type: 'flat', value: '', minOrder: '', maxUses: '', expiry: '', active: true,
};

function CouponModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.code.trim()) { toast.error('Coupon code is required'); return; }
    if (!form.value || Number(form.value) <= 0) { toast.error('Discount value must be > 0'); return; }
    onSave({ ...form, code: form.code.toUpperCase() });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-700 text-text-heading text-lg">{initial ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"><X size={16} /></button>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-600 text-text-heading mb-1.5">Coupon Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="e.g. SAVE50"
                className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm font-700 uppercase tracking-widest focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-600 text-text-heading mb-1.5">Discount Type</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
              >
                <option value="flat">Flat (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-600 text-text-heading mb-1.5">
                Discount Value {form.type === 'flat' ? '(₹)' : '(%)'}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={e => set('value', e.target.value)}
                min="1"
                max={form.type === 'percent' ? 100 : undefined}
                className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-600 text-text-heading mb-1.5">Min. Order Value (₹)</label>
              <input
                type="number"
                value={form.minOrder}
                onChange={e => set('minOrder', e.target.value)}
                min="0"
                className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-600 text-text-heading mb-1.5">Max Uses</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={e => set('maxUses', e.target.value)}
                min="1"
                className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-600 text-text-heading mb-1.5">Expiry Date</label>
              <input
                type="date"
                value={form.expiry}
                onChange={e => set('expiry', e.target.value)}
                className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
            <div className="col-span-2 flex items-center justify-between py-1">
              <span className="text-sm font-600 text-text-heading">Active</span>
              <button onClick={() => set('active', !form.active)} className="tap-target">
                {form.active
                  ? <ToggleRight size={28} className="text-brand-500" />
                  : <ToggleLeft size={28} className="text-slate-400" />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 px-6 pb-5">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-text-sub font-600 py-2.5 rounded-btn hover:bg-slate-50 text-sm">Cancel</button>
            <button onClick={handleSave} className="flex-1 bg-brand-500 text-white font-600 py-2.5 rounded-btn hover:bg-brand-600 text-sm flex items-center justify-center gap-1.5">
              <Check size={15} /> Save Coupon
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Coupons() {
  const { data: coupons = [], setData: setCoupons, loading } = useAdminCoupons();
  const [modal, setModal] = useState(null);

  const toggleActive = async (id) => {
    try {
      const coupon = coupons.find(c => c.id === id);
      const saved = await upsertCoupon({ ...coupon, active: !coupon.active });
      setCoupons(prev => prev.map(c => c.id === id ? saved : c));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await softDeleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSave = async (form) => {
    try {
      const saved = await upsertCoupon(form);
      setCoupons(prev => {
        const exists = prev.find(c => c.id === saved.id);
        if (exists) return prev.map(c => c.id === saved.id ? saved : c);
        return [...prev, saved];
      });
      toast.success(`Coupon ${modal?.data ? 'updated' : 'created'}`);
      setModal(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-4 md:p-6 text-center text-slate-500">Loading coupons...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-700 text-text-heading flex items-center gap-2">
          <Tag className="text-brand-500" size={24} /> Coupons
        </h1>
        <button
          onClick={() => setModal({ data: null })}
          className="flex items-center gap-2 bg-brand-500 text-white font-600 px-4 py-2.5 rounded-btn hover:bg-brand-600 transition-colors text-sm"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Expiry', 'Active', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-700 text-text-sub uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {coupons.map(coupon => (
                <tr key={coupon.id || coupon.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-700 text-brand-700 bg-brand-50 border border-brand-200 px-2 py-1 rounded-lg text-xs tracking-widest">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-text-sub">{coupon.type}</td>
                  <td className="px-4 py-3 font-700 text-text-heading">
                    {coupon.type === 'flat' ? `₹${coupon.value}` : `${coupon.value}%`}
                  </td>
                  <td className="px-4 py-3 text-text-sub">₹{coupon.minOrder}</td>
                  <td className="px-4 py-3 text-text-sub">{coupon.uses || 0} / {coupon.maxUses}</td>
                  <td className="px-4 py-3 text-text-sub whitespace-nowrap">{coupon.expiry}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(coupon.id)} className="tap-target">
                      {coupon.active
                        ? <ToggleRight size={22} className="text-brand-500" />
                        : <ToggleLeft size={22} className="text-slate-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setModal({ data: coupon })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-50 text-brand-500 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && (
        <CouponModal
          initial={modal.data}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
