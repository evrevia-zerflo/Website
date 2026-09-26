import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, KeyRound, Sparkles, ArrowRight, ShieldCheck, User } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/client';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // OTP State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const redirectUrl = searchParams.get('redirect') || '/account';

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/send-otp', { email });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const userData = { ...response.data.user, name: name || response.data.user.name || email.split('@')[0] };
      login(userData, response.data.access_token);
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential
      });
      login(response.data.user, response.data.access_token);
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.detail || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    login({ name: 'Guest Customer', email: 'guest@evrevia.com' }, 'guest-token');
    navigate('/checkout');
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto', padding: '0 1.25rem 4rem' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem 1.5rem', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-rose-dark)', background: 'var(--accent-rose-light)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            <Sparkles size={12} /> Account Sign In
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-main)' }}>Welcome to EVRÉVIA</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Access saved addresses, track orders & save wishlists.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Email OTP Login Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Your Name (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Enter full name"
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="you@example.com"
                  required 
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
              <span>{loading ? "Sending OTP Code..." : "Send Verification Code"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Enter 6-digit Code sent to {email}
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  placeholder="123456"
                  required 
                  maxLength={6}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', letterSpacing: '0.2em' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
              <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
              <ShieldCheck size={16} />
            </button>

            <button 
              type="button" 
              onClick={() => setOtpSent(false)} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Use a different email address
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-light)', fontSize: '0.8rem' }}>
          — OR SIGN IN WITH —
        </div>
        
        {/* Google 1-Tap OAuth */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Login failed.")}
            theme="outline"
            size="large"
            width="320px"
          />
        </div>

        {/* Guest Option */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', textAlign: 'center' }}>
          <button onClick={handleGuestContinue} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            Fast Guest Checkout &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}
