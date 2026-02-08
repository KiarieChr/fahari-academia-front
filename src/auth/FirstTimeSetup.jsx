import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, X, Check, AlertCircle, User, Mail, Phone, Home, Key } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';



const FirstTimeSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    gender: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const progressVariants = {
    hidden: { width: '0%' },
    visible: { width: '100%', transition: { duration: 0.5 } }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length < 8) feedback.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) feedback.push('One uppercase letter');
    if (!/[a-z]/.test(password)) feedback.push('One lowercase letter');
    if (!/[0-9]/.test(password)) feedback.push('One number');
    if (!/[^A-Za-z0-9]/.test(password)) feedback.push('One special character');

    return { score, feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong password' };
  };

  useEffect(() => {
    // Load user data for setup
    // In the useEffect where you load user data:
    const loadUserData = async () => {
      setIsLoadingUser(true);
      try {
        // First try without parameters (session-based)
        let response;
        try {
          response = await api.get('/api/auth/first-time-setup/');
        } catch (sessionError) {
          // If session-based fails, try with user_id parameter
          const userId = sessionStorage.getItem('first_time_user_id') || location.state?.userId;
          if (userId) {
            response = await api.get(`/api/auth/first-time-setup/?user_id=${userId}`);
          } else {
            throw new Error('No user ID available');
          }
        }

        if (response.data.success && response.data.requires_setup) {
          const user = response.data.user;
          setCurrentUser(user);

          setFormData(prev => ({
            ...prev,
            email: user.current_email || user.email || '',
            username: user.current_username || user.username || '',
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            phone: user.phone || '',
            address: user.address || '',
            gender: user.gender || ''
          }));
        } else {
          toast.error('Setup not required or session expired');
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load user information');
        navigate('/');
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
  }, [navigate, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(newValue));
    }

    // Clear confirm password error if passwords match
    if ((name === 'password' || name === 'confirmPassword') && formData.password === formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate form
    const newErrors = {};

    // Required fields
    if (!formData.email.trim()) newErrors.email = ['Email is required'];
    if (!formData.username.trim()) newErrors.username = ['Username is required'];
    if (!formData.firstName.trim()) newErrors.firstName = ['First name is required'];
    if (!formData.lastName.trim()) newErrors.lastName = ['Last name is required'];
    if (!formData.password) newErrors.password = ['Password is required'];
    if (!formData.confirmPassword) newErrors.confirmPassword = ['Please confirm your password'];

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Please enter a valid email address'];
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = ['Password must be at least 8 characters'];
    }

    // Password match validation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = ['Passwords do not match'];
    }

    // Terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = ['You must agree to the terms and conditions'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      // Get user_id from currentUser or session
      const userId = currentUser?.id || sessionStorage.getItem('first_time_user_id');

      // Submit to Django API
      const response = await api.post('/api/auth/first-time-setup/', {
        user_id: userId,  // Send user_id in POST data
        email: formData.email,
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || '',
        address: formData.address || '',
        gender: formData.gender || '',
        password: formData.password,
        confirm_password: formData.confirmPassword
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Profile setup completed successfully!');

        // Store user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        // Clear any setup session data
        sessionStorage.removeItem('first_time_user_id');
        sessionStorage.removeItem('user_email');

        // Navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast.error(response.data.message || 'Setup failed');
        if (response.data.errors) {
          setErrors(response.data.errors);
        }
      }
    } catch (error) {
      console.error('Setup error:', error);

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors) {
          setErrors(errorData.errors);

          if (errorData.errors.non_field_errors) {
            const errorMsg = Array.isArray(errorData.errors.non_field_errors)
              ? errorData.errors.non_field_errors[0]
              : errorData.errors.non_field_errors;
            toast.error(errorMsg);
          } else {
            toast.error('Please correct the errors in the form');
          }
        } else if (errorData.message) {
          toast.error(errorData.message);
          setErrors({ non_field_errors: [errorData.message] });
        } else {
          toast.error('Setup failed. Please try again.');
        }
      } else if (error.request) {
        toast.error('Unable to connect to server. Please check your network.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format errors for display
  const errorList = Object.entries(errors).flatMap(([key, value]) => {
    if (['success', 'status', 'code'].includes(key)) return [];

    let messages = [];
    if (Array.isArray(value)) {
      messages = value;
    } else if (typeof value === 'string') {
      messages = [value];
    } else if (typeof value === 'object' && value !== null) {
      return [];
    }

    if (key === 'non_field_errors' || key === 'detail') {
      return messages;
    }

    return messages.map(msg => {
      if (typeof msg === 'object') return JSON.stringify(msg);
      const fieldName = key.replace(/_/g, ' ');
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${msg}`;
    });
  });

  if (isLoadingUser) {
    return (
      <div className="setup-container" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="spinner-container">
          <Loader2 size={40} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#5c6bc0' }}>Loading your information...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="setup-container">
      {/* Progress Bar */}
      <motion.div
        className="progress-bar"
        initial="hidden"
        animate="visible"
        variants={progressVariants}
      />

      {/* Header */}
      <motion.div
        className="setup-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="setup-icon">
          <User size={32} />
        </div>
        <h1 className="setup-title">Complete Your Profile</h1>
        <p className="setup-subtitle">
          Welcome! Please complete your profile setup to continue using the portal.
        </p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {errorList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="error-alert"
          >
            <button
              onClick={() => setErrors({})}
              className="error-close-btn"
            >
              <X size={16} />
            </button>
            <div className="error-content">
              <strong className="error-title">Please correct the following:</strong>
              <ul className="error-list">
                {errorList.map((err, idx) => (
                  <li key={idx} className="error-item">{err}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setup Form */}
      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="setup-form"
      >
        {/* Personal Information Section */}
        <motion.div variants={itemVariants} className="form-section">
          <h3 className="section-title">
            <User size={18} style={{ marginRight: '8px' }} />
            Personal Information
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.firstName && (
                <div className="field-error">{Array.isArray(errors.firstName) ? errors.firstName[0] : errors.firstName}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.lastName && (
                <div className="field-error">{Array.isArray(errors.lastName) ? errors.lastName[0] : errors.lastName}</div>
              )}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="john.doe@institution.edu"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <div className="field-error">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</div>
              )}
              <p className="input-hint">This will be your login email</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Username <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="username"
                  className={`form-input ${errors.username ? 'input-error' : ''}`}
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <div className="field-error">{Array.isArray(errors.username) ? errors.username[0] : errors.username}</div>
              )}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <div className="field-error">{Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                className={`form-input ${errors.gender ? 'input-error' : ''}`}
                value={formData.gender}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
              {errors.gender && (
                <div className="field-error">{Array.isArray(errors.gender) ? errors.gender[0] : errors.gender}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <div className="input-with-icon">
              <Home size={18} className="input-icon" />
              <input
                type="text"
                name="address"
                className={`form-input ${errors.address ? 'input-error' : ''}`}
                placeholder="123 Main St, City, Country"
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            {errors.address && (
              <div className="field-error">{Array.isArray(errors.address) ? errors.address[0] : errors.address}</div>
            )}
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div variants={itemVariants} className="form-section">
          <h3 className="section-title">
            <Key size={18} style={{ marginRight: '8px' }} />
            Security Settings
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Password <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Key size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div className="field-error">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</div>
              )}

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-meter">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`strength-bar ${level <= passwordStrength.score ? 'active' : ''}`}
                        style={{
                          backgroundColor: level <= passwordStrength.score
                            ? ['#ff4444', '#ffbb33', '#ffbb33', '#00C851', '#00C851'][level - 1]
                            : '#e0e0e0'
                        }}
                      />
                    ))}
                  </div>
                  <div className="strength-feedback">
                    {formData.password.length > 0 && (
                      <>
                        Strength: <span style={{
                          color: passwordStrength.score <= 2 ? '#ff4444' :
                            passwordStrength.score <= 3 ? '#ffbb33' : '#00C851',
                          fontWeight: 600
                        }}>
                          {passwordStrength.score <= 2 ? 'Weak' :
                            passwordStrength.score <= 3 ? 'Fair' : 'Strong'}
                        </span>
                        {passwordStrength.feedback && passwordStrength.score < 5 && (
                          <span className="feedback-text"> - {passwordStrength.feedback}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm Password <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Key size={18} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="field-error">{Array.isArray(errors.confirmPassword) ? errors.confirmPassword[0] : errors.confirmPassword}</div>
              )}
              {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="success-message" style={{ color: '#00C851', fontSize: '0.85rem', marginTop: '4px' }}>
                  <Check size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Passwords match
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Terms and Conditions */}
        <motion.div variants={itemVariants} className="form-section">
          <label className={`terms-checkbox ${errors.agreeTerms ? 'error' : ''}`}>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              disabled={isLoading}
              className="checkbox-input"
            />
            <span className="checkbox-custom"></span>
            <span className="terms-text">
              I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
            </span>
          </label>
          {errors.agreeTerms && (
            <div className="field-error" style={{ marginTop: '8px' }}>
              {Array.isArray(errors.agreeTerms) ? errors.agreeTerms[0] : errors.agreeTerms}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="secondary-btn"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                Setting Up...
              </>
            ) : (
              'Complete Setup'
            )}
          </button>
        </motion.div>
      </motion.form>

      {/* Help Text */}
      <motion.div
        variants={itemVariants}
        className="setup-help"
      >
        <AlertCircle size={16} style={{ marginRight: '8px', color: '#5c6bc0' }} />
        <p>
          This information will be used to personalize your experience. You can update it later in your profile settings.
        </p>
      </motion.div>
    </div>
  );
};

export default FirstTimeSetup;
