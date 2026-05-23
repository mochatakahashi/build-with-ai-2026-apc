import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, Mail, Lock, Github, AlertCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/validators';
import './RegisterPage.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    githubUsername: '',
  });

  const [errors, setErrors] = useState({
    displayName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validate fields dynamically
  useEffect(() => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
      return;
    }
    const validation = validateEmail(formData.email);
    if (!validation.valid && formData.email.includes('@')) {
      setErrors((prev) => ({ ...prev, email: validation.error }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  }, [formData.email]);

  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength('weak');
      setErrors((prev) => ({ ...prev, password: '' }));
      return;
    }
    const validation = validatePassword(formData.password);
    setPasswordStrength(validation.strength);
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, password: validation.error }));
    } else {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  }, [formData.password]);

  useEffect(() => {
    if (!formData.confirmPassword || !formData.password) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const getStrengthBarClass = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'strength-bar--strong';
      case 'medium':
        return 'strength-bar--medium';
      default:
        return 'strength-bar--weak';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final checks
    const emailVal = validateEmail(formData.email);
    const passVal = validatePassword(formData.password);
    
    if (!emailVal.valid || !passVal.valid || formData.password !== formData.confirmPassword) return;
    if (!formData.displayName.trim() || !formData.studentId.trim() || !termsAccepted) return;

    setIsSubmitting(true);
    try {
      await register({
        email: formData.email,
        displayName: formData.displayName,
        studentId: formData.studentId,
        githubUsername: formData.githubUsername,
        password: formData.password,
      });
      navigate('/feed');
    } catch (err) {
      // Handled by AuthContext toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasFormErrors = () => {
    return (
      errors.email !== '' ||
      errors.password !== '' ||
      errors.confirmPassword !== '' ||
      !formData.displayName.trim() ||
      !formData.studentId.trim() ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !termsAccepted
    );
  };

  return (
    <div className="register-page auth-bg">
      <div className="auth-circle auth-circle--1"></div>
      <div className="auth-circle auth-circle--2"></div>
      <div className="auth-circle auth-circle--3"></div>

      <div className="register-card glass-card">
        <div className="register-card__header">
          <div className="register-card__logo">🎓</div>
          <h1 className="register-card__title text-gradient">Create Account</h1>
          <p className="register-card__tagline">Connect with peers and faculty exclusively at APC.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-form__grid">
            <div className="form-group register-field--1">
              <label className="form-label" htmlFor="displayName">Full Name</label>
              <div className="form-input-wrapper">
                <User className="form-input-icon" size={18} />
                <input
                  id="displayName"
                  type="text"
                  className="form-input form-input--has-icon"
                  placeholder="Juan Dela Cruz"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group register-field--2">
              <label className="form-label" htmlFor="studentId">Student/Employee ID</label>
              <div className="form-input-wrapper">
                <Shield className="form-input-icon" size={18} />
                <input
                  id="studentId"
                  type="text"
                  className="form-input form-input--has-icon"
                  placeholder="2022-100456"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group register-field--3 mt-xs">
            <label className="form-label" htmlFor="email">APC Email Address</label>
            <div className="form-input-wrapper">
              <Mail className="form-input-icon" size={18} />
              <input
                id="email"
                type="email"
                className={`form-input form-input--has-icon ${errors.email ? 'form-input--error' : ''}`}
                placeholder="username@student.apc.edu.ph"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {errors.email ? (
              <span className="form-error">
                <AlertCircle size={14} />
                {errors.email}
              </span>
            ) : (
              <span className="form-hint">Must end with @student.apc.edu.ph or @apc.edu.ph</span>
            )}
          </div>

          <div className="register-form__grid mt-xs">
            <div className="form-group register-field--4">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" size={18} />
                <input
                  id="password"
                  type="password"
                  className={`form-input form-input--has-icon ${errors.password ? 'form-input--error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="password-strength mt-xs">
                <div className={`strength-bar ${getStrengthBarClass()}`}></div>
                <span className="strength-text">Strength: {passwordStrength}</span>
              </div>
            </div>

            <div className="form-group register-field--5">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" size={18} />
                <input
                  id="confirmPassword"
                  type="password"
                  className={`form-input form-input--has-icon ${errors.confirmPassword ? 'form-input--error' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.confirmPassword && (
                <span className="form-error">
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          <div className="form-group register-field--6 mt-xs">
            <label className="form-label" htmlFor="githubUsername">GitHub Username (Optional)</label>
            <div className="form-input-wrapper">
              <Github className="form-input-icon" size={18} />
              <input
                id="githubUsername"
                type="text"
                className="form-input form-input--has-icon"
                placeholder="github-username"
                value={formData.githubUsername}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group register-field--7 mt-sm checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom">
                {termsAccepted && <Check size={12} />}
              </span>
              <span className="checkbox-text">
                I agree to the APC CampusConnect Terms of Service and Privacy Policy.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full mt-md"
            disabled={isSubmitting || hasFormErrors()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spinner-icon" size={18} />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="register-card__footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
