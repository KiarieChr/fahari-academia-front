import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { studentManagementService } from '../../../../services/studentManagementService';
import DateInput from '../../../../components/common/DateInput';

const STEPS = [
    { id: 1, title: 'Personal Details', description: 'Basic student info' },
    { id: 2, title: 'Academic Info', description: 'Class & Curriculum' },
    { id: 3, title: 'Guardian Info', description: 'Parent contact details' },
    { id: 4, title: 'Review', description: 'Confirm & Submit' }
];

const NewApplicantForm = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [showGuardian2, setShowGuardian2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        intakes: [],
        curriculums: [],
        classes: []
    });
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', gender: 'Male', dob: '',
        class: '', curriculum: '', intake: '', // Added intake
        prevSchool: '', score: '', isTransfer: false,
        guardianName: '', phone: '', email: '',
        guardian2Name: '', guardian2Phone: '', guardian2Email: '',
        source: 'Walk-in', remarks: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [intakes, curriculums, classes] = await Promise.all([
                    studentManagementService.getIntakes(),
                    studentManagementService.getCurriculums(),
                    studentManagementService.getClasses()
                ]);
                setOptions({
                    intakes: intakes.results || intakes,
                    curriculums: curriculums.results || curriculums,
                    classes: classes.results || classes
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
            // Find selected grade to infer level if needed
            const selectedGrade = options.classes.find(c => c.id == formData.class);

            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                date_of_birth: formData.dob,
                gender: formData.gender === 'Male' ? 'M' : 'F',
                intake: formData.intake,
                applying_for_curriculum: formData.curriculum,
                applying_for_grade: formData.class,
                applying_for_level: selectedGrade?.curriculum_level || null, // Best effort
                previous_school: formData.prevSchool,
                score: formData.score,
                is_transfer: formData.isTransfer,
                guardian_name: formData.guardianName,
                phone_number: formData.phone,
                email: formData.email,
                // Handle second guardian in notes or generic field?
                // For now we skip guardian2 or append to remarks
            };

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
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">New Student Application</h2>
                        <p className="text-sm text-gray-500">Enter applicant details to create a new record.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Sidebar / Stepper */}
                    <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 overflow-y-auto">
                        <div className="space-y-6">
                            {STEPS.map((s) => (
                                <div key={s.id} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${step >= s.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                            {step > s.id ? <CheckCircle2 size={16} /> : <span className="text-sm font-bold">{s.id}</span>}
                                        </div>
                                        {s.id !== 4 && <div className={`w-0.5 h-full absolute top-8 left-4 -ml-px ${step > s.id ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>}
                                    </div>
                                    <div className="pb-8">
                                        <h4 className={`text-sm font-semibold ${step === s.id ? 'text-indigo-700' : 'text-gray-700'}`}>{s.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Area */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Jane" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                        <DateInput
                                            value={formData.dob}
                                            onChange={(dateStr) => setFormData(prev => ({ ...prev, dob: dateStr }))}
                                            placeholder="Select DOB"
                                            maxDate={new Date()} // Can't be born in the future
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Academic Information</h3>

                                {/* Transfer Toggle */}
                                <div className="mb-6 bg-blue-50 p-4 rounded-lg flex items-center gap-3 border border-blue-100">
                                    <input
                                        type="checkbox"
                                        id="isTransfer"
                                        name="isTransfer"
                                        checked={formData.isTransfer}
                                        onChange={(e) => setFormData({ ...formData, isTransfer: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                    />
                                    <label htmlFor="isTransfer" className="text-sm font-medium text-blue-900 cursor-pointer select-none">
                                        Is this a Student Transferring from another school?
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Intake Selection */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Intake</label>
                                        <select name="intake" value={formData.intake} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option value="">Select Intake...</option>
                                            {options.intakes.map(intake => (
                                                <option key={intake.id} value={intake.id}>{intake.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Curriculum</label>
                                        <select name="curriculum" value={formData.curriculum} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option value="">Select Curriculum...</option>
                                            {options.curriculums.map(curr => (
                                                <option key={curr.id} value={curr.id}>{curr.name} ({curr.code})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Applying For Class</label>
                                        <select name="class" value={formData.class} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option value="">Select Class...</option>
                                            {options.classes
                                                .filter(c => !formData.curriculum || c.curriculum == formData.curriculum)
                                                .map(cls => (
                                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
                                        <input name="prevSchool" value={formData.prevSchool} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="School Name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Score / Assessment (Optional)</label>
                                        <input name="score" value={formData.score} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 350 Marks" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Guardian Details</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Guardian Name</label>
                                        <input name="guardianName" value={formData.guardianName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full Name" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+254..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="parent@example.com" />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 py-2">
                                        <button
                                            onClick={() => setShowGuardian2(!showGuardian2)}
                                            className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1"
                                        >
                                            {showGuardian2 ? '- Remove Second Guardian' : '+ Add Second Parent / Guardian'}
                                        </button>
                                    </div>

                                    {showGuardian2 && (
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Second Guardian Name</label>
                                                <input name="guardian2Name" value={formData.guardian2Name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder="Full Name" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                    <input name="guardian2Phone" value={formData.guardian2Phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder="+254..." />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                    <input name="guardian2Email" value={formData.guardian2Email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder="guardian@example.com" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
                                        <select name="source" value={formData.source} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
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
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Review Application</h3>
                                <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="block text-gray-500">Full Name</span>
                                            <span className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500">Gender & DOB</span>
                                            <span className="font-semibold text-gray-900">{formData.gender}, {formData.dob || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500">Applying Class</span>
                                            <span className="font-semibold text-gray-900">
                                                {formData.class || 'Not Selected'}
                                                {formData.isTransfer && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Transfer</span>}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500">Curriculum</span>
                                            <span className="font-semibold text-gray-900">{formData.curriculum}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500">Primary Guardian</span>
                                            <span className="font-semibold text-gray-900">{formData.guardianName} ({formData.phone})</span>
                                        </div>
                                        {formData.guardian2Name && (
                                            <div>
                                                <span className="block text-gray-500">Second Guardian</span>
                                                <span className="font-semibold text-gray-900">{formData.guardian2Name} ({formData.guardian2Phone})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                                    <p>By submitting this application, you confirm that all entered details are accurate and the guardian has consented to the data collection.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`btn d-flex align-items-center gap-2 px-4 ${step === 1 ? 'btn-secondary disabled opacity-50' : 'btn-outline-secondary'}`}
                    >
                        <ChevronLeft size={18} /> Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="btn btn-dark d-flex align-items-center gap-2 px-4 shadow-sm"
                        >
                            Next Step <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                        >
                            <Save size={18} /> Submit Application
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewApplicantForm;

