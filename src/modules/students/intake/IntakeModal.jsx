import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import studentSettingsService from '../../../services/studentSettingsService';
import Swal from 'sweetalert2';

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
            setAcademicYears(response.results || response || []);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {intake ? 'Edit Intake' : 'Add New Intake'}
                        </h2>
                        <p className="text-[0.8rem] text-gray-400 mt-0.5">
                            {intake ? 'Update intake details and manage sessions' : 'Create a new student intake cohort'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-7 bg-white">
                    <button
                        className={`py-3.5 px-5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    {intake && (
                        <button
                            className={`py-3.5 px-5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'sessions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            onClick={() => setActiveTab('sessions')}
                        >
                            Class Sessions
                        </button>
                    )}
                </div>

                <div className="p-0">
                    {activeTab === 'details' && (
                        <form onSubmit={handleSubmit} className="px-7 py-6">
                            {error && (
                                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Academic Year *
                                    </label>
                                    <select
                                        name="academic_year"
                                        value={formData.academic_year}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all"
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Intake Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., 2024 Intake, Class of 2024"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., INT2024"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm uppercase transition-all"
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5">Short unique code for this intake</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Entry Grade
                                    </label>
                                    <select
                                        name="entry_grade"
                                        value={formData.entry_grade}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all"
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Optional description for this intake cohort"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm resize-none transition-all"
                                    />
                                </div>

                                <div className="col-span-2 pt-1">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Active (accepting new students)
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? 'Saving...' : intake ? 'Update Intake' : 'Create Intake'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="px-7 py-6">
                            {loading ? (
                                <div className="text-center py-10">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                    <p className="mt-3 text-sm text-gray-400">Loading sessions...</p>
                                </div>
                            ) : intakeSessions.length > 0 ? (
                                <div className="space-y-3">
                                    {intakeSessions.map(session => (
                                        <div key={session.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 flex justify-between items-center bg-white shadow-sm transition-all">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-semibold text-gray-900">{session.name}</h4>
                                                    {session.status === 'active' && (
                                                        <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-200 animate-pulse">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${session.status === 'active' ? 'bg-green-50 text-green-700' :
                                                        session.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                                                            'bg-blue-50 text-blue-700'
                                                        }`}>
                                                        {session.status}
                                                    </span>
                                                    <span>• {session.student_count} Students Enrolled</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>{session.start_date} - {session.end_date}</span>
                                                </p>
                                            </div>
                                            <button className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100">
                                                View Details
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAutoGenerate}
                                        className="w-full mt-5 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                    >
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
                                        You can auto-generate all sessions for this academic year.
                                    </p>
                                    <button
                                        onClick={handleAutoGenerate}
                                        className="mt-5 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
                                    >
                                        Auto-Generate Class Sessions
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntakeModal;
