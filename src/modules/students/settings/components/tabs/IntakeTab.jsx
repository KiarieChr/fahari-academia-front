import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Edit, Trash2, Search, Loader2, BarChart3, CheckCircle2 } from 'lucide-react';
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
                    <h2 className="text-xl font-bold text-gray-900">Student Intakes</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage student intake cohorts and admission groups
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add New Intake
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search intakes by name, code, or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all bg-white"
                />
            </div>

            {/* Intakes Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin mx-auto" />
                        <p className="mt-3 text-sm text-gray-400">Loading intakes...</p>
                    </div>
                ) : filteredIntakes.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="p-3.5 bg-gray-50 rounded-xl inline-block mb-3">
                            <Calendar className="h-7 w-7 text-gray-300" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">No intakes found</h3>
                        <p className="mt-1.5 text-sm text-gray-400 max-w-xs mx-auto">
                            {searchTerm ? 'Try adjusting your search' : 'Get started by creating a new intake cohort'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Intake
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Intake Name</th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Academic Year</th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Entry Grade</th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Students</th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredIntakes.map((intake) => (
                                    <tr key={intake.id} className="hover:bg-indigo-50/30 cursor-pointer transition-colors" onDoubleClick={() => handleEdit(intake)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{intake.name}</div>
                                            {intake.description && (
                                                <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{intake.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                                                {intake.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {intake.academic_year_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {intake.start_date ? new Date(intake.start_date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {intake.entry_grade_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-medium">{intake.student_count || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${intake.is_active
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${intake.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                                {intake.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(intake)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Edit intake"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(intake.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete intake"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-50 text-gray-500">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Intakes</div>
                            <div className="text-2xl font-bold text-gray-900 mt-0.5">{intakes.length}</div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Intakes</div>
                            <div className="text-2xl font-bold text-emerald-600 mt-0.5">
                                {intakes.filter(i => i.is_active).length}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Students</div>
                            <div className="text-2xl font-bold text-indigo-600 mt-0.5">
                                {intakes.reduce((sum, i) => sum + (i.student_count || 0), 0)}
                            </div>
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
