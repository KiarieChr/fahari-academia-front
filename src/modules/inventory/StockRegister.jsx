
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, AlertCircle, FileText } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import ItemMaster from './ItemMaster'; // We will create this next
import StockAdjustments from './StockAdjustments';
import { toast } from 'react-toastify';

const StockRegister = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [showItemModal, setShowItemModal] = useState(false);
    const [showAdjModal, setShowAdjModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const res = await inventoryService.getInventoryItems();
            setItems(res.data);
        } catch (error) {
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const handleEditObj = (item) => {
        setSelectedItem(item);
        setShowItemModal(true);
    };

    const handleAdjustStock = (item) => {
        setSelectedItem(item);
        setShowAdjModal(true);
    };

    const handleCreateNew = () => {
        setSelectedItem(null);
        setShowItemModal(true);
    };

    const handleModalClose = (refresh = false) => {
        setShowItemModal(false);
        setShowAdjModal(false);
        setSelectedItem(null);
        if (refresh) loadItems();
    };

    // Derived Data
    const uniqueCategories = ['All', ...new Set(items.map(i => i.category))];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.batch && item.batch.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Item Name, Batch..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border rounded-lg outline-none bg-white hover:bg-gray-50 cursor-pointer"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                        <FileText size={18} /> Export
                    </button>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus size={18} /> Add Item
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            <th className="p-4">Item Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Batch / Expiry</th>
                            <th className="p-4 text-center">Stock</th>
                            <th className="p-4 text-right">Value</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="8" className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan="8" className="p-8 text-center text-gray-500">No items found.</td></tr>
                        ) : (
                            filteredItems.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">
                                        {item.name}
                                        {item.type === 'Capital Asset' && (
                                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 uppercase">Asset</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-600">{item.category}</td>
                                    <td className="p-4 text-gray-500">{item.location || '-'}</td>
                                    <td className="p-4 text-gray-500">
                                        <div className="flex flex-col text-xs">
                                            <span>{item.batch !== '-' ? `B: ${item.batch}` : ''}</span>
                                            {item.expiry && <span className={`${new Date(item.expiry) < new Date() ? 'text-red-500 font-bold' : ''}`}>Exp: {item.expiry}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`font-semibold ${item.stock <= item.minLevel ? 'text-red-600' : 'text-gray-700'}`}>
                                            {item.stock}
                                        </span>
                                        <span className="text-gray-400 text-xs ml-1">{item.unit}</span>
                                    </td>
                                    <td className="p-4 text-right font-medium">
                                        {(item.stock * item.unitCost).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        {item.status === 'Active' ? (
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Active</span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{item.status}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleAdjustStock(item)}
                                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                                                title="Adjust Stock"
                                            >
                                                <AlertCircle size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEditObj(item)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit Details"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Injection */}
            {showItemModal && (
                <ItemMaster
                    item={selectedItem}
                    onClose={() => handleModalClose(false)}
                    onSave={() => handleModalClose(true)}
                />
            )}

            {showAdjModal && selectedItem && (
                <StockAdjustments
                    itemId={selectedItem.id}
                    itemName={selectedItem.name}
                    currentStock={selectedItem.stock}
                    onClose={() => handleModalClose(false)}
                    onSuccess={() => handleModalClose(true)}
                />
            )}
        </div>
    );
};

export default StockRegister;

