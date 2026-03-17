import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    AlertCircle,
    Calendar,
    BadgePercent,
    DollarSign,
    ToggleLeft,
    ToggleRight,
    Info
} from 'lucide-react';
import { payrollService } from '../../../../../services/payrollService';

const CustomStatutoryDeductions = ({ onUpdate, showToast }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    const [newDeduction, setNewDeduction] = useState({
        code: '',
        name: '',
        category: 'statutory',
        is_mandatory: true,
        calculation_type: 'percentage',
        rate: '',
        fixed_amount: '',
        gl_account_code: '',
        description: ''
    });

    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        loadDeductionTypes();
    }, []);

    const loadDeductionTypes = async () => {
        setLoading(true);
        try {
            const response = await payrollService.getDeductionTypes();
            // Filter to statutory deductions only
            const statutory = (response.data?.deduction_types || [])
                .filter(d => d.category === 'statutory');
            setDeductionTypes(statutory);
        } catch (error) {
            showToast('Failed to load deduction types', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateDeduction = (data) => {
        const errors = [];
        if (!data.code || data.code.trim().length < 2) {
            errors.push('Code is required (min 2 characters)');
        }
        if (!data.name || data.name.trim().length < 3) {
            errors.push('Name is required (min 3 characters)');
        }
        return errors;
    };

    const handleAddDeduction = async () => {
        const errors = validateDeduction(newDeduction);
        if (errors.length > 0) {
            showToast(errors.join(', '), 'error');
            return;
        }

        setSaving(true);
        try {
            await payrollService.createDeductionType({
                ...newDeduction,
                code: newDeduction.code.toUpperCase()
            });
            showToast('Statutory deduction added successfully');
            setIsAddingNew(false);
            setNewDeduction({
                code: '',
                name: '',
                category: 'statutory',
                is_mandatory: true,
                calculation_type: 'percentage',
                rate: '',
                fixed_amount: '',
                gl_account_code: '',
                description: ''
            });
            loadDeductionTypes();
            onUpdate();
        } catch (error) {
            showToast('Failed to add deduction', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEditDeduction = (deduction) => {
        setEditingId(deduction.id);
        setEditForm({
            code: deduction.code,
            name: deduction.name,
            is_mandatory: deduction.is_mandatory,
            gl_account_code: deduction.gl_account_code,
            description: deduction.description
        });
    };

    const handleSaveEdit = async (id) => {
        const errors = validateDeduction(editForm);
        if (errors.length > 0) {
            showToast(errors.join(', '), 'error');
            return;
        }

        setSaving(true);
        try {
            await payrollService.updateDeductionType(id, editForm);
            showToast('Deduction updated successfully');
            setEditingId(null);
            loadDeductionTypes();
            onUpdate();
        } catch (error) {
            showToast('Failed to update deduction', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDeduction = async (id) => {
        if (!confirm('Are you sure you want to delete this statutory deduction?')) return;

        setSaving(true);
        try {
            await payrollService.deleteDeductionType(id);
            showToast('Deduction deleted');
            loadDeductionTypes();
            onUpdate();
        } catch (error) {
            showToast('Failed to delete deduction', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleMandatory = async (id, currentValue) => {
        setSaving(true);
        try {
            await payrollService.updateDeductionType(id, { is_mandatory: !currentValue });
            showToast(`Deduction marked as ${!currentValue ? 'mandatory' : 'optional'}`);
            loadDeductionTypes();
        } catch (error) {
            showToast('Failed to update', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Pre-defined statutory deduction templates
    const templates = [
        { code: 'NITA', name: 'NITA Levy', description: 'National Industrial Training Authority Levy (KES 50/month)' },
        { code: 'HELB', name: 'HELB Loan Deduction', description: 'Higher Education Loans Board repayment' },
        { code: 'COURT', name: 'Court Order', description: 'Court-mandated salary deductions' },
        { code: 'APT', name: 'Attachment of Property Tax', description: 'KRA-mandated tax recovery' }
    ];

    const handleUseTemplate = (template) => {
        setNewDeduction(prev => ({
            ...prev,
            code: template.code,
            name: template.name,
            description: template.description
        }));
        setIsAddingNew(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                            <BadgePercent size={20} />
                        </div>
                        Custom Statutory Deductions
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure additional statutory deductions like NITA, HELB, court orders
                    </p>
                </div>
                <button
                    onClick={() => setIsAddingNew(true)}
                    disabled={isAddingNew}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                    <Plus size={16} />
                    Add Deduction
                </button>
            </div>

            {/* Quick Add Templates */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="text-gray-600" size={16} />
                    <span className="font-semibold text-gray-700 text-sm">Quick Add Templates</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {templates.map((template) => (
                        <button
                            key={template.code}
                            onClick={() => handleUseTemplate(template)}
                            disabled={deductionTypes.some(d => d.code === template.code)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${deductionTypes.some(d => d.code === template.code)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            + {template.code}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add New Form */}
            {isAddingNew && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">Add New Statutory Deduction</h4>
                        <button
                            onClick={() => setIsAddingNew(false)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                Code *
                            </label>
                            <input
                                type="text"
                                value={newDeduction.code}
                                onChange={(e) => setNewDeduction(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                placeholder="e.g., NITA"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
                                maxLength={10}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={newDeduction.name}
                                onChange={(e) => setNewDeduction(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., NITA Levy"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                GL Account
                            </label>
                            <input
                                type="text"
                                value={newDeduction.gl_account_code}
                                onChange={(e) => setNewDeduction(prev => ({ ...prev, gl_account_code: e.target.value }))}
                                placeholder="e.g., 2100-001"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                            Description
                        </label>
                        <textarea
                            value={newDeduction.description}
                            onChange={(e) => setNewDeduction(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of the deduction..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newDeduction.is_mandatory}
                                onChange={(e) => setNewDeduction(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Mandatory for all employees</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => setIsAddingNew(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddDeduction}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? 'Adding...' : 'Add Deduction'}
                        </button>
                    </div>
                </div>
            )}

            {/* Deductions Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                GL Account
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Mandatory
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : deductionTypes.length > 0 ? (
                            deductionTypes.map((deduction) => (
                                <tr key={deduction.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        {editingId === deduction.id ? (
                                            <input
                                                type="text"
                                                value={editForm.code}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                                className="px-2 py-1 border border-gray-300 rounded text-sm uppercase w-24"
                                            />
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-800 rounded font-mono text-sm font-semibold">
                                                {deduction.code}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === deduction.id ? (
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="px-2 py-1 border border-gray-300 rounded text-sm w-full max-w-xs"
                                            />
                                        ) : (
                                            <div>
                                                <span className="font-medium text-gray-900">{deduction.name}</span>
                                                {deduction.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{deduction.description}</p>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === deduction.id ? (
                                            <input
                                                type="text"
                                                value={editForm.gl_account_code}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, gl_account_code: e.target.value }))}
                                                className="px-2 py-1 border border-gray-300 rounded text-sm w-28"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-600 font-mono">
                                                {deduction.gl_account_code || '-'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleToggleMandatory(deduction.id, deduction.is_mandatory)}
                                            disabled={saving || editingId === deduction.id}
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${deduction.is_mandatory
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {deduction.is_mandatory ? (
                                                <><ToggleRight size={14} /> Yes</>
                                            ) : (
                                                <><ToggleLeft size={14} /> No</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {editingId === deduction.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleSaveEdit(deduction.id)}
                                                    disabled={saving}
                                                    className="p-1.5 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    <Save size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditDeduction(deduction)}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDeduction(deduction.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center">
                                    <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
                                    <p className="text-gray-500">No custom statutory deductions configured</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Use the templates above or click "Add Deduction" to create one
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Info Footer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-amber-800">
                        <strong>Note:</strong> Custom statutory deductions defined here are master data types.
                        To apply these to specific employees, assign them in the employee's pay profile or
                        use bulk assignment in the payroll processing module.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomStatutoryDeductions;
