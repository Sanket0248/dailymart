import { useState, useRef, useEffect } from 'react';
import {
  User,
  Phone,
  LogOut,
  MapPin,
  Bell,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  Info,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

// ─── OTP Login Component ────────────────────────────────────────────────
function OtpLogin() {
  const { sendOtp, verifyOtp, signInWithGoogle, isLoading } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  const maskedPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

  // No recaptcha needed for Fast2SMS

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    const result = await sendOtp(phone);
    if (result.success) {
      setOtpSent(true);
      setCountdown(30);
      toast.success('OTP sent to your mobile!');
    } else {
      toast.error(result.error || 'Failed to send OTP. Try again.');
    }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Enter the complete 6-digit OTP');
      return;
    }
    const result = await verifyOtp(code);
    if (result.success) {
      toast.success('Welcome to DailyMart! 🎉');
    } else {
      toast.error(result.error || 'Verification failed. Try again.');
    }
  };

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    const result = await sendOtp(phone);
    if (result.success) {
      setCountdown(30);
      toast.success('OTP resent!');
    } else {
      toast.error(result.error || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="flex flex-col items-center px-6 py-10 text-center animate-fade-in">
      {/* Illustration */}
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
        <User size={36} className="text-slate-300" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-700 text-text-heading mb-1">Sign in to DailyMart</h2>
      <p className="text-sm text-text-sub mb-8 max-w-[240px]">
        Access your orders, saved addresses and more
      </p>

      {!otpSent ? (
        <div className="w-full max-w-xs space-y-4">
          {/* Phone input */}
          <div className="flex gap-2">
            <div className="h-12 px-3 flex items-center bg-slate-100 border border-slate-200 rounded-lg flex-shrink-0">
              <Phone size={14} className="text-text-sub mr-1.5" />
              <span className="text-sm font-700 text-text-heading">+91</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              placeholder="Enter mobile number"
              className="flex-1 h-12 px-3 border border-slate-200 rounded-lg text-sm font-600 text-text-heading placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 transition-colors"
            />
          </div>
          <button
            onClick={handleSendOtp}
            disabled={isLoading || phone.length !== 10}
            className="w-full h-12 bg-brand-500 text-white font-700 text-sm rounded-btn disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <RotateCcw size={16} className="animate-spin" />
            ) : null}
            Send OTP
          </button>
          
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-text-muted text-xs">or continue with</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            onClick={async () => {
              const res = await signInWithGoogle();
              if (res.success) toast.success('Welcome to DailyMart! 🎉');
              else toast.error(res.error || 'Google login failed');
            }}
            disabled={isLoading}
            className="w-full h-12 bg-white border border-slate-200 text-text-heading font-700 text-sm rounded-btn active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xs space-y-5 animate-fade-slide-up">
          <div>
            <p className="text-sm text-text-sub mb-4">
              We sent OTP to{' '}
              <span className="font-700 text-text-heading">{maskedPhone}</span>
            </p>

            {/* 6-digit OTP inputs */}
            <div className="flex gap-2 justify-center mb-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className={`w-11 h-12 text-center text-lg font-700 border-2 rounded-lg focus:outline-none transition-all ${
                    digit
                      ? 'border-brand-500 text-brand-700 bg-brand-50'
                      : 'border-slate-200 text-text-heading focus:border-brand-400'
                  }`}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            {/* Resend link */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-text-sub">
                  Resend OTP in <span className="font-700 text-brand-500">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-xs font-600 text-brand-500 underline underline-offset-2 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading || otp.join('').length < 6}
            className="w-full h-12 bg-brand-500 text-white font-700 text-sm rounded-btn disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {isLoading ? <RotateCcw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Verify OTP
          </button>

          <button
            onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
            className="text-xs text-text-sub underline underline-offset-2"
          >
            Change number
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Logged In Profile ──────────────────────────────────────────────────
const MOCK_ADDRESSES = [
  {
    id: 'a1',
    label: 'Home',
    name: 'Rajan Sharma',
    phone: '9876543210',
    address: '12, Shanti Nagar, Main Market, Joura – 476221',
  },
];

function LoggedInView({ user, logout }) {
  const [notifOn, setNotifOn] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [name, setName] = useState(user.name || 'User');
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleDeleteAddress = (id) => {
    setAddresses((a) => a.filter((addr) => addr.id !== id));
    toast('Address removed', { icon: '🗑️' });
  };

  // Display phone without +91 prefix for cleaner look
  const displayPhone = user.phone
    ? user.phone.replace(/^\+91/, '')
    : user.email || '';

  return (
    <div className="pb-24 animate-fade-in">
      {/* Profile card */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 px-4 pt-10 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-800 text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            {editProfile ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => { setEditProfile(false); toast.success('Profile updated'); }}
                className="w-full bg-white/20 text-white font-700 text-lg rounded px-2 py-0.5 focus:outline-none placeholder:text-white/60"
                autoFocus
              />
            ) : (
              <p className="text-white font-700 text-lg leading-tight">{name}</p>
            )}
            <p className="text-white/70 text-sm mt-0.5">{user.phone ? `+91 ${displayPhone}` : displayPhone}</p>
            {/* Admin badge */}
            {user.isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1.5 bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-[10px] font-700 px-2 py-0.5 rounded-full">
                <ShieldCheck size={10} />
                Admin Access
              </span>
            )}
          </div>
          <button
            onClick={() => setEditProfile((e) => !e)}
            className="tap-target text-white/80 hover:text-white"
            aria-label="Edit profile"
          >
            <Edit2 size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* Sync notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <RotateCcw size={13} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">Address sync in progress — powered by Supabase</p>
        </div>

        {/* My Addresses */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-500" />
              <span className="text-sm font-700 text-text-heading">My Addresses</span>
            </div>
            <button
              onClick={() => {
                const newAddr = {
                  id: `a${Date.now()}`,
                  label: 'Other',
                  name: name || 'User',
                  phone: displayPhone || '',
                  address: 'New address – Joura, 476221',
                };
                setAddresses((a) => [...a, newAddr]);
                toast.success('New address added');
              }}
              className="flex items-center gap-1 text-xs font-600 text-brand-500"
            >
              <Plus size={13} /> Add New
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-text-sub">No saved addresses</p>
            </div>
          ) : (
            addresses.map((addr, idx) => (
              <div
                key={addr.id}
                className={`px-4 py-3 ${idx < addresses.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-700 text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-pill">
                        🏠 {addr.label}
                      </span>
                    </div>
                    <p className="text-sm font-600 text-text-heading">{addr.name}</p>
                    <p className="text-xs text-text-sub mt-0.5 leading-relaxed">{addr.address}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => toast('Edit address (coming soon)')}
                      className="tap-target text-slate-400 hover:text-brand-500"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="tap-target text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
            <Bell size={16} className="text-text-sub" />
            <span className="text-sm font-700 text-text-heading flex-1">Notifications</span>
            <button
              onClick={() => {
                setNotifOn((n) => !n);
                toast(notifOn ? 'Notifications disabled' : 'Notifications enabled');
              }}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                notifOn ? 'bg-brand-500' : 'bg-slate-200'
              }`}
              role="switch"
              aria-checked={notifOn}
              aria-label="Toggle notifications"
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  notifOn ? 'translate-x-5.5 left-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => toast('About DailyMart – Version 1.0.0, Joura MP')}
            className="w-full flex items-center gap-2 px-4 py-3 active:bg-slate-50 transition-colors"
          >
            <Info size={16} className="text-text-sub" />
            <span className="text-sm text-text-sub flex-1 text-left">About DailyMart</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        </div>

        {/* App version */}
        <p className="text-center text-[11px] text-text-muted py-2">
          DailyMart v1.0 · Joura, Madhya Pradesh
        </p>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            toast('Logged out successfully');
          }}
          className="w-full h-12 border-2 border-red-400 text-red-500 font-700 text-sm rounded-btn active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Account Page ───────────────────────────────────────────────────────
export default function Account() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-top px-4 h-14 flex items-center">
        <h1 className="text-base font-700 text-text-heading">Account</h1>
      </div>

      <div className="flex-1">
        {user ? (
          <LoggedInView user={user} logout={logout} />
        ) : (
          <OtpLogin />
        )}
      </div>
    </div>
  );
}
