import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, MessageCircle, ShieldCheck } from 'lucide-react';
import { ApiError, apiRequest, type SessionUser } from '../../services/api';

type PageKind = 'signup' | 'login' | 'verify-email' | 'forgot-password' | 'reset-password' | 'onboarding';

const passwordRules = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One number', test: (value: string) => /\d/.test(value) },
  { label: 'One special character', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

function routeKind(path: string): PageKind {
  if (path === '/signup') return 'signup';
  if (path === '/verify-email') return 'verify-email';
  if (path === '/forgot-password') return 'forgot-password';
  if (path === '/reset-password') return 'reset-password';
  if (path === '/onboarding') return 'onboarding';
  return 'login';
}

function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'EMAIL_NOT_VERIFIED') return 'Please verify your email before signing in.';
    if (error.code === 'EMAIL_ALREADY_REGISTERED') return 'An account already uses this email. Try signing in instead.';
    if (error.code === 'INVALID_CREDENTIALS') return 'The email or password is incorrect.';
    if (error.code === 'EMAIL_NOT_CONFIGURED') return 'Email delivery is not configured yet. Contact the administrator.';
    return error.message;
  }
  return 'We could not complete that request. Please try again.';
}

function Field({
  label, id, error, children,
}: { label: string; id: string; error?: string; children: ReactNode }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div>{children}</div>
      {error && <span className="auth-field-error" role="alert">{error}</span>}
    </div>
  );
}

