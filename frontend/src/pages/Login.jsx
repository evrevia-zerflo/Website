import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, KeyRound, Sparkles, ArrowRight, ShieldCheck, User, Phone, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useAddressStore from '../store/addressStore';
import api from '../api/client';
import toast from 'react-hot-toast';

// Steps Enum
const STEPS = {
  CHOICE: 0,
  EMAIL: 1,
  OTP: 2,
  PERSONAL_INFO: 3,
  ADDRESS: 4
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const addAddress = useAddressStore(state => state.addAddress);

  const [step, setStep] = useState(STEPS.CHOICE);
  const [flowType, setFlowType] = useState(''); // 'create' or 'login'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address State
  const [address, setAddress] = useState({
    house: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const emailRef = React.useRef(null);
  const otpRef = React.useRef(null);
  const nameRef = React.useRef(null);

  useEffect(() => {
    if (step === STEPS.EMAIL) {
      setTimeout(() => emailRef.current?.focus(), 400);
    } else if (step === STEPS.OTP) {
      setTimeout(() => otpRef.current?.focus(), 400);
    } else if (step === STEPS.PERSONAL_INFO) {
      setTimeout(() => nameRef.current?.focus(), 400);
    }
  }, [step]);

  useEffect(() => {
    if (otp.length === 6 && step === STEPS.OTP) {
      handleVerifyOTP();
    }
  }, [otp, step]);

  const redirectUrl = searchParams.get('redirect') || '/account';

  const handleChoice = (type) => {
    setFlowType(type);
    setError(null);
    setStep(STEPS.EMAIL);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/send-otp', { email });
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length !== 6) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { user, access_token, is_new_user } = response.data;
      
      login(user, access_token);
      
      if (is_new_user) {
        setName(user.name !== email.split('@')[0] ? user.name : '');
        setStep(STEPS.PERSONAL_INFO);
      } else {
        if (flowType === 'create') {
          toast.success("Account already exists. You have been logged in successfully!");
        }
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/auth/profile', { name, phone });
      login(response.data.user, useAuthStore.getState().token); // Update state with new name
      setStep(STEPS.ADDRESS);
    } catch (err) {
      setError("Failed to save profile information.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    addAddress({
      fullName: name,
      mobile: phone,
      ...address,
      isDefault: true
    });
    navigate(redirectUrl);
  };

  const skipAddress = () => {
    navigate(redirectUrl);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential
      });
      const { user, access_token, is_new_user } = response.data;
      login(user, access_token);
      
      if (is_new_user) {
        setName(user.name !== email.split('@')[0] ? user.name : '');
        setStep(STEPS.PERSONAL_INFO);
      } else {
        navigate(redirectUrl);
      }
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

  const inputStyle = { width: '100%', padding: '12px 14px 12px 40px', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' };
  const iconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '0 1.25rem 4rem' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', overflow: 'hidden', position: 'relative' }}>
        
        {/* Header Navigation */}
        {step > STEPS.CHOICE && step < STEPS.PERSONAL_INFO && (
          <button 
            onClick={() => setStep(step - 1)} 
            style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: step > STEPS.CHOICE ? '1rem' : '0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose-dark)', background: 'var(--accent-rose-light)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>
            <Sparkles size={14} /> EVRÉVIA EXCLUSIVE
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: 'var(--text-main)', margin: 0, fontWeight: 500 }}>
            {step === STEPS.CHOICE ? "Welcome" : 
             step === STEPS.EMAIL ? (flowType === 'create' ? "Create Account" : "Sign In") :
             step === STEPS.OTP ? "Verify Email" :
             step === STEPS.PERSONAL_INFO ? "About You" : "Delivery Details"}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
            {step === STEPS.CHOICE ? "Unlock premium access, track orders, and save your luxury wishlists." : 
             step === STEPS.EMAIL ? "Enter your email to receive a secure login code." :
             step === STEPS.OTP ? `We sent a 6-digit code to ${email}` :
             step === STEPS.PERSONAL_INFO ? "Personalize your luxury shopping experience." : "Where should we send your first luxury order?"}
          </p>
        </div>

        {error && (
          <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        {/* Sliding Viewport */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ 
            display: 'flex', 
            width: '500%', 
            transform: `translateX(-${step * 20}%)`, 
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}>
            
            {/* Step 0: Choice */}
            <div style={{ width: '20%', padding: '0 4px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={() => handleChoice('create')} className="btn-primary" style={{ padding: '1rem', borderRadius: '12px', fontSize: '1rem' }}>
                  Create an Account
                </button>
                <button onClick={() => handleChoice('login')} style={{ padding: '1rem', borderRadius: '12px', fontSize: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Sign In to Evrévia
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-muted)' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                  <span style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>OR QUICK LOGIN</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google Login failed.")}
                    theme="outline"
                    size="large"
                    width="100%"
                  />
                </div>

                <button onClick={handleGuestContinue} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                  Continue as Guest
                </button>
              </div>
            </div>

            {/* Step 1: Email */}
            <div style={{ width: '20%', padding: '0 4px', boxSizing: 'border-box' }}>
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={iconStyle} />
                    <input 
                      ref={emailRef}
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="you@example.com"
                      required 
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '12px' }} disabled={loading}>
                  <span>{loading ? "Sending Code..." : "Continue"}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>

            {/* Step 2: OTP */}
            <div style={{ width: '20%', padding: '0 4px', boxSizing: 'border-box' }}>
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>6-Digit Verification Code</label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={18} style={iconStyle} />
                    <input 
                      ref={otpRef}
                      type="text" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value)} 
                      placeholder="• • • • • •"
                      required 
                      maxLength={6}
                      style={{ ...inputStyle, fontSize: '1.25rem', letterSpacing: '0.4em', textAlign: 'center', paddingLeft: '14px' }}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '12px' }} disabled={loading}>
                  <span>{loading ? "Verifying..." : "Verify & Secure Account"}</span>
                  <ShieldCheck size={18} />
                </button>
                <button type="button" onClick={() => setStep(STEPS.EMAIL)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.5rem' }}>
                  Change Email Address
                </button>
              </form>
            </div>

            {/* Step 3: Personal Info */}
            <div style={{ width: '20%', padding: '0 4px', boxSizing: 'border-box' }}>
              <form onSubmit={handlePersonalInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={iconStyle} />
                    <input 
                      ref={nameRef}
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Rohan Sharma"
                      required 
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={iconStyle} />
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      placeholder="+91 9876543210"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '12px', marginTop: '0.5rem' }} disabled={loading}>
                  <span>{loading ? "Saving..." : "Next Step"}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>

            {/* Step 4: Address */}
            <div style={{ width: '20%', padding: '0 4px', boxSizing: 'border-box' }}>
              <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Street Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={iconStyle} />
                    <input type="text" value={address.house} onChange={e => setAddress({...address, house: e.target.value})} placeholder="Apartment, suite, etc." style={{...inputStyle, paddingLeft: '40px'}} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="City" style={{...inputStyle, paddingLeft: '14px'}} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Zip Code</label>
                    <input type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} placeholder="10001" style={{...inputStyle, paddingLeft: '14px'}} required />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '12px', marginTop: '0.5rem' }}>
                  <span>Complete Profile</span>
                  <ShieldCheck size={18} />
                </button>
                <button type="button" onClick={skipAddress} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.5rem' }}>
                  Skip this step for now
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
