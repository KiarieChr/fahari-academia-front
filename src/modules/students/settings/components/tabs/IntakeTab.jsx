import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Edit, Trash2, Search } from 'lucide-react';
import studentSettingsService from '../../../../../services/studentSettingsService';
import IntakeModal from '../../../intake/IntakeModal';

const IntakeTab = () => {
    const [intakes, setIntakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingIntake, setEditingIntake] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchIntakes();
    }, []);

    const fetchIntakes = async () => {
        try {
            setLoading(true);
            const response = await studentSettingsService.getIntakes();
            const data = response.results || response || [];
            setIntakes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching intakes:', error);
            setIntakes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (intake) => {
        setEditingIntake(intake);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this intake? This action cannot be undone.')) {
            return;
        }

        try {
            await studentSettingsService.deleteIntake(id);
            fetchIntakes();
        } catch (error) {
            console.error('Error deleting intake:', error);
            alert('Failed to delete intake. It may have students assigned to it.');
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingIntake(null);
    };

    const handleSuccess = () => {
        fetchIntakes();
        handleModalClose();
    };

    const filteredIntakes = intakes.filter(intake =>
        intake.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intake.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intake.academic_year_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Student Intakes</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage student intake cohorts and admission groups
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary d-flex align-items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Intake
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search intakes by name, code, or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Intakes Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Loading intakes...</p>
                    </div>
                ) : filteredIntakes.length === 0 ? (
                    <div className="p-8 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No intakes found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search' : 'Get started by creating a new intake cohort'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 btn btn-primary d-flex align-items-center gap-2 mx-auto"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Intake
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Intake Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Academic Year
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Entry Grade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredIntakes.map((intake) => (
                                    <tr key={intake.id} className="hover:bg-gray-50 cursor-pointer" onDoubleClick={() => handleEdit(intake)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{intake.name}</div>
                                            {intake.description && (
                                                <div className="text-sm text-gray-500">{intake.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {intake.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {intake.academic_year_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {intake.start_date ? new Date(intake.start_date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {intake.entry_grade_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Users className="w-4 h-4 mr-1 text-gray-400" />
                                                {intake.student_count || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${intake.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {intake.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(intake)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                title="Edit intake"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(intake.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete intake"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {!loading && filteredIntakes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Total Intakes</div>
                        <div className="text-2xl font-semibold text-gray-900">{intakes.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Active Intakes</div>
                        <div className="text-2xl font-semibold text-green-600">
                            {intakes.filter(i => i.is_active).length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Total Students</div>
                        <div className="text-2xl font-semibold text-blue-600">
                            {intakes.reduce((sum, i) => sum + (i.student_count || 0), 0)}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <IntakeModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onSuccess={handleSuccess}
                    intake={editingIntake}
                />
            )}
        </div>
    );
};

export default IntakeTab;
