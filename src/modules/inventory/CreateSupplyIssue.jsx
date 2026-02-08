import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'react-toastify';

const CreateSupplyIssue = ({ onCancel, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        department: '',
        requestedBy: '',
        date: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    const [issueItems, setIssueItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({
        itemId: '',
        quantity: 1
    });

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const res = await inventoryService.getInventoryItems();
            setInventoryItems(res.data);
        } catch (error) {
            toast.error("Failed to load inventory items");
        }
    };

    const handleAddItem = () => {
        if (!currentItem.itemId) return toast.error("Select an item");
        if (currentItem.quantity <= 0) return toast.error("Quantity must be > 0");

        const selectedProduct = inventoryItems.find(i => i.id == currentItem.itemId);
        if (!selectedProduct) return;

        // Check stock
        if (currentItem.quantity > selectedProduct.stock) {
            return toast.error(`Insufficient stock! Available: ${selectedProduct.stock}`);
        }

        // Check duplicate
        if (issueItems.find(i => i.itemId == currentItem.itemId)) {
            return toast.error("Item already added to list");
        }

        const newItem = {
            itemId: selectedProduct.id,
            name: selectedProduct.name,
            unit: selectedProduct.unit,
            cost: selectedProduct.unitCost,
            quantity: parseInt(currentItem.quantity),
            total: parseInt(currentItem.quantity) * selectedProduct.unitCost
        };

        setIssueItems([...issueItems, newItem]);
        setCurrentItem({ itemId: '', quantity: 1 }); // Reset
    };

    const handleRemoveItem = (index) => {
        const newItems = [...issueItems];
        newItems.splice(index, 1);
        setIssueItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.department) return toast.error("Department is required");
        if (!formData.requestedBy) return toast.error("Requester name is required");
        if (issueItems.length === 0) return toast.error("Add at least one item to issue");

        setLoading(true);
        try {
            const payload = {
                ...formData,
                items: issueItems
            };

            await inventoryService.createIssue(payload);
            toast.success("Supply Issue Voucher created!");
            onSuccess();
        } catch (error) {
            toast.error("Failed to create issue");
            setLoading(false);
        }
    };

    const totalValue = issueItems.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50 rounded-t-xl">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">New Supply Issue Voucher</h2>
                    <p className="text-sm text-gray-500">Issue items from store to department</p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                            <select
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                value={formData.department}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                required
                            >
                                <option value="">-- Select Dept --</option>
                                <option value="Administration">Administration</option>
                                <option value="Academics">Academics</option>
                                <option value="Science Dept">Science Dept</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Kitchen">Kitchen/Dining</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Requested By *</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={formData.requestedBy}
                                onChange={e => setFormData({ ...formData, requestedBy: e.target.value })}
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Purpose</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={formData.remarks}
                                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="e.g. Weekly supplies"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-indigo-600" /> Add Items to Issue
                        </h3>

                        <div className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Item</label>
                                <select
                                    className="w-full p-2 border rounded-md text-sm"
                                    value={currentItem.itemId}
                                    onChange={e => setCurrentItem({ ...currentItem, itemId: e.target.value })}
                                >
                                    <option value="">-- Select Item --</option>
                                    {inventoryItems.map(item => (
                                        <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                                            {item.name} (Stock: {item.stock} {item.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded-md text-sm"
                                    value={currentItem.quantity}
                                    onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 whitespace-nowrap"
                            >
                                Add Item
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3">Item Name</th>
                                    <th className="p-3">Unit</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Cost</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {issueItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-400">
                                            No items added yet.
                                        </td>
                                    </tr>
                                ) : (
                                    issueItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3 font-medium">{item.name}</td>
                                            <td className="p-3 text-gray-500">{item.unit}</td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right text-gray-500">{item.cost}</td>
                                            <td className="p-3 text-right font-medium">{item.total.toLocaleString()}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {issueItems.length > 0 && (
                                <tfoot className="bg-gray-50 font-semibold">
                                    <tr>
                                        <td colSpan="4" className="p-3 text-right">Total Value:</td>
                                        <td className="p-3 text-right text-indigo-700">KSh {totalValue.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* Right Column: Information */}
                <div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 space-y-2">
                        <h4 className="font-bold flex items-center gap-2">
                            <AlertCircle size={16} /> Guidelines
                        </h4>
                        <ul className="list-disc pl-4 space-y-1 text-blue-700">
                            <li>Ensure remarks clarify the purpose of issue.</li>
                            <li>Quantity is checked against live stock levels.</li>
                            <li>Approved vouchers deduct inventory immediately.</li>
                        </ul>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn btn-primary w-full py-3 text-base flex justify-center items-center gap-2"
                        >
                            {loading ? 'Processing...' : <><Save size={20} /> Submit Voucher</>}
                        </button>
                        <button
                            onClick={onCancel}
                            className="btn btn-outline-secondary w-full py-3"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSupplyIssue;

