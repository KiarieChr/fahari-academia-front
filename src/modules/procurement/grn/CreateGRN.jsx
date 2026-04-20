import React, { useState, useEffect } from 'react';
import { Save, X, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { inventoryService } from "../../../services/inventoryService";
import procurementApi from "../../../services/procurementApiService";
import { toast } from 'react-toastify';

const CreateGRN = ({ onCancel, onSuccess }) => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [selectedPO, setSelectedPO] = useState('');
    const [poDetails, setPoDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        supplier: '',
        deliveryNote: '',
        dateReceived: new Date().toISOString().split('T')[0],
        receivedBy: 'Current User',
        remarks: ''
    });

    const [items, setItems] = useState([]);

    useEffect(() => {
        loadPOs();
    }, []);

    const loadPOs = async () => {
        try {
            const res = await procurementApi.purchaseOrders.list({ status: 'SENT' });
            const all = res.results || res || [];
            // Also include PARTIALLY_RECEIVED
            const res2 = await procurementApi.purchaseOrders.list({ status: 'PARTIALLY_RECEIVED' });
            const partial = res2.results || res2 || [];
            const eligiblePOs = [...all, ...partial].map(po => ({
                id: po.id,
                poNumber: po.po_number,
                supplier: po.supplier_name || `Supplier #${po.supplier}`,
                supplierId: po.supplier,
                status: po.status,
            }));
            setPurchaseOrders(eligiblePOs);
        } catch (error) {
            toast.error("Failed to load Purchase Orders");
        }
    };

    const handlePOSelect = async (e) => {
        const poId = e.target.value;
        setSelectedPO(poId);
        if (!poId) {
            setPoDetails(null);
            setItems([]);
            return;
        }

        setLoading(true);
        try {
            const detail = await procurementApi.purchaseOrders.get(poId);
            setPoDetails(detail);
            setFormData(prev => ({ ...prev, supplier: detail.supplier_name || `Supplier #${detail.supplier}` }));

            const pItems = (detail.lines || []).map(line => ({
                id: line.id,
                itemId: line.item,
                name: line.description || line.item_name || `Item #${line.item}`,
                unit: line.unit_of_measure || 'Pcs',
                unitPrice: Number(line.unit_price) || 0,
                ordered: Number(line.quantity),
                delivered: Number(line.quantity_received) || 0,
                remaining: Number(line.quantity) - (Number(line.quantity_received) || 0),
                quantityReceived: 0,
                quantityRejected: 0,
                status: 'Passed',
                remarks: ''
            }));
            setItems(pItems);

        } catch (error) {
            toast.error("Failed to load PO details");
        } finally {
            setLoading(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedPO) return toast.error("Please select a Purchase Order");
        if (!formData.deliveryNote) return toast.error("Delivery Note number is required");

        const hasItems = items.some(i => parseInt(i.quantityReceived) > 0);
        if (!hasItems) return toast.error("Please receive at least one item");

        const validQuantities = items.every(item => {
            const received = parseInt(item.quantityReceived) || 0;
            return received <= item.remaining;
        });

        if (!validQuantities) {
            return toast.error("Cannot receive more than remaining quantity");
        }

        setLoading(true);
        try {
            const receivedItems = items.filter(i => parseInt(i.quantityReceived) > 0);
            const payload = {
                supplier: poDetails?.supplier,
                purchase_order: parseInt(selectedPO),
                received_date: formData.dateReceived,
                notes: `${formData.deliveryNote} | ${formData.remarks}`.trim(),
                lines: receivedItems.map(item => ({
                    item: item.itemId,
                    quantity_received: parseInt(item.quantityReceived),
                    unit_cost: item.unitPrice,
                })),
            };

            await inventoryService.createGRN(payload);
            onSuccess();
        } catch (error) {
            toast.error(error?.data?.detail || "Failed to create GRN");
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">New Goods Received Note</h2>
                    <p className="text-sm text-gray-500">Record delivery against Purchase Order</p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select PO *</label>
                        <select
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            value={selectedPO}
                            onChange={handlePOSelect}
                            required
                        >
                            <option value="">-- Choose PO --</option>
                            {purchaseOrders.map(po => (
                                <option key={po.id} value={po.id}>
                                    {po.poNumber} - {po.supplier}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                            value={formData.supplier}
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Note # *</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formData.deliveryNote}
                            onChange={e => setFormData({ ...formData, deliveryNote: e.target.value })}
                            required
                            placeholder="e.g. DN-12345"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Received *</label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formData.dateReceived}
                            onChange={e => setFormData({ ...formData, dateReceived: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg bg-gray-100"
                            value={formData.receivedBy}
                            readOnly
                        />
                    </div>
                </div>

                {/* Items Table */}
                {selectedPO && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Item Receipt Details</h3>
                            {loading && <span className="text-xs text-blue-600 animate-pulse">Updating items...</span>}
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-gray-600 border-b">
                                <tr>
                                    <th className="p-3 w-1/4">Item</th>
                                    <th className="p-3 text-center">Ordered</th>
                                    <th className="p-3 text-center">Prev. Delivered</th>
                                    <th className="p-3 text-center">Remaining</th>
                                    <th className="p-3 w-24">Received Now</th>
                                    <th className="p-3 w-24">Rejected</th>
                                    <th className="p-3 w-32">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item, idx) => (
                                    <tr key={item.id} className={item.quantityReceived > 0 ? "bg-blue-50/50" : ""}>
                                        <td className="p-3">
                                            <div className="font-medium text-gray-800">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.unit} @ {item.unitPrice}</div>
                                        </td>
                                        <td className="p-3 text-center text-gray-500">{item.ordered}</td>
                                        <td className="p-3 text-center text-gray-500">{item.delivered}</td>
                                        <td className="p-3 text-center font-medium bg-gray-50">{item.remaining}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.remaining}
                                                className="w-full p-1 border rounded text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={item.quantityReceived}
                                                onChange={(e) => handleItemChange(idx, 'quantityReceived', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full p-1 border rounded text-center focus:ring-2 focus:ring-red-500 outline-none"
                                                value={item.quantityRejected}
                                                onChange={(e) => handleItemChange(idx, 'quantityRejected', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <select
                                                className="w-full p-1 border rounded text-xs"
                                                value={item.status}
                                                onChange={(e) => handleItemChange(idx, 'status', e.target.value)}
                                            >
                                                <option value="Passed">Passed</option>
                                                <option value="Failed">Failed</option>
                                                <option value="Hold">Hold</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {items.length === 0 && <div className="p-6 text-center text-gray-500">No items found for this PO.</div>}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !selectedPO}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save size={18} />
                        Submit GRN
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateGRN;

