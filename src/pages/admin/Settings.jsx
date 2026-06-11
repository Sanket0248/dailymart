import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { updateSettings } from '@/services/settingsService';
import { Settings as SettingsIcon, Store, Clock, Truck, Percent, MapPin, MessageCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Icon size={16} className="text-brand-500" />
        </div>
        <h2 className="font-700 text-text-heading">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-600 text-text-heading mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLS = 'w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all';

export default function Settings() {
  const { settings, loading } = useSettings();
  const [store, setStore] = useState({});
  const [hours, setHours] = useState(DAYS.map((d, i) => ({ day: d, open: i < 6, from: '08:00', to: '21:00' })));
  const [delivery, setDelivery] = useState({ freeAbove: 299, fee: 30 });
  const [gst, setGst] = useState(5);
  const [pincodes, setPincodes] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setStore({
        name: settings.store_name || '',
        phone: settings.phone || '',
        address: settings.address || '',
        city: settings.city || '',
        tagline: settings.tagline || ''
      });
      setDelivery({ freeAbove: settings.delivery_free_above || 0, fee: settings.delivery_fee || 0 });
      setGst(settings.gst || 0);
      setPincodes((settings.serviceable_pincodes || []).join(', '));
      setWhatsapp(settings.whatsapp || '');
      setHours(DAYS.map((d, i) => ({ day: d, open: i < 6, from: settings.open_time || '08:00', to: settings.close_time || '21:00' })));
    }
  }, [settings]);

  const setS = (k, v) => setStore(s => ({ ...s, [k]: v }));

  const toggleDay = (idx) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, open: !h.open } : h));
  };

  const setHourField = (idx, key, val) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [key]: val } : h));
  };

  const validatePincodes = (val) => {
    const codes = val.split(',').map(p => p.trim()).filter(Boolean);
    return codes.every(c => /^\d{6}$/.test(c));
  };

  const handleSave = async () => {
    if (!store.name?.trim()) { toast.error('Store name is required'); return; }
    if (!validatePincodes(pincodes)) { toast.error('Pincodes must be 6-digit numbers separated by commas'); return; }
    setSaving(true);
    try {
      await updateSettings({
        store_name: store.name,
        phone: store.phone,
        address: store.address,
        city: store.city,
        tagline: store.tagline,
        delivery_free_above: delivery.freeAbove,
        delivery_fee: delivery.fee,
        gst: gst,
        serviceable_pincodes: pincodes.split(',').map(p => p.trim()).filter(Boolean),
        whatsapp: whatsapp,
        open_time: hours[0].from,
        close_time: hours[0].to,
      });
      toast.success('Settings saved successfully!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsapp = () => {
    const msg = encodeURIComponent(`Hello! This is a test alert from DailyMart (${store.name})`);
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
  };

  if (loading) return <div className="p-4 md:p-6 text-center text-slate-500">Loading settings...</div>;

  return (
    <div>
      <h1 className="text-2xl font-700 text-text-heading flex items-center gap-2 mb-6">
        <SettingsIcon className="text-brand-500" size={24} /> Settings
      </h1>

      <div className="space-y-6 max-w-3xl">
        {/* Store Info */}
        <SectionCard title="Store Information" icon={Store}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Store Name *">
              <input type="text" value={store.name} onChange={e => setS('name', e.target.value)} className={INPUT_CLS} />
            </Field>
            <Field label="Phone Number">
              <input type="tel" value={store.phone} onChange={e => setS('phone', e.target.value)} className={INPUT_CLS} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <input type="text" value={store.address} onChange={e => setS('address', e.target.value)} className={INPUT_CLS} />
              </Field>
            </div>
            <Field label="City">
              <input type="text" value={store.city} onChange={e => setS('city', e.target.value)} className={INPUT_CLS} />
            </Field>
            <Field label="Tagline">
              <input type="text" value={store.tagline} onChange={e => setS('tagline', e.target.value)} className={INPUT_CLS} />
            </Field>
          </div>
        </SectionCard>

        {/* Operating Hours */}
        <SectionCard title="Operating Hours" icon={Clock}>
          <div className="space-y-2">
            {hours.map((h, idx) => (
              <div key={h.day} className={`flex items-center gap-3 py-2.5 rounded-xl px-3 transition-all ${h.open ? 'bg-slate-50' : 'bg-slate-50/30 opacity-60'}`}>
                <button
                  onClick={() => toggleDay(idx)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${h.open ? 'bg-brand-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${h.open ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-sm font-600 text-text-heading w-24 flex-shrink-0">{h.day}</span>
                {h.open ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="time"
                      value={h.from}
                      onChange={e => setHourField(idx, 'from', e.target.value)}
                      className="border border-slate-200 rounded-btn px-2 py-1.5 text-sm focus:border-brand-500 outline-none"
                    />
                    <span className="text-text-muted text-xs">to</span>
                    <input
                      type="time"
                      value={h.to}
                      onChange={e => setHourField(idx, 'to', e.target.value)}
                      className="border border-slate-200 rounded-btn px-2 py-1.5 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
                ) : (
                  <span className="ml-auto text-xs text-text-muted font-600">Closed</span>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Delivery Settings */}
        <SectionCard title="Delivery Settings" icon={Truck}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Free Delivery Above (₹)">
              <input
                type="number"
                value={delivery.freeAbove}
                onChange={e => setDelivery(d => ({ ...d, freeAbove: Number(e.target.value) }))}
                min="0"
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Delivery Fee (₹)">
              <input
                type="number"
                value={delivery.fee}
                onChange={e => setDelivery(d => ({ ...d, fee: Number(e.target.value) }))}
                min="0"
                className={INPUT_CLS}
              />
            </Field>
          </div>
          <p className="mt-3 text-xs text-text-muted bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            💡 Free delivery on orders above ₹{delivery.freeAbove}, else ₹{delivery.fee} flat charge.
          </p>
        </SectionCard>

        {/* GST */}
        <SectionCard title="GST Settings" icon={Percent}>
          <div className="max-w-xs">
            <Field label="GST Percentage (%)">
              <input
                type="number"
                value={gst}
                onChange={e => setGst(Number(e.target.value))}
                min="0"
                max="28"
                step="0.5"
                className={INPUT_CLS}
              />
            </Field>
          </div>
          <p className="mt-3 text-xs text-text-muted">GST will be calculated and shown at checkout on the order total.</p>
        </SectionCard>

        {/* Serviceable Pincodes */}
        <SectionCard title="Serviceable Pincodes" icon={MapPin}>
          <Field label="Pincodes (comma-separated 6-digit codes)">
            <textarea
              value={pincodes}
              onChange={e => setPincodes(e.target.value)}
              rows={3}
              placeholder="476221, 476224, 476228"
              className="w-full border border-slate-200 rounded-btn px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none resize-none font-mono"
            />
          </Field>
          {pincodes && !validatePincodes(pincodes) && (
            <p className="mt-1.5 text-xs text-red-500">⚠ All pincodes must be exactly 6 digits, separated by commas.</p>
          )}
          <p className="mt-2 text-xs text-text-muted">
            Currently serving: {pincodes.split(',').filter(p => p.trim()).length} pincode(s)
          </p>
        </SectionCard>

        {/* WhatsApp Alerts */}
        <SectionCard title="WhatsApp Order Alerts" icon={MessageCircle}>
          <Field label="WhatsApp Number (with country code, no +)">
            <div className="flex gap-3">
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                placeholder="919876543210"
                className={`${INPUT_CLS} flex-1`}
              />
              <button
                onClick={handleTestWhatsapp}
                className="flex-shrink-0 border border-brand-500 text-brand-500 font-600 px-4 py-2.5 rounded-btn hover:bg-brand-50 text-sm transition-colors whitespace-nowrap"
              >
                Test Alert
              </button>
            </div>
          </Field>
          <p className="mt-2 text-xs text-text-muted">
            New orders will send a WhatsApp notification to this number via <code className="bg-slate-100 px-1 rounded">wa.me</code> link.
          </p>
        </SectionCard>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-brand-500 text-white font-700 py-4 rounded-btn hover:bg-brand-600 transition-all disabled:opacity-70 text-base flex items-center justify-center gap-2 shadow-md"
        >
          {saving ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : (
            <><Save size={18} /> Save All Settings</>
          )}
        </button>
      </div>
    </div>
  );
}
