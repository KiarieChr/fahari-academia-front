import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Printer, Search, Filter, Plus } from 'lucide-react';
import { inventoryService } from "../../../services/inventoryService";
import { toast } from 'react-toastify';

const GRNList = ({ onView, onCreate }) => {
    const [grns, setGrns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await inventoryService.getGRNs();
            const items = (res.results || res || []).map(g => ({
                id: g.grn_number || String(g.id),
                rawId: g.id,
                poId: g.purchase_order ? `PO-${g.purchase_order}` : '-',
                supplier: g.supplier_name || `Supplier #${g.supplier}`,
                dateReceived: g.received_date,
                receivedBy: g.received_by_name || '',
                deliveryNote: g.notes || '',
                status: formatGRNStatus(g.status),
                totalItems: (g.lines || []).length,
                totalValue: (g.lines || []).reduce((s, l) => s + Number(l.total_cost || 0), 0),
                items: (g.lines || []).map(l => ({
                    id: l.id,
                    name: l.item_name || `Item #${l.item}`,
                    quantityReceived: Number(l.quantity_received),
                    quantityRejected: 0,
                    status: 'Passed',
                })),
            }));
            setGrns(items);
        } catch (error) {
            toast.error("Failed to load GRNs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const getStatusBadge = (status) => {
        const styles = {
            'Draft': 'bg-gray-100 text-gray-800',
            'Submitted': 'bg-blue-100 text-blue-800',
            'Inspected': 'bg-yellow-100 text-yellow-800',
            'Posted': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    const filteredGrns = grns.filter(grn => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            String(grn.id).toLowerCase().includes(term) ||
            String(grn.supplier).toLowerCase().includes(term) ||
            String(grn.poId).toLowerCase().includes(term);
        const matchesFilter = filter === 'All' || grn.status === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header / Actions */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search GRN, PO, Supplier..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-3 py-2 border rounded-lg outline-none cursor-pointer hover:bg-gray-50"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Inspected">Inspected</option>
                        <option value="Posted">Posted</option>
                    </select>
                </div>

                <button
                    onClick={onCreate}
                    className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
                >
                    <Plus size={18} /> Record Good Receipt
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 font-semibold">GRN Number</th>
                            <th className="p-4 font-semibold">PO Number</th>
                            <th className="p-4 font-semibold">Supplier</th>
                            <th className="p-4 font-semibold">Date Received</th>
                            <th className="p-4 font-semibold">Received By</th>
                            <th className="p-4 font-semibold">Total Value</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {filteredGrns.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-gray-500">
                                    No GRNs found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredGrns.map(grn => (
                                <tr key={grn.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-blue-600">{grn.id}</td>
                                    <td className="p-4 text-gray-600">{grn.poId}</td>
                                    <td className="p-4 font-medium">{grn.supplier}</td>
                                    <td className="p-4 text-gray-500">{grn.dateReceived}</td>
                                    <td className="p-4 text-gray-500">{grn.receivedBy}</td>
                                    <td className="p-4 font-bold">KSh {grn.totalValue?.toLocaleString()}</td>
                                    <td className="p-4">{getStatusBadge(grn.status)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onView(grn)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Print">
                                                <Printer size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-400">
                Showing {filteredGrns.length} records
            </div>
        </div>
    );
};

export default GRNList;

function formatGRNStatus(s) {
    const map = { DRAFT: 'Draft', CONFIRMED: 'Submitted', POSTED: 'Posted' };
    return map[s] || s;
}

