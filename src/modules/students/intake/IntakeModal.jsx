import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Calendar, Users, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import studentSettingsService from '../../../services/studentSettingsService';
import Swal from 'sweetalert2';
import Modal from '../../../components/common/Modal';
import { inputClass, labelClass } from '../../../components/ui/FormField';

const IntakeModal = ({ isOpen, onClose, onSuccess, intake = null }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [intakeSessions, setIntakeSessions] = useState([]);

    useEffect(() => {
        if (activeTab === 'sessions' && intake) {
            fetchIntakeSessions();
        }
    }, [activeTab, intake]);

    const fetchIntakeSessions = async () => {
        try {
            setLoading(true);

            // Fetch both sessions and enrollments concurrently
            const [sessionsRes, enrollmentsRes] = await Promise.all([
                studentSettingsService.getClassSessions({ intake: intake.id }),
                studentSettingsService.getSessionEnrollments({ intake: intake.id })
            ]);

            const allSessions = sessionsRes.results || sessionsRes || [];
            const enrollments = enrollmentsRes.results || enrollmentsRes || [];

            // Map enrollments to count per session ID
            const enrollmentCounts = new Map();
            enrollments.forEach(enrollment => {
                if (!enrollment.session) return;
                const sid = enrollment.session;
                enrollmentCounts.set(sid, (enrollmentCounts.get(sid) || 0) + 1);
            });

            const mergedSessions = allSessions.map(session => ({
                id: session.id,
                name: session.name,
                student_count: enrollmentCounts.get(session.id) || 0,
                status: session.status,
                start_date: session.start_date,
                end_date: session.end_date
            }));

            setIntakeSessions(mergedSessions);
        } catch (error) {
            console.error('Error fetching intake sessions:', error);
        } finally {
            setLoading(false);
        }
    };
    const [formData, setFormData] = useState({
        academic_year: '',
        name: '',
        code: '',
        start_date: new Date().toISOString().split('T')[0],
        description: '',
        is_active: true
    });

    const [academicYears, setAcademicYears] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAcademicYears();
            fetchGrades();
            if (intake) {
                setFormData({
                    academic_year: intake.academic_year || '',
                    name: intake.name || '',
                    code: intake.code || '',
                    entry_grade: intake.entry_grade || '',
                    start_date: intake.start_date || new Date().toISOString().split('T')[0],
                    description: intake.description || '',
                    is_active: intake.is_active !== undefined ? intake.is_active : true
                });
            }
        }
    }, [isOpen, intake]);

    const fetchAcademicYears = async () => {
        try {
            const response = await studentSettingsService.getAcademicYears();
            const yearsList = response.results || response || [];
            setAcademicYears(yearsList);

            // Auto-select the current academic year (only for new intakes)
            if (!intake) {
                const currentYear = yearsList.find(y => y.is_current);
                if (currentYear) {
                    setFormData(prev => prev.academic_year ? prev : { ...prev, academic_year: currentYear.id });
                }
            }
        } catch (error) {
            console.error('Error fetching academic years:', error);
        }
    };

    const fetchGrades = async () => {
        try {
            const response = await studentSettingsService.getClasses();
            setGrades(response.results || response || []);
        } catch (error) {
            console.error('Error fetching grades:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAutoGenerate = async () => {
        const result = await Swal.fire({
            title: 'Auto-Generate Sessions?',
            text: "This will create class sessions for the entire lifecycle of this intake (Progression through grades).",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, generate progression!'
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            const res = await studentSettingsService.generateSessions({
                intake_id: intake?.id,
                // academic_year: intake?.academic_year (Removed to trigger Mode 1)
            });

            await Swal.fire({
                title: 'Success!',
                text: res.message, // api.js returns data directly
                icon: 'success',
                confirmButtonColor: '#3b82f6'
            });

            // Refresh sessions
            fetchIntakeSessions();

        } catch (e) {
            console.error(e);
            await Swal.fire({
                title: 'Error!',
                // api.js throws Error with .data property attached
                text: e.data?.error || e.data?.message || e.message || 'Failed to generate sessions.',
                icon: 'error',
                confirmButtonColor: '#3b82f6'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (intake) {
                await studentSettingsService.updateIntake(intake.id, formData);
            } else {
                await studentSettingsService.createIntake(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving intake:', error);
            setError(error.response?.data?.message || 'Failed to save intake. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={intake ? 'Edit Intake' : 'Add New Intake'}
            subtitle={intake ? 'Update intake details and manage sessions' : 'Create a new student intake cohort'}
            icon={Calendar}
            size="lg"
            noPadding
            footer={activeTab === 'details' ? (
                <>
                    <Modal.CancelButton onClick={onClose}>Cancel</Modal.CancelButton>
                    <Modal.SubmitButton form="intake-form" disabled={loading} loading={loading}>
                        {intake ? 'Update Intake' : 'Create Intake'}
                    </Modal.SubmitButton>
                </>
            ) : null}
        >
            {/* Tabs */}
            <div className="flex gap-1 px-7 pt-1 border-b border-gray-100">
                <button
                    className={`relative px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
                        activeTab === 'details'
                            ? 'bg-white text-indigo-600 shadow-sm border border-gray-100 border-b-white z-10'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                    }`}
                    onClick={() => setActiveTab('details')}
                >
                    Details
                </button>
                {intake && (
                    <button
                        className={`relative px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
                            activeTab === 'sessions'
                                ? 'bg-white text-indigo-600 shadow-sm border border-gray-100 border-b-white z-10'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                        }`}
                        onClick={() => setActiveTab('sessions')}
                    >
                        <span className="flex items-center gap-1.5">
                            Class Sessions
                            {intakeSessions.length > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-600">
                                    {intakeSessions.length}
                                </span>
                            )}
                        </span>
                    </button>
                )}
            </div>

                    {activeTab === 'details' && (
                        <form id="intake-form" onSubmit={handleSubmit} className="px-8 py-7">
                            {error && (
                                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="col-span-1 md:col-span-2">
                                    <label className={labelClass}>
                                        Academic Year <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="academic_year"
                                        value={formData.academic_year}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    >
                                        <option value="">Select Academic Year</option>
                                        {academicYears.map(year => (
                                            <option key={year.id} value={year.id}>
                                                {year.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className={labelClass}>
                                        Intake Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., 2024 Intake, Class of 2024"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Code <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., INT2024"
                                        className={`${inputClass} uppercase`}
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5">Short unique code for this intake</p>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Start Date <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className={labelClass}>
                                        Entry Grade
                                    </label>
                                    <select
                                        name="entry_grade"
                                        value={formData.entry_grade}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">Select Entry Grade (Optional)</option>
                                        {grades.map(grade => (
                                            <option key={grade.id} value={grade.id}>
                                                {grade.name} {grade.curriculum_name ? `(${grade.curriculum_name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1.5">The grade level where students in this intake join the school</p>
                                </div>

                                <div className="col-span-2">
                                    <label className={labelClass}>
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Optional description for this intake cohort"
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>

                                <div className="col-span-2 pt-1">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-[22px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all"></div>
                                        <span className="ml-2.5 text-sm font-medium text-gray-700">
                                            Active (accepting new students)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="px-8 py-7">
                            {loading ? (
                                <div className="text-center py-14">
                                    <Loader2 className="w-7 h-7 text-indigo-500 animate-spin mx-auto" />
                                    <p className="mt-3 text-sm text-gray-400">Loading sessions...</p>
                                </div>
                            ) : intakeSessions.length > 0 ? (
                                <div className="space-y-2.5">
                                    {intakeSessions.map((session, idx) => (
                                        <div key={session.id} className="group p-4 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/20 flex justify-between items-center bg-white transition-all duration-200">
                                            <div className="flex items-center gap-3.5">
                                                <div className={`flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold ${
                                                    session.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                                                        : session.status === 'closed'
                                                            ? 'bg-gray-50 text-gray-400 ring-1 ring-gray-200'
                                                            : 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-semibold text-gray-900">{session.name}</h4>
                                                        {session.status === 'active' && (
                                                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200/80">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${
                                                            session.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                                            session.status === 'closed' ? 'bg-gray-100 text-gray-500' :
                                                                'bg-blue-50 text-blue-700'
                                                        }`}>
                                                            {session.status}
                                                        </span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Users size={11} /> {session.student_count} enrolled
                                                        </span>
                                                        <span className="text-gray-200">|</span>
                                                        <span className="text-xs text-gray-400">
                                                            {session.start_date} &mdash; {session.end_date}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAutoGenerate}
                                        disabled={loading}
                                        className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={15} />
                                        Auto-Generate More Sessions
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-14 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                    <div className="p-3.5 bg-white rounded-xl inline-block mb-3 shadow-sm">
                                        <AlertCircle className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900">No active sessions</h3>
                                    <p className="text-sm text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                                        There are no class sessions associated with this intake yet.
                                    </p>
                                    <button
                                        onClick={handleAutoGenerate}
                                        disabled={loading}
                                        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all disabled:opacity-50"
                                    >
                                        <Sparkles size={15} />
                                        Auto-Generate Class Sessions
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
        </Modal>
    );
};

export default IntakeModal;


