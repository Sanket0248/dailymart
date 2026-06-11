import { useState, useMemo, useEffect } from 'react';
import { useAdminProducts, useAdminCategories } from '@/hooks/useAdmin';
import { upsertProduct, softDeleteProduct } from '@/services/adminService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Upload,
  ChevronDown,
  AlertTriangle,
  Package,
} from 'lucide-react';

const UNITS = ['kg', 'g', 'litre', 'ml', 'piece', 'pack'];

function StatusToggle({ active, onChange }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none ${
        active ? 'bg-brand-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function ProductModal({ product, categories, onSave, onClose }) {
  const isEdit = Boolean(product);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: product ?? {
      name: '', brand: '', category: 'dairy', description: '',
      price: '', mrp: '', stock: '', threshold: 5,
      unit: 'piece', weight: '', image: '', active: true,
    },
  });

  const activeVal = watch('active');

  const [imageFile, setImageFile] = useState(null);

  const onSubmit = (data) => {
    onSave({
      ...data,
      id: product?.id || undefined,
      price: Number(data.price),
      mrp: Number(data.mrp),
      stock: Number(data.stock),
      threshold: Number(data.threshold),
      active: Boolean(data.active),
      discount: data.mrp > 0 ? Math.round(((data.mrp - data.price) / data.mrp) * 100) : 0,
    }, imageFile);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0">
        <div className="bg-white rounded-[12px] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col md:my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-lg font-bold text-text-heading">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h3>
            <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center">
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
            <div className="px-5 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-heading mb-1">Product Name *</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g. Amul Taaza Milk"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-slate-200'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-text-heading mb-1">Brand</label>
                <input
                  {...register('brand')}
                  placeholder="e.g. Amul"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-text-heading mb-1">Category *</label>
                <div className="relative">
                  <select
                    {...register('category', { required: true })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white pr-8"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-heading mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Short product description…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Price + MRP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    {...register('price', { required: 'Required', min: { value: 0, message: 'Min 0' } })}
                    placeholder="0"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.price ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    {...register('mrp', { required: 'Required', min: { value: 0, message: 'Min 0' } })}
                    placeholder="0"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.mrp ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                </div>
              </div>

              {/* Stock + Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    {...register('stock', { required: 'Required', min: 0 })}
                    placeholder="0"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.stock ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    {...register('threshold', { min: 0 })}
                    placeholder="5"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Unit + Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-1">Unit</label>
                  <div className="relative">
                    <select
                      {...register('unit')}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white pr-8"
                    >
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-1">Weight/Size</label>
                  <input
                    {...register('weight')}
                    placeholder="e.g. 500 ml"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Image URL + Upload */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-1">Image URL</label>
                  <input
                    {...register('image')}
                    placeholder="https://images.unsplash.com/…"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-1">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-text-heading">Active</p>
                  <p className="text-xs text-text-sub">Visible to customers</p>
                </div>
                <StatusToggle
                  active={activeVal}
                  onChange={(val) => setValue('active', val)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-slate-200 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 text-text-sub hover:bg-slate-50 text-sm font-medium py-2.5 rounded-lg transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors min-h-[44px]"
              >
                {isEdit ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function Products() {
  const { data: products = [], setData: setProducts, loading } = useAdminProducts();
  const { data: CATEGORIES = [], loading: loadingCat } = useAdminCategories();

  const [search, setSearch]             = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modal, setModal]               = useState(null); // null | 'add' | product object
  const [activeToggles, setActiveToggles] = useState({});

  useEffect(() => {
    if (products.length > 0) {
      setActiveToggles(prev => {
        const next = { ...prev };
        products.forEach(p => {
          if (!(p.id in next)) next[p.id] = p.active;
        });
        return next;
      });
    }
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const handleSave = async (data, imageFile) => {
    try {
      const saved = await upsertProduct(data, imageFile);
      setProducts(prev => {
        const exists = prev.find(p => p.id === saved.id);
        if (exists) return prev.map(p => p.id === saved.id ? saved : p);
        return [saved, ...prev];
      });
      setActiveToggles(prev => ({ ...prev, [saved.id]: saved.active }));
      toast.success('Product saved!');
      setModal(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await softDeleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      const nextActive = !product.active;
      const saved = await upsertProduct({ ...product, active: nextActive });
      
      setActiveToggles(prev => ({ ...prev, [productId]: nextActive }));
      setProducts(prev => prev.map(p => p.id === productId ? saved : p));
      toast.success(nextActive ? 'Product activated' : 'Product deactivated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading || loadingCat) {
    return <div className="p-4 md:p-6 text-center text-slate-500">Loading products...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-heading">Products</h2>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors min-h-[44px]"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or brand…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white min-w-[160px]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        <button
          onClick={() => toast('CSV import coming soon!', { icon: '📥' })}
          className="flex items-center gap-2 border border-slate-200 text-text-sub hover:bg-slate-50 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors min-h-[44px]"
        >
          <Upload size={15} />
          <span>Import CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[12px] shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Package size={15} className="text-text-muted" />
          <span className="text-sm text-text-sub">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Image','Name & Brand','Category','Price','MRP','Stock','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-sub uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-sub text-sm">
                    No products found.
                  </td>
                </tr>
              )}
              {filtered.map(product => {
                const isActive = activeToggles[product.id] ?? product.active;
                const isLowStock = product.stock <= product.threshold;
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <p className="font-medium text-text-heading leading-tight">{product.name}</p>
                      <p className="text-xs text-text-sub mt-0.5">{product.brand} · {product.weight}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {(() => {
                        const cat = CATEGORIES.find(c => c.id === product.category);
                        return <span className="text-sm text-text-sub">{cat?.emoji} {cat?.name}</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-heading whitespace-nowrap">₹{product.price}</td>
                    <td className="px-4 py-3 text-text-sub whitespace-nowrap line-through text-xs">₹{product.mrp}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-semibold text-sm ${isLowStock ? 'text-red-500' : 'text-text-heading'}`}>
                        {product.stock}
                        {isLowStock && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusToggle active={isActive} onChange={() => handleToggleActive(product.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal(product)}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          categories={CATEGORIES}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
