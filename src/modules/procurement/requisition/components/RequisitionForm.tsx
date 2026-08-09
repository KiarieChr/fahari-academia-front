
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, DollarSign, Calculator, AlertCircle, ArrowLeft } from 'lucide-react';

const RequisitionForm = ({ onCancel, onSubmit, initialData, inventoryItems = [], departments = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        priority: 'Medium',
        requiredDate: '',
        type: 'Goods',
        justification: '',
        budgetLine: '',
        items: [
            { id: Date.now(), itemId: null, name: '', category: '', quantity: 1, unit: 'Pcs', unitCost: 0, total: 0 }
        ]
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleGeneralChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInventoryItemSelect = (id, inventoryItemId) => {
        const selectedItem = inventoryItems.find((inv) => String(inv.id) === String(inventoryItemId));
        if (!selectedItem) {
            const newItems = formData.items.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        itemId: null,
                        unitCost: Number(item.unitCost || 0),
                        total: (item.quantity || 0) * (item.unitCost || 0),
                    };
                }
                return item;
            });
            setFormData({ ...formData, items: newItems });
            return;
        }

        const newItems = formData.items.map(item => {
            if (item.id === id) {
                const updated = {
                    ...item,
                    itemId: selectedItem.id,
                    name: selectedItem.name,
                    category: selectedItem.category || item.category || '',
                    unit: selectedItem.unit || item.unit || 'Pcs',
                    unitCost: Number(selectedItem.unitCost || item.unitCost || 0),
                };
                updated.total = (updated.quantity || 0) * (updated.unitCost || 0);
                return updated;
            }
            return item;
        });
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (id, field, value) => {
        const newItems = formData.items.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === 'name' && item.itemId) {
                    newItem.itemId = null;
                }
                if (field === 'quantity' || field === 'unitCost') {
                    newItem.total = (newItem.quantity || 0) * (newItem.unitCost || 0);
                }
                return newItem;
            }
            return item;
        });
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { id: Date.now(), itemId: null, name: '', category: '', quantity: 1, unit: 'Pcs', unitCost: 0, total: 0 }]
        });
    };

    const removeItem = (id) => {
        if (formData.items.length === 1) return;
        setFormData({
            ...formData,
            items: formData.items.filter(item => item.id !== id)
        });
    };

    const calculateGrandTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.type === 'Goods') {
            const missingInventoryLinks = formData.items.filter((item) => !item.itemId);
            if (missingInventoryLinks.length > 0) {
                alert('For Goods requisitions, every line must be selected from existing inventory items.');
                return;
            }
        }

        onSubmit({ ...formData, totalAmount: calculateGrandTotal() });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-500">
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="font-bold text-lg text-gray-900">
                        {initialData ? `Edit Requisition: ${initialData.id}` : 'Create New Requisition'}
                    </h3>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                {/* 1. General Information */}
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                    <FileText size={16} /> General Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requisition Title *</label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Office Supplies Q1"
                            value={formData.title}
                            onChange={handleGeneralChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <select
                            name="department"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.department}
                            onChange={handleGeneralChange}
                        >
                            <option value="">Select Department...</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Procurement Type</label>
                        <select
                            name="type"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.type}
                            onChange={handleGeneralChange}
                        >
                            <option value="Goods">Goods</option>
                            <option value="Services">Services</option>
                            <option value="Works">Works</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                        <select
                            name="priority"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.priority}
                            onChange={handleGeneralChange}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
                        <input
                            type="date"
                            name="requiredDate"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.requiredDate}
                            onChange={handleGeneralChange}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Justification / Purpose *</label>
                        <textarea
                            name="justification"
                            rows="2"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Explain why these items are needed..."
                            value={formData.justification}
                            onChange={handleGeneralChange}
                        ></textarea>
                    </div>
                </div>

                {/* 2. Itemized Requests */}
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                    <Calculator size={16} /> Itemized Request
                </h4>

                {formData.type === 'Goods' && (
                    <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                        Goods requisitions require selecting each line from existing inventory items.
                    </div>
                )}

                <div className="overflow-x-auto border rounded-xl mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">Item Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Qty</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Unit</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Est. Cost</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">Act</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {formData.items.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-2">
                                        <div className="space-y-2">
                                            <select
                                                className="w-full px-2 py-1 border border-gray-200 hover:border-gray-300 focus:border-blue-500 rounded outline-none"
                                                value={item.itemId || ''}
                                                onChange={(e) => handleInventoryItemSelect(item.id, e.target.value)}
                                            >
                                                <option value="">{formData.type === 'Goods' ? 'Select inventory item...' : 'Custom Item (not from inventory)'}</option>
                                                {inventoryItems.map((inv) => (
                                                    <option key={inv.id} value={inv.id}>
                                                        {inv.code} - {inv.name} (Stock: {inv.stock} {inv.unit})
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-transparent hover:border-gray-200 focus:border-blue-500 rounded outline-none transition-all"
                                                placeholder="Item name..."
                                                value={item.name}
                                                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                disabled={formData.type === 'Goods' && !!item.itemId}
                                                required
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            className="w-full px-2 py-1 border border-transparent hover:border-gray-200 focus:border-blue-500 rounded outline-none"
                                            value={item.category}
                                            onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Stationery">Stationery</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Furniture">Furniture</option>
                                            <option value="Lab Equipment">Lab Equipment</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-2 py-1 border border-gray-200 rounded text-center outline-none"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 border border-transparent hover:border-gray-200 rounded outline-none"
                                            value={item.unit}
                                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-2 py-1 border border-gray-200 rounded text-right outline-none"
                                            value={item.unitCost}
                                            onChange={(e) => handleItemChange(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                                        {(item.total || 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            disabled={formData.items.length === 1}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                            <tr>
                                <td colSpan="8" className="px-4 py-2">
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        <Plus size={16} /> Add Line Item
                                    </button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* 3. Budget & Allocation */}
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                            <DollarSign size={16} /> Budget & Funding
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Charge To Budget Line</label>
                                <select
                                    name="budgetLine"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                                    value={formData.budgetLine}
                                    onChange={handleGeneralChange}
                                >
                                    <option value="">Select Vote Head...</option>
                                    <option value="Office Expenses (vote-101)">Office Expenses (vote-101)</option>
                                    <option value="Lab Equipment (vote-205)">Lab Equipment (vote-205)</option>
                                    <option value="Library (vote-301)">Library (vote-301)</option>
                                    <option value="IT Maintenance (vote-402)">IT Maintenance (vote-402)</option>
                                    <option value="Sports (vote-501)">Sports (vote-501)</option>
                                </select>
                            </div>

                            {formData.budgetLine && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Available Budget:</span>
                                        <span className="font-medium text-green-600">KES 500,000</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>This Request:</span>
                                        <span className="font-medium text-blue-600">KES {calculateGrandTotal().toLocaleString()}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                        <span>Balance After:</span>
                                        <span className={`${500000 - calculateGrandTotal() < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                            KES {(500000 - calculateGrandTotal()).toLocaleString()}
                                        </span>
                                    </div>
                                    {500000 - calculateGrandTotal() < 0 && (
                                        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} /> Warning: Budget Exceeded
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Total */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 h-full flex flex-col justify-center items-center text-center">
                            <span className="text-gray-500 font-medium uppercase text-sm mb-1">Total Estimated Cost</span>
                            <span className="text-4xl font-extrabold text-blue-700">
                                <span className="text-2xl text-blue-500 mr-1">KES</span>
                                {calculateGrandTotal().toLocaleString()}
                            </span>
                            <p className="text-xs text-blue-400 mt-2">Inclusive of all taxes where applicable</p>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm hover:shadow-md flex items-center gap-2 transition-all"
                    >
                        <Save size={18} />
                        Save Requisition
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequisitionForm;
