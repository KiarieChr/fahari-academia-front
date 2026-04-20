
import React, { useState, useEffect } from 'react';
import { X, Save, Layers, Box, Truck } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'react-toastify';

const ItemMaster = ({ item, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        type: 'Consumable',
        unit: 'Pcs',
        unitCost: 0,
        stock: 0,
        minLevel: 0,
        location: '',
        supplier: '',
        batch: '',
        expiry: ''
    });

    useEffect(() => {
        inventoryService.getCategories().then(setCategories).catch(() => {});
        if (item) {
            setFormData({ ...item });
        }
    }, [item]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (item) {
                await inventoryService.updateItem(item.id, formData);
                toast.success("Item updated successfully");
            } else {
                await inventoryService.createItem(formData);
                toast.success("New item created");
            }
            onSave();
        } catch (error) {
            toast.error("Failed to save item");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {item ? 'Edit Inventory Item' : 'New Inventory Item'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-5">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Layers size={16} /> General Info
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'stock' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Box size={16} /> Stock Config
                    </button>
                    <button
                        onClick={() => setActiveTab('supplier')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'supplier' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Truck size={16} /> Supplier
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">

                        {activeTab === 'general' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                                    <input
                                        name="name" required value={formData.name} onChange={handleChange}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category" value={formData.category} onChange={handleChange}
                                        className="w-full p-2 border rounded-lg bg-white"
                                    >
                                        <option value="">Select...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        name="type" value={formData.type} onChange={handleChange}
                                        className="w-full p-2 border rounded-lg bg-white"
                                    >
                                        <option value="Consumable">Consumable</option>
                                        <option value="Capital Asset">Capital Asset (Fixed)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                                    <input
                                        name="unit" value={formData.unit} onChange={handleChange} placeholder="e.g. Pcs, Box, Kg"
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (KSh)</label>
                                    <input
                                        type="number" name="unitCost" value={formData.unitCost} onChange={handleChange}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'stock' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!item && ( // Only allow setting initial stock for new items
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Opening Stock</label>
                                        <input
                                            type="number" name="stock" value={formData.stock} onChange={handleChange}
                                            className="w-full p-2 border rounded-lg bg-yellow-50"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Use Adjustments for existing items</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min. Reorder Level</label>
                                    <input
                                        type="number" name="minLevel" value={formData.minLevel} onChange={handleChange}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Store / Shelf Location</label>
                                    <input
                                        name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Store A-12"
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                {formData.type !== 'Capital Asset' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Batch No.</label>
                                            <input
                                                name="batch" value={formData.batch} onChange={handleChange}
                                                className="w-full p-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                            <input
                                                type="date" name="expiry" value={formData.expiry || ''} onChange={handleChange}
                                                className="w-full p-2 border rounded-lg"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'supplier' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Supplier</label>
                                    <input
                                        name="supplier" value={formData.supplier} onChange={handleChange}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 mt-2 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button" onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : <><Save size={18} /> Save Item</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemMaster;

