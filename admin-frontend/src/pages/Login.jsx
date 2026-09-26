import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      setStep(2);
    } catch (err) {
      alert("Failed to send OTP. Make sure you are using the admin email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return;
    
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const { access_token, user } = res.data;
      
      if (user.role !== 'admin') {
        alert("Access Denied: You do not have admin privileges.");
        setLoading(false);
        return;
      }
      
      localStorage.setItem('auth-token', access_token);
      localStorage.setItem('auth-role', user.role);
      
      // Update global api client header
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      navigate('/');
    } catch (err) {
      alert("Invalid OTP or login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--accent-gold)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white' }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', margin: 0 }}>EVRÉVIA Admin</h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>Secure Portal Access</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type="email" 
                  placeholder="admin@evrevia.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} 
                  required 
                />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'black', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending...' : 'Send Access Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Enter Security Code</label>
              <input 
                type="text" 
                placeholder="6-digit OTP" 
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px' }} 
                maxLength={6}
                required 
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>Code sent to {email}</p>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'black', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Verifying...' : 'Authenticate & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
