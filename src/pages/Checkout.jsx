import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  MapPin,
  Clock,
  Wallet,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { placeOrder } from '@/services/orderService';
import { DELIVERY_SLOTS, STORE_INFO } from '@/data/mockData';
import { formatPrice } from '@/utils/helpers';

const STEPS = [
  { id: 1, label: 'Address' },
  { id: 2, label: 'Slot' },
  { id: 3, label: 'Payment' },
];

const SERVICEABLE_PINCODES = STORE_INFO.serviceablePincodes;

function InputField({ label, value, onChange, error, placeholder, type = 'text', inputMode = 'text', optional }) {
  return (
    <div>
      <label className="text-xs font-600 text-text-sub mb-1 block">
        {label} {optional && <span className="text-text-muted font-400">(optional)</span>}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full h-11 px-3 border rounded-lg text-sm text-text-heading placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
            : 'border-slate-200 focus:border-brand-400 focus:ring-brand-200'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center px-6 py-4">
      {STEPS.map((step, idx) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-700 transition-all duration-300 ${
                  done
                    ? 'bg-brand-500 text-white'
                    : active
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : step.id}
              </div>
              <span
                className={`text-[10px] font-600 whitespace-nowrap ${
                  active ? 'text-brand-600' : done ? 'text-brand-500' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 transition-colors duration-300 ${
                  step.id < currentStep ? 'bg-brand-400' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AddressStep({ selected, setSelected, onContinue }) {
  const [form, setForm] = useState(selected || {
    name: '', phone: '', flat: '', area: '', landmark: '', pincode: '', city: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!form.flat.trim()) e.flat = 'Flat / Building is required';
    if (!form.area.trim()) e.area = 'Area is required';
    if (!SERVICEABLE_PINCODES.includes(form.pincode.trim())) {
      e.pincode = `We deliver only to pincodes: ${SERVICEABLE_PINCODES.join(', ')}`;
    }
    if (!form.city.trim()) e.city = 'City is required';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSelected(form);
    onContinue();
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="text-sm font-700 text-text-heading px-1">Delivery Address</h2>

      <div className="bg-white rounded-card shadow-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <InputField label="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} error={errors.name} placeholder="Rajan Sharma" />
          </div>
          <div className="col-span-2">
            <InputField label="Phone Number" type="tel" inputMode="numeric" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} error={errors.phone} placeholder="10-digit number" />
          </div>
          <div className="col-span-2">
            <InputField label="Flat / Building" value={form.flat} onChange={(e) => setForm((p) => ({ ...p, flat: e.target.value }))} error={errors.flat} placeholder="House no, Building, Street" />
          </div>
          <div className="col-span-2">
            <InputField label="Area / Colony" value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))} error={errors.area} placeholder="Area or Colony name" />
          </div>
          <div className="col-span-2">
            <InputField label="Landmark" value={form.landmark} onChange={(e) => setForm((p) => ({ ...p, landmark: e.target.value }))} error={errors.landmark} placeholder="Near school, temple..." optional />
          </div>
          <InputField label="Pincode" type="tel" inputMode="numeric" value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} error={errors.pincode} placeholder="476221" />
          <InputField label="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} error={errors.city} placeholder="Joura" />
        </div>
        
        <button
          onClick={handleSave}
          className="w-full h-13 bg-brand-500 text-white font-700 text-[15px] rounded-btn active:scale-[0.98] transition-all shadow-sm mt-3"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}

function SlotStep({ selectedSlot, setSelectedSlot, onContinue }) {
  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="text-sm font-700 text-text-heading px-1">Choose Delivery Slot</h2>

      <div className="space-y-2">
        {DELIVERY_SLOTS.map((slot) => (
          <div
            key={slot.id}
            onClick={() => setSelectedSlot(slot.id)}
            className={`bg-white rounded-card shadow-card p-4 cursor-pointer transition-all border-2 flex items-center gap-3 ${
              selectedSlot === slot.id ? 'border-brand-500' : 'border-transparent'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                selectedSlot === slot.id ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
              }`}
            >
              {selectedSlot === slot.id && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-xl">{slot.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-700 text-text-heading">{slot.label}</p>
              <p className="text-xs text-text-sub">{slot.time}</p>
            </div>
            {slot.price === 0 ? (
              <span className="text-xs font-600 text-brand-600 bg-brand-50 px-2 py-0.5 rounded-pill">
                FREE
              </span>
            ) : (
              <span className="text-xs font-600 text-text-sub">{formatPrice(slot.price)}</span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          if (!selectedSlot) { toast.error('Please select a delivery slot'); return; }
          onContinue();
        }}
        className="w-full h-13 bg-brand-500 text-white font-700 text-[15px] rounded-btn active:scale-[0.98] transition-all shadow-sm"
      >
        Continue
      </button>
    </div>
  );
}

function PaymentStep({ selectedPayment, setSelectedPayment, onPlaceOrder, loading }) {
  const { items, getSubtotal, getDeliveryFee, getCouponDiscount, getTotal } = useCartStore();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const subtotal = getSubtotal();
  const delivery = getDeliveryFee();
  const discount = getCouponDiscount();
  const total = getTotal();

  const METHODS = [
    {
      id: 'upi',
      icon: <Wallet size={20} className="text-brand-500" />,
      label: 'Pay via UPI',
      detail: (
        <div className="mt-3 ml-8">
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 flex items-center gap-3">
            <div className="w-16 h-16 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="text-center">
                <div className="grid grid-cols-3 gap-0.5 p-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-white rounded-sm opacity-80" />
                  ))}
                </div>
                <p className="text-[8px] text-white font-600 mt-0.5">Scan QR</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-700 text-text-heading">UPI ID</p>
              <p className="text-sm font-700 text-brand-600">dailymart@upi</p>
              <p className="text-[11px] text-text-sub mt-1">DailyMart – Joura</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cod',
      icon: <Banknote size={20} className="text-amber-500" />,
      label: 'Cash on Delivery',
      sublabel: 'Pay when delivered',
    },
    {
      id: 'card',
      icon: <CreditCard size={20} className="text-blue-500" />,
      label: 'Card / Net Banking',
      badge: 'Razorpay',
      detail: (
        <div className="mt-2 ml-8">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <CreditCard size={14} className="text-blue-500" />
            <p className="text-xs text-blue-700 font-600">
              You will be redirected to Razorpay's secure payment page
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="text-sm font-700 text-text-heading px-1">Payment Method</h2>

      <div className="space-y-2">
        {METHODS.map((method) => (
          <div key={method.id}>
            <div
              onClick={() => setSelectedPayment(method.id)}
              className={`bg-white rounded-card shadow-card p-4 cursor-pointer transition-all border-2 ${
                selectedPayment === method.id ? 'border-brand-500' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedPayment === method.id
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedPayment === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                {method.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-700 text-text-heading">{method.label}</p>
                    {method.badge && (
                      <span className="text-[10px] font-600 text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-pill">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  {method.sublabel && (
                    <p className="text-xs text-text-sub">{method.sublabel}</p>
                  )}
                </div>
              </div>
              {selectedPayment === method.id && method.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary Collapsible */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <button
          onClick={() => setSummaryOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <span className="text-sm font-700 text-text-heading">
            Order Summary · {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-700 text-brand-600">{formatPrice(total)}</span>
            {summaryOpen ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </div>
        </button>

        {summaryOpen && (
          <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3 animate-fade-in">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-slate-50">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="flex-1 text-xs text-text-sub line-clamp-1">{product.name}</p>
                <p className="text-xs font-600 text-text-heading">×{qty}</p>
                <p className="text-xs font-700 text-brand-600 w-14 text-right">
                  {formatPrice(product.price * qty)}
                </p>
              </div>
            ))}
            <div className="h-px bg-slate-100 my-1" />
            <div className="flex justify-between text-xs text-text-sub">
              <span>Subtotal</span><span className="font-600">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-text-sub">
              <span>Delivery</span>
              <span className={`font-600 ${delivery === 0 ? 'text-brand-500' : ''}`}>
                {delivery === 0 ? 'FREE' : formatPrice(delivery)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-brand-600">
                <span>Coupon Discount</span><span className="font-700">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-700 text-sm text-text-heading">
              <span>Total</span><span className="text-brand-600">{formatPrice(total)}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          if (!selectedPayment) { toast.error('Please select a payment method'); return; }
          onPlaceOrder();
        }}
        disabled={loading}
        className="w-full h-13 bg-brand-500 hover:bg-brand-600 text-white font-700 text-[15px] rounded-btn active:scale-[0.98] transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Placing Order...
          </>
        ) : (
          `Place Order · ${formatPrice(total)}`
        )}
      </button>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('express');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    items,
    getSubtotal,
    getDeliveryFee,
    getCouponDiscount,
    getTotal,
    coupon,
    clearCart,
  } = useCartStore();

  const handlePlaceOrder = async () => {
    setLoading(true);
    // 1.5s simulated loading animation before API call resolves
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const subtotal = getSubtotal();
      const deliveryFee = getDeliveryFee();
      const couponDiscount = getCouponDiscount();
      const total = getTotal();

      // Build address object
      const address = selectedAddress || { name: 'New Address', phone: '', flat: '', area: '', city: '', pincode: '' };

      const orderId = await placeOrder({
        userUid: user?.uid || 'guest',
        items,
        subtotal,
        deliveryFee,
        couponCode: coupon?.code || null,
        couponDiscount,
        total,
        paymentMethod: selectedPayment,
        deliverySlot: selectedSlot,
        address,
      });

      clearCart();
      navigate(`/order-confirmed/${orderId}`, { replace: true });
      toast.success('Order placed! 🎉');
    } catch (err) {
      console.error('Place order error:', err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => (step > 1 ? setStep((s) => s - 1) : navigate(-1))}
            className="tap-target -ml-2 text-text-heading"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-base font-700 text-text-heading">Checkout</h1>
        </div>
        <StepIndicator currentStep={step} />
      </div>

      <div className="flex-1 px-4 py-4 pb-8">
        {step === 1 && (
          <AddressStep
            selected={selectedAddress}
            setSelected={setSelectedAddress}
            onContinue={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <SlotStep
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            onContinue={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <PaymentStep
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
            onPlaceOrder={handlePlaceOrder}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
