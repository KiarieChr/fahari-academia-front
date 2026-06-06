import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { inputClass, labelClass } from '../../../components/ui/FormField';
import studentSettingsService from '../../../services/studentSettingsService';

const PromotionModal = ({ isOpen, onClose, onSuccess, selectedStudents = [] }) => {
    const [formData, setFormData] = useState({
        target_academic_year: '',
        target_term: '',
        target_grade: '',
        remarks: 'Promoted to next class'
    });

    const [options, setOptions] = useState({
        academicYears: [],
        terms: [],
        grades: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            setResults(null);
            setError(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.target_academic_year) {
            fetchTerms(formData.target_academic_year);
        }
    }, [formData.target_academic_year]);

    const fetchOptions = async () => {
        try {
            const [academicYears, grades] = await Promise.all([
                studentSettingsService.getAcademicYears(),
                studentSettingsService.getClasses()
            ]);

            const yearsList = academicYears.data || [];
            setOptions(prev => ({
                ...prev,
                academicYears: yearsList,
                grades: grades.data || []
            }));

            // Auto-select the current academic year
            const currentYear = yearsList.find(y => y.is_current);
            if (currentYear) {
                setFormData(prev => prev.target_academic_year ? prev : { ...prev, target_academic_year: currentYear.id });
            }
        } catch (err) {
            console.error('Error fetching options:', err);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const submitData = {
                student_ids: selectedStudents.map(s => s.id),
                target_academic_year: parseInt(formData.target_academic_year),
                target_term: parseInt(formData.target_term),
                remarks: formData.remarks
            };

            if (formData.target_grade) {
                submitData.target_grade = parseInt(formData.target_grade);
            }

            const response = await studentSettingsService.promoteStudents(submitData);
            setResults(response.data);

            if (response.data.errors && response.data.errors.length === 0) {
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to promote students');
            console.error('Promotion error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Promote Students"
            subtitle={`Promoting ${selectedStudents.length} student${selectedStudents.length !== 1 ? 's' : ''}`}
            size="lg"
            accentColor="bg-blue-500"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose}>
                        {results ? 'Close' : 'Cancel'}
                    </Modal.CancelButton>
                    {!results && (
                        <Modal.SubmitButton form="promotion-form" loading={loading}>
                            <ArrowRight className="w-4 h-4" />
                            {loading ? 'Promoting...' : 'Promote Students'}
                        </Modal.SubmitButton>
                    )}
                </>
            }
        >
                <form id="promotion-form" onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    )}

                    {results && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-green-900">
                                    Successfully promoted {results.promoted_count} student{results.promoted_count !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {results.errors && results.errors.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-green-200">
                                    <p className="text-sm font-medium text-green-900 mb-2">Errors:</p>
                                    <ul className="text-sm text-green-800 space-y-1">
                                        {results.errors.map((err, idx) => (
                                            <li key={idx}>Student ID {err.student_id}: {err.error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {!results && (
                        <>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> If you don't specify a target grade, students will be automatically promoted to the next grade in their current curriculum based on level order.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Target Academic Year *</label>
                                    <select name="target_academic_year" value={formData.target_academic_year}
                                        onChange={handleChange} required className={inputClass}>
                                        <option value="">Select Academic Year</option>
                                        {options.academicYears.map(year => (
                                            <option key={year.id} value={year.id}>{year.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Target Term *</label>
                                    <select name="target_term" value={formData.target_term}
                                        onChange={handleChange} required disabled={!formData.target_academic_year}
                                        className={inputClass}>
                                        <option value="">Select Term</option>
                                        {options.terms.map(term => (
                                            <option key={term.id} value={term.id}>{term.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className={labelClass}>Target Grade (Optional)</label>
                                    <select name="target_grade" value={formData.target_grade}
                                        onChange={handleChange} className={inputClass}>
                                        <option value="">Auto-calculate next grade</option>
                                        {options.grades.map(grade => (
                                            <option key={grade.id} value={grade.id}>
                                                {grade.curriculum_name} - {grade.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className={labelClass}>Remarks</label>
                                    <textarea name="remarks" value={formData.remarks} onChange={handleChange}
                                        rows={3} className={inputClass + ' resize-none'}
                                        placeholder="Promotion remarks..." />
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Students to be promoted:</p>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {selectedStudents.map(student => (
                                        <div key={student.id} className="text-sm text-gray-600 flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4 text-blue-500" />
                                            {student.name || `Student ID: ${student.id}`}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </form>
        </Modal>
    );
};

export default PromotionModal;
