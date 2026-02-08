import React, { useState, useEffect } from 'react';
import { Plus, Users, ArrowRight, RefreshCw, Search, Filter } from 'lucide-react';
import studentSettingsService from '../../../../../services/studentSettingsService';
import EnrollmentModal from '../../../enrollment/EnrollmentModal';
import PromotionModal from '../../../enrollment/PromotionModal';

const EnrollmentTab = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [selectedEnrollments, setSelectedEnrollments] = useState([]);
    const [filters, setFilters] = useState({
        academic_year: '',
        term: '',
        status: '',
        is_active: 'true'
    });

    useEffect(() => {
        fetchEnrollments();
    }, [filters]);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const response = await studentSettingsService.getEnrollments(filters);
            // Handle both paginated and non-paginated responses
            const data = response.results || response || [];
            setEnrollments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEnrollment = (enrollment) => {
        setSelectedEnrollments(prev => {
            const exists = prev.find(e => e.id === enrollment.id);
            if (exists) {
                return prev.filter(e => e.id !== enrollment.id);
            }
            return [...prev, enrollment];
        });
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            promoted: 'bg-blue-100 text-blue-800',
            repeated: 'bg-yellow-100 text-yellow-800',
            transferred_out: 'bg-purple-100 text-purple-800',
            completed: 'bg-gray-100 text-gray-800',
            withdrawn: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Student Enrollments</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage student enrollments, promotions, and progression
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPromotionModal(true)}
                        disabled={selectedEnrollments.length === 0}
                        className="btn btn-primary d-flex align-items-center gap-2"
                    >
                        <ArrowRight className="w-4 h-4" />
                        Promote ({selectedEnrollments.length})
                    </button>
                    <button
                        onClick={() => setShowEnrollmentModal(true)}
                        className="btn btn-success d-flex align-items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Enrollment
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.is_active}
                            onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All</option>
                            <option value="true">Active Only</option>
                            <option value="false">Inactive Only</option>
                        </select>
                    </div>
                    <div className="sm:col-span-3 flex items-end">
                        <button
                            onClick={fetchEnrollments}
                            className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Enrollments List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : enrollments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">No enrollments found</p>
                    <button
                        onClick={() => setShowEnrollmentModal(true)}
                        className="btn btn-link mt-3"
                    >
                        Create your first enrollment
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedEnrollments(enrollments.filter(e => e.is_active));
                                            } else {
                                                setSelectedEnrollments([]);
                                            }
                                        }}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {enrollments.map((enrollment) => (
                                <tr key={enrollment.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedEnrollments.some(e => e.id === enrollment.id)}
                                            onChange={() => handleSelectEnrollment(enrollment)}
                                            disabled={!enrollment.is_active}
                                            className="rounded border-gray-300"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {enrollment.student_name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {enrollment.academic_year_name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {enrollment.term_name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {enrollment.grade_name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {enrollment.stream_name || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(enrollment.status)}`}>
                                            {enrollment.status_display}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {enrollment.enrollment_type_display}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            <EnrollmentModal
                isOpen={showEnrollmentModal}
                onClose={() => setShowEnrollmentModal(false)}
                onSuccess={() => {
                    fetchEnrollments();
                    setShowEnrollmentModal(false);
                }}
            />

            <PromotionModal
                isOpen={showPromotionModal}
                onClose={() => setShowPromotionModal(false)}
                onSuccess={() => {
                    fetchEnrollments();
                    setSelectedEnrollments([]);
                    setShowPromotionModal(false);
                }}
                selectedStudents={selectedEnrollments.map(e => ({
                    id: e.student,
                    name: e.student_name
                }))}
            />
        </div>
    );
};

export default EnrollmentTab;
