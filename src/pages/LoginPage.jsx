import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail } from '../utils/validators';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validate email in real-time
  useEffect(() => {
    if (!email) {
      setEmailError('');
      return;
    }
    const validation = validateEmail(email);
    if (!validation.valid && email.includes('@')) {
      setEmailError(validation.error);
    } else {
      setEmailError('');
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || emailError) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/feed');
    } catch (err) {
      // Errors handled by AuthContext toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page auth-bg">
      {/* Decorative floating shapes */}
      <div className="auth-circle auth-circle--1"></div>
      <div className="auth-circle auth-circle--2"></div>
      <div className="auth-circle auth-circle--3"></div>

      <div className="login-card glass-card">
        <div className="login-card__header">
          <div className="login-card__logo">🎓</div>
          <h1 className="login-card__title text-gradient">CampusConnect</h1>
          <p className="login-card__tagline">Your campus. Your community. Connected.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">School Email</label>
            <div className="form-input-wrapper">
              <Mail className="form-input-icon" size={18} />
              <input
                id="email"
                type="email"
                className={`form-input form-input--has-icon ${emailError ? 'form-input--error' : ''}`}
                placeholder="username@student.apc.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {emailError && (
              <span className="form-error">
                <AlertCircle size={14} />
                {emailError}
              </span>
            )}
            <span className="form-hint">Enforces @student.apc.edu.ph or @apc.edu.ph</span>
          </div>

          <div className="form-group mt-md">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" size={18} />
              <input
                id="password"
                type="password"
                className="form-input form-input--has-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full mt-lg"
            disabled={isSubmitting || emailError !== '' || !email || !password}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spinner-icon" size={18} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-card__footer">
          <p>
            New to the community? <Link to="/register">Create an account</Link>
          </p>
          <div className="demo-credentials">
            <p><strong>Demo Account:</strong> admin@student.apc.edu.ph</p>
            <p><strong>Password:</strong> demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
