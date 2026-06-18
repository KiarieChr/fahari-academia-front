import React, { useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Calendar,
    AlertCircle,
    DollarSign,
    Percent,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { payrollService } from '../../../../../services/payrollService';

const PAYETaxBandsConfig = ({ taxBands = [], taxReliefs = [], onUpdate, showToast }) => {
    const [editingBand, setEditingBand] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showReliefs, setShowReliefs] = useState(true);

    const [newBand, setNewBand] = useState({
        lower_limit: '',
        upper_limit: '',
        rate: '',
        effective_date: new Date().toISOString().split('T')[0],
        sort_order: taxBands.length
    });

    const [editForm, setEditForm] = useState({});

    const validateBand = (band) => {
        const errors = [];
        if (!band.lower_limit && band.lower_limit !== 0) {
            errors.push('Lower limit is required');
        }
        if (!band.rate && band.rate !== 0) {
            errors.push('Tax rate is required');
        }
        if (parseFloat(band.rate) < 0 || parseFloat(band.rate) > 100) {
            errors.push('Tax rate must be between 0 and 100');
        }
        if (band.upper_limit && parseFloat(band.lower_limit) >= parseFloat(band.upper_limit)) {
            errors.push('Upper limit must be greater than lower limit');
        }
        if (!band.effective_date) {
            errors.push('Effective date is required');
        }
        return errors;
    };

    const handleAddBand = async () => {
        const errors = validateBand(newBand);
        if (errors.length > 0) {
            showToast(errors.join(', '), 'error');
            return;
        }

        setSaving(true);
        try {
            await payrollService.createTaxBand({
                ...newBand,
                lower_limit: parseFloat(newBand.lower_limit),
                upper_limit: newBand.upper_limit ? parseFloat(newBand.upper_limit) : null,
                rate: parseFloat(newBand.rate)
            });
            showToast('Tax band added successfully');
            setIsAddingNew(false);
            setNewBand({
                lower_limit: '',
                upper_limit: '',
                rate: '',
                effective_date: new Date().toISOString().split('T')[0],
                sort_order: taxBands.length + 1
            });
            onUpdate();
        } catch (error) {
            showToast('Failed to add tax band', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEditBand = (band) => {
        setEditingBand(band.id);
        setEditForm({
            lower_limit: band.lower_limit,
            upper_limit: band.upper_limit || '',
            rate: band.rate,
            effective_date: band.effective_date,
            sort_order: band.sort_order
        });
    };

    const handleSaveEdit = async (id) => {
        const errors = validateBand(editForm);
        if (errors.length > 0) {
            showToast(errors.join(', '), 'error');
            return;
        }

        setSaving(true);
        try {
            await payrollService.updateTaxBand(id, {
                ...editForm,
                lower_limit: parseFloat(editForm.lower_limit),
                upper_limit: editForm.upper_limit ? parseFloat(editForm.upper_limit) : null,
                rate: parseFloat(editForm.rate)
            });
            showToast('Tax band updated successfully');
            setEditingBand(null);
            onUpdate();
        } catch (error) {
            showToast('Failed to update tax band', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBand = async (id) => {
        if (!confirm('Are you sure you want to delete this tax band?')) return;

        setSaving(true);
        try {
            await payrollService.deleteTaxBand(id);
            showToast('Tax band deleted');
            onUpdate();
        } catch (error) {
            showToast('Failed to delete tax band', 'error');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '∞';
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    // Get personal relief amount
    const personalRelief = taxReliefs.find(r => r.relief_type === 'personal');

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs p-2 mr-1">
                            PAYE
                        </div>
                        Pay As You Earn Tax Bands
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure income tax brackets for PAYE calculations (Kenya Revenue Authority)
                    </p>
                </div>
                <button
                    onClick={() => setIsAddingNew(true)}
                    disabled={isAddingNew}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Plus size={16} />
                    Add Tax Band
                </button>
            </div>

            {/* Tax Reliefs Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <button
                    onClick={() => setShowReliefs(!showReliefs)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <DollarSign className="text-green-600" size={18} />
                        <span className="font-semibold text-green-800">Tax Reliefs</span>
                    </div>
                    {showReliefs ? <ChevronUp size={18} className="text-green-600" /> : <ChevronDown size={18} className="text-green-600" />}
                </button>

                {showReliefs && (
                    <div className="mt-4 grid grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-4">
                        {taxReliefs.length > 0 ? (
                            taxReliefs.map((relief) => (
                                <div key={relief.id} className="bg-white p-3 rounded-lg border border-green-100">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">{relief.relief_type}</div>
                                    <div className="text-lg font-bold text-gray-900 mt-1">
                                        {relief.amount ? formatCurrency(relief.amount) : `${relief.percentage}%`}
                                    </div>
                                    <div className="text-sm text-gray-600">{relief.name}</div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-4 text-gray-500">
                                No tax reliefs configured. Click "Load KE Defaults" to set up.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tax Bands Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Band #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Lower Limit
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Upper Limit
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Tax Rate
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Effective Date
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Add New Row */}
                        {isAddingNew && (
                            <tr className="bg-blue-50">
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-500">New</span>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={newBand.lower_limit}
                                        onChange={(e) => setNewBand({ ...newBand, lower_limit: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={newBand.upper_limit}
                                        onChange={(e) => setNewBand({ ...newBand, upper_limit: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                        placeholder="Leave empty for ∞"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newBand.rate}
                                            onChange={(e) => setNewBand({ ...newBand, rate: e.target.value })}
                                            className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                            placeholder="0"
                                        />
                                        <Percent size={14} className="text-gray-400" />
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="date"
                                        value={newBand.effective_date}
                                        onChange={(e) => setNewBand({ ...newBand, effective_date: e.target.value })}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                    />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={handleAddBand}
                                            disabled={saving}
                                            className="p-1.5 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                        </button>
                                        <button
                                            onClick={() => setIsAddingNew(false)}
                                            className="p-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Existing Bands */}
                        {taxBands.length > 0 ? (
                            taxBands.map((band, index) => (
                                <tr key={band.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingBand === band.id ? (
                                            <input
                                                type="number"
                                                value={editForm.lower_limit}
                                                onChange={(e) => setEditForm({ ...editForm, lower_limit: e.target.value })}
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-900">{formatCurrency(band.lower_limit)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingBand === band.id ? (
                                            <input
                                                type="number"
                                                value={editForm.upper_limit}
                                                onChange={(e) => setEditForm({ ...editForm, upper_limit: e.target.value })}
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200"
                                                placeholder="Leave empty for ∞"
                                            />
                                        ) : (
                                            <span className={`font-medium ${band.upper_limit ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {formatCurrency(band.upper_limit)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {editingBand === band.id ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editForm.rate}
                                                    onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })}
                                                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-200"
                                                />
                                                <Percent size={14} className="text-gray-400" />
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                                                {band.rate}%
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingBand === band.id ? (
                                            <input
                                                type="date"
                                                value={editForm.effective_date}
                                                onChange={(e) => setEditForm({ ...editForm, effective_date: e.target.value })}
                                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar size={14} />
                                                {new Date(band.effective_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {editingBand === band.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleSaveEdit(band.id)}
                                                    disabled={saving}
                                                    className="p-1.5 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    <Save size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingBand(null)}
                                                    className="p-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditBand(band)}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBand(band.id)}
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
                                <td colSpan={6} className="px-4 py-12 text-center">
                                    <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
                                    <p className="text-gray-500">No tax bands configured</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Click "Load KE Defaults" to set up Kenya 2024 tax brackets
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
                        <strong>Note:</strong> Tax bands are cumulative. The rate shown applies only to income
                        within that band. Personal relief ({personalRelief ? formatCurrency(personalRelief.amount) : 'KES 2,400'}/month)
                        is automatically deducted after tax calculation (per KRA guidelines).
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PAYETaxBandsConfig;
