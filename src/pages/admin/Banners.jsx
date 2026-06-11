import { useState } from 'react';
import { useAdminBanners } from '@/hooks/useAdmin';
import { upsertBanner, softDeleteBanner } from '@/services/adminService';
import { Image, Plus, Edit2, Trash2, X, Check, ChevronUp, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = { title: '', subtitle: '', badge: '', image: '', displayOrder: 1, active: true };

function BannerModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    onSave(form, imageFile);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-700 text-text-heading text-lg">{initial ? 'Edit Banner' : 'Add Banner'}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"><X size={16} /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            {/* Preview */}
            {form.image && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-xs font-600">{form.badge}</p>
                  <p className="font-700 leading-tight">{form.title}</p>
                  <p className="text-xs opacity-80">{form.subtitle}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-600 text-text-heading mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={form.image || ''}
                  onChange={e => set('image', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-600 text-text-heading mb-1.5">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 border border-slate-200 rounded-btn px-2 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-600 text-text-heading mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Fresh Groceries" className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-600 text-text-heading mb-1.5">Badge Label</label>
                <input type="text" value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="⚡ Express Delivery" className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-600 text-text-heading mb-1.5">Subtitle</label>
              <input type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Delivered in 30 Mins" className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-600 text-text-heading mb-1.5">Display Order</label>
                <input type="number" value={form.displayOrder} onChange={e => set('displayOrder', Number(e.target.value))} min={1} className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
              </div>
              <div className="flex items-center justify-between pt-5">
                <span className="text-sm font-600 text-text-heading">Active</span>
                <button onClick={() => set('active', !form.active)} className="tap-target">
                  {form.active ? <ToggleRight size={28} className="text-brand-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 px-6 pb-5">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-text-sub font-600 py-2.5 rounded-btn hover:bg-slate-50 text-sm">Cancel</button>
            <button onClick={handleSave} className="flex-1 bg-brand-500 text-white font-600 py-2.5 rounded-btn hover:bg-brand-600 text-sm flex items-center justify-center gap-1.5">
              <Check size={15} /> Save Banner
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Banners() {
  const { data: banners = [], setData: setBanners, loading } = useAdminBanners();
  const [modal, setModal] = useState(null);

  const moveUp = async (id) => {
    const idx = banners.findIndex(b => b.id === id);
    if (idx <= 0) return;
    const b1 = banners[idx];
    const b2 = banners[idx - 1];
    
    // Optimistic
    setBanners(prev => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });

    try {
      await upsertBanner({ ...b1, displayOrder: b2.displayOrder || idx });
      await upsertBanner({ ...b2, displayOrder: b1.displayOrder || (idx + 1) });
    } catch (error) {
      toast.error('Reorder failed');
    }
  };

  const moveDown = async (id) => {
    const idx = banners.findIndex(b => b.id === id);
    if (idx === -1 || idx === banners.length - 1) return;
    const b1 = banners[idx];
    const b2 = banners[idx + 1];

    // Optimistic
    setBanners(prev => {
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });

    try {
      await upsertBanner({ ...b1, displayOrder: b2.displayOrder || (idx + 2) });
      await upsertBanner({ ...b2, displayOrder: b1.displayOrder || (idx + 1) });
    } catch (error) {
      toast.error('Reorder failed');
    }
  };

  const toggleActive = async (id) => {
    try {
      const banner = banners.find(b => b.id === id);
      const saved = await upsertBanner({ ...banner, active: !banner.active });
      setBanners(prev => prev.map(b => b.id === id ? saved : b));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await softDeleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success('Banner deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSave = async (form, imageFile) => {
    try {
      const saved = await upsertBanner(form, imageFile);
      setBanners(prev => {
        const exists = prev.find(b => b.id === saved.id);
        if (exists) return prev.map(b => b.id === saved.id ? saved : b);
        return [...prev, saved].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      });
      toast.success(`Banner ${modal?.data ? 'updated' : 'added'}`);
      setModal(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-4 md:p-6 text-center text-slate-500">Loading banners...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-700 text-text-heading flex items-center gap-2">
          <Image className="text-brand-500" size={24} /> Banners
        </h1>
        <button
          onClick={() => setModal({ data: null })}
          className="flex items-center gap-2 bg-brand-500 text-white font-600 px-4 py-2.5 rounded-btn hover:bg-brand-600 transition-colors text-sm"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="space-y-4">
        {banners.map((banner, idx) => (
          <div key={banner.id} className={`bg-white rounded-xl shadow-card border border-slate-100 p-4 flex gap-4 items-center transition-all ${!banner.active ? 'opacity-60' : ''}`}>
            {/* Reorder arrows */}
            <div className="flex flex-col gap-1">
              <button onClick={() => moveUp(banner.id)} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-30 text-slate-400">
                <ChevronUp size={14} />
              </button>
              <button onClick={() => moveDown(banner.id)} disabled={idx === banners.length - 1} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-30 text-slate-400">
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-text-muted font-600">#{banner.displayOrder}</span>
                <p className="font-700 text-text-heading truncate">{banner.title}</p>
              </div>
              <p className="text-xs text-text-sub truncate">{banner.subtitle}</p>
              {banner.badge && (
                <span className="inline-block mt-1 text-[10px] font-600 bg-slate-100 text-text-sub px-2 py-0.5 rounded-full">{banner.badge}</span>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleActive(banner.id)} className="tap-target">
                {banner.active ? <ToggleRight size={22} className="text-brand-500" /> : <ToggleLeft size={22} className="text-slate-400" />}
              </button>
              <button
                onClick={() => setModal({ data: banner })}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-50 text-brand-500"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal !== null && (
        <BannerModal
          initial={modal.data}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
