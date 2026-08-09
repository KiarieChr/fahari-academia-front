import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, ChevronLeft, Save, CheckCircle2, User, BookOpen, 
    Users, Check, X, Phone, Mail, Sparkles, Building, Globe, MapPin, 
    Calendar, AlertTriangle, Upload, Trash2, Camera, UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { studentManagementService } from '../../../../services/studentManagementService';
import { institutionService } from '../../../../services/institutionService';
import DateInput from '../../../../components/common/DateInput';

const CREATE_STEPS = [
    { id: 1, title: 'Personal', label: 'Basic Info', icon: User },
    { id: 2, title: 'Academic', label: 'Placement details', icon: BookOpen },
    { id: 3, title: 'Guardian', label: 'Contact details', icon: Users },
    { id: 4, title: 'Review', label: 'Confirm & Submit', icon: Check }
];

const NewApplicantForm = ({ onClose }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [step, setStep] = useState(1);
    const [showGuardian2, setShowGuardian2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [enquiries, setEnquiries] = useState([]);
    const [passportPhotoPreview, setPassportPhotoPreview] = useState(null);

    const [options, setOptions] = useState({
        intakes: [],
        curriculums: [],
        classes: [],
        campuses: []
    });

    const [formData, setFormData] = useState({
        selectedEnquiryId: '',
        firstName: '', lastName: '', gender: 'Male', dob: '',
        class: '', curriculum: '', intake: '', campus: '',
        prevSchool: '', score: '', isTransfer: false,
        passportPhoto: null,
        guardianName: '', phone: '', email: '',
        guardian2Name: '', guardian2Phone: '', guardian2Email: '',
        source: 'Walk-in', remarks: ''
    });

    // Fetch form options on load
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [intakes, curriculums, classes, campusesRes, enquiriesRes] = await Promise.all([
                    studentManagementService.getIntakes(),
                    studentManagementService.getCurriculums(),
                    studentManagementService.getGrades(),
                    institutionService.getCampuses(),
                    studentManagementService.getEnquiries()
                ]);
                setOptions({
                    intakes: intakes.results || intakes,
                    curriculums: curriculums.results || curriculums,
                    classes: classes.results || classes,
                    campuses: campusesRes.results || campusesRes || []
                });

                const enqList = enquiriesRes.data || enquiriesRes || [];
                const activeEnquiries = (Array.isArray(enqList) ? enqList : enqList.results || [])
                    .filter(e => e.status === 'new' || e.status === 'contacted');
                setEnquiries(activeEnquiries);
            } catch (error) {
                console.error("Error fetching options:", error);
                toast.error("Failed to load form options");
            }
        };
        fetchOptions();
    }, []);

    const handleImportEnquiry = (enquiryId) => {
        if (!enquiryId) {
            setFormData(prev => ({
                ...prev,
                selectedEnquiryId: '',
                firstName: '', lastName: '',
                guardianName: '', phone: '', email: '',
                intake: '', curriculum: '', class: '', campus: '',
                source: 'Walk-in', remarks: ''
            }));
            return;
        }

        const enquiry = enquiries.find(e => Number(e.id) === Number(enquiryId));
        if (!enquiry) return;

        const childName = enquiry.child_name || '';
        let first = '';
        let last = '';
        if (childName.trim()) {
            const parts = childName.split(' ');
            first = parts[0] || '';
            last = parts.slice(1).join(' ') || '';
        } else {
            const parts = (enquiry.full_name || '').split(' ');
            first = parts[0] || '';
            last = parts.slice(1).join(' ') || '';
        }

        setFormData(prev => ({
            ...prev,
            selectedEnquiryId: String(enquiry.id),
            firstName: first,
            lastName: last,
            guardianName: enquiry.full_name || '',
            phone: enquiry.phone_number || '',
            email: enquiry.email || '',
            intake: enquiry.intake ? String(enquiry.intake) : '',
            curriculum: enquiry.curriculum ? String(enquiry.curriculum) : '',
            class: enquiry.grade ? String(enquiry.grade) : '',
            campus: enquiry.campus ? String(enquiry.campus) : '',
            source: enquiry.source_display || 'Referral',
            remarks: enquiry.message || ''
        }));
        toast.info(`Pre-filled applicant form from enquiry: "${enquiry.full_name}"`);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const applyIntakeDefaults = (intakeId) => {
        const intake = options.intakes.find(i => Number(i.id) === Number(intakeId));
        if (!intake?.entry_grade) return;

        const entryGrade = options.classes.find(c => Number(c.id) === Number(intake.entry_grade));
        if (!entryGrade) return;

        setFormData(prev => ({
            ...prev,
            class: String(entryGrade.id),
            curriculum: entryGrade.curriculum ? String(entryGrade.curriculum) : ''
        }));
        
        setErrors(prev => ({ ...prev, class: null, curriculum: null }));
    };

    const handleIntakeChange = (e) => {
        const intakeValue = e.target.value;
        setFormData(prev => ({ ...prev, intake: intakeValue }));
        if (errors.intake) {
            setErrors(prev => ({ ...prev, intake: null }));
        }
        if (!formData.isTransfer) {
            applyIntakeDefaults(intakeValue);
        }
    };

    const handleTransferToggle = () => {
        setFormData(prev => {
            const nextTransfer = !prev.isTransfer;
            const next = { ...prev, isTransfer: nextTransfer };

            if (!nextTransfer && next.intake) {
                const intake = options.intakes.find(i => Number(i.id) === Number(next.intake));
                const entryGrade = intake?.entry_grade
                    ? options.classes.find(c => Number(c.id) === Number(intake.entry_grade))
                    : null;
                if (entryGrade) {
                    next.class = String(entryGrade.id);
                    next.curriculum = entryGrade.curriculum ? String(entryGrade.curriculum) : '';
                }
            }
            return next;
        });
    };

    const handlePassportChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Passport photo must be an image file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Passport photo must be 5MB or less.');
            return;
        }

        setFormData(prev => ({ ...prev, passportPhoto: file }));
        setPassportPhotoPreview(URL.createObjectURL(file));
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const validateStep = (currentStep) => {
        const newErrors = {};

        if (currentStep === 1) {
            if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
            if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
            if (!formData.dob) newErrors.dob = 'Date of birth is required';
        }

        if (currentStep === 2) {
            if (!formData.intake) newErrors.intake = 'Target intake is required';
            if (!formData.class) newErrors.class = 'Target grade is required';
            if (!formData.curriculum) newErrors.curriculum = 'Curriculum is required';
        }

        if (currentStep === 3) {
            if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian name is required';
            if (!formData.phone.trim()) newErrors.phone = 'Guardian contact number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(s => Math.min(s + 1, 4));
        } else {
            toast.error('Please resolve missing required fields before proceeding');
        }
    };

    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        if (!validateStep(3) || !validateStep(2) || !validateStep(1)) {
            toast.error('Please fill in all required fields accurately.');
            return;
        }

        setLoading(true);
        try {
            const selectedGrade = options.classes.find(c => c.id == formData.class);

            const payload = new FormData();
            payload.append('first_name', formData.firstName || '');
            payload.append('last_name', formData.lastName || '');
            payload.append('date_of_birth', formData.dob || '');
            payload.append('gender', formData.gender === 'Male' ? 'M' : 'F');
            payload.append('intake', formData.intake || '');
            payload.append('applying_for_curriculum', formData.curriculum || '');
            payload.append('applying_for_grade', formData.class || '');
            
            if (selectedGrade?.curriculum_level) {
                payload.append('applying_for_level', selectedGrade.curriculum_level);
            }
            if (formData.campus) payload.append('campus', formData.campus);
            payload.append('previous_school', formData.prevSchool || '');
            payload.append('score', formData.score || '');
            payload.append('is_transfer', String(Boolean(formData.isTransfer)));
            payload.append('guardian_name', formData.guardianName || '');
            payload.append('phone_number', formData.phone || '');
            payload.append('email', formData.email || '');
            const mapReferralSource = (source) => {
                if (!source) return 'other';
                const src = source.toLowerCase().trim();
                if (src.includes('walk') || src.includes('walk-in') || src.includes('walk_in')) return 'walk_in';
                if (src.includes('online') || src.includes('ad') || src.includes('web')) return 'online';
                if (src.includes('referral')) return 'referral';
                if (src.includes('advertisement')) return 'advertisement';
                return 'other';
            };
            payload.append('referral_source', mapReferralSource(formData.source));
            payload.append('remarks', formData.remarks || '');
            
            if (formData.passportPhoto) {
                payload.append('passport_photo', formData.passportPhoto);
            }

            const res = await studentManagementService.createApplication(payload);
            const newAppId = res?.data?.id || res?.id;

            if (formData.selectedEnquiryId && newAppId) {
                try {
                    await studentManagementService.convertEnquiry(formData.selectedEnquiryId, {
                        existing_application_id: newAppId
                    });
                } catch (linkErr) {
                    console.error("Failed to link and convert imported enquiry", linkErr);
                }
            }

            toast.success('Application submitted successfully!');
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit application. Please verify parameters.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-2.5 border rounded-xl outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 font-medium shadow-sm text-sm";

    return (
        <AnimatePresence onExitComplete={onClose}>
            {isOpen && (
                <div className="fixed inset-0 z-[8000] flex justify-end overflow-hidden">
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[7999] bg-slate-950/40 backdrop-blur-[2px] cursor-pointer"
                    />

                    {/* Drawer Side Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        style={{ 
                            background: 'var(--card-bg)', 
                            borderColor: 'var(--border-color-light)' 
                        }}
                        className="relative z-[8000] h-full w-full max-w-[500px] md:max-w-[580px] border-l shadow-[0_0_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden text-left"
                    >
                        {/* 1. Header (Sticky) */}
                        <div 
                            style={{ borderColor: 'var(--border-color-light)' }} 
                            className="p-5 border-b flex flex-col gap-4 sticky top-0 z-25 bg-[inherit]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600"
                                            style={{
                                                background: 'var(--primary-light)',
                                                color: 'var(--primary-color)'
                                            }}
                                        >
                                            Registration
                                        </span>
                                        <span 
                                            className="text-[9px] font-bold uppercase tracking-widest"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            Admissions portal
                                        </span>
                                    </div>
                                    <h3 
                                        style={{ color: 'var(--text-main)' }} 
                                        className="text-lg font-black tracking-tight"
                                    >
                                        Register New Applicant
                                    </h3>
                                </div>
                                <button 
                                    onClick={handleClose}
                                    style={{ color: 'var(--text-muted)' }}
                                    className="p-2 rounded-xl hover:bg-[var(--bg-light)] hover:text-[var(--text-main)] transition-all cursor-pointer animate-in fade-in"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Steps indicators Ribbon */}
                            <div className="flex justify-between items-center relative px-2.5 mt-2">
                                {CREATE_STEPS.map((s) => {
                                    const Icon = s.icon;
                                    const isCompleted = step > s.id;
                                    const isActive = step === s.id;
                                    
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                if (s.id < step) setStep(s.id);
                                            }}
                                            className={`flex flex-col items-center flex-1 z-10 focus:outline-none transition-transform active:scale-95 ${s.id < step ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <div
                                                style={{
                                                    background: isActive ? 'var(--primary-color)' : isCompleted ? 'var(--primary-light)' : 'var(--card-bg)',
                                                    borderColor: isActive ? 'var(--primary-color)' : isCompleted ? 'var(--primary-color)' : 'var(--border-color-light)',
                                                    color: isActive ? '#fff' : isCompleted ? 'var(--primary-color)' : 'var(--text-muted)',
                                                    boxShadow: isActive ? '0 0 0 3px var(--primary-light, rgba(79, 70, 229, 0.15))' : 'none'
                                                }}
                                                className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 mb-1"
                                            >
                                                {isCompleted ? <Check size={14} className="stroke-[3]" /> : <Icon size={13} />}
                                            </div>
                                            <span 
                                                style={{ 
                                                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                                    fontWeight: isActive ? '900' : '500'
                                                }}
                                                className="text-[9px] uppercase tracking-wider"
                                            >
                                                {s.title}
                                            </span>
                                        </button>
                                    );
                                })}

                                {/* Connection Lines */}
                                <div 
                                    style={{ background: 'var(--border-color-light)' }}
                                    className="absolute top-4 left-7 right-7 h-0.5 -z-10"
                                />
                                <div
                                    style={{ 
                                        width: `${((step - 1) / (CREATE_STEPS.length - 1)) * (100 - 15)}%`,
                                        background: 'var(--primary-color)'
                                    }}
                                    className="absolute top-4 left-7 h-0.5 -z-10 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* 2. Scrollable Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
                            
                            {/* Step 1: Personal Details */}
                            {step === 1 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                                        <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                            <User size={15} style={{ color: 'var(--primary-color)' }} /> Student Information
                                        </h4>
                                        <p className="text-xs mt-0.5 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                            Enter the student's legal name, gender identity, and date of birth.
                                        </p>
                                    </div>

                                    {enquiries.length > 0 && (
                                        <div className="p-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300" style={{ borderColor: 'var(--primary-light)', background: 'rgba(99, 102, 241, 0.03)' }}>
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-1.5">Import from Enquiry Pipeline (Optional)</label>
                                            <select
                                                value={formData.selectedEnquiryId}
                                                onChange={(e) => handleImportEnquiry(e.target.value)}
                                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                                className="w-full px-3 py-2 text-xs font-bold border rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">-- Choose Enquiry to Pre-fill Form --</option>
                                                {enquiries.map(e => (
                                                    <option key={e.id} value={e.id}>
                                                        {e.full_name} {e.child_name ? `(Child: ${e.child_name})` : ''} - {e.grade_name || 'Any Grade'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>First Name <span className="text-red-500">*</span></label>
                                            <input 
                                                name="firstName" 
                                                value={formData.firstName} 
                                                onChange={handleChange} 
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: errors.firstName ? '#f43f5e' : 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }} 
                                                className={inputClasses} 
                                                placeholder="Jane" 
                                            />
                                            {errors.firstName && <p className="text-[10px] text-rose-500 mt-1">{errors.firstName}</p>}
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Last Name <span className="text-red-500">*</span></label>
                                            <input 
                                                name="lastName" 
                                                value={formData.lastName} 
                                                onChange={handleChange} 
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: errors.lastName ? '#f43f5e' : 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }} 
                                                className={inputClasses} 
                                                placeholder="Doe" 
                                            />
                                            {errors.lastName && <p className="text-[10px] text-rose-500 mt-1">{errors.lastName}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Gender <span className="text-red-500">*</span></label>
                                            <select 
                                                name="gender" 
                                                value={formData.gender} 
                                                onChange={handleChange} 
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }} 
                                                className={`${inputClasses} cursor-pointer`}
                                            >
                                                <option value="Male" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Male</option>
                                                <option value="Female" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Female</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Date of Birth <span className="text-red-500">*</span></label>
                                            <DateInput
                                                value={formData.dob}
                                                onChange={(dateStr) => {
                                                    setFormData(prev => ({ ...prev, dob: dateStr }));
                                                    setErrors(prev => ({ ...prev, dob: null }));
                                                }}
                                                placeholder="Select DOB"
                                                maxDate={new Date()}
                                                className={`${inputClasses}`}
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: errors.dob ? '#f43f5e' : 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }}
                                            />
                                            {errors.dob && <p className="text-[10px] text-rose-500 mt-1">{errors.dob}</p>}
                                        </div>

                                        <div className="col-span-2 border-t pt-4" style={{ borderColor: 'var(--border-color-light)' }}>
                                            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Passport Photo</label>
                                            <div 
                                                style={{ 
                                                    background: 'var(--bg-light)', 
                                                    borderColor: 'var(--border-color-light)' 
                                                }}
                                                className="border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 group hover:opacity-95 transition-all relative overflow-hidden"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePassportChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                                <div 
                                                    style={{ background: 'var(--card-bg)', color: 'var(--primary-color)' }}
                                                    className="w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm"
                                                >
                                                    <Camera size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-main)' }}>Click to upload student image</p>
                                                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Support PNG, JPG up to 5MB</p>
                                                </div>
                                            </div>
                                            
                                            {formData.passportPhoto && (
                                                <div 
                                                    style={{ background: 'rgba(16, 185, 129, 0.06)', borderColor: 'rgba(16, 185, 129, 0.15)' }}
                                                    className="mt-3 p-3 rounded-xl border flex items-center justify-between gap-2 animate-in fade-in"
                                                >
                                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                                        <CheckCircle2 size={13} /> {formData.passportPhoto.name}
                                                    </span>
                                                    <button 
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, passportPhoto: null }));
                                                            setPassportPhotoPreview(null);
                                                        }}
                                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Academic placement */}
                            {step === 2 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                                        <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                            <BookOpen size={15} style={{ color: 'var(--primary-color)' }} /> Academic Intent
                                        </h4>
                                        <p className="text-xs mt-0.5 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                            Configure target intakes, curricular placement, and previous school history.
                                        </p>
                                    </div>

                                    {/* Transfer Student slider card */}
                                    <div 
                                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }} 
                                        className="p-4 rounded-2xl border shadow-sm flex items-center gap-4 hover:opacity-95 transition-all cursor-pointer select-none" 
                                        onClick={handleTransferToggle}
                                    >
                                        <div 
                                            style={{ 
                                                background: formData.isTransfer ? 'var(--primary-color)' : 'var(--border-color-light)' 
                                            }}
                                            className="w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center justify-start"
                                        >
                                            <div 
                                                style={{ transform: formData.isTransfer ? 'translateX(24px)' : 'none' }}
                                                className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300"
                                            />
                                        </div>
                                        <div>
                                            <span className="font-bold text-xs block" style={{ color: 'var(--text-main)' }}>Transfer Student</span>
                                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Is this applicant enrolling mid-stream from another school?</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Target Intake <span className="text-red-500">*</span></label>
                                            <select 
                                                name="intake" 
                                                value={formData.intake} 
                                                onChange={handleIntakeChange} 
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: errors.intake ? '#f43f5e' : 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }} 
                                                className={`${inputClasses} cursor-pointer`}
                                            >
                                                <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Intake...</option>
                                                {options.intakes.map(intake => (
                                                    <option key={intake.id} value={intake.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{intake.name}</option>
                                                ))}
                                            </select>
                                            {errors.intake && <p className="text-[10px] text-rose-500 mt-1">{errors.intake}</p>}
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Campus</label>
                                            <select 
                                                name="campus" 
                                                value={formData.campus} 
                                                onChange={handleChange} 
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }} 
                                                className={`${inputClasses} cursor-pointer`}
                                            >
                                                <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Campus...</option>
                                                {options.campuses.map(campus => (
                                                    <option key={campus.id} value={campus.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{campus.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Curriculum <span className="text-red-500">*</span></label>
                                            <select
                                                name="curriculum"
                                                value={formData.curriculum}
                                                onChange={handleChange}
                                                disabled={!formData.isTransfer}
                                                style={{ 
                                                    background: !formData.isTransfer ? 'var(--bg-light)' : 'var(--card-bg)', 
                                                    borderColor: errors.curriculum ? '#f43f5e' : 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }}
                                                className={`${inputClasses} ${!formData.isTransfer ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                                            >
                                                <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Curriculum...</option>
                                                {options.curriculums.map(curr => (
                                                    <option key={curr.id} value={curr.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{curr.name}</option>
                                                ))}
                                            </select>
                                            {errors.curriculum && <p className="text-[10px] text-rose-500 mt-1">{errors.curriculum}</p>}
                                            {!formData.isTransfer && (
                                                <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>Auto-selected from target intake defaults.</p>
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Applying For Class <span className="text-red-500">*</span></label>
                                            <select
                                                name="class"
                                                value={formData.class}
                                                onChange={handleChange}
                                                disabled={!formData.isTransfer}
                                                style={{ 
                                                    background: !formData.isTransfer ? 'var(--bg-light)' : 'var(--card-bg)', 
                                                    borderColor: errors.class ? '#f43f5e' : 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }}
                                                className={`${inputClasses} ${!formData.isTransfer ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                                            >
                                                <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Class...</option>
                                                {options.classes
                                                    .filter(c => !formData.curriculum || c.curriculum == formData.curriculum)
                                                    .map(cls => (
                                                        <option key={cls.id} value={cls.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{cls.name}</option>
                                                    ))}
                                            </select>
                                            {errors.class && <p className="text-[10px] text-rose-500 mt-1">{errors.class}</p>}
                                        </div>

                                        <div className="col-span-2 border-t pt-4" style={{ borderColor: 'var(--border-color-light)' }} />

                                        <div>
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Previous School</label>
                                            <input 
                                                name="prevSchool" 
                                                value={formData.prevSchool} 
                                                onChange={handleChange} 
                                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }} 
                                                className={inputClasses} 
                                                placeholder="Prior school name" 
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Prior Assessment Score</label>
                                            <input 
                                                name="score" 
                                                value={formData.score} 
                                                onChange={handleChange} 
                                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }} 
                                                className={inputClasses} 
                                                placeholder="e.g. 380 Marks" 
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Guardian Details */}
                            {step === 3 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                                        <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                            <Users size={15} style={{ color: 'var(--primary-color)' }} /> Family Contact details
                                        </h4>
                                        <p className="text-xs mt-0.5 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                            Register primary and secondary contact details for parent user assignment.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Primary Guardian Name <span className="text-red-500">*</span></label>
                                            <input 
                                                name="guardianName" 
                                                value={formData.guardianName} 
                                                onChange={handleChange} 
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: errors.guardianName ? '#f43f5e' : 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }} 
                                                className={inputClasses} 
                                                placeholder="Full Parent Name" 
                                            />
                                            {errors.guardianName && <p className="text-[10px] text-rose-500 mt-1">{errors.guardianName}</p>}
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Phone Number <span className="text-red-500">*</span></label>
                                            <input 
                                                name="phone" 
                                                value={formData.phone} 
                                                onChange={handleChange} 
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: errors.phone ? '#f43f5e' : 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }} 
                                                className={inputClasses} 
                                                placeholder="+254..." 
                                            />
                                            {errors.phone && <p className="text-[10px] text-rose-500 mt-1">{errors.phone}</p>}
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Email Address</label>
                                            <input 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange} 
                                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }} 
                                                className={inputClasses} 
                                                placeholder="parent@example.com" 
                                            />
                                        </div>

                                        <div className="col-span-2 border-t pt-2" style={{ borderColor: 'var(--border-color-light)' }}>
                                            <button
                                                type="button"
                                                onClick={() => setShowGuardian2(!showGuardian2)}
                                                className="hover:opacity-85 font-black text-xs flex items-center gap-1.5 transition-all bg-transparent border-0 cursor-pointer p-1"
                                                style={{ color: 'var(--primary-color)' }}
                                            >
                                                {showGuardian2 ? '− Remove Second Guardian' : '+ Add Second Parent / Guardian'}
                                            </button>
                                        </div>

                                        {showGuardian2 && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }} 
                                                className="col-span-2 p-4 rounded-xl border space-y-4"
                                            >
                                                <div>
                                                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Second Guardian Name</label>
                                                    <input 
                                                        name="guardian2Name" 
                                                        value={formData.guardian2Name} 
                                                        onChange={handleChange} 
                                                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }} 
                                                        className={inputClasses} 
                                                        placeholder="Full Name" 
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Phone Number</label>
                                                        <input 
                                                            name="guardian2Phone" 
                                                            value={formData.guardian2Phone} 
                                                            onChange={handleChange} 
                                                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }} 
                                                            className={inputClasses} 
                                                            placeholder="+254..." 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Email Address</label>
                                                        <input 
                                                            name="guardian2Email" 
                                                            value={formData.guardian2Email} 
                                                            onChange={handleChange} 
                                                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }} 
                                                            className={inputClasses} 
                                                            placeholder="parent2@example.com" 
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="col-span-2 border-t pt-4" style={{ borderColor: 'var(--border-color-light)' }}>
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Referral Source</label>
                                            <select 
                                                name="source" 
                                                value={formData.source} 
                                                onChange={handleChange} 
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: 'var(--border-color-light)', 
                                                    color: 'var(--text-main)' 
                                                }} 
                                                className={`${inputClasses} cursor-pointer`}
                                            >
                                                <option value="Walk-in" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Walk-in</option>
                                                <option value="Online Ad" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Online Ad</option>
                                                <option value="Referral" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Referral</option>
                                                <option value="Other" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Other</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>Review Notes / Remarks</label>
                                            <textarea 
                                                name="remarks"
                                                value={formData.remarks}
                                                onChange={handleChange}
                                                rows={2}
                                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                                className={`${inputClasses} min-h-[70px] resize-none`}
                                                placeholder="Add registration notes..."
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Review Application */}
                            {step === 4 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5"
                                >
                                    {/* Sleek Premium Glassmorphic Alert Banner */}
                                    <div 
                                        className="p-4 rounded-2xl border flex items-start gap-3 shadow-[0_2px_12px_rgba(99,102,241,0.04)] animate-in fade-in"
                                        style={{ 
                                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%)', 
                                            borderColor: 'rgba(99, 102, 241, 0.15)' 
                                        }}
                                    >
                                        <div className="p-2 rounded-xl shrink-0" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                                            <Sparkles size={16} className="animate-pulse" />
                                        </div>
                                        <div className="space-y-0.5">
                                             <h4 className="text-[10px] font-black uppercase tracking-wider text-left m-0" style={{ color: 'var(--primary-color)' }}>
                                                 Final Review
                                             </h4>
                                             <p className="text-[11px] leading-relaxed m-0 text-left" style={{ color: 'var(--text-secondary)' }}>
                                                 Please verify the student placement profile and contact details before submitting this formal application.
                                             </p>
                                        </div>
                                    </div>

                                    {/* 1. Student Profile Card */}
                                    <div 
                                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }} 
                                        className="border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Passport Photo Preview or Initials Avatar */}
                                            {passportPhotoPreview ? (
                                                <div className="relative group shrink-0">
                                                    <img 
                                                        src={passportPhotoPreview} 
                                                        alt="Preview" 
                                                        className="w-16 h-16 rounded-2xl object-cover border-2 shadow-inner"
                                                        style={{ borderColor: 'var(--primary-color)' }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/10 rounded-2xl" />
                                                </div>
                                            ) : (
                                                <div 
                                                    style={{ 
                                                        background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(99, 102, 241, 0.05) 100%)',
                                                        borderColor: 'var(--border-color-light)',
                                                        color: 'var(--primary-color)'
                                                    }}
                                                    className="w-16 h-16 rounded-2xl border flex items-center justify-center font-black text-lg tracking-wider shrink-0 shadow-sm animate-in fade-in"
                                                >
                                                    {((formData.firstName?.[0] || '') + (formData.lastName?.[0] || '')).toUpperCase() || 'NA'}
                                                </div>
                                            )}

                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block text-left">Student Profile</span>
                                                <h4 className="text-base font-black tracking-tight text-left" style={{ color: 'var(--text-main)' }}>
                                                    {formData.firstName} {formData.lastName}
                                                </h4>
                                                
                                                {/* Custom Gender and DOB Badges */}
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span 
                                                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border rounded-lg shadow-sm"
                                                    >
                                                        <User size={11} className="text-indigo-500" />
                                                        {formData.gender}
                                                    </span>
                                                    {formData.dob && (
                                                         <span 
                                                             style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                             className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border rounded-lg shadow-sm"
                                                         >
                                                             <Calendar size={11} className="text-emerald-500" />
                                                             {formData.dob}
                                                         </span>
                                                     )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Target Placement Card */}
                                    <div 
                                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }} 
                                        className="border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow text-left"
                                    >
                                         <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color-light)' }}>
                                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Placement Details</span>
                                             <BookOpen size={14} className="text-indigo-500" />
                                         </div>
                                         
                                         <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                             <div>
                                                 <span className="text-[10px] text-slate-400 block mb-1 text-left">Applying Grade</span>
                                                 <div className="flex items-center gap-2">
                                                     <span 
                                                         className="font-bold px-2.5 py-1 rounded-lg border text-[10px] shadow-sm" 
                                                         style={{ 
                                                             color: 'var(--primary-color)', 
                                                             background: 'var(--card-bg)', 
                                                             borderColor: 'var(--border-color-light)' 
                                                         }}
                                                     >
                                                         {options.classes.find(c => c.id == formData.class)?.name || 'Class: ' + formData.class}
                                                     </span>
                                                     {formData.isTransfer && (
                                                         <span className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-lg font-black uppercase tracking-wide">
                                                             Transfer
                                                         </span>
                                                     )}
                                                 </div>
                                             </div>

                                             <div>
                                                 <span className="text-[10px] text-slate-400 block mb-1 text-left">Curriculum</span>
                                                 <span className="text-xs font-bold text-left block" style={{ color: 'var(--text-main)' }}>
                                                     {options.curriculums.find(c => c.id == formData.curriculum)?.name || 'N/A'}
                                                 </span>
                                             </div>

                                             <div>
                                                 <span className="text-[10px] text-slate-400 block mb-1 text-left">Target Intake</span>
                                                 <span className="text-xs font-bold text-left block" style={{ color: 'var(--text-main)' }}>
                                                     {options.intakes.find(i => i.id == formData.intake)?.name || 'N/A'}
                                                 </span>
                                             </div>

                                             {formData.campus && (
                                                 <div>
                                                     <span className="text-[10px] text-slate-400 block mb-1 text-left">Campus Placement</span>
                                                     <span className="text-xs font-bold flex items-center gap-1 text-left" style={{ color: 'var(--text-main)' }}>
                                                         <Building size={11} className="text-indigo-400" />
                                                         {options.campuses.find(c => c.id == formData.campus)?.name || 'N/A'}
                                                     </span>
                                                 </div>
                                             )}
                                         </div>
                                    </div>

                                    {/* 3. Primary Contact & Guardian Card */}
                                    <div 
                                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }} 
                                        className="border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow text-left"
                                    >
                                         <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color-light)' }}>
                                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Parent / Guardian Contacts</span>
                                             <Users size={14} className="text-indigo-500" />
                                         </div>

                                         <div className="space-y-4">
                                             {/* Primary Guardian */}
                                             <div className="space-y-1.5">
                                                 <span className="text-[10px] text-slate-400 block text-left">Primary Parent / Guardian</span>
                                                 <p className="font-extrabold text-xs m-0 text-left" style={{ color: 'var(--text-main)' }}>
                                                     {formData.guardianName}
                                                 </p>
                                                 
                                                 <div className="flex flex-wrap gap-2 mt-1">
                                                     <a 
                                                         href={`tel:${formData.phone}`}
                                                         style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                         className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border rounded-lg shadow-sm hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                                                     >
                                                         <Phone size={10} className="text-indigo-500" />
                                                         {formData.phone}
                                                     </a>
                                                     {formData.email && (
                                                         <a 
                                                             href={`mailto:${formData.email}`}
                                                             style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                             className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border rounded-lg shadow-sm hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                                                         >
                                                             <Mail size={10} className="text-indigo-500" />
                                                             {formData.email}
                                                         </a>
                                                     )}
                                                 </div>
                                             </div>

                                             {/* Second Guardian (only if filled) */}
                                             {showGuardian2 && formData.guardian2Name && (
                                                 <div className="border-t pt-3 mt-3 space-y-1.5" style={{ borderColor: 'var(--border-color-light)' }}>
                                                     <span className="text-[10px] text-slate-400 block text-left">Secondary Parent / Guardian</span>
                                                     <p className="font-extrabold text-xs m-0 text-left" style={{ color: 'var(--text-main)' }}>
                                                         {formData.guardian2Name}
                                                     </p>
                                                     
                                                     <div className="flex flex-wrap gap-2 mt-1">
                                                         {formData.guardian2Phone && (
                                                             <a 
                                                                 href={`tel:${formData.guardian2Phone}`}
                                                                 style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                                 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border rounded-lg shadow-sm hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                                                             >
                                                                 <Phone size={10} className="text-indigo-500" />
                                                                 {formData.guardian2Phone}
                                                             </a>
                                                         )}
                                                         {formData.guardian2Email && (
                                                             <a 
                                                                 href={`mailto:${formData.guardian2Email}`}
                                                                 style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                                 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border rounded-lg shadow-sm hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                                                             >
                                                                 <Mail size={10} className="text-indigo-500" />
                                                                 {formData.guardian2Email}
                                                             </a>
                                                         )}
                                                     </div>
                                                 </div>
                                             )}
                                         </div>
                                    </div>

                                    {/* 4. Terms Authorization Info Box */}
                                    <div 
                                         style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }} 
                                         className="p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed text-left"
                                    >
                                         <div className="shrink-0 mt-0.5 text-indigo-500">
                                             <CheckCircle2 size={16} />
                                         </div>
                                         <p className="mb-0 leading-relaxed font-semibold text-left" style={{ color: 'var(--text-secondary)' }}>
                                             By submitting this application, you authorize creation of the applicant profile under review.
                                         </p>
                                    </div>
                                </motion.div>
                            )}

                        </div>

                        {/* 3. Sticky Drawer Footer */}
                        <div 
                            style={{ 
                                borderColor: 'var(--border-color-light)',
                                background: 'var(--bg-light)'
                            }} 
                            className="p-5 border-t flex items-center justify-between gap-4 sticky bottom-0 z-25 bg-[inherit]"
                        >
                            {/* Steps navigation arrows */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleBack}
                                    disabled={step === 1}
                                    style={{ borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                    className="p-2.5 border rounded-xl hover:bg-[var(--card-bg)] disabled:opacity-40 transition-all cursor-pointer bg-[var(--card-bg)]"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                <button
                                    onClick={handleNext}
                                    disabled={step === 4}
                                    style={{ borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                    className="p-2.5 border rounded-xl hover:bg-[var(--card-bg)] disabled:opacity-40 transition-all cursor-pointer bg-[var(--card-bg)]"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* CTAs */}
                            <div>
                                {step < 4 ? (
                                    <button
                                        onClick={handleNext}
                                        style={{ background: 'var(--primary-color)' }}
                                        className="px-5 py-2.5 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer hover:opacity-90 active:scale-95"
                                    >
                                        Next Step
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        style={{ background: 'var(--primary-color)' }}
                                        className="px-5 py-2.5 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {loading ? (
                                            <>Registering...</>
                                        ) : (
                                            <><Save size={14} /> Submit Application</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NewApplicantForm;
