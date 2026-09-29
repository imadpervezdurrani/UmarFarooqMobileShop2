import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Lock, Mail, ArrowRight, Eye, EyeOff, User, UserPlus, LogIn, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const { storeSettings, login, register } = useApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      if (!email || !password) return;
      setLoading(true);
      const success = await login(email, password);
      setLoading(false);

      if (!success) {
        setErrorMsg('Invalid email or password. Please check your credentials.');
      }
    } else {
      if (!name || !email || !password) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      setLoading(true);
      const res = await register({
        name,
        email,
        password,
        role,
        title: role === 'admin' ? 'Store Administrator' : (role === 'manager' ? 'Branch Manager' : 'Sales Staff'),
      });
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        background: 'radial-gradient(circle at 50% 20%, #0f172a 0%, #080b13 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2rem 1.75rem',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
            }}
          >
            <Smartphone size={30} color="#041221" />
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: '#ffffff',
              marginBottom: '0.35rem',
            }}
          >
            {storeSettings.storeName}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {mode === 'login'
              ? 'Enter your credentials to access the shop management system'
              : 'Create a new staff or admin account for your mobile shop'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9px',
              border: 'none',
              background: mode === 'login' ? 'var(--accent-cyan)' : 'transparent',
              color: mode === 'login' ? '#041221' : 'var(--text-muted)',
              fontWeight: mode === 'login' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9px',
              border: 'none',
              background: mode === 'register' ? 'var(--accent-cyan)' : 'transparent',
              color: mode === 'register' ? '#041221' : 'var(--text-muted)',
              fontWeight: mode === 'register' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <UserPlus size={15} />
            <span>Register</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              color: '#fb7185',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} color="var(--accent-cyan)" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Ali Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ height: '44px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={14} color="var(--accent-cyan)" />
                  <span>Account Role</span>
                </label>
                <select
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ height: '44px' }}
                >
                  <option value="staff">Staff Member (Sales & Invoicing)</option>
                  <option value="manager">Manager (Stock & Reports)</option>
                  <option value="admin">Store Admin (Full Control)</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} color="var(--accent-cyan)" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder={mode === 'login' ? 'UmarFarooq@celltech.com' : 'user@domain.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ height: '44px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} color="var(--accent-cyan)" />
              <span>Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder={mode === 'register' ? 'Minimum 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ height: '44px', paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '46px',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? (
              <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
            ) : mode === 'login' ? (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register New Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
