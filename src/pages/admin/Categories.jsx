import { useState } from 'react';
import { useAdminCategories } from '@/hooks/useAdmin';
import { upsertCategory, softDeleteCategory } from '@/services/adminService';
import { Plus, Edit2, Trash2, Grid3X3, GripVertical, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_FORM = { name: '', emoji: '🛒', displayOrder: 1, active: true };

function CategoryModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || DEFAULT_FORM);
  const [imageFile, setImageFile] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    onSave(form, imageFile);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-700 text-text-heading text-lg">{initial ? 'Edit Category' : 'Add Category'}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"><X size={16} /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-600 text-text-heading mb-1.5">Emoji Icon</label>
              <div className="flex gap-3 items-center">
                <span className="text-4xl">{form.emoji}</span>
                <input
                  type="text"
                  value={form.emoji}
                  onChange={e => set('emoji', e.target.value)}
                  className="w-24 border border-slate-200 rounded-btn px-3 py-2 text-center text-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  maxLength={2}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-600 text-text-heading mb-1.5">Category Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Dairy"
                className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-600 text-text-heading mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={form.image || ''}
                  onChange={e => set('image', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-slate-200 rounded-btn px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-600 text-text-heading mb-1.5">Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 border border-slate-200 rounded-btn px-2 py-1.5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-600 text-text-heading mb-1.5">Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={e => set('displayOrder', Number(e.target.value))}
                min={1}
                className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
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
              <Check size={15} /> Save Category
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Categories() {
  const { data: cats = [], setData: setCats, loading } = useAdminCategories();
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data? }

  const toggleActive = async (id) => {
    try {
      const cat = cats.find(c => c.id === id);
      const saved = await upsertCategory({ ...cat, active: !cat.active });
      setCats(prev => prev.map(c => c.id === id ? saved : c));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await softDeleteCategory(id);
      setCats(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSave = async (form, imageFile) => {
    try {
      const saved = await upsertCategory(form, imageFile);
      setCats(prev => {
        const exists = prev.find(c => c.id === saved.id);
        if (exists) return prev.map(c => c.id === saved.id ? saved : c);
        return [...prev, saved].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      });
      toast.success(`Category ${modal.mode === 'edit' ? 'updated' : 'added'}`);
      setModal(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-4 md:p-6 text-center text-slate-500">Loading categories...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-700 text-text-heading flex items-center gap-2">
          <Grid3X3 className="text-brand-500" size={24} /> Categories
        </h1>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 bg-brand-500 text-white font-600 px-4 py-2.5 rounded-btn hover:bg-brand-600 transition-colors text-sm"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cats.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl shadow-card border border-slate-100 p-5 flex items-center gap-4 hover:shadow-card-hover transition-all">
            <GripVertical size={16} className="text-slate-300 cursor-grab flex-shrink-0" />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: cat.color || '#f0fdf6' }}
            >
              {cat.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-700 text-text-heading">{cat.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{cat.count} products · Order #{cat.displayOrder}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleActive(cat.id)} className="tap-target">
                {cat.active
                  ? <ToggleRight size={22} className="text-brand-500" />
                  : <ToggleLeft size={22} className="text-slate-400" />}
              </button>
              <button
                onClick={() => setModal({ mode: 'edit', data: cat })}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-50 text-brand-500 transition-colors"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <CategoryModal
          initial={modal.data}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
