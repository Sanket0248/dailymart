import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Grid3X3,
  Tag,
  Image,
  BarChart2,
  Settings,
  LogOut,
  Leaf,
  Menu,
  X,
  User,
  ChevronRight,
  Lock,
  Phone,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: LayoutDashboard, to: '/admin',            end: true },
  { label: 'Orders',     icon: ShoppingBag,     to: '/admin/orders' },
  { label: 'Products',   icon: Package,         to: '/admin/products' },
  { label: 'Categories', icon: Grid3X3,         to: '/admin/categories' },
  { label: 'Coupons',    icon: Tag,             to: '/admin/coupons' },
  { label: 'Banners',    icon: Image,           to: '/admin/banners' },
  { label: 'Reports',    icon: BarChart2,       to: '/admin/reports' },
  { label: 'Settings',   icon: Settings,        to: '/admin/settings' },
];

function SidebarContent({ onNavClick }) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Leaf size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">DailyMart</p>
          <p className="text-slate-400 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px] ${
                isActive
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-white/70" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all duration-150 min-h-[44px]"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

// ─── Admin Login Page ────────────────────────────────────────────────────
function AdminLoginPage() {
  const { sendOtp, verifyOtp, isLoading, user, isAdmin, mockAdminLogin } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [accessDenied, setAccessDenied] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // If already logged in as admin, navigate into panel
  useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, navigate]);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    const result = await sendOtp(phone);
    if (result.success) {
      setOtpSent(true);
      setCountdown(30);
      toast.success('OTP sent!');
    } else {
      toast.error(result.error || 'Failed to send OTP');
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
      // Check admin status from freshly-set store
      const { isAdmin: adminNow } = useAuthStore.getState();
      if (adminNow) {
        toast.success('Welcome back, Store Owner!');
        navigate('/admin');
      } else {
        setAccessDenied(true);
        toast.error('This phone number does not have admin access.');
      }
    } else {
      toast.error(result.error || 'Verification failed');
    }
  };

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    const result = await sendOtp(phone);
    if (result.success) {
      setCountdown(30);
      toast.success('OTP resent!');
    } else {
      toast.error(result.error || 'Failed to resend OTP');
    }
  };

  const handleMockAdmin = () => {
    mockAdminLogin();
    toast.success('Quick admin access granted');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Hidden reCAPTCHA container */}
      <div id="admin-recaptcha-container"></div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">DailyMart Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in with your admin phone number</p>
        </div>

        {/* Access denied state */}
        {accessDenied ? (
          <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert size={28} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Access Denied</h2>
              <p className="text-slate-400 text-sm mt-1">
                This phone number is not registered as an admin.
              </p>
            </div>
            <button
              onClick={() => {
                setAccessDenied(false);
                setOtpSent(false);
                setOtp(['', '', '', '', '', '']);
                setPhone('');
              }}
              className="w-full h-11 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-5">
            {!otpSent ? (
              <>
                {/* Phone input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="h-12 px-3 flex items-center bg-slate-700 border border-slate-600 rounded-xl flex-shrink-0">
                      <Phone size={14} className="text-slate-400 mr-1.5" />
                      <span className="text-sm font-bold text-slate-200">+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                      placeholder="Admin phone number"
                      className="flex-1 h-12 px-4 bg-slate-700 border border-slate-600 rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={isLoading || phone.length !== 10}
                  className="w-full h-12 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  {isLoading ? <RotateCcw size={16} className="animate-spin" /> : null}
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-slate-400 mb-4 text-center">
                    OTP sent to{' '}
                    <span className="font-bold text-white">+91 {phone}</span>
                  </p>

                  {/* OTP inputs */}
                  <div className="flex gap-2 justify-center mb-3">
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
                        className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none transition-all bg-slate-700 ${
                          digit
                            ? 'border-brand-500 text-brand-300'
                            : 'border-slate-600 text-white focus:border-brand-400'
                        }`}
                        aria-label={`OTP digit ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-xs text-slate-500">
                        Resend in <span className="font-bold text-brand-400">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={isLoading}
                        className="text-xs font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-2 disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleVerify}
                  disabled={isLoading || otp.join('').length < 6}
                  className="w-full h-12 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  {isLoading ? (
                    <RotateCcw size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  Verify & Enter Admin
                </button>

                <button
                  onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                  className="w-full text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  ← Change number
                </button>
              </>
            )}
          </div>
        )}

        {/* Quick Admin Access (testing) */}
        <div className="mt-4 text-center">
          <button
            onClick={handleMockAdmin}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-2 transition-all"
          >
            <Zap size={11} className="text-amber-500" />
            Quick Admin Access
          </button>
        </div>

        <div className="text-center mt-3">
          <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { isAdmin, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAdmin) return <AdminLoginPage />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-slate-900 flex-col fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-slate-900 z-50 md:hidden flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end p-3 border-b border-slate-700">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-top sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-bold text-text-heading hidden sm:block">DailyMart Admin</h1>
          </div>

          {/* Admin user */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-text-heading leading-tight">
                {user?.name || 'Store Owner'}
              </p>
              <p className="text-xs text-text-sub">{user?.phone || ''}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-brand-600" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
