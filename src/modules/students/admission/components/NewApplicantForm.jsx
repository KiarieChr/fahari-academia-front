import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { studentManagementService } from '../../../../services/studentManagementService';
import { institutionService } from '../../../../services/institutionService';
import DateInput from '../../../../components/common/DateInput';
import Modal from '../../../../components/common/Modal';

const STEPS = [
    { id: 1, title: 'Personal Details', description: 'Basic info' },
    { id: 2, title: 'Academic Info', description: 'Class & Curriculum' },
    { id: 3, title: 'Guardian Info', description: 'Contact details' },
    { id: 4, title: 'Review', description: 'Confirm & Submit' }
];

const NewApplicantForm = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [showGuardian2, setShowGuardian2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        intakes: [],
        curriculums: [],
        classes: [],
        campuses: []
    });
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', gender: 'Male', dob: '',
        class: '', curriculum: '', intake: '', campus: '',
        prevSchool: '', score: '', isTransfer: false,
        passportPhoto: null,
        guardianName: '', phone: '', email: '',
        guardian2Name: '', guardian2Phone: '', guardian2Email: '',
        source: 'Walk-in', remarks: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const applyIntakeDefaults = (intakeId) => {
        const intake = options.intakes.find(i => Number(i.id) === Number(intakeId));
        if (!intake?.entry_grade) {
            return;
        }

        const entryGrade = options.classes.find(c => Number(c.id) === Number(intake.entry_grade));
        if (!entryGrade) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            class: String(entryGrade.id),
            curriculum: entryGrade.curriculum ? String(entryGrade.curriculum) : ''
        }));
    };

    const handleIntakeChange = (e) => {
        const intakeValue = e.target.value;
        setFormData(prev => ({ ...prev, intake: intakeValue }));

        if (!formData.isTransfer) {
            applyIntakeDefaults(intakeValue);
        }
    };

    const handleTransferToggle = () => {
        setFormData(prev => {
            const nextTransfer = !prev.isTransfer;
            const next = { ...prev, isTransfer: nextTransfer };

            // When switching back to non-transfer, lock back to intake defaults.
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
    };

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [intakes, curriculums, classes, campusesRes] = await Promise.all([
                    studentManagementService.getIntakes(),
                    studentManagementService.getCurriculums(),
                    studentManagementService.getClasses(),
                    institutionService.getCampuses()
                ]);
                setOptions({
                    intakes: intakes.results || intakes,
                    curriculums: curriculums.results || curriculums,
                    classes: classes.results || classes,
                    campuses: campusesRes.results || campusesRes || []
                });
            } catch (error) {
                console.error("Error fetching options:", error);
                toast.error("Failed to load form options");
            }
        };
        fetchOptions();
    }, []);

    const handleNext = () => setStep(s => Math.min(s + 1, 4));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
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
            if (formData.passportPhoto) {
                payload.append('passport_photo', formData.passportPhoto);
            }

            await studentManagementService.createApplication(payload);
            toast.success('Application submitted successfully!');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit application. Please check all fields.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="New Student Application"
            size="xl"
            footer={
                <div className="flex justify-between w-full">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`btn d-flex align-items-center gap-2 px-6 py-2 rounded-lg transition-colors border ${step === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'hover:bg-gray-50 text-gray-700 border-gray-300'}`}
                    >
                        <ChevronLeft size={18} /> Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="bg-gray-900 text-white flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                        >
                            Next Step <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-indigo-600 text-white flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
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
            <div className="flex flex-col h-full">
                {/* Horizontal Stepper */}
                <div className="mb-8 relative">
                    <div className="flex justify-between items-center relative z-10 px-4">
                        {STEPS.map((s) => (
                            <div key={s.id} className="flex flex-col items-center flex-1">
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-2
                                        ${step >= s.id
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-110'
                                            : 'bg-white border-gray-200 text-gray-400'}
                                    `}
                                >
                                    {step > s.id ? <CheckCircle2 size={20} /> : <span className="font-bold">{s.id}</span>}
                                </div>
                                <h4 className={`text-sm font-semibold mb-0.5 ${step === s.id ? 'text-indigo-700' : 'text-gray-500'}`}>{s.title}</h4>
                                <p className="text-xs text-gray-400 hidden sm:block">{s.description}</p>
                            </div>
                        ))}
                    </div>
                    {/* Progress Bar Background */}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
                    {/* Active Progress Bar */}
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-indigo-600 -z-0 transition-all duration-500 ease-in-out"
                        style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                    ></div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto px-1">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Personal Details</h3>
                                <p className="text-sm text-gray-500">Please enter the student's basic identification information.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                                    <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="Jane" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                                    <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender <span className="text-red-500">*</span></label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm">
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth <span className="text-red-500">*</span></label>
                                    <DateInput
                                        value={formData.dob}
                                        onChange={(dateStr) => setFormData(prev => ({ ...prev, dob: dateStr }))}
                                        placeholder="Select DOB"
                                        maxDate={new Date()}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Passport Photo (Optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePassportChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-sm text-gray-900 font-medium shadow-sm"
                                    />
                                    {formData.passportPhoto && (
                                        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                                            <CheckCircle2 size={14} /> {formData.passportPhoto.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Academic Information</h3>
                                <p className="text-sm text-gray-500">Configure the student's enrollment details and placement.</p>
                            </div>

                            {/* Transfer Toggle */}
                            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-indigo-300 transition-colors cursor-pointer" onClick={handleTransferToggle}>
                                <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${formData.isTransfer ? 'bg-indigo-600 justify-end' : 'bg-gray-200 justify-start'}`}>
                                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900 block">Transfer Student</span>
                                    <span className="text-xs text-gray-500">Is this student transferring from another school?</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Intake <span className="text-red-500">*</span></label>
                                    <select name="intake" value={formData.intake} onChange={handleIntakeChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm">
                                        <option value="">Select Intake...</option>
                                        {options.intakes.map(intake => (
                                            <option key={intake.id} value={intake.id}>{intake.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Campus</label>
                                    <select name="campus" value={formData.campus} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm">
                                        <option value="">Select Campus...</option>
                                        {options.campuses.map(campus => (
                                            <option key={campus.id} value={campus.id}>{campus.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Curriculum <span className="text-red-500">*</span></label>
                                    <select
                                        name="curriculum"
                                        value={formData.curriculum}
                                        onChange={handleChange}
                                        disabled={!formData.isTransfer}
                                        className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm ${!formData.isTransfer ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">Select Curriculum...</option>
                                        {options.curriculums.map(curr => (
                                            <option key={curr.id} value={curr.id}>{curr.name} ({curr.code})</option>
                                        ))}
                                    </select>
                                    {!formData.isTransfer && (
                                        <p className="text-xs text-gray-500 mt-1">Auto-selected from intake entry grade.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Applying For Class <span className="text-red-500">*</span></label>
                                    <select
                                        name="class"
                                        value={formData.class}
                                        onChange={handleChange}
                                        disabled={!formData.isTransfer}
                                        className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm ${!formData.isTransfer ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">Select Class...</option>
                                        {options.classes
                                            .filter(c => !formData.curriculum || c.curriculum == formData.curriculum)
                                            .map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                    </select>
                                    {!formData.isTransfer && (
                                        <p className="text-xs text-gray-500 mt-1">Auto-selected from intake entry grade.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Previous School</label>
                                    <input name="prevSchool" value={formData.prevSchool} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="School Name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Score / Assessment (Optional)</label>
                                    <input name="score" value={formData.score} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="e.g. 350 Marks" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Guardian Information</h3>
                                <p className="text-sm text-gray-500">Contact details for parents or guardians.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Guardian Name <span className="text-red-500">*</span></label>
                                    <input name="guardianName" value={formData.guardianName} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="Full Name" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="+254..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                        <input name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="parent@example.com" />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 py-2">
                                    <button
                                        onClick={() => setShowGuardian2(!showGuardian2)}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 transition-colors"
                                    >
                                        {showGuardian2 ? '- Remove Second Guardian' : '+ Add Second Parent / Guardian'}
                                    </button>
                                </div>

                                {showGuardian2 && (
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Second Guardian Name</label>
                                            <input name="guardian2Name" value={formData.guardian2Name} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="Full Name" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                                <input name="guardian2Phone" value={formData.guardian2Phone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="+254..." />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                                <input name="guardian2Email" value={formData.guardian2Email} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm" placeholder="guardian@example.com" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Referral Source</label>
                                    <select name="source" value={formData.source} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm">
                                        <option>Walk-in</option>
                                        <option>Online Ad</option>
                                        <option>Referral</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg mb-6">
                                <h3 className="text-xl font-bold mb-1">Review Application</h3>
                                <p className="text-gray-300 text-sm">Please verify all details before submitting.</p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                                    <div>
                                        <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Full Name</span>
                                        <span className="font-semibold text-gray-900 text-lg">{formData.firstName} {formData.lastName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Gender & DOB</span>
                                        <span className="font-medium text-gray-900">{formData.gender}, {formData.dob || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Applying For</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                                {options.classes.find(c => c.id == formData.class)?.name || formData.class || 'Not Selected'}
                                            </span>
                                            {formData.isTransfer && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">Transfer Student</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Curriculum</span>
                                        <span className="font-medium text-gray-900">{options.curriculums.find(c => c.id == formData.curriculum)?.name || formData.curriculum || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Passport Photo</span>
                                        <span className="font-medium text-gray-900">{formData.passportPhoto ? formData.passportPhoto.name : 'Not uploaded'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Primary Guardian</span>
                                        <span className="font-medium text-gray-900">{formData.guardianName}</span>
                                        <span className="block text-gray-500 mt-0.5">{formData.phone}</span>
                                    </div>
                                    {formData.guardian2Name && (
                                        <div>
                                            <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Second Guardian</span>
                                            <span className="font-medium text-gray-900">{formData.guardian2Name}</span>
                                            <span className="block text-gray-500 mt-0.5">{formData.guardian2Phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex gap-3">
                                <div className="shrink-0 mt-0.5">
                                    <CheckCircle2 size={18} />
                                </div>
                                <p>By submitting this application, you confirm that all entered details are accurate and the guardian has consented to the data collection as per the school's privacy policy.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default NewApplicantForm;
