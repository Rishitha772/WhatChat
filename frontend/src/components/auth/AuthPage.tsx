import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Volume2,
  Wifi,
  PartyPopper,
  Building,
  User as UserIcon,
} from 'lucide-react';
import { ApiError, apiRequest, type SessionUser } from '../../services/api';

type Tab = 'login' | 'otp' | 'signup';
type ViewKind = 'tabs' | 'forgot-password' | 'reset-password' | 'activated' | 'onboarding';

const passwordRules = [
  { label: 'At least 8 characters', test: (val: string) => val.length >= 8 },
  { label: 'One uppercase letter', test: (val: string) => /[A-Z]/.test(val) },
  { label: 'One number', test: (val: string) => /\d/.test(val) },
  { label: 'One special character', test: (val: string) => /[^A-Za-z0-9]/.test(val) },
];

const countryCodes = [
  { code: '+91', country: 'IN', label: 'IN +91' },
  { code: '+1', country: 'US', label: 'US +1' },
  { code: '+44', country: 'GB', label: 'GB +44' },
  { code: '+971', country: 'AE', label: 'AE +971' },
  { code: '+65', country: 'SG', label: 'SG +65' },
  { code: '+61', country: 'AU', label: 'AU +61' },
];

function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'EMAIL_NOT_VERIFIED') return 'Please verify your email address before signing in.';
    if (error.code === 'EMAIL_ALREADY_REGISTERED') return 'An account already uses this email. Try signing in instead.';
    if (error.code === 'INVALID_CREDENTIALS') return 'The email, username or password is incorrect.';
    if (error.code === 'RATE_LIMIT_EXCEEDED') return error.message;
    if (error.code === 'EMAIL_NOT_CONFIGURED') return 'Email delivery is not configured. Contact the administrator.';
    return error.message;
  }
  return 'Unable to complete request. Please try again.';
}

