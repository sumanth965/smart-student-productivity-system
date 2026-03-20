import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ADMIN_CREDENTIALS = {
  email: 'admin@nmamit.in',
  password: '123',
};

const adminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .al-root {
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    display: flex;
    background: #0b0f1a;
    overflow: hidden;
    position: relative;
  }

  /* ── Animated background ── */
  .al-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .al-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(25,32,123,0.12) 1px, transparent 1px),
      linear-gradient(90deg, rgba(25,32,123,0.12) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .al-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.35;
  }
  .al-blob-1 {
    width: 520px; height: 520px;
    background: radial-gradient(circle, #1a2480 0%, transparent 70%);
    top: -160px; left: -160px;
    animation: floatBlob 8s ease-in-out infinite;
  }
  .al-blob-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #ffc107 0%, transparent 70%);
    bottom: -140px; right: -100px;
    animation: floatBlob 10s ease-in-out infinite reverse;
    opacity: 0.18;
  }
  .al-blob-3 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, #6366f1 0%, transparent 70%);
    top: 50%; right: 30%;
    animation: floatBlob 12s ease-in-out infinite;
    opacity: 0.2;
  }
  @keyframes floatBlob {
    0%, 100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(20px,-25px) scale(1.04); }
    66% { transform: translate(-15px,18px) scale(0.96); }
  }

  /* ── Left panel ── */
  .al-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 4rem;
    position: relative;
    z-index: 10;
  }
  .al-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 4rem;
  }
  .al-logo-icon {
    width: 46px; height: 46px;
    background: linear-gradient(135deg, #19207b, #2d3bbd);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: #ffc107; font-weight: 900; font-size: 1.25rem;
    box-shadow: 0 8px 24px rgba(25,32,123,0.5);
    letter-spacing: -0.02em;
  }
  .al-logo-text {
    font-size: 1.3rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
  }
  .al-logo-text span { color: #ffc107; }

  .al-left-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255,193,7,0.12);
    border: 1px solid rgba(255,193,7,0.3);
    color: #ffc107;
    padding: 0.4rem 1rem;
    border-radius: 9999px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    width: fit-content;
    margin-bottom: 1.5rem;
  }
  .al-left-badge-dot {
    width: 6px; height: 6px;
    background: #ffc107;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .al-left-title {
    font-size: clamp(2rem, 3.5vw, 3rem);
    font-weight: 900;
    color: #ffffff;
    line-height: 1.12;
    margin-bottom: 1.5rem;
    letter-spacing: -0.03em;
  }
  .al-left-title span { color: #ffc107; }

  .al-left-desc {
    font-size: 1rem;
    color: #94a3b8;
    line-height: 1.7;
    max-width: 26rem;
    margin-bottom: 3rem;
  }

  .al-feature-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .al-feature {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }
  .al-feature-icon {
    width: 36px; height: 36px;
    background: rgba(25,32,123,0.5);
    border: 1px solid rgba(25,32,123,0.8);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .al-feature-icon svg { width: 16px; height: 16px; stroke: #7c85e8; fill: none; }
  .al-feature-text {
    font-size: 0.88rem;
    color: #cbd5e1;
    font-weight: 500;
  }

  /* ── Divider ── */
  .al-divider {
    width: 1px;
    background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent);
    align-self: stretch;
    position: relative;
    z-index: 10;
  }

  /* ── Right panel (form) ── */
  .al-right {
    flex: 0 0 480px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 3.5rem;
    position: relative;
    z-index: 10;
  }

  .al-card {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 24px;
    padding: 2.5rem;
    backdrop-filter: blur(20px);
    box-shadow:
      0 32px 64px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.07);
    transition: transform 0.6s ease, opacity 0.6s ease;
  }
  .al-card.animate-in {
    animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .al-shield {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #19207b 0%, #2d3bbd 100%);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 12px 32px rgba(25,32,123,0.5);
    position: relative;
  }
  .al-shield::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 17px;
    background: linear-gradient(135deg, rgba(255,193,7,0.4), transparent 60%);
    pointer-events: none;
  }
  .al-shield svg { width: 28px; height: 28px; stroke: #ffc107; fill: none; }

  .al-card-title {
    text-align: center;
    font-size: 1.6rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.025em;
    margin-bottom: 0.4rem;
  }
  .al-card-sub {
    text-align: center;
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 2rem;
  }

  /* ── Form elements ── */
  .al-form { display: flex; flex-direction: column; gap: 1.25rem; }

  .al-field { display: flex; flex-direction: column; gap: 0.5rem; }
  .al-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .al-input-wrap { position: relative; }
  .al-input-icon {
    position: absolute;
    left: 14px; top: 50%; transform: translateY(-50%);
    width: 18px; height: 18px;
    pointer-events: none;
    transition: stroke 0.2s;
  }
  .al-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 0.8rem 0.875rem 0.8rem 2.75rem;
    font-size: 0.9rem;
    color: #ffffff;
    font-family: inherit;
    outline: none;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }
  .al-input::placeholder { color: #475569; }
  .al-input:hover { border-color: rgba(255,255,255,0.16); }
  .al-input:focus {
    border-color: #19207b;
    background: rgba(25,32,123,0.15);
    box-shadow: 0 0 0 3px rgba(25,32,123,0.25);
  }
  .al-input:focus + .al-input-focus-ring { opacity: 1; }
  .al-input.error { border-color: #ef4444; background: rgba(239,68,68,0.06); }

  .al-eye-btn {
    position: absolute;
    right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: #475569; transition: color 0.2s; padding: 4px;
  }
  .al-eye-btn:hover { color: #94a3b8; }
  .al-eye-btn svg { width: 18px; height: 18px; stroke: currentColor; fill: none; }

  .al-error-msg {
    font-size: 0.75rem;
    color: #ef4444;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.25rem;
  }
  .al-error-msg svg { width: 14px; height: 14px; stroke: currentColor; fill: none; flex-shrink: 0; }

  .al-alert {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-size: 0.825rem;
    color: #fca5a5;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .al-alert svg { width: 16px; height: 16px; stroke: currentColor; fill: none; flex-shrink: 0; }

  .al-extras {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.25rem;
  }
  .al-remember {
    display: flex; align-items: center; gap: 0.5rem;
    cursor: pointer;
  }
  .al-checkbox {
    width: 16px; height: 16px;
    accent-color: #19207b;
    cursor: pointer;
  }
  .al-remember-label {
    font-size: 0.825rem;
    color: #64748b;
    user-select: none;
  }
  .al-forgot {
    font-size: 0.825rem;
    color: #ffc107;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s, text-decoration 0.2s;
  }
  .al-forgot:hover { color: #ffe066; text-decoration: underline; }

  .al-submit {
    width: 100%;
    padding: 0.9rem 1.5rem;
    background: linear-gradient(135deg, #19207b 0%, #2634b6 100%);
    border: none;
    border-radius: 12px;
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
    box-shadow: 0 8px 24px rgba(25,32,123,0.4);
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    position: relative;
    overflow: hidden;
  }
  .al-submit::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
    pointer-events: none;
  }
  .al-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(25,32,123,0.55);
    filter: brightness(1.1);
  }
  .al-submit:active:not(:disabled) { transform: translateY(0); }
  .al-submit:disabled { opacity: 0.7; cursor: not-allowed; }

  .al-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .al-submit svg { width: 18px; height: 18px; stroke: currentColor; fill: none; }

  .al-back {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.8rem;
    color: #475569;
  }
  .al-back a {
    color: #7c85e8;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }
  .al-back a:hover { color: #a5afff; text-decoration: underline; }

  .al-hint {
    margin-top: 1.25rem;
    background: rgba(25,32,123,0.25);
    border: 1px solid rgba(25,32,123,0.5);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    color: #7c85e8;
  }
  .al-hint strong { color: #a5afff; }

  /* ── Divider line in form ── */
  .al-sep {
    display: flex; align-items: center; gap: 0.75rem;
    margin: 0.25rem 0;
  }
  .al-sep-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
  .al-sep-text { font-size: 0.7rem; color: #334155; font-weight: 600; letter-spacing: 0.05em; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .al-left { display: none; }
    .al-divider { display: none; }
    .al-right {
      flex: 1;
      padding: 2rem 1.5rem;
    }
    .al-card { padding: 2rem 1.5rem; }
    .al-root { justify-content: center; }
  }
`;

// ── SVG Icons ──
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const MailIcon = () => (
  <svg className="al-input-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" stroke="#475569" fill="none">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg className="al-input-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" stroke="#475569" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const CheckListIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 900));

    if (
      email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const store = rememberMe ? localStorage : sessionStorage;
      store.setItem('admin_token', 'admin_jwt_token_secure');
      store.setItem('admin_user', JSON.stringify({ email: email.trim(), role: 'admin' }));
      navigate('/admin');
    } else {
      setError('Invalid admin credentials. Please try again.');
    }

    setIsLoading(false);
  };

  const features = [
    { icon: <UsersIcon />, text: 'Manage student accounts and credentials' },
    { icon: <CheckListIcon />, text: 'Assign and track tasks by class & section' },
    { icon: <ChartIcon />, text: 'Monitor academic performance metrics' },
  ];

  return (
    <div className="al-root">
      <style>{adminStyles}</style>
      <div className="al-bg">
        <div className="al-bg-grid" />
        <div className="al-blob al-blob-1" />
        <div className="al-blob al-blob-2" />
        <div className="al-blob al-blob-3" />
      </div>

      {/* ── Left Panel ── */}
      <div className="al-left">
        <div className="al-logo">
          <div className="al-logo-icon">S</div>
          <span className="al-logo-text">SMART<span>STUDENT</span></span>
        </div>

        <div className="al-left-badge">
          <span className="al-left-badge-dot" />
          Admin Portal
        </div>

        <h1 className="al-left-title">
          Teacher &amp; Admin<br />
          <span>Control Center</span>
        </h1>
        <p className="al-left-desc">
          Securely access your administrative dashboard to manage students, assign tasks, and track academic progress across all classes.
        </p>

        <div className="al-feature-list">
          {features.map((f, i) => (
            <div className="al-feature" key={i}>
              <div className="al-feature-icon">{f.icon}</div>
              <span className="al-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="al-divider" />

      {/* ── Right Panel (Form) ── */}
      <div className="al-right">
        <div className={`al-card ${mounted ? 'animate-in' : ''}`}>
          <div className="al-shield">
            <ShieldIcon />
          </div>
          <h2 className="al-card-title">Admin Sign In</h2>
          <p className="al-card-sub">Restricted access — administrators only</p>

          <form className="al-form" onSubmit={handleSubmit}>
            {error && (
              <div className="al-alert">
                <AlertIcon />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="al-field">
              <label className="al-label">Admin Email</label>
              <div className="al-input-wrap">
                <MailIcon />
                <input
                  className={`al-input${error ? ' error' : ''}`}
                  type="email"
                  placeholder="admin@smartstudent.edu"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="al-field">
              <label className="al-label">Password</label>
              <div className="al-input-wrap">
                <LockIcon />
                <input
                  className={`al-input${error ? ' error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  className="al-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Extras */}
            <div className="al-extras">
              <label className="al-remember">
                <input
                  type="checkbox"
                  className="al-checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span className="al-remember-label">Remember me</span>
              </label>
              <a href="#" className="al-forgot">Forgot password?</a>
            </div>

            {/* Submit */}
            <button type="submit" className="al-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="al-spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Admin Dashboard</span>
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="al-hint">
            <strong>Demo credentials:</strong><br />
            Email: admin@smartstudent.edu<br />
            Password: Admin@2026
          </div>

          <div className="al-back">
            Not an admin?{' '}
            <Link to="/login">Go to Student Login</Link>
            {' · '}
            <Link to="/">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
