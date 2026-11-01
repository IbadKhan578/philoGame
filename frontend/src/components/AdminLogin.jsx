import React, { useState } from 'react';
import { Lock, Mail, Key, Shield, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import soundManager from '../services/audio';
import './AdminLogin.css';

export default function AdminLogin({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.adminLogin(email, password);
      if (res && res.success) {
        soundManager.playPop();
        onLoginSuccess({ email: res.email, token: res.token });
      } else {
        setError('Invalid credentials. Please verify your email and password.');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid administrative credentials. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-overlay" onClick={onClose}>
      <div className="admin-login-card" onClick={(e) => e.stopPropagation()}>
        <button className="admin-login-close" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        <div className="admin-login-header">
          <div className="admin-shield-icon">
            <Shield size={28} />
          </div>
          <h2 className="admin-login-title">Archivist Sanctum</h2>
          <p className="admin-login-subtitle">
            Restricted administrative council portal to manage philosophers and wisdom archives.
          </p>
        </div>

        {error && (
          <div className="admin-login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-email">
              <Mail size={14} />
              <span>Admin Email / Username</span>
            </label>
            <input
              id="admin-email"
              type="text"
              placeholder="Enter admin email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">
              <Key size={14} />
              <span>Secret Passcode</span>
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter passcode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`admin-submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <Lock size={16} />
            <span>{isLoading ? 'Verifying...' : 'Access Admin Portal'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
