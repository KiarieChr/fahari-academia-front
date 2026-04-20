import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import studentSettingsService from '../../../../services/studentSettingsService';
import DateInput from '../../../../components/common/DateInput';
import Modal from '../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../components/ui/FormField';

const TermSetup = () => {
    const [terms, setTerms] = useState([]);
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        academic_year: '',
        order: 1,
        start_date: '',
        end_date: '',
        is_current: false,
        status: 'active'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [termsRes, yearsRes] = await Promise.all([
                studentSettingsService.getTerms(),
                studentSettingsService.getAcademicYears()
            ]);
            setTerms(termsRes.results || termsRes);
            setYears(yearsRes.results || yearsRes);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingTerm) {
                await studentSettingsService.updateTerm(editingTerm.id, formData);
                toast.success('Term updated successfully');
            } else {
                await studentSettingsService.createTerm(formData);
                toast.success('Term added successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to save term');
        }
    };

    const handleEdit = (term) => {
        setEditingTerm(term);
        setFormData({
            ...term,
            academic_year: term.academic_year
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this term?')) {
            try {
                await studentSettingsService.deleteTerm(id);
                toast.success('Term deleted');
                fetchData();
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Terms...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Academic Terms</h3>
                    <p className="text-sm text-gray-500">Configure terms/semesters for each academic year</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTerm(null);
                        setFormData({ name: '', academic_year: years[0]?.id || '', order: terms.length + 1, start_date: '', end_date: '', is_current: false, status: 'active' });
                        setIsModalOpen(true);
                    }}
                    className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill shadow-sm"
                >
                    <Plus size={18} /> Add Term
                </button>
            </div>

            {terms.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No terms configured yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {terms.map((term) => (
                                <tr
                                    key={term.id}
                                    className={`hover:bg-gray-50/50 transition-colors ${term.is_current ? 'bg-indigo-50/60 border-l-4 border-indigo-500' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            {term.name}
                                            {term.is_current && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{term.academic_year_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {term.start_date} - {term.end_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${term.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {term.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {term.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button onClick={() => handleEdit(term)} className="btn btn-sm btn-outline-primary border-0">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(term.id)} className="btn btn-sm btn-outline-danger border-0">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingTerm ? 'Edit Term' : 'Add New Term'}
                    subtitle="Configure academic term details"
                    icon={<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600"><Calendar size={20} /></div>}
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setIsModalOpen(false)} />
                            <Modal.SubmitButton onClick={handleSave}>
                                {editingTerm ? 'Update Term' : 'Create Term'}
                            </Modal.SubmitButton>
                        </>
                    }
                >
                    <form onSubmit={handleSave} className="space-y-5">
                        <div>
                            <label className={labelClass}>Term Name</label>
                            <input
                                type="text"
                                required
                                className={inputClass}
                                placeholder="e.g. Term 1"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Academic Year</label>
                            <select
                                required
                                className={inputClass}
                                value={formData.academic_year}
                                onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                            >
                                {years.map(y => (
                                    <option key={y.id} value={y.id}>{y.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Start Date</label>
                                <DateInput
                                    required
                                    value={formData.start_date}
                                    onChange={dateStr => setFormData(prev => ({ ...prev, start_date: dateStr }))}
                                    placeholder="Start Date"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>End Date</label>
                                <DateInput
                                    required
                                    value={formData.end_date}
                                    onChange={dateStr => setFormData(prev => ({ ...prev, end_date: dateStr }))}
                                    placeholder="End Date"
                                    minDate={formData.start_date}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.is_current}
                                    onChange={e => setFormData({ ...formData, is_current: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Set as Current Term</span>
                            </label>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default TermSetup;

