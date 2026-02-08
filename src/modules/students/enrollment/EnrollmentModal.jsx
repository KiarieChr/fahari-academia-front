import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import studentSettingsService from '../../../services/studentSettingsService';

const EnrollmentModal = ({ isOpen, onClose, onSuccess, studentId = null }) => {
    const [formData, setFormData] = useState({
        student: studentId || '',
        academic_year: '',
        term: '',
        curriculum: '',
        grade: '',
        stream: '',
        enrollment_type: 'new_admission',
        enrollment_date: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    const [options, setOptions] = useState({
        students: [],
        academicYears: [],
        terms: [],
        curricula: [],
        grades: [],
        streams: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            if (!studentId) {
                fetchStudents();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.academic_year) {
            fetchTerms(formData.academic_year);
        }
    }, [formData.academic_year]);

    useEffect(() => {
        if (formData.curriculum) {
            fetchGrades(formData.curriculum);
        }
    }, [formData.curriculum]);

    useEffect(() => {
        if (formData.grade) {
            fetchStreams(formData.grade);
        }
    }, [formData.grade]);

    const fetchOptions = async () => {
        try {
            const [academicYears, curricula] = await Promise.all([
                studentSettingsService.getAcademicYears(),
                studentSettingsService.getCurricula()
            ]);

            setOptions(prev => ({
                ...prev,
                academicYears: academicYears.data || [],
                curricula: curricula.data || []
            }));
        } catch (err) {
            console.error('Error fetching options:', err);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoadingStudents(true);
            const response = await fetch('/api/students/', {
                credentials: 'include'
            });
            const data = await response.json();
            setOptions(prev => ({
                ...prev,
                students: data.results || data || []
            }));
        } catch (err) {
            console.error('Error fetching students:', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchTerms = async (academicYearId) => {
        try {
            const response = await studentSettingsService.getTerms();
            const filteredTerms = response.data.filter(term => term.academic_year === parseInt(academicYearId));
            setOptions(prev => ({ ...prev, terms: filteredTerms }));
        } catch (err) {
            console.error('Error fetching terms:', err);
        }
    };

    const fetchGrades = async (curriculumId) => {
        try {
            const response = await studentSettingsService.getClasses();
            const filteredGrades = response.data.filter(grade => grade.curriculum === parseInt(curriculumId));
            setOptions(prev => ({ ...prev, grades: filteredGrades }));
        } catch (err) {
            console.error('Error fetching grades:', err);
        }
    };

    const fetchStreams = async (gradeId) => {
        try {
            const response = await studentSettingsService.getStreams();
            const filteredStreams = response.data.filter(stream => stream.grade === parseInt(gradeId));
            setOptions(prev => ({ ...prev, streams: filteredStreams }));
        } catch (err) {
            console.error('Error fetching streams:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const submitData = { ...formData };
            if (!submitData.stream) delete submitData.stream;

            await studentSettingsService.createEnrollment(submitData);
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create enrollment');
            console.error('Enrollment creation error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Enrollment</h2>
                    <button
                        onClick={onClose}
                        className="btn-close"
                        aria-label="Close"
                    >
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    )}


                    <div className="grid grid-cols-2 gap-4">
                        {!studentId && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Student *
                                </label>
                                <select
                                    name="student"
                                    value={formData.student}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingStudents}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                >
                                    <option value="">
                                        {loadingStudents ? 'Loading students...' : 'Select Student'}
                                    </option>
                                    {options.students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.student?.first_name} {student.student?.last_name}
                                            {student.intake_year_name && ` (${student.intake_year_name} Intake)`}
                                            {student.admission_number && ` - ${student.admission_number}`}
                                        </option>
                                    ))}
                                </select>

                                {/* Show selected student's intake info */}
                                {formData.student && (() => {
                                    const selectedStudent = options.students.find(s => s.id === parseInt(formData.student));
                                    if (selectedStudent && selectedStudent.intake_year_name) {
                                        return (
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Intake:</strong> {selectedStudent.intake_year_name}
                                                    {selectedStudent.admission_date && (
                                                        <> • <strong>Admitted:</strong> {new Date(selectedStudent.admission_date).toLocaleDateString()}</>
                                                    )}
                                                    {selectedStudent.current_grade_name && (
                                                        <> • <strong>Current Grade:</strong> {selectedStudent.current_grade_name}</>
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Academic Year *
                            </label>
                            <select
                                name="academic_year"
                                value={formData.academic_year}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Academic Year</option>
                                {options.academicYears.map(year => (
                                    <option key={year.id} value={year.id}>{year.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Term *
                            </label>
                            <select
                                name="term"
                                value={formData.term}
                                onChange={handleChange}
                                required
                                disabled={!formData.academic_year}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            >
                                <option value="">Select Term</option>
                                {options.terms.map(term => (
                                    <option key={term.id} value={term.id}>{term.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Curriculum *
                            </label>
                            <select
                                name="curriculum"
                                value={formData.curriculum}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Curriculum</option>
                                {options.curricula.map(curriculum => (
                                    <option key={curriculum.id} value={curriculum.id}>{curriculum.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Class/Grade *
                            </label>
                            <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                required
                                disabled={!formData.curriculum}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            >
                                <option value="">Select Grade</option>
                                {options.grades.map(grade => (
                                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stream (Optional)
                            </label>
                            <select
                                name="stream"
                                value={formData.stream}
                                onChange={handleChange}
                                disabled={!formData.grade}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            >
                                <option value="">No Stream</option>
                                {options.streams.map(stream => (
                                    <option key={stream.id} value={stream.id}>{stream.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enrollment Type *
                            </label>
                            <select
                                name="enrollment_type"
                                value={formData.enrollment_type}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="new_admission">New Admission</option>
                                <option value="transfer_in">Transfer In</option>
                                <option value="curriculum_change">Curriculum Change</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enrollment Date *
                            </label>
                            <input
                                type="date"
                                name="enrollment_date"
                                value={formData.enrollment_date}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Additional notes or comments..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary d-flex align-items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Creating...' : 'Create Enrollment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnrollmentModal;
