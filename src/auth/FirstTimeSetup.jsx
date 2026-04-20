import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Loader2, X, Check, AlertCircle,
  User, Mail, Phone, MapPin, Key, Shield, ChevronRight
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { getUserRole, getDashboardPath } from './RoleBasedRoute';

const STEPS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'security', label: 'Set Password', icon: Key },
];

const FirstTimeSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '', username: '', firstName: '', lastName: '',
    phone: '', address: '', gender: '',
    password: '', confirmPassword: '', agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [emailConflict, setEmailConflict] = useState(false);

  // â”€â”€ Password strength â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getPasswordStrength = (pw) => {
    let s = 0;
    const checks = [
      { pass: pw.length >= 8, label: '8+ characters' },
      { pass: /[A-Z]/.test(pw), label: 'Uppercase' },
      { pass: /[a-z]/.test(pw), label: 'Lowercase' },
      { pass: /[0-9]/.test(pw), label: 'Number' },
      { pass: /[^A-Za-z0-9]/.test(pw), label: 'Special char' },
    ];
    checks.forEach(c => { if (c.pass) s++; });
    return { score: s, checks };
  };
  const strength = getPasswordStrength(formData.password);
  const strengthLabel = strength.score <= 2 ? 'Weak' : strength.score <= 3 ? 'Fair' : 'Strong';

  // â”€â”€ Load user data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoadingUser(true);
      try {
        const userId = sessionStorage.getItem('first_time_user_id') || location.state?.userId;
        let response;
        if (userId) {
          response = await api.get(`/api/auth/first-time-setup/?user_id=${userId}`);
        } else {
          response = await api.get('/api/auth/first-time-setup/');
        }
        const result = response.data ? response : { ...response };

        if (result.success && result.requires_setup) {
          const user = result.user;
          setCurrentUser(user);
          if (result.email_conflict) setEmailConflict(true);
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
      } catch {
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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // â”€â”€ Step validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!formData.firstName.trim()) e.firstName = 'First name is required';
      if (!formData.lastName.trim()) e.lastName = 'Last name is required';
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email address';
      if (!formData.username.trim()) e.username = 'Username is required';
    }
    if (s === 1) {
      if (!formData.password) e.password = 'Password is required';
      else if (formData.password.length < 8) e.password = 'Must be at least 8 characters';
      if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
      if (!formData.agreeTerms) e.agreeTerms = 'You must agree to the terms';
    }
    return e;
  };

  const handleNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(step + 1);
  };

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep(1);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);

    try {
      const userId = currentUser?.id || sessionStorage.getItem('first_time_user_id');
      const result = await api.post('/api/auth/first-time-setup/', {
        user_id: userId,
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

      if (result.success) {
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
        if (result.token) localStorage.setItem('token', result.token);
        sessionStorage.removeItem('first_time_user_id');
        sessionStorage.removeItem('user_email');

        toast.success(result.message || 'Profile setup completed!');
        const role = getUserRole(result.user);
        const dashPath = getDashboardPath(role);
        setTimeout(() => navigate(dashPath), 1200);
      } else {
        toast.error(result.message || 'Setup failed');
        if (result.errors) setErrors(result.errors);
      }
    } catch (error) {
      const errorData = error.data || error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
        const nfe = errorData.errors.non_field_errors;
        toast.error(nfe ? (Array.isArray(nfe) ? nfe[0] : nfe) : 'Please correct the errors');
      } else {
        toast.error(errorData?.message || error.message || 'Setup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const FieldError = ({ name }) => {
    const err = errors[name];
    if (!err) return null;
    const msg = Array.isArray(err) ? err[0] : err;
    return <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{msg}</p>;
  };

  const InputWrapper = ({ icon: Icon, children, error }) => (
    <div className={`group relative flex items-center rounded-xl border-2 ${error ? 'border-red-300 bg-red-50/30 ring-2 ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/30'} focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:bg-white focus-within:shadow-sm transition-all duration-200`}>
      {Icon && <Icon size={18} className="absolute left-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200 pointer-events-none" />}
      {children}
    </div>
  );

  // â”€â”€ Loading state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your informationâ€¦</p>
        </div>
      </div>
    );
  }
  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl lg:max-w-[680px] mx-auto"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden">

          {/* â”€â”€ Top accent bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-400" />

          {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="px-8 sm:px-12 md:px-16 pt-8 sm:pt-10 pb-4 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Shield size={30} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl sm:text-[1.65rem] font-bold text-gray-900">Welcome, {formData.firstName || 'there'}!</h1>
            <p className="text-sm sm:text-[0.9rem] text-gray-500 mt-1.5 leading-relaxed">Let's get your account set up in just a moment.</p>
          </div>

          {/* â”€â”€ Step indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="px-8 sm:px-12 md:px-16 pb-2">
            <div className="flex items-center justify-center gap-2">
              {STEPS.map((s, i) => {
                const StepIcon = s.icon;
                const isActive = i === step;
                const isDone = i < step;
                return (
                  <React.Fragment key={s.id}>
                    {i > 0 && (
                      <div className={`w-12 h-0.5 rounded-full transition-colors ${isDone ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                    )}
                    <button
                      type="button"
                      onClick={() => { if (isDone) setStep(i); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${isActive ? 'bg-indigo-100 text-indigo-700' : isDone ? 'bg-emerald-50 text-emerald-600 cursor-pointer' : 'text-gray-400'}`}
                    >
                      {isDone ? <Check size={14} /> : <StepIcon size={14} />}
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* â”€â”€ Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <form onSubmit={handleSubmit} className="px-8 sm:px-12 md:px-16 pb-10 sm:pb-12 pt-6 m-3">
            <AnimatePresence mode="wait">
              {/* â•â•â•â•â•â•â•â•â•â•â• STEP 0: Personal â•â•â•â•â•â•â•â•â•â•â• */}
              {step === 0 && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 sm:space-y-6"
                >
                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2">First Name <span className="text-red-400">*</span></label>
                      <InputWrapper error={errors.firstName}>
                        <input name="firstName" value={formData.firstName} onChange={handleChange}
                          className="w-full bg-transparent pl-4 pr-4 py-3 text-sm sm:text-[15px] text-gray-800 placeholder-gray-400 outline-none rounded-xl" placeholder="John" />
                      </InputWrapper>
                      <FieldError name="firstName" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2">Last Name <span className="text-red-400">*</span></label>
                      <InputWrapper error={errors.lastName}>
                        <input name="lastName" value={formData.lastName} onChange={handleChange}
                          className="w-full bg-transparent pl-4 pr-4 py-3 text-sm sm:text-[15px] text-gray-800 placeholder-gray-400 outline-none rounded-xl" placeholder="Doe" />
                      </InputWrapper>
                      <FieldError name="lastName" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-600 mb-2">Email Address</label>
                    <InputWrapper icon={Mail} error={errors.email}>
                      <input name="email" type="email" value={formData.email} onChange={handleChange}
                        className="w-full bg-transparent pl-11 pr-4 py-3 text-sm sm:text-[15px] text-gray-800 placeholder-gray-400 outline-none rounded-xl" placeholder="john@institution.edu" />
                    </InputWrapper>
                    <FieldError name="email" />
                    {emailConflict && (
                      <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle size={12} /> A suggested email was generated because the original is used by another account. You can edit it.
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-600 mb-2">Username <span className="text-red-400">*</span></label>
                    <InputWrapper icon={User} error={errors.username}>
                      <input name="username" value={formData.username} onChange={handleChange}
                        className="w-full bg-transparent pl-11 pr-4 py-3 text-sm sm:text-[15px] text-gray-800 placeholder-gray-400 outline-none rounded-xl" placeholder="johndoe" />
                    </InputWrapper>
                    <FieldError name="username" />
                  </div>

                  {/* Phone & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2">Phone Number</label>
                      <InputWrapper icon={Phone}>
                        <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                          className="w-full bg-transparent pl-11 pr-4 py-3 text-sm sm:text-[15px] text-gray-800 placeholder-gray-400 outline-none rounded-xl" placeholder="+254 700 000000" />
                      </InputWrapper>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2">Gender</label>
                      <InputWrapper>
                        <select name="gender" value={formData.gender} onChange={handleChange}
                          className="w-full bg-transparent pl-4 pr-4 py-3 text-sm sm:text-[15px] text-gray-800 outline-none rounded-xl appearance-none cursor-pointer">
                          <option value="">Selectâ€¦</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </InputWrapper>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-600 mb-2">Address</label>
                    <InputWrapper icon={MapPin}>
                      <input name="address" value={formData.address} onChange={handleChange}
                        className="w-full bg-transparent pl-11 pr-4 py-3 text-sm sm:text-[15px] text-gray-800 placeholder-gray-400 outline-none rounded-xl" placeholder="123 Main St, City" />
                    </InputWrapper>
                  </div>

                  {/* Next button */}
                  <div className="flex justify-end pt-3">
                    <button type="button" onClick={handleNext}
                      className="flex items-center gap-2 px-7 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-200">
                      Continue <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* â•â•â•â•â•â•â•â•â•â•â• STEP 1: Security â•â•â•â•â•â•â•â•â•â•â• */}
              {step === 1 && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 sm:space-y-6"
                >
                  {/* Password */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-600 mb-2">New Password <span className="text-red-400">*</span></label>
                    <InputWrapper icon={Key} error={errors.password}>
                      <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                        className="w-full bg-transparent pl-11 pr-12 py-3 text-sm sm:text-[15px] text-gray-800 placeholder-gray-400 outline-none rounded-xl" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </InputWrapper>
                    <FieldError name="password" />

                    {/* Strength meter */}
                    {formData.password && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: i <= strength.score
                                  ? (strength.score <= 2 ? '#f87171' : strength.score <= 3 ? '#fbbf24' : '#34d399')
                                  : '#e5e7eb'
                              }} />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {strength.checks.map((c, i) => (
                            <span key={i} className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                              c.pass ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {c.pass ? <Check size={10} /> : <X size={10} />} {c.label}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs font-medium" style={{ color: strength.score <= 2 ? '#ef4444' : strength.score <= 3 ? '#f59e0b' : '#10b981' }}>
                          {strengthLabel}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-600 mb-2">Confirm Password <span className="text-red-400">*</span></label>
                    <InputWrapper icon={Key} error={errors.confirmPassword}>
                      <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange}
                        className="w-full bg-transparent pl-11 pr-12 py-3 text-sm sm:text-[15px] text-gray-800 placeholder-gray-400 outline-none rounded-xl" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </InputWrapper>
                    <FieldError name="confirmPassword" />
                    {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="mt-1 text-xs text-emerald-500 flex items-center gap-1"><Check size={12} /> Passwords match</p>
                    )}
                  </div>

                  {/* Terms */}
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.agreeTerms ? 'border-indigo-300 bg-indigo-50/50' : errors.agreeTerms ? 'border-red-300 bg-red-50/30' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/40'
                  }`}>
                    <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      I agree to the <Link to="/terms" className="text-indigo-600 hover:underline font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 hover:underline font-medium">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.agreeTerms}</p>}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-3">
                    <button type="button" onClick={() => setStep(0)}
                      className="px-5 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all">
                      Back
                    </button>
                    <button type="submit" disabled={isLoading}
                      className="flex items-center gap-2 px-7 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? (
                        <><Loader2 size={16} className="animate-spin" /> Setting upâ€¦</>
                      ) : (
                        <><Check size={16} /> Complete Setup</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* â”€â”€ Error banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <AnimatePresence>
              {errors.non_field_errors && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                >
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-red-600">
                    {Array.isArray(errors.non_field_errors)
                      ? errors.non_field_errors.map((e, i) => <p key={i}>{e}</p>)
                      : <p>{errors.non_field_errors}</p>}
                  </div>
                  <button type="button" onClick={() => setErrors(p => ({ ...p, non_field_errors: undefined }))} className="ml-auto text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* â”€â”€ Footer hint â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="px-8 sm:px-12 md:px-16 pb-8 sm:pb-10">
            <div className="flex items-center gap-2.5 text-xs sm:text-[13px] text-gray-400 bg-gray-50 rounded-xl px-4 py-3.5">
              <AlertCircle size={14} className="text-indigo-400 shrink-0" />
              <span>You can update this information later in your profile settings.</span>
            </div>
          </div>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-gray-400 mt-5 mb-2">Fahari Academia &middot; Management Information System</p>
      </motion.div>
    </div>
  );
};

export default FirstTimeSetup;
