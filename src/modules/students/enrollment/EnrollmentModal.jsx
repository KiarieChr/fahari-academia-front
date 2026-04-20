import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { inputClass, labelClass } from '../../../components/ui/FormField';
import studentSettingsService from '../../../services/studentSettingsService';
import { institutionService } from '../../../services/institutionService';

const EnrollmentModal = ({ isOpen, onClose, onSuccess, studentId = null }) => {
    const [formData, setFormData] = useState({
        student: studentId || '',
        academic_year: '',
        term: '',
        curriculum: '',
        grade: '',
        stream: '',
        campus: '',
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
        streams: [],
        campuses: []
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
            const [academicYears, curricula, campusesRes] = await Promise.all([
                studentSettingsService.getAcademicYears(),
                studentSettingsService.getCurricula(),
                institutionService.getCampuses()
            ]);

            const yearsList = academicYears.data || [];
            setOptions(prev => ({
                ...prev,
                academicYears: yearsList,
                curricula: curricula.data || [],
                campuses: campusesRes.results || campusesRes || []
            }));

            // Auto-select the current academic year
            const currentYear = yearsList.find(y => y.is_current);
            if (currentYear) {
                setFormData(prev => prev.academic_year ? prev : { ...prev, academic_year: currentYear.id });
            }
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
            if (!submitData.campus) delete submitData.campus;

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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Enrollment"
            subtitle="Enroll a student into a class for the selected academic year"
            size="lg"
            accentColor="bg-indigo-500"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton form="enrollment-form" loading={loading}>
                        <Save className="w-4 h-4" />
                        {loading ? 'Creating...' : 'Create Enrollment'}
                    </Modal.SubmitButton>
                </>
            }
        >
                <form id="enrollment-form" onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-5">
                        {!studentId && (
                            <div className="col-span-2">
                                <label className={labelClass}>Student *</label>
                                <select name="student" value={formData.student} onChange={handleChange}
                                    required disabled={loadingStudents} className={inputClass}>
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

                                {formData.student && (() => {
                                    const selectedStudent = options.students.find(s => s.id === parseInt(formData.student));
                                    if (selectedStudent && selectedStudent.intake_year_name) {
                                        return (
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
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
                            <label className={labelClass}>Academic Year *</label>
                            <select name="academic_year" value={formData.academic_year} onChange={handleChange}
                                required className={inputClass}>
                                <option value="">Select Academic Year</option>
                                {options.academicYears.map(year => (
                                    <option key={year.id} value={year.id}>{year.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Term *</label>
                            <select name="term" value={formData.term} onChange={handleChange}
                                required disabled={!formData.academic_year} className={inputClass}>
                                <option value="">Select Term</option>
                                {options.terms.map(term => (
                                    <option key={term.id} value={term.id}>{term.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Curriculum *</label>
                            <select name="curriculum" value={formData.curriculum} onChange={handleChange}
                                required className={inputClass}>
                                <option value="">Select Curriculum</option>
                                {options.curricula.map(curriculum => (
                                    <option key={curriculum.id} value={curriculum.id}>{curriculum.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Class/Grade *</label>
                            <select name="grade" value={formData.grade} onChange={handleChange}
                                required disabled={!formData.curriculum} className={inputClass}>
                                <option value="">Select Grade</option>
                                {options.grades.map(grade => (
                                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Stream (Optional)</label>
                            <select name="stream" value={formData.stream} onChange={handleChange}
                                disabled={!formData.grade} className={inputClass}>
                                <option value="">No Stream</option>
                                {options.streams.map(stream => (
                                    <option key={stream.id} value={stream.id}>{stream.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Campus</label>
                            <select name="campus" value={formData.campus} onChange={handleChange}
                                className={inputClass}>
                                <option value="">Select Campus</option>
                                {options.campuses.map(campus => (
                                    <option key={campus.id} value={campus.id}>{campus.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Enrollment Type *</label>
                            <select name="enrollment_type" value={formData.enrollment_type} onChange={handleChange}
                                required className={inputClass}>
                                <option value="new_admission">New Admission</option>
                                <option value="transfer_in">Transfer In</option>
                                <option value="curriculum_change">Curriculum Change</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Enrollment Date *</label>
                            <input type="date" name="enrollment_date" value={formData.enrollment_date}
                                onChange={handleChange} required className={inputClass} />
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Remarks</label>
                            <textarea name="remarks" value={formData.remarks} onChange={handleChange}
                                rows={3} className={inputClass + ' resize-none'}
                                placeholder="Additional notes or comments..." />
                        </div>
                    </div>
                </form>
        </Modal>
    );
};

export default EnrollmentModal;
