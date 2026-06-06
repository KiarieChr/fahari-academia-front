import React, { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronLeft, Save, CheckCircle2, User, Users,
    Building2, Heart, FileText, ClipboardCheck, Upload, X, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { studentManagementService } from '../../../../services/studentManagementService';
import { institutionService } from '../../../../services/institutionService';
import studentSettingsService from '../../../../services/studentSettingsService';
import DateInput from '../../../../components/common/DateInput';
import Modal from '../../../../components/common/Modal';

const STEPS = [
    { id: 1, title: 'Student Info', description: 'Personal details', icon: User },
    { id: 2, title: 'Parent/Guardian', description: 'Contact info', icon: Users },
    { id: 3, title: 'Previous School', description: 'Academic history', icon: Building2 },
    { id: 4, title: 'Medical Info', description: 'Health details', icon: Heart },
    { id: 5, title: 'Documents', description: 'Upload files', icon: FileText },
    { id: 6, title: 'Review & Submit', description: 'Confirm details', icon: ClipboardCheck }
];

const KENYAN_COUNTIES = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
    'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
    'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a',
    'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu',
    'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana',
    'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

const RELIGIONS = [
    { value: 'christian', label: 'Christian' },
    { value: 'muslim', label: 'Muslim' },
    { value: 'hindu', label: 'Hindu' },
    { value: 'traditional', label: 'African Traditional' },
    { value: 'other', label: 'Other' },
    { value: 'none', label: 'None' }
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const GUARDIAN_RELATIONSHIPS = [
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'other', label: 'Other' }
];

const InputField = ({ label, required, error, children }) => (
    <div className="space-y-1.5 w-full">
        <label className="block text-sm font-bold" style={{ color: 'var(--text-main)' }}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1 mb-0">{error}</p>}
    </div>
);

const inputClasses = "w-full px-4 py-3 border rounded-xl outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 font-medium shadow-sm";

const KenyanAdmissionForm = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [options, setOptions] = useState({
        intakes: [],
        curriculums: [],
        classes: [],
        campuses: []
    });

    const [formData, setFormData] = useState({
        // Step 1: Student Information
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        dob: '',
        birthCertificateNumber: '',
        nationality: 'Kenyan',
        religion: '',
        homeAddress: '',
        county: '',
        subCounty: '',

        // Academic Info
        intake: '',
        curriculum: '',
        applyingForGrade: '',
        campus: '',
        isTransfer: false,

        // Step 2: Parent/Guardian Information
        guardianName: '',
        guardianRelationship: '',
        guardianIdNumber: '',
        guardianOccupation: '',
        guardianPhone: '',
        guardianEmail: '',
        guardianAddress: '',

        // Secondary Guardian
        guardian2Name: '',
        guardian2Relationship: '',
        guardian2Phone: '',
        guardian2Email: '',

        // Emergency Contact
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',

        // Step 3: Previous School
        previousSchoolName: '',
        previousSchoolAddress: '',
        previousSchoolContact: '',
        previousClass: '',
        previousSchoolLeavingDate: '',
        transferReason: '',
        assessmentScore: '',

        // Step 4: Medical Information
        medicalConditions: '',
        allergies: '',
        specialNeeds: '',
        bloodGroup: '',
        doctorName: '',
        doctorPhone: '',
        healthInsurance: '',

        // Step 5: Documents (file references)
        birthCertificate: null,
        passportPhoto: null,
        previousReportCard: null,
        transferLetter: null,
        medicalReport: null,

        // Additional
        referralSource: 'walk_in',
        remarks: ''
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [intakes, curriculums, classes, campusesRes, yearsRes] = await Promise.all([
                    studentManagementService.getIntakes(),
                    studentManagementService.getCurriculums(),
                    studentManagementService.getClasses(),
                    institutionService.getCampuses(),
                    studentSettingsService.getAcademicYears(),
                ]);
                setOptions({
                    intakes: intakes.results || intakes,
                    curriculums: curriculums.results || curriculums,
                    classes: classes.results || classes,
                    campuses: campusesRes.results || campusesRes || []
                });
                // Default intake to one from the current academic year
                const allIntakes = intakes.results || intakes || [];
                const allYears = yearsRes?.results || yearsRes || [];
                const currentYear = allYears.find(y => y.is_current);
                if (currentYear) {
                    const currentYearIntake = allIntakes.find(i => i.academic_year === currentYear.id);
                    if (currentYearIntake && !formData.intake) {
                        setFormData(prev => ({ ...prev, intake: currentYearIntake.id }));
                    }
                }
            } catch (error) {
                console.error("Error fetching options:", error);
                toast.error("Failed to load form options");
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const validateStep = (currentStep) => {
        const newErrors = {};

        if (currentStep === 1) {
            if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
            if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
            if (!formData.gender) newErrors.gender = 'Gender is required';
            if (!formData.dob) newErrors.dob = 'Date of birth is required';
            if (!formData.intake) newErrors.intake = 'Intake is required';
            if (!formData.curriculum) newErrors.curriculum = 'Curriculum is required';
            if (!formData.applyingForGrade) newErrors.applyingForGrade = 'Class is required';
        }

        if (currentStep === 2) {
            if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian name is required';
            if (!formData.guardianRelationship) newErrors.guardianRelationship = 'Relationship is required';
            if (!formData.guardianPhone.trim()) newErrors.guardianPhone = 'Phone number is required';
            if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact is required';
            if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency phone is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(s => Math.min(s + 1, 6));
        } else {
            toast.error('Please fill in all required fields');
        }
    };

    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const selectedGrade = options.classes.find(c => c.id == formData.applyingForGrade);

            // Build form data for file upload
            const submitData = new FormData();

            // Map frontend field names to backend field names
            submitData.append('first_name', formData.firstName);
            submitData.append('middle_name', formData.middleName || '');
            submitData.append('last_name', formData.lastName);
            submitData.append('gender', formData.gender);
            submitData.append('date_of_birth', formData.dob);
            submitData.append('birth_certificate_number', formData.birthCertificateNumber || '');
            submitData.append('nationality', formData.nationality);
            submitData.append('religion', formData.religion || '');
            submitData.append('home_address', formData.homeAddress || '');
            submitData.append('county', formData.county || '');
            submitData.append('sub_county', formData.subCounty || '');

            // Academic
            submitData.append('intake', formData.intake);
            submitData.append('applying_for_curriculum', formData.curriculum);
            submitData.append('applying_for_grade', formData.applyingForGrade);
            if (selectedGrade?.curriculum_level) {
                submitData.append('applying_for_level', selectedGrade.curriculum_level);
            }
            submitData.append('is_transfer', formData.isTransfer);
            if (formData.campus) {
                submitData.append('campus', formData.campus);
            }

            // Guardian
            submitData.append('guardian_name', formData.guardianName);
            submitData.append('guardian_relationship', formData.guardianRelationship);
            submitData.append('guardian_id_number', formData.guardianIdNumber || '');
            submitData.append('guardian_occupation', formData.guardianOccupation || '');
            submitData.append('phone_number', formData.guardianPhone);
            submitData.append('email', formData.guardianEmail || '');
            submitData.append('guardian_address', formData.guardianAddress || '');

            // Secondary Guardian
            submitData.append('guardian2_name', formData.guardian2Name || '');
            submitData.append('guardian2_relationship', formData.guardian2Relationship || '');
            submitData.append('guardian2_phone', formData.guardian2Phone || '');
            submitData.append('guardian2_email', formData.guardian2Email || '');

            // Emergency Contact
            submitData.append('emergency_contact_name', formData.emergencyContactName);
            submitData.append('emergency_contact_phone', formData.emergencyContactPhone);
            submitData.append('emergency_contact_relationship', formData.emergencyContactRelationship || '');

            // Previous School
            submitData.append('previous_school_name', formData.previousSchoolName || '');
            submitData.append('previous_school_address', formData.previousSchoolAddress || '');
            submitData.append('previous_school_contact', formData.previousSchoolContact || '');
            submitData.append('previous_class', formData.previousClass || '');
            if (formData.previousSchoolLeavingDate) {
                submitData.append('previous_school_leaving_date', formData.previousSchoolLeavingDate);
            }
            submitData.append('transfer_reason', formData.transferReason || '');
            submitData.append('assessment_score', formData.assessmentScore || '');

            // Medical
            submitData.append('medical_conditions', formData.medicalConditions || '');
            submitData.append('allergies', formData.allergies || '');
            submitData.append('special_needs', formData.specialNeeds || '');
            submitData.append('blood_group', formData.bloodGroup || '');
            submitData.append('doctor_name', formData.doctorName || '');
            submitData.append('doctor_phone', formData.doctorPhone || '');
            submitData.append('health_insurance', formData.healthInsurance || '');

            // Referral
            submitData.append('referral_source', formData.referralSource);

            // Files
            if (formData.birthCertificate) submitData.append('birth_certificate', formData.birthCertificate);
            if (formData.passportPhoto) submitData.append('passport_photo', formData.passportPhoto);
            if (formData.previousReportCard) submitData.append('previous_report_card', formData.previousReportCard);
            if (formData.transferLetter) submitData.append('transfer_letter', formData.transferLetter);
            if (formData.medicalReport) submitData.append('medical_report', formData.medicalReport);

            await studentManagementService.createApplication(submitData);
            toast.success('Application submitted successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit application. Please check all fields.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="mb-8 relative w-full">
            <div className="flex justify-between items-start relative z-10 px-2 w-full">
                {STEPS.map((s) => {
                    const Icon = s.icon;
                    const isActive = step >= s.id;
                    const isCurrent = step === s.id;
                    return (
                        <div
                            key={s.id}
                            className="flex flex-col items-center flex-1 cursor-pointer"
                            onClick={() => s.id < step && setStep(s.id)}
                        >
                            <div
                                style={{
                                    background: isActive ? 'var(--primary-color)' : 'var(--card-bg)',
                                    borderColor: isActive ? 'var(--primary-color)' : 'var(--border-color-light)',
                                    color: isActive ? '#fff' : 'var(--text-muted)',
                                    boxShadow: isCurrent ? '0 0 0 4px var(--primary-color-light, rgba(79, 70, 229, 0.15))' : 'none',
                                    transform: isCurrent ? 'scale(1.08)' : 'none'
                                }}
                                className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-2"
                            >
                                {step > s.id ? <CheckCircle2 size={22} /> : <Icon size={20} />}
                            </div>
                            <h4 
                                style={{ color: isCurrent ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                                className="text-xs font-bold mb-0.5 text-center"
                            >
                                {s.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 hidden lg:block text-center mb-0">{s.description}</p>
                        </div>
                    );
                })}
            </div>
            {/* Progress Bar Line */}
            <div 
                style={{ background: 'var(--border-color-light)' }}
                className="absolute top-6 left-6 right-6 h-0.5 -z-0"
            />
            <div
                style={{ 
                    width: `${((step - 1) / (STEPS.length - 1)) * (100 - 8)}%`,
                    background: 'var(--primary-color)'
                }}
                className="absolute top-6 left-6 h-0.5 -z-0 transition-all duration-500"
            />
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-main)' }}>Student Information</h3>
                <p className="text-sm mb-0" style={{ color: 'var(--text-secondary)' }}>Enter the student's personal and identification details.</p>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="First Name" required error={errors.firstName}>
                    <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: errors.firstName ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses}`}
                        placeholder="John"
                    />
                </InputField>
                <InputField label="Middle Name">
                    <input
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="Optional"
                    />
                </InputField>
                <InputField label="Last Name" required error={errors.lastName}>
                    <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: errors.lastName ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses}`}
                        placeholder="Doe"
                    />
                </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Gender" required error={errors.gender}>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: errors.gender ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses} cursor-pointer`}
                    >
                        <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Gender</option>
                        <option value="M" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Male</option>
                        <option value="F" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Female</option>
                    </select>
                </InputField>
                <InputField label="Date of Birth" required error={errors.dob}>
                    <DateInput
                        value={formData.dob}
                        onChange={(dateStr) => {
                            setFormData(prev => ({ ...prev, dob: dateStr }));
                            if (errors.dob) setErrors(prev => ({ ...prev, dob: null }));
                        }}
                        placeholder="Select DOB"
                        maxDate={new Date()}
                        className={`${inputClasses}`}
                        style={{ background: 'var(--card-bg)', borderColor: errors.dob ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                    />
                </InputField>
                <InputField label="Birth Certificate No.">
                    <input
                        name="birthCertificateNumber"
                        value={formData.birthCertificateNumber}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="e.g., 12345678"
                    />
                </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Nationality">
                    <input
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="Kenyan"
                    />
                </InputField>
                <InputField label="Religion">
                    <select
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses} cursor-pointer`}
                    >
                        <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Religion</option>
                        {RELIGIONS.map(r => (
                            <option key={r.value} value={r.value} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{r.label}</option>
                        ))}
                    </select>
                </InputField>
                <InputField label="County">
                    <select
                        name="county"
                        value={formData.county}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses} cursor-pointer`}
                    >
                        <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select County</option>
                        {KENYAN_COUNTIES.map(c => (
                            <option key={c} value={c} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{c}</option>
                        ))}
                    </select>
                </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Sub-County">
                    <input
                        name="subCounty"
                        value={formData.subCounty}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="Sub-county"
                    />
                </InputField>
                <InputField label="Home Address">
                    <input
                        name="homeAddress"
                        value={formData.homeAddress}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="Physical address"
                    />
                </InputField>
            </div>

            {/* Academic Placement */}
            <div className="border-t pt-6 mt-6 animate-in fade-in" style={{ borderColor: 'var(--border-color-light)' }}>
                <h4 className="text-md font-bold mb-4" style={{ color: 'var(--text-main)' }}>Academic Placement</h4>

                {/* Transfer Toggle */}
                <div
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                    className="mb-4 p-4 rounded-xl border shadow-sm flex items-center gap-4 hover:opacity-90 transition-all cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, isTransfer: !prev.isTransfer }))}
                >
                    <div 
                        style={{ background: formData.isTransfer ? 'var(--primary-color)' : 'var(--border-color-light)' }}
                        className="w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center justify-start"
                    >
                        <div 
                            style={{ transform: formData.isTransfer ? 'translateX(24px)' : 'none' }}
                            className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300"
                        />
                    </div>
                    <div>
                        <span className="font-bold block" style={{ color: 'var(--text-main)' }}>Transfer Student</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Is this student transferring from another school?</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InputField label="Target Intake" required error={errors.intake}>
                        <select
                            name="intake"
                            value={formData.intake}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: errors.intake ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses} cursor-pointer`}
                        >
                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Intake...</option>
                            {options.intakes.map(intake => (
                                <option key={intake.id} value={intake.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{intake.name}</option>
                            ))}
                        </select>
                    </InputField>
                    <InputField label="Curriculum" required error={errors.curriculum}>
                        <select
                            name="curriculum"
                            value={formData.curriculum}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: errors.curriculum ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses} cursor-pointer`}
                        >
                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Curriculum...</option>
                            {options.curriculums.map(curr => (
                                <option key={curr.id} value={curr.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{curr.name} ({curr.code})</option>
                            ))}
                        </select>
                    </InputField>
                    <InputField label="Applying For Class" required error={errors.applyingForGrade}>
                        <select
                            name="applyingForGrade"
                            value={formData.applyingForGrade}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: errors.applyingForGrade ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses} cursor-pointer`}
                        >
                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Class...</option>
                            {options.classes
                                .filter(c => !formData.curriculum || c.curriculum == formData.curriculum)
                                .map(cls => (
                                    <option key={cls.id} value={cls.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{cls.name}</option>
                                ))}
                        </select>
                    </InputField>
                    <InputField label="Campus">
                        <select
                            name="campus"
                            value={formData.campus}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses} cursor-pointer`}
                        >
                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Campus...</option>
                            {options.campuses.map(campus => (
                                <option key={campus.id} value={campus.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{campus.name}</option>
                            ))}
                        </select>
                    </InputField>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-main)' }}>Parent/Guardian Information</h3>
                <p className="text-sm mb-0" style={{ color: 'var(--text-secondary)' }}>Primary contact and emergency information.</p>
            </div>

            {/* Primary Guardian */}
            <div 
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                className="p-5 rounded-xl border shadow-sm space-y-4"
            >
                <h4 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                    <Users size={18} style={{ color: 'var(--primary-color)' }} /> Primary Guardian
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name" required error={errors.guardianName}>
                        <input
                            name="guardianName"
                            value={formData.guardianName}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: errors.guardianName ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses}`}
                            placeholder="Full name"
                        />
                    </InputField>
                    <InputField label="Relationship" required error={errors.guardianRelationship}>
                        <select
                            name="guardianRelationship"
                            value={formData.guardianRelationship}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: errors.guardianRelationship ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses} cursor-pointer`}
                        >
                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select...</option>
                            {GUARDIAN_RELATIONSHIPS.map(r => (
                                <option key={r.value} value={r.value} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{r.label}</option>
                            ))}
                        </select>
                    </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="National ID / Passport">
                        <input
                            name="guardianIdNumber"
                            value={formData.guardianIdNumber}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={inputClasses}
                            placeholder="ID Number"
                        />
                    </InputField>
                    <InputField label="Occupation">
                        <input
                            name="guardianOccupation"
                            value={formData.guardianOccupation}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={inputClasses}
                            placeholder="Occupation"
                        />
                    </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Phone Number" required error={errors.guardianPhone}>
                        <input
                            name="guardianPhone"
                            value={formData.guardianPhone}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: errors.guardianPhone ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses}`}
                            placeholder="+254..."
                        />
                    </InputField>
                    <InputField label="Email">
                        <input
                            type="email"
                            name="guardianEmail"
                            value={formData.guardianEmail}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={inputClasses}
                            placeholder="email@example.com"
                        />
                    </InputField>
                </div>

                <InputField label="Physical Address">
                    <textarea
                        name="guardianAddress"
                        value={formData.guardianAddress}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses} min-h-[80px]`}
                        placeholder="Physical address"
                        rows={2}
                    />
                </InputField>
            </div>

            {/* Secondary Guardian */}
            <div 
                style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                className="p-5 rounded-xl border space-y-4 shadow-sm"
            >
                <h4 className="font-bold" style={{ color: 'var(--text-main)' }}>Secondary Guardian (Optional)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name">
                        <input
                            name="guardian2Name"
                            value={formData.guardian2Name}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={inputClasses}
                            placeholder="Full name"
                        />
                    </InputField>
                    <InputField label="Relationship">
                        <select
                            name="guardian2Relationship"
                            value={formData.guardian2Relationship}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses} cursor-pointer`}
                        >
                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select...</option>
                            {GUARDIAN_RELATIONSHIPS.map(r => (
                                <option key={r.value} value={r.value} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{r.label}</option>
                            ))}
                        </select>
                    </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Phone Number">
                        <input
                            name="guardian2Phone"
                            value={formData.guardian2Phone}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={inputClasses}
                            placeholder="+254..."
                        />
                    </InputField>
                    <InputField label="Email">
                        <input
                            type="email"
                            name="guardian2Email"
                            value={formData.guardian2Email}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={inputClasses}
                            placeholder="email@example.com"
                        />
                    </InputField>
                </div>
            </div>

            {/* Emergency Contact */}
            <div 
                style={{ background: 'rgba(239, 68, 68, 0.04)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
                className="p-5 rounded-xl border space-y-4 shadow-sm"
            >
                <h4 className="font-bold flex items-center gap-2" style={{ color: 'rgb(185, 28, 28)' }}>
                    <AlertCircle size={18} /> Emergency Contact
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Contact Name" required error={errors.emergencyContactName}>
                        <input
                            name="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: errors.emergencyContactName ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses}`}
                            placeholder="Full name"
                        />
                    </InputField>
                    <InputField label="Phone Number" required error={errors.emergencyContactPhone}>
                        <input
                            name="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: errors.emergencyContactPhone ? 'rgb(239, 68, 68)' : 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={`${inputClasses}`}
                            placeholder="+254..."
                        />
                    </InputField>
                    <InputField label="Relationship">
                        <input
                            name="emergencyContactRelationship"
                            value={formData.emergencyContactRelationship}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={inputClasses}
                            placeholder="e.g., Uncle"
                        />
                    </InputField>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-main)' }}>Previous School Information</h3>
                <p className="text-sm mb-0" style={{ color: 'var(--text-secondary)' }}>Academic history and transfer details (if applicable).</p>
            </div>

            {!formData.isTransfer && (
                <div className="p-4 rounded-xl border flex items-center gap-3" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}>
                    <AlertCircle size={20} style={{ color: 'var(--primary-color)' }} />
                    <p className="text-sm mb-0">
                        This section is optional for new students. It's primarily for transfer students.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Previous School Name">
                    <input
                        name="previousSchoolName"
                        value={formData.previousSchoolName}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="School name"
                    />
                </InputField>
                <InputField label="Previous Class/Grade">
                    <input
                        name="previousClass"
                        value={formData.previousClass}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="e.g., Grade 5"
                    />
                </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="School Address">
                    <textarea
                        name="previousSchoolAddress"
                        value={formData.previousSchoolAddress}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses} min-h-[80px]`}
                        placeholder="School address"
                        rows={2}
                    />
                </InputField>
                <InputField label="School Contact">
                    <input
                        name="previousSchoolContact"
                        value={formData.previousSchoolContact}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="Phone number"
                    />
                </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Date of Leaving">
                    <DateInput
                        value={formData.previousSchoolLeavingDate}
                        onChange={(dateStr) => setFormData(prev => ({ ...prev, previousSchoolLeavingDate: dateStr }))}
                        placeholder="Select date"
                        maxDate={new Date()}
                        className={inputClasses}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                    />
                </InputField>
                <InputField label="Assessment Score">
                    <input
                        name="assessmentScore"
                        value={formData.assessmentScore}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="e.g., 350 marks"
                    />
                </InputField>
            </div>

            {formData.isTransfer && (
                <InputField label="Reason for Transfer">
                    <textarea
                        name="transferReason"
                        value={formData.transferReason}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses} min-h-[100px]`}
                        placeholder="Why is the student transferring?"
                        rows={3}
                    />
                </InputField>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-main)' }}>Medical Information</h3>
                <p className="text-sm mb-0" style={{ color: 'var(--text-secondary)' }}>Health details for student safety and welfare.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Blood Group">
                    <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses} cursor-pointer`}
                    >
                        <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select...</option>
                        {BLOOD_GROUPS.map(bg => (
                            <option key={bg} value={bg} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{bg}</option>
                        ))}
                    </select>
                </InputField>
                <InputField label="Health Insurance (NHIF/Private)">
                    <input
                        name="healthInsurance"
                        value={formData.healthInsurance}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={inputClasses}
                        placeholder="Insurance provider/number"
                    />
                </InputField>
            </div>

            <InputField label="Known Medical Conditions">
                <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                    className={`${inputClasses} min-h-[80px]`}
                    placeholder="List any medical conditions (e.g., asthma, diabetes, epilepsy)"
                    rows={2}
                />
            </InputField>

            <InputField label="Allergies">
                <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                    className={`${inputClasses} min-h-[80px]`}
                    placeholder="List any known allergies (food, medication, environmental)"
                    rows={2}
                />
            </InputField>

            <InputField label="Special Needs / Requirements">
                <textarea
                    name="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={handleChange}
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                    className={`${inputClasses} min-h-[80px]`}
                    placeholder="Any special educational or physical needs"
                    rows={2}
                />
            </InputField>

            <div className="border-t pt-6 mt-4" style={{ borderColor: 'var(--border-color-light)' }}>
                <h4 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Family Doctor (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Doctor's Name">
                        <input
                            name="doctorName"
                            value={formData.doctorName}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={inputClasses}
                            placeholder="Dr. Name"
                        />
                    </InputField>
                    <InputField label="Doctor's Phone">
                        <input
                            name="doctorPhone"
                            value={formData.doctorPhone}
                            onChange={handleChange}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className={inputClasses}
                            placeholder="+254..."
                        />
                    </InputField>
                </div>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-main)' }}>Documents Upload</h3>
                <p className="text-sm mb-0" style={{ color: 'var(--text-secondary)' }}>Upload required documents. Accepted formats: PDF, JPG, PNG (max 5MB each).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Passport Photo */}
                <div className="p-4 rounded-xl border hover:opacity-95 transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-light)' }}>
                            <User size={20} style={{ color: 'var(--primary-color)' }} />
                        </div>
                        <div>
                            <h5 className="font-bold mb-0.5 text-sm" style={{ color: 'var(--text-main)' }}>Passport Photo</h5>
                            <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>Recent passport-size photo</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        name="passportPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        style={{ color: 'var(--text-secondary)' }}
                    />
                    {formData.passportPhoto && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={14} /> {formData.passportPhoto.name}
                        </p>
                    )}
                </div>

                {/* Birth Certificate */}
                <div className="p-4 rounded-xl border hover:opacity-95 transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-light)' }}>
                            <FileText size={20} style={{ color: 'var(--primary-color)' }} />
                        </div>
                        <div>
                            <h5 className="font-bold mb-0.5 text-sm" style={{ color: 'var(--text-main)' }}>Birth Certificate</h5>
                            <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>Copy of birth certificate</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        name="birthCertificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        style={{ color: 'var(--text-secondary)' }}
                    />
                    {formData.birthCertificate && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={14} /> {formData.birthCertificate.name}
                        </p>
                    )}
                </div>

                {/* Previous Report Card */}
                <div className="p-4 rounded-xl border hover:opacity-95 transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-light)' }}>
                            <ClipboardCheck size={20} style={{ color: 'var(--primary-color)' }} />
                        </div>
                        <div>
                            <h5 className="font-bold mb-0.5 text-sm" style={{ color: 'var(--text-main)' }}>Previous Report Card</h5>
                            <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>Latest academic report</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        name="previousReportCard"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        style={{ color: 'var(--text-secondary)' }}
                    />
                    {formData.previousReportCard && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={14} /> {formData.previousReportCard.name}
                        </p>
                    )}
                </div>

                {/* Transfer Letter (if transfer student) */}
                {formData.isTransfer && (
                    <div className="p-4 rounded-xl border hover:opacity-95 transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-light)' }}>
                                <FileText size={20} style={{ color: 'var(--primary-color)' }} />
                            </div>
                            <div>
                                <h5 className="font-bold mb-0.5 text-sm" style={{ color: 'var(--text-main)' }}>Transfer Letter</h5>
                                <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>From previous school</p>
                            </div>
                        </div>
                        <input
                            type="file"
                            name="transferLetter"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            style={{ color: 'var(--text-secondary)' }}
                        />
                        {formData.transferLetter && (
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-semibold">
                                <CheckCircle2 size={14} /> {formData.transferLetter.name}
                            </p>
                        )}
                    </div>
                )}

                {/* Medical Report */}
                <div className="p-4 rounded-xl border hover:opacity-95 transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-light)' }}>
                            <Heart size={20} style={{ color: 'var(--primary-color)' }} />
                        </div>
                        <div>
                            <h5 className="font-bold mb-0.5 text-sm" style={{ color: 'var(--text-main)' }}>Medical Report</h5>
                            <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>Health assessment (optional)</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        name="medicalReport"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        style={{ color: 'var(--text-secondary)' }}
                    />
                    {formData.medicalReport && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={14} /> {formData.medicalReport.name}
                        </p>
                    )}
                </div>
            </div>

            {/* Referral Source */}
            <div className="border-t pt-6 mt-4" style={{ borderColor: 'var(--border-color-light)' }}>
                <InputField label="How did you hear about us?">
                    <select
                        name="referralSource"
                        value={formData.referralSource}
                        onChange={handleChange}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className={`${inputClasses} cursor-pointer`}
                    >
                        <option value="walk_in" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Walk-in</option>
                        <option value="online" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Online</option>
                        <option value="referral" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Referral</option>
                        <option value="advertisement" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Advertisement</option>
                        <option value="other" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Other</option>
                    </select>
                </InputField>
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--primary-color)', color: '#fff' }}>
                <h3 className="text-xl font-bold mb-1">Review Application</h3>
                <p className="text-sm opacity-90 mb-0">Please verify all details before submitting.</p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
                {/* Student Information */}
                <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}>
                    <div className="px-4 py-3 border-b" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                        <h4 className="font-bold flex items-center gap-2 mb-0" style={{ color: 'var(--text-main)' }}>
                            <User size={18} style={{ color: 'var(--primary-color)' }} /> Student Information
                        </h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Full Name</span>
                            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{formData.firstName} {formData.middleName} {formData.lastName}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Gender</span>
                            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{formData.gender === 'M' ? 'Male' : 'Female'}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Date of Birth</span>
                            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{formData.dob || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Applying For</span>
                            <span className="font-bold" style={{ color: 'var(--primary-color)' }}>
                                {options.classes.find(c => c.id == formData.applyingForGrade)?.name || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Campus</span>
                            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>
                                {options.campuses.find(c => c.id == formData.campus)?.name || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Curriculum</span>
                            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>
                                {options.curriculums.find(c => c.id == formData.curriculum)?.name || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Student Type</span>
                            <span className="font-bold" style={{ color: formData.isTransfer ? 'rgb(245, 158, 11)' : 'rgb(16, 185, 129)' }}>
                                {formData.isTransfer ? 'Transfer' : 'New Admission'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Guardian Information */}
                <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}>
                    <div className="px-4 py-3 border-b" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                        <h4 className="font-bold flex items-center gap-2 mb-0" style={{ color: 'var(--text-main)' }}>
                            <Users size={18} style={{ color: 'var(--primary-color)' }} /> Guardian Information
                        </h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Primary Guardian</span>
                            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{formData.guardianName}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Relationship</span>
                            <span className="font-semibold capitalize" style={{ color: 'var(--text-main)' }}>{formData.guardianRelationship}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Phone</span>
                            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{formData.guardianPhone}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Emergency Contact</span>
                            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{formData.emergencyContactName}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Emergency Phone</span>
                            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{formData.emergencyContactPhone}</span>
                        </div>
                    </div>
                </div>

                {/* Medical Summary */}
                {(formData.medicalConditions || formData.allergies || formData.specialNeeds) && (
                    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}>
                        <div className="px-4 py-3 border-b" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                            <h4 className="font-bold flex items-center gap-2 mb-0" style={{ color: 'var(--text-main)' }}>
                                <Heart size={18} style={{ color: 'var(--primary-color)' }} /> Medical Notes
                            </h4>
                        </div>
                        <div className="p-4 text-sm space-y-2">
                            {formData.medicalConditions && (
                                <div>
                                    <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Conditions:</span>
                                    <p className="mb-0 font-semibold animate-in fade-in" style={{ color: 'var(--text-main)' }}>{formData.medicalConditions}</p>
                                </div>
                            )}
                            {formData.allergies && (
                                <div>
                                    <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Allergies:</span>
                                    <p className="mb-0 font-semibold animate-in fade-in" style={{ color: 'var(--text-main)' }}>{formData.allergies}</p>
                                </div>
                            )}
                            {formData.specialNeeds && (
                                <div>
                                    <span className="block text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Special Needs:</span>
                                    <p className="mb-0 font-semibold animate-in fade-in" style={{ color: 'var(--text-main)' }}>{formData.specialNeeds}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Documents Summary */}
                <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}>
                    <div className="px-4 py-3 border-b" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                        <h4 className="font-bold flex items-center gap-2 mb-0" style={{ color: 'var(--text-main)' }}>
                            <FileText size={18} style={{ color: 'var(--primary-color)' }} /> Uploaded Documents
                        </h4>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                        {formData.passportPhoto && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.15)', color: 'rgb(16, 185, 129)' }}>
                                <CheckCircle2 size={12} /> Passport Photo
                            </span>
                        )}
                        {formData.birthCertificate && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.15)', color: 'rgb(16, 185, 129)' }}>
                                <CheckCircle2 size={12} /> Birth Certificate
                            </span>
                        )}
                        {formData.previousReportCard && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.15)', color: 'rgb(16, 185, 129)' }}>
                                <CheckCircle2 size={12} /> Report Card
                            </span>
                        )}
                        {formData.transferLetter && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.15)', color: 'rgb(16, 185, 129)' }}>
                                <CheckCircle2 size={12} /> Transfer Letter
                            </span>
                        )}
                        {formData.medicalReport && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.15)', color: 'rgb(16, 185, 129)' }}>
                                <CheckCircle2 size={12} /> Medical Report
                            </span>
                        )}
                        {!formData.passportPhoto && !formData.birthCertificate && !formData.previousReportCard && (
                            <span style={{ color: 'var(--text-muted)' }} className="text-sm font-semibold">No documents uploaded</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Notice */}
            <div className="p-4 rounded-xl text-sm border flex gap-3" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}>
                <div className="shrink-0 mt-0.5" style={{ color: 'var(--primary-color)' }}>
                    <CheckCircle2 size={18} />
                </div>
                <p className="mb-0">
                    By submitting this application, you confirm that all entered details are accurate and
                    the guardian has consented to data collection as per the school's privacy policy.
                </p>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="New Student Admission"
            size="2xl"
            footer={
                <div className="flex justify-between w-full">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        style={{
                            background: step === 1 ? 'var(--bg-light)' : 'var(--card-bg)',
                            borderColor: 'var(--border-color-light)',
                            color: step === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                            cursor: step === 1 ? 'not-allowed' : 'pointer'
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border transition-all font-bold active:scale-95"
                    >
                        <ChevronLeft size={18} /> Back
                    </button>

                    {step < 6 ? (
                        <button
                            onClick={handleNext}
                            style={{
                                background: 'var(--primary-color)',
                                color: '#fff'
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl hover:opacity-95 transition-all font-bold active:scale-95 cursor-pointer border-0 shadow-md hover:shadow-lg"
                        >
                            Next Step <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                background: 'var(--primary-color)',
                                color: '#fff'
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl hover:opacity-95 disabled:opacity-70 transition-all font-bold active:scale-95 cursor-pointer border-0 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <><Save size={18} /> Submit Application</>
                            )}
                        </button>
                    )}
                </div>
            }
        >
            <div className="flex flex-col h-full max-h-[75vh]">
                {renderStepIndicator()}

                <div className="flex-1 overflow-y-auto px-1 pb-4">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                    {step === 6 && renderStep6()}
                </div>
            </div>
        </Modal>
    );
};

export default KenyanAdmissionForm;
