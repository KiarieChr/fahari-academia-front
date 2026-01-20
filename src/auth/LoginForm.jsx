import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import './auth.css';

const REGISTRATION_ENABLED = false; // Set to true to enable registration

const LoginForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    isFirstLogin: false,
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (activeTab === 'login') {
        const response = await api.login({
          username: formData.username,
          password: formData.password
        });

        // Save token if present (adjust based on actual response structure)
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Check if first time login (adjust property name based on backend)
        const isFirstTimeUser = response.user?.is_first_login || response.is_first_login || formData.username === 'newuser';

        if (isFirstTimeUser) {
          toast.success("First time login detected. Please set your new password.");
          navigate('/reset-password');
        } else {
          toast.success("Welcome Back " + (response.user?.first_name || 'User') + "!");
          navigate('/dashboard');
        }
      } else {
        // Registration is supposedly disabled/handled differently
        toast.success("Account Created Successfully!");
      }
    } catch (err) {
      console.error(err);
      let errorData = err.data || {};

      // Check if errors are wrapped in an "errors" property
      if (errorData.errors) {
        errorData = errorData.errors;
      }

      // If the error response is an object (validation errors), set them
      if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
        setErrors(errorData);
        // If we have non_field_errors, show them in toast too
        if (errorData.non_field_errors) {
          toast.error(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
        } else {
          toast.error("Please correct the errors in the form.");
        }
      } else {
        setErrors({ non_field_errors: [err.message || "Login failed"] });
        toast.error(err.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format errors for display
  const errorList = Object.entries(errors).flatMap(([key, value]) => {
    // Filter out specific keys from being displayed as options
    if (['success', 'status', 'code'].includes(key)) return [];

    // value can be string or array of strings, or nested object
    let messages = [];
    if (Array.isArray(value)) {
      messages = value;
    } else if (typeof value === 'object' && value !== null) {
      // If it's a nested object, try to stringify it or ignore if empty
      return [];
    } else {
      messages = [String(value)];
    }

    // Filter out specific keys from being displayed as options
    if (key === 'non_field_errors' || key === 'detail') {
      return messages;
    }
    return messages.map(msg => {
      if (typeof msg === 'object') return JSON.stringify(msg); // Fallback for safety
      return `${key.replace(/_/g, ' ')}: ${msg}`;
    });
  });

  return (
    <div className="form-wrapper">
      {/* Dismissable Error Alert */}
      <AnimatePresence>
        {errorList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #ffcdd2',
              position: 'relative',
              fontSize: '0.9rem'
            }}
          >
            <button
              onClick={() => setErrors({})}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'none', border: 'none', cursor: 'pointer', color: '#c62828'
              }}
            >
              <X size={16} />
            </button>
            <div style={{ paddingRight: '20px' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Submission Failed</strong>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {errorList.map((err, idx) => (
                  <li key={idx} style={{ textTransform: 'capitalize' }}>{err}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!REGISTRATION_ENABLED ? (
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a237e', margin: 0 }}>Sign In</h2>
          <p style={{ color: '#9fa8da', fontSize: '0.95rem', marginTop: '0.5rem' }}>Welcome back to the portal</p>
        </div>
      ) : (
        <div className="auth-tabs">
          <motion.div
            className="tab-indicator"
            layoutId="activeTab"
            style={{
              position: 'absolute',
              top: 4, left: 4, bottom: 4,
              width: REGISTRATION_ENABLED ? 'calc(50% - 8px)' : 'calc(100% - 8px)',
              borderRadius: 10,
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              x: activeTab === 'login' ? 0 : '100%'
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          {REGISTRATION_ENABLED && (
            <button
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          )}
        </div>
      )}

      <motion.form
        key={activeTab}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onSubmit={handleSubmit}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <motion.div variants={itemVariants} className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="form-group">
                  <label className="form-label">Second Name</label>
                  <input
                    type="text"
                    name="secondName"
                    className="form-input"
                    placeholder="Middle"
                    value={formData.secondName}
                    onChange={handleChange}
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="form-group">
                  <label className="form-label">Surname</label>
                  <input
                    type="text"
                    name="surname"
                    className="form-input"
                    placeholder="Doe"
                    value={formData.surname}
                    onChange={handleChange}
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  placeholder="johndoe123"
                  value={formData.username}
                  onChange={handleChange}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="form-group">
          <label className="form-label">Email / Username</label>
          <input
            type="email"
            name="username"
            className="form-input"
            placeholder="name@school.edu"
            value={formData.username}
            onChange={handleChange}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#9fa8da'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="form-actions"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}
        >
          {activeTab === 'login' ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#5c6bc0', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={{ accentColor: '#3f51b5', width: 16, height: 16 }}
              />
              Remember me
            </label>
          ) : (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#5c6bc0', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                name="isFirstLogin"
                checked={formData.isFirstLogin}
                onChange={handleChange}
                style={{ accentColor: '#3f51b5', width: 16, height: 16 }}
              />
              Is First Login?
            </label>
          )}

          <Link to="/forgot-password" style={{ color: '#3f51b5', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Forgot password?</Link>
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="submit"
          className="submit-btn"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? <Loader2 className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default LoginForm;
