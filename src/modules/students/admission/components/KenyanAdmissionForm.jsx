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
    { id: 1, title: 'Student Information', description: 'Personal details', icon: User },
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
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const inputClasses = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm";

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

        // Step 3-5 have optional fields

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
        <div className="mb-8 relative">
            <div className="flex justify-between items-start relative z-10 px-2">
                {STEPS.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div
                            key={s.id}
                            className="flex flex-col items-center flex-1 cursor-pointer"
                            onClick={() => s.id < step && setStep(s.id)}
                        >
                            <div
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-2
                                    ${step >= s.id
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                        : 'bg-white border-gray-200 text-gray-400'}
                                    ${step === s.id ? 'scale-110 ring-4 ring-indigo-100' : ''}
                                `}
                            >
                                {step > s.id ? <CheckCircle2 size={22} /> : <Icon size={20} />}
                            </div>
                            <h4 className={`text-xs font-semibold mb-0.5 text-center ${step === s.id ? 'text-indigo-700' : 'text-gray-500'}`}>
                                {s.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 hidden lg:block text-center">{s.description}</p>
                        </div>
                    );
                })}
            </div>
            {/* Progress Bar */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-100 -z-0"></div>
            <div
                className="absolute top-6 left-6 h-0.5 bg-indigo-600 -z-0 transition-all duration-500"
                style={{ width: `${((step - 1) / (STEPS.length - 1)) * (100 - 8)}%` }}
            ></div>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Student Information</h3>
                <p className="text-sm text-gray-500">Enter the student's personal and identification details.</p>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="First Name" required error={errors.firstName}>
                    <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`${inputClasses} ${errors.firstName ? 'border-red-300' : ''}`}
                        placeholder="John"
                    />
                </InputField>
                <InputField label="Middle Name">
                    <input
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Optional"
                    />
                </InputField>
                <InputField label="Last Name" required error={errors.lastName}>
                    <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`${inputClasses} ${errors.lastName ? 'border-red-300' : ''}`}
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
                        className={`${inputClasses} ${errors.gender ? 'border-red-300' : ''}`}
                    >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
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
                        className={`${inputClasses} ${errors.dob ? 'border-red-300' : ''}`}
                    />
                </InputField>
                <InputField label="Birth Certificate No.">
                    <input
                        name="birthCertificateNumber"
                        value={formData.birthCertificateNumber}
                        onChange={handleChange}
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
                        className={inputClasses}
                        placeholder="Kenyan"
                    />
                </InputField>
                <InputField label="Religion">
                    <select
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="">Select Religion</option>
                        {RELIGIONS.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                </InputField>
                <InputField label="County">
                    <select
                        name="county"
                        value={formData.county}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="">Select County</option>
                        {KENYAN_COUNTIES.map(c => (
                            <option key={c} value={c}>{c}</option>
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
                        className={inputClasses}
                        placeholder="Sub-county"
                    />
                </InputField>
                <InputField label="Home Address">
                    <input
                        name="homeAddress"
                        value={formData.homeAddress}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Physical address"
                    />
                </InputField>
            </div>

            {/* Academic Placement */}
            <div className="border-t pt-6 mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Academic Placement</h4>

                {/* Transfer Toggle */}
                <div
                    className="mb-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-indigo-300 transition-colors cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, isTransfer: !prev.isTransfer }))}
                >
                    <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${formData.isTransfer ? 'bg-indigo-600 justify-end' : 'bg-gray-200 justify-start'}`}>
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                    </div>
                    <div>
                        <span className="font-medium text-gray-900 block">Transfer Student</span>
                        <span className="text-xs text-gray-500">Is this student transferring from another school?</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Target Intake" required error={errors.intake}>
                        <select
                            name="intake"
                            value={formData.intake}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.intake ? 'border-red-300' : ''}`}
                        >
                            <option value="">Select Intake...</option>
                            {options.intakes.map(intake => (
                                <option key={intake.id} value={intake.id}>{intake.name}</option>
                            ))}
                        </select>
                    </InputField>
                    <InputField label="Curriculum" required error={errors.curriculum}>
                        <select
                            name="curriculum"
                            value={formData.curriculum}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.curriculum ? 'border-red-300' : ''}`}
                        >
                            <option value="">Select Curriculum...</option>
                            {options.curriculums.map(curr => (
                                <option key={curr.id} value={curr.id}>{curr.name} ({curr.code})</option>
                            ))}
                        </select>
                    </InputField>
                    <InputField label="Applying For Class" required error={errors.applyingForGrade}>
                        <select
                            name="applyingForGrade"
                            value={formData.applyingForGrade}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.applyingForGrade ? 'border-red-300' : ''}`}
                        >
                            <option value="">Select Class...</option>
                            {options.classes
                                .filter(c => !formData.curriculum || c.curriculum == formData.curriculum)
                                .map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                        </select>
                    </InputField>
                    <InputField label="Campus">
                        <select
                            name="campus"
                            value={formData.campus}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="">Select Campus...</option>
                            {options.campuses.map(campus => (
                                <option key={campus.id} value={campus.id}>{campus.name}</option>
                            ))}
                        </select>
                    </InputField>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Parent/Guardian Information</h3>
                <p className="text-sm text-gray-500">Primary contact and emergency information.</p>
            </div>

            {/* Primary Guardian */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" /> Primary Guardian
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name" required error={errors.guardianName}>
                        <input
                            name="guardianName"
                            value={formData.guardianName}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.guardianName ? 'border-red-300' : ''}`}
                            placeholder="Full name"
                        />
                    </InputField>
                    <InputField label="Relationship" required error={errors.guardianRelationship}>
                        <select
                            name="guardianRelationship"
                            value={formData.guardianRelationship}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.guardianRelationship ? 'border-red-300' : ''}`}
                        >
                            <option value="">Select...</option>
                            {GUARDIAN_RELATIONSHIPS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
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
                            className={inputClasses}
                            placeholder="ID Number"
                        />
                    </InputField>
                    <InputField label="Occupation">
                        <input
                            name="guardianOccupation"
                            value={formData.guardianOccupation}
                            onChange={handleChange}
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
                            className={`${inputClasses} ${errors.guardianPhone ? 'border-red-300' : ''}`}
                            placeholder="+254..."
                        />
                    </InputField>
                    <InputField label="Email">
                        <input
                            type="email"
                            name="guardianEmail"
                            value={formData.guardianEmail}
                            onChange={handleChange}
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
                        className={`${inputClasses} min-h-[80px]`}
                        placeholder="Physical address"
                        rows={2}
                    />
                </InputField>
            </div>

            {/* Secondary Guardian */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                <h4 className="font-semibold text-gray-700">Secondary Guardian (Optional)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name">
                        <input
                            name="guardian2Name"
                            value={formData.guardian2Name}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Full name"
                        />
                    </InputField>
                    <InputField label="Relationship">
                        <select
                            name="guardian2Relationship"
                            value={formData.guardian2Relationship}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="">Select...</option>
                            {GUARDIAN_RELATIONSHIPS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
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
                            className={inputClasses}
                            placeholder="email@example.com"
                        />
                    </InputField>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50/50 p-5 rounded-xl border border-red-100 space-y-4">
                <h4 className="font-semibold text-red-800 flex items-center gap-2">
                    <AlertCircle size={18} /> Emergency Contact
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Contact Name" required error={errors.emergencyContactName}>
                        <input
                            name="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.emergencyContactName ? 'border-red-300' : ''}`}
                            placeholder="Full name"
                        />
                    </InputField>
                    <InputField label="Phone Number" required error={errors.emergencyContactPhone}>
                        <input
                            name="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.emergencyContactPhone ? 'border-red-300' : ''}`}
                            placeholder="+254..."
                        />
                    </InputField>
                    <InputField label="Relationship">
                        <input
                            name="emergencyContactRelationship"
                            value={formData.emergencyContactRelationship}
                            onChange={handleChange}
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
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Previous School Information</h3>
                <p className="text-sm text-gray-500">Academic history and transfer details (if applicable).</p>
            </div>

            {!formData.isTransfer && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle size={20} className="text-blue-600" />
                    <p className="text-sm text-blue-800">
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
                        className={inputClasses}
                        placeholder="School name"
                    />
                </InputField>
                <InputField label="Previous Class/Grade">
                    <input
                        name="previousClass"
                        value={formData.previousClass}
                        onChange={handleChange}
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
                    />
                </InputField>
                <InputField label="Assessment Score">
                    <input
                        name="assessmentScore"
                        value={formData.assessmentScore}
                        onChange={handleChange}
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
            <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Medical Information</h3>
                <p className="text-sm text-gray-500">Health details for student safety and welfare.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Blood Group">
                    <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="">Select...</option>
                        {BLOOD_GROUPS.map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                        ))}
                    </select>
                </InputField>
                <InputField label="Health Insurance (NHIF/Private)">
                    <input
                        name="healthInsurance"
                        value={formData.healthInsurance}
                        onChange={handleChange}
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
                    className={`${inputClasses} min-h-[80px]`}
                    placeholder="Any special educational or physical needs"
                    rows={2}
                />
            </InputField>

            <div className="border-t pt-6 mt-4">
                <h4 className="font-semibold text-gray-700 mb-4">Family Doctor (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Doctor's Name">
                        <input
                            name="doctorName"
                            value={formData.doctorName}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Dr. Name"
                        />
                    </InputField>
                    <InputField label="Doctor's Phone">
                        <input
                            name="doctorPhone"
                            value={formData.doctorPhone}
                            onChange={handleChange}
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
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Documents Upload</h3>
                <p className="text-sm text-gray-500">Upload required documents. Accepted formats: PDF, JPG, PNG (max 5MB each).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Passport Photo */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <User size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900">Passport Photo</h5>
                            <p className="text-xs text-gray-500">Recent passport-size photo</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        name="passportPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {formData.passportPhoto && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <CheckCircle2 size={14} /> {formData.passportPhoto.name}
                        </p>
                    )}
                </div>

                {/* Birth Certificate */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <FileText size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900">Birth Certificate</h5>
                            <p className="text-xs text-gray-500">Copy of birth certificate</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        name="birthCertificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {formData.birthCertificate && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <CheckCircle2 size={14} /> {formData.birthCertificate.name}
                        </p>
                    )}
                </div>

                {/* Previous Report Card */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <ClipboardCheck size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900">Previous Report Card</h5>
                            <p className="text-xs text-gray-500">Latest academic report</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        name="previousReportCard"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {formData.previousReportCard && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <CheckCircle2 size={14} /> {formData.previousReportCard.name}
                        </p>
                    )}
                </div>

                {/* Transfer Letter (if transfer student) */}
                {formData.isTransfer && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                <FileText size={20} className="text-orange-600" />
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-900">Transfer Letter</h5>
                                <p className="text-xs text-gray-500">From previous school</p>
                            </div>
                        </div>
                        <input
                            type="file"
                            name="transferLetter"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                        {formData.transferLetter && (
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                <CheckCircle2 size={14} /> {formData.transferLetter.name}
                            </p>
                        )}
                    </div>
                )}

                {/* Medical Report */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                            <Heart size={20} className="text-pink-600" />
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900">Medical Report</h5>
                            <p className="text-xs text-gray-500">Health assessment (optional)</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        name="medicalReport"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                    />
                    {formData.medicalReport && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <CheckCircle2 size={14} /> {formData.medicalReport.name}
                        </p>
                    )}
                </div>
            </div>

            {/* Referral Source */}
            <div className="border-t pt-6 mt-4">
                <InputField label="How did you hear about us?">
                    <select
                        name="referralSource"
                        value={formData.referralSource}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="walk_in">Walk-in</option>
                        <option value="online">Online</option>
                        <option value="referral">Referral</option>
                        <option value="advertisement">Advertisement</option>
                        <option value="other">Other</option>
                    </select>
                </InputField>
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-1">Review Application</h3>
                <p className="text-gray-300 text-sm">Please verify all details before submitting.</p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
                {/* Student Information */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                        <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                            <User size={18} /> Student Information
                        </h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block text-xs">Full Name</span>
                            <span className="font-medium">{formData.firstName} {formData.middleName} {formData.lastName}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Gender</span>
                            <span className="font-medium">{formData.gender === 'M' ? 'Male' : 'Female'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Date of Birth</span>
                            <span className="font-medium">{formData.dob || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Applying For</span>
                            <span className="font-medium text-indigo-700">
                                {options.classes.find(c => c.id == formData.applyingForGrade)?.name || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Campus</span>
                            <span className="font-medium">
                                {options.campuses.find(c => c.id == formData.campus)?.name || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Curriculum</span>
                            <span className="font-medium">
                                {options.curriculums.find(c => c.id == formData.curriculum)?.name || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Student Type</span>
                            <span className={`font-medium ${formData.isTransfer ? 'text-orange-600' : 'text-green-600'}`}>
                                {formData.isTransfer ? 'Transfer' : 'New Admission'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Guardian Information */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                        <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                            <Users size={18} /> Guardian Information
                        </h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block text-xs">Primary Guardian</span>
                            <span className="font-medium">{formData.guardianName}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Relationship</span>
                            <span className="font-medium capitalize">{formData.guardianRelationship}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Phone</span>
                            <span className="font-medium">{formData.guardianPhone}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Emergency Contact</span>
                            <span className="font-medium">{formData.emergencyContactName}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Emergency Phone</span>
                            <span className="font-medium">{formData.emergencyContactPhone}</span>
                        </div>
                    </div>
                </div>

                {/* Medical Summary */}
                {(formData.medicalConditions || formData.allergies || formData.specialNeeds) && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-pink-50 px-4 py-3 border-b border-pink-100">
                            <h4 className="font-semibold text-pink-800 flex items-center gap-2">
                                <Heart size={18} /> Medical Notes
                            </h4>
                        </div>
                        <div className="p-4 text-sm space-y-2">
                            {formData.medicalConditions && (
                                <div>
                                    <span className="text-gray-500 text-xs">Conditions:</span>
                                    <p className="text-gray-800">{formData.medicalConditions}</p>
                                </div>
                            )}
                            {formData.allergies && (
                                <div>
                                    <span className="text-gray-500 text-xs">Allergies:</span>
                                    <p className="text-gray-800">{formData.allergies}</p>
                                </div>
                            )}
                            {formData.specialNeeds && (
                                <div>
                                    <span className="text-gray-500 text-xs">Special Needs:</span>
                                    <p className="text-gray-800">{formData.specialNeeds}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Documents Summary */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
                        <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                            <FileText size={18} /> Uploaded Documents
                        </h4>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                        {formData.passportPhoto && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                <CheckCircle2 size={12} /> Passport Photo
                            </span>
                        )}
                        {formData.birthCertificate && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                <CheckCircle2 size={12} /> Birth Certificate
                            </span>
                        )}
                        {formData.previousReportCard && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                <CheckCircle2 size={12} /> Report Card
                            </span>
                        )}
                        {formData.transferLetter && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                <CheckCircle2 size={12} /> Transfer Letter
                            </span>
                        )}
                        {formData.medicalReport && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                <CheckCircle2 size={12} /> Medical Report
                            </span>
                        )}
                        {!formData.passportPhoto && !formData.birthCertificate && !formData.previousReportCard && (
                            <span className="text-gray-500 text-sm">No documents uploaded</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Notice */}
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex gap-3">
                <div className="shrink-0 mt-0.5">
                    <CheckCircle2 size={18} />
                </div>
                <p>
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
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors border ${step === 1
                                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
                                : 'hover:bg-gray-50 text-gray-700 border-gray-300'
                            }`}
                    >
                        <ChevronLeft size={18} /> Back
                    </button>

                    {step < 6 ? (
                        <button
                            onClick={handleNext}
                            className="bg-indigo-600 text-white flex items-center gap-2 px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                        >
                            Next Step <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-green-600 text-white flex items-center gap-2 px-6 py-2.5 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
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
