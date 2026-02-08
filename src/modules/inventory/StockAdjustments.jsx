
import React, { useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'react-toastify';

const StockAdjustments = ({ itemId, itemName, currentStock, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Decrease',
        adjustmentQty: 1,
        reason: 'Damage'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.adjustmentQty <= 0) return toast.error("Qty must be > 0");
        if (formData.type === 'Decrease' && formData.adjustmentQty > currentStock) {
            return toast.error("Cannot adjust more than current stock");
        }

        setLoading(true);
        try {
            await inventoryService.adjustStock({
                itemId,
                ...formData
            });
            toast.success("Stock adjusted successfully");
            onSuccess();
        } catch (error) {
            toast.error("Failed to adjust stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-4 text-orange-600">
                    <AlertTriangle size={24} />
                    <h2 className="text-lg font-bold">Adjust Stock Level</h2>
                </div>

                <p className="text-gray-600 mb-6">
                    Adjusting stock for verified item: <br />
                    <span className="font-semibold text-gray-900">{itemName}</span>
                    <span className="ml-2 text-sm text-gray-500">(Current: {currentStock})</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                        <select
                            className="w-full p-2 border rounded-lg bg-white"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Decrease">Decrease Stock (Damage, Theft, Loss)</option>
                            <option value="Increase">Increase Stock (Found, Return)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                            type="number" min="1"
                            className="w-full p-2 border rounded-lg"
                            value={formData.adjustmentQty}
                            onChange={e => setFormData({ ...formData, adjustmentQty: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Reference</label>
                        <input
                            type="text" required placeholder="e.g. Broken during transport"
                            className="w-full p-2 border rounded-lg"
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Saving...' : <><Save size={18} /> Confirm</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustments;

