import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Shield, CheckCircle, Briefcase, Layers, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const AVAILABLE_MODULES = [
    { id: 'academics', label: 'Academics & Student Management', defaultFor: ['education'] },
    { id: 'hr', label: 'HR & Workforce', defaultFor: ['education', 'retail', 'healthcare', 'corporate', 'ngo', 'general'] },
    { id: 'finance', label: 'Finance & Accounting', defaultFor: ['education', 'retail', 'healthcare', 'corporate', 'ngo', 'general'] },
    { id: 'procurement', label: 'Procurement', defaultFor: ['education', 'retail', 'healthcare', 'corporate', 'ngo', 'general'] },
    { id: 'inventory', label: 'Inventory Management', defaultFor: ['retail', 'healthcare'] },
    { id: 'canteen', label: 'Canteen / Cafeteria', defaultFor: [] },
];

const BUSINESS_SECTORS = [
    { id: 'education', label: 'Education & Academic' },
    { id: 'retail', label: 'Retail & Commerce' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'corporate', label: 'Corporate / Services' },
    { id: 'ngo', label: 'Non-Governmental Organization' },
    { id: 'general', label: 'General Business' },
];

const CreateInstitutionWizard: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progressMessage, setProgressMessage] = useState('');
    const [progress, setProgress] = useState(0);
    const [recaptchaVerified, setRecaptchaVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        schema_name: '',
        institution_profile: {
            name: '',
            business_sector: 'education',
            institution_type: 'secondary',
            enabled_modules: ['academics', 'hr', 'finance', 'procurement'] as string[],
            email: '',
            phone: '',
            address_line_1: '',
            motto: ''
        },
        campuses: [
            { name: 'Main Branch', code: 'MAIN', location: '', phone: '', email: '' }
        ],
        admin_user: {
            first_name: '',
            last_name: '',
            email: '',
            password: ''
        }
    });

    const isEducation = formData.institution_profile.business_sector === 'education';
    const totalSteps = 5;

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, institution_profile: { ...prev.institution_profile, [name]: value } };
            if (name === 'business_sector') {
                const defaults = AVAILABLE_MODULES.filter(m => m.defaultFor.includes(value)).map(m => m.id);
                updated.institution_profile.enabled_modules = defaults;
                if (value !== 'education') {
                    updated.institution_profile.institution_type = '';
                } else {
                    updated.institution_profile.institution_type = 'secondary';
                }
            }
            return updated;
        });
    };

    const handleModuleToggle = (moduleId: string) => {
        setFormData(prev => {
            const current = prev.institution_profile.enabled_modules;
            const updated = current.includes(moduleId)
                ? current.filter(id => id !== moduleId)
                : [...current, moduleId];
            return {
                ...prev,
                institution_profile: { ...prev.institution_profile, enabled_modules: updated }
            };
        });
    };

    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            admin_user: { ...formData.admin_user, [e.target.name]: e.target.value }
        });
    };

    const submitWizard = async () => {
        setLoading(true);
        setError('');
        setProgress(0);
        
        const progressSteps = [
            "Initializing workspace...",
            "Creating secure database schema...",
            "Applying core configurations...",
            "Seeding required modules...",
            "Setting up administrator account...",
            "Finalizing setup..."
        ];
        
        setProgressMessage(progressSteps[0]);
        const startTime = Date.now();
        const ESTIMATED_TIME_MS = 45000; // 45 seconds ETA
        
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            // Update message every 3 seconds, holding on the last message if we exceed the array
            const stepIndex = Math.min(Math.floor(elapsed / 3000), progressSteps.length - 1);
            setProgressMessage(progressSteps[stepIndex]);

            // Update progress bar (cap at 95% until we get the actual response)
            const newProgress = Math.min((elapsed / ESTIMATED_TIME_MS) * 100, 95);
            setProgress(newProgress);
        }, 500);

        try {
            const isLocalDevServer = window.location.port === '5173' || window.location.port === '3000';
            const API_URL = import.meta.env.PROD ? '' : (isLocalDevServer ? `${window.location.protocol}//${window.location.hostname}:8000` : (import.meta.env.VITE_API_URL || ''));
            
            const response = await axios.post(
                `${API_URL}/api/public/tenants/create/`, 
                formData
            );

            clearInterval(progressInterval);
            setProgress(100);
            setProgressMessage("Success! Redirecting to your new workspace...");
            
            setTimeout(() => {
                const { domain } = response.data;
                const protocol = window.location.protocol;
                window.location.href = `${protocol}//${domain}:${window.location.port}/`;
            }, 1000);
            
        } catch (err: any) {
            clearInterval(progressInterval);
            setError(err.response?.data?.error || 'An error occurred while creating the business.');
            setLoading(false);
        }
    };

    // Step Indicator Component
    const StepIndicator = () => (
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-8 hidden sm:flex">
            {Array.from({ length: totalSteps }).map((_, i) => {
                const num = i + 1;
                const isActive = step === num;
                const isPassed = step > num;
                return (
                    <div key={num} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                            isActive ? 'bg-[#e0e5ec] text-indigo-600 shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] scale-110' :
                            isPassed ? 'bg-[#e0e5ec] text-indigo-500 shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff]' :
                            'bg-[#e0e5ec] text-gray-400 shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff]'
                        }`}>
                            {num}
                        </div>
                        {num !== totalSteps && (
                            <div className={`w-8 sm:w-12 h-[2px] mx-1 sm:mx-2 transition-all duration-300 shadow-[inset_1px_1px_2px_#c3c8ce,inset_-1px_-1px_2px_#ffffff] ${
                                isPassed ? 'bg-indigo-400' : 'bg-transparent'
                            }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );

    // Mobile specific step indicator
    const MobileStepIndicator = () => (
        <div className="sm:hidden flex items-center justify-between mb-6">
            <span className="text-gray-500 text-sm font-medium">Step {step} of {totalSteps}</span>
            <div className="flex space-x-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 shadow-[inset_1px_1px_2px_#c3c8ce,inset_-1px_-1px_2px_#ffffff] ${step === i + 1 ? 'w-6 bg-indigo-500' : step > i + 1 ? 'w-2 bg-indigo-300' : 'w-2 bg-transparent'}`} />
                ))}
            </div>
        </div>
    );

    // Common input classes for glassmorphism -> soft neomorphism
    const inputClasses = "mt-1 block w-full bg-[#e0e5ec] rounded-xl shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all";
    const labelClasses = "block text-sm font-medium text-gray-600 mb-1";
    const selectClasses = "mt-1 block w-full bg-[#e0e5ec] rounded-xl shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all appearance-none [&>option]:bg-[#e0e5ec]";

    return (
        <div className="min-h-screen flex flex-col justify-center py-4 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#e0e5ec]">

            <div className="mx-auto w-full max-w-xl relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm">
                        Create Your Account
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-500 font-medium">Fill in the details to continue the registration process</p>
                </div>
                
                {/* Neomorphic Card */}
                <div className="bg-[#e0e5ec] shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff] py-4 px-4 sm:py-8 sm:px-8 rounded-2xl overflow-hidden relative">
                    
                    <StepIndicator />
                    <MobileStepIndicator />
                    
                    {error && (
                        <div className="bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#fca5a5,inset_-4px_-4px_8px_#ffffff] p-4 mb-6 rounded-xl">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-500 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Container */}
                    <div className="relative">
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg sm:text-xl font-semibold leading-6 text-blue-500 flex items-center mb-2">
                                    <Building2 className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <div>
                                        <label className={labelClasses}>Subdomain (Identifier)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.schema_name}
                                                onChange={(e) => setFormData({...formData, schema_name: e.target.value})}
                                                className={inputClasses}
                                                placeholder="e.g. prosperschool"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none text-gray-450 text-sm sm:text-base">
                                                .faharicloud.com
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-400">Only alphanumeric characters and underscores.</p>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Business / Institution Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.institution_profile.name}
                                            onChange={handleProfileChange}
                                            className={inputClasses}
                                            placeholder="e.g. Acme Corporation"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 sm:mt-6 flex justify-end">
                                    <button onClick={() => setStep(2)} className="w-full sm:w-auto justify-center bg-[#e0e5ec] text-indigo-600 font-semibold rounded-xl hover:text-indigo-500 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-6 flex items-center">
                                        Next Step <ArrowRight className="ml-2 h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg sm:text-xl font-semibold leading-6 text-blue-500 flex items-center mb-3 sm:mb-6">
                                    <Briefcase className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
                                    Business Sector
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <div>
                                        <label className={labelClasses}>Primary Sector</label>
                                        <select
                                            name="business_sector"
                                            value={formData.institution_profile.business_sector}
                                            onChange={handleProfileChange}
                                            className={selectClasses}
                                        >
                                            {BUSINESS_SECTORS.map(s => (
                                                <option key={s.id} value={s.id}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {isEducation && (
                                        <div>
                                            <label className={labelClasses}>Academic Level</label>
                                            <select
                                                name="institution_type"
                                                value={formData.institution_profile.institution_type}
                                                onChange={handleProfileChange}
                                                className={selectClasses}
                                            >
                                                <option value="primary">Primary School</option>
                                                <option value="secondary">Secondary School</option>
                                                <option value="mixed">Mixed (Primary & Secondary)</option>
                                                <option value="university">University</option>
                                                <option value="tertiary">Tertiary / College</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 sm:mt-6 flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-0">
                                    <button onClick={() => setStep(1)} className="w-full sm:w-auto justify-center bg-[#e0e5ec] text-gray-600 font-semibold rounded-xl hover:text-gray-800 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-6 flex items-center">
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Previous
                                    </button>
                                    <button onClick={() => setStep(3)} className="w-full sm:w-auto justify-center bg-[#e0e5ec] text-indigo-600 font-semibold rounded-xl hover:text-indigo-500 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-6 flex items-center">
                                        Next Step <ArrowRight className="ml-2 h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg sm:text-xl font-semibold leading-6 text-blue-500 flex items-center mb-3 sm:mb-6">
                                    <Layers className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
                                    Enable Modules
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">Select the features you want to activate for your business ecosystem.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {AVAILABLE_MODULES.map(module => (
                                        <label key={module.id} className="flex items-center p-3 sm:p-4 bg-[#e0e5ec] rounded-xl cursor-pointer transition-all shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.institution_profile.enabled_modules.includes(module.id)}
                                                    onChange={() => handleModuleToggle(module.id)}
                                                    className="peer h-5 w-5 sm:h-6 sm:w-6 appearance-none rounded-md shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] focus:outline-none checked:bg-[#e0e5ec] transition-all cursor-pointer"
                                                />
                                                <CheckCircle className="absolute w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                                            </div>
                                            <span className="ml-3 sm:ml-4 text-sm font-medium text-gray-700">{module.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-3 sm:mt-6 flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-0">
                                    <button onClick={() => setStep(2)} className="w-full sm:w-auto justify-center bg-[#e0e5ec] text-gray-600 font-semibold rounded-xl hover:text-gray-800 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-6 flex items-center">
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Previous
                                    </button>
                                    <button onClick={() => setStep(4)} className="w-full sm:w-auto justify-center bg-[#e0e5ec] text-indigo-600 font-semibold rounded-xl hover:text-indigo-500 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-6 flex items-center">
                                        Next Step <ArrowRight className="ml-2 h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg sm:text-xl font-semibold leading-6 text-blue-400 flex items-center mb-3 sm:mb-6">
                                    <MapPin className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
                                    Contact Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                                    <div>
                                        <label className={labelClasses}>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.institution_profile.email}
                                            onChange={handleProfileChange}
                                            className={inputClasses}
                                            placeholder="contact@business.com"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.institution_profile.phone}
                                            onChange={handleProfileChange}
                                            className={inputClasses}
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 sm:mt-6 flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-0">
                                    <button onClick={() => setStep(3)} className="w-full sm:w-auto justify-center bg-[#e0e5ec] text-gray-600 font-semibold rounded-xl hover:text-gray-800 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-6 flex items-center">
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Previous
                                    </button>
                                    <button onClick={() => setStep(5)} className="w-full sm:w-auto justify-center bg-[#e0e5ec] text-indigo-600 font-semibold rounded-xl hover:text-indigo-500 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-6 flex items-center">
                                        Next Step <ArrowRight className="ml-2 h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg sm:text-xl font-semibold leading-6 text-blue-500 flex items-center mb-3 sm:mb-6">
                                    <Shield className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
                                    Administrator Setup
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                                    <div>
                                        <label className={labelClasses}>First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.admin_user.first_name}
                                            onChange={handleAdminChange}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.admin_user.last_name}
                                            onChange={handleAdminChange}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClasses}>Admin Email (Login)</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.admin_user.email}
                                            onChange={handleAdminChange}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClasses}>Temporary Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.admin_user.password}
                                                onChange={handleAdminChange}
                                                className={inputClasses}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {!loading && (
                                    <>
                                        <div className="mt-3 sm:mt-6 bg-[#e0e5ec] p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 sm:gap-0 shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]">
                                            <div className="flex items-center w-full sm:w-auto flex-1">
                                                <div className="relative flex items-center justify-center mr-4 shrink-0">
                                                    <input 
                                                        type="checkbox" 
                                                        className="peer h-6 w-6 appearance-none rounded-md shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] focus:outline-none checked:bg-[#e0e5ec] transition-all cursor-pointer"
                                                        checked={recaptchaVerified}
                                                        onChange={(e) => setRecaptchaVerified(e.target.checked)}
                                                    />
                                                    <CheckCircle className="absolute w-4 h-4 text-green-500 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                                                </div>
                                                <span className="text-sm text-gray-600 font-medium">I am human (reCAPTCHA)</span>
                                            </div>
                                            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="h-8 opacity-90 drop-shadow-sm shrink-0 hidden sm:block" />
                                        </div>

                                        <div className="mt-3 sm:mt-6 flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-0">
                                            <button onClick={() => setStep(4)} disabled={loading} className="w-full sm:w-auto justify-center bg-[#e0e5ec] text-gray-600 font-semibold rounded-xl hover:text-gray-800 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-6 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                                                <ArrowLeft className="mr-2 h-5 w-5" /> Previous
                                            </button>
                                            <button 
                                                onClick={submitWizard}
                                                disabled={loading || !recaptchaVerified}
                                                className="w-full sm:w-auto justify-center bg-[#e0e5ec] text-indigo-600 font-bold rounded-xl hover:text-indigo-500 transition-all shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] py-3 px-8 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                                            >
                                                <span className="flex items-center">
                                                    <CheckCircle className="mr-2 h-5 w-5" />
                                                    Create Business
                                                </span>
                                            </button>
                                        </div>
                                    </>
                                )}
                                
                                {loading && (
                                    <div className="mt-3 sm:mt-6 p-6 bg-[#e0e5ec] rounded-xl flex flex-col items-center justify-center w-full shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]">
                                        <p className="text-sm text-gray-500 mb-3 font-medium text-center">
                                            Setting up your secure ecosystem. This usually takes ~45 seconds.
                                        </p>
                                        <p className="text-base sm:text-lg font-bold text-indigo-600 animate-pulse tracking-wide text-center mb-4">
                                            {progressMessage}
                                        </p>
                                        <div className="w-full h-2 bg-[#c3c8ce] rounded-full overflow-hidden shadow-[inset_1px_1px_2px_#a8afb8,inset_-1px_-1px_2px_#ffffff]">
                                            <div 
                                                className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="text-center mt-6 mb-8">
                    <p className="text-gray-500 text-sm">
                        Already have an account? <a href="/" className="text-indigo-600 font-semibold hover:underline">Log in</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateInstitutionWizard;
