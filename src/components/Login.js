import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('https://web-production-f7410.up.railway.app/api/token/', { username, password });
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);
      onLogin();
    } catch {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-grid" />
      <div className="login-card">
        <div className="login-logo">⚡ TrustScore Uganda</div>
        <div className="login-tagline">AI-Powered Credit Scoring · Lender Portal</div>

        {error && <div className="login-error">⚠️ {error}</div>}

        <div className="login-input-group">
          <label className="form-label">Username</label>
          <input
            className="login-input"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <div className="login-input-group">
          <label className="form-label">Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? <><span className="spinner" />Signing in...</> : 'Sign In →'}
        </button>

        <div className="login-footer-text">
          🔒 Authorised lenders only · All data encrypted
        </div>
      </div>
    </div>
  );
}

export default Login;