function PasswordField({
  label, value, onChange, error, autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = `password-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <Field label={label} id={id} error={error}>
      <div className="auth-password-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          className="auth-visibility"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </Field>
  );
}

function AuthShell({
  title, subtitle, children,
}: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="WhatChat">
        <a className="auth-brand" href="/login" aria-label="WhatChat home">
          <span className="auth-brand-mark"><MessageCircle size={23} fill="currentColor" /></span>
          <span>WhatChat</span>
        </a>
        <div className="auth-brand-copy">
          <div className="auth-brand-kicker"><ShieldCheck size={15} /> A little more personal</div>
          <h1>Your Chats.<br />Your Memories.</h1>
          <p>A thoughtful place to stay close and keep the moments that matter.</p>
        </div>
        <div className="auth-brand-note"><LockKeyhole size={15} /> Your account, yours alone.</div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-card">
          <a className="auth-brand auth-mobile-brand" href="/login">
            <span className="auth-brand-mark"><MessageCircle size={21} fill="currentColor" /></span>
            <span>WhatChat</span>
          </a>
          <div className="auth-heading">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
        <footer className="auth-footer">By continuing, you agree to the WhatChat Terms and Privacy Policy.</footer>
      </section>
    </main>
  );
}

function SubmitButton({ loading, disabled, children }: { loading: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <button className="auth-submit" type="submit" disabled={loading || disabled}>
      {loading ? <><span className="auth-spinner" /> Please wait…</> : <>{children}<ArrowRight size={17} /></>}
    </button>
  );
}

function MaskedEmail({ email }: { email: string }) {
  const [name, domain] = email.split('@');
  if (!domain) return <strong>{email}</strong>;
  const masked = name.length < 3 ? `${name[0] ?? ''}••` : `${name.slice(0, 2)}•••${name.slice(-1)}`;
  return <strong>{masked}@{domain}</strong>;
}

export function AuthPage() {
  const kind = routeKind(window.location.pathname);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(sessionStorage.getItem('whatchat_pending_email') ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resendSeconds, setResendSeconds] = useState(kind === 'verify-email' ? 60 : 0);
  const [verificationState, setVerificationState] = useState<'pending' | 'success' | 'invalid'>('pending');
  const [profileLoaded, setProfileLoaded] = useState(kind !== 'onboarding');
  const strength = useMemo(() => passwordRules.filter((rule) => rule.test(password)).length, [password]);

  useEffect(() => {
    if (kind === 'onboarding') {
      apiRequest<SessionUser>('/auth/me')
        .then((account) => {
          setFullName(account.fullName);
          setUsername(account.username ?? '');
          setAbout(account.about ?? '');
          setProfileLoaded(true);
        })
        .catch((requestError: unknown) => setError(friendlyError(requestError)));
      return;
    }
    if (kind !== 'verify-email') return;
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return;
    setLoading(true);
    apiRequest<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }).then((result) => {
      setVerificationState('success');
      setNotice(result.message || 'Your email is verified. You can now sign in.');
      sessionStorage.removeItem('whatchat_pending_email');
    }).catch((requestError: unknown) => {
      setVerificationState('invalid');
      setError(friendlyError(requestError));
    }).finally(() => setLoading(false));
  }, [kind]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (kind === 'signup' && !fullName.trim()) next.fullName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (kind === 'signup' || kind === 'login' || kind === 'reset-password') {
      if (!password) next.password = 'Enter your password.';
      else if (kind !== 'login' && strength < passwordRules.length) next.password = 'Choose a password that meets all the requirements.';
    }
    if ((kind === 'signup' || kind === 'reset-password') && confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match.';
    }
    if (kind === 'signup' && !termsAccepted) next.terms = 'Please accept the Terms and Privacy Policy.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || !validate()) return;
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (kind === 'signup') {
        const result = await apiRequest<{ message: string }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), password }),
        });
        sessionStorage.setItem('whatchat_pending_email', email.trim());
        setNotice(result.message || 'Check your inbox for a verification link.');
        window.location.assign('/verify-email');
      } else if (kind === 'login') {
        const result = await apiRequest<{ profileComplete: boolean }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password }),
        });
        window.location.assign(result.profileComplete ? '/' : '/onboarding');
      } else if (kind === 'verify-email') {
        await apiRequest('/auth/resend-verification', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim() }),
        });
        setNotice('If an unverified account exists for that address, a new link is on its way.');
        setResendSeconds(60);
      } else if (kind === 'forgot-password') {
        const result = await apiRequest<{ message: string }>('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim() }),
        });
        setNotice(result.message);
      } else if (kind === 'reset-password') {
        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) throw new ApiError('This password reset link is invalid or has expired.', 400);
        const result = await apiRequest<{ message: string }>('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, password }),
        });
        setNotice(result.message);
      } else {
        await apiRequest('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ fullName: fullName.trim(), username: username.trim(), about: about.trim() }),
        });
        window.location.assign('/');
      }
    } catch (requestError) {
      if (kind === 'login' && requestError instanceof ApiError && requestError.code === 'EMAIL_NOT_VERIFIED') {
        sessionStorage.setItem('whatchat_pending_email', email.trim());
        window.location.assign('/verify-email');
        return;
      }
      setError(friendlyError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const skipOnboarding = async () => {
    if (loading || !profileLoaded) return;
    setLoading(true);
    setError('');
    try {
      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName: fullName.trim(), username: username.trim(), about: about.trim() }),
      });
      window.location.assign('/');
    } catch (requestError) {
      setError(friendlyError(requestError));
    } finally {
      setLoading(false);
    }
  };

  if (kind === 'verify-email') {
    const emailValue = email || 'your email address';
    const isVerified = verificationState === 'success' || notice.toLowerCase().includes('verified');
    return (
      <AuthShell
        title={isVerified ? 'Email verified' : 'Verify your email address'}
        subtitle={isVerified ? 'Your account is ready. Sign in to continue.' : 'One quick step to keep your WhatChat account secure.'}
      >
        {loading && <div className="auth-status" role="status"><span className="auth-spinner" /> Checking your verification link…</div>}
        {!isVerified && !loading && (
          <>
            <div className="auth-verify-icon"><Check size={25} /></div>
            <p className="auth-verify-copy">We sent a secure verification link to <MaskedEmail email={emailValue} />. Open it to verify your address and activate your account.</p>
            {verificationState === 'invalid' && <p className="auth-alert auth-alert-error" role="alert">{error}</p>}
            {notice && <p className="auth-alert auth-alert-success" role="status">{notice}</p>}
            <form onSubmit={submit} className="auth-form">
                  <Field label="Email address" id="verify-email" error={fieldErrors.email}>
                    <input id="verify-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </Field>
              {error && verificationState !== 'invalid' && <p className="auth-alert auth-alert-error" role="alert">{error}</p>}
              <SubmitButton loading={loading} disabled={resendSeconds > 0}>
                {resendSeconds ? `Resend in ${resendSeconds}s` : 'Resend verification email'}
              </SubmitButton>
            </form>
          </>
        )}
        {isVerified && <div className="auth-form">
          <p className="auth-alert auth-alert-success" role="status">{notice || 'Your email is verified. You can now sign in.'}</p>
          <a className="auth-submit auth-link-submit" href="/login">Continue to sign in <ArrowRight size={17} /></a>
        </div>}
        <div className="auth-link-row">
          <a href="/signup"><ArrowLeft size={15} /> Change email</a>
          <a href="/signup">Back to sign up</a>
        </div>
      </AuthShell>
    );
  }

  const headings: Record<PageKind, [string, string]> = {
    signup: ['Create your WhatChat account', 'A space for the conversations and moments you want to keep.'],
    login: ['Welcome back', 'Sign in to pick up where you left off.'],
    'forgot-password': ['Reset your password', 'Enter your account email and we’ll send a secure reset link.'],
    'reset-password': ['Choose a new password', 'Make it strong and unique to keep your account safe.'],
    onboarding: ['Make it yours', 'Add a few details to help people recognize you. You can change these later.'],
    'verify-email': ['Verify your email address', 'Check your inbox for a secure verification link.'],
  };
  const [title, subtitle] = headings[kind];

  return (
    <AuthShell title={title} subtitle={subtitle}>
      <form className="auth-form" onSubmit={submit} noValidate>
        {kind === 'signup' && (
          <Field label="Full name" id="signup-name" error={fieldErrors.fullName}>
            <input id="signup-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </Field>
        )}
        {kind === 'onboarding' && (
          <>
            <Field label="Display name" id="profile-name">
              <input id="profile-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </Field>
            <Field label="Username (optional)" id="profile-username">
              <input id="profile-username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} maxLength={30} />
            </Field>
            <Field label="A little about you (optional)" id="profile-about">
              <textarea id="profile-about" value={about} onChange={(event) => setAbout(event.target.value)} maxLength={255} rows={3} />
            </Field>
          </>
        )}
        {(kind === 'signup' || kind === 'login' || kind === 'forgot-password') && (
          <Field label="Email address" id={`${kind}-email`} error={fieldErrors.email}>
            <input id={`${kind}-email`} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Field>
        )}
        {(kind === 'signup' || kind === 'login' || kind === 'reset-password') && (
          <>
            <PasswordField
              label={kind === 'reset-password' ? 'New password' : 'Password'}
              value={password}
              onChange={setPassword}
              error={fieldErrors.password}
              autoComplete={kind === 'login' ? 'current-password' : 'new-password'}
            />
            {(kind === 'signup' || kind === 'reset-password') && (
              <>
                <div className="auth-strength" aria-label={`Password strength: ${strength} of 4`}>
                  <div className="auth-strength-bars">{passwordRules.map((rule, index) => <span key={rule.label} className={index < strength ? 'is-filled' : ''} />)}</div>
                  <span>{password ? `${strength} of 4 requirements met` : 'Password strength'}</span>
                </div>
                <ul className="auth-password-rules">
                  {passwordRules.map((rule) => <li key={rule.label} className={rule.test(password) ? 'is-valid' : ''}><Check size={13} />{rule.label}</li>)}
                </ul>
                <PasswordField
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  error={fieldErrors.confirmPassword}
                  autoComplete="new-password"
                />
              </>
            )}
          </>
        )}
        {kind === 'signup' && (
          <label className="auth-terms">
            <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            <span>I have read and agree to the WhatChat Terms and Privacy Policy.</span>
          </label>
        )}
        {fieldErrors.terms && <p className="auth-field-error" role="alert">{fieldErrors.terms}</p>}
        {kind === 'login' && (
          <div className="auth-inline-row">
            <a href="/forgot-password">Forgot password?</a>
          </div>
        )}
        {error && <p className="auth-alert auth-alert-error" role="alert">{error}</p>}
        {notice && <p className="auth-alert auth-alert-success" role="status">{notice}</p>}
        <SubmitButton loading={loading}>
          {kind === 'signup' ? 'Create account' : kind === 'login' ? 'Sign in' : kind === 'forgot-password' ? 'Send reset link' : kind === 'reset-password' ? 'Update password' : 'Continue'}
        </SubmitButton>
      </form>
      <div className="auth-link-row">
        {kind === 'signup' ? <span>Already have an account? <a href="/login">Sign in</a></span> :
          kind === 'login' ? <span>New to WhatChat? <a href="/signup">Create an account</a></span> :
            kind === 'forgot-password' ? <a href="/login"><ArrowLeft size={15} /> Back to sign in</a> :
              kind === 'reset-password' ? <a href="/login"><ArrowLeft size={15} /> Back to sign in</a> :
                <button className="auth-text-button" type="button" onClick={skipOnboarding} disabled={loading || !profileLoaded}>
                  Skip for now
                </button>}
      </div>
      {kind === 'forgot-password' && notice && <a className="auth-secondary-link" href="/login">Return to sign in <ArrowRight size={15} /></a>}
    </AuthShell>
  );
}
