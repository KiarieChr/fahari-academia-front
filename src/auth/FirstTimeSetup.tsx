import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Loader2, X, Check, AlertCircle,
  User, Mail, Phone, MapPin, Key, Shield, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { getUserRole, getDashboardPath } from './RoleBasedRoute';

const STEPS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'security', label: 'Set Password', icon: Key },
];

const FieldError = ({ errors, name }) => {
  const err = errors[name];
  if (!err) return null;
  const msg = Array.isArray(err) ? err[0] : err;
  return <p className="mt-1 text-xs text-red-300 flex items-center gap-1"><AlertCircle size={12} />{msg}</p>;
};

const inputClasses = "w-full bg-[#e0e5ec] rounded-xl py-3 px-4 pl-11 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]";
const labelClasses = "block text-[13px] font-semibold text-gray-600 mb-2";

const InputWrapper = ({ icon: Icon, children, error }) => (
  <div className="relative">
    {Icon && <Icon size={18} className={`absolute left-3.5 top-3.5 pointer-events-none ${error ? 'text-red-400' : 'text-indigo-400'}`} />}
    {children}
  </div>
);

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
        sessionStorage.setItem('force_system_tour', '1');
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

  if (isLoadingUser) {
    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-[#e0e5ec]">
        <div className="text-center z-10 relative">
          <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your information...</p>
        </div>
      </div>
    );
  }
  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#e0e5ec]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto relative z-10"
      >
        <div className="bg-[#e0e5ec] shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff] rounded-2xl overflow-hidden relative">

          {/* Header */}
          <div className="px-6 sm:px-12 pt-8 sm:pt-10 pb-4 text-center">
            <div className="w-16 h-16 bg-[#e0e5ec] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff]">
              <Shield size={30} className="text-indigo-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 drop-shadow-sm">Welcome, {formData.firstName || 'there'}!</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2 font-medium">Let's get your account set up in just a moment.</p>
          </div>

          {/* Step indicator */}
          <div className="px-6 sm:px-12 pb-2">
            <div className="flex items-center justify-center gap-2">
              {STEPS.map((s, i) => {
                const StepIcon = s.icon;
                const isActive = i === step;
                const isDone = i < step;
                return (
                  <React.Fragment key={s.id}>
                    {i > 0 && (
                      <div className={`w-12 h-[2px] rounded-full transition-colors shadow-[inset_1px_1px_2px_#c3c8ce,inset_-1px_-1px_2px_#ffffff] ${isDone ? 'bg-indigo-400' : 'bg-transparent'}`} />
                    )}
                    <button
                      type="button"
                      onClick={() => { if (isDone) setStep(i); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all
                        ${isActive ? 'bg-[#e0e5ec] text-indigo-600 shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]' : isDone ? 'bg-[#e0e5ec] text-indigo-500 cursor-pointer shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff]' : 'bg-[#e0e5ec] text-gray-400 shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff]'}`}
                    >
                      {isDone ? <Check size={16} /> : <StepIcon size={16} />}
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-12 pb-10 sm:pb-12 pt-6">
            <AnimatePresence mode="wait">
              {/* STEP 0: Personal */}
              {step === 0 && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className={labelClasses}>First Name <span className="text-red-400">*</span></label>
                      <InputWrapper error={errors.firstName}>
                        <input name="firstName" value={formData.firstName} onChange={handleChange}
                          className={`${inputClasses} ${errors.firstName ? 'border-red-400/50 focus:ring-red-400' : ''}`} placeholder="John" style={{ paddingLeft: '1rem' }} />
                      </InputWrapper>
                      <FieldError errors={errors} name="firstName" />
                    </div>
                    <div>
                      <label className={labelClasses}>Last Name <span className="text-red-400">*</span></label>
                      <InputWrapper error={errors.lastName}>
                        <input name="lastName" value={formData.lastName} onChange={handleChange}
                          className={`${inputClasses} ${errors.lastName ? 'border-red-400/50 focus:ring-red-400' : ''}`} placeholder="Doe" style={{ paddingLeft: '1rem' }} />
                      </InputWrapper>
                      <FieldError errors={errors} name="lastName" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Email Address</label>
                    <InputWrapper icon={Mail} error={errors.email}>
                      <input name="email" type="email" value={formData.email} onChange={handleChange}
                        className={`${inputClasses} ${errors.email ? 'border-red-400/50 focus:ring-red-400' : ''}`} placeholder="john@institution.edu" />
                    </InputWrapper>
                    <FieldError errors={errors} name="email" />
                    {emailConflict && (
                      <p className="mt-1.5 text-xs text-amber-300 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} /> A suggested email was generated because the original is used by another account.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClasses}>Username <span className="text-red-400">*</span></label>
                    <InputWrapper icon={User} error={errors.username}>
                      <input name="username" value={formData.username} onChange={handleChange}
                        className={`${inputClasses} ${errors.username ? 'border-red-400/50 focus:ring-red-400' : ''}`} placeholder="johndoe" />
                    </InputWrapper>
                    <FieldError errors={errors} name="username" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className={labelClasses}>Phone Number</label>
                      <InputWrapper icon={Phone}>
                        <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                          className={inputClasses} placeholder="+1 234 567 890" />
                      </InputWrapper>
                    </div>
                    <div>
                      <label className={labelClasses}>Gender</label>
                      <div className="relative">
                        <select name="gender" value={formData.gender} onChange={handleChange}
                          className="w-full bg-[#e0e5ec] rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] appearance-none cursor-pointer [&>option]:bg-[#e0e5ec]">
                          <option value="">Select Gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Address</label>
                    <InputWrapper icon={MapPin}>
                      <input name="address" value={formData.address} onChange={handleChange}
                        className={inputClasses} placeholder="123 Main St, City" />
                    </InputWrapper>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button type="button" onClick={handleNext}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#e0e5ec] text-indigo-600 font-semibold rounded-xl hover:text-indigo-500 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]">
                      Continue <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Security */}
              {step === 1 && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 sm:space-y-6"
                >
                  <div>
                    <label className={labelClasses}>New Password <span className="text-red-400">*</span></label>
                    <InputWrapper icon={Key} error={errors.password}>
                      <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                        className={`${inputClasses} ${errors.password ? 'border-red-400/50 focus:ring-red-400' : ''}`} placeholder="•••••••• (Min. 8 chars)" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-white transition-colors"
                        title={showPassword ? "Hide Password" : "Show Password"}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </InputWrapper>
                    <FieldError errors={errors} name="password" />

                    {formData.password && (
                      <div className="mt-4 bg-[#e0e5ec] p-4 rounded-xl shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]">
                        <div className="flex gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: i <= strength.score
                                  ? (strength.score <= 2 ? '#f87171' : strength.score <= 3 ? '#fbbf24' : '#34d399')
                                  : 'rgba(0,0,0,0.1)'
                              }} />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {strength.checks.map((c, i) => (
                            <span key={i} className={`flex items-center gap-1.5 text-xs font-medium ${
                              c.pass ? 'text-green-500' : 'text-gray-500'
                            }`}>
                              {c.pass ? <Check size={12} /> : <X size={12} />} {c.label}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm font-bold mt-3" style={{ color: strength.score <= 2 ? '#ef4444' : strength.score <= 3 ? '#f59e0b' : '#10b981' }}>
                          Password is {strengthLabel}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClasses}>Confirm Password <span className="text-red-400">*</span></label>
                    <InputWrapper icon={Key} error={errors.confirmPassword}>
                      <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange}
                        className={`${inputClasses} ${errors.confirmPassword ? 'border-red-400/50 focus:ring-red-400' : ''}`} placeholder="•••••••• (Repeat password)" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-white transition-colors"
                        title={showConfirmPassword ? "Hide Password" : "Show Password"}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </InputWrapper>
                    <FieldError errors={errors} name="confirmPassword" />
                    {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="mt-2 text-xs text-green-400 flex items-center gap-1 font-medium"><Check size={12} /> Passwords match</p>
                    )}
                  </div>

                  <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.agreeTerms ? 'shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]' : errors.agreeTerms ? 'shadow-[inset_4px_4px_8px_#fca5a5,inset_-4px_-4px_8px_#ffffff]' : 'shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]'
                  }`}>
                    <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                        <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange}
                            className="h-5 w-5 appearance-none rounded shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] focus:outline-none checked:bg-[#e0e5ec] transition-all cursor-pointer" />
                        <Check className={`absolute w-3 h-3 text-indigo-500 pointer-events-none transition-opacity ${formData.agreeTerms ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-600 font-medium leading-relaxed">
                      I agree to the <Link to="/terms" className="text-indigo-500 hover:underline font-bold">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-500 hover:underline font-bold">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-xs text-red-300 flex items-center gap-1 font-medium"><AlertCircle size={12} />{errors.agreeTerms}</p>}

                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 gap-4 sm:gap-0">
                    <button type="button" onClick={() => setStep(0)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#e0e5ec] text-gray-600 font-semibold rounded-xl hover:text-gray-800 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]">
                      <ArrowLeft size={16} /> Previous
                    </button>
                    <button type="submit" disabled={isLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#e0e5ec] text-indigo-600 font-bold rounded-xl hover:text-indigo-500 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? (
                        <><Loader2 size={18} className="animate-spin" /> Saving...</>
                      ) : (
                        <><Check size={18} /> Complete Setup</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {errors.non_field_errors && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 bg-[#e0e5ec] rounded-xl flex items-start gap-3 shadow-[inset_4px_4px_8px_#fca5a5,inset_-4px_-4px_8px_#ffffff]"
                >
                  <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-red-500 font-medium">
                    {Array.isArray(errors.non_field_errors)
                      ? errors.non_field_errors.map((e, i) => <p key={i}>{e}</p>)
                      : <p>{errors.non_field_errors}</p>}
                  </div>
                  <button type="button" onClick={() => setErrors(p => ({ ...p, non_field_errors: undefined }))} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="px-6 sm:px-12 pb-8 sm:pb-10">
            <div className="flex items-center gap-3 text-[13px] text-gray-500 bg-[#e0e5ec] rounded-xl px-5 py-4 shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]">
              <AlertCircle size={18} className="text-indigo-500 shrink-0" />
              <span className="font-medium">You can update this information later in your profile settings.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium tracking-wide">Fahari Academia &middot; Management Information System</p>
      </motion.div>
    </div>
  );
};

export default FirstTimeSetup;