export function AuthPage() {
  const currentPath = window.location.pathname;
  const initialToken = new URLSearchParams(window.location.search).get('token');

  // View & Tab routing
  const [view, setView] = useState<ViewKind>(() => {
    if (initialToken && currentPath === '/verify-email') return 'activated';
    if (currentPath === '/forgot-password') return 'forgot-password';
    if (currentPath === '/reset-password') return 'reset-password';
    if (currentPath === '/onboarding') return 'onboarding';
    return 'tabs';
  });

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (currentPath === '/signup') return 'signup';
    return 'login';
  });

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(
    () => sessionStorage.getItem('whatchat_pending_username') || sessionStorage.getItem('whatchat_pending_email') || ''
  );
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAgree, setLoginAgree] = useState(true);

  // OTP Login state
  const [otpCountry, setOtpCountry] = useState('+91');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerifiedNumber, setOtpVerifiedNumber] = useState<string | null>(null);

  // Sign Up form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCountry, setSignupCountry] = useState('+91');
  const [signupPassword, setSignupPassword] = useState('');
  const [dataRegion, setDataRegion] = useState('IN India');
  const [signupAgree, setSignupAgree] = useState(true);

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Onboarding profile state
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingUsername, setOnboardingUsername] = useState('');
  const [onboardingAbout, setOnboardingAbout] = useState('');

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Cloudflare widget simulated success
  const [cfVerified, setCfVerified] = useState(true);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Verification banner on login screen (Image 6)
  const [verificationBanner, setVerificationBanner] = useState<{
    email: string;
    username: string;
    devLink?: string | null;
  } | null>(() => {
    const savedEmail = sessionStorage.getItem('whatchat_pending_email');
    const savedUser = sessionStorage.getItem('whatchat_pending_username');
    const savedDev = sessionStorage.getItem('whatchat_dev_link');
    if (savedEmail) {
      return {
        email: savedEmail,
        username: savedUser || savedEmail.split('@')[0],
        devLink: savedDev,
      };
    }
    return null;
  });

  // Account activated info (Image 7)
  const [activatedInfo, setActivatedInfo] = useState<{
    fullName: string;
    username: string;
  }>({
    fullName: 'Rishitha Khandesh',
    username: 'rishitha.khandesh',
  });

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendCooldown]);

  // Token auto-verification on mount
  useEffect(() => {
    if (currentPath === '/verify-email' && initialToken) {
      setLoading(true);
      setError('');
      apiRequest<{ message: string }>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token: initialToken }),
      })
        .then(() => {
          setView('activated');
          const savedEmail = sessionStorage.getItem('whatchat_pending_email') || 'User';
          const savedUser = sessionStorage.getItem('whatchat_pending_username') || savedEmail.split('@')[0];
          setActivatedInfo({
            fullName: savedUser.replace('.', ' ').toUpperCase(),
            username: savedUser,
          });
          sessionStorage.removeItem('whatchat_pending_email');
        })
        .catch((err) => {
          if (err instanceof ApiError && err.code === 'ALREADY_VERIFIED') {
            setView('activated');
            return;
          }
          setView('tabs');
          setActiveTab('login');
          setError(friendlyError(err));
        })
        .finally(() => setLoading(false));
    }
  }, [currentPath, initialToken]);

  // Strength score for sign up password
  const strength = useMemo(
    () => passwordRules.filter((r) => r.test(signupPassword)).length,
    [signupPassword]
  );

  // Tab switcher helper
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setView('tabs');
    setError('');
    setNotice('');
    const newPath = tab === 'signup' ? '/signup' : '/login';
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  // 1. Submit Login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setNotice('');
    if (!loginIdentifier.trim()) {
      setError('Please enter your username or email address.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest<{ profileComplete: boolean; user: SessionUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginIdentifier.trim(), password: loginPassword }),
      });
      sessionStorage.removeItem('whatchat_pending_email');
      window.location.assign(res.profileComplete ? '/' : '/onboarding');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
        const cleanId = loginIdentifier.trim();
        const pendingEmail = cleanId.includes('@') ? cleanId : `${cleanId}@gmail.com`;
        sessionStorage.setItem('whatchat_pending_email', pendingEmail);
        sessionStorage.setItem('whatchat_pending_username', cleanId);
        setVerificationBanner({
          email: pendingEmail,
          username: cleanId,
        });
      }
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // 2. Send OTP
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setNotice('');
    const cleanPhone = otpPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const fullPhone = `${otpCountry}${cleanPhone}`;

    setLoading(true);
    try {
      await apiRequest<{ message: string }>('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });
      setOtpSent(true);
      setNotice(`One-time code sent to ${fullPhone}. (Dev Test Code: 123456)`);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setNotice('');
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    const fullPhone = `${otpCountry}${otpPhone.replace(/\D/g, '')}`;

    setLoading(true);
    try {
      const res = await apiRequest<{ registered: boolean; session?: { profileComplete: boolean } }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: fullPhone, code: otpCode.trim() }),
      });

      if (res.registered) {
        window.location.assign(res.session?.profileComplete ? '/' : '/onboarding');
      } else {
        // Proceed to finish account registration with verified mobile
        setOtpVerifiedNumber(fullPhone);
        setSignupPhone(cleanPhoneOnly(fullPhone));
        setActiveTab('signup');
        setNotice(`Mobile ${fullPhone} verified! Fill in your details to finish creating your account.`);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  function cleanPhoneOnly(phone: string) {
    return phone.replace(/^\+91/, '').trim();
  }

  // 4. Submit Sign Up
  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setNotice('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (strength < passwordRules.length) {
      setError('Please ensure your password meets all 4 requirements.');
      return;
    }

    const fullFullName = `${firstName.trim()} ${lastName.trim()}`;
    const cleanUser = `${firstName.trim().toLowerCase()}.${lastName.trim().toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
    const fullPhone = signupPhone.trim() ? (signupPhone.startsWith('+') ? signupPhone : `${signupCountry}${signupPhone.replace(/\D/g, '')}`) : undefined;

    setLoading(true);
    try {
      const res = await apiRequest<{ message: string; verificationLink?: string; emailVerified?: boolean }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullFullName,
          email: signupEmail.trim(),
          password: signupPassword,
          phoneNumber: fullPhone,
          username: cleanUser,
        }),
      });

      sessionStorage.setItem('whatchat_pending_email', signupEmail.trim());
      sessionStorage.setItem('whatchat_pending_username', cleanUser);
      if (res.verificationLink) {
        sessionStorage.setItem('whatchat_dev_link', res.verificationLink);
      }

      setVerificationBanner({
        email: signupEmail.trim(),
        username: cleanUser,
        devLink: res.verificationLink,
      });

      // Switch to Login tab displaying the verification banner (matching image 6)
      setLoginIdentifier(cleanUser);
      setActiveTab('login');
      setNotice(res.message || `We've sent a verification link to ${signupEmail.trim()}.`);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // 5. Resend Verification
  const handleResend = async () => {
    const targetEmail = verificationBanner?.email || sessionStorage.getItem('whatchat_pending_email') || loginIdentifier;
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please specify a valid email address to resend the link.');
      return;
    }
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<{ message: string; devVerificationLink?: string }>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail.trim() }),
      });
      setResendCooldown(60);
      setNotice(res.message || 'Verification link sent. Check your inbox.');
      if (res.devVerificationLink) {
        sessionStorage.setItem('whatchat_dev_link', res.devVerificationLink);
        setVerificationBanner((prev) => prev ? { ...prev, devLink: res.devVerificationLink } : null);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // 6. Direct Instant Activation (Dev convenience)
  const handleInstantActivate = async () => {
    const link = verificationBanner?.devLink || sessionStorage.getItem('whatchat_dev_link');
    if (!link) return;
    const match = link.match(/token=([^&]+)/);
    if (!match || !match[1]) return;

    setLoading(true);
    setError('');
    try {
      await apiRequest<{ message: string }>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token: match[1] }),
      });
      setView('activated');
      const savedUser = verificationBanner?.username || 'user';
      setActivatedInfo({
        fullName: savedUser.replace('.', ' ').toUpperCase(),
        username: savedUser,
      });
      sessionStorage.removeItem('whatchat_pending_email');
      sessionStorage.removeItem('whatchat_dev_link');
      setVerificationBanner(null);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // 7. Request Password Reset
  const handleRequestPasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setNotice('');
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest<{ message: string; devResetLink?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      setNotice(res.message);
      if (res.devResetLink) {
        sessionStorage.setItem('whatchat_dev_reset_link', res.devResetLink);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // 8. Confirm Password Reset
  const handleConfirmReset = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setNotice('');
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setError('This password reset link is invalid or expired.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password: newPassword }),
      });
      setNotice(res.message || 'Password updated successfully. You can now sign in.');
      setTimeout(() => {
        window.location.assign('/login');
      }, 1200);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // VIEW: ACCOUNT ACTIVATED (Image 7)
  // =========================================================================
  if (view === 'activated') {
    return (
      <main className="auth-activated-wrap">
        <div className="auth-activated-card">
          <div className="auth-activated-header">
            <span className="auth-dots-mark">::</span>
            <span className="auth-brand-name">whatchat</span>
          </div>

          <div className="auth-activated-icon-wrap">
            <span className="auth-activated-popper">🎉</span>
          </div>

          <h2 className="auth-activated-title">Account Activated!</h2>
          <p className="auth-activated-sub">Your email is verified and your account is now active.</p>

          <div className="auth-activated-info-box">
            <div className="auth-info-row">
              <span className="auth-info-label">Welcome,</span>
              <span className="auth-info-val-strong">{activatedInfo.fullName || 'User'}!</span>
            </div>
            <div className="auth-info-row">
              <span className="auth-info-label">Username:</span>
              <code className="auth-info-username">{activatedInfo.username || 'user'}</code>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/login');
              setView('tabs');
              setActiveTab('login');
              setVerificationBanner(null);
            }}
            className="auth-btn-primary auth-btn-lg"
          >
            <span>Login to Portal</span>
            <ArrowRight size={17} />
          </button>

          <p className="auth-activated-footer-note">A confirmation email has been sent to your inbox.</p>
        </div>
      </main>
    );
  }

  // =========================================================================
  // MAIN VIEW: SPLIT AUTH PAGE (Images 1, 2, 3, 4, 5, 6)
  // =========================================================================
  return (
    <main className="auth-page-root">
      {/* LEFT HERO PANEL (Purple cosmic gradient with glassmorphism feature cards) */}
      <section className="auth-hero-panel" aria-label="WhatChat Features">
        <div className="auth-hero-stars" />
        <div className="auth-hero-glow" />

        {/* Top brand header */}
        <div className="auth-hero-top">
          <a href="/login" onClick={(e) => { e.preventDefault(); switchTab('login'); }} className="auth-hero-logo">
            <span className="auth-logo-badge">
              <MessageCircle size={22} className="text-white fill-white" />
            </span>
            <span className="auth-logo-text">WhatChat</span>
          </a>
        </div>

        {/* Headline */}
        <div className="auth-hero-center">
          <h1 className="auth-hero-headline">
            Powering Connections with Carrier Grade Voice APIs &amp; Real-Time Chats
          </h1>

          {/* 4 Frosted glassmorphism cards */}
          <div className="auth-glass-cards">
            <div className="auth-glass-card">
              <div className="auth-card-icon-wrap">
                <Wifi size={18} className="text-purple-300" />
              </div>
              <div className="auth-card-text">
                <div className="auth-card-title">99.9% Uptime</div>
                <div className="auth-card-desc">SIP &amp; Realtime Infrastructure</div>
              </div>
            </div>

            <div className="auth-glass-card">
              <div className="auth-card-icon-wrap">
                <Shield size={18} className="text-purple-300" />
              </div>
              <div className="auth-card-text">
                <div className="auth-card-title">Hosted / Own Cloud</div>
                <div className="auth-card-desc">Full End-to-End Encryption</div>
              </div>
            </div>

            <div className="auth-glass-card">
              <div className="auth-card-icon-wrap">
                <Server size={18} className="text-purple-300" />
              </div>
              <div className="auth-card-text">
                <div className="auth-card-title">Stream Voice &amp; Media</div>
                <div className="auth-card-desc">Two Way Audio Streaming</div>
              </div>
            </div>

            <div className="auth-glass-card">
              <div className="auth-card-icon-wrap">
                <Volume2 size={18} className="text-purple-300" />
              </div>
              <div className="auth-card-text">
                <div className="auth-card-title">Noise Cancellation</div>
                <div className="auth-card-desc">Crystal clear audio &amp; chats</div>
              </div>
            </div>
          </div>

          {/* Floating 3D friendly robot / avatar */}
          <div className="auth-floating-bot" title="WhatChat Assistant">
            <div className="auth-bot-inner">
              <Sparkles size={24} className="text-purple-200 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <ShieldCheck size={15} />
          <span>Encrypted real-time messaging &amp; memory platform</span>
        </div>
      </section>

      {/* RIGHT AUTH PANEL (Sleek card with pill tab switcher & forms) */}
      <section className="auth-content-panel">
        <div className="auth-card-container">
          {/* Top Pill Navigation Tabs [ Login | OTP Login | Sign Up ] */}
          {view === 'tabs' && (
            <div className="auth-pill-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'login'}
                onClick={() => switchTab('login')}
                className={`auth-pill-btn ${activeTab === 'login' ? 'is-active' : ''}`}
              >
                Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'otp'}
                onClick={() => switchTab('otp')}
                className={`auth-pill-btn ${activeTab === 'otp' ? 'is-active' : ''}`}
              >
                OTP Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'signup'}
                onClick={() => switchTab('signup')}
                className={`auth-pill-btn ${activeTab === 'signup' ? 'is-active' : ''}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: LOGIN (Image 1 & Image 6) */}
          {/* ================================================================= */}
          {view === 'tabs' && activeTab === 'login' && (
            <div className="auth-form-body">
              <div className="auth-form-title-group">
                <h2 className="auth-form-title">Login to your account</h2>
                <p className="auth-form-subtitle">Welcome back! Manage and monitor your conversations.</p>
              </div>

              {/* Green Verification Banner (Image 6) */}
              {verificationBanner && (
                <div className="auth-verify-banner">
                  <div className="auth-verify-banner-content">
                    <p className="auth-banner-msg">
                      We've sent a verification link to <strong>{verificationBanner.email}</strong>. Click the link in that email to activate your account. Check spam if you don't see it.
                    </p>
                    <p className="auth-banner-user">
                      Your username: <code>{verificationBanner.username}</code>
                    </p>
                  </div>
                  <div className="auth-banner-actions">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading || resendCooldown > 0}
                      className="auth-btn-resend"
                    >
                      <Mail size={14} />
                      <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}</span>
                    </button>
                    {verificationBanner.devLink && (
                      <button
                        type="button"
                        onClick={handleInstantActivate}
                        disabled={loading}
                        className="auth-btn-quick-activate"
                      >
                        <Sparkles size={14} />
                        <span>Instant Activate &amp; Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {error && <div className="auth-error-alert" role="alert">{error}</div>}
              {notice && !verificationBanner && <div className="auth-success-alert" role="status">{notice}</div>}

              <form onSubmit={handleLogin} className="auth-input-form" noValidate>
                <div className="auth-form-group">
                  <label htmlFor="login-username">Username</label>
                  <input
                    id="login-username"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="your.username or you@example.com"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <div className="auth-label-row">
                    <label htmlFor="login-password">Password</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="auth-link-forgot"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="auth-input-password-wrap">
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="auth-pw-eye"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label className="auth-checkbox-row">
                  <input
                    type="checkbox"
                    checked={loginAgree}
                    onChange={(e) => setLoginAgree(e.target.checked)}
                  />
                  <span>I agree to WhatChat's Terms of Service &amp; Privacy Policy</span>
                </label>

                {/* Cloudflare Captcha simulated badge */}
                <div className="auth-cloudflare-badge" onClick={() => setCfVerified(true)}>
                  <div className="auth-cf-left">
                    <span className="auth-cf-check">✓</span>
                    <span className="auth-cf-success">Success!</span>
                  </div>
                  <div className="auth-cf-right">
                    <span className="auth-cf-brand">CLOUDFLARE</span>
                    <span className="auth-cf-links">Privacy • Help</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-btn-primary">
                  {loading ? (
                    <span className="auth-spinner-row">
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Signing in…</span>
                    </span>
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </form>

              <div className="auth-form-bottom-row">
                <span>Don't have an account? </span>
                <button type="button" onClick={() => switchTab('signup')} className="auth-link-purple">
                  Sign up free
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: OTP LOGIN (Image 2) */}
          {/* ================================================================= */}
          {view === 'tabs' && activeTab === 'otp' && (
            <div className="auth-form-body">
              <div className="auth-form-title-group">
                <h2 className="auth-form-title">Login / Register with OTP</h2>
                <p className="auth-form-subtitle">
                  Enter your mobile number — we'll send a one time code to log you in, or to start a new registration.
                </p>
              </div>

              {error && <div className="auth-error-alert" role="alert">{error}</div>}
              {notice && <div className="auth-success-alert" role="status">{notice}</div>}

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="auth-input-form" noValidate>
                  <div className="auth-form-group">
                    <label htmlFor="otp-mobile">Mobile Number</label>
                    <div className="auth-phone-row">
                      <select
                        value={otpCountry}
                        onChange={(e) => setOtpCountry(e.target.value)}
                        className="auth-country-select"
                        aria-label="Country Code"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        id="otp-mobile"
                        type="tel"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        placeholder="10-digit number"
                        autoComplete="tel"
                        required
                        className="auth-phone-input"
                      />
                    </div>
                    <span className="auth-field-helper">Only Indian (+91) mobile numbers are supported by default.</span>
                  </div>

                  <label className="auth-checkbox-row">
                    <input
                      type="checkbox"
                      checked={loginAgree}
                      onChange={(e) => setLoginAgree(e.target.checked)}
                    />
                    <span>I agree to WhatChat's Terms of Service &amp; Privacy Policy</span>
                  </label>

                  {/* Cloudflare Captcha badge */}
                  <div className="auth-cloudflare-badge">
                    <div className="auth-cf-left">
                      <span className="auth-cf-check">✓</span>
                      <span className="auth-cf-success">Success!</span>
                    </div>
                    <div className="auth-cf-right">
                      <span className="auth-cf-brand">CLOUDFLARE</span>
                      <span className="auth-cf-links">Privacy • Help</span>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="auth-btn-primary">
                    {loading ? (
                      <span className="auth-spinner-row">
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Sending code…</span>
                      </span>
                    ) : (
                      <span>Send OTP</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="auth-input-form" noValidate>
                  <div className="auth-form-group">
                    <div className="auth-label-row">
                      <label htmlFor="otp-code">Verification Code</label>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpCode(''); }}
                        className="auth-link-forgot"
                      >
                        Change number
                      </button>
                    </div>
                    <input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit code"
                      autoFocus
                      required
                    />
                    <span className="auth-field-helper">Dev quick-test OTP code: 123456</span>
                  </div>

                  <button type="submit" disabled={loading} className="auth-btn-primary">
                    {loading ? (
                      <span className="auth-spinner-row">
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Verifying…</span>
                      </span>
                    ) : (
                      <span>Verify &amp; Continue →</span>
                    )}
                  </button>
                </form>
              )}

              <div className="auth-form-bottom-row">
                <span>Prefer a password? </span>
                <button type="button" onClick={() => switchTab('login')} className="auth-link-purple">
                  Login with password
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: SIGN UP (Image 3, Image 4 & Image 5) */}
          {/* ================================================================= */}
          {view === 'tabs' && activeTab === 'signup' && (
            <div className="auth-form-body">
              <div className="auth-form-title-group">
                <h2 className="auth-form-title">
                  {otpVerifiedNumber ? 'Create your account' : 'Start your free trial'}
                </h2>
                <p className="auth-form-subtitle">
                  {otpVerifiedNumber
                    ? 'Fill in the details below to finish creating your account.'
                    : 'No credit card required. Full instant access from day 1.'}
                </p>
              </div>

              {/* Verified mobile badge if coming from OTP (Image 5) */}
              {otpVerifiedNumber && (
                <div className="auth-mobile-verified-banner">
                  <span className="auth-banner-tick">✓</span>
                  <span>Mobile {otpVerifiedNumber} verified. Fill in the details below to finish creating your account.</span>
                </div>
              )}

              {error && <div className="auth-error-alert" role="alert">{error}</div>}
              {notice && !otpVerifiedNumber && <div className="auth-success-alert" role="status">{notice}</div>}

              <form onSubmit={handleSignup} className="auth-input-form" noValidate>
                {/* 2-Column: First Name & Last Name */}
                <div className="auth-two-col">
                  <div className="auth-form-group">
                    <label htmlFor="signup-fn">First Name</label>
                    <input
                      id="signup-fn"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div className="auth-form-group">
                    <label htmlFor="signup-ln">Last Name</label>
                    <input
                      id="signup-ln"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                {/* Company Name OPTIONAL */}
                <div className="auth-form-group">
                  <div className="auth-label-row">
                    <label htmlFor="signup-company">Company Name</label>
                    <span className="auth-label-tag">OPTIONAL</span>
                  </div>
                  <input
                    id="signup-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    autoComplete="organization"
                  />
                </div>

                {/* Work Email */}
                <div className="auth-form-group">
                  <label htmlFor="signup-email">Work Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="jane@company.com"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div className="auth-form-group">
                  <label htmlFor="signup-phone">Mobile Number</label>
                  <div className="auth-phone-row">
                    <select
                      value={signupCountry}
                      onChange={(e) => setSignupCountry(e.target.value)}
                      className="auth-country-select"
                      aria-label="Country Code"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      id="signup-phone"
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Password with strength meter bars */}
                <div className="auth-form-group">
                  <label htmlFor="signup-password">Password</label>
                  <div className="auth-input-password-wrap">
                    <input
                      id="signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="auth-pw-eye"
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* 4 Strength bars */}
                  <div className="auth-strength-meter">
                    <span className={`auth-strength-bar ${strength >= 1 ? 'is-active' : ''}`} />
                    <span className={`auth-strength-bar ${strength >= 2 ? 'is-active' : ''}`} />
                    <span className={`auth-strength-bar ${strength >= 3 ? 'is-active' : ''}`} />
                    <span className={`auth-strength-bar ${strength >= 4 ? 'is-active' : ''}`} />
                  </div>
                  <div className="auth-strength-label">
                    {signupPassword ? `${strength} of 4 password requirements met` : 'Must contain upper, number & special char'}
                  </div>
                </div>

                {/* Data Region dropdown */}
                <div className="auth-form-group">
                  <label htmlFor="signup-region">Data Region</label>
                  <select
                    id="signup-region"
                    value={dataRegion}
                    onChange={(e) => setDataRegion(e.target.value)}
                    className="auth-region-select"
                  >
                    <option value="IN India">IN India</option>
                    <option value="US United States">US United States</option>
                    <option value="EU Europe">EU Europe</option>
                    <option value="SG Singapore">SG Singapore</option>
                  </select>
                </div>

                {/* Cloudflare Captcha badge */}
                <div className="auth-cloudflare-badge">
                  <div className="auth-cf-left">
                    <span className="auth-cf-check">✓</span>
                    <span className="auth-cf-success">Success!</span>
                  </div>
                  <div className="auth-cf-right">
                    <span className="auth-cf-brand">CLOUDFLARE</span>
                    <span className="auth-cf-links">Privacy • Help</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-btn-primary">
                  {loading ? (
                    <span className="auth-spinner-row">
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Creating account…</span>
                    </span>
                  ) : (
                    <span>Create Account →</span>
                  )}
                </button>
              </form>

              <p className="auth-fine-print">
                By signing up, you agree to WhatChat's ToS &amp; Privacy Policy
              </p>

              <div className="auth-form-bottom-row">
                <span>Already have an account? </span>
                <button type="button" onClick={() => switchTab('login')} className="auth-link-purple">
                  Login
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW: FORGOT PASSWORD */}
          {/* ================================================================= */}
          {view === 'forgot-password' && (
            <div className="auth-form-body">
              <div className="auth-form-title-group">
                <h2 className="auth-form-title">Reset your password</h2>
                <p className="auth-form-subtitle">
                  Enter your account email address and we'll send a secure reset link.
                </p>
              </div>

              {error && <div className="auth-error-alert" role="alert">{error}</div>}
              {notice && <div className="auth-success-alert" role="status">{notice}</div>}

              <form onSubmit={handleRequestPasswordReset} className="auth-input-form">
                <div className="auth-form-group">
                  <label htmlFor="reset-email">Work Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-btn-primary">
                  {loading ? 'Sending reset link…' : 'Send Reset Link'}
                </button>
              </form>

              <div className="auth-form-bottom-row">
                <button
                  type="button"
                  onClick={() => { setView('tabs'); setActiveTab('login'); }}
                  className="auth-link-back"
                >
                  <ArrowLeft size={15} />
                  <span>Back to login</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW: RESET PASSWORD */}
          {/* ================================================================= */}
          {view === 'reset-password' && (
            <div className="auth-form-body">
              <div className="auth-form-title-group">
                <h2 className="auth-form-title">Choose a new password</h2>
                <p className="auth-form-subtitle">Make it strong and unique to keep your account safe.</p>
              </div>

              {error && <div className="auth-error-alert" role="alert">{error}</div>}
              {notice && <div className="auth-success-alert" role="status">{notice}</div>}

              <form onSubmit={handleConfirmReset} className="auth-input-form">
                <div className="auth-form-group">
                  <label htmlFor="new-pw">New Password</label>
                  <div className="auth-input-password-wrap">
                    <input
                      id="new-pw"
                      type={showResetPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="auth-pw-eye"
                    >
                      {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-form-group">
                  <label htmlFor="confirm-pw">Confirm Password</label>
                  <input
                    id="confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-btn-primary">
                  {loading ? 'Updating password…' : 'Update Password'}
                </button>
              </form>

              <div className="auth-form-bottom-row">
                <button
                  type="button"
                  onClick={() => { setView('tabs'); setActiveTab('login'); }}
                  className="auth-link-back"
                >
                  <ArrowLeft size={15} />
                  <span>Back to login</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW: ONBOARDING PROFILE */}
          {/* ================================================================= */}
          {view === 'onboarding' && (
            <div className="auth-form-body">
              <div className="auth-form-title-group">
                <h2 className="auth-form-title">Complete your profile</h2>
                <p className="auth-form-subtitle">Add a few details so your friends can recognize you.</p>
              </div>

              {error && <div className="auth-error-alert" role="alert">{error}</div>}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  try {
                    await apiRequest('/auth/profile', {
                      method: 'PUT',
                      body: JSON.stringify({
                        fullName: onboardingName.trim() || 'WhatChat User',
                        username: onboardingUsername.trim() || undefined,
                        about: onboardingAbout.trim() || 'Available',
                      }),
                    });
                    window.location.assign('/');
                  } catch (err) {
                    setError(friendlyError(err));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="auth-input-form"
              >
                <div className="auth-form-group">
                  <label htmlFor="onb-name">Display Name</label>
                  <input
                    id="onb-name"
                    type="text"
                    value={onboardingName}
                    onChange={(e) => setOnboardingName(e.target.value)}
                    placeholder="Your Name"
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="onb-username">Username (optional)</label>
                  <input
                    id="onb-username"
                    type="text"
                    value={onboardingUsername}
                    onChange={(e) => setOnboardingUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    placeholder="username"
                  />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="onb-about">About</label>
                  <textarea
                    id="onb-about"
                    value={onboardingAbout}
                    onChange={(e) => setOnboardingAbout(e.target.value)}
                    placeholder="Hey there! I am using WhatChat."
                    rows={2}
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-btn-primary">
                  <span>Enter WhatChat →</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
