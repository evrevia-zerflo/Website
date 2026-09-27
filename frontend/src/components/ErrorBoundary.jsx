import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReset = () => {
    // Clear any potentially corrupted drafts that usually cause crashes
    localStorage.removeItem('addProductDraft');
    localStorage.removeItem('editProductDraft');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '600px', width: '100%', textAlign: 'center', border: '1px solid #fee2e2' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: '#ef4444' }}>
              <AlertTriangle size={64} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>Something went wrong.</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              We encountered a rendering error. This usually happens if your browser saved a corrupted draft from a previous session.
            </p>
            
            {this.state.error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', textAlign: 'left', overflowX: 'auto', marginBottom: '2rem', fontSize: '0.85rem', color: '#991b1b' }}>
                <strong>{this.state.error.toString()}</strong>
                <br/>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Please take a screenshot of this if the issue persists.</span>
              </div>
            )}

            <button 
              onClick={this.handleReset}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              <RefreshCw size={18} /> Clean Up & Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